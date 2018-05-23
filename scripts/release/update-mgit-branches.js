/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );
const { tools, logger } = require( '@ckeditor/ckeditor5-dev-utils' );

const mgitJsonPath = path.resolve( __dirname, '..', '..', 'mgit.json' );

module.exports = function updateMgitBranches( branchName ) {
	const log = logger();

	log.info( 'Updating the mgit.json file...' );

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

	logger().info( `Done. Mgit.json uses the "${ branchName }" branch now.` );
};
