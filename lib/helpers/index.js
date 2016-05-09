'use strict';

const _ = require('lodash');
const chalk = require('chalk');

const helpers = module.exports = {};

// helpers.isChecked = function isChecked(cache, args) {
//     if (_.isArray(cache.releaseType)) {
//         for (let releaseType of cache.releaseType) {
//             var val = releaseType;
//             for (let arg of args) {
//                 if (arg === val) {
//                     return true;
//                 }
//             }
//         }
//     } else {
//         for (let arg of args) {
//             if (arg === cache.releaseType) {
//                 return true;
//             }
//         }
//     }
//     return false;
// };

helpers.addTo = function stats(cache, val) {
    if (val) {
        _.assign(cache, val);
    } else {
        console.log(Error('in helpers.addTo'));
    }
};

helpers.promiseChainStarter = function promiseChainStarter(val) {
    return new Promise(function(resolve) {
        resolve(val);
    });
};

helpers.error = function stats(fn, err) {
    console.log(chalk.red('Error!'));
    console.log(chalk.red('Parent function: ') + chalk.blue(fn) + '()' + '\n');
    console.log(chalk.red.underline('Error stack:'));
    console.log(err.stack);
    console.log(chalk.red('Parent function: ') + chalk.blue(fn) + '()');
};
