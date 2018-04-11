'use strict'

const _ = require('lodash')
const chalk = require('chalk')
const helpers = require('../helpers')
const octokit = require('@octokit/rest')()

const {exec} = require('child_process')
const {promisify} = require('util')
const execAsync = promisify(exec)

const github = module.exports = {}

const githubAuth = {}

// github.authCheck = async (cache) => {
//   let ttt = 'fffff'
//   const result = await octokit.authorization.check({ttt})
//   console.log(result)
// }

github.token = async (cache) => {
  try {
    let str = 'git config --get github.token'
    const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
    if (_.isEmpty(data.stdout)) {
      githubAuth.token = false
    } else {
      githubAuth.token = data.stdout.trim()
    }
  } catch (err) {
    githubAuth.token = false
  }
  helpers.addTo(cache, {githubAuth})
  return cache
}

github.user = async (cache) => {
  try {
    let str = 'git config --get github.user'
    const data = await execAsync(str, { maxBuffer: 2000 * 1024 })
    if (_.isEmpty(data.stdout)) {
      githubAuth.user = false
    } else {
      githubAuth.user = data.stdout.trim()
    }
  } catch (err) {
    githubAuth.user = false
  }
  helpers.addTo(cache, {githubAuth})
  return cache
}

// github.authenticate = function authenticate(cache) {
//     return new Promise(function(resolve, reject) {
//         if (cache.isGithubRelease) {
//             let spinner = new Spinner('Github Release... %s');
//             spinner.setSpinnerString('|/-\\');
//             spinner.start();
//             let github = new GitHubApi({
//                 version: '3.0.0'
//             });
//             if (!cache.githubToken) {
//                 github.authenticate({
//                     type: 'basic',
//                     username: cache.askGithubUser,
//                     password: cache.askGithubPass
//                 }, function(err) {
//                     if (err) {
//                         spinner.stop();
//                         process.stdout.write('\n');
//                         reject(Error('in github.authenticate, ' + err));
//                     }
//                 });
//             } else {
//                 github.authenticate({
//                     type: 'oauth',
//                     token: cache.githubToken
//                 }, function(err) {
//                     if (err) {
//                         spinner.stop();
//                         process.stdout.write('\n');
//                         reject(Error('in github.authenticate, ' + err));
//                     }
//                 });
//             }
//             let msg = {
//                 owner: cache.repoOwner,
//                 repo: cache.repoName,
//                 tag_name: cache.newVersion, //jscs:disable
//                 name: 'v' + cache.newVersion,
//                 body: cache.releaseMessage
//             };
//             github.releases.createRelease(msg, function(err) {
//                 if (!err) {
//                     spinner.stop();
//                     process.stdout.write('\n');
//                     console.log(chalk.green('Github release successfully published\n'));
//                     resolve(cache);
//                 } else {
//                     spinner.stop();
//                     process.stdout.write('\n');
//                     reject(Error('in github.authenticate, ' + err));
//                 }
//             });
//         }
//     });
// };
