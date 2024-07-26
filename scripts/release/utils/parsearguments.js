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
			'nightly-alpha',
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
			nightly: false,
			'nightly-alpha': false,
			concurrency: require( 'os' ).cpus().length / 2,
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
		'nightly-alpha'
	] );

	if ( options.nightly ) {
		options.npmTag = 'nightly';
	}

	if ( options.nightlyAlpha ) {
		options.branch = 'release';
		options.npmTag = 'alpha';
	}

	if ( process.env.CI ) {
		options.ci = true;
	}

	return options;
};

/**
 * Replaces all kebab-case keys in the `options` object with camelCase entries.
 * Kebab-case keys will be removed.
 *
 * @param {Object} options
 * @param {Array.<String>} keys Kebab-case keys in `options` object.
 */
function replaceKebabCaseWithCamelCase( options, keys ) {
	for ( const key of keys ) {
		const camelCaseKey = key.replace( /-./g, match => match[ 1 ].toUpperCase() );

		options[ camelCaseKey ] = options[ key ];
		delete options[ key ];
	}
}

/**
 * @typedef {Object} ReleaseOptions
 *
 * @property {Boolean} nightly
 *
 * @property {Boolean} nightlyAlpha
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
