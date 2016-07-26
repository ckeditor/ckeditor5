/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const path = require( 'path' );
const replace = require( 'gulp-replace' );
const filterGitignore = require( '../utils/filtergitignore' );
const filter = require( 'gulp-filter' );
const { tools } = require( 'ckeditor5-dev-utils' );

/**
 * Removes lines with `'use strict';` directive.
 *
 * Example:
 *
 *		gulp exec --task remove-use-strict --include-root
 *
 * @param {String} workdir
 * @returns {Stream}
 */
module.exports = function executeRemoveUseStrict( workdir ) {
	updateJshintrc( workdir );
	reformatOtherConfigs( workdir );

	return removeUseStrict( workdir );
};

// Updates .jshintrc file's `strict` option with `implied` value.
//
// @param {String} workdir Path of directory to be processed.
function updateJshintrc( workdir ) {
	[ '/', 'tests/' ].forEach(
		dir => {
			const jshintrcPath = path.join( workdir, dir, '.jshintrc' );

			tools.updateJSONFile( jshintrcPath, json => {
				json.strict = 'implied';

				return json;
			} );
		}
	);
}

// Reformats (to match other .jshintrc files and package.json code style) the .jshintrc from dev/ and main .jscsrc.
//
// @param {String} workdir Path of directory to be processed.
function reformatOtherConfigs( workdir ) {
	tools.updateJSONFile( path.join( workdir, 'dev', '.jshintrc' ), json => json );
	tools.updateJSONFile( path.join( workdir, '.jscsrc' ), json => json );
}

// Removes `'use strict';` directive from project's source files. Omits files listed in `.gitignore`.
//
// @param {String} workdir Path of directory to be processed.
// @returns {Stream}
function removeUseStrict( workdir ) {
	const glob = path.join( workdir, '**/*.js' );
	const filterDev = filter( '@(src|tests)/**/*.js', { restore: true } );
	const filterGulpfileAndBender = filter(
		[ 'gulpfile.js', 'dev/tasks/dev/templates/gulpfile.js', 'bender.js' ],
		{ restore: true }
	);

	const useStrictRegex = /^\s*'use strict';\s*$/gm;
	const jshintInlineConfigRegex = /\/\* jshint( browser: false,)? node: true \*\//;

	return gulp.src( glob )
		.pipe( filterGitignore() )

		// Remove use strict from src/ and tests/.
		.pipe( filterDev )
		.pipe( replace(
			useStrictRegex,
			''
		) )
		.pipe( filterDev.restore )

		// Fix gulpfile.js and bender.js.
		.pipe( filterGulpfileAndBender )
		.pipe( replace(
			jshintInlineConfigRegex,
			'/* jshint browser: false, node: true, strict: true */'
		) )
		.pipe( filterGulpfileAndBender.restore )

		.pipe( gulp.dest( workdir ) );
}
