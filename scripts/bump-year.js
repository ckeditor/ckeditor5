#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

/*

Usage:
node scripts/bump-year.js

Full command to update the entire project:
git pull && node scripts/bump-year.js

And after reviewing the changes:
git commit -am "Internal: Bumped the year." && git push

*/

const glob = require( 'glob' );
const minimatch = require( 'minimatch' );
const fs = require( 'fs' );

const includeDotFiles = {
	dot: true
};

glob( '!(build|coverage|node_modules|packages)/**', updateYear );

// LICENSE.md, .eslintrc.js, etc.
glob( '*', includeDotFiles, updateYear );

function updateYear( err, fileNames ) {
	const filteredFileNames = fileNames.filter( fileName => {
		// Filter out stuff from ckeditor5-utils/src/lib.
		if ( minimatch( fileName, '**/src/lib/**' ) ) {
			return false;
		}

		if ( fs.statSync( fileName ).isDirectory() ) {
			return false;
		}

		return true;
	} );

	filteredFileNames.forEach( fileName => {
		fs.readFile( fileName, ( err, data ) => {
			data = data.toString();

			const year = new Date().getFullYear();
			const regexp = /Copyright \(c\) 2003-\d{4}/g;
			const updatedData = data.replace( regexp, 'Copyright (c) 2003-' + year );

			if ( data == updatedData ) {
				// License headers are only required in JS files.
				// Also, the file might have already been updated.
				if ( fileName.endsWith( '.js' ) && !data.match( regexp ) ) {
					console.warn( `The file "${ process.cwd() }/${ fileName }" misses a license header.` );
				}
			} else {
				fs.writeFile( fileName, updatedData, err => {
					if ( err ) {
						throw err;
					}
				} );
			}
		} );
	} );
}
