'use strict';

const _ = require('lodash');
const chalk = require('chalk');
const boxen = require('boxen');
const shell = require('shelljs');

const info = module.exports = {};

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
            margin:{ top: 0, right: 0, bottom: cache.releaseType === 'github' ? 1 : 0, left: 0 },
            borderColor: 'gray',
            borderStyle: 'round'
        }
    );
    console.log(showReleaseInfo);
    return cache;
};

info.showPackageJsonVersion = function showPackageJsonVersion(cache) {
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
    let messages = '';
    _(cache.changelog).forEach(function(value, index, col) {
        if (index === col.length - 1) {
            messages = messages + ' • ' + chalk.bold(value.prefix) + ' ' + value.message + chalk.gray.dim(' (' + value.hash + ')');
        } else {
            messages = messages + ' • ' + chalk.bold(value.prefix) + ' ' + value.message + chalk.gray.dim(' (' + value.hash + ')') + '\n';
        }
    });
    let breakingChangesInfo = '';
    if (cache.breakingChanges) {
        _(cache.breakingChanges).forEach(function(value, index, col) {
            if (index === col.length - 1) {
                breakingChangesInfo = breakingChangesInfo + ' • ' + chalk.bold(value.breakingChangesPrefix) + ' ' + chalk.bold(value.prefix) + ' ' + value.message + chalk.gray.dim(' (' + value.hash + ')');
            } else {
                breakingChangesInfo = breakingChangesInfo + ' • ' + chalk.bold(value.breakingChangesPrefix) + ' ' + chalk.bold(value.prefix) + ' ' + value.message + chalk.gray.dim(' (' + value.hash + ')') + '\n';
            }
        });
        breakingChangesInfo = '\n' + chalk.bgBlack.bold('Breaking Changes:') + '\n' + breakingChangesInfo;
    }
    let changelogHeader = chalk.yellow.bold('v' + cache.newVersion + ' ') + chalk.bgBlack(cache.dateNow);
    let changelogDraft = boxen(
        chalk.gray('Changelog: ') +
        '\n' +
        changelogHeader +
        '\n' +
        messages +
        breakingChangesInfo,
        {
            padding: { top: 0, right: 2, bottom: 0, left: 2 },
            margin:{ top: 0, right: 0, bottom: 0, left: 0 },
            borderColor: 'gray',
            borderStyle: 'round'
        }
    );
    console.log(changelogDraft);
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

info.help = function help(cache) {
    var pkgV = require('../../package.json');
    let showHelp = `
    ${chalk.bold('quick-release')} v${pkgV.version}
    Quickly generate and publish your application releases

    ${chalk.bold.underline('Usage:')}
    quick-release
    quick-release [options]

    ${chalk.bold.underline('Options:')}
    -h, --help           Quick help.
    -v, --version        Print the quick-release version.
    -g, --github         Github Release.
    -n, --githubnpm      Github Release + NPM Publish.
    -s, --simple         Simple Release.
    --githubAPI          Github Release API.
    --nPublish           NPM Publish.

    Release types:
    ${chalk.yellow('[Github Release]')} - Github Release API + CHANGELOG + git commit/tag/push
    ${chalk.yellow('[Github Release + NPM Publish]')} - Github Release + NPM Publish

        `;
    console.log(showHelp);
    return cache;
};

info.showVersion = function showVersion(cache) {
    var pkgV = require('../../package.json');
    let showVersion = `${pkgV.version}`;
    console.log(showVersion);
    return cache;
};

// TODO: add more info about Release types [info.help]
