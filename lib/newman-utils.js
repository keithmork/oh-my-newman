/*
 * @Author: Keith Mo
 * @Date:   2016-09-23 18:28:47
 * @Last Modified by:   mojinrong
 * @Last Modified time: 2016-10-11 15:42:55
 */

const fs = require('fs');
const path = require('path');
const newman = require('newman');

// paths
const BASEDIR = path.resolve(__dirname, '..');
const COLLECTION_DIR = path.join(BASEDIR, 'data/collections');
const DATA_FILE_DIR = path.join(BASEDIR, 'data/data_file');
const SCRIPT_FILE_DIR = path.join(BASEDIR, 'data/script_file');
const ENV_DIR = path.join(BASEDIR, 'data/environments');
const OUTPUT_DIR = path.join(BASEDIR, 'output');

// file extensions
const EXT_COLLECTION = '.postman_collection.json';
const EXT_DUMP = '.postman_dump.json';
const EXT_ENV = '.postman_environment.json';

exports.getBaseDir = () => BASEDIR;

exports.getEnvDir = () => ENV_DIR;

exports.getOutputDir = () => OUTPUT_DIR;

exports.isDir = (dir) => {
  try {
    const stat = fs.statSync(dir);
    return stat.isDirectory();
  } catch (err) {
    return false;
  }
};

exports.isFile = (file) => {
  try {
    const stat = fs.statSync(file);
    return stat.isFile();
  } catch (err) {
    return false;
  }
};

/**
 * ...
 * @param dir
 * @param defaultDir
 * @returns {*}
 */
const getDirPath = (dir, defaultDir) => {
  if (!dir || typeof dir !== 'string') {
    return defaultDir;
  }

  const fullPath = path.join(defaultDir, dir);
  if (exports.isDir(fullPath)) {
    return fullPath;
  } else if (exports.isDir(dir)) {
    return dir;
  }

  throw new Error(`[ERROR] Cannot find directory '${fullPath}' or '${dir}'`);
};

exports.getCollectionFileDir = dir => getDirPath(dir, COLLECTION_DIR);

exports.getDataFileDir = dir => getDirPath(dir, DATA_FILE_DIR);

/**
 * ...
 * @param partialFilename
 * @param defaultDir
 * @returns {*}
 */
const getJsonFileFullPath = (partialFilename, defaultDir) => {
  if (!partialFilename) throw new Error(`[ERROR] Invalid filename: '${partialFilename}'`);

  const dir = getDirPath(path.dirname(partialFilename), defaultDir);
  const files = fs.readdirSync(dir, 'utf8');

  if (files) {
    const filename = path.basename(partialFilename);
    const regexArr = [
      new RegExp(`^${filename}[.].+$`, 'g'),
      new RegExp(`^${filename}[^-]*$`, 'g'),
      new RegExp(`^${filename}.*$`, 'g'),
    ];

    for (let i = 0; i < regexArr.length; i += 1) {
      const targetFiles = files.filter(resultFile => resultFile.match(regexArr[i]));
      if (targetFiles.length) {
        return path.join(dir, targetFiles[0]);
      }
    }

    throw new Error(`[ERROR] Cannot find file starts with '${filename}' in '${dir}'`);
  } else {
    throw new Error(`[ERROR] Cannot find file '${partialFilename}' in '${defaultDir}'`);
  }
};

exports.getCollectionFileByPartialName = file => getJsonFileFullPath(file, COLLECTION_DIR);

exports.getDataFileByPartialName = file => getJsonFileFullPath(file, DATA_FILE_DIR);

exports.getEnvFileByPartialName = file => getJsonFileFullPath(file, ENV_DIR);

/**
 * @param  {string} file - Postman/Newman相关的JSON文件路径
 * @return {string} 不带后缀的文件名
 */
exports.getBasename = (file) => {
  const exts = [EXT_ENV, EXT_COLLECTION, EXT_DUMP, '.json'];

  if (!file || typeof file !== 'string') {
    return '';
  }

  let basename = '';
  for (let i = 0; i < exts.length; i += 1) {
    const regex = new RegExp(exts[i]);
    if (file.match(regex)) {
      basename = path.basename(file, exts[i]);
      break;
    }
  }
  return basename;
};

exports.parseJsonFile = (file) => {
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`[ERROR] Invalid JSON format in '${file}'`);
    throw err;
  }

  return json;
};

/**
 * ...
 * @param  {string} text - the text that contains '//use:<scriptFilename>'
 * @return {string} The script filename defined in '//use:<scriptFilename>'
 */
const extractScriptFilename = (text) => {
  const txtNoSpace = text.replace(/[ ]/g, '');
  // starts with '"exec":"//use:'
  const start = txtNoSpace.indexOf(':', '"exec":"'.length) + 1;

  return txtNoSpace.substring(start);
};

// FIXME: comment me when tested
exports.extractScriptFilenameTest = text => extractScriptFilename(text);

/**
 * ...
 * @param  {object} fileList [description]
 * @param  {string} filename [description]
 * @return {string}          [description]
 */
const filterScriptFile = (fileList, filename) => {
  const regex = new RegExp(`${filename}`, 'g');
  const targetScripts = fileList.filter(file => file.match(regex));

  if (targetScripts && targetScripts.length) {
    return path.join(SCRIPT_FILE_DIR, targetScripts[0]);
  }

  return '';
};

// FIXME: comment me when tested
exports.filterScriptFileTest = (fileList, filename) => filterScriptFile(fileList, filename);

/**
 * 在Postman的Pre-request Script或Tests里写上 //use:外部脚本名 （无空格，不带.js后缀）
 * 就会把该行替换为 data/script_file 下的同名脚本内容
 * @param  {string} collectionFile - Postman集合文件的JSON对象
 * @return {object} 替换掉脚本内容的JSON对象
 */
const replaceScriptContent = (collectionFile) => {
  let jsonStr = fs.readFileSync(collectionFile, 'utf8');
  // The contents of Pre-request Script/Tests are under item[i].item[j].exec
  const regex = new RegExp('"exec":(\\s)?"//use:(.+?)("|\\n)', 'g');
  let results = jsonStr.match(regex);

  if (results && results.length) {
    // remove the \\n" or " at the end
    results = results.map(item => item.replace(/(\\n"|")$/, ''));

    const scriptFiles = fs.readdirSync(SCRIPT_FILE_DIR, 'utf8');
    const uniqueFiles = new Set();
    const uniqueResults = [...new Set(results)];

    uniqueResults.forEach((result) => {
      const scriptName = extractScriptFilename(result);
      const scriptFile = filterScriptFile(scriptFiles, scriptName);

      if (scriptFile && !uniqueFiles.has(scriptFile)) {
        uniqueFiles.add(scriptFile);

        let script = fs.readFileSync(scriptFile, 'utf8');
        script = script.replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        const newText = result.replace(`//use:${scriptName}`, script);
        jsonStr = jsonStr.replace(new RegExp(result, 'g'), newText);
      }
    });
  }

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    throw new TypeError(`[ERROR] Invalid JSON string: '${jsonStr}'`);
  }
};

// FIXME: comment me when tested
exports.replaceScriptContentTest = collectionFile => replaceScriptContent(collectionFile);

/**
 * ...
 * @param reportFilename
 * @param outputDir
 * @returns {object} Newman reporter
 */
exports.getNewmanReporter = (reportFilename = 'report', outputDir = OUTPUT_DIR) => {
  const jsonFile = path.join(outputDir, `${reportFilename}.json`);
  const junitFile = path.join(outputDir, `${reportFilename}.xml`);
  const htmlFile = path.join(outputDir, `${reportFilename}.html`);

  return {
    json: { export: jsonFile },
    junit: { export: junitFile },
    html: { export: htmlFile },
  };
};

/**
 *
 * @param cliArgs
 * @returns {object} Newman options
 */
exports.getNewmanOptions = (cliArgs) => {
  const args = Object.assign({}, cliArgs);
  const collectionFile = args.collection;

  return {
    collection: replaceScriptContent(collectionFile),
    environment: args.environment,
    folder: args.folder,
    iterationData: args.iterationData,
    iterationCount: args.iterationCount || 1,
    reporters: ['cli', 'json', 'junit', 'html'],
    reporter: args.reporter,
    timeoutRequest: args.timeoutRequest,
    delayRequest: args.delayRequest,
    ignoreRedirects: false,
    insecure: false,
    bail: false,
    suppressExitCode: false,
  };
};

/**
 * ...
 * @param collectionFile
 * @returns {Array}
 */
exports.getPostmanFolders = (collectionFile) => {
  const collection = exports.parseJsonFile(collectionFile);
  const folders = [];
  // 如果没folder，item[i].name就是用例名
  // 如果有folder，item[i].name是folder名，item[i].item[j].name才是用例名
  const items = collection.item;
  const collectionName = collection.info.name;
  if (items) {
    items.forEach((item) => {
      if (item.item) {
        const folderName = item.name;
        if (folderName && folderName.charAt(0) !== '_') {
          folders.push(folderName);
        } else {
          console.info(`[INFO] Skip folder: "${folderName}" in collection: "${collectionName}"`);
        }
      }
    });
  } else {
    console.error(`[ERROR] Cannot find "item":[] in collection: "${collectionName}"`);
  }

  return folders;
};

/**
 * @param  {string} dataFile - Postman数据文件（JSON格式）的路径
 * @return {int} Newman循环执行用例的次数
 */
exports.getIterationCount = (dataFile) => {
  const jsonArr = exports.parseJsonFile(dataFile);
  return jsonArr.length;
};

exports.runNewman = (options, onDone) => {
  newman.run(options)
    .on('done', (err, summary) => {
      if (err) throw err;

      if (onDone && typeof onDone === 'function') {
        onDone(summary, options.reporter);
      }
    });
};

// 如果${DATA_FILE_DIR}下有跟Postman collection同名的文件夹，
// 里面又有跟folder同名的JSON格式的用例文件，就把3者关联起来运行
exports.runFolder = (commandLineArgs, onDone) => {
  const args = Object.assign({}, commandLineArgs);
  const folderName = args.folder;
  if (!folderName) {
    throw new Error(`[ERROR] Invalid postman collection folder name: '${folderName}'`);
  }

  const collectionName = exports.getBasename(args.collection);
  const envName = exports.getBasename(args.environment);
  let dataFile = args.iterationData;

  if (dataFile && exports.isFile(dataFile)) {
    args.iterationData = dataFile;
    args.iterationCount = exports.getIterationCount(dataFile);
  } else {
    let dataFileDir = '';
    try {
      dataFileDir = exports.getDataFileDir(collectionName);
    } catch (err) {
      // 可以不存在，没有这目录就不关联数据文件
    }

    if (dataFileDir && exports.isDir(dataFileDir)) {
      dataFile = path.join(dataFileDir, `${folderName}.json`);
      if (exports.isFile(dataFile)) {
        args.iterationData = dataFile;
        args.iterationCount = exports.getIterationCount(dataFile);
      } else {
        console.warn(`[WARNING] Found '${dataFileDir}' but not '${dataFile}'`);
      }
    }
  }

  const options = exports.getNewmanOptions(args);
  options.reporter = exports.getNewmanReporter(`${collectionName}_${folderName}-${envName}`);
  exports.runNewman(options, onDone);
};

exports.runFolders = (postmanFolders, commandLineArgs, onDone) => {
  const args = Object.assign({}, commandLineArgs);
  postmanFolders.forEach((postmanFolder) => {
    args.folder = postmanFolder;
    exports.runFolder(args, onDone);
  });
};

exports.runCollection = (commandLineArgs, onDone) => {
  const args = Object.assign({}, commandLineArgs);
  const collectionFile = args.collection;
  const folders = exports.getPostmanFolders(collectionFile);
  if (folders.length) {
    exports.runFolders(folders, args, onDone);
  } else {
    const collectionName = exports.getBasename(collectionFile);
    const envName = exports.getBasename(args.environment);

    const options = exports.getNewmanOptions(args);
    options.reporter = exports.getNewmanReporter(`${collectionName}-${envName}`);
    exports.runNewman(options, onDone);
  }
};

exports.runCollections = (commandLineArgs, onDone) => {
  const args = Object.assign({}, commandLineArgs);
  const dir = args.collectionDir;
  if (!exports.isDir(dir)) {
    throw new Error(`[ERROR] Cannot find directory '${dir}'`);
  }

  const files = fs.readdirSync(dir, 'utf8');
  const collectionFiles = files.filter(file => (file.charAt(0) !== '_') && (file.substr(-5) === '.json'));

  collectionFiles.forEach((collectionFile) => {
    args.collection = path.join(dir, collectionFile);
    exports.runCollection(args, onDone);
  });
};
