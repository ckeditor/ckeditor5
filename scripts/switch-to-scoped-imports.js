#!/usr/bin/env node

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );

const srcPath = path.join( process.cwd(), '@(src|tests)' );

for ( const filePath of glob.sync( path.join( srcPath, '**', '*.js' ) ) ) {
	let fileContent = fs.readFileSync( filePath, 'utf-8' );

	fileContent = fileContent.replace( /from '(ckeditor5-[\w\-]+)\//g, 'from \'@ckeditor/$1/' );
	fileContent = fixInnerImports( filePath, fileContent );

	fs.writeFileSync( filePath, fileContent );
}

// Inner imports should be relative.
function fixInnerImports( filePath, fileContent ) {
	const packageName = filePath.match( /ckeditor5-[\w-]+/ )[ 0 ];
	const relativePath = filePath.replace( /^.+ckeditor5-[\w-]+\//, '' );
	const depth = relativePath.split( '/' ).length - 1;

	fileContent = fileContent.replace( new RegExp( ` '@ckeditor/${ packageName }/`, 'g' ), () => {
		const relativePath = '../'.repeat( depth );

		return ` '${ relativePath }`;
	} );

	return fileContent;
}
