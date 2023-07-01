import * as TYPES from '#types/types.js' // eslint-disable-line
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import chalk from 'chalk'
import url from 'node:url'
import editorconfig from 'editorconfig'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

/**
 * @ignore
 * @typedef {TYPES.CLI_PACKAGE_JSON} CLI_PACKAGE_JSON {@link CLI_PACKAGE_JSON}
 * @typedef {TYPES.DATA} DATA {@link DATA}
 * @typedef {TYPES.JSON_WITH_FORMATING} JSON_WITH_FORMATING {@link JSON_WITH_FORMATING}
 */

/**
 * #### check if file/dir exists
 * @async
 * @memberof UTILS
 * @param {string} path - file/dir path
 * @returns {Promise<boolean>}
 */
async function isFileDirExists (path) {
  try {
    await fsPromises.stat(path)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false
    }
    throw new Error(error)
  }
}

/**
 * #### parse CLI package.json
 * @async
 * @memberof UTILS
 * @returns {Promise<CLI_PACKAGE_JSON>} cli package.json
 */
async function parseCliPackageJson () {
  const filePath = path.resolve(url.fileURLToPath(import.meta.url), '../../../package.json')
  const packageJsonFile = require(filePath)
  return packageJsonFile
}

/**
 * #### get file formating info with editorconfig helper
 * @private
 * @async
 * @memberof UTILS
 * @param {string} filePath - file path
 * @returns {Promise<JSON_WITH_FORMATING['format']>} portal name|names
 */
async function getEditorConfigFormat (filePath) {
  const jsonFormat = await editorconfig.parse(filePath)
  /** @type {JSON_WITH_FORMATING['format']} */
  const format = {
    space: 2,
    newline: ''
  }
  if (jsonFormat.indent_style === 'tab') {
    format.space = '\t'
  } else if (jsonFormat.indent_style === 'space') {
    format.space = jsonFormat.indent_size
  }
  if (jsonFormat.insert_final_newline) {
    format.newline = '\n'
  }
  return format
}

/**
 * #### Read JSON file with formating info
 * @async
 * @memberof UTILS
 * @param {string} filePath - file path
 * @returns {Promise<JSON_WITH_FORMATING|false>} quickrelease.json config
 */
async function readJsonWithFormat (filePath) {
  const file = path.parse(filePath)
  if (file.ext === '.json') {
    const isFileExists = await isFileDirExists(filePath)
    if (isFileExists) {
      try {
        const data = require(filePath)
        const format = await getEditorConfigFormat(filePath)
        return {
          data,
          format
        }
      } catch (error) {
        console.warn(`${chalk.red('Warning:')} ${chalk.green(file.base)} file empty or not valid JSON\n`)
        return false
      }
    }
  }
  return false
}

/**
 * #### write new version data to JSON files
 * @async
 * @memberof UTILS
 * @param {DATA} data - data object
 * @returns undefined
 */
async function updateVersionInFiles (data) {
  if (data.config.files.length > 0 && data.answers.releaseVersion) {
    for await (const file of data.config.files) {
      if (file !== 'package-lock.json') {
        const filePath = path.resolve('.', file)
        /** @type {JSON_WITH_FORMATING|false} */
        const jsonFile = await readJsonWithFormat(filePath)
        if (jsonFile && jsonFile.data) {
          if (jsonFile.data.version) {
            jsonFile.data.version = data.answers.releaseVersion
            await fsPromises.writeFile(
              filePath,
              JSON.stringify(jsonFile.data, null, jsonFile.format.space) + jsonFile.format.newline,
              { encoding: 'utf8' }
            )
          } else {
            console.warn(`${chalk.red('Warning:')} ${chalk.green(file)} file does not have version property and will not be updated to a new version.\n`)
            // remove file from from config.files
            data.config.files = data.config.files.filter((item) => item !== file)
          }
        }
      }
    }
  }
}

export { isFileDirExists, parseCliPackageJson, updateVersionInFiles, readJsonWithFormat }
