/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import IconView from '../../src/icon/iconview';

describe( 'IconView', () => {
	let view;

	beforeEach( () => {
		return ( view = new IconView() ).init();
	} );

	describe( 'constructor()', () => {
		it( 'creates element from template', () => {
			expect( view.element.tagName ).to.equal( 'svg' );
			expect( view.element.getAttribute( 'class' ) ).to.equal( 'ck-icon' );
			expect( view.element.getAttribute( 'viewBox' ) ).to.equal( '0 0 20 20' );
		} );
	} );

	describe( '<svg> bindings', () => {
		describe( 'viewBox', () => {
			it( 'should react to changes in view#viewBox', () => {
				expect( view.element.getAttribute( 'viewBox' ) ).to.equal( '0 0 20 20' );

				view.viewBox = '1 2 3 4';

				expect( view.element.getAttribute( 'viewBox' ) ).to.equal( '1 2 3 4' );
			} );
		} );

		describe( 'inline svg', () => {
			it( 'should react to changes in view#content', () => {
				view.content = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="test"></g></svg>';

				expect( view.element.innerHTML = '<g id="test"></g>' );
			} );
		} );
	} );
} );
