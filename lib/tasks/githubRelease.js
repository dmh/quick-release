'use strict'

const prompt = require('../prompt')
const helpers = require('../helpers')
const text = require('../text')
const github = require('../github')
const git = require('../git')
const subTask = require('./subTask')

const githubRelease = module.exports = {}

githubRelease.go = async (cache) => {
  await subTask.warnings(cache)

  // github =====
  await git.isRemote(cache)
  if (!cache.isRemote) {
    await helpers.message(cache, text.githubNoRemote(cache), 'red')
    process.exit(1)
  }
  await git.remote(cache)
  git.parseRemoteUrl(cache)
  await git.updateRemote(cache)
  await git.isSynced(cache)
  await github.user(cache)
  await github.token(cache)
  await github.checkGithubToken(cache)
  await prompt.githubUser(cache)
  await prompt.githubPass(cache)
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

  if (cache.githubRelease && cache.confirm.gitRelease && cache.confirm.gitPush && cache.confirm.githubRelease) {
    helpers.message(cache, text.done(cache))
  } else {
    helpers.message(cache, text.githubReleaseDone(cache))
  }
}
