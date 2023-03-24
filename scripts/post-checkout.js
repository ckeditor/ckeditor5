#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs' );
const glob = require( 'glob' );
const path = require( 'path' );

/**
 * When packages only exist on some branches, switching them can leave behind
 * files ignored by git, such as the `node_modules/` directory containing binaries.
 *
 * The goal is to detect "empty" packages and remove them.
 *
 * See: https://github.com/ckeditor/ckeditor5/issues/13695.
 */

const branchChanged = process.argv[ 2 ] === '1';
const cwd = process.argv[ 3 ];

if ( !branchChanged ) {
	process.exit();
}

const packagesPattern = path.join( cwd, 'packages', '*' );
const packagesDirectories = glob.sync( packagesPattern );
const emptyPackages = packagesDirectories.filter( packageDir => {
	const pkgJsonPath = path.join( packageDir, 'package.json' );

	return !fs.existsSync( pkgJsonPath );
} );

if ( !emptyPackages.length ) {
	process.exit();
}

console.log( '\nPost checkout hook - removing empty packages:' );
console.log( emptyPackages.map( pkgName => ` - ${ pkgName }` ).join( '\n' ) );

emptyPackages.forEach( packageDir => fs.rmSync( packageDir, { recursive: true, force: true } ) );
