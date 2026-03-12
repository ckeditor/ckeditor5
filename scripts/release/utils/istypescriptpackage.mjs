/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { glob } from 'glob';

/**
 * @param {String} packagePath
 * @returns {Promise.<Boolean>}
 */
export default async function isTypeScriptPackage( packagePath ) {
	const tsFiles = await glob( 'src/**/*.ts', { cwd: packagePath } );

	return tsFiles.length > 0;
}
