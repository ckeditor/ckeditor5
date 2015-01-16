/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals bender, CKEDITOR */

'use strict';

( function() {
	// Override bender.start to wait until the "ckeditor" module is ready.
	var originalStart = bender.start;
	bender.start = function() {
		CKEDITOR.require( [ 'ckeditor' ], function() {
			originalStart.apply( this, arguments );
		} );
	};
} )();
