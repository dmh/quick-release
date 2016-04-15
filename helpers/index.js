'use strict';

const _ = require('lodash');

const helpers = {};

helpers.isChecked = function isChecked(cache, args) {
    if (_.isArray(cache.releaseType)) {
        for (let releaseType of cache.releaseType) {
            var val = releaseType;
            for (let arg of args) {
                if (arg === val) {
                    return true;
                }
            }
        }
    } else {
        for (let arg of args) {
            if (arg === cache.releaseType) {
                return true;
            }
        }
    }
    return false;
};

helpers.addTo = function stats(cache, val) {
    if (val) {
        _.assign(cache, val);
    } else {
        console.log('error!');
    }
};

module.exports = helpers;
