/**
 * #### git data object
 * @typedef {Object} GIT_DATA
 * @property {boolean} [isGitRepo] - is git repo in current directory
 * @property {boolean} [isGitRoot] - is git root in current directory
 * @property {boolean} isGitStagedFiles - is git staged files
 * @property {Array<string>} [gitStagedFiles] - is git staged files
 * @property {boolean} [isGitChangedFiles] - is git changed files
 * @property {Array<string>} [gitChangedFiles] - is git staged files
 * @property {boolean} [isGitRemote] - is git remote
 * @property {Object} [gitRemoteOrigin] - git remote origin
 * @property {Object} [gitRemoteOrigin.protocol] - git remote origin protocol
 * @property {string} [gitRemoteOrigin.href] - git remote origin href
 * @property {string} [gitRemoteOrigin.full_name] - git remote origin full_name
 * @property {string} [gitBranch] - git branch
 * @property {string|boolean} [gitBranchUpstream] - git branch upstream
 * @property {boolean} [isGitBranchDetached] - is git branch detached
 * @property {boolean} [isGitBrancAhead] - is git branch ahead
 * @property {boolean} [isGitBranchBehind] - is git branch behind
 * @property {boolean} [isGitCommits] - is git commits
 * @property {string} [gitHash] - git hash
 * @property {boolean} [isGitTags] - is git tags
 * @property {string} [gitLastTag] - git last tag
 * @property {boolean} [isTagInCurrentCommit] - is git tag in current commit
 * @property {string} [gitStatus] - git status
 */

/**
 * #### prompts answers object
 * @description
 * @typedef {Object} PROMPTS_ANSWERS
 * @property {string} [releaseType] - release type
 * @property {string} [releaseVersion] - release version
 * @property {boolean} [changelog] - release version
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
 * @property {Array<string>} [files=['package.json', package-lock.json]] - additional files to parse and include into release process
 * @property {Object} [changelog] - changelog config
 * @property {string} [changelog.file='CHANGELOG.md'] - changelog file name, [CHANGELOG.md] by default
 * @property {Array<string>} [changelog.labels=['[FEATURE]', '[DOC]', '[TEST]', '[UPDATE]', '[BUGFIX]', '[TASK]']] - git commit labels to use for buildin changelog
 * @property {string} [changelog.breakingChangeTitle='## Breaking Changes'] - title for breaking changes section in changelog. [## Breaking changes] by default
 * @property {string} [changelog.breakingChangeLabel='[!!!]'] - label to indicate breaking changes in git log. [!!!] by default
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
 * @property {Object} github - github info
 * @property {PROMPTS_ANSWERS} answers - prompt answers
 */

/**
 * #### args variants
 * @typedef {Object} ARGS
 * @property {boolean} info
 * @property {boolean} help
 * @property {boolean} debug
 * @property {boolean} version
 */

export default {}
