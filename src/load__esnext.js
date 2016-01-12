/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* global System */

export default function load( modulePath ) {
	modulePath = '../' + modulePath;

	return System
		.import( modulePath )
		.then( ( module ) => {
			return module;
		} );
}