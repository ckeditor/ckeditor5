/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

// We import the 'require' module, so Require.JS gives us a localized version of require().
// Otherwise we would use the global one which resolves paths relatively to the base dir.
import require from 'require';

// NOTE: modulePath MUST BE RELATIVE to this module.
export default function load( modulePath ) {
	return new Promise( ( resolve, reject ) => {
		require(
			[ modulePath ],
			( module ) => {
				resolve( module );
			},
			( err ) => {
				reject( err );
			}
		);
	} );
}