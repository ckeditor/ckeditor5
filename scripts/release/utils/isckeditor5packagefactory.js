/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const upath = require( 'upath' );
const fs = require( 'fs-extra' );
const { glob } = require( 'glob' );

/**
 * Checks whether provided package name is the CKEditor 5 dependency.
 *
 * @returns {Promise<Function>}
 */
module.exports = async function isCKEditor5PackageFactory() {
	const allCKEditor5NamePatterns = [
		/^@ckeditor\/ckeditor5-(.*)/,
		/^ckeditor5(-collaboration)?$/
	];

	const pathToCKEditor5 = upath.resolve( __dirname, '../../..' );

	const globPattern = require( `${ pathToCKEditor5 }/package.json` ).workspaces.packages
		.map( pattern => `${ pattern }/package.json` );

	const allPathsToPackageJson = await glob( globPattern, {
		cwd: pathToCKEditor5,
		nodir: true,
		absolute: true
	} );

	const allPackageJson = await Promise.all(
		allPathsToPackageJson.map( pathToPackageJson => fs.readJson( pathToPackageJson ) )
	);

	const allPackageNames = allPackageJson.map( packageJson => packageJson.name );

	return packageName => {
		const doesPackageMatchNaming = allCKEditor5NamePatterns.some( pattern => pattern.test( packageName ) );
		const doesPackageExist = allPackageNames.includes( packageName );

		return ( doesPackageMatchNaming && doesPackageExist );
	};
};
