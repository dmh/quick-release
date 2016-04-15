#!/usr/bin/env node

'use strict';

const git = require('./lib/git');
const info = require('./lib/info');
const shell = require('shelljs');
const prompt = require('./lib/prompt');
const github = require('./lib/github');
const changelog = require('./lib/changelog');

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

git.isRepo(cache)
    .then(git.check)
    .then(git.isMaster)
    .then(prompt.releaseType)
    .then(prompt.gitAdd)
    .then(git.getLatestTag)
    .then(prompt.newVersion)
    .then(git.currentCommitHash)
    .then(git.getCurrentTag)
    .then(git.dateNow)
    .then(git.remote)
    .then(git.parseRemoteUrl)
    .then(changelog.getCommitMessages)
    // .then(function(val) {
    //     console.log(cache);
    //     return val;
    // })
    // .then(prompt.isGood)



    .then(info.changelogDraft)
    .then(info.readyForRelease)
    .then(info.branchWarning)
    .then(prompt.isGood)
    .then(changelog.write)
    .then(changelog.addChangelogToIndex)
    .then(git.add)
    .then(git.stagedFiles)
    .then(info.indexedFiles)
    .then(info.commitWarning)
    .then(prompt.isGood)
    .then(info.tagWarning)
    .then(git.commit)
    .then(git.push)
    .then(git.addTag)
    .then(git.pushTags)
    //===== Github release =============
    .then(prompt.isGithubRelease)
    .then(github.user)
    .then(github.token)
    .then(prompt.githubUser)
    .then(prompt.githubPass)
    // .then(function(val) {
    //     console.log(cache);
    //     return val;
    // })
    // .then(prompt.isGood)



    .then(github.authenticate)
    //=============================
    .then(info.done)

    .catch(function(err) { console.log('Error!', err); });

// TODO: add presets = github release, github release + npm + customize
// TODO: if customize add checkboxes = git tag + git release + npm +
// TODO: changelog?
// TODO: remove dependencies simple-git check deppendencies
// TODO: func for errors with colors and explanations


// TODO: add yaml parser with file to indentify changelog file + labels + remote repo + template
// TODO: add message if no file we will use standart labels, changelog, template etc...

// TODO: install ES6 promises
// TODO: define name!!!!
