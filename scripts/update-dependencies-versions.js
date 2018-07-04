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
const packageJsonPath = path.join( __dirname, '..', 'package.json' );

log.info( 'Updating version of dependencies in "package.json"...' );
let counter = 0;

tools.updateJSONFile( packageJsonPath, packageJson => {
	const dependencies = packageJson.dependencies;

	for ( const packageName of Object.keys( dependencies ) ) {
		try {
			const dependencyPackageJson = require( packageName + '/package.json' );
			const newVersion = '^' + dependencyPackageJson.version;

			if ( packageJson.dependencies[ dependencyPackageJson.name ] !== newVersion ) {
				counter += 1;
			}

			packageJson.dependencies[ dependencyPackageJson.name ] = newVersion;
		} catch ( error ) {
			log.warning( `Package "${ packageName }" is not installed and its version cannot be updated.` );
		}
	}

	return packageJson;
} );

log.info( `Updated versions of ${ counter } packages.` );

if ( counter ) {
	log.info( 'Committing updated "package.json" file...' );

	const response = tools.shExec( 'git add package.json && git commit -m "Internal: Updated dependencies."', { verbosity: 'error' } );

	log.info( response.trim() );
} else {
	log.info( 'Nothing to update? It smells like troubles!' );
}

log.info( 'Done.' );
