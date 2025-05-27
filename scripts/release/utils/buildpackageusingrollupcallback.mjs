/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @param {String} packagePath
 * @returns {Promise}
 */
export default async function buildPackageUsingRollupCallback( packagePath ) {
	const { tools } = await import( '@ckeditor/ckeditor5-dev-utils' );

	return tools.shExec( 'yarn run build:dist', {
		cwd: packagePath,
		verbosity: 'error',
		async: true
	} );
}
