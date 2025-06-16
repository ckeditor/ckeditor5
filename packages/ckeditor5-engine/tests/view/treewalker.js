/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewDocument } from '../../src/view/document.js';
import { ViewDocumentFragment } from '../../src/view/documentfragment.js';
import { ViewAttributeElement } from '../../src/view/attributeelement.js';
import { ViewContainerElement } from '../../src/view/containerelement.js';
import { ViewText } from '../../src/view/text.js';
import { ViewTreeWalker } from '../../src/view/treewalker.js';
import { ViewPosition } from '../../src/view/position.js';
import { ViewRange } from '../../src/view/range.js';
import { createViewRoot } from './_utils/createroot.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'TreeWalker', () => {
	let doc, root, img1, paragraph, bold, textAbcd, charY, img2, charX, rootBeginning, rootEnding;

	beforeEach( () => {
		doc = new ViewDocument( new StylesProcessor() );
		root = createViewRoot( doc );

		// root
		//  |- img1
		//  |- p
		//     |- b
		//     |  |- abcd
		//     |
		//     |- Y
		//     |
		//     |- img2
		//     |
		//     |- X

		textAbcd = new ViewText( doc, 'abcd' );
		bold = new ViewAttributeElement( doc, 'b', null, [ textAbcd ] );
		charY = new ViewText( doc, 'y' );
		img2 = new ViewContainerElement( doc, 'img2' );
		charX = new ViewText( doc, 'x' );

		paragraph = new ViewContainerElement( doc, 'p', null, [ bold, charY, img2, charX ] );
		img1 = new ViewContainerElement( doc, 'img1' );

		root._insertChild( 0, [ img1, paragraph ] );

		rootBeginning = new ViewPosition( root, 0 );
		rootEnding = new ViewPosition( root, 2 );
	} );

	afterEach( () => {
		doc.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should throw if neither boundaries nor starting position is set', () => {
			expectToThrowCKEditorError( () => {
				new ViewTreeWalker(); // eslint-disable-line no-new
			}, /^view-tree-walker-no-start-position/, null );

			expectToThrowCKEditorError( () => {
				new ViewTreeWalker( {} ); // eslint-disable-line no-new
			}, /^view-tree-walker-no-start-position/, null );

			expectToThrowCKEditorError( () => {
				new ViewTreeWalker( { singleCharacters: true } ); // eslint-disable-line no-new
			}, /^view-tree-walker-no-start-position/, null );
		} );

		it( 'should throw if walking direction is unknown', () => {
			expectToThrowCKEditorError( () => {
				new ViewTreeWalker( { startPosition: rootBeginning, direction: 'unknown' } ); // eslint-disable-line no-new
			}, /^view-tree-walker-unknown-direction/, doc );
		} );
	} );

	describe( 'iterate from start position `startPosition`', () => {
		let expected;

		beforeEach( () => {
			expected = [
				{
					type: 'elementStart',
					item: img1,
					previousPosition: new ViewPosition( root, 0 ),
					nextPosition: new ViewPosition( img1, 0 )
				},
				{
					type: 'elementEnd',
					item: img1,
					previousPosition: new ViewPosition( img1, 0 ),
					nextPosition: new ViewPosition( root, 1 )
				},
				{
					type: 'elementStart',
					item: paragraph,
					previousPosition: new ViewPosition( root, 1 ),
					nextPosition: new ViewPosition( paragraph, 0 )
				},
				{
					type: 'elementStart',
					item: bold,
					previousPosition: new ViewPosition( paragraph, 0 ),
					nextPosition: new ViewPosition( bold, 0 )
				},
				{
					type: 'text',
					text: 'abcd',
					previousPosition: new ViewPosition( bold, 0 ),
					nextPosition: new ViewPosition( bold, 1 )
				},
				{
					type: 'elementEnd',
					item: bold,
					previousPosition: new ViewPosition( bold, 1 ),
					nextPosition: new ViewPosition( paragraph, 1 )
				},
				{
					type: 'text',
					text: 'y',
					previousPosition: new ViewPosition( paragraph, 1 ),
					nextPosition: new ViewPosition( paragraph, 2 )
				},
				{
					type: 'elementStart',
					item: img2,
					previousPosition: new ViewPosition( paragraph, 2 ),
					nextPosition: new ViewPosition( img2, 0 )
				},
				{
					type: 'elementEnd',
					item: img2,
					previousPosition: new ViewPosition( img2, 0 ),
					nextPosition: new ViewPosition( paragraph, 3 )
				},
				{
					type: 'text',
					text: 'x',
					previousPosition: new ViewPosition( paragraph, 3 ),
					nextPosition: new ViewPosition( paragraph, 4 )
				},
				{
					type: 'elementEnd',
					item: paragraph,
					previousPosition: new ViewPosition( paragraph, 4 ),
					nextPosition: new ViewPosition( root, 2 )
				}
			];
		} );

		it( 'should provide iterator interface with default forward direction', () => {
			const iterator = new ViewTreeWalker( { startPosition: rootBeginning } );
			let i = 0;

			for ( const value of iterator ) {
				expectValue( value, expected[ i++ ] );
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should provide iterator interface with forward direction', () => {
			const iterator = new ViewTreeWalker( { startPosition: rootBeginning, direction: 'forward' } );
			let i = 0;

			for ( const value of iterator ) {
				expectValue( value, expected[ i++ ] );
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should provide iterator interface which backward direction', () => {
			const iterator = new ViewTreeWalker( { startPosition: rootEnding, direction: 'backward' } );
			let i = expected.length;

			for ( const value of iterator ) {
				expectValue( value, expected[ --i ], { direction: 'backward' } );
			}

			expect( i ).to.equal( 0 );
		} );

		it( 'should start iterating at the startPosition witch is not a root bound', () => {
			const iterator = new ViewTreeWalker( { startPosition: new ViewPosition( root, 1 ) } );
			let i = 2;

			for ( const value of iterator ) {
				expectValue( value, expected[ i++ ] );
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should start iterating at the startPosition witch is not a root bound, going backward', () => {
			const expected = [
				{
					type: 'elementStart',
					item: img1,
					previousPosition: new ViewPosition( root, 0 ),
					nextPosition: new ViewPosition( img1, 0 )
				},
				{
					type: 'elementEnd',
					item: img1,
					previousPosition: new ViewPosition( img1, 0 ),
					nextPosition: new ViewPosition( root, 1 )
				}
			];

			const iterator = new ViewTreeWalker( { startPosition: new ViewPosition( root, 1 ), direction: 'backward' } );
			let i = expected.length;

			for ( const value of iterator ) {
				expectValue( value, expected[ --i ], { direction: 'backward' } );
			}

			expect( i ).to.equal( 0 );
		} );
	} );

	describe( 'iterate trough the range `boundary`', () => {
		describe( 'range starts between elements', () => {
			let expected, range;

			beforeEach( () => {
				expected = [
					{
						type: 'elementStart',
						item: paragraph,
						previousPosition: new ViewPosition( root, 1 ),
						nextPosition: new ViewPosition( paragraph, 0 )
					},
					{
						type: 'elementStart',
						item: bold,
						previousPosition: new ViewPosition( paragraph, 0 ),
						nextPosition: new ViewPosition( bold, 0 )
					},
					{
						type: 'text',
						text: 'abcd',
						previousPosition: new ViewPosition( bold, 0 ),
						nextPosition: new ViewPosition( bold, 1 )
					},
					{
						type: 'elementEnd',
						item: bold,
						previousPosition: new ViewPosition( bold, 1 ),
						nextPosition: new ViewPosition( paragraph, 1 )
					},
					{
						type: 'text',
						text: 'y',
						previousPosition: new ViewPosition( paragraph, 1 ),
						nextPosition: new ViewPosition( paragraph, 2 )
					},
					{
						type: 'elementStart',
						item: img2,
						previousPosition: new ViewPosition( paragraph, 2 ),
						nextPosition: new ViewPosition( img2, 0 )
					},
					{
						type: 'elementEnd',
						item: img2,
						previousPosition: new ViewPosition( img2, 0 ),
						nextPosition: new ViewPosition( paragraph, 3 )
					}
				];

				range = ViewRange._createFromParentsAndOffsets( root, 1, paragraph, 3 );
			} );

			it( 'should iterating over the range', () => {
				const iterator = new ViewTreeWalker( { boundaries: range } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should iterating over the range going backward', () => {
				const iterator = new ViewTreeWalker( { boundaries: range, direction: 'backward' } );
				let i = expected.length;

				for ( const value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'range starts inside the text', () => {
			let expected, range;

			beforeEach( () => {
				expected = [
					{
						type: 'text',
						text: 'bcd',
						previousPosition: new ViewPosition( textAbcd, 1 ),
						nextPosition: new ViewPosition( bold, 1 )
					},
					{
						type: 'elementEnd',
						item: bold,
						previousPosition: new ViewPosition( bold, 1 ),
						nextPosition: new ViewPosition( paragraph, 1 )
					},
					{
						type: 'text',
						text: 'y',
						previousPosition: new ViewPosition( paragraph, 1 ),
						nextPosition: new ViewPosition( paragraph, 2 )
					},
					{
						type: 'elementStart',
						item: img2,
						previousPosition: new ViewPosition( paragraph, 2 ),
						nextPosition: new ViewPosition( img2, 0 )
					},
					{
						type: 'elementEnd',
						item: img2,
						previousPosition: new ViewPosition( img2, 0 ),
						nextPosition: new ViewPosition( paragraph, 3 )
					}
				];

				range = ViewRange._createFromParentsAndOffsets( textAbcd, 1, paragraph, 3 );
			} );

			it( 'should return part of the text', () => {
				const iterator = new ViewTreeWalker( { boundaries: range } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return part of the text going backward', () => {
				const iterator = new ViewTreeWalker( {
					boundaries: range,
					direction: 'backward'
				}
				);
				let i = expected.length;

				for ( const value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'range ends inside the text', () => {
			let expected, range;

			beforeEach( () => {
				expected = [
					{
						type: 'elementStart',
						item: img1,
						previousPosition: new ViewPosition( root, 0 ),
						nextPosition: new ViewPosition( img1, 0 )
					},
					{
						type: 'elementEnd',
						item: img1,
						previousPosition: new ViewPosition( img1, 0 ),
						nextPosition: new ViewPosition( root, 1 )
					},
					{
						type: 'elementStart',
						item: paragraph,
						previousPosition: new ViewPosition( root, 1 ),
						nextPosition: new ViewPosition( paragraph, 0 )
					},
					{
						type: 'elementStart',
						item: bold,
						previousPosition: new ViewPosition( paragraph, 0 ),
						nextPosition: new ViewPosition( bold, 0 )
					},
					{
						type: 'text',
						text: 'ab',
						previousPosition: new ViewPosition( bold, 0 ),
						nextPosition: new ViewPosition( textAbcd, 2 )
					}
				];

				range = new ViewRange( rootBeginning, new ViewPosition( textAbcd, 2 ) );
			} );

			it( 'should return part of the text', () => {
				const iterator = new ViewTreeWalker( { boundaries: range } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return part of the text going backward', () => {
				const iterator = new ViewTreeWalker( {
					boundaries: range,
					startPosition: range.end,
					direction: 'backward'
				} );

				let i = expected.length;

				for ( const value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'range starts and ends inside the same text', () => {
			let expected, range;

			beforeEach( () => {
				expected = [
					{
						type: 'text',
						text: 'bc',
						previousPosition: new ViewPosition( textAbcd, 1 ),
						nextPosition: new ViewPosition( textAbcd, 3 )
					}
				];

				range = new ViewRange( new ViewPosition( textAbcd, 1 ), new ViewPosition( textAbcd, 3 ) );
			} );

			it( 'should return part of the text', () => {
				const iterator = new ViewTreeWalker( { boundaries: range } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return part of the text going backward', () => {
				const iterator = new ViewTreeWalker( {
					boundaries: range,
					startPosition: range.end,
					direction: 'backward'
				} );

				let i = expected.length;

				for ( const value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'custom start position', () => {
			it( 'should iterating from the start position', () => {
				const expected = [
					{
						type: 'text',
						text: 'y',
						previousPosition: new ViewPosition( paragraph, 1 ),
						nextPosition: new ViewPosition( paragraph, 2 )
					},
					{
						type: 'elementStart',
						item: img2,
						previousPosition: new ViewPosition( paragraph, 2 ),
						nextPosition: new ViewPosition( img2, 0 )
					},
					{
						type: 'elementEnd',
						item: img2,
						previousPosition: new ViewPosition( img2, 0 ),
						nextPosition: new ViewPosition( paragraph, 3 )
					}
				];

				const range = ViewRange._createFromParentsAndOffsets( bold, 1, paragraph, 3 );

				const iterator = new ViewTreeWalker( {
					boundaries: range,
					startPosition: new ViewPosition( paragraph, 1 )
				} );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should iterating from the start position going backward', () => {
				const expected = [
					{
						type: 'text',
						text: 'bcd',
						previousPosition: new ViewPosition( textAbcd, 1 ),
						nextPosition: new ViewPosition( bold, 1 )
					},
					{
						type: 'elementEnd',
						item: bold,
						previousPosition: new ViewPosition( bold, 1 ),
						nextPosition: new ViewPosition( paragraph, 1 )
					},
					{
						type: 'text',
						text: 'y',
						previousPosition: new ViewPosition( paragraph, 1 ),
						nextPosition: new ViewPosition( paragraph, 2 )
					}
				];

				const range = new ViewRange( new ViewPosition( textAbcd, 1 ), new ViewPosition( paragraph, 3 ) );

				const iterator = new ViewTreeWalker( {
					boundaries: range,
					startPosition: new ViewPosition( paragraph, 2 ),
					direction: 'backward'
				} );
				let i = expected.length;

				for ( const value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'iterate by every single characters `singleCharacter`', () => {
		describe( 'whole root', () => {
			let expected;

			beforeEach( () => {
				expected = [
					{
						type: 'elementStart',
						item: img1,
						previousPosition: new ViewPosition( root, 0 ),
						nextPosition: new ViewPosition( img1, 0 )
					},
					{
						type: 'elementEnd',
						item: img1,
						previousPosition: new ViewPosition( img1, 0 ),
						nextPosition: new ViewPosition( root, 1 )
					},
					{
						type: 'elementStart',
						item: paragraph,
						previousPosition: new ViewPosition( root, 1 ),
						nextPosition: new ViewPosition( paragraph, 0 )
					},
					{
						type: 'elementStart',
						item: bold,
						previousPosition: new ViewPosition( paragraph, 0 ),
						nextPosition: new ViewPosition( bold, 0 )
					},
					{
						type: 'text',
						text: 'a',
						previousPosition: new ViewPosition( bold, 0 ),
						nextPosition: new ViewPosition( textAbcd, 1 )
					},
					{
						type: 'text',
						text: 'b',
						previousPosition: new ViewPosition( textAbcd, 1 ),
						nextPosition: new ViewPosition( textAbcd, 2 )
					},
					{
						type: 'text',
						text: 'c',
						previousPosition: new ViewPosition( textAbcd, 2 ),
						nextPosition: new ViewPosition( textAbcd, 3 )
					},
					{
						type: 'text',
						text: 'd',
						previousPosition: new ViewPosition( textAbcd, 3 ),
						nextPosition: new ViewPosition( bold, 1 )
					},
					{
						type: 'elementEnd',
						item: bold,
						previousPosition: new ViewPosition( bold, 1 ),
						nextPosition: new ViewPosition( paragraph, 1 )
					},
					{
						type: 'text',
						text: 'y',
						previousPosition: new ViewPosition( paragraph, 1 ),
						nextPosition: new ViewPosition( paragraph, 2 )
					},
					{
						type: 'elementStart',
						item: img2,
						previousPosition: new ViewPosition( paragraph, 2 ),
						nextPosition: new ViewPosition( img2, 0 )
					},
					{
						type: 'elementEnd',
						item: img2,
						previousPosition: new ViewPosition( img2, 0 ),
						nextPosition: new ViewPosition( paragraph, 3 )
					},
					{
						type: 'text',
						text: 'x',
						previousPosition: new ViewPosition( paragraph, 3 ),
						nextPosition: new ViewPosition( paragraph, 4 )
					},
					{
						type: 'elementEnd',
						item: paragraph,
						previousPosition: new ViewPosition( paragraph, 4 ),
						nextPosition: new ViewPosition( root, 2 )
					}
				];
			} );

			it( 'should return single characters', () => {
				const iterator = new ViewTreeWalker( { startPosition: rootBeginning, singleCharacters: true } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return single characters going backward', () => {
				const iterator = new ViewTreeWalker( {
					startPosition: rootEnding,
					singleCharacters: true,
					direction: 'backward'
				} );
				let i = expected.length;

				for ( const value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'range', () => {
			let range, expected;

			beforeEach( () => {
				expected = [
					{
						type: 'text',
						text: 'a',
						previousPosition: new ViewPosition( bold, 0 ),
						nextPosition: new ViewPosition( textAbcd, 1 )
					},
					{
						type: 'text',
						text: 'b',
						previousPosition: new ViewPosition( textAbcd, 1 ),
						nextPosition: new ViewPosition( textAbcd, 2 )
					},
					{
						type: 'text',
						text: 'c',
						previousPosition: new ViewPosition( textAbcd, 2 ),
						nextPosition: new ViewPosition( textAbcd, 3 )
					},
					{
						type: 'text',
						text: 'd',
						previousPosition: new ViewPosition( textAbcd, 3 ),
						nextPosition: new ViewPosition( bold, 1 )
					},
					{
						type: 'elementEnd',
						item: bold,
						previousPosition: new ViewPosition( bold, 1 ),
						nextPosition: new ViewPosition( paragraph, 1 )
					},
					{
						type: 'text',
						text: 'y',
						previousPosition: new ViewPosition( paragraph, 1 ),
						nextPosition: new ViewPosition( paragraph, 2 )
					},
					{
						type: 'elementStart',
						item: img2,
						previousPosition: new ViewPosition( paragraph, 2 ),
						nextPosition: new ViewPosition( img2, 0 )
					}
				];

				range = new ViewRange( new ViewPosition( bold, 0 ), new ViewPosition( img2, 0 ) );
			} );

			it( 'should respect boundaries', () => {
				const iterator = new ViewTreeWalker( { boundaries: range, singleCharacters: true } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should respect boundaries going backward', () => {
				const iterator = new ViewTreeWalker( {
					boundaries: range,
					singleCharacters: true,
					direction: 'backward'
				} );
				let i = expected.length;

				for ( const value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );
	} );

	describe( '`shallow` iterates only through elements in the range', () => {
		it( '`shallow` only iterates elements in the range (forward)', () => {
			const walker = new ViewTreeWalker( {
				boundaries: new ViewRange(
					new ViewPosition( root, 0 ),
					new ViewPosition( img1, 0 )
				),
				shallow: true
			} );

			const items = Array.from( walker );

			expect( items.length ).to.equal( 1 );
			expect( items[ 0 ].type ).to.equal( 'elementStart' );
			expect( items[ 0 ].item ).to.equal( img1 );
		} );

		it( '`shallow` only iterates elements in the range that ends inside some element (forward)', () => {
			const p2 = new ViewContainerElement( doc, 'p', null, [ new ViewText( doc, 'abc' ) ] );
			const p3 = new ViewContainerElement( doc, 'p', null, [ new ViewText( doc, 'abc' ) ] );

			root._insertChild( 2, [ p2, p3 ] );

			const walker = new ViewTreeWalker( {
				boundaries: new ViewRange(
					new ViewPosition( root, 1 ),
					new ViewPosition( paragraph, 3 )
				),
				shallow: true
			} );

			const items = Array.from( walker );

			expect( items.length ).to.equal( 1 );
			expect( items[ 0 ].type ).to.equal( 'elementStart' );
			expect( items[ 0 ].item ).to.equal( paragraph );
		} );

		it( '`shallow` only iterates elements in the range ends deep inside some element (forward)', () => {
			const p2 = new ViewContainerElement( doc, 'p', null, [ new ViewText( doc, 'abc' ) ] );
			const p3 = new ViewContainerElement( doc, 'p', null, [ new ViewText( doc, 'abc' ) ] );

			root._insertChild( 2, [ p2, p3 ] );

			const walker = new ViewTreeWalker( {
				boundaries: new ViewRange(
					new ViewPosition( root, 1 ),
					new ViewPosition( img2, 0 )
				),
				shallow: true
			} );

			const items = Array.from( walker );

			expect( items.length ).to.equal( 1 );
			expect( items[ 0 ].type ).to.equal( 'elementStart' );
			expect( items[ 0 ].item ).to.equal( paragraph );
		} );

		it( '`shallow` only iterates elements in the range (backwards)', () => {
			const walker = new ViewTreeWalker( {
				boundaries: new ViewRange(
					new ViewPosition( root, 0 ),
					new ViewPosition( img1, 0 )
				),
				shallow: true,
				direction: 'backward'
			} );

			const items = Array.from( walker );

			expect( items.length ).to.equal( 1 );
			expect( items[ 0 ].type ).to.equal( 'elementStart' );
			expect( items[ 0 ].item ).to.equal( img1 );
		} );
	} );

	describe( 'iterate omitting child nodes and elementEnd `shallow`', () => {
		let expected;

		beforeEach( () => {
			expected = [
				{
					type: 'elementStart',
					item: img1,
					previousPosition: new ViewPosition( root, 0 ),
					nextPosition: new ViewPosition( root, 1 )
				},
				{
					type: 'elementStart',
					item: paragraph,
					previousPosition: new ViewPosition( root, 1 ),
					nextPosition: new ViewPosition( root, 2 )
				}
			];
		} );

		it( 'should not enter elements', () => {
			const iterator = new ViewTreeWalker( { startPosition: rootBeginning, shallow: true } );
			let i = 0;

			for ( const value of iterator ) {
				expectValue( value, expected[ i++ ] );
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should not enter elements going backward', () => {
			const iterator = new ViewTreeWalker( { startPosition: rootEnding, shallow: true, direction: 'backward' } );
			let i = expected.length;

			for ( const value of iterator ) {
				expectValue( value, expected[ --i ], { direction: 'backward' } );
			}

			expect( i ).to.equal( 0 );
		} );
	} );

	describe( 'iterate omitting elementEnd `ignoreElementEnd`', () => {
		describe( 'merged text', () => {
			let expected;

			beforeEach( () => {
				expected = [
					{
						type: 'elementStart',
						item: img1,
						previousPosition: new ViewPosition( root, 0 ),
						nextPosition: new ViewPosition( img1, 0 )
					},
					{
						type: 'elementStart',
						item: paragraph,
						previousPosition: new ViewPosition( root, 1 ),
						nextPosition: new ViewPosition( paragraph, 0 )
					},
					{
						type: 'elementStart',
						item: bold,
						previousPosition: new ViewPosition( paragraph, 0 ),
						nextPosition: new ViewPosition( bold, 0 )
					},
					{
						type: 'text',
						text: 'abcd',
						previousPosition: new ViewPosition( bold, 0 ),
						nextPosition: new ViewPosition( bold, 1 )
					},
					{
						type: 'text',
						text: 'y',
						previousPosition: new ViewPosition( paragraph, 1 ),
						nextPosition: new ViewPosition( paragraph, 2 )
					},
					{
						type: 'elementStart',
						item: img2,
						previousPosition: new ViewPosition( paragraph, 2 ),
						nextPosition: new ViewPosition( img2, 0 )
					},
					{
						type: 'text',
						text: 'x',
						previousPosition: new ViewPosition( paragraph, 3 ),
						nextPosition: new ViewPosition( paragraph, 4 )
					}
				];
			} );

			it( 'should iterate ignoring elementEnd', () => {
				const iterator = new ViewTreeWalker( { startPosition: rootBeginning, ignoreElementEnd: true } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should iterate ignoring elementEnd going backward', () => {
				const iterator = new ViewTreeWalker( {
					startPosition: rootEnding,
					ignoreElementEnd: true,
					direction: 'backward'
				} );
				let i = expected.length;

				for ( const value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'single character', () => {
			let expected;

			beforeEach( () => {
				expected = [
					{
						type: 'elementStart',
						item: img1,
						previousPosition: new ViewPosition( root, 0 ),
						nextPosition: new ViewPosition( img1, 0 )
					},
					{
						type: 'elementStart',
						item: paragraph,
						previousPosition: new ViewPosition( root, 1 ),
						nextPosition: new ViewPosition( paragraph, 0 )
					},
					{
						type: 'elementStart',
						item: bold,
						previousPosition: new ViewPosition( paragraph, 0 ),
						nextPosition: new ViewPosition( bold, 0 )
					},
					{
						type: 'text',
						text: 'a',
						previousPosition: new ViewPosition( bold, 0 ),
						nextPosition: new ViewPosition( textAbcd, 1 )
					},
					{
						type: 'text',
						text: 'b',
						previousPosition: new ViewPosition( textAbcd, 1 ),
						nextPosition: new ViewPosition( textAbcd, 2 )
					},
					{
						type: 'text',
						text: 'c',
						previousPosition: new ViewPosition( textAbcd, 2 ),
						nextPosition: new ViewPosition( textAbcd, 3 )
					},
					{
						type: 'text',
						text: 'd',
						previousPosition: new ViewPosition( textAbcd, 3 ),
						nextPosition: new ViewPosition( bold, 1 )
					},
					{
						type: 'text',
						text: 'y',
						previousPosition: new ViewPosition( paragraph, 1 ),
						nextPosition: new ViewPosition( paragraph, 2 )
					},
					{
						type: 'elementStart',
						item: img2,
						previousPosition: new ViewPosition( paragraph, 2 ),
						nextPosition: new ViewPosition( img2, 0 )
					},
					{
						type: 'text',
						text: 'x',
						previousPosition: new ViewPosition( paragraph, 3 ),
						nextPosition: new ViewPosition( paragraph, 4 )
					}
				];
			} );

			it( 'should return single characters ignoring elementEnd', () => {
				const iterator = new ViewTreeWalker( {
					startPosition: rootBeginning,
					singleCharacters: true,
					ignoreElementEnd: true
				} );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return single characters ignoring elementEnd going backward', () => {
				const iterator = new ViewTreeWalker( {
					startPosition: rootEnding,
					singleCharacters: true,
					ignoreElementEnd: true,
					direction: 'backward'
				} );
				let i = expected.length;

				for ( const value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );
	} );

	it( 'should not return elementEnd for a text node when iteration begins at the end of that text node', () => {
		const iterator = new ViewTreeWalker( {
			startPosition: ViewPosition._createAt( textAbcd, 'end' )
		} );

		const step = iterator.next();

		expect( step.value.type ).to.equal( 'elementEnd' );
		expect( step.value.item ).to.equal( bold );
	} );

	it( 'should not return elementStart for a text node when iteration begins at the start of that text node', () => {
		const iterator = new ViewTreeWalker( {
			startPosition: ViewPosition._createAt( textAbcd, 0 ),
			direction: 'backward'
		} );

		const step = iterator.next();

		expect( step.value.type ).to.equal( 'elementStart' );
		expect( step.value.item ).to.equal( bold );
	} );

	it( 'should iterate over document fragment', () => {
		const foo = new ViewText( doc, 'foo' );
		const bar = new ViewText( doc, 'bar' );
		const p = new ViewContainerElement( doc, 'p', null, foo );
		const b = new ViewAttributeElement( doc, 'b', null, bar );
		const docFrag = new ViewDocumentFragment( doc, [ p, b ] );

		const expected = [
			{
				type: 'elementStart',
				item: p,
				previousPosition: new ViewPosition( docFrag, 0 ),
				nextPosition: new ViewPosition( p, 0 )
			},
			{
				type: 'text',
				text: 'foo',
				previousPosition: new ViewPosition( p, 0 ),
				nextPosition: new ViewPosition( p, 1 )
			},
			{
				type: 'elementEnd',
				item: p,
				previousPosition: new ViewPosition( p, 1 ),
				nextPosition: new ViewPosition( docFrag, 1 )
			},
			{
				type: 'elementStart',
				item: b,
				previousPosition: new ViewPosition( docFrag, 1 ),
				nextPosition: new ViewPosition( b, 0 )
			},
			{
				type: 'text',
				text: 'bar',
				previousPosition: new ViewPosition( b, 0 ),
				nextPosition: new ViewPosition( b, 1 )
			},
			{
				type: 'elementEnd',
				item: b,
				previousPosition: new ViewPosition( b, 1 ),
				nextPosition: new ViewPosition( docFrag, 2 )
			}
		];

		const iterator = new ViewTreeWalker( { boundaries: ViewRange._createIn( docFrag ) } );
		let i = 0;

		for ( const value of iterator ) {
			expectValue( value, expected[ i++ ] );
		}

		expect( i ).to.equal( expected.length );
	} );

	describe( 'skip', () => {
		describe( 'forward treewalker', () => {
			it( 'should jump over all text nodes', () => {
				const walker = new ViewTreeWalker( {
					startPosition: new ViewPosition( paragraph, 0 )
				} );

				walker.skip( value => value.type == 'text' || value.item.name == 'b' );

				expect( walker.position.parent ).to.equal( paragraph );
				expect( walker.position.offset ).to.equal( 2 );
			} );

			it( 'should do not move if the condition is false', () => {
				const walker = new ViewTreeWalker( {
					startPosition: new ViewPosition( bold, 0 )
				} );

				walker.skip( () => false );

				expect( walker.position.parent ).to.equal( bold );
				expect( walker.position.offset ).to.equal( 0 );
			} );

			it( 'should do not move if the condition is false and the position is in text node', () => {
				const walker = new ViewTreeWalker( {
					startPosition: new ViewPosition( bold.getChild( 0 ), 2 )
				} );

				walker.skip( () => false );

				expect( walker.position.parent ).to.equal( bold.getChild( 0 ) );
				expect( walker.position.offset ).to.equal( 2 );
			} );

			it( 'should move to the end if the condition is true', () => {
				const walker = new ViewTreeWalker( {
					startPosition: new ViewPosition( bold, 0 )
				} );

				walker.skip( () => true );

				expect( walker.position.parent ).to.equal( rootEnding.parent );
				expect( walker.position.offset ).to.equal( rootEnding.offset );
			} );
		} );

		describe( 'backward treewalker', () => {
			it( 'should jump over all text nodes', () => {
				const walker = new ViewTreeWalker( {
					startPosition: new ViewPosition( bold.getChild( 0 ), 2 ),
					direction: 'backward'
				} );

				walker.skip( value => value.type == 'text' || value.item.name == 'b' );

				expect( walker.position.parent ).to.equal( paragraph );
				expect( walker.position.offset ).to.equal( 0 );
			} );

			it( 'should do not move if the condition is false', () => {
				const walker = new ViewTreeWalker( {
					startPosition: new ViewPosition( bold, 0 ),
					direction: 'backward'
				} );

				walker.skip( () => false );

				expect( walker.position.parent ).to.equal( bold );
				expect( walker.position.offset ).to.equal( 0 );
			} );

			it( 'should move to the end if the condition is true', () => {
				const walker = new ViewTreeWalker( {
					startPosition: new ViewPosition( bold, 0 ),
					direction: 'backward'
				} );

				walker.skip( () => true );

				expect( walker.position.parent ).to.equal( rootBeginning.parent );
				expect( walker.position.offset ).to.equal( rootBeginning.offset );
			} );
		} );
	} );

	describe( 'jumpTo', () => {
		it( 'should jump to the given position', () => {
			const walker = new ViewTreeWalker( {
				startPosition: ViewPosition._createAt( paragraph, 0 )
			} );

			walker.jumpTo( new ViewPosition( paragraph, 2 ) );

			expect( walker.position.parent ).to.equal( paragraph );
			expect( walker.position.offset ).to.equal( 2 );

			walker.next();

			expect( walker.position.parent ).to.equal( img2 );
			expect( walker.position.offset ).to.equal( 0 );
		} );

		it( 'cannot move position before the #_boundaryStartParent', () => {
			const range = new ViewRange(
				new ViewPosition( paragraph, 2 ),
				new ViewPosition( paragraph, 4 )
			);
			const walker = new ViewTreeWalker( {
				boundaries: range
			} );

			const positionBeforeAllowedRange = new ViewPosition( paragraph, 0 );

			walker.jumpTo( positionBeforeAllowedRange );

			// `jumpTo()` autocorrected the position to the first allowed position.
			expect( walker.position.parent ).to.equal( paragraph );
			expect( walker.position.offset ).to.equal( 2 );

			walker.next();

			expect( walker.position.parent ).to.equal( img2 );
			expect( walker.position.offset ).to.equal( 0 );
		} );

		it( 'cannot move position after the #_boundaryEndParent', () => {
			const range = new ViewRange(
				new ViewPosition( paragraph, 0 ),
				new ViewPosition( paragraph, 2 )
			);
			const walker = new ViewTreeWalker( {
				boundaries: range
			} );

			const positionAfterAllowedRange = new ViewPosition( paragraph, 4 );

			// `jumpTo()` autocorrected the position to the last allowed position.
			walker.jumpTo( positionAfterAllowedRange );

			expect( walker.position.parent ).to.equal( paragraph );
			expect( walker.position.offset ).to.equal( 2 );

			walker.next();

			expect( walker.position.parent ).to.equal( paragraph );
			expect( walker.position.offset ).to.equal( 2 );
		} );
	} );
} );

function expectValue( value, expected, options = {} ) {
	let expectedPreviousPosition, expectedNextPosition;

	if ( options.direction == 'backward' ) {
		expectedNextPosition = expected.previousPosition;
		expectedPreviousPosition = expected.nextPosition;
	} else {
		expectedNextPosition = expected.nextPosition;
		expectedPreviousPosition = expected.previousPosition;
	}

	expect( value.type ).to.equal( expected.type );
	expect( value.previousPosition ).to.deep.equal( expectedPreviousPosition );
	expect( value.nextPosition ).to.deep.equal( expectedNextPosition );

	if ( value.type == 'text' ) {
		expectText( value, expected );
	} else if ( value.type == 'elementStart' ) {
		expectStart( value, expected );
	} else if ( value.type == 'elementEnd' ) {
		expectEnd( value, expected );
	}
}

function expectText( value, expected ) {
	expect( value.item.data ).to.equal( expected.text );
	expect( value.length ).to.equal( value.item.data.length );
}

function expectStart( value, expected ) {
	expect( value.item ).to.equal( expected.item );
	expect( value.length ).to.equal( 1 );
}

function expectEnd( value, expected ) {
	expect( value.item ).to.equal( expected.item );
	expect( value.length ).to.be.undefined;
}
