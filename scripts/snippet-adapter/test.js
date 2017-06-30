/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

const snippetAdapter = require( './snippetadapter' );
const path = require( 'path' );

snippetAdapter( {
	snippetSource: {
		html: path.resolve( __dirname, '../../docs/_snippets/basic/integration1.html' ),
		js: path.resolve( __dirname, '../../docs/_snippets/basic/integration1.js' )
	},
	snippetPath: 'basic/integration1',
	outputPath: path.resolve( __dirname, '../../build/docs/_snippets' ),
	relativeOutputPath: '../../_snippets',
	basePath: '../..'
} )
.then( data => {
	console.log( 'Success!' );
	console.log( data.html );
} )
.catch( err => {
	console.error( err.stack );
} );

