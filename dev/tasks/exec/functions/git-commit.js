/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const { git } = require( 'ckeditor5-dev-utils' );

/**
 * Adds only modified files to git repository and commits them with provided message.
 *
 * Example:
 *
 *		gulp exec --task git-commit --message "Commit message."
 *
 * @param {String} workdir
 * @param {Object} params
 */
module.exports = function executeGitCommit( workdir, params ) {
	const message = params.message;

	if ( !message ) {
		throw new Error( 'You must provide commit message with parameter: --message' );
	}

	git.commit( message, workdir );
};
