/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import minimist from 'minimist';
import os from 'os';
import replaceKebabCaseWithCamelCase from '../../utils/replacekebabcasewithcamelcase.mjs';

/**
 * @param {Array.<String>} cliArguments
 * @returns {ReleaseOptions} options
 */
export default function parseArguments( cliArguments ) {
	const config = {
		boolean: [
			'internal',
			'nightly',
			'nightly-alpha',
			'nightly-next',
			'verbose',
			'compile-only',
			'ci',
			'external'
		],

		number: [
			'concurrency'
		],

		string: [
			'branch',
			'from',
			'npm-tag',
			'packages'
		],

		default: {
			internal: false,
			nightly: false,
			'nightly-alpha': false,
			'nightly-next': false,
			concurrency: os.cpus().length / 2,
			'compile-only': false,
			packages: null,
			branch: 'release',
			'npm-tag': 'staging',
			verbose: false,
			ci: false,
			external: true
		}
	};

	const options = minimist( cliArguments, config );

	if ( typeof options.packages === 'string' ) {
		options.packages = options.packages.split( ',' );
	}

	replaceKebabCaseWithCamelCase( options, [
		'npm-tag',
		'compile-only',
		'nightly-alpha',
		'nightly-next'
	] );

	if ( options.nightly ) {
		options.npmTag = 'nightly';
	}

	if ( options.nightlyAlpha ) {
		options.branch = 'release';
		options.npmTag = 'alpha';
	}

	if ( options.internal ) {
		options.npmTag = 'internal';
	}

	if ( process.env.CI ) {
		options.ci = true;
	}

	return options;
}

/**
 * @typedef {Object} ReleaseOptions
 *
 * @property {Boolean} internal
 *
 * @property {Boolean} nightly
 *
 * @property {Boolean} nightlyAlpha
 *
 * @property {Boolean} nightlyNext
 *
 * @property {Boolean} external
 *
 * @property {Boolean} [compileOnly=false]
 *
 * @property {Number} concurrency
 *
 * @property {String} [from]
 *
 * @property {String} [branch='release']
 *
 * @property {String} [npmTag='staging'|'nightly']
 *
 * @property {Array.<String>|null} packages
 *
 * @property {Boolean} [verbose=false]
 *
 * @property {Boolean} [ci=false]
 */
