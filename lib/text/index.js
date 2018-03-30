'use strict'

const chalk = require('chalk')
const variables = require('../variables')

// const helpers = require('../helpers')
const text = module.exports = {}

// error
text.errorStack = `error stack`

// lib/check =============
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
// =======================

text.showPreReleaseInfo = (cache) => (chalk`
  {gray Ready for new release: }
  {dim Current branch:} {blue ${cache.gitBranch}}
  {gray.dim Release Type:} {blue ${cache.releaseType}}
  {gray.dim git tag: }{green ${cache.lastTag}} {gray.dim -->} {yellow.bold ${cache.newVersion}}
`)

text.showPackageJsonVersion = (cache) => (chalk`
  {gray.dim package.json version: }{green ${cache.pkgOldVersion}}{gray.dim --> }{yellow.bold ${cache.newVersion}}
`)

text.stagedFiles = (cache) => (chalk`
  {gray Files ready to commit: }{yellow ${cache.stagedFiles}}
`)

text.notReady = () => (chalk`
  {green Under construction...}
`)

// text.pkgVersion = pkg.version

text.help = (cache) => (chalk`
  {bold.blue ${cache.pkg.name}} {white v${cache.pkg.version}}
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

text.done = (cache) => (chalk`
  {bold Done!}
  {cyan New version} {yellow.bold ${cache.newVersion}} {cyan successfully released!}
`)

text.branchWarning = (cache) => (chalk`
  {red Be careful you are not at} {cyan master} {red branch!}
`)

text.commitWarning = (cache) => (chalk`
  {yellow Nothing to commit, working directory clean.}
  {yellow You can just add new } {blue git tag} for this commit.
`)

text.tagWarning = (cache) => (chalk`
  {red You can\'t assign new tag} {yellow ${cache.newVersion}}
  {red Current commit already have assigned tag} {green ${cache.currentTag}}
`)

text.err = {
  noName: `Please enter site name`,
  capitalLetter: `Do not use a capital first letter`,
  oneWord: `Should be one word or use camelCase`,
  camelCase: `Use camelCase`,
  dirName: `Folder exists. Please choose another folder name`
}
