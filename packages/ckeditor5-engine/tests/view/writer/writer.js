/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Writer from '../../../src/view/writer';
import Document from '../../../src/view/document';
import EditableElement from '../../../src/view/editableelement';
import ViewPosition from '../../../src/view/position';
import createViewRoot from '../_utils/createroot';

describe( 'Writer', () => {
	let writer, attributes, root;

	before( () => {
		attributes = { foo: 'bar', baz: 'quz' };
		const document = new Document();
		root = createViewRoot( document );
		writer = new Writer( document );
	} );

	describe( 'setSelection()', () => {
		it( 'should use selection._setTo method internally', () => {
			const spy = sinon.spy( writer.document.selection, '_setTo' );
			const position = ViewPosition.createAt( root );
			writer.setSelection( position );

			sinon.assert.calledWith( spy, position );
			spy.restore();
		} );
	} );

	describe( 'setSelectionFocus()', () => {
		it( 'should use selection._setFocus method internally', () => {
			const spy = sinon.spy( writer.document.selection, '_setFocus' );
			writer.setSelectionFocus( root, 0 );

			sinon.assert.calledWithExactly( spy, root, 0 );
			spy.restore();
		} );
	} );

	describe( 'setFakeSelection()', () => {
		it( 'should use selection._setFake method internally', () => {
			const spy = sinon.spy( writer.document.selection, '_setFake' );
			const options = {};
			writer.setFakeSelection( true, options );

			sinon.assert.calledWithExactly( spy, true, options );
			spy.restore();
		} );
	} );

	describe( 'createText()', () => {
		it( 'should create Text instance', () => {
			const text = writer.createText( 'foo bar' );

			expect( text.is( 'text' ) ).to.be.true;
			expect( text.data ).to.equal( 'foo bar' );
		} );
	} );

	describe( 'createAttributeElement()', () => {
		it( 'should create AttributeElement', () => {
			const element = writer.createAttributeElement( 'foo', attributes );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'foo' );
			assertElementAttributes( element, attributes );
		} );

		it( 'should allow to pass priority', () => {
			const element = writer.createAttributeElement( 'foo', attributes, 99 );

			expect( element.is( 'attributeElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'foo' );
			expect( element.priority ).to.equal( 99 );
			assertElementAttributes( element, attributes );
		} );
	} );

	describe( 'createContainerElement()', () => {
		it( 'should create ContainerElement', () => {
			const element = writer.createContainerElement( 'foo', attributes );

			expect( element.is( 'containerElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'foo' );
			assertElementAttributes( element, attributes );
		} );
	} );

	describe( 'createEditableElement()', () => {
		it( 'should create EditableElement', () => {
			const element = writer.createEditableElement( 'foo', attributes );

			expect( element ).to.be.instanceOf( EditableElement );
			expect( element.name ).to.equal( 'foo' );
			assertElementAttributes( element, attributes );
		} );
	} );

	describe( 'createEmptyElement()', () => {
		it( 'should create EmptyElement', () => {
			const element = writer.createEmptyElement( 'foo', attributes );

			expect( element.is( 'emptyElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'foo' );
			assertElementAttributes( element, attributes );
		} );
	} );

	describe( 'createUIElement()', () => {
		it( 'should create UIElement', () => {
			const element = writer.createUIElement( 'foo', attributes );

			expect( element.is( 'uiElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'foo' );
			assertElementAttributes( element, attributes );
		} );

		it( 'should allow to pass custom rendering method', () => {
			const renderFn = function() {};
			const element = writer.createUIElement( 'foo', attributes, renderFn );

			expect( element.is( 'uiElement' ) ).to.be.true;
			expect( element.name ).to.equal( 'foo' );
			expect( element.render ).to.equal( renderFn );
			assertElementAttributes( element, attributes );
		} );
	} );

	describe( 'setAttribute()', () => {
		it( 'should set attribute on given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setAttribute( 'foo', 'bar', element );

			expect( element.getAttribute( 'foo' ) ).to.equal( 'bar' );
		} );
	} );

	describe( 'removeAttribute()', () => {
		it( 'should remove attribute on given element', () => {
			const element = writer.createAttributeElement( 'span', { foo: 'bar' } );

			writer.removeAttribute( 'foo', element );

			expect( element.getAttribute( 'foo' ) ).to.be.undefined;
		} );
	} );

	describe( 'addClass()', () => {
		it( 'should add class to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.addClass( 'foo', element );

			expect( element.hasClass( 'foo' ) ).to.be.true;
		} );

		it( 'should add multiple classes to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.addClass( [ 'foo', 'bar' ], element );

			expect( element.hasClass( 'foo' ) ).to.be.true;
			expect( element.hasClass( 'bar' ) ).to.be.true;
		} );
	} );

	describe( 'removeClass()', () => {
		it( 'should remove class from given element', () => {
			const element = writer.createAttributeElement( 'span', { class: 'foo bar' } );

			writer.removeClass( 'foo', element );

			expect( element.hasClass( 'foo' ) ).to.be.false;
			expect( element.hasClass( 'bar' ) ).to.be.true;
		} );

		it( 'should remove multiple classes from given element', () => {
			const element = writer.createAttributeElement( 'span', { class: 'foo bar' } );

			writer.removeClass( [ 'foo', 'bar' ], element );

			expect( element.hasClass( 'foo' ) ).to.be.false;
			expect( element.hasClass( 'bar' ) ).to.be.false;
		} );
	} );

	describe( 'addStyle()', () => {
		it( 'should add style to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setStyle( 'foo', 'bar', element );

			expect( element.getStyle( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should allow to add multiple styles to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setStyle( {
				foo: 'bar',
				baz: 'quiz'
			}, element );

			expect( element.getStyle( 'foo' ) ).to.equal( 'bar' );
			expect( element.getStyle( 'baz' ) ).to.equal( 'quiz' );
		} );
	} );

	describe( 'removeStyle()', () => {
		it( 'should remove style from given element', () => {
			const element = writer.createAttributeElement( 'span', { style: 'foo:bar;baz:quiz;' } );

			writer.removeStyle( 'foo', element );

			expect( element.hasStyle( 'foo' ) ).to.be.false;
			expect( element.hasStyle( 'baz' ) ).to.be.true;
		} );

		it( 'should remove multiple styles from given element', () => {
			const element = writer.createAttributeElement( 'span', { style: 'foo:bar;baz:quiz;' } );

			writer.removeStyle( [ 'foo', 'bar' ], element );

			expect( element.hasStyle( 'foo' ) ).to.be.false;
			expect( element.hasStyle( 'baz' ) ).to.be.true;
		} );
	} );

	describe( 'setCustomProperty()', () => {
		it( 'should set custom property to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setCustomProperty( 'foo', 'bar', element );

			expect( element.getCustomProperty( 'foo' ) ).to.equal( 'bar' );
		} );
	} );

	describe( 'removeCustomProperty()', () => {
		it( 'should remove custom property from given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setCustomProperty( 'foo', 'bar', element );
			expect( element.getCustomProperty( 'foo' ) ).to.equal( 'bar' );

			writer.removeCustomProperty( 'foo', element );
			expect( element.getCustomProperty( 'foo' ) ).to.be.undefined;
		} );
	} );

	function assertElementAttributes( element, attributes ) {
		for ( const key of Object.keys( attributes ) ) {
			if ( element.getAttribute( key ) !== attributes[ key ] ) {
				throw new Error( 'Attributes in element are different that those passed to the constructor method.' );
			}
		}
	}
} );
