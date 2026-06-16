/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HighlightedTextView } from '@ckeditor/ckeditor5-ui';
import { global } from '@ckeditor/ckeditor5-utils';

describe( 'TemplateListButtonView', () => {
	let view;

	beforeEach( () => {
		view = new HighlightedTextView();
		view.render();

		global.document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create a DOM element with CSS classes', () => {
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-highlighted-text' ) ).toBe( true );
		} );

		it( 'should create observable #text property', () => {
			expect( view.text ).toBeUndefined();
		} );

		it( 'should bind #text property to DOM', () => {
			expect( view.element.innerHTML ).toBe( '' );

			view.text = 'foo';

			expect( view.element.innerHTML ).toBe( 'foo' );
		} );

		it( 'should handle text escaping directly', () => {
			view.text = 'Foo <bar> bar &amp; qux';

			expect( view.element.innerHTML ).toBe( 'Foo &lt;bar&gt; bar &amp;amp; qux' );
			expect( view.element.textContent ).toBe( 'Foo <bar> bar &amp; qux' );
		} );
	} );

	describe( 'highlightText()', () => {
		beforeEach( () => {
			view.text = 'Example text with formatting';
		} );

		it( 'should not highlight anything when no query is specified', () => {
			view.highlightText( null );

			expect( view.element.innerHTML ).toBe( 'Example text with formatting' );
		} );

		it( 'should highlight the query', () => {
			view.highlightText( new RegExp( /text/, 'ig' ) );

			expect( view.element.innerHTML ).toBe( 'Example <mark>text</mark> with formatting' );
		} );

		it( 'should highlight multiple occurences of the query', () => {
			view.highlightText( new RegExp( /e/, 'ig' ) );

			expect( view.element.innerHTML ).toBe(
				'<mark>E</mark>xampl<mark>e</mark> t<mark>e</mark>xt with formatting'
			);
		} );

		it( 'should escape text correctly', () => {
			view.text = 'Foo <bar> bar &amp; qux';

			view.highlightText( new RegExp( /a/, 'ig' ) );

			expect( view.element.innerHTML ).toBe(
				'Foo &lt;b<mark>a</mark>r&gt; b<mark>a</mark>r &amp;<mark>a</mark>mp; qux'
			);
		} );

		it( 'should not apply after changing #text', () => {
			view.highlightText( new RegExp( /text/, 'ig' ) );

			expect( view.element.innerHTML ).toBe( 'Example <mark>text</mark> with formatting' );

			view.text = 'New text';

			expect( view.element.innerHTML ).toBe( 'New text' );
		} );

		it( 'should work if there is no text in the view', () => {
			view.text = '';

			view.highlightText( new RegExp( /text/, 'ig' ) );

			expect( view.element.innerHTML ).toBe( '' );
		} );
	} );
} );
