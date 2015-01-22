/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals module */

'use strict';

// This module returns the list of Lo-Dash methods that will be exported to the main "utils" module. It is coded in a
// way that it can be used by the CKEditor core code in "utils" as well as from Node.js with the configurations for
// `grunt lodash`.
//
// https://lodash.com/docs

( function() {
	// The list of Lo-Dash methods to include in "utils".
	// It is mandatory to execute `grunt lodash` after changes to this list.
	var lodashInclude = [
		/**
		 * Assigns own enumerable properties of source object(s) to the destination object.
		 *
		 * From Lo-Dash: https://lodash.com/docs#assign (alias)
		 *
		 * @member utils
		 * @method extend
		 *
		 * @param {Object} object The destination object.
		 * @param {...Object} source The source objects.
		 * @param {Function} callback The function to customize assigning values.
		 * @param {*} thisArg The this binding of callback.
		 * @returns {Object} The destination object.
		 */
		'extend'
	];

	// Make this compatible with CommonJS as well so it can be used in Node (e.g. "grunt lodash").
	/* istanbul ignore next: we're not able to test the following in bender so ignore it */
	if ( typeof module == 'object' && module.exports ) {
		module.exports = lodashInclude;
	} else {
		CKEDITOR.define( function() {
			return lodashInclude;
		} );
	}
} )();
