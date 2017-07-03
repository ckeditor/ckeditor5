/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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
					bar: el => el.lastChild,
				} );

				expect( view.foo._parentElement ).to.equal( document.body.firstChild );
				expect( view.bar._parentElement ).to.equal( document.body.lastChild );
			} );

			it( 'is ready', () => {
				const view = testUtils.createTestUIView( {
					foo: el => el.firstChild,
					bar: el => el.lastChild,
				} );

				expect( view.ready ).to.be.true;
			} );
		} );
	} );
} );
