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
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

describe( 'range iterator', () => {
	let doc, expectedItemsSingle, expectedItemsMerged, root, img1, paragraph, b, a, r, img2, x;

	before( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

		// root
		//  |- img1
		//  |- p
		//     |- B
		//     |- A
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

		expectedItemsSingle = [
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

		expectedItemsMerged = [
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
	} );

	function expectItem( item, expected ) {
		expect( item.done ).to.be.false;

		expectValue( item.value, expected );
	}

	function expectValue( value, expected ) {
		expect( value.type ).to.equal( expected.type );

		if ( value.type == 'TEXT' ) {
			expectText( value, expected );
		} else if ( value.type == 'CHARACTER' ) {
			expectCharacter( value, expected );
		} else if ( value.type == 'ELEMENT_START' ) {
			expectStart( value, expected );
		} else if ( value.type == 'ELEMENT_END' ) {
			expectEnd( value, expected );
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

	function expectStart( value, expected ) {
		expect( value.item ).to.equal( expected.item );
		expect( value.length ).to.equal( 1 );
		expect( value.previousPosition ).to.deep.equal( Position.createBefore( value.item ) );
		expect( value.nextPosition ).to.deep.equal( Position.createFromParentAndOffset( value.item, 0 ) );
	}

	function expectEnd( value, expected ) {
		expect( value.item ).to.equal( expected.item );
		expect( value.length ).to.be.undefined;
		expect( value.previousPosition ).to.deep.equal(
			Position.createFromParentAndOffset( value.item, value.item.getChildCount() ) );
		expect( value.nextPosition ).to.deep.equal( Position.createAfter( value.item ) );
	}

	describe( 'merged characters', () => {
		it( 'should iterating over the range using next', () => {
			let start = new Position( root, [ 1 ] );
			let end = new Position( root, [ 1, 4 ] );
			let range = new Range( start, end );

			let iterator = new TreeWalker( { boundaries: range, position: range.start } );
			let i;

			for ( i = 2; i <= 6; i++ ) {
				expectItem( iterator.next(), expectedItemsMerged[ i ] );
			}
			expect( iterator.next() ).to.have.property( 'done' ).that.is.true;
		} );

		it( 'should iterating over the range using previous', () => {
			let start = new Position( root, [ 1 ] );
			let end = new Position( root, [ 1, 4 ] );
			let range = new Range( start, end );

			let iterator = new TreeWalker( { boundaries: range, position: range.end } );

			for ( let i = 6; i >= 2; i-- ) {
				expectItem( iterator.previous(), expectedItemsMerged[ i ] );
			}
			expect( iterator.previous() ).to.have.property( 'done' ).that.is.true;
		} );

		it( 'should respect boundaries when iterating using next', () => {
			let start = new Position( root, [ 1, 0 ] );
			let end = new Position( root, [ 1, 1 ] );
			let range = new Range( start, end );

			let iterator = new TreeWalker( { boundaries: range, position: range.start } );
			let val = iterator.next();

			expect( val.done ).to.be.false;
			expect( val.value.item.text ).to.equal( 'b' );

			val = iterator.next();
			expect( val.done ).to.be.true;
		} );

		it( 'should respect boundaries when iterating using previous', () => {
			let start = new Position( root, [ 1, 1 ] );
			let end = new Position( root, [ 1, 2 ] );
			let range = new Range( start, end );

			let iterator = new TreeWalker( { boundaries: range, position: range.end } );
			let val = iterator.previous();

			expect( val.done ).to.be.false;
			expect( val.value.item.text ).to.equal( 'a' );

			val = iterator.previous();
			expect( val.done ).to.be.true;
		} );
	} );

	describe( 'single characters', () => {
		it( 'should iterating over the range using next', () => {
			let iterator = new TreeWalker( { position: new Position( root, [ 0 ] ), singleCharacters: true } ); // beginning of root
			let i, len;

			for ( i = 0, len = expectedItemsSingle.length; i < len; i++ ) {
				expectItem( iterator.next(), expectedItemsSingle[ i ] );
			}
			expect( iterator.next() ).to.have.property( 'done' ).that.is.true;
		} );

		it( 'should iterating over the range using previous', () => {
			let iterator = new TreeWalker( { position: new Position( root, [ 2 ] ), singleCharacters: true } ); // ending of root

			for ( let i = expectedItemsSingle.length - 1; i >= 0; i-- ) {
				expectItem( iterator.previous(), expectedItemsSingle[ i ] );
			}
			expect( iterator.previous() ).to.have.property( 'done' ).that.is.true;
		} );

		it( 'should respect boundaries when iterating using next', () => {
			let start = new Position( root, [ 1, 0 ] ); // p, 0
			let end = new Position( root, [ 1, 3, 0 ] ); // img, 0

			let iterator = new TreeWalker( { boundaries: new Range( start, end ), singleCharacters: true } );

			let i, len;

			for ( i = 3, len = expectedItemsSingle.length; i < 7; i++ ) {
				expectItem( iterator.next(), expectedItemsSingle[ i ] );
			}
			expect( iterator.next() ).to.have.property( 'done' ).that.is.true;
		} );

		it( 'should respect boundaries when iterating using previous', () => {
			let start = new Position( root, [ 1, 0 ] ); // p, 0
			let end = new Position( root, [ 1, 3, 0 ] ); // img, 0

			let iterator = new TreeWalker( { boundaries: new Range( start, end ), position: end, singleCharacters: true } );

			let i, len;

			for ( i = 6, len = expectedItemsSingle.length; i > 2; i-- ) {
				expectItem( iterator.previous(), expectedItemsSingle[ i ] );
			}
			expect( iterator.previous() ).to.have.property( 'done' ).that.is.true;
		} );
	} );

	it( 'should provide iterator interface', () => {
		let iterator = new TreeWalker( { position: new Position( root, [ 0 ] ) } );
		let i = 0;

		for ( let value of iterator ) {
			expectValue( value, expectedItemsMerged[ i ] );
			i++;
		}

		expect( i ).to.equal( 9 );
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
