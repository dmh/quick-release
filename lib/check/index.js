'use strict'

const variables = require('../variables')
const text = require('../text')

const { exec } = require('child_process')
const {promisify} = require('util')
const execAsync = promisify(exec)

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
  const nodeVer = variables.env.node
  if (Number(process.version.match(/^v(\d+\.\d+)/)[1]) < nodeVer) {
    // console.log(chalk.red(text.checkNodeJs) + chalk.green('>= ' + variables.env.node + '.0'))
    console.log(text.check.isNodeVerCorrect())
    process.exit(1)
  }
}

// check.folder = (cache) => {
//   // Check folder
//   if (!helpers.pwd().endsWith('typo3conf/ext')) {
//     return prompt.isOk(cache, text.subtheme.hint.dirName)
//   } else {
//     return cache
//   }
// }

// check.isFolderExist = function isFolderExist (cache) {
//   let isFolderExist = {}
//   if (fs.existsSync(variables.subtheme.dirName(cache))) {
//     isFolderExist.isFolderExist = true
//   } else {
//     isFolderExist.isFolderExist = false
//   }
//   helpers.addTo(cache, isFolderExist)
//   return cache
// }
