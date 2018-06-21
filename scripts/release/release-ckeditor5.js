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
const cke5Path = path.resolve( __dirname, '..', '..' );
const packageJsonPath = path.resolve( cke5Path, 'package.json' );
const templatePath = path.resolve( cke5Path, 'scripts', 'release', 'template' );
const packageJsonTemplatePath = path.resolve( templatePath, 'package.json' );
const packageJsonTemplateCopy = require( packageJsonTemplatePath );

// That files will be copied from source to template directory and will be released too.
const additionalFiles = [
	'CHANGELOG.md',
	'LICENSE.md',
	'README.md'
];

cli.provideToken()
	.then( token => {
		const gitVersion = versionUtils.getLastTagFromGit();
		const changelogVersion = versionUtils.getLastFromChangelog();

		log.info( 'Checking whether there is anything to release...' );

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

		tools.shExec( `git push origin master v${ changelogVersion }` );

		const packageJson = require( packageJsonPath );

		log.info( 'Copying the package.json...' );

		// Update the template of `package.json`. We will use values from source `package.json`
		// but only these ones which are defined in the template.
		tools.updateJSONFile( packageJsonTemplatePath, jsonFile => {
			for ( const property of Object.keys( jsonFile ) ) {
				// If the `property` is set in the template, leave it.
				if ( jsonFile[ property ] ) {
					continue;
				}

				// Copy value from original package.json file.
				jsonFile[ property ] = packageJson[ property ];
			}

			return jsonFile;
		} );

		// Copy additional files.
		for ( const file of additionalFiles ) {
			tools.shExec( `cp ${ path.resolve( cke5Path, file ) } ${ path.resolve( templatePath, file ) }` );
		}

		log.info( 'Publishing on npm...' );

		// Publish the package on npm.
		tools.shExec( `cd ${ templatePath } && npm publish && cd ${ cke5Path }` );

		// Remove files that were copy.
		for ( const file of additionalFiles ) {
			tools.shExec( `rm ${ path.resolve( templatePath, file ) }` );
		}

		log.info( 'Creating a release on GitHub...' );

		// Create a release on GitHub.
		return createGithubRelease( token, {
			repositoryOwner: 'ckeditor',
			repositoryName: 'ckeditor5',
			version: `v${ changelogVersion }`,
			description: releaseDescription
		} ).then( () => changelogVersion );
	} )
	.then( version => {
		log.info( 'Restoring the package.json template...' );

		// Restore the template `package.json` to state before the publishing process.
		tools.updateJSONFile( packageJsonTemplatePath, () => packageJsonTemplateCopy );

		const url = `https://github.com/ckeditor/ckeditor5/releases/tag/v${ version }`;
		log.info( `Created the release: ${ url }` );
	} )
	.catch( err => {
		log.error( err.stack );
	} );

function reject( message ) {
	return Promise.reject( new Error( message ) );
}
