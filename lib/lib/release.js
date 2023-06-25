import * as TYPES from '#types/types.js' // eslint-disable-line
import { gitStagedFiles, gitChangedFiles, gitRemoteDataUpdate, gitAdd } from '#git.js'
import { checkSshPermissions, checkSshConnection, checkIsOnline, checkRemoteRepo } from '#utils/check.js'
import { text } from '#utils/text.js'
import chalk from 'chalk'
import * as prompts from '#prompts.js'
import { updateChangelogConfig } from '#config.js'
import { updateVersionInFiles } from '#utils/fs.js'
import { installNpmDeps } from '#utils/exec.js'

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
  if (releaseType === 'remote') {
    await checkIsOnline()
    await gitRemoteDataUpdate(data)
    await checkRemoteRepo(data)
    await checkSshConnection('git@github.com')
    await checkSshPermissions()
  // check github tocken
  }
  const releaseVersion = await prompts.selectReleaseVersion(data)
  const changelog = await prompts.confirmGenerateChangelog(data)

  // save answers to data object
  /** @type {PROMPTS_ANSWERS} */
  data.answers = {
    releaseType,
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
${text.remoteUrl(data, (data.answers.releaseType === 'remote'))}\
${text.changelogFile(data, data.answers.changelog)}\
${text.githubRelease(data)}\
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
  await updateVersionInFiles(data)
  await installNpmDeps(data)
  if (data.config.files.length > 0) {
    await gitAdd(data.config.files)
  }

  // check if staged files
  await prompts.checkStagedFiles(data.git.gitStagedFiles, data)
  console.log(text.preCommitInfo(data))
  await prompts.confirmToContinue()
  // update git info for staged files and changed files
  data.git.gitStagedFiles = await gitStagedFiles()
  data.git.gitChangedFiles = await gitChangedFiles()
  // check if staged files
  await prompts.checkStagedFiles(data.git.gitStagedFiles, data)
  if (data.git.gitStagedFiles.length > 0) {
    console.log(`${chalk.grey('Changes to be committed as a release commit:\n')}${chalk.green(data.git.gitStagedFiles.join(','))}\n`)
  }
  if (data.git.gitChangedFiles.length > 0) {
    console.log(`${chalk.grey('Changes not staged for release commit:\n')}${chalk.yellow(data.git.gitChangedFiles.join(','))}\n`)
  }
  await prompts.confirmReleaseCommit(data)
  // check if staged files
  await prompts.checkStagedFiles(data.git.gitStagedFiles, data)

  // commit files +++++++++++++++
  // create tag +++++++++++++++
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
    // confirm push to remote +++++++++++++++
    // push to remote +++++++++++++++
    // push to remote tags +++++++++++++++
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
  data.answers.githubRelease = await prompts.publishReleaseNotes()
  if (data.answers.githubRelease === true) {
    // confirm release on GitHub +++++++++++++++
    // publish release on GitHub +++++++++++++++
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
