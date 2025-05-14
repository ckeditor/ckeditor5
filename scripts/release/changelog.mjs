#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import fs from 'fs';
import { generateChangelogForMonoRepository } from '@ckeditor/ckeditor5-dev-release-tools';
import getChangelogOptions from './utils/getchangelogoptions.mjs';
import parseArguments from './utils/parsearguments.mjs';
import { CKEDITOR5_COMMERCIAL_PATH } from '../constants.mjs';

const cliArguments = parseArguments( process.argv.slice( 2 ) );

if ( !fs.existsSync( CKEDITOR5_COMMERCIAL_PATH ) ) {
	throw new Error( `The script assumes that the directory "${ CKEDITOR5_COMMERCIAL_PATH }" exists.` );
}

const changelogOptions = getChangelogOptions( cliArguments );

generateChangelogForMonoRepository( changelogOptions )
	.then( () => {
		console.log( 'Done!' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
