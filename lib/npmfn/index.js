'use strict';

const fs = require('fs');
const chalk = require('chalk');
const shell = require('shelljs');
const helpers = require('../helpers');
const Spinner = require('cli-spinner').Spinner;

const npmfn = module.exports = {};
let file = 'package.json';

npmfn.isUser = function isUser(cache) {
    return new Promise(function(resolve) {
        if (cache.isNpmPublish) {
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
        } else {
            resolve(cache);
        }
    });
};

npmfn.isPackageJson = function isPackageJson(cache) {
    return new Promise(function(resolve) {
        let pkgPath = process.env.PWD + '/package.json';
        fs.readFile(pkgPath, function(err) {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.log(chalk.red('No such file or directory: ' + err.path));
                    console.log('Please create proper ' + chalk.yellow(file) + ' file and start script again.' + '\n');
                    shell.exit(1);
                } else {
                    console.log(chalk.red('Error. Please check your ' + chalk.yellow(file) + ' file'));
                    shell.exit(1);
                }
            } else {
                let pkgV = require(pkgPath).version;
                pkgPath = { pkgPath: pkgPath, pkgOldVersion: pkgV };
                helpers.addTo(cache, pkgPath);
                resolve(cache);
            }
        });
    });
};

npmfn.bumpPackageVersion = function bumpPackageVersion(cache) {
    return new Promise(function(resolve, reject) {
        if (cache.pkgPath) {
            let pkg = require(cache.pkgPath);
            // let oldVersion = pkg.version;
            pkg.version = cache.newVersion;
            let pkgStr = JSON.stringify(pkg, null, 2);
            fs.writeFile(cache.pkgPath, pkgStr, function(err) {
                if (err) {
                    reject(Error('in npmfn.bumpPackageVersion, ' + err));
                } else {
                    resolve(cache);
                }
            });
        } else {
            resolve(cache);
        }
    });
};

npmfn.addPackageToIndex = function addPackageToIndex(cache) {
    return new Promise(function(resolve) {
        let str = 'git add ' + file;
        shell.exec(str, { silent:true }).stdout;
        resolve(cache);
    });
};

npmfn.publish = function publish(cache) {
    return new Promise(function(resolve) {
        if (cache.isNpmPublish && cache.npmLogin) {
            let str = 'npm publish';
            let spinner = new Spinner('Publishing to npm repo... %s');
            spinner.setSpinnerString('|/-\\');
            spinner.start();
            shell.exec(str, { async:true, silent:true }, function(err) {
                if (err) {
                    console.log(chalk.red('Error. NPM package is not published. Please check your internet connection'));
                } else {
                    console.log(chalk.green('\nNPM package successfully published'));
                }
                spinner.stop();
                process.stdout.write('\n');
                resolve(cache);
            });
        } else {
            resolve(cache);
        }
    });
};

// TODO: check package.json - if it valid
// TODO: check version and if it the same as in git
