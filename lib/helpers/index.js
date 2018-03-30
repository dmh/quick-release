'use strict'

const _ = require('lodash')
const boxen = require('boxen')
const Ora = require('ora')

const {promisify} = require('util')
const { exec } = require('child_process')
const execAsync = promisify(exec)

const spinner = new Ora()
const helpers = module.exports = {}

helpers.addTo = function stats (cache, val) {
  if (val) {
    _.assign(cache, val)
  }
}

// helpers.error = function stats (err) {
//   let divider = `==========================================\n`
//   return console.log(divider + chalk.red(err.stack))
// }

// helpers.random = function random () {
//   return Math.floor((Math.random() * 1000000) + 1)
// }

// helpers.escapeRegExp = function escapeRegExp (string) {
//   return string.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1')
// }

// helpers.pwd = function pwd () {
//   return process.cwd()
// }

helpers.execCMD = async (cmd, cache) => {
  if (cmd.spinner) {
    spinner.text = cmd.spinner
    spinner.start()
  }
  try {
    await execAsync(cmd.str, { maxBuffer: 2000 * 1024 })
    if (cmd.spinner) {
      cmd.spinerSucceed ? spinner.succeed(cmd.spinerSucceed) : spinner.succeed()
    }
    return cache
  } catch (err) {
    if (err.stderr) {
      spinner.fail(err.stderr)
    } else {
      spinner.fail()
    }
    throw err
  }
}

helpers.message = (cache, message, color = `cyan`, style = `round`, pad = [0, 3, 0, 0]) => {
  let showMessage = boxen(
    message,
    {
      padding: { top: pad[0], right: pad[1], bottom: pad[2], left: pad[3] },
      margin: { top: 1, right: 0, bottom: 1, left: 0 },
      borderColor: color,
      borderStyle: style
    }
  )
  console.log(showMessage)
  return cache
}
