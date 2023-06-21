import * as TYPES from '../types/types.js' // eslint-disable-line
import fsPromises from 'fs/promises'
import path from 'node:path'
import chalk from 'chalk'
import url from 'node:url'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

/**
 * @ignore
 * @typedef {TYPES.CLI_PACKAGE_JSON} CLI_PACKAGE_JSON {@link CLI_PACKAGE_JSON}
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
  const filePath = path.resolve(url.fileURLToPath(import.meta.url), '../../../../package.json')
  const packageJsonFile = require(filePath)
  return packageJsonFile
}

/**
 * #### parse package.json
 * @async
 * @memberof UTILS
 * @returns {Promise<Object.<any, any>|boolean>} package.json|false
 */
async function parsePackageJson () {
  const filePath = path.resolve('.', 'package.json')
  if (await isFileDirExists(filePath)) {
    const packageJsonFile = require(filePath)
    return packageJsonFile
  } else {
    return false
  }
}

/**
 * #### parse additional json files
 * @async
 * @memberof UTILS
 * @param {Array<string>} files - files
 * @returns {Promise<Object>} files data
 */
async function parseAdditionalJsonFiles (files) {
  /** @type {Object.<string, boolean|Object>} */
  const data = {}
  files.forEach(async file => {
    const fileBase = path.parse(file).base
    const filePath = path.resolve('.', file)
    if (path.parse(file).ext !== '.json') {
      console.log(`${chalk.green(file)} is not a ${chalk.yellow('json')} file`)
      return
    }
    if (await isFileDirExists(filePath)) {
      const packageJsonFile = require(filePath)
      data[fileBase] = packageJsonFile
    } else {
      data[fileBase] = false
    }
  })
  return data
}

export { isFileDirExists, parseCliPackageJson }
