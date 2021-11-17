/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global chai */

import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

/**
 * @param {String} markupB Markup to compare.
 */
chai.Assertion.addMethod( 'equalMarkup', function( markupB ) {
	const markupA = this._obj;
	assertEqualMarkup( markupA, markupB );
} );
