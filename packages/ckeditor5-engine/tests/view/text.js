/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ViewNode } from '../../src/view/node.js';
import { ViewText } from '../../src/view/text.js';
import { ViewDocument } from '../../src/view/document.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { ViewContainerElement, ViewRootEditableElement } from '../../src/index.js';

describe( 'Text', () => {
	let document;

	beforeEach( () => {
		document = new ViewDocument( new StylesProcessor() );
	} );

	describe( 'constructor()', () => {
		it( 'should create element without attributes', () => {
			const text = new ViewText( document, 'foo' );

			expect( text ).toBeInstanceOf( ViewNode );
			expect( text.data ).toBe( 'foo' );
			expect( text.parent ).toBeNull();
		} );
	} );

	describe( 'is()', () => {
		let text;

		beforeEach( () => {
			text = new ViewText( document, 'foo' );
		} );

		it( 'should return true for node, text', () => {
			expect( text.is( 'node' ) ).toBe( true );
			expect( text.is( 'view:node' ) ).toBe( true );
			expect( text.is( '$text' ) ).toBe( true );
			expect( text.is( 'view:$text' ) ).toBe( true );
			expect( text.is( 'text' ) ).toBe( true );
			expect( text.is( 'view:text' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( text.is( '$textProxy' ) ).toBe( false );
			expect( text.is( 'view:$textProxy' ) ).toBe( false );
			expect( text.is( 'element' ) ).toBe( false );
			expect( text.is( 'view:element' ) ).toBe( false );
			expect( text.is( 'containerElement' ) ).toBe( false );
			expect( text.is( 'attributeElement' ) ).toBe( false );
			expect( text.is( 'uiElement' ) ).toBe( false );
			expect( text.is( 'emptyElement' ) ).toBe( false );
			expect( text.is( 'rootElement' ) ).toBe( false );
			expect( text.is( 'documentFragment' ) ).toBe( false );
			expect( text.is( 'model:$text' ) ).toBe( false );
			expect( text.is( 'model:node' ) ).toBe( false );
		} );
	} );

	describe( '_clone()', () => {
		it( 'should return new text with same data', () => {
			const text = new ViewText( document, 'foo bar' );
			const clone = text._clone();

			expect( clone ).not.toBe( text );
			expect( clone.data ).toBe( text.data );
		} );
	} );

	describe( 'isSimilar', () => {
		const text = new ViewText( document, 'foo' );

		it( 'should return false when comparing to non-text', () => {
			expect( text.isSimilar( null ) ).toBe( false );
			expect( text.isSimilar( {} ) ).toBe( false );
		} );

		it( 'should return true when the same text node is provided', () => {
			expect( text.isSimilar( text ) ).toBe( true );
		} );

		it( 'should return true when data is the same', () => {
			const other = new ViewText( document, 'foo' );

			expect( text.isSimilar( other ) ).toBe( true );
		} );

		it( 'should return false when data is not the same', () => {
			const other = text._clone();
			other._data = 'not-foo';

			expect( text.isSimilar( other ) ).toBe( false );
		} );
	} );

	describe( 'setText', () => {
		it( 'should change the text', () => {
			const text = new ViewText( document, 'foo' );
			text._data = 'bar';

			expect( text.data ).toBe( 'bar' );
		} );

		it( 'works when using addition assignment operator (+=)', () => {
			const foo = new ViewText( document, 'foo' );
			const bar = new ViewText( document, 'bar' );

			foo._data += bar.data;
			expect( foo.data ).toBe( 'foobar' );
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should provide node type, root name, path, text data', () => {
			const text = new ViewText( document, 'foo' );
			const paragraph = new ViewContainerElement( document, 'p', null );
			const root = new ViewRootEditableElement( document, 'div' );
			paragraph._appendChild( text );
			root._appendChild( paragraph );

			const json = JSON.stringify( text );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				data: 'foo',
				path: [ 0, 0 ],
				root: 'main',
				type: 'Text'
			} );
		} );
	} );
} );
