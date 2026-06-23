/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { ViewRawElement } from '../../src/view/rawelement.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewDocument } from '../../src/view/document.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { ViewRootEditableElement } from '../../src/index.js';

describe( 'RawElement', () => {
	let rawElement, doc;

	beforeEach( () => {
		doc = new ViewDocument( new StylesProcessor() );

		rawElement = new ViewRawElement( doc, 'span', {
			foo: 'bar',
			style: 'margin-top: 2em;color: white;',
			class: 'foo bar'
		} );
	} );

	describe( 'constructor()', () => {
		it( 'should create instance', () => {
			expect( rawElement.name ).toBe( 'span' );
			expect( rawElement.getAttribute( 'foo' ) ).toBe( 'bar' );
			expect( rawElement.getStyle( 'margin-top' ) ).toBe( '2em' );
			expect( rawElement.getStyle( 'color' ) ).toBe( 'white' );
			expect( rawElement.hasClass( 'foo' ) ).toBe( true );
			expect( rawElement.hasClass( 'bar' ) ).toBe( true );
		} );

		it( 'should throw if child elements are passed to constructor', () => {
			expectToThrowCKEditorError( () => {
				new ViewRawElement( doc, 'img', null, [ new ViewElement( doc, 'i' ) ] ); // eslint-disable-line no-new
			}, 'view-rawelement-cannot-add' );
		} );
	} );

	describe( 'is()', () => {
		let el;

		beforeAll( () => {
			el = new ViewRawElement( new ViewDocument( new StylesProcessor() ), 'span' );
		} );

		it( 'should return true for rawElement/element, also with correct name and element name', () => {
			expect( el.is( 'rawElement' ) ).toBe( true );
			expect( el.is( 'view:rawElement' ) ).toBe( true );
			expect( el.is( 'rawElement', 'span' ) ).toBe( true );
			expect( el.is( 'view:rawElement', 'span' ) ).toBe( true );
			expect( el.is( 'element' ) ).toBe( true );
			expect( el.is( 'view:element' ) ).toBe( true );
			expect( el.is( 'node' ) ).toBe( true );
			expect( el.is( 'view:node' ) ).toBe( true );
			expect( el.is( 'element', 'span' ) ).toBe( true );
			expect( el.is( 'view:element', 'span' ) ).toBe( true );
			expect( el.is( 'span' ) ).toBe( true );
			expect( el.is( 'view:span' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'rawElement', 'p' ) ).toBe( false );
			expect( el.is( 'view:rawElement', 'p' ) ).toBe( false );
			expect( el.is( 'element', 'p' ) ).toBe( false );
			expect( el.is( 'view:element', 'p' ) ).toBe( false );
			expect( el.is( 'p' ) ).toBe( false );
			expect( el.is( 'view:p' ) ).toBe( false );
			expect( el.is( 'text' ) ).toBe( false );
			expect( el.is( 'textProxy' ) ).toBe( false );
			expect( el.is( 'containerElement' ) ).toBe( false );
			expect( el.is( 'attributeElement' ) ).toBe( false );
			expect( el.is( 'emptyElement' ) ).toBe( false );
			expect( el.is( 'rootElement' ) ).toBe( false );
			expect( el.is( 'documentFragment' ) ).toBe( false );
			expect( el.is( 'model:element' ) ).toBe( false );
			expect( el.is( 'model:span' ) ).toBe( false );
			expect( el.is( 'model:node' ) ).toBe( false );
		} );
	} );

	describe( '_appendChild()', () => {
		it( 'should throw when try to append new child element', () => {
			expectToThrowCKEditorError( () => {
				rawElement._appendChild( new ViewElement( doc, 'i' ) );
			}, 'view-rawelement-cannot-add' );
		} );
	} );

	describe( '_insertChild()', () => {
		it( 'should throw when try to insert new child element', () => {
			expectToThrowCKEditorError( () => {
				rawElement._insertChild( 0, new ViewElement( doc, 'i' ) );
			}, 'view-rawelement-cannot-add' );
		} );
	} );

	describe( '_clone()', () => {
		it( 'should be properly cloned', () => {
			const newRawElement = rawElement._clone();

			expect( newRawElement.name ).toBe( 'span' );
			expect( newRawElement.getAttribute( 'foo' ) ).toBe( 'bar' );
			expect( newRawElement.getStyle( 'margin-top' ) ).toBe( '2em' );
			expect( newRawElement.getStyle( 'color' ) ).toBe( 'white' );
			expect( newRawElement.hasClass( 'foo' ) ).toBe( true );
			expect( newRawElement.hasClass( 'bar' ) ).toBe( true );
			expect( newRawElement.isSimilar( rawElement ) ).toBe( true );
		} );
	} );

	describe( 'getFillerOffset()', () => {
		it( 'should return null', () => {
			expect( rawElement.getFillerOffset() ).toBeNull();
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should provide node type, root name, path', () => {
			const rawElement = new ViewRawElement( doc, 'span' );
			const paragraph = new ViewElement( doc, 'p', null );
			const root = new ViewRootEditableElement( doc, 'div' );
			paragraph._appendChild( rawElement );
			root._appendChild( paragraph );

			const json = JSON.stringify( rawElement );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				name: 'span',
				path: [ 0, 0 ],
				root: 'main',
				type: 'RawElement'
			} );
		} );
	} );
} );
