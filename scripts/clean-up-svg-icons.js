#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

// Cleans up and optimizes SVG files using the SVGO utility. The configuration file is located in svgo.config.json.
//
// Usage:
// 	yarn run clean-up-svg-icons [<option>...] [<path>...]
//
// The <path> can be either a direct path to a SVG file, or a path to a directory. Glob patterns in path are supported.
// Multiple arguments (paths) in one call are supported.
//
// Options:
// 	--verify-only
// 		If set, the script does not modify any SVG file, but it checks whether all files are already optimized.
// 		If any file is not optimized, the script ends with an error code.
//
// Examples:
// 	To optimize the entire project, run:
// 		yarn run clean-up-svg-icons
//
// 	To optimize single file, run:
// 		yarn run clean-up-svg-icons <path/to/icon>
//
// 	To optimize single directory, run:
// 		yarn run clean-up-svg-icons <path/to/directory>
//
// 	To optimize multiple directories, run:
// 		yarn run clean-up-svg-icons <path/to/directory> <another/path/to/directory>
//
// 	To check if single file is already optimized, run:
// 		yarn run clean-up-svg-icons --verify-only <path/to/icon>

'use strict';

const chalk = require( 'chalk' );
const upath = require( 'upath' );
const fs = require( 'fs-extra' );
const minimist = require( 'minimist' );
const { globSync } = require( 'glob' );
const { execSync } = require( 'child_process' );

// A list of icons that should not NOT be cleaned up. Their internal structure should not be changed
// because, for instance, CSS animations may depend on it.
const EXCLUDED_ICONS = [
	'return-arrow.svg',
	'project-logo.svg'
];

// A pattern to match all the icons.
const ALL_ICONS_PATTERN = 'packages/**/theme/icons';

const { paths, verifyOnly } = parseArguments( process.argv.slice( 2 ) );

const globPattern = paths.map( pathToIcon => {
	return pathToIcon.endsWith( '.svg' ) ? pathToIcon : pathToIcon + '/*.svg';
} );

let statusCode = 0;

globSync( globPattern )
	.map( upath.toUnix )
	.filter( filterExcludedIcons )
	.forEach( processIcon );

if ( verifyOnly && statusCode ) {
	console.log( chalk.red.bold( '\nSome SVG files are not optimized.' ) );
	console.log( chalk.red(
		'Execute "yarn run clean-up-svg-icons" to optimize them or add them to exceptions in "scripts/clean-up-svg-icons.js" file.\n'
	) );

	process.exit( statusCode );
}

function parseArguments( args ) {
	const config = {
		boolean: [
			'verify-only'
		],

		default: {
			'verify-only': false
		}
	};

	const {
		'verify-only': verifyOnly,
		_: paths
	} = minimist( args, config );

	return {
		verifyOnly,
		paths: paths.length > 0 ? paths : [ ALL_ICONS_PATTERN ]
	};
}

function filterExcludedIcons( pathToIcon ) {
	const iconName = upath.basename( pathToIcon );
	const isExcluded = EXCLUDED_ICONS.includes( iconName );

	if ( isExcluded ) {
		console.log( chalk.yellow( `The "${ pathToIcon }" icon is excluded.` ) );
	}

	return !isExcluded;
}

function processIcon( pathToIcon ) {
	console.log( chalk.green( `Processing "${ pathToIcon }" icon...` ) );

	const svgoOptions = [
		'--config=./scripts/svgo.config.js',
		`-i ${ pathToIcon }`
	];

	if ( verifyOnly ) {
		svgoOptions.push( '-o -' );
	}

	const result = execSync( `svgo ${ svgoOptions.join( ' ' ) }`, { encoding: 'utf-8' } ).trim();

	if ( verifyOnly ) {
		const iconFile = fs.readFileSync( pathToIcon, 'utf-8' ).trim();

		if ( result !== iconFile ) {
			statusCode = 1;

			console.log( chalk.red( `Icon "${ pathToIcon }" is not optimized.` ) );
		}
	}
}
