import * as TYPES from '#types/types.js' // eslint-disable-line
import chalk from 'chalk'
import semver from 'semver'

/**
 * @ignore
 * @typedef {TYPES.DATA} DATA {@link DATA}
 */

/**
 * #### text object
 * @description text object for cli output messages to keep them in one place
 * @typedef {Object} TEXT
 * @property {function(): string} title - title message
 * @property {function(DATA): string} releaseType - release type message
 * @property {function(DATA): string} possiblereleaseTypes - possible release types message
 * @property {function(DATA): string} possibleNewVersions - possible new versions message
 * @property {function(DATA): string} branch - branch message
 * @property {function(DATA): string} versions - versions message
 * @property {function(DATA): string} currentVersion - current version message
 * @property {function(DATA): string} releaseFiles - release files message
 * @property {function(DATA): string} preCommitInfo - pre commit info message
 * @property {function(DATA): string} branchUpstream - commit info message
 * @property {function(DATA): string} branchUpstreamInfo - branch upstream info message
 * @property {function(DATA,boolean|undefined): string} remoteName - remote name message
 * @property {function(DATA,boolean|undefined): string} remoteUrl - remote url message
 * @property {function(DATA): string} remoteProtocol - remote protocol message
 * @property {function(DATA,boolean|undefined): string} changelogFile - changelog file message
 * @property {function(DATA): string} githubRelease - changelog file message
 */

/** @type {TEXT} */
const text = {}

text.title = () => `${chalk.bold.underline('Ready for a new release:')}`

text.releaseType = (/** @type {DATA} */ data) =>
  `${chalk.grey('Release type:')} ${data.answers.releaseType === 'local' ? chalk.bold.yellow('Local') : chalk.bold.cyan('Remote')}`

text.possiblereleaseTypes = (/** @type {DATA} */ data) =>
  `${chalk.grey('Release type:')} ${chalk.yellow('Local')} ${data.git.isRemote && data.git.branchUpstream ? 'or ' + chalk.bold.cyan('Remote') : ''}`

text.possibleNewVersions = (/** @type {DATA} */ data) => {
  if (data.git.lastTag !== '') {
    const pach = semver.inc(data.git.lastTag, 'patch')
    const minor = semver.inc(data.git.lastTag, 'minor')
    const major = semver.inc(data.git.lastTag, 'major')
    const or = chalk.grey('or')
    return `${chalk.grey('Posible Next Version:')} ${chalk.yellow(pach)} ${or} ${chalk.yellow(minor)} ${or} ${chalk.yellow(major)}`
  } else {
    return `${chalk.grey('Posible Next Version:')} ${chalk.bold.yellow('custom')}`
  }
}

text.branch = (/** @type {DATA} */ data) =>
  `${chalk.grey('Branch:')} ${chalk.bold.blue(data.git.branch)}`

text.versions = (/** @type {DATA} */ data) => {
  if (data.git.lastTag !== '') {
    return `${chalk.grey('Version:')} ${chalk.white(data.git.lastTag)}${chalk.gray('(old) --> ')}${chalk.bold.yellow(data.answers.releaseVersion)}${chalk.grey('(new)')}`
  } else {
    return `${chalk.grey('Version:')} ${chalk.white('undefined')}${chalk.gray('(old) --> ')}${chalk.bold.yellow(data.answers.releaseVersion)}${chalk.grey('(new)')}`
  }
}

text.currentVersion = (/** @type {DATA} */ data) => {
  const title = chalk.grey('Current Version:')
  if (data.git.lastTag !== '') {
    return `${title} ${data.git.lastTag}`
  } else {
    return `${title} no tag found in this branch`
  }
}

text.releaseFiles = (/** @type {DATA} */ data) => {
  if (data.config.files && data.config.files.length > 0) {
    return `${chalk.grey('\nFiles will be updated and included to a release:\n')}${chalk.green(data.config.files)}\n`
  } else {
    return ''
  }
}

text.preCommitInfo = (/** @type {DATA} */ data) => {
  const info = `
- All staged files will be included in the release commit.
- You can manually review all staged files\
${data.config.changelog?.file ? `\n- You can manually review changelog notes by checking the updated ${chalk.green(data.config.changelog?.file)} file.` : ''}
- If you need more files to be included in the release commit, please add them by running ${chalk.green('git add <file>')} command in a separate terminal window.
  `
  return info
}

text.branchUpstream = (/** @type {DATA} */ data) => {
  if (
    data.git.isRemote &&
    data.git.branchUpstream &&
    data.answers.releaseType === 'remote'
  ) {
    return `\n${chalk.grey('Remote branch:')} ${chalk.cyan(data.git.branchUpstream)}`
  } else {
    return ''
  }
}

text.branchUpstreamInfo = (/** @type {DATA} */ data) => {
  if (data.git.isRemote && data.git.branchUpstream) {
    return `${chalk.grey('\nRemote branch:')} ${chalk.cyan(data.git.branchUpstream)}`
  } else {
    return ''
  }
}

text.remoteName = (/** @type {DATA} */ data, /** @type {boolean|undefined} */ show) => {
  if (data.git.isRemote && show) {
    return `${chalk.grey('\nRemote name:')} ${chalk.cyan(data.git.remote?.full_name)}`
  } else {
    return ''
  }
}

text.remoteUrl = (/** @type {DATA} */ data, /** @type {boolean|undefined} */ show) => {
  if (data.git.isRemote && show) {
    return `${chalk.grey('\nRemote URL:')} ${chalk.cyan(data.git.remote?.href)}`
  } else {
    return ''
  }
}

text.remoteProtocol = (/** @type {DATA} */ data) => {
  if (data.git.isRemote) {
    return `${chalk.grey('\nRemote protocol:')} ${chalk.cyan(data.git.remote?.protocol)}`
  } else {
    return ''
  }
}

text.changelogFile = (/** @type {DATA} */ data, /** @type {boolean|undefined} */ show) => {
  const title = chalk.grey('\nChangelog file:')
  if (data.config.changelog && data.config.changelog.file && show) {
    return `${title} ${chalk.green(data.config.changelog.file)}`
  } else {
    return ''
  }
}

text.githubRelease = (/** @type {DATA} */ data) => {
  const title = chalk.grey('\nGenerate GitHub release:')
  if (data.answers.githubRelease) {
    return `${title} ${chalk.yellow('yes')}`
  } else {
    return ''
  }
}

export { text }
