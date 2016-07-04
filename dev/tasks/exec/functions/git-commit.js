/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const git = require( '../utils/git' );
const PassThrough = require( 'stream' ).PassThrough;

/**
 * Adds only modified files to git repository and commits them with provided message
 * Example: gulp exec --task git-commit --message "Commit message."
 *
 * @param {String} workdir
 * @param {Object} params
 * @returns {Object} stream
 */
module.exports = ( workdir, params ) => {
	const message = params.message;

	if ( !message ) {
		throw new Error( 'You must provide commit message with parameter: --message' );
	}

	git.commit( message, workdir );

	// Return dummy stream to inform gulp about finishing task
	return new PassThrough();
};
