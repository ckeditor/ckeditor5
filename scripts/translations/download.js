/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const { downloadTranslations, getToken } = require( '@ckeditor/ckeditor5-dev-transifex' );
const { parseArguments, getCKEditor5PackageNames } = require( './utils' );

main().catch( err => {
	console.error( err );

	process.exit( 1 );
} );

/**
 * Download translation messages from the Transifex server.
 *
 * @returns {Promise}
 */
async function main() {
	const options = parseArguments( process.argv.slice( 2 ) );
	const packages = getCKEditor5PackageNames( 'download', options );

	if ( packages.length === 0 ) {
		console.log( 'No package has been found.' );

		return;
	}

	return downloadTranslations( {
		// Token used for authentication with the Transifex service.
		token: await getToken(),

		// Project details.
		organizationName: 'ckeditor',
		projectName: 'ckeditor5',

		// List of packages that will be processed.
		packages: new Map( packages ),

		// An absolute path to the directory that will be used for finding specified `packages`.
		cwd: options.cwd
	} );
}
