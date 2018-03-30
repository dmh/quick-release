'use strict'

const _ = require('lodash')
const chalk = require('chalk')
const Ora = require('ora')
const variables = require('../variables')
const helpers = require('../helpers')

const {exec} = require('child_process')
const {promisify} = require('util')
const execAsync = promisify(exec)

const spinner = new Ora()
const git = module.exports = {}

let file = `CHANGELOG.md`

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

// git commit
git.commit = async (cache, commitMessage) => {
  let cmd = {
    // spinner: '',
    str: `git commit -m "${commitMessage}"`
    // spinerSucceed: ''
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
    console.log(chalk.red(`Not a git repository`))
    process.exit(1)
  }
}

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

git.currentCommitHash = async (cache) => {
  let str = 'git rev-parse --short HEAD'
  let currentCommitHash = {}
  const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
  currentCommitHash = { currentCommitHash: data.stdout.slice(0,6) };
  helpers.addTo(cache, currentCommitHash)
  return cache
}

// git.remote = function remote(cache) {
//   return new Promise(function(resolve) {
//       simpleGit.getRemotes(true, function(err, remotes) {
//           let remote = remotes[0].refs.push;
//           if (_.startsWith(remote, 'git@')) {
//               remote = _.replace(remote, ':', '/');
//               remote = _.replace(remote, 'git@', 'https://').slice(0, -4);
//           }
//           remote = { remote: remote };
//           helpers.addTo(cache, remote);
//           resolve(cache);
//       });
//   });
// };

// git.parseRemoteUrl = function parseRemoteUrl(cache) {
//   return new Promise(function(resolve) {
//       simpleGit.getRemotes(true, function(err, remotes) {
//           let remoteUrl = remotes[0].refs.push;
//           let repoName = parseGighubUrl(remoteUrl).name;
//           let repoOwner = parseGighubUrl(remoteUrl).owner;
//           repoName = { repoName: repoName, repoOwner: repoOwner };
//           helpers.addTo(cache, repoName);
//           resolve(cache);
//       });
//   });
// };

git.push = async (cache) => {
  let cmd = {
    spinner: `Pushing changes to remote`,
    str: `git push`
    // spinerSucceed: ''
  }
  return helpers.execCMD(cmd, cache)
}

git.addTag = async (cache, ver) => {
  let cmd = {
    // spinner: ``,
    str: `git tag ${ver}`
    // spinerSucceed: ``
  }
  return helpers.execCMD(cmd, cache)
}

git.pushTags = async (cache) => {
  let cmd = {
    spinner: `Pushing tags to remote`,
    str: `git push --tags`
    // spinerSucceed: ''
  }
  return helpers.execCMD(cmd, cache)
}

git.addChangelogToGitIndex = async (cache) => {
  if (cache.qrconfig.changelogFile) {
    file = cache.qrconfig.changelogFile
  }
  let str = `git add ${file}`
  await execAsync(str, { maxBuffer: 2000 * 1024 })
  return cache
}

git.addPackageToGitIndex = async (cache) => {
  let file = `${process.cwd()}/package.json`
  if (cache.pkg) {
    let str = `git add ${file}`
    await execAsync(str, { maxBuffer: 2000 * 1024 })
  }
  return cache
}
