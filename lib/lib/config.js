import * as TYPES from './types/types.js' // eslint-disable-line
import path from 'node:path'
import { isFileDirExists } from './utils/fs.js'
import { createChangelogFile } from './prompts.js'
import fsPromises from 'fs/promises'
import { createRequire } from 'module'
import chalk from 'chalk'
const require = createRequire(import.meta.url)

/**
 * @ignore
 * @typedef {TYPES.QUICKRELEASE_CONFIG} QUICKRELEASE_CONFIG {@link QUICKRELEASE_CONFIG}
 * @typedef {TYPES.DATA} DATA {@link DATA}
 */

/**
 * #### Read quickrelease.json config file
 * @private
 * @async
 * @returns {Promise<QUICKRELEASE_CONFIG|false>} quickrelease.json config
 */
async function readQuickreleaseConfig () {
  const filePath = path.resolve('.', 'quickrelease.json')
  const isConfigFileExists = await isFileDirExists(filePath)
  if (isConfigFileExists) {
    try {
      const quickreleaseConfig = require(filePath)
      return quickreleaseConfig
    } catch (error) {
      console.warn(`${chalk.red('Warning:')} ${chalk.green('quickrelease.json')} config file empty or not valid\n`)
      return false
    }
  } else {
    return false
  }
}

/**
 * #### Parse quickrelease.json and initailize config
 * @async
 * @memberof CONFIG
 * @returns {Promise<QUICKRELEASE_CONFIG>} quickrelease.json config
 */
async function parseQuickreleaseConfig () {
  /** @type {QUICKRELEASE_CONFIG} */
  const quickreleaseDefaultConfig = {
    files: [
      'package.json',
      'package-lock.json'
    ],
    changelog: {
      file: 'CHANGELOG.md',
      filter: 'labels', // labels, date
      labels: ['[FEATURE]', '[TASK]', '[BUGFIX]', '[DOC]', '[TEST]'],
      breakingChangeTitle: '## Breaking changes',
      breakingChangeLabel: '[!!!]'
    }
  }

  const quickreleaseConfig = await readQuickreleaseConfig()

  if (quickreleaseConfig === false) {
    await removeNonExistConfigFiles(quickreleaseDefaultConfig)
    return quickreleaseDefaultConfig
  } else {
    // quickreleaseConfig.files
    if (quickreleaseConfig.files) {
      // if quickreleaseConfig.files not array, empty array, array of non strings or array of empty strings set default
      if (!Array.isArray(quickreleaseConfig.files) || quickreleaseConfig.files.length === 0 || quickreleaseConfig.files.some((/** @type {any} */ file) => typeof file !== 'string' || file === '')) {
        console.warn(`${chalk.red('Warning:')} Not valid ${chalk.green('quickrelease.json')} config file list. Make sure this is array of strings.\n`)
        quickreleaseConfig.files = quickreleaseDefaultConfig.files
      } else {
        // combine two arrays without duplicates and empty strings
        quickreleaseConfig.files = [...new Set([...quickreleaseConfig.files, ...quickreleaseDefaultConfig.files])]
      }
    } else {
      quickreleaseConfig.files = quickreleaseDefaultConfig.files
    }
    // check if not .json file in files array
    if (quickreleaseConfig.files.some((/** @type {string} */ file) => !file.endsWith('.json'))) {
      console.warn(`${chalk.red('Warning:')} Some of files in ${chalk.green('quickrelease.json')} config file list are not valid JSON files. Make sure all files are valid JSON files.\n`)
      // remove not .json files from files array
      quickreleaseConfig.files = quickreleaseConfig.files.filter((/** @type {string} */ file) => file.endsWith('.json'))
    }

    // quickreleaseConfig.changelog
    if (quickreleaseConfig.changelog) {
      // quickreleaseConfig.changelog.file
      if (quickreleaseConfig.changelog.file) {
        // if quickreleaseConfig.changelog.file boolean number undefined null or empty string set default
        if (typeof quickreleaseConfig.changelog.file !== 'string' || quickreleaseConfig.changelog.file === '') {
          console.warn(`${chalk.red('Warning:')} Not valid ${chalk.green('quickrelease.json')} config changelog file. Make sure this is a string.\n`)
          quickreleaseConfig.changelog.file = quickreleaseDefaultConfig.changelog.file
        }
        // check if changelog file is .md file
        if (!quickreleaseConfig.changelog.file.endsWith('.md')) {
          console.warn(`${chalk.red('Warning:')} Changelog file in ${chalk.green('quickrelease.json')} config is not Markdown file. Make sure file extension is ${chalk.green('.md')}\n`)
          quickreleaseConfig.changelog.file = quickreleaseDefaultConfig.changelog.file
        }
      } else {
        quickreleaseConfig.changelog.file = quickreleaseDefaultConfig.changelog.file
      }

      // quickreleaseConfig.changelog.labels
      if (quickreleaseConfig.changelog.labels) {
        // if quickreleaseConfig.changelog.labels not array, empty array, array of non strings or array of empty strings set default
        if (!Array.isArray(quickreleaseConfig.changelog.labels) || quickreleaseConfig.changelog.labels.length === 0 || quickreleaseConfig.changelog.labels.some((/** @type {any} */ label) => typeof label !== 'string' || label === '')) {
          console.warn(`${chalk.red('Warning:')} Not valid ${chalk.green('quickrelease.json')} config changelog labels. Make sure this is array of strings.\n`)
          quickreleaseConfig.changelog.labels = quickreleaseDefaultConfig.changelog.labels
        }
      } else {
        quickreleaseConfig.changelog.labels = quickreleaseDefaultConfig.changelog.labels
      }

      // quickreleaseConfig.changelog.breakingChangeTitle
      if (quickreleaseConfig.changelog.breakingChangeTitle) {
        // if quickreleaseConfig.changelog.breakingChangeTitle boolean number undefined null or empty string set default
        if (typeof quickreleaseConfig.changelog.breakingChangeTitle !== 'string' || quickreleaseConfig.changelog.breakingChangeTitle === '') {
          console.warn(`${chalk.red('Warning:')} Not valid ${chalk.green('quickrelease.json')} config changelog BreakingChange title. Make sure this is a string.\n`)
          quickreleaseConfig.changelog.breakingChangeTitle = quickreleaseDefaultConfig.changelog.breakingChangeTitle
        }
      } else {
        quickreleaseConfig.changelog.breakingChangeTitle = quickreleaseDefaultConfig.changelog.breakingChangeTitle
      }

      // quickreleaseConfig.changelog.breakingChangeLabel
      if (quickreleaseConfig.changelog.breakingChangeLabel) {
        // if quickreleaseConfig.changelog.breakingChangeLabel boolean number undefined null or empty string set default
        if (typeof quickreleaseConfig.changelog.breakingChangeLabel !== 'string' || quickreleaseConfig.changelog.breakingChangeLabel === '') {
          console.warn(`${chalk.red('Warning:')} Not valid ${chalk.green('quickrelease.json')} config changelog BreakingChange label. Make sure this is a string.\n`)
          quickreleaseConfig.changelog.breakingChangeLabel = quickreleaseDefaultConfig.changelog.breakingChangeLabel
        }
      } else {
        quickreleaseConfig.changelog.breakingChangeLabel = quickreleaseDefaultConfig.changelog.breakingChangeLabel
      }
    } else {
      quickreleaseConfig.changelog = quickreleaseDefaultConfig.changelog
    }
    await removeNonExistConfigFiles(quickreleaseConfig)
    return quickreleaseConfig
  }
}

/**
 * #### remove not existing files from config
 * @description check if quickreleaseConfig.files exists in cwd and remove not existing files
 * @memberof CONFIG
 * @private
 * @async
 * @param {QUICKRELEASE_CONFIG} config
 * @returns {Promise<QUICKRELEASE_CONFIG>} data
 */
async function removeNonExistConfigFiles (config) {
  if (config.files && config.files.length > 0) {
    for await (const file of config.files) {
      // check if quickreleaseConfig.files exists in cwd
      const isExists = await isFileDirExists(path.resolve('.', file))
      if (!isExists) {
        config.files = config.files.filter((/** @type {string} */ item) => item !== file)
      }
    }
  }
  return config
}

/**
 * #### update changelog config
 * @description prepare changelog config and create changelog file if not exists
 * @async
 * @memberof CONFIG
 * @param {DATA} data - data
 * @returns {Promise<DATA>} local data
 */
async function updateChangelogConfig (data) {
  const filePath = path.resolve('.', data.config.changelog.file)
  // check if changelog file exists in cwd
  if (!await isFileDirExists(filePath)) {
    // ask if create changelog file
    const answer = await createChangelogFile(data.config.changelog.file)
    if (answer) {
      // create changelog file
      await fsPromises.writeFile(filePath, '')
      // add changelog file to config files array
      data.config.files && data.config.files.push(data.config.changelog.file)
    } else {
      data.answers.changelog = false
    }
  } else {
    // add changelog file to config files array
    data.config.files && data.config.files.push(data.config.changelog.file)
  }
  return data
}

export { parseQuickreleaseConfig, updateChangelogConfig }