import * as TYPES from '../config/types.js' // eslint-disable-line
import semver from 'semver'
import { $ } from 'execa'
import isOnline from 'is-online'
import { text } from './text.js'
import * as git from '../git/git.js'
import ora from 'ora'

/**
 * @ignore
 * @typedef {TYPES.CLI_PACKAGE_JSON} CLI_PACKAGE_JSON {@link CLI_PACKAGE_JSON}
 * @typedef {TYPES.DATA} DATA {@link DATA}
 */

/**
 * #### Check node version
 * @description Will throw an error if node version is wrong
 * @async
 * @memberof CHECK
 * @param {CLI_PACKAGE_JSON} packageJson - CLI package.json
 * @returns undefined
 * @throws console.error & process.exit(1) if node version is wrong
 */
async function checkNode (packageJson) {
  const engines = packageJson.engines
  if (!semver.satisfies(process.version, engines.node)) {
    console.error(text.error.checkNode(engines))
    process.exit(1)
  }
}

/**
 * #### Check if shell bin exists
 * @async
 * @memberof CHECK
 * @param {string} bin - bin name
 * @returns undefined
 * @throws process.exit(1) if bin does not exist
 */
async function checkIfBinExists (bin) {
  try {
    await $`which ${bin}`
  } catch (error) {
    console.error(text.error.checkIfBinExists(bin))
    process.exit(1)
  }
}

/**
 * #### Check if git repo and git root
 * @async
 * @memberof CHECK
 * @returns undefined
 * @throws process.exit(1) if not git repo or not git root
 */
async function checkIfGitRepoAndRoot () {
  const isGitRepo = await git.isGitRepo()
  const isGitRoot = await git.isGitRoot()
  if (!isGitRepo) {
    console.error(text.error.isGitRepo())
    process.exit(1)
  }
  if (!isGitRoot) {
    console.error(text.error.isGitRoot())
    process.exit(1)
  }
}

/**
 * #### Check if commit message exists
 * @async
 * @returns undefined
 * @throws process.exit(1) if no commit message exists
 */
async function checkIfCommitMessageExists () {
  const isGitCommits = await git.isGitCommits()
  if (!isGitCommits) {
    console.error(text.error.checkIfCommitMessageExists())
    process.exit(1)
  }
}

/**
 * #### check repo status
 * @async
 * @memberof CHECK
 * @param {DATA} data - data
 * @returns undefined
 * @throws process.exit(1) or warning if repo status is not ok
 */
async function checkLocalRepo (data) {
  if (data.git.gitBranch !== 'master' && data.git.gitBranch !== 'main') {
    console.warn(text.warning.notMasterMain())
  }
  if (data.git.isTagInCurrentCommit) {
    console.error(text.error.isTagInCurrentCommit())
    process.exit(1)
  }
  if (data.git.gitStagedFiles.length > 0) {
    console.warn(text.warning.stagedFiles())
  }
}

/**
 * #### check remote repo status
 * @async
 * @memberof CHECK
 * @param {DATA} data - data
 * @returns undefined
 * @throws process.exit(1) or warning if remote repo status is not ok
 */
async function checkRemoteRepo (data) {
  if (data.git.isGitRemote) {
    if (data.git.isGitBranchBehind) {
      console.error(text.error.isGitBranchBehind(data))
      process.exit(1)
    }
    if (data.git.isGitBranchAhead) {
      console.error(text.error.isGitBrancAhead(data))
      process.exit(1)
    }
    if (data.git.isGitBranchDetached) {
      console.error(text.error.isGitBranchDetached())
      process.exit(1)
    }
    // check if remote protocol not ssh and disable remote release type
    if (data.git.gitRemoteOrigin.protocol && data.git.gitRemoteOrigin.protocol !== 'ssh') {
      data.git.isGitRemote = false
      console.error(text.warning.noSshRemote(data))
    }
  }
}

/**
 * #### check ssh connection
 * @async
 * @memberof CHECK
 * @param {string} serverUrl - server url
 * @returns undefined
 * @throws process.exit(1) if  ssh connection fails
 */
async function checkSshConnection (serverUrl) {
  const spinner = ora('Check ssh connection').start()
  try {
    await $`ssh -T -o ConnectTimeout=5 -o BatchMode=yes ${serverUrl}`
    spinner.succeed()
  } catch (error) {
    if (!error.stderr.includes('successfully authenticated')) {
      spinner.fail()
      console.error(text.error.checkSshConnection(serverUrl))
      process.exit(1)
    }
    spinner.succeed()
  }
}

/**
 * #### Check ssh permissions to current repo
 * @async
 * @memberof CHECK
 * @returns undefined
 * @throws process.exit(1) if ssh permissions to current repo fails
 */
async function checkSshPermissions () {
  const spinner = ora('Check ssh permissions').start()
  try {
    await $`git push --dry-run`
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    if (error.stderr.includes('denied')) {
      console.error(text.error.checkSshPermissions())
      process.exit(1)
    }
    console.error(error.stderr)
    process.exit(1)
  }
}

/**
 * #### check is online
 * @async
 * @memberof CHECK
 * @returns undefined
 * @throws process.exit(1) if not online
 */
async function checkIsOnline () {
  console.log('')
  const spinner = ora('Check internet connection').start()
  const isOnlineResult = await isOnline()
  if (!isOnlineResult) {
    spinner.fail()
    console.error(text.error.checkIsOnline())
    process.exit(1)
  }
  spinner.succeed()
}

/**
 * #### check github personal access token permissions
 * @async
 * @memberof CHECK
 * @param {DATA} data - data
 * @returns undefined
 * @throws process.exit(1) if github personal access token permissions fails
 */
// async function checkGithubPersonalAccessTokenPermissions (data) {
//   const octokit = await git.getOctokit(data)
//   const { data: { permissions } } = await octokit.request('GET /repos/{owner}/{repo}', {
//     owner: data.git.gitUser,
//     repo: data.git.gitRepo
//   })
//   if (!permissions.push) {
//     console.error(text.error.checkGithubPersonalAccessTokenPermissions())
//     process.exit(1)
//   }
// }

export {
  checkNode,
  checkIfBinExists,
  checkIfGitRepoAndRoot,
  checkIfCommitMessageExists,
  checkLocalRepo,
  checkRemoteRepo,
  checkSshConnection,
  checkSshPermissions,
  checkIsOnline
}
