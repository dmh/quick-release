'use strict';

const _ = require('lodash');
const shell = require('shelljs');
const helpers = require('../helpers');
const Spinner = require('cli-spinner').Spinner;
const GitHubApi = require('github');

const github = {};

github.token = function token(cache) {
    return new Promise(function(resolve) {
        let str = 'git config --get github.token';
        let token = shell.exec(str, { silent:true }).stdout;
        if (_.isEmpty(token)) {
            token = { githubToken: false };
        } else {
            var match = token.match(/\n/i);
            token = token.slice(0, match.index);
            token = { githubToken: token };
        }
        helpers.addTo(cache, token);
        resolve(cache);
    });
};

github.user = function user(cache) {
    return new Promise(function(resolve) {
        let str = 'git config --get github.user';
        let user = shell.exec(str, { silent:true }).stdout;
        if (_.isEmpty(user)) {
            user = { githubUser: false };
        } else {
            var match = user.match(/\n/i);
            user = user.slice(0, match.index);
            user = { githubUser: user };
        }
        helpers.addTo(cache, user);
        resolve(cache);
    });
};

github.authenticate = function authenticate(cache) {
    return new Promise(function(resolve, reject) {
        if (cache.isGithubRelease) {
            let spinner = new Spinner('Github Release... %s');
            spinner.setSpinnerString('|/-\\');
            spinner.start();
            let github = new GitHubApi({
                version: '3.0.0'
            });
            if (!cache.githubToken) {
                github.authenticate({
                    type: 'basic',
                    username: cache.askGithubUser,
                    password: cache.askGithubPass
                }, function(err) {
                    if (err) {
                        spinner.stop();
                        process.stdout.write('\n');
                        reject(err);
                    }
                });
            } else {
                github.authenticate({
                    type: 'oauth',
                    token: cache.githubToken
                }, function(err) {
                    if (err) {
                        spinner.stop();
                        process.stdout.write('\n');
                        reject(err);
                    }
                });
            }
            let msg = {
                owner: cache.repoOwner,
                repo: cache.repoName,
                tag_name: cache.newVersion, //jscs:disable
                name: 'v' + cache.newVersion,
                body: cache.releaseMessage
            };
            github.releases.createRelease(msg, function(err) {
                if (!err) {
                    spinner.stop();
                    process.stdout.write('\n');
                    resolve(cache);
                } else {
                    spinner.stop();
                    process.stdout.write('\n');
                    reject(err);
                }
            });
        }
    });
};

module.exports = github;
