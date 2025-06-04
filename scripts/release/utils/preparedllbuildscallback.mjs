/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @param {String} packagePath
 * @param {Object} options
 * @param {String} options.RELEASE_CDN_DIRECTORY
 * @returns {Promise}
 */
export default async function prepareDllBuildsCallback( packagePath, { RELEASE_CDN_DIRECTORY } ) {
	const { tools } = await import( '@ckeditor/ckeditor5-dev-utils' );
	const { default: fs } = await import( 'fs-extra' );
	const { default: path } = await import( 'upath' );

	const packageJsonPath = path.join( packagePath, 'package.json' );
	const packageJson = await fs.readJson( packageJsonPath );

	if ( !isDllPackage() ) {
		return Promise.resolve();
	}

	await tools.shExec( 'yarn run dll:build', {
		cwd: packagePath,
		verbosity: 'error',
		async: true
	} );

	const dllPackageName = packageJson.name.replace( '@ckeditor/ckeditor5-', '' );
	const dllReleasePath = `./${ RELEASE_CDN_DIRECTORY }/dll/` + dllPackageName;

	await fs.ensureDir( dllReleasePath );

	return fs.copy( packagePath + '/build', dllReleasePath );

	function isDllPackage() {
		return 'dll:build' in ( packageJson.scripts || {} );
	}
}
