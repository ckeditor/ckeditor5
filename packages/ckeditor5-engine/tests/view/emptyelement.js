/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ViewEmptyElement } from '../../src/view/emptyelement.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewDocument } from '../../src/view/document.js';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { ViewRootEditableElement } from '../../src/index.js';

describe( 'ViewEmptyElement', () => {
	let element, emptyElement, document;

	beforeEach( () => {
		document = new ViewDocument( new StylesProcessor() );
		element = new ViewElement( document, 'b' );
		emptyElement = new ViewEmptyElement( document, 'img', {
			alt: 'alternative text',
			style: 'margin-top: 2em;color: white;',
			class: 'image big'
		} );
	} );

	describe( 'is()', () => {
		let el;

		beforeEach( () => {
			el = new ViewEmptyElement( document, 'p' );
		} );

		it( 'should return true for emptyElement/element, also with correct name and element name', () => {
			expect( el.is( 'emptyElement' ) ).toBe( true );
			expect( el.is( 'view:emptyElement' ) ).toBe( true );
			expect( el.is( 'emptyElement', 'p' ) ).toBe( true );
			expect( el.is( 'view:emptyElement', 'p' ) ).toBe( true );
			expect( el.is( 'element' ) ).toBe( true );
			expect( el.is( 'view:element' ) ).toBe( true );
			expect( el.is( 'element', 'p' ) ).toBe( true );
			expect( el.is( 'view:element', 'p' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'emptyElement', 'span' ) ).toBe( false );
			expect( el.is( 'view:emptyElement', 'span' ) ).toBe( false );
			expect( el.is( 'element', 'span' ) ).toBe( false );
			expect( el.is( 'view:element', 'span' ) ).toBe( false );
			expect( el.is( 'element', 'span' ) ).toBe( false );
			expect( el.is( 'view:span' ) ).toBe( false );
			expect( el.is( '$text' ) ).toBe( false );
			expect( el.is( 'view:$text' ) ).toBe( false );
			expect( el.is( '$textProxy' ) ).toBe( false );
			expect( el.is( 'containerElement' ) ).toBe( false );
			expect( el.is( 'attributeElement' ) ).toBe( false );
			expect( el.is( 'uiElement' ) ).toBe( false );
			expect( el.is( 'rootElement' ) ).toBe( false );
			expect( el.is( 'documentFragment' ) ).toBe( false );
			expect( el.is( 'node', 'p' ) ).toBe( false );
			expect( el.is( 'view:node', 'p' ) ).toBe( false );
		} );
	} );

	it( 'should throw if child elements are passed to constructor', () => {
		const el = new ViewElement( document, 'i' );

		expectToThrowCKEditorError( () => {
			new ViewEmptyElement( document, 'img', null, [ el ] ); // eslint-disable-line no-new
		}, 'view-emptyelement-cannot-add', el );
	} );

	describe( '_appendChild', () => {
		it( 'should throw when try to append new child element', () => {
			expectToThrowCKEditorError( () => {
				emptyElement._appendChild( element );
			}, 'view-emptyelement-cannot-add', element );
		} );
	} );

	describe( '_insertChild', () => {
		it( 'should throw when try to insert new child element', () => {
			expectToThrowCKEditorError( () => {
				emptyElement._insertChild( 0, element );
			}, 'view-emptyelement-cannot-add', element );
		} );
	} );

	describe( '_clone()', () => {
		it( 'should be cloned properly', () => {
			const newEmptyElement = emptyElement._clone();

			expect( newEmptyElement.name ).toBe( 'img' );
			expect( newEmptyElement.getAttribute( 'alt' ) ).toBe( 'alternative text' );
			expect( newEmptyElement.getStyle( 'margin-top' ) ).toBe( '2em' );
			expect( newEmptyElement.getStyle( 'color' ) ).toBe( 'white' );
			expect( newEmptyElement.hasClass( 'image' ) ).toBe( true );
			expect( newEmptyElement.hasClass( 'big' ) ).toBe( true );
			expect( newEmptyElement.isSimilar( emptyElement ) ).toBe( true );
		} );
	} );

	describe( 'getFillerOffset', () => {
		it( 'should return null', () => {
			expect( emptyElement.getFillerOffset() ).toBeNull();
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should provide node type, root name, path', () => {
			const emptyElement = new ViewEmptyElement( document, 'span' );
			const paragraph = new ViewElement( document, 'p', null );
			const root = new ViewRootEditableElement( document, 'div' );
			paragraph._appendChild( emptyElement );
			root._appendChild( paragraph );

			const json = JSON.stringify( emptyElement );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				name: 'span',
				path: [ 0, 0 ],
				root: 'main',
				type: 'EmptyElement'
			} );
		} );
	} );
} );
