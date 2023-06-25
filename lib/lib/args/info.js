import * as TYPES from '#types/types.js' // eslint-disable-line
import { text } from '#utils/text.js'

/**
 * @ignore
 * @typedef {TYPES.DATA} DATA {@link DATA}
 */

/**
 *#### Show info
 * @memberof COMMANDS
 * @param {DATA} data - data
 * @returns undefined
 */
function info (data) {
  console.log(`\
${text.title()}
${text.possiblereleaseTypes(data)}
${text.currentVersion(data)}
${text.possibleNewVersions(data)}
${text.branch(data)}\
${text.changelogFile(data, true)}\
${text.branchUpstreamInfo(data)}\
${text.remoteName(data)}\
${text.remoteUrl(data, true)}\
${text.remoteProtocol(data)}\
${text.releaseFiles(data)}\
  `)
}

export { info }
