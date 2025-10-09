/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import getCKEditor5PackageNames from './getckeditor5packagenames.mjs';

/**
 * Checks whether provided package name is the CKEditor 5 dependency.
 *
 * @returns {Promise.<Function>}
 */
export default async function isCKEditor5PackageFactory() {
	const allPackageNames = await getCKEditor5PackageNames();

	return packageName => allPackageNames.includes( packageName );
}
