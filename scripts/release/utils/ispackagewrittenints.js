/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

const fs = require( 'fs' );
const path = require( 'upath' );

/**
 * @param {String} packagePath
 * @returns {Boolean}
 */
module.exports = function isPackageWrittenInTs( packagePath ) {
	const packageJsonPath = path.join( packagePath, 'package.json' );
	const packageJson = require( packageJsonPath );

	// Almost all CKEditor 5 packages define an entry point. When it points to a TypeScript file,
	// the package is written in TS.
	if ( packageJson.main ) {
		return packageJson.main.includes( '.ts' );
	}

	// Otherwise, let's check if the package contains a `tsconfig.json` file.
	return fs.existsSync( path.join( packagePath, 'tsconfig.json' ) );
};
