/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

import Document from '/ckeditor5/engine/model/document.js';
import Element from '/ckeditor5/engine/model/element.js';
import Text from '/ckeditor5/engine/model/text.js';
import TreeWalker from '/ckeditor5/engine/model/treewalker.js';
import Position from '/ckeditor5/engine/model/position.js';
import Range from '/ckeditor5/engine/model/range.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'TreeWalker', () => {
	let doc, root, img1, paragraph, ba, r, img2, x;
	let rootBeginning, rootEnding;

	before( () => {
		doc = new Document();
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

		ba = new Text( 'ba', { bold: true } );
		r = new Text( 'r' );
		img2 = new Element( 'img2' );
		x = new Text( 'x' );

		paragraph = new Element( 'p', [], [ ba, r, img2, x ] );
		img1 = new Element( 'img1' );

		root.insertChildren( 0, [ img1, paragraph ] );

		rootBeginning = new Position( root, [ 0 ] );
		rootEnding = new Position( root, [ 2 ] );
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
				new TreeWalker( { startPosition: rootBeginning, direction: 'unknown' } );
			} ).to.throw( CKEditorError, /^tree-walker-unknown-direction/ );
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
			let iterator = new TreeWalker( { startPosition: rootBeginning } );
			let i = 0;

			for ( let value of iterator ) {
				expectValue( value, expected[ i ] );
				i++;
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should provide iterator interface with forward direction', () => {
			let iterator = new TreeWalker( { startPosition: rootBeginning, direction: 'forward' } );
			let i = 0;

			for ( let value of iterator ) {
				expectValue( value, expected[ i ] );
				i++;
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should provide iterator interface which backward direction', () => {
			let iterator = new TreeWalker( { startPosition: rootEnding, direction: 'backward' } );
			let i = expected.length;

			for ( let value of iterator ) {
				expectValue( value, expected[ --i ], { direction: 'backward' } );
			}

			expect( i ).to.equal( 0 );
		} );

		it( 'should start iterating at the startPosition witch is not a root bound', () => {
			let iterator = new TreeWalker( { startPosition: new Position( root, [ 1 ] ) } );
			let i = 2;

			for ( let value of iterator ) {
				expectValue( value, expected[ i ] );
				i++;
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should start iterating at the startPosition witch is not a root bound, going backward', () => {
			let expected = [
				{ type: 'elementStart', item: img1 },
				{ type: 'elementEnd', item: img1 }
			];

			let iterator = new TreeWalker( { startPosition: new Position( root, [ 1 ] ), direction: 'backward' } );
			let i = expected.length;

			for ( let value of iterator ) {
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
					{ type: 'elementStart', item: paragraph },
					{ type: 'text', data: 'ba', attrs: [ [ 'bold', true ] ] },
					{ type: 'text', data: 'r', attrs: [] },
					{ type: 'elementStart', item: img2 },
					{ type: 'elementEnd', item: img2 }
				];

				range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 1, 4 ] ) );
			} );

			it( 'should iterate over the range', () => {
				let iterator = new TreeWalker( { boundaries: range } );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should iterate over the range going backward', () => {
				let iterator = new TreeWalker( { boundaries: range, direction: 'backward' } );
				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'range starts inside the text', () => {
			let expected, range;

			before( () => {
				expected = [
					{ type: 'text', data: 'a', attrs: [ [ 'bold', true ] ] },
					{ type: 'text', data: 'r', attrs: [] },
					{ type: 'elementStart', item: img2 },
					{ type: 'elementEnd', item: img2 }
				];

				range = new Range( new Position( root, [ 1, 1 ] ), new Position( root, [ 1, 4 ] ) );
			} );

			it( 'should return part of the text', () => {
				let iterator = new TreeWalker( { boundaries: range } );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return part of the text going backward', () => {
				let iterator = new TreeWalker( {
					boundaries: range,
					direction: 'backward' }
				);
				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'range ends inside the text', () => {
			let expected, range;

			before( () => {
				expected = [
					{ type: 'elementStart', item: img1 },
					{ type: 'elementEnd', item: img1 },
					{ type: 'elementStart', item: paragraph },
					{ type: 'text', data: 'b', attrs: [ [ 'bold', true ] ] }
				];

				range = new Range( rootBeginning, new Position( root, [ 1, 1 ] ) );
			} );

			it( 'should return part of the text', () => {
				let iterator = new TreeWalker( { boundaries: range } );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return part of the text going backward', () => {
				let iterator = new TreeWalker( {
					boundaries: range,
					startPosition: range.end,
					direction: 'backward'
				} );
				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'custom start position', () => {
			it( 'should iterating from the start position', () => {
				let expected = [
					{ type: 'text', data: 'r', attrs: [] },
					{ type: 'elementStart', item: img2 },
					{ type: 'elementEnd', item: img2 }
				];

				let range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 1, 4 ] ) );

				let iterator = new TreeWalker( {
					boundaries: range,
					startPosition: new Position( root, [ 1, 2 ] )
				} );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should iterating from the start position going backward', () => {
				let expected = [
					{ type: 'text', data: 'r', attrs: [] },
					{ type: 'elementStart', item: img2 },
					{ type: 'elementEnd', item: img2 }
				];

				let range = new Range( new Position( root, [ 1, 2 ] ), new Position( root, [ 1, 6 ] ) );

				let iterator = new TreeWalker( {
					boundaries: range,
					startPosition: new Position( root, [ 1, 4 ] ),
					direction: 'backward'
				} );
				let i = expected.length;

				for ( let value of iterator ) {
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
				let iterator = new TreeWalker( { startPosition: rootBeginning, singleCharacters: true } );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return single characters going backward', () => {
				let iterator = new TreeWalker( {
					startPosition: rootEnding,
					singleCharacters: true,
					direction: 'backward' }
				);
				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'range', () => {
			let start, end, range, expected;

			before( () => {
				expected = [
					{ type: 'text', data: 'b', attrs: [ [ 'bold', true ] ] },
					{ type: 'text', data: 'a', attrs: [ [ 'bold', true ] ] },
					{ type: 'text', data: 'r', attrs: [] },
					{ type: 'elementStart', item: img2 }
				];

				start = new Position( root, [ 1, 0 ] ); // p, 0
				end = new Position( root, [ 1, 3, 0 ] ); // img2, 0
				range = new Range( start, end );
			} );

			it( 'should respect boundaries', () => {
				let iterator = new TreeWalker( { boundaries: range, singleCharacters: true } );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should respect boundaries going backward', () => {
				let iterator = new TreeWalker( {
					boundaries: range,
					singleCharacters: true,
					startPosition: range.end,
					direction: 'backward'
				} );
				let i = expected.length;

				for ( let value of iterator ) {
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
				{ type: 'elementStart', item: img1 },
				{ type: 'elementStart', item: paragraph }
			];
		} );

		it( 'should not enter elements', () => {
			let iterator = new TreeWalker( { startPosition: rootBeginning, shallow: true } );
			let i = 0;

			for ( let value of iterator ) {
				expectValue( value, expected[ i ], { shallow: true } );
				i++;
			}

			expect( i ).to.equal( expected.length );
		} );

		it( 'should not enter elements going backward', () => {
			let iterator = new TreeWalker( { startPosition: rootEnding, shallow: true, direction: 'backward' } );
			let i = expected.length;

			for ( let value of iterator ) {
				expectValue( value, expected[ --i ], { shallow: true, direction: 'backward' } );
			}

			expect( i ).to.equal( 0 );
		} );
	} );

	describe( 'iterate omitting elementEnd `ignoreElementEnd`', () => {
		describe( 'merged text', () => {
			let expected;

			before( () => {
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
				let iterator = new TreeWalker( { startPosition: rootBeginning, ignoreElementEnd: true } );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should iterate ignoring elementEnd going backward', () => {
				let iterator = new TreeWalker( {
					startPosition: rootEnding,
					ignoreElementEnd: true,
					direction: 'backward'
				} );
				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
		} );

		describe( 'single character', () => {
			let expected;

			before( () => {
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
				let iterator = new TreeWalker( {
					startPosition: rootBeginning,
					singleCharacters: true,
					ignoreElementEnd: true
				} );
				let i = 0;

				for ( let value of iterator ) {
					expectValue( value, expected[ i ] );
					i++;
				}

				expect( i ).to.equal( expected.length );
			} );

			it( 'should return single characters ignoring elementEnd going backward', () => {
				let iterator = new TreeWalker( {
					startPosition: rootEnding,
					singleCharacters: true,
					ignoreElementEnd: true,
					direction: 'backward'
				} );
				let i = expected.length;

				for ( let value of iterator ) {
					expectValue( value, expected[ --i ], { direction: 'backward' } );
				}

				expect( i ).to.equal( 0 );
			} );
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
		previousPosition = Position.createAfter( value.item );
		nextPosition = Position.createBefore( value.item );
	} else {
		previousPosition = Position.createBefore( value.item );
		nextPosition = Position.createAfter( value.item );
	}

	expect( value.previousPosition ).to.deep.equal( previousPosition );
	expect( value.nextPosition ).to.deep.equal( nextPosition );
}

function expectStart( value, expected, options = {} ) {
	let previousPosition, nextPosition;

	expect( value.item ).to.equal( expected.item );
	expect( value.length ).to.equal( 1 );

	if ( options.direction == 'backward' ) {
		previousPosition = Position.createAfter( value.item );
		nextPosition = Position.createBefore( value.item );
	} else {
		previousPosition = Position.createBefore( value.item );
		nextPosition = Position.createFromParentAndOffset( value.item, 0 );
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
		previousPosition = Position.createAfter( value.item );
		nextPosition = Position.createFromParentAndOffset( value.item, value.item.maxOffset );
	} else {
		previousPosition = Position.createFromParentAndOffset( value.item, value.item.maxOffset );
		nextPosition = Position.createAfter( value.item );
	}

	expect( value.previousPosition ).to.deep.equal( previousPosition );
	expect( value.nextPosition ).to.deep.equal( nextPosition );
}
