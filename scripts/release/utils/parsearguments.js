/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const minimist = require( 'minimist' );

/**
 * @param {Array.<String>} cliArguments
 * @returns {ReleaseOptions} options
 */
module.exports = function parseArguments( cliArguments ) {
	const config = {
		boolean: [
			'nightly',
			'verbose',
			'compile-only',
			'ci'
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
			nightly: false,
			concurrency: require( 'os' ).cpus().length / 2,
			'compile-only': false,
			packages: null,
			branch: 'release',
			'npm-tag': 'staging',
			verbose: false,
			ci: false
		}
	};

	const options = minimist( cliArguments, config );

	if ( typeof options.packages === 'string' ) {
		options.packages = options.packages.split( ',' );
	}

	options.npmTag = options[ 'npm-tag' ];
	delete options[ 'npm-tag' ];

	options.compileOnly = options[ 'compile-only' ];
	delete options[ 'compile-only' ];

	if ( options.nightly ) {
		options.npmTag = 'nightly';
	}

	if ( process.env.CI ) {
		options.ci = true;
	}

	return options;
};

/**
 * @typedef {Object} ReleaseOptions
 *
 * @property {Boolean} nightly
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
