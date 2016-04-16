'use strict';

const _ = require('lodash');
const fs = require('fs');
const helpers = require('../helpers');
const shell = require('shelljs');
const Spinner = require('cli-spinner').Spinner;

const changelog = {};
let file = 'CHANGELOG.md';
let labels = ['[FEATURE]', '[FIX]', '[REFACTOR]', '[PERF]', '[DOC]', '[STYLE]', '[CHORE]', '[UPDATE]', '[TEST]'];

changelog.getCommitMessages = function getCommitMessages(cache) {
    return new Promise(function(resolve) {
        let changelog = {};
        var commitMessagesStr = 'git log ' + cache.latest + '..HEAD --format=%s\@\#\$%h';
        var commitMessages = shell.exec(commitMessagesStr, { silent:true }).stdout;

        commitMessages = { commitMessages: commitMessages.split('\n') };
        if (_.isEmpty(_.last(commitMessages.commitMessages))) {
            commitMessages.commitMessages.pop();
        }

        changelog.changelog = [];
        _(commitMessages.commitMessages).forEach(function(value) {
            var val = value;
            _(labels).forEach(function(value) {
                if (_.startsWith(val, value)) {
                    var matchHash = val.match(/@#\$/i);
                    var hash = val.slice(matchHash.index + 3);
                    var prefix = val.match(/^([^\]]+)([^])/)[0];
                    var message = val.slice(0, matchHash.index);
                    message = _.replace(message, prefix, '').trim();
                    changelog.changelog.push({ hash: hash, prefix: prefix, message: message });
                }
            });
        });
        helpers.addTo(cache, changelog);

        let messages = '';
        _(cache.changelog).forEach(function(value) {
            messages = messages + '- **' + value.prefix + '** ' + value.message + ' ([' + value.hash + '](' + cache.remote + '/commit/' + value.hash + '))' + '\n';

        });
        let conventionalCommits = '#### v' + cache.newVersion + ' `' + cache.dateNow + '`\n' + messages + '\n';
        let changelogMessage = { changelogMessage: conventionalCommits };
        let releaseMessage = { releaseMessage: messages + '\n' };
        helpers.addTo(cache, changelogMessage);
        helpers.addTo(cache, releaseMessage);

        resolve(cache);
    });
};

changelog.addChangelogToIndex = function addChangelogToIndex(cache) {
    return new Promise(function(resolve) {
        if (helpers.isChecked(cache, ['changelog', 'github'])) {
            // simpleGit.add([file]);
            let str = 'git add ' + file;
            shell.exec(str, { silent:true }).stdout;

            resolve(cache);
        } else {
            resolve(cache);
        }
    });
};

changelog.write = function write(cache) {
    return new Promise(function(resolve) {
        if (helpers.isChecked(cache, ['changelog', 'github'])) {
            let spinner = new Spinner('Writing changelog... %s');
            spinner.setSpinnerString('|/-\\');
            spinner.start();

            fs.readFile(file, function(err, data) {
                if (err) {throw err;}
                var fileCache = data;
                fs.writeFile(file, cache.changelogMessage, function(err) {
                    if (err) {throw err;}
                    fs.appendFile(file, fileCache, function(err) {
                        if (err) {throw err;}
                        spinner.stop();
                        process.stdout.write('\n');
                        resolve(cache);
                    });
                });
            });
        } else {
            resolve(cache);
        }
    });
};

module.exports = changelog;

// TODO: check if you have pulled all tags
// TODO: add suggestion to pull all tags from remote
// TODO: show last tag from witch we counting
