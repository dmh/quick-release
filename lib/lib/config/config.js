import * as TYPES from './types.js' // eslint-disable-line
import path from 'node:path'
import { isFileDirExists } from '../utils/fs.js'
import { text } from '../text.js'
import pFilter from 'p-filter'
import { createChangelogFile } from '../prompts/prompts.js'
import fsPromises from 'fs/promises'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

/**
 * @ignore
 * @typedef {TYPES.QUICKRELEASE_CONFIG} QUICKRELEASE_CONFIG {@link QUICKRELEASE_CONFIG}
 */

/**
 * #### parse quickrelease.json and initailize config
 * @async
 * @returns {Promise<QUICKRELEASE_CONFIG>} quickrelease.json
 */
async function initQuickreleaseConfig () {
  /** @type {QUICKRELEASE_CONFIG} */
  const quickreleaseDefaultConfig = {
    files: [
      'package.json',
      'package-lock.json'
    ],
    changelog: {
      file: 'CHANGELOG.md',
      labels: ['[FEATURE]', '[DOC]', '[TEST]', '[UPDATE]', '[BUGFIX]', '[TASK]'],
      breakingChangeTitle: '## Breaking Changes',
      breakingChangeLabel: '[!!!]'
    }
  }
  const filePath = path.resolve('.', 'quickrelease.json')
  if (await isFileDirExists(filePath)) {
    /** @type {QUICKRELEASE_CONFIG} */
    const packageJsonFile = require(filePath)

    // packageJsonFile.files
    if (packageJsonFile.files) {
      // if packageJsonFile.files not array, empty array, array of non strings or array of empty strings set default
      if (!Array.isArray(packageJsonFile.files) || packageJsonFile.files.length === 0 || packageJsonFile.files.some((/** @type {any} */ file) => typeof file !== 'string' || file === '')) {
        console.warn(text.warning.notValidConfigFiles())
        packageJsonFile.files = quickreleaseDefaultConfig.files
      } else {
        if (quickreleaseDefaultConfig.files) {
          // combine two arrays without duplicates and empty strings
          packageJsonFile.files = [...new Set([...packageJsonFile.files, ...quickreleaseDefaultConfig.files])]
        }
      }
    } else {
      packageJsonFile.files = quickreleaseDefaultConfig.files
    }

    // packageJsonFile.changelog
    if (packageJsonFile.changelog) {
      // packageJsonFile.changelog.file
      if (packageJsonFile.changelog.file) {
        // if packageJsonFile.changelog.file boolean number undefined null or empty string set default
        if (typeof packageJsonFile.changelog.file !== 'string' || packageJsonFile.changelog.file === '') {
          console.warn(text.warning.notValidConfigClogFile())
          packageJsonFile.changelog.file = quickreleaseDefaultConfig.changelog?.file
        }
      } else {
        packageJsonFile.changelog.file = quickreleaseDefaultConfig.changelog?.file
      }

      // packageJsonFile.changelog.labels
      if (packageJsonFile.changelog.labels) {
        // if packageJsonFile.changelog.labels not array, empty array, array of non strings or array of empty strings set default
        if (!Array.isArray(packageJsonFile.changelog.labels) || packageJsonFile.changelog.labels.length === 0 || packageJsonFile.changelog.labels.some((/** @type {any} */ label) => typeof label !== 'string' || label === '')) {
          console.warn(text.warning.notValidConfigClogLabels())
          packageJsonFile.changelog.labels = quickreleaseDefaultConfig.changelog?.labels
        }
      } else {
        packageJsonFile.changelog.labels = quickreleaseDefaultConfig.changelog?.labels
      }

      // packageJsonFile.changelog.breakingChangeTitle
      if (packageJsonFile.changelog.breakingChangeTitle) {
        // if packageJsonFile.changelog.breakingChangeTitle boolean number undefined null or empty string set default
        if (typeof packageJsonFile.changelog.breakingChangeTitle !== 'string' || packageJsonFile.changelog.breakingChangeTitle === '') {
          console.warn(text.warning.notValidConfigClogBrTitle())
          console.log('🚀 ~ file: config.js:86 ~ quickreleaseConfig ~ packageJsonFile.changelog.breakingChangeTitle:', packageJsonFile.changelog.breakingChangeTitle)
          packageJsonFile.changelog.breakingChangeTitle = quickreleaseDefaultConfig.changelog?.breakingChangeTitle
        }
      } else {
        packageJsonFile.changelog.breakingChangeTitle = quickreleaseDefaultConfig.changelog?.breakingChangeTitle
      }

      // packageJsonFile.changelog.breakingChangeLabel
      if (packageJsonFile.changelog.breakingChangeLabel) {
        // if packageJsonFile.changelog.breakingChangeLabel boolean number undefined null or empty string set default
        if (typeof packageJsonFile.changelog.breakingChangeLabel !== 'string' || packageJsonFile.changelog.breakingChangeLabel === '') {
          console.warn(text.warning.notValidConfigClogBrLabel())
          packageJsonFile.changelog.breakingChangeLabel = quickreleaseDefaultConfig.changelog?.breakingChangeLabel
        }
      } else {
        packageJsonFile.changelog.breakingChangeLabel = quickreleaseDefaultConfig.changelog?.breakingChangeLabel
      }
    } else {
      packageJsonFile.changelog = quickreleaseDefaultConfig.changelog
    }
    return packageJsonFile
  } else {
    return quickreleaseDefaultConfig
  }
}

/**
 * #### finalaize quickrelease config
 * @private
 * @async
 * @returns {Promise<QUICKRELEASE_CONFIG>} data
 */
async function quickreleaseConfig () {
  const config = await initQuickreleaseConfig()
  if (config.files) {
    // check if packageJsonFile.files exists in cwd
    config.files = await pFilter(
      config.files,
      async filter => await isFileDirExists(path.resolve('.', filter))
    )
    // check if not .json file in files array
    if (config.files.some(file => !file.endsWith('.json'))) {
      console.warn(text.warning.notValidConfigFilesExt())
      // remove not .json files from files array
      config.files = config.files.filter(file => file.endsWith('.json'))
    }
  }
  if (config.changelog?.file) {
    const filePath = path.resolve('.', config.changelog.file)
    // check if changelog file exists in cwd
    if (!await isFileDirExists(filePath)) {
      // ask if create changelog file
      const answer = await createChangelogFile(config.changelog.file)
      if (answer) {
        // create changelog file
        await fsPromises.writeFile(filePath, '')
        // add changelog file to config files array
        config.files && config.files.push(config.changelog.file)
      } else {
        // delete changelog file from config
        delete config.changelog.file
      }
    } else {
      // add changelog file to config files array
      config.files && config.files.push(config.changelog.file)
    }
  }
  return config
}

export { quickreleaseConfig }
