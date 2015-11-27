/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

const modules = bender.amd.require(
	'document/element',
	'document/character',
	'document/position',
	'document/document',
	'ckeditorerror',
	'document/nodelist'
);

describe( 'position', () => {
	let Element, Character, Document, NodeList, Position, CKEditorError;

	let doc, root, otherRoot, p, ul, li1, li2, f, o, z, b, a, r;

	// root
	//  |- p         Before: [ 0 ]       After: [ 1 ]
	//  |- ul        Before: [ 1 ]       After: [ 2 ]
	//     |- li     Before: [ 1, 0 ]    After: [ 1, 1 ]
	//     |  |- f   Before: [ 1, 0, 0 ] After: [ 1, 0, 1 ]
	//     |  |- o   Before: [ 1, 0, 1 ] After: [ 1, 0, 2 ]
	//     |  |- z   Before: [ 1, 0, 2 ] After: [ 1, 0, 3 ]
	//     |- li     Before: [ 1, 1 ]    After: [ 1, 2 ]
	//        |- b   Before: [ 1, 1, 0 ] After: [ 1, 1, 1 ]
	//        |- a   Before: [ 1, 1, 1 ] After: [ 1, 1, 2 ]
	//        |- r   Before: [ 1, 1, 2 ] After: [ 1, 1, 3 ]
	before( () => {
		Element = modules[ 'document/element' ];
		Character = modules[ 'document/character' ];
		Document = modules[ 'document/document' ];
		NodeList = modules[ 'document/nodelist' ];
		Position = modules[ 'document/position' ];
		CKEditorError = modules.ckeditorerror;

		doc = new Document();

		root = doc.createRoot( 'root' );
		otherRoot = doc.createRoot( 'otherRoot' );

		f = new Character( 'f' );
		o = new Character( 'o' );
		z = new Character( 'z' );

		li1 = new Element( 'li', [], [ f, o, z ] );

		b = new Character( 'b' );
		a = new Character( 'a' );
		r = new Character( 'r' );

		li2 = new Element( 'li', [], [ b, a, r ] );

		ul = new Element( 'ul', [], [ li1, li2 ] );

		p = new Element( 'p' );

		root.insertChildren( 0, [ p, ul ] );
	} );

	it( 'should create a position with path and document', () => {
		let position = new Position( [ 0 ], root );

		expect( position ).to.have.property( 'path' ).that.deep.equals( [ 0 ] );
		expect( position ).to.have.property( 'root' ).that.equals( root );
	} );

	it( 'should throw error if given root is not a RootElement instance', () => {
		expect( () => {
			new Position( [ 0 ] );
		} ).to.throw( CKEditorError, /position-root-not-rootelement/ );

		expect( () => {
			new Position( [ 0 ], new Element( 'p' ) );
		} ).to.throw( CKEditorError, /position-root-not-rootelement/ );
	} );

	it( 'should make positions form node and offset', () => {
		expect( Position.createFromParentAndOffset( root, 0 ) ).to.have.property( 'path' ).that.deep.equals( [ 0 ] );
		expect( Position.createFromParentAndOffset( root, 1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1 ] );
		expect( Position.createFromParentAndOffset( root, 2 ) ).to.have.property( 'path' ).that.deep.equals( [ 2 ] );

		expect( Position.createFromParentAndOffset( p, 0 ) ).to.have.property( 'path' ).that.deep.equals( [ 0, 0 ] );

		expect( Position.createFromParentAndOffset( ul, 0 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0 ] );
		expect( Position.createFromParentAndOffset( ul, 1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1 ] );
		expect( Position.createFromParentAndOffset( ul, 2 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 2 ] );

		expect( Position.createFromParentAndOffset( li1, 0 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 0 ] );
		expect( Position.createFromParentAndOffset( li1, 1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 1 ] );
		expect( Position.createFromParentAndOffset( li1, 2 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 2 ] );
		expect( Position.createFromParentAndOffset( li1, 3 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 3 ] );
	} );

	it( 'should make positions before elements', () => {
		expect( Position.createBefore( p ) ).to.have.property( 'path' ).that.deep.equals( [ 0 ] );

		expect( Position.createBefore( ul ) ).to.have.property( 'path' ).that.deep.equals( [ 1 ] );

		expect( Position.createBefore( li1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0 ] );

		expect( Position.createBefore( f ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 0 ] );
		expect( Position.createBefore( o ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 1 ] );
		expect( Position.createBefore( z ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 2 ] );

		expect( Position.createBefore( li2 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1 ] );

		expect( Position.createBefore( b ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 0 ] );
		expect( Position.createBefore( a ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 1 ] );
		expect( Position.createBefore( r ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 2 ] );
	} );

	it( 'should throw error if one try to make positions before root', () => {
		expect( () => {
			Position.createBefore( root );
		} ).to.throw( CKEditorError, /position-before-root/ );
	} );

	it( 'should make positions after elements', () => {
		expect( Position.createAfter( p ) ).to.have.property( 'path' ).that.deep.equals( [ 1 ] );

		expect( Position.createAfter( ul ) ).to.have.property( 'path' ).that.deep.equals( [ 2 ] );

		expect( Position.createAfter( li1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1 ] );

		expect( Position.createAfter( f ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 1 ] );
		expect( Position.createAfter( o ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 2 ] );
		expect( Position.createAfter( z ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 3 ] );

		expect( Position.createAfter( li2 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 2 ] );

		expect( Position.createAfter( b ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 1 ] );
		expect( Position.createAfter( a ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 2 ] );
		expect( Position.createAfter( r ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 3 ] );
	} );

	it( 'should throw error if one try to make positions after root', () => {
		expect( () => {
			Position.createAfter( root );
		} ).to.throw( CKEditorError, /position-after-root/ );
	} );

	it( 'should have parent', () => {
		expect( new Position( [ 0 ], root ) ).to.have.property( 'parent' ).that.equals( root );
		expect( new Position( [ 1 ], root ) ).to.have.property( 'parent' ).that.equals( root );
		expect( new Position( [ 2 ], root ) ).to.have.property( 'parent' ).that.equals( root );

		expect( new Position( [ 0, 0 ], root ) ).to.have.property( 'parent' ).that.equals( p );

		expect( new Position( [ 1, 0 ], root ) ).to.have.property( 'parent' ).that.equals( ul );
		expect( new Position( [ 1, 1 ], root ) ).to.have.property( 'parent' ).that.equals( ul );
		expect( new Position( [ 1, 2 ], root ) ).to.have.property( 'parent' ).that.equals( ul );

		expect( new Position( [ 1, 0, 0 ], root ) ).to.have.property( 'parent' ).that.equals( li1 );
		expect( new Position( [ 1, 0, 1 ], root ) ).to.have.property( 'parent' ).that.equals( li1 );
		expect( new Position( [ 1, 0, 2 ], root ) ).to.have.property( 'parent' ).that.equals( li1 );
		expect( new Position( [ 1, 0, 3 ], root ) ).to.have.property( 'parent' ).that.equals( li1 );
	} );

	it( 'should have offset', () => {
		expect( new Position( [ 0 ], root ) ).to.have.property( 'offset' ).that.equals( 0 );
		expect( new Position( [ 1 ], root ) ).to.have.property( 'offset' ).that.equals( 1 );
		expect( new Position( [ 2 ], root ) ).to.have.property( 'offset' ).that.equals( 2 );

		expect( new Position( [ 0, 0 ], root ) ).to.have.property( 'offset' ).that.equals( 0 );

		expect( new Position( [ 1, 0 ], root ) ).to.have.property( 'offset' ).that.equals( 0 );
		expect( new Position( [ 1, 1 ], root ) ).to.have.property( 'offset' ).that.equals( 1 );
		expect( new Position( [ 1, 2 ], root ) ).to.have.property( 'offset' ).that.equals( 2 );

		expect( new Position( [ 1, 0, 0 ], root ) ).to.have.property( 'offset' ).that.equals( 0 );
		expect( new Position( [ 1, 0, 1 ], root ) ).to.have.property( 'offset' ).that.equals( 1 );
		expect( new Position( [ 1, 0, 2 ], root ) ).to.have.property( 'offset' ).that.equals( 2 );
		expect( new Position( [ 1, 0, 3 ], root ) ).to.have.property( 'offset' ).that.equals( 3 );
	} );

	it( 'should be able to set offset', () => {
		let position = new Position( [ 1, 0, 2 ], root );
		position.offset = 4;

		expect( position.offset ).to.equal( 4 );
		expect( position.path ).to.deep.equal( [ 1, 0, 4 ] );
	} );

	it( 'should have nodeBefore', () => {
		expect( new Position( [ 0 ], root ) ).to.have.property( 'nodeBefore' ).that.is.null;
		expect( new Position( [ 1 ], root ) ).to.have.property( 'nodeBefore' ).that.equals( p );
		expect( new Position( [ 2 ], root ) ).to.have.property( 'nodeBefore' ).that.equals( ul );

		expect( new Position( [ 0, 0 ], root ) ).to.have.property( 'nodeBefore' ).that.is.null;

		expect( new Position( [ 1, 0 ], root ) ).to.have.property( 'nodeBefore' ).that.is.null;
		expect( new Position( [ 1, 1 ], root ) ).to.have.property( 'nodeBefore' ).that.equals( li1 );
		expect( new Position( [ 1, 2 ], root ) ).to.have.property( 'nodeBefore' ).that.equals( li2 );

		expect( new Position( [ 1, 0, 0 ], root ) ).to.have.property( 'nodeBefore' ).that.is.null;
		expect( new Position( [ 1, 0, 1 ], root ) ).to.have.property( 'nodeBefore' ).that.equals( f );
		expect( new Position( [ 1, 0, 2 ], root ) ).to.have.property( 'nodeBefore' ).that.equals( o );
		expect( new Position( [ 1, 0, 3 ], root ) ).to.have.property( 'nodeBefore' ).that.equals( z );
	} );

	it( 'should have nodeAfter', () => {
		expect( new Position( [ 0 ], root ) ).to.have.property( 'nodeAfter' ).that.equals( p );
		expect( new Position( [ 1 ], root ) ).to.have.property( 'nodeAfter' ).that.equals( ul );
		expect( new Position( [ 2 ], root ) ).to.have.property( 'nodeAfter' ).that.is.null;

		expect( new Position( [ 0, 0 ], root ) ).to.have.property( 'nodeAfter' ).that.is.null;

		expect( new Position( [ 1, 0 ], root ) ).to.have.property( 'nodeAfter' ).that.equals( li1 );
		expect( new Position( [ 1, 1 ], root ) ).to.have.property( 'nodeAfter' ).that.equals( li2 );
		expect( new Position( [ 1, 2 ], root ) ).to.have.property( 'nodeAfter' ).that.is.null;

		expect( new Position( [ 1, 0, 0 ], root ) ).to.have.property( 'nodeAfter' ).that.equals( f );
		expect( new Position( [ 1, 0, 1 ], root ) ).to.have.property( 'nodeAfter' ).that.equals( o );
		expect( new Position( [ 1, 0, 2 ], root ) ).to.have.property( 'nodeAfter' ).that.equals( z );
		expect( new Position( [ 1, 0, 3 ], root ) ).to.have.property( 'nodeAfter' ).that.is.null;
	} );

	it( 'should have proper parent path', () => {
		let position = new Position( [ 1, 2, 3 ], root );

		expect( position.getParentPath() ).to.deep.equal( [ 1, 2 ] );
	} );

	it( 'should return a new, equal position when cloned', () => {
		const position = new Position( [ 1, 2, 3 ], root );
		const clone = position.clone();

		expect( clone ).not.to.be.equal( position ); // clone is not pointing to the same object as position
		expect( clone.isEqual( position ) ).to.be.true; // but they are equal in the position-sense
		expect( clone.path ).not.to.be.equal( position.path ); // make sure the paths are not the same array
	} );

	describe( 'isBefore', () => {
		it( 'should return true if given position has same root and is before this position', () => {
			let position = new Position( [ 1, 1, 2 ], root );
			let beforePosition = new Position( [ 1, 0 ], root );

			expect( position.isAfter( beforePosition ) ).to.be.true;
		} );

		it( 'should return false if given position has same root and is not before this position', () => {
			let position = new Position( [ 1, 1, 2 ], root );
			let afterPosition = new Position( [ 1, 2 ], root );

			expect( position.isAfter( afterPosition ) ).to.be.false;
		} );

		it( 'should return false if given position has different root', () => {
			let position = new Position( [ 1, 1, 2 ], root );
			let differentPosition = new Position( [ 1, 0 ], otherRoot );

			expect( position.isAfter( differentPosition ) ).to.be.false;
		} );
	} );

	describe( 'isEqual', () => {
		it( 'should return true if given position has same path and root', () => {
			let position = new Position( [ 1, 1, 2 ], root );
			let samePosition = new Position( [ 1, 1, 2 ], root );

			expect( position.isEqual( samePosition ) ).to.be.true;
		} );

		it( 'should return false if given position has different path', () => {
			let position = new Position( [ 1, 1, 1 ], root );
			let differentPosition = new Position( [ 1, 2, 2 ], root );

			expect( position.isEqual( differentPosition ) ).to.be.false;
		} );

		it( 'should return false if given position has different root', () => {
			let position = new Position( [ 1, 1, 1 ], root );
			let differentPosition = new Position( [ 1, 1, 1 ], otherRoot );

			expect( position.isEqual( differentPosition ) ).to.be.false;
		} );
	} );

	describe( 'isAfter', () => {
		it( 'should return true if given position has same root and is after this position', () => {
			let position = new Position( [ 1, 1, 2 ], root );
			let afterPosition = new Position( [ 1, 2 ], root );

			expect( position.isBefore( afterPosition ) ).to.be.true;
		} );

		it( 'should return false if given position has same root and is not after this position', () => {
			let position = new Position( [ 1, 1, 2 ], root );
			let beforePosition = new Position( [ 1, 0 ], root );

			expect( position.isBefore( beforePosition ) ).to.be.false;
		} );

		it( 'should return false if given position has different root', () => {
			let position = new Position( [ 1, 1, 2 ], root );
			let differentPosition = new Position( [ 1, 2 ], otherRoot );

			expect( position.isBefore( differentPosition ) ).to.be.false;
		} );
	} );

	describe( 'compareWith', () => {
		it( 'should return Position.SAME if positions are same', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const compared = new Position( [ 1, 2, 3 ], root );

			expect( position.compareWith( compared ) ).to.equal( Position.SAME );
		} );

		it( 'should return Position.BEFORE if the position is before compared one', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const compared = new Position( [ 1, 3 ], root );

			expect( position.compareWith( compared ) ).to.equal( Position.BEFORE );
		} );

		it( 'should return Position.AFTER if the position is after compared one', () => {
			const position = new Position( [ 1, 2, 3, 4 ], root );
			const compared = new Position( [ 1, 2, 3 ], root );

			expect( position.compareWith( compared ) ).to.equal( Position.AFTER );
		} );

		it( 'should return Position.DIFFERENT if positions are in different roots', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const compared = new Position( [ 1, 2, 3 ], otherRoot );

			expect( position.compareWith( compared ) ).to.equal( Position.DIFFERENT );
		} );
	} );

	describe( 'getTransformedByInsertion', () => {
		it( 'should return a new Position instance', () => {
			const position = new Position( [ 0 ], root );
			const transformed = position.getTransformedByInsertion( new Position( [ 2 ], root ), 4, false );

			expect( transformed ).not.to.equal( position );
			expect( transformed ).to.be.instanceof( Position );
		} );

		it( 'should increment offset if insertion is in the same parent and closer offset', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const transformed = position.getTransformedByInsertion( new Position( [ 1, 2, 2 ], root ), 2, false );

			expect( transformed.offset ).to.equal( 5 );
		} );

		it( 'should not increment offset if insertion position is in different root', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const transformed = position.getTransformedByInsertion( new Position( [ 1, 2, 2 ], otherRoot ), 2, false );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should not increment offset if insertion is in the same parent and the same offset', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const transformed = position.getTransformedByInsertion( new Position( [ 1, 2, 3 ], root ), 2, false );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should increment offset if insertion is in the same parent and the same offset and it is inserted before', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const transformed = position.getTransformedByInsertion( new Position( [ 1, 2, 3 ], root ), 2, true );

			expect( transformed.offset ).to.equal( 5 );
		} );

		it( 'should not increment offset if insertion is in the same parent and further offset', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const transformed = position.getTransformedByInsertion( new Position( [ 1, 2, 4 ], root ), 2, false );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should update path if insertion position parent is a node from that path and offset is before next node on that path', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const transformed = position.getTransformedByInsertion( new Position( [ 1, 2 ], root ), 2, false );

			expect( transformed.path ).to.deep.equal( [ 1, 4, 3 ] );
		} );

		it( 'should not update path if insertion position parent is a node from that path and offset is after next node on that path', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const transformed = position.getTransformedByInsertion( new Position( [ 1, 3 ], root ), 2, false );

			expect( transformed.path ).to.deep.equal( [ 1, 2, 3 ] );
		} );
	} );

	describe( 'getTransformedByDeletion', () => {
		it( 'should return a new Position instance', () => {
			const position = new Position( [ 0 ], root );
			const transformed = position.getTransformedByDeletion( new Position( [ 2 ], root ), 4 );

			expect( transformed ).not.to.equal( position );
			expect( transformed ).to.be.instanceof( Position );
		} );

		it( 'should return null if original position is inside one of removed nodes', () => {
			const position = new Position( [ 1, 2 ], root );
			const transformed = position.getTransformedByDeletion( new Position( [ 0 ], root ), 2 );

			expect( transformed ).to.be.null;
		} );

		it( 'should decrement offset if deletion is in the same parent and closer offset', () => {
			const position = new Position( [ 1, 2, 7 ], root );
			const transformed = position.getTransformedByDeletion( new Position( [ 1, 2, 2 ], root ), 2 );

			expect( transformed.offset ).to.equal( 5 );
		} );

		it( 'should set position offset to deletion offset if position is between removed nodes', () => {
			const position = new Position( [ 1, 2, 4 ], root );
			const transformed = position.getTransformedByDeletion( new Position( [ 1, 2, 3 ], root ), 5 );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should not decrement offset if deletion position is in different root', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const transformed = position.getTransformedByDeletion( new Position( [ 1, 2, 1 ], otherRoot ), 2 );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should not decrement offset if deletion is in the same parent and further offset', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const transformed = position.getTransformedByDeletion( new Position( [ 1, 2, 4 ], root ), 2 );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should update path if deletion position parent is a node from that path and offset is before next node on that path', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const transformed = position.getTransformedByDeletion( new Position( [ 1, 0 ], root ), 2 );

			expect( transformed.path ).to.deep.equal( [ 1, 0, 3 ] );
		} );

		it( 'should not update path if deletion position parent is a node from that path and offset is after next node on that path', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const transformed = position.getTransformedByDeletion( new Position( [ 1, 3 ], root ), 2 );

			expect( transformed.path ).to.deep.equal( [ 1, 2, 3 ] );
		} );
	} );

	describe( 'getTransformedByMove', () => {
		it( 'should increment offset if a range was moved to the same parent and closer offset', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const transformed = position.getTransformedByMove( new Position( [ 2 ], root ), new Position( [ 1, 2, 0 ], root ), 3, false );

			expect( transformed.path ).to.deep.equal( [ 1, 2, 6 ] );
		} );

		it( 'should decrement offset if a range was moved from the same parent and closer offset', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const transformed = position.getTransformedByMove( new Position( [ 1, 2, 0 ], root ), new Position( [ 2 ], root ), 3, false );

			expect( transformed.path ).to.deep.equal( [ 1, 2, 0 ] );
		} );

		it( 'should update path if a range contained this position', () => {
			const position = new Position( [ 1, 2, 3 ], root );
			const transformed = position.getTransformedByMove( new Position( [ 1, 1 ], root ), new Position( [ 2, 1 ], root ), 3, false );

			expect( transformed.path ).to.deep.equal( [ 2, 2, 3 ] );
		} );
	} );

	describe( '_getCombined', () => {
		it( 'should return correct combination of this and given positions', () => {
			const position = new Position( [ 1, 3, 4, 2 ], root );
			const sourcePosition = new Position( [ 1, 1 ], root );
			const targetPosition = new Position( [ 2, 5 ], root );

			const combined = position._getCombined( sourcePosition, targetPosition );

			expect( combined.path ).to.deep.equal( [ 2, 7, 4, 2 ] );
		} );
	} );
} );
