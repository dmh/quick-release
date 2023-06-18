import * as TYPES from './config/types.js' // eslint-disable-line
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
 * @property {function(DATA): string} stagedFiles - staged files message
 * @property {function(DATA): string} changedFiles - changed files message
 * @property {function(DATA): string} preCommitInfo - pre commit info message
 * @property {function(DATA): string} branchUpstream - commit info message
 * @property {function(DATA): string} branchUpstreamInfo - branch upstream info message
 * @property {function(DATA): string} remoteName - remote name message
 * @property {function(DATA): string} remoteUrl - remote url message
 * @property {function(DATA): string} remoteProtocol - remote protocol message
 * @property {function(DATA): string} changelogFile - changelog file message
 * @property {function(DATA): string} githubToken - github token message
 * @property {function(DATA): string} ssh - ssh message
 * @property {function(DATA): string} online - online message
 * @property {function(): string} confirmToContinue - confirm to continue message
 * @property {function(): string} confirmStagedFiles - confirm staged files message
 * @property {function(DATA): string} confirmGenerateChangelog - confirm generate changelog message
 * @property {function(DATA): string} confirmReleaseCommit - confirm release commit message
 * @property {function(string): string} createChangelogFile - create changelog file message
 * @property {Object} warning - warning message object
 * @property {function(DATA): string} warning.notValidLastVersion - not valid last version message
 * @property {function(): string} warning.notSemVerVersion - not valid new version message
 * @property {function(): string} warning.notValidConfigFiles - not valid config files message
 * @property {function(): string} warning.notValidConfigFilesExt - not valid config files extension message
 * @property {function(): string} warning.notValidConfigClogFile - not valid config changelog file message
 * @property {function(): string} warning.notValidConfigClogLabels - not valid config changelog labels message
 * @property {function(): string} warning.notValidConfigClogBrTitle - not valid config changelog breaking title message
 * @property {function(): string} warning.notValidConfigClogBrLabel - not valid config changelog breaking label message
 * @property {function(): string} warning.stagedFiles - staged files error message
 * @property {Object} error - error message object
 * @property {function(): string} error.noStagedFiles - no staged files error message
 */

/** @type {TEXT} */
const text = {}

text.title = () => `${chalk.bold.underline('Ready for a new release:')}`

text.releaseType = (/** @type {DATA} */ data) =>
  `${chalk.grey('Release type:')} ${data.answers.releaseType === 'local' ? chalk.bold.yellow('Local') : chalk.bold.cyan('Remote')}`

text.possiblereleaseTypes = (/** @type {DATA} */ data) =>
  `${chalk.grey('Release type:')} ${chalk.yellow('Local')} ${data.git.isGitRemote && data.git.gitBranchUpstream ? 'or ' + chalk.bold.cyan('Remote') : ''}`

text.possibleNewVersions = (/** @type {DATA} */ data) => {
  if (data.git.isGitTags && data.git.gitLastTag) {
    const pach = semver.inc(data.git.gitLastTag, 'patch')
    const minor = semver.inc(data.git.gitLastTag, 'minor')
    const major = semver.inc(data.git.gitLastTag, 'major')
    const or = chalk.grey('or')
    return `${chalk.grey('Posible Next Version:')} ${chalk.dim.yellow(pach)} ${or} ${chalk.yellow(minor)} ${or} ${chalk.bold.yellow(major)}`
  } else {
    return `${chalk.grey('Posible Next Version:')} ${chalk.bold.yellow('custom')}`
  }
}

text.branch = (/** @type {DATA} */ data) =>
  `${chalk.grey('Branch:')} ${chalk.bold.blue(data.git.gitBranch)}`

text.versions = (/** @type {DATA} */ data) =>
  `${chalk.grey('Version:')} ${chalk.white(data.git.gitLastTag)}${chalk.gray('(old) --> ')}${chalk.bold.yellow(data.answers.releaseVersion)}${chalk.grey('(new)')}`

text.currentVersion = (/** @type {DATA} */ data) => {
  const title = chalk.grey('Current Version:')
  if (data.git.gitLastTag) {
    return `${title} ${data.git.gitLastTag}`
  } else {
    return `${title} no tag found in this branch`
  }
}

text.releaseFiles = (/** @type {DATA} */ data) => {
  if (data.config.files && data.config.files.length > 0) {
    return `${chalk.grey('\nFiles to be updated and committed as a release part:\n')}${chalk.green(data.config.files)}\n`
  } else {
    return ''
  }
}

text.stagedFiles = (/** @type {DATA} */ data) => {
  if (
    data.git.isGitStagedFiles &&
    data.git.gitStagedFiles !== undefined &&
    data.git.gitStagedFiles.length > 0
  ) {
    return `${chalk.grey('Changes to be committed as a release commit:\n')}${chalk.green(data.git.gitStagedFiles.join(', '))}\n`
  } else {
    return ''
  }
}
text.changedFiles = (/** @type {DATA} */ data) => {
  if (
    data.git.isGitChangedFiles &&
    data.git.gitChangedFiles !== undefined &&
    data.git.gitChangedFiles.length > 0
  ) {
    return `${chalk.grey('Changes not staged for release commit:\n')}${chalk.yellow(data.git.gitChangedFiles.join(', '))}\n`
  } else {
    return ''
  }
}

text.preCommitInfo = (/** @type {DATA} */ data) => {
  const info = `
- All staged files will be included in the release commit.
- You can manually review all staged files diff in a separate terminal window.\
${data.config?.changelog?.file ? `\n- You can manually review changelog notes by checking the updated ${chalk.green(data.config.changelog?.file)} file.` : ''}
- If you need more files to be included in the release commit, please add them by running ${chalk.green('git add <file>')} command in a separate terminal window.
  `
  return info
}

text.branchUpstream = (/** @type {DATA} */ data) => {
  if (
    data.git.isGitRemote &&
    data.git.gitBranchUpstream &&
    data.answers.releaseType === 'remote'
  ) {
    return `${chalk.grey('Remote:')} ${chalk.cyan(data.git.gitBranchUpstream)}`
  } else {
    return ''
  }
}

text.branchUpstreamInfo = (/** @type {DATA} */ data) => {
  if (data.git.isGitRemote && data.git.gitBranchUpstream) {
    return `${chalk.grey('\nRemote:')} ${chalk.cyan(data.git.gitBranchUpstream)}`
  } else {
    return ''
  }
}

text.remoteName = (/** @type {DATA} */ data) => {
  if (data.git.isGitRemote) {
    return `${chalk.grey('\nRemote name:')} ${chalk.cyan(data.git.gitRemoteOrigin?.full_name)}`
  } else {
    return ''
  }
}

text.remoteUrl = (/** @type {DATA} */ data) => {
  if (data.git.isGitRemote) {
    return `${chalk.grey('\nRemote URL:')} ${chalk.cyan(data.git.gitRemoteOrigin?.href)}`
  } else {
    return ''
  }
}

text.remoteProtocol = (/** @type {DATA} */ data) => {
  if (data.git.isGitRemote) {
    return `${chalk.grey('\nRemote protocol:')} ${chalk.cyan(data.git.gitRemoteOrigin?.protocol)}`
  } else {
    return ''
  }
}

text.changelogFile = (/** @type {DATA} */ data) => {
  const title = chalk.grey('\nChangelog file:')
  if (data.config.changelog && data.config.changelog.file) {
    return `${title} ${chalk.green(data.config.changelog.file)}`
  } else {
    return ''
  }
}

// GITHUB_TOKEN
text.githubToken = (/** @type {DATA} */ data) => {
  // if remote
  // const title = chalk.grey('GITHUB_TOKEN:')
  // valid
  // not valid
  // not set
  return '\nGITHUB_TOKEN:'
}

text.ssh = (/** @type {DATA} */ data) => {
  return '\nSSH:'
}

text.online = (/** @type {DATA} */ data) => {
  return '\nOnline:'
}

text.confirmToContinue = () => 'Continue?'
text.confirmStagedFiles = () => 'Manually add staging files to a release commit?'
text.confirmGenerateChangelog = (/** @type {DATA} */ data) => `Confirm changelog generation (${chalk.green(data.config.changelog?.file)})?`
text.confirmReleaseCommit = (/** @type {DATA} */ data) => {
  return `Commit a release? ${chalk.grey(`(git commit -m 'Release ${chalk.dim.yellow(data.answers.releaseVersion)}' & git tag ${chalk.dim.yellow(data.answers.releaseVersion)})`)}`
}

text.createChangelogFile = (/** @type {string} */ file) => {
  return `${chalk.green(file)} file does not exist, create it?`
}

text.warning = {}

text.warning.notValidLastVersion = (/** @type {DATA} */ data) =>
  `${chalk.red('Warning:')} last existing version tag ${data.git.gitLastTag} is not a valid SemVer version. Please create a valid SemVer version for the new release.`

text.warning.notSemVerVersion = () => 'Use semantic versioning (0.0.1, 0.1.0, 1.0.1)'

text.warning.notValidConfigFiles = () =>
  `${chalk.red('Warning:')} not valid quickrelease.json config file list. Make sure this is array of strings.`
text.warning.notValidConfigFilesExt = () =>
  `${chalk.red('Warning:')} some of files in quickrelease.json config file list are not valid json files. Make sure all files are valid json files.`
text.warning.notValidConfigClogFile = () =>
  `${chalk.red('Warning:')} not valid quickrelease.json config changelog file. Make sure this is a string.`
text.warning.notValidConfigClogLabels = () =>
  `${chalk.red('Warning:')} not valid quickrelease.json config changelog labels. Make sure this is array of strings.`
text.warning.notValidConfigClogBrTitle = () =>
  `${chalk.red('Warning:')} not valid quickrelease.json config changelog BreakingChange title. Make sure this is a string.`
text.warning.notValidConfigClogBrLabel = () =>
  `${chalk.red('Warning:')} not valid quickrelease.json config changelog BreakingChange label. Make sure this is a string.`

text.warning.stagedFiles = () => `
${chalk.red('Warning:')} You alredy have files staged for commit.
It is recommended to commit them separately before proceeding with the release.\n`

text.error = {}

text.error.noStagedFiles = () => `
${chalk.red('Error:')} You have no staged files for commit.
Please add files by running ${chalk.green('git add <file>')} command in a separate terminal window.\n`

export { text }
