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
const { CKEDITOR5_ROOT_PATH, CDN_S3_BUCKET, S3_COPY_ARGS, RELEASE_CDN_DIRECTORY } = require( './utils/constants' );
const cliArguments = parseArguments( process.argv.slice( 2 ) );

const { version: packageJsonVersion } = require( upath.join( CKEDITOR5_ROOT_PATH, './package.json' ) );
const getListrOptions = require( './utils/getlistroptions' );
const version = cliArguments.nightly ? 'nightly' : packageJsonVersion;

const tasks = new Listr( [
	{
		title: 'Upload files to CDN.',
		task: () => {
			return tools.shExec(
				`aws s3 cp ./${ RELEASE_CDN_DIRECTORY }/ s3://${ CDN_S3_BUCKET }/ckeditor5/${ version }/ ${ S3_COPY_ARGS }`,
				{ verbosity: 'error' }
			);
		}
	}
], getListrOptions( cliArguments ) );

( async () => {
	try {
		await tasks.run();
	} catch ( err ) {
		process.exitCode = 1;

		console.error( err );
	}
} )();
