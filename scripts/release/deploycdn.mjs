#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Listr } from 'listr2';
import { tools } from '@ckeditor/ckeditor5-dev-utils';
import parseArguments from './utils/parsearguments.mjs';
import { CDN_S3_BUCKET, RELEASE_CDN_DIRECTORY, S3_CONTENT_TYPE, S3_COPY_ARGS } from './utils/constants.mjs';
import getCdnVersion from './utils/getcdnversion.mjs';
import getListrOptions from './utils/getlistroptions.mjs';

const cliArguments = parseArguments( process.argv.slice( 2 ) );
const cdnVersion = getCdnVersion( cliArguments );
const shellModifiers = { verbosity: 'error', async: true };

const tasks = new Listr( [
	{
		title: 'Remove existing files.',
		task: async () => {
			await tools.shExec(
				`aws s3 rm s3://${ CDN_S3_BUCKET }/ckeditor5/${ cdnVersion } --recursive`,
				{ ...shellModifiers }
			);
		}
	},
	{
		title: 'Upload new files to CDN.',
		task: async () => {
			for ( const [ pattern, value ] of Object.entries( S3_CONTENT_TYPE ) ) {
				await tools.shExec(
					`aws s3 cp ./${ RELEASE_CDN_DIRECTORY }/ s3://${ CDN_S3_BUCKET }/ckeditor5/${ cdnVersion }/ ${ S3_COPY_ARGS } \
					 --exclude "*" --include "${ pattern }" --content-type "${ value }"`,
					{ ...shellModifiers }
				);
			}
		}
	}
], getListrOptions( cliArguments ) );

tasks.run()
	.catch( err => {
		process.exitCode = 1;

		console.error( err );
	} );
