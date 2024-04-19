/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = async function buildTsAndDllForCkeditor5Root() {
	await tools.shExec( 'yarn run build', { async: true, verbosity: 'silent' } );
	await tools.shExec( 'yarn run build:dist', { async: true, verbosity: 'silent' } );
	await tools.shExec( 'yarn run dll:build --skip-packages-dll', { async: true, verbosity: 'silent' } );
};
