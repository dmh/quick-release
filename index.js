#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const git = require('./lib/git');
const info = require('./lib/info');
const shell = require('shelljs');
const npmfn = require('./lib/npmfn');
const prompt = require('./lib/prompt');
const github = require('./lib/github');
const helpers = require('./lib/helpers');
const changelog = require('./lib/changelog');
const argv = require('minimist')(process.argv.slice(2));

var cache = {};

// Check is git installed
if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
}

// Check node version
const nodeVer = 5.6;
if (Number(process.version.match(/^v(\d+\.\d+)/)[1]) < nodeVer) {
    shell.echo('Need to install new version of node.js (>= 5.6.0)');
    shell.exit(1);
}

// ====== Caching info ======
function check() {
    return helpers.promiseChainStarter(cache)
    .then(git.isRepo)
    .then(git.check)
    .then(git.isMaster)
    .then(git.getLatestTag)
    .then(git.currentCommitHash)
    .then(git.getCurrentTag)
    .then(git.dateNow)
    .then(git.remote)
    .then(git.parseRemoteUrl)
    .catch((err) => { helpers.error('check', err);});
}

// ==========================
// ===== Github Release =====
// ==========================
function githubRelease() {
    return helpers.promiseChainStarter(cache)
    .then(check)
    .then(prompt.gitAdd)
    .then(prompt.newVersion)
    .then(changelog.getCommitMessages)

    .then(info.changelogDraft)
    .then(info.readyForRelease)
    .then(info.branchWarning)
    .then(prompt.isGood)

    //===== Add files to git index + info messages ===
    .then(changelog.write)
    .then(changelog.addChangelogToIndex)
    .then(git.add)
    .then(git.stagedFiles)
    .then(info.indexedFiles)
    .then(info.commitWarning)
    .then(prompt.isGood)
    .then(info.tagWarning)

    // === git commit + push + tag + push --tags ===
    .then(git.commit)
    .then(git.addTag)
    .then(prompt.isGitPush)
    .then(git.push)
    .then(git.pushTags)

    //===== Github release =============
    .then(prompt.isGithubRelease)
    .then(github.user)
    .then(github.token)
    .then(prompt.githubUser)
    .then(prompt.githubPass)
    .then(github.authenticate)
    .then(info.done)
    .catch((err) => { helpers.error('githubRelease', err);});
}

// ========================================
// ===== Github Release + NPM Publish =====
// ========================================
function githubNpmRelease() {
    return helpers.promiseChainStarter(cache)
    .then(check)
    .then(prompt.gitAdd)
    .then(prompt.newVersion)
    .then(changelog.getCommitMessages)
    .then(npmfn.isPackageJson)

    .then(info.changelogDraft)
    .then(info.readyForRelease)
    .then(info.showPackageJsonVersion)
    .then(info.branchWarning)
    .then(prompt.isGood)

    // ====== bump package.json ======
    .then(npmfn.bumpPackageVersion)
    .then(npmfn.addPackageToIndex)

    //===== Add files to git index + info messages ===
    .then(changelog.write)
    .then(changelog.addChangelogToIndex)
    .then(git.add)
    .then(git.stagedFiles)
    .then(info.indexedFiles)
    .then(info.commitWarning)
    .then(prompt.isGood)
    .then(info.tagWarning)

    // === git commit + push + tag + push --tags ===
    .then(git.commit)
    .then(git.addTag)
    .then(prompt.isGitPush)
    .then(git.push)
    .then(git.pushTags)

    // ===== Github release =============
    .then(prompt.isGithubRelease)
    .then(github.user)
    .then(github.token)
    .then(prompt.githubUser)
    .then(prompt.githubPass)
    .then(github.authenticate)

    //===== Npm publish ==============
    .then(prompt.isNpmPublish)
    .then(npmfn.isUser)
    .then(npmfn.publish)
    .then(info.done)
    .catch((err) => { helpers.error('githubNpmRelease', err);});
}

function run() {
    prompt.releaseType(cache)
    .then(() => {
        if (cache.releaseType === 'github') {
            githubRelease();
        } else if (cache.releaseType === 'github+npm') {
            githubNpmRelease();
        } else if (cache.releaseType === 'help') {
            info.help();
        }
    }).catch((err) => { helpers.error('run', err);});
}

//====================================================

if (_.size(argv) !== 1 || argv._.length) {

    // quick-release  -h, --help
    if (argv.h || argv.help) {
        info.help();

        // quick-release  -v, --version
    } else if (argv.v || argv.version) {
        info.showVersion();

    // quick-release  -g, --github
    } else if (argv.g || argv.github) {
        cache.releaseType = 'github';
        githubRelease();

    // quick-release  -n, --githubnpm
    } else if (argv.n || argv.githubnpm) {
        cache.releaseType = 'github+npm';
        githubNpmRelease();

    // quick-release
    } else {
        info.help();
    }
} else {
    run();
}

// TODO: remove dependencies simple-git check deppendencies
// TODO: func for errors with colors and explanations
// TODO: add yaml parser with file to indentify changelog file + labels + remote repo + template
// TODO: add message if no file we will use standart labels, changelog, template etc...
// TODO: install ES6 promises
// TODO: add massage if something wrong with github release

// TODO: check "remote-origin-url"
// TODO: check "git-rev"
// TODO: check "is-git-url"
// TODO: check "git-raw-commits"
