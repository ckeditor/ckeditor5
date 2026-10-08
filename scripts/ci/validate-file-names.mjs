#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { execFileSync } from 'node:child_process';
import { styleText } from 'node:util';
import { CKEDITOR5_ROOT_PATH, CKEDITOR5_COMMERCIAL_PATH, IS_ISOLATED_REPOSITORY } from '../constants.mjs';

/**
 * Verifies that file and directory names are safe to publish as a part of a URL.
 *
 * See https://github.com/ckeditor/ckeditor5-internal/issues/4394.
 */

const ALLOWED_CHARACTERS = [ 'a-z', 'A-Z', '0-9', '.', '_', '-' ];
const ALLOWED_SEGMENT_PATTERN = new RegExp( `^[${ ALLOWED_CHARACTERS.join( '' ) }]+$` );

const REPOSITORY_ROOT = IS_ISOLATED_REPOSITORY ? CKEDITOR5_ROOT_PATH : CKEDITOR5_COMMERCIAL_PATH;

console.log( styleText( 'magenta', '\nValidating file names...' ) );

const invalidPaths = getInvalidPaths( getTrackedFilePaths() );

if ( !invalidPaths.length ) {
	console.log( styleText( 'green', 'Validation successful.' ) );
} else {
	console.log( styleText( 'red', '\nThe following files and directories do not meet the naming guidelines:' ) );
	console.log( invalidPaths.map( formatInvalidPath ).join( '\n' ) );
	console.log( styleText( 'red', `\nAllowed characters: ${ ALLOWED_CHARACTERS.join( ' ' ) }` ) );

	process.exit( 1 );
}

/**
 * Highlights the offending name in a reported path. `getInvalidPaths()` truncates each path at the segment
 * that breaks the convention, so the name to highlight is always the last one.
 */
function formatInvalidPath( invalidPath ) {
	const separatorIndex = invalidPath.lastIndexOf( '/' );

	return styleText( 'red', ` - ${ invalidPath.slice( 0, separatorIndex + 1 ) }` ) +
		styleText( [ 'red', 'bold' ], invalidPath.slice( separatorIndex + 1 ) );
}

/**
 * Returns every file tracked by git in the validated repository, relative to its root.
 */
function getTrackedFilePaths() {
	// Without `-z`, git quotes paths containing spaces and escapes non-ASCII characters, which is exactly
	// the shape of the names this validator looks for. The flag prints them raw, separated with NUL.
	const output = execFileSync( 'git', [ 'ls-files', '-z' ], {
		cwd: REPOSITORY_ROOT,
		encoding: 'utf-8',

		// The listing already takes most of the 1 MiB default, and exceeding it only reports `ENOBUFS`.
		maxBuffer: 64 * 1024 * 1024
	} );

	// The paths are used as git printed them. Normalizing them would rewrite a backslash into a separator,
	// which turns a single invalid name into two valid segments.
	return output
		.split( '\0' )
		.filter( Boolean );
}

/**
 * Returns a path for every segment that breaks the convention, each truncated at that segment. A directory
 * shared by many files is reported once, and one run lists everything to rename.
 */
function getInvalidPaths( filePaths ) {
	const invalidPaths = new Set();

	for ( const filePath of filePaths ) {
		let currentPath = '';

		for ( const segment of filePath.split( '/' ) ) {
			currentPath += currentPath ? `/${ segment }` : segment;

			if ( !ALLOWED_SEGMENT_PATTERN.test( segment ) ) {
				invalidPaths.add( currentPath );
			}
		}
	}

	return [ ...invalidPaths ].sort();
}
