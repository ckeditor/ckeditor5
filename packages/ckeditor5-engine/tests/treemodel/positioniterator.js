/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Document from '/ckeditor5/core/treemodel/document.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import Text from '/ckeditor5/core/treemodel/text.js';
import PositionIterator from '/ckeditor5/core/treemodel/positioniterator.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import Range from '/ckeditor5/core/treemodel/range.js';

describe( 'range iterator', () => {
	let ELEMENT_ENTER, ELEMENT_LEAVE, CHARACTER, TEXT;

	let doc, expectedItems, expectedItemsMerged, root, img1, paragraph, b, a, r, img2, x;

	before( () => {
		ELEMENT_ENTER = PositionIterator.ELEMENT_ENTER;
		ELEMENT_LEAVE = PositionIterator.ELEMENT_LEAVE;
		TEXT = PositionIterator.TEXT;

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

		let attrBoldTrue = new Attribute( 'bold', true );

		b = new Text( 'b', [ attrBoldTrue ] );
		a = new Text( 'a', [ attrBoldTrue ] );
		r = new Text( 'r' );
		img2 = new Element( 'img2' );
		x = new Text( 'x' );

		paragraph = new Element( 'p', [], [ b, a, r, img2, x ] );
		img1 = new Element( 'img1' );

		root.insertChildren( 0, [ img1, paragraph ] );

		expectedItems = [
			{ type: ELEMENT_ENTER, node: img1 },
			{ type: ELEMENT_LEAVE, node: img1 },
			{ type: ELEMENT_ENTER, node: paragraph },
			{ type: TEXT, text: 'b', attrs: [ attrBoldTrue ] },
			{ type: TEXT, text: 'a', attrs: [ attrBoldTrue ] },
			{ type: TEXT, text: 'r', attrs: [] },
			{ type: ELEMENT_ENTER, node: img2 },
			{ type: ELEMENT_LEAVE, node: img2 },
			{ type: TEXT, text: 'x', attrs: [] },
			{ type: ELEMENT_LEAVE, node: paragraph }
		];

		expectedItemsMerged = [
			{ type: ELEMENT_ENTER, node: img1 },
			{ type: ELEMENT_LEAVE, node: img1 },
			{ type: ELEMENT_ENTER, node: paragraph },
			{ type: TEXT, text: 'ba', attrs: [ attrBoldTrue ] },
			{ type: TEXT, text: 'r', attrs: [] },
			{ type: ELEMENT_ENTER, node: img2 },
			{ type: ELEMENT_LEAVE, node: img2 },
			{ type: TEXT, text: 'x', attrs: [] },
			{ type: ELEMENT_LEAVE, node: paragraph }
		];
	} );

	function expectItem( item, expected ) {
		expect( item.done ).to.be.false;

		if ( item.value.type == TEXT ) {
			let text = item.value.node.text;

			expect( text ).to.equal( expected.text );
			expect( Array.from( item.value.node.attrs ) ).to.deep.equal( expected.attrs );
		} else {
			expect( item.value ).to.deep.equal( expected );
		}
	}

	it( 'should return next position', () => {
		let iterator = new PositionIterator( new Position( root, [ 0 ] ) ); // beginning of root
		let i, len;

		for ( i = 0, len = expectedItems.length; i < len; i++ ) {
			expectItem( iterator.next(), expectedItems[ i ] );
		}
		expect( iterator.next() ).to.have.property( 'done' ).that.is.true;
	} );

	it( 'should return previous position', () => {
		let iterator = new PositionIterator( new Position( root, [ 2 ] ) ); // ending of root

		for ( let i = expectedItems.length - 1; i >= 0; i-- ) {
			expectItem( iterator.previous(), expectedItems[ i ] );
		}
		expect( iterator.previous() ).to.have.property( 'done' ).that.is.true;
	} );

	it( 'should return next position in the boundaries', () => {
		let start = new Position( root, [ 1, 0 ] ); // p, 0
		let end = new Position( root, [ 1, 3, 0 ] ); // img, 0

		let iterator = new PositionIterator( new Range( start, end ) );

		let i, len;

		for ( i = 3, len = expectedItems.length; i < 7; i++ ) {
			expectItem( iterator.next(), expectedItems[ i ] );
		}
		expect( iterator.next() ).to.have.property( 'done' ).that.is.true;
	} );

	it( 'should return previous position in the boundaries', () => {
		let start = new Position( root, [ 1, 0 ] ); // p, 0
		let end = new Position( root, [ 1, 3, 0 ] ); // img, 0

		let iterator = new PositionIterator( new Range( start, end ), end );

		let i, len;

		for ( i = 6, len = expectedItems.length; i > 2; i-- ) {
			expectItem( iterator.previous(), expectedItems[ i ] );
		}
		expect( iterator.previous() ).to.have.property( 'done' ).that.is.true;
	} );

	it( 'should merge characters when iterating over the range using next', () => {
		let start = new Position( root, [ 1 ] );
		let end = new Position( root, [ 1, 4 ] );
		let range = new Range( start, end );

		let iterator = new PositionIterator( range, range.start, true );
		let i;

		for ( i = 2; i <= 6; i++ ) {
			expectItem( iterator.next(), expectedItemsMerged[ i ] );
		}
		expect( iterator.next() ).to.have.property( 'done' ).that.is.true;
	} );

	it( 'should merge characters when iterating over the range using previous', () => {
		let start = new Position( root, [ 1 ] );
		let end = new Position( root, [ 1, 4 ] );
		let range = new Range( start, end );

		let iterator = new PositionIterator( range, range.end, true );

		for ( let i = 6; i >= 2; i-- ) {
			expectItem( iterator.previous(), expectedItemsMerged[ i ] );
		}
		expect( iterator.previous() ).to.have.property( 'done' ).that.is.true;
	} );

	it( 'should respect boundaries when iterating using next and merging characters', () => {
		let start = new Position( root, [ 1, 0 ] );
		let end = new Position( root, [ 1, 1 ] );
		let range = new Range( start, end );

		let iterator = new PositionIterator( range, range.start, true );
		let val = iterator.next();

		expect( val.done ).to.be.false;
		expect( val.value.node.text ).to.equal( 'b' );

		val = iterator.next();
		expect( val.done ).to.be.true;
	} );

	it( 'should respect boundaries when iterating using previous and merging characters', () => {
		let start = new Position( root, [ 1, 1 ] );
		let end = new Position( root, [ 1, 2 ] );
		let range = new Range( start, end );

		let iterator = new PositionIterator( range, range.end, true );
		let val = iterator.previous();

		expect( val.done ).to.be.false;
		expect( val.value.node.text ).to.equal( 'a' );

		val = iterator.previous();
		expect( val.done ).to.be.true;
	} );
} );
