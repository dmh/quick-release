import * as TYPES from '#types/types.js' // eslint-disable-line
import { stagedFiles, changedFiles, gitRemoteDataUpdate, gitAdd, saveGitlog, gitCommit, gitPush, gitTag, gitPushTag } from '#git.js'
import { checkSshPermissions, checkSshConnection, checkIsOnline, checkRemoteRepo, checkIfCommitHasTag } from '#utils/check.js'
import { text } from '#utils/text.js'
import chalk from 'chalk'
import * as prompts from '#prompts.js'
import { updateChangelogConfig } from '#config.js'
import { updateVersionInFiles } from '#utils/fs.js'
import { installNpmDeps } from '#utils/exec.js'
import { saveChangelogData, saveChangelogDraft, changelogWriteFile } from '#changelog.js'
import { checkGithubToken, saveGithubCommits, saveGithubReleaseNotes, publishGithubRelease } from '#github.js'
import { debug } from '#utils/debug.js'

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
  // ask for release type
  const releaseType = await prompts.selectReleaseType(data)

  // if remote run remote checks
  if (releaseType === 'remote') {
    await checkIsOnline()
    await gitRemoteDataUpdate(data)
    checkRemoteRepo(data)
    await checkSshConnection('git@github.com')
    await checkSshPermissions()
    await checkGithubToken(data)
    debug('GitHub Token', data.github.token)
  }

  // save local git log
  await checkIfCommitHasTag(data)
  await saveGitlog(data)
  debug('Git Log', data.git.log)

  // define release version
  const releaseVersion = await prompts.selectReleaseVersion(data)

  // confirm to generate changelog
  const changelog = await prompts.confirmGenerateChangelog(data)

  // save answers to data object
  /** @type {PROMPTS_ANSWERS} */
  data.answers = {
    releaseType,
    releaseVersion,
    changelog
  }
  debug('Answers', data.answers)

  if (changelog === true) {
    // update changelog config and save changelog data
    await updateChangelogConfig(data)
    saveChangelogData(data)
    debug('Changelog', data.changelog)

    // create changelog draft
    saveChangelogDraft(data)
    debug('Changelog Draft', data.changelog.draft)
  }

  // show pre release info
  console.log(`
${text.title()}
${text.releaseType(data)}
${text.versions(data)}
${text.branch(data)}\
${text.branchUpstream(data)}\
${text.remoteName(data, (data.answers.releaseType === 'remote'))}\
${text.changelogFile(data, data.answers.changelog ?? true)}\
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
    // write changelog to file
    await changelogWriteFile(data)
  }

  // update version in files defined in config file
  await updateVersionInFiles(data)

  // install npm dependencies
  await installNpmDeps(data)

  // add files to git stage
  if (data.config.files.length > 0) {
    await gitAdd(data.config.files)
  }
  // update git info for staged files and changed files
  data.git.stagedFiles = await stagedFiles()
  data.git.changedFiles = await changedFiles()

  // check if staged files
  await prompts.checkStagedFiles(data.git.stagedFiles, data)

  // show pre commit info
  console.log(text.preCommitInfo(data))

  await prompts.confirmToContinue()

  // one more time update git info for staged files and changed files
  data.git.stagedFiles = await stagedFiles()
  data.git.changedFiles = await changedFiles()

  // check if staged files
  await prompts.checkStagedFiles(data.git.stagedFiles, data)

  // show staged files
  if (data.git.stagedFiles.length > 0) {
    console.log(`${chalk.grey('\nChanges to be committed as a release commit:\n')}${chalk.green(data.git.stagedFiles.join(','))}\n`)
  }

  // show changed files
  if (data.git.changedFiles.length > 0) {
    console.log(`${chalk.grey('Changes not staged for release commit:\n')}${chalk.yellow(data.git.changedFiles.join(','))}\n`)
  }

  // confirm release commit
  await prompts.confirmReleaseCommit(data)
  // check if staged files
  await prompts.checkStagedFiles(data.git.stagedFiles, data)

  // commit
  await gitCommit(`${data.answers.releaseVersion}`)
  // create tag
  await gitTag(`${data.answers.releaseVersion}`)
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
    await prompts.confirmPush()
    // push to remote
    await gitPush()

    // push to remote tags
    await gitPushTag()
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
  if (data.answers.releaseType === 'remote' && data.github.token === true) {
    // confirm publish GitHub release notes
    data.answers.githubRelease = await prompts.confirmPublishReleaseNotes()
    if (data.answers.githubRelease) {
      // get GitHub commits
      await saveGithubCommits(data)
      debug('GitHub Commits', data.github.commits)

      // generate GitHub release notes
      saveGithubReleaseNotes(data)
      debug('GitHub Release Notes', data.github.releaseNotes)

      // publish release on GitHub
      await publishGithubRelease(data)
    }
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
  console.log(chalk.magenta('Done'))
}

export { release }
