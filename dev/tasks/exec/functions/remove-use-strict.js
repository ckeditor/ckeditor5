/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const path = require( 'path' );
const replace = require( 'gulp-replace' );
const filterGitignore = require( '../utils/filtergitignore' );
const tools = require( '../../../utils/tools' );

const jshintrcDirs = [
	'/',
	'dev/',
	'tests/'
];

/**
 * Removes lines with `'use strict';` directive.
 *
 * Example:
 *
 *		gulp exec --task remove-use-strict
 *
 * @param {String} workdir
 * @returns {Stream}
 */
module.exports = function executeRemoveUseStrict( workdir ) {
	updateJshintrc( workdir );

	return removeUseStrict( workdir );
};

// Updates .jshintrc file's `strict` option with `implied` value.
//
// @param {String} workdir Path of directory to be processed.
function updateJshintrc( workdir ) {
	jshintrcDirs.forEach(
		dir => {
			const jshintrcPath = path.join( workdir, dir, '.jshintrc' );

			tools.updateJSONFile( jshintrcPath, json => {
				json.strict = 'implied';

				return json;
			} );
		}
	);
}

// Removes `'use strict';` directive from project's source files. Omits files listed in `.gitignore`.
//
// @param {String} workdir Path of directory to be processed.
// @returns {Stream}
function removeUseStrict( workdir ) {
	const glob = path.join( workdir, '**/*.js' );
	const useStrictRegex = /^\s*'use strict';\s*$/gm;

	return gulp.src( glob )
		.pipe( filterGitignore() )
		.pipe( replace(
			useStrictRegex,
			'',
			{ skipBinary: true }
		) )
		.pipe( gulp.dest( workdir ) );
}
