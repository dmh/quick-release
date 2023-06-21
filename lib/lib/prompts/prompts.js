import * as TYPES from '../config/types.js' // eslint-disable-line
import { select, input, confirm } from '@inquirer/prompts'
import semver from 'semver'
import { text } from '../utils/text.js'
import { gitStagedFiles } from '../git/git.js'

/**
 * @ignore
 * @typedef {TYPES.DATA} DATA {@link DATA}
 * @typedef {TYPES.PROMPTS_ANSWERS} PROMPTS_ANSWERS {@link PROMPTS_ANSWERS}
 */

/**
 * #### Select release type
 * @async
 * @memberof PROMPTS
 * @param {DATA} data - data object
 * @returns {Promise<string>} - release type
 */
async function selectReleaseType (data) {
  function isRemote () {
    if (data.git.isGitRemote === false || data.git.gitBranchUpstream === '') {
      return { disabled: '(not available) - No remote repository, branch upstream or permission' }
    }
  }
  const answer = await select({
    message: 'Release type:',
    choices: [
      {
        name: 'Local',
        value: 'local',
        description: 'Local git release with new tag and generated changelog on demand.'
      },
      {
        name: 'Remote',
        value: 'remote',
        description: 'Remote release is a local release pushed to a remote repository with Github release notes generated on demand.',
        ...isRemote()
      }
    ]
  })
  return answer
}

/**
 * #### Select a new release version
 * @memberof PROMPTS
 * @async
 * @param {DATA} data - data object
 * @returns {Promise<string>} - release version
 */
async function selectReleaseVersion (data) {
  let version = []
  if (data.git.gitLastTag !== '') {
    if (semver.valid(data.git.gitLastTag) === null) {
      text.warning.notValidLastVersion(data)
      return await customReleaseVersion(data)
    }
    version = [
      {
        name: semver.inc(data.git.gitLastTag, 'patch') ?? '',
        value: semver.inc(data.git.gitLastTag, 'patch') ?? '',
        description: 'Patch release, bug fixes.'
      },
      {
        name: semver.inc(data.git.gitLastTag, 'minor') ?? '',
        value: semver.inc(data.git.gitLastTag, 'minor') ?? '',
        description: 'Minor release, new features.'
      },
      {
        name: semver.inc(data.git.gitLastTag, 'major') ?? '',
        value: semver.inc(data.git.gitLastTag, 'major') ?? '',
        description: 'Major release, breaking changes.'
      }
    ]
    const answer = await select({
      message: 'New version:',
      choices: [
        ...version
      ]
    })
    return answer
  } else {
    return await customReleaseVersion(data)
  }
}

/**
 * #### ask if create a changelog file
 * @memberof PROMPTS
 * @async
 * @param {string} file - file name
 * @returns {Promise<boolean>}
 */
async function createChangelogFile (file) {
  const answer = await confirm({
    message: text.createChangelogFile(file),
    default: true
  })
  return answer
}

/**
 * #### check if staged files are available
 * @memberof PROMPTS
 * @async
 * @param {Array<string>} staged - if staged files
 * @param {DATA} data - data object
 * @returns undefined
 */
async function checkStagedFiles (staged, data) {
  if (staged.length === 0) {
    const answer = await confirm({
      message: text.confirmStagedFiles(),
      default: true
    })
    if (answer === true) {
      const newStaged = await gitStagedFiles()
      if (newStaged.length !== 0) {
        data.git.gitStagedFiles = newStaged
        return
      } else {
        console.log(text.error.noStagedFiles())
      }
      await checkStagedFiles(staged, data)
    } else {
      process.exit(0)
    }
  }
}

/**
 * #### Custom release version
 * @memberof PROMPTS
 * @param {DATA} data - data object
 * @returns {Promise<string>} portal name|names
 */
async function customReleaseVersion (data) {
  const answer = await input({
    message: 'New version:',
    validate: (value) => {
      if (semver.valid(value) === null) {
        return text.warning.notSemVerVersion()
      }
      return true
    }
  })
  return answer
}

/**
 * #### Confirm to continue
 * @async
 * @memberof PROMPTS
 * @returns {Promise<boolean>} - true if confirmed
 */
async function confirmToContinue () {
  const answer = await confirm({
    message: text.confirmToContinue(),
    default: true
  })
  if (answer === false) {
    process.exit(0)
  }
  return answer
}

/**
 * #### Confirm changelog generation
 * @async
 * @memberof PROMPTS
 * @param {DATA} data - data object
 * @returns {Promise<boolean>} - true if confirmed
 */
async function confirmGenerateChangelog (data) {
  const answer = await confirm({
    message: 'Confirm changelog generation?',
    default: true
  })
  return answer
}

/**
 * #### Confirm release commit
 * @memberof PROMPTS
 * @async
 * @param {DATA} data - data object
 * @returns {Promise<boolean>} - true if confirmed
 */
async function confirmReleaseCommit (data) {
  const answer = await confirm({
    message: text.confirmReleaseCommit(data),
    default: true
  })
  return answer
}

/**
 * #### Ask if GitHub release notes should be generated
 * @memberof PROMPTS
 * @async
 * @returns {Promise<boolean>} - true if confirmed
 */
async function confirmGenerateReleaseNotes () {
  const answer = await confirm({
    message: 'Confirm Github release notes generation',
    default: true
  })
  return answer
}

/**
 * #### Ask if the release should be pushed to the remote repository
 * @memberof PROMPTS
 * @async
 * @param {DATA} data - data object
 * @returns {Promise<boolean>} - true if confirmed
 */

export {
  confirmToContinue,
  confirmGenerateChangelog,
  confirmReleaseCommit,
  selectReleaseVersion,
  selectReleaseType,
  createChangelogFile,
  checkStagedFiles,
  confirmGenerateReleaseNotes
}
