/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
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
			'verbose'
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
			packages: null,
			branch: 'release',
			'npm-tag': 'staging',
			verbose: false
		}
	};

	const options = minimist( cliArguments, config );

	if ( typeof options.packages === 'string' ) {
		options.packages = options.packages.split( ',' );
	}

	options.npmTag = options[ 'npm-tag' ];
	delete options[ 'npm-tag' ];

	if ( options.nightly ) {
		options.npmTag = 'nightly';
	}

	return options;
};

/**
 * @typedef {Object} ReleaseOptions
 *
 * @property {Boolean} nightly
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
 */
