#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const minimist = require( 'minimist' );

const {
	// The number of the associated GitHub or Bitbucket pull request. Only available on forked PRs.
	CIRCLE_PR_NUMBER
} = process.env;

module.exports = main();

function main() {
	const { exit } = getOptions( process.argv.slice( 2 ) );

	if ( CIRCLE_PR_NUMBER ) {
		return exit ? process.exit( 0 ) : true;
	}

	return exit ? process.exit( 1 ) : false;
}

/**
 * @param {Array.<String>} argv
 * @returns {Object} options
 * @returns {Boolean} options.exit
 */
function getOptions( argv ) {
	return minimist( argv, {
		boolean: [
			'exit'
		],
		default: {
			exit: false
		}
	} );
}
