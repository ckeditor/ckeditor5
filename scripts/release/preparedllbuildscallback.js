/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

/**
 * @param {String} packagePath
 */
module.exports = function prepareDllBuildsCallback( packagePath ) {
	const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );
	const path = require( 'path' );

	const packageJsonPath = path.join( packagePath, 'package.json' );
	const packageJson = require( packageJsonPath );

	if ( !isDllPackage() ) {
		return;
	}

	tools.shExec( 'yarn run dll:build', {
		cwd: packagePath,
		verbosity: 'error'
	} );

	function isDllPackage() {
		return 'dll:build' in ( packageJson.scripts || {} );
	}
};
