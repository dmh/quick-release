'use strict';

const _ = require('lodash');
const info = {};
const chalk = require('chalk');
const boxen = require('boxen');
const shell = require('shelljs');
const helpers = require('../helpers');

info.readyForRelease = function readyForRelease(cache) {
    let showReleaseInfo = boxen(
        chalk.gray('Ready for new release: ') +
        '\n' +
        chalk.gray.dim('Current branch: ') + chalk.blue(cache.current) +
        '\n' +
        chalk.gray.dim('Release Type: ') + chalk.blue(cache.releaseType) +
        '\n' +
        chalk.gray.dim('git tag: ') + chalk.green(cache.latest) +
        chalk.gray.dim(' --> ') + chalk.yellow.bold(cache.newVersion),
        {
            padding: { top: 0, right: 2, bottom: 0, left: 2 },
            margin:{ top: 0, right: 0, bottom: helpers.isChecked(cache, ['npm', 'github+Npm']) ? 0 : 1, left: 0 },
            borderColor: 'gray',
            borderStyle: 'round'
        }
    );
    console.log(showReleaseInfo);
    return cache;
};

info.showPackageJsonVersion = function showPackageJsonVersion(cache) {
    if (helpers.isChecked(cache, ['npm', 'github+Npm'])) {
        let showPackageJsonVersion = boxen(
            chalk.gray.dim('package.json version: ') + chalk.green(cache.pkgOldVersion) +
            chalk.gray.dim(' --> ') + chalk.yellow.bold(cache.newVersion),
            {
                padding: { top: 0, right: 2, bottom: 0, left: 2 },
                margin:{ top: 0, right: 0, bottom: 1, left: 0 },
                borderColor: 'gray',
                borderStyle: 'round'
            }
        );
        console.log(showPackageJsonVersion);
    }
    return cache;
};

info.indexedFiles = function indexedFiles(cache) {
    let indexedFiles = boxen(
        chalk.gray.dim('Files ready to commit: ') + chalk.yellow(cache.stagedFiles),
        {
            padding: { top: 0, right: 2, bottom: 0, left: 2 },
            margin:{ top: 0, right: 0, bottom: 1, left: 0 },
            borderColor: 'gray',
            borderStyle: 'round'
        }
    );
    console.log(indexedFiles);
    return cache;
};

info.changelogDraft = function changelogDraft(cache) {
    if (helpers.isChecked(cache, ['changelog', 'github', 'github+Npm'])) {
        let messages = '';
        _(cache.changelog).forEach(function(value, index, col) {
            if (index === col.length - 1) {
                messages = messages + ' • ' + chalk.bold(value.prefix) + ' ' + value.message + chalk.gray.dim(' (' + value.hash + ')');
            } else {
                messages = messages + ' • ' + chalk.bold(value.prefix) + ' ' + value.message + chalk.gray.dim(' (' + value.hash + ')') + '\n';
            }
        });
        let changelogHeader = chalk.yellow.bold('v' + cache.newVersion + ' ') + chalk.bgBlack(cache.dateNow);
        let changelogDraft = boxen(
            chalk.gray('Changelog: ') +
            '\n' +
            changelogHeader +
            '\n' +
            messages,
            {
                padding: { top: 0, right: 2, bottom: 0, left: 2 },
                margin:{ top: 0, right: 0, bottom: 1, left: 0 },
                borderColor: 'gray',
                borderStyle: 'round'
            }
        );
        console.log(changelogDraft);
    }
    return cache;
};

info.branchWarning = function branchWarning(cache) {
    if (cache.current !== 'master') {
        console.log(chalk.red('Be careful you are not at ' + chalk.cyan('master') + ' branch!') + '\n');
    }
    return cache;
};

info.commitWarning = function commitWarning(cache) {
    if (!cache.stagedFiles) {
        console.log(chalk.yellow('Nothing to commit, working directory clean.'));
        console.log(chalk.yellow('You can just add new ' + chalk.blue('git tag') + ' for this commit.' + '\n'));
    }
    return cache;
};

info.tagWarning = function tagWarning(cache) {
    if (!cache.stagedFiles) {
        if (cache.currentTag) {
            console.log(chalk.red('\n' + 'You can\'t assign new tag ') +  chalk.yellow(cache.newVersion) + '\n' + chalk.red('Current commit already have assigned tag ') + chalk.green(cache.currentTag) + '\n');
            shell.exit(1);
        }
    }
    return cache;
};

info.done = function done(cache) {
    let done = boxen(
        chalk.bold('Done!') +
        '\n' +
        chalk.cyan('New version ') + chalk.yellow.bold(cache.newVersion) + chalk.cyan(' successfully released!'),
        {
            padding: { top: 0, right: 2, bottom: 0, left: 2 },
            margin:{ top: 0, right: 0, bottom: 1, left: 0 },
            borderColor: 'cyan',
            borderStyle: 'round'
        }
    );
    console.log(done);
    return cache;
};

module.exports = info;
