/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* global require */

export default function load( modulePath ) {
	return new Promise( ( resolve ) => {
		resolve( require( modulePath ) );
	} );
}