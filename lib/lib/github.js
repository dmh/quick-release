import * as TYPES from '#types/types.js' // eslint-disable-line
import { Octokit } from '@octokit/core'
import chalk from 'chalk'
import ora from 'ora'
import { saveBreakingCommits, saveGenericCommits } from '#utils/parse.js'

/**
* @ignore
* @typedef {TYPES.DATA} DATA {@link DATA}
* @typedef {TYPES.COMMIT_MESSAGE} COMMIT_MESSAGE {@link COMMIT_MESSAGE}
*/

/** @type {any} */
let octokit = {}

/**
 * #### check if GitHub token is set and valid to use
 * @async
 * @memberof GITHUB
 * @param {DATA} data - data object
 * @returns undefined
 */
async function checkGitHubToken (data) {
  const spinner = ora('Checking GitHub token').start()
  if (data.env.GITHUB_TOKEN) {
    octokit = new Octokit({ auth: data.env.GITHUB_TOKEN })
    try {
      await octokit.request('/user')
      data.github.token = true
      spinner.succeed('GitHub token is valid')
    } catch (error) {
      spinner.fail('GitHub token is invalid')
      console.warn(`${chalk.red('Warning:')} GitHub token is invalid. Github release generation will be skipped.`)
    }
    return octokit
  } else {
    spinner.fail('GitHub token is not set')
    console.warn(`${chalk.red('Warning:')} GitHub token is not set. Github release generation will be skipped.`)
    console.log(`Add ${chalk.yellow('GITHUB_TOKEN=your-token')} to ${chalk.green('.env')} file to enable GitHub release generation.`)
  }
}

/**
 * #### get github commits from last tag date to HEAD
 * @async
 * @private
 * @memberof GITHUB
 * @param {DATA} data - data object
 * @returns {Promise<COMMIT_MESSAGE[]|undefined>} - undefined
 */
async function getGitHubCommits (data) {
  const spinner = ora('Get GitHub commits').start()
  try {
    // const octokit = new Octokit({ auth: data.env.GITHUB_TOKEN })
    const commits = await octokit.request('GET /repos/{owner}/{repo}/commits?sha={branch}&since={date}', {
      owner: data.git.remote.owner,
      repo: data.git.remote.name,
      branch: data.git.branch,
      date: data.git.log[data.git.log.length - 1].date
    })
    const parsedCommits = parseGitHubCommits(data, commits.data)
    spinner.succeed('Get GitHub commits')
    return parsedCommits
  } catch (error) {
    spinner.fail('GitHub commits are not received')
    console.warn(`${chalk.bold.red('Error:')} GitHub commits are not received. Github release generation will be skipped.`)
  }
}

/**
 * #### parse github API commits
 * @private
 * @memberof GITHUB
 * @param {DATA} data - data object
 * @param {Array<Object>} commits - github commits
 * @returns {Array<COMMIT_MESSAGE>} - parsed commits
 */
function parseGitHubCommits (data, commits) {
  /** @type {Array<COMMIT_MESSAGE>} */
  const parsedCommits = []
  commits.forEach((/** @type {any} */ item) => {
    const prefix = ''
    const message = item.commit.message.split('\n')[0]
    const hash = item.sha.slice(0, 7)
    const name = item.author.login
    parsedCommits.push({ prefix, message, name, hash })
  })
  return parsedCommits
}

/**
 * #### save GitHub commits
 * @async
 * @memberof GITHUB
 * @param {DATA} data - data object
 * @returns undefined
 */
async function saveGitHubCommits (data) {
  data.github.commits.all = await getGitHubCommits(data) ?? []
  if (data.github.commits.all.length > 0) {
    data.github.commits.generic = saveGenericCommits(data.github.commits.all, data.config.changelog.labels)
    data.github.commits.breaking = saveBreakingCommits(data.github.commits.all, data.config.changelog.breakingLabel)
  }
}

/**
 * #### format github release Notes
 * @param {DATA} data - data object
 * @returns undefined
 */
function saveGithubReleaseNotes (data) {
  let generic = ''
  let breaking = ''
  const changelogLabels = data.config.changelog.labels
  const githubReleaseTitles = data.config.githubReleaseTitles
  const githubCommits = data.github.commits.generic
  const githubCommitsBreaking = data.github.commits.breaking
  if (githubCommits.length > 0 && changelogLabels && changelogLabels.length > 0) {
    if (githubReleaseTitles && changelogLabels.length === githubReleaseTitles.length) {
      /** @type {any} */
      const releaseNotesData = []
      // regroup commits by labels
      githubReleaseTitles.forEach((title, index) => {
        releaseNotesData.push(githubCommits.filter((log) => {
          return log.prefix.includes(changelogLabels[index])
        }))
      })
      releaseNotesData.forEach((/** @type {Array<COMMIT_MESSAGE>} */ item, /** @type {number} */ index) => {
        if (item.length > 0) {
          generic += `## ${githubReleaseTitles[index]}\n`
          item.forEach((log) => {
            generic += `* ${log.message} @${log.name} ${log.hash}\n`
          })
        }
      })
    } else {
      changelogLabels.forEach((label) => {
        githubCommits.forEach((item) => {
          if (item.prefix === label) {
            generic += `* **${item.prefix}** ${item.message} @${item.name} ${item.hash}\n`
          }
        })
      })
    }
  } else {
    githubCommits.forEach((item, index) => {
      generic += `* ${item.message} @${item.name} ${item.hash}\n`
    })
  }
  if (githubCommitsBreaking.length > 0) {
    breaking = '### Breaking Changes\n'
    githubCommitsBreaking.forEach((/** @type {any} */ item) => {
      breaking += `* ${item.message} @${item.name} ${item.hash}\n`
    })
  }
  data.github.releaseNotes = generic + breaking
}

export { checkGitHubToken, saveGitHubCommits, saveGithubReleaseNotes }
