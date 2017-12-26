/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import Selection from '../../../src/model/selection';
import modifySelection from '../../../src/model/utils/modifyselection';
import { setData, stringify } from '../../../src/dev-utils/model';

describe( 'DataController utils', () => {
	let model, doc;

	beforeEach( () => {
		model = new Model();
		doc = model.document;

		model.schema.registerItem( 'p', '$block' );
		model.schema.registerItem( 'x', '$block' );
		model.schema.allow( { name: 'x', inside: 'p' } );

		doc.createRoot();
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

				it( 'extends one character backward', () => {
					setData( model, '<p>fo[]o</p>', { lastRangeBackward: true } );

					modifySelection( model, doc.selection, { direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>f[o]o</p>' );
					expect( doc.selection.isBackward ).to.true;
				} );

				test(
					'extends one character forward (non-collapsed)',
					'<p>f[o]obar</p>',
					'<p>f[oo]bar</p>'
				);

				it( 'extends one character backward (non-collapsed)', () => {
					setData( model, '<p>foob[a]r</p>', { lastRangeBackward: true } );

					modifySelection( model, doc.selection, { direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>foo[ba]r</p>' );
					expect( doc.selection.isBackward ).to.true;
				} );

				test(
					'extends to element boundary',
					'<p>fo[]o</p>',
					'<p>fo[o]</p>'
				);

				it( 'extends to element boundary (backward)', () => {
					setData( model, '<p>f[]oo</p>' );

					modifySelection( model, doc.selection, { direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>[f]oo</p>' );
					expect( doc.selection.isBackward ).to.true;
				} );

				test(
					'shrinks forward selection (to collapsed)',
					'<p>foo[b]ar</p>',
					'<p>foo[]bar</p>',
					{ direction: 'backward' }
				);

				it( 'shrinks backward selection (to collapsed)', () => {
					setData( model, '<p>foo[b]ar</p>', { lastRangeBackward: true } );

					modifySelection( model, doc.selection );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>foob[]ar</p>' );
					expect( doc.selection.isBackward ).to.false;
				} );

				test(
					'unicode support - combining mark forward',
					'<p>foo[]b̂ar</p>',
					'<p>foo[b̂]ar</p>'
				);

				it( 'unicode support - combining mark backward', () => {
					setData( model, '<p>foob̂[]ar</p>' );

					modifySelection( model, doc.selection, { direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>foo[b̂]ar</p>' );
					expect( doc.selection.isBackward ).to.true;
				} );

				test(
					'unicode support - combining mark multiple',
					'<p>fo[]o̻̐ͩbar</p>',
					'<p>fo[o̻̐ͩ]bar</p>'
				);

				it( 'unicode support - combining mark multiple backward', () => {
					setData( model, '<p>foo̻̐ͩ[]bar</p>' );

					modifySelection( model, doc.selection, { direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>fo[o̻̐ͩ]bar</p>' );
					expect( doc.selection.isBackward ).to.true;
				} );

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

				it( 'unicode support - surrogate pairs backward', () => {
					setData( model, '<p>\uD83D\uDCA9[]</p>' );

					modifySelection( model, doc.selection, { direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>[\uD83D\uDCA9]</p>' );
					expect( doc.selection.isBackward ).to.true;
				} );
			} );

			describe( 'beyond element', () => {
				test(
					'extends over boundary of empty elements',
					'<p>[]</p><p></p><p></p>',
					'<p>[</p><p>]</p><p></p>'
				);

				it( 'extends over boundary of empty elements (backward)', () => {
					setData( model, '<p></p><p></p><p>[]</p>' );

					modifySelection( model, doc.selection, { direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p></p><p>[</p><p>]</p>' );
					expect( doc.selection.isBackward ).to.true;
				} );

				test(
					'extends over boundary of non-empty elements',
					'<p>a[]</p><p>bcd</p>',
					'<p>a[</p><p>]bcd</p>'
				);

				it( 'extends over boundary of non-empty elements (backward)', () => {
					setData( model, '<p>a</p><p>[]bcd</p>' );

					modifySelection( model, doc.selection, { direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>a[</p><p>]bcd</p>' );
					expect( doc.selection.isBackward ).to.true;
				} );

				test(
					'extends over character after boundary',
					'<p>a[</p><p>]bcd</p>',
					'<p>a[</p><p>b]cd</p>'
				);

				it( 'extends over character after boundary (backward)', () => {
					setData( model, '<p>abc[</p><p>]d</p>', { lastRangeBackward: true } );

					modifySelection( model, doc.selection, { direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>ab[c</p><p>]d</p>' );
					expect( doc.selection.isBackward ).to.true;
				} );

				test(
					'stops on the first position where text is allowed - inside block',
					'<p>a[]</p><p><x>bcd</x></p>',
					'<p>a[</p><p>]<x>bcd</x></p>'
				);

				test(
					'stops on the first position where text is allowed - inside inline element',
					'<p>a[</p><p>]<x>bcd</x>ef</p>',
					'<p>a[</p><p><x>]bcd</x>ef</p>'
				);

				test(
					'extends over element when next node is a text',
					'<p><x>a[]</x>bc</p>',
					'<p><x>a[</x>]bc</p>'
				);

				test(
					'extends over element when next node is a text - backward',
					'<p>ab<x>[]c</x></p>',
					'<p>ab[<x>]c</x></p>',
					{ direction: 'backward' }
				);

				it( 'shrinks over boundary of empty elements', () => {
					setData( model, '<p>[</p><p>]</p>', { lastRangeBackward: true } );

					modifySelection( model, doc.selection );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p></p><p>[]</p>' );
					expect( doc.selection.isBackward ).to.false;
				} );

				it( 'shrinks over boundary of empty elements (backward)', () => {
					setData( model, '<p>[</p><p>]</p>' );

					modifySelection( model, doc.selection, { direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>[]</p><p></p>' );
					expect( doc.selection.isBackward ).to.false;
				} );

				it( 'shrinks over boundary of non-empty elements', () => {
					setData( model, '<p>a[</p><p>]b</p>', { lastRangeBackward: true } );

					modifySelection( model, doc.selection );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>a</p><p>[]b</p>' );
					expect( doc.selection.isBackward ).to.false;
				} );

				test(
					'shrinks over boundary of non-empty elements (backward)',
					'<p>a[</p><p>]b</p>',
					'<p>a[]</p><p>b</p>',
					{ direction: 'backward' }
				);

				it( 'updates selection attributes', () => {
					setData( model, '<p><$text bold="true">foo</$text>[b]</p>' );

					modifySelection( model, doc.selection, { direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p><$text bold="true">foo[]</$text>b</p>' );
					expect( doc.selection.getAttribute( 'bold' ) ).to.equal( true );
				} );
			} );

			describe( 'beyond element – skipping incorrect positions', () => {
				beforeEach( () => {
					model.schema.registerItem( 'quote' );
					model.schema.allow( { name: 'quote', inside: '$root' } );
					model.schema.allow( { name: '$block', inside: 'quote' } );
				} );

				test(
					'skips position at the beginning of an element which does not allow text',
					'<p>x[]</p><quote><p>y</p></quote><p>z</p>',
					'<p>x[</p><quote><p>]y</p></quote><p>z</p>'
				);

				test(
					'skips position at the end of an element which does not allow text - backward',
					'<p>x</p><quote><p>y</p></quote><p>[]z</p>',
					'<p>x</p><quote><p>y[</p></quote><p>]z</p>',
					{ direction: 'backward' }
				);

				test(
					'skips position at the end of an element which does not allow text',
					'<p>x[</p><quote><p>y]</p></quote><p>z</p>',
					'<p>x[</p><quote><p>y</p></quote><p>]z</p>'
				);

				test(
					'skips position at the beginning of an element which does not allow text - backward',
					'<p>x</p><quote><p>[]y</p></quote><p>z</p>',
					'<p>x[</p><quote><p>]y</p></quote><p>z</p>',
					{ direction: 'backward' }
				);

				test(
					'extends to an empty block after skipping incorrect position',
					'<p>x[]</p><quote><p></p></quote><p>z</p>',
					'<p>x[</p><quote><p>]</p></quote><p>z</p>'
				);

				test(
					'extends to an empty block after skipping incorrect position - backward',
					'<p>x</p><quote><p></p></quote><p>[]z</p>',
					'<p>x</p><quote><p>[</p></quote><p>]z</p>',
					{ direction: 'backward' }
				);
			} );
		} );

		describe( 'unit=codePoint', () => {
			it( 'does nothing on empty content', () => {
				model.schema.allow( { name: '$text', inside: '$root' } );

				setData( model, '' );

				modifySelection( model, doc.selection, { unit: 'codePoint' } );

				expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '[]' );
			} );

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

			it( 'extends one user-perceived character backward - latin letters', () => {
				setData( model, '<p>fo[]o</p>' );

				modifySelection( model, doc.selection, { unit: 'codePoint', direction: 'backward' } );

				expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>f[o]o</p>' );
				expect( doc.selection.isBackward ).to.true;
			} );

			test(
				'unicode support - combining mark forward',
				'<p>foo[]b̂ar</p>',
				'<p>foo[b]̂ar</p>',
				{ unit: 'codePoint' }
			);

			it( 'unicode support - combining mark backward', () => {
				setData( model, '<p>foob̂[]ar</p>' );

				// Creating new instance of selection instead of operation on module:engine/model/document~Document#selection.
				// Document's selection will throw errors in some test cases (which are correct cases, but only for
				// non-document selections).
				const testSelection = Selection.createFromSelection( doc.selection );
				modifySelection( model, testSelection, { unit: 'codePoint', direction: 'backward' } );

				expect( stringify( doc.getRoot(), testSelection ) ).to.equal( '<p>foob[̂]ar</p>' );
				expect( testSelection.isBackward ).to.true;
			} );

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

			it( 'unicode support surrogate pairs backward', () => {
				setData( model, '<p>\uD83D\uDCA9[]</p>' );

				modifySelection( model, doc.selection, { unit: 'codePoint', direction: 'backward' } );

				expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>[\uD83D\uDCA9]</p>' );
				expect( doc.selection.isBackward ).to.true;
			} );
		} );

		describe( 'objects handling', () => {
			beforeEach( () => {
				model.schema.registerItem( 'obj' );
				model.schema.allow( { name: 'obj', inside: '$root' } );
				model.schema.allow( { name: '$text', inside: 'obj' } );
				model.schema.objects.add( 'obj' );

				model.schema.registerItem( 'inlineObj', '$inline' );
				model.schema.allow( { name: '$text', inside: 'inlineObj' } );
				model.schema.objects.add( 'inlineObj' );
			} );

			test(
				'extends over next object element when at the end of an element',
				'<p>foo[]</p><obj>bar</obj>',
				'<p>foo[</p><obj>bar</obj>]'
			);

			test(
				'extends over previous object element when at the beginning of an element ',
				'<obj>bar</obj><p>[]foo</p>',
				'[<obj>bar</obj><p>]foo</p>',
				{ direction: 'backward' }
			);

			test(
				'extends over object elements - forward',
				'[<obj></obj>]<obj></obj>',
				'[<obj></obj><obj></obj>]'
			);

			it( 'extends over object elements - backward', () => {
				setData( model, '<obj></obj>[<obj></obj>]', { lastRangeBackward: true } );

				modifySelection( model, doc.selection, { direction: 'backward' } );

				expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '[<obj></obj><obj></obj>]' );
				expect( doc.selection.isBackward ).to.true;
			} );

			test(
				'extends over inline objects - forward',
				'<p>foo[]<inlineObj>bar</inlineObj></p>',
				'<p>foo[<inlineObj>bar</inlineObj>]</p>'
			);

			test(
				'extends over inline objects - backward',
				'<p><inlineObj>bar</inlineObj>[]foo</p>',
				'<p>[<inlineObj>bar</inlineObj>]foo</p>',
				{ direction: 'backward' }
			);

			test(
				'extends over empty inline objects - forward',
				'<p>foo[]<inlineObj></inlineObj></p>',
				'<p>foo[<inlineObj></inlineObj>]</p>'
			);

			test(
				'extends over empty inline objects - backward',
				'<p><inlineObj></inlineObj>[]foo</p>',
				'<p>[<inlineObj></inlineObj>]foo</p>',
				{ direction: 'backward' }
			);
		} );

		describe( 'limits handling', () => {
			beforeEach( () => {
				model.schema.registerItem( 'inlineLimit' );
				model.schema.allow( { name: 'inlineLimit', inside: '$block' } );
				model.schema.allow( { name: '$text', inside: 'inlineLimit' } );

				model.schema.registerItem( 'blockLimit' );
				model.schema.allow( { name: 'blockLimit', inside: '$root' } );
				model.schema.allow( { name: 'p', inside: 'blockLimit' } );

				model.schema.limits.add( 'inlineLimit' );
				model.schema.limits.add( 'blockLimit' );
			} );

			test(
				'should not extend to outside of inline limit element',
				'<p>x<inlineLimit>foo[]</inlineLimit>x</p>',
				'<p>x<inlineLimit>foo[]</inlineLimit>x</p>'
			);

			test(
				'should not extend to outside of inline limit element - backward',
				'<p>x<inlineLimit>[]foo</inlineLimit>x</p>',
				'<p>x<inlineLimit>[]foo</inlineLimit>x</p>',
				{ direction: 'backward' }
			);

			test(
				'should not extend to outside of block limit element',
				'<p>x</p><blockLimit><p>foo[]</p></blockLimit><p>x</p>',
				'<p>x</p><blockLimit><p>foo[]</p></blockLimit><p>x</p>'
			);

			test(
				'should not extend to outside of block limit element - backward',
				'<p>x</p><blockLimit><p>[]foo</p></blockLimit><p>x</p>',
				'<p>x</p><blockLimit><p>[]foo</p></blockLimit><p>x</p>',
				{ direction: 'backward' }
			);

			// This may seem counterintuitive but it makes sense. The limit element means
			// that it can't be left or modified from inside. If you want the same behavior from outside
			// register it as an object.
			test(
				'should enter a limit element',
				'<p>foo[]</p><blockLimit><p>x</p></blockLimit>',
				'<p>foo[</p><blockLimit><p>]x</p></blockLimit>'
			);

			test(
				'should enter a limit element - backward',
				'<blockLimit><p>x</p></blockLimit><p>[]foo</p>',
				'<blockLimit><p>x[</p></blockLimit><p>]foo</p>',
				{ direction: 'backward' }
			);
		} );
	} );

	function test( title, input, output, options ) {
		it( title, () => {
			input = input.normalize();
			output = output.normalize();

			setData( model, input );

			// Creating new instance of selection instead of operation on module:engine/model/document~Document#selection.
			// Document's selection will throw errors in some test cases (which are correct cases, but only for
			// non-document selections).
			const testSelection = Selection.createFromSelection( doc.selection );
			modifySelection( model, testSelection, options );

			expect( stringify( doc.getRoot(), testSelection ) ).to.equal( output );
		} );
	}
} );
