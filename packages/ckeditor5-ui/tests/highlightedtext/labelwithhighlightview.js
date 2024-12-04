/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { global } from '@ckeditor/ckeditor5-utils';
import HighlightedTextView from '../../src/highlightedtext/highlightedtextview.js';
import LabelWithHighlightView from '../../src/highlightedtext/labelwithhighlightview.js';

describe( 'LabelWithHighlightView', () => {
	let view;

	beforeEach( () => {
		view = new LabelWithHighlightView( );
		view.render();

		global.document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should be HighlightedTextView instance', () => {
			expect( view ).to.be.instanceof( HighlightedTextView );
		} );

		it( 'should set initial properties', () => {
			expect( view.text ).to.equal( undefined );
			expect( view.for ).to.equal( undefined );
			expect( view.id ).to.match( /^ck-editor__label_.+/g );
		} );
	} );

	describe( 'default template', () => {
		it( 'should define element name and CSS classes', () => {
			expect( view.element.tagName ).to.equal( 'SPAN' );
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-label' ) ).to.be.true;
		} );

		it( 'should bind view#text to template text', () => {
			view.text = 'Test';

			expect( view.element.textContent ).to.equal( 'Test' );

			view.text = undefined;

			expect( view.element.textContent ).to.equal( '' );
		} );

		describe( 'for attribute', () => {
			it( 'should react on view#for', () => {
				view.for = 'bar';

				expect( view.element.getAttribute( 'for' ) ).to.equal( 'bar' );

				view.for = 'baz';

				expect( view.element.getAttribute( 'for' ) ).to.equal( 'baz' );
			} );
		} );

		it( 'should set view#id to template id', () => {
			expect( view.element.id ).to.equal( view.id );
			expect( view.element.id ).to.match( /^ck-editor__label_.+/ );
		} );
	} );

	describe( 'Highlighting template text', () => {
		beforeEach( () => {
			view.text = 'Example text';
		} );

		it( 'should not highlight anything when no query is specified', () => {
			view.highlightText( null );

			expect( view.element.innerHTML ).to.equal( 'Example text' );
		} );

		it( 'should highlight the query', () => {
			view.highlightText( new RegExp( /text/, 'ig' ) );

			expect( view.element.innerHTML ).to.equal( 'Example <mark>text</mark>' );
		} );

		it( 'should highlight multiple occurences of the query', () => {
			view.highlightText( new RegExp( /e/, 'ig' ) );

			expect( view.element.innerHTML ).to.equal(
				'<mark>E</mark>xampl<mark>e</mark> t<mark>e</mark>xt'
			);
		} );
	} );
} );
