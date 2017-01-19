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

	it( 'should throw if child elements are passed to constructor', () => {
		expect( () => {
			new EmptyElement( 'img', null, [ new Element( 'i' ) ] );
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
