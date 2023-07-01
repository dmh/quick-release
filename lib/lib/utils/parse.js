import * as TYPES from '#types/types.js' // eslint-disable-line
/**
* @ignore
* @typedef {TYPES.DATA} DATA {@link DATA}
* @typedef {TYPES.COMMIT_MESSAGE} COMMIT_MESSAGE {@link COMMIT_MESSAGE}
*/

/**
 * #### object with breaking and generic commits
 * @typedef {Object} SPLIT_LOG
 * @property {COMMIT_MESSAGE[]} breaking - breaking changes
 * @property {COMMIT_MESSAGE[]} generic - generic changes
 */

/**
 * #### split array of commit objects into two arrays
 * split array of commit objects into two arrays, one for breaking changes and one for generic changes, breaking changes are all with message starting with `breakingLabel`, generic changes are all the rest except breaking changes
 * @private
 * @memberof UTILS
 * @param {COMMIT_MESSAGE[]} log - array of commit objects
 * @param {string} [breakingLabel] - array of commit objects
 * @returns {SPLIT_LOG}
 */
function splitLogToGenericAndBreaking (log, breakingLabel) {
  /** @type {COMMIT_MESSAGE[]} */
  const generic = []
  /** @type {COMMIT_MESSAGE[]} */
  const breaking = []
  if (breakingLabel) {
    log.forEach((logItem) => {
      if (logItem.message.startsWith(breakingLabel)) {
        logItem.message = logItem.message.replace(breakingLabel, '').trim()
        logItem.prefix = breakingLabel
        breaking.push(logItem)
      } else {
        generic.push(logItem)
      }
    })
  } else {
    generic.push(...log)
  }
  return { generic, breaking }
}

/**
 * #### filter generic commits by labels
 * @memberof UTILS
 * @param {COMMIT_MESSAGE[]} log - array of commit objects
 * @param {Array<string>} [labels] - array of commit objects
 * @returns {COMMIT_MESSAGE[]}
 */
function filterGenericCommits (log, labels) {
  /** @type {Array<COMMIT_MESSAGE>} */
  const filteredGeneric = []
  log.forEach((logItem) => {
    if (labels && labels.length > 0) {
      labels.forEach((label) => {
        if (logItem.message.startsWith(label)) {
          logItem.message = logItem.message.replace(label, '').trim()
          logItem.prefix = label
          filteredGeneric.push(logItem)
        }
      })
    }
  })
  if (labels && labels.length > 0) {
    return filteredGeneric
  } else {
    return log
  }
}

export { filterGenericCommits, splitLogToGenericAndBreaking }
