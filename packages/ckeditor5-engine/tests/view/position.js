/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewPosition } from '../../src/view/position.js';
import { ViewNode } from '../../src/view/node.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewDocumentFragment } from '../../src/view/documentfragment.js';
import { ViewEditableElement } from '../../src/view/editableelement.js';
import { ViewDocument } from '../../src/view/document.js';
import { ViewText } from '../../src/view/text.js';
import { ViewTextProxy } from '../../src/view/textproxy.js';

import { _parseView, _stringifyView } from '../../src/dev-utils/view.js';
import { ViewTreeWalker } from '../../src/view/treewalker.js';
import { createViewRoot } from './_utils/createroot.js';
import { ViewAttributeElement } from '../../src/view/attributeelement.js';
import { ViewContainerElement } from '../../src/view/containerelement.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'ViewPosition', () => {
	const parentMock = {};
	let document;

	before( () => {
		document = new ViewDocument( new StylesProcessor() );
	} );

	describe( 'constructor()', () => {
		it( 'should create element without attributes', () => {
			const position = new ViewPosition( parentMock, 5 );

			expect( position ).to.have.property( 'parent' ).that.equals( parentMock );
			expect( position ).to.have.property( 'offset' ).that.equals( 5 );
		} );
	} );

	describe( 'is()', () => {
		let position;

		beforeEach( () => {
			position = new ViewPosition( parentMock, 5 );
		} );

		it( 'should return true for "position"', () => {
			expect( position.is( 'position' ) ).to.be.true;
			expect( position.is( 'view:position' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( position.is( 'rootElement' ) ).to.be.false;
			expect( position.is( 'containerElement' ) ).to.be.false;
			expect( position.is( 'element' ) ).to.be.false;
			expect( position.is( 'element', 'p' ) ).to.be.false;
			expect( position.is( '$text' ) ).to.be.false;
			expect( position.is( '$textProxy' ) ).to.be.false;
			expect( position.is( 'attributeElement' ) ).to.be.false;
			expect( position.is( 'uiElement' ) ).to.be.false;
			expect( position.is( 'emptyElement' ) ).to.be.false;
			expect( position.is( 'documentFragment' ) ).to.be.false;
			expect( position.is( 'model:position' ) ).to.be.false;
		} );
	} );

	describe( 'nodeBefore', () => {
		it( 'should equal to node that is before position', () => {
			const b1 = new ViewElement( document, 'b' );
			const el = new ViewElement( document, 'p', null, [ b1 ] );
			const position = new ViewPosition( el, 1 );

			expect( position.nodeBefore ).to.equal( b1 );
		} );

		it( 'should equal null if there is no node before', () => {
			const b1 = new ViewElement( document, 'b' );
			const el = new ViewElement( document, 'p', null, [ b1 ] );
			const position = new ViewPosition( el, 0 );

			expect( position.nodeBefore ).to.be.null;
		} );

		it( 'should equal null if position is located inside text node', () => {
			const text = new ViewText( document, 'foobar' );
			const position = new ViewPosition( text, 3 );

			expect( position.nodeBefore ).to.be.null;
		} );
	} );

	describe( 'nodeAfter', () => {
		it( 'should equal to node that is after position', () => {
			const b1 = new ViewElement( document, 'b' );
			const el = new ViewElement( document, 'p', null, [ b1 ] );
			const position = new ViewPosition( el, 0 );

			expect( position.nodeAfter ).to.equal( b1 );
		} );

		it( 'should equal null if there is no node before', () => {
			const b1 = new ViewElement( document, 'b' );
			const el = new ViewElement( document, 'p', null, [ b1 ] );
			const position = new ViewPosition( el, 1 );

			expect( position.nodeAfter ).to.be.null;
		} );

		it( 'should equal null if position is located inside text node', () => {
			const text = new ViewText( document, 'foobar' );
			const position = new ViewPosition( text, 3 );

			expect( position.nodeAfter ).to.be.null;
		} );
	} );

	describe( 'getShiftedBy', () => {
		it( 'returns new instance with shifted offset', () => {
			const position = new ViewPosition( parentMock, 10 );
			const shifted = position.getShiftedBy( 12 );
			expect( shifted.offset ).to.equal( 22 );
		} );

		it( 'accepts negative values', () => {
			const position = new ViewPosition( parentMock, 10 );
			const shifted = position.getShiftedBy( -5 );
			expect( shifted.offset ).to.equal( 5 );
		} );

		it( 'prevents offset to be a negative value', () => {
			const position = new ViewPosition( parentMock, 10 );
			const shifted = position.getShiftedBy( -20 );

			expect( shifted.offset ).to.equal( 0 );
		} );
	} );

	describe( 'getLastMatchingPosition', () => {
		it( 'should skip forward', () => {
			const { view, selection } = _parseView( '<p><b>{}foo</b></p>' );
			let position = selection.getFirstPosition();

			position = position.getLastMatchingPosition( value => value.type == 'text' );

			expect( _stringifyView( view, position ) ).to.equal( '<p><b>foo[]</b></p>' );
		} );

		it( 'should skip backward', () => {
			const { view, selection } = _parseView( '<p><b>foo{}</b></p>' );
			let position = selection.getFirstPosition();

			position = position.getLastMatchingPosition( value => value.type == 'text', { direction: 'backward' } );

			expect( _stringifyView( view, position ) ).to.equal( '<p><b>[]foo</b></p>' );
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return it\'s parent root', () => {
			const foo = new ViewText( document, 'foo' );
			const docFrag = new ViewDocumentFragment( document, foo );

			expect( new ViewPosition( foo, 1 ).root ).to.equal( docFrag );

			const bar = new ViewText( document, 'bar' );
			const p = new ViewElement( document, 'p', null, bar );

			expect( new ViewPosition( bar, 2 ).root ).to.equal( p );
			expect( new ViewPosition( p, 0 ).root ).to.equal( p );
		} );
	} );

	describe( 'getAncestors', () => {
		it( 'should return it\'s parent and all it\'s ancestors', () => {
			const foo = new ViewText( document, 'foo' );
			const p = new ViewElement( document, 'p', null, foo );
			const div = new ViewElement( document, 'div', null, p );
			const docFrag = new ViewDocumentFragment( document, div );

			expect( new ViewPosition( foo, 1 ).getAncestors() ).to.deep.equal( [ docFrag, div, p, foo ] );
		} );

		it( 'should return DocumentFragment if position is directly in document fragment', () => {
			const docFrag = new ViewDocumentFragment( document );

			expect( new ViewPosition( docFrag, 0 ).getAncestors() ).to.deep.equal( [ docFrag ] );
		} );
	} );

	describe( 'isEqual', () => {
		it( 'should return true for same object', () => {
			const position = new ViewPosition( {}, 12 );
			expect( position.isEqual( position ) ).to.be.true;
		} );

		it( 'should return true for positions with same parent and offset', () => {
			const parentMock = {};
			const position1 = new ViewPosition( parentMock, 12 );
			const position2 = new ViewPosition( parentMock, 12 );
			expect( position1.isEqual( position2 ) ).to.be.true;
		} );

		it( 'should return false for positions with different parents', () => {
			const position1 = new ViewPosition( {}, 12 );
			const position2 = new ViewPosition( {}, 12 );
			expect( position1.isEqual( position2 ) ).to.be.false;
		} );

		it( 'should return false for positions with different positions', () => {
			const parentMock = {};
			const position1 = new ViewPosition( parentMock, 12 );
			const position2 = new ViewPosition( parentMock, 2 );
			expect( position1.isEqual( position2 ) ).to.be.false;
		} );
	} );

	describe( 'isBefore', () => {
		it( 'should return false for same positions', () => {
			const node = new ViewNode();
			const position1 = new ViewPosition( node, 10 );
			const position2 = new ViewPosition( node, 10 );

			expect( position1.isBefore( position1 ) ).to.be.false;
			expect( position1.isBefore( position2 ) ).to.be.false;
			expect( position2.isBefore( position1 ) ).to.be.false;
		} );

		it( 'should return false if no common ancestor is found', () => {
			const t1 = new ViewText( document, 'foo' );
			const t2 = new ViewText( document, 'bar' );
			const e1 = new ViewElement( document, 'p', null, [ t1 ] );
			const e2 = new ViewElement( document, 'p', null, [ t2 ] );
			const position1 = new ViewPosition( e1, 0 );
			const position2 = new ViewPosition( e2, 1 );

			expect( position1.isBefore( position2 ) );
			expect( position2.isBefore( position1 ) );
		} );

		it( 'should return true if position is before in same node', () => {
			const node = new ViewNode();
			const p1 = new ViewPosition( node, 10 );
			const p2 = new ViewPosition( node, 5 );

			expect( p2.isBefore( p1 ) ).to.be.true;
			expect( p1.isBefore( p2 ) ).to.be.false;
		} );

		it( 'should compare positions that have common parent', () => {
			const t1 = new ViewText( document, 'foo' );
			const t2 = new ViewText( document, 'bar' );
			const root = new ViewElement( document, 'p', null, [ t1, t2 ] );
			const position1 = new ViewPosition( t1, 2 );
			const position2 = new ViewPosition( t2, 0 );
			const position3 = new ViewPosition( root, 0 );
			const position4 = new ViewPosition( root, 2 );
			const position5 = new ViewPosition( t1, 0 );
			const position6 = new ViewPosition( root, 1 );

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
			const node = new ViewNode();
			const position1 = new ViewPosition( node, 10 );
			const position2 = new ViewPosition( node, 10 );

			expect( position1.isAfter( position1 ) ).to.be.false;
			expect( position1.isAfter( position2 ) ).to.be.false;
			expect( position2.isAfter( position1 ) ).to.be.false;
		} );

		it( 'should return false if no common ancestor is found', () => {
			const t1 = new ViewText( document, 'foo' );
			const t2 = new ViewText( document, 'bar' );
			const e1 = new ViewElement( document, 'p', null, [ t1 ] );
			const e2 = new ViewElement( document, 'p', null, [ t2 ] );
			const position1 = new ViewPosition( e1, 0 );
			const position2 = new ViewPosition( e2, 1 );

			expect( position1.isAfter( position2 ) );
			expect( position2.isAfter( position1 ) );
		} );

		it( 'should return true if position is after in same node', () => {
			const node = new ViewNode();
			const p1 = new ViewPosition( node, 10 );
			const p2 = new ViewPosition( node, 5 );

			expect( p2.isAfter( p1 ) ).to.be.false;
			expect( p1.isAfter( p2 ) ).to.be.true;
		} );

		it( 'should compare positions that have common parent', () => {
			const t1 = new ViewText( document, 'foo' );
			const t2 = new ViewText( document, 'bar' );
			const root = new ViewElement( document, 'p', null, [ t1, t2 ] );
			const position1 = new ViewPosition( t1, 2 );
			const position2 = new ViewPosition( t2, 0 );
			const position3 = new ViewPosition( root, 0 );
			const position4 = new ViewPosition( root, 2 );
			const position5 = new ViewPosition( t1, 0 );
			const position6 = new ViewPosition( root, 1 );

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
			const foo = new ViewText( document, 'foo' );
			const position = new ViewPosition( foo, 0 );
			expect( position.isAtStart ).to.be.true;
		} );

		it( 'should return false if it is not at the start of it\'s parent', () => {
			const foo = new ViewText( document, 'foo' );
			const position = new ViewPosition( foo, 1 );
			expect( position.isAtStart ).to.be.false;
		} );
	} );

	describe( 'isAtEnd', () => {
		it( 'should return true if it is at the end of it\'s parent', () => {
			const foo = new ViewText( document, 'foo' );
			const p = new ViewElement( document, 'p', null, foo );

			expect( new ViewPosition( foo, 3 ).isAtEnd ).to.be.true;
			expect( new ViewPosition( p, 1 ).isAtEnd ).to.be.true;
		} );

		it( 'should return false if it is not at the end of it\'s parent', () => {
			const foo = new ViewText( document, 'foo' );
			const p = new ViewElement( document, 'p', null, foo );

			expect( new ViewPosition( foo, 2 ).isAtEnd ).to.be.false;
			expect( new ViewPosition( p, 0 ).isAtEnd ).to.be.false;
		} );
	} );

	describe( 'compareWith', () => {
		it( 'should return same if positions are same', () => {
			const root = new ViewElement( document );
			const position = new ViewPosition( root, 0 );
			const compared = new ViewPosition( root, 0 );

			expect( position.compareWith( compared ) ).to.equal( 'same' );
		} );

		it( 'should return before if the position is before compared one', () => {
			const root = new ViewElement( document );
			const position = new ViewPosition( root, 0 );
			const compared = new ViewPosition( root, 1 );

			expect( position.compareWith( compared ) ).to.equal( 'before' );
		} );

		it( 'should return after if the position is after compared one', () => {
			const root = new ViewElement( document );
			const position = new ViewPosition( root, 4 );
			const compared = new ViewPosition( root, 1 );

			expect( position.compareWith( compared ) ).to.equal( 'after' );
		} );

		it( 'should return different if positions are in different roots', () => {
			const root1 = new ViewElement( document );
			const root2 = new ViewElement( document );
			const position = new ViewPosition( root1, 4 );
			const compared = new ViewPosition( root2, 1 );

			expect( position.compareWith( compared ) ).to.equal( 'different' );
		} );

		it( 'should return correct results if position is in document fragment', () => {
			const node = new ViewElement( document, 'name' );
			const docFrag = new ViewDocumentFragment( document, [ node ] );
			const position = new ViewPosition( docFrag, 0 );
			const compared = new ViewPosition( docFrag, 1 );
			const posInNode = new ViewPosition( node, 0 );

			expect( position.compareWith( compared ) ).to.equal( 'before' );
			expect( compared.compareWith( position ) ).to.equal( 'after' );
			expect( compared.compareWith( compared ) ).to.equal( 'same' );
			expect( position.compareWith( posInNode ) ).to.equal( 'before' );
			expect( compared.compareWith( posInNode ) ).to.equal( 'after' );
		} );
	} );

	describe( 'static creators', () => {
		describe( '_createAt()', () => {
			it( 'should throw if no offset is passed', () => {
				const element = new ViewElement( document, 'p' );

				expectToThrowCKEditorError( () => {
					ViewPosition._createAt( element );
				}, 'view-createpositionat-offset-required' );
			} );

			it( 'should create positions from positions', () => {
				const p = new ViewElement( document, 'p' );
				const position = new ViewPosition( p, 0 );
				const created = ViewPosition._createAt( position, 0 );

				expect( created.isEqual( position ) ).to.be.true;
				expect( created ).to.not.be.equal( position );
			} );

			it( 'should create positions from node and offset', () => {
				const foo = new ViewText( document, 'foo' );
				const p = new ViewElement( document, 'p', null, foo );

				expect( ViewPosition._createAt( foo, 0 ).parent ).to.equal( foo );
				expect( ViewPosition._createAt( foo, 0 ).offset ).to.equal( 0 );

				expect( ViewPosition._createAt( foo, 2 ).parent ).to.equal( foo );
				expect( ViewPosition._createAt( foo, 2 ).offset ).to.equal( 2 );

				expect( ViewPosition._createAt( p, 1 ).parent ).to.equal( p );
				expect( ViewPosition._createAt( p, 1 ).offset ).to.equal( 1 );
			} );

			it( 'should create positions from node and flag', () => {
				const foo = new ViewText( document, 'foo' );
				const p = new ViewElement( document, 'p', null, foo );

				const fooEnd = ViewPosition._createAt( foo, 'end' );
				const fooBefore = ViewPosition._createAt( foo, 'before' );
				const fooAfter = ViewPosition._createAt( foo, 'after' );

				const pEnd = ViewPosition._createAt( p, 'end' );
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
				const foo = new ViewText( document, 'foo' );
				const docFrag = new ViewDocumentFragment( document, [ foo ] );

				const pStart = ViewPosition._createAt( docFrag, 0 );
				const pEnd = ViewPosition._createAt( docFrag, 'end' );

				expect( pStart.parent ).to.equal( docFrag );
				expect( pStart.offset ).to.equal( 0 );
				expect( pEnd.parent ).to.equal( docFrag );
				expect( pEnd.offset ).to.equal( 1 );
			} );
		} );

		describe( '_createBefore()', () => {
			it( 'should throw error if one try to create positions before root', () => {
				const paragraph = _parseView( '<p></p>' );

				expectToThrowCKEditorError( () => {
					ViewPosition._createBefore( paragraph );
				}, /view-position-before-root/, paragraph );
			} );

			it( 'should create positions before `Node`', () => {
				const { selection } = _parseView( '<p>[]<b></b></p>' );
				const position = selection.getFirstPosition();
				const nodeAfter = position.nodeAfter;

				expect( ViewPosition._createBefore( nodeAfter ).isEqual( position ) ).to.be.true;
			} );

			it( 'should create positions before `ModelTextProxy`', () => {
				const text = new ViewText( document, 'abc' );

				const textProxy = new ViewTextProxy( text, 1, 1 );
				const position = new ViewPosition( text, 1 );

				expect( ViewPosition._createBefore( textProxy ) ).deep.equal( position );
			} );
		} );

		describe( '_createAfter()', () => {
			it( 'should throw error if one try to create positions after root', () => {
				const paragraph = _parseView( '<p></p>' );

				expectToThrowCKEditorError( () => {
					ViewPosition._createAfter( paragraph );
				}, /view-position-after-root/, paragraph );
			} );

			it( 'should create positions after `Node`', () => {
				const { selection } = _parseView( '<p><b></b>[]</p>' );
				const position = selection.getFirstPosition();
				const nodeBefore = position.nodeBefore;

				expect( ViewPosition._createAfter( nodeBefore ).isEqual( position ) ).to.be.true;
			} );

			it( 'should create positions after `ModelTextProxy`', () => {
				const text = new ViewText( document, 'abcd' );

				const textProxy = new ViewTextProxy( text, 1, 2 );
				const position = new ViewPosition( text, 3 );

				expect( ViewPosition._createAfter( textProxy ) ).deep.equal( position );
			} );
		} );
	} );

	describe( 'getEditableElement', () => {
		it( 'should return null if position is not inside ViewEditableElement', () => {
			const position = new ViewPosition( new ViewElement( document, 'p' ), 0 );

			expect( position.editableElement ).to.be.null;
		} );

		it( 'should return ViewEditableElement when position is placed inside', () => {
			const p = new ViewElement( document, 'p' );
			const editable = new ViewEditableElement( document, 'div', null, p );
			const position = new ViewPosition( p, 0 );

			expect( position.editableElement ).to.equal( editable );
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
				foz: new ViewText( document, 'foz' ),
				bar: new ViewText( document, 'bar' ),
				lorem: new ViewText( document, 'Lorem ipsum dolor sit amet.' ),
				mauris: new ViewText( document, 'Mauris tincidunt tincidunt leo ac rutrum.' ),
				maecenas: new ViewText( document, 'Maecenas accumsan tellus.' ),
				sed: new ViewText( document, 'Sed id libero at libero tristique.' )
			};

			liUl1 = new ViewElement( document, 'li', null, texts.foz );
			liUl2 = new ViewElement( document, 'li', null, texts.bar );
			ul = new ViewElement( document, 'ul', null, [ liUl1, liUl2 ] );

			liOl1 = new ViewElement( document, 'li', null, texts.lorem );
			liOl2 = new ViewElement( document, 'li', null, texts.mauris );
			ol = new ViewElement( document, 'ol', null, [ liOl1, liOl2 ] );

			p = new ViewElement( document, 'p', null, texts.maecenas );

			article = new ViewElement( document, 'article', null, [ ol, p ] );
			section = new ViewElement( document, 'section', null, [ texts.sed, article ] );

			div = new ViewElement( document, 'div', null, [ ul, section ] );
		} );

		it( 'for two the same positions returns the parent element', () => {
			const afterLoremPosition = new ViewPosition( liOl1, 5 );
			const otherPosition = ViewPosition._createAt( afterLoremPosition );

			testParent( afterLoremPosition, otherPosition, liOl1 );
		} );

		it( 'for two positions in the same element returns the element', () => {
			const startMaecenasPosition = ViewPosition._createAt( liOl2, 0 );
			const beforeTellusPosition = new ViewPosition( liOl2, 18 );

			testParent( startMaecenasPosition, beforeTellusPosition, liOl2 );
		} );

		it( 'works when one of the positions is nested deeper than the other #1', () => {
			const firstPosition = new ViewPosition( liUl1, 1 );
			const secondPosition = new ViewPosition( p, 3 );

			testParent( firstPosition, secondPosition, div );
		} );

		it( 'works when one of the positions is nested deeper than the other #2', () => {
			const firstPosition = new ViewPosition( liOl2, 10 );
			const secondPosition = new ViewPosition( section, 1 );

			testParent( firstPosition, secondPosition, section );
		} );

		it( 'for two positions in different trees returns null', () => {
			const div = new ViewElement( document, 'div' );
			const posInDiv = new ViewPosition( div, 0 );
			const firstPosition = new ViewPosition( liOl2, 10 );

			testParent( posInDiv, firstPosition, null );
		} );

		function testParent( positionA, positionB, lca ) {
			expect( positionA.getCommonAncestor( positionB ) ).to.equal( lca );
			expect( positionB.getCommonAncestor( positionA ) ).to.equal( lca );
		}
	} );

	describe( 'getWalker()', () => {
		let root;

		beforeEach( () => {
			const doc = new ViewDocument( new StylesProcessor() );

			root = createViewRoot( doc );

			const textAbcd = new ViewText( document, 'abcd' );
			const bold = new ViewAttributeElement( document, 'b', null, [ textAbcd ] );

			const paragraph = new ViewContainerElement( document, 'p', null, [ bold ] );
			const img = new ViewContainerElement( document, 'img' );

			root._insertChild( 0, [ img, paragraph ] );
		} );

		it( 'should be possible to iterate using this method', () => {
			const position = new ViewPosition( root, 0 );

			const items = [];
			const walker = position.getWalker();

			for ( const value of walker ) {
				items.push( value.type + ':' + ( value.item.name || value.item.data ) );
			}

			expect( items ).to.deep.equal( [
				'elementStart:img',
				'elementEnd:img',
				'elementStart:p',
				'elementStart:b',
				'text:abcd',
				'elementEnd:b',
				'elementEnd:p'
			] );
		} );

		it( 'should return treewalker with given options', () => {
			const position = new ViewPosition( root, 0 );
			const walker = position.getWalker( { singleCharacters: true } );

			expect( walker ).to.be.instanceof( ViewTreeWalker );
			expect( walker ).to.have.property( 'singleCharacters' ).that.is.true;
			expect( walker ).to.have.property( 'position' );
			expect( walker.position.isEqual( position ) ).to.be.true;
			expect( walker ).to.have.property( 'shallow' ).that.is.false;
		} );
	} );
} );
