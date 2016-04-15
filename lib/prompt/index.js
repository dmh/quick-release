'use strict';

const shell = require('shelljs');
const chalk = require('chalk');
const semver = require('semver');
const helpers = require('../helpers');
const inquirer = require('inquirer');

const prompt = {};

prompt.releaseType = function releaseType(cache) {
    return new Promise(function(resolve, reject) {
        let releaseType = [
            {
                name: 'releaseType',
                type: 'list',
                message: 'Release includes:',
                choices: [
                    {
                        name: 'Github Release (Commit staged files + new tag + push + CHANGELOG)',
                        value: 'github'
                    },
                    // {
                    //     name: 'Commit files + git tag + github release)',
                    //     value: 'githubRelease'
                    // },
                    // {
                    //     name: 'Commit files + git tag + github release + npm publish)',
                    //     value: 'git+npm'
                    // },
                    {
                        name: 'Custom release',
                        value: 'custom'
                    }
                ],
            }
        ];
        inquirer.prompt(releaseType , function(answers) {
            if (answers) {
                if (answers.releaseType === 'custom') {
                    resolve(prompt.customProjectType(cache));
                } else {
                    helpers.addTo(cache, answers);
                    resolve(cache);
                }
            } else {
                reject(Error('prompt error'));
            }
        });
    });
};

prompt.newVersion = function newVersion(cache) {
    return new Promise(function(resolve, reject) {
        let ver = [
            {
                name: 'newVersion',
                type: 'list',
                message: 'Bump version from ' + cache.latest + ' to:',

                choices: [
                    {
                        name:  semver.inc(cache.latest, 'patch'),
                        value: semver.inc(cache.latest, 'patch')
                    },
                    {
                        name: semver.inc(cache.latest, 'minor'),
                        value: semver.inc(cache.latest, 'minor')
                    },
                    {
                        name: semver.inc(cache.latest, 'major'),
                        value: semver.inc(cache.latest, 'major')
                    },
                    {
                        name: 'Specify version',
                        value: 'custom'
                    },
                ]
            }
        ];
        inquirer.prompt(ver , function(answers) {
            if (answers) {
                if (answers.newVersion === 'custom') {
                    resolve(prompt.specifyVer());
                } else {
                    helpers.addTo(cache, answers);
                    resolve(cache);

                }
            } else {
                reject(Error('prompt error'));
            }
        });
    });
};

prompt.specifyVer = function specifyVer(cache) {
    return new Promise(function(resolve, reject) {
        let specifyVer = [
            {
                name: 'newVersion',
                type: 'input',
                message: 'New Version',
            }
        ];
        inquirer.prompt(specifyVer , function(answers) {
            if (answers) {
                helpers.addTo(cache, answers);
                resolve(cache);

            } else {
                reject(Error('prompt error'));
            }
        });
    });
};

prompt.isGood = function isGood(cache) {
    return new Promise(function(resolve, reject) {
        let isGood = [
            {
                name: 'isGood',
                type: 'confirm',
                message: 'Looks good?'
            }
        ];
        inquirer.prompt(isGood , function(answers) {
            if (answers) {
                if (answers.isGood) {
                    resolve(cache);
                } else {
                    shell.exit(1);
                }
            } else {
                reject(Error('prompt error'));
            }
        });
    });
};

prompt.isGithubRelease = function isGithubRelease(cache) {
    return new Promise(function(resolve, reject) {
        let isGithubRelease = [
            {
                name: 'isGithubRelease',
                type: 'confirm',
                message: 'Github Release?'
            }
        ];
        inquirer.prompt(isGithubRelease , function(answers) {
            if (answers) {
                helpers.addTo(cache, answers);
                resolve(cache);
            } else {
                reject(Error('prompt error'));
            }
        });
    });
};

prompt.gitAdd = function gitAdd(cache) {
    return new Promise(function(resolve, reject) {
        let gitAdd = [
            {
                name: 'gitAdd',
                type: 'confirm',
                // default: false,
                message: 'Do you want add all files to git index? --> ' + chalk.red('git add .')
            }
        ];
        inquirer.prompt(gitAdd , function(answers) {
            if (answers) {
                helpers.addTo(cache, answers);
                resolve(cache);
            } else {
                reject(Error('prompt error'));
            }
        });
    });
};

prompt.customProjectType = function customProjectType(cache) {
    return new Promise(function(resolve, reject) {
        let customProjectType = [
            {
                name: 'releaseType',
                type: 'checkbox',
                message: 'Select types:',
                choices: [
                    {
                        name: 'Changelog',
                        checked: true,
                        value: 'changelog'
                    },
                    {
                        name: 'Push files to remote',
                        checked: true,
                        value: 'push'
                    },
                    {
                        name: 'Github Release API',
                        disabled: 'under construction',
                        value: 'githubRelease'
                    },
                    {
                        name: 'NPM publish',
                        disabled: 'under construction',
                        value: 'npm'
                    },
                ],
            }
        ];
        inquirer.prompt(customProjectType , function(answers) {
            if (answers) {
                helpers.addTo(cache, answers);
                resolve(cache);
            } else {
                reject(Error('prompt error'));
            }
        });
    });
};

prompt.githubUser = function githubUser(cache) {
    return new Promise(function(resolve, reject) {
        let githubUser = [
            {
                name: 'askGithubUser',
                type: 'input',
                message: 'Github user:',
            }
        ];
        if (!cache.githubUser) {
            inquirer.prompt(githubUser , function(answers) {
                if (answers) {
                    helpers.addTo(cache, answers);
                    resolve(cache);

                } else {
                    reject(Error('prompt error'));
                }
            });
        } else {
            resolve(cache);
        }
    });
};
prompt.githubPass = function githubPass(cache) {
    return new Promise(function(resolve, reject) {
        let githubPass = [
            {
                name: 'askGithubPass',
                type: 'password',
                message: 'Github password:',
            }
        ];
        if (!cache.githubToken) {
            inquirer.prompt(githubPass , function(answers) {
                if (answers) {
                    helpers.addTo(cache, answers);
                    resolve(cache);

                } else {
                    reject(Error('prompt error'));
                }
            });
        } else {
            resolve(cache);
        }
    });
};

module.exports = prompt;
