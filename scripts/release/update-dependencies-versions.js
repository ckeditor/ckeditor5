#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );
const { tools, logger } = require( '@ckeditor/ckeditor5-dev-utils' );

const log = logger();
const rootPath = path.join( __dirname, '..', '..' );
const packageJsonPath = path.join( rootPath, 'package.json' );

const mgitJson = require( path.join( rootPath, 'mgit.json' ) );

log.info( 'Updating version of dependencies in "package.json"...' );

tools.updateJSONFile( packageJsonPath, packageJson => {
	const dependencies = packageJson.dependencies;

	for ( const packageName of Object.keys( dependencies ) ) {
		if ( !mgitJson.dependencies[ packageName ] ) {
			log.warning( `Package "${ packageName }" is not defined in "mgit.json" and its version cannot be updated.` );

			continue;
		}

		const dependencyPath = path.join( rootPath, mgitJson.packages, packageName.split( '/' )[ 1 ] );
		const dependencyPackageJson = require( path.join( dependencyPath, 'package.json' ) );

		packageJson.dependencies[ dependencyPackageJson.name ] = '^' + dependencyPackageJson.version;
	}

	return packageJson;
} );

log.info( 'Done.' );
