/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Model } from '../../src/model/model.js';
import { ModelDocumentFragment } from '../../src/model/documentfragment.js';
import { ModelElement } from '../../src/model/element.js';
import { ModelText } from '../../src/model/text.js';
import { ModelTreeWalker } from '../../src/model/treewalker.js';
import { ModelPosition } from '../../src/model/position.js';
import { ModelRange } from '../../src/model/range.js';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'ModelTreeWalker', () => {
	let model, doc, root, img1, paragraph, ba, r, img2, x,
		rootBeginning, rootEnding;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();

		// root
		//  |- img1
		//  |- p
		//     |- B -bold
		//     |- A -bold
		//     |- R
		//     |
		//     |- img2
		//     |
		//     |- X

		ba = new ModelText( 'ba', { bold: true } );
		r = new ModelText( 'r' );
		img2 = new ModelElement( 'img2' );
		x = new ModelText( 'x' );

		paragraph = new ModelElement( 'p', [], [ ba, r, img2, x ] );
		img1 = new ModelElement( 'img1' );

		root._insertChild( 0, [ img1, paragraph ] );

		rootBeginning = new ModelPosition( root, [ 0 ] );
		rootEnding = new ModelPosition( root, [ 2 ] );
	} );

	afterEach( () => {
		model.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should throw if neither boundaries nor starting position is set', () => {
			expectToThrowCKEditorError( () => {
				new ModelTreeWalker(); // eslint-disable-line no-new
			}, /^model-tree-walker-no-start-position/, null );

			expectToThrowCKEditorError( () => {
				new ModelTreeWalker( {} ); // eslint-disable-line no-new
			}, /^model-tree-walker-no-start-position/, null );

			expectToThrowCKEditorError( () => {
				new ModelTreeWalker( { singleCharacters: true } ); // eslint-disable-line no-new
			}, /^model-tree-walker-no-start-position/, null );
		} );

		it( 'should throw if walking direction is unknown', () => {
			expectToThrowCKEditorError( () => {
				new ModelTreeWalker( { startPosition: rootBeginning, direction: 'unknown' } ); // eslint-disable-line no-new
			}, /^model-tree-walker-unknown-direction/, model );
		} );
	} );

	describe( 'iterate from start position `startPosition`', () => {
		let expected;

		beforeEach( () => {
			expected = [
				{ type: 'elementStart', item: img1 },
				{ type: 'elementEnd', item: img1 },
				{ type: 'elementStart', item: paragraph },
				{ type: 'text', data: 'ba', attrs: [ [ 'bold', true ] ] },
				{ type: 'text', data: 'r', attrs: [] },
				{ type: 'elementStart', item: img2 },
				{ type: 'elementEnd', item: img2 },
				{ type: 'text', data: 'x', attrs: [] },
				{ type: 'elementEnd', item: paragraph }
			];
		} );

		it( 'should provide iterator interface with default forward direction', () => {
			const iterator = new ModelTreeWalker( { startPosition: rootBeginning } );
			let i = 0;

			for ( const value of iterator ) {
				expectValue( value, expected[ i ] );
				i++;
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should provide iterator interface with forward direction', () => {
			const iterator = new ModelTreeWalker( { startPosition: rootBeginning, direction: 'forward' } );
			let i = 0;

			for ( const value of iterator ) {
				expectValue( value, expected[ i ] );
				i++;
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should provide iterator interface which backward direction', () => {
			const iterator = new ModelTreeWalker( { startPosition: rootEnding, direction: 'backward' } );
			let i = expected.length;

			for ( const value of iterator ) {
				expectValue( value, expected[ --i ], { direction: 'backward' } );
			}

			expect( i ).to.equal( 0 );
		} );

		it( 'should start iterating at the startPosition witch is not a root bound', () => {
			const iterator = new ModelTreeWalker( { startPosition: new ModelPosition( root, [ 1 ] ) } );
			let i = 2;

			for ( const value of iterator ) {
				expectValue( value, expected[ i ] );
				i++;
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should start iterating at the startPosition witch is not a root bound, going backward', () => {
			const expected = [
				{ type: 'elementStart', item: img1 },
				{ type: 'elementEnd', item: img1 }
			];

			const iterator = new ModelTreeWalker( { startPosition: new ModelPosition( root, [ 1 ] ), direction: 'backward' } );
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
					{ type: 'elementStart', item: paragraph },
					{ type: 'text', data: 'ba', attrs: [ [ 'bold', true ] ] },
					{ type: 'text', data: 'r', attrs: [] },
					{ type: 'elementStart', item: img2 },
					{ type: 'elementEnd', item: img2 }
				];

				range = new ModelRange( new ModelPosition( root, [ 1 ] ), new ModelPosition( root, [ 1, 4 ] ) );
			} );

			it( 'should iterate over the range', () => {
				const iterator = new ModelTreeWalker( { boundaries: range } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should iterate over the range going backward', () => {
				const iterator = new ModelTreeWalker( { boundaries: range, direction: 'backward' } );
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
					{ type: 'text', data: 'a', attrs: [ [ 'bold', true ] ] },
					{ type: 'text', data: 'r', attrs: [] },
					{ type: 'elementStart', item: img2 },
					{ type: 'elementEnd', item: img2 }
				];

				range = new ModelRange( new ModelPosition( root, [ 1, 1 ] ), new ModelPosition( root, [ 1, 4 ] ) );
			} );

			it( 'should return part of the text', () => {
				const iterator = new ModelTreeWalker( { boundaries: range } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return part of the text going backward', () => {
				const iterator = new ModelTreeWalker( {
					boundaries: range,
					direction: 'backward' }
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
					{ type: 'elementStart', item: img1 },
					{ type: 'elementEnd', item: img1 },
					{ type: 'elementStart', item: paragraph },
					{ type: 'text', data: 'b', attrs: [ [ 'bold', true ] ] }
				];

				range = new ModelRange( rootBeginning, new ModelPosition( root, [ 1, 1 ] ) );
			} );

			it( 'should return part of the text', () => {
				const iterator = new ModelTreeWalker( { boundaries: range } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return part of the text going backward', () => {
				const iterator = new ModelTreeWalker( {
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
					{ type: 'text', data: 'r', attrs: [] },
					{ type: 'elementStart', item: img2 },
					{ type: 'elementEnd', item: img2 }
				];

				const range = new ModelRange( new ModelPosition( root, [ 1 ] ), new ModelPosition( root, [ 1, 4 ] ) );

				const iterator = new ModelTreeWalker( {
					boundaries: range,
					startPosition: new ModelPosition( root, [ 1, 2 ] )
				} );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should iterating from the start position going backward', () => {
				const expected = [
					{ type: 'text', data: 'r', attrs: [] },
					{ type: 'elementStart', item: img2 },
					{ type: 'elementEnd', item: img2 }
				];

				const range = new ModelRange( new ModelPosition( root, [ 1, 2 ] ), new ModelPosition( root, [ 1, 6 ] ) );

				const iterator = new ModelTreeWalker( {
					boundaries: range,
					startPosition: new ModelPosition( root, [ 1, 4 ] ),
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
					{ type: 'elementStart', item: img1 },
					{ type: 'elementEnd', item: img1 },
					{ type: 'elementStart', item: paragraph },
					{ type: 'text', data: 'b', attrs: [ [ 'bold', true ] ] },
					{ type: 'text', data: 'a', attrs: [ [ 'bold', true ] ] },
					{ type: 'text', data: 'r', attrs: [] },
					{ type: 'elementStart', item: img2 },
					{ type: 'elementEnd', item: img2 },
					{ type: 'text', data: 'x', attrs: [] },
					{ type: 'elementEnd', item: paragraph }
				];
			} );

			it( 'should return single characters', () => {
				const iterator = new ModelTreeWalker( { startPosition: rootBeginning, singleCharacters: true } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return single characters going backward', () => {
				const iterator = new ModelTreeWalker( {
					startPosition: rootEnding,
					singleCharacters: true,
					direction: 'backward' }
				);
				let i = expected.length;

				for ( const value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'range', () => {
			let start, end, range, expected;

			beforeEach( () => {
				expected = [
					{ type: 'text', data: 'b', attrs: [ [ 'bold', true ] ] },
					{ type: 'text', data: 'a', attrs: [ [ 'bold', true ] ] },
					{ type: 'text', data: 'r', attrs: [] },
					{ type: 'elementStart', item: img2 }
				];

				start = new ModelPosition( root, [ 1, 0 ] ); // p, 0
				end = new ModelPosition( root, [ 1, 3, 0 ] ); // img2, 0
				range = new ModelRange( start, end );
			} );

			it( 'should respect boundaries', () => {
				const iterator = new ModelTreeWalker( { boundaries: range, singleCharacters: true } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should respect boundaries going backward', () => {
				const iterator = new ModelTreeWalker( {
					boundaries: range,
					singleCharacters: true,
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
	} );

	describe( '`shallow` iterates only through elements in the range', () => {
		it( '`shallow` only iterates elements in the range (forward)', () => {
			const walker = new ModelTreeWalker( {
				boundaries: new ModelRange(
					new ModelPosition( root, [ 0 ] ),
					new ModelPosition( root, [ 0, 0 ] )
				),
				shallow: true
			} );

			const items = Array.from( walker );

			expect( items.length ).to.equal( 1 );
			expect( items[ 0 ].type ).to.equal( 'elementStart' );
			expect( items[ 0 ].item ).to.equal( img1 );
		} );

		it( '`shallow` only iterates elements in the range that ends inside some element (forward)', () => {
			const p2 = new ModelElement( 'p' );
			const p3 = new ModelElement( 'p' );

			root._insertChild( 2, [ p2, p3 ] );

			const walker = new ModelTreeWalker( {
				boundaries: new ModelRange(
					new ModelPosition( root, [ 1 ] ),
					new ModelPosition( root, [ 1, 3 ] )
				),
				shallow: true
			} );

			const items = Array.from( walker );

			expect( items.length ).to.equal( 1 );
			expect( items[ 0 ].type ).to.equal( 'elementStart' );
			expect( items[ 0 ].item ).to.equal( paragraph );
		} );

		it( '`shallow` only iterates elements in the range ends deep inside some element (forward)', () => {
			const p2 = new ModelElement( 'p' );
			const p3 = new ModelElement( 'p' );

			root._insertChild( 2, [ p2, p3 ] );

			const walker = new ModelTreeWalker( {
				boundaries: new ModelRange(
					new ModelPosition( root, [ 1 ] ),
					new ModelPosition( root, [ 1, 3, 0 ] )
				),
				shallow: true
			} );

			const items = Array.from( walker );

			expect( items.length ).to.equal( 1 );
			expect( items[ 0 ].type ).to.equal( 'elementStart' );
			expect( items[ 0 ].item ).to.equal( paragraph );
		} );

		it( '`shallow` only iterates elements in the range (backwards)', () => {
			const walker = new ModelTreeWalker( {
				boundaries: new ModelRange(
					new ModelPosition( root, [ 0 ] ),
					new ModelPosition( root, [ 0, 0 ] )
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
				{ type: 'elementStart', item: img1 },
				{ type: 'elementStart', item: paragraph }
			];
		} );

		it( 'should not enter elements', () => {
			const iterator = new ModelTreeWalker( { startPosition: rootBeginning, shallow: true } );
			let i = 0;

			for ( const value of iterator ) {
				expectValue( value, expected[ i ], { shallow: true } );
				i++;
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should not enter elements going backward', () => {
			const iterator = new ModelTreeWalker( { startPosition: rootEnding, shallow: true, direction: 'backward' } );
			let i = expected.length;

			for ( const value of iterator ) {
				expectValue( value, expected[ --i ], { shallow: true, direction: 'backward' } );
			}

			expect( i ).to.equal( 0 );
		} );
	} );

	describe( 'iterate omitting elementEnd `ignoreElementEnd`', () => {
		describe( 'merged text', () => {
			let expected;

			beforeEach( () => {
				expected = [
					{ type: 'elementStart', item: img1 },
					{ type: 'elementStart', item: paragraph },
					{ type: 'text', data: 'ba', attrs: [ [ 'bold', true ] ] },
					{ type: 'text', data: 'r', attrs: [] },
					{ type: 'elementStart', item: img2 },
					{ type: 'text', data: 'x', attrs: [] }
				];
			} );

			it( 'should iterate ignoring elementEnd', () => {
				const iterator = new ModelTreeWalker( { startPosition: rootBeginning, ignoreElementEnd: true } );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should iterate ignoring elementEnd going backward', () => {
				const iterator = new ModelTreeWalker( {
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
					{ type: 'elementStart', item: img1 },
					{ type: 'elementStart', item: paragraph },
					{ type: 'text', data: 'b', attrs: [ [ 'bold', true ] ] },
					{ type: 'text', data: 'a', attrs: [ [ 'bold', true ] ] },
					{ type: 'text', data: 'r', attrs: [] },
					{ type: 'elementStart', item: img2 },
					{ type: 'text', data: 'x', attrs: [] }
				];
			} );

			it( 'should return single characters ignoring elementEnd', () => {
				const iterator = new ModelTreeWalker( {
					startPosition: rootBeginning,
					singleCharacters: true,
					ignoreElementEnd: true
				} );
				let i = 0;

				for ( const value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return single characters ignoring elementEnd going backward', () => {
				const iterator = new ModelTreeWalker( {
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

	it( 'should iterate over document fragment', () => {
		const foo = new ModelText( 'foo' );
		const bar = new ModelText( 'bar' );
		const p = new ModelElement( 'p', null, [ foo, bar ] );
		const docFrag = new ModelDocumentFragment( [ p ] );

		const iterator = new ModelTreeWalker( {
			startPosition: new ModelPosition( docFrag, [ 0 ] ),
			ignoreElementEnd: true
		} );

		const expected = [
			{ type: 'elementStart', item: p },
			{ type: 'text', data: 'foo', attrs: [] },
			{ type: 'text', data: 'bar', attrs: [] }
		];

		let i = 0;

		for ( const value of iterator ) {
			expectValue( value, expected[ i++ ], { ignoreElementEnd: true } );
		}
	} );

	describe( 'skip', () => {
		describe( 'forward treewalker', () => {
			it( 'should jump over all text nodes', () => {
				const walker = new ModelTreeWalker( {
					startPosition: ModelPosition._createAt( paragraph, 0 )
				} );

				walker.skip( value => value.type == 'text' );

				expect( walker.position.parent ).to.equal( paragraph );
				expect( walker.position.offset ).to.equal( 3 );
			} );

			it( 'should do not move if the condition is false', () => {
				const walker = new ModelTreeWalker( {
					startPosition: ModelPosition._createAt( paragraph, 1 )
				} );

				walker.skip( () => false );

				expect( walker.position.parent ).to.equal( paragraph );
				expect( walker.position.offset ).to.equal( 1 );
			} );

			it( 'should move to the end if the condition is true', () => {
				const walker = new ModelTreeWalker( {
					startPosition: ModelPosition._createAt( paragraph, 1 )
				} );

				walker.skip( () => true );

				expect( walker.position.parent ).to.equal( rootEnding.parent );
				expect( walker.position.offset ).to.equal( rootEnding.offset );
			} );
		} );

		describe( 'backward treewalker', () => {
			it( 'should jump over all text nodes', () => {
				const walker = new ModelTreeWalker( {
					startPosition: ModelPosition._createAt( paragraph, 3 ),
					direction: 'backward'
				} );

				walker.skip( value => value.type == 'text' );

				expect( walker.position.parent ).to.equal( paragraph );
				expect( walker.position.offset ).to.equal( 0 );
			} );

			it( 'should do not move if the condition is false', () => {
				const walker = new ModelTreeWalker( {
					startPosition: ModelPosition._createAt( paragraph, 1 ),
					direction: 'backward'
				} );

				walker.skip( () => false );

				expect( walker.position.parent ).to.equal( paragraph );
				expect( walker.position.offset ).to.equal( 1 );
			} );

			it( 'should move to the end if the condition is true', () => {
				const walker = new ModelTreeWalker( {
					startPosition: ModelPosition._createAt( paragraph, 1 ),
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
			const walker = new ModelTreeWalker( {
				startPosition: ModelPosition._createAt( paragraph, 0 )
			} );

			walker.jumpTo( new ModelPosition( paragraph, [ 2 ] ) );

			expect( walker.position.parent ).to.equal( paragraph );
			expect( walker.position.offset ).to.equal( 2 );

			walker.next();

			expect( walker.position.parent ).to.equal( paragraph );
			expect( walker.position.offset ).to.equal( 3 );
		} );

		it( 'cannot move position before the #_boundaryStartParent', () => {
			const range = new ModelRange(
				new ModelPosition( paragraph, [ 2 ] ),
				new ModelPosition( paragraph, [ 4 ] )
			);
			const walker = new ModelTreeWalker( {
				boundaries: range
			} );

			const positionBeforeAllowedRange = new ModelPosition( paragraph, [ 0 ] );

			walker.jumpTo( positionBeforeAllowedRange );

			// `jumpTo()` autocorrected the position to the first allowed position.
			expect( walker.position.parent ).to.equal( paragraph );
			expect( walker.position.offset ).to.equal( 2 );

			walker.next();

			expect( walker.position.parent ).to.equal( paragraph );
			expect( walker.position.offset ).to.equal( 3 );
		} );

		it( 'cannot move position after the #_boundaryEndParent', () => {
			const range = new ModelRange(
				new ModelPosition( paragraph, [ 0 ] ),
				new ModelPosition( paragraph, [ 2 ] )
			);
			const walker = new ModelTreeWalker( {
				boundaries: range
			} );

			const positionAfterAllowedRange = new ModelPosition( paragraph, [ 4 ] );

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

function expectValue( value, expected, options ) {
	expect( value.type ).to.equal( expected.type );

	if ( value.type == 'text' ) {
		expectText( value, expected, options );
	} else if ( value.type == 'elementStart' ) {
		expectStart( value, expected, options );
	} else if ( value.type == 'elementEnd' ) {
		expectEnd( value, expected, options );
	}
}

function expectText( value, expected, options = {} ) {
	let previousPosition, nextPosition;

	expect( value.item.data ).to.equal( expected.data );
	expect( Array.from( value.item.getAttributes() ) ).to.deep.equal( expected.attrs );
	expect( value.length ).to.equal( value.item.data.length );

	if ( options.direction == 'backward' ) {
		previousPosition = ModelPosition._createAfter( value.item );
		nextPosition = ModelPosition._createBefore( value.item );
	} else {
		previousPosition = ModelPosition._createBefore( value.item );
		nextPosition = ModelPosition._createAfter( value.item );
	}

	expect( value.previousPosition ).to.deep.equal( previousPosition );
	expect( value.nextPosition ).to.deep.equal( nextPosition );
}

function expectStart( value, expected, options = {} ) {
	let previousPosition, nextPosition;

	expect( value.item ).to.equal( expected.item );
	expect( value.length ).to.equal( 1 );

	if ( options.direction == 'backward' ) {
		previousPosition = ModelPosition._createAfter( value.item );
		nextPosition = ModelPosition._createBefore( value.item );
	} else {
		previousPosition = ModelPosition._createBefore( value.item );
		nextPosition = ModelPosition._createAt( value.item, 0 );
	}

	if ( options.shallow ) {
		expect( value.previousPosition ).to.deep.equal( previousPosition );
	} else {
		expect( value.nextPosition ).to.deep.equal( nextPosition );
	}
}

function expectEnd( value, expected, options = {} ) {
	let previousPosition, nextPosition;

	expect( value.item ).to.equal( expected.item );
	expect( value.length ).to.be.undefined;

	if ( options.direction == 'backward' ) {
		previousPosition = ModelPosition._createAfter( value.item );
		nextPosition = ModelPosition._createAt( value.item, value.item.maxOffset );
	} else {
		previousPosition = ModelPosition._createAt( value.item, value.item.maxOffset );
		nextPosition = ModelPosition._createAfter( value.item );
	}

	expect( value.previousPosition ).to.deep.equal( previousPosition );
	expect( value.nextPosition ).to.deep.equal( nextPosition );
}
