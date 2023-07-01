/**
 * #### commit message object
 * @typedef {Object} COMMIT_MESSAGE
 * @property {string} [commit] - commit
 * @property {string} prefix - commit message prefix
 * @property {string} message - commit message
 * @property {string} hash - commit message hash
 * @property {string} name - commit message author name
 * @property {string} [date] - commit message date
 */

/**
 * #### git data object
 * @typedef {Object} GIT_DATA
 * @property {boolean} isRepo - is git repo in current directory
 * @property {boolean} isRoot - is git root in current directory
 * @property {boolean} isCommits - is git commits
 * @property {boolean} isTagInCurrentCommit - is git tag in current commit
 * @property {boolean} isRemote - is git remote
 * @property {boolean} isBranchDetached - is git branch detached
 * @property {boolean} isBranchAhead - is git branch ahead
 * @property {boolean} isBranchBehind - is git branch behind
 * @property {string} hash - git hash
 * @property {string} branch - git branch
 * @property {string} lastTag - git last tag
 * @property {string} status - git status
 * @property {Array<COMMIT_MESSAGE>} log - git log
 * @property {string} branchUpstream - git branch upstream
 * @property {Array<string>} stagedFiles - is git staged files
 * @property {Array<string>} changedFiles - is git staged files
 * @property {Object} remote - git remote origin
 * @property {string} [remote.protocol] - git remote origin protocol
 * @property {string} [remote.href] - git remote origin href
 * @property {string} [remote.full_name] - git remote origin full_name
 * @property {string} [remote.host] - git remote origin host
 * @property {string} [remote.owner] - git remote origin owner
 * @property {string} [remote.name] - git remote origin name
 */

/**
 * #### prompts answers object
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
 * @property {Array<string>} [githubReleaseTitles] - github release titles
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
 * @property {Object} env - node env
 * @property {string} [env.GITHUB_TOKEN] - github token
 * @property {Object} system - system info
 * @property {string} system.node - system node version
 * @property {string} system.npm - system npm version
 * @property {string} system.git - system git version
 * @property {QUICKRELEASE_CONFIG} config - quick-release config
 * @property {GIT_DATA} git - git info
 * @property {PROMPTS_ANSWERS} answers - prompt answers
 * @property {Object} changelog - changelog data
 * @property {Array<COMMIT_MESSAGE>} changelog.generic - changelog generic commits data
 * @property {Array<COMMIT_MESSAGE>} changelog.breaking - changelog breaking commits data
 * @property {string} changelog.draft - changelog draft
 * @property {Object} github - GitHub data
 * @property {boolean} github.token - GitHub token
 * @property {Object} github.commits - GitHub commits data
 * @property {Array<COMMIT_MESSAGE>} github.commits.all - all GitHub commits
 * @property {Array<COMMIT_MESSAGE>} github.commits.generic - GitHub generic commits
 * @property {Array<COMMIT_MESSAGE>} github.commits.breaking - GitHub breaking commits
 * @property {string} github.releaseNotes - GitHub release notes
 */

/**
 * #### json formating info
 * @typedef {Object} JSON_FORMATING_INFO
 * @property {string|undefined|number} space - json space size
 * @property {string} newline - json newline
 */

/**
 * #### json file data with formating info
 * @typedef {Object} JSON_WITH_FORMATING
 * @property {any} data - json data
 * @property {JSON_FORMATING_INFO} format - json formating info
 */

export default {}
