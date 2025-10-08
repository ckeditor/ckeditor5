/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { glob } from 'glob';
import { CKEDITOR5_COMMERCIAL_PACKAGES_PATH, CKEDITOR5_PACKAGES_PATH, CKEDITOR5_ROOT_PATH } from '../../constants.mjs';
import fs from 'fs-extra';

/**
 * Returns an array with all CKEditor 5 packages names.
 *
 * @returns {Promise.<string[]>}
 */
export default async function getCKEditor5PackageNames() {
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

	return allPackageJson.map( packageJson => packageJson.name );
}
