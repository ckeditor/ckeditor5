/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const fs = require( 'fs' );
const filter = require( 'gulp-filter' );
const parseGitignore = require( 'parse-gitignore' );
const PassThrough = require( 'stream' ).PassThrough;

module.exports = function filterGitignore() {
	const fileName = '.gitignore';

	if ( !fs.existsSync( fileName ) ) {
		return new PassThrough( { objectMode: true } );
	}

	const gitignoreGlob =
		parseGitignore( fileName )
			// Invert '!foo' -> 'foo' and 'foo' -> '!foo'.
			.map( pattern => pattern.startsWith( '!' ) ? pattern.slice( 1 ) : '!' + pattern )
			.unshift( '**/*' );

	return filter( gitignoreGlob );
};
