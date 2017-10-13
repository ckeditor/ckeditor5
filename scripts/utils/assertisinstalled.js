/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

module.exports = function assertIsInstalled( packageName ) {
	try {
		require( packageName + '/package.json' );
	} catch ( err ) {
		console.error( `Error: Cannot find package '${ packageName }'.\n` );
		console.error( 'You need to install optional dependencies.' );
		console.error( 'Run: \'npm run install-optional-dependencies\'.' );

		process.exit( 1 );
	}
};
