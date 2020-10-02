'use strict';
process.env.TS_NODE_FILES = true;
module.exports = {
  'allow-uncaught': true,
  diff: true,
  extension: ['ts'],
  recursive: true,
  reporter: 'spec',
  require: ['ts-node/register', '@nomiclabs/buidler/register'],
  slow: 75,
  spec: 'test/**/*.test.ts',
  timeout: 20000,
  ui: 'bdd',
  watch: false,
  'watch-files': ['src/**/*.sol', 'test/**/*.ts'],
};
