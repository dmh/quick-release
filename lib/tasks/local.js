'use strict'

const prompt = require('../prompt')
const text = require('../text')
const helpers = require('../helpers')
const subTask = require('./subTask')

const local = module.exports = {}

local.go = async (cache) => {
  await subTask.warnings(cache)
  if (cache.isTag) {
    await prompt.newVersion(cache)
  } else {
    await prompt.specifyVer(cache)
  }
  await subTask.showPreReleaseInfo(cache)

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

  if (cache.confirm.gitRelease) {
    helpers.message(cache, text.done(cache))
  } else {
    helpers.message(cache, text.localDone(cache))
  }
}
