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
		let position = new Position( root, [ 0 ] );

		expect( position ).to.have.property( 'path' ).that.deep.equals( [ 0 ] );
		expect( position ).to.have.property( 'root' ).that.equals( root );
	} );

	it( 'should throw error if given path is incorrect', () => {
		expect( () => {
			new Position( root, {} );
		} ).to.throw( CKEditorError, /position-path-incorrect/ );

		expect( () => {
			new Position( root, [] );
		} ).to.throw( CKEditorError, /position-path-incorrect/ );
	} );

	it( 'should throw error if given root is not a RootElement instance', () => {
		expect( () => {
			new Position();
		} ).to.throw( CKEditorError, /position-root-not-rootelement/ );

		expect( () => {
			new Position( new Element( 'p' ), [ 0 ] );
		} ).to.throw( CKEditorError, /position-root-not-rootelement/ );
	} );

	it( 'should create positions form node and offset', () => {
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

	it( 'should create positions before elements', () => {
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

	it( 'should throw error if one try to create positions before root', () => {
		expect( () => {
			Position.createBefore( root );
		} ).to.throw( CKEditorError, /position-before-root/ );
	} );

	it( 'should create positions after elements', () => {
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
		expect( new Position( root, [ 0 ] ) ).to.have.property( 'parent' ).that.equals( root );
		expect( new Position( root, [ 1 ] ) ).to.have.property( 'parent' ).that.equals( root );
		expect( new Position( root, [ 2 ] ) ).to.have.property( 'parent' ).that.equals( root );

		expect( new Position( root, [ 0, 0 ] ) ).to.have.property( 'parent' ).that.equals( p );

		expect( new Position( root, [ 1, 0 ] ) ).to.have.property( 'parent' ).that.equals( ul );
		expect( new Position( root, [ 1, 1 ] ) ).to.have.property( 'parent' ).that.equals( ul );
		expect( new Position( root, [ 1, 2 ] ) ).to.have.property( 'parent' ).that.equals( ul );

		expect( new Position( root, [ 1, 0, 0 ] ) ).to.have.property( 'parent' ).that.equals( li1 );
		expect( new Position( root, [ 1, 0, 1 ] ) ).to.have.property( 'parent' ).that.equals( li1 );
		expect( new Position( root, [ 1, 0, 2 ] ) ).to.have.property( 'parent' ).that.equals( li1 );
		expect( new Position( root, [ 1, 0, 3 ] ) ).to.have.property( 'parent' ).that.equals( li1 );
	} );

	it( 'should have offset', () => {
		expect( new Position( root, [ 0 ] ) ).to.have.property( 'offset' ).that.equals( 0 );
		expect( new Position( root, [ 1 ] ) ).to.have.property( 'offset' ).that.equals( 1 );
		expect( new Position( root, [ 2 ] ) ).to.have.property( 'offset' ).that.equals( 2 );

		expect( new Position( root, [ 0, 0 ] ) ).to.have.property( 'offset' ).that.equals( 0 );

		expect( new Position( root, [ 1, 0 ] ) ).to.have.property( 'offset' ).that.equals( 0 );
		expect( new Position( root, [ 1, 1 ] ) ).to.have.property( 'offset' ).that.equals( 1 );
		expect( new Position( root, [ 1, 2 ] ) ).to.have.property( 'offset' ).that.equals( 2 );

		expect( new Position( root, [ 1, 0, 0 ] ) ).to.have.property( 'offset' ).that.equals( 0 );
		expect( new Position( root, [ 1, 0, 1 ] ) ).to.have.property( 'offset' ).that.equals( 1 );
		expect( new Position( root, [ 1, 0, 2 ] ) ).to.have.property( 'offset' ).that.equals( 2 );
		expect( new Position( root, [ 1, 0, 3 ] ) ).to.have.property( 'offset' ).that.equals( 3 );
	} );

	it( 'should be able to set offset', () => {
		let position = new Position( root, [ 1, 0, 2 ] );
		position.offset = 4;

		expect( position.offset ).to.equal( 4 );
		expect( position.path ).to.deep.equal( [ 1, 0, 4 ] );
	} );

	it( 'should have nodeBefore', () => {
		expect( new Position( root, [ 0 ] ) ).to.have.property( 'nodeBefore' ).that.is.null;
		expect( new Position( root, [ 1 ] ) ).to.have.property( 'nodeBefore' ).that.equals( p );
		expect( new Position( root, [ 2 ] ) ).to.have.property( 'nodeBefore' ).that.equals( ul );

		expect( new Position( root, [ 0, 0 ] ) ).to.have.property( 'nodeBefore' ).that.is.null;

		expect( new Position( root, [ 1, 0 ] ) ).to.have.property( 'nodeBefore' ).that.is.null;
		expect( new Position( root, [ 1, 1 ] ) ).to.have.property( 'nodeBefore' ).that.equals( li1 );
		expect( new Position( root, [ 1, 2 ] ) ).to.have.property( 'nodeBefore' ).that.equals( li2 );

		expect( new Position( root, [ 1, 0, 0 ] ) ).to.have.property( 'nodeBefore' ).that.is.null;
		expect( new Position( root, [ 1, 0, 1 ] ) ).to.have.property( 'nodeBefore' ).that.equals( f );
		expect( new Position( root, [ 1, 0, 2 ] ) ).to.have.property( 'nodeBefore' ).that.equals( o );
		expect( new Position( root, [ 1, 0, 3 ] ) ).to.have.property( 'nodeBefore' ).that.equals( z );
	} );

	it( 'should have nodeAfter', () => {
		expect( new Position( root, [ 0 ] ) ).to.have.property( 'nodeAfter' ).that.equals( p );
		expect( new Position( root, [ 1 ] ) ).to.have.property( 'nodeAfter' ).that.equals( ul );
		expect( new Position( root, [ 2 ] ) ).to.have.property( 'nodeAfter' ).that.is.null;

		expect( new Position( root, [ 0, 0 ] ) ).to.have.property( 'nodeAfter' ).that.is.null;

		expect( new Position( root, [ 1, 0 ] ) ).to.have.property( 'nodeAfter' ).that.equals( li1 );
		expect( new Position( root, [ 1, 1 ] ) ).to.have.property( 'nodeAfter' ).that.equals( li2 );
		expect( new Position( root, [ 1, 2 ] ) ).to.have.property( 'nodeAfter' ).that.is.null;

		expect( new Position( root, [ 1, 0, 0 ] ) ).to.have.property( 'nodeAfter' ).that.equals( f );
		expect( new Position( root, [ 1, 0, 1 ] ) ).to.have.property( 'nodeAfter' ).that.equals( o );
		expect( new Position( root, [ 1, 0, 2 ] ) ).to.have.property( 'nodeAfter' ).that.equals( z );
		expect( new Position( root, [ 1, 0, 3 ] ) ).to.have.property( 'nodeAfter' ).that.is.null;
	} );

	it( 'should have proper parent path', () => {
		let position = new Position( root, [ 1, 2, 3 ] );

		expect( position.getParentPath() ).to.deep.equal( [ 1, 2 ] );
	} );

	it( 'should return a new, equal position when cloned', () => {
		const position = new Position( root, [ 1, 2, 3 ] );
		const clone = position.clone();

		expect( clone ).not.to.be.equal( position ); // clone is not pointing to the same object as position
		expect( clone.isEqual( position ) ).to.be.true; // but they are equal in the position-sense
		expect( clone.path ).not.to.be.equal( position.path ); // make sure the paths are not the same array
	} );

	describe( 'isBefore', () => {
		it( 'should return true if given position has same root and is before this position', () => {
			let position = new Position( root, [ 1, 1, 2 ] );
			let beforePosition = new Position( root, [ 1, 0 ] );

			expect( position.isAfter( beforePosition ) ).to.be.true;
		} );

		it( 'should return false if given position has same root and is not before this position', () => {
			let position = new Position( root, [ 1, 1, 2 ] );
			let afterPosition = new Position( root, [ 1, 2 ] );

			expect( position.isAfter( afterPosition ) ).to.be.false;
		} );

		it( 'should return false if given position has different root', () => {
			let position = new Position( root, [ 1, 1, 2 ] );
			let differentPosition = new Position( otherRoot, [ 1, 0 ] );

			expect( position.isAfter( differentPosition ) ).to.be.false;
		} );
	} );

	describe( 'isEqual', () => {
		it( 'should return true if given position has same path and root', () => {
			let position = new Position( root, [ 1, 1, 2 ] );
			let samePosition = new Position( root, [ 1, 1, 2 ] );

			expect( position.isEqual( samePosition ) ).to.be.true;
		} );

		it( 'should return false if given position has different path', () => {
			let position = new Position( root, [ 1, 1, 1 ] );
			let differentPosition = new Position( root, [ 1, 2, 2 ] );

			expect( position.isEqual( differentPosition ) ).to.be.false;
		} );

		it( 'should return false if given position has different root', () => {
			let position = new Position( root, [ 1, 1, 1 ] );
			let differentPosition = new Position( otherRoot, [ 1, 1, 1 ] );

			expect( position.isEqual( differentPosition ) ).to.be.false;
		} );
	} );

	describe( 'isAfter', () => {
		it( 'should return true if given position has same root and is after this position', () => {
			let position = new Position( root, [ 1, 1, 2 ] );
			let afterPosition = new Position( root, [ 1, 2 ] );

			expect( position.isBefore( afterPosition ) ).to.be.true;
		} );

		it( 'should return false if given position has same root and is not after this position', () => {
			let position = new Position( root, [ 1, 1, 2 ] );
			let beforePosition = new Position( root, [ 1, 0 ] );

			expect( position.isBefore( beforePosition ) ).to.be.false;
		} );

		it( 'should return false if given position has different root', () => {
			let position = new Position( root, [ 1, 1, 2 ] );
			let differentPosition = new Position( otherRoot, [ 1, 2 ] );

			expect( position.isBefore( differentPosition ) ).to.be.false;
		} );
	} );

	describe( 'compareWith', () => {
		it( 'should return Position.SAME if positions are same', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const compared = new Position( root, [ 1, 2, 3 ] );

			expect( position.compareWith( compared ) ).to.equal( Position.SAME );
		} );

		it( 'should return Position.BEFORE if the position is before compared one', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const compared = new Position( root, [ 1, 3 ] );

			expect( position.compareWith( compared ) ).to.equal( Position.BEFORE );
		} );

		it( 'should return Position.AFTER if the position is after compared one', () => {
			const position = new Position( root, [ 1, 2, 3, 4 ] );
			const compared = new Position( root, [ 1, 2, 3 ] );

			expect( position.compareWith( compared ) ).to.equal( Position.AFTER );
		} );

		it( 'should return Position.DIFFERENT if positions are in different roots', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const compared = new Position( otherRoot, [ 1, 2, 3 ] );

			expect( position.compareWith( compared ) ).to.equal( Position.DIFFERENT );
		} );
	} );

	describe( 'getTransformedByInsertion', () => {
		it( 'should return a new Position instance', () => {
			const position = new Position( root, [ 0 ] );
			const transformed = position.getTransformedByInsertion( new Position( root, [ 2 ] ), 4, false );

			expect( transformed ).not.to.equal( position );
			expect( transformed ).to.be.instanceof( Position );
		} );

		it( 'should increment offset if insertion is in the same parent and closer offset', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByInsertion( new Position( root, [ 1, 2, 2 ] ), 2, false );

			expect( transformed.offset ).to.equal( 5 );
		} );

		it( 'should not increment offset if insertion position is in different root', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByInsertion( new Position( otherRoot, [ 1, 2, 2 ] ), 2, false );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should not increment offset if insertion is in the same parent and the same offset', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByInsertion( new Position( root, [ 1, 2, 3 ] ), 2, false );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should increment offset if insertion is in the same parent and the same offset and it is inserted before', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByInsertion( new Position( root, [ 1, 2, 3 ] ), 2, true );

			expect( transformed.offset ).to.equal( 5 );
		} );

		it( 'should not increment offset if insertion is in the same parent and further offset', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByInsertion( new Position( root, [ 1, 2, 4 ] ), 2, false );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should update path if insertion position parent is a node from that path and offset is before next node on that path', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByInsertion( new Position( root, [ 1, 2 ] ), 2, false );

			expect( transformed.path ).to.deep.equal( [ 1, 4, 3 ] );
		} );

		it( 'should not update path if insertion position parent is a node from that path and offset is after next node on that path', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByInsertion( new Position( root, [ 1, 3 ] ), 2, false );

			expect( transformed.path ).to.deep.equal( [ 1, 2, 3 ] );
		} );
	} );

	describe( 'getTransformedByDeletion', () => {
		it( 'should return a new Position instance', () => {
			const position = new Position( root, [ 0 ] );
			const transformed = position.getTransformedByDeletion( new Position( root, [ 2 ] ), 4 );

			expect( transformed ).not.to.equal( position );
			expect( transformed ).to.be.instanceof( Position );
		} );

		it( 'should return null if original position is inside one of removed nodes', () => {
			const position = new Position( root, [ 1, 2 ] );
			const transformed = position.getTransformedByDeletion( new Position( root, [ 0 ] ), 2 );

			expect( transformed ).to.be.null;
		} );

		it( 'should decrement offset if deletion is in the same parent and closer offset', () => {
			const position = new Position( root, [ 1, 2, 7 ] );
			const transformed = position.getTransformedByDeletion( new Position( root, [ 1, 2, 2 ] ), 2 );

			expect( transformed.offset ).to.equal( 5 );
		} );

		it( 'should set position offset to deletion offset if position is between removed nodes', () => {
			const position = new Position( root, [ 1, 2, 4 ] );
			const transformed = position.getTransformedByDeletion( new Position( root, [ 1, 2, 3 ] ), 5 );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should not decrement offset if deletion position is in different root', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByDeletion( new Position( otherRoot, [ 1, 2, 1 ] ), 2 );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should not decrement offset if deletion is in the same parent and further offset', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByDeletion( new Position( root, [ 1, 2, 4 ] ), 2 );

			expect( transformed.offset ).to.equal( 3 );
		} );

		it( 'should update path if deletion position parent is a node from that path and offset is before next node on that path', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByDeletion( new Position( root, [ 1, 0 ] ), 2 );

			expect( transformed.path ).to.deep.equal( [ 1, 0, 3 ] );
		} );

		it( 'should not update path if deletion position parent is a node from that path and offset is after next node on that path', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByDeletion( new Position( root, [ 1, 3 ] ), 2 );

			expect( transformed.path ).to.deep.equal( [ 1, 2, 3 ] );
		} );
	} );

	describe( 'getTransformedByMove', () => {
		it( 'should increment offset if a range was moved to the same parent and closer offset', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByMove( new Position( root, [ 2 ] ), new Position( root, [ 1, 2, 0 ] ), 3, false );

			expect( transformed.path ).to.deep.equal( [ 1, 2, 6 ] );
		} );

		it( 'should decrement offset if a range was moved from the same parent and closer offset', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByMove( new Position( root, [ 1, 2, 0 ] ), new Position( root, [ 2 ] ), 3, false );

			expect( transformed.path ).to.deep.equal( [ 1, 2, 0 ] );
		} );

		it( 'should update path if a range contained this position', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByMove( new Position( root, [ 1, 1 ] ), new Position( root, [ 2, 1 ] ), 3, false );

			expect( transformed.path ).to.deep.equal( [ 2, 2, 3 ] );
		} );
	} );

	describe( '_getCombined', () => {
		it( 'should return correct combination of this and given positions', () => {
			const position = new Position( root, [ 1, 3, 4, 2 ] );
			const sourcePosition = new Position( root, [ 1, 1 ] );
			const targetPosition = new Position( root, [ 2, 5 ] );

			const combined = position._getCombined( sourcePosition, targetPosition );

			expect( combined.path ).to.deep.equal( [ 2, 7, 4, 2 ] );
		} );
	} );
} );
