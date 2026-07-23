/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Validates the CSS entry point convention in every package. See:
 * https://github.com/ckeditor/ckeditor5/issues/17102
 * https://github.com/ckeditor/ckeditor5-internal/issues/4265
 * https://github.com/ckeditor/ckeditor5-internal/issues/4268
 *
 * Every package with theme styles must have disjoint `theme/index-editor.css` and
 * `theme/index-content.css` import graphs. Every non-entry stylesheet must be reachable
 * from exactly one graph, and `src/index.ts` must import both entry points.
 */

import { existsSync, globSync, readFileSync } from 'node:fs';
import { styleText } from 'node:util';
import upath from 'upath';
import { generate, parse, walk } from '@eslint/css-tree';
import { parseSync } from 'oxc-parser';
import { PACKAGES_DIRECTORY } from './release/utils/constants.mjs';

const ENTRY_FILES = [ 'index-editor.css', 'index-content.css' ];
const packageDirs = globSync( upath.join( process.cwd(), PACKAGES_DIRECTORY, '*', 'package.json' ) )
	.map( packageJsonPath => upath.dirname( upath.normalize( packageJsonPath ) ) )
	.sort();
const errors = [];

for ( const packageDir of packageDirs ) {
	validatePackage( packageDir );
}

if ( errors.length ) {
	console.log( styleText( [ 'red', 'bold' ], 'Found problems with the package CSS entry points:' ) );
	errors.forEach( error => console.log( styleText( 'red', ` - ${ error }` ) ) );
	process.exit( 1 );
} else {
	console.log( styleText( 'green', 'All package stylesheets are reachable from exactly one CSS entry point.' ) );
}

function validatePackage( packageDir ) {
	const packageName = upath.basename( packageDir );
	const themeDir = upath.join( packageDir, 'theme' );
	const entryPaths = ENTRY_FILES.map( fileName => upath.join( themeDir, fileName ) );
	const themeFiles = globSync( upath.join( themeDir, '**', '*.css' ), {
		exclude: [ '**/node_modules/**' ]
	} )
		.map( file => upath.normalize( file ) )
		.filter( file => !entryPaths.includes( file ) );

	if ( !themeFiles.length && entryPaths.every( entryPath => !existsSync( entryPath ) ) ) {
		return;
	}

	const missingEntries = entryPaths.filter( entryPath => !existsSync( entryPath ) );

	for ( const entryPath of missingEntries ) {
		errors.push( `"${ packageName }": missing the "theme/${ upath.basename( entryPath ) }" entry point.` );
	}

	if ( missingEntries.length ) {
		return;
	}

	const reachableByEntry = new Map();

	for ( const entryPath of entryPaths ) {
		const reachableFiles = new Set();

		collectImportedFiles(
			packageName,
			themeDir,
			entryPath,
			reachableFiles,
			upath.basename( entryPath ) === 'index-editor.css'
		);
		reachableByEntry.set( entryPath, reachableFiles );

		for ( const otherEntryPath of entryPaths ) {
			if ( reachableFiles.has( otherEntryPath ) ) {
				errors.push(
					`"${ packageName }": "theme/${ upath.basename( entryPath ) }" must not import ` +
					`"theme/${ upath.basename( otherEntryPath ) }".`
				);
			}
		}
	}

	for ( const file of themeFiles ) {
		const importingEntries = entryPaths.filter( entryPath => reachableByEntry.get( entryPath ).has( file ) );
		const relativeFile = upath.relative( packageDir, file );

		if ( !importingEntries.length ) {
			errors.push( `"${ packageName }": "${ relativeFile }" is not imported by a theme entry point.` );
		} else if ( importingEntries.length > 1 ) {
			errors.push( `"${ packageName }": "${ relativeFile }" is imported by both theme entry points.` );
		}
	}

	const indexPath = upath.join( packageDir, 'src', 'index.ts' );
	const indexImports = existsSync( indexPath ) ?
		parseSync( indexPath, readFileSync( indexPath, 'utf-8' ) ).module.staticImports :
		[];

	for ( const entryFile of ENTRY_FILES ) {
		if ( !indexImports.some( ( { moduleRequest } ) => moduleRequest.value === `../theme/${ entryFile }` ) ) {
			errors.push( `"${ packageName }": "src/index.ts" does not import "../theme/${ entryFile }".` );
		}
	}

	// A `sideEffects` list that does not cover the package entry point makes bundlers
	// skip the entry module during re-export resolution, dropping the stylesheet imports.
	const { sideEffects } = JSON.parse( readFileSync( upath.join( packageDir, 'package.json' ), 'utf-8' ) );

	if ( sideEffects === false ) {
		errors.push( `"${ packageName }": the "sideEffects" field in "package.json" must not disable the "src/index.ts" side effects.` );
	} else if ( Array.isArray( sideEffects ) && !sideEffects.includes( 'src/index.ts' ) ) {
		errors.push( `"${ packageName }": the "sideEffects" field in "package.json" must include "src/index.ts".` );
	}
}

function collectImportedFiles( packageName, themeDir, filePath, reachableFiles, allowBareImports ) {
	walk( parse( readFileSync( filePath, 'utf-8' ) ), {
		visit: 'Atrule',
		enter: node => {
			if ( node.name.toLowerCase() !== 'import' ) {
				return;
			}

			const firstChild = node.prelude?.children?.first;

			if ( firstChild?.type !== 'String' && firstChild?.type !== 'Url' ) {
				const params = node.prelude ? generate( node.prelude ) : '';

				errors.push( `"${ packageName }": "${ filePath }" contains an unsupported @import: "${ params }".` );

				return;
			}

			const target = firstChild.value;

			// Imports of stylesheets from other packages (bare specifiers) are not followed.
			if ( !target.startsWith( '.' ) ) {
				if ( !allowBareImports ) {
					errors.push( `"${ packageName }": content styles must not import the external stylesheet "${ target }".` );
				}

				return;
			}

			const targetPath = upath.join( upath.dirname( filePath ), target );

			if ( reachableFiles.has( targetPath ) ) {
				return;
			}

			if ( !existsSync( targetPath ) ) {
				errors.push( `"${ packageName }": "${ filePath }" imports the non-existing file "${ target }".` );

				return;
			}

			reachableFiles.add( targetPath );

			if ( upath.relative( themeDir, targetPath ).startsWith( '..' ) ) {
				errors.push( `"${ packageName }": "${ filePath }" imports "${ targetPath }" from outside the "theme" directory.` );

				return;
			}

			collectImportedFiles( packageName, themeDir, targetPath, reachableFiles, allowBareImports );
		}
	} );
}
