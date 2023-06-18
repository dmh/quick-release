import * as TYPES from '../config/types.js' // eslint-disable-line
import { select, input, confirm } from '@inquirer/prompts'
import semver from 'semver'
// import chalk from 'chalk'
import { text } from '../text.js'
import { isGitStagedFiles, gitStagedFiles } from '../git/git.js'
import chalk from 'chalk'

/**
 * @ignore
 * @typedef {TYPES.DATA} DATA {@link DATA}
 * @typedef {TYPES.PROMPTS_ANSWERS} PROMPTS_ANSWERS {@link PROMPTS_ANSWERS}
 */

/**
 * #### Select release type
//  * @async
 * @param {DATA} data - data object
 * @returns {Promise<string>} - release type
 */
async function selectReleaseType (data) {
  function isRemote () {
    if (data.git.isGitRemote === false || data.git.gitBranchUpstream === false) {
      return { disabled: '(not available) - No remote repository connected' }
    }
  }
  const answer = await select({
    message: 'Release type:',
    choices: [
      {
        name: 'Local',
        value: 'local',
        description: 'Local git release with a commit of the required files, generated changelog, release message and a new tag.'
      },
      {
        name: 'Remote',
        value: 'remote',
        description: 'Remote release type includes a local release, pushing to a remote repository with new tags and generating a release note on GitHub based on the changelog.',
        ...isRemote()
      }
    ]
  })
  return answer
}

/**
 * #### Select a new release version
 * @async
 * @private
 * @param {DATA} data - data object
 * @returns {Promise<string>} - release version
 */
// async function selectNewReleaseVersion (data) {
//   if (data.git.gitLastTag !== undefined && semver.valid(data.git.gitLastTag) !== null) {
//   // const version = [
//   //   {
//   //     name: semver.inc(data.git.gitLastTag, 'patch') ?? '',
//   //     value: semver.inc(data.git.gitLastTag, 'patch') ?? '',
//   //     description: 'Patch release, bug fixes.'
//   //   },
//   //   {
//   //     name: semver.inc(data.git.gitLastTag, 'minor') ?? '',
//   //     value: semver.inc(data.git.gitLastTag, 'minor') ?? '',
//   //     description: 'Minor release, new features.'
//   //   },
//   //   {
//   //     name: semver.inc(data.git.gitLastTag, 'major') ?? '',
//   //     value: semver.inc(data.git.gitLastTag, 'major') ?? '',
//   //     description: 'Major release, breaking changes.'
//   //   }
//   // ]
//   const answer = await select({
//     message: 'New version:',
//     choices: [
//       {
//         name: semver.inc(data.git.gitLastTag, 'patch') ?? '',
//         value: semver.inc(data.git.gitLastTag, 'patch') ?? '',
//         description: 'Patch release, bug fixes.'
//       },
//       {
//         name: semver.inc(data.git.gitLastTag, 'minor') ?? '',
//         value: semver.inc(data.git.gitLastTag, 'minor') ?? '',
//         description: 'Minor release, new features.'
//       },
//       {
//         name: semver.inc(data.git.gitLastTag, 'major') ?? '',
//         value: semver.inc(data.git.gitLastTag, 'major') ?? '',
//         description: 'Major release, breaking changes.'
//       }
//     ]
//   })
//   return answer
// }

/**
 * #### Select a new release version
 * @async
 * @param {DATA} data - data object
 * @returns {Promise<string>} - release version
 */
async function selectReleaseVersion (data) {
  let version = []
  if (data.git.gitLastTag !== undefined) {
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
 * @private
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
 * @private
 * @param {boolean} staged - if staged files
 * @param {DATA} data - data object
 * @returns undefined
 */
async function checkStagedFiles (staged, data) {
  if (staged === false) {
    const answer = await confirm({
      message: text.confirmStagedFiles(),
      default: true
    })
    if (answer === true) {
      const isStaged = await isGitStagedFiles()
      if (isStaged === true) {
        data.git.gitStagedFiles = await gitStagedFiles()
      } else {
        console.log(text.error.noStagedFiles())
      }
      await checkStagedFiles(isStaged, data)
    } else {
      process.exit(0)
    }
  }
}

/**
 * #### Custom release version
 * @private
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
 * #### Confirm local release
 * @dscription Confirm local release with a commit of the required files, generated changelog, release message and a new tag
 * @private
 * @param {DATA} data - data object
 * @returns {Promise<boolean>} - true if confirmed
 */
// async function confirmLocalRelease (data) {
//   const answer = await confirm({
//     // message: `${text.confirmLocalReleaseTitle()}`
//   })
//   return true
// }

/**
 * #### Confirm to continue
 * @private
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
 * @private
 * @param {DATA} data - data object
 * @returns {Promise<boolean>} - true if confirmed
 */
async function confirmGenerateChangelog (data) {
  const answer = await confirm({
    message: text.confirmGenerateChangelog(data),
    default: true
  })
  return answer
}

/**
 * #### Confirm release commit
 * @private
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
 * #### Ask if GitHub release notes should be generated and published on GitHub
 * @private
 * @param {DATA} data - data object
 * @returns {Promise<boolean>} - true if confirmed
 */

/**
 * #### Ask if the release should be pushed to the remote repository
 * @private
 * @param {DATA} data - data object
 * @returns {Promise<boolean>} - true if confirmed
 */

/**
 * #### Prompts
 * @private
 * @param {DATA} data - data object
 * @returns {Promise<Object>} - answers
 */
async function initialpromptsGroup (data) {
  const releaseType = await selectPackageManager(data)
  let releaseVersion = await selectReleaseVersion(data)
  if (releaseVersion === 'custom') {
    releaseVersion = await customReleaseVersion(data)
  }
  /** @type {PROMPTS_ANSWERS} */
  const answers = {
    releaseType,
    releaseVersion
  }
  data.answers = answers
  console.log(`
${text.title()}
${text.releaseType(data)}
${text.versions(data)}
${text.branch(data)}${text.branchUpstream(data)}${text.releaseFiles(data)}
  `)
  await confirmInfoAbove()
  answers.changelog = await generateChangelog(data)
  // generate changelog
  // add changelog to file
  // bump file versions
  // reinstall dependencies
  // add files to be staged for commit
  console.log(text.preCommitInfo(data))
  await confirmInfoAbove()
  console.log(`${text.stagedFiles(data)}${text.changedFiles(data)}`)
  await confirmReleaseCommit(data)
  // commit files
  // create tag
  // is ssh of tocken https vs ssh
  // is online
  // confirm push to remote
  // push to remote
  // push to remote tags
  // confirm release on GitHub
  // check tocken
  // publish release on GitHub
  return answers
}

export {
  confirmToContinue,
  confirmGenerateChangelog,
  confirmReleaseCommit,
  selectReleaseVersion,
  selectReleaseType,
  createChangelogFile,
  checkStagedFiles
}

// ${chalk.bold.underline('Ready for a new release:')}
// ${chalk.grey('Release type:')} ${answers.releaseType === 'local' ? chalk.yellow('Local') : chalk.bold.cyan('Remote')}
// ${chalk.grey('Version:')} ${chalk.grey(`${data.git.gitLastTag} (old) --> `)}${chalk.bold.yellow(answers.releaseVersion)}${chalk.grey('(new)')}
// ${chalk.grey('Branch:')} ${chalk.bold.blue(data.git.gitBranch)}
// ${data.git.isGitRemote && data.git.gitBranchUpstream ? `${chalk.grey('Remote:')} ${chalk.dim.blue(data.git.gitBranchUpstream)}` : ''}`


// Changelog file: CHANGELOG.md
// **Full Changelog Diff**: https://github.com/Resultify/initial.css/compare/0.0.3...0.0.4
