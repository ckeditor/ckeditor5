/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

'use strict';

import Document from '/ckeditor5/engine/view/document.js';
import AttributeElement from '/ckeditor5/engine/view/attributeelement.js';
import ContainerElement from '/ckeditor5/engine/view/containerelement.js';
import Text from '/ckeditor5/engine/view/text.js';
import TreeWalker from '/ckeditor5/engine/view/treewalker.js';
import Position from '/ckeditor5/engine/view/position.js';
import Range from '/ckeditor5/engine/view/range.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'TreeWalker', () => {
	let doc, root, img1, paragraph, bold, textAbcd, charY, img2, charX;
	let rootBeginning, rootEnding;

	before( () => {
		doc = new Document();
		root = doc.createRoot( document.createElement( 'div' ) );

		// root
		//  |- img1
		//  |- p
		//     |- b
		//     |  |- A
		//     |  |- B
		//     |  |- C
		//     |  |- D
		//     |
		//     |- Y
		//     |
		//     |- img2
		//     |
		//     |- X

		textAbcd = new Text( 'abcd' );
		bold = new AttributeElement( 'b', null, [ textAbcd ] );
		charY = new Text( 'y' );
		img2 = new ContainerElement( 'img2' );
		charX = new Text( 'x' );

		paragraph = new ContainerElement( 'p', null, [ bold, charY, img2, charX ] );
		img1 = new ContainerElement( 'img1' );

		root.insertChildren( 0, [ img1, paragraph ] );

		rootBeginning = new Position( root, 0 );
		rootEnding = new Position( root, 2 );
	} );

	describe( 'constructor', () => {
		it( 'should throw if neither boundaries nor starting position is set', () => {
			expect( () => {
				new TreeWalker();
			} ).to.throw( CKEditorError, /^tree-walker-no-start-position/ );

			expect( () => {
				new TreeWalker( {} );
			} ).to.throw( CKEditorError, /^tree-walker-no-start-position/ );

			expect( () => {
				new TreeWalker( { singleCharacters: true } );
			} ).to.throw( CKEditorError, /^tree-walker-no-start-position/ );
		} );

		it( 'should throw if walking direction is unknown', () => {
			expect( () => {
				new TreeWalker( { startPosition: rootBeginning, direction: 'UNKNOWN' } );
			} ).to.throw( CKEditorError, /^tree-walker-unknown-direction/ );
		} );
	} );

	describe( 'iterate from start position `startPosition`', () => {
		let expected;

		beforeEach( () => {
			expected = [
				{
					type: 'ELEMENT_START',
					item: img1,
					previousPosition: new Position( root, 0 ),
					nextPosition: new Position( img1, 0 )
				},
				{
					type: 'ELEMENT_END',
					item: img1,
					previousPosition: new Position( img1, 0 ),
					nextPosition: new Position( root, 1 )
				},
				{
					type: 'ELEMENT_START',
					item: paragraph,
					previousPosition: new Position( root, 1 ),
					nextPosition: new Position( paragraph, 0 )
				},
				{
					type: 'ELEMENT_START',
					item: bold,
					previousPosition: new Position( paragraph, 0 ),
					nextPosition: new Position( bold, 0 )
				},
				{
					type: 'TEXT',
					text: 'abcd',
					previousPosition: new Position( bold, 0 ),
					nextPosition: new Position( bold, 1 )
				},
				{
					type: 'ELEMENT_END',
					item: bold,
					previousPosition: new Position( bold, 1 ),
					nextPosition: new Position( paragraph, 1 )
				},
				{
					type: 'TEXT',
					text: 'y',
					previousPosition: new Position( paragraph, 1 ),
					nextPosition: new Position( paragraph, 2 )
				},
				{
					type: 'ELEMENT_START',
					item: img2,
					previousPosition: new Position( paragraph, 2 ),
					nextPosition: new Position( img2, 0 )
				},
				{
					type: 'ELEMENT_END',
					item: img2,
					previousPosition: new Position( img2, 0 ),
					nextPosition: new Position( paragraph, 3 )
				},
				{
					type: 'TEXT',
					text: 'x',
					previousPosition: new Position( paragraph, 3 ),
					nextPosition: new Position( paragraph, 4 )
				},
				{
					type: 'ELEMENT_END',
					item: paragraph,
					previousPosition: new Position( paragraph, 4 ),
					nextPosition: new Position( root, 2 )
				}
			];
		} );

		it( 'should provide iterator interface with default FORWARD direction', () => {
			let iterator = new TreeWalker( { startPosition: rootBeginning } );
			let i = 0;

			for ( let value of iterator ) {
				expectValue( value, expected[ i++ ] );
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should provide iterator interface with FORWARD direction', () => {
			let iterator = new TreeWalker( { startPosition: rootBeginning, direction: 'FORWARD' } );
			let i = 0;

			for ( let value of iterator ) {
				expectValue( value, expected[ i++ ] );
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should provide iterator interface which BACKWARD direction', () => {
			let iterator = new TreeWalker( { startPosition: rootEnding, direction: 'BACKWARD' } );
			let i = expected.length;

			for ( let value of iterator ) {
				expectValue( value, expected[ --i ], { direction: 'BACKWARD' } );
			}

			expect( i ).to.equal( 0 );
		} );

		it( 'should start iterating at the startPosition witch is not a root bound', () => {
			let iterator = new TreeWalker( { startPosition: new Position( root, 1 ) } );
			let i = 2;

			for ( let value of iterator ) {
				expectValue( value, expected[ i++ ] );
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should start iterating at the startPosition witch is not a root bound, going backward', () => {
			let expected = [
				{
					type: 'ELEMENT_START',
					item: img1,
					previousPosition: new Position( root, 0 ),
					nextPosition: new Position( img1, 0 )
				},
				{
					type: 'ELEMENT_END',
					item: img1,
					previousPosition: new Position( img1, 0 ),
					nextPosition: new Position( root, 1 )
				}
			];

			let iterator = new TreeWalker( { startPosition: new Position( root, 1 ), direction: 'BACKWARD' } );
			let i = expected.length;

			for ( let value of iterator ) {
				expectValue( value, expected[ --i ], { direction: 'BACKWARD' } );
			}

			expect( i ).to.equal( 0 );
		} );
	} );

	describe( 'iterate trough the range `boundary`', () => {
		describe( 'range starts between elements', () => {
			let expected, range;

			before( () => {
				expected = [
					{
						type: 'ELEMENT_START',
						item: paragraph,
						previousPosition: new Position( root, 1 ),
						nextPosition: new Position( paragraph, 0 )
					},
					{
						type: 'ELEMENT_START',
						item: bold,
						previousPosition: new Position( paragraph, 0 ),
						nextPosition: new Position( bold, 0 )
					},
					{
						type: 'TEXT',
						text: 'abcd',
						previousPosition: new Position( bold, 0 ),
						nextPosition: new Position( bold, 1 )
					},
					{
						type: 'ELEMENT_END',
						item: bold,
						previousPosition: new Position( bold, 1 ),
						nextPosition: new Position( paragraph, 1 )
					},
					{
						type: 'TEXT',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					},
					{
						type: 'ELEMENT_START',
						item: img2,
						previousPosition: new Position( paragraph, 2 ),
						nextPosition: new Position( img2, 0 )
					},
					{
						type: 'ELEMENT_END',
						item: img2,
						previousPosition: new Position( img2, 0 ),
						nextPosition: new Position( paragraph, 3 )
					}
				];

				range = Range.createFromParentsAndOffsets( root, 1, paragraph, 3 );
			} );

			it( 'should iterating over the range', () => {
				let iterator = new TreeWalker( { boundaries: range } );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should iterating over the range going backward', () => {
				let iterator = new TreeWalker( { boundaries: range, direction: 'BACKWARD' } );
				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'BACKWARD' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'range starts inside the text', () => {
			let expected, range;

			before( () => {
				expected = [
					{
						type: 'TEXT',
						text: 'bcd',
						previousPosition: new Position( textAbcd, 1 ),
						nextPosition: new Position( bold, 1 )
					},
					{
						type: 'ELEMENT_END',
						item: bold,
						previousPosition: new Position( bold, 1 ),
						nextPosition: new Position( paragraph, 1 )
					},
					{
						type: 'TEXT',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					},
					{
						type: 'ELEMENT_START',
						item: img2,
						previousPosition: new Position( paragraph, 2 ),
						nextPosition: new Position( img2, 0 )
					},
					{
						type: 'ELEMENT_END',
						item: img2,
						previousPosition: new Position( img2, 0 ),
						nextPosition: new Position( paragraph, 3 )
					}
				];

				range = Range.createFromParentsAndOffsets( textAbcd, 1, paragraph, 3 );
			} );

			it( 'should return part of the text', () => {
				let iterator = new TreeWalker( { boundaries: range } );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return part of the text going backward', () => {
				let iterator = new TreeWalker( {
						boundaries: range,
						direction: 'BACKWARD'
					}
				);
				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'BACKWARD' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'range ends inside the text', () => {
			let expected, range;

			before( () => {
				expected = [
					{
						type: 'ELEMENT_START',
						item: img1,
						previousPosition: new Position( root, 0 ),
						nextPosition: new Position( img1, 0 )
					},
					{
						type: 'ELEMENT_END',
						item: img1,
						previousPosition: new Position( img1, 0 ),
						nextPosition: new Position( root, 1 )
					},
					{
						type: 'ELEMENT_START',
						item: paragraph,
						previousPosition: new Position( root, 1 ),
						nextPosition: new Position( paragraph, 0 )
					},
					{
						type: 'ELEMENT_START',
						item: bold,
						previousPosition: new Position( paragraph, 0 ),
						nextPosition: new Position( bold, 0 )
					},
					{
						type: 'TEXT',
						text: 'ab',
						previousPosition: new Position( bold, 0 ),
						nextPosition: new Position( textAbcd, 2 )
					}
				];

				range = new Range( rootBeginning, new Position( textAbcd, 2 ) );
			} );

			it( 'should return part of the text', () => {
				let iterator = new TreeWalker( { boundaries: range } );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return part of the text going backward', () => {
				let iterator = new TreeWalker( {
					boundaries: range,
					startPosition: range.end,
					direction: 'BACKWARD'
				} );

				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'BACKWARD' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'range starts and ends inside the same text', () => {
			let expected, range;

			before( () => {
				expected = [
					{
						type: 'TEXT',
						text: 'bc',
						previousPosition: new Position( textAbcd, 1 ),
						nextPosition: new Position( textAbcd, 3 )
					}
				];

				range = new Range( new Position( textAbcd, 1 ), new Position( textAbcd, 3 ) );
			} );

			it( 'should return part of the text', () => {
				let iterator = new TreeWalker( { boundaries: range } );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return part of the text going backward', () => {
				let iterator = new TreeWalker( {
					boundaries: range,
					startPosition: range.end,
					direction: 'BACKWARD'
				} );

				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'BACKWARD' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'custom start position', () => {
			it( 'should iterating from the start position', () => {
				let expected = [
					{
						type: 'TEXT',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					},
					{
						type: 'ELEMENT_START',
						item: img2,
						previousPosition: new Position( paragraph, 2 ),
						nextPosition: new Position( img2, 0 )
					},
					{
						type: 'ELEMENT_END',
						item: img2,
						previousPosition: new Position( img2, 0 ),
						nextPosition: new Position( paragraph, 3 )
					}
				];

				let range = Range.createFromParentsAndOffsets( bold, 1, paragraph, 3 );

				let iterator = new TreeWalker( {
					boundaries: range,
					startPosition: new Position( paragraph, 1 )
				} );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should iterating from the start position going backward', () => {
				let expected = [
					{
						type: 'TEXT',
						text: 'bcd',
						previousPosition: new Position( textAbcd, 1 ),
						nextPosition: new Position( bold, 1 )
					},
					{
						type: 'ELEMENT_END',
						item: bold,
						previousPosition: new Position( bold, 1 ),
						nextPosition: new Position( paragraph, 1 )
					},
					{
						type: 'TEXT',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					}
				];

				let range = new Range( new Position( textAbcd, 1 ), new Position( paragraph, 3 ) );

				let iterator = new TreeWalker( {
					boundaries: range,
					startPosition: new Position( paragraph, 2 ),
					direction: 'BACKWARD'
				} );
				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'BACKWARD' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'iterate by every single characters `singleCharacter`', () => {
		describe( 'whole root', () => {
			let expected;

			before( () => {
				expected = [
					{
						type: 'ELEMENT_START',
						item: img1,
						previousPosition: new Position( root, 0 ),
						nextPosition: new Position( img1, 0 )
					},
					{
						type: 'ELEMENT_END',
						item: img1,
						previousPosition: new Position( img1, 0 ),
						nextPosition: new Position( root, 1 )
					},
					{
						type: 'ELEMENT_START',
						item: paragraph,
						previousPosition: new Position( root, 1 ),
						nextPosition: new Position( paragraph, 0 )
					},
					{
						type: 'ELEMENT_START',
						item: bold,
						previousPosition: new Position( paragraph, 0 ),
						nextPosition: new Position( bold, 0 )
					},
					{
						type: 'TEXT',
						text: 'a',
						previousPosition: new Position( bold, 0 ),
						nextPosition: new Position( textAbcd, 1 )
					},
					{
						type: 'TEXT',
						text: 'b',
						previousPosition: new Position( textAbcd, 1 ),
						nextPosition: new Position( textAbcd, 2 )
					},
					{
						type: 'TEXT',
						text: 'c',
						previousPosition: new Position( textAbcd, 2 ),
						nextPosition: new Position( textAbcd, 3 )
					},
					{
						type: 'TEXT',
						text: 'd',
						previousPosition: new Position( textAbcd, 3 ),
						nextPosition: new Position( bold, 1 )
					},
					{
						type: 'ELEMENT_END',
						item: bold,
						previousPosition: new Position( bold, 1 ),
						nextPosition: new Position( paragraph, 1 )
					},
					{
						type: 'TEXT',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					},
					{
						type: 'ELEMENT_START',
						item: img2,
						previousPosition: new Position( paragraph, 2 ),
						nextPosition: new Position( img2, 0 )
					},
					{
						type: 'ELEMENT_END',
						item: img2,
						previousPosition: new Position( img2, 0 ),
						nextPosition: new Position( paragraph, 3 )
					},
					{
						type: 'TEXT',
						text: 'x',
						previousPosition: new Position( paragraph, 3 ),
						nextPosition: new Position( paragraph, 4 )
					},
					{
						type: 'ELEMENT_END',
						item: paragraph,
						previousPosition: new Position( paragraph, 4 ),
						nextPosition: new Position( root, 2 )
					}
				];
			} );

			it( 'should return single characters', () => {
				let iterator = new TreeWalker( { startPosition: rootBeginning, singleCharacters: true } );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return single characters going backward', () => {
				let iterator = new TreeWalker( {
					startPosition: rootEnding,
					singleCharacters: true,
					direction: 'BACKWARD'
				} );
				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'BACKWARD' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'range', () => {
			let range, expected;

			before( () => {
				expected = [
					{
						type: 'TEXT',
						text: 'a',
						previousPosition: new Position( bold, 0 ),
						nextPosition: new Position( textAbcd, 1 )
					},
					{
						type: 'TEXT',
						text: 'b',
						previousPosition: new Position( textAbcd, 1 ),
						nextPosition: new Position( textAbcd, 2 )
					},
					{
						type: 'TEXT',
						text: 'c',
						previousPosition: new Position( textAbcd, 2 ),
						nextPosition: new Position( textAbcd, 3 )
					},
					{
						type: 'TEXT',
						text: 'd',
						previousPosition: new Position( textAbcd, 3 ),
						nextPosition: new Position( bold, 1 )
					},
					{
						type: 'ELEMENT_END',
						item: bold,
						previousPosition: new Position( bold, 1 ),
						nextPosition: new Position( paragraph, 1 )
					},
					{
						type: 'TEXT',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					},
					{
						type: 'ELEMENT_START',
						item: img2,
						previousPosition: new Position( paragraph, 2 ),
						nextPosition: new Position( img2, 0 )
					}
				];

				range = new Range( new Position( bold, 0 ), new Position( img2, 0 ) );
			} );

			it( 'should respect boundaries', () => {
				let iterator = new TreeWalker( { boundaries: range, singleCharacters: true } );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should respect boundaries going backward', () => {
				let iterator = new TreeWalker( {
					boundaries: range,
					singleCharacters: true,
					direction: 'BACKWARD'
				} );
				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'BACKWARD' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'iterate omitting child nodes and ELEMENT_END `shallow`', () => {
		let expected;

		before( () => {
			expected = [
				{
					type: 'ELEMENT_START',
					item: img1,
					previousPosition: new Position( root, 0 ),
					nextPosition: new Position( root, 1 )
				},
				{
					type: 'ELEMENT_START',
					item: paragraph,
					previousPosition: new Position( root, 1 ),
					nextPosition: new Position( root, 2 )
				}
			];
		} );

		it( 'should not enter elements', () => {
			let iterator = new TreeWalker( { startPosition: rootBeginning, shallow: true } );
			let i = 0;

			for ( let value of iterator ) {
				expectValue( value, expected[ i++ ] );
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should not enter elements going backward', () => {
			let iterator = new TreeWalker( { startPosition: rootEnding, shallow: true, direction: 'BACKWARD' } );
			let i = expected.length;

			for ( let value of iterator ) {
				expectValue( value, expected[ --i ], { direction: 'BACKWARD' } );
			}

			expect( i ).to.equal( 0 );
		} );
	} );

	describe( 'iterate omitting ELEMENT_END `ignoreElementEnd`', () => {
		describe( 'merged text', () => {
			let expected;

			before( () => {
				expected = [
					{
						type: 'ELEMENT_START',
						item: img1,
						previousPosition: new Position( root, 0 ),
						nextPosition: new Position( img1, 0 )
					},
					{
						type: 'ELEMENT_START',
						item: paragraph,
						previousPosition: new Position( root, 1 ),
						nextPosition: new Position( paragraph, 0 )
					},
					{
						type: 'ELEMENT_START',
						item: bold,
						previousPosition: new Position( paragraph, 0 ),
						nextPosition: new Position( bold, 0 )
					},
					{
						type: 'TEXT',
						text: 'abcd',
						previousPosition: new Position( bold, 0 ),
						nextPosition: new Position( bold, 1 )
					},
					{
						type: 'TEXT',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					},
					{
						type: 'ELEMENT_START',
						item: img2,
						previousPosition: new Position( paragraph, 2 ),
						nextPosition: new Position( img2, 0 )
					},
					{
						type: 'TEXT',
						text: 'x',
						previousPosition: new Position( paragraph, 3 ),
						nextPosition: new Position( paragraph, 4 )
					}
				];
			} );

			it( 'should iterate ignoring ELEMENT_END', () => {
				let iterator = new TreeWalker( { startPosition: rootBeginning, ignoreElementEnd: true } );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should iterate ignoring ELEMENT_END going backward', () => {
				let iterator = new TreeWalker( {
					startPosition: rootEnding,
					ignoreElementEnd: true,
					direction: 'BACKWARD'
				} );
				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'BACKWARD' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'single character', () => {
			let expected;

			before( () => {
				expected = [
					{
						type: 'ELEMENT_START',
						item: img1,
						previousPosition: new Position( root, 0 ),
						nextPosition: new Position( img1, 0 )
					},
					{
						type: 'ELEMENT_START',
						item: paragraph,
						previousPosition: new Position( root, 1 ),
						nextPosition: new Position( paragraph, 0 )
					},
					{
						type: 'ELEMENT_START',
						item: bold,
						previousPosition: new Position( paragraph, 0 ),
						nextPosition: new Position( bold, 0 )
					},
					{
						type: 'TEXT',
						text: 'a',
						previousPosition: new Position( bold, 0 ),
						nextPosition: new Position( textAbcd, 1 )
					},
					{
						type: 'TEXT',
						text: 'b',
						previousPosition: new Position( textAbcd, 1 ),
						nextPosition: new Position( textAbcd, 2 )
					},
					{
						type: 'TEXT',
						text: 'c',
						previousPosition: new Position( textAbcd, 2 ),
						nextPosition: new Position( textAbcd, 3 )
					},
					{
						type: 'TEXT',
						text: 'd',
						previousPosition: new Position( textAbcd, 3 ),
						nextPosition: new Position( bold, 1 )
					},
					{
						type: 'TEXT',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					},
					{
						type: 'ELEMENT_START',
						item: img2,
						previousPosition: new Position( paragraph, 2 ),
						nextPosition: new Position( img2, 0 )
					},
					{
						type: 'TEXT',
						text: 'x',
						previousPosition: new Position( paragraph, 3 ),
						nextPosition: new Position( paragraph, 4 )
					}
				];
			} );

			it( 'should return single characters ignoring ELEMENT_END', () => {
				let iterator = new TreeWalker( {
					startPosition: rootBeginning,
					singleCharacters: true,
					ignoreElementEnd: true
				} );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return single characters ignoring ELEMENT_END going backward', () => {
				let iterator = new TreeWalker( {
					startPosition: rootEnding,
					singleCharacters: true,
					ignoreElementEnd: true,
					direction: 'BACKWARD'
				} );
				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'BACKWARD' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );
	} );
} );

function expectValue( value, expected, options = {} ) {
	let expectedPreviousPosition, expectedNextPosition;

	if ( options.direction == 'BACKWARD' ) {
		expectedNextPosition = expected.previousPosition;
		expectedPreviousPosition = expected.nextPosition;
	} else {
		expectedNextPosition = expected.nextPosition;
		expectedPreviousPosition = expected.previousPosition;
	}

	expect( value.type ).to.equal( expected.type );
	expect( value.previousPosition ).to.deep.equal( expectedPreviousPosition );
	expect( value.nextPosition ).to.deep.equal( expectedNextPosition );

	if ( value.type == 'TEXT' ) {
		expectText( value, expected );
	} else if ( value.type == 'ELEMENT_START' ) {
		expectStart( value, expected );
	} else if ( value.type == 'ELEMENT_END' ) {
		expectEnd( value, expected );
	}
}

function expectText( value, expected ) {
	expect( value.item._data ).to.equal( expected.text );
	expect( value.length ).to.equal( value.item._data.length );
}

function expectStart( value, expected ) {
	expect( value.item ).to.equal( expected.item );
	expect( value.length ).to.equal( 1 );
}

function expectEnd( value, expected ) {
	expect( value.item ).to.equal( expected.item );
	expect( value.length ).to.be.undefined;
}
