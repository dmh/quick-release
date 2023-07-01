import * as TYPES from '#types/types.js' // eslint-disable-line
import { request } from '@octokit/request'
import chalk from 'chalk'
import ora from 'ora'
import { splitLogToGenericAndBreaking, filterGenericCommits } from '#utils/parse.js'

/**
* @ignore
* @typedef {TYPES.DATA} DATA {@link DATA}
* @typedef {TYPES.COMMIT_MESSAGE} COMMIT_MESSAGE {@link COMMIT_MESSAGE}
*/

/**
 * #### check if GitHub token is set and valid to use
 * @async
 * @memberof GITHUB
 * @param {DATA} data - data object
 * @returns undefined
 */
async function checkGithubToken (data) {
  const spinner = ora('Checking GitHub token').start()
  if (data.env.GITHUB_TOKEN) {
    try {
      await request('GET /repos/{owner}/{repo}/commits?sha={branch}&per_page={per_page}', {
        headers: {
          authorization: `token ${data.env.GITHUB_TOKEN}`
        },
        owner: data.git.remote.owner,
        repo: data.git.remote.name,
        branch: data.git.branch,
        per_page: 1
      })
      data.github.token = true
      spinner.succeed()
    } catch (error) {
      spinner.fail()
      console.warn(`${chalk.red('Warning:')} GitHub token is invalid. Github release generation will be skipped.`)
      if (process.env.QR_MODE === 'debug') {
        console.warn(error)
      }
    }
  } else {
    spinner.fail()
    console.warn(`${chalk.red('Warning:')} GitHub token is not set. Github release generation will be skipped.`)
    console.warn(`Add ${chalk.yellow('GITHUB_TOKEN=your-token')} to ${chalk.green('.env')} file to enable GitHub release generation.`)
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
async function getGithubCommits (data) {
  const spinner = ora('Get GitHub commits').start()
  try {
    const commits = await request('GET /repos/{owner}/{repo}/commits?sha={branch}&since={date}&per_page={per_page}', {
      headers: {
        authorization: `token ${data.env.GITHUB_TOKEN}`
      },
      owner: data.git.remote.owner,
      repo: data.git.remote.name,
      branch: data.git.branch,
      date: data.git.log[data.git.log.length - 1].date,
      per_page: 100
    })
    const parsedCommits = parseGithubCommits(data, commits.data)
    spinner.succeed()
    return parsedCommits
  } catch (error) {
    spinner.fail()
    console.error(`${chalk.bold.red('Error:')} GitHub commits are not received. Github release generation will be skipped.`)
    if (process.env.QR_MODE === 'debug') {
      console.error(error)
    }
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
function parseGithubCommits (data, commits) {
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
async function saveGithubCommits (data) {
  data.github.commits.all = await getGithubCommits(data) ?? []
  if (data.github.commits.all.length > 0) {
    data.github.commits = { ...data.github.commits, ...splitLogToGenericAndBreaking(data.github.commits.all, data.config.changelog.breakingLabel) }
    data.github.commits.generic = filterGenericCommits(data.github.commits.generic, data.config.changelog.labels)
  }
}

/**
 * #### format github release Notes
 * @memberof GITHUB
 * @param {DATA} data - data object
 * @returns undefined
 */
function saveGithubReleaseNotes (data) {
  let generic = ''
  let breaking = ''
  const compareLink = `\n***\n**Full Changelog**: https://${data.git.remote.host}/${data.git.remote.full_name}/compare/${data.git.lastTag}...${data.answers.releaseVersion}\n`
  const changelogLink = `[${data.config.changelog.file}](https://${data.git.remote.host}/${data.git.remote.full_name}/blob/${data.git.branch}/${data.config.changelog.file})\n`
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
          generic += `### ${githubReleaseTitles[index]}\n`
          item.forEach((log) => {
            log.message = log.message.charAt(0).toUpperCase() + log.message.slice(1)
            generic += `* ${log.message} @${log.name} ${log.hash}\n`
          })
        }
      })
    } else {
      changelogLabels.forEach((label) => {
        githubCommits.forEach((item) => {
          if (item.prefix === label) {
            item.message = item.message.charAt(0).toUpperCase() + item.message.slice(1)
            generic += `* **${item.prefix}** ${item.message} @${item.name} ${item.hash}\n`
          }
        })
      })
    }
  } else {
    githubCommits.forEach((item, index) => {
      item.message = item.message.charAt(0).toUpperCase() + item.message.slice(1)
      generic += `* ${item.message} @${item.name} ${item.hash}\n`
    })
  }
  if (githubCommitsBreaking.length > 0) {
    breaking = '### Breaking Changes\n'
    githubCommitsBreaking.forEach((/** @type {any} */ item) => {
      item.message = item.message.charAt(0).toUpperCase() + item.message.slice(1)
      breaking += `* ${item.message} @${item.name} ${item.hash}\n`
    })
  }
  data.github.releaseNotes = breaking + generic + compareLink + changelogLink
}

/**
 * #### publish GitHub release
 * @async
 * @memberof GITHUB
 * @param {DATA} data - data object
 * @returns undefined
 */
async function publishGithubRelease (data) {
  const spinner = ora('Publish GitHub release').start()
  try {
    await request('POST /repos/{owner}/{repo}/releases', {
      headers: {
        authorization: `token ${data.env.GITHUB_TOKEN}`
      },
      owner: data.git.remote.owner ?? '',
      repo: data.git.remote.name ?? '',
      tag_name: data.answers.releaseVersion ?? '',
      target_commitish: data.git.branch,
      name: data.answers.releaseVersion,
      body: data.github.releaseNotes,
      draft: false,
      prerelease: false,
      generate_release_notes: false
    })
    spinner.succeed()
  } catch (error) {
    spinner.fail()
    console.error(`${chalk.bold.red('Error:')} Publish GitHub release failed.`)
    if (process.env.QR_MODE === 'debug') {
      console.error(error)
    }
  }
}

export { checkGithubToken, saveGithubCommits, saveGithubReleaseNotes, publishGithubRelease }
