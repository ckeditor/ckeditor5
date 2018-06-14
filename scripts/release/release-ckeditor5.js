#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );
const { tools, logger } = require( '@ckeditor/ckeditor5-dev-utils' );
const versionUtils = require( '@ckeditor/ckeditor5-dev-env/lib/release-tools/utils/versions' );
const cli = require( '@ckeditor/ckeditor5-dev-env/lib/release-tools/utils/cli' );
const createGithubRelease = require( '@ckeditor/ckeditor5-dev-env/lib/release-tools/utils/creategithubrelease' );
const validatePackageToRelease = require( '@ckeditor/ckeditor5-dev-env/lib/release-tools/utils/validatepackagetorelease' );
const { getChangesForVersion } = require( '@ckeditor/ckeditor5-dev-env/lib/release-tools/utils/changelog' );

const log = logger();
const packageJsonPath = path.resolve( __dirname, '..', '..', 'package.json' );
const packageJsonTemplatePath = path.resolve( __dirname, 'template', 'package.json' );

// The first one is the template, the later is the original package file.
const packageJsonTemplateCopy = require( packageJsonTemplatePath );
let packageJsonCopy;

cli.provideToken()
	.then( token => {
		const gitVersion = versionUtils.getLastTagFromGit();
		const changelogVersion = versionUtils.getLastFromChangelog();

		log.info( 'Comparing versions - saved in changelog and as a tag...' );

		// If the last tag is equal to version saved in changelog, we don't have new version for release.
		if ( gitVersion === changelogVersion ) {
			return reject( 'Before starting the release process, you should generate the changelog.' );
		}

		const releaseDescription = getChangesForVersion( changelogVersion );

		log.info( 'Validating the repository for the release...' );

		const errors = validatePackageToRelease( {
			version: changelogVersion,
			changes: releaseDescription
		} );

		// Abort due to errors during validation.
		if ( errors.length ) {
			const log = logger();

			log.error( 'Unexpected errors occured:' );
			errors.map( err => '* ' + err ).forEach( log.error.bind( log ) );

			return reject( 'Releasing has been aborted due to errors.' );
		}

		log.info( 'Bumping the version...' );

		// Bump the version.
		tools.shExec( `npm version ${ changelogVersion } --message "Release: v${ changelogVersion }."`, { verbosity: 'error' } );

		log.info( 'Updating the package.json...' );

		// Update the `package.json`. Published package shouldn't have any dependencies and devDependencies.
		// Also, we should omit our environment scripts and their configs.
		tools.updateJSONFile( packageJsonPath, packageJson => {
			// Save the original file. It will be restored after publishing the package.
			packageJsonCopy = Object.assign( {}, packageJson );

			const newPackageJson = Object.assign( {}, packageJsonTemplateCopy );

			for ( const property of Object.keys( newPackageJson ) ) {
				// If the `property` is set in the template, leave it.
				if ( newPackageJson[ property ] ) {
					continue;
				}

				// In other case – copy value from original package.json file.
				newPackageJson[ property ] = packageJson[ property ];
			}

			// The files listed below will be published even if they won't be specified under the `files` key in package.json.
			// However, instead of creating the `.npmignore` file and specifying everything here, we can list files that we want to publish.
			// It means that everything except that files will be ignored (what is our goal).
			newPackageJson.files = [
				'CHANGELOG.md',
				'LICENSE.md',
				'README.md',
				'package.json'
			];

			return newPackageJson;
		} );

		log.info( 'Publishing on npm...' );

		// Publish the package on npm.
		tools.shExec( 'npm publish' );

		log.info( 'Creating a release on GitHub...' );

		// Create a release on GitHub.
		return createGithubRelease( token, {
			repositoryOwner: 'ckeditor',
			repositoryName: 'ckeditor5',
			version: changelogVersion,
			description: releaseDescription
		} );
	} )
	.then( () => {
		log.info( 'Restoring the package.json...' );

		// Restore the `package.json` to state before the publishing process.
		tools.updateJSONFile( packageJsonPath, () => packageJsonCopy );
		// And the template `package.json`.
		tools.updateJSONFile( packageJsonTemplatePath, () => packageJsonTemplateCopy );

		const url = `https://github.com/ckeditor/ckeditor5/releases/tag/v${ packageJsonCopy.version }`;
		log.info( `Created the release: ${ url }` );
	} )
	.catch( err => {
		log.error( err.stack );
	} );

function reject( message ) {
	return Promise.reject( new Error( message ) );
}
