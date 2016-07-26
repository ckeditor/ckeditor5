/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const { tools } = require( 'ckeditor5-dev-utils' );

/**
 * Runs custom shell command over each package.
 *
 * Example:
 *
 *		gulp exec --task sh --cmd "sed 's/find/replace' file.js"
 *
 * @param {String} workdir
 * @param {Object} params
 */
module.exports = function executeShellCommand( workdir, params ) {
	// Needed to see results of commands printing to stdout/stderr.
	const shouldLogOutput = true;
	const cmd = params.cmd;

	if ( !cmd ) {
		throw new Error( 'You must provide command to execute with parameter: --cmd "command"' );
	}

	tools.shExec( cmd, shouldLogOutput );
};
