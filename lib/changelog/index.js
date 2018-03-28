'use strict';

const fs = require('fs');
const _ = require('lodash')
const _isEmpty = require('lodash/isEmpty')
const _last = require('lodash/last')
const Ora = require('ora')
const variables = require('../variables')
const helpers = require('../helpers')
const { exec } = require('child_process');
const {promisify} = require('util');
const chalk = require('chalk')
const dateFormat = require('dateformat');
const simpleGit = require('simple-git');

const spinner = new Ora()
const execAsync = promisify(exec);




const changelog = module.exports = {}

const file = 'CHANGELOG.md'
let labels = ['[FEATURE]', '[FIX]', '[REFACTOR]', '[PERF]', '[DOC]', '[STYLE]', '[CHORE]', '[UPDATE]', '[TEST]', '[BUGFIX]', '[TASK]', '[CLEANUP]', '[WIP]']
const breakingChangesLabels = ['[!!!]']
const log = {}

changelog.commitMessages = async (cache) => {
  let commitMessages = {}
  var str = `git log ${cache.lastTag}..HEAD --format=%s@#$%h`
  var data = await execAsync(str, { maxBuffer: 2000 * 1024 })
  if (_isEmpty(data.stdout)) {
    commitMessages = { commitMessages: false }
  } else {
    commitMessages = data.stdout.split('\n')
    if (_isEmpty(_last(commitMessages))) {
      commitMessages.pop()
    }
  }
  log.commitMessages = commitMessages
  helpers.addTo(cache, {log})
  return cache
}

changelog.regularChanges = (cache) => {
  if (cache.commitLabels) {
    labels = cache.commitLabels
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
    breakingChangesLabels.forEach(function (value) {
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
  let formatRegularChanges = ''
  cache.log.regularChanges.forEach(function (value) {
    formatRegularChanges = `${formatRegularChanges}- **${value.prefix}** ${value.message} ${hashUrl(value)}\n`
  })
  let formatBreakingChanges = ''
  if (cache.log.breakingChanges) {
    cache.log.breakingChanges.forEach(function (value) {
      formatBreakingChanges = `${formatBreakingChanges}- **${value.breakingChangesPrefix}** **${value.prefix}** ${value.message} ${hashUrl(value)}\n`
    })
    formatBreakingChanges = `:heavy_exclamation_mark:**Breaking Changes:**\n${formatBreakingChanges}\n`
  }
  let rawChangelog = `${formatRegularChanges}\n${formatBreakingChanges}\n`
  let changelog = `\n#### v${cache.newVersion} \`${cache.dateNow}\`\n${formatRegularChanges}\n${formatBreakingChanges}***\n`
  log.rawChangelog = rawChangelog
  log.changelog = changelog
  helpers.addTo(cache, {log})
  return cache
}

// changelog.addChangelogToIndex = function addChangelogToIndex(cache) {
//     return new Promise(function(resolve) {
//         let str = 'git add ' + file;
//         shell.exec(str, { silent:true }).stdout;
//         resolve(cache);
//     });
// };

// changelog.write = function write(cache) {
//     return new Promise(function(resolve) {
//         let spinner = new Spinner('Writing changelog... %s');
//         spinner.setSpinnerString('|/-\\');
//         spinner.start();

//         fs.readFile(file, function(err, data) {
//             if (err) {throw err;}
//             var fileCache = data;
//             fs.writeFile(file, cache.changelogMessage, function(err) {
//                 if (err) {throw err;}
//                 fs.appendFile(file, fileCache, function(err) {
//                     if (err) {throw err;}
//                     spinner.stop();
//                     process.stdout.write('\n');
//                     resolve(cache);
//                 });
//             });
//         });
//     });
// };

// changelog.isChangelog = function isChangelog(val) {
//     return new Promise((resolve, reject) => {
//         let changelogPath = process.env.PWD + '/CHANGELOG.md';
//         fs.stat(changelogPath, function(err) {
//             if (!err) {
//                 resolve(val);
//             } else {
//                 fs.writeFile('CHANGELOG.md','', function(err) {
//                     if (err) {
//                         reject(Error('in changelog.isChangelog ' + err));
//                     }
//                     resolve(val);
//                 });
//             }
//         });
//     });
// };

// TODO: check if you have pulled all tags
// TODO: add suggestion to pull all tags from remote
// TODO: show last tag from witch we counting
// TODO: if can't find last tag -> fatch all history!!!
