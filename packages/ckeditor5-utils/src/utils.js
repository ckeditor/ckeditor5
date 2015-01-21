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
		 * The list of methods defined in `utils` that come from lodash.
		 */
		_lodashIncludes: lodashIncludes,

		/**
		 * Checks if the provided object is a "pure" JavaScript object. In other words, if it is not any other
		 * JavaScript native type, like Number or String.
		 *
		 * @param obj The object to be checked.
		 * @returns {Boolean} `true` if the provided object is a "pure" JavaScript object. Otherwise `false`.
		 */
		isObject: function( obj ) {
			return typeof obj === 'object' && !!obj;
		}
	};

	// Extend "utils" with Lo-Dash methods.
	for ( var i = 0; i < lodashIncludes.length; i++ ) {
		utils[ lodashIncludes[ i ] ] = lodash[ lodashIncludes[ i ] ];
	}

	return utils;
} );
