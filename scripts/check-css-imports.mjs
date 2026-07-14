/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Validates the "CSS entry point" convention in every package. See:
 * https://github.com/ckeditor/ckeditor5/issues/17102
 * https://github.com/ckeditor/ckeditor5-internal/issues/4265
 *
 * For each package in the `packages` directory (relative to the current working directory)
 * that contains stylesheets in its `theme` directory:
 *
 * 1. The `theme/index.css` entry point must exist.
 * 2. Every stylesheet in `theme` must be reachable from the entry point through `@import` chains.
 * 3. Every relative `@import` must point at an existing file inside the `theme` directory.
 * 4. The package entry module (`src/index.ts`) must import `../theme/index.css`.
 */

import fs from 'fs-extra';
import chalk from 'chalk';
import upath from 'upath';
import { globSync } from 'glob';
import { PACKAGES_DIRECTORY } from './release/utils/constants.mjs';

const packageDirs = globSync( upath.join( process.cwd(), PACKAGES_DIRECTORY, '*', 'package.json' ) )
	.map( packageJsonPath => upath.dirname( upath.normalize( packageJsonPath ) ) )
	.sort();

const errors = [];

for ( const packageDir of packageDirs ) {
	validatePackage( packageDir );
}

if ( errors.length ) {
	console.log( chalk.red.bold( 'Found problems with the package CSS entry points:' ) );

	errors.forEach( error => console.log( chalk.red( ` - ${ error }` ) ) );

	process.exit( 1 );
} else {
	console.log( chalk.green( 'All package stylesheets are imported in the "theme/index.css" entry points.' ) );
}

function validatePackage( packageDir ) {
	const packageName = upath.basename( packageDir );
	const themeDir = upath.join( packageDir, 'theme' );
	const entryPath = upath.join( themeDir, 'index.css' );

	const themeFiles = globSync( upath.join( themeDir, '**', '*.css' ), {
		ignore: [ '**/node_modules/**' ]
	} )
		.map( file => upath.normalize( file ) )
		.filter( file => file !== entryPath );

	if ( !themeFiles.length && !fs.existsSync( entryPath ) ) {
		return;
	}

	if ( !fs.existsSync( entryPath ) ) {
		errors.push( `"${ packageName }": missing the "theme/index.css" entry point.` );

		return;
	}

	const reachableFiles = new Set();

	collectImportedFiles( packageName, entryPath, reachableFiles );

	for ( const file of themeFiles ) {
		if ( !reachableFiles.has( file ) ) {
			errors.push( `"${ packageName }": "${ upath.relative( packageDir, file ) }" is not imported in "theme/index.css".` );
		}
	}

	for ( const file of reachableFiles ) {
		if ( upath.relative( themeDir, file ).startsWith( '..' ) ) {
			errors.push( `"${ packageName }": "theme/index.css" imports "${ file }" from outside the "theme" directory.` );
		}
	}

	const indexPath = upath.join( packageDir, 'src', 'index.ts' );
	const indexContent = fs.existsSync( indexPath ) ? removeComments( fs.readFileSync( indexPath, 'utf-8' ) ) : '';

	if ( !/^import '\.\.\/theme\/index\.css';$/m.test( indexContent ) ) {
		errors.push( `"${ packageName }": "src/index.ts" does not import "../theme/index.css".` );
	}

	// A `sideEffects` list that does not cover the package entry point makes bundlers
	// skip the entry module during re-export resolution, dropping the stylesheet import.
	const { sideEffects } = fs.readJsonSync( upath.join( packageDir, 'package.json' ) );

	if ( sideEffects === false ) {
		errors.push( `"${ packageName }": the "sideEffects" field in "package.json" must not disable the "src/index.ts" side effects.` );
	} else if ( Array.isArray( sideEffects ) && !sideEffects.includes( 'src/index.ts' ) ) {
		errors.push( `"${ packageName }": the "sideEffects" field in "package.json" must include "src/index.ts".` );
	}
}

function collectImportedFiles( packageName, filePath, reachableFiles ) {
	const content = removeComments( fs.readFileSync( filePath, 'utf-8' ) );
	const importTargets = [ ...content.matchAll( /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?[^;]*;/g ) ]
		.map( ( [ , target ] ) => target );

	for ( const target of importTargets ) {
		// Imports of stylesheets from other packages (bare specifiers) are not followed.
		if ( !target.startsWith( '.' ) ) {
			continue;
		}

		const targetPath = upath.join( upath.dirname( filePath ), target );

		if ( reachableFiles.has( targetPath ) ) {
			continue;
		}

		if ( !fs.existsSync( targetPath ) ) {
			errors.push( `"${ packageName }": "${ filePath }" imports the non-existing file "${ target }".` );

			continue;
		}

		reachableFiles.add( targetPath );
		collectImportedFiles( packageName, targetPath, reachableFiles );
	}
}

function removeComments( content ) {
	return content.replace( /\/\*[\s\S]*?\*\//g, '' );
}
