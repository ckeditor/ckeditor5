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
		schema.allow( { name: '$text', attributes: [ 'bold', 'italic' ] } );
		schema.allow( { name: 'p', attributes: [ 'align' ] } );
	} );

	describe( 'deleteContents', () => {
		describe( 'in simple scenarios', () => {
			test(
				'does nothing on collapsed selection',
				'f<selection />oo',
				'f<selection />oo'
			);

			test(
				'deletes single character',
				'f<selection>o</selection>o',
				'f<selection />o'
			);

			test(
				'xdeletes single character (backward selection)',
				'f<selection backward>o</selection>o',
				'f<selection />o'
			);

			test(
				'deletes whole text',
				'<selection>foo</selection>',
				'<selection />'
			);

			test(
				'deletes whole text between nodes',
				'<img></img><selection>foo</selection><img></img>',
				'<img></img><selection /><img></img>'
			);

			test(
				'deletes an element',
				'x<selection><img></img></selection>y',
				'x<selection />y'
			);

			test(
				'deletes a bunch of nodes',
				'w<selection>x<img></img>y</selection>z',
				'w<selection />z'
			);

			test(
				'does not break things when option.merge passed',
				'w<selection>x<img></img>y</selection>z',
				'w<selection />z',
				{ merge: true }
			);
		} );

		describe( 'with text attributes', () => {
			test(
				'deletes characters (first half has attrs)',
				'<$text bold=true>fo<selection bold=true>o</$text>b</selection>ar',
				'<$text bold=true>fo</$text><selection bold=true />ar'
			);

			test(
				'deletes characters (2nd half has attrs)',
				'fo<selection bold=true>o<$text bold=true>b</selection>ar</$text>',
				'fo<selection /><$text bold=true>ar</$text>'
			);

			test(
				'clears selection attrs when emptied content',
				'<p>x</p><p><selection bold=true><$text bold=true>foo</$text></selection></p><p>y</p>',
				'<p>x</p><p><selection /></p><p>y</p>'
			);

			test(
				'leaves selection attributes when text contains them',
				'<p>x<$text bold=true>a<selection bold=true>foo</selection>b</$text>y</p>',
				'<p>x<$text bold=true>a<selection bold=true />b</$text>y</p>'
			);
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
				'<p>x</p><p><selection>foo</selection></p><p>y</p>',
				'<p>x</p><p><selection /></p><p>y</p>',
				{ merge: true }
			);

			test(
				'merges second element into the first one (same name)',
				'<p>x</p><p>fo<selection>o</p><p>b</selection>ar</p><p>y</p>',
				'<p>x</p><p>fo<selection />ar</p><p>y</p>',
				{ merge: true }
			);

			test(
				'does not merge second element into the first one (same name, !option.merge)',
				'<p>x</p><p>fo<selection>o</p><p>b</selection>ar</p><p>y</p>',
				'<p>x</p><p>fo<selection /></p><p>ar</p><p>y</p>'
			);

			test(
				'merges second element into the first one (same name)',
				'<p>x</p><p>fo<selection>o</p><p>b</selection>ar</p><p>y</p>',
				'<p>x</p><p>fo<selection />ar</p><p>y</p>',
				{ merge: true }
			);

			test(
				'merges second element into the first one (different name)',
				'<p>x</p><h1>fo<selection>o</h1><p>b</selection>ar</p><p>y</p>',
				'<p>x</p><h1>fo<selection />ar</h1><p>y</p>',
				{ merge: true }
			);

			test(
				'merges second element into the first one (different name, backward selection)',
				'<p>x</p><h1>fo<selection backward>o</h1><p>b</selection>ar</p><p>y</p>',
				'<p>x</p><h1>fo<selection />ar</h1><p>y</p>',
				{ merge: true }
			);

			test(
				'merges second element into the first one (different attrs)',
				'<p>x</p><p align="l">fo<selection>o</p><p>b</selection>ar</p><p>y</p>',
				'<p>x</p><p align="l">fo<selection />ar</p><p>y</p>',
				{ merge: true }
			);

			test(
				'merges second element to an empty first element',
				'<p>x</p><h1><selection></h1><p>fo</selection>o</p><p>y</p>',
				'<p>x</p><h1><selection />o</h1><p>y</p>',
				{ merge: true }
			);

			test(
				'merges elements when deep nested',
				'<p>x<pchild>fo<selection>o</pchild></p><p><pchild>b</selection>ar</pchild>y</p>',
				'<p>x<pchild>fo<selection />ar</pchild>y</p>',
				{ merge: true }
			);

			// For code coverage reasons.
			test(
				'merges element when selection is in two consecutive nodes even when it is empty',
				'<p>foo<selection></p><p></selection>bar</p>',
				'<p>foo<selection />bar</p>',
				{ merge: true }
			);

			// If you disagree with this case please read the notes before this section.
			test(
				'merges elements when left end deep nested',
				'<p>x<pchild>fo<selection>o</pchild></p><p>b</selection>ary</p>',
				'<p>x<pchild>fo<selection /></pchild>ary</p>',
				{ merge: true }
			);

			// If you disagree with this case please read the notes before this section.
			test(
				'merges elements when right end deep nested',
				'<p>xfo<selection>o</p><p><pchild>b</selection>ar</pchild>y<img></img></p>',
				'<p>xfo<selection /><pchild>ar</pchild>y<img></img></p>',
				{ merge: true }
			);

			test(
				'merges elements when more content in the right branch',
				'<p>xfo<selection>o</p><p>b</selection>a<pchild>r</pchild>y</p>',
				'<p>xfo<selection />a<pchild>r</pchild>y</p>',
				{ merge: true }
			);

			test(
				'leaves just one element when all selected',
				'<h1><selection>x</h1><p>foo</p><p>y</selection></p>',
				'<h1><selection /></h1>',
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
