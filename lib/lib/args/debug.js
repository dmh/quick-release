import chalk from 'chalk'

/**
 * @summary Show debug info with --debug flag
 * @async
 * @param {Object} args - arguments
 * @param {Object} data - local data
 * @returns undefined
 */
async function debug (args, data) {
  console.log(`\n${chalk.bold.magenta('●─────')} Debug info [START]`)
  console.log(`${chalk.magenta('Arguments')}`)
  console.log(args)
  console.log(`${chalk.magenta('Local Data')}`)
  console.log(data)
  console.log(`${chalk.bold.magenta('─────●')} Debug info [END]\n`)
}

export { debug }
