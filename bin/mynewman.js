/*
 * @Author: mojinrong
 * @Date:   2016-09-28 10:31:28
 * @Last Modified by:   mojinrong
 * @Last Modified time: 2016-10-11 15:41:47
 */

const fs = require('fs');
const path = require('path');
const utils = require('../lib/newman-utils');
const cli = require('../config/cli');

// command line args
const ARGS = cli.getCliArgs();

/* Functions */

const renameReportFile = (oldFile, prefix) => {
  const newFile = path.join(path.dirname(oldFile), prefix + path.basename(oldFile));
  if (utils.isFile(oldFile)) {
    try {
      fs.renameSync(oldFile, newFile);
      return newFile;
    } catch (err) {
      console.warn(`[WARNING] Cannot rename file: "${oldFile}"`);
    }
  } else {
    console.warn(`[WARNING] Cannot find "${oldFile}"`);
  }

  return '';
};

const onDone = (summary, reporter) => {
  let htmlFile = reporter.html.export;
  let jsonFile = reporter.json.export;
  let junitFile = reporter.junit.export;
  let hasReport = true;

  if (summary.error) {
    console.error('\ncollection run encountered an error.');
    console.error(summary.error);
  }

  if (summary.run && summary.run.failures.length) {
    process.exitCode = 1;

    htmlFile = renameReportFile(htmlFile, '_FAILED_');
    if (htmlFile) {
      jsonFile = renameReportFile(jsonFile, '_FAILED_');
      junitFile = renameReportFile(junitFile, '_FAILED_');
    } else {
      hasReport = false;
    }
  }

  console.info('\ncollection run completed.');
  if (hasReport) {
    console.info('\n');
    console.info(`HTML report file:      ${htmlFile}`);
    console.info(`JUnit report file:     ${junitFile}`);
    console.info(`log file:              ${jsonFile}`);
  }
};

// TODO: 以后加个异步函数把一些测试结果写入mongo

/* Run */

if (ARGS.collection) {
  if (ARGS.folder) {
    utils.runFolder(ARGS, onDone);
  } else {
    utils.runCollection(ARGS, onDone);
  }
} else if (ARGS.collectionDir) {
  utils.runCollections(ARGS, onDone);
} else {
  console.error('[ERROR] Invalid command line arguments.');
  cli.showUsage();
  process.exit(1);
}
