/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

import { ViewElement } from '../../src/view/element.js';
import { ViewText } from '../../src/view/text.js';
import { ViewNode } from '../../src/view/node.js';
import { ViewDocumentFragment } from '../../src/view/documentfragment.js';
import { ViewAttributeElement } from '../../src/view/attributeelement.js';
import { ViewContainerElement } from '../../src/view/containerelement.js';
import { ViewRootEditableElement } from '../../src/view/rooteditableelement.js';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { ViewDocument } from '../../src/view/document.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'Node', () => {
	let root, document,
		one, two, three,
		charB, charA, charR, img;

	beforeAll( () => {
		document = new ViewDocument( new StylesProcessor() );

		charB = new ViewText( document, 'b' );
		charA = new ViewText( document, 'a' );
		img = new ViewElement( document, 'img' );
		charR = new ViewText( document, 'r' );

		one = new ViewElement( document, 'one' );
		two = new ViewElement( document, 'two', null, [ charB, charA, img, charR ] );
		three = new ViewElement( document, 'three' );

		root = new ViewElement( document, null, null, [ one, two, three ] );
	} );

	describe( 'is()', () => {
		let node;

		beforeEach( () => {
			node = new ViewNode();
		} );

		it( 'should return true for node', () => {
			expect( node.is( 'node' ) ).toBe( true );
			expect( node.is( 'view:node' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( node.is( 'rootElement' ) ).toBe( false );
			expect( node.is( 'containerElement' ) ).toBe( false );
			expect( node.is( 'element' ) ).toBe( false );
			expect( node.is( 'element', 'p' ) ).toBe( false );
			expect( node.is( '$text' ) ).toBe( false );
			expect( node.is( '$textProxy' ) ).toBe( false );
			expect( node.is( 'attributeElement' ) ).toBe( false );
			expect( node.is( 'uiElement' ) ).toBe( false );
			expect( node.is( 'emptyElement' ) ).toBe( false );
			expect( node.is( 'documentFragment' ) ).toBe( false );
		} );
	} );

	describe( 'getNextSibling/getPreviousSibling()', () => {
		it( 'should return next sibling', () => {
			expect( root.nextSibling ).toBeNull();

			expect( one.nextSibling ).toBe( two );
			expect( two.nextSibling ).toBe( three );
			expect( three.nextSibling ).toBeNull();

			expect( charB.nextSibling ).toBe( charA );
			expect( charA.nextSibling ).toBe( img );
			expect( img.nextSibling ).toBe( charR );
			expect( charR.nextSibling ).toBeNull();
		} );

		it( 'should return previous sibling', () => {
			expect( root.previousSibling ).toBeNull();

			expect( one.previousSibling ).toBeNull();
			expect( two.previousSibling ).toBe( one );
			expect( three.previousSibling ).toBe( two );

			expect( charB.previousSibling ).toBeNull();
			expect( charA.previousSibling ).toBe( charB );
			expect( img.previousSibling ).toBe( charA );
			expect( charR.previousSibling ).toBe( img );
		} );
	} );

	describe( 'getAncestors()', () => {
		it( 'should return empty array for node without ancestors', () => {
			const result = root.getAncestors();
			expect( Array.isArray( result ) ).toBe( true );
			expect( result.length ).toBe( 0 );
		} );

		it( 'should return array including node itself if requested', () => {
			const result = root.getAncestors( { includeSelf: true } );
			expect( Array.isArray( result ) ).toBe( true );
			expect( result.length ).toBe( 1 );
			expect( result[ 0 ] ).toBe( root );
		} );

		it( 'should return array of ancestors', () => {
			const result = charR.getAncestors();
			expect( result.length ).toBe( 2 );
			expect( result[ 0 ] ).toBe( root );
			expect( result[ 1 ] ).toBe( two );

			const result2 = charR.getAncestors( { includeSelf: true } );
			expect( result2.length ).toBe( 3 );
			expect( result2[ 0 ] ).toBe( root );
			expect( result2[ 1 ] ).toBe( two );
			expect( result2[ 2 ] ).toBe( charR );
		} );

		it( 'should return array of ancestors starting from parent', () => {
			const result = charR.getAncestors( { parentFirst: true } );
			expect( result.length ).toBe( 2 );
			expect( result[ 0 ] ).toBe( two );
			expect( result[ 1 ] ).toBe( root );

			const result2 = charR.getAncestors( { includeSelf: true, parentFirst: true } );
			expect( result2.length ).toBe( 3 );
			expect( result2[ 2 ] ).toBe( root );
			expect( result2[ 1 ] ).toBe( two );
			expect( result2[ 0 ] ).toBe( charR );
		} );

		it( 'should return ancestors including DocumentFragment', () => {
			const fragment = new ViewDocumentFragment( document, root );
			const result = img.getAncestors();
			root._remove();

			expect( result.length ).toBe( 3 );
			expect( result[ 0 ] ).toBe( fragment );
			expect( result[ 1 ] ).toBe( root );
			expect( result[ 2 ] ).toBe( two );
		} );
	} );

	describe( 'getCommonAncestor()', () => {
		it( 'should return the parent element for the same node', () => {
			expect( img.getCommonAncestor( img ) ).toBe( two );
		} );

		it( 'should return the given node for the same node if includeSelf is used', () => {
			expect( img.getCommonAncestor( img, { includeSelf: true } ) ).toBe( img );
		} );

		it( 'should return null for detached subtrees', () => {
			const detached = new ViewElement( document, 'foo' );

			expect( img.getCommonAncestor( detached ) ).toBeNull();
			expect( detached.getCommonAncestor( img ) ).toBeNull();

			expect( img.getCommonAncestor( detached, { includeSelf: true } ) ).toBeNull();
			expect( detached.getCommonAncestor( img, { includeSelf: true } ) ).toBeNull();
		} );

		it( 'should return null when one of the nodes is a tree root itself', () => {
			expect( root.getCommonAncestor( img ) ).toBeNull();
			expect( img.getCommonAncestor( root ) ).toBeNull();
			expect( root.getCommonAncestor( root ) ).toBeNull();
		} );

		it( 'should return root when one of the nodes is a tree root itself and includeSelf is used', () => {
			expect( root.getCommonAncestor( img, { includeSelf: true } ) ).toBe( root );
			expect( img.getCommonAncestor( root, { includeSelf: true } ) ).toBe( root );
			expect( root.getCommonAncestor( root, { includeSelf: true } ) ).toBe( root );
		} );

		it( 'should return parent of the nodes at the same level', () => {
			expect( img.getCommonAncestor( charA ), 1 ).toBe( two );
			expect( charB.getCommonAncestor( charA ), 2 ).toBe( two );

			expect( img.getCommonAncestor( charA, { includeSelf: true } ), 3 ).toBe( two );
			expect( charB.getCommonAncestor( charA, { includeSelf: true } ), 4 ).toBe( two );
		} );

		it( 'should return proper element for nodes in different branches and on different levels', () => {
			const foo = new ViewText( document, 'foo' );
			const bar = new ViewText( document, 'bar' );
			const bom = new ViewText( document, 'bom' );
			const d = new ViewElement( document, 'd', null, [ bar ] );
			const c = new ViewElement( document, 'c', null, [ foo, d ] );
			const b = new ViewElement( document, 'b', null, [ c ] );
			const e = new ViewElement( document, 'e', null, [ bom ] );
			const a = new ViewElement( document, 'a', null, [ b, e ] );

			// <a><b><c>foo<d>bar</d></c></b><e>bom</e></a>

			expect( bar.getCommonAncestor( foo ), 1 ).toBe( c );
			expect( foo.getCommonAncestor( d ), 2 ).toBe( c );
			expect( c.getCommonAncestor( b ), 3 ).toBe( a );
			expect( bom.getCommonAncestor( d ), 4 ).toBe( a );
			expect( b.getCommonAncestor( bom ), 5 ).toBe( a );
			expect( b.getCommonAncestor( bar ), 6 ).toBe( a );

			expect( bar.getCommonAncestor( foo, { includeSelf: true } ), 11 ).toBe( c );
			expect( foo.getCommonAncestor( d, { includeSelf: true } ), 12 ).toBe( c );
			expect( c.getCommonAncestor( b, { includeSelf: true } ), 13 ).toBe( b );
			expect( bom.getCommonAncestor( d, { includeSelf: true } ), 14 ).toBe( a );
			expect( b.getCommonAncestor( bom, { includeSelf: true } ), 15 ).toBe( a );
			expect( b.getCommonAncestor( bar, { includeSelf: true } ), 16 ).toBe( b );
		} );

		it( 'should return document fragment', () => {
			const foo = new ViewText( document, 'foo' );
			const bar = new ViewText( document, 'bar' );
			const df = new ViewDocumentFragment( document, [ foo, bar ] );

			expect( foo.getCommonAncestor( bar ) ).toBe( df );
		} );
	} );

	describe( '#index getter', () => {
		it( 'should return null if the parent is null', () => {
			expect( root.index ).toBeNull();
		} );

		it( 'should return index in the parent', () => {
			expect( one.index ).toBe( 0 );
			expect( two.index ).toBe( 1 );
			expect( three.index ).toBe( 2 );

			expect( charB.index ).toBe( 0 );
			expect( charA.index ).toBe( 1 );
			expect( img.index ).toBe( 2 );
			expect( charR.index ).toBe( 3 );
		} );

		it( 'should throw an error if parent does not contain element', () => {
			const f = new ViewText( document, 'f' );
			const bar = new ViewElement( document, 'bar', [], [] );

			f.parent = bar;

			expectToThrowCKEditorError( () => {
				f.index;
			}, /view-node-not-found-in-parent/, bar );
		} );
	} );

	describe( 'getPath()', () => {
		it( 'should return empty array is the element is the root', () => {
			expect( root.getPath() ).toEqual( [] );
		} );

		it( 'should return array with indices of given element and its ancestors starting from top-most one', () => {
			expect( one.getPath() ).toEqual( [ 0 ] );
			expect( two.getPath() ).toEqual( [ 1 ] );
			expect( img.getPath() ).toEqual( [ 1, 2 ] );
			expect( charR.getPath() ).toEqual( [ 1, 3 ] );
			expect( three.getPath() ).toEqual( [ 2 ] );
		} );
	} );

	describe( 'getRoot()', () => {
		it( 'should return this element if it has no parent', () => {
			const child = new ViewElement( document, 'p' );

			expect( child.root ).toBe( child );
		} );

		it( 'should return root element', () => {
			const parent = new ViewRootEditableElement( document, 'div' );
			const child = new ViewElement( document, 'p' );

			child.parent = parent;

			expect( parent.root ).toBe( parent );
			expect( child.root ).toBe( parent );
		} );
	} );

	describe( 'isBefore()', () => {
		// Model is: <root><one></one><two>ba<img></img>r</two><three></three>
		it( 'should return true if the element is before given element', () => {
			expect( one.isBefore( two ) ).toBe( true );
			expect( one.isBefore( img ) ).toBe( true );

			expect( two.isBefore( charB ) ).toBe( true );
			expect( two.isBefore( charR ) ).toBe( true );
			expect( two.isBefore( three ) ).toBe( true );

			expect( root.isBefore( one ) ).toBe( true );
		} );

		it( 'should return false if the element is after given element', () => {
			expect( two.isBefore( one ) ).toBe( false );
			expect( img.isBefore( one ) ).toBe( false );

			expect( charB.isBefore( two ) ).toBe( false );
			expect( charR.isBefore( two ) ).toBe( false );
			expect( three.isBefore( two ) ).toBe( false );

			expect( one.isBefore( root ) ).toBe( false );
		} );

		it( 'should return false if the same element is given', () => {
			expect( one.isBefore( one ) ).toBe( false );
		} );

		it( 'should return false if elements are in different roots', () => {
			const otherRoot = new ViewElement( document, 'root' );
			const otherElement = new ViewElement( document, 'element' );

			otherRoot._appendChild( otherElement );

			expect( otherElement.isBefore( three ) ).toBe( false );
		} );
	} );

	describe( 'isAfter()', () => {
		// Model is: <root><one></one><two>ba<img></img>r</two><three></three>
		it( 'should return true if the element is after given element', () => {
			expect( two.isAfter( one ) ).toBe( true );
			expect( img.isAfter( one ) ).toBe( true );

			expect( charB.isAfter( two ) ).toBe( true );
			expect( charR.isAfter( two ) ).toBe( true );
			expect( three.isAfter( two ) ).toBe( true );

			expect( one.isAfter( root ) ).toBe( true );
		} );

		it( 'should return false if the element is before given element', () => {
			expect( one.isAfter( two ) ).toBe( false );
			expect( one.isAfter( img ) ).toBe( false );

			expect( two.isAfter( charB ) ).toBe( false );
			expect( two.isAfter( charR ) ).toBe( false );
			expect( two.isAfter( three ) ).toBe( false );

			expect( root.isAfter( one ) ).toBe( false );
		} );

		it( 'should return false if the same element is given', () => {
			expect( one.isAfter( one ) ).toBe( false );
		} );

		it( 'should return false if elements are in different roots', () => {
			const otherRoot = new ViewElement( document, 'root' );
			const otherElement = new ViewElement( document, 'element' );

			otherRoot._appendChild( otherElement );

			expect( three.isAfter( otherElement ) ).toBe( false );
		} );
	} );

	describe( 'isAttached()', () => {
		it( 'returns false for a fresh node', () => {
			const char = new ViewText( document, 'x' );
			const el = new ViewElement( document, 'one' );

			expect( char.isAttached() ).toBe( false );
			expect( el.isAttached() ).toBe( false );
		} );

		it( 'returns true for the root element', () => {
			const root = new ViewRootEditableElement( document, 'div' );

			expect( root.isAttached() ).toBe( true );
		} );

		it( 'returns false for a node attached to a document fragment', () => {
			const foo = new ViewText( document, 'foo' );
			new ViewDocumentFragment( document, [ foo ] ); // eslint-disable-line no-new

			expect( foo.isAttached() ).toBe( false );
		} );
	} );

	describe( '_remove()', () => {
		it( 'should remove node from its parent', () => {
			const char = new ViewText( document, 'a' );
			const parent = new ViewElement( document, 'p', null, [ char ] );
			char._remove();

			expect( parent.getChildIndex( char ) ).toBe( -1 );
		} );

		it( 'uses parent._removeChildren method', () => {
			const char = new ViewText( document, 'a' );
			const parent = new ViewElement( document, 'p', null, [ char ] );
			const _removeChildrenSpy = vi.spyOn( parent, '_removeChildren' );
			const index = char.index;
			char._remove();
			expect( _removeChildrenSpy ).toHaveBeenCalledOnce();
			expect( _removeChildrenSpy ).toHaveBeenCalledWith( index );
			vi.restoreAllMocks();
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should prevent circular reference when stringifying a node', () => {
			const char = new ViewText( document, 'a' );
			const parent = new ViewElement( document, 'p', null );
			parent._appendChild( char );

			vi.spyOn( char, 'document', 'get' ).mockReturnValue( 'view.Document()' );

			const json = JSON.stringify( char );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				data: 'a',
				path: [ 0 ],
				type: 'Text'
			} );

			vi.restoreAllMocks();
		} );

		it( 'should provide root name if node is attached', () => {
			const text = new ViewText( document, 'foo' );
			const paragraph = new ViewElement( document, 'p', null );
			const root = new ViewRootEditableElement( document, 'div' );
			paragraph._appendChild( text );
			root._appendChild( paragraph );

			const json = JSON.stringify( text );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				data: 'foo',
				path: [ 0, 0 ],
				root: 'main',
				type: 'Text'
			} );
		} );

		it( 'should provide path to node', () => {
			const text = new ViewText( document, 'foo' );
			const strong = new ViewAttributeElement( document, 'strong', null, new ViewText( document, 'bar' ) );
			const paragraph = new ViewContainerElement( document, 'p', null );
			const root = new ViewRootEditableElement( document, 'div' );
			paragraph._appendChild( text );
			paragraph._appendChild( strong );
			root._appendChild( paragraph );

			const json = JSON.stringify( strong.getChild( 0 ) );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				data: 'bar',
				path: [ 0, 1, 0 ],
				root: 'main',
				type: 'Text'
			} );
		} );
	} );

	describe( 'change event', () => {
		let root, text, img, rootChangeSpy;

		beforeAll( () => {
			rootChangeSpy = vi.fn();
		} );

		beforeEach( () => {
			text = new ViewText( document, 'foo' );
			img = new ViewElement( document, 'img', { 'src': 'img.png' } );

			root = new ViewElement( document, 'p', { renderer: { markToSync: rootChangeSpy } } );
			root._appendChild( [ text, img ] );

			root.on( 'change:children', ( evt, node ) => rootChangeSpy( 'children', node ) );
			root.on( 'change:attributes', ( evt, node ) => rootChangeSpy( 'attributes', node ) );
			root.on( 'change:text', ( evt, node ) => rootChangeSpy( 'text', node ) );

			rootChangeSpy.mockClear();
		} );

		it( 'should be fired on the node', () => {
			const imgChangeSpy = vi.fn();

			img.on( 'change:attributes', ( evt, node ) => {
				imgChangeSpy( 'attributes', node );
			} );

			img._setAttribute( 'width', 100 );

			expect( imgChangeSpy ).toHaveBeenCalledOnce();
			expect( imgChangeSpy ).toHaveBeenCalledWith( 'attributes', img );
		} );

		it( 'should be fired on the parent', () => {
			img._setAttribute( 'width', 100 );

			expect( rootChangeSpy ).toHaveBeenCalledOnce();
			expect( rootChangeSpy ).toHaveBeenCalledWith( 'attributes', img );
		} );

		describe( '_setAttribute()', () => {
			it( 'should fire change event', () => {
				img._setAttribute( 'width', 100 );

				expect( rootChangeSpy ).toHaveBeenCalledOnce();
				expect( rootChangeSpy ).toHaveBeenCalledWith( 'attributes', img );
			} );
		} );

		describe( '_removeAttribute()', () => {
			it( 'should fire change event', () => {
				img._removeAttribute( 'src' );

				expect( rootChangeSpy ).toHaveBeenCalledOnce();
				expect( rootChangeSpy ).toHaveBeenCalledWith( 'attributes', img );
			} );
		} );

		describe( '_insertChild()', () => {
			it( 'should fire change event', () => {
				root._insertChild( 1, new ViewElement( document, 'img' ) );

				expect( rootChangeSpy ).toHaveBeenCalledOnce();
				expect( rootChangeSpy ).toHaveBeenCalledWith( 'children', root );
			} );
		} );

		describe( '_appendChild()', () => {
			it( 'should fire change event', () => {
				root._appendChild( new ViewElement( document, 'img' ) );

				expect( rootChangeSpy ).toHaveBeenCalledOnce();
				expect( rootChangeSpy ).toHaveBeenCalledWith( 'children', root );
			} );
		} );

		describe( '_removeChildren()', () => {
			it( 'should fire change event', () => {
				root._removeChildren( 1, 1 );

				expect( rootChangeSpy ).toHaveBeenCalledOnce();
				expect( rootChangeSpy ).toHaveBeenCalledWith( 'children', root );
			} );
		} );

		describe( 'setText', () => {
			it( 'should fire change event', () => {
				text._data = 'bar';

				expect( rootChangeSpy ).toHaveBeenCalledOnce();
				expect( rootChangeSpy ).toHaveBeenCalledWith( 'text', text );
			} );
		} );
	} );
} );
