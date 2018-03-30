'use strict'

const chalk = require('chalk')
const _ = require('lodash')
const Ora = require('ora')
const helpers = require('../helpers')

const fs = require('fs')
const {exec} = require('child_process')
const {promisify} = require('util')

const execAsync = promisify(exec)
const writeFileAsync = promisify(fs.writeFile)
const readFileAsync = promisify(fs.readFile)
const appendFileAsync = promisify(fs.appendFile)

const spinner = new Ora()
const changelog = module.exports = {}

let file = `CHANGELOG.md`
let labels = ['[FEATURE]', '[FIX]', '[REFACTOR]', '[PERF]', '[DOC]', '[STYLE]', '[CHORE]', '[UPDATE]', '[TEST]', '[BUGFIX]', '[TASK]', '[CLEANUP]', '[WIP]']
let breakingChangesTitle = `:heavy_exclamation_mark:**Breaking Changes:**`
const breakingChangesLabel = ['[!!!]']
const log = {}

changelog.commitMessages = async (cache) => {
  let lastTag
  if (cache.lastTag) {
    lastTag = `${cache.lastTag}..HEAD`
  } else {
    lastTag = `HEAD`
  }
  let commitMessages = {}
  var str = `git log ${lastTag} --format=%s@#$%h`
  var data = await execAsync(str, { maxBuffer: 2000 * 1024 })
  if (_.isEmpty(data.stdout)) {
    commitMessages = { commitMessages: false }
  } else {
    commitMessages = data.stdout.split('\n')
    if (_.isEmpty(_.last(commitMessages))) {
      commitMessages.pop()
    }
  }
  log.commitMessages = commitMessages
  helpers.addTo(cache, {log})
  return cache
}

changelog.regularChanges = (cache) => {
  if (cache.qrconfig.labels) {
    labels = cache.qrconfig.labels
  }
  let regularChanges = []
  cache.log.commitMessages.forEach(function (value) {
    var val = value
    labels.forEach(function (value) {
      if (_.startsWith(val, value)) {
        var matchHash = val.match(/@#\$/i)
        var hash = val.slice(matchHash.index + 3)
        var prefix = val.match(/([^-\s])([^[]+)([\]])/)[0]
        var message = val.slice(0, matchHash.index)
        message = _.replace(message, prefix, '').trim()
        regularChanges.push({ hash: hash, prefix: prefix, message: message })
      }
    })
  })
  log.regularChanges = regularChanges
  helpers.addTo(cache, {log})
  return cache
}

changelog.breakingChanges = (cache) => {
  let breakingChanges = []
  cache.log.commitMessages.forEach(function (value) {
    var val = value
    breakingChangesLabel.forEach(function (value) {
      if (_.startsWith(val, value)) {
        var matchHash = val.match(/@#\$/i)
        var hash = val.slice(matchHash.index + 3)
        var message = val.slice(0, matchHash.index)
        var matchBreakingChangesPrefix = val.match(/([^-\s])([^[]+)([\]])/)
        var breakingChangesPrefix = matchBreakingChangesPrefix[0]
        message = message.slice(matchBreakingChangesPrefix.index + matchBreakingChangesPrefix[0].length)
        var prefix = message.match(/([^-\s])([^[]+)([\]])/)[0]
        message = _.replace(message, prefix, '').trim()
        breakingChanges.push({ hash: hash, prefix: prefix, message: message, breakingChangesPrefix: breakingChangesPrefix })
      }
    })
  })
  if (_.isEmpty(breakingChanges)) {
    breakingChanges = false
  }
  log.breakingChanges = breakingChanges
  helpers.addTo(cache, {log})
  return cache
}

changelog.formatting = (cache) => {
  const hashUrl = (value) => {
    if (cache.remote) {
      return `([${value.hash}](${cache.remote}/commit/${value.hash}))`
    } else {
      return `(**[${value.hash}]**)`
    }
  }
  if (cache.qrconfig.breakingChangesTitle) {
    breakingChangesTitle = cache.qrconfig.breakingChangesTitle
  }
  let formatRegularChanges = ''
  cache.log.regularChanges.forEach(function (value) {
    formatRegularChanges = `${formatRegularChanges}- **${value.prefix}** ${value.message} ${hashUrl(value)}\n`
  })
  let formatBreakingChanges = ''
  if (cache.log.breakingChanges) {
    cache.log.breakingChanges.forEach(function (value) {
      formatBreakingChanges = `${formatBreakingChanges}- **${value.breakingChangesPrefix}** **${value.prefix}** ${value.message} ${hashUrl(value)}\n`
    })
    formatBreakingChanges = `${breakingChangesTitle}\n${formatBreakingChanges}\n`
  }
  let rawChangelog = `${formatRegularChanges}\n${formatBreakingChanges}\n`
  let changelog = `\n#### v${cache.newVersion} \`${cache.dateNow}\`\n${formatRegularChanges}\n${formatBreakingChanges}***\n`
  log.rawChangelog = rawChangelog
  log.changelog = changelog
  helpers.addTo(cache, {log})
  return cache
}

changelog.isChangelog = async (cache) => {
  if (cache.qrconfig.changelogFile) {
    file = cache.qrconfig.changelogFile
  }
  let src = `${process.cwd()}/${file}`
  if (fs.existsSync(src)) {
    return cache
  } else {
    await writeFileAsync(file, '')
    return cache
  }
}

changelog.write = async (cache) => {
  spinner.text = 'Writing changelog...'
  spinner.start()
  if (cache.qrconfig.changelogFile) {
    file = cache.qrconfig.changelogFile
  }
  try {
    const data = await readFileAsync(file)
    await writeFileAsync(file, cache.log.changelog)
    await appendFileAsync(file, data)
    spinner.succeed(`${file} updated`)
    return cache
  } catch (err) {
    spinner.fail()
    throw err
  }
}

changelog.addChangelogToGitIndex = async (cache) => {
  if (cache.qrconfig.changelogFile) {
    file = cache.qrconfig.changelogFile
  }
  let str = `git add ${file}`
  await execAsync(str, { maxBuffer: 2000 * 1024 })
  return cache
}

changelog.changelogDraft = (cache) => {
  let regularChanges = ''
  cache.log.regularChanges.forEach(function (value, index, col) {
    if (index === col.length - 1) {
      regularChanges = chalk`${regularChanges} • {bold ${value.prefix}} ${value.message} {gray.dim (${value.hash})} `
    } else {
      regularChanges = chalk`${regularChanges} • {bold ${value.prefix}} ${value.message} {gray.dim (${value.hash})}\n`
    }
  })

  let breakingChanges = ''
  if (cache.log.breakingChanges) {
    cache.log.breakingChanges.forEach(function (value, index, col) {
      if (index === col.length - 1) {
        breakingChanges = chalk`${breakingChanges} • {bold ${value.breakingChangesPrefix}} {bold ${value.prefix}} ${value.message} {gray.dim (${value.hash})}`
      } else {
        breakingChanges = chalk`${breakingChanges} • {bold ${value.breakingChangesPrefix}} {bold ${value.prefix}} ${value.message} {gray.dim (${value.hash})}\n`
      }
    })
    breakingChanges = chalk`\n{bgBlack.bold Breaking Changes:}\n${breakingChanges}`
  }

  let changelogHeader = chalk`{yellow.bold v${cache.newVersion}} {bgBlack ${cache.dateNow}}\n`
  return chalk`{gray.bold Changelog Draft:}\n` + `${changelogHeader}` + `${regularChanges}` + breakingChanges
}
