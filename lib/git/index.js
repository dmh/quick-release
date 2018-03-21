
'use strict'

const _isEmpty = require('lodash/isEmpty')
const _last = require('lodash/last')
const Ora = require('ora')
const variables = require('../variables')
const helpers = require('../helpers')
const { exec } = require('child_process');
const {promisify} = require('util');
const chalk = require('chalk')

const spinner = new Ora()
const execAsync = promisify(exec);

const git = module.exports = {}

// clone git repo
git.clone = async (cache, link) => {
  let cmd = {
    spinner: `Cloning`,
    str: `git clone --single-branch -b master ${link} ${cache.dirName || variables.subtheme.dirName(cache)}`,
    spinerSucceed: 'Successfully cloned'
  }
  return await helpers.execCMD(cmd, cache)
}

// remove git repo
git.removeRepo = async (cache) => {
  let cmd = {
    // spinner: '',
    str: `rm -rf .git`
    // spinerSucceed: ''
  }
  return await helpers.execCMD(cmd, cache)
}

// git init
git.init = async (cache) => {
  let cmd = {
    // spinner: '',
    str: `git init`
    // spinerSucceed: ''
  }
  return await helpers.execCMD(cmd, cache)
}

// git add
git.add = async (cache) => {
  let cmd = {
    // spinner: '',
    str: `git add .`
    // spinerSucceed: ''
  }
  return await helpers.execCMD(cmd, cache)
}

// git commit
git.commit = async (cache, commitMessage) => {
  let cmd = {
    // spinner: '',
    str: `git commit -m "${commitMessage}"`
    // spinerSucceed: ''
  }
  return await helpers.execCMD(cmd, cache)
}

// git checkout
git.checkout = async (cache) => {
  let cmd = {
    // spinner: '',
    str: `git checkout ${cache.templateVersion}`
    // spinerSucceed: ''
  }
  return await helpers.execCMD(cmd, cache)
}

git.isTag = async (cache) => {
  let str = 'git tag -l'
  let isTag = {}
  let gitTag = await execAsync(str, { maxBuffer: 2000 * 1024 })

  if (_isEmpty(gitTag.stdout)) {
    isTag = { isTag: false }
  } else {
    isTag = { isTag: true }
  }
  helpers.addTo(cache, isTag)
  return cache
}

git.getLastTag = async (cache) => {
    let str = 'git describe --abbrev=0 --tags'
    let lastTag = {}
    if (cache.isTag) {
      let gitTag = await execAsync(str, { maxBuffer: 2000 * 1024 })
      if (_isEmpty(gitTag.stdout)) {
        lastTag = { lastTag: false }
      } else {
        var match = gitTag.stdout.match(/\n/i)
        lastTag = gitTag.stdout.slice(0, match.index)
        lastTag = { lastTag: lastTag }
      }
    } else {
      lastTag = { lastTag: false }
    }
    helpers.addTo(cache, lastTag)
    return cache
}

git.isRepo = async (cache) => {
  try {
    const str = 'git status'
    let isRepo = {}
    const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
    if (_isEmpty(data.stdout)) {
      isRepo = { isRepo: false }
    } else {
      isRepo = { isRepo: true }
    }
    helpers.addTo(cache, isRepo)
    return cache
  } catch(err) {
    console.log(chalk.red(`Not a git repository`))
    process.exit(1)
  }
}


// TODO:
// console.log(data)

// TODO:
// git.check = function check(cache) {
//   return new Promise(function(resolve) {
//       simpleGit.status(function(err, st) {
//           if (_.isEmpty(st.conflicted.length) && !st.ahead && !st.behind && !_.isEmpty(st.tracking)) {
//               resolve(cache);
//           } else {
//               console.log(chalk.red.bold('Repo is not ready for release!'));
//               console.log(chalk.yellow('Check git status'));
//               // TODO: add explanation to every error type
//               console.log(st);
//               shell.exit(1);
//           }
//       });
//   });
// };

git.stagedFiles = async (cache) => {
  let str = 'git diff --name-only --cached';
  let stagedFiles = {}
  const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
  if (_isEmpty(data.stdout)) {
    stagedFiles = { stagedFiles: false };
  } else {
    stagedFiles = { stagedFiles: data.stdout.split('\n') };
    if (_isEmpty(_last(stagedFiles.stagedFiles))) {
      stagedFiles.stagedFiles.pop();
    }
  }
  helpers.addTo(cache, stagedFiles)
  return cache
}

git.branch = async (cache) => {
  let str = 'git rev-parse --abbrev-ref HEAD';
  let isMaster = {}
  let gitBranch = {}
  const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
  if (_isEmpty(data.stdout)) {
    isMaster = { isMaster: false };
  } else {
    var match = data.stdout.match(/\n/i)
    isMaster = data.stdout.slice(0, match.index)
    gitBranch = { gitBranch: isMaster }
    if (isMaster === `master`){
      isMaster = { isMaster: true };
    } else {
      isMaster = { isMaster: false };
    }
  }
  helpers.addTo(cache, isMaster)
  helpers.addTo(cache, gitBranch)
  return cache
}















// git.currentCommitHash = function currentCommitHash(cache) {
//   return new Promise(function(resolve) {
//       let str = 'git rev-parse --short HEAD';
//       let currentCommitHash = shell.exec(str, { silent:true }).stdout;
//       currentCommitHash = { currentCommitHash: currentCommitHash.slice(0,6) };
//       helpers.addTo(cache, currentCommitHash);
//       resolve(cache);
//   });
// };

// git.dateNow = function dateNow(cache) {
//   return new Promise(function(resolve) {
//       let now = new Date();
//       // currentDate = dateFormat (now, 'longDate');
//       let dateNow = { dateNow: dateFormat (now, 'longDate') };
//       helpers.addTo(cache, dateNow);
//       resolve(cache);
//   });
// };

// git.remote = function remote(cache) {
//   return new Promise(function(resolve) {
//       simpleGit.getRemotes(true, function(err, remotes) {
//           let remote = remotes[0].refs.push;
//           if (_.startsWith(remote, 'git@')) {
//               remote = _.replace(remote, ':', '/');
//               remote = _.replace(remote, 'git@', 'https://').slice(0, -4);
//           }
//           remote = { remote: remote };
//           helpers.addTo(cache, remote);
//           resolve(cache);
//       });
//   });
// };

// git.parseRemoteUrl = function parseRemoteUrl(cache) {
//   return new Promise(function(resolve) {
//       simpleGit.getRemotes(true, function(err, remotes) {
//           let remoteUrl = remotes[0].refs.push;
//           let repoName = parseGighubUrl(remoteUrl).name;
//           let repoOwner = parseGighubUrl(remoteUrl).owner;
//           repoName = { repoName: repoName, repoOwner: repoOwner };
//           helpers.addTo(cache, repoName);
//           resolve(cache);
//       });
//   });
// };

// git.getCurrentTag = function getCurrentTag(cache) {
//   return new Promise(function(resolve) {
//       let str = 'git tag --contains ' + cache.currentCommitHash;
//       let currentTag = shell.exec(str, { silent:true }).stdout;
//       if (_.isEmpty(currentTag)) {
//           currentTag = { currentTag: false };
//       } else {
//           var match = currentTag.match(/\n/i);
//           currentTag = currentTag.slice(0, match.index);
//           currentTag = { currentTag: currentTag };
//       }
//       helpers.addTo(cache, currentTag);
//       resolve(cache);
//   });
// };


// git.push = function push(cache) {
//   return new Promise(function(resolve, reject) {
//       if (cache.isGitPush) {
//           let spinner = new Spinner('Pushing changes to remote... %s');
//           spinner.setSpinnerString('|/-\\');
//           spinner.start();
//           simpleGit.push('origin', cache.current, function(err) {
//               if (!err) {
//                   spinner.stop();
//                   process.stdout.write('\n');
//                   resolve(cache);
//               } else {
//                   reject(Error('in git.push, ' + err));
//               }
//           });
//       } else {
//           resolve(cache);
//       }
//   });
// };

// git.addTag = function addTag(cache) {
//   return new Promise(function(resolve) {
//       simpleGit.addTag(cache.newVersion);
//       resolve(cache);
//   });
// };

// git.pushTags = function pushTags(cache) {
//   return new Promise(function(resolve, reject) {
//       if (cache.isGitPush) {
//           let spinner = new Spinner('Pushing tags to remote... %s');
//           spinner.setSpinnerString('|/-\\');
//           spinner.start();
//           simpleGit.pushTags('origin', function(err) {
//               if (!err) {
//                   spinner.stop();
//                   process.stdout.write('\n');
//                   resolve(cache);
//               } else {
//                   reject(Error('in git.pushTags, ' + err));
//               }
//           });
//       } else {
//           resolve(cache);
//       }
//   });
// };






// TODO: check version (git tag) if it empty suggest new  0.0.1 or 1.0.0










// git.getLastTag = async (cache) => {
//   spinner.text = 'dffsd'
//   spinner.start()
//   try {
//     let str = 'git describe --abbrev=0 --tags'
//     let lastTag = {}
//     let gitTag = await execAsync(str, { maxBuffer: 2000 * 1024 })

//     // console.log(gitTag)

//     // TODO:
//     await new Promise((resolve, reject) => setTimeout(resolve, 3000));

//     if (_isEmpty(gitTag.stdout)) {
//       lastTag = { lastTag: false }
//     } else {
//       var match = gitTag.stdout.match(/\n/i)
//       lastTag = gitTag.stdout.slice(0, match.index)
//       lastTag = { lastTag: lastTag }
//     }
//     helpers.addTo(cache, lastTag)
//     spinner.succeed()
//     return cache

//   } catch(err) {
//     if (err.stderr) {
//       spinner.fail(err.stderr)
//     } else {
//       spinner.fail()
//     }
//     throw err;
//   }
// }
