/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import global from '../../src/dom/global.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'global', () => {
	testUtils.createSinonSandbox();

	describe( 'global', () => {
		describe( 'window', () => {
			it( 'equals native DOM window', () => {
				expect( global.window ).to.equal( window );
			} );

			it( 'stubs', () => {
				testUtils.sinon.stub( global, 'window' ).value( {
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
				testUtils.sinon.stub( global, 'document' ).value( {
					foo: 'abc'
				} );

				expect( global.document ).to.deep.equal( {
					foo: 'abc'
				} );
			} );
		} );
	} );
} );
