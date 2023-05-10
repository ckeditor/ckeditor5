/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

/**
 * @param {String} packagePath
 */
module.exports = function updatePackageEntryPoint( packagePath ) {
	const upath = require( 'upath' );
	const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );
	// All paths are resolved from the root repository directory.
	const isPackageWrittenInTs = require( './scripts/release//utils/ispackagewrittenints' );

	if ( !isPackageWrittenInTs( packagePath ) ) {
		return;
	}

	const packageJsonPath = upath.join( packagePath, 'package.json' );

	tools.updateJSONFile( packageJsonPath, json => {
		const { main } = json;

		if ( main ) {
			json.main = main.replace( /\.ts$/, '.js' );
			json.types = main.replace( /\.ts$/, '.d.ts' );
		}

		return json;
	} );
};
