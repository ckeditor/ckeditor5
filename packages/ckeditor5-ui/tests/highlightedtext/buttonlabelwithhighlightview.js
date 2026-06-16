/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { global } from '@ckeditor/ckeditor5-utils';
import { HighlightedTextView } from '../../src/highlightedtext/highlightedtextview.js';
import { ButtonLabelWithHighlightView } from '../../src/highlightedtext/buttonlabelwithhighlightview.js';

describe( 'ButtonLabelWithHighlightView', () => {
	let view;

	beforeEach( () => {
		view = new ButtonLabelWithHighlightView( );
		view.render();

		global.document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should be HighlightedTextView instance', () => {
			expect( view ).toBeInstanceOf( HighlightedTextView );
		} );

		it( 'should set initial properties as undefined', () => {
			expect( view.style ).toBeUndefined();
			expect( view.text ).toBeUndefined();
			expect( view.id ).toBeUndefined();
		} );
	} );

	describe( 'default template', () => {
		it( 'should bind view#style to template style', () => {
			view.style = 'color: red';

			expect( view.element.getAttribute( 'style' ) ).toBe( 'color: red' );

			view.style = 'color: blue';

			expect( view.element.getAttribute( 'style' ) ).toBe( 'color: blue' );
		} );

		it( 'should bind view#text to template text', () => {
			view.text = 'Test';

			expect( view.element.textContent ).toBe( 'Test' );

			view.text = undefined;

			expect( view.element.textContent ).toBe( '' );
		} );

		it( 'should bind view#id to template id', () => {
			view.id = 'test-id';

			expect( view.element.getAttribute( 'id' ) ).toBe( 'test-id' );

			view.id = 'new-id';

			expect( view.element.getAttribute( 'id' ) ).toBe( 'new-id' );
		} );
	} );

	describe( 'Highlighting template text', () => {
		beforeEach( () => {
			view.text = 'Example text';
		} );

		it( 'should not highlight anything when no query is specified', () => {
			view.highlightText( null );

			expect( view.element.innerHTML ).toBe( 'Example text' );
		} );

		it( 'should highlight the query', () => {
			view.highlightText( new RegExp( /text/, 'ig' ) );

			expect( view.element.innerHTML ).toBe( 'Example <mark>text</mark>' );
		} );

		it( 'should highlight multiple occurences of the query', () => {
			view.highlightText( new RegExp( /e/, 'ig' ) );

			expect( view.element.innerHTML ).toBe(
				'<mark>E</mark>xampl<mark>e</mark> t<mark>e</mark>xt'
			);
		} );
	} );
} );
