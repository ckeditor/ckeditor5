/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import EmptyElement from '../../src/view/emptyelement';
import Element from '../../src/view/element';
import Document from '../../src/view/document';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'EmptyElement', () => {
	let element, emptyElement, document;

	beforeEach( () => {
		document = new Document();
		element = new Element( document, 'b' );
		emptyElement = new EmptyElement( document, 'img', {
			alt: 'alternative text',
			style: 'margin-top: 2em;color: white;',
			class: 'image big'
		} );
	} );

	describe( 'is()', () => {
		let el;

		before( () => {
			el = new EmptyElement( document, 'p' );
		} );

		it( 'should return true for emptyElement/element, also with correct name and element name', () => {
			expect( el.is( 'emptyElement' ) ).to.be.true;
			expect( el.is( 'view:emptyElement' ) ).to.be.true;
			expect( el.is( 'emptyElement', 'p' ) ).to.be.true;
			expect( el.is( 'view:emptyElement', 'p' ) ).to.be.true;
			expect( el.is( 'element' ) ).to.be.true;
			expect( el.is( 'view:element' ) ).to.be.true;
			expect( el.is( 'element', 'p' ) ).to.be.true;
			expect( el.is( 'view:element', 'p' ) ).to.be.true;
			expect( el.is( 'p' ) ).to.be.true;
			expect( el.is( 'view:p' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'emptyElement', 'span' ) ).to.be.false;
			expect( el.is( 'view:emptyElement', 'span' ) ).to.be.false;
			expect( el.is( 'element', 'span' ) ).to.be.false;
			expect( el.is( 'view:element', 'span' ) ).to.be.false;
			expect( el.is( 'span' ) ).to.be.false;
			expect( el.is( 'view:span' ) ).to.be.false;
			expect( el.is( 'text' ) ).to.be.false;
			expect( el.is( 'view:text' ) ).to.be.false;
			expect( el.is( 'textProxy' ) ).to.be.false;
			expect( el.is( 'containerElement' ) ).to.be.false;
			expect( el.is( 'attributeElement' ) ).to.be.false;
			expect( el.is( 'uiElement' ) ).to.be.false;
			expect( el.is( 'rootElement' ) ).to.be.false;
			expect( el.is( 'documentFragment' ) ).to.be.false;
		} );
	} );

	it( 'should throw if child elements are passed to constructor', () => {
		const el = new Element( document, 'i' );

		expectToThrowCKEditorError( () => {
			new EmptyElement( document, 'img', null, [ el ] ); // eslint-disable-line no-new
		}, 'view-emptyelement-cannot-add: Cannot add child nodes to EmptyElement instance.', el );
	} );

	describe( '_appendChild', () => {
		it( 'should throw when try to append new child element', () => {
			expectToThrowCKEditorError( () => {
				emptyElement._appendChild( element );
			}, 'view-emptyelement-cannot-add: Cannot add child nodes to EmptyElement instance.', element );
		} );
	} );

	describe( '_insertChild', () => {
		it( 'should throw when try to insert new child element', () => {
			expectToThrowCKEditorError( () => {
				emptyElement._insertChild( 0, element );
			}, 'view-emptyelement-cannot-add: Cannot add child nodes to EmptyElement instance.', element );
		} );
	} );

	describe( '_clone()', () => {
		it( 'should be cloned properly', () => {
			const newEmptyElement = emptyElement._clone();

			expect( newEmptyElement.name ).to.equal( 'img' );
			expect( newEmptyElement.getAttribute( 'alt' ) ).to.equal( 'alternative text' );
			expect( newEmptyElement.getStyle( 'margin-top' ) ).to.equal( '2em' );
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
