/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Position from '/ckeditor5/engine/treeview/position.js';
import Node from '/ckeditor5/engine/treeview/node.js';
import Element from '/ckeditor5/engine/treeview/element.js';
import Text from '/ckeditor5/engine/treeview/text.js';

import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

import { parse } from '/tests/engine/_utils/view.js';

describe( 'Position', () => {
	const parentMock = {};

	describe( 'constructor', () => {
		it( 'should create element without attributes', () => {
			const elem = new Position( parentMock, 5 );

			expect( elem ).to.have.property( 'parent' ).that.equals( parentMock );
			expect( elem ).to.have.property( 'offset' ).that.equals( 5 );
		} );
	} );

	describe( 'nodeBefore', () => {
		it( 'should equal to node that is before position', () => {
			const b1 = new Element( 'b' );
			const el = new Element( 'p', null, [ b1 ] );
			const position = new Position( el, 1 );

			expect( position.nodeBefore ).to.equal( b1 );
		} );

		it( 'should equal null if there is no node before', () => {
			const b1 = new Element( 'b' );
			const el = new Element( 'p', null, [ b1 ] );
			const position = new Position( el, 0 );

			expect( position.nodeBefore ).to.be.null;
		} );

		it( 'should equal null if position is located inside text node', () => {
			const text = new Text( 'foobar' );
			const position = new Position( text, 3 );

			expect( position.nodeBefore ).to.be.null;
		} );
	} );

	describe( 'nodeAfter', () => {
		it( 'should equal to node that is after position', () => {
			const b1 = new Element( 'b' );
			const el = new Element( 'p', null, [ b1 ] );
			const position = new Position( el, 0 );

			expect( position.nodeAfter ).to.equal( b1 );
		} );

		it( 'should equal null if there is no node before', () => {
			const b1 = new Element( 'b' );
			const el = new Element( 'p', null, [ b1 ] );
			const position = new Position( el, 1 );

			expect( position.nodeAfter ).to.be.null;
		} );

		it( 'should equal null if position is located inside text node', () => {
			const text = new Text( 'foobar' );
			const position = new Position( text, 3 );

			expect( position.nodeAfter ).to.be.null;
		} );
	} );

	describe( 'getShiftedBy', () => {
		it( 'returns new instance with shifted offset', () => {
			const position = new Position( parentMock, 10 );
			const shifted = position.getShiftedBy( 12 );
			expect( shifted.offset ).to.equal( 22 );
		} );

		it( 'accepts negative values', () => {
			const position = new Position( parentMock, 10 );
			const shifted = position.getShiftedBy( -5 );
			expect( shifted.offset ).to.equal( 5 );
		} );

		it( 'prevents offset to be a negative value', () => {
			const position = new Position( parentMock, 10 );
			const shifted = position.getShiftedBy( -20 );

			expect( shifted.offset ).to.equal( 0 );
		} );
	} );

	describe( 'createFromPosition', () => {
		it( 'creates new Position with same parent and offset', () => {
			const offset = 50;
			const position = new Position( parentMock, offset );
			const newPosition = Position.createFromPosition( position );

			expect( position ).to.not.equal( newPosition );
			expect( position.offset ).to.equal( offset );
			expect( position.parent ).to.equal( parentMock );
		} );
	} );

	describe( 'isEqual', () => {
		it( 'should return true for same object', () => {
			const position = new Position( {}, 12 );
			expect( position.isEqual( position ) ).to.be.true;
		} );

		it( 'should return true for positions with same parent and offset', () => {
			const parentMock = {};
			const position1 = new Position( parentMock, 12 );
			const position2 = new Position( parentMock, 12 );
			expect( position1.isEqual( position2 ) ).to.be.true;
		} );

		it( 'should return false for positions with different parents', () => {
			const position1 = new Position( {}, 12 );
			const position2 = new Position( {}, 12 );
			expect( position1.isEqual( position2 ) ).to.be.false;
		} );

		it( 'should return false for positions with different positions', () => {
			const parentMock = {};
			const position1 = new Position( parentMock, 12 );
			const position2 = new Position( parentMock, 2 );
			expect( position1.isEqual( position2 ) ).to.be.false;
		} );
	} );

	describe( 'isBefore', () => {
		it( 'should return false for same positions', () => {
			const node = new Node();
			const position1 = new Position( node, 10 );
			const position2 = new Position( node, 10 );

			expect( position1.isBefore( position1 ) ).to.be.false;
			expect( position1.isBefore( position2 ) ).to.be.false;
			expect( position2.isBefore( position1 ) ).to.be.false;
		} );

		it( 'should return false if no common ancestor is found', () => {
			const t1 = new Text( 'foo' );
			const t2 = new Text( 'bar' );
			const e1 = new Element( 'p', null, [ t1 ] );
			const e2 = new Element( 'p', null, [ t2 ] );
			const position1 = new Position( e1, 0 );
			const position2 = new Position( e2, 1 );

			expect( position1.isBefore( position2 ) );
			expect( position2.isBefore( position1 ) );
		} );

		it( 'should return true if position is before in same node', () => {
			const node = new Node();
			const p1 = new Position( node, 10 );
			const p2 = new Position( node, 5 );

			expect( p2.isBefore( p1 ) ).to.be.true;
			expect( p1.isBefore( p2 ) ).to.be.false;
		} );

		it( 'should compare positions that have common parent', () => {
			const t1 = new Text( 'foo' );
			const t2 = new Text( 'bar' );
			const root = new Element( 'p', null, [ t1, t2 ] );
			const position1 = new Position( t1, 2 );
			const position2 = new Position( t2, 0 );
			const position3 = new Position( root, 0 );
			const position4 = new Position( root, 2 );
			const position5 = new Position( t1, 0 );
			const position6 = new Position( root, 1 );

			expect( position1.isBefore( position2 ) ).to.be.true;
			expect( position2.isBefore( position1 ) ).to.be.false;
			expect( position3.isBefore( position1  ) ).to.be.true;
			expect( position3.isBefore( position2 ) ).to.be.true;
			expect( position1.isBefore( position3 ) ).to.be.false;
			expect( position2.isBefore( position3 ) ).to.be.false;
			expect( position4.isBefore( position1 ) ).to.be.false;
			expect( position4.isBefore( position3 ) ).to.be.false;
			expect( position3.isBefore( position4 ) ).to.be.true;
			expect( position3.isBefore( position5 ) ).to.be.true;
			expect( position6.isBefore( position2 ) ).to.be.true;
			expect( position1.isBefore( position6 ) ).to.be.true;
		} );
	} );

	describe( 'isAfter', () => {
		it( 'should return false for same positions', () => {
			const node = new Node();
			const position1 = new Position( node, 10 );
			const position2 = new Position( node, 10 );

			expect( position1.isAfter( position1 ) ).to.be.false;
			expect( position1.isAfter( position2 ) ).to.be.false;
			expect( position2.isAfter( position1 ) ).to.be.false;
		} );

		it( 'should return false if no common ancestor is found', () => {
			const t1 = new Text( 'foo' );
			const t2 = new Text( 'bar' );
			const e1 = new Element( 'p', null, [ t1 ] );
			const e2 = new Element( 'p', null, [ t2 ] );
			const position1 = new Position( e1, 0 );
			const position2 = new Position( e2, 1 );

			expect( position1.isAfter( position2 ) );
			expect( position2.isAfter( position1 ) );
		} );

		it( 'should return true if position is after in same node', () => {
			const node = new Node();
			const p1 = new Position( node, 10 );
			const p2 = new Position( node, 5 );

			expect( p2.isAfter( p1 ) ).to.be.false;
			expect( p1.isAfter( p2 ) ).to.be.true;
		} );

		it( 'should compare positions that have common parent', () => {
			const t1 = new Text( 'foo' );
			const t2 = new Text( 'bar' );
			const root = new Element( 'p', null, [ t1, t2 ] );
			const position1 = new Position( t1, 2 );
			const position2 = new Position( t2, 0 );
			const position3 = new Position( root, 0 );
			const position4 = new Position( root, 2 );
			const position5 = new Position( t1, 0 );
			const position6 = new Position( root, 1 );

			expect( position1.isAfter( position2 ) ).to.be.false;
			expect( position2.isAfter( position1 ) ).to.be.true;
			expect( position3.isAfter( position1 ) ).to.be.false;
			expect( position3.isAfter( position2 ) ).to.be.false;
			expect( position1.isAfter( position3 ) ).to.be.true;
			expect( position2.isAfter( position3 ) ).to.be.true;
			expect( position4.isAfter( position1 ) ).to.be.true;
			expect( position4.isAfter( position3 ) ).to.be.true;
			expect( position3.isAfter( position4 ) ).to.be.false;
			expect( position5.isAfter( position3 ) ).to.be.true;
			expect( position2.isAfter( position6 ) ).to.be.true;
		} );
	} );

	describe( 'compareWith', () => {
		it( 'should return SAME if positions are same', () => {
			const root = new Node();
			const position = new Position( root, 0 );
			const compared = new Position( root, 0 );

			expect( position.compareWith( compared ) ).to.equal( 'SAME' );
		} );

		it( 'should return BEFORE if the position is before compared one', () => {
			const root = new Node();
			const position = new Position( root, 0 );
			const compared = new Position( root, 1 );

			expect( position.compareWith( compared ) ).to.equal( 'BEFORE' );
		} );

		it( 'should return AFTER if the position is after compared one', () => {
			const root = new Node();
			const position = new Position( root, 4 );
			const compared = new Position( root, 1 );

			expect( position.compareWith( compared ) ).to.equal( 'AFTER' );
		} );

		it( 'should return DIFFERENT if positions are in different roots', () => {
			const root1 = new Node();
			const root2 = new Node();
			const position = new Position( root1, 4 );
			const compared = new Position( root2, 1 );

			expect( position.compareWith( compared ) ).to.equal( 'DIFFERENT' );
		} );
	} );

	describe( 'createBefore', () => {
		it( 'should create positions before nodes', () => {
			const { selection } = parse( '<p>[]<b></b></p>' );
			const position = selection.getFirstPosition();
			const nodeAfter = position.nodeAfter;

			expect( Position.createBefore( nodeAfter ).isEqual( position ) ).to.be.true;
		} );

		it( 'should throw error if one try to create positions before root', () => {
			expect( () => {
				Position.createBefore( parse( '<p></p>' ) );
			} ).to.throw( CKEditorError, /position-before-root/ );
		} );
	} );

	describe( 'createAfter', () => {
		it( 'should create positions after nodes', () => {
			const { selection } = parse( '<p><b></b>[]</p>' );
			const position = selection.getFirstPosition();
			const nodeBefore = position.nodeBefore;

			expect( Position.createAfter( nodeBefore ).isEqual( position ) ).to.be.true;
		} );

		it( 'should throw error if one try to create positions after root', () => {
			expect( () => {
				Position.createAfter( parse( '<p></p>' ) );
			} ).to.throw( CKEditorError, /position-after-root/ );
		} );
	} );
} );
