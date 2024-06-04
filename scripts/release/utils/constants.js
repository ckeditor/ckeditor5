/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const upath = require( 'upath' );

const PACKAGES_DIRECTORY = 'packages';

const RELEASE_DIRECTORY = 'release';

const CKEDITOR5_ROOT_PATH = upath.join( __dirname, '..', '..', '..' );

const CKEDITOR5_COMMERCIAL_PATH = upath.resolve( CKEDITOR5_ROOT_PATH, 'external', 'ckeditor5-commercial' );

const CKEDITOR5_INDEX = upath.join( CKEDITOR5_ROOT_PATH, 'src', 'index.ts' );

const CKEDITOR5_PREMIUM_FEATURES_INDEX = upath.join(
	CKEDITOR5_COMMERCIAL_PATH, PACKAGES_DIRECTORY, 'ckeditor5-premium-features', 'src', 'index.ts'
);

module.exports = {
	PACKAGES_DIRECTORY,
	RELEASE_DIRECTORY,
	CKEDITOR5_ROOT_PATH,
	CKEDITOR5_COMMERCIAL_PATH,
	CKEDITOR5_INDEX,
	CKEDITOR5_PREMIUM_FEATURES_INDEX
};
