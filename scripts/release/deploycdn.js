#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const upath = require( 'upath' );
const { Listr } = require( 'listr2' );
const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );
const parseArguments = require( './utils/parsearguments' );
const { CKEDITOR5_ROOT_PATH, CDN_S3_BUCKET, S3_COPY_DIR_ARGS, S3_COPY_FILE_ARGS, CDN_CLOUDFRONT_ID } = require( './utils/constants' );
const cliArguments = parseArguments( process.argv.slice( 2 ) );

const name = 'ckeditor5';

const { version } = require( upath.join( CKEDITOR5_ROOT_PATH, './package.json' ) );

const tasks = new Listr( [
	{
		title: 'Upload dist to CDN',
		task: () => {
			return tools.shExec(
				`aws s3 cp ./dist/ s3://${ CDN_S3_BUCKET }/${ name }/${ version }/ ${ S3_COPY_DIR_ARGS }`,
				{ verbosity: 'error' }
			);
		},
		// CDN should not be updated on nightly releases.
		skip: cliArguments.nightly
	},
	{
		title: 'Upload dist as zip to CDN',
		task: () => {
			tools.shExec(
				`cd dist && zip -r ../${ name }.zip ./*`,
				{ verbosity: 'error' }
			);
			return tools.shExec(
				`aws s3 cp ./${ name }.zip s3://${ CDN_S3_BUCKET }/${ name }/${ version }/zip/ ${ S3_COPY_FILE_ARGS }`,
				{ verbosity: 'error' }
			);
		},
		// CDN should not be updated on nightly releases.
		skip: cliArguments.nightly
	},
	{
		title: 'Upload DLL files to CDN',
		task: () => {
			return tools.shExec(
				`aws s3 cp ./release_dll/ s3://${ CDN_S3_BUCKET }/${ name }/${ version }/dll/ ${ S3_COPY_DIR_ARGS }`,
				{ verbosity: 'error' }
			);
		},
		// CDN should not be updated on nightly releases.
		skip: cliArguments.nightly
	},
	{
		title: 'Upload main files to CDN',
		task: () => {
			return tools.shExec(
				`aws s3 cp ./cdn/ s3://${ CDN_S3_BUCKET }/ ${ S3_COPY_DIR_ARGS }`,
				{ verbosity: 'error' }
			);
		},
		// CDN should not be updated on nightly releases.
		skip: cliArguments.nightly
	},
	{
		title: 'Invalidate cache',
		task: () => {
			return tools.shExec(
				`aws cloudfront create-invalidation --distribution-id ${ CDN_CLOUDFRONT_ID } --paths "/index.html" "/404.html" "/assets/*"`,
				{ verbosity: 'error' }
			);
		},
		// CDN should not be updated on nightly releases.
		skip: cliArguments.nightly
	}
] );

( async () => {
	try {
		await tasks.run();
	} catch ( err ) {
		process.exitCode = 1;

		console.error( err );
	}
} )();
