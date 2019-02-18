#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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
const mgitJsonPath = path.resolve( __dirname, '..', '..', 'mgit.json' );

log.info( 'Updating the "mgit.json"...' );

tools.updateJSONFile( mgitJsonPath, mgitJson => {
	const dependencies = mgitJson.dependencies;

	for ( const packageName of Object.keys( dependencies ) ) {
		dependencies[ packageName ] = dependencies[ packageName ].split( '#' )[ 0 ];

		if ( branchName !== 'master' ) {
			dependencies[ packageName ] += '#' + branchName;
		}
	}

	return mgitJson;
} );

log.info( `Done. "mgit.json" uses the "${ branchName }" branch now.` );
