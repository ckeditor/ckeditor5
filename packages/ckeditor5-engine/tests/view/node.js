/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Element from '../../src/view/element';
import Text from '../../src/view/text';
import Node from '../../src/view/node';
import DocumentFragment from '../../src/view/documentfragment';
import RootEditableElement from '../../src/view/rooteditableelement';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import Document from '../../src/view/document';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'Node', () => {
	let root, document,
		one, two, three,
		charB, charA, charR, img;

	before( () => {
		document = new Document( new StylesProcessor() );

		charB = new Text( document, 'b' );
		charA = new Text( document, 'a' );
		img = new Element( document, 'img' );
		charR = new Text( document, 'r' );

		one = new Element( document, 'one' );
		two = new Element( document, 'two', null, [ charB, charA, img, charR ] );
		three = new Element( document, 'three' );

		root = new Element( document, null, null, [ one, two, three ] );
	} );

	describe( 'is()', () => {
		let node;

		beforeEach( () => {
			node = new Node();
		} );

		it( 'should return true for node', () => {
			expect( node.is( 'node' ) ).to.be.true;
			expect( node.is( 'view:node' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( node.is( 'rootElement' ) ).to.be.false;
			expect( node.is( 'containerElement' ) ).to.be.false;
			expect( node.is( 'element' ) ).to.be.false;
			expect( node.is( 'element', 'p' ) ).to.be.false;
			expect( node.is( '$text' ) ).to.be.false;
			expect( node.is( '$textProxy' ) ).to.be.false;
			expect( node.is( 'attributeElement' ) ).to.be.false;
			expect( node.is( 'uiElement' ) ).to.be.false;
			expect( node.is( 'emptyElement' ) ).to.be.false;
			expect( node.is( 'documentFragment' ) ).to.be.false;
		} );
	} );

	describe( 'getNextSibling/getPreviousSibling()', () => {
		it( 'should return next sibling', () => {
			expect( root.nextSibling ).to.be.null;

			expect( one.nextSibling ).to.equal( two );
			expect( two.nextSibling ).to.equal( three );
			expect( three.nextSibling ).to.be.null;

			expect( charB.nextSibling ).to.equal( charA );
			expect( charA.nextSibling ).to.equal( img );
			expect( img.nextSibling ).to.equal( charR );
			expect( charR.nextSibling ).to.be.null;
		} );

		it( 'should return previous sibling', () => {
			expect( root.previousSibling ).to.be.null;

			expect( one.previousSibling ).to.be.null;
			expect( two.previousSibling ).to.equal( one );
			expect( three.previousSibling ).to.equal( two );

			expect( charB.previousSibling ).to.be.null;
			expect( charA.previousSibling ).to.equal( charB );
			expect( img.previousSibling ).to.equal( charA );
			expect( charR.previousSibling ).to.equal( img );
		} );
	} );

	describe( 'getAncestors()', () => {
		it( 'should return empty array for node without ancestors', () => {
			const result = root.getAncestors();
			expect( result ).to.be.an( 'array' );
			expect( result.length ).to.equal( 0 );
		} );

		it( 'should return array including node itself if requested', () => {
			const result = root.getAncestors( { includeSelf: true } );
			expect( result ).to.be.an( 'array' );
			expect( result.length ).to.equal( 1 );
			expect( result[ 0 ] ).to.equal( root );
		} );

		it( 'should return array of ancestors', () => {
			const result = charR.getAncestors();
			expect( result.length ).to.equal( 2 );
			expect( result[ 0 ] ).to.equal( root );
			expect( result[ 1 ] ).to.equal( two );

			const result2 = charR.getAncestors( { includeSelf: true } );
			expect( result2.length ).to.equal( 3 );
			expect( result2[ 0 ] ).to.equal( root );
			expect( result2[ 1 ] ).to.equal( two );
			expect( result2[ 2 ] ).to.equal( charR );
		} );

		it( 'should return array of ancestors starting from parent', () => {
			const result = charR.getAncestors( { parentFirst: true } );
			expect( result.length ).to.equal( 2 );
			expect( result[ 0 ] ).to.equal( two );
			expect( result[ 1 ] ).to.equal( root );

			const result2 = charR.getAncestors( { includeSelf: true, parentFirst: true } );
			expect( result2.length ).to.equal( 3 );
			expect( result2[ 2 ] ).to.equal( root );
			expect( result2[ 1 ] ).to.equal( two );
			expect( result2[ 0 ] ).to.equal( charR );
		} );

		it( 'should return ancestors including DocumentFragment', () => {
			const fragment = new DocumentFragment( document, root );
			const result = img.getAncestors();
			root._remove();

			expect( result.length ).to.equal( 3 );
			expect( result[ 0 ] ).to.equal( fragment );
			expect( result[ 1 ] ).to.equal( root );
			expect( result[ 2 ] ).to.equal( two );
		} );
	} );

	describe( 'getCommonAncestor()', () => {
		it( 'should return the parent element for the same node', () => {
			expect( img.getCommonAncestor( img ) ).to.equal( two );
		} );

		it( 'should return the given node for the same node if includeSelf is used', () => {
			expect( img.getCommonAncestor( img, { includeSelf: true } ) ).to.equal( img );
		} );

		it( 'should return null for detached subtrees', () => {
			const detached = new Element( document, 'foo' );

			expect( img.getCommonAncestor( detached ) ).to.be.null;
			expect( detached.getCommonAncestor( img ) ).to.be.null;

			expect( img.getCommonAncestor( detached, { includeSelf: true } ) ).to.be.null;
			expect( detached.getCommonAncestor( img, { includeSelf: true } ) ).to.be.null;
		} );

		it( 'should return null when one of the nodes is a tree root itself', () => {
			expect( root.getCommonAncestor( img ) ).to.be.null;
			expect( img.getCommonAncestor( root ) ).to.be.null;
			expect( root.getCommonAncestor( root ) ).to.be.null;
		} );

		it( 'should return root when one of the nodes is a tree root itself and includeSelf is used', () => {
			expect( root.getCommonAncestor( img, { includeSelf: true } ) ).to.equal( root );
			expect( img.getCommonAncestor( root, { includeSelf: true } ) ).to.equal( root );
			expect( root.getCommonAncestor( root, { includeSelf: true } ) ).to.equal( root );
		} );

		it( 'should return parent of the nodes at the same level', () => {
			expect( img.getCommonAncestor( charA ), 1 ).to.equal( two );
			expect( charB.getCommonAncestor( charA ), 2 ).to.equal( two );

			expect( img.getCommonAncestor( charA, { includeSelf: true } ), 3 ).to.equal( two );
			expect( charB.getCommonAncestor( charA, { includeSelf: true } ), 4 ).to.equal( two );
		} );

		it( 'should return proper element for nodes in different branches and on different levels', () => {
			const foo = new Text( document, 'foo' );
			const bar = new Text( document, 'bar' );
			const bom = new Text( document, 'bom' );
			const d = new Element( document, 'd', null, [ bar ] );
			const c = new Element( document, 'c', null, [ foo, d ] );
			const b = new Element( document, 'b', null, [ c ] );
			const e = new Element( document, 'e', null, [ bom ] );
			const a = new Element( document, 'a', null, [ b, e ] );

			// <a><b><c>foo<d>bar</d></c></b><e>bom</e></a>

			expect( bar.getCommonAncestor( foo ), 1 ).to.equal( c );
			expect( foo.getCommonAncestor( d ), 2 ).to.equal( c );
			expect( c.getCommonAncestor( b ), 3 ).to.equal( a );
			expect( bom.getCommonAncestor( d ), 4 ).to.equal( a );
			expect( b.getCommonAncestor( bom ), 5 ).to.equal( a );
			expect( b.getCommonAncestor( bar ), 6 ).to.equal( a );

			expect( bar.getCommonAncestor( foo, { includeSelf: true } ), 11 ).to.equal( c );
			expect( foo.getCommonAncestor( d, { includeSelf: true } ), 12 ).to.equal( c );
			expect( c.getCommonAncestor( b, { includeSelf: true } ), 13 ).to.equal( b );
			expect( bom.getCommonAncestor( d, { includeSelf: true } ), 14 ).to.equal( a );
			expect( b.getCommonAncestor( bom, { includeSelf: true } ), 15 ).to.equal( a );
			expect( b.getCommonAncestor( bar, { includeSelf: true } ), 16 ).to.equal( b );
		} );

		it( 'should return document fragment', () => {
			const foo = new Text( document, 'foo' );
			const bar = new Text( document, 'bar' );
			const df = new DocumentFragment( document, [ foo, bar ] );

			expect( foo.getCommonAncestor( bar ) ).to.equal( df );
		} );
	} );

	describe( 'getIndex()', () => {
		it( 'should return null if the parent is null', () => {
			expect( root.index ).to.be.null;
		} );

		it( 'should return index in the parent', () => {
			expect( one.index ).to.equal( 0 );
			expect( two.index ).to.equal( 1 );
			expect( three.index ).to.equal( 2 );

			expect( charB.index ).to.equal( 0 );
			expect( charA.index ).to.equal( 1 );
			expect( img.index ).to.equal( 2 );
			expect( charR.index ).to.equal( 3 );
		} );

		it( 'should throw an error if parent does not contain element', () => {
			const f = new Text( document, 'f' );
			const bar = new Element( document, 'bar', [], [] );

			f.parent = bar;

			expectToThrowCKEditorError( () => {
				f.index;
			}, /view-node-not-found-in-parent/, bar );
		} );
	} );

	describe( 'getPath()', () => {
		it( 'should return empty array is the element is the root', () => {
			expect( root.getPath() ).to.deep.equal( [] );
		} );

		it( 'should return array with indices of given element and its ancestors starting from top-most one', () => {
			expect( one.getPath() ).to.deep.equal( [ 0 ] );
			expect( two.getPath() ).to.deep.equal( [ 1 ] );
			expect( img.getPath() ).to.deep.equal( [ 1, 2 ] );
			expect( charR.getPath() ).to.deep.equal( [ 1, 3 ] );
			expect( three.getPath() ).to.deep.equal( [ 2 ] );
		} );
	} );

	describe( 'getRoot()', () => {
		it( 'should return this element if it has no parent', () => {
			const child = new Element( document, 'p' );

			expect( child.root ).to.equal( child );
		} );

		it( 'should return root element', () => {
			const parent = new RootEditableElement( document, 'div' );
			const child = new Element( document, 'p' );

			child.parent = parent;

			expect( parent.root ).to.equal( parent );
			expect( child.root ).to.equal( parent );
		} );
	} );

	describe( 'isBefore()', () => {
		// Model is: <root><one></one><two>ba<img></img>r</two><three></three>
		it( 'should return true if the element is before given element', () => {
			expect( one.isBefore( two ) ).to.be.true;
			expect( one.isBefore( img ) ).to.be.true;

			expect( two.isBefore( charB ) ).to.be.true;
			expect( two.isBefore( charR ) ).to.be.true;
			expect( two.isBefore( three ) ).to.be.true;

			expect( root.isBefore( one ) ).to.be.true;
		} );

		it( 'should return false if the element is after given element', () => {
			expect( two.isBefore( one ) ).to.be.false;
			expect( img.isBefore( one ) ).to.be.false;

			expect( charB.isBefore( two ) ).to.be.false;
			expect( charR.isBefore( two ) ).to.be.false;
			expect( three.isBefore( two ) ).to.be.false;

			expect( one.isBefore( root ) ).to.be.false;
		} );

		it( 'should return false if the same element is given', () => {
			expect( one.isBefore( one ) ).to.be.false;
		} );

		it( 'should return false if elements are in different roots', () => {
			const otherRoot = new Element( document, 'root' );
			const otherElement = new Element( document, 'element' );

			otherRoot._appendChild( otherElement );

			expect( otherElement.isBefore( three ) ).to.be.false;
		} );
	} );

	describe( 'isAfter()', () => {
		// Model is: <root><one></one><two>ba<img></img>r</two><three></three>
		it( 'should return true if the element is after given element', () => {
			expect( two.isAfter( one ) ).to.be.true;
			expect( img.isAfter( one ) ).to.be.true;

			expect( charB.isAfter( two ) ).to.be.true;
			expect( charR.isAfter( two ) ).to.be.true;
			expect( three.isAfter( two ) ).to.be.true;

			expect( one.isAfter( root ) ).to.be.true;
		} );

		it( 'should return false if the element is before given element', () => {
			expect( one.isAfter( two ) ).to.be.false;
			expect( one.isAfter( img ) ).to.be.false;

			expect( two.isAfter( charB ) ).to.be.false;
			expect( two.isAfter( charR ) ).to.be.false;
			expect( two.isAfter( three ) ).to.be.false;

			expect( root.isAfter( one ) ).to.be.false;
		} );

		it( 'should return false if the same element is given', () => {
			expect( one.isAfter( one ) ).to.be.false;
		} );

		it( 'should return false if elements are in different roots', () => {
			const otherRoot = new Element( document, 'root' );
			const otherElement = new Element( document, 'element' );

			otherRoot._appendChild( otherElement );

			expect( three.isAfter( otherElement ) ).to.be.false;
		} );
	} );

	describe( 'isAttached()', () => {
		it( 'returns false for a fresh node', () => {
			const char = new Text( document, 'x' );
			const el = new Element( document, 'one' );

			expect( char.isAttached() ).to.equal( false );
			expect( el.isAttached() ).to.equal( false );
		} );

		it( 'returns true for the root element', () => {
			const root = new RootEditableElement( document, 'div' );

			expect( root.isAttached() ).to.equal( true );
		} );

		it( 'returns false for a node attached to a document fragment', () => {
			const foo = new Text( document, 'foo' );
			new DocumentFragment( document, [ foo ] ); // eslint-disable-line no-new

			expect( foo.isAttached() ).to.equal( false );
		} );
	} );

	describe( '_remove()', () => {
		it( 'should remove node from its parent', () => {
			const char = new Text( document, 'a' );
			const parent = new Element( document, 'p', null, [ char ] );
			char._remove();

			expect( parent.getChildIndex( char ) ).to.equal( -1 );
		} );

		it( 'uses parent._removeChildren method', () => {
			const char = new Text( document, 'a' );
			const parent = new Element( document, 'p', null, [ char ] );
			const _removeChildrenSpy = sinon.spy( parent, '_removeChildren' );
			const index = char.index;
			char._remove();
			_removeChildrenSpy.restore();
			sinon.assert.calledOnce( _removeChildrenSpy );
			sinon.assert.calledWithExactly( _removeChildrenSpy, index );
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should prevent circular reference when stringifying a node', () => {
			const char = new Text( document, 'a' );
			const parent = new Element( document, 'p', null );
			parent._appendChild( char );

			sinon.stub( char, 'document' ).value( 'view.Document()' );

			const json = JSON.stringify( char );
			const parsed = JSON.parse( json );

			expect( parsed ).to.deep.equal( {
				_textData: 'a',
				document: 'view.Document()'
			} );
		} );
	} );

	describe( 'change event', () => {
		let root, text, img, rootChangeSpy;

		before( () => {
			rootChangeSpy = sinon.spy();
		} );

		beforeEach( () => {
			text = new Text( document, 'foo' );
			img = new Element( document, 'img', { 'src': 'img.png' } );

			root = new Element( document, 'p', { renderer: { markToSync: rootChangeSpy } } );
			root._appendChild( [ text, img ] );

			root.on( 'change:children', ( evt, node ) => rootChangeSpy( 'children', node ) );
			root.on( 'change:attributes', ( evt, node ) => rootChangeSpy( 'attributes', node ) );
			root.on( 'change:text', ( evt, node ) => rootChangeSpy( 'text', node ) );

			rootChangeSpy.resetHistory();
		} );

		it( 'should be fired on the node', () => {
			const imgChangeSpy = sinon.spy();

			img.on( 'change:attributes', ( evt, node ) => {
				imgChangeSpy( 'attributes', node );
			} );

			img._setAttribute( 'width', 100 );

			sinon.assert.calledOnce( imgChangeSpy );
			sinon.assert.calledWith( imgChangeSpy, 'attributes', img );
		} );

		it( 'should be fired on the parent', () => {
			img._setAttribute( 'width', 100 );

			sinon.assert.calledOnce( rootChangeSpy );
			sinon.assert.calledWith( rootChangeSpy, 'attributes', img );
		} );

		describe( '_setAttribute()', () => {
			it( 'should fire change event', () => {
				img._setAttribute( 'width', 100 );

				sinon.assert.calledOnce( rootChangeSpy );
				sinon.assert.calledWith( rootChangeSpy, 'attributes', img );
			} );
		} );

		describe( '_removeAttribute()', () => {
			it( 'should fire change event', () => {
				img._removeAttribute( 'src' );

				sinon.assert.calledOnce( rootChangeSpy );
				sinon.assert.calledWith( rootChangeSpy, 'attributes', img );
			} );
		} );

		describe( '_insertChild()', () => {
			it( 'should fire change event', () => {
				root._insertChild( 1, new Element( document, 'img' ) );

				sinon.assert.calledOnce( rootChangeSpy );
				sinon.assert.calledWith( rootChangeSpy, 'children', root );
			} );
		} );

		describe( '_appendChild()', () => {
			it( 'should fire change event', () => {
				root._appendChild( new Element( document, 'img' ) );

				sinon.assert.calledOnce( rootChangeSpy );
				sinon.assert.calledWith( rootChangeSpy, 'children', root );
			} );
		} );

		describe( '_removeChildren()', () => {
			it( 'should fire change event', () => {
				root._removeChildren( 1, 1 );

				sinon.assert.calledOnce( rootChangeSpy );
				sinon.assert.calledWith( rootChangeSpy, 'children', root );
			} );
		} );

		describe( 'setText', () => {
			it( 'should fire change event', () => {
				text._data = 'bar';

				sinon.assert.calledOnce( rootChangeSpy );
				sinon.assert.calledWith( rootChangeSpy, 'text', text );
			} );
		} );
	} );
} );
