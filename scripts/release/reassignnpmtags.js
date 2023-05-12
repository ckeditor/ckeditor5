#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );

/**
 * Used to switch the tags from `staging` to `latest` for specified array of packages.
 *
 * @param {String} authorizedUser User that is authorized to release ckeditor5 packages.
 * @param {String} version Specifies the version of packages to reassign the tags for.
 * @param {Array.<String>} packages Array of packages' names to reassign tags for.
 */
module.exports = function reassignNpmTags( { authorizedUser, version, packages } ) {
	const errors = [];
	const packagesSkipped = [];
	const packagesUpdated = [];

	verifyLoggedInUserIsAuthorizedToPublish( authorizedUser );

	for ( const packageName of packages ) {
		try {
			const latestVersion = exec( `npm show ${ packageName }@latest version ` ).trim();

			if ( latestVersion === version ) {
				packagesSkipped.push( `${ packageName }@${ version }` );

				continue;
			}

			exec( `npm dist-tag add ${ packageName }@${ version } latest` );
			packagesUpdated.push( `${ packageName }@${ version }` );
			exec( `npm dist-tag rm ${ packageName }@${ version } staging` );
		} catch ( e ) {
			errors.push( trimErrorMessage( e.message ) );
		}
	}

	if ( packagesUpdated.length ) {
		console.log( 'Tags updated for:\n' + packagesUpdated.join( '\n' ) );
	}

	if ( packagesSkipped.length ) {
		console.log( 'Packages skipped:\n' + packagesSkipped.join( '\n' ) );
	}

	if ( errors.length ) {
		console.log( 'Errors found:\n' + errors.join( '\n' ) );
	}
};

/**
 * @param {String} authorizedUser
 */
function verifyLoggedInUserIsAuthorizedToPublish( authorizedUser ) {
	const loggedInUser = exec( 'npm whoami' ).trim();

	if ( loggedInUser !== authorizedUser ) {
		throw new Error( `User: ${ loggedInUser } is not matching authorized user: ${ authorizedUser }.` );
	}
}

/**
 * @param {String} message
 * @returns {String}
 */
function trimErrorMessage( message ) {
	return message.replace( /npm ERR!.*\n/g, '' ).trim();
}

/**
 * @param {String} command
 * @returns {String}
 */
function exec( command ) {
	return tools.shExec( command, { verbosity: 'error' } );
}
