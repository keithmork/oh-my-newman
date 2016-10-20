/*
 * @Author: mojinrong
 * @Date:   2016-10-08 18:53:46
 * @Last Modified by:   mojinrong
 * @Last Modified time: 2016-10-10 09:36:28
 */

const fs = require('fs');
const path = require('path');
const assert = require('chai').assert;
const utils = require('../lib/newman-utils');

/* eslint-disable no-undef, no-unused-vars, prefer-arrow-callback, func-names */

const COLLECTION_DIR = path.resolve(__dirname, '../data/collections');
const DATA_FILE_DIR = path.resolve(__dirname, '../data/data_file');
const SCRIPT_FILE_DIR = path.resolve(__dirname, '../data/script_file');
const ENV_DIR = path.resolve(__dirname, '../data/environments');

function assertEqual(actual, expected, param) {
  it(`returns [${typeof expected}]'${expected}', with params: '${param}'`, function () {
    assert.strictEqual(actual, expected);
  });
}

function assertError(func, param) {
  it(`throws an error, with params: '${param}'`, function () {
    assert.throws(func);
  });
}

function assertNoError(func, param) {
  it(`does NOT throw an error, with params: '${param}'`, function () {
    assert.doesNotThrow(func);
  });
}

function assertProperty(object, property, param) {
  it(`returns an object which has property '${property}', with params: '${param}'`, function () {
    assert.deepProperty(object, property);
  });
}

function assertPropertyVal(object, property, value, param) {
  it(`has '${property}' that equals to '${value}', with params: '${param}'`, function () {
    assert.deepPropertyVal(object, property, value);
  });
}

function assertPropertyNotVal(object, property, value, param) {
  it(`has '${property}' that does NOT equal to '${value}', with params: '${param}'`, function () {
    assert.deepPropertyNotVal(object, property, value);
  });
}

describe('isDir', function () {
  describe('Legal:', function () {
    const params = [__dirname];
    params.forEach(function (param) {
      assertEqual(utils.isDir(param), true, param);
    });
  });

  describe('Illegal:', function () {
    const params = ['', ' ', 'hahahaha', null, undefined, true, false, NaN, 0, 3.14, {}, [1, 2, 3]];
    params.forEach(function (param) {
      assertEqual(utils.isDir(param), false, param);
    });
  });
});

describe('isFile', function () {
  describe('Legal:', function () {
    const params = [__filename];
    params.forEach(function (param) {
      assertEqual(utils.isFile(param), true, param);
    });
  });

  describe('Illegal:', function () {
    const params = ['', ' ', 'hahahaha', null, undefined, true, false, NaN, 0, 3.14, {}, [1, 2, 3]];
    params.forEach(function (param) {
      assertEqual(utils.isFile(param), false, param);
    });
  });
});

describe('getCollectionFileDir', function () {
  describe('Legal, relative path:', function () {
    const params = ['cli'];
    params.forEach(function (param) {
      assertEqual(utils.getCollectionFileDir(param), path.join(COLLECTION_DIR, param), param);
    });
  });

  describe('Legal, absolute path:', function () {
    const params = [COLLECTION_DIR, path.join(COLLECTION_DIR, 'cli')];
    params.forEach(function (param) {
      assertEqual(utils.getCollectionFileDir(param), param, param);
    });
  });

  describe('Illegal, returns default value:', function () {
    const params = ['', null, undefined, true, false, NaN, 0, 3.14, {}, [1, 2, 3]];
    params.forEach(function (param) {
      assertEqual(utils.getCollectionFileDir(param), COLLECTION_DIR, param);
    });
  });

  describe('Illegal, throws an error:', function () {
    const params = [' ', 'hahahaha'];
    params.forEach(function (param) {
      assertError(() => utils.getCollectionFileDir(param), param);
    });
  });
});

// 和 getCollectionFileDir 调同样的方法，简单测下
describe('getDataFileDir', function () {
  describe('Legal, relative path:', function () {
    const params = ['auth-cli'];
    params.forEach(function (param) {
      assertEqual(utils.getDataFileDir(param), path.join(DATA_FILE_DIR, param), param);
    });
  });
});

describe('getCollectionFileByPartialName', function () {
  describe('Legal, relative path:', function () {
    const params = [
      'smoke/drug',
      'smoke/drugorg',
      'smoke/auth',
    ];
    const expected = [
      path.join(COLLECTION_DIR, 'smoke/drug.postman_collection.json'),
      path.join(COLLECTION_DIR, 'smoke/drugorg.postman_collection.json'),
      path.join(COLLECTION_DIR, 'smoke/auth.postman_collection.json'),
    ];

    let i = 0;
    params.forEach(function (param) {
      assertEqual(utils.getCollectionFileByPartialName(param), expected[i], param);
      i += 1;
    });
  });

  describe('Legal, absolute path:', function () {
    const params = [
      path.join(COLLECTION_DIR, 'smoke/health.postman_collection.json'),
      path.join(COLLECTION_DIR, 'smoke/auth.postman_collection.json'),
    ];
    params.forEach(function (param) {
      assertEqual(utils.getCollectionFileByPartialName(param), param, param);
    });
  });

  describe('Illegal, throws an error:', function () {
    const params = [' ', 'hahahaha', '', null, undefined, true, false, NaN, 0, 3.14, {}, [1, 2, 3]];
    params.forEach(function (param) {
      assertError(() => utils.getCollectionFileByPartialName(param), param);
    });
  });
});

// 和 getCollectionFileByPartialName 调同样的方法，简单测下
describe('getDataFileByPartialName', function () {
  describe('Legal, relative path:', function () {
    const params = [
      'auth-cli/001_register',
    ];
    const expected = [
      path.join(DATA_FILE_DIR, 'auth-cli/001_register.json'),
    ];

    let i = 0;
    params.forEach(function (param) {
      assertEqual(utils.getDataFileByPartialName(param), expected[i], param);
      i += 1;
    });
  });
});

// 和 getCollectionFileByPartialName 调同样的方法，简单测下
describe('getEnvFileByPartialName', function () {
  describe('Legal, relative path:', function () {
    const params = [
      'dev',
      'test',
    ];
    const expected = [
      path.join(ENV_DIR, 'dev.postman_environment.json'),
      path.join(ENV_DIR, 'test.postman_environment.json'),
    ];

    let i = 0;
    params.forEach(function (param) {
      assertEqual(utils.getEnvFileByPartialName(param), expected[i], param);
      i += 1;
    });
  });
});

describe('getBasename', function () {
  describe('Legal:', function () {
    const params = [
      path.resolve('../examples/collections/Postman_Echo.postman_collection.json'),
      path.resolve('../examples/environments/Cooper-Remote.postman_environment.json'),
      path.resolve('../examples/data_file/test_data_file.json'),
    ];
    const expected = ['Postman_Echo', 'Cooper-Remote', 'test_data_file'];

    let i = 0;
    params.forEach(function (param) {
      assertEqual(utils.getBasename(param), expected[i], param);
      i += 1;
    });
  });

  describe('Illegal:', function () {
    const params = [
      __filename,
      ' ', 'hahahaha', '', null, undefined, true, false, NaN, 0, 3.14, {}, [1, 2, 3],
    ];
    params.forEach(function (param) {
      assertEqual(utils.getBasename(param), '', param);
    });
  });
});

describe('parseJsonFile', function () {
  describe('Legal, no error:', function () {
    const params = [
      path.resolve('../examples/collections/Postman_Echo.postman_collection.json'),
      path.resolve('../examples/environments/Cooper-Remote.template.postman_environment.json'),
      path.resolve('../examples/data_file/example-cli/test_data_file.json'),
    ];
    params.forEach(function (param) {
      assertNoError(() => utils.parseJsonFile(param), param);
    });
  });

  describe('Illegal, throws an error:', function () {
    const params = [
      __filename,
      ' ', 'hahahaha', '', null, undefined, true, false, NaN, 0, 3.14, {}, [1, 2, 3],
    ];
    params.forEach(function (param) {
      assertError(() => utils.parseJsonFile(param), param);
    });
  });
});

// FIXME: comment me when done
describe('extractScriptFilename', function () {
  const params = [
    '"exec"://use:tests_api',
    '"exec": //use:tests_api',
    '"exec": //use: tests_api',
    '"exec": // use:tests_api',
    '"exec": // use: tests_api',
  ];
  params.forEach(function (param) {
    assertEqual(utils.extractScriptFilenameTest(param), 'tests_api', param);
  });
});

// FIXME: comment me when done
describe('filterScriptFile', function () {
  const scriptFiles = fs.readdirSync(SCRIPT_FILE_DIR, 'utf8');
  describe('Legal:', function () {
    const params = [
      [scriptFiles, 'pre_register'],
      [scriptFiles, 'tests_json'],
    ];
    const expected = [
      path.join(SCRIPT_FILE_DIR, 'pre_register.js').replace(/\\/g, '\\'),
      path.join(SCRIPT_FILE_DIR, 'tests_json.js').replace(/\\/g, '\\'),
    ];

    let i = 0;
    params.forEach(function (param) {
      assertEqual(utils.filterScriptFileTest(...param), expected[i], param);
      i += 1;
    });
  });

  describe('Illegal:', function () {
    const wrongFileList = fs.readdirSync(ENV_DIR, 'utf8');
    const params = [
      [scriptFiles, 'no_such_file'],
      [[], 'tests_json'],
      [wrongFileList, 'tests_json'],
    ];
    const expected = ['', '', ''];

    let i = 0;
    params.forEach(function (param) {
      assertEqual(utils.filterScriptFileTest(...param), expected[i], param);
      i += 1;
    });
  });
});

// FIXME: comment me when done
describe('replaceScriptContent', function () {
  const params = [
    path.resolve('../examples/collections/cli/example-cli.postman_collection.json'),
  ];
  params.forEach(function (param) {
    const collectionObj = utils.replaceScriptContentTest(param);
    assertPropertyNotVal(collectionObj, 'item[0].item[0].event[0].script.exec', '//use:pre_register', param);
    assertPropertyNotVal(collectionObj, 'item[0].item[0].event[1].script.exec', '//use:tests_json', param);
  });
});
/*

describe('getNewmanReporter', function () {
  const reporter = utils.getNewmanReporter();
});

describe('getNewmanOptions', function () {
  const options = utils.getNewmanOptions();
});

describe('getPostmanFolders', function () {
  const folders = utils.getPostmanFolders();
});

describe('getIterationCount', function () {
  const count = utils.getIterationCount();
});
*/
