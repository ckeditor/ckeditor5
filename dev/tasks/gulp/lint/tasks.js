/* jshint node: true, esnext: true */

'use strict';

const gulp = require( 'gulp' );
const jshint = require( 'gulp-jshint' );
const jscs = require( 'gulp-jscs' );
const fs = require( 'fs' );

module.exports = ( config ) => {
	const src = [ '**/*.js' ].concat( config.IGNORED_FILES.map( i => '!' + i ), getGitIgnore() );

	gulp.task( 'lint', () => {
		return gulp.src( src )
			.pipe( jscs() )
			.pipe( jshint() )
			.pipe( jscs.reporter() )
			.pipe( jshint.reporter( 'jshint-reporter-jscs' ) );
	} );

	/**
	 * Gets the list of ignores from `.gitignore`.
	 *
	 * @returns {String[]} The list of ignores.
	 */
	function getGitIgnore( ) {
		let gitIgnoredFiles = fs.readFileSync( '.gitignore', 'utf8' );

		return gitIgnoredFiles
			// Remove comment lines.
			.replace( /^#.*$/gm, '' )
			// Transform into array.
			.split( /\n+/ )
			// Remove empty entries.
			.filter( ( path ) => !!path )
			// Add `!` for ignore glob.
			.map( i => '!' + i );
	}
};
