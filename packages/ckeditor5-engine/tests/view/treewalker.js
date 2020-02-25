/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Document from '../../src/view/document';
import DocumentFragment from '../../src/view/documentfragment';
import AttributeElement from '../../src/view/attributeelement';
import ContainerElement from '../../src/view/containerelement';
import Text from '../../src/view/text';
import TreeWalker from '../../src/view/treewalker';
import Position from '../../src/view/position';
import Range from '../../src/view/range';
import createViewRoot from './_utils/createroot';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'TreeWalker', () => {
	let doc, root, img1, paragraph, bold, textAbcd, charY, img2, charX, rootBeginning, rootEnding, stylesProcessor;

	before( () => {
		stylesProcessor = new StylesProcessor();
		doc = new Document( stylesProcessor );
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

		textAbcd = new Text( doc, 'abcd' );
		bold = new AttributeElement( doc, 'b', null, [ textAbcd ] );
		charY = new Text( doc, 'y' );
		img2 = new ContainerElement( doc, 'img2' );
		charX = new Text( doc, 'x' );

		paragraph = new ContainerElement( doc, 'p', null, [ bold, charY, img2, charX ] );
		img1 = new ContainerElement( doc, 'img1' );

		root._insertChild( 0, [ img1, paragraph ] );

		rootBeginning = new Position( root, 0 );
		rootEnding = new Position( root, 2 );
	} );

	describe( 'constructor()', () => {
		it( 'should throw if neither boundaries nor starting position is set', () => {
			expectToThrowCKEditorError( () => {
				new TreeWalker(); // eslint-disable-line no-new
			}, /^view-tree-walker-no-start-position/, null );

			expectToThrowCKEditorError( () => {
				new TreeWalker( {} ); // eslint-disable-line no-new
			}, /^view-tree-walker-no-start-position/, null );

			expectToThrowCKEditorError( () => {
				new TreeWalker( { singleCharacters: true } ); // eslint-disable-line no-new
			}, /^view-tree-walker-no-start-position/, null );
		} );

		it( 'should throw if walking direction is unknown', () => {
			expectToThrowCKEditorError( () => {
				new TreeWalker( { startPosition: rootBeginning, direction: 'unknown' } ); // eslint-disable-line no-new
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
					previousPosition: new Position( root, 0 ),
					nextPosition: new Position( img1, 0 )
				},
				{
					type: 'elementEnd',
					item: img1,
					previousPosition: new Position( img1, 0 ),
					nextPosition: new Position( root, 1 )
				},
				{
					type: 'elementStart',
					item: paragraph,
					previousPosition: new Position( root, 1 ),
					nextPosition: new Position( paragraph, 0 )
				},
				{
					type: 'elementStart',
					item: bold,
					previousPosition: new Position( paragraph, 0 ),
					nextPosition: new Position( bold, 0 )
				},
				{
					type: 'text',
					text: 'abcd',
					previousPosition: new Position( bold, 0 ),
					nextPosition: new Position( bold, 1 )
				},
				{
					type: 'elementEnd',
					item: bold,
					previousPosition: new Position( bold, 1 ),
					nextPosition: new Position( paragraph, 1 )
				},
				{
					type: 'text',
					text: 'y',
					previousPosition: new Position( paragraph, 1 ),
					nextPosition: new Position( paragraph, 2 )
				},
				{
					type: 'elementStart',
					item: img2,
					previousPosition: new Position( paragraph, 2 ),
					nextPosition: new Position( img2, 0 )
				},
				{
					type: 'elementEnd',
					item: img2,
					previousPosition: new Position( img2, 0 ),
					nextPosition: new Position( paragraph, 3 )
				},
				{
					type: 'text',
					text: 'x',
					previousPosition: new Position( paragraph, 3 ),
					nextPosition: new Position( paragraph, 4 )
				},
				{
					type: 'elementEnd',
					item: paragraph,
					previousPosition: new Position( paragraph, 4 ),
					nextPosition: new Position( root, 2 )
				}
			];
		} );

		it( 'should provide iterator interface with default forward direction', () => {
			const iterator = new TreeWalker( { startPosition: rootBeginning } );
			let i = 0;

			for ( const value of iterator ) {
				expectValue( value, expected[ i++ ] );
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should provide iterator interface with forward direction', () => {
			const iterator = new TreeWalker( { startPosition: rootBeginning, direction: 'forward' } );
			let i = 0;

			for ( const value of iterator ) {
				expectValue( value, expected[ i++ ] );
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should provide iterator interface which backward direction', () => {
			const iterator = new TreeWalker( { startPosition: rootEnding, direction: 'backward' } );
			let i = expected.length;

			for ( const value of iterator ) {
				expectValue( value, expected[ --i ], { direction: 'backward' } );
			}

			expect( i ).to.equal( 0 );
		} );

		it( 'should start iterating at the startPosition witch is not a root bound', () => {
			const iterator = new TreeWalker( { startPosition: new Position( root, 1 ) } );
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
					previousPosition: new Position( root, 0 ),
					nextPosition: new Position( img1, 0 )
				},
				{
					type: 'elementEnd',
					item: img1,
					previousPosition: new Position( img1, 0 ),
					nextPosition: new Position( root, 1 )
				}
			];

			const iterator = new TreeWalker( { startPosition: new Position( root, 1 ), direction: 'backward' } );
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

			before( () => {
				expected = [
					{
						type: 'elementStart',
						item: paragraph,
						previousPosition: new Position( root, 1 ),
						nextPosition: new Position( paragraph, 0 )
					},
					{
						type: 'elementStart',
						item: bold,
						previousPosition: new Position( paragraph, 0 ),
						nextPosition: new Position( bold, 0 )
					},
					{
						type: 'text',
						text: 'abcd',
						previousPosition: new Position( bold, 0 ),
						nextPosition: new Position( bold, 1 )
					},
					{
						type: 'elementEnd',
						item: bold,
						previousPosition: new Position( bold, 1 ),
						nextPosition: new Position( paragraph, 1 )
					},
					{
						type: 'text',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					},
					{
						type: 'elementStart',
						item: img2,
						previousPosition: new Position( paragraph, 2 ),
						nextPosition: new Position( img2, 0 )
					},
					{
						type: 'elementEnd',
						item: img2,
						previousPosition: new Position( img2, 0 ),
						nextPosition: new Position( paragraph, 3 )
					}
				];

				range = Range._createFromParentsAndOffsets( root, 1, paragraph, 3 );
			} );

			it( 'should iterating over the range', () => {
				const iterator = new TreeWalker( { boundaries: range } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should iterating over the range going backward', () => {
				const iterator = new TreeWalker( { boundaries: range, direction: 'backward' } );
				let i = expected.length;

				for ( const value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'range starts inside the text', () => {
			let expected, range;

			before( () => {
				expected = [
					{
						type: 'text',
						text: 'bcd',
						previousPosition: new Position( textAbcd, 1 ),
						nextPosition: new Position( bold, 1 )
					},
					{
						type: 'elementEnd',
						item: bold,
						previousPosition: new Position( bold, 1 ),
						nextPosition: new Position( paragraph, 1 )
					},
					{
						type: 'text',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					},
					{
						type: 'elementStart',
						item: img2,
						previousPosition: new Position( paragraph, 2 ),
						nextPosition: new Position( img2, 0 )
					},
					{
						type: 'elementEnd',
						item: img2,
						previousPosition: new Position( img2, 0 ),
						nextPosition: new Position( paragraph, 3 )
					}
				];

				range = Range._createFromParentsAndOffsets( textAbcd, 1, paragraph, 3 );
			} );

			it( 'should return part of the text', () => {
				const iterator = new TreeWalker( { boundaries: range } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return part of the text going backward', () => {
				const iterator = new TreeWalker( {
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

			before( () => {
				expected = [
					{
						type: 'elementStart',
						item: img1,
						previousPosition: new Position( root, 0 ),
						nextPosition: new Position( img1, 0 )
					},
					{
						type: 'elementEnd',
						item: img1,
						previousPosition: new Position( img1, 0 ),
						nextPosition: new Position( root, 1 )
					},
					{
						type: 'elementStart',
						item: paragraph,
						previousPosition: new Position( root, 1 ),
						nextPosition: new Position( paragraph, 0 )
					},
					{
						type: 'elementStart',
						item: bold,
						previousPosition: new Position( paragraph, 0 ),
						nextPosition: new Position( bold, 0 )
					},
					{
						type: 'text',
						text: 'ab',
						previousPosition: new Position( bold, 0 ),
						nextPosition: new Position( textAbcd, 2 )
					}
				];

				range = new Range( rootBeginning, new Position( textAbcd, 2 ) );
			} );

			it( 'should return part of the text', () => {
				const iterator = new TreeWalker( { boundaries: range } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return part of the text going backward', () => {
				const iterator = new TreeWalker( {
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

			before( () => {
				expected = [
					{
						type: 'text',
						text: 'bc',
						previousPosition: new Position( textAbcd, 1 ),
						nextPosition: new Position( textAbcd, 3 )
					}
				];

				range = new Range( new Position( textAbcd, 1 ), new Position( textAbcd, 3 ) );
			} );

			it( 'should return part of the text', () => {
				const iterator = new TreeWalker( { boundaries: range } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return part of the text going backward', () => {
				const iterator = new TreeWalker( {
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
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					},
					{
						type: 'elementStart',
						item: img2,
						previousPosition: new Position( paragraph, 2 ),
						nextPosition: new Position( img2, 0 )
					},
					{
						type: 'elementEnd',
						item: img2,
						previousPosition: new Position( img2, 0 ),
						nextPosition: new Position( paragraph, 3 )
					}
				];

				const range = Range._createFromParentsAndOffsets( bold, 1, paragraph, 3 );

				const iterator = new TreeWalker( {
					boundaries: range,
					startPosition: new Position( paragraph, 1 )
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
						previousPosition: new Position( textAbcd, 1 ),
						nextPosition: new Position( bold, 1 )
					},
					{
						type: 'elementEnd',
						item: bold,
						previousPosition: new Position( bold, 1 ),
						nextPosition: new Position( paragraph, 1 )
					},
					{
						type: 'text',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					}
				];

				const range = new Range( new Position( textAbcd, 1 ), new Position( paragraph, 3 ) );

				const iterator = new TreeWalker( {
					boundaries: range,
					startPosition: new Position( paragraph, 2 ),
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

			before( () => {
				expected = [
					{
						type: 'elementStart',
						item: img1,
						previousPosition: new Position( root, 0 ),
						nextPosition: new Position( img1, 0 )
					},
					{
						type: 'elementEnd',
						item: img1,
						previousPosition: new Position( img1, 0 ),
						nextPosition: new Position( root, 1 )
					},
					{
						type: 'elementStart',
						item: paragraph,
						previousPosition: new Position( root, 1 ),
						nextPosition: new Position( paragraph, 0 )
					},
					{
						type: 'elementStart',
						item: bold,
						previousPosition: new Position( paragraph, 0 ),
						nextPosition: new Position( bold, 0 )
					},
					{
						type: 'text',
						text: 'a',
						previousPosition: new Position( bold, 0 ),
						nextPosition: new Position( textAbcd, 1 )
					},
					{
						type: 'text',
						text: 'b',
						previousPosition: new Position( textAbcd, 1 ),
						nextPosition: new Position( textAbcd, 2 )
					},
					{
						type: 'text',
						text: 'c',
						previousPosition: new Position( textAbcd, 2 ),
						nextPosition: new Position( textAbcd, 3 )
					},
					{
						type: 'text',
						text: 'd',
						previousPosition: new Position( textAbcd, 3 ),
						nextPosition: new Position( bold, 1 )
					},
					{
						type: 'elementEnd',
						item: bold,
						previousPosition: new Position( bold, 1 ),
						nextPosition: new Position( paragraph, 1 )
					},
					{
						type: 'text',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					},
					{
						type: 'elementStart',
						item: img2,
						previousPosition: new Position( paragraph, 2 ),
						nextPosition: new Position( img2, 0 )
					},
					{
						type: 'elementEnd',
						item: img2,
						previousPosition: new Position( img2, 0 ),
						nextPosition: new Position( paragraph, 3 )
					},
					{
						type: 'text',
						text: 'x',
						previousPosition: new Position( paragraph, 3 ),
						nextPosition: new Position( paragraph, 4 )
					},
					{
						type: 'elementEnd',
						item: paragraph,
						previousPosition: new Position( paragraph, 4 ),
						nextPosition: new Position( root, 2 )
					}
				];
			} );

			it( 'should return single characters', () => {
				const iterator = new TreeWalker( { startPosition: rootBeginning, singleCharacters: true } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return single characters going backward', () => {
				const iterator = new TreeWalker( {
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

			before( () => {
				expected = [
					{
						type: 'text',
						text: 'a',
						previousPosition: new Position( bold, 0 ),
						nextPosition: new Position( textAbcd, 1 )
					},
					{
						type: 'text',
						text: 'b',
						previousPosition: new Position( textAbcd, 1 ),
						nextPosition: new Position( textAbcd, 2 )
					},
					{
						type: 'text',
						text: 'c',
						previousPosition: new Position( textAbcd, 2 ),
						nextPosition: new Position( textAbcd, 3 )
					},
					{
						type: 'text',
						text: 'd',
						previousPosition: new Position( textAbcd, 3 ),
						nextPosition: new Position( bold, 1 )
					},
					{
						type: 'elementEnd',
						item: bold,
						previousPosition: new Position( bold, 1 ),
						nextPosition: new Position( paragraph, 1 )
					},
					{
						type: 'text',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					},
					{
						type: 'elementStart',
						item: img2,
						previousPosition: new Position( paragraph, 2 ),
						nextPosition: new Position( img2, 0 )
					}
				];

				range = new Range( new Position( bold, 0 ), new Position( img2, 0 ) );
			} );

			it( 'should respect boundaries', () => {
				const iterator = new TreeWalker( { boundaries: range, singleCharacters: true } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should respect boundaries going backward', () => {
				const iterator = new TreeWalker( {
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

	describe( 'iterate omitting child nodes and elementEnd `shallow`', () => {
		let expected;

		before( () => {
			expected = [
				{
					type: 'elementStart',
					item: img1,
					previousPosition: new Position( root, 0 ),
					nextPosition: new Position( root, 1 )
				},
				{
					type: 'elementStart',
					item: paragraph,
					previousPosition: new Position( root, 1 ),
					nextPosition: new Position( root, 2 )
				}
			];
		} );

		it( 'should not enter elements', () => {
			const iterator = new TreeWalker( { startPosition: rootBeginning, shallow: true } );
			let i = 0;

			for ( const value of iterator ) {
				expectValue( value, expected[ i++ ] );
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should not enter elements going backward', () => {
			const iterator = new TreeWalker( { startPosition: rootEnding, shallow: true, direction: 'backward' } );
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

			before( () => {
				expected = [
					{
						type: 'elementStart',
						item: img1,
						previousPosition: new Position( root, 0 ),
						nextPosition: new Position( img1, 0 )
					},
					{
						type: 'elementStart',
						item: paragraph,
						previousPosition: new Position( root, 1 ),
						nextPosition: new Position( paragraph, 0 )
					},
					{
						type: 'elementStart',
						item: bold,
						previousPosition: new Position( paragraph, 0 ),
						nextPosition: new Position( bold, 0 )
					},
					{
						type: 'text',
						text: 'abcd',
						previousPosition: new Position( bold, 0 ),
						nextPosition: new Position( bold, 1 )
					},
					{
						type: 'text',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					},
					{
						type: 'elementStart',
						item: img2,
						previousPosition: new Position( paragraph, 2 ),
						nextPosition: new Position( img2, 0 )
					},
					{
						type: 'text',
						text: 'x',
						previousPosition: new Position( paragraph, 3 ),
						nextPosition: new Position( paragraph, 4 )
					}
				];
			} );

			it( 'should iterate ignoring elementEnd', () => {
				const iterator = new TreeWalker( { startPosition: rootBeginning, ignoreElementEnd: true } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i++ ] );
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should iterate ignoring elementEnd going backward', () => {
				const iterator = new TreeWalker( {
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

			before( () => {
				expected = [
					{
						type: 'elementStart',
						item: img1,
						previousPosition: new Position( root, 0 ),
						nextPosition: new Position( img1, 0 )
					},
					{
						type: 'elementStart',
						item: paragraph,
						previousPosition: new Position( root, 1 ),
						nextPosition: new Position( paragraph, 0 )
					},
					{
						type: 'elementStart',
						item: bold,
						previousPosition: new Position( paragraph, 0 ),
						nextPosition: new Position( bold, 0 )
					},
					{
						type: 'text',
						text: 'a',
						previousPosition: new Position( bold, 0 ),
						nextPosition: new Position( textAbcd, 1 )
					},
					{
						type: 'text',
						text: 'b',
						previousPosition: new Position( textAbcd, 1 ),
						nextPosition: new Position( textAbcd, 2 )
					},
					{
						type: 'text',
						text: 'c',
						previousPosition: new Position( textAbcd, 2 ),
						nextPosition: new Position( textAbcd, 3 )
					},
					{
						type: 'text',
						text: 'd',
						previousPosition: new Position( textAbcd, 3 ),
						nextPosition: new Position( bold, 1 )
					},
					{
						type: 'text',
						text: 'y',
						previousPosition: new Position( paragraph, 1 ),
						nextPosition: new Position( paragraph, 2 )
					},
					{
						type: 'elementStart',
						item: img2,
						previousPosition: new Position( paragraph, 2 ),
						nextPosition: new Position( img2, 0 )
					},
					{
						type: 'text',
						text: 'x',
						previousPosition: new Position( paragraph, 3 ),
						nextPosition: new Position( paragraph, 4 )
					}
				];
			} );

			it( 'should return single characters ignoring elementEnd', () => {
				const iterator = new TreeWalker( {
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
				const iterator = new TreeWalker( {
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
		const iterator = new TreeWalker( {
			startPosition: Position._createAt( textAbcd, 'end' )
		} );

		const step = iterator.next();

		expect( step.value.type ).to.equal( 'elementEnd' );
		expect( step.value.item ).to.equal( bold );
	} );

	it( 'should not return elementStart for a text node when iteration begins at the start of that text node', () => {
		const iterator = new TreeWalker( {
			startPosition: Position._createAt( textAbcd, 0 ),
			direction: 'backward'
		} );

		const step = iterator.next();

		expect( step.value.type ).to.equal( 'elementStart' );
		expect( step.value.item ).to.equal( bold );
	} );

	it( 'should iterate over document fragment', () => {
		const foo = new Text( doc, 'foo' );
		const bar = new Text( doc, 'bar' );
		const p = new ContainerElement( doc, 'p', null, foo );
		const b = new AttributeElement( doc, 'b', null, bar );
		const docFrag = new DocumentFragment( doc, [ p, b ] );

		const expected = [
			{
				type: 'elementStart',
				item: p,
				previousPosition: new Position( docFrag, 0 ),
				nextPosition: new Position( p, 0 )
			},
			{
				type: 'text',
				text: 'foo',
				previousPosition: new Position( p, 0 ),
				nextPosition: new Position( p, 1 )
			},
			{
				type: 'elementEnd',
				item: p,
				previousPosition: new Position( p, 1 ),
				nextPosition: new Position( docFrag, 1 )
			},
			{
				type: 'elementStart',
				item: b,
				previousPosition: new Position( docFrag, 1 ),
				nextPosition: new Position( b, 0 )
			},
			{
				type: 'text',
				text: 'bar',
				previousPosition: new Position( b, 0 ),
				nextPosition: new Position( b, 1 )
			},
			{
				type: 'elementEnd',
				item: b,
				previousPosition: new Position( b, 1 ),
				nextPosition: new Position( docFrag, 2 )
			}
		];

		const iterator = new TreeWalker( { boundaries: Range._createIn( docFrag ) } );
		let i = 0;

		for ( const value of iterator ) {
			expectValue( value, expected[ i++ ] );
		}

		expect( i ).to.equal( expected.length );
	} );

	describe( 'skip', () => {
		describe( 'forward treewalker', () => {
			it( 'should jump over all text nodes', () => {
				const walker = new TreeWalker( {
					startPosition: new Position( paragraph, 0 )
				} );

				walker.skip( value => value.type == 'text' || value.item.name == 'b' );

				expect( walker.position.parent ).to.equal( paragraph );
				expect( walker.position.offset ).to.equal( 2 );
			} );

			it( 'should do not move if the condition is false', () => {
				const walker = new TreeWalker( {
					startPosition: new Position( bold, 0 )
				} );

				walker.skip( () => false );

				expect( walker.position.parent ).to.equal( bold );
				expect( walker.position.offset ).to.equal( 0 );
			} );

			it( 'should do not move if the condition is false and the position is in text node', () => {
				const walker = new TreeWalker( {
					startPosition: new Position( bold.getChild( 0 ), 2 )
				} );

				walker.skip( () => false );

				expect( walker.position.parent ).to.equal( bold.getChild( 0 ) );
				expect( walker.position.offset ).to.equal( 2 );
			} );

			it( 'should move to the end if the condition is true', () => {
				const walker = new TreeWalker( {
					startPosition: new Position( bold, 0 )
				} );

				walker.skip( () => true );

				expect( walker.position.parent ).to.equal( rootEnding.parent );
				expect( walker.position.offset ).to.equal( rootEnding.offset );
			} );
		} );

		describe( 'backward treewalker', () => {
			it( 'should jump over all text nodes', () => {
				const walker = new TreeWalker( {
					startPosition: new Position( bold.getChild( 0 ), 2 ),
					direction: 'backward'
				} );

				walker.skip( value => value.type == 'text' || value.item.name == 'b' );

				expect( walker.position.parent ).to.equal( paragraph );
				expect( walker.position.offset ).to.equal( 0 );
			} );

			it( 'should do not move if the condition is false', () => {
				const walker = new TreeWalker( {
					startPosition: new Position( bold, 0 ),
					direction: 'backward'
				} );

				walker.skip( () => false );

				expect( walker.position.parent ).to.equal( bold );
				expect( walker.position.offset ).to.equal( 0 );
			} );

			it( 'should move to the end if the condition is true', () => {
				const walker = new TreeWalker( {
					startPosition: new Position( bold, 0 ),
					direction: 'backward'
				} );

				walker.skip( () => true );

				expect( walker.position.parent ).to.equal( rootBeginning.parent );
				expect( walker.position.offset ).to.equal( rootBeginning.offset );
			} );
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
