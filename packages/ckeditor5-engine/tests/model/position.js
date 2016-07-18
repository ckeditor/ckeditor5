/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

'use strict';

import Document from '/ckeditor5/engine/model/document.js';
import DocumentFragment from '/ckeditor5/engine/model/documentfragment.js';
import Element from '/ckeditor5/engine/model/element.js';
import Text from '/ckeditor5/engine/model/text.js';
import TextProxy from '/ckeditor5/engine/model/textproxy.js';
import Position from '/ckeditor5/engine/model/position.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import testUtils from '/tests/ckeditor5/_utils/utils.js';
import { jsonParseStringify } from '/tests/engine/model/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'position', () => {
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
		doc = new Document();

		root = doc.createRoot();
		otherRoot = doc.createRoot( '$root', 'otherRoot' );

		let foz = new Text( 'foz' );

		li1 = new Element( 'li', [], foz );

		f = new TextProxy( foz, 0, 1 );
		o = new TextProxy( foz, 1, 1 );
		z = new TextProxy( foz, 2, 1 );

		let bar = new Text( 'bar' );

		li2 = new Element( 'li', [], bar );

		b = new TextProxy( bar, 0, 1 );
		a = new TextProxy( bar, 1, 1 );
		r = new TextProxy( bar, 2, 1 );

		ul = new Element( 'ul', [], [ li1, li2 ] );

		p = new Element( 'p' );

		root.insertChildren( 0, [ p, ul ] );
	} );

	describe( 'constructor', () => {
		it( 'should create a position with path and document', () => {
			let position = new Position( root, [ 0 ] );

			expect( position ).to.have.property( 'path' ).that.deep.equals( [ 0 ] );
			expect( position ).to.have.property( 'root' ).that.equals( root );
		} );

		it( 'should accept DocumentFragment as a root', () => {
			const frag = new DocumentFragment();
			const pos = new Position( frag, [ 0 ] );

			expect( pos ).to.have.property( 'root', frag );
		} );

		it( 'should accept detached Element as a root', () => {
			const el = new Element( 'p' );
			const pos = new Position( el, [ 0 ] );

			expect( pos ).to.have.property( 'root', el );
			expect( pos.path ).to.deep.equal( [ 0 ] );
		} );

		it( 'should normalize attached Element as a root', () => {
			const pos = new Position( li1, [ 0, 2 ] );

			expect( pos ).to.have.property( 'root', root );
			expect( pos.isEqual( Position.createAt( li1, 0, 2 ) ) );
		} );

		it( 'should normalize Element from a detached branch as a root', () => {
			const rootEl = new Element( 'p', null, [ new Element( 'a' ) ] );
			const elA = rootEl.getChild( 0 );
			const pos = new Position( elA, [ 0 ] );

			expect( pos ).to.have.property( 'root', rootEl );
			expect( pos.isEqual( Position.createAt( elA, 0 ) ) );
		} );

		it( 'should throw error if given path is incorrect', () => {
			expect( () => {
				new Position( root, {} );
			} ).to.throw( CKEditorError, /position-path-incorrect/ );

			expect( () => {
				new Position( root, [] );
			} ).to.throw( CKEditorError, /position-path-incorrect/ );
		} );

		it( 'should throw error if given root is invalid', () => {
			expect( () => {
				new Position( new Text( 'a' ) );
			} ).to.throw( CKEditorError, /position-root-invalid/ );

			expect( () => {
				new Position();
			} ).to.throw( CKEditorError, /position-root-invalid/ );
		} );
	} );

	describe( 'createFromParentAndOffset', () => {
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

		it( 'throws when parent is not an element', () => {
			expect( () => {
				Position.createFromParentAndOffset( b, 0 );
			} ).to.throw( CKEditorError, /^position-parent-incorrect/ );
		} );

		it( 'works with a doc frag', () => {
			const frag = new DocumentFragment();

			expect( Position.createFromParentAndOffset( frag, 0 ) ).to.have.property( 'root', frag );
		} );
	} );

	describe( 'createAt', () => {
		it( 'should create positions from positions', () => {
			const spy = testUtils.sinon.spy( Position, 'createFromPosition' );

			expect( Position.createAt( Position.createAt( ul ) ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0 ] );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should create positions from node and offset', () => {
			expect( Position.createAt( ul ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0 ] );
			expect( Position.createAt( li1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 0, 0 ] );
			expect( Position.createAt( ul, 1 ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1 ] );
		} );

		it( 'should create positions from node and flag', () => {
			expect( Position.createAt( root, 'end' ) ).to.have.property( 'path' ).that.deep.equals( [ 2 ] );

			expect( Position.createAt( p, 'before' ) ).to.have.property( 'path' ).that.deep.equals( [ 0 ] );
			expect( Position.createAt( a, 'before' ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 1 ] );

			expect( Position.createAt( p, 'after' ) ).to.have.property( 'path' ).that.deep.equals( [ 1 ] );
			expect( Position.createAt( a, 'after' ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 1, 2 ] );

			expect( Position.createAt( ul, 'end' ) ).to.have.property( 'path' ).that.deep.equals( [ 1, 2 ] );
		} );
	} );

	describe( 'createBefore', () => {
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
	} );

	describe( 'createAfter', () => {
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
	} );

	describe( 'createFromPosition', () => {
		it( 'should create a copy of given position', () => {
			let original = new Position( root, [ 1, 2, 3 ] );
			let position = Position.createFromPosition( original );

			expect( position ).to.be.instanceof( Position );
			expect( position.isEqual( original ) ).to.be.true;
			expect( position ).not.to.be.equal( original );
		} );
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

	it( 'should have nodeBefore if it is not inside a text node', () => {
		expect( new Position( root, [ 0 ] ).nodeBefore ).to.be.null;
		expect( new Position( root, [ 1 ] ).nodeBefore ).to.equal( p );
		expect( new Position( root, [ 2 ] ).nodeBefore ).to.equal( ul );

		expect( new Position( root, [ 0, 0 ] ).nodeBefore ).to.null;

		expect( new Position( root, [ 1, 0 ] ).nodeBefore ).to.be.null;
		expect( new Position( root, [ 1, 1 ] ).nodeBefore ).to.equal( li1 );
		expect( new Position( root, [ 1, 2 ] ).nodeBefore ).to.equal( li2 );

		expect( new Position( root, [ 1, 0, 0 ] ).nodeBefore ).to.be.null;
		expect( new Position( root, [ 1, 0, 1 ] ).nodeBefore ).to.be.null;
		expect( new Position( root, [ 1, 0, 2 ] ).nodeBefore ).to.be.null;
		expect( new Position( root, [ 1, 0, 3 ] ).nodeBefore.data ).to.equal( 'foz' );
	} );

	it( 'should have nodeAfter', () => {
		expect( new Position( root, [ 0 ] ).nodeAfter ).to.equal( p );
		expect( new Position( root, [ 1 ] ).nodeAfter ).to.equal( ul );
		expect( new Position( root, [ 2 ] ).nodeAfter ).to.be.null;

		expect( new Position( root, [ 0, 0 ] ).nodeAfter ).to.be.null;

		expect( new Position( root, [ 1, 0 ] ).nodeAfter ).to.equal( li1 );
		expect( new Position( root, [ 1, 1 ] ).nodeAfter ).to.equal( li2 );
		expect( new Position( root, [ 1, 2 ] ).nodeAfter ).to.be.null;

		expect( new Position( root, [ 1, 0, 0 ] ).nodeAfter.data ).to.equal( 'foz' );
		expect( new Position( root, [ 1, 0, 1 ] ).nodeAfter ).to.be.null;
		expect( new Position( root, [ 1, 0, 2 ] ).nodeAfter ).to.be.null;
		expect( new Position( root, [ 1, 0, 3 ] ).nodeAfter ).to.be.null;
	} );

	it( 'should have proper parent path', () => {
		let position = new Position( root, [ 1, 2, 3 ] );

		expect( position.getParentPath() ).to.deep.equal( [ 1, 2 ] );
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

	describe( 'isTouching', () => {
		it( 'should return true if positions are same', () => {
			let position = new Position( root, [ 1, 1, 1 ] );
			let result = position.isTouching( new Position( root, [ 1, 1, 1 ] ) );

			expect( result ).to.be.true;
		} );

		it( 'should return true if given position is in next node and there are no whole nodes before it', () => {
			let positionA = new Position( root, [ 1 ] );
			let positionB = new Position( root, [ 1, 0, 0 ] );

			expect( positionA.isTouching( positionB ) ).to.be.true;
			expect( positionB.isTouching( positionA ) ).to.be.true;
		} );

		it( 'should return true if given position is in previous node and there are no whole nodes after it', () => {
			let positionA = new Position( root, [ 2 ] );
			let positionB = new Position( root, [ 1, 1, 3 ] );

			expect( positionA.isTouching( positionB ) ).to.be.true;
			expect( positionB.isTouching( positionA ) ).to.be.true;
		} );

		it( 'should return true if positions are in different sub-trees but there are no whole nodes between them', () => {
			let positionA = new Position( root, [ 1, 0, 3 ] );
			let positionB = new Position( root, [ 1, 1, 0 ] );

			expect( positionA.isTouching( positionB ) ).to.be.true;
			expect( positionB.isTouching( positionA ) ).to.be.true;
		} );

		it( 'should return false if there are whole nodes between positions', () => {
			let positionA = new Position( root, [ 2 ] );
			let positionB = new Position( root, [ 1, 0, 3 ] );

			expect( positionA.isTouching( positionB ) ).to.be.false;
			expect( positionB.isTouching( positionA ) ).to.be.false;
		} );

		it( 'should return false if there are whole nodes between positions', () => {
			let positionA = new Position( root, [ 1, 0, 3 ] );
			let positionB = new Position( root, [ 1, 1, 1 ] );

			expect( positionA.isTouching( positionB ) ).to.be.false;
			expect( positionB.isTouching( positionA ) ).to.be.false;
		} );

		it( 'should return false if positions are in different roots', () => {
			let positionA = new Position( root, [ 1, 0, 3 ] );
			let positionB = new Position( otherRoot, [ 1, 1, 0 ] );

			expect( positionA.isTouching( positionB ) ).to.be.false;
			expect( positionB.isTouching( positionA ) ).to.be.false;
		} );
	} );

	describe( 'isAtStart', () => {
		it( 'should return true if position is at the beginning of its parent', () => {
			expect( new Position( root, [ 0 ] ).isAtStart() ).to.be.true;
			expect( new Position( root, [ 1 ] ).isAtStart() ).to.be.false;
		} );
	} );

	describe( 'isAtEnd', () => {
		it( 'should return true if position is at the end of its parent', () => {
			expect( new Position( root, [ root.getMaxOffset() ] ).isAtEnd() ).to.be.true;
			expect( new Position( root, [ 0 ] ).isAtEnd() ).to.be.false;
		} );
	} );

	describe( 'compareWith', () => {
		it( 'should return same if positions are same', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const compared = new Position( root, [ 1, 2, 3 ] );

			expect( position.compareWith( compared ) ).to.equal( 'same' );
		} );

		it( 'should return before if the position is before compared one', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const compared = new Position( root, [ 1, 3 ] );

			expect( position.compareWith( compared ) ).to.equal( 'before' );
		} );

		it( 'should return after if the position is after compared one', () => {
			const position = new Position( root, [ 1, 2, 3, 4 ] );
			const compared = new Position( root, [ 1, 2, 3 ] );

			expect( position.compareWith( compared ) ).to.equal( 'after' );
		} );

		it( 'should return different if positions are in different roots', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const compared = new Position( otherRoot, [ 1, 2, 3 ] );

			expect( position.compareWith( compared ) ).to.equal( 'different' );
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

		it( 'should return null if original position is between removed nodes', () => {
			const position = new Position( root, [ 1, 2, 4 ] );
			const transformed = position.getTransformedByDeletion( new Position( root, [ 1, 2, 3 ] ), 5 );

			expect( transformed ).to.be.null;
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
			const position = new Position( root, [ 1, 2, 6 ] );
			const transformed = position.getTransformedByMove( new Position( root, [ 1, 2, 0 ] ), new Position( root, [ 2 ] ), 3, false );

			expect( transformed.path ).to.deep.equal( [ 1, 2, 3 ] );
		} );

		it( 'should decrement offset if position was at the end of a range and move was not sticky', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByMove( new Position( root, [ 1, 2, 0 ] ), new Position( root, [ 2 ] ), 3, false );

			expect( transformed.path ).to.deep.equal( [ 1, 2, 0 ] );
		} );

		it( 'should update path if position was at the end of a range and move was sticky', () => {
			const position = new Position( root, [ 1, 2, 3 ] );
			const transformed = position.getTransformedByMove( new Position( root, [ 1, 2, 0 ] ), new Position( root, [ 2 ] ), 3, false, true );

			expect( transformed.path ).to.deep.equal( [ 5 ] );
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

	describe( 'getShiftedBy', () => {
		it( 'should return a new instance of Position with offset changed by shift value', () => {
			let position = new Position( root, [ 1, 2, 3 ] );
			let shifted = position.getShiftedBy( 2 );

			expect( shifted ).to.be.instanceof( Position );
			expect( shifted ).to.not.equal( position );
			expect( shifted.path ).to.deep.equal( [ 1, 2, 5 ] );
		} );

		it( 'should accept negative values', () => {
			let position = new Position( root, [ 1, 2, 3 ] );
			let shifted = position.getShiftedBy( -2 );

			expect( shifted.path ).to.deep.equal( [ 1, 2, 1 ] );
		} );

		it( 'should not let setting offset lower than zero', () => {
			let position = new Position( root, [ 1, 2, 3 ] );
			let shifted = position.getShiftedBy( -7 );

			expect( shifted.path ).to.deep.equal( [ 1, 2, 0 ] );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should serialize position', () => {
			let position = new Position( root, [ 0 ] );

			let serialized = jsonParseStringify( position );

			expect( serialized ).to.deep.equal( { root: 'main', path: [ 0 ] } );
		} );

		it( 'should serialize position from graveyard', () => {
			let position = new Position( doc.graveyard, [ 0 ] );

			let serialized = jsonParseStringify( position );

			expect( serialized ).to.deep.equal( { root: '$graveyard', path: [ 0 ] } );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create object with given document', () => {
			let deserialized = Position.fromJSON( { root: 'main', path: [ 0, 1, 2 ] }, doc );

			expect( deserialized.root ).to.equal( root );
			expect( deserialized.path ).to.deep.equal( [ 0, 1, 2 ] );
		} );

		it( 'should create object from graveyard', () => {
			let deserialized = Position.fromJSON( { root: '$graveyard', path: [ 0, 1, 2 ] }, doc );

			expect( deserialized.root ).to.equal( doc.graveyard );
			expect( deserialized.path ).to.deep.equal( [ 0, 1, 2 ] );
		} );

		it( 'should throw error when creating object in document that does not have provided root', () => {
			expect(
				() => {
					Position.fromJSON( { root: 'noroot', path: [ 0 ] }, doc );
				}
			).to.throw( CKEditorError, /position-fromjson-no-root/ );
		} );
	} );
} );
