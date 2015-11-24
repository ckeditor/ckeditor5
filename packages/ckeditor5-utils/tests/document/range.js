/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

const modules = bender.amd.require(
	'document/range',
	'document/position',
	'document/element',
	'document/character',
	'document/document'
);

describe( 'Range', () => {
	let Range, Position, Element, Character, Document;

	let start, end;

	before( () => {
		Position = modules[ 'document/position' ];
		Range = modules[ 'document/range' ];
		Element = modules[ 'document/element' ];
		Character = modules[ 'document/character' ];
		Document = modules[ 'document/document' ];

		start = new Position( [ 0 ] );
		end = new Position( [ 1 ] );
	} );

	let range;

	beforeEach( () => {
		range = new Range( start, end );
	} );

	describe( 'constructor', () => {
		it( 'should create a range with given positions', () => {
			expect( range ).to.have.property( 'start' ).that.equal( start );
			expect( range ).to.have.property( 'end' ).that.equal( end );
		} );
	} );

	describe( 'isEqual', () => {
		it( 'should return true if the ranges are the same', () => {
			let sameStart = new Position( [ 0 ] );
			let sameEnd = new Position( [ 1 ] );

			let sameRange = new Range( sameStart, sameEnd );

			expect( range.isEqual( sameRange ) ).to.be.true;
		} );

		it( 'should return false if the start position is different', () => {
			let range = new Range( start, end );

			let diffStart = new Position( [ 1 ] );
			let sameEnd = new Position( [ 1 ] );

			let diffRange = new Range( diffStart, sameEnd );

			expect( range.isEqual( diffRange ) ).to.not.be.true;
		} );

		it( 'should return false if the end position is different', () => {
			let sameStart = new Position( [ 0 ] );
			let diffEnd = new Position( [ 0 ] );

			let diffRange = new Range( sameStart, diffEnd );

			expect( range.isEqual( diffRange ) ).to.not.be.true;
		} );
	} );

	describe( 'static constructors', () => {
		let doc, root, p, f, o, z;

		// root
		//  |- p
		//     |- f
		//     |- o
		//     |- z
		before( () => {
			doc = new Document();

			root = doc.createRoot( 'root' );

			f = new Character( 'f' );
			o = new Character( 'o' );
			z = new Character( 'z' );

			p = new Element( 'p', [], [ f, o, z ] );

			root.insertChildren( 0, [ p ] );
		} );

		describe( 'createFromElement', () => {
			it( 'should return range', () => {
				const range = Range.createFromElement( p );

				expect( range.start.path ).to.deep.equal( [ 0, 0 ] );
				expect( range.end.path ).to.deep.equal( [ 0, 3 ] );
			} );
		} );

		describe( 'createFromParentsAndOffsets', () => {
			it( 'should return range', () => {
				const range = Range.createFromParentsAndOffsets( root, 0, p, 2 );

				expect( range.start.path ).to.deep.equal( [ 0 ] );
				expect( range.end.path ).to.deep.equal( [ 0, 2 ] );
			} );
		} );
	} );
} );
