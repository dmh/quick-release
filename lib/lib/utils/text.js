import * as TYPES from '../config/types.js' // eslint-disable-line
import chalk from 'chalk'
import semver from 'semver'

/**
 * @ignore
 * @typedef {TYPES.DATA} DATA {@link DATA}
 * @typedef {TYPES.CLI_PACKAGE_JSON} CLI_PACKAGE_JSON {@link CLI_PACKAGE_JSON}
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
 * @property {function(): string} confirmToContinue - confirm to continue message
 * @property {function(): string} confirmStagedFiles - confirm staged files message
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
 * @property {function(): string} warning.notMasterMain - not master or main branch message
 * @property {function(): string} warning.stagedFiles - staged files warning message
 * @property {function(DATA): string} warning.noSshRemote - no ssh remote warning message
 * @property {Object} error - error message object
 * @property {function(): string} error.noStagedFiles - no staged files error message
 * @property {function(CLI_PACKAGE_JSON["engines"]): string} error.checkNode - check node versiot error message
 * @property {function(string): string} error.checkIfBinExists - check if bin exists error message
 * @property {function(): string} error.isGitRepo - check if git repo error message
 * @property {function(): string} error.isGitRoot - check if git root error message
 * @property {function(): string} error.checkIfCommitMessageExists - check if commit message exists error message
 * @property {function(): string} error.isTagInCurrentCommit - is tag in current commit error message
 * @property {function(DATA): string} error.isGitBranchBehind - is git branch behind error message
 * @property {function(DATA): string} error.isGitBrancAhead - is git branch ahead error message
 * @property {function(): string} error.isGitBranchDetached - is git branch detached error message
 * @property {function(string): string} error.checkSshConnection - test github ssh connection error message
 * @property {function(): string} error.checkSshPermissions - test github ssh connection error message
 * @property {function(): string} error.isGithubTokenValid - is github token valid error message
 * @property {function(): string} error.checkIsOnline - is online error message
 * @property {function(): string} error.notValidConfigFile - not valid config file error message
 */

/** @type {TEXT} */
const text = {}

text.title = () => `${chalk.bold.underline('Ready for a new release:')}`

text.releaseType = (/** @type {DATA} */ data) =>
  `${chalk.grey('Release type:')} ${data.answers.releaseType === 'local' ? chalk.bold.yellow('Local') : chalk.bold.cyan('Remote')}`

text.possiblereleaseTypes = (/** @type {DATA} */ data) =>
  `${chalk.grey('Release type:')} ${chalk.yellow('Local')} ${data.git.isGitRemote && data.git.gitBranchUpstream ? 'or ' + chalk.bold.cyan('Remote') : ''}`

text.possibleNewVersions = (/** @type {DATA} */ data) => {
  if (data.git.gitLastTag !== '') {
    const pach = semver.inc(data.git.gitLastTag, 'patch')
    const minor = semver.inc(data.git.gitLastTag, 'minor')
    const major = semver.inc(data.git.gitLastTag, 'major')
    const or = chalk.grey('or')
    return `${chalk.grey('Posible Next Version:')} ${chalk.yellow(pach)} ${or} ${chalk.yellow(minor)} ${or} ${chalk.yellow(major)}`
  } else {
    return `${chalk.grey('Posible Next Version:')} ${chalk.bold.yellow('custom')}`
  }
}

text.branch = (/** @type {DATA} */ data) =>
  `${chalk.grey('Branch:')} ${chalk.bold.blue(data.git.gitBranch)}`

text.versions = (/** @type {DATA} */ data) => {
  if (data.git.gitLastTag !== '') {
    return `${chalk.grey('Version:')} ${chalk.white(data.git.gitLastTag)}${chalk.gray('(old) --> ')}${chalk.bold.yellow(data.answers.releaseVersion)}${chalk.grey('(new)')}`
  } else {
    return `${chalk.grey('Version:')} ${chalk.white('undefined')}${chalk.gray('(old) --> ')}${chalk.bold.yellow(data.answers.releaseVersion)}${chalk.grey('(new)')}`
  }
}

text.currentVersion = (/** @type {DATA} */ data) => {
  const title = chalk.grey('Current Version:')
  if (data.git.gitLastTag !== '') {
    return `${title} ${data.git.gitLastTag}`
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

text.stagedFiles = (/** @type {DATA} */ data) => {
  if (data.git.gitStagedFiles.length > 0) {
    return `${chalk.grey('Changes to be committed as a release commit:\n')}${chalk.green(data.git.gitStagedFiles.join(', '))}\n`
  } else {
    return ''
  }
}
text.changedFiles = (/** @type {DATA} */ data) => {
  if (data.git.gitChangedFiles.length > 0) {
    return `${chalk.grey('Changes not staged for release commit:\n')}${chalk.yellow(data.git.gitChangedFiles.join(', '))}\n`
  } else {
    return ''
  }
}

text.preCommitInfo = (/** @type {DATA} */ data) => {
  const info = `
- All staged files will be included in the release commit.
- You can manually review all staged files diff in a separate terminal window.\
${data.config.changelog?.file ? `\n- You can manually review changelog notes by checking the updated ${chalk.green(data.config.changelog?.file)} file.` : ''}
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
    return `\n${chalk.grey('Remote:')} ${chalk.cyan(data.git.gitBranchUpstream)}`
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

text.confirmToContinue = () => 'Continue?'
text.confirmStagedFiles = () => 'Manually add staging files to a release commit?'
text.confirmReleaseCommit = (/** @type {DATA} */ data) => {
  return `Commit a release? ${chalk.grey(`(git commit -m 'Release ${chalk.dim.yellow(data.answers.releaseVersion)}' & git tag ${chalk.dim.yellow(data.answers.releaseVersion)})`)}`
}

text.createChangelogFile = (/** @type {string} */ file) => {
  return `${chalk.green(file)} file does not exist, create it?`
}

text.warning = {}

text.warning.notValidLastVersion = (/** @type {DATA} */ data) =>
  `${chalk.red('Warning:')} last existing version tag ${data.git.gitLastTag} is not a valid SemVer version. Please create a valid SemVer version for the new release.\n`

text.warning.notSemVerVersion = () => 'Use semantic versioning (0.0.1, 0.1.0, 1.0.1)'

text.warning.notValidConfigFiles = () =>
  `${chalk.red('Warning:')} not valid quickrelease.json config file list. Make sure this is array of strings.\n`
text.warning.notValidConfigFilesExt = () =>
  `${chalk.red('Warning:')} some of files in quickrelease.json config file list are not valid json files. Make sure all files are valid json files.\n`
text.warning.notValidConfigClogFile = () =>
  `${chalk.red('Warning:')} not valid quickrelease.json config changelog file. Make sure this is a string.\n`
text.warning.notValidConfigClogLabels = () =>
  `${chalk.red('Warning:')} not valid quickrelease.json config changelog labels. Make sure this is array of strings.\n`
text.warning.notValidConfigClogBrTitle = () =>
  `${chalk.red('Warning:')} not valid quickrelease.json config changelog BreakingChange title. Make sure this is a string.\n`
text.warning.notValidConfigClogBrLabel = () =>
  `${chalk.red('Warning:')} not valid quickrelease.json config changelog BreakingChange label. Make sure this is a string.\n`
text.warning.notMasterMain = () =>
`${chalk.red('Warning:')} you are not on ${chalk.blue('master')} or ${chalk.blue('main')} branch\n`

text.warning.stagedFiles = () =>
`${chalk.red('Warning:')} You alredy have files staged for commit.
It is recommended to commit them separately before proceeding with the release.\n`

text.warning.noSshRemote = (/** @type {DATA} */ data) =>
`${chalk.red('Warning:')} You are using non-SSH remote ${chalk.cyan(data.git.gitRemoteOrigin.href)}
Remote release type only works with SSH remote URLs.\n`

text.error = {}

text.error.checkNode = (/** @type {CLI_PACKAGE_JSON["engines"]} */ engines) =>
  `${chalk.bold.red('Error:')} Required node version ${chalk.yellow(engines.node)} not satisfied with current version ${process.version}\n`

text.error.checkIfBinExists = (/** @type {string} */ bin) =>
  `${chalk.bold.red('Error:')} This script requires ${chalk.yellow(bin)} to be instaled\n`

text.error.isGitRepo = () =>
  `${chalk.bold.red('Error:')} This script requires to be run in a git repository\n`
text.error.isGitRoot = () =>
  `${chalk.bold.red('Error:')} This script requires to be run in the root of a git repository\n`

text.error.checkIfCommitMessageExists = () =>
  `${chalk.bold.red('Error:')} This script requires to be run in a git repository with at least one commit\n`

text.error.isTagInCurrentCommit = () =>
  `${chalk.bold.red('Error:')} Your current commit is already marked as a tagged release, you need at least one commit between releases\n`

text.error.isGitBranchBehind = (/** @type {DATA} */ data) =>
  `${chalk.bold.red('Error:')} Your branch is behind ${chalk.cyan(data.git.gitBranchUpstream)}\n`
text.error.isGitBrancAhead = (/** @type {DATA} */ data) =>
  `${chalk.bold.red('Error:')} Your branch is ahead ${chalk.cyan(data.git.gitBranchUpstream)}\n`
text.error.isGitBranchDetached = () =>
  `${chalk.bold.red('Error:')} Your branch is detached\n`

text.error.checkSshConnection = (/** @type {string} */ serverUrl) =>
`${chalk.bold.red('Error:')} Host key verification failed.
SSH connection to ${chalk.cyan(serverUrl)} failed.
Make sure you've set up your SSH key and added it to your account.\n`

text.error.checkSshPermissions = () =>
`${chalk.bold.red('Error:')} Permission to current repo denied to your user.
To fix this, the owner of the repository needs to add your account as a collaborator on the repository or to a team that has write access to the repository.\n`

text.error.noStagedFiles = () =>
`\n${chalk.bold.red('Error:')} You have no staged files for commit.
Please add files by running ${chalk.green('git add <file>')} command in a separate terminal window.\n`

text.error.isGithubTokenValid = () =>
  `${chalk.bold.red('Error:')} GITHUB_TOKEN not valid\n`

text.error.checkIsOnline = () =>
  `${chalk.bold.red('Error:')} No Internet connection\n`

text.error.notValidConfigFile = () =>
  `${chalk.bold.red('Error:')} ${chalk.green('quickrelease.json')} config file empty or not valid\n`

export { text }
