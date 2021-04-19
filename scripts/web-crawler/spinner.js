#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const chalk = require( 'chalk' );

const ora = require( 'ora' );

/**
 * Creates nice-looking CLI spinner.
 */
function createSpinner() {
	return ora( {
		spinner: {
			frames: [ '⣾', '⣷', '⣯', '⣟', '⡿', '⢿', '⣻', '⣽' ]
		}
	} );
}

/**
 * Returns a progress handler, which is called every time just before opening a new link.
 *
 * @param {Object} spinner Spinner instance
 * @returns {Function} Progress handler.
 */
function getProgressHandler( spinner ) {
	let current = 0;

	return ( { total } ) => {
		current++;

		const progress = Math.round( current / total * 100 );

		spinner.text = `Checking pages… ${ chalk.bold( `${ progress }% (${ current } of ${ total })` ) }`;
	};
}

module.exports = {
	createSpinner,
	getProgressHandler
};
