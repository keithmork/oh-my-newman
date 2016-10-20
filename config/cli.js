/*
 * @Author: mojinrong
 * @Date:   2016-10-08 16:07:29
 * @Last Modified by:   mojinrong
 * @Last Modified time: 2016-10-08 16:21:23
 */

const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const utils = require('../lib/newman-utils');

// command line option definitions
const CLI_ARGS = [
  {
    name: 'help',
    description: 'Display this usage guide.',
    type: Boolean,
    alias: 'h',
  },
  {
    name: 'collectionDir',
    typeLabel: '[underline]{directory}',
    description: 'The directory that contains Postman collection files.',
    type: String,
    defaultOption: true,
  },
  {
    name: 'collection',
    typeLabel: '[underline]{file}',
    description: 'Postman collection file.',
    type: String,
    alias: 'c',
  },
  {
    name: 'environment',
    typeLabel: '[underline]{file}',
    description: 'Postman environment file.',
    type: String,
    alias: 'e',
    defaultValue: 'test',
  },
  {
    name: 'folder',
    typeLabel: '[underline]{string}',
    description: 'Folder name in your Postman collection.',
    type: String,
  },
  {
    name: 'iteration-data',
    typeLabel: '[underline]{file}',
    description: 'Postman data file',
    type: String,
    alias: 'd',
  },
  {
    name: 'timeout-request',
    typeLabel: '[underline]{number}',
    description: '',
    type: Number,
    defaultValue: 10000,
  },
  {
    name: 'delay-request',
    typeLabel: '[underline]{number}',
    description: '',
    type: Number,
    defaultValue: 0,
  },
];

const HELP_MSG = [
  {
    header: 'MyNewman',
    content: 'Run collections in batch with Newman.',
  },
  {
    header: 'Synopsis',
    content: [
      'node mynewman [[underline]{OPTION}] [underline]{DIR}',
      'node mynewman -c [underline]{COLLECTION_FILE} [-e [underline]{ENV_FILE}]',
      'node mynewman -c [underline]{COLLECTION_FILE} --folder [underline]{POSTMAN_FOLDER} [-d [underline]{DATA_FILE}] [-e [underline]{ENV_FILE}]',
    ],
  },
  {
    header: 'Options',
    optionList: CLI_ARGS,
  },
  {
    header: 'Author',
    content: [
      'Keith Mo',
      '[underline]{https://github.com/keithmork/MyNewman}',
    ],
  },
];

exports.getCliArgs = () => {
  const args = commandLineArgs(CLI_ARGS);
  const { help, collectionDir, collection, environment, folder } = args;
  const iterationData = args['iteration-data'];
  const timeoutRequest = args['timeout-request'];
  const delayRequest = args['delay-request'];

  if (help || (!collection && !collectionDir)) {
    exports.showUsage();
    process.exit(1);
  }

  return {
    timeoutRequest,
    delayRequest,
    collectionDir: collectionDir ? utils.getCollectionFileDir(collectionDir) : undefined,
    collection: collection ? utils.getCollectionFileByPartialName(collection) : undefined,
    environment: environment ? utils.getEnvFileByPartialName(environment) : undefined,
    folder: folder || undefined,
    iterationData: iterationData ? utils.getDataFileByPartialName(iterationData) : undefined,
  };
};

/**
 * Display help message in console.
 */
exports.showUsage = () => {
  console.info(commandLineUsage(HELP_MSG));
};
