/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import MarkdownDataProcessor from '/ckeditor5/markdown-gfm/gfmdataprocessor.js';
import DocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'GFMDataProcessor', () => {
	let dataProcessor;

	beforeEach( () => {
		dataProcessor = new MarkdownDataProcessor();
	} );

	describe( 'paragraphs', () => {
		describe( 'toView', () => {
			it( 'single line', () => {
				const viewFragment = dataProcessor.toView( 'single line paragraph' );

				expect( stringify( viewFragment ) ).to.equal( '<p>single line paragraph</p>' );
			} );

			it( 'multiline', () => {
				const viewFragment = dataProcessor.toView( 'first\nsecond\nthird' );

				expect( stringify( viewFragment ) ).to.equal( '<p>first<br></br>second<br></br>third</p>' );
			} );

			it( 'with header after #1', () => {
				const viewFragment = dataProcessor.toView( 'single line\n# header' );

				expect( stringify( viewFragment ) ).to.equal( '<p>single line</p><h1 id="header">header</h1>' );
			} );

			it( 'with header after #2', () => {
				const viewFragment = dataProcessor.toView( 'single line\nheader\n===' );

				expect( stringify( viewFragment ) ).to.equal( '<p>single line</p><h1 id="header">header</h1>' );
			} );

			it( 'with blockquote after', () => {
				const viewFragment = dataProcessor.toView( 'single line\n> quote' );

				expect( stringify( viewFragment ) ).to.equal( '<p>single line</p><blockquote><p>quote</p></blockquote>' );
			} );

			it( 'with list after', () => {
				const viewFragment = dataProcessor.toView( 'single line\n* item' );

				expect( stringify( viewFragment ) ).to.equal( '<p>single line</p><ul><li>item</li></ul>' );
			} );

			it( 'with div element after', () => {
				const viewFragment = dataProcessor.toView( 'single line\n<div>div element</div>' );

				expect( stringify( viewFragment ) ).to.equal( '<p>single line</p><div>div element</div>' );
			} );
		} );

		describe( 'toData', () => {
			let viewFragment;

			beforeEach( () => {
				viewFragment = new DocumentFragment();
			} );

			it( 'should process single line paragraph', () => {
				viewFragment.appendChildren( parse( '<p>single line paragraph</p>' ) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( 'single line paragraph' );
			} );

			it( 'should process multi line paragraph', () => {
				viewFragment.appendChildren( parse( '<p>first<br></br>second<br></br>third</p>' ) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( 'first\nsecond\nthird' );
			} );

			it( 'should process multi line paragraph with header after it', () => {
				viewFragment.appendChildren( parse( '<p>single line</p><h1 id="header">header</h1>' ) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal( 'single line\n\n# header' );
			} );

			it( 'should process multi line paragraph with blockquote after it', () => {
				viewFragment.appendChildren( parse( '<p>single line</p><blockquote><p>quote</p></blockquote>' ) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal(
					'single line\n\n' +
					'> quote'
				);
			} );

			it( 'should process paragraph with list after', () => {
				viewFragment.appendChildren( parse( '<p>single line</p><ul><li>item</li></ul>' ) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal(
					'single line\n\n' +
					'*   item'
				);
			} );

			it( 'should process paragraph with div after', () => {
				viewFragment.appendChildren( parse( '<p>single line</p><div>div element</div>' ) );

				expect( dataProcessor.toData( viewFragment ) ).to.equal(
					'single line\n\n' +
					'<div>div element</div>'
				);
			} );
		} );
	} );
} );
