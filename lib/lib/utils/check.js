import * as TYPES from '../config/types.js' // eslint-disable-line
import semver from 'semver'
import chalk from 'chalk'
import { execa } from 'execa'
import { text } from '../text.js'
import * as git from '../git/git.js'

/**
 * @ignore
 * @typedef {TYPES.CLI_PACKAGE_JSON} CLI_PACKAGE_JSON {@link CLI_PACKAGE_JSON}
 * @typedef {TYPES.DATA} DATA {@link DATA}
 */

/**
 * #### Check node version
 * @description Will throw an error if node version is wrong
 * @async
 * @param {CLI_PACKAGE_JSON} packageJson - CLI package.json
 * @returns undefined
 * @throws console.error & process.exit(1) if node version is wrong
 */
async function checkNode (packageJson) {
  const engines = packageJson.engines
  if (!semver.satisfies(process.version, engines.node)) {
    console.error(`${chalk.red('Error:')} Required node version ${chalk.yellow(engines.node)} not satisfied with current version ${process.version}`)
    process.exit(1)
  }
}

/**
 * #### Check if shell bin exists
 * @async
 * @param {string} bin - bin name
 * @returns undefined
 * @throws error
 */
async function checkIfBinExists (bin) {
  try {
    await execa('which', [bin])
  } catch (error) {
    console.error(`${chalk.red('Error:')} This script requires ${chalk.yellow(bin)} to be instaled`)
    process.exit(1)
  }
}

/**
 * #### Check if git repo and git root
 * @async
 * @returns undefined
 * @throws error
 */
async function checkIfGitRepoAndRoot () {
  const isGitRepo = await git.isGitRepo()
  const isGitRoot = await git.isGitRoot()
  if (!isGitRepo) {
    console.error(`${chalk.red('Error:')} This script requires to be run in a git repository`)
    process.exit(1)
  }
  if (!isGitRoot) {
    console.error(`${chalk.red('Error:')} This script requires to be run in the root of a git repository`)
    process.exit(1)
  }
}

/**
 * #### Check if commit message exists
 * @private
 * @returns undefined
 * @throws error
 */
async function checkIfCommitMessageExists () {
  const isGitCommits = await git.isGitCommits()
  if (!isGitCommits) {
    console.error(`${chalk.red('Error:')} This script requires to be run in a git repository with at least one commit`)
    process.exit(1)
  }
}

/**
 * #### check if tag on a current commit exists
 * @private
 * @param {DATA} data - data
 * @returns undefined
 * @throws error
 */
async function checkRepo (data) {
  if (data.git.gitBranch !== 'master' && data.git.gitBranch !== 'main') {
    console.error(`${chalk.red('Warning:')} you are not on ${chalk.blue('master')} or ${chalk.blue('main')} branch`)
  }
  if (data.git.isTagInCurrentCommit) {
    console.error(`${chalk.red('Error:')} Your current commit is already marked as a tagged release, you need at least one commit between releases`)
    process.exit(1)
  }
  if (data.git.isGitStagedFiles) {
    // console.error(`${chalk.red('Warning:')} You alredy have files staged for commit. It is recommended to commit them separately before proceeding with the release.\n`)
    console.error(text.warning.stagedFiles())
  }
  if (data.git.isGitRemote) {
    await git.gitUpdateRemote()
    if (data.git.isGitBranchBehind) {
      console.error(`${chalk.red('Error:')} Your branch is behind ${chalk.cyan(data.git.gitBranchUpstream)}`)
      process.exit(1)
    }
    if (data.git.isGitBrancAhead) {
      console.error(`${chalk.red('Error:')} Your branch is ahead ${chalk.cyan(data.git.gitBranchUpstream)}`)
      process.exit(1)
    }
    if (data.git.isGitBranchDetached) {
      console.error(`${chalk.red('Error:')} Your branch is detached`)
      process.exit(1)
    }
  }
}

export {
  checkNode,
  checkIfBinExists,
  checkIfGitRepoAndRoot,
  checkIfCommitMessageExists,
  checkRepo
}
