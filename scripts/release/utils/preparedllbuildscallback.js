/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

/**
 * @param {String} packagePath
 * @returns {Promise}
 */
module.exports = async function prepareDllBuildsCallback( packagePath ) {
	const fs = require( 'fs-extra' );
	const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );
	const upath = require( 'upath' );

	const packageJsonPath = upath.join( packagePath, 'package.json' );
	const packageJson = require( packageJsonPath );

	if ( !isDllPackage() ) {
		return Promise.resolve();
	}

	await tools.shExec( 'yarn run dll:build', {
		cwd: packagePath,
		verbosity: 'error',
		async: true
	} );

	const dllPackageName = packageJson.name.replace( '@ckeditor/ckeditor5-', '' );
	const dllReleasePath = './release_cdn/dll/' + dllPackageName;

	await fs.ensureDir( dllReleasePath );

	return fs.copy( packagePath + '/build', dllReleasePath );

	function isDllPackage() {
		return 'dll:build' in ( packageJson.scripts || {} );
	}
};
