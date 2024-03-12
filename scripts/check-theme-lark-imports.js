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
const REGEX_FOR_INDEX_IMPORTS = /(?<=@import ".\/)(.*)(?=";)/gm;
const REGEX_FOR_MATCHING_COMMENTS = /\/\*(?:(?!\*\/).|\n)*\*\//gm;

// Exit process when 'theme-lark' package does not exist.
if ( !fs.existsSync( THEME_LARK_DIR_PATH ) ) {
	process.exit( 0 );
}

// List of imported `CSS` files but not from main `index.css`.
const listOfImportsFoundInSubfolders = [];

// List of ignored paths or path templates.
// If some of `CSS` file should be present in `theme` folder but it shouldn't be imported in main `index.css` please put it into this list.
const ignoreList = [
	'**/build/**',
	'**/dist/**',
	'**/node_modules/**',
	'**/mixins/**',
	'theme.css',
	'index.css'
];

const globOptions = { cwd: THEME_LARK_DIR_PATH, ignore: ignoreList };

// List of all paths to `CSS` files in `theme` folder of `theme-lark` package.
const cssFilesPathsList = glob.sync( '**/*.css', globOptions );

cssFilesPathsList.forEach( filePath => {
	const fileContent = fs.readFileSync( path.join( THEME_LARK_DIR_PATH, filePath ), 'utf-8' );

	// Remove all comments (included commented code).
	const fileContentWithoutComments = fileContent.replaceAll( REGEX_FOR_MATCHING_COMMENTS, '' );

	// Check if files other than `index.css` has `@import`.
	const matchList = [ ...fileContentWithoutComments.matchAll( REGEX_FOR_INDEX_IMPORTS ) ];
	const matchSimplifiedList = matchList.map( item => item[ 0 ] );

	if ( !matchSimplifiedList.length ) {
		return;
	}

	// Add paths to already imported files so we can exclude them from not imported ones.
	matchSimplifiedList.forEach( item => {
		listOfImportsFoundInSubfolders.push( path.dirname( filePath ) + '/' + item );
	} );
} );

// Get content of `index.css` - main aggregator of `CSS`files.
const indexCssContent = fs.readFileSync( path.join( THEME_LARK_DIR_PATH, 'index.css' ), 'utf-8' );

// Remove all comments (included commented code).
const cssContentWithoutComments = indexCssContent.replaceAll( REGEX_FOR_MATCHING_COMMENTS, '' );
const importsList = [ ...cssContentWithoutComments.matchAll( REGEX_FOR_INDEX_IMPORTS ) ].map( item => item[ 0 ] );

// Merge imported file paths gathered from `index.css` and from other `CSS` files.
const importedFiles = [ ...importsList, ...listOfImportsFoundInSubfolders ];
const notImportedFiles = cssFilesPathsList.filter( x => !importedFiles.includes( x ) );

if ( notImportedFiles.length ) {
	console.log( chalk.red.bold( '\nSome CSS files are not imported in "index.css" file in "theme-lark" package.' ) );

	notImportedFiles.forEach( file => console.log( chalk.red( ` - "${ file }"` ) ) );
	process.exitCode = 1;
}
