import * as TYPES from './config/types.js' // eslint-disable-line
import path from 'node:path'
import dotenv from 'dotenv'
// import url from 'node:url'
import { isFileDirExists } from './utils/fs.js'
import { execa } from 'execa'
import { gitData } from './git/git.js'
import { parseQuickreleaseConfig } from './config/config.js'

/**
 * @ignore
 * @typedef {TYPES.DATA} DATA {@link DATA}
 * @typedef {TYPES.CLI_PACKAGE_JSON} CLI_PACKAGE_JSON {@link CLI_PACKAGE_JSON}
 */

const cwdPath = process.cwd()
const sysNpm = await execa('npm', ['--version'])
const sysGit = await execa('git', ['--version'])

/**
 * #### Get .env config
 * @async
 * @private
 * @returns {Promise<Object|undefined|boolean>} .env|false
 */
async function getLocalEnv () {
  if (await isFileDirExists(`${cwdPath}/.env`)) {
    const env = dotenv.config().parsed
    // if env not empty Object
    if (env !== undefined && Object.keys(env).length !== 0) {
      return dotenv.config().parsed
    } else {
      return false
    }
  } else {
    return false
  }
}

/**
 * #### collect local data
 * @async
 * @param {CLI_PACKAGE_JSON} cliPackageJson - cli package.json data
 * @returns {Promise<DATA>} local data
 */
async function collectLocalData (cliPackageJson) {
  const data = {
    cli: {
      version: cliPackageJson.version,
      engines: {
        node: cliPackageJson.engines.node,
        npm: cliPackageJson.engines.npm
      }
    },
    cwd: {
      path: cwdPath,
      dir: path.parse(cwdPath).dir,
      base: path.parse(cwdPath).base,
      name: path.parse(cwdPath).name
    },
    system: {
      node: process.version,
      npm: sysNpm.stdout,
      git: sysGit.stdout
    },
    env: await getLocalEnv(),
    config: await parseQuickreleaseConfig(),
    git: await gitData(),
    answers: {}
  }
  return data
}

export { collectLocalData }
