/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, document */

import global from 'ckeditor5/utils/dom/global.js';
import testUtils from 'tests/core/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'global', () => {
	describe( 'global', () => {
		describe( 'window', () => {
			it( 'equals native DOM window', () => {
				expect( global.window ).to.equal( window );
			} );

			it( 'stubs', () => {
				testUtils.sinon.stub( global, 'window', {
					scrollX: 100
				} );

				expect( global.window ).to.deep.equal( {
					scrollX: 100
				} );
			} );
		} );

		describe( 'document', () => {
			it( 'equals native DOM document', () => {
				expect( global.document ).to.equal( document );
			} );

			it( 'stubs', () => {
				testUtils.sinon.stub( global, 'document', {
					foo: 'abc'
				} );

				expect( global.document ).to.deep.equal( {
					foo: 'abc'
				} );
			} );
		} );
	} );
} );
