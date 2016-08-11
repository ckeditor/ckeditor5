/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, composer */

import Document from '/ckeditor5/engine/model/document.js';
import deleteContents from '/ckeditor5/engine/model/composer/deletecontents.js';
import { setData, getData } from '/tests/engine/_utils/model.js';

describe( 'Delete utils', () => {
	let document;

	beforeEach( () => {
		document = new Document();
		document.createRoot();

		const schema = document.schema;

		// Note: We used short names instead of "image", "paragraph", etc. to make the tests shorter.
		// We could use any random names in fact, but using HTML tags may explain the tests a bit better.
		schema.registerItem( 'img', '$inline' );
		schema.registerItem( 'p', '$block' );
		schema.registerItem( 'h1', '$block' );
		schema.registerItem( 'pchild' );

		schema.allow( { name: 'pchild', inside: 'p' } );
		schema.allow( { name: '$text', inside: '$root' } );
		schema.allow( { name: 'img', inside: '$root' } );
		schema.allow( { name: '$text', attributes: [ 'bold', 'italic' ] } );
		schema.allow( { name: 'p', attributes: [ 'align' ] } );
	} );

	describe( 'deleteContents', () => {
		describe( 'in simple scenarios', () => {
			test(
				'does nothing on collapsed selection',
				'f[]oo',
				'f[]oo'
			);

			test(
				'deletes single character',
				'f[o]o',
				'f[]o'
			);

			it( 'deletes single character (backward selection)' , () => {
				setData( document, 'f[o]o', { lastRangeBackward: true } );

				deleteContents( document.batch(), document.selection );

				expect( getData( document ) ).to.equal( 'f[]o' );
			} );

			test(
				'deletes whole text',
				'[foo]',
				'[]'
			);

			test(
				'deletes whole text between nodes',
				'<img></img>[foo]<img></img>',
				'<img></img>[]<img></img>'
			);

			test(
				'deletes an element',
				'x[<img></img>]y',
				'x[]y'
			);

			test(
				'deletes a bunch of nodes',
				'w[x<img></img>y]z',
				'w[]z'
			);

			test(
				'does not break things when option.merge passed',
				'w[x<img></img>y]z',
				'w[]z',
				{ merge: true }
			);
		} );

		describe( 'with text attributes', () => {
			it( 'deletes characters (first half has attrs)', () => {
				setData( document, '<$text bold="true">fo[o</$text>b]ar', { selectionAttributes: {
					bold: true
				} } );

				deleteContents( document.batch(), document.selection );

				expect( getData( document ) ).to.equal( '<$text bold="true">fo[]</$text>ar' );
				expect( document.selection.getAttribute( 'bold' ) ).to.equal( true );
			} );

			it( 'deletes characters (2nd half has attrs)', () => {
				setData( document, 'fo[o<$text bold="true">b]ar</$text>', { selectionAttributes: {
					bold: true
				} } );

				deleteContents( document.batch(), document.selection );

				expect( getData( document ) ).to.equal( 'fo[]<$text bold="true">ar</$text>' );
				expect( document.selection.getAttribute( 'bold' ) ).to.undefined;
			} );

			it( 'clears selection attrs when emptied content', () => {
				setData( document, '<p>x</p><p>[<$text bold="true">foo</$text>]</p><p>y</p>', { selectionAttributes: {
					bold: true
				} } );

				deleteContents( document.batch(), document.selection );

				expect( getData( document ) ).to.equal( '<p>x</p><p>[]</p><p>y</p>' );
				expect( document.selection.getAttribute( 'bold' ) ).to.undefined;
			} );

			it( 'leaves selection attributes when text contains them', () => {
				setData( document, '<p>x<$text bold="true">a[foo]b</$text>y</p>', { selectionAttributes: {
					bold: true
				} } );

				deleteContents( document.batch(), document.selection );

				expect( getData( document ) ).to.equal( '<p>x<$text bold="true">a[]b</$text>y</p>' );
				expect( document.selection.getAttribute( 'bold' ) ).to.equal( true );
			} );
		} );

		// Note: The algorithm does not care what kind of it's merging as it knows nothing useful about these elements.
		// In most cases it handles all elements like you'd expect to handle block elements in HTML. However,
		// in some scenarios where the tree depth is bigger results may be hard to justify. In fact, such cases
		// should not happen unless we're talking about lists or tables, but these features will need to cover
		// their scenarios themselves. In all generic scenarios elements are never nested.
		//
		// You may also be thinking – but I don't want my elements to be merged. It means that there are some special rules,
		// like – multiple editing hosts (cE=true/false in use) or block limit elements like <td>.
		// Those case should, again, be handled by their specific implementations.
		describe( 'in multi-element scenarios', () => {
			test(
				'do not merge when no need to',
				'<p>x</p><p>[foo]</p><p>y</p>',
				'<p>x</p><p>[]</p><p>y</p>',
				{ merge: true }
			);

			test(
				'merges second element into the first one (same name)',
				'<p>x</p><p>fo[o</p><p>b]ar</p><p>y</p>',
				'<p>x</p><p>fo[]ar</p><p>y</p>',
				{ merge: true }
			);

			test(
				'does not merge second element into the first one (same name, !option.merge)',
				'<p>x</p><p>fo[o</p><p>b]ar</p><p>y</p>',
				'<p>x</p><p>fo[]</p><p>ar</p><p>y</p>'
			);

			test(
				'merges second element into the first one (same name)',
				'<p>x</p><p>fo[o</p><p>b]ar</p><p>y</p>',
				'<p>x</p><p>fo[]ar</p><p>y</p>',
				{ merge: true }
			);

			test(
				'merges second element into the first one (different name)',
				'<p>x</p><h1>fo[o</h1><p>b]ar</p><p>y</p>',
				'<p>x</p><h1>fo[]ar</h1><p>y</p>',
				{ merge: true }
			);

			it( 'merges second element into the first one (different name, backward selection)', () => {
				setData( document, '<p>x</p><h1>fo[o</h1><p>b]ar</p><p>y</p>', { lastRangeBackward: true } );

				deleteContents( document.batch(), document.selection, { merge: true } );

				expect( getData( document ) ).to.equal( '<p>x</p><h1>fo[]ar</h1><p>y</p>' );
			} );

			test(
				'merges second element into the first one (different attrs)',
				'<p>x</p><p align="l">fo[o</p><p>b]ar</p><p>y</p>',
				'<p>x</p><p align="l">fo[]ar</p><p>y</p>',
				{ merge: true }
			);

			test(
				'merges second element to an empty first element',
				'<p>x</p><h1>[</h1><p>fo]o</p><p>y</p>',
				'<p>x</p><h1>[]o</h1><p>y</p>',
				{ merge: true }
			);

			test(
				'merges elements when deep nested',
				'<p>x<pchild>fo[o</pchild></p><p><pchild>b]ar</pchild>y</p>',
				'<p>x<pchild>fo[]ar</pchild>y</p>',
				{ merge: true }
			);

			// For code coverage reasons.
			test(
				'merges element when selection is in two consecutive nodes even when it is empty',
				'<p>foo[</p><p>]bar</p>',
				'<p>foo[]bar</p>',
				{ merge: true }
			);

			// If you disagree with this case please read the notes before this section.
			test(
				'merges elements when left end deep nested',
				'<p>x<pchild>fo[o</pchild></p><p>b]ary</p>',
				'<p>x<pchild>fo[]</pchild>ary</p>',
				{ merge: true }
			);

			// If you disagree with this case please read the notes before this section.
			test(
				'merges elements when right end deep nested',
				'<p>xfo[o</p><p><pchild>b]ar</pchild>y<img></img></p>',
				'<p>xfo[]<pchild>ar</pchild>y<img></img></p>',
				{ merge: true }
			);

			test(
				'merges elements when more content in the right branch',
				'<p>xfo[o</p><p>b]a<pchild>r</pchild>y</p>',
				'<p>xfo[]a<pchild>r</pchild>y</p>',
				{ merge: true }
			);

			test(
				'leaves just one element when all selected',
				'<h1>[x</h1><p>foo</p><p>y]</p>',
				'<h1>[]</h1>',
				{ merge: true }
			);
		} );

		function test( title, input, output, options ) {
			it( title, () => {
				setData( document, input );

				deleteContents( document.batch(), document.selection, options );

				expect( getData( document ) ).to.equal( output );
			} );
		}
	} );
} );
