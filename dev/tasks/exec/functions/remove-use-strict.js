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
	const jshintrcGlob = jshintrcDirs.map(
		dir => path.join( workdir, dir, '.jshintrc' )
	);

	// Match everything after `"strict":` apart from optional comma. This should be matched into separate group.
	const strictRegex = /"strict":[^,\n\r]*(,?)$/m;
	const replaceWith = '"strict": "implied"';

	return gulp.src( jshintrcGlob, { base: workdir } )
		.pipe( replace(
			strictRegex,
			`${ replaceWith }$1`
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
