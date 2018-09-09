/**
 * Created by user on 2018/9/9/009.
 */

import { SpawnSyncReturns } from 'child_process';
import YAML_FS, { IParseYAML, outputYAML, readYAML } from 'yaml-fs';
import bluebird = require('bluebird');
import YAML from 'yaml';
import * as fs from 'fs-extra';
import * as path from 'path';

import spawn = require('cross-spawn');

const BASE_TRAVIS_YML = '.travis.yml';

export interface IOptions
{
	binPath?: string,
	addToConf?: boolean,
	travisYml?: string,

	outputFile?: string,
}

export function getTravisBin(options?: IOptions)
{
	return options && options.binPath || 'travis';
}

export function stringifyArgv(key: string, value: string)
{
	return `${key}=${value}`
}

export function travisEncrypt(key: string, value: string, options?: IOptions)
{
	return bluebird
		.resolve()
		.then(function ()
		{
			return spawn.sync(getTravisBin(options), [
				'encrypt',
				stringifyArgv(key, value),
			], {
				//stdio: 'inherit',
			})
		})
		// @ts-ignore
		.then(function (ret: SpawnSyncReturns<Buffer>)
		{
			if (ret.error)
			{
				return Promise.reject(ret.error)
			}
			else if (ret.stderr && ret.stderr.length)
			{
				return Promise.reject(new Error(ret.stderr.toString()))
			}

			return ret;
		})
		.then(function (ret)
		{
			let ls = ret.output.filter(function (v)
			{
				return v && v.length;
			});

			return Buffer.concat(ls as any);
		})
		.then(function (ret)
		{
			return trimOutput(ret);
		})
		.then(parseSecure)
		.tap(async function (ret)
		{
			if (options.addToConf)
			{
				let file = BASE_TRAVIS_YML;

				if (options.travisYml)
				{
					file = options.travisYml;
				}

				let p = path.resolve(file);

				let data = await readYAML(file);

				data = updateTravis(ret, data);

				let outputFile = path.resolve(options.outputFile || file);

				await outputYAML(outputFile, data);
			}
		})
	;
}

export function updateTravis(ret: IParseSecure, data: IParseYAML)
{
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

export interface IParseSecure
{
	secure: string,
}

export function parseSecure(ret: string): IParseSecure
{
	let m = /^(?:secure:)?\s*"([^\"]+)"$/.exec(ret);

	if (!m || !m[1])
	{
		throw new Error(`parseSecure fail: ${ret}`);
	}

	return {
		secure: m[1],
	}
}

export function trimOutput(ret: string | Buffer)
{
	return ret.toString()
		.replace(/^\s*Please add the following to your \.travis\.yml file:\s*/ig, '')
		.replace(/\s*Pro Tip: You can add it automatically by running with --add\.\s*$/, '')
		.replace(/^\s+|\s+$/g, '')
	;
}

export default travisEncrypt
