/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

const chalk = require( 'chalk' );
const path = require( 'path' );
const fs = require( 'fs' );
const glob = require( 'glob' );

const THEME_LARK_DIR_PATH = path.resolve( __dirname, '..', 'packages', 'ckeditor5-theme-lark', 'theme' );
const regexForIndexImports = /(?<=@import ".\/)(.*)(?=";)/gm;
const regexForMatchComments = /\/\*(?:(?!\*\/).|\n)*\*\//gm;

// Exit process when "theme-lark" package does not exists.
if ( !fs.existsSync( THEME_LARK_DIR_PATH ) ) {
	process.exit( 0 );
}

const globOptions = { cwd: THEME_LARK_DIR_PATH, ignore: [
	'**/build/**',
	'**/dist/**',
	'**/node_modules/**',
	'**/mixins/**',
	'theme.css',
	'index.css'
] };

// List of imported `CSS` files but not from main `index.css`.
const importedSubFilesList = [];

// List of all paths to `CSS` files in `theme` folder of `theme-lark` package.
const cssFilesPathsList = glob.sync( '**/*.css', globOptions );

cssFilesPathsList.forEach( filePath => {
	const fileContent = fs.readFileSync( path.join( THEME_LARK_DIR_PATH, filePath ), 'utf-8' );

	// Remove all comments (included commented code).
	const fileContentWithoutComments = fileContent.replaceAll( regexForMatchComments, '' );

	// Check if files other than `index.css` has `@import`.
	const matchList = [ ...fileContentWithoutComments.matchAll( regexForIndexImports ) ];
	const matchSimplifiedList = matchList.map( item => item[ 0 ] );

	if ( !matchSimplifiedList.length ) {
		return;
	}

	// Add paths to already imported files so we can exclude them from not imported ones.
	matchSimplifiedList.forEach( item => {
		importedSubFilesList.push( path.dirname( filePath ) + '/' + item );
	} );
} );

// Get content of `index.css` - main aggregator of `CSS`files.
const indexCssContent = fs.readFileSync( path.join( THEME_LARK_DIR_PATH, 'index.css' ), 'utf-8' );

// Remove all comments (included commented code).
const cssContentWithoutComments = indexCssContent.replaceAll( regexForMatchComments, '' );
const matchList = [ ...cssContentWithoutComments.matchAll( regexForIndexImports ) ];
const matchSimplifiedList = matchList.map( item => item[ 0 ] );

// Merge imported file paths gathered from `index.css` and from other `CSS` files.
const importedFiles = [ ...matchSimplifiedList, ...importedSubFilesList ];
const notImportedFiles = cssFilesPathsList.filter( x => !importedFiles.includes( x ) );

if ( notImportedFiles.length ) {
	console.log( chalk.red.bold( '\nSome CSS files are not imported in `index.css` in `theme-lark` package.' ) );
	notImportedFiles.forEach( file => console.log( chalk.red( ' - ' + file ) ) );
	process.exitCode = 1;
}
