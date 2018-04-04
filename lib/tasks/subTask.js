'use strict'

const changelog = require('../changelog')
const git = require('../git')
const info = require('../info')
const check = require('../check')
const prompt = require('../prompt')
const helpers = require('../helpers')
const text = require('../text')
const npmfn = require('../npmfn')

const subTask = module.exports = {}

subTask.sysTest = async () => {
  await check.isGitInstalled()
  await check.isNodeInstalled()
  check.isNodeVerCorrect()
}

subTask.repoInfo = async (cache) => {
  await git.isRepo(cache)
  await git.isGitCommit(cache)
  await git.isTagInCurrentCommit(cache)
  await git.isTag(cache)
  await git.branch(cache)
  await git.currentCommitHash(cache)
  await git.getLastTag(cache)
  await info.pkg(cache)
  await info.dateNow(cache)
  await info.qrconfig(cache)
}

subTask.warnings = async (cache) => {
  if (!cache.isMaster) {
    await helpers.message(cache, text.branchWarning(cache), 'red')
    await prompt.isGood(cache)
  }
}

subTask.showPreReleaseInfo = async (cache) => {
  await helpers.message(cache, text.showPreReleaseInfo(cache))
  await prompt.isGood(cache)
}

subTask.parseChangelog = async (cache) => {
  await changelog.commitMessages(cache)
  await changelog.regularChanges(cache)
  await changelog.breakingChanges(cache)
  await changelog.formatting(cache)
}

subTask.showChangelogDraft = async (cache) => {
  await helpers.message(cache, changelog.changelogDraft(cache), 'grey', true, [0, 3, 0, 1])
  await prompt.isGood(cache)
}

subTask.writeChangelog = async (cache) => {
  await changelog.isChangelog(cache)
  await changelog.write(cache)
  await git.addChangelogToGitIndex(cache)
}

subTask.writePackegeJson = async (cache) => {
  await npmfn.bumpPackageVersion(cache)
  await git.addPackageToGitIndex(cache)
}

subTask.filesToBeCommitted = async (cache) => {
  await git.stagedFiles(cache)
  await helpers.message(cache, text.stagedFiles(cache), 'green')
  await prompt.isGood(cache)
  await git.notStagedFiles(cache)
  if (cache.notStagedFiles) {
    await prompt.confirm(cache, 'gitAddAll', text.gitAdd(cache))
    if (cache.confirm.gitAddAll) {
      await git.add(cache)
      await git.stagedFiles(cache)
      await helpers.message(cache, text.stagedFiles(cache), 'green')
      await prompt.isGood(cache)
    }
  }
}

subTask.gitRelease = async (cache) => {
  await prompt.confirm(cache, 'gitRelease', text.gitRelease(cache))
  if (cache.confirm.gitRelease) {
    await git.commit(cache, `Release ${cache.newVersion}`)
    await git.addTag(cache, cache.newVersion)
  }
}

subTask.done = (cache) => {
  helpers.message(cache, text.done(cache))
}
