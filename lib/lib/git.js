import * as TYPES from '#types/types.js' // eslint-disable-line
import gitUrlParse from 'git-url-parse'
import ora from 'ora'
import { $ } from 'execa'

/**
 * @ignore
 * @typedef {TYPES.GIT_DATA} GIT_DATA {@link GIT_DATA}
 * @typedef {TYPES.DATA} DATA {@link DATA}
 */

/**
 * #### Check is Git Repo
 * @async
 * @memberof GIT
 * @returns {Promise<boolean>}
 */
async function isGitRepo () {
  try {
    const isGitRepo = await $`git rev-parse --is-inside-work-tree`
    if (isGitRepo.stdout === 'true') {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

/**
 * #### Check is Git root
 * @async
 * @memberof GIT
 * @returns {Promise<boolean>}
 */
async function isGitRoot () {
  try {
    const isGitdir = await $`git rev-parse --git-dir`
    if (/^\.(git)?$/.test(isGitdir.stdout.trim())) {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

/**
 * #### Check is Git commits
 * @async
 * @memberof GIT
 * @returns {Promise<boolean>}
 */
async function isGitCommits () {
  try {
    const isGitCommits = await $`git rev-parse --all`
    if (isGitCommits.stdout.trim() !== '') {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

/**
 * #### Check is Git tag in current commit
 * @async
 * @memberof GIT
 * @returns {Promise<boolean>}
 */
async function isTagInCurrentCommit () {
  try {
    const isTagInCurrentCommit = await $`git tag --contains`
    if (isTagInCurrentCommit.stdout.trim() !== '') {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

/**
 * #### Check is Git Remote
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<boolean>}
 */
async function isGitRemote () {
  try {
    const isGitRemote = await $`git remote`
    if (isGitRemote.stdout.trim() !== '') {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

/**
 * #### Check is Git branch detached
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<boolean>}
 */
async function isGitBranchDetached () {
  try {
    const status = await gitStatus()
    if (status && /\(no branch\)/.test(status)) {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

/**
 * #### Check is Git branch ahead
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<boolean>}
 */
async function isGitBranchAhead () {
  try {
    const status = await gitStatus()
    if (status && /ahead (\d+)/.exec(status) !== null) {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

/**
 * #### Check is Git behind
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<boolean>}
 */
async function isGitBranchBehind () {
  try {
    const status = await gitStatus()
    if (status && /behind (\d+)/.exec(status) !== null) {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

/**
 * #### save git hash
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<string>}
 */
async function gitHash () {
  try {
    const gitHash = await $`git rev-parse --short HEAD`
    if (gitHash.stdout.trim() !== '') {
      return gitHash.stdout.trim()
    } else {
      return ''
    }
  } catch (error) {
    return ''
  }
}

/**
 * #### save git branch
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<string>}
 */
async function gitBranch () {
  try {
    const gitBranch = await $`git rev-parse --abbrev-ref HEAD`
    if (gitBranch.stdout.trim() !== '') {
      return gitBranch.stdout.trim()
    } else {
      return ''
    }
  } catch (error) {
    return ''
  }
}

/**
 * #### save last git tag
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<string>}
 */
async function gitLastTag () {
  try {
    const gitLastTag = await $`git describe --abbrev=0 --tags`
    if (gitLastTag.stdout.trim() !== '') {
      return gitLastTag.stdout.trim()
    } else {
      return ''
    }
  } catch (error) {
    return ''
  }
}

/**
 * #### save git status
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<string>}
 */
async function gitStatus () {
  try {
    const gitStatus = await $`git status --porcelain -b -u --null`
    // trim and remove \x00
    // eslint-disable-next-line no-control-regex
    const status = gitStatus.stdout.trim().replace(/\x00/g, '')
    if (status !== '') {
      return status
    } else {
      return ''
    }
  } catch (error) {
    return ''
  }
}

/**
 * #### Save git branch upstream
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<string>}
 */
async function gitBranchUpstream () {
  try {
    /** @type {string} */
    const branch = await gitBranch()
    const gitBranchUpstream = await $`git rev-parse --abbrev-ref ${branch}@{u}`
    if (gitBranchUpstream.stdout) {
      return gitBranchUpstream.stdout.trim()
    } else {
      return ''
    }
  } catch (error) {
    return ''
  }
}

/**
 * #### save staged files
 * @async
 * @memberof GIT
 * @returns {Promise<Array<string>>} staged files array or false
 */
async function gitStagedFiles () {
  try {
    const gitStagedFiles = await $`git diff --name-only --cached`
    if (gitStagedFiles.stdout.trim() !== '') {
      return gitStagedFiles.stdout.trim().split('\n')
    } else {
      return []
    }
  } catch (error) {
    return []
  }
}

/**
 * #### save changed files
 * @async
 * @memberof GIT
 * @returns {Promise<Array<string>>} staged files array or false
 */
async function gitChangedFiles () {
  try {
    const gitStagedFiles = await $`git diff --name-only`
    if (gitStagedFiles.stdout.trim() !== '') {
      return gitStagedFiles.stdout.trim().split('\n')
    } else {
      return []
    }
  } catch (error) {
    return []
  }
}

/**
 * #### save git origin remote info
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<Object>}
 */
async function gitRemoteOrigin () {
  try {
    const gitRemoteOriginUrl = await $`git remote get-url origin`
    const parseGitRemoteOrigin = gitUrlParse(gitRemoteOriginUrl.stdout.trim())
    if (parseGitRemoteOrigin) {
      return parseGitRemoteOrigin
    } else {
      return {}
    }
  } catch (error) {
    return {}
  }
}

/**
 * #### Genereta git info
 * @async
 * @memberof GIT
 * @returns {Promise<GIT_DATA>}
 */
async function gitData () {
  /** @type {GIT_DATA} */
  const git = {
    isGitRepo: false,
    isGitRoot: false,
    isGitCommits: false,
    isTagInCurrentCommit: false,
    isGitRemote: false,
    isGitBranchDetached: false,
    isGitBranchAhead: false,
    isGitBranchBehind: false,
    gitHash: '',
    gitBranch: '',
    gitLastTag: '',
    gitStatus: '',
    gitBranchUpstream: '',
    gitStagedFiles: [],
    gitChangedFiles: [],
    gitRemoteOrigin: {}
  }

  git.isGitRepo = await isGitRepo()
  if (git.isGitRepo) {
    git.isGitRoot = await isGitRoot()
  }
  if (git.isGitRepo && git.isGitRoot) {
    git.isGitCommits = await isGitCommits()
    git.isTagInCurrentCommit = await isTagInCurrentCommit()

    if (git.isGitCommits && !git.isTagInCurrentCommit) {
      git.isGitRemote = await isGitRemote()
      git.gitHash = await gitHash()
      git.gitBranch = await gitBranch()
      git.gitLastTag = await gitLastTag()
      git.gitStatus = await gitStatus()
      git.gitBranchUpstream = await gitBranchUpstream()
      git.gitStagedFiles = await gitStagedFiles()
      git.gitChangedFiles = await gitChangedFiles()

      if (git.isGitRemote) {
        git.gitRemoteOrigin = await gitRemoteOrigin()
        git.isGitBranchDetached = await isGitBranchDetached()
        git.isGitBranchAhead = await isGitBranchAhead()
        git.isGitBranchBehind = await isGitBranchBehind()
      }
    }
  }
  return git
}

/**
 * #### git remote update
 * @async
 * @private
 * @memberof GIT
 * @returns undefined
 */
async function gitRemoteUpdate () {
  const spinner = ora('Sync remote repo with local').start()
  try {
    await $`git remote update`
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    console.error(error)
  }
}

/**
 * #### update git remote data
 * @private
 * @async
 * @param {DATA} data - data object
 * @returns {Promise<DATA>} local data
 */
async function gitRemoteDataUpdate (data) {
  if (data.git.isGitRemote) {
    await gitRemoteUpdate()
    data.git.isGitBranchDetached = await isGitBranchDetached()
    data.git.isGitBranchAhead = await isGitBranchAhead()
    data.git.isGitBranchBehind = await isGitBranchBehind()
  }
  return data
}

/**
 * #### git add files
 * @async
 * @memberof GIT
 * @param {Array<string>} files - files to git add
 * @returns undefined
 */
async function gitAdd (files) {
  try {
    if (files.length > 0) {
      await $`git add ${files.join(' ')}`
    }
  } catch (error) {
    console.error(error)
  }
}

/**
 * #### git commit release
 * @async
 * @memberof GIT
 * @param {string} msg - commit message
 * @returns undefined
 */
async function gitCommit (msg) {
  try {
    await $`git commit -m ${msg}`
  } catch (error) {
    console.error(error)
  }
}

/**
 * #### git push to remote
 * @async
 * @memberof GIT
 * @param {string} remote - remote name
 * @returns undefined
 */
async function gitPush (remote) {
  try {
    await $`git push ${remote}`
  } catch (error) {
    console.error(error)
  }
}

/**
 * #### git push dry-run to remote
 * @async
 * @memberof GIT
 * @param {string} remote - remote name
 * @returns undefined
 */
async function gitPushDryRun (remote) {
  try {
    await $`git push --dry-run ${remote}`
  } catch (error) {
    console.error(error)
  }
}

/**
 * #### git tag
 * @async
 * @memberof GIT
 * @param {string} tag - tag
 * @returns undefined
 */
async function gitTag (tag) {
  try {
    await $`git tag ${tag}`
  } catch (error) {
    console.error(error)
  }
}

/**
 * #### git push tag to remote
 * @async
 * @memberof GIT
 * @param {string} remote - remote name
 * @returns undefined
 */
async function gitPushTag (remote) {
  try {
    await $`git push ${remote} --tags`
  } catch (error) {
    console.error(error)
  }
}

/**
 * #### git log
 * parse git log and use it to generate changelog
 * @async
 * @memberof GIT
 * @param {DATA} data - data object
 * @returns {Promise<string[]>} log array
 */
async function gitLog (data) {
  let lastTag = 'HEAD'
  if (data.git.gitLastTag !== '') {
    lastTag = `${data.git.gitLastTag}..HEAD`
  }
  /** @type {Array<string>} */
  let log = []
  try {
    const { stdout } = await $`git log ${lastTag} --format=%s#@an%an@#hash%h`
    if (stdout !== '') {
      log = stdout.split('\n')
    }
    return log
  } catch (error) {
    return log
  }
}

export {
  isGitRepo,
  isGitRoot,
  isGitCommits,
  isTagInCurrentCommit,
  gitStagedFiles,
  gitChangedFiles,
  gitData,
  gitRemoteDataUpdate,
  gitAdd,
  gitCommit,
  gitPush,
  gitPushDryRun,
  gitTag,
  gitPushTag,
  gitLog
}
