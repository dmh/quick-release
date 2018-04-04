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


prompt.siteName = async (cache) => {
  const siteName = [
    {
      type: 'input',
      name: 'siteName',
      message: `bla bla`,
      filter: function (value) {
        return value.trim()
      },
      validate: function (value) {
        if (value.length === 0) {
          return chalk.red(text.err.noName)
        } else if (/\s/g.test(value)) {
          return chalk.red(text.err.oneWord)
        } else if (/[-_.]/g.test(value)) {
          return chalk.red(text.err.camelCase)
        } else if (value[0] === value[0].toUpperCase()) {
          return chalk.red(text.err.capitalLetter)
        }
        return true
      }
    },
    {
      type: 'confirm',
      name: 'isOk',
      message: `isOk`,
      default: true
    }
  ]

  const recursivePrompt = async () => {
    const answers = await inquirer.prompt(siteName)
    if (answers.isOk === false) {
      await recursivePrompt()
    } else if (answers.isOk === true) {
      helpers.addTo(cache, {sitename: answers.siteName})
      return cache
    }
  }
  await recursivePrompt()
}

prompt.isGithubRelease = async (cache) => {
  const isGithubRelease = [
    {
      name: 'isGithubRelease',
      type: 'confirm',
      message: 'Github Release?'
    }
  ];
  const answers = await inquirer.prompt(isGithubRelease)
  if (answers) {
    helpers.addTo(cache, answers)
    return cache
  }
}

prompt.isNpmPublish = async (cache) => {
  const isNpmPublish = [
    {
      name: 'isNpmPublish',
      type: 'confirm',
      message: 'Npm publish?'
    }
  ]
  const answers = await inquirer.prompt(isNpmPublish)
  if (answers) {
    helpers.addTo(cache, answers)
    return cache
  }
}

prompt.isGitPush = async (cache) => {
  const isGitPush = [
    {
      name: 'isGitPush',
      type: 'confirm',
      message: 'Push to remote?'
    }
  ];
  const answers = await inquirer.prompt(isGitPush)
  if (answers) {
    helpers.addTo(cache, answers)
    return cache
  }
}

prompt.isPackageJsonBump = async (cache) => {
  const isPackageJsonBump = [
    {
      name: 'isPackageJsonBump',
      type: 'confirm',
      message: 'Update to new version package.json file?'
    }
  ]
  const answers = await inquirer.prompt(isPackageJsonBump)
  if (answers) {
    helpers.addTo(cache, answers)
    return cache
  }
}

prompt.gitAdd = async (cache) => {
  const gitAdd = [
    {
      name: 'gitAdd',
      type: 'confirm',
      // default: false,
      message: 'Do you want add all files to git index? --> ' + chalk.red('git add .')
    }
  ]
  const answers = await inquirer.prompt(gitAdd)
  if (answers) {
    helpers.addTo(cache, answers)
    return cache
  }
}

prompt.customProjectType = async (cache) => {
  const customProjectType = [
    {
      name: 'releaseType',
      type: 'checkbox',
      message: 'Select types:',
      choices: [
        {
          name: 'Changelog',
          checked: true,
          value: 'changelog'
        },
        {
          name: 'Push files to remote',
          checked: true,
          value: 'push'
        },
        {
          name: 'Github Release API',
          checked: true,
          value: 'githubRelease'
        },
        {
          name: 'NPM publish',
          checked: true,
          value: 'npm'
        }
      ]
    }
  ]
  const answers = await inquirer.prompt(customProjectType)
  if (answers) {
    helpers.addTo(cache, answers)
    return cache
  }
}

// prompt.githubUser = function githubUser(cache) {
//     return new Promise(function(resolve, reject) {
//         let githubUser = [
//             {
//                 name: 'askGithubUser',
//                 type: 'input',
//                 message: 'Github user:',
//             }
//         ];
//         if (!cache.githubUser && cache.isGithubRelease) {
//             inquirer.prompt(githubUser , function(answers) {
//                 if (answers) {
//                     helpers.addTo(cache, answers);
//                     resolve(cache);

//                 } else {
//                     reject(Error('in prompt.githubUser'));
//                 }
//             });
//         } else {
//             resolve(cache);
//         }
//     });
// };

// prompt.githubPass = function githubPass(cache) {
//     return new Promise(function(resolve, reject) {
//         let githubPass = [
//             {
//                 name: 'askGithubPass',
//                 type: 'password',
//                 message: 'Github password:',
//             }
//         ];
//         if (!cache.githubToken && cache.isGithubRelease) {
//             inquirer.prompt(githubPass , function(answers) {
//                 if (answers) {
//                     helpers.addTo(cache, answers);
//                     resolve(cache);

//                 } else {
//                     reject(Error('in prompt.githubPass'));
//                 }
//             });
//         } else {
//             resolve(cache);
//         }
//     });
// };

// TODO: add commit, tag, push into one question

// ask to select variants
// prompt.whatToDo = function whatToDo (cache) {
//   return new Promise(function (resolve, reject) {
//     let whatToDo = [
//       {
//         name: `whatToDo`,
//         type: `list`,
//         message: `Select variants:`,
//         choices: [
//           {
//             name: `${text.subtheme.description}`,
//             value: `subtheme`
//           },
//           {
//             name: `${text.release.description}`,
//             value: `release`
//           },
//           {
//             name: `Help`,
//             value: `help`
//           }
//         ]
//       }
//     ]
//     inquirer.prompt(whatToDo)
//     .then(function (answers) {
//       helpers.addTo(cache, answers)
//       resolve(cache)
//     })
//   })
// }

// ask main subtheme_t3kit questions
// prompt.siteName = function siteName (cache) {
//   return new Promise(function (resolve) {
//     let siteName = [
//       {
//         type: 'input',
//         name: 'siteName',
//         message: `${text.subtheme.siteName} ${chalk.dim(text.subtheme.hint.siteName)}`,
//         filter: function (value) {
//           return value.trim()
//         },
//         validate: function (value) {
//           if (value.length === 0) {
//             return chalk.red(text.subtheme.err.noName)
//           } else if (/\s/g.test(value)) {
//             return chalk.red(text.subtheme.err.oneWord)
//           } else if (/[-_.]/g.test(value)) {
//             return chalk.red(text.subtheme.err.camelCase)
//           } else if (value[0] === value[0].toUpperCase()) {
//             return chalk.red(text.subtheme.err.capitalLetter)
//           }
//           return true
//         }
//       },
//       {
//         type: 'confirm',
//         name: 'isOk',
//         message: text.subtheme.siteNameIsOk,
//         default: true
//       }
//     ]
//     function recursivePrompt () {
//       inquirer.prompt(siteName)
//       .then(function (answers) {
//         if (fs.existsSync(variables.subtheme.dirName(answers))) {
//           console.log(` ${chalk.yellow(text.subtheme.warning.nameAlreadyExists(answers))}`)
//         }
//         if (answers.isOk === false) {
//           recursivePrompt()
//         } else if (answers.isOk === true) {
//           helpers.addTo(cache, answers)
//           resolve(cache)
//         }
//       })
//     }
//     recursivePrompt()
//   })
// }

// ask folder name
prompt.dirName = async (cache) => {
  let dirName = [
    {
      type: 'imput',
      name: 'dirName',
      message: `dirName`,
      filter: function (value) {
        return value.trim()
      },
      // default: function () {
      //   return variables.subtheme.dirName(cache)
      // },
      validate: function (value) {
        if (!fs.existsSync(value)) {
          return true
        }
        return chalk.red(text.err.dirName)
      }
    }
  ]
  const answers = await inquirer.prompt(dirName)
  if (answers) {
    helpers.addTo(cache, answers);
    return cache
  }
}

prompt.isOk = async (cache, message, fn) => {
  let isOk = [
    {
      name: `isOk`,
      type: 'confirm',
      message: message
    }
  ]
  const answers = await inquirer.prompt(isOk)
  if (answers.isOk) {
    return cache
  } else {
    if (fn) {
      return fn(cache)
    } else {
      process.exit(1)
    }
  }
}
