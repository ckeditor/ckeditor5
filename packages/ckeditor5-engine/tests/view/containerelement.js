/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewContainerElement, getViewFillerOffset } from '../../src/view/containerelement.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewDocument } from '../../src/view/document.js';
import { _parseView } from '../../src/dev-utils/view.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { ViewAttributeElement, ViewRootEditableElement, ViewText } from '../../src/index.js';

describe( 'ContainerElement', () => {
	let document;

	beforeEach( () => {
		document = new ViewDocument( new StylesProcessor() );
	} );

	describe( 'constructor()', () => {
		it( 'should create element with default priority', () => {
			const el = new ViewContainerElement( document, 'p' );

			expect( el ).to.be.an.instanceof( ViewContainerElement );
			expect( el ).to.be.an.instanceof( ViewElement );
			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
		} );
	} );

	describe( 'is()', () => {
		let el;

		before( () => {
			el = new ViewContainerElement( document, 'p' );
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
			expect( _parseView( '<container:p></container:p>' ).getFillerOffset() ).to.equals( 0 );
		} );

		it( 'should return offset after all children if element contains only ui elements', () => {
			expect( _parseView( '<container:p><ui:span></ui:span><ui:span></ui:span></container:p>' ).getFillerOffset() ).to.equals( 2 );
		} );

		it( 'should return null if element is not empty', () => {
			expect( _parseView( '<container:p>foo</container:p>' ).getFillerOffset() ).to.be.null;
		} );

		// Block filler is required after the `<br>` element if the element is the last child in the container. See #1422.
		describe( 'for <br> elements in container', () => {
			it( 'should return null for a container with text content only', () => {
				expect( _parseView( '<container:p>Foo.</container:p>' ).getFillerOffset() ).to.equals( null );
			} );

			it( 'should return offset after a <br> element that is the only child', () => {
				expect( _parseView( '<container:p><empty:br/></container:p>' ).getFillerOffset() ).to.equals( 1 );
			} );

			it( 'should return offset after a <br> element that follows text', () => {
				expect( _parseView( '<container:p>Foo.<empty:br/></container:p>' ).getFillerOffset() ).to.equals( 2 );
			} );

			it( 'should return offset after the last <br> element when there are consecutive <br> elements', () => {
				expect( _parseView( '<container:p>Foo.<empty:br/><empty:br/></container:p>' ).getFillerOffset() )
					.to.equals( 3 );
			} );

			it( 'should return offset after the last <br> element when text nodes are between <br> elements', () => {
				expect( _parseView( '<container:p>Foo.<empty:br/>Bar.<empty:br/></container:p>' ).getFillerOffset() ).to.equals( 4 );
			} );

			it( 'should return offset after a <br> element ignoring preceding ui elements', () => {
				expect( _parseView( '<container:p><ui:span></ui:span><empty:br/></container:p>' ).getFillerOffset() ).to.equals( 2 );
			} );

			it( 'should return null when the last empty element is not a <br> element', () => {
				expect( _parseView( '<container:p>Foo<empty:img/></container:p>' ).getFillerOffset() ).to.equals( null );
			} );
		} );

		// Block filler is required after the `<br>` element if the element is the last child in the container
		// even when nested in an attribute element.
		describe( 'for <br> elements in container inside an attribute element', () => {
			it( 'should return null when the attribute element contains text only', () => {
				expect(
					_parseView( '<container:p><attribute:b>Foo.</attribute:b></container:p>' ).getFillerOffset()
				).to.equals( null );
			} );

			it( 'should return offset after the attribute element that contains only a <br> element', () => {
				expect(
					_parseView( '<container:p><attribute:b><empty:br/></attribute:b></container:p>' ).getFillerOffset()
				).to.equals( 1 );
			} );

			it( 'should return offset after the attribute element that ends with a <br> element', () => {
				expect(
					_parseView( '<container:p><attribute:b>Foo.<empty:br/></attribute:b></container:p>' ).getFillerOffset()
				).to.equals( 1 );
			} );

			it( 'should return offset after the attribute element with deeply nested <br> element', () => {
				expect(
					_parseView(
						'<container:p><attribute:b><attribute:i>Foo.<empty:br/></attribute:i></attribute:b></container:p>'
					).getFillerOffset()
				).to.equals( 1 );
			} );

			it( 'should return offset after the attribute element that ends with consecutive <br> elements', () => {
				expect(
					_parseView( '<container:p><attribute:b>Foo.<empty:br/><empty:br/></attribute:b></container:p>' ).getFillerOffset()
				).to.equals( 1 );
			} );

			it( 'should return offset after the attribute element with text nodes between <br> elements', () => {
				expect(
					_parseView( '<container:p><attribute:b>Foo.<empty:br/>Bar.<empty:br/></attribute:b></container:p>' ).getFillerOffset()
				).to.equals( 1 );
			} );

			it( 'should return offset after the attribute element with a <br> element ignoring ui elements', () => {
				expect(
					_parseView( '<container:p><attribute:b><ui:span></ui:span><empty:br/></attribute:b></container:p>' ).getFillerOffset()
				).to.equals( 1 );
			} );

			it( 'should return null when the last empty element inside the attribute element is not a <br> element', () => {
				expect(
					_parseView( '<container:p><attribute:b>Foo<empty:img/></attribute:b></container:p>' ).getFillerOffset()
				).to.equals( null );
			} );
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should provide node type, root name, path, child nodes', () => {
			const text = new ViewText( document, 'foo' );
			const strong = new ViewAttributeElement( document, 'strong', null, new ViewText( document, 'bar' ) );
			const paragraph = new ViewContainerElement( document, 'p', null );
			const root = new ViewRootEditableElement( document, 'div' );
			paragraph._appendChild( text );
			paragraph._appendChild( strong );
			root._appendChild( paragraph );

			const json = JSON.stringify( paragraph );
			const parsed = JSON.parse( json );

			expect( parsed ).to.deep.equal( {
				name: 'p',
				path: [ 0 ],
				root: 'main',
				type: 'ContainerElement',
				children: [
					{
						data: 'foo',
						path: [ 0, 0 ],
						root: 'main',
						type: 'Text'
					},
					{
						name: 'strong',
						path: [ 0, 1 ],
						root: 'main',
						type: 'AttributeElement',
						children: [
							{
								data: 'bar',
								path: [ 0, 1, 0 ],
								root: 'main',
								type: 'Text'
							}
						]
					}
				]
			} );
		} );
	} );
} );

describe( 'getFillerOffset()', () => {
	it( 'should be a function that can be used in other places', () => {
		expect( getViewFillerOffset ).is.a( 'function' );
	} );
} );
