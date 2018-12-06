'use strict'

const chalk = require('chalk')
const Ora = require('ora')
const isOnline = require('is-online')
const semver = require('semver')
const variables = require('../variables')
const text = require('../text')

const { exec } = require('child_process')
const {promisify} = require('util')
const execAsync = promisify(exec)

const spinner = new Ora()

const check = module.exports = {}

check.isGitInstalled = async () => {
  try {
    let str = 'which git'
    await execAsync(str, { maxBuffer: 2000 * 1024 })
  } catch (err) {
    console.log(text.check.isGitInstalled())
    process.exit(1)
  }
}

check.isNodeInstalled = async () => {
  try {
    let str = 'which node'
    await execAsync(str, { maxBuffer: 2000 * 1024 })
  } catch (err) {
    console.log(text.check.isNodeInstalled())
    process.exit(1)
  }
}

check.isNodeVerCorrect = () => {
  // Check node version
  const minNodeVer = semver.valid(variables.env.node)
  const nodeVer = semver.valid(process.version)
  if (semver.lt(nodeVer, minNodeVer)) {
    console.log(text.check.isNodeVerCorrect())
    process.exit(1)
  }
}

check.isOnline = async () => {
  spinner.text = `Checking internet connection`
  spinner.start()
  const data = await isOnline()
  if (data) {
    spinner.succeed()
  } else {
    spinner.fail(chalk.red('No internet connection'))
    console.log('Try again later')
    process.exit(1)
  }
}
