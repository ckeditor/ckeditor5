/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../src/model/model';
import DocumentFragment from '../../src/model/documentfragment';
import Node from '../../src/model/node';
import Element from '../../src/model/element';
import Text from '../../src/model/text';
import RootElement from '../../src/model/rootelement';
import count from '@ckeditor/ckeditor5-utils/src/count';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';

describe( 'Node', () => {
	let doc, root, node,
		one, two, three,
		textBA, textR, img;

	beforeEach( () => {
		const model = new Model();

		node = new Node();

		one = new Element( 'one' );
		two = new Element( 'two', null, [ new Text( 'ba' ), new Element( 'img' ), new Text( 'r' ) ] );
		textBA = two.getChild( 0 );
		img = two.getChild( 1 );
		textR = two.getChild( 2 );
		three = new Element( 'three' );

		doc = model.document;
		root = doc.createRoot();
		root._appendChild( [ one, two, three ] );
	} );

	describe( 'should have a correct property', () => {
		it( 'root', () => {
			expect( root ).to.have.property( 'root' ).that.equals( root );

			expect( one ).to.have.property( 'root' ).that.equals( root );
			expect( two ).to.have.property( 'root' ).that.equals( root );
			expect( three ).to.have.property( 'root' ).that.equals( root );

			expect( textBA ).to.have.property( 'root' ).that.equals( root );
			expect( img ).to.have.property( 'root' ).that.equals( root );
			expect( textR ).to.have.property( 'root' ).that.equals( root );

			expect( node ).to.have.property( 'root' ).that.equals( node );
		} );

		it( 'nextSibling', () => {
			expect( root ).to.have.property( 'nextSibling' ).that.is.null;

			expect( one ).to.have.property( 'nextSibling' ).that.equals( two );
			expect( two ).to.have.property( 'nextSibling' ).that.equals( three );
			expect( three ).to.have.property( 'nextSibling' ).that.is.null;

			expect( textBA ).to.have.property( 'nextSibling' ).that.deep.equals( img );
			expect( img ).to.have.property( 'nextSibling' ).that.deep.equals( textR );
			expect( textR ).to.have.property( 'nextSibling' ).that.is.null;

			expect( node ).to.have.property( 'nextSibling' ).that.is.null;
		} );

		it( 'previousSibling', () => {
			expect( root ).to.have.property( 'previousSibling' ).that.is.null;

			expect( one ).to.have.property( 'previousSibling' ).that.is.null;
			expect( two ).to.have.property( 'previousSibling' ).that.equals( one );
			expect( three ).to.have.property( 'previousSibling' ).that.equals( two );

			expect( textBA ).to.have.property( 'previousSibling' ).that.is.null;
			expect( img ).to.have.property( 'previousSibling' ).that.deep.equals( textBA );
			expect( textR ).to.have.property( 'previousSibling' ).that.deep.equals( img );

			expect( node ).to.have.property( 'previousSibling' ).that.is.null;
		} );
	} );

	describe( 'constructor()', () => {
		it( 'should create empty attribute list if no parameters were passed', () => {
			expect( count( node.getAttributes() ) ).to.equal( 0 );
		} );

		it( 'should initialize attribute list with passed attributes', () => {
			const foo = new Node( { foo: true, bar: false } );

			expect( count( foo.getAttributes() ) ).to.equal( 2 );
			expect( foo.getAttribute( 'foo' ) ).to.equal( true );
			expect( foo.getAttribute( 'bar' ) ).to.equal( false );
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

			expect( textBA.index ).to.equal( 0 );
			expect( img.index ).to.equal( 1 );
			expect( textR.index ).to.equal( 2 );
		} );

		it( 'should throw an error if parent does not contain element', () => {
			node.parent = new Element( 'parent' );

			expectToThrowCKEditorError( () => {
				node.index;
			}, /model-node-not-found-in-parent/, node.parent );
		} );
	} );

	describe( '_clone()', () => {
		it( 'should return a copy of cloned node', () => {
			const node = new Node( { foo: 'bar' } );
			const copy = node._clone();

			expect( copy ).not.to.equal( node );
			expect( Array.from( copy.getAttributes() ) ).to.deep.equal( Array.from( node.getAttributes() ) );
		} );
	} );

	describe( '_remove()', () => {
		it( 'should remove node from it\'s parent', () => {
			const element = new Element( 'p' );
			element._appendChild( node );

			node._remove();

			expect( element.childCount ).to.equal( 0 );
			expect( node.parent ).to.be.null;
		} );

		it( 'should throw if node does not have a parent', () => {
			expect( () => {
				node._remove();
			} ).to.throw;
		} );
	} );

	describe( 'is()', () => {
		it( 'should return true for node', () => {
			expect( node.is( 'node' ) ).to.be.true;
			expect( node.is( 'model:node' ) ).to.be.true;
		} );

		it( 'should return false for incorrect values', () => {
			expect( node.is( 'model' ) ).to.be.false;
			expect( node.is( 'model:text' ) ).to.be.false;
			expect( node.is( 'text' ) ).to.be.false;
			expect( node.is( 'element', 'paragraph' ) ).to.be.false;
		} );
	} );

	describe( 'startOffset', () => {
		it( 'should return null if the parent is null', () => {
			expect( root.startOffset ).to.be.null;
		} );

		it( 'should return offset in the parent', () => {
			expect( one.startOffset ).to.equal( 0 );
			expect( two.startOffset ).to.equal( 1 );
			expect( three.startOffset ).to.equal( 2 );

			expect( textBA.startOffset ).to.equal( 0 );
			expect( img.startOffset ).to.equal( 2 );
			expect( textR.startOffset ).to.equal( 3 );
		} );

		it( 'should throw an error if parent does not contain element', () => {
			node.parent = new Element( 'parent' );

			expectToThrowCKEditorError( () => {
				node.startOffset;
			}, /model-node-not-found-in-parent/, node.parent );
		} );
	} );

	describe( 'endOffset', () => {
		it( 'should return null if the parent is null', () => {
			expect( root.endOffset ).to.be.null;
		} );

		it( 'should return offset at which the node ends', () => {
			expect( one.endOffset ).to.equal( 1 );
			expect( two.endOffset ).to.equal( 2 );
			expect( three.endOffset ).to.equal( 3 );

			expect( textBA.endOffset ).to.equal( 2 );
			expect( img.endOffset ).to.equal( 3 );
			expect( textR.endOffset ).to.equal( 4 );
		} );
	} );

	describe( 'getPath()', () => {
		it( 'should return proper path', () => {
			expect( root.getPath() ).to.deep.equal( [] );

			expect( one.getPath() ).to.deep.equal( [ 0 ] );
			expect( two.getPath() ).to.deep.equal( [ 1 ] );
			expect( three.getPath() ).to.deep.equal( [ 2 ] );

			expect( textBA.getPath() ).to.deep.equal( [ 1, 0 ] );
			expect( img.getPath() ).to.deep.equal( [ 1, 2 ] );
			expect( textR.getPath() ).to.deep.equal( [ 1, 3 ] );
		} );
	} );

	describe( 'getAncestors()', () => {
		it( 'should return proper array of ancestor nodes', () => {
			expect( root.getAncestors() ).to.deep.equal( [] );
			expect( two.getAncestors() ).to.deep.equal( [ root ] );
			expect( textBA.getAncestors() ).to.deep.equal( [ root, two ] );
		} );

		it( 'should include itself if includeSelf option is set to true', () => {
			expect( root.getAncestors( { includeSelf: true } ) ).to.deep.equal( [ root ] );
			expect( two.getAncestors( { includeSelf: true } ) ).to.deep.equal( [ root, two ] );
			expect( textBA.getAncestors( { includeSelf: true } ) ).to.deep.equal( [ root, two, textBA ] );
			expect( img.getAncestors( { includeSelf: true } ) ).to.deep.equal( [ root, two, img ] );
			expect( textR.getAncestors( { includeSelf: true } ) ).to.deep.equal( [ root, two, textR ] );
		} );

		it( 'should reverse order if parentFirst option is set to true', () => {
			expect( root.getAncestors( { includeSelf: true, parentFirst: true } ) ).to.deep.equal( [ root ] );
			expect( two.getAncestors( { includeSelf: true, parentFirst: true } ) ).to.deep.equal( [ two, root ] );
			expect( textBA.getAncestors( { includeSelf: true, parentFirst: true } ) ).to.deep.equal( [ textBA, two, root ] );
			expect( img.getAncestors( { includeSelf: true, parentFirst: true } ) ).to.deep.equal( [ img, two, root ] );
			expect( textR.getAncestors( { includeSelf: true, parentFirst: true } ) ).to.deep.equal( [ textR, two, root ] );
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
			const detached = new Element( 'foo' );

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
			expect( img.getCommonAncestor( textBA ), 1 ).to.equal( two );
			expect( textR.getCommonAncestor( textBA ), 2 ).to.equal( two );

			expect( img.getCommonAncestor( textBA, { includeSelf: true } ), 3 ).to.equal( two );
			expect( textR.getCommonAncestor( textBA, { includeSelf: true } ), 4 ).to.equal( two );
		} );

		it( 'should return proper element for nodes in different branches and on different levels', () => {
			const foo = new Text( 'foo' );
			const bar = new Text( 'bar' );
			const bom = new Text( 'bom' );
			const d = new Element( 'd', null, [ bar ] );
			const c = new Element( 'c', null, [ foo, d ] );
			const b = new Element( 'b', null, [ c ] );
			const e = new Element( 'e', null, [ bom ] );
			const a = new Element( 'a', null, [ b, e ] );

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
			const foo = new Text( 'foo' );
			const bar = new Text( 'bar' );
			const df = new DocumentFragment( [ foo, bar ] );

			expect( foo.getCommonAncestor( bar ) ).to.equal( df );
		} );
	} );

	describe( 'isBefore()', () => {
		// Model is: <root><one></one><two>ba<img></img>r</two><three></three>
		it( 'should return true if the element is before given element', () => {
			expect( one.isBefore( two ) ).to.be.true;
			expect( one.isBefore( img ) ).to.be.true;

			expect( two.isBefore( textBA ) ).to.be.true;
			expect( two.isBefore( textR ) ).to.be.true;
			expect( two.isBefore( three ) ).to.be.true;

			expect( root.isBefore( one ) ).to.be.true;
		} );

		it( 'should return false if the element is after given element', () => {
			expect( two.isBefore( one ) ).to.be.false;
			expect( img.isBefore( one ) ).to.be.false;

			expect( textBA.isBefore( two ) ).to.be.false;
			expect( textR.isBefore( two ) ).to.be.false;
			expect( three.isBefore( two ) ).to.be.false;

			expect( one.isBefore( root ) ).to.be.false;
		} );

		it( 'should return false if the same element is given', () => {
			expect( one.isBefore( one ) ).to.be.false;
		} );

		it( 'should return false if elements are in different roots', () => {
			const otherRoot = new Element( 'root' );
			const otherElement = new Element( 'element' );

			otherRoot._appendChild( otherElement );

			expect( otherElement.isBefore( three ) ).to.be.false;
		} );
	} );

	describe( 'isAfter()', () => {
		// Model is: <root><one></one><two>ba<img></img>r</two><three></three>
		it( 'should return true if the element is after given element', () => {
			expect( two.isAfter( one ) ).to.be.true;
			expect( img.isAfter( one ) ).to.be.true;

			expect( textBA.isAfter( two ) ).to.be.true;
			expect( textR.isAfter( two ) ).to.be.true;
			expect( three.isAfter( two ) ).to.be.true;

			expect( one.isAfter( root ) ).to.be.true;
		} );

		it( 'should return false if the element is before given element', () => {
			expect( one.isAfter( two ) ).to.be.false;
			expect( one.isAfter( img ) ).to.be.false;

			expect( two.isAfter( textBA ) ).to.be.false;
			expect( two.isAfter( textR ) ).to.be.false;
			expect( two.isAfter( three ) ).to.be.false;

			expect( root.isAfter( one ) ).to.be.false;
		} );

		it( 'should return false if the same element is given', () => {
			expect( one.isAfter( one ) ).to.be.false;
		} );

		it( 'should return false if elements are in different roots', () => {
			const otherRoot = new Element( 'root' );
			const otherElement = new Element( 'element' );

			otherRoot._appendChild( otherElement );

			expect( three.isAfter( otherElement ) ).to.be.false;
		} );
	} );

	describe( 'isAttached()', () => {
		it( 'returns false for a fresh node', () => {
			const char = new Text( 'x' );
			const el = new Element( 'one' );

			expect( char.isAttached() ).to.equal( false );
			expect( el.isAttached() ).to.equal( false );
		} );

		it( 'returns true for the root element', () => {
			const model = new Model();
			const root = new RootElement( model.document, 'root' );

			expect( root.isAttached() ).to.equal( true );
		} );

		it( 'returns false for a node attached to a document fragment', () => {
			const foo = new Text( 'foo' );
			new DocumentFragment( [ foo ] ); // eslint-disable-line no-new

			expect( foo.isAttached() ).to.equal( false );
		} );

		it( 'returns true for a node moved to graveyard', () => {
			return ModelTestEditor.create()
				.then( editor => {
					const model = editor.model;
					const root = model.document.getRoot();

					// Allow "paragraph" element to be added as a child in block elements.
					model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

					const node = model.change( writer => writer.createElement( 'paragraph' ) );

					expect( node.isAttached() ).to.equal( false );

					model.change( writer => writer.append( node, root ) );

					expect( node.isAttached() ).to.equal( true );

					model.change( writer => writer.remove( node ) );

					expect( node.isAttached() ).to.equal( true );

					return editor.destroy();
				} );
		} );
	} );

	describe( 'attributes interface', () => {
		const node = new Node( { foo: 'bar' } );

		describe( 'hasAttribute', () => {
			it( 'should return true if element contains attribute with given key', () => {
				expect( node.hasAttribute( 'foo' ) ).to.be.true;
			} );

			it( 'should return false if element does not contain attribute with given key', () => {
				expect( node.hasAttribute( 'bar' ) ).to.be.false;
			} );
		} );

		describe( 'getAttribute', () => {
			it( 'should return attribute value for given key if element contains given attribute', () => {
				expect( node.getAttribute( 'foo' ) ).to.equal( 'bar' );
			} );

			it( 'should return undefined if element does not contain given attribute', () => {
				expect( node.getAttribute( 'bar' ) ).to.be.undefined;
			} );
		} );

		describe( 'getAttributes', () => {
			it( 'should return an iterator that iterates over all attributes set on the element', () => {
				expect( Array.from( node.getAttributes() ) ).to.deep.equal( [ [ 'foo', 'bar' ] ] );
			} );
		} );

		describe( '_setAttribute', () => {
			it( 'should set given attribute on the element', () => {
				node._setAttribute( 'foo', 'bar' );

				expect( node.getAttribute( 'foo' ) ).to.equal( 'bar' );
			} );
		} );

		describe( '_setAttributesTo', () => {
			it( 'should remove all attributes set on element and set the given ones', () => {
				node._setAttribute( 'abc', 'xyz' );
				node._setAttributesTo( { foo: 'bar' } );

				expect( node.getAttribute( 'foo' ) ).to.equal( 'bar' );
				expect( node.getAttribute( 'abc' ) ).to.be.undefined;
			} );
		} );

		describe( '_removeAttribute', () => {
			it( 'should remove attribute set on the element and return true', () => {
				node._setAttribute( 'foo', 'bar' );
				const result = node._removeAttribute( 'foo' );

				expect( node.getAttribute( 'foo' ) ).to.be.undefined;
				expect( result ).to.be.true;
			} );

			it( 'should return false if element does not contain given attribute', () => {
				const result = node._removeAttribute( 'foo' );

				expect( result ).to.be.false;
			} );
		} );

		describe( '_clearAttributes', () => {
			it( 'should remove all attributes from the element', () => {
				node._setAttribute( 'foo', 'bar' );
				node._setAttribute( 'abc', 'xyz' );

				node._clearAttributes();

				expect( node.getAttribute( 'foo' ) ).to.be.undefined;
				expect( node.getAttribute( 'abc' ) ).to.be.undefined;
			} );
		} );
	} );
} );
