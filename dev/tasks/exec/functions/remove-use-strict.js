/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const path = require( 'path' );
const replace = require( 'gulp-replace' );
const mergeStream = require( 'merge-stream' );
const filterGitignore = require( '../utils/filtergitignore' );

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
	return mergeStream(
		updateJshintrc( workdir ),
		removeUseStrict( workdir )
	);
};

// Updates .jshintrc file's `strict` option with `implied` value.
//
// @param {String} workdir Path of directory to be processed.
// @returns {Stream}
function updateJshintrc( workdir ) {
	const jshintrcPath = path.join( workdir, '.jshintrc' );
	const strictRegex = /("strict":.*?").*?(".*)/;
	const replaceWith = 'implied';

	return gulp.src( jshintrcPath )
		.pipe( replace(
			strictRegex,
			`$1${ replaceWith }$2`
		) )
		.pipe( gulp.dest( workdir ) );
}

// Removes `'use strict';` directive from project's source files. Omits files listed in `.gitignore`.
//
// @param {String} workdir Path of directory to be processed.
// @returns {Stream}
function removeUseStrict( workdir ) {
	const glob = path.join( workdir, '**/*' );
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
