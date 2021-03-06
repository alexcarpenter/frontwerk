/* eslint-disable global-require */
jest.mock('cross-spawn');
jest.mock('jest');

const cases = require('jest-in-case');

const testCases = [
  {
    name: 'calls eslint CLI with default args'
  },
  {
    name: '--no-cache will disable caching',
    args: ['--no-cache']
  },
  {
    name: 'does not use built-in config with .eslintrc file',
    fileExists: filename => filename === '.eslintrc'
  },
  {
    name: 'does not use built-in config with eslintrc.js file',
    fileExists: filename => filename === 'eslintrc.js'
  },
  {
    name: 'does not use built-in config with eslintConfig pkg prop',
    hasPkgProp: prop => prop === 'eslintConfig'
  },
  {
    name: 'does not use built-in ignore with --ignore-path',
    args: ['--ignore-path', './my-ignore']
  },
  {
    name: 'does not use built-in config with --config',
    args: ['--config', './custom-config.js']
  },
  {
    name: 'does not use built-in ignore with .eslintignore file',
    fileExists: filename => filename === '.eslintignore'
  }
];

const testFn = ({
  fileExists = () => false,
  hasPkgProp = () => false,
  args = []
}) => {
  const { sync: crossSpawnSyncMock } = require('cross-spawn');
  const originalExit = process.exit;
  const originalArgv = process.argv;
  process.exit = jest.fn();

  Object.assign(require('../../utils/fileExists'), { fileExists });
  Object.assign(require('../../utils/pkg'), { hasPkgProp });
  Object.assign(require('../../utils/resolveBin'), {
    resolveBin: (modName, { executable = modName } = {}) => executable
  });

  process.exit = jest.fn();

  try {
    // tests
    process.argv = ['node', '../lint', ...args];
    crossSpawnSyncMock.mockClear();

    require('../lint');

    expect(crossSpawnSyncMock).toHaveBeenCalledTimes(1);
    const [firstCall] = crossSpawnSyncMock.mock.calls;
    const [script, calledArgs] = firstCall;
    expect([script, ...calledArgs].join(' ')).toMatchSnapshot();
  } catch (error) {
    throw error;
  } finally {
    // afterEach
    process.exit = originalExit;
    process.argv = originalArgv;
    jest.resetModules();
  }
};

cases('format', testFn, testCases);
