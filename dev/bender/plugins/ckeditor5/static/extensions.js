/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals bender, CKEDITOR */

'use strict';

( function() {
	// Make Bender wait to start running tests.
	var done = bender.defer();

	// Wait for the "ckeditor" module to be ready to start testing.
	CKEDITOR.require( [ 'ckeditor' ], done );
} )();
