/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import testUtils from '/tests/ui/_utils/utils.js';

describe( 'utils', () => {
	describe( 'createTestUIController', () => {
		it( 'returns a promise', () => {
			expect( testUtils.createTestUIController() ).to.be.instanceof( Promise );
		} );

		describe( 'controller instance', () => {
			it( 'comes with a view', () => {
				const promise = testUtils.createTestUIController();

				return promise.then( controller => {
					expect( controller.view.element ).to.equal( document.body );
				} );
			} );

			it( 'creates collections and regions', () => {
				const promise = testUtils.createTestUIController( {
					foo: el => el.firstChild,
					bar: el => el.lastChild,
				} );

				promise.then( controller => {
					expect( controller.collections.get( 'foo' ) ).to.be.not.undefined;
					expect( controller.collections.get( 'bar' ) ).to.be.not.undefined;

					expect( controller.view.regions.get( 'foo' ).element ).to.equal( document.body.firstChild );
					expect( controller.view.regions.get( 'bar' ).element ).to.equal( document.body.lastChild );
				} );
			} );

			it( 'is ready', () => {
				const promise = testUtils.createTestUIController( {
					foo: el => el.firstChild,
					bar: el => el.lastChild,
				} );

				promise.then( controller => {
					expect( controller.ready ).to.be.true;
				} );
			} );
		} );
	} );
} );
