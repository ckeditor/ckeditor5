/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, HTMLElement */

import UIElement from '../../src/view/uielement';
import Element from '../../src/view/element';
import Document from '../../src/view/document';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'UIElement', () => {
	let uiElement, doc;

	beforeEach( () => {
		doc = new Document( new StylesProcessor() );

		uiElement = new UIElement( doc, 'span', {
			foo: 'bar',
			style: 'margin-top: 2em;color: white;',
			class: 'foo bar'
		} );
	} );

	describe( 'constructor()', () => {
		it( 'should create instance', () => {
			expect( uiElement.name ).to.equal( 'span' );
			expect( uiElement.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( uiElement.getStyle( 'margin-top' ) ).to.equal( '2em' );
			expect( uiElement.getStyle( 'color' ) ).to.equal( 'white' );
			expect( uiElement.hasClass( 'foo' ) ).to.true;
			expect( uiElement.hasClass( 'bar' ) ).to.true;
		} );

		it( 'should throw if child elements are passed to constructor', () => {
			expectToThrowCKEditorError( () => {
				new UIElement( doc, 'img', null, [ new Element( doc, 'i' ) ] ); // eslint-disable-line no-new
			}, 'view-uielement-cannot-add: Cannot add child nodes to UIElement instance.' );
		} );
	} );

	describe( 'is()', () => {
		let el;

		before( () => {
			el = new UIElement( doc, 'span' );
		} );

		it( 'should return true for uiElement/element, also with correct name and element name', () => {
			expect( el.is( 'uiElement' ) ).to.be.true;
			expect( el.is( 'view:uiElement' ) ).to.be.true;
			expect( el.is( 'uiElement', 'span' ) ).to.be.true;
			expect( el.is( 'view:uiElement', 'span' ) ).to.be.true;
			expect( el.is( 'element' ) ).to.be.true;
			expect( el.is( 'view:element' ) ).to.be.true;
			expect( el.is( 'node' ) ).to.be.true;
			expect( el.is( 'view:node' ) ).to.be.true;
			expect( el.is( 'element', 'span' ) ).to.be.true;
			expect( el.is( 'view:element', 'span' ) ).to.be.true;
			expect( el.is( 'element', 'span' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'uiElement', 'p' ) ).to.be.false;
			expect( el.is( 'view:uiElement', 'p' ) ).to.be.false;
			expect( el.is( 'element', 'p' ) ).to.be.false;
			expect( el.is( 'view:element', 'p' ) ).to.be.false;
			expect( el.is( 'element', 'p' ) ).to.be.false;
			expect( el.is( 'view:p' ) ).to.be.false;
			expect( el.is( '$text' ) ).to.be.false;
			expect( el.is( '$textProxy' ) ).to.be.false;
			expect( el.is( 'containerElement' ) ).to.be.false;
			expect( el.is( 'attributeElement' ) ).to.be.false;
			expect( el.is( 'emptyElement' ) ).to.be.false;
			expect( el.is( 'rootElement' ) ).to.be.false;
			expect( el.is( 'documentFragment' ) ).to.be.false;
			expect( el.is( 'model:element' ) ).to.be.false;
			expect( el.is( 'model:span' ) ).to.be.false;
			expect( el.is( 'model:node' ) ).to.be.false;
		} );
	} );

	describe( '_appendChild()', () => {
		it( 'should throw when try to append new child element', () => {
			expectToThrowCKEditorError( () => {
				uiElement._appendChild( new Element( doc, 'i' ) );
			}, 'view-uielement-cannot-add: Cannot add child nodes to UIElement instance.' );
		} );
	} );

	describe( '_insertChild()', () => {
		it( 'should throw when try to insert new child element', () => {
			expectToThrowCKEditorError( () => {
				uiElement._insertChild( 0, new Element( doc, 'i' ) );
			}, 'view-uielement-cannot-add: Cannot add child nodes to UIElement instance.' );
		} );
	} );

	describe( '_clone()', () => {
		it( 'should be properly cloned', () => {
			const newUIElement = uiElement._clone();

			expect( newUIElement.name ).to.equal( 'span' );
			expect( newUIElement.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( newUIElement.getStyle( 'margin-top' ) ).to.equal( '2em' );
			expect( newUIElement.getStyle( 'color' ) ).to.equal( 'white' );
			expect( newUIElement.hasClass( 'foo' ) ).to.true;
			expect( newUIElement.hasClass( 'bar' ) ).to.true;
			expect( newUIElement.isSimilar( uiElement ) ).to.true;
		} );
	} );

	describe( 'getFillerOffset()', () => {
		it( 'should return null', () => {
			expect( uiElement.getFillerOffset() ).to.null;
		} );
	} );

	describe( 'render()', () => {
		let domElement;

		beforeEach( () => {
			domElement = uiElement.render( document );
		} );

		it( 'should return DOM element', () => {
			expect( domElement ).to.be.instanceOf( HTMLElement );
		} );

		it( 'should use element name', () => {
			expect( domElement.tagName.toLowerCase() ).to.equal( uiElement.name );
		} );

		it( 'should render attributes', () => {
			for ( const key of uiElement.getAttributeKeys() ) {
				expect( domElement.getAttribute( key ) ).to.equal( uiElement.getAttribute( key ) );
			}
		} );

		it( 'should allow to change render() method', () => {
			uiElement.render = function( domDocument ) {
				return domDocument.createElement( 'b' );
			};

			expect( uiElement.render( document ).tagName.toLowerCase() ).to.equal( 'b' );
		} );

		it( 'should allow to add new elements inside', () => {
			uiElement.render = function( domDocument ) {
				const element = this.toDomElement( domDocument );
				const text = domDocument.createTextNode( 'foo bar' );
				element.appendChild( text );

				return element;
			};

			const rendered = uiElement.render( document );
			expect( rendered.tagName.toLowerCase() ).to.equal( 'span' );
			expect( rendered.textContent ).to.equal( 'foo bar' );
		} );
	} );
} );
