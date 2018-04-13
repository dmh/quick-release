'use strict'

const _ = require('lodash')
const chalk = require('chalk')
const Ora = require('ora')
const octokit = require('@octokit/rest')()
const helpers = require('../helpers')
const text = require('../text')

const {exec} = require('child_process')
const {promisify} = require('util')
const execAsync = promisify(exec)

const spinner = new Ora()
const github = module.exports = {}

const githubAuth = {}

github.token = async (cache) => {
  try {
    let str = 'git config --get github.token'
    const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
    if (_.isEmpty(data.stdout)) {
      githubAuth.token = false
    } else {
      githubAuth.token = data.stdout.trim()
    }
  } catch (err) {
    githubAuth.token = false
  }
  helpers.addTo(cache, {githubAuth})
  return cache
}

github.user = async (cache) => {
  try {
    let str = 'git config --get github.user'
    const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
    if (_.isEmpty(data.stdout)) {
      githubAuth.user = false
    } else {
      githubAuth.user = data.stdout.trim()
    }
  } catch (err) {
    githubAuth.user = false
  }
  helpers.addTo(cache, {githubAuth})
  return cache
}

github.checkGithubToken = async (cache) => {
  if (cache.githubAuth.token) {
    spinner.text = `Checking Github token`
    spinner.start()
    try {
      octokit.authenticate({
        type: 'token',
        token: cache.githubAuth.token
      })
      await octokit.users.get({})
      githubAuth.isToken = true
      helpers.addTo(cache, {githubAuth})
      spinner.succeed()
      return cache
    } catch (err) {
      spinner.fail('Wrong Github token')
      githubAuth.isToken = false
      helpers.addTo(cache, {githubAuth})
      return cache
    }
  }
}

github.createRelease = async (cache) => {
  spinner.text = `Publishing Github Release`
  spinner.start()
  try {
    if (cache.githubAuth.isToken) {
      octokit.authenticate({
        type: 'token',
        token: cache.githubAuth.token
      })
    } else {
      octokit.authenticate({
        type: 'basic',
        username: cache.githubUser,
        password: cache.githubPass
      })
    }
    const msg = {
      owner: cache.remote.owner,
      repo: cache.remote.repoName,
      tag_name: cache.newVersion,
      name: `v${cache.newVersion}`,
      body: cache.log.rawChangelog
    }
    await octokit.repos.createRelease(msg)
    let githubRelease = true
    helpers.addTo(cache, {githubRelease})
    spinner.succeed('Github Release successfully published')
    return cache
  } catch (err) {
    const msg = JSON.parse(err).message
    if (err.code === 401) {
      spinner.fail(`${chalk.red(msg)} Github Release was not published`)
    } else {
      spinner.fail(`${chalk.red(`Something went wrong`)} Github Release was not published`)
    }
    await helpers.message(cache, text.manualGithubRelease(cache))
    let githubRelease = false
    helpers.addTo(cache, {githubRelease})
    console.log(err)
    return cache
  }
}

github.test = async (cache) => {
  try {
    octokit.authenticate({
      type: 'token',
      token: cache.githubAuth.token
    })
    const result = await octokit.issues.create({
      owner: 'dmh',
      repo: 'test',
      title: 'first test3',
      body: 'I am the first issue being created with the GitHub Node.js client!'
    })
    console.log(result)
  } catch (err) {
    console.log(err)
  }
}
