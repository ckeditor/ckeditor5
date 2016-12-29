/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import testUtils from 'ckeditor5-ui/tests/_utils/utils';

describe( 'utils', () => {
	describe( 'createTestUIView', () => {
		it( 'returns a promise', () => {
			expect( testUtils.createTestUIView() ).to.be.instanceof( Promise );
		} );

		describe( 'view instance', () => {
			it( 'comes with a view', () => {
				const promise = testUtils.createTestUIView();

				return promise.then( view => {
					expect( view.element ).to.equal( document.body );
				} );
			} );

			it( 'creates collections and regions', () => {
				const promise = testUtils.createTestUIView( {
					foo: el => el.firstChild,
					bar: el => el.lastChild,
				} );

				return promise.then( view => {
					expect( view.foo._parentElement ).to.equal( document.body.firstChild );
					expect( view.bar._parentElement ).to.equal( document.body.lastChild );
				} );
			} );

			it( 'is ready', () => {
				const promise = testUtils.createTestUIView( {
					foo: el => el.firstChild,
					bar: el => el.lastChild,
				} );

				return promise.then( view => {
					expect( view.ready ).to.be.true;
				} );
			} );
		} );
	} );
} );
