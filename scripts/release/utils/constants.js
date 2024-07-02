/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const upath = require( 'upath' );

const PACKAGES_DIRECTORY = 'packages';
const RELEASE_DIRECTORY = 'release';

const RELEASE_CDN_DIRECTORY = upath.join( RELEASE_DIRECTORY, 'cdn' );
const RELEASE_NPM_DIRECTORY = upath.join( RELEASE_DIRECTORY, 'npm' );
const RELEASE_ZIP_DIRECTORY = upath.join( RELEASE_DIRECTORY, 'zip' );

const CKEDITOR5_ROOT_PATH = upath.join( __dirname, '..', '..', '..' );

const CKEDITOR5_COMMERCIAL_PATH = upath.resolve( CKEDITOR5_ROOT_PATH, 'external', 'ckeditor5-commercial' );

const CKEDITOR5_INDEX = upath.join( CKEDITOR5_ROOT_PATH, 'src', 'index.ts' );

const CKEDITOR5_PREMIUM_FEATURES_INDEX = upath.join(
	CKEDITOR5_COMMERCIAL_PATH, PACKAGES_DIRECTORY, 'ckeditor5-premium-features', 'src', 'index.ts'
);

const S3_COPY_ARGS = '--recursive --metadata-directive REPLACE --cache-control max-age=31536000';

const CDN_S3_BUCKET = 'ckeditor-cdn-prod-files';

module.exports = {
	PACKAGES_DIRECTORY,
	RELEASE_DIRECTORY,
	RELEASE_CDN_DIRECTORY,
	RELEASE_NPM_DIRECTORY,
	RELEASE_ZIP_DIRECTORY,
	CKEDITOR5_ROOT_PATH,
	CKEDITOR5_COMMERCIAL_PATH,
	CKEDITOR5_INDEX,
	CKEDITOR5_PREMIUM_FEATURES_INDEX,
	S3_COPY_ARGS,
	CDN_S3_BUCKET
};
