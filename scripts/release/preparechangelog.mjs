#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { styleText } from 'util';
import fs from 'fs';
import { generateChangelogForMonoRepository } from '@ckeditor/ckeditor5-dev-changelog';
import { CKEDITOR5_COMMERCIAL_PATH } from '../constants.mjs';
import getChangelogOptions from './utils/getchangelogoptions.mjs';
import parseArguments from './utils/parsearguments.mjs';

const cliArguments = parseArguments( process.argv.slice( 2 ) );
const changelogOptions = getChangelogOptions( cliArguments );

if ( !fs.existsSync( CKEDITOR5_COMMERCIAL_PATH ) ) {
	const warning = styleText(
		'yellow',
		'The generated changelog misses the Commercial entries due to the missing CKEditor 5 Commercial repository.'
	);

	console.log( `\n${ warning }\n` );

	// Filter out the CKEditor 5 Commercial repository from the changelog options.
	changelogOptions.externalRepositories = changelogOptions.externalRepositories.filter( ( { cwd } ) => {
		return cwd !== CKEDITOR5_COMMERCIAL_PATH;
	} );
}

generateChangelogForMonoRepository( changelogOptions )
	.then( maybeChangelog => {
		if ( maybeChangelog ) {
			console.log( maybeChangelog );
		}
	} );
