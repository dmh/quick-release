import chalk from 'chalk'
import minimist from 'minimist'

const argOptions = {
  boolean: ['info', 'help', 'debug', 'version'],
  alias: {
    i: 'info',
    h: 'help',
    d: 'debug',
    v: 'version'
  },
  stopEarly: true,
  '--': true,
  unknown: (/** @type {any} */ arg) => {
    console.error(`${chalk.red('Unknown')} or unexpected option: ${arg}`)
    console.error(`Run with ${chalk.yellow('--help')} to see available options`)
    process.exit(1)
  }
}

/**
 * #### parse cli args
 * @returns {any} cli args
 */
function parseArgs () {
  return minimist(process.argv.slice(2), argOptions)
}

export { parseArgs }
