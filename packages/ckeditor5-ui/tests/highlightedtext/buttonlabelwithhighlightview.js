/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { global } from '@ckeditor/ckeditor5-utils';
import HighlightedTextView from '../../src/highlightedtext/highlightedtextview.js';
import ButtonLabelWithHighlightView from '../../src/highlightedtext/buttonlabelwithhighlightview.js';

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
			expect( view ).to.be.instanceof( HighlightedTextView );
		} );

		it( 'should set initial properties as undefined', () => {
			expect( view.style ).to.equal( undefined );
			expect( view.text ).to.equal( undefined );
			expect( view.id ).to.equal( undefined );
		} );
	} );

	describe( 'default template', () => {
		it( 'should bind view#style to template style', () => {
			view.style = 'color: red';

			expect( view.element.getAttribute( 'style' ) ).to.equal( 'color: red' );

			view.style = 'color: blue';

			expect( view.element.getAttribute( 'style' ) ).to.equal( 'color: blue' );
		} );

		it( 'should bind view#text to template text', () => {
			view.text = 'Test';

			expect( view.element.textContent ).to.equal( 'Test' );

			view.text = undefined;

			expect( view.element.textContent ).to.equal( '' );
		} );

		it( 'should bind view#id to template id', () => {
			view.id = 'test-id';

			expect( view.element.getAttribute( 'id' ) ).to.equal( 'test-id' );

			view.id = 'new-id';

			expect( view.element.getAttribute( 'id' ) ).to.equal( 'new-id' );
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
