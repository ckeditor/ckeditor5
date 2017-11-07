/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* eslint-env node */

const fs = require( 'fs' );
const path = require( 'path' );
const postcss = require( 'postcss' );
const postCssImport = require( 'postcss-import' );

module.exports = postcss.plugin( 'postcss-ckeditor-theme-importer', options => {
	const themeName = options.themePath.split( '/' ).slice( -1 );
	console.log( `Using theme "${ themeName }".` );

	return root => {
		const fileName = path.basename( root.source.input.file );
		const packageName = getPackageName( root.source.input.file );
		const relativeFilePath = path.relative( __dirname, root.source.input.file );
		const themeFile = path.resolve( __dirname, options.themePath, 'theme', packageName, fileName );

		if ( fs.existsSync( themeFile ) ) {
			console.log( `Found a corresponding theme file for ${ relativeFilePath }. Including.` );

			return new Promise( resolve => {
				fs.readFile( themeFile, 'utf8', ( err, data ) => {
					const processor = postcss( {
						plugins: [
							postCssImport()
						]
					} );

					return processor.process( data, { from: themeFile } )
						.then( result => {
							root.append( result.css );
							root.append( '\n' );

							resolve();
						} );
				} );
			} );
		} else {
			console.log( `Theme file for ${ relativeFilePath } not found in theme "${ themeName }".` );
		}
	};
} );

function getPackageName( path ) {
	const match = path.match( /ckeditor5-[^/]+/ );

	if ( match ) {
		return match[ 0 ];
	} else {
		return null;
	}
}

// function CKThemeLogger() {
// 	return ( root ) => {
// 		root.prepend( `/* ${ root.source.input.file } */` );
// 	};
// }

// const CKRaiseSpecificity = postcss.plugin( 'postcss-ck-specificity', ( opts ) => {
// 	opts = opts || {};

// 	return ( root, result ) => {
// 		root.walkRules( rule => {
// 			if ( rule.selector.match( /^\.ck-/g ) ) {
// 				rule.selector = 'body ' + rule.selector;
// 			}
// 		} );
// 	};
// } );
