/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

/**
 * @param {String} packagePath
 * @returns {Promise}
 */
module.exports = async function compileTypeScriptCallback( packagePath ) {
	const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );
	// All paths are resolved from the root repository directory.
	const isTypeScriptPackage = require( './scripts/release/utils/istypescriptpackage' );

	if ( !( await isTypeScriptPackage( packagePath ) ) ) {
		return;
	}

	return tools.shExec( 'yarn run build', {
		cwd: packagePath,
		verbosity: 'error'
	}, { async: true } );
};
