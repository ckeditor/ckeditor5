/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

import Document from '/ckeditor5/engine/model/document.js';
import DocumentFragment from '/ckeditor5/engine/model/documentfragment.js';
import Node from '/ckeditor5/engine/model/node.js';
import Element from '/ckeditor5/engine/model/element.js';
import Text from '/ckeditor5/engine/model/text.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import count from '/ckeditor5/utils/count.js';

describe( 'Node', () => {
	let doc, root, node;
	let one, two, three;
	let textBA, textR, img;

	before( () => {
		node = new Node();

		one = new Element( 'one' );
		two = new Element( 'two', null, [ new Text( 'ba' ), new Element( 'img' ), new Text( 'r' ) ] );
		textBA = two.getChild( 0 );
		img = two.getChild( 1 );
		textR = two.getChild( 2 );
		three = new Element( 'three' );

		doc = new Document();
		root = doc.createRoot();
		root.appendChildren( [ one, two, three ] );
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

		it( 'document', () => {
			expect( root ).to.have.property( 'document' ).that.equals( doc );

			expect( one ).to.have.property( 'document' ).that.equals( doc );
			expect( two ).to.have.property( 'document' ).that.equals( doc );
			expect( three ).to.have.property( 'document' ).that.equals( doc );

			expect( textBA ).to.have.property( 'document' ).that.equals( doc );
			expect( img ).to.have.property( 'document' ).that.equals( doc );
			expect( textR ).to.have.property( 'document' ).that.equals( doc );

			expect( node ).to.have.property( 'document' ).that.is.null;

			// DocumentFragment does not have document property, so node's document property should be null.
			let docFrag = new DocumentFragment();
			docFrag.appendChildren( node );
			expect( node ).to.have.property( 'document' ).that.is.null;
		} );
	} );

	describe( 'constructor', () => {
		it( 'should create empty attribute list if no parameters were passed', () => {
			expect( count( node.getAttributes() ) ).to.equal( 0 );
		} );

		it( 'should initialize attribute list with passed attributes', () => {
			let foo = new Node( { foo: true, bar: false } );

			expect( count( foo.getAttributes() ) ).to.equal( 2 );
			expect( foo.getAttribute( 'foo' ) ).to.equal( true );
			expect( foo.getAttribute( 'bar' ) ).to.equal( false );
		} );
	} );

	describe( 'getIndex', () => {
		it( 'should return null if the parent is null', () => {
			expect( root.getIndex() ).to.be.null;
		} );

		it( 'should return index in the parent', () => {
			expect( one.getIndex() ).to.equal( 0 );
			expect( two.getIndex() ).to.equal( 1 );
			expect( three.getIndex() ).to.equal( 2 );

			expect( textBA.getIndex() ).to.equal( 0 );
			expect( img.getIndex() ).to.equal( 1 );
			expect( textR.getIndex() ).to.equal( 2 );
		} );

		it( 'should throw an error if parent does not contain element', () => {
			node.parent = new Element( 'parent' );

			expect(
				() => {
					node.getIndex();
				}
			).to.throw( CKEditorError, /node-not-found-in-parent/ );
		} );
	} );

	describe( 'clone', () => {
		it( 'should return a copy of cloned node', () => {
			let node = new Node( { foo: 'bar' } );
			let copy = node.clone();

			expect( copy ).not.to.equal( node );
			expect( Array.from( copy.getAttributes() ) ).to.deep.equal( Array.from( node.getAttributes() ) );
		} );
	} );

	describe( 'remove', () => {
		it( 'should remove node from it\'s parent', () => {
			let element = new Element( 'p' );
			element.appendChildren( node );

			node.remove();

			expect( element.getChildCount() ).to.equal( 0 );
			expect( node.parent ).to.be.null;
		} );

		it( 'should throw if node does not have a parent', () => {
			expect( () => {
				node.remove();
			} ).to.throw;
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

			expect(
				() => {
					node.startOffset;
				}
			).to.throw( CKEditorError, /node-not-found-in-parent/ );
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

	describe( 'getPath', () => {
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

	describe( 'attributes interface', () => {
		let node = new Node( { foo: 'bar' } );

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

		describe( 'setAttribute', () => {
			it( 'should set given attribute on the element', () => {
				node.setAttribute( 'foo', 'bar' );

				expect( node.getAttribute( 'foo' ) ).to.equal( 'bar' );
			} );
		} );

		describe( 'setAttributesTo', () => {
			it( 'should remove all attributes set on element and set the given ones', () => {
				node.setAttribute( 'abc', 'xyz' );
				node.setAttributesTo( { foo: 'bar' } );

				expect( node.getAttribute( 'foo' ) ).to.equal( 'bar' );
				expect( node.getAttribute( 'abc' ) ).to.be.undefined;
			} );
		} );

		describe( 'removeAttribute', () => {
			it( 'should remove attribute set on the element and return true', () => {
				node.setAttribute( 'foo', 'bar' );
				let result = node.removeAttribute( 'foo' );

				expect( node.getAttribute( 'foo' ) ).to.be.undefined;
				expect( result ).to.be.true;
			} );

			it( 'should return false if element does not contain given attribute', () => {
				let result = node.removeAttribute( 'foo' );

				expect( result ).to.be.false;
			} );
		} );

		describe( 'clearAttributes', () => {
			it( 'should remove all attributes from the element', () => {
				node.setAttribute( 'foo', 'bar' );
				node.setAttribute( 'abc', 'xyz' );

				node.clearAttributes();

				expect( node.getAttribute( 'foo' ) ).to.be.undefined;
				expect( node.getAttribute( 'abc' ) ).to.be.undefined;
			} );
		} );
	} );
} );
