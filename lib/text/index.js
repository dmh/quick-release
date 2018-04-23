'use strict'

const chalk = require('chalk')
const variables = require('../variables')

const text = module.exports = {}

// lib/check =====
text.check = {}
text.check.isGitInstalled = () => (chalk`
{red Sorry, this script requires} {yellow git} {red installed on your computer}
`)
text.check.isNodeInstalled = () => (chalk`
{red Sorry, this script requires} {green Node.js} {red installed on your computer}
`)
text.check.isNodeVerCorrect = () => (chalk`
{red Need to install new version of Node.js} {green >= ${variables.env.node}.0}
`)

// lib/git =====
text.git = {}
text.git.isRepo = `Not a git repository`
text.git.isTagInCurrentCommit = `The Release already exists in the current commit`
text.git.isGitCommit = `No commits yet`
text.git.isSynced = `The current branch is not synced to the remote repo`

// lib/github =====
text.manualGithubRelease = (cache) => (chalk`
  You can publish Github release manually based on changelog file.
`)

// tasks/subTask =====
text.showPreReleaseInfo = (cache) => (chalk`
  {bold.underline Ready for new release:}
  Release Type: {cyan ${cache.releaseType}}
  Current branch: {blue ${cache.gitBranch}}
  Git tag: {red ${cache.lastTag}}{dim.gray (old)} {gray.dim -->} {yellow.bold ${cache.newVersion}}{dim.gray (new)}
`)

text.showGithubPreReleaseInfo = (cache) => (chalk`
  {bold.underline Ready for new release:}
  Release Type: {cyan ${cache.releaseType}}
  Current branch: {blue ${cache.gitBranch}}
  Git tag: {red ${cache.lastTag}}{dim.gray (old)} {gray.dim -->} {yellow.bold ${cache.newVersion}}{dim.gray (new)}
  ------------
  git remote name: {magenta ${cache.isRemote}}
  git remote url: {magenta ${cache.remote.url}}
  git remote owner:  {magenta ${cache.remote.owner}}
`)

text.branchWarning = (cache) => (chalk`
  {red Be careful you are not at} {cyan master} {red branch!}
`)

text.githubNoRemote = (cache) => (chalk`
  {red No remote repo URL.}

  Looks like this is a local repository.
  Remote Github URL is required to publish the Github release.
  {yellow git remote -v}
`)

text.stagedFiles = (cache) => (chalk`
  Files to be committed: {green ${cache.stagedFiles}}
`)
text.gitAdd = (cache) => (chalk`[{yellow ${cache.notStagedFiles}}] not staged for commit. Add those files as a part of a release commit? {grey.dim (git add .)}`)
text.gitRelease = (cache) => (chalk`Commit a release? {dim (git commit + git tag} {yellow ${cache.newVersion}} {dim )}`)
text.gitPush = (cache) => (chalk`Git Push to remote?`)
text.githubRelease = (cache) => (chalk`Publish Github release?`)
text.npmPublish = (cache) => (chalk`Publish NPM package?`)
text.done = (cache) => (chalk`
  {bold Done!}
  {cyan New version} {yellow.bold ${cache.newVersion}} {cyan successfully released!}
`)
text.githubReleaseDone = (cache) => (chalk`
  {bold Done!}
  {cyan New version} {yellow.bold ${cache.newVersion}} {cyan released!}
  - git commit: ${!cache.confirm.gitRelease ? (chalk`{red ${cache.confirm.gitRelease}}`) : (chalk`{cyan ${cache.confirm.gitRelease}}`)}
  - git push: ${!cache.confirm.gitRelease ? (chalk`{red ${cache.confirm.gitRelease}}`) : (cache.confirm.gitPush ? (chalk`{cyan ${cache.confirm.gitPush}}`) : (chalk`{red ${cache.confirm.gitPush}}`))}
  - Github Release: ${!cache.confirm.gitPush ? (chalk`{red false}`) : (cache.confirm.githubRelease && cache.githubRelease ? (chalk`{cyan true}`) : (chalk`{red false}`))}
`)
text.githubNpmReleaseDone = (cache) => (chalk`
  {bold Done!}
  {cyan New version} {yellow.bold ${cache.newVersion}} {cyan released!}
  - git commit: ${!cache.confirm.gitRelease ? (chalk`{red ${cache.confirm.gitRelease}}`) : (chalk`{cyan ${cache.confirm.gitRelease}}`)}
  - git push: ${!cache.confirm.gitRelease ? (chalk`{red ${cache.confirm.gitRelease}}`) : (cache.confirm.gitPush ? (chalk`{cyan ${cache.confirm.gitPush}}`) : (chalk`{red ${cache.confirm.gitPush}}`))}
  - Github Release: ${!cache.confirm.gitPush ? (chalk`{red false}`) : (cache.confirm.githubRelease && cache.githubRelease ? (chalk`{cyan true}`) : (chalk`{red false}`))}
  - Npm Release: ${!cache.confirm.githubRelease ? (chalk`{red false}`) : (cache.confirm.npmPublish && cache.npmPublish ? (chalk`{cyan true}`) : (chalk`{red false}`))}
`)
text.localDone = (cache) => (chalk`
  {bold Done!}
  {cyan New version} {yellow.bold ${cache.newVersion}} {cyan released!}
  - git commit: ${!cache.confirm.gitRelease ? (chalk`{red ${cache.confirm.gitRelease}}`) : (chalk`{cyan ${cache.confirm.gitRelease}}`)}
`)
// ---------------------

text.err = {
  noName: `this field should not be empty`,
  // capitalLetter: `Do not use a capital first letter`,
  oneWord: `should be one word`,
  // camelCase: `Use camelCase`,
  // dirName: `Folder exists. Please choose another folder name`,
  stack: `error stack`
}

text.notReady = () => (chalk`
  {red Under construction...}
`)

// Hepl text =============
const qrPkg = require('../../package.json')
text.v = `v${qrPkg.version}`
text.help = (cache) => (chalk`
  {bold ${qrPkg.name}} {yellow v${qrPkg.version}}
  Quickly generate and publish your application releases

  {bold.underline Usage:}
  quick-release
  quick-release [options]

  {bold.underline Options:}
  -h, --help           Quick help.
  -v, --version        Print the quick-release version.
  -l, --local          Local Release.
  -g, --github         Github Release.
  -n, --npm            Github Release + NPM Release.

  {bold.underline Release types:}
  {yellow [Local Release]} - Local repository release (CHANGELOG + git commit/tag)
  {yellow [Github Release]} - Github Release (CHANGELOG + git commit/tag/push to remote + github release)
  {yellow [Github Release + NPM Publish]} - Github Release + NPM Publish
`)
