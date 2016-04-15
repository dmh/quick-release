'use strict';

const _ = require('lodash');
const shell = require('shelljs');
const chalk = require('chalk');
const Spinner = require('cli-spinner').Spinner;
const helpers = require('../helpers');
const simpleGit = require('simple-git')();
const dateFormat = require('dateformat');
const parseGighubUrl = require('parse-github-url');

const git = {};

git.isRepo = function isRepo(cache) {
    return new Promise(function(resolve, reject) {
        simpleGit.status(function(err) {
            if (!err) {
                resolve(cache);
            } else {
                reject(Error('Not a git repository'));
            }
        });
    });
};

git.check = function check(cache) {
    return new Promise(function(resolve) {
        simpleGit.status(function(err, st) {
            if (_.isEmpty(st.conflicted.length) && !st.ahead && !st.behind && !_.isEmpty(st.tracking)) {
                resolve(cache);
            } else {
                console.log(chalk.red.bold('Repo is not ready for release!'));
                console.log(chalk.yellow('Check git status'));
                // TODO: add explanation to every error type
                console.log(st);
                shell.exit(1);
            }
        });
    });
};

git.stagedFiles = function stagedFiles(cache) {
    return new Promise(function(resolve) {
        let str = 'git diff --name-only --cached';
        let stagedFiles = shell.exec(str, { silent:true }).stdout;
        if (_.isEmpty(stagedFiles)) {
            stagedFiles = { stagedFiles: false };
        } else {
            stagedFiles = { stagedFiles: stagedFiles.split('\n') };
            if (_.isEmpty(_.last(stagedFiles.stagedFiles))) {
                stagedFiles.stagedFiles.pop();
            }
        }
        helpers.addTo(cache, stagedFiles);
        resolve(cache);
    });
};

git.isMaster = function isMaster(cache) {
    return new Promise(function(resolve, reject) {
        simpleGit.status(function(err, st) {
            if (!err) {
                let branch = _.pick(st, 'current');
                helpers.addTo(cache, branch);
                resolve(cache);
            } else {
                reject(Error(err));
            }
        });
    });
};

// git.getLatestTag = function getLatestTag(cache) {
//     return new Promise(function(resolve, reject) {
//         simpleGit.tags(function(err, tags) {
//             if (!err) {
//                 console.log(tags);
//                 let latestTag = _.pick(tags, 'latest');
//                 console.log(latestTag.length > 1);
//                 console.log(latestTag.length);
//                 if (latestTag.length > 1) {
//                     let str = 'git describe --abbrev=0 --tags';
//                     let latestTag = shell.exec(str, { silent:true }).stdout;
//                     if (_.isEmpty(latestTag)) {
//                         latestTag = { latestTag: false };
//                     } else {
//                         var match = latestTag.match(/\n/i);
//                         latestTag = latestTag.slice(0, match.index);
//                         latestTag = { latestTag: latestTag };
//                     }
//                 }
//                 helpers.addTo(cache, latestTag);
//                 resolve(cache);
//             } else {
//                 reject(err);
//             }
//         });
//     });
// };

git.getLatestTag = function getLatestTag(cache) {
    return new Promise(function(resolve) {
        let str = 'git describe --abbrev=0 --tags';
        let latestTag = shell.exec(str, { silent:true }).stdout;
        if (_.isEmpty(latestTag)) {
            latestTag = { latestTag: false };
        } else {
            var match = latestTag.match(/\n/i);
            latestTag = latestTag.slice(0, match.index);
            latestTag = { latest: latestTag };
        }
        helpers.addTo(cache, latestTag);
        resolve(cache);
    });
};

git.currentCommitHash = function currentCommitHash(cache) {
    return new Promise(function(resolve) {
        let str = 'git rev-parse --short HEAD';
        let currentCommitHash = shell.exec(str, { silent:true }).stdout;
        currentCommitHash = { currentCommitHash: currentCommitHash.slice(0,6) };
        helpers.addTo(cache, currentCommitHash);
        resolve(cache);
    });
};

git.dateNow = function dateNow(cache) {
    return new Promise(function(resolve) {
        let now = new Date();
        // currentDate = dateFormat (now, 'longDate');
        let dateNow = { dateNow: dateFormat (now, 'longDate') };
        helpers.addTo(cache, dateNow);
        resolve(cache);
    });
};

git.remote = function remote(cache) {
    return new Promise(function(resolve) {
        simpleGit.getRemotes(true, function(err, remotes) {
            let remote = remotes[0].refs.push;
            if (_.startsWith(remote, 'git@')) {
                remote = _.replace(remote, ':', '/');
                remote = _.replace(remote, 'git@', 'https://').slice(0, -4);
            }
            remote = { remote: remote };
            helpers.addTo(cache, remote);
            resolve(cache);
        });
    });
};

git.parseRemoteUrl = function parseRemoteUrl(cache) {
    return new Promise(function(resolve) {
        simpleGit.getRemotes(true, function(err, remotes) {
            let remoteUrl = remotes[0].refs.push;
            let repoName = parseGighubUrl(remoteUrl).name;
            let repoOwner = parseGighubUrl(remoteUrl).owner;
            repoName = { repoName: repoName, repoOwner: repoOwner };
            helpers.addTo(cache, repoName);
            resolve(cache);
        });
    });
};

git.getCurrentTag = function getCurrentTag(cache) {
    return new Promise(function(resolve) {
        let str = 'git tag --contains ' + cache.currentCommitHash;
        let currentTag = shell.exec(str, { silent:true }).stdout;
        if (_.isEmpty(currentTag)) {
            currentTag = { currentTag: false };
        } else {
            var match = currentTag.match(/\n/i);
            currentTag = currentTag.slice(0, match.index);
            currentTag = { currentTag: currentTag };
        }
        helpers.addTo(cache, currentTag);
        resolve(cache);
    });
};

// git.add = function add(cache) {
//     return new Promise(function(resolve) {
//         if (cache.gitAdd) {
//             simpleGit.add(['.']);
//             resolve(cache);
//         } else {
//             // TODO: skip message of adding files to index
//             resolve(cache);
//         }
//     });
// };

git.add = function add(cache) {
    return new Promise(function(resolve) {
        if (cache.gitAdd) {
            let str = 'git add .';
            shell.exec(str, { silent:true }).stdout;
            // simpleGit.add(['.']);
            resolve(cache);
        } else {
            // TODO: skip message of adding files to index
            resolve(cache);
        }
    });
};

git.commit = function commit(cache) {
    return new Promise(function(resolve) {
        simpleGit.commit('Release ' + cache.newVersion);
        resolve(cache);
    });
};

git.push = function push(cache) {
    return new Promise(function(resolve, reject) {
        if (helpers.isChecked(cache, ['github', 'push'])) {
            let spinner = new Spinner('Pushing changes to remote... %s');
            spinner.setSpinnerString('|/-\\');
            spinner.start();
            simpleGit.push('origin', cache.current, function(err) {
                if (!err) {
                    spinner.stop();
                    process.stdout.write('\n');
                    resolve(cache);
                } else {
                    reject(Error(err));
                }
            });
        } else {
            resolve(cache);
        }
    });
};

git.addTag = function addTag(cache) {
    return new Promise(function(resolve) {
        simpleGit.addTag(cache.newVersion);
        resolve(cache);
    });
};

git.pushTags = function pushTags(cache) {
    return new Promise(function(resolve, reject) {
        if (helpers.isChecked(cache, ['github', 'push'])) {
            let spinner = new Spinner('Pushing tags to remote... %s');
            spinner.setSpinnerString('|/-\\');
            spinner.start();
            simpleGit.pushTags('origin', function(err) {
                if (!err) {
                    spinner.stop();
                    process.stdout.write('\n');
                    resolve(cache);
                } else {
                    reject(Error(err));
                }
            });
        } else {
            resolve(cache);
        }
    });
};

// git.getStatus = function getStatus() {
//     return new Promise(function(resolve, reject) {
//         simpleGit.status(function(err, st) {
//             if (!err) {
//                 resolve(st);
//             } else {
//                 reject(Error(err));
//             }
//         });
//     });
// };

// TODO: show modified files, whici will be commoted
// TODO: show status (files to be comitted (changelog, package.json, README.md, or just tag ))
// TODO: github release if needed
// TODO: create new tag based on curent one
// TODO: add special files to index
// TODO: commit with message [RELEASE] tag

// TODO: create new tag based on curent one
// TODO: push new tag to remote server
// TODO: check version (git tag) if it empty suggest new  0.0.1 or 1.0.0

module.exports = git;
