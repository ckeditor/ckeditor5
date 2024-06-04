#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const fs = require( 'fs' );
const getChangelogOptions = require( './getchangelogoptions' );
const { generateChangelogForMonoRepository } = require( '@ckeditor/ckeditor5-dev-release-tools' );
const { CKEDITOR5_COMMERCIAL_PATH } = require( './utils/constants' );
const parseArguments = require( './utils/parsearguments' );

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
