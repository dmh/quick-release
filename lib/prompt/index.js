'use strict'

const chalk = require('chalk')
const semver = require('semver')
const helpers = require('../helpers')
const text = require('../text')
const inquirer = require('inquirer')

const prompt = module.exports = {}

let confirm = {}

prompt.releaseType = async (cache) => {
  let releaseType = [
    {
      name: 'releaseType',
      type: 'list',
      message: 'Release type:',
      choices: [
        {
          name: 'Local Release',
          value: 'local'
        },
        {
          name: 'Github Release',
          value: 'github'
        },
        {
          name: 'Github + NPM Release',
          value: 'githubNpm'
        },
        {
          name: 'Help',
          value: 'help'
        }
      ]
    }
  ]
  let answers = await inquirer.prompt(releaseType)
  if (answers) {
    helpers.addTo(cache, answers)
    return cache
  }
}

prompt.isGood = async (cache) => {
  let isGood = [
    {
      name: 'isGood',
      type: 'confirm',
      message: 'Looks good?'
    }
  ]
  let answers = await inquirer.prompt(isGood)
  if (answers) {
    if (answers.isGood) {
      return cache
    } else {
      process.exit(1)
    }
  }
}

prompt.confirm = async (cache, name, msg) => {
  // if (cache.confirm) {
  //   cache.confirm = {}
  // }
  // let confirm
  let isGood = [
    {
      name: name,
      type: 'confirm',
      message: msg
    }
  ]
  let answers = await inquirer.prompt(isGood)
  if (answers) {
    if (answers) {
      confirm[name] = answers[name]
      helpers.addTo(cache, {confirm})
    }
    return cache
  }
}

prompt.specifyVer = async (cache) => {
  let specifyVer = [
    {
      name: 'newVersion',
      type: 'input',
      message: 'New Version',
      filter: function (value) {
        return value.trim()
      },
      validate: function (value) {
        if (semver.valid(value) === null) {
          return chalk.red('use semantic versioning')
        }
        return true
      }
    }
  ]
  let answers = await inquirer.prompt(specifyVer)
  if (answers) {
    helpers.addTo(cache, answers)
    return cache
  }
}
prompt.newVersion = async (cache) => {
  let newVersion = [
    {
      name: 'newVersion',
      type: 'list',
      message: `Bump version from ${cache.lastTag} to:`,

      choices: [
        {
          name: semver.inc(cache.lastTag, 'patch'),
          value: semver.inc(cache.lastTag, 'patch')
        },
        {
          name: semver.inc(cache.lastTag, 'minor'),
          value: semver.inc(cache.lastTag, 'minor')
        },
        {
          name: semver.inc(cache.lastTag, 'major'),
          value: semver.inc(cache.lastTag, 'major')
        },
        {
          name: 'Specify version',
          value: 'custom'
        }
      ]
    }
  ]
  let answers = await inquirer.prompt(newVersion)
  if (answers) {
    if (answers.newVersion === 'custom') {
      await prompt.specifyVer(cache)
    } else {
      helpers.addTo(cache, answers)
      return cache
    }
  }
}

prompt.githubUser = async (cache) => {
  const githubUser = [
    {
      name: 'githubUser',
      type: 'input',
      message: 'Github user:',
      filter: function (value) {
        return value.trim()
      },
      validate: function (value) {
        if (value.length === 0) {
          return chalk.red(text.err.noName)
        } else if (/\s/g.test(value)) {
          return chalk.red(text.err.oneWord)
        }
        return true
      }
    }
  ]
  const answers = await inquirer.prompt(githubUser)
  if (answers) {
    helpers.addTo(cache, answers)
    return cache
  }
}

prompt.githubPass = async (cache) => {
  const githubPass = [
    {
      name: 'githubPass',
      type: 'password',
      message: 'Github password:',
      filter: function (value) {
        return value.trim()
      },
      validate: function (value) {
        if (value.length === 0) {
          return chalk.red(text.err.noName)
        } else if (/\s/g.test(value)) {
          return chalk.red(text.err.oneWord)
        }
        return true
      }
    }
  ]
  const answers = await inquirer.prompt(githubPass)
  if (answers) {
    helpers.addTo(cache, answers)
    return cache
  }
}
