#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const branchName = process.argv[ 2 ];

if ( !branchName ) {
	throw new Error( 'Missing branch name.' );
}

const path = require( 'path' );
const { tools, logger } = require( '@ckeditor/ckeditor5-dev-utils' );
const log = logger();
const mrgitJsonPath = path.resolve( __dirname, '..', '..', 'mrgit.json' );

log.info( 'Updating the "mrgit.json"...' );

tools.updateJSONFile( mrgitJsonPath, mrgitJson => {
	const dependencies = mrgitJson.dependencies;

	for ( const packageName of Object.keys( dependencies ) ) {
		dependencies[ packageName ] = dependencies[ packageName ].split( '#' )[ 0 ];

		if ( branchName !== 'master' ) {
			dependencies[ packageName ] += '#' + branchName;
		}
	}

	return mrgitJson;
} );

log.info( `Done. "mrgit.json" uses the "${ branchName }" branch now.` );
