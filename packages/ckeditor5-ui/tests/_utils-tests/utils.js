/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '../../tests/_utils/utils.js';

describe( 'utils', () => {
	describe( 'createTestUIView', () => {
		describe( 'view instance', () => {
			it( 'comes with a view', () => {
				const view = testUtils.createTestUIView();

				expect( view.element ).to.equal( document.body );
			} );

			it( 'creates collections and regions', () => {
				const view = testUtils.createTestUIView( {
					foo: el => el.firstChild,
					bar: el => el.lastChild
				} );

				expect( view.foo._parentElement ).to.equal( document.body.firstChild );
				expect( view.bar._parentElement ).to.equal( document.body.lastChild );
			} );

			it( 'is rendered', () => {
				const view = testUtils.createTestUIView( {
					foo: el => el.firstChild,
					bar: el => el.lastChild
				} );

				expect( view.isRendered ).to.be.true;
			} );
		} );
	} );
} );
