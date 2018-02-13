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
			writer.setSelection( position, true );

			sinon.assert.calledWithExactly( spy, position, true );
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
	} );

	function assertElementAttributes( element, attributes ) {
		for ( const key of Object.keys( attributes ) ) {
			if ( element.getAttribute( key ) !== attributes[ key ] ) {
				throw new Error( 'Attributes in element are different that those passed to the constructor method.' );
			}
		}
	}
} );
