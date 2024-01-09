/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

/**
 * @param {String} packagePath
 * @returns {Promise}
 */
module.exports = async function updatePackageEntryPoint( packagePath ) {
	const upath = require( 'upath' );
	const fs = require( 'fs-extra' );
	const path = require( 'upath' );

	if ( !( await isTypeScriptPackage( packagePath ) ) ) {
		return;
	}

	const packageJsonPath = upath.join( packagePath, 'package.json' );
	const pkgJson = await fs.readJson( packageJsonPath );
	const { main } = pkgJson;

	if ( !main ) {
		return;
	}

	pkgJson.main = main.replace( /\.ts$/, '.js' );
	pkgJson.types = main.replace( /\.ts$/, '.d.ts' );

	return fs.writeJson( packageJsonPath, pkgJson );

	/**
	 * @param {String} packagePath
	 * @returns {Promise.<Boolean>}
	 */
	function isTypeScriptPackage( packagePath ) {
		const packageJsonPath = path.join( packagePath, 'package.json' );
		const packageJson = require( packageJsonPath );

		// Almost all CKEditor 5 packages define an entry point. When it points to a TypeScript file,
		// the package is written in TS.
		if ( packageJson.main ) {
			return packageJson.main.includes( '.ts' );
		}

		// Otherwise, let's check if the package contains a `tsconfig.json` file.
		return checkFileExists( path.join( packagePath, 'tsconfig.json' ) );
	}

	function checkFileExists( file ) {
		return fs.access( file, fs.constants.F_OK )
			.then( () => true )
			.catch( () => false );
	}
};

