/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Checks if all CSS files from `theme` directory of `theme-lark` package are imported in `index.css`.
//
// See: https://github.com/ckeditor/ckeditor5/issues/16010.
//
// Usage:
// 	yarn run check-theme-lark-imports

import chalk from 'chalk';
import upath from 'upath';
import fs from 'fs';
import { globSync } from 'glob';
import { CKEDITOR5_ROOT_PATH } from './constants.mjs';

const THEME_LARK_DIR_PATH = upath.resolve( CKEDITOR5_ROOT_PATH, 'packages', 'ckeditor5-theme-lark', 'theme' );
const REGEX_FOR_INDEX_IMPORTS = /(?<=@import ")(.*)(?=";)/gm;
const REGEX_FOR_MATCHING_COMMENTS = /\/\*(?:(?!\*\/).|\n)*\*\//gm;

// Exit process when 'theme-lark' package does not exist.
if ( !fs.existsSync( THEME_LARK_DIR_PATH ) ) {
	process.exit( 0 );
}

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
const cssFilesPathsList = globSync( '**/*.css', globOptions )
	.map( item => upath.normalize( item ) );

// List of imported `CSS` files but not from main `index.css`.
const listOfImportsFoundInSubfolders = cssFilesPathsList
	.map( path => getImportPathsList( path ).map( item => upath.join( upath.dirname( path ), item ) ) )
	.flat();

const importPathsListFromIndex = getImportPathsList( 'index.css' );

// Merge imported file paths gathered from `index.css` and from other `CSS` files.
const importedFiles = [ ...importPathsListFromIndex, ...listOfImportsFoundInSubfolders ]
	.map( importPath => upath.normalize( importPath ) );
const notImportedFiles = cssFilesPathsList.filter( x => !importedFiles.includes( x ) );

if ( notImportedFiles.length ) {
	console.log( chalk.red.bold(
		'\nSome CSS files from "theme" directory of "theme-lark" package are not imported in "index.css" file.'
	) );
	notImportedFiles.forEach( file => console.log( chalk.red( ` - "${ file }"` ) ) );
	process.exitCode = 1;
} else {
	console.log( chalk.red.green( '\nAll CSS files from "theme" directory of "theme-lark" package are imported in "index.css".' ) );
}

/**
 * Returns list of normalized paths of imported `CSS` files found in given `CSS` file.
 *
 * @param {String} filePathToCheck Path to `CSS` file.
 */
function getImportPathsList( filePathToCheck ) {
	const fileContent = fs.readFileSync( upath.join( THEME_LARK_DIR_PATH, filePathToCheck ), 'utf-8' );

	// Remove all comments (included commented code).
	const contentWithoutComments = fileContent.replaceAll( REGEX_FOR_MATCHING_COMMENTS, '' );

	return [ ...contentWithoutComments.matchAll( REGEX_FOR_INDEX_IMPORTS ) ]
		.map( item => upath.normalize( item[ 0 ] ) );
}
