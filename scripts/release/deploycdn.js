#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const { Listr } = require( 'listr2' );
const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );
const parseArguments = require( './utils/parsearguments' );
const { CDN_S3_BUCKET, S3_COPY_DIR_ARGS, S3_COPY_FILE_ARGS, CDN_CLOUDFRONT_ID } = require( './utils/constants' );
const cliArguments = parseArguments( process.argv.slice( 2 ) );

const name = 'ckeditor5';

const { version } = require( 'package.json' );

const tasks = new Listr( [
	{
		title: 'Upload dist to CDN',
		task: () => {
			return tools.shExec( // TODO: change ckeditor5-test/ to ${name}/
				`aws s3 cp ./dist/ s3://${ CDN_S3_BUCKET }/ckeditor5-test/${ version }/ ${ S3_COPY_DIR_ARGS }`,
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
			return tools.shExec( // TODO: change ckeditor5-test/ to ${name}/
				`aws s3 cp ./${ name }.zip s3://${ CDN_S3_BUCKET }/ckeditor5-test/${ version }/zip/ ${ S3_COPY_FILE_ARGS }`,
				{ verbosity: 'error' }
			);
		},
		// CDN should not be updated on nightly releases.
		skip: cliArguments.nightly
	},
	{
		title: 'Upload DLL files to CDN',
		task: () => {
			return tools.shExec( // TODO: change ckeditor5-test/ to ${name}/
				`aws s3 cp ./release_dll/ s3://${ CDN_S3_BUCKET }/ckeditor5-test/${ version }/dll/ ${ S3_COPY_DIR_ARGS }`,
				{ verbosity: 'error' }
			);
		},
		// CDN should not be updated on nightly releases.
		skip: cliArguments.nightly
	},
	// TODO: add step with edit of `index.html` file (should we commit this?)
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
