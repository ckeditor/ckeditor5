/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Document from '/ckeditor5/core/treemodel/document.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import Text from '/ckeditor5/core/treemodel/text.js';
import TreeWalker from '/ckeditor5/core/treemodel/treewalker.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import Range from '/ckeditor5/core/treemodel/range.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'TreeWalker', () => {
	let expectedSingle, expected, expectedIgnoreEnd, expectedSingleIgnoreEnd;
	let expectedShallow, expectedCroppedStart, expectedCroppedEnd;

	let doc, root, img1, paragraph, b, a, r, img2, x;
	let rootBeginning;

	before( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

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

		b = new Text( 'b', { bold: true } );
		a = new Text( 'a', { bold: true } );
		r = new Text( 'r' );
		img2 = new Element( 'img2' );
		x = new Text( 'x' );

		paragraph = new Element( 'p', [], [ b, a, r, img2, x ] );
		img1 = new Element( 'img1' );

		root.insertChildren( 0, [ img1, paragraph ] );

		rootBeginning = new Position( root, [ 0 ] );

		expected = [
			{ type: 'ELEMENT_START', item: img1 },
			{ type: 'ELEMENT_END', item: img1 },
			{ type: 'ELEMENT_START', item: paragraph },
			{ type: 'TEXT', text: 'ba', attrs: [ [ 'bold', true ] ] },
			{ type: 'TEXT', text: 'r', attrs: [] },
			{ type: 'ELEMENT_START', item: img2 },
			{ type: 'ELEMENT_END', item: img2 },
			{ type: 'TEXT', text: 'x', attrs: [] },
			{ type: 'ELEMENT_END', item: paragraph }
		];

		expectedCroppedEnd = [
			{ type: 'ELEMENT_START', item: img1 },
			{ type: 'ELEMENT_END', item: img1 },
			{ type: 'ELEMENT_START', item: paragraph },
			{ type: 'TEXT', text: 'b', attrs: [ [ 'bold', true ] ] }
		];

		expectedCroppedStart = [
			{ type: 'TEXT', text: 'a', attrs: [ [ 'bold', true ] ] },
			{ type: 'TEXT', text: 'r', attrs: [] },
			{ type: 'ELEMENT_START', item: img2 },
			{ type: 'ELEMENT_END', item: img2 },
			{ type: 'TEXT', text: 'x', attrs: [] },
			{ type: 'ELEMENT_END', item: paragraph }
		];

		expectedSingle = [
			{ type: 'ELEMENT_START', item: img1 },
			{ type: 'ELEMENT_END', item: img1 },
			{ type: 'ELEMENT_START', item: paragraph },
			{ type: 'CHARACTER', text: 'b', attrs: [ [ 'bold', true ] ] },
			{ type: 'CHARACTER', text: 'a', attrs: [ [ 'bold', true ] ] },
			{ type: 'CHARACTER', text: 'r', attrs: [] },
			{ type: 'ELEMENT_START', item: img2 },
			{ type: 'ELEMENT_END', item: img2 },
			{ type: 'CHARACTER', text: 'x', attrs: [] },
			{ type: 'ELEMENT_END', item: paragraph }
		];

		expectedIgnoreEnd = [
			{ type: 'ELEMENT_START', item: img1 },
			{ type: 'ELEMENT_START', item: paragraph },
			{ type: 'TEXT', text: 'ba', attrs: [ [ 'bold', true ] ] },
			{ type: 'TEXT', text: 'r', attrs: [] },
			{ type: 'ELEMENT_START', item: img2 },
			{ type: 'TEXT', text: 'x', attrs: [] }
		];

		expectedSingleIgnoreEnd = [
			{ type: 'ELEMENT_START', item: img1 },
			{ type: 'ELEMENT_START', item: paragraph },
			{ type: 'CHARACTER', text: 'b', attrs: [ [ 'bold', true ] ] },
			{ type: 'CHARACTER', text: 'a', attrs: [ [ 'bold', true ] ] },
			{ type: 'CHARACTER', text: 'r', attrs: [] },
			{ type: 'ELEMENT_START', item: img2 },
			{ type: 'CHARACTER', text: 'x', attrs: [] }
		];

		expectedShallow = [
			{ type: 'ELEMENT_START', item: img1 },
			{ type: 'ELEMENT_START', item: paragraph }
		];
	} );

	function expectItem( item, expected, options ) {
		expect( item.done ).to.be.false;

		expectValue( item.value, expected, options );
	}

	function expectValue( value, expected, options ) {
		expect( value.type ).to.equal( expected.type );

		if ( value.type == 'TEXT' ) {
			expectText( value, expected, options );
		} else if ( value.type == 'CHARACTER' ) {
			expectCharacter( value, expected, options );
		} else if ( value.type == 'ELEMENT_START' ) {
			expectStart( value, expected, options );
		} else if ( value.type == 'ELEMENT_END' ) {
			expectEnd( value, expected, options );
		}
	}

	function expectText( value, expected ) {
		expect( value.item.text ).to.equal( expected.text );
		expect( Array.from( value.item.first._attrs ) ).to.deep.equal( expected.attrs );
		expect( value.length ).to.equal( value.item.text.length );
		expect( value.previousPosition ).to.deep.equal( Position.createBefore( value.item.first ) );
		expect( value.nextPosition ).to.deep.equal( Position.createAfter( value.item.last ) );
	}

	function expectCharacter( value, expected ) {
		expect( value.item.character ).to.equal( expected.text );
		expect( Array.from( value.item._attrs ) ).to.deep.equal( expected.attrs );
		expect( value.length ).to.equal( value.item.character.length );
		expect( value.previousPosition ).to.deep.equal( Position.createBefore( value.item ) );
		expect( value.nextPosition ).to.deep.equal( Position.createAfter( value.item ) );
	}

	function expectStart( value, expected, options ) {
		expect( value.item ).to.equal( expected.item );
		expect( value.length ).to.equal( 1 );
		expect( value.previousPosition ).to.deep.equal( Position.createBefore( value.item ) );

		if ( options && options.shallow ) {
			expect( value.previousPosition ).to.deep.equal( Position.createBefore( value.item ) );
		} else {
			expect( value.nextPosition ).to.deep.equal( Position.createFromParentAndOffset( value.item, 0 ) );
		}
	}

	function expectEnd( value, expected ) {
		expect( value.item ).to.equal( expected.item );
		expect( value.length ).to.be.undefined;
		expect( value.previousPosition ).to.deep.equal(
			Position.createFromParentAndOffset( value.item, value.item.getChildCount() ) );
		expect( value.nextPosition ).to.deep.equal( Position.createAfter( value.item ) );
	}

	it( 'should provide iterator methods', () => {
		let iterator = new TreeWalker( { startPosition: rootBeginning } );

		for ( let i = 0; i <= 8; i++ ) {
			expectItem( iterator.next(), expected[ i ] );
		}
		expect( iterator.next() ).to.have.property( 'done' ).that.is.true;
	} );

	it( 'should provide iterator interface', () => {
		let iterator = new TreeWalker( { startPosition: rootBeginning } );
		let i = 0;

		for ( let value of iterator ) {
			expectValue( value, expected[ i ] );
			i++;
		}

		expect( i ).to.equal( expected.length );
	} );

	it( 'should start at the startPosition', () => {
		let iterator = new TreeWalker( { startPosition: new Position( root, [ 1 ] ) } );
		let i = 2;

		for ( let value of iterator ) {
			expectValue( value, expected[ i ] );
			i++;
		}

		expect( i ).to.equal( expected.length );
	} );

	it( 'should iterating over the range', () => {
		let start = new Position( root, [ 1 ] );
		let end = new Position( root, [ 1, 4 ] );
		let range = new Range( start, end );

		let iterator = new TreeWalker( { boundaries: range } );
		let i = 2;

		for ( let value of iterator ) {
			expectValue( value, expected[ i ] );
			i++;
		}

		expect( i ).to.equal( 7 );
	} );

	it( 'should start iterating at startPosition even if the range is defined', () => {
		let start = new Position( root, [ 1 ] );
		let end = new Position( root, [ 1, 4 ] );
		let range = new Range( start, end );

		let iterator = new TreeWalker( { boundaries: range } );
		let i = 2;

		for ( let value of iterator ) {
			expectValue( value, expected[ i ] );
			i++;
		}

		expect( i ).to.equal( 7 );
	} );

	it( 'should return part of the text if range starts inside the text', () => {
		let iterator = new TreeWalker( { startPosition: new Position( root, [ 1, 1 ] ) } );
		let i = 0;

		for ( let value of iterator ) {
			expectValue( value, expectedCroppedStart[ i ] );
			i++;
		}

		expect( i ).to.equal( expectedCroppedStart.length );
	} );

	it( 'should return part of the text if range ends inside the text', () => {
		let start = rootBeginning;
		let end = new Position( root, [ 1, 1 ] );
		let range = new Range( start, end );

		let iterator = new TreeWalker( { boundaries: range } );
		let i = 0;

		for ( let value of iterator ) {
			expectValue( value, expectedCroppedEnd[ i ] );
			i++;
		}

		expect( i ).to.equal( expectedCroppedEnd.length );
	} );

	describe( 'singleCharacters', () => {
		it( 'should return single characters', () => {
			let iterator = new TreeWalker( { startPosition: rootBeginning, singleCharacters: true } );
			let i = 0;

			for ( let value of iterator ) {
				expectValue( value, expectedSingle[ i ] );
				i++;
			}

			expect( i ).to.equal( expectedSingle.length );
		} );

		it( 'should respect boundaries', () => {
			let start = new Position( root, [ 1, 0 ] ); // p, 0
			let end = new Position( root, [ 1, 3, 0 ] ); // img, 0

			let iterator = new TreeWalker( { boundaries: new Range( start, end ), singleCharacters: true } );
			let i = 3;

			for ( let value of iterator ) {
				expectValue( value, expectedSingle[ i ] );
				i++;
			}

			expect( i ).to.equal( 7 );
		} );
	} );

	describe( 'shallow', () => {
		it( 'should not enter elements', () => {
			let iterator = new TreeWalker( { startPosition: rootBeginning, shallow: true } );
			let i = 0;

			for ( let value of iterator ) {
				expectValue( value, expectedShallow[ i ], { shallow: true } );
				i++;
			}

			expect( i ).to.equal( expectedShallow.length );
		} );
	} );

	describe( 'ignoreElementEnd', () => {
		it( 'should iterate ignoring ELEMENT_END', () => {
			let iterator = new TreeWalker( { startPosition: rootBeginning, ignoreElementEnd: true } );
			let i = 0;

			for ( let value of iterator ) {
				expectValue( value, expectedIgnoreEnd[ i ] );
				i++;
			}

			expect( i ).to.equal( expectedIgnoreEnd.length );
		} );

		it( 'should return single characters ignoring ELEMENT_END', () => {
			let iterator = new TreeWalker( { startPosition: rootBeginning, singleCharacters: true, ignoreElementEnd: true } );
			let i = 0;

			for ( let value of iterator ) {
				expectValue( value, expectedSingleIgnoreEnd[ i ] );
				i++;
			}

			expect( i ).to.equal( expectedSingleIgnoreEnd.length );
		} );
	} );

	it( 'should throw if neither boundaries nor starting position is set', () => {
		expect( () => {
			new TreeWalker();
		} ).to.throw( CKEditorError, /^tree-walker-no-start-position/ );

		expect( () => {
			new TreeWalker( {} );
		} ).to.throw( CKEditorError, /^tree-walker-no-start-position/ );

		expect( () => {
			new TreeWalker( { mergeCharacters: true } );
		} ).to.throw( CKEditorError, /^tree-walker-no-start-position/ );
	} );
} );
