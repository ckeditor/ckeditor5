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
 * @param {Object} [options={}]
 * @param {Array.<String>} [options.skipPackages=[]] Name of packages which won't be touched.
 * @returns {Promise.<Function>}
 */
module.exports = async function isCKEditor5PackageFactory( { skipPackages = [] } = {} ) {
	const pathToCKEditor5 = upath.resolve( __dirname, '../../..' );

	const allPathsToPackageJson = await glob( [
		'package.json',
		'packages/*/package.json',
		'external/ckeditor5-commercial/packages/*/package.json'
	], {
		cwd: pathToCKEditor5,
		nodir: true,
		absolute: true
	} );

	const allPackageJson = await Promise.all(
		allPathsToPackageJson.map( pathToPackageJson => fs.readJson( pathToPackageJson ) )
	);

	const allPackageNames = allPackageJson.map( packageJson => packageJson.name );

	return packageName => {
		if ( skipPackages.includes( packageName ) ) {
			return false;
		}

		return allPackageNames.includes( packageName );
	};
};
