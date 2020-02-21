/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import testUtils from '../../tests/_utils/utils';

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
