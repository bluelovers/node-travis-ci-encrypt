"use strict";
/**
 * Created by user on 2018/9/9/009.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_fs_1 = require("yaml-fs");
const bluebird = require("bluebird");
const path = require("path");
const spawn = require("cross-spawn");
const BASE_TRAVIS_YML = '.travis.yml';
function getTravisBin(options) {
    return options && options.binPath || 'travis';
}
exports.getTravisBin = getTravisBin;
function stringifyArgv(key, value) {
    return `${key}=${value}`;
}
exports.stringifyArgv = stringifyArgv;
function travisEncrypt(key, value, options) {
    return bluebird
        .resolve()
        .then(function () {
        return spawn.sync(getTravisBin(options), [
            'encrypt',
            stringifyArgv(key, value),
        ], {
        //stdio: 'inherit',
        });
    })
        // @ts-ignore
        .then(function (ret) {
        if (ret.error) {
            return Promise.reject(ret.error);
        }
        else if (ret.stderr && ret.stderr.length) {
            return Promise.reject(new Error(ret.stderr.toString()));
        }
        return ret;
    })
        .then(function (ret) {
        let ls = ret.output.filter(function (v) {
            return v && v.length;
        });
        return Buffer.concat(ls);
    })
        .then(function (ret) {
        return trimOutput(ret);
    })
        .then(parseSecure)
        .tap(async function (ret) {
        if (options.addToConf) {
            let file = BASE_TRAVIS_YML;
            if (options.travisYml) {
                file = options.travisYml;
            }
            let p = path.resolve(file);
            let data = await yaml_fs_1.readYAML(file);
            data = updateTravis(ret, data);
            let outputFile = path.resolve(options.outputFile || file);
            await yaml_fs_1.outputYAML(outputFile, data);
        }
    });
}
exports.travisEncrypt = travisEncrypt;
function updateTravis(ret, data) {
    /**
     * 要透過這樣才能更新 data.json
     * 否則永遠都會取得固定的 data.json
     */
    let dd = data.json;
    dd.env = dd.env || {};
    dd.env.global = dd.env.global || [];
    dd.env.global.push(ret);
    data.json = dd;
    return data;
}
exports.updateTravis = updateTravis;
function parseSecure(ret) {
    let m = /^(?:secure:)?\s*"([^\"]+)"$/.exec(ret);
    if (!m || !m[1]) {
        throw new Error(`parseSecure fail: ${ret}`);
    }
    return {
        secure: m[1],
    };
}
exports.parseSecure = parseSecure;
function trimOutput(ret) {
    return ret.toString()
        .replace(/^\s*Please add the following to your \.travis\.yml file:\s*/ig, '')
        .replace(/\s*Pro Tip: You can add it automatically by running with --add\.\s*$/, '')
        .replace(/^\s+|\s+$/g, '');
}
exports.trimOutput = trimOutput;
exports.default = travisEncrypt;
