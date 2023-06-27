import * as TYPES from '#types/types.js' // eslint-disable-line
import { execa } from 'execa'
import ora from 'ora'

/**
* @ignore
* @typedef {TYPES.DATA} DATA {@link DATA}
*/

/**
 * #### reinstall npm deps to update lockfile
 * @async
 * @memberof UTILS
 * @param {DATA} data - data object
 * @returns undefined
 */
async function installNpmDeps (data) {
  if (data.config.files.length > 0) {
    if (data.config.files.includes('package-lock.json') && data.config.files.includes('package.json')) {
      const spinner = ora('Install npm dependencies').start()
      try {
        await execa('npm', ['i'])
        spinner.succeed()
      } catch (error) {
        spinner.fail()
        console.error(error)
      }
    }
  }
}

export { installNpmDeps }
