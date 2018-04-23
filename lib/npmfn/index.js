'use strict'

const chalk = require('chalk')
const helpers = require('../helpers')
var validate = require('validate-npm-package-name')
const Ora = require('ora')

const fs = require('fs')
const {exec} = require('child_process')
const {promisify} = require('util')

const execAsync = promisify(exec)
const writeFileAsync = promisify(fs.writeFile)
const readFileAsync = promisify(fs.readFile)

const spinner = new Ora()

const npmfn = module.exports = {}

// validate npm package name
npmfn.validatePkgName = async (cache) => {
  if (cache.pkg) {
    const data = await validate(cache.pkg.name)
    if (!data.validForNewPackages) {
      console.log(chalk.red(`Invalid NPM package name ${chalk.yellow(cache.pkg.name)}`))
      if (data.warnings) {
        console.log(data.warnings)
      }
      if (data.errors) {
        console.log(data.errors)
      }
      process.exit(1)
    }
  }
}

// check if npm user added (npm whoami)
npmfn.isLogged = async (cache) => {
  spinner.text = `Checking NPM user`
  spinner.start()
  try {
    const str = 'npm whoami'
    const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
    let npmUser = data.stdout.trim()
    helpers.addTo(cache, {npmUser})
    spinner.succeed()
    return cache
  } catch (err) {
    spinner.fail(`Error. You need to authorize this machine using npm adduser command`)
    console.log(chalk.red(`\n${err.stderr}`))
    process.exit(1)
  }
}

npmfn.bumpPackageVersion = async (cache) => {
  if (cache.pkg) {
    let file = `${process.cwd()}/package.json`
    try {
      const data = await readFileAsync(file)
      let dataJson = JSON.parse(data)
      dataJson.version = cache.newVersion
      dataJson = JSON.stringify(dataJson, null, 2) + `\n`
      await writeFileAsync(file, dataJson)
      return cache
    } catch (err) {
      throw err
    }
  }
}

npmfn.publish = async (cache) => {
  spinner.text = `Publishing Npm package`
  spinner.start()
  try {
    const str = 'npm publish'
    await execAsync(str, { maxBuffer: 2000 * 1024 })
    let npmPublish = true
    helpers.addTo(cache, {npmPublish})
    spinner.succeed('Npm package successfully published')
    return cache
  } catch (err) {
    let npmPublish = false
    helpers.addTo(cache, {npmPublish})
    spinner.fail(`Npm package was not published`)
    console.log(`\n${err.stderr}`)
    return cache
  }
}
