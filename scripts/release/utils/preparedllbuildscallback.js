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
module.exports = function prepareDllBuildsCallback( packagePath ) {
	const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );
	const upath = require( 'upath' );

	const packageJsonPath = upath.join( packagePath, 'package.json' );
	const packageJson = require( packageJsonPath );

	if ( !isDllPackage() ) {
		return Promise.resolve();
	}

	return tools.shExec( 'yarn run dll:build', {
		cwd: packagePath,
		verbosity: 'error',
		async: true
	} );

	function isDllPackage() {
		return 'dll:build' in ( packageJson.scripts || {} );
	}
};
