import { parseArgs } from './args/args.js'
import { parseCliPackageJson } from './utils/fs.js'
import {
  checkNode,
  checkIfGitRepoAndRoot,
  checkIfBinExists,
  checkIfCommitMessageExists,
  checkRepo
} from './utils/check.js'
import { collectLocalData } from './data.js'
import { info } from './args/info.js'
import { help } from './args/help.js'
import { debug } from './args/debug.js'
import { release } from './release.js'
import { quickreleaseConfig } from './config/config.js'

// required checks for cli
await checkIfBinExists('node')
await checkIfBinExists('npm')
await checkIfBinExists('git')
const cliPackageJson = await parseCliPackageJson()
await checkNode(cliPackageJson)
await checkIfGitRepoAndRoot()
await checkIfCommitMessageExists()

// save local data
const data = await collectLocalData(cliPackageJson)
// parse args
const args = parseArgs()

// const rrr = await quickreleaseConfig()
// console.log('🚀 ~ file: init.js:32 ~ rrr:', rrr)


/**
 * #### init cli
 * @async
 * @returns undefined
 */
async function init () {
  try {
    if (args.debug) {
      process.env.QR_MODE = 'debug'
      await debug(args, data)
    }
    // other repository checks
    await checkRepo(data)

    if (args.version) {
      console.log(`v${data.cli.version}`)
      process.exit(0)
    } else if (args.help) {
      await help()
      process.exit(0)
    } else if (args.info) {
      await info(data)
      process.exit(0)
    } else {
      await release(data)
      if (process.env.QR_MODE === 'debug') {
        await debug(args, data)
      }
    }
  } catch (error) {
    if (error && process.env.QR_MODE === 'debug') {
      console.error(error)
    } else {
      console.error(error.message)
    }
  }
}

export { init }
