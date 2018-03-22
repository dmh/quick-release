'use strict'

const _assign = require('lodash/assign')
const chalk = require('chalk')
const boxen = require('boxen')

const Ora = require('ora')
const spinner = new Ora()
// const exec = require('child_process').exec
const {promisify} = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

const helpers = module.exports = {}

helpers.addTo = function stats (cache, val) {
  if (val) {
    _assign(cache, val)
  }
}

helpers.promiseChainStarter = function promiseChainStarter (val) {
  return new Promise(function (resolve) {
    resolve(val)
  })
}

helpers.error = function stats (err) {
  let divider = `==========================================\n`
  return console.log(divider + chalk.red(err.stack))
}

helpers.random = function random () {
  return Math.floor((Math.random() * 1000000) + 1)
}

helpers.escapeRegExp = function escapeRegExp (string) {
  return string.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1')
}

helpers.pwd = function pwd () {
  return process.cwd()
}

helpers.appName = function appName () {
  let pkgV = require(`${process.cwd()}/package.json`)
  return pkgV.name
}

// helpers.execCMD = function execCMD (cmd, cache) {
//   return new Promise(function (resolve, reject) {
//     if (cmd.spinner) {
//       ora.text = cmd.spinner
//       ora.start()
//     }
//     exec(cmd.str, { maxBuffer: 2000 * 1024 }, (error) => {
//       if (error) {
//         if (cmd.spinner) {
//           spinner.fail(`[${cmd.str}] -> error`)
//         }
//         reject(new Error(error))
//       } else {
//         if (cmd.spinner) {
//           cmd.spinerSucceed ? spinner.succeed(cmd.spinerSucceed) : spinner.succeed()
//         }
//         resolve(cache)
//       }
//     })
//   })
// }






helpers.execCMD = async (cmd, cache) => {
  if (cmd.spinner) {
    spinner.text = cmd.spinner
    spinner.start()
  }
  // TODO:
  await new Promise((resolve, reject) => setTimeout(resolve, 3000));

  try {
    let execObj = await execAsync(cmd.str, { maxBuffer: 2000 * 1024 })
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
    throw err;
  }
}

helpers.message = (cache, message, color=`cyan`, style=`round`) => {
  let showMessage = boxen(
    message,
    {
      padding: { top: 0, right: 3, bottom: 0, left: 0 },
      margin: { top: 1, right: 0, bottom: 1, left: 0 },
      borderColor: color,
      borderStyle: style
    }
  )
  console.log(showMessage)
  return cache
}
