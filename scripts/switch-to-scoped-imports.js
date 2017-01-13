#!/usr/bin/env node

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );

const srcPath = path.join( process.cwd(), '@(src|tests)' );

for ( const filePath of glob.sync( path.join( srcPath, '**', '*.js' ) ) ) {
	const fileContent = fs.readFileSync( filePath, 'utf-8' )
		.replace( /from '(ckeditor5-[\w\-]+)\//g, 'from \'@ckeditor/$1/' );

	fs.writeFileSync( filePath, fileContent );
}
