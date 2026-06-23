/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Model } from '../../src/model/model.js';
import { ModelDocumentFragment } from '../../src/model/documentfragment.js';
import { ModelNode } from '../../src/model/node.js';
import { ModelElement } from '../../src/model/element.js';
import { ModelText } from '../../src/model/text.js';
import { ModelRootElement } from '../../src/model/rootelement.js';
import { count } from '@ckeditor/ckeditor5-utils';
import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';

describe( 'Node', () => {
	let doc, root, node,
		one, two, three,
		textBA, textR, img;

	beforeEach( () => {
		const model = new Model();

		node = new ModelNode();

		one = new ModelElement( 'one' );
		two = new ModelElement( 'two', null, [ new ModelText( 'ba' ), new ModelElement( 'img' ), new ModelText( 'r' ) ] );
		textBA = two.getChild( 0 );
		img = two.getChild( 1 );
		textR = two.getChild( 2 );
		three = new ModelElement( 'three' );

		doc = model.document;
		root = doc.createRoot();
		root._appendChild( [ one, two, three ] );
	} );

	describe( 'should have a correct property', () => {
		it( 'root', () => {
			expect( root ).toHaveProperty( 'root', root );

			expect( one ).toHaveProperty( 'root', root );
			expect( two ).toHaveProperty( 'root', root );
			expect( three ).toHaveProperty( 'root', root );

			expect( textBA ).toHaveProperty( 'root', root );
			expect( img ).toHaveProperty( 'root', root );
			expect( textR ).toHaveProperty( 'root', root );

			expect( node ).toHaveProperty( 'root', node );
		} );

		it( 'nextSibling', () => {
			expect( root.nextSibling ).toBeNull();

			expect( one.nextSibling ).toBe( two );
			expect( two.nextSibling ).toBe( three );
			expect( three.nextSibling ).toBeNull();

			expect( textBA.nextSibling ).toEqual( img );
			expect( img.nextSibling ).toEqual( textR );
			expect( textR.nextSibling ).toBeNull();

			expect( node.nextSibling ).toBeNull();
		} );

		it( 'previousSibling', () => {
			expect( root.previousSibling ).toBeNull();

			expect( one.previousSibling ).toBeNull();
			expect( two.previousSibling ).toBe( one );
			expect( three.previousSibling ).toBe( two );

			expect( textBA.previousSibling ).toBeNull();
			expect( img.previousSibling ).toEqual( textBA );
			expect( textR.previousSibling ).toEqual( img );

			expect( node.previousSibling ).toBeNull();
		} );
	} );

	describe( 'constructor()', () => {
		it( 'should create empty attribute list if no parameters were passed', () => {
			expect( count( node.getAttributes() ) ).toBe( 0 );
		} );

		it( 'should initialize attribute list with passed attributes', () => {
			const foo = new ModelNode( { foo: true, bar: false } );

			expect( count( foo.getAttributes() ) ).toBe( 2 );
			expect( foo.getAttribute( 'foo' ) ).toBe( true );
			expect( foo.getAttribute( 'bar' ) ).toBe( false );
		} );
	} );

	describe( 'index', () => {
		it( 'should return null if not set', () => {
			const a = new ModelNode();

			expect( a.index ).toBe( null );
		} );

		it( 'should return _index value', () => {
			const a = new ModelNode();

			a._index = 2;

			expect( a.index ).toBe( 2 );
		} );
	} );

	describe( '_clone()', () => {
		it( 'should return a copy of cloned node', () => {
			const node = new ModelNode( { foo: 'bar' } );
			const copy = node._clone();

			expect( copy ).not.toBe( node );
			expect( Array.from( copy.getAttributes() ) ).toEqual( Array.from( node.getAttributes() ) );
		} );
	} );

	describe( '_remove()', () => {
		it( 'should remove node from it\'s parent', () => {
			const element = new ModelElement( 'p' );
			element._appendChild( node );

			node._remove();

			expect( element.childCount ).toBe( 0 );
			expect( node.parent ).toBeNull();
		} );

		it( 'should throw if node does not have a parent', () => {
			expect( () => {
				node._remove();
			} ).toThrow();
		} );
	} );

	describe( 'is()', () => {
		it( 'should return true for node', () => {
			expect( node.is( 'node' ) ).toBe( true );
			expect( node.is( 'model:node' ) ).toBe( true );
		} );

		it( 'should return false for incorrect values', () => {
			expect( node.is( 'model' ) ).toBe( false );
			expect( node.is( 'model:$text' ) ).toBe( false );
			expect( node.is( '$text' ) ).toBe( false );
			expect( node.is( 'element', 'paragraph' ) ).toBe( false );
		} );
	} );

	describe( 'startOffset', () => {
		it( 'should return null after node is created', () => {
			const a = new ModelNode();

			expect( a.startOffset ).toBe( null );
		} );

		it( 'should return _startOffset value', () => {
			const a = new ModelNode();
			a._startOffset = 7;

			expect( a.startOffset ).toBe( 7 );
		} );
	} );

	describe( 'endOffset', () => {
		it( 'should return null if start offset is null', () => {
			const a = new ModelNode();

			expect( a.endOffset ).toBe( null );
		} );

		it( 'should return offset at which the node ends', () => {
			class MyNode extends ModelNode {
				get offsetSize() {
					return 5;
				}
			}

			const a = new MyNode();

			a._startOffset = 2;

			expect( a.endOffset ).toBe( 7 );
		} );
	} );

	describe( 'getPath()', () => {
		it( 'should return proper path', () => {
			expect( root.getPath() ).toEqual( [] );

			expect( one.getPath() ).toEqual( [ 0 ] );
			expect( two.getPath() ).toEqual( [ 1 ] );
			expect( three.getPath() ).toEqual( [ 2 ] );

			expect( textBA.getPath() ).toEqual( [ 1, 0 ] );
			expect( img.getPath() ).toEqual( [ 1, 2 ] );
			expect( textR.getPath() ).toEqual( [ 1, 3 ] );
		} );
	} );

	describe( 'getAncestors()', () => {
		it( 'should return proper array of ancestor nodes', () => {
			expect( root.getAncestors() ).toEqual( [] );
			expect( two.getAncestors() ).toEqual( [ root ] );
			expect( textBA.getAncestors() ).toEqual( [ root, two ] );
		} );

		it( 'should include itself if includeSelf option is set to true', () => {
			expect( root.getAncestors( { includeSelf: true } ) ).toEqual( [ root ] );
			expect( two.getAncestors( { includeSelf: true } ) ).toEqual( [ root, two ] );
			expect( textBA.getAncestors( { includeSelf: true } ) ).toEqual( [ root, two, textBA ] );
			expect( img.getAncestors( { includeSelf: true } ) ).toEqual( [ root, two, img ] );
			expect( textR.getAncestors( { includeSelf: true } ) ).toEqual( [ root, two, textR ] );
		} );

		it( 'should reverse order if parentFirst option is set to true', () => {
			expect( root.getAncestors( { includeSelf: true, parentFirst: true } ) ).toEqual( [ root ] );
			expect( two.getAncestors( { includeSelf: true, parentFirst: true } ) ).toEqual( [ two, root ] );
			expect( textBA.getAncestors( { includeSelf: true, parentFirst: true } ) ).toEqual( [ textBA, two, root ] );
			expect( img.getAncestors( { includeSelf: true, parentFirst: true } ) ).toEqual( [ img, two, root ] );
			expect( textR.getAncestors( { includeSelf: true, parentFirst: true } ) ).toEqual( [ textR, two, root ] );
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
			const detached = new ModelElement( 'foo' );

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
			expect( img.getCommonAncestor( textBA ) ).toBe( two );
			expect( textR.getCommonAncestor( textBA ) ).toBe( two );

			expect( img.getCommonAncestor( textBA, { includeSelf: true } ) ).toBe( two );
			expect( textR.getCommonAncestor( textBA, { includeSelf: true } ) ).toBe( two );
		} );

		it( 'should return proper element for nodes in different branches and on different levels', () => {
			const foo = new ModelText( 'foo' );
			const bar = new ModelText( 'bar' );
			const bom = new ModelText( 'bom' );
			const d = new ModelElement( 'd', null, [ bar ] );
			const c = new ModelElement( 'c', null, [ foo, d ] );
			const b = new ModelElement( 'b', null, [ c ] );
			const e = new ModelElement( 'e', null, [ bom ] );
			const a = new ModelElement( 'a', null, [ b, e ] );

			// <a><b><c>foo<d>bar</d></c></b><e>bom</e></a>

			expect( bar.getCommonAncestor( foo ) ).toBe( c );
			expect( foo.getCommonAncestor( d ) ).toBe( c );
			expect( c.getCommonAncestor( b ) ).toBe( a );
			expect( bom.getCommonAncestor( d ) ).toBe( a );
			expect( b.getCommonAncestor( bom ) ).toBe( a );
			expect( b.getCommonAncestor( bar ) ).toBe( a );

			expect( bar.getCommonAncestor( foo, { includeSelf: true } ) ).toBe( c );
			expect( foo.getCommonAncestor( d, { includeSelf: true } ) ).toBe( c );
			expect( c.getCommonAncestor( b, { includeSelf: true } ) ).toBe( b );
			expect( bom.getCommonAncestor( d, { includeSelf: true } ) ).toBe( a );
			expect( b.getCommonAncestor( bom, { includeSelf: true } ) ).toBe( a );
			expect( b.getCommonAncestor( bar, { includeSelf: true } ) ).toBe( b );
		} );

		it( 'should return document fragment', () => {
			const foo = new ModelText( 'foo' );
			const bar = new ModelText( 'bar' );
			const df = new ModelDocumentFragment( [ foo, bar ] );

			expect( foo.getCommonAncestor( bar ) ).toBe( df );
		} );
	} );

	describe( 'isBefore()', () => {
		// Model is: <root><one></one><two>ba<img></img>r</two><three></three>
		it( 'should return true if the element is before given element', () => {
			expect( one.isBefore( two ) ).toBe( true );
			expect( one.isBefore( img ) ).toBe( true );

			expect( two.isBefore( textBA ) ).toBe( true );
			expect( two.isBefore( textR ) ).toBe( true );
			expect( two.isBefore( three ) ).toBe( true );

			expect( root.isBefore( one ) ).toBe( true );
		} );

		it( 'should return false if the element is after given element', () => {
			expect( two.isBefore( one ) ).toBe( false );
			expect( img.isBefore( one ) ).toBe( false );

			expect( textBA.isBefore( two ) ).toBe( false );
			expect( textR.isBefore( two ) ).toBe( false );
			expect( three.isBefore( two ) ).toBe( false );

			expect( one.isBefore( root ) ).toBe( false );
		} );

		it( 'should return false if the same element is given', () => {
			expect( one.isBefore( one ) ).toBe( false );
		} );

		it( 'should return false if elements are in different roots', () => {
			const otherRoot = new ModelElement( 'root' );
			const otherElement = new ModelElement( 'element' );

			otherRoot._appendChild( otherElement );

			expect( otherElement.isBefore( three ) ).toBe( false );
		} );
	} );

	describe( 'isAfter()', () => {
		// Model is: <root><one></one><two>ba<img></img>r</two><three></three>
		it( 'should return true if the element is after given element', () => {
			expect( two.isAfter( one ) ).toBe( true );
			expect( img.isAfter( one ) ).toBe( true );

			expect( textBA.isAfter( two ) ).toBe( true );
			expect( textR.isAfter( two ) ).toBe( true );
			expect( three.isAfter( two ) ).toBe( true );

			expect( one.isAfter( root ) ).toBe( true );
		} );

		it( 'should return false if the element is before given element', () => {
			expect( one.isAfter( two ) ).toBe( false );
			expect( one.isAfter( img ) ).toBe( false );

			expect( two.isAfter( textBA ) ).toBe( false );
			expect( two.isAfter( textR ) ).toBe( false );
			expect( two.isAfter( three ) ).toBe( false );

			expect( root.isAfter( one ) ).toBe( false );
		} );

		it( 'should return false if the same element is given', () => {
			expect( one.isAfter( one ) ).toBe( false );
		} );

		it( 'should return false if elements are in different roots', () => {
			const otherRoot = new ModelElement( 'root' );
			const otherElement = new ModelElement( 'element' );

			otherRoot._appendChild( otherElement );

			expect( three.isAfter( otherElement ) ).toBe( false );
		} );
	} );

	describe( 'isAttached()', () => {
		it( 'returns false for a fresh node', () => {
			const char = new ModelText( 'x' );
			const el = new ModelElement( 'one' );

			expect( char.isAttached() ).toBe( false );
			expect( el.isAttached() ).toBe( false );
		} );

		it( 'returns true for the root element', () => {
			const model = new Model();
			const root = new ModelRootElement( model.document, 'root' );

			expect( root.isAttached() ).toBe( true );
		} );

		it( 'returns false for a node attached to a document fragment', () => {
			const foo = new ModelText( 'foo' );
			new ModelDocumentFragment( [ foo ] ); // eslint-disable-line no-new

			expect( foo.isAttached() ).toBe( false );
		} );

		it( 'returns true for a node moved to graveyard', () => {
			return ModelTestEditor.create()
				.then( editor => {
					const model = editor.model;
					const root = model.document.getRoot();

					// Allow "paragraph" element to be added as a child in block elements.
					model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

					const node = model.change( writer => writer.createElement( 'paragraph' ) );

					expect( node.isAttached() ).toBe( false );

					model.change( writer => writer.append( node, root ) );

					expect( node.isAttached() ).toBe( true );

					model.change( writer => writer.remove( node ) );

					expect( node.isAttached() ).toBe( true );

					return editor.destroy();
				} );
		} );
	} );

	describe( 'attributes interface', () => {
		const node = new ModelNode( { foo: 'bar' } );

		describe( 'hasAttribute', () => {
			it( 'should return true if element contains attribute with given key', () => {
				expect( node.hasAttribute( 'foo' ) ).toBe( true );
			} );

			it( 'should return false if element does not contain attribute with given key', () => {
				expect( node.hasAttribute( 'bar' ) ).toBe( false );
			} );
		} );

		describe( 'getAttribute', () => {
			it( 'should return attribute value for given key if element contains given attribute', () => {
				expect( node.getAttribute( 'foo' ) ).toBe( 'bar' );
			} );

			it( 'should return undefined if element does not contain given attribute', () => {
				expect( node.getAttribute( 'bar' ) ).toBeUndefined();
			} );
		} );

		describe( 'getAttributes', () => {
			it( 'should return an iterator that iterates over all attributes set on the element', () => {
				expect( Array.from( node.getAttributes() ) ).toEqual( [ [ 'foo', 'bar' ] ] );
			} );
		} );

		describe( '_setAttribute', () => {
			it( 'should set given attribute on the element', () => {
				node._setAttribute( 'foo', 'bar' );

				expect( node.getAttribute( 'foo' ) ).toBe( 'bar' );
			} );
		} );

		describe( '_setAttributesTo', () => {
			it( 'should remove all attributes set on element and set the given ones', () => {
				node._setAttribute( 'abc', 'xyz' );
				node._setAttributesTo( { foo: 'bar' } );

				expect( node.getAttribute( 'foo' ) ).toBe( 'bar' );
				expect( node.getAttribute( 'abc' ) ).toBeUndefined();
			} );
		} );

		describe( '_removeAttribute', () => {
			it( 'should remove attribute set on the element and return true', () => {
				node._setAttribute( 'foo', 'bar' );
				const result = node._removeAttribute( 'foo' );

				expect( node.getAttribute( 'foo' ) ).toBeUndefined();
				expect( result ).toBe( true );
			} );

			it( 'should return false if element does not contain given attribute', () => {
				const result = node._removeAttribute( 'foo' );

				expect( result ).toBe( false );
			} );
		} );

		describe( '_clearAttributes', () => {
			it( 'should remove all attributes from the element', () => {
				node._setAttribute( 'foo', 'bar' );
				node._setAttribute( 'abc', 'xyz' );

				node._clearAttributes();

				expect( node.getAttribute( 'foo' ) ).toBeUndefined();
				expect( node.getAttribute( 'abc' ) ).toBeUndefined();
			} );
		} );
	} );
} );
