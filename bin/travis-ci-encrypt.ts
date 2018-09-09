/**
 * Created by user on 2018/9/9/009.
 */

import yargs = require('yargs');
import travisEncrypt from '..';

const argv = yargs
	.option('key', {
		alias: ['k'],
		type: 'string',
		requiresArg: true,
		demandOption: true,
	})
	.option('value', {
		alias: ['v'],
		type: 'string',
		requiresArg: true,
		demandOption: true,
	})
	.option('add', {
		alias: ['a'],
		type: 'boolean',
	})
	.option('input', {
		alias: ['i'],
		type: 'string',
		requiresArg: true,
		normalize: true,
	})
	.option('output', {
		alias: ['o'],
		type: 'string',
		requiresArg: true,
		normalize: true,
	})
	.argv
;

if (!argv.key)
{
	throw new TypeError(`Bad required arguments: key`);
}

travisEncrypt(argv.key, argv.value, {
	travisYml: argv.input,
	outputFile: argv.output,
	addToConf: argv.add,
});


