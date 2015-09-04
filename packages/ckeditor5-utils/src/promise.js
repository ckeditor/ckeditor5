/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

'use strict';

/**
 * An ES6 compatible Promise class, used for deferred and asynchronous computations.
 *
 * @class Promise
 */

CKEDITOR.define( function() {
	// For now we're using the native browser implementation of Promise, an ES6 feature. Just IE is not supporting it so
	// a polyfill will have to be developed for it.
	//
	// http://caniuse.com/#feat=promises

	/* istanbul ignore next: we expect this to never happen for now, so we'll not have coverage for this */
	if ( !window.Promise ) {
		throw new Error( 'The Promise class is not available natively. CKEditor is not compatible with this browser.' );
	}

	return window.Promise;
} );
