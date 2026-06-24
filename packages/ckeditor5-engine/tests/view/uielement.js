/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { ViewUIElement } from '../../src/view/uielement.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewDocument } from '../../src/view/document.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { ViewRootEditableElement } from '../../src/index.js';

describe( 'ViewUIElement', () => {
	let uiElement, doc;

	beforeEach( () => {
		doc = new ViewDocument( new StylesProcessor() );

		uiElement = new ViewUIElement( doc, 'span', {
			foo: 'bar',
			style: 'margin-top: 2em;color: white;',
			class: 'foo bar'
		} );
	} );

	describe( 'constructor()', () => {
		it( 'should create instance', () => {
			expect( uiElement.name ).toBe( 'span' );
			expect( uiElement.getAttribute( 'foo' ) ).toBe( 'bar' );
			expect( uiElement.getStyle( 'margin-top' ) ).toBe( '2em' );
			expect( uiElement.getStyle( 'color' ) ).toBe( 'white' );
			expect( uiElement.hasClass( 'foo' ) ).toBe( true );
			expect( uiElement.hasClass( 'bar' ) ).toBe( true );
		} );

		it( 'should throw if child elements are passed to constructor', () => {
			expectToThrowCKEditorError( () => {
				new ViewUIElement( doc, 'img', null, [ new ViewElement( doc, 'i' ) ] ); // eslint-disable-line no-new
			}, 'view-uielement-cannot-add' );
		} );
	} );

	describe( 'is()', () => {
		let el;

		beforeAll( () => {
			el = new ViewUIElement( doc, 'span' );
		} );

		it( 'should return true for uiElement/element, also with correct name and element name', () => {
			expect( el.is( 'uiElement' ) ).toBe( true );
			expect( el.is( 'view:uiElement' ) ).toBe( true );
			expect( el.is( 'uiElement', 'span' ) ).toBe( true );
			expect( el.is( 'view:uiElement', 'span' ) ).toBe( true );
			expect( el.is( 'element' ) ).toBe( true );
			expect( el.is( 'view:element' ) ).toBe( true );
			expect( el.is( 'node' ) ).toBe( true );
			expect( el.is( 'view:node' ) ).toBe( true );
			expect( el.is( 'element', 'span' ) ).toBe( true );
			expect( el.is( 'view:element', 'span' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'uiElement', 'p' ) ).toBe( false );
			expect( el.is( 'view:uiElement', 'p' ) ).toBe( false );
			expect( el.is( 'element', 'p' ) ).toBe( false );
			expect( el.is( 'view:element', 'p' ) ).toBe( false );
			expect( el.is( 'element', 'p' ) ).toBe( false );
			expect( el.is( 'view:p' ) ).toBe( false );
			expect( el.is( '$text' ) ).toBe( false );
			expect( el.is( '$textProxy' ) ).toBe( false );
			expect( el.is( 'containerElement' ) ).toBe( false );
			expect( el.is( 'attributeElement' ) ).toBe( false );
			expect( el.is( 'emptyElement' ) ).toBe( false );
			expect( el.is( 'rootElement' ) ).toBe( false );
			expect( el.is( 'documentFragment' ) ).toBe( false );
			expect( el.is( 'model:element' ) ).toBe( false );
			expect( el.is( 'model:span' ) ).toBe( false );
			expect( el.is( 'model:node' ) ).toBe( false );
			expect( el.is( 'node', 'span' ) ).toBe( false );
			expect( el.is( 'view:node', 'span' ) ).toBe( false );
		} );
	} );

	describe( '_appendChild()', () => {
		it( 'should throw when try to append new child element', () => {
			expectToThrowCKEditorError( () => {
				uiElement._appendChild( new ViewElement( doc, 'i' ) );
			}, 'view-uielement-cannot-add' );
		} );
	} );

	describe( '_insertChild()', () => {
		it( 'should throw when try to insert new child element', () => {
			expectToThrowCKEditorError( () => {
				uiElement._insertChild( 0, new ViewElement( doc, 'i' ) );
			}, 'view-uielement-cannot-add' );
		} );
	} );

	describe( '_clone()', () => {
		it( 'should be properly cloned', () => {
			const newUIElement = uiElement._clone();

			expect( newUIElement.name ).toBe( 'span' );
			expect( newUIElement.getAttribute( 'foo' ) ).toBe( 'bar' );
			expect( newUIElement.getStyle( 'margin-top' ) ).toBe( '2em' );
			expect( newUIElement.getStyle( 'color' ) ).toBe( 'white' );
			expect( newUIElement.hasClass( 'foo' ) ).toBe( true );
			expect( newUIElement.hasClass( 'bar' ) ).toBe( true );
			expect( newUIElement.isSimilar( uiElement ) ).toBe( true );
		} );
	} );

	describe( 'getFillerOffset()', () => {
		it( 'should return null', () => {
			expect( uiElement.getFillerOffset() ).toBeNull();
		} );
	} );

	describe( 'render()', () => {
		let domElement;

		beforeEach( () => {
			domElement = uiElement.render( document );
		} );

		it( 'should return DOM element', () => {
			expect( domElement ).toBeInstanceOf( HTMLElement );
		} );

		it( 'should use element name', () => {
			expect( domElement.tagName.toLowerCase() ).toBe( uiElement.name );
		} );

		it( 'should render attributes', () => {
			for ( const key of uiElement.getAttributeKeys() ) {
				expect( domElement.getAttribute( key ) ).toBe( uiElement.getAttribute( key ) );
			}
		} );

		it( 'should allow to change render() method', () => {
			uiElement.render = function( domDocument ) {
				return domDocument.createElement( 'b' );
			};

			expect( uiElement.render( document ).tagName.toLowerCase() ).toBe( 'b' );
		} );

		it( 'should allow to add new elements inside', () => {
			uiElement.render = function( domDocument ) {
				const element = this.toDomElement( domDocument );
				const text = domDocument.createTextNode( 'foo bar' );
				element.appendChild( text );

				return element;
			};

			const rendered = uiElement.render( document );
			expect( rendered.tagName.toLowerCase() ).toBe( 'span' );
			expect( rendered.textContent ).toBe( 'foo bar' );
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should provide node type, root name, path', () => {
			const uiElement = new ViewUIElement( doc, 'span' );
			const paragraph = new ViewElement( doc, 'p', null );
			const root = new ViewRootEditableElement( doc, 'div' );
			paragraph._appendChild( uiElement );
			root._appendChild( paragraph );

			const json = JSON.stringify( uiElement );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				name: 'span',
				path: [ 0, 0 ],
				root: 'main',
				type: 'UIElement'
			} );
		} );
	} );
} );
