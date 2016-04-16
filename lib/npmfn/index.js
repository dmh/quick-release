'use strict';

const fs = require('fs');
const chalk = require('chalk');
const shell = require('shelljs');
const helpers = require('../helpers');
const Spinner = require('cli-spinner').Spinner;

const npmfn = {};

npmfn.isUser = function isUser(cache) {
    return new Promise(function(resolve) {
        let str = 'npm whoami -loglevel silent';
        let spinner = new Spinner('Checking npm user... %s');
        spinner.setSpinnerString('|/-\\');
        spinner.start();
        let npmLogin = shell.exec(str, { async:true, silent:true }, function(err, data) {
            if (err) {
                console.log('\n' + chalk.red('You are not logged into npm.'));
                console.log(chalk.red('Please login ' + chalk.cyan('[npm login]') + ' and publish manually ' + chalk.cyan('[npm publish]')));
                npmLogin = { npmLogin: false };
            } else {
                npmLogin = data;
                var match = npmLogin.match(/\n/i);
                npmLogin = npmLogin.slice(0, match.index);
                npmLogin = { npmLogin: npmLogin };
            }
            helpers.addTo(cache, npmLogin);
            spinner.stop();
            process.stdout.write('\n');
            resolve(cache);
        });
    });
};

npmfn.isPackageJson = function isPackageJson(cache) {
    return new Promise(function(resolve) {
        if (cache.npmLogin) {
            let pkgPath = process.env.PWD + '/package.json';
            fs.readFile(pkgPath, function(err) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        console.log(chalk.red('No such file or directory: ' + err.path));
                        console.log('Create ' + chalk.yellow('package.json') + ' file and publish your package manually ' +  chalk.cyan('[npm publish]') + '\n');
                    } else {
                        console.log(chalk.red('Error. Please check your ' + chalk.yellow('package.json') + ' file'));
                    }
                    pkgPath = { pkgPath: false };
                    helpers.addTo(cache, pkgPath);
                    resolve(cache);
                } else {
                    pkgPath = { pkgPath: pkgPath };
                    helpers.addTo(cache, pkgPath);
                    resolve(cache);
                }
            });
        } else {
            resolve(cache);
        }
    });
};

npmfn.bumpPackageVersion = function bumpPackageVersion(cache) {
    return new Promise(function(resolve) {
        if (cache.npmLogin) {
            if (cache.pkgPath) {
                let pkg = require(cache.pkgPath);
                let oldVersion = pkg.version;
                pkg.version = cache.newVersion;
                let pkgStr = JSON.stringify(pkg, null, 2);
                fs.writeFile(cache.pkgPath, pkgStr, function(err) {
                    if (err) {throw err;}
                    console.log(`${ chalk.yellow('package.json') } version successfully bumped from ${ chalk.green(oldVersion) } to ${ chalk.yellow(cache.newVersion) }`);
                    resolve(cache);
                });
            } else {
                resolve(cache);
            }
        } else {
            resolve(cache);
        }
    });
};

// TODO: check package.json - if it valid
// TODO: check version and if it the same as in git
// TODO: npm publish
// TODO: show npm tag wich will be published

module.exports = npmfn;
