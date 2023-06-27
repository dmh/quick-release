import * as TYPES from '#types/types.js' // eslint-disable-line
/**
* @ignore
* @typedef {TYPES.DATA} DATA {@link DATA}
* @typedef {TYPES.COMMIT_MESSAGE} COMMIT_MESSAGE {@link COMMIT_MESSAGE}
*/

/**
 * #### parse commits and save breaking commits
 * @param {Array<COMMIT_MESSAGE>} log - git log data
 * @param {string} [breakingLabel] - label to indicate breaking changes in git log.
 * @returns {Array<COMMIT_MESSAGE>}
 */
function saveBreakingCommits (log, breakingLabel) {
  /** @type {Array<COMMIT_MESSAGE>} */
  const breaking = []
  if (breakingLabel) {
    log.forEach((logItem) => {
      if (logItem.message.startsWith(breakingLabel)) {
        logItem.message = logItem.message.replace(breakingLabel, '').trim()
        logItem.prefix = breakingLabel
        breaking.push(logItem)
      }
    })
  }
  return breaking
}

/**
 * #### parse commits and save generic commits
 * @param {Array<COMMIT_MESSAGE>} log - git log data
 * @param {Array<string>} [labels] - labels to use for buildin changelog
 * @returns {Array<COMMIT_MESSAGE>}
 */
function saveGenericCommits (log, labels) {
  /** @type {Array<COMMIT_MESSAGE>} */
  const generic = []
  log.forEach((logItem) => {
    if (labels && labels.length > 0) {
      labels.forEach((label) => {
        if (logItem.message.startsWith(label)) {
          logItem.message = logItem.message.replace(label, '').trim()
          logItem.prefix = label
          generic.push(logItem)
        }
      })
    } else {
      generic.push(logItem)
    }
  })
  return generic
}

export { saveBreakingCommits, saveGenericCommits }
