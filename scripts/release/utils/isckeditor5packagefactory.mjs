/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import fs from 'fs-extra';
import { glob } from 'glob';
import {
	CKEDITOR5_ROOT_PATH,
	CKEDITOR5_PACKAGES_PATH,
	CKEDITOR5_COMMERCIAL_PACKAGES_PATH
} from '../../constants.mjs';

/**
 * Checks whether provided package name is the CKEditor 5 dependency.
 *
 * @returns {Promise.<Function>}
 */
export default async function isCKEditor5PackageFactory() {
	const allPathsToPackageJson = await glob( [
		CKEDITOR5_PACKAGES_PATH + '/*/package.json',
		CKEDITOR5_COMMERCIAL_PACKAGES_PATH + '/*/package.json'
	], {
		cwd: CKEDITOR5_ROOT_PATH,
		nodir: true,
		absolute: true
	} );

	const allPackageJson = await Promise.all(
		allPathsToPackageJson.map( pathToPackageJson => fs.readJson( pathToPackageJson ) )
	);

	const allPackageNames = allPackageJson.map( packageJson => packageJson.name );

	return packageName => allPackageNames.includes( packageName );
}
