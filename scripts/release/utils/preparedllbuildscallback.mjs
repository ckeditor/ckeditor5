/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @param {String} packagePath
 * @param {Object} options
 * @param {String} options.RELEASE_CDN_DIRECTORY
 * @returns {Promise}
 */
export default async function prepareDllBuildsCallback( packagePath ) {
	const { tools } = await import( '@ckeditor/ckeditor5-dev-utils' );
	const { default: fs } = await import( 'fs-extra' );
	const { default: path } = await import( 'upath' );

	const packageJsonPath = path.join( packagePath, 'package.json' );
	const packageJson = await fs.readJson( packageJsonPath );

	if ( !isDllPackage() ) {
		return Promise.resolve();
	}

	// Disable the dependency check explicitly. A package copied to a release directory is not a member of the pnpm
	// workspace, so the `verifyDepsBeforeRun: false` setting from `pnpm-workspace.yaml` does not apply there. Without
	// the flag, pnpm (11.27.1+) runs `pnpm install` on its own before the script and fails on the `catalog:` specifiers.
	// Inside the workspace, the flag matches the existing setting and changes nothing.
	await tools.shExec( 'pnpm --config.verify-deps-before-run=false run dll:build', {
		cwd: packagePath,
		verbosity: 'error',
		async: true
	} );

	function isDllPackage() {
		return 'dll:build' in ( packageJson.scripts || {} );
	}
}
