/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, document */

import global from 'ckeditor5/utils/dom/global.js';

describe( 'global', () => {
	describe( 'global', () => {
		describe( 'window', () => {
			it( 'equals native DOM window', () => {
				expect( global.window ).to.equal( window );
			} );
		} );

		describe( 'document', () => {
			it( 'equals native DOM document', () => {
				expect( global.document ).to.equal( document );
			} );
		} );
	} );
} );
