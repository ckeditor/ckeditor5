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

			// Remove unnecessary things.
			delete packageJson.dependencies;
			delete packageJson.devDependencies;
			delete packageJson.scripts;
			delete packageJson[ 'lint-staged' ];
			delete packageJson.eslintIgnore;

			// Update the package's description.
			// eslint-disable-next-line max-len
			packageJson.description = 'A set of ready-to-use rich text editors created with a powerful framework. Made with real-time collaborative editing in mind.';

			// The files listed below will be published even if they won't be specified under the `files` key in package.json.
			// However, instead of creating the `.npmignore` file and specifying everything here, we can list files that we want to publish.
			packageJson.files = [
				'CHANGELOG.md',
				'LICENSE.md',
				'README.md',
				'package.json'
			];

			return packageJson;
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

		const url = `https://github.com/ckeditor/ckeditor5/releases/tag/v${ packageJsonCopy.version }`;
		log.info( `Created the release: ${ url }` );
	} )
	.catch( err => {
		log.error( err.stack );
	} );

function reject( message ) {
	return Promise.reject( new Error( message ) );
}
