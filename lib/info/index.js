'use strict'

const dateFormat = require('dateformat')
const helpers = require('../helpers')

var fs = require('fs')
const {promisify} = require('util')
const readFileAsync = promisify(fs.readFile)

const info = module.exports = {}

info.pkg = async (cache) => {
  let file = `${process.cwd()}/package.json`
  if (fs.existsSync(file)) {
    let pkg = require(file)
    let {name, version} = pkg
    helpers.addTo(cache, {'pkg': {name, version}})
  } else {
    let pkg = {pkg: false}
    helpers.addTo(cache, pkg)
  }
  return cache
}

info.dateNow = async (cache) => {
  let now = new Date()
  let dateNow = { dateNow: dateFormat(now, 'longDate') }
  helpers.addTo(cache, dateNow)
  return cache
}

info.qrconfig = async (cache) => {
  let file = `${process.cwd()}/.qrconfig`
  if (fs.existsSync(file)) {
    let qrconfig = await readFileAsync(file)
    qrconfig = JSON.parse(qrconfig)
    helpers.addTo(cache, {qrconfig})
  } else {
    let qrconfig = {qrconfig: false}
    helpers.addTo(cache, qrconfig)
  }
  return cache
}

// info.changelogDraft = (cache) => {
//   let regularChanges = ''
//   cache.log.regularChanges.forEach(function (value, index, col) {
//     if (index === col.length - 1) {
//       regularChanges = chalk`${regularChanges} • {bold ${value.prefix}} ${value.message} {gray.dim (${value.hash})} `
//     } else {
//       regularChanges = chalk`${regularChanges} • {bold ${value.prefix}} ${value.message} {gray.dim (${value.hash})}\n`
//     }
//   })

//   let breakingChanges = ''
//   if (cache.log.breakingChanges) {
//     cache.log.breakingChanges.forEach(function (value, index, col) {
//       if (index === col.length - 1) {
//         breakingChanges = chalk`${breakingChanges} • {bold ${value.breakingChangesPrefix}} {bold ${value.prefix}} ${value.message} {gray.dim (${value.hash})}`
//       } else {
//         breakingChanges = chalk`${breakingChanges} • {bold ${value.breakingChangesPrefix}} {bold ${value.prefix}} ${value.message} {gray.dim (${value.hash})}\n`
//       }
//     })
//     breakingChanges = chalk`\n{bgBlack.bold Breaking Changes:}\n${breakingChanges}`
//   }

//   let changelogHeader = chalk`{yellow.bold v${cache.newVersion}} {bgBlack ${cache.dateNow}}\n`

//   return chalk`{gray.bold Changelog Draft:}\n` + `${changelogHeader}` + `${regularChanges}` + breakingChanges
// }

// info.changelogFile = async (cache) => {
//   let changelogFile = true
//   let file = 'CHANGELOG.md'
//   if (cache.qrconfig.changelogFile) {
//     file = cache.qrconfig.changelogFile
//   }
//   let filePath = `${process.cwd()}/${file}`
//   if (fs.existsSync(filePath)) {
//     helpers.addTo(cache, {changelogFile})
//   } else {
//     helpers.addTo(cache, {changelogFile: false})
//   }
//   return cache
// }
