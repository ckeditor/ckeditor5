/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, composer */

import Document from '/ckeditor5/engine/model/document.js';
import Selection from '/ckeditor5/engine/model/selection.js';
import modifySelection from '/ckeditor5/engine/model/composer/modifyselection.js';
import { setData, stringify } from '/tests/engine/_utils/model.js';

describe( 'Delete utils', () => {
	let document;

	beforeEach( () => {
		document = new Document();
		document.schema.registerItem( 'p', '$block' );
		document.createRoot();
	} );

	describe( 'modifySelection', () => {
		describe( 'unit=character', () => {
			describe( 'within element', () => {
				test(
					'does nothing on empty content',
					'<selection />',
					'<selection />'
				);

				test(
					'does nothing on empty content (with empty element)',
					'<p><selection /></p>',
					'<p><selection /></p>'
				);

				test(
					'does nothing on empty content (backward)',
					'<selection />',
					'<selection />',
					{ direction: 'backward' }
				);

				test(
					'does nothing on root boundary',
					'<p>foo<selection /></p>',
					'<p>foo<selection /></p>'
				);

				test(
					'does nothing on root boundary (backward)',
					'<p><selection />foo</p>',
					'<p><selection />foo</p>',
					{ direction: 'backward' }
				);

				test(
					'extends one character forward',
					'<p>f<selection />oo</p>',
					'<p>f<selection>o</selection>o</p>'
				);

				test(
					'extends one character backward',
					'<p>fo<selection />o</p>',
					'<p>f<selection backward>o</selection>o</p>',
					{ direction: 'backward' }
				);

				test(
					'extends one character forward (non-collapsed)',
					'<p>f<selection>o</selection>obar</p>',
					'<p>f<selection>oo</selection>bar</p>'
				);

				test(
					'extends one character backward (non-collapsed)',
					'<p>foob<selection backward>a</selection>r</p>',
					'<p>foo<selection backward>ba</selection>r</p>',
					{ direction: 'backward' }
				);

				test(
					'extends to element boundary',
					'<p>fo<selection />o</p>',
					'<p>fo<selection>o</selection></p>'
				);

				test(
					'extends to element boundary (backward)',
					'<p>f<selection />oo</p>',
					'<p><selection backward>f</selection>oo</p>',
					{ direction: 'backward' }
				);

				test(
					'shrinks forward selection (to collapsed)',
					'<p>foo<selection>b</selection>ar</p>',
					'<p>foo<selection />bar</p>',
					{ direction: 'backward' }
				);

				test(
					'shrinks backward selection (to collapsed)',
					'<p>foo<selection backward>b</selection>ar</p>',
					'<p>foob<selection />ar</p>'
				);

				test(
					'extends one element forward',
					'<p>f<selection /><img></img>oo</p>',
					'<p>f<selection><img></img></selection>oo</p>'
				);

				test(
					'extends one non-empty element forward',
					'<p>f<selection /><img>x</img>oo</p>',
					'<p>f<selection><img>x</img></selection>oo</p>'
				);

				test(
					'extends one element backward',
					'<p>fo<img></img><selection />o</p>',
					'<p>fo<selection backward><img></img></selection>o</p>',
					{ direction: 'backward' }
				);

				test(
					'unicode support - combining mark forward',
					'<p>foo<selection />b̂ar</p>',
					'<p>foo<selection>b̂</selection>ar</p>'
				);

				test(
					'unicode support - combining mark backward',
					'<p>foob̂<selection />ar</p>',
					'<p>foo<selection backward>b̂</selection>ar</p>',
					{ direction: 'backward' }
				);

				test(
					'unicode support - combining mark multiple',
					'<p>fo<selection />o̻̐ͩbar</p>',
					'<p>fo<selection>o̻̐ͩ</selection>bar</p>'
				);

				test(
					'unicode support - combining mark multiple backward',
					'<p>foo̻̐ͩ<selection />bar</p>',
					'<p>fo<selection backward>o̻̐ͩ</selection>bar</p>',
					{ direction: 'backward' }
				);

				test(
					'unicode support - combining mark to the end',
					'<p>fo<selection />o̻̐ͩ</p>',
					'<p>fo<selection>o̻̐ͩ</selection></p>'
				);

				test(
					'unicode support - surrogate pairs forward',
					'<p><selection />\uD83D\uDCA9</p>',
					'<p><selection>\uD83D\uDCA9</selection></p>'
				);

				test(
					'unicode support - surrogate pairs backward',
					'<p>\uD83D\uDCA9<selection /></p>',
					'<p><selection backward>\uD83D\uDCA9</selection></p>',
					{ direction: 'backward' }
				);
			} );

			describe( 'beyond element', () => {
				test(
					'extends over boundary of empty elements',
					'<p><selection /></p><p></p><p></p>',
					'<p><selection></p><p></selection></p><p></p>'
				);

				test(
					'extends over boundary of empty elements (backward)',
					'<p></p><p></p><p><selection /></p>',
					'<p></p><p><selection backward></p><p></selection></p>',
					{ direction: 'backward' }
				);

				test(
					'extends over boundary of non-empty elements',
					'<p>a<selection /></p><p>bcd</p>',
					'<p>a<selection></p><p></selection>bcd</p>'
				);

				test(
					'extends over boundary of non-empty elements (backward)',
					'<p>a</p><p><selection />bcd</p>',
					'<p>a<selection backward></p><p></selection>bcd</p>',
					{ direction: 'backward' }
				);

				test(
					'extends over character after boundary',
					'<p>a<selection></p><p></selection>bcd</p>',
					'<p>a<selection></p><p>b</selection>cd</p>'
				);

				test(
					'extends over character after boundary (backward)',
					'<p>abc<selection backward></p><p></selection>d</p>',
					'<p>ab<selection backward>c</p><p></selection>d</p>',
					{ direction: 'backward' }
				);

				test(
					'extends over boundary when next element has nested elements',
					'<p>a<selection /></p><p><x>bcd</x></p>',
					'<p>a<selection></p><p></selection><x>bcd</x></p>'
				);

				test(
					'extends over element when next element has nested elements',
					'<p>a<selection></p><p></selection><x>bcd</x>ef</p>',
					'<p>a<selection></p><p><x>bcd</x></selection>ef</p>'
				);

				test(
					'extends over element when next node is a text',
					'<p>a<selection /></p>bc',
					'<p>a<selection></p></selection>bc'
				);

				test(
					'extends over element when next node is a text (backward)',
					'ab<p><selection />c</p>',
					'ab<selection backward><p></selection>c</p>',
					{ direction: 'backward' }
				);

				test(
					'shrinks over boundary of empty elements',
					'<p><selection backward></p><p></selection></p>',
					'<p></p><p><selection /></p>'
				);

				test(
					'shrinks over boundary of empty elements (backward)',
					'<p><selection></p><p></selection></p>',
					'<p><selection /></p><p></p>',
					{ direction: 'backward' }
				);

				test(
					'shrinks over boundary of non-empty elements',
					'<p>a<selection backward></p><p></selection>b</p>',
					'<p>a</p><p><selection />b</p>'
				);

				test(
					'shrinks over boundary of non-empty elements (backward)',
					'<p>a<selection></p><p></selection>b</p>',
					'<p>a<selection /></p><p>b</p>',
					{ direction: 'backward' }
				);
			} );
		} );

		describe( 'unit=codePoint', () => {
			test(
				'does nothing on empty content',
				'<selection />',
				'<selection />',
				{ unit: 'codePoint' }
			);

			test(
				'does nothing on empty content (with empty element)',
				'<p><selection /></p>',
				'<p><selection /></p>',
				{ unit: 'codePoint' }
			);

			test(
				'extends one user-perceived character forward - latin letters',
				'<p>f<selection />oo</p>',
				'<p>f<selection>o</selection>o</p>',
				{ unit: 'codePoint' }
			);

			test(
				'extends one user-perceived character backward - latin letters',
				'<p>fo<selection />o</p>',
				'<p>f<selection backward>o</selection>o</p>',
				{ unit: 'codePoint', direction: 'backward' }
			);

			test(
				'unicode support - combining mark forward',
				'<p>foo<selection />b̂ar</p>',
				'<p>foo<selection>b</selection>̂ar</p>',
				{ unit: 'codePoint' }
			);

			test(
				'unicode support - combining mark backward',
				'<p>foob̂<selection />ar</p>',
				'<p>foob<selection backward>̂</selection>ar</p>',
				{ unit: 'codePoint', direction: 'backward' }
			);

			test(
				'unicode support - combining mark multiple',
				'<p>fo<selection />o̻̐ͩbar</p>',
				'<p>fo<selection>o</selection>̻̐ͩbar</p>',
				{ unit: 'codePoint' }
			);

			test(
				'unicode support - surrogate pairs forward',
				'<p><selection />\uD83D\uDCA9</p>',
				'<p><selection>\uD83D\uDCA9</selection></p>',
				{ unit: 'codePoint' }
			);

			test(
				'unicode support surrogate pairs backward',
				'<p>\uD83D\uDCA9<selection /></p>',
				'<p><selection backward>\uD83D\uDCA9</selection></p>',
				{ unit: 'codePoint', direction: 'backward' }
			);
		} );
	} );

	function test( title, input, output, options ) {
		it( title, () => {
			input = input.normalize();
			output = output.normalize();

			setData( document, input );

			// Creating new instance of selection instead of operation on engine.model.Document#selection.
			// Document's selection will throw errors in some test cases (which are correct cases, but only for
			// non-document selections).
			const testSelection = Selection.createFromSelection( document.selection );
			modifySelection( testSelection, options );

			expect( stringify( document.getRoot(), testSelection ) ).to.equal( output );
		} );
	}
} );
