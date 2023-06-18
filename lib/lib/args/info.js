import * as TYPES from '../config/types.js' // eslint-disable-line
import chalk from 'chalk'
import semver from 'semver'
import { text as t } from '../text.js'

/**
 * @ignore
 * @typedef {TYPES.DATA} DATA {@link DATA}
 */

/**
 * @summary Show remote info
 * @memberof CLIcommands
 * @param {DATA} data - data
 * @returns undefined
 */
function remoteInfo (data) {
  if (data.git.isGitRemote && data.git.gitBranchUpstream) {
    const info = `
Branch upstream: ${chalk.cyan(data.git.gitBranchUpstream)}
Remote name: ${chalk.cyan(data.git.gitRemoteOrigin?.full_name)}
Remote URL: ${chalk.cyan(data.git.gitRemoteOrigin?.href)}
Remote protocol: ${chalk.cyan(data.git.gitRemoteOrigin?.protocol)}`
    return info
  } else {
    return ''
  }
}

// function versions (/** @type {string|undefined} */ tag) {
//   if (!tag) {
//     return 'custom'
//   } else {
//     const versions = `${semver.inc(tag, 'patch')} ${chalk.grey('or')} ${semver.inc(tag, 'minor')} ${chalk.grey('or')} ${semver.inc(tag, 'major')}`
//     return versions
//   }
// }

/**
 * @summary Show info
 * @memberof CLIcommands
 * @param {DATA} data - data
 * @returns undefined
 */
function info (data) {
//   const info = `
// ${chalk.bold.underline('Ready for a new release')} ${chalk.grey(`
// Release Type: ${chalk.yellow('Local')} ${data.git.isGitRemote && data.git.gitBranchUpstream ? 'or ' + chalk.bold.cyan('Remote') : ''}
// Current Version: ${chalk.white(data.git.gitLastTag)}
// Posible Next Version: ${chalk.bold.yellow(versions(data.git.gitLastTag))}
// Current branch: ${chalk.bold.blue(data.git.gitBranch)}${remoteInfo(data)}
// Files to include in release: ${chalk.green(data.config?.files)}
// Changelog: ${chalk.green(data.config.changelogFile)}
// Github Auth: ${chalk.magenta('true')}
// Online: ${chalk.magenta('true')}
// `)}
// `
  // console.log(info)
  console.log(`
${t.title()}
${t.possiblereleaseTypes(data)}
${t.currentVersion(data)}
${t.branch(data)}
${t.possibleNewVersions(data)}\
${t.changelogFile(data)}\
${t.releaseFiles(data)}\
${t.branchUpstream(data)}\
${t.remoteName(data)}\
${t.remoteUrl(data)}\
${t.remoteProtocol(data)}\
${t.githubToken(data)}\
${t.ssh(data)}\
${t.online(data)}\
  `)
}

export { info }
