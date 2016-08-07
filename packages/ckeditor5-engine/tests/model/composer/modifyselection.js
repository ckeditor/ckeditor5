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
		document.schema.registerItem( 'x', '$block' );
		document.schema.registerItem( 'img', '$inline' );
		document.schema.allow( { name: '$text', inside: '$root' } );
		document.createRoot();
	} );

	describe( 'modifySelection', () => {
		describe( 'unit=character', () => {
			describe( 'within element', () => {
				test(
					'does nothing on empty content',
					'[]',
					'[]'
				);

				test(
					'does nothing on empty content (with empty element)',
					'<p>[]</p>',
					'<p>[]</p>'
				);

				test(
					'does nothing on empty content (backward)',
					'[]',
					'[]',
					{ direction: 'backward' }
				);

				test(
					'does nothing on root boundary',
					'<p>foo[]</p>',
					'<p>foo[]</p>'
				);

				test(
					'does nothing on root boundary (backward)',
					'<p>[]foo</p>',
					'<p>[]foo</p>',
					{ direction: 'backward' }
				);

				test(
					'extends one character forward',
					'<p>f[]oo</p>',
					'<p>f[o]o</p>'
				);

				test(
					'extends one character backward',
					'<p>fo[]o</p>',
					'<p>f<selection backward>o]o</p>',
					{ direction: 'backward' }
				);

				test(
					'extends one character forward (non-collapsed)',
					'<p>f[o]obar</p>',
					'<p>f[oo]bar</p>'
				);

				test(
					'extends one character backward (non-collapsed)',
					'<p>foob<selection backward>a]r</p>',
					'<p>foo<selection backward>ba]r</p>',
					{ direction: 'backward' }
				);

				test(
					'extends to element boundary',
					'<p>fo[]o</p>',
					'<p>fo[o]</p>'
				);

				test(
					'extends to element boundary (backward)',
					'<p>f[]oo</p>',
					'<p><selection backward>f]oo</p>',
					{ direction: 'backward' }
				);

				test(
					'shrinks forward selection (to collapsed)',
					'<p>foo[b]ar</p>',
					'<p>foo[]bar</p>',
					{ direction: 'backward' }
				);

				test(
					'shrinks backward selection (to collapsed)',
					'<p>foo<selection backward>b]ar</p>',
					'<p>foob[]ar</p>'
				);

				test(
					'extends one element forward',
					'<p>f[]<img></img>oo</p>',
					'<p>f[<img></img>]oo</p>'
				);

				test(
					'extends one non-empty element forward',
					'<p>f[]<img>x</img>oo</p>',
					'<p>f[<img>x</img>]oo</p>'
				);

				test(
					'extends one element backward',
					'<p>fo<img></img>[]o</p>',
					'<p>fo<selection backward><img></img>]o</p>',
					{ direction: 'backward' }
				);

				test(
					'unicode support - combining mark forward',
					'<p>foo[]b̂ar</p>',
					'<p>foo[b̂]ar</p>'
				);

				test(
					'unicode support - combining mark backward',
					'<p>foob̂[]ar</p>',
					'<p>foo<selection backward>b̂]ar</p>',
					{ direction: 'backward' }
				);

				test(
					'unicode support - combining mark multiple',
					'<p>fo[]o̻̐ͩbar</p>',
					'<p>fo[o̻̐ͩ]bar</p>'
				);

				test(
					'unicode support - combining mark multiple backward',
					'<p>foo̻̐ͩ[]bar</p>',
					'<p>fo<selection backward>o̻̐ͩ]bar</p>',
					{ direction: 'backward' }
				);

				test(
					'unicode support - combining mark to the end',
					'<p>fo[]o̻̐ͩ</p>',
					'<p>fo[o̻̐ͩ]</p>'
				);

				test(
					'unicode support - surrogate pairs forward',
					'<p>[]\uD83D\uDCA9</p>',
					'<p>[\uD83D\uDCA9]</p>'
				);

				test(
					'unicode support - surrogate pairs backward',
					'<p>\uD83D\uDCA9[]</p>',
					'<p><selection backward>\uD83D\uDCA9]</p>',
					{ direction: 'backward' }
				);
			} );

			describe( 'beyond element', () => {
				test(
					'extends over boundary of empty elements',
					'<p>[]</p><p></p><p></p>',
					'<p>[</p><p>]</p><p></p>'
				);

				test(
					'extends over boundary of empty elements (backward)',
					'<p></p><p></p><p>[]</p>',
					'<p></p><p><selection backward></p><p>]</p>',
					{ direction: 'backward' }
				);

				test(
					'extends over boundary of non-empty elements',
					'<p>a[]</p><p>bcd</p>',
					'<p>a[</p><p>]bcd</p>'
				);

				test(
					'extends over boundary of non-empty elements (backward)',
					'<p>a</p><p>[]bcd</p>',
					'<p>a<selection backward></p><p>]bcd</p>',
					{ direction: 'backward' }
				);

				test(
					'extends over character after boundary',
					'<p>a[</p><p>]bcd</p>',
					'<p>a[</p><p>b]cd</p>'
				);

				test(
					'extends over character after boundary (backward)',
					'<p>abc<selection backward></p><p>]d</p>',
					'<p>ab<selection backward>c</p><p>]d</p>',
					{ direction: 'backward' }
				);

				test(
					'extends over boundary when next element has nested elements',
					'<p>a[]</p><p><x>bcd</x></p>',
					'<p>a[</p><p>]<x>bcd</x></p>'
				);

				test(
					'extends over element when next element has nested elements',
					'<p>a[</p><p>]<x>bcd</x>ef</p>',
					'<p>a[</p><p><x>bcd</x>]ef</p>'
				);

				test(
					'extends over element when next node is a text',
					'<p>a[]</p>bc',
					'<p>a[</p>]bc'
				);

				test(
					'extends over element when next node is a text (backward)',
					'ab<p>[]c</p>',
					'ab<selection backward><p>]c</p>',
					{ direction: 'backward' }
				);

				test(
					'shrinks over boundary of empty elements',
					'<p><selection backward></p><p>]</p>',
					'<p></p><p>[]</p>'
				);

				test(
					'shrinks over boundary of empty elements (backward)',
					'<p>[</p><p>]</p>',
					'<p>[]</p><p></p>',
					{ direction: 'backward' }
				);

				test(
					'shrinks over boundary of non-empty elements',
					'<p>a<selection backward></p><p>]b</p>',
					'<p>a</p><p>[]b</p>'
				);

				test(
					'shrinks over boundary of non-empty elements (backward)',
					'<p>a[</p><p>]b</p>',
					'<p>a[]</p><p>b</p>',
					{ direction: 'backward' }
				);

				test(
					'updates selection attributes',
					'<p><$text bold="true">foo</$text>[b]</p>',
					'<p><$text bold="true>"foo</$text><selection bold=true />b</p>',
					{ direction: 'backward' }
				);
			} );
		} );

		describe( 'unit=codePoint', () => {
			test(
				'does nothing on empty content',
				'[]',
				'[]',
				{ unit: 'codePoint' }
			);

			test(
				'does nothing on empty content (with empty element)',
				'<p>[]</p>',
				'<p>[]</p>',
				{ unit: 'codePoint' }
			);

			test(
				'extends one user-perceived character forward - latin letters',
				'<p>f[]oo</p>',
				'<p>f[o]o</p>',
				{ unit: 'codePoint' }
			);

			test(
				'extends one user-perceived character backward - latin letters',
				'<p>fo[]o</p>',
				'<p>f<selection backward>o]o</p>',
				{ unit: 'codePoint', direction: 'backward' }
			);

			test(
				'unicode support - combining mark forward',
				'<p>foo[]b̂ar</p>',
				'<p>foo[b]̂ar</p>',
				{ unit: 'codePoint' }
			);

			test(
				'unicode support - combining mark backward',
				'<p>foob̂[]ar</p>',
				'<p>foob<selection backward>̂]ar</p>',
				{ unit: 'codePoint', direction: 'backward' }
			);

			test(
				'unicode support - combining mark multiple',
				'<p>fo[]o̻̐ͩbar</p>',
				'<p>fo[o]̻̐ͩbar</p>',
				{ unit: 'codePoint' }
			);

			test(
				'unicode support - surrogate pairs forward',
				'<p>[]\uD83D\uDCA9</p>',
				'<p>[\uD83D\uDCA9]</p>',
				{ unit: 'codePoint' }
			);

			test(
				'unicode support surrogate pairs backward',
				'<p>\uD83D\uDCA9[]</p>',
				'<p><selection backward>\uD83D\uDCA9]</p>',
				{ unit: 'codePoint', direction: 'backward' }
			);
		} );
	} );

	function test( title, input, output, options, isBackward ) {
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
			expect( document.selection.isBackward ).to.equal( !!isBackward );
		} );
	}
} );
