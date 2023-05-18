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
			'nightly'
		],

		number: [
			'concurrency'
		],

		string: [
			'packages'
		],

		default: {
			nightly: false,
			concurrency: require( 'os' ).cpus().length / 2,
			packages: null
		}
	};

	const options = minimist( cliArguments, config );

	if ( typeof options.packages === 'string' ) {
		options.packages = options.packages.split( ',' );
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
 * @property {Array.<String>|null} packages
 */
