import * as TYPES from '../config/types.js' // eslint-disable-line
import { text } from '../utils/text.js'

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
${text.branch(data)}
${text.possibleNewVersions(data)}\
${text.changelogFile(data)}\
${text.releaseFiles(data)}\
${text.branchUpstreamInfo(data)}\
${text.remoteName(data)}\
${text.remoteUrl(data)}\
${text.remoteProtocol(data)}\
  `)
}

export { info }
