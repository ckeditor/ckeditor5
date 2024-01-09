/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const upath = require( 'upath' );
const CKEDITOR5_ROOT_PATH = upath.join( __dirname, '..', '..', '..' );

module.exports = {
	PACKAGES_DIRECTORY: 'packages',
	RELEASE_DIRECTORY: 'release',
	CKEDITOR5_ROOT_PATH,
	CKEDITOR5_COMMERCIAL_PATH: upath.resolve( CKEDITOR5_ROOT_PATH, 'external', 'ckeditor5-commercial' )
};
