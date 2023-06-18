import * as TYPES from '../config/types.js' // eslint-disable-line
import gitUrlParse from 'git-url-parse'
import { $ } from 'execa'

/**
 * @ignore
 * @typedef {TYPES.GIT_DATA} GIT_DATA {@link GIT_DATA}
 */

/**
 * @summary Check is Git Repo
 * @async
 * @memberof GIT
 * @returns {Promise<boolean|undefined>}
 */
async function isGitRepo () {
  try {
    const isGitRepo = await $`git rev-parse --is-inside-work-tree`
    if (isGitRepo.stdout === 'true') {
      return true
    }
  } catch (error) {
    return false
  }
}

/**
 * @summary Check is Git root
 * @async
 * @memberof GIT
 * @returns {Promise<boolean|undefined>}
 */
async function isGitRoot () {
  try {
    const isGitdir = await $`git rev-parse --git-dir`
    if (/^\.(git)?$/.test(isGitdir.stdout.trim())) {
      return true
    }
  } catch (error) {
    return false
  }
}

/**
 * @summary Check is Git commits
 * @async
 * @memberof GIT
 * @returns {Promise<boolean|undefined>}
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
    console.error(error)
  }
}

/**
 * @summary save git hash
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<string|undefined>}
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
    console.error(error)
  }
}

/**
 * ### Check is Git Staged Files
 * @async
 * @memberof GIT
 * @returns {Promise<boolean>}
 */
async function isGitStagedFiles () {
  try {
    const isGitStagedFiles = await $`git diff --name-only --cached`
    if (isGitStagedFiles.stdout.trim() !== '') {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

/**
 * #### save staged files
 * @async
 * @returns {Promise<Array<string>|undefined>} staged files array or false
 */
async function gitStagedFiles () {
  try {
    const gitStagedFiles = await $`git diff --name-only --cached`
    if (gitStagedFiles.stdout.trim() !== '') {
      return gitStagedFiles.stdout.trim().split('\n')
    }
  } catch (error) {
    console.error(error)
  }
}

/**
 * @summary Check is Git changed files
 * @async
 * @memberof GIT
 * @returns {Promise<boolean|undefined>}
 */
async function isGitChangedFiles () {
  try {
    const isGitChangedFiles = await $`git diff --name-only`
    if (isGitChangedFiles.stdout.trim() !== '') {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error(error)
  }
}

/**
 * #### save changed files
 * @async
 * @returns {Promise<Array<string>|undefined>} staged files array or false
 */
async function gitChangedFiles () {
  try {
    const gitStagedFiles = await $`git diff --name-only`
    if (gitStagedFiles.stdout.trim() !== '') {
      return gitStagedFiles.stdout.trim().split('\n')
    }
  } catch (error) {
    console.error(error)
  }
}

/**
 * @summary save git branch
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
    }
  } catch (error) {
    console.error(error)
  }
  return ''
}

/**
 * @summary Check is Git Remote
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<boolean|undefined>}
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
    console.error(error)
  }
}

/**
 * @summary save git origin remote info
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<Object|undefined>}
 */
async function gitRemoteOrigin () {
  try {
    const gitRemoteOriginUrl = await $`git remote get-url origin`
    const parseGitRemoteOrigin = gitUrlParse(gitRemoteOriginUrl.stdout.trim())
    if (parseGitRemoteOrigin) {
      return parseGitRemoteOrigin
    }
  } catch (error) {
    console.error(error)
  }
}

/**
 * @summary Check is Git tags
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<boolean|undefined>}
 */
async function isGitTags () {
  try {
    const gitTags = await $`git tag -l`
    if (gitTags.stdout.trim() !== '') {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error(error)
  }
}

/**
 * @summary save last git tag
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<string|undefined>}
 */
async function gitLastTag () {
  try {
    const gitLastTag = await $`git describe --abbrev=0 --tags`
    if (gitLastTag.stdout.trim() !== '') {
      return gitLastTag.stdout.trim()
    }
  } catch (error) {
    return undefined
  }
}

/**
 * @summary Check is Git tag in current commit
 * @async
 * @memberof GIT
 * @returns {Promise<boolean|undefined>}
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
    console.error(error)
  }
}

/**
 * #### save git status
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<string|undefined>}
 */
async function gitStatus () {
  try {
    const gitStatus = await $`git status --porcelain -b -u --null`
    // trim and remove \x00
    // eslint-disable-next-line no-control-regex
    const status = gitStatus.stdout.trim().replace(/\x00/g, '')
    if (status !== '') {
      return status
    }
  } catch (error) {
    return ''
  }
}

/**
 * @summary Check is Git branch detached
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<boolean|undefined>}
 */
async function isGitBranchDetached () {
  try {
    const status = await gitStatus()
    if (status) {
      if (/\(no branch\)/.test(status)) {
        return true
      } else {
        return false
      }
    }
  } catch (error) {
    console.error(error)
  }
}

/**
 * @summary Save git branch upstream
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<string|boolean>}
 */
async function gitBranchUpstream () {
  try {
    /** @type {string} */
    const branch = await gitBranch()
    const gitBranchUpstream = await $`git rev-parse --abbrev-ref ${branch}@{u}`
    if (gitBranchUpstream.stdout) {
      return gitBranchUpstream.stdout.trim()
    }
  } catch (error) {
    return false
  }
  return false
}

/**
 * @summary Check is Git branch ahead
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<boolean|undefined>}
 */
async function isGitBrancAhead () {
  try {
    const status = await gitStatus()
    if (status) {
      const isGitBrancAhead = /ahead (\d+)/.exec(status)
      if (isGitBrancAhead !== null) {
        return true
      }
    }
    return false
  } catch (error) {
    console.error(error)
  }
}

/**
 * @summary Check is Git behind
 * @async
 * @private
 * @memberof GIT
 * @returns {Promise<boolean|undefined>}
 */
async function isGitBranchBehind () {
  try {
    const status = await gitStatus()
    if (status) {
      const isGitBranchBehind = /behind (\d+)/.exec(status)
      if (isGitBranchBehind !== null) {
        return true
      }
    }
    return false
  } catch (error) {
    console.error(error)
  }
}

/**
 * @summary Genereta git info
 * @async
 * @memberof GIT
 * @returns {Promise<GIT_DATA>}
 */
async function gitInfo () {
  /** @type {GIT_DATA} */
  const gitData = {}
  try {
    gitData.isGitRepo = await isGitRepo()
    if (gitData.isGitRepo) {
      gitData.isGitRoot = await isGitRoot()
    }

    gitData.isGitCommits = await isGitCommits()
    if (gitData.isGitCommits) {
      gitData.gitHash = await gitHash()
    }

    if (gitData.isGitRepo && gitData.isGitRoot) {
      gitData.isGitStagedFiles = await isGitStagedFiles()
      if (gitData.isGitStagedFiles) {
        gitData.gitStagedFiles = await gitStagedFiles()
      }

      gitData.isGitChangedFiles = await isGitChangedFiles()
      if (gitData.isGitChangedFiles) {
        gitData.gitChangedFiles = await gitChangedFiles()
      }

      gitData.gitBranch = await gitBranch()
      if (gitData.gitBranch) {
        gitData.gitBranchUpstream = await gitBranchUpstream()
        gitData.isGitBranchDetached = await isGitBranchDetached()
        gitData.isGitBrancAhead = await isGitBrancAhead()
        gitData.isGitBranchBehind = await isGitBranchBehind()
      }

      gitData.isGitRemote = await isGitRemote()
      if (gitData.isGitRemote) {
        gitData.gitRemoteOrigin = await gitRemoteOrigin()
      }

      gitData.isGitTags = await isGitTags()
      if (gitData.isGitTags) {
        gitData.gitLastTag = await gitLastTag()
        gitData.isTagInCurrentCommit = await isTagInCurrentCommit()
      }
      gitData.gitStatus = await gitStatus()
    }
  } catch (error) {
    console.error(error)
  }
  return gitData
}

/**
 * #### git add files
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
 * #### git update remote
 * @returns undefined
 */
async function gitUpdateRemote () {
  try {
    await $`git remote update`
  } catch (error) {
    console.error(error)
  }
}

/**
 * #### git commit release
 * @private
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
 * @private
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
 * #### git tag
 * @private
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
 * @private
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


// await checkIfGitRepoAndRoot()
// await checkIfBinExists('git')
// await checkIfBinExists('node')
// await checkIfBinExists('npm')
// await checkNode()

// is commints

// is Git Staged Files (should be empty)
// isTagInCurrentCommit (already tagged - stop)
// isGitTags (ask about tag a new first tag)
// isGitBranchDetached (stop if yes)
// show branch name (if it not master or main add warning)
// show last tag and new tag
// show files to be commited
// show changelog draft
// is Git Changed Files (show shanged files and ask to commit with release)
// commit
// tag
// done

// isOnline
// auth (ssh/tocken)
// remote



// git add CHANGELOG.md file
// git add package.json file
// git add package-lock.json file
// git commit
// git tag
// git update remote
// git push ssh or tocken
// git push tags ssh or tocken

export {
  gitInfo,
  isGitRepo,
  isGitRoot,
  isGitCommits,
  isTagInCurrentCommit,
  gitUpdateRemote,
  isGitStagedFiles,
  isGitChangedFiles,
  gitStagedFiles,
  gitChangedFiles
}
