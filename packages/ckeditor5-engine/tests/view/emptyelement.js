/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import EmptyElement from '../../src/view/emptyelement';
import Element from '../../src/view/element';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'EmptyElement', () => {
	let element, emptyElement;

	beforeEach( () => {
		element = new Element( 'b' );
		emptyElement = new EmptyElement( 'img', {
			alt: 'alternative text',
			style: 'border: 1px solid red;color: white;',
			class: 'image big'
		} );
	} );

	describe( 'is', () => {
		let el;

		before( () => {
			el = new EmptyElement( 'p' );
		} );

		it( 'should return true for emptyElement/element, also with correct name and element name', () => {
			expect( el.is( 'emptyElement' ) ).to.be.true;
			expect( el.is( 'emptyElement', 'p' ) ).to.be.true;
			expect( el.is( 'element' ) ).to.be.true;
			expect( el.is( 'element', 'p' ) ).to.be.true;
			expect( el.is( 'p' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'emptyElement', 'span' ) ).to.be.false;
			expect( el.is( 'element', 'span' ) ).to.be.false;
			expect( el.is( 'span' ) ).to.be.false;
			expect( el.is( 'text' ) ).to.be.false;
			expect( el.is( 'textProxy' ) ).to.be.false;
			expect( el.is( 'containerElement' ) ).to.be.false;
			expect( el.is( 'attributeElement' ) ).to.be.false;
			expect( el.is( 'uiElement' ) ).to.be.false;
			expect( el.is( 'rootElement' ) ).to.be.false;
			expect( el.is( 'documentFragment' ) ).to.be.false;
		} );
	} );

	it( 'should throw if child elements are passed to constructor', () => {
		expect( () => {
			new EmptyElement( 'img', null, [ new Element( 'i' ) ] ); // eslint-disable-line no-new
		} ).to.throw( CKEditorError, 'view-emptyelement-cannot-add: Cannot add child nodes to EmptyElement instance.' );
	} );

	describe( 'appendChildren', () => {
		it( 'should throw when try to append new child element', () => {
			expect( () => {
				emptyElement.appendChildren( element );
			} ).to.throw( CKEditorError, 'view-emptyelement-cannot-add: Cannot add child nodes to EmptyElement instance.' );
		} );
	} );

	describe( 'insertChildren', () => {
		it( 'should throw when try to insert new child element', () => {
			expect( () => {
				emptyElement.insertChildren( 0, element );
			} ).to.throw( CKEditorError, 'view-emptyelement-cannot-add: Cannot add child nodes to EmptyElement instance.' );
		} );
	} );

	describe( 'clone', () => {
		it( 'should be cloned properly', () => {
			const newEmptyElement = emptyElement.clone();

			expect( newEmptyElement.name ).to.equal( 'img' );
			expect( newEmptyElement.getAttribute( 'alt' ) ).to.equal( 'alternative text' );
			expect( newEmptyElement.getStyle( 'border' ) ).to.equal( '1px solid red' );
			expect( newEmptyElement.getStyle( 'color' ) ).to.equal( 'white' );
			expect( newEmptyElement.hasClass( 'image' ) ).to.be.true;
			expect( newEmptyElement.hasClass( 'big' ) ).to.be.true;
			expect( newEmptyElement.isSimilar( emptyElement ) ).to.be.true;
		} );
	} );

	describe( 'getFillerOffset', () => {
		it( 'should return null', () => {
			expect( emptyElement.getFillerOffset() ).to.be.null;
		} );
	} );
} );
