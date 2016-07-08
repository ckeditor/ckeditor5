/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const path = require( 'path' );
const replace = require( 'gulp-replace' );
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
	const useStrictRegex = /^\s*'use strict';\s*$/gm;
	const glob = path.join( workdir, '**/*' );

	return gulp.src( glob )
		.pipe( filterGitignore() )
		.pipe( replace(
			useStrictRegex,
			'',
			{ skipBinary: true }
		) )
		.pipe( gulp.dest( workdir ) );
};
