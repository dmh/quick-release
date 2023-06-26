import * as TYPES from '#types/types.js' // eslint-disable-line
import { gitLog } from '#git.js'
import fsPromises from 'node:fs/promises'
import path from 'node:path'

/**
* @ignore
* @typedef {TYPES.DATA} DATA {@link DATA}
*/

/**
 * #### return current date in Month Day, Year format
 * @private
 * @memberof CHANGELOG
 * @returns {string} date
 */
function dateNow () {
  const date = new Date()
  const month = date.toLocaleString('default', { month: 'long' })
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}

/**
 * #### commit message object
 * @description
 * @typedef {Object} COMMIT_MESSAGE
 * @property {string} commit - commit
 * @property {string} prefix - commit message prefix
 * @property {string} message - commit message
 * @property {string} hash - commit message hash
 * @property {string} name - commit message author name
 */

/**
 * #### parse git log and return each commit message as object with changelog properties
 * @private
 * @memberof CHANGELOG
 * @param {string} commit - commit message
 * @param {string} label - commit message label/preffix
 * @returns {COMMIT_MESSAGE} portal name|names
 */
function parseCommit (commit, label) {
  const prefix = label.trim()
  let message = ''
  let hash = ''
  let name = ''
  const matchHash = commit.match(/@#hash/i)
  const nameHash = commit.match(/#@an/i)
  if (matchHash !== undefined && matchHash !== null && matchHash.index) {
    hash = commit.slice(matchHash.index + 6)
    message = commit.slice(0, matchHash.index).trim()
    if (nameHash !== undefined && nameHash !== null && nameHash.index) {
      name = message.slice(nameHash.index + 4)
      message = message.slice(0, nameHash.index).trim()
    }
  } else {
    message = commit
  }
  message = message.replace(label, '').trim()
  return { commit, prefix, message, hash, name }
}

/**
 * #### parse git logs and return commits as a changelog object
 * @async
 * @memberof CHANGELOG
 * @param {DATA} data - data object
 * @returns {Promise<DATA>} local data
 */
async function saveChangelogData (data) {
  const logs = await gitLog(data)
  /** @type {DATA['changelog']} */
  const changelog = {
    generic: [],
    breaking: []
  }
  if (logs.length > 0) {
    logs.forEach((logItem) => {
      if (data.config.changelog.labels && data.config.changelog.labels.length > 0) {
        data.config.changelog.labels.forEach((label) => {
          if (logItem.startsWith(label)) {
            changelog.generic.push(parseCommit(logItem, label))
          }
        })

        if (data.config.changelog.breakingLabel) {
          if (logItem.startsWith(data.config.changelog.breakingLabel)) {
            changelog.breaking.push(parseCommit(logItem, data.config.changelog.breakingLabel))
          }
        }
      } else {
        if (data.config.changelog.breakingLabel) {
          if (logItem.startsWith(data.config.changelog.breakingLabel)) {
            changelog.breaking.push(parseCommit(logItem, data.config.changelog.breakingLabel))
          } else {
            changelog.generic.push(parseCommit(logItem, ''))
          }
        } else {
          changelog.generic.push(parseCommit(logItem, ''))
        }
      }
    })
  }
  data.changelog.generic = changelog.generic
  data.changelog.breaking = changelog.breaking
  return data
}

/**
 * #### format changelog data draft
 * @memberof CHANGELOG
 * @param {DATA} data - data object
 * @returns undefined
 */
function changelogDraft (data) {
  let changelog = ''
  let breaking = ''
  const end = '\n***\n'
  const hashUrl = (/** @type {string} */ hash) => {
    if (
      // data.answers.releaseType === 'remote' &&
      data.git.gitRemoteOrigin.full_name &&
      data.git.gitRemoteOrigin.host
    ) {
      return ` [\`${hash}\`](https://${data.git.gitRemoteOrigin.host}/${data.git.gitRemoteOrigin.full_name}/commit/${hash})`
    } else {
      return ` \`${hash}\``
    }
  }
  const prefix = (/** @type {string} */ prefix) => {
    return prefix !== '' ? `**${prefix}** ` : ''
  }
  const name = (/** @type {string} */ name) => {
    return name !== '' ? ` (${name})` : ''
  }

  if (data.changelog.generic.length > 0) {
    data.changelog.generic.forEach((/** @type {any} */ item) => {
      changelog += `* ${prefix(item.prefix)}${item.message}${hashUrl(item.hash)}${name(item.name)}\n`
    })
  }
  if (data.changelog.breaking.length > 0) {
    data.changelog.breaking.forEach((/** @type {any} */ item) => {
      breaking += `* ${prefix(item.prefix)}${item.message}${hashUrl(item.hash)}${name(item.name)}\n`
    })
  }
  changelog = `### v${data.answers.releaseVersion} \`${dateNow()}\`\n${changelog}\n`
  breaking = `#### Breaking Changes\n${breaking}`
  data.changelogDraft = changelog + breaking + end
}

/**
 * #### write changelog draft data to file
 * @async
 * @memberof CHANGELOG
 * @param {DATA} data - data object
 * @returns undefined
 */
async function changelogWrite (data) {
  const filePath = path.resolve('.', data.config.changelog.file)
  if (data.changelogDraft) {
    try {
      const oldChangelog = await fsPromises.readFile(filePath)
      await fsPromises.writeFile(filePath, data.changelogDraft, { encoding: 'utf8' })
      await fsPromises.appendFile(filePath, oldChangelog, { encoding: 'utf8' })
    } catch (error) {
      console.log(error)
    }
  }
}

export { saveChangelogData, changelogDraft, changelogWrite }
