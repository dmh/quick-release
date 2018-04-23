'use strict'

const _ = require('lodash')
const chalk = require('chalk')
const Ora = require('ora')
const variables = require('../variables')
const helpers = require('../helpers')
const text = require('../text')

const {exec} = require('child_process')
const {promisify} = require('util')
const execAsync = promisify(exec)

const spinner = new Ora()

const git = module.exports = {}
const remote = {}

// clone git repo
git.clone = async (cache, link) => {
  let cmd = {
    spinner: `Cloning`,
    str: `git clone --single-branch -b master ${link} ${cache.dirName || variables.subtheme.dirName(cache)}`,
    spinerSucceed: 'Successfully cloned'
  }
  return helpers.execCMD(cmd, cache)
}

// remove git repo
git.removeRepo = async (cache) => {
  let cmd = {
    // spinner: '',
    str: `rm -rf .git`
    // spinerSucceed: ''
  }
  return helpers.execCMD(cmd, cache)
}

// git init
git.init = async (cache) => {
  let cmd = {
    // spinner: '',
    str: `git init`
    // spinerSucceed: ''
  }
  return helpers.execCMD(cmd, cache)
}

// git add
git.add = async (cache) => {
  let cmd = {
    // spinner: '',
    str: `git add .`
    // spinerSucceed: ''
  }
  return helpers.execCMD(cmd, cache)
}

// git add CHANGELOG.md file
git.addChangelogToGitIndex = async (cache) => {
  let file = `CHANGELOG.md`
  if (cache.qrconfig.changelogFile) {
    file = cache.qrconfig.changelogFile
  }
  let str = `git add ${file}`
  await execAsync(str, { maxBuffer: 2000 * 1024 })
  return cache
}

// git add package.json file
git.addPackageToGitIndex = async (cache) => {
  if (cache.pkg) {
    let file = `${process.cwd()}/package.json`
    let str = `git add ${file}`
    await execAsync(str, { maxBuffer: 2000 * 1024 })
  }
  return cache
}

// git commit
git.commit = async (cache, commitMessage) => {
  let cmd = {
    // spinner: '',
    str: `git commit -m "${commitMessage}"`
    // spinerSucceed: ''
  }
  return helpers.execCMD(cmd, cache)
}

// git tag
git.addTag = async (cache, ver) => {
  let cmd = {
    // spinner: ``,
    str: `git tag ${ver}`
    // spinerSucceed: ``
  }
  return helpers.execCMD(cmd, cache)
}

// git checkout
git.checkout = async (cache) => {
  let cmd = {
    // spinner: '',
    str: `git checkout ${cache.templateVersion}`
    // spinerSucceed: ''
  }
  return helpers.execCMD(cmd, cache)
}

// Are tags present in current repo?
git.isTag = async (cache) => {
  let str = 'git tag -l'
  let isTag = {}
  let gitTag = await execAsync(str, { maxBuffer: 2000 * 1024 })

  if (_.isEmpty(gitTag.stdout)) {
    isTag = { isTag: false }
  } else {
    isTag = { isTag: true }
  }
  helpers.addTo(cache, isTag)
  return cache
}

// get last tag
git.getLastTag = async (cache) => {
  let str = 'git describe --abbrev=0 --tags'
  let lastTag = {}
  if (cache.isTag) {
    let gitTag = await execAsync(str, { maxBuffer: 2000 * 1024 })
    if (_.isEmpty(gitTag.stdout)) {
      lastTag = { lastTag: false }
    } else {
      var match = gitTag.stdout.match(/\n/i)
      lastTag = gitTag.stdout.slice(0, match.index)
      lastTag = { lastTag: lastTag }
    }
  } else {
    lastTag = { lastTag: false }
  }
  helpers.addTo(cache, lastTag)
  return cache
}

// is current folder is git repo?
git.isRepo = async (cache) => {
  try {
    const str = 'git status'
    let isRepo = {}
    const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
    if (_.isEmpty(data.stdout)) {
      isRepo = { isRepo: false }
    } else {
      isRepo = { isRepo: true }
    }
    helpers.addTo(cache, isRepo)
    return cache
  } catch (err) {
    console.log(chalk.red(text.git.isRepo))
    process.exit(1)
  }
}

// Is tag present in current commit?
git.isTagInCurrentCommit = async (cache) => {
  const str = 'git tag --contains'
  const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
  if (!_.isEmpty(data.stdout)) {
    console.log(chalk.red(text.git.isTagInCurrentCommit))
    process.exit(1)
  }
}

// Are commits present in current repo?
git.isGitCommit = async (cache) => {
  const str = 'git status'
  const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
  if (data.stdout.includes(text.git.isGitCommit)) {
    console.log(chalk.red(text.git.isGitCommit))
    process.exit(1)
  }
}

// git update remote
git.updateRemote = async (cache, ver) => {
  let cmd = {
    spinner: `Updating info about remote repository`,
    str: `git remote update ${cache.isRemote}`
    // spinerSucceed: ``
  }
  return helpers.execCMD(cmd, cache)
}

// check if the current branch has set the remote as upstream
git.isUpstream = async (cache) => {
  try {
    const str = `git rev-parse --abbrev-ref ${cache.gitBranch}@{u}`
    await execAsync(str, { maxBuffer: 2000 * 1024 })
  } catch (err) {
    console.log(chalk.red(err.stderr))
    console.log(`To push the current branch and set the remote as upstream, use ${chalk.yellow(`git push --set-upstream ${cache.isRemote} ${cache.gitBranch}`)}`)
    process.exit(1)
  }
}
// Is current branch is synced with the remote repo
git.isSynced = async (cache) => {
  const str = `git rev-list HEAD...${cache.isRemote}/${cache.gitBranch} --count`
  const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
  if (parseInt(data.stdout.trim()) !== 0) {
    console.log(chalk.red(text.git.isSynced))
    process.exit(1)
  }
}

// check for staged files in repo
git.stagedFiles = async (cache) => {
  let str = 'git diff --name-only --cached'
  let stagedFiles = {}
  const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
  if (_.isEmpty(data.stdout)) {
    stagedFiles = { stagedFiles: false }
  } else {
    stagedFiles = { stagedFiles: data.stdout.split('\n') }
    if (_.isEmpty(_.last(stagedFiles.stagedFiles))) {
      stagedFiles.stagedFiles.pop()
    }
  }
  helpers.addTo(cache, stagedFiles)
  return cache
}

git.notStagedFiles = async (cache) => {
  let str = 'git diff --name-only'
  let notStagedFiles = {}
  const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
  if (_.isEmpty(data.stdout)) {
    notStagedFiles = { notStagedFiles: false }
  } else {
    notStagedFiles = { notStagedFiles: data.stdout.split('\n') }
    if (_.isEmpty(_.last(notStagedFiles.notStagedFiles))) {
      notStagedFiles.notStagedFiles.pop()
    }
  }
  helpers.addTo(cache, notStagedFiles)
  return cache
}

// check git branch
git.branch = async (cache) => {
  let str = 'git rev-parse --abbrev-ref HEAD'
  let isMaster = {}
  let gitBranch = {}
  const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
  if (_.isEmpty(data.stdout)) {
    isMaster = { isMaster: false }
  } else {
    var match = data.stdout.match(/\n/i)
    isMaster = data.stdout.slice(0, match.index)
    gitBranch = { gitBranch: isMaster }
    if (isMaster === `master`) {
      isMaster = { isMaster: true }
    } else {
      isMaster = { isMaster: false }
    }
  }
  helpers.addTo(cache, isMaster)
  helpers.addTo(cache, gitBranch)
  return cache
}

// current commit hash
git.currentCommitHash = async (cache) => {
  let str = 'git rev-parse --short HEAD'
  let currentCommitHash = {}
  const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
  currentCommitHash = { currentCommitHash: data.stdout.slice(0, 6) }
  helpers.addTo(cache, currentCommitHash)
  return cache
}

// git push with credentials
git.pushWithCredentials = async (cache) => {
  spinner.text = `Pushing changes to remote`
  spinner.start()
  try {
    let str = `git push https://'${cache.githubUser}:${cache.githubPass}'@${cache.remote.gitUrl}`
    await execAsync(str, { maxBuffer: 2000 * 1024 })
    spinner.succeed()
  } catch (err) {
    spinner.fail()
    console.log(chalk.red(err.stderr))
    process.exit(1)
  }
}

// git push tags with credentials
git.pushTagsWithCredentials = async (cache) => {
  spinner.text = `Pushing tags to remote`
  spinner.start()
  try {
    let str = `git push --tags https://'${cache.githubUser}:${cache.githubPass}'@${cache.remote.gitUrl}`
    await execAsync(str, { maxBuffer: 2000 * 1024 })
    spinner.succeed()
  } catch (err) {
    spinner.fail()
    console.log(chalk.red(err.stderr))
    process.exit(1)
  }
}

// git push
git.push = async (cache) => {
  let cmd = {
    spinner: `Pushing changes to remote`,
    str: `git push`
    // spinerSucceed: ''
  }
  return helpers.execCMD(cmd, cache)
}

// git push tags
git.pushTags = async (cache) => {
  let cmd = {
    spinner: `Pushing tags to remote`,
    str: `git push --tags`
    // spinerSucceed: ''
  }
  return helpers.execCMD(cmd, cache)
}

git.isRemote = async (cache) => {
  let str = 'git remote'
  let isRemote
  const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
  if (_.isEmpty(data.stdout)) {
    isRemote = false
  } else {
    var match = data.stdout.match(/\n/i)
    isRemote = data.stdout.slice(0, match.index)
  }
  helpers.addTo(cache, {isRemote})
  return cache
}

git.remote = async (cache) => {
  if (cache.isRemote) {
    let str = `git remote get-url ${cache.isRemote}`
    let remoteUrl
    let isSSH = false
    const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
    remoteUrl = data.stdout.trim()
    if (_.isEmpty(data.stdout)) {
      remoteUrl = false
    } else {
      if (_.startsWith(remoteUrl, 'git@')) {
        isSSH = true
        remoteUrl = _.replace(remoteUrl, ':', '/')
        remoteUrl = _.replace(remoteUrl, 'git@', 'https://').slice(0, -4)
      } else if (_.startsWith(remoteUrl, 'https')) {
        remoteUrl = remoteUrl.slice(0, -4)
      }
    }
    remote.isSSH = isSSH
    remote.url = remoteUrl
    remote.gitUrl = _.replace(remoteUrl, 'https://', '') + `.git`
    helpers.addTo(cache, {remote})
  }
  return cache
}

git.parseRemoteUrl = (cache) => {
  if (cache.isRemote) {
    let remoteUrl = cache.remote.url.slice(19)
    let match = remoteUrl.match(/\//i)
    remote.repoName = remoteUrl.slice(match.index + 1)
    remote.owner = remoteUrl.slice(0, match.index)
    helpers.addTo(cache, {remote})
  }
  return cache
}
