/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

import ContainerElement from '/ckeditor5/engine/view/containerelement.js';
import Element from '/ckeditor5/engine/view/element.js';
import { parse } from '/tests/engine/_utils/view.js';

describe( 'ContainerElement', () => {
	describe( 'constructor', () => {
		it( 'should create element with default priority', () => {
			const el = new ContainerElement( 'p' );

			expect( el ).to.be.an.instanceof( ContainerElement );
			expect( el ).to.be.an.instanceof( Element );
			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
		} );
	} );

	describe( 'getFillerOffset', () => {
		it( 'should return position 0 if element is empty', () => {
			expect( parse( '<container:p></container:p>' ).getFillerOffset() ).to.equals( 0 );
		} );

		it( 'should return null if element is not empty', () => {
			expect( parse( '<container:p>foo</container:p>' ).getFillerOffset() ).to.be.null;
		} );
	} );
} );
