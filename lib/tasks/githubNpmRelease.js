'use strict'

const chalk = require('chalk')
const check = require('../check')
const prompt = require('../prompt')
const helpers = require('../helpers')
const text = require('../text')
const github = require('../github')
const git = require('../git')
const npmfn = require('../npmfn')
const subTask = require('./subTask')

const githubNpmRelease = module.exports = {}

githubNpmRelease.go = async (cache) => {
  await subTask.warnings(cache)

  await check.isOnline(cache)

  // npm =====
  if (!cache.pkg) {
    console.log(chalk.red('Invalid NPM package. No package.json file'))
    process.exit(1)
  }
  await npmfn.validatePkgName(cache)
  await npmfn.isLogged(cache)

  // github =====
  await git.isRemote(cache)
  if (!cache.isRemote) {
    await helpers.message(cache, text.githubNoRemote(cache), 'red')
    process.exit(1)
  }
  await git.remote(cache)
  git.parseRemoteUrl(cache)
  await git.updateRemote(cache)
  await git.isUpstream(cache)
  await git.isSynced(cache)
  await github.user(cache)
  await github.token(cache)
  await github.checkGithubToken(cache)
  if (cache.remote.isSSH) {
    if (!cache.githubAuth.isToken) {
      await prompt.githubUser(cache)
      await prompt.githubPass(cache)
      await github.checkGithubCredentials(cache)
    }
  } else {
    console.log(chalk.yellow(`Github username and password is required for repo with ${chalk.green('https')} remote link`))
    await prompt.githubUser(cache)
    await prompt.githubPass(cache)
    await github.checkGithubCredentials(cache)
  }
  // =============

  if (cache.isTag) {
    await prompt.newVersion(cache)
  } else {
    await prompt.specifyVer(cache)
  }
  await subTask.showGithubPreReleaseInfo(cache)

  // changelog
  await subTask.parseChangelog(cache)
  await subTask.showChangelogDraft(cache)
  await subTask.writeChangelog(cache)

  // package.json
  await subTask.writePackegeJson(cache)

  // Files to be committed
  await subTask.filesToBeCommitted(cache)

  // git commit + git add + git tag
  await subTask.gitRelease(cache)

  // publish Github release notes
  await subTask.gitPush(cache)

  // publish Github release notes
  await subTask.githubRelease(cache)

  // npm publish
  await subTask.npmPublish(cache)

  if (cache.githubRelease && cache.confirm.gitRelease && cache.confirm.gitPush && cache.confirm.githubRelease && cache.confirm.githubRelease) {
    helpers.message(cache, text.done(cache))
  } else {
    helpers.message(cache, text.githubNpmReleaseDone(cache))
  }
}
