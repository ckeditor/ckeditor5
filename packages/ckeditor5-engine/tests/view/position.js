/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Position from '../../src/view/position';
import Node from '../../src/view/node';
import Element from '../../src/view/element';
import DocumentFragment from '../../src/view/documentfragment';
import EditableElement from '../../src/view/editableelement';
import Document from '../../src/view/document';
import Text from '../../src/view/text';
import TextProxy from '../../src/view/textproxy';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import { parse, stringify } from '../../src/dev-utils/view';

describe( 'Position', () => {
	const parentMock = {};

	describe( 'constructor()', () => {
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

	describe( 'getLastMatchingPosition', () => {
		it( 'should skip forward', () => {
			const { view, selection } = parse( '<p><b>{}foo</b></p>' );
			let position = selection.getFirstPosition();

			position = position.getLastMatchingPosition( value => value.type == 'text' );

			expect( stringify( view, position ) ).to.equal( '<p><b>foo[]</b></p>' );
		} );

		it( 'should skip backward', () => {
			const { view, selection } = parse( '<p><b>foo{}</b></p>' );
			let position = selection.getFirstPosition();

			position = position.getLastMatchingPosition( value => value.type == 'text', { direction: 'backward' } );

			expect( stringify( view, position ) ).to.equal( '<p><b>[]foo</b></p>' );
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return it\'s parent root', () => {
			const foo = new Text( 'foo' );
			const docFrag = new DocumentFragment( foo );

			expect( new Position( foo, 1 ).root ).to.equal( docFrag );

			const bar = new Text( 'bar' );
			const p = new Element( 'p', null, bar );

			expect( new Position( bar, 2 ).root ).to.equal( p );
			expect( new Position( p, 0 ).root ).to.equal( p );
		} );
	} );

	describe( 'getAncestors', () => {
		it( 'should return it\'s parent and all it\'s ancestors', () => {
			const foo = new Text( 'foo' );
			const p = new Element( 'p', null, foo );
			const div = new Element( 'div', null, p );
			const docFrag = new DocumentFragment( div );

			expect( new Position( foo, 1 ).getAncestors() ).to.deep.equal( [ docFrag, div, p, foo ] );
		} );

		it( 'should return DocumentFragment if position is directly in document fragment', () => {
			const docFrag = new DocumentFragment();

			expect( new Position( docFrag, 0 ).getAncestors() ).to.deep.equal( [ docFrag ] );
		} );
	} );

	describe( 'createAt', () => {
		it( 'should create positions from positions', () => {
			const spy = sinon.spy( Position, 'createFromPosition' );

			const p = new Element( 'p' );
			const position = new Position( p, 0 );
			const created = Position.createAt( position );

			expect( created.isEqual( position ) ).to.be.true;
			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should create positions from node and offset', () => {
			const foo = new Text( 'foo' );
			const p = new Element( 'p', null, foo );

			expect( Position.createAt( foo ).parent ).to.equal( foo );
			expect( Position.createAt( foo ).offset ).to.equal( 0 );

			expect( Position.createAt( foo, 2 ).parent ).to.equal( foo );
			expect( Position.createAt( foo, 2 ).offset ).to.equal( 2 );

			expect( Position.createAt( p, 1 ).parent ).to.equal( p );
			expect( Position.createAt( p, 1 ).offset ).to.equal( 1 );
		} );

		it( 'should create positions from node and flag', () => {
			const foo = new Text( 'foo' );
			const p = new Element( 'p', null, foo );

			const fooEnd = Position.createAt( foo, 'end' );
			const fooBefore = Position.createAt( foo, 'before' );
			const fooAfter = Position.createAt( foo, 'after' );

			const pEnd = Position.createAt( p, 'end' );
			// pBefore and pAfter would throw.

			expect( fooEnd.parent ).to.equal( foo );
			expect( fooEnd.offset ).to.equal( 3 );

			expect( fooBefore.parent ).to.equal( p );
			expect( fooBefore.offset ).to.equal( 0 );

			expect( fooAfter.parent ).to.equal( p );
			expect( fooAfter.offset ).to.equal( 1 );

			expect( pEnd.parent ).to.equal( p );
			expect( pEnd.offset ).to.equal( 1 );
		} );

		it( 'should create positions in document fragment', () => {
			const foo = new Text( 'foo' );
			const docFrag = new DocumentFragment( [ foo ] );

			const pStart = Position.createAt( docFrag, 0 );
			const pEnd = Position.createAt( docFrag, 'end' );

			expect( pStart.parent ).to.equal( docFrag );
			expect( pStart.offset ).to.equal( 0 );
			expect( pEnd.parent ).to.equal( docFrag );
			expect( pEnd.offset ).to.equal( 1 );
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
			expect( position3.isBefore( position1 ) ).to.be.true;
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

	describe( 'isAtStart', () => {
		it( 'should return true if it is at the start of it\'s parent', () => {
			const foo = new Text( 'foo' );
			const position = new Position( foo, 0 );
			expect( position.isAtStart ).to.be.true;
		} );

		it( 'should return false if it is not at the start of it\'s parent', () => {
			const foo = new Text( 'foo' );
			const position = new Position( foo, 1 );
			expect( position.isAtStart ).to.be.false;
		} );
	} );

	describe( 'isAtEnd', () => {
		it( 'should return true if it is at the end of it\'s parent', () => {
			const foo = new Text( 'foo' );
			const p = new Element( 'p', null, foo );

			expect( new Position( foo, 3 ).isAtEnd ).to.be.true;
			expect( new Position( p, 1 ).isAtEnd ).to.be.true;
		} );

		it( 'should return false if it is not at the end of it\'s parent', () => {
			const foo = new Text( 'foo' );
			const p = new Element( 'p', null, foo );

			expect( new Position( foo, 2 ).isAtEnd ).to.be.false;
			expect( new Position( p, 0 ).isAtEnd ).to.be.false;
		} );
	} );

	describe( 'compareWith', () => {
		it( 'should return same if positions are same', () => {
			const root = new Element();
			const position = new Position( root, 0 );
			const compared = new Position( root, 0 );

			expect( position.compareWith( compared ) ).to.equal( 'same' );
		} );

		it( 'should return before if the position is before compared one', () => {
			const root = new Element();
			const position = new Position( root, 0 );
			const compared = new Position( root, 1 );

			expect( position.compareWith( compared ) ).to.equal( 'before' );
		} );

		it( 'should return after if the position is after compared one', () => {
			const root = new Element();
			const position = new Position( root, 4 );
			const compared = new Position( root, 1 );

			expect( position.compareWith( compared ) ).to.equal( 'after' );
		} );

		it( 'should return different if positions are in different roots', () => {
			const root1 = new Element();
			const root2 = new Element();
			const position = new Position( root1, 4 );
			const compared = new Position( root2, 1 );

			expect( position.compareWith( compared ) ).to.equal( 'different' );
		} );

		it( 'should return correct results if position is in document fragment', () => {
			const node = new Element( 'name' );
			const docFrag = new DocumentFragment( [ node ] );
			const position = new Position( docFrag, 0 );
			const compared = new Position( docFrag, 1 );
			const posInNode = new Position( node, 0 );

			expect( position.compareWith( compared ) ).to.equal( 'before' );
			expect( compared.compareWith( position ) ).to.equal( 'after' );
			expect( compared.compareWith( compared ) ).to.equal( 'same' );
			expect( position.compareWith( posInNode ) ).to.equal( 'before' );
			expect( compared.compareWith( posInNode ) ).to.equal( 'after' );
		} );
	} );

	describe( 'createBefore', () => {
		it( 'should throw error if one try to create positions before root', () => {
			expect( () => {
				Position.createBefore( parse( '<p></p>' ) );
			} ).to.throw( CKEditorError, /view-position-before-root/ );
		} );

		it( 'should create positions before `Node`', () => {
			const { selection } = parse( '<p>[]<b></b></p>' );
			const position = selection.getFirstPosition();
			const nodeAfter = position.nodeAfter;

			expect( Position.createBefore( nodeAfter ).isEqual( position ) ).to.be.true;
		} );

		it( 'should create positions before `TextProxy`', () => {
			const text = new Text( 'abc' );

			const textProxy = new TextProxy( text, 1, 1 );
			const position = new Position( text, 1 );

			expect( Position.createBefore( textProxy ) ).deep.equal( position );
		} );
	} );

	describe( 'createAfter', () => {
		it( 'should throw error if one try to create positions after root', () => {
			expect( () => {
				Position.createAfter( parse( '<p></p>' ) );
			} ).to.throw( CKEditorError, /view-position-after-root/ );
		} );

		it( 'should create positions after `Node`', () => {
			const { selection } = parse( '<p><b></b>[]</p>' );
			const position = selection.getFirstPosition();
			const nodeBefore = position.nodeBefore;

			expect( Position.createAfter( nodeBefore ).isEqual( position ) ).to.be.true;
		} );

		it( 'should create positions after `TextProxy`', () => {
			const text = new Text( 'abcd' );

			const textProxy = new TextProxy( text, 1, 2 );
			const position = new Position( text, 3 );

			expect( Position.createAfter( textProxy ) ).deep.equal( position );
		} );
	} );

	describe( 'getEditableElement', () => {
		it( 'should return null if position is not inside EditableElement', () => {
			const position = new Position( new Element( 'p' ), 0 );

			expect( position.editableElement ).to.be.null;
		} );

		it( 'should return EditableElement when position is placed inside', () => {
			const document = new Document();
			const p = new Element( 'p' );
			const editable = new EditableElement( 'div', null, p );
			editable.document = document;
			const position = new Position( p, 0 );

			expect( position.editableElement ).to.equal( editable );

			document.destroy();
		} );
	} );

	describe( 'getCommonAncestor()', () => {
		let div, ul, liUl1, liUl2, texts, section, article, ol, liOl1, liOl2, p;

		// |- div
		//   |- ul
		//   |  |- li
		//   |  |  |- foz
		//   |  |- li
		//   |     |- bar
		//   |- section
		//      |- Sed id libero at libero tristique
		//      |- article
		//      |  |- ol
		//      |  |  |- li
		//      |  |  |  |- Lorem ipsum dolor sit amet.
		//      |  |  |- li
		//      |  |     |- Mauris tincidunt tincidunt leo ac rutrum.
		//      |  |- p
		//      |  |  |- Maecenas accumsan tellus.

		beforeEach( () => {
			texts = {
				foz: new Text( 'foz' ),
				bar: new Text( 'bar' ),
				lorem: new Text( 'Lorem ipsum dolor sit amet.' ),
				mauris: new Text( 'Mauris tincidunt tincidunt leo ac rutrum.' ),
				maecenas: new Text( 'Maecenas accumsan tellus.' ),
				sed: new Text( 'Sed id libero at libero tristique.' )
			};

			liUl1 = new Element( 'li', null, texts.foz );
			liUl2 = new Element( 'li', null, texts.bar );
			ul = new Element( 'ul', null, [ liUl1, liUl2 ] );

			liOl1 = new Element( 'li', null, texts.lorem );
			liOl2 = new Element( 'li', null, texts.mauris );
			ol = new Element( 'ol', null, [ liOl1, liOl2 ] );

			p = new Element( 'p', null, texts.maecenas );

			article = new Element( 'article', null, [ ol, p ] );
			section = new Element( 'section', null, [ texts.sed, article ] );

			div = new Element( 'div', null, [ ul, section ] );
		} );

		it( 'for two the same positions returns the parent element', () => {
			const afterLoremPosition = new Position( liOl1, 5 );
			const otherPosition = Position.createFromPosition( afterLoremPosition );

			test( afterLoremPosition, otherPosition, liOl1 );
		} );

		it( 'for two positions in the same element returns the element', () => {
			const startMaecenasPosition = Position.createAt( liOl2 );
			const beforeTellusPosition = new Position( liOl2, 18 );

			test( startMaecenasPosition, beforeTellusPosition, liOl2 );
		} );

		it( 'works when one of the positions is nested deeper than the other #1', () => {
			const firstPosition = new Position( liUl1, 1 );
			const secondPosition = new Position( p, 3 );

			test( firstPosition, secondPosition, div );
		} );

		it( 'works when one of the positions is nested deeper than the other #2', () => {
			const firstPosition = new Position( liOl2, 10 );
			const secondPosition = new Position( section, 1 );

			test( firstPosition, secondPosition, section );
		} );

		it( 'for two positions in different trees returns null', () => {
			const div = new Element( 'div' );
			const posInDiv = new Position( div, 0 );
			const firstPosition = new Position( liOl2, 10 );

			test( posInDiv, firstPosition, null );
		} );

		function test( positionA, positionB, lca ) {
			expect( positionA.getCommonAncestor( positionB ) ).to.equal( lca );
			expect( positionB.getCommonAncestor( positionA ) ).to.equal( lca );
		}
	} );
} );
