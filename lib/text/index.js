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

// tasks/subTask =====
text.showPreReleaseInfo = (cache) => (chalk`
  {bold.underline Ready for new release:}
  Release Type: {cyan ${cache.releaseType}}
  Current branch: {blue ${cache.gitBranch}}
  Git tag: {red ${cache.lastTag}}{dim.gray (old)} {gray.dim -->} {yellow.bold ${cache.newVersion}}{dim.gray (new)}
`)
text.branchWarning = (cache) => (chalk`
{red Be careful you are not at} {cyan master} {red branch!}
`)
text.stagedFiles = (cache) => (chalk`
  Files to be committed: {green ${cache.stagedFiles}}
`)
text.gitAdd = (cache) => (chalk`[{yellow ${cache.notStagedFiles}}] not staged for commit. Add those files as a part of a release commit? {grey.dim (git add .)}`)
text.gitRelease = (cache) => (chalk`We are ready to {yellow [git commit]} a {bold.cyan New Release} and tag it as a {yellow ${cache.newVersion}}`)
text.done = (cache) => (chalk`
{bold Done!}
{cyan New version} {yellow.bold ${cache.newVersion}} {cyan successfully released!}
`)
// ---------------------

text.err = {
  noName: `Please enter site name`,
  capitalLetter: `Do not use a capital first letter`,
  oneWord: `Should be one word or use camelCase`,
  camelCase: `Use camelCase`,
  dirName: `Folder exists. Please choose another folder name`,
  stack: `error stack`
}

text.notReady = () => (chalk`
  {red Under construction...}
`)

// Hepl text =============
const qrPkg = require('../../package.json')
text.help = (cache) => (chalk`
  {bold ${qrPkg.name}} {yellow v${qrPkg.version}}
  Quickly generate and publish your application releases

  {bold.underline Usage:}
  quick-release
  quick-release [options]

  {bold.underline Options:}
  -h, --help           Quick help.
  -v, --version        Print the quick-release version.
  -g, --github         Github Release.
  -n, --githubnpm      Github Release + NPM Publish.
  -s, --simple         Simple Release.
  --githubAPI          Github Release API.
  --nPublish           NPM Publish.

  Release types:
  {yellow [Github Release]} - Github Release API + CHANGELOG + git commit/tag/push
  {yellow [Github Release + NPM Publish]} - Github Release + NPM Publish
`)
