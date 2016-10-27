
const fs = require('fs');
const path = require('path');

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
exports.getDirPath = (dir, defaultDir) => {
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

/**
 * ...
 * @param partialFilename
 * @param defaultDir
 * @returns {*}
 */
exports.getFileFullPath = (partialFilename, defaultDir) => {
  if (!partialFilename) throw new Error(`[ERROR] Invalid filename: '${partialFilename}'`);

  const dir = exports.getDirPath(path.dirname(partialFilename), defaultDir);
  const files = fs.readdirSync(dir, 'utf8');

  if (files) {
    const filename = path.basename(partialFilename);
    const regexArr = [
      new RegExp(`^${filename}[.].+$`, 'g'),
      new RegExp(`^${filename}[-_].+$`, 'g'),
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

/**
 *
 * @param file {string}
 * @param exts {array}
 * @returns {string}
 */
exports.getBasename = (file, exts) => {
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
