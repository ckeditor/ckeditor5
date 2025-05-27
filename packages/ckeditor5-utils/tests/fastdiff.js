/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import fastDiff from '../src/fastdiff.js';
import diff from '../src/diff.js';
import diffToChanges from '../src/difftochanges.js';

describe( 'fastDiff', () => {
	describe( 'input types', () => {
		it( 'should correctly handle strings', () => {
			const changes = fastDiff( '123', 'abc123' );
			expect( changes ).to.deep.equal( [ { index: 0, type: 'insert', values: [ 'a', 'b', 'c' ] } ] );
		} );

		it( 'should correctly handle arrays', () => {
			const changes = fastDiff( [ '1', '2', '3' ], [ 'a', 'b', 'c', '1', '2', '3' ] );
			expect( changes ).to.deep.equal( [ { index: 0, type: 'insert', values: [ 'a', 'b', 'c' ] } ] );
		} );

		it( 'should correctly handle node lists', () => {
			const el1 = document.createElement( 'p' );
			const el2 = document.createElement( 'h1' );

			el1.appendChild( document.createElement( 'span' ) );
			el1.appendChild( document.createElement( 'strong' ) );

			el2.appendChild( document.createElement( 'div' ) );
			el2.appendChild( document.createElement( 'strong' ) );

			const changes = fastDiff( el1.childNodes, el2.childNodes );
			expect( changes ).to.deep.equal( [
				{ index: 0, type: 'insert', values: [ el2.childNodes[ 0 ], el2.childNodes[ 1 ] ] },
				{ index: 2, type: 'delete', howMany: 2 }
			] );
		} );
	} );

	describe( 'changes object', () => {
		it( 'should diff identical texts', () => {
			expectDiff( '123', '123', [] );
		} );

		it( 'should diff identical arrays', () => {
			expectDiff( [ '1', '2', '3' ], [ '1', '2', '3' ], [] );
		} );

		it( 'should diff arrays with custom comparator', () => {
			expectDiff( [ 'a', 'b', 'c' ], [ 'A', 'B', 'C' ], [], true, ( a, b ) => a.toLowerCase() === b.toLowerCase() );
		} );

		describe( 'insertion', () => {
			it( 'should diff if old text is empty', () => {
				expectDiff( '', '123', [ { index: 0, type: 'insert', values: [ '1', '2', '3' ] } ] );
			} );

			it( 'should diff if old array is empty', () => {
				expectDiff( [], [ '1', '2', '3' ], [ { index: 0, type: 'insert', values: [ '1', '2', '3' ] } ] );
			} );

			it( 'should diff insertion on the beginning', () => {
				expectDiff( '123', 'abc123', [ { index: 0, type: 'insert', values: [ 'a', 'b', 'c' ] } ] );
			} );

			it( 'should diff insertion on the beginning (repetitive substring)', () => {
				// Do not check compatibility with 'diffToChanges' as it generates:
				// [ { index: 0, type: 'insert', values: [ 'a', 'b' ] }, { index: 5, type: 'insert', values: [ 'c', '1', '2', '3' ] } ]
				expectDiff( '123', 'ab123c123', [ { index: 0, type: 'insert', values: [ 'a', 'b', '1', '2', '3', 'c' ] } ], false );
			} );

			it( 'should diff insertion on the end', () => {
				expectDiff( '123', '123abc', [ { index: 3, type: 'insert', values: [ 'a', 'b', 'c' ] } ] );
			} );

			it( 'should diff insertion on the end (repetitive substring)', () => {
				expectDiff( '123', '123ab123c', [ { index: 3, type: 'insert', values: [ 'a', 'b', '1', '2', '3', 'c' ] } ] );
			} );

			it( 'should diff insertion in the middle', () => {
				expectDiff( '123', '12abc3', [ { index: 2, type: 'insert', values: [ 'a', 'b', 'c' ] } ] );
			} );

			it( 'should diff insertion in the middle (repetitive substring)', () => {
				// Do not check compatibility with 'diffToChanges' as it generates:
				// [ { index: 2, type: 'insert', values: [ 'a', 'b', '1', '2' ] }, { index: 7, type: 'insert', values: [ 'c', '3' ] } ]
				expectDiff( '123', '12ab123c3', [ { index: 2, type: 'insert', values: [ 'a', 'b', '1', '2', '3', 'c' ] } ], false );
			} );

			it( 'should diff insertion of duplicated content', () => {
				expectDiff( '123', '123123', [ { index: 3, type: 'insert', values: [ '1', '2', '3' ] } ] );
			} );

			it( 'should diff insertion of partially duplicated content', () => {
				expectDiff( '123', '12323', [ { index: 3, type: 'insert', values: [ '2', '3' ] } ] );
			} );

			it( 'should diff insertion on both boundaries', () => {
				// Do not check compatibility with 'diffToChanges' as it generates:
				// [ { index: 2, type: 'insert', values: [ 'a', 'b' ] }, { index: 5, type: 'insert', values: [ 'c' ] } ]
				expectDiff( '123', 'ab123c', [
					{ index: 0, type: 'insert', values: [ 'a', 'b', '1', '2', '3', 'c' ] },
					{ index: 6, type: 'delete', howMany: 3 }
				], false );
			} );

			it( 'should diff insertion in array of objects', () => {
				const o1 = { foo: 1 };
				const o2 = { bar: 2 };

				expectDiff( [ o1, o2 ], [ o1, o2, { baz: 3 } ], [
					{ index: 2, type: 'insert', values: [ { baz: 3 } ] }
				] );
			} );

			it( 'should diff insertion in array of objects with comparator', () => {
				expectDiff( [ { text: 'foo' }, { text: 'bar' } ], [ { text: 'foo' }, { text: 'bar' }, { text: 'baz' } ], [
					{ index: 2, type: 'insert', values: [ { text: 'baz' } ] }
				], true, ( a, b ) => a.text === b.text );
			} );

			describe( 'with multi-byte unicode', () => {
				describe( 'simple emoji - single unicode code point', () => {
					// 🙂 = '\ud83d\ude42' = 2 chars

					it( 'should properly handle emoji insertion', () => {
						expectDiff( 'abc', 'ab🙂c', [ { index: 2, type: 'insert', values: '🙂'.split( '' ) } ] );
					} );

					it( 'should properly handle emoji insertion on the end', () => {
						expectDiff( 'abc', 'abc🙂', [ { index: 3, type: 'insert', values: '🙂'.split( '' ) } ] );
					} );

					it( 'should properly handle appending to string containing emoji', () => {
						expectDiff( 'abc🙂', 'abc🙂d', [ { index: 5, type: 'insert', values: [ 'd' ] } ] );
					} );

					it( 'should properly handle insertion to string containing emoji', () => {
						expectDiff( 'ab🙂cd', 'ab🙂cde', [ { index: 6, type: 'insert', values: [ 'e' ] } ] );
					} );
				} );

				describe( 'combined emoji - unicode ZWJ sequence', () => {
					// 👩‍🦰 = '\ud83d\udc69\u200d\ud83e\uddB0' = 5 chars

					it( 'should properly handle emoji with ZWJ insertion', () => {
						expectDiff( 'abc', 'ab👩‍🦰c', [ { index: 2, type: 'insert', values: '👩‍🦰'.split( '' ) } ] );
					} );

					it( 'should properly handle emoji (with ZWJ) insertion on the end', () => {
						expectDiff( 'abc', 'abc👩‍🦰', [ { index: 3, type: 'insert', values: '👩‍🦰'.split( '' ) } ] );
					} );

					it( 'should properly handle appending to string containing emoji (with ZWJ)', () => {
						expectDiff( 'ab👩‍🦰', 'ab👩‍🦰c', [ { index: 7, type: 'insert', values: [ 'c' ] } ] );
					} );

					it( 'should properly handle insertion to string containing emoji (with ZWJ)', () => {
						expectDiff( 'a👩‍🦰b', 'a👩‍🦰bc', [ { index: 7, type: 'insert', values: [ 'c' ] } ] );
					} );
				} );
			} );
		} );

		describe( 'deletion', () => {
			it( 'should diff if new text is empty', () => {
				expectDiff( '123', '', [ { index: 0, type: 'delete', howMany: 3 } ] );
			} );

			it( 'should diff if new array is empty', () => {
				expectDiff( [ '1', '2', '3' ], [], [ { index: 0, type: 'delete', howMany: 3 } ] );
			} );

			it( 'should diff deletion on the beginning', () => {
				expectDiff( 'abc123', '123', [ { index: 0, type: 'delete', howMany: 3 } ] );
			} );

			it( 'should diff deletion on the beginning (repetitive substring)', () => {
				// Do not check compatibility with 'diffToChanges' as it generates:
				// [ { index: 0, type: 'delete', howMany: 2 }, { index: 3, type: 'delete', howMany: 4 } ]
				expectDiff( 'ab123c123', '123', [ { index: 0, type: 'delete', howMany: 6 } ], false );
			} );

			it( 'should diff deletion on the end', () => {
				expectDiff( '123abc', '123', [ { index: 3, type: 'delete', howMany: 3 } ] );
			} );

			it( 'should diff deletion on the end (repetitive substring)', () => {
				expectDiff( '123ab123c', '123', [ { index: 3, type: 'delete', howMany: 6 } ] );
			} );

			it( 'should diff deletion in the middle', () => {
				expectDiff( '12abc3', '123', [ { index: 2, type: 'delete', howMany: 3 } ] );
			} );

			it( 'should diff deletion in the middle (repetitive substring)', () => {
				// Do not check compatibility with 'diffToChanges' as it generates:
				// [ { index: 2, type: 'delete', howMany: 4 }, { index: 3, type: 'delete', howMany: 2 } ]
				expectDiff( '12ab123c3', '123', [ { index: 2, type: 'delete', howMany: 6 } ], false );
			} );

			it( 'should diff deletion on both boundaries', () => {
				// Do not check compatibility with 'diffToChanges' as it generates:
				// [ { index: 0, type: 'delete', howMany: 1 }, { index: 3, type: 'delete', howMany: 2 } ]
				expectDiff( '12abc3', '2ab', [
					{ index: 0, type: 'insert', values: [ '2', 'a', 'b' ] },
					{ index: 3, type: 'delete', howMany: 6 }
				], false );
			} );

			it( 'should diff deletion of duplicated content', () => {
				expectDiff( '123123', '123', [ { index: 3, type: 'delete', howMany: 3 } ] );
			} );

			it( 'should diff deletion of partially duplicated content', () => {
				expectDiff( '12323', '123', [ { index: 3, type: 'delete', howMany: 2 } ] );
			} );

			it( 'should diff deletion of partially duplicated content 2', () => {
				// Do not check compatibility with 'diffToChanges' as it generates:
				// [ { index: 1, type: 'delete', howMany: 2 }, { index: 2, type: 'delete', howMany: 1 } ]
				expectDiff( '11233', '13', [ { index: 1, type: 'delete', howMany: 3 } ], false );
			} );

			it( 'should diff deletion in array of objects', () => {
				const o1 = { foo: 1 };
				const o2 = { bar: 2 };

				expectDiff( [ o1, o2 ], [ o2 ], [
					{ index: 0, type: 'delete', howMany: 1 }
				] );
			} );

			it( 'should diff insertion in array of objects with comparator', () => {
				expectDiff( [ { text: 'foo' }, { text: 'bar' } ], [ { text: 'bar' } ], [
					{ index: 0, type: 'delete', howMany: 1 }
				], true, ( a, b ) => a.text === b.text );
			} );

			describe( 'with multi-byte unicode', () => {
				describe( 'simple emoji - single unicode code point', () => {
					// 🙂 = '\ud83d\ude42' = 2 chars
					const emojiLength = '🙂'.split( '' ).length;

					it( 'should properly handle emoji delete', () => {
						expectDiff( 'ab🙂c', 'abc', [ { index: 2, type: 'delete', howMany: emojiLength } ] );
					} );

					it( 'should properly handle emoji delete at end', () => {
						expectDiff( 'ab🙂', 'ab', [ { index: 2, type: 'delete', howMany: emojiLength } ] );
					} );

					it( 'should properly handle emoji delete at beginning', () => {
						expectDiff( '🙂ab', 'ab', [ { index: 0, type: 'delete', howMany: emojiLength } ] );
					} );
				} );

				describe( 'combined emoji - unicode ZWJ sequence', () => {
					// 👩‍🦰 = '\ud83d\udc69\u200d\ud83e\uddB0' = 5 chars
					const emojiLength = '👩‍🦰'.split( '' ).length;

					it( 'should properly handle emoji delete (with ZWJ)', () => {
						expectDiff( 'ab👩‍🦰c', 'abc', [ { index: 2, type: 'delete', howMany: emojiLength } ] );
					} );

					it( 'should properly handle emoji delete at end (with ZWJ)', () => {
						expectDiff( 'ab👩‍🦰', 'ab', [ { index: 2, type: 'delete', howMany: emojiLength } ] );
					} );

					it( 'should properly handle emoji delete at beginning (with ZWJ)', () => {
						expectDiff( '👩‍🦰ab', 'ab', [ { index: 0, type: 'delete', howMany: emojiLength } ] );
					} );
				} );
			} );
		} );

		describe( 'replacement', () => {
			it( 'should diff replacement of entire text', () => {
				// Do not check compatibility with 'diffToChanges' as it has changes in reveres order ('delete', 'insert') here.
				expectDiff( '12345', 'abcd', [
					{ index: 0, type: 'insert', values: [ 'a', 'b', 'c', 'd' ] },
					{ index: 4, type: 'delete', howMany: 5 }
				], false );
			} );

			it( 'should diff replacement on the beginning', () => {
				expectDiff( '12345', 'abcd345', [
					{ index: 0, type: 'insert', values: [ 'a', 'b', 'c', 'd' ] },
					{ index: 4, type: 'delete', howMany: 2 }
				] );
			} );

			it( 'should diff replacement on the beginning (repetitive substring)', () => {
				// Do not check compatibility with 'diffToChanges' as it has changes in reveres order ('delete', 'insert') here.
				expectDiff( '12345', '345345', [
					{ index: 0, type: 'insert', values: [ '3', '4', '5' ] },
					{ index: 3, type: 'delete', howMany: 2 }
				], false );
			} );

			it( 'should diff replacement on the end', () => {
				// Do not check compatibility with 'diffToChanges' as it has changes in reveres order ('delete', 'insert') here.
				expectDiff( '12345', '12ab', [
					{ index: 2, type: 'insert', values: [ 'a', 'b' ] },
					{ index: 4, type: 'delete', howMany: 3 }
				], false );
			} );

			it( 'should diff replacement on the end (repetitive substring)', () => {
				// Do not check compatibility with 'diffToChanges' as it generates:
				// [ { index: 3, type: 'insert', values: [ '1', '2', '3' ] }, { index: 7, type: 'delete', howMany: 1 } ]
				expectDiff( '12345', '1231234', [
					{ index: 3, type: 'insert', values: [ '1', '2', '3', '4' ] },
					{ index: 7, type: 'delete', howMany: 2 }
				], false );
			} );

			it( 'should diff insertion of duplicated content (case 1)', () => {
				expectDiff( '1234', '123123', [
					{ index: 3, type: 'insert', values: [ '1', '2', '3' ] },
					{ index: 6, type: 'delete', howMany: 1 }
				], false );
			} );

			it( 'should diff insertion of duplicated content (case 2)', () => {
				expectDiff( '1234', '13424', [
					{ index: 1, type: 'insert', values: [ '3', '4', '2' ] },
					{ index: 4, type: 'delete', howMany: 2 }
				], false );
			} );

			it( 'should diff replacement in the middle', () => {
				expectDiff( '12345', '12ab5', [
					{ index: 2, type: 'insert', values: [ 'a', 'b' ] },
					{ index: 4, type: 'delete', howMany: 2 }
				] );
			} );

			it( 'should diff replacement in the middle (repetitive substring)', () => {
				// Do not check compatibility with 'diffToChanges' as it generates:
				// [ { index: 2, type: 'insert', values: [ '1', '2' ] }, { index: 7, type: 'insert', values: [ '5' ] } ]
				expectDiff( '12345', '12123455', [
					{ index: 2, type: 'insert', values: [ '1', '2', '3', '4', '5' ] },
					{ index: 7, type: 'delete', howMany: 2 }
				], false );
			} );

			it( 'should diff replacement of duplicated content', () => {
				// Do not check compatibility with 'diffToChanges' as it has changes in reveres order ('delete', 'insert') here.
				expectDiff( '123123', '123333', [
					{ index: 3, type: 'insert', values: '33'.split( '' ) },
					{ index: 5, type: 'delete', howMany: 2 }
				], false );
			} );

			it( 'should diff replacement in array of objects', () => {
				const o1 = { foo: 1 };
				const o2 = { bar: 2 };

				expectDiff( [ o1, o2 ], [ o1, { baz: 3 } ], [
					{ index: 1, type: 'insert', values: [ { baz: 3 } ] },
					{ index: 2, type: 'delete', howMany: 1 }
				] );
			} );

			it( 'should diff insertion in array of objects with comparator', () => {
				expectDiff( [ { text: 'foo' }, { text: 'bar' } ], [ { text: 'foo' }, { text: 'baz' } ], [
					{ index: 1, type: 'insert', values: [ { text: 'baz' } ] },
					{ index: 2, type: 'delete', howMany: 1 }
				], true, ( a, b ) => a.text === b.text );
			} );

			describe( 'with multi-byte unicode', () => {
				// 🙂 = '\ud83d\ude42' = 2 chars
				const smileEmoji = '🙂'.split( '' );

				// 👩 = '\ud83d\udc69' = 2 chars
				const womanEmoji = '👩'.split( '' );

				// 👩‍🦰 = '\ud83d\udc69\u200d\ud83e\uddB0' = 5 chars
				const womanRedHairEmoji = '👩‍🦰'.split( '' );

				// Do not check compatibility with 'diffToChanges' as it generates:
				// [ { index: 1, type: 'delete', howMany: 2 }, { index: 1, type: 'insert', values: [ 'x' ] } ]
				it( 'should properly replace emoji with text', () => {
					expectDiff( 'a🙂b', 'axb', [
						{ index: 1, type: 'insert', values: [ 'x' ] },
						{ index: 2, type: 'delete', howMany: smileEmoji.length }
					], false );
				} );

				it( 'should properly replace text with emoji', () => {
					expectDiff( 'abc', 'a👩c', [
						{ index: 1, type: 'insert', values: womanEmoji },
						{ index: 3, type: 'delete', howMany: 1 }
					] );
				} );

				it( 'should properly replace emoji with emoji', () => {
					// Note that first char of both emoji is the same.
					expectDiff( 'a👩b', 'a🙂b', [
						{ index: 2, type: 'insert', values: smileEmoji.slice( 1 ) },
						{ index: 3, type: 'delete', howMany: 1 }
					] );
				} );

				it( 'should properly replace simple emoji with ZWJ sequence of it', () => {
					// Note that first 2 chars of both emoji are the same.
					expectDiff( 'a👩b', 'a👩‍🦰b', [
						{ index: 3, type: 'insert', values: womanRedHairEmoji.slice( 2 ) }
					] );
				} );

				it( 'should properly replace ZWJ sequence with simple emoji (part of sequence)', () => {
					// Note that first 2 chars of both emoji are the same.
					expectDiff( 'a👩‍🦰b', 'a👩b', [
						{ index: 3, type: 'delete', howMany: 3 }
					] );
				} );

				it( 'should properly replace simple emoji with other ZWJ sequence', () => {
					// Note that first char of both emoji is the same.
					expectDiff( 'a🙂b', 'a👩‍🦰b', [
						{ index: 2, type: 'insert', values: womanRedHairEmoji.slice( 1 ) },
						{ index: 6, type: 'delete', howMany: 1 }
					] );
				} );
			} );
		} );
	} );

	describe( 'changes linear', () => {
		it( 'should diff identical texts', () => {
			expectDiffLinear( '123', '123', 'eee' );
		} );

		it( 'should diff identical arrays', () => {
			expectDiffLinear( [ '1', '2', '3' ], [ '1', '2', '3' ], 'eee' );
		} );

		it( 'should diff arrays with custom comparator', () => {
			expectDiffLinear( [ 'a', 'b', 'c' ], [ 'A', 'B', 'C' ], 'eee', true, ( a, b ) => a.toLowerCase() === b.toLowerCase() );
		} );

		describe( 'insertion', () => {
			it( 'should diff if old text is empty', () => {
				expectDiffLinear( '', '123', 'iii' );
			} );

			it( 'should diff if old array is empty', () => {
				expectDiffLinear( [], [ '1', '2', '3' ], 'iii' );
			} );

			it( 'should diff insertion on the beginning', () => {
				expectDiffLinear( '123', 'abc123', 'iiieee' );
			} );

			it( 'should diff insertion on the beginning (repetitive substring)', () => {
				expectDiffLinear( '123', 'ab123c123', 'iiiiiieee', false );
			} );

			it( 'should diff insertion on the end', () => {
				expectDiffLinear( '123', '123abc', 'eeeiii' );
			} );

			it( 'should diff insertion on the end (repetitive substring)', () => {
				expectDiffLinear( '123', '123ab123c', 'eeeiiiiii' );
			} );

			it( 'should diff insertion in the middle', () => {
				expectDiffLinear( '123', '12abc3', 'eeiiie' );
			} );

			it( 'should diff insertion in the middle (repetitive substring)', () => {
				expectDiffLinear( '123', '12ab123c3', 'eeiiiiiie', false );
			} );

			it( 'should diff insertion of duplicated content', () => {
				expectDiffLinear( '123', '123123', 'eeeiii' );
			} );

			it( 'should diff insertion of partially duplicated content', () => {
				expectDiffLinear( '123', '12323', 'eeeii' );
			} );

			it( 'should diff insertion on both boundaries', () => {
				expectDiffLinear( '123', 'ab123c', 'iiiiiiddd', false );
			} );

			it( 'should diff insertion in array of objects', () => {
				const o1 = { foo: 1 };
				const o2 = { bar: 2 };

				expectDiffLinear( [ o1, o2 ], [ o1, o2, { baz: 3 } ], 'eei' );
			} );

			it( 'should diff insertion in array of objects with comparator', () => {
				expectDiffLinear( [ { text: 'foo' }, { text: 'bar' } ], [ { text: 'foo' }, { text: 'bar' }, { text: 'baz' } ],
					'eei', true, ( a, b ) => a.text === b.text );
			} );
		} );

		describe( 'deletion', () => {
			it( 'should diff if new text is empty', () => {
				expectDiffLinear( '123', '', 'ddd' );
			} );

			it( 'should diff if new array is empty', () => {
				expectDiffLinear( [ '1', '2', '3' ], [], 'ddd' );
			} );

			it( 'should diff deletion on the beginning', () => {
				expectDiffLinear( 'abc123', '123', 'dddeee' );
			} );

			it( 'should diff deletion on the beginning (repetitive substring)', () => {
				expectDiffLinear( 'ab123c123', '123', 'ddddddeee', false );
			} );

			it( 'should diff deletion on the end', () => {
				expectDiffLinear( '123abc', '123', 'eeeddd' );
			} );

			it( 'should diff deletion on the end (repetitive substring)', () => {
				expectDiffLinear( '123ab123c', '123', 'eeedddddd' );
			} );

			it( 'should diff deletion in the middle', () => {
				expectDiffLinear( '12abc3', '123', 'eeddde' );
			} );

			it( 'should diff deletion in the middle (repetitive substring)', () => {
				expectDiffLinear( '12ab123c3', '123', 'eedddddde', false );
			} );

			it( 'should diff deletion on both boundaries', () => {
				expectDiffLinear( '12abc3', '2ab', 'iiidddddd', false );
			} );

			it( 'should diff deletion of duplicated content', () => {
				expectDiffLinear( '123123', '123', 'eeeddd' );
			} );

			it( 'should diff deletion of partially duplicated content', () => {
				expectDiffLinear( '12323', '123', 'eeedd' );
			} );

			it( 'should diff deletion of partially duplicated content 2', () => {
				expectDiffLinear( '11233', '13', 'eddde', false );
			} );

			it( 'should diff deletion in array of objects', () => {
				const o1 = { foo: 1 };
				const o2 = { bar: 2 };

				expectDiffLinear( [ o1, o2 ], [ o2 ], 'de' );
			} );

			it( 'should diff insertion in array of objects with comparator', () => {
				expectDiffLinear( [ { text: 'foo' }, { text: 'bar' } ], [ { text: 'bar' } ], 'de', true, ( a, b ) => a.text === b.text );
			} );
		} );

		describe( 'replacement', () => {
			it( 'should diff replacement of entire text', () => {
				expectDiffLinear( '12345', 'abcd', 'iiiiddddd', false );
			} );

			it( 'should diff replacement on the beginning', () => {
				expectDiffLinear( '12345', 'abcd345', 'iiiiddeee' );
			} );

			it( 'should diff replacement on the beginning (repetitive substring)', () => {
				expectDiffLinear( '12345', '345345', 'iiiddeee', false );
			} );

			it( 'should diff replacement on the end', () => {
				expectDiffLinear( '12345', '12ab', 'eeiiddd', false );
			} );

			it( 'should diff replacement on the end (repetitive substring)', () => {
				expectDiffLinear( '12345', '1231234', 'eeeiiiidd', false );
			} );

			it( 'should diff insertion of duplicated content - case 1', () => {
				expectDiffLinear( '1234', '123123', 'eeeiiid' );
			} );

			it( 'should diff insertion of duplicated content - case 2', () => {
				expectDiffLinear( '1234', '13424', 'eiiidde', false );
			} );

			it( 'should diff replacement in the middle', () => {
				expectDiffLinear( '12345', '12ab5', 'eeiidde' );
			} );

			it( 'should diff replacement in the middle (repetitive substring)', () => {
				expectDiffLinear( '12345', '12123455', 'eeiiiiidde', false );
			} );

			it( 'should diff replacement of duplicated content', () => {
				expectDiffLinear( '123123', '123333', 'eeeiidde', false );
			} );

			it( 'should diff replacement in array of objects', () => {
				const o1 = { foo: 1 };
				const o2 = { bar: 2 };

				expectDiffLinear( [ o1, o2 ], [ o1, { baz: 3 } ], 'eid' );
			} );

			it( 'should diff insertion in array of objects with comparator', () => {
				expectDiffLinear( [ { text: 'foo' }, { text: 'bar' } ], [ { text: 'foo' }, { text: 'baz' } ], 'eid',
					true, ( a, b ) => a.text === b.text );
			} );
		} );
	} );
} );

function expectDiff( oldText, newText, expected, checkDiffToChangesCompatibility = true, comparator = null ) {
	const result = fastDiff( oldText, newText, comparator );

	expect( result ).to.deep.equal( expected, 'fastDiff changes failed' );

	if ( checkDiffToChangesCompatibility ) {
		expect( result ).to.deep.equal(
			diffToChanges( diff( oldText, newText, comparator ), newText ), 'diffToChanges compatibility failed' );
	}
}

function expectDiffLinear( oldText, newText, expected, checkDiffCompatibility = true, comparator = null ) {
	const actions = { d: 'delete', e: 'equal', i: 'insert' };
	const expectedArray = expected.split( '' ).map( item => actions[ item ] );
	const result = fastDiff( oldText, newText, comparator, true );

	expect( result ).to.deep.equal( expectedArray, 'fastDiff linear result failed' );

	if ( checkDiffCompatibility ) {
		expect( result ).to.deep.equal( diff( oldText, newText, comparator ), 'diff compatibility failed' );
	}
}
