/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, HTMLElement */

import UIElement from '../../src/view/uielement';
import Element from '../../src/view/element';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'UIElement', () => {
	let uiElement;

	beforeEach( () => {
		uiElement = new UIElement( 'span', {
			foo: 'bar',
			style: 'border: 1px solid red;color: white;',
			class: 'foo bar'
		} );
	} );

	describe( 'constructor()', () => {
		it( 'should create instance', () => {
			expect( uiElement.name ).to.equal( 'span' );
			expect( uiElement.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( uiElement.getStyle( 'border' ) ).to.equal( '1px solid red' );
			expect( uiElement.getStyle( 'color' ) ).to.equal( 'white' );
			expect( uiElement.hasClass( 'foo' ) ).to.true;
			expect( uiElement.hasClass( 'bar' ) ).to.true;
		} );

		it( 'should throw if child elements are passed to constructor', () => {
			expect( () => {
				new UIElement( 'img', null, [ new Element( 'i' ) ] ); // eslint-disable-line no-new
			} ).to.throw( CKEditorError, 'view-uielement-cannot-add: Cannot add child nodes to UIElement instance.' );
		} );
	} );

	describe( 'is()', () => {
		let el;

		before( () => {
			el = new UIElement( 'span' );
		} );

		it( 'should return true for uiElement/element, also with correct name and element name', () => {
			expect( el.is( 'uiElement' ) ).to.be.true;
			expect( el.is( 'uiElement', 'span' ) ).to.be.true;
			expect( el.is( 'element' ) ).to.be.true;
			expect( el.is( 'element', 'span' ) ).to.be.true;
			expect( el.is( 'span' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'uiElement', 'p' ) ).to.be.false;
			expect( el.is( 'element', 'p' ) ).to.be.false;
			expect( el.is( 'p' ) ).to.be.false;
			expect( el.is( 'text' ) ).to.be.false;
			expect( el.is( 'textProxy' ) ).to.be.false;
			expect( el.is( 'containerElement' ) ).to.be.false;
			expect( el.is( 'attributeElement' ) ).to.be.false;
			expect( el.is( 'emptyElement' ) ).to.be.false;
			expect( el.is( 'rootElement' ) ).to.be.false;
			expect( el.is( 'documentFragment' ) ).to.be.false;
		} );
	} );

	describe( 'appendChildren()', () => {
		it( 'should throw when try to append new child element', () => {
			expect( () => {
				uiElement.appendChildren( new Element( 'i' ) );
			} ).to.throw( CKEditorError, 'view-uielement-cannot-add: Cannot add child nodes to UIElement instance.' );
		} );
	} );

	describe( 'insertChildren()', () => {
		it( 'should throw when try to insert new child element', () => {
			expect( () => {
				uiElement.insertChildren( 0, new Element( 'i' ) );
			} ).to.throw( CKEditorError, 'view-uielement-cannot-add: Cannot add child nodes to UIElement instance.' );
		} );
	} );

	describe( 'clone()', () => {
		it( 'should be properly cloned', () => {
			const newUIElement = uiElement.clone();

			expect( newUIElement.name ).to.equal( 'span' );
			expect( newUIElement.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( newUIElement.getStyle( 'border' ) ).to.equal( '1px solid red' );
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
	} );
} );
