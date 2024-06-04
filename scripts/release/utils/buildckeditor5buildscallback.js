/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

module.exports = async function buildCKEditor5BuildsCallback( packagePath ) {
	const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );

	return tools.shExec( 'yarn run build', {
		cwd: packagePath,
		verbosity: 'error',
		async: true
	} );
};
