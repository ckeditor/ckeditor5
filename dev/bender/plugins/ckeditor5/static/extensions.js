/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals bender, CKEDITOR, describe: true */

'use strict';

// ### General extensions.
( function() {
	// Make Bender wait to start running tests.
	var done = bender.defer();

	// Wait for the "ckeditor" module to be ready to start testing.
	CKEDITOR.require( [ 'ckeditor' ], done );
} )();

// ### AMD related extensions.
( function() {
	var wasRequireCalled,
		requires;

	/**
	 * AMD tools related to CKEditor.
	 */
	bender.amd = {
		/**
		 * Specifies the list of CKEditor modules to be loaded before tests start. The modules will be passed to the
		 * describe() functions as parameters.
		 *
		 * @params {...String} module The name of the module to load.
		 */
		require: function() {
			if ( wasRequireCalled ) {
				throw 'bender.amd.require() must be called just once.';
			}

			wasRequireCalled = true;

			var done = bender.defer();

			var modules = [].slice.call( arguments );

			CKEDITOR.require( modules, function() {
				// Save all returned modules.
				requires = [].slice.call( arguments );

				// Call all describe()s that where waiting for `requires` to load.
				flushDescribeQueue();

				// Finally give green light for tests to start.
				done();
			} );
		}
	};

	var originalDescribe = describe;
	var describeQueue = [];

	// Override the original Mocha's describe() so we can pass required modules to it.
	describe = getDescribeOverride( originalDescribe );
	describe.skip = getDescribeOverride( originalDescribe.skip );

	function getDescribeOverride( originalFn ) {
		return function( title, fn ) {
			if ( wasRequireCalled ) {
				var that = this;

				var task = function() {
					originalFn.call( that, title, function() {
						fn.apply( this, requires );
					} );
				};

				if ( requires ) {
					task();
				} else {
					describeQueue.push( task );
				}
			} else {
				originalFn.apply( this, arguments );
			}
		};
	}

	// Call all defined describe()s if `requires` have been loaded already.
	function flushDescribeQueue() {
		describeQueue.forEach( function( describeFn ) {
			describeFn();
		} );
	}
} )();
