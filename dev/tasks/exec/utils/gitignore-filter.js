/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const fs = require( 'fs' );
const filter = require( 'gulp-filter' );
const gitignore = require( 'parse-gitignore' );
const PassThrough = require( 'stream' ).PassThrough;

module.exports = () => {
	const fp = '.gitignore';

	if ( !fs.existsSync( fp ) ) {
		return new PassThrough( { objectMode: true } );
	}

	let glob = gitignore( fp );
	let inverted = glob.map(
		pattern => pattern.startsWith( '!' ) ? pattern.slice( 1 ) : '!' + pattern
	);
	inverted.unshift( '**/*' );

	return filter( inverted );
};
