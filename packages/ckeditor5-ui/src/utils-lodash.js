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

( () => {
	// The list of Lo-Dash methods to include in "utils".
	// It is mandatory to execute `grunt lodash` after changes to this list.
	const lodashInclude = [
		/**
		 * See Lo-Dash: https://lodash.com/docs#clone
		 *
		 * @member utils
		 * @method clone
		 */
		'clone',

		/**
		 * See Lo-Dash: https://lodash.com/docs#assign (alias)
		 *
		 * @member utils
		 * @method extend
		 */
		'extend',

		/**
		 * See Lo-Dash: https://lodash.com/docs#isPlainObject
		 *
		 * @member utils
		 * @method isPlainObject
		 */
		'isPlainObject',

		/**
		 * See Lo-Dash: https://lodash.com/docs#isObject
		 *
		 * @member utils
		 * @method isObject
		 */
		'isObject',

		/**
		 * See Lo-Dash: https://lodash.com/docs#isArray
		 *
		 * @member utils
		 * @method isArray
		 */
		'isArray',

		/**
		 * See Lo-Dash: https://lodash.com/docs#last
		 *
		 * @member utils
		 * @method last
		 */
		'last',

		/**
		 * See Lo-Dash: https://lodash.com/docs#isEqual
		 *
		 * @member utils
		 * @method isEqual
		 */
		'isEqual'
	];

	// Make this compatible with CommonJS as well so it can be used in Node (e.g. "grunt lodash").
	/* istanbul ignore next: we're not able to test the following in bender so ignore it */
	if ( typeof module == 'object' && module.exports ) {
		module.exports = lodashInclude;
	} else {
		CKEDITOR.define( () => {
			return lodashInclude;
		} );
	}
} )();
