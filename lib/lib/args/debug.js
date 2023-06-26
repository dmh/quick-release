import * as TYPES from '#types/types.js' // eslint-disable-line
import chalk from 'chalk'

/**
* @ignore
* @typedef {TYPES.DATA} DATA {@link DATA}
*/

/**
 * #### Show debug info with --debug flag
 * @async
 * @memberof COMMANDS
 * @param {DATA} data - local data
 * @returns undefined
 */
async function debug (data) {
  console.log(`\n${chalk.bold.magenta('●─────')} Debug info [START]`)
  console.log(data)
  console.log('Changelog generic:')
  console.log(data.changelog.generic)
  console.log('Changelog breaking changes:')
  console.log(data.changelog.breaking)
  console.log(`${chalk.bold.magenta('─────●')} Debug info [END]\n`)
}

export { debug }
