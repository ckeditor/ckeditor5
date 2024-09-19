#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

import fs from 'fs';
import getchangelogoptions from './getchangelogoptions.mjs';
import { generateChangelogForMonoRepository } from '@ckeditor/ckeditor5-dev-release-tools';
import { CKEDITOR5_COMMERCIAL_PATH } from './utils/constants.mjs';
import parsearguments from './utils/parsearguments.mjs';

const cliArguments = parsearguments( process.argv.slice( 2 ) );

if ( !fs.existsSync( CKEDITOR5_COMMERCIAL_PATH ) ) {
	throw new Error( `The script assumes that the directory "${ CKEDITOR5_COMMERCIAL_PATH }" exists.` );
}

const changelogOptions = getchangelogoptions( cliArguments );

generateChangelogForMonoRepository( changelogOptions )
	.then( () => {
		console.log( 'Done!' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
