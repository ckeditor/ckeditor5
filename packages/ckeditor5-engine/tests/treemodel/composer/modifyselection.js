/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, composer */

'use strict';

import Document from '/ckeditor5/engine/treemodel/document.js';
import modifySelection from '/ckeditor5/engine/treemodel/composer/modifyselection.js';
import { setData, getData } from '/tests/engine/_utils/model.js';

describe( 'Delete utils', () => {
	let document;

	beforeEach( () => {
		document = new Document();
		document.createRoot( 'main', '$root' );
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
					{ direction: 'BACKWARD' }
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
					{ direction: 'BACKWARD' }
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
					{ direction: 'BACKWARD' }
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
					{ direction: 'BACKWARD' }
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
					{ direction: 'BACKWARD' }
				);

				test(
					'shrinks forward selection (to collapsed)',
					'<p>foo<selection>b</selection>ar</p>',
					'<p>foo<selection />bar</p>',
					{ direction: 'BACKWARD' }
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
					{ direction: 'BACKWARD' }
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
					{ direction: 'BACKWARD' }
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
					{ direction: 'BACKWARD' }
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
					{ direction: 'BACKWARD' }
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
					{ direction: 'BACKWARD' }
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
					{ direction: 'BACKWARD' }
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
					{ direction: 'BACKWARD' }
				);
			} );
		} );

		test(
			'updates selection attributes',
			'<p><$text bold=true>foo</$text><selection>b</selection></p>',
			'<p><$text bold=true>foo</$text><selection bold=true />b</p>',
			{ direction: 'BACKWARD' }
		);
	} );

	function test( title, input, output, options ) {
		it( title, () => {
			setData( document, 'main', input );

			modifySelection( document.selection, options );

			expect( getData( document, 'main', { selection: true } ) ).to.equal( output );
		} );
	}
} );
