import chalk from 'chalk'

/**
 * #### Show debug info with --debug flag
 * @async
 * @memberof COMMANDS
 * @param {Object} data - local data
 * @returns undefined
 */
async function debug (data) {
  console.log(`\n${chalk.bold.magenta('●─────')} Debug info [START]`)
  console.log(data)
  console.log(`${chalk.bold.magenta('─────●')} Debug info [END]\n`)
}

export { debug }
