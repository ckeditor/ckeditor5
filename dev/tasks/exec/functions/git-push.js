/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const git = require( '../utils/git' );
const PassThrough = require( 'stream' ).PassThrough;

/**
 * Pushes changes of current branch in repository to default origin.
 *
 * Example:
 *
 *		gulp exec --task git-push
 *
 * @param {String} workdir
 * @returns {Stream}
 */
module.exports = function executeGitPush( workdir ) {
	git.push( workdir );

	// Return dummy stream to inform gulp about finishing task.
	return new PassThrough();
};
