/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

/**
 * @param {String} packagePath
 * @returns {Promise}
 */
module.exports = async function updatePackageEntryPoint( packagePath ) {
	const upath = require( 'upath' );
	const fs = require( 'fs-extra' );

	// All paths are resolved from the root repository directory.
	const isTypeScriptPackage = require( './scripts/release/utils/istypescriptpackage' );

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
};
