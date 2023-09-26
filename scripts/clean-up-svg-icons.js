#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

// Cleans up and optimizes SVG files using the SVGO utility. The configuration file is located in svgo.config.json.
//
// Usage:
// 	yarn run clean-up-svg-icons <path/to/icons>
//
// 	yarn run clean-up-svg-icons <path/to/icons> <another/path/to/icons>
//
// The <path/to/icons> can be either a direct path to a SVG file, or a path to a directory. Glob patterns in path are supported.
// Multiple arguments (paths) in one call are supported.
//
// To optimize the entire project run:
// 	yarn run clean-up-svg-icons

'use strict';

const chalk = require( 'chalk' );
const upath = require( 'upath' );
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

const globPattern = parseArguments( process.argv.slice( 2 ) )
	.map( pathToIcon => pathToIcon.endsWith( '.svg' ) ? pathToIcon : pathToIcon + '/*.svg' );

globSync( globPattern )
	.map( upath.toUnix )
	.filter( pathToIcon => {
		const iconName = upath.basename( pathToIcon );
		const isExcluded = EXCLUDED_ICONS.includes( iconName );

		if ( isExcluded ) {
			console.log( chalk.yellow( `The "${ pathToIcon }" icon is excluded.` ) );
		}

		return !isExcluded;
	} )
	.forEach( pathToIcon => {
		console.log( chalk.green( `Processing "${ pathToIcon }" icon...` ) );

		execSync( `svgo --config=./scripts/svgo.config.js -i ${ pathToIcon }` );
	} );

function parseArguments( args ) {
	const paths = minimist( args )._;

	if ( paths.length > 0 ) {
		return paths;
	}

	return [ ALL_ICONS_PATTERN ];
}
