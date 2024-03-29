import { parseArgs } from '#args/args.js'
import { parseCliPackageJson } from '#utils/fs.js'
import {
  checkNode,
  checkIfGitRepoAndRoot,
  checkIfBinExists,
  checkIfCommitMessageExists,
  checkLocalRepo
} from '#utils/check.js'
import { collectLocalData } from '#data.js'
import { info } from '#args/info.js'
import { help } from '#args/help.js'
import { debug } from '#utils/debug.js'
import { release } from '#release.js'
import chalk from 'chalk'

// required general checks
await checkIfBinExists('node')
await checkIfBinExists('npm')
await checkIfBinExists('git')
const cliPackageJson = await parseCliPackageJson()
await checkNode(cliPackageJson)
await checkIfGitRepoAndRoot()
await checkIfCommitMessageExists()

// parse args
const args = parseArgs()
// save local data
const data = await collectLocalData(cliPackageJson)

/**
 * #### init cli
 * @async
 * @returns undefined
 */
async function init () {
  try {
    // init debug mode
    if (args.debug) {
      process.env.QR_MODE = 'debug'
      debug('Initial Debug info', data)
    }

    // check local repo
    await checkLocalRepo(data)

    if (args.version) {
      // show version
      console.log(`v${data.cli.version}`)
      process.exit(0)
    } else if (args.help) {
      // show help
      help()
      process.exit(0)
    } else if (args.info) {
      // show info
      info(data)
      process.exit(0)
    } else {
      // release steps
      await release(data)
    }
  } catch (error) {
    if (error && process.env.QR_MODE === 'debug') {
      console.error(chalk.bold.red('Error:'))
      console.error(error)
    } else {
      console.error(`${chalk.bold.red('Error:')} ${error.message}`)
    }
  }
}

export { init }
