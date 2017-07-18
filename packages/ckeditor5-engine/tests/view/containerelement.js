/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ContainerElement from '../../src/view/containerelement';
import Element from '../../src/view/element';
import { parse } from '../../src/dev-utils/view';

describe( 'ContainerElement', () => {
	describe( 'constructor()', () => {
		it( 'should create element with default priority', () => {
			const el = new ContainerElement( 'p' );

			expect( el ).to.be.an.instanceof( ContainerElement );
			expect( el ).to.be.an.instanceof( Element );
			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
		} );
	} );

	describe( 'is', () => {
		let el;

		before( () => {
			el = new ContainerElement( 'p' );
		} );

		it( 'should return true for containerElement/element, also with correct name and element name', () => {
			expect( el.is( 'containerElement' ) ).to.be.true;
			expect( el.is( 'containerElement', 'p' ) ).to.be.true;
			expect( el.is( 'element' ) ).to.be.true;
			expect( el.is( 'element', 'p' ) ).to.be.true;
			expect( el.is( 'p' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'containerElement', 'span' ) ).to.be.false;
			expect( el.is( 'element', 'span' ) ).to.be.false;
			expect( el.is( 'span' ) ).to.be.false;
			expect( el.is( 'text' ) ).to.be.false;
			expect( el.is( 'textProxy' ) ).to.be.false;
			expect( el.is( 'attributeElement' ) ).to.be.false;
			expect( el.is( 'uiElement' ) ).to.be.false;
			expect( el.is( 'emptyElement' ) ).to.be.false;
			expect( el.is( 'rootElement' ) ).to.be.false;
			expect( el.is( 'documentFragment' ) ).to.be.false;
		} );
	} );

	describe( 'getFillerOffset', () => {
		it( 'should return position 0 if element is empty', () => {
			expect( parse( '<container:p></container:p>' ).getFillerOffset() ).to.equals( 0 );
		} );

		it( 'should return offset after all children if element contains only ui elements', () => {
			expect( parse( '<container:p><ui:span></ui:span><ui:span></ui:span></container:p>' ).getFillerOffset() ).to.equals( 2 );
		} );

		it( 'should return null if element is not empty', () => {
			expect( parse( '<container:p>foo</container:p>' ).getFillerOffset() ).to.be.null;
		} );
	} );
} );
