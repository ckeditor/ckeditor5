/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';

export const PACKAGES_DIRECTORY = 'packages';
export const RELEASE_DIRECTORY = 'release';

export const RELEASE_CDN_DIRECTORY = upath.join( RELEASE_DIRECTORY, 'cdn' );
export const RELEASE_NPM_DIRECTORY = upath.join( RELEASE_DIRECTORY, 'npm' );
export const RELEASE_ZIP_DIRECTORY = upath.join( RELEASE_DIRECTORY, 'zip' );

export const S3_COPY_ARGS = '--recursive --metadata-directive REPLACE --cache-control max-age=31536000';
export const CDN_S3_BUCKET = 'ckeditor-cdn-prod-files';

export const S3_CONTENT_TYPE = {
	'*.js': 'text/javascript; charset=utf-8',
	'*.ts': 'application/typescript; charset=utf-8',
	'*.css': 'text/css; charset=utf-8',
	'*.zip': 'application/zip',
	'*.map': 'application/json; charset=utf-8'
};
