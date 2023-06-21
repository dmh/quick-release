import * as TYPES from './config/types.js' // eslint-disable-line
import { gitStagedFiles, gitChangedFiles, gitRemoteUpdate } from './git/git.js'
import { checkSshPermissions, checkSshConnection, checkIsOnline, checkRemoteRepo } from './utils/check.js'
import { text } from './utils/text.js'
import * as prompts from './prompts/prompts.js'
import { updateChangelogConfig } from './config/config.js'

/**
 * @ignore
 * @typedef {TYPES.DATA} DATA {@link DATA}
 * @typedef {TYPES.PROMPTS_ANSWERS} PROMPTS_ANSWERS {@link PROMPTS_ANSWERS}
 */

/**
 * #### pre release info
 * @private
 * @async
 * @param {DATA} data - data object
 * @returns undefined
 */
async function preRelease (data) {
  const releaseType = await prompts.selectReleaseType(data)
  let githubRelease = false
  if (releaseType === 'remote') {
    await checkIsOnline()
    await gitRemoteUpdate(data)
    await checkRemoteRepo(data)
    await checkSshConnection('git@github.com')
    await checkSshPermissions()
    githubRelease = await prompts.confirmGenerateReleaseNotes()
    if (githubRelease) {
      // check github tocken
    }
  }
  const releaseVersion = await prompts.selectReleaseVersion(data)
  const changelog = await prompts.confirmGenerateChangelog(data)

  // save answers to data object
  /** @type {PROMPTS_ANSWERS} */
  data.answers = {
    releaseType,
    githubRelease,
    releaseVersion,
    changelog
  }

  if (changelog === true) {
    await updateChangelogConfig(data)
  }

  console.log(`
${text.title()}
${text.releaseType(data)}
${text.versions(data)}
${text.branch(data)}\
${text.branchUpstream(data)}\
change log
github release
${text.releaseFiles(data)}\
  `)
  await prompts.confirmToContinue()
}

/**
 * #### local release
 * @private
 * @async
 * @param {DATA} data - data object
 * @returns undefined
 */
async function localRelease (data) {
  if (data.answers.changelog === true) {
    // generate changelog
    // add changelog to file
  }
  // bump file versions
  // reinstall dependencies
  // add files to be staged for commit

  // check if staged files
  await prompts.checkStagedFiles(data.git.gitStagedFiles, data)
  console.log(text.preCommitInfo(data))
  await prompts.confirmToContinue()
  // update git info for staged files and changed files
  data.git.gitStagedFiles = await gitStagedFiles()
  data.git.gitChangedFiles = await gitChangedFiles()
  // check if staged files
  await prompts.checkStagedFiles(data.git.gitStagedFiles, data)
  console.log(`
${text.stagedFiles(data)}\
${text.changedFiles(data)}\
  `)
  await prompts.confirmReleaseCommit(data)
  // check if staged files
  await prompts.checkStagedFiles(data.git.gitStagedFiles, data)
  // commit files
  // create tag
}

/**
 * #### Remote release
 * @private
 * @async
 * @param {DATA} data - data object
 * @returns undefined
 */
async function remoteRelease (data) {
  if (data.answers.releaseType === 'remote') {
    // confirm push to remote
    // push to remote
    // push to remote tags
  }
}

/**
 * #### GitHub release
 * @private
 * @async
 * @param {DATA} data - data object
 * @returns undefined
 */
async function gitHubRelease (data) {
  if (data.answers.githubRelease === true) {
    // confirm release on GitHub
    // publish release on GitHub
  }
}

/**
 * #### Prompts
 * @private
 * @param {DATA} data - data object
 * @returns undefined
 */
async function release (data) {
  await preRelease(data)
  await localRelease(data)
  await remoteRelease(data)
  await gitHubRelease(data)
}

export { release }
