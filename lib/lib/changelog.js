import * as TYPES from '#types/types.js' // eslint-disable-line
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import { saveBreakingCommits, saveGenericCommits } from '#utils/parse.js'

/**
* @ignore
* @typedef {TYPES.DATA} DATA {@link DATA}
* @typedef {TYPES.COMMIT_MESSAGE} COMMIT_MESSAGE {@link COMMIT_MESSAGE}
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
 * #### parse git logs and return commits as a changelog object
 * @memberof CHANGELOG
 * @param {DATA} data - data object
 * @returns undefined
 */
function saveChangelogData (data) {
  data.changelog.generic = saveGenericCommits(data.git.log, data.config.changelog.labels)
  data.changelog.breaking = saveBreakingCommits(data.git.log, data.config.changelog.breakingLabel)
}

/**
 * #### format changelog data draft
 * @memberof CHANGELOG
 * @param {DATA} data - data object
 * @returns undefined
 */
function saveChangelogDraft (data) {
  let changelog = ''
  let breaking = ''
  const end = '***\n'
  const hashUrl = (/** @type {string} */ hash) => {
    if (
      data.answers.releaseType === 'remote' &&
      data.git.remote.full_name &&
      data.git.remote.host
    ) {
      return ` [\`${hash}\`](https://${data.git.remote.host}/${data.git.remote.full_name}/commit/${hash})`
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
  if (changelog !== '') {
    changelog = `### v${data.answers.releaseVersion} \`${dateNow()}\`\n${changelog}\n`
  }
  if (breaking !== '') {
    breaking = `#### Breaking Changes\n${breaking}`
  }
  data.changelog.draft = changelog + breaking + end
}

/**
 * #### write changelog draft data to file
 * @async
 * @memberof CHANGELOG
 * @param {DATA} data - data object
 * @returns undefined
 */
async function changelogWriteFile (data) {
  const filePath = path.resolve('.', data.config.changelog.file)
  if (data.changelog.draft) {
    try {
      const oldChangelog = await fsPromises.readFile(filePath)
      await fsPromises.writeFile(filePath, data.changelog.draft, { encoding: 'utf8' })
      await fsPromises.appendFile(filePath, oldChangelog, { encoding: 'utf8' })
    } catch (error) {
      console.log(error)
    }
  }
}

export { saveChangelogData, saveChangelogDraft, changelogWriteFile }
