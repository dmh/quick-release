import * as TYPES from './config/types.js' // eslint-disable-line
// import { select, input, confirm } from '@inquirer/prompts'
// import semver from 'semver'
// import chalk from 'chalk'
import { gitStagedFiles, gitChangedFiles, isGitStagedFiles, isGitChangedFiles } from './git/git.js'
import { text } from './text.js'
import * as prompts from './prompts/prompts.js'

/**
 * @ignore
 * @typedef {TYPES.DATA} DATA {@link DATA}
 * @typedef {TYPES.PROMPTS_ANSWERS} PROMPTS_ANSWERS {@link PROMPTS_ANSWERS}
 */

/**
 * #### pre release info
 * @private
 * @param {DATA} data - data object
 * @returns undefined
 */
async function preRelease (data) {
  const releaseType = await prompts.selectReleaseType(data)
  const releaseVersion = await prompts.selectReleaseVersion(data)
  let changelog = false
  if (data.config.changelog && data.config.changelog.file) {
    changelog = await prompts.confirmGenerateChangelog(data)
    if (changelog === false) {
      delete data.config.changelog
      // delete changelog file from files to be staged
      data.config.files = data.config?.files?.filter(file => file === data.config?.changelog?.file)
    }
  }
  /** @type {PROMPTS_ANSWERS} */
  const answers = {
    releaseType,
    releaseVersion,
    changelog
  }
  data.answers = answers
  console.log(`
${text.title()}
${text.releaseType(data)}
${text.versions(data)}
${text.branch(data)}
${text.branchUpstream(data)}\
${text.releaseFiles(data)}\
  `)
  await prompts.confirmToContinue()
}

/**
 * #### local release
 * @private
 * @param {DATA} data - data object
 * @returns undefined
 */
async function localRelease (data) {
  // generate changelog
  // add changelog to file
  // bump file versions
  // reinstall dependencies
  // add files to be staged for commit

  // check if staged files
  await prompts.checkStagedFiles(data.git.isGitStagedFiles, data)
  console.log(text.preCommitInfo(data))
  await prompts.confirmToContinue()
  // update git info for staged files and changed files
  data.git.isGitStagedFiles = await isGitStagedFiles()
  data.git.gitStagedFiles = await gitStagedFiles()
  data.git.isGitChangedFiles = await isGitChangedFiles()
  data.git.gitChangedFiles = await gitChangedFiles()
  // check if staged files
  await prompts.checkStagedFiles(data.git.isGitStagedFiles, data)
  console.log(`
${text.stagedFiles(data)}\
${text.changedFiles(data)}\
  `)
  await prompts.confirmReleaseCommit(data)
  // check if staged files
  await prompts.checkStagedFiles(data.git.isGitStagedFiles, data)
  // commit files
  // create tag
}

/**
 * #### Remote release
 * @private
 * @param {DATA} data - data object
 * @returns undefined
 */
async function remoteRelease (data) {
  // is ssh of tocken https vs ssh
  // is online
  // confirm push to remote
  // push to remote
  // push to remote tags
  // confirm release on GitHub
  // check tocken
  // publish release on GitHub
}

/**
 * #### Prompts
 * @private
 * @param {DATA} data - data object
 * @returns undefined
 */
async function release (data) {
  await preRelease(data)
  if (data.answers.releaseType === 'local') {
    await localRelease(data)
  } else {
    await localRelease(data)
    await remoteRelease(data)
    // guthub publish
  }
}

export { release }

// Changelog file: CHANGELOG.md
// **Full Changelog Diff**: https://github.com/Resultify/initial.css/compare/0.0.3...0.0.4
