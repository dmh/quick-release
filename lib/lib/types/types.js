/**
 * #### git data object
 * @typedef {Object} GIT_DATA
 * @property {boolean} isGitRepo - is git repo in current directory
 * @property {boolean} isGitRoot - is git root in current directory
 * @property {boolean} isGitCommits - is git commits
 * @property {boolean} isTagInCurrentCommit - is git tag in current commit
 * @property {boolean} isGitRemote - is git remote
 * @property {boolean} isGitBranchDetached - is git branch detached
 * @property {boolean} isGitBranchAhead - is git branch ahead
 * @property {boolean} isGitBranchBehind - is git branch behind
 * @property {string} gitHash - git hash
 * @property {string} gitBranch - git branch
 * @property {string} gitLastTag - git last tag
 * @property {string} gitStatus - git status
 * @property {string} gitBranchUpstream - git branch upstream
 * @property {Array<string>} gitStagedFiles - is git staged files
 * @property {Array<string>} gitChangedFiles - is git staged files
 * @property {Object} gitRemoteOrigin - git remote origin
 * @property {Object} [gitRemoteOrigin.protocol] - git remote origin protocol
 * @property {string} [gitRemoteOrigin.href] - git remote origin href
 * @property {string} [gitRemoteOrigin.full_name] - git remote origin full_name
 * @property {string} [gitRemoteOrigin.host] - git remote origin host
 */

/**
 * #### prompts answers object
 * @description
 * @typedef {Object} PROMPTS_ANSWERS
 * @property {string} [releaseType] - release type
 * @property {string} [releaseVersion] - release version
 * @property {boolean} [changelog] - release version
 * @property {boolean} [githubRelease] - github release
 */

/**
 * #### cli package.json object
 * @typedef {Object} CLI_PACKAGE_JSON
 * @property {string} version - package version
 * @property {Object} engines - engines
 * @property {string} engines.node - node version
 * @property {string} engines.npm - npm version
 */

/**
 * #### quickrelease.json config object
 * @typedef {Object} QUICKRELEASE_CONFIG
 * @property {Array<string>} files=package.json,package-lock.json - additional files to parse and include into release process
 * @property {Object} changelog - changelog config
 * @property {string} changelog.file=CHANGELOG.md - changelog file name, `CHANGELOG.md` by default
 * @property {Array<string>} [changelog.labels] - git commit labels to use for buildin changelog
 * @property {string} [changelog.breakingLabel] - label to indicate breaking changes in git log.
 */

/**
 * #### data object
 * @typedef {Object} DATA
 * @property {CLI_PACKAGE_JSON} cli - cli info
 * @property {Object} cwd - current working directory
 * @property {string} cwd.path - current working directory path
 * @property {string} cwd.dir - current working directory dir
 * @property {string} cwd.base - current working directory base
 * @property {string} cwd.name - current working directory name
 * @property {Object|undefined|boolean} env - node env
 * @property {Object} system - system info
 * @property {string} system.node - system node version
 * @property {string} system.npm - system npm version
 * @property {string} system.git - system git version
 * @property {QUICKRELEASE_CONFIG} config - quick-release config
 * @property {GIT_DATA} git - git info
 * @property {PROMPTS_ANSWERS} answers - prompt answers
 * @property {Object} changelog - changelog data
 * @property {Array<Object>} changelog.generic - changelog generic commits data
 * @property {Array<Object>} changelog.breaking - changelog breaking commits data
 * @property {string} changelogDraft - changelog draft
 */

/**
 * #### args variants
 * @typedef {Object} ARGS
 * @property {boolean} info
 * @property {boolean} help
 * @property {boolean} debug
 * @property {boolean} version
 */

/**
 * #### json file data with formating info
 * @typedef {Object} JSON_WITH_FORMATING
 * @property {any} data - json data
 * @property {Object} format - json formating info
 * @property {string|undefined|number} format.space - json space size
 * @property {string} format.newline - json newline
 */

export default {}
