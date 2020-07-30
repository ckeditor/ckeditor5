/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { default as ContainerElement, getFillerOffset } from '../../src/view/containerelement';
import Element from '../../src/view/element';
import Document from '../../src/view/document';
import { parse } from '../../src/dev-utils/view';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'ContainerElement', () => {
	let document;

	beforeEach( () => {
		document = new Document( new StylesProcessor() );
	} );

	describe( 'constructor()', () => {
		it( 'should create element with default priority', () => {
			const el = new ContainerElement( document, 'p' );

			expect( el ).to.be.an.instanceof( ContainerElement );
			expect( el ).to.be.an.instanceof( Element );
			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
		} );
	} );

	describe( 'is()', () => {
		let el;

		before( () => {
			el = new ContainerElement( document, 'p' );
		} );

		it( 'should return true for containerElement/element, also with correct name and element name', () => {
			expect( el.is( 'containerElement' ) ).to.be.true;
			expect( el.is( 'view:containerElement' ) ).to.be.true;
			expect( el.is( 'containerElement', 'p' ) ).to.be.true;
			expect( el.is( 'view:containerElement', 'p' ) ).to.be.true;
			expect( el.is( 'element' ) ).to.be.true;
			expect( el.is( 'view:element' ) ).to.be.true;
			expect( el.is( 'element', 'p' ) ).to.be.true;
			expect( el.is( 'view:element', 'p' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'containerElement', 'span' ) ).to.be.false;
			expect( el.is( 'view:containerElement', 'span' ) ).to.be.false;
			expect( el.is( 'element', 'span' ) ).to.be.false;
			expect( el.is( 'view:element', 'span' ) ).to.be.false;
			expect( el.is( 'element', 'span' ) ).to.be.false;
			expect( el.is( 'view:span' ) ).to.be.false;
			expect( el.is( '$text' ) ).to.be.false;
			expect( el.is( '$textProxy' ) ).to.be.false;
			expect( el.is( 'attributeElement' ) ).to.be.false;
			expect( el.is( 'uiElement' ) ).to.be.false;
			expect( el.is( 'emptyElement' ) ).to.be.false;
			expect( el.is( 'rootElement' ) ).to.be.false;
			expect( el.is( 'documentFragment' ) ).to.be.false;
			expect( el.is( 'node', 'p' ) ).to.be.false;
			expect( el.is( 'view:node', 'p' ) ).to.be.false;
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

		// Block filler is required after the `<br>` element if the element is the last child in the container. See #1422.
		describe( 'for <br> elements in container', () => {
			it( 'returns null because container does not need the block filler', () => {
				expect( parse( '<container:p>Foo.</container:p>' ).getFillerOffset() ).to.equals( null );
			} );

			it( 'returns offset of the last child which is the <br> element (1)', () => {
				expect( parse( '<container:p><empty:br></empty:br></container:p>' ).getFillerOffset() ).to.equals( 1 );
			} );

			it( 'returns offset of the last child which is the <br> element (2)', () => {
				expect( parse( '<container:p>Foo.<empty:br></empty:br></container:p>' ).getFillerOffset() ).to.equals( 2 );
			} );

			it( 'always returns the last <br> element in the container', () => {
				expect( parse( '<container:p>Foo.<empty:br></empty:br><empty:br></empty:br></container:p>' ).getFillerOffset() )
					.to.equals( 3 );
			} );

			it( 'works fine with non-empty container with multi <br> elements', () => {
				expect( parse( '<container:p>Foo.<empty:br></empty:br>Bar.<empty:br></empty:br></container:p>' ).getFillerOffset() )
					.to.equals( 4 );
			} );

			it( 'ignores the ui elements', () => {
				expect( parse( '<container:p><ui:span></ui:span><empty:br></empty:br></container:p>' ).getFillerOffset() )
					.to.equals( 2 );
			} );

			it( 'empty element must be the <br> element', () => {
				expect( parse( '<container:p>Foo<empty:img></empty:img></container:p>' ).getFillerOffset() )
					.to.equals( null );
			} );
		} );
	} );
} );

describe( 'getFillerOffset()', () => {
	it( 'should be a function that can be used in other places', () => {
		expect( getFillerOffset ).is.a( 'function' );
	} );
} );
