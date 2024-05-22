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
module.exports = async function buildPackageUsingRollupCallback( packagePath ) {
	const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );

	// Ignore builds as they are rather "a product to use" instead of "blocks to combine".
	if ( packagePath.includes( 'ckeditor5-build-' ) ) {
		return;
	}

	return tools.shExec( 'yarn run build:dist', {
		cwd: packagePath,
		verbosity: 'error',
		async: true
	} );
};

