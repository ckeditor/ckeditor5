/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @param {String} packagePath
 * @returns {Promise}
 */
export default async function compileTypeScriptCallback( packagePath ) {
	const { tools } = await import( '@ckeditor/ckeditor5-dev-utils' );
	const { default: fs } = await import( 'fs-extra' );
	const { default: path } = await import( 'upath' );

	if ( !( await isTypeScriptPackage( packagePath ) ) ) {
		return;
	}

	return tools.shExec( 'yarn run build', {
		cwd: packagePath,
		verbosity: 'error',
		async: true
	} );

	/**
	 * @param {String} packagePath
	 * @returns {Promise.<Boolean>}
	 */
	async function isTypeScriptPackage( packagePath ) {
		const packageJsonPath = path.join( packagePath, 'package.json' );
		const packageJson = await fs.readJson( packageJsonPath );

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
}

