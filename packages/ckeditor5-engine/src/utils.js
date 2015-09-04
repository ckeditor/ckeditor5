/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * A utilities library.
 *
 * @class utils
 * @singleton
 */

CKEDITOR.define( [ 'utils-lodash', 'lib/lodash/lodash-ckeditor' ], function( lodashIncludes, lodash ) {
	var utils = {
		/**
		 * Creates a spy function (ala Sinon.js) that can be used to inspect call to it.
		 *
		 * The following are the present features:
		 *
		 *  * spy.called: property set to `true` if the function has been called at least once.
		 *
		 * @returns {Function} The spy function.
		 */
		spy() {
			var spy = function() {
				spy.called = true;
			};

			return spy;
		},

		/**
		 * Returns a unique id. This id is a number (starting from 1) which will never get repeated on successive calls
		 * to this method.
		 *
		 * @returns {Number} A number representing the id.
		 */
		uid: ( function() {
			var next = 1;

			return function() {
				return next++;
			};
		} )()
	};

	// Extend "utils" with Lo-Dash methods.
	for ( var i = 0; i < lodashIncludes.length; i++ ) {
		utils[ lodashIncludes[ i ] ] = lodash[ lodashIncludes[ i ] ];
	}

	return utils;
} );
