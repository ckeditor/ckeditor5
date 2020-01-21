/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../../src/model/model';
import modifySelection from '../../../src/model/utils/modifyselection';
import { setData, stringify } from '../../../src/dev-utils/model';

describe( 'DataController utils', () => {
	let model, doc;

	beforeEach( () => {
		model = new Model();
		doc = model.document;

		model.schema.register( 'p', { inheritAllFrom: '$block' } );
		model.schema.register( 'x', { inheritAllFrom: '$block' } );
		model.schema.extend( 'x', { allowIn: 'p' } );
		model.schema.register( 'br', { allowWhere: '$text' } );

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
					model.schema.register( 'quote' );
					model.schema.extend( 'quote', { allowIn: '$root' } );
					model.schema.extend( '$block', { allowIn: 'quote' } );
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
				model.schema.extend( '$text', { allowIn: '$root' } );

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
				const testSelection = model.createSelection( doc.selection );
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

		describe( 'unit=word', () => {
			describe( 'within element', () => {
				test(
					'does nothing on empty content',
					'[]',
					'[]',
					{ unit: 'word' }
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
					{ unit: 'word', direction: 'backward' }
				);

				test(
					'does nothing on root boundary',
					'<p>foo[]</p>',
					'<p>foo[]</p>',
					{ unit: 'word' }
				);

				test(
					'does nothing on root boundary (backward)',
					'<p>[]foo</p>',
					'<p>[]foo</p>',
					{ unit: 'word', direction: 'backward' }
				);

				for ( const char of ' ,.?!:;"-()'.split( '' ) ) {
					testStopCharacter( char );
				}

				test(
					'extends whole word forward (non-collapsed)',
					'<p>f[o]obar</p>',
					'<p>f[oobar]</p>',
					{ unit: 'word' }
				);

				it( 'extends whole word backward (non-collapsed)', () => {
					setData( model, '<p>foo ba[a]r</p>', { lastRangeBackward: true } );

					modifySelection( model, doc.selection, { unit: 'word', direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>foo [baa]r</p>' );
					expect( doc.selection.isBackward ).to.true;
				} );

				test(
					'extends to element boundary',
					'<p>fo[]oo</p>',
					'<p>fo[oo]</p>',
					{ unit: 'word' }
				);

				it( 'extends to element boundary (backward)', () => {
					setData( model, '<p>ff[]oo</p>' );

					modifySelection( model, doc.selection, { unit: 'word', direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>[ff]oo</p>' );
					expect( doc.selection.isBackward ).to.true;
				} );

				test(
					'expands forward selection to the word start',
					'<p>foo bar[b]az</p>',
					'<p>foo [bar]baz</p>',
					{ unit: 'word', direction: 'backward' }
				);

				it( 'expands backward selection to the word end', () => {
					setData( model, '<p>foo[b]ar baz</p>', { lastRangeBackward: true } );

					modifySelection( model, doc.selection, { unit: 'word' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>foob[ar] baz</p>' );
					expect( doc.selection.isBackward ).to.false;
				} );

				test(
					'unicode support - combining mark forward',
					'<p>foo[]b̂ar</p>',
					'<p>foo[b̂ar]</p>',
					{ unit: 'word' }
				);

				it( 'unicode support - combining mark backward', () => {
					setData( model, '<p>foob̂[]ar</p>' );

					modifySelection( model, doc.selection, { direction: 'backward', unit: 'word' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>[foob̂]ar</p>' );
					expect( doc.selection.isBackward ).to.true;
				} );

				test(
					'unicode support - combining mark multiple',
					'<p>fo[]o̻̐ͩbar</p>',
					'<p>fo[o̻̐ͩbar]</p>',
					{ unit: 'word' }
				);

				it( 'unicode support - combining mark multiple backward', () => {
					setData( model, '<p>foo̻̐ͩ[]bar</p>' );

					modifySelection( model, doc.selection, { direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>fo[o̻̐ͩ]bar</p>' );
					expect( doc.selection.isBackward ).to.true;
				} );

				test(
					'unicode support - combining mark to the end',
					'<p>f[o]o̻̐ͩ</p>',
					'<p>f[oo̻̐ͩ]</p>',
					{ unit: 'word' }
				);

				test(
					'unicode support - surrogate pairs forward',
					'<p>[]foo\uD83D\uDCA9</p>',
					'<p>[foo\uD83D\uDCA9]</p>',
					{ unit: 'word' }
				);

				it( 'unicode support - surrogate pairs backward', () => {
					setData( model, '<p>foo\uD83D\uDCA9[]</p>' );

					modifySelection( model, doc.selection, { unit: 'word', direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>[foo\uD83D\uDCA9]</p>' );
					expect( doc.selection.isBackward ).to.true;
				} );

				it( 'expands backward selection to the word begin in the paragraph with soft break', () => {
					setData( model, '<p>Foo<br></br>Bar[]</p>' );

					modifySelection( model, doc.selection, { unit: 'word', direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>Foo<br></br>[Bar]</p>' );
				} );

				it( 'expands backward selection to the whole paragraph in the paragraph with soft break', () => {
					setData( model, '<p>Foo<br></br>Bar[]</p>' );

					modifySelection( model, doc.selection, { unit: 'word', direction: 'backward' } );
					modifySelection( model, doc.selection, { unit: 'word', direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>Foo[<br></br>Bar]</p>' );

					modifySelection( model, doc.selection, { unit: 'word', direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>[Foo<br></br>Bar]</p>' );
				} );

				it( 'expands forward selection to the word end in the paragraph with soft break', () => {
					setData( model, '<p>[]Foo<br></br>Bar</p>' );

					modifySelection( model, doc.selection, { unit: 'word', direction: 'forward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>[Foo]<br></br>Bar</p>' );
				} );

				it( 'expands forward selection to the whole paragraph in the paragraph with soft break', () => {
					setData( model, '<p>[]Foo<br></br>Bar</p>' );

					modifySelection( model, doc.selection, { unit: 'word', direction: 'forward' } );
					modifySelection( model, doc.selection, { unit: 'word', direction: 'forward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>[Foo<br></br>]Bar</p>' );

					modifySelection( model, doc.selection, { unit: 'word', direction: 'forward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>[Foo<br></br>Bar]</p>' );
				} );

				function testStopCharacter( stopCharacter ) {
					describe( `stop character: "${ stopCharacter }"`, () => {
						test(
							'extends whole word forward',
							`<p>f[]oo${ stopCharacter }bar</p>`,
							`<p>f[oo]${ stopCharacter }bar</p>`,
							{ unit: 'word' }
						);

						it( 'extends whole word backward to the previous word', () => {
							setData( model, `<p>foo${ stopCharacter }ba[]r</p>`, { lastRangeBackward: true } );

							modifySelection( model, doc.selection, { unit: 'word', direction: 'backward' } );

							expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( `<p>foo${ stopCharacter }[ba]r</p>` );
							expect( doc.selection.isBackward ).to.true;
						} );

						it( 'extends whole word backward', () => {
							setData( model, `<p>fo[]o${ stopCharacter }bar</p>`, { lastRangeBackward: true } );

							modifySelection( model, doc.selection, { unit: 'word', direction: 'backward' } );

							expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( `<p>[fo]o${ stopCharacter }bar</p>` );
							expect( doc.selection.isBackward ).to.true;
						} );

						test(
							'ignores attributes when in one word - case 1',
							`<p>foo[]<$text bold="true">bar</$text>baz${ stopCharacter }foobarbaz</p>`,
							`<p>foo[<$text bold="true">bar</$text>baz]${ stopCharacter }foobarbaz</p>`,
							{ unit: 'word' }
						);

						test(
							'ignores attributes when in one word - case 2',
							`<p>foo[]<$text bold="true">bar</$text>${ stopCharacter }foobarbaz</p>`,
							`<p>foo[<$text bold="true">bar</$text>]${ stopCharacter }foobarbaz</p>`,
							{ unit: 'word' }
						);

						test(
							'ignores attributes when in one word - case 3',
							`<p>foo[]<$text bold="true">bar</$text><$text italic="true">baz</$text>baz${ stopCharacter }foobarbaz</p>`,
							`<p>foo[<$text bold="true">bar</$text><$text italic="true">baz</$text>baz]${ stopCharacter }foobarbaz</p>`,
							{ unit: 'word' }
						);

						it( 'extends whole word backward to the previous word ignoring attributes - case 1', () => {
							setData(
								model,
								`<p>foobarbaz${ stopCharacter }foo<$text bold="true">bar</$text>baz[]</p>`
							);

							modifySelection( model, doc.selection, { unit: 'word', direction: 'backward' } );

							expect( stringify( doc.getRoot(), doc.selection ) ).to.equal(
								`<p>foobarbaz${ stopCharacter }[foo<$text bold="true">bar</$text>baz]</p>`
							);
							expect( doc.selection.isBackward ).to.true;
						} );

						it( 'extends whole word backward to the previous word ignoring attributes - case 2', () => {
							setData(
								model,
								`<p>foobarbaz${ stopCharacter }<$text bold="true">bar</$text>baz[]</p>`
							);

							modifySelection( model, doc.selection, { unit: 'word', direction: 'backward' } );

							expect( stringify( doc.getRoot(), doc.selection ) ).to.equal(
								`<p>foobarbaz${ stopCharacter }[<$text bold="true">bar</$text>baz]</p>`
							);
							expect( doc.selection.isBackward ).to.true;
						} );
					} );
				}
			} );

			describe( 'beyond element', () => {
				test(
					'extends over boundary of empty elements',
					'<p>[]</p><p></p><p></p>',
					'<p>[</p><p>]</p><p></p>',
					{ unit: 'word' }
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
					'<p>a[</p><p>]bcd</p>',
					{ unit: 'word' }
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
					'<p>a[</p><p>bcd]</p>',
					{ unit: 'word' }
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
					'<p>a[</p><p>]<x>bcd</x></p>',
					{ unit: 'word' }
				);

				test(
					'stops on the first position where text is allowed - inside inline element',
					'<p>a[</p><p>]<x>bcd</x>ef</p>',
					'<p>a[</p><p><x>]bcd</x>ef</p>',
					{ unit: 'word' }
				);

				test(
					'extends over element when next node is a text',
					'<p><x>a[]</x>bc</p>',
					'<p><x>a[</x>]bc</p>',
					{ unit: 'word' }
				);

				test(
					'extends over element when next node is a text - backward',
					'<p>ab<x>[]c</x></p>',
					'<p>ab[<x>]c</x></p>',
					{ unit: 'word', direction: 'backward' }
				);

				it( 'shrinks over boundary of empty elements', () => {
					setData( model, '<p>[</p><p>]</p>', { lastRangeBackward: true } );

					modifySelection( model, doc.selection, { unit: 'word' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p></p><p>[]</p>' );
					expect( doc.selection.isBackward ).to.false;
				} );

				it( 'shrinks over boundary of empty elements (backward)', () => {
					setData( model, '<p>[</p><p>]</p>' );

					modifySelection( model, doc.selection, { unit: 'word', direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>[]</p><p></p>' );
					expect( doc.selection.isBackward ).to.false;
				} );

				it( 'shrinks over boundary of non-empty elements', () => {
					setData( model, '<p>a[</p><p>]b</p>', { lastRangeBackward: true } );

					modifySelection( model, doc.selection, { unit: 'word' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p>a</p><p>[]b</p>' );
					expect( doc.selection.isBackward ).to.false;
				} );

				test(
					'shrinks over boundary of non-empty elements (backward)',
					'<p>a[</p><p>]b</p>',
					'<p>a[]</p><p>b</p>',
					{ unit: 'word', direction: 'backward' }
				);

				it( 'updates selection attributes', () => {
					setData( model, '<p><$text bold="true">foo</$text>[b]</p>' );

					modifySelection( model, doc.selection, { unit: 'word', direction: 'backward' } );

					expect( stringify( doc.getRoot(), doc.selection ) ).to.equal( '<p><$text bold="true">foo[]</$text>b</p>' );
					expect( doc.selection.getAttribute( 'bold' ) ).to.equal( true );
				} );
			} );

			describe( 'beyond element – skipping incorrect positions', () => {
				beforeEach( () => {
					model.schema.register( 'quote' );
					model.schema.extend( 'quote', { allowIn: '$root' } );
					model.schema.extend( '$block', { allowIn: 'quote' } );
				} );

				test(
					'skips position at the beginning of an element which does not allow text',
					'<p>x[]</p><quote><p>y</p></quote><p>z</p>',
					'<p>x[</p><quote><p>]y</p></quote><p>z</p>',
					{ unit: 'word' }
				);

				test(
					'skips position at the end of an element which does not allow text - backward',
					'<p>x</p><quote><p>y</p></quote><p>[]z</p>',
					'<p>x</p><quote><p>y[</p></quote><p>]z</p>',
					{ unit: 'word', direction: 'backward' }
				);

				test(
					'skips position at the end of an element which does not allow text',
					'<p>x[</p><quote><p>y]</p></quote><p>z</p>',
					'<p>x[</p><quote><p>y</p></quote><p>]z</p>',
					{ unit: 'word' }
				);

				test(
					'skips position at the beginning of an element which does not allow text - backward',
					'<p>x</p><quote><p>[]y</p></quote><p>z</p>',
					'<p>x[</p><quote><p>]y</p></quote><p>z</p>',
					{ unit: 'word', direction: 'backward' }
				);

				test(
					'extends to an empty block after skipping incorrect position',
					'<p>x[]</p><quote><p></p></quote><p>z</p>',
					'<p>x[</p><quote><p>]</p></quote><p>z</p>',
					{ unit: 'word' }
				);

				test(
					'extends to an empty block after skipping incorrect position - backward',
					'<p>x</p><quote><p></p></quote><p>[]z</p>',
					'<p>x</p><quote><p>[</p></quote><p>]z</p>',
					{ unit: 'word', direction: 'backward' }
				);
			} );
		} );

		describe( 'objects handling', () => {
			beforeEach( () => {
				model.schema.register( 'obj', {
					isObject: true
				} );
				model.schema.extend( 'obj', { allowIn: '$root' } );
				model.schema.extend( '$text', { allowIn: 'obj' } );

				model.schema.register( 'inlineObj', {
					allowIn: 'p',
					isObject: true
				} );
				model.schema.extend( '$text', { allowIn: 'inlineObj' } );
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
				model.schema.register( 'inlineLimit', {
					isLimit: true
				} );
				model.schema.extend( 'inlineLimit', { allowIn: '$block' } );
				model.schema.extend( '$text', { allowIn: 'inlineLimit' } );

				model.schema.register( 'blockLimit', {
					isLimit: true
				} );
				model.schema.extend( 'blockLimit', { allowIn: '$root' } );
				model.schema.extend( 'p', { allowIn: 'blockLimit' } );
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
			const testSelection = model.createSelection( doc.selection );
			modifySelection( model, testSelection, options );

			expect( stringify( doc.getRoot(), testSelection ) ).to.equal( output );
		} );
	}
} );
