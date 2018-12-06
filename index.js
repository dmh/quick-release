#!/usr/bin/env node

'use strict'

const chalk = require('chalk')
const mri = require('mri')
const prompt = require('./lib/prompt')
const helpers = require('./lib/helpers')
const text = require('./lib/text')
const subTask = require('./lib/tasks/subTask')
const local = require('./lib/tasks/local')
const githubRelease = require('./lib/tasks/githubRelease')
const githubNpmRelease = require('./lib/tasks/githubNpmRelease')

const args = process.argv.slice(2)

var cache = {}

const run = async () => {
  try {
    await subTask.sysTest(cache)
    await subTask.repoInfo(cache)
    if (!cache.releaseType) {
      await prompt.releaseType(cache)
    }
    if (cache.releaseType === `local`) {
      await local.go(cache)
    } else if (cache.releaseType === `github`) {
      await githubRelease.go(cache)
    } else if (cache.releaseType === `githubNpm`) {
      await githubNpmRelease.go(cache)
    } else if (cache.releaseType === 'help') {
      console.log(text.help(cache))
    }
    // console.log('log')
    // console.log(cache)
  } catch (err) {
    console.log(chalk.red(text.err.stack))
    console.log(err)
  }
}

// scan for CLI flags and arguments
if (args.length) {
  const scanArgs = mri(args)

  // quick-release -h, --help
  if (scanArgs.h === true || scanArgs.help === true) {
    console.log(text.help(cache))

    // quick-release  -v, --version
  } else if (scanArgs.v === true || scanArgs.version === true) {
    console.log(text.v)

  // quick-release -l, --local
  } else if (scanArgs.l === true || scanArgs.local === true) {
    cache.releaseType = 'local'
    helpers.message(cache, chalk.cyan(`Local Release`), `gray`, true, [0, 1, 0, 1], `round`, [1, 0])
    run()

  // quick-release -g, --github
  } else if (scanArgs.g === true || scanArgs.github === true) {
    cache.releaseType = 'github'
    helpers.message(cache, chalk.cyan(`Github Release`), `gray`, true, [0, 1, 0, 1], `round`, [1, 0])
    run()

    // quick-release -n, --npm
  } else if (scanArgs.n === true || scanArgs.npm === true) {
    cache.releaseType = 'githubNpm'
    helpers.message(cache, chalk.cyan(`Github + Npm Release`), `gray`, true, [0, 1, 0, 1], `round`, [1, 0])
    run()
  } else {
    console.log(text.help(cache))
  }
} else {
  run()
}

// TODO: add code comments
// TODO: notification when a new version is available
