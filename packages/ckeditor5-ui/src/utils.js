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
	var utils = {};

	// Extend "utils" with Lo-Dash methods.
	for ( var i = 0; i < lodashIncludes.length; i++ ) {
		utils[ lodashIncludes[ i ] ] = lodash[ lodashIncludes[ i ] ];
	}

	return utils;
} );
