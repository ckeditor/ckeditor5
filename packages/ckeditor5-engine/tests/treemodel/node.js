/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Element from '/ckeditor5/engine/treemodel/element.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import treeModelTestUtils from '/tests/engine/treemodel/_utils/utils.js';

describe( 'Node', () => {
	let root;
	let one, two, three;
	let charB, charA, charR, img;

	before( () => {
		img = new Element( 'img' );

		one = new Element( 'one' );
		two = new Element( 'two', null, [ 'b', 'a', img, 'r' ] );
		charB = two.getChild( 0 );
		charA = two.getChild( 1 );
		charR = two.getChild( 3 );
		three = new Element( 'three' );

		root = new Element( null, null, [ one, two, three ] );
	} );

	describe( 'should have a correct property', () => {
		it( 'depth', () => {
			expect( root ).to.have.property( 'depth' ).that.equals( 0 );

			expect( one ).to.have.property( 'depth' ).that.equals( 1 );
			expect( two ).to.have.property( 'depth' ).that.equals( 1 );
			expect( three ).to.have.property( 'depth' ).that.equals( 1 );

			expect( charB ).to.have.property( 'depth' ).that.equals( 2 );
			expect( charA ).to.have.property( 'depth' ).that.equals( 2 );
			expect( img ).to.have.property( 'depth' ).that.equals( 2 );
			expect( charR ).to.have.property( 'depth' ).that.equals( 2 );
		} );

		it( 'root', () => {
			expect( root ).to.have.property( 'root' ).that.equals( root );

			expect( one ).to.have.property( 'root' ).that.equals( root );
			expect( two ).to.have.property( 'root' ).that.equals( root );
			expect( three ).to.have.property( 'root' ).that.equals( root );

			expect( img ).to.have.property( 'root' ).that.equals( root );
		} );

		it( 'nextSibling', () => {
			expect( root ).to.have.property( 'nextSibling' ).that.is.null;

			expect( one ).to.have.property( 'nextSibling' ).that.equals( two );
			expect( two ).to.have.property( 'nextSibling' ).that.equals( three );
			expect( three ).to.have.property( 'nextSibling' ).that.is.null;

			expect( charB ).to.have.property( 'nextSibling' ).that.deep.equals( charA );
			expect( charA ).to.have.property( 'nextSibling' ).that.deep.equals( img );
			expect( img ).to.have.property( 'nextSibling' ).that.deep.equals( charR );
			expect( charR ).to.have.property( 'nextSibling' ).that.is.null;
		} );

		it( 'previousSibling', () => {
			expect( root ).to.have.property( 'previousSibling' ).that.is.expect;

			expect( one ).to.have.property( 'previousSibling' ).that.is.null;
			expect( two ).to.have.property( 'previousSibling' ).that.equals( one );
			expect( three ).to.have.property( 'previousSibling' ).that.equals( two );

			expect( charB ).to.have.property( 'previousSibling' ).that.is.null;
			expect( charA ).to.have.property( 'previousSibling' ).that.deep.equals( charB );
			expect( img ).to.have.property( 'previousSibling' ).that.deep.equals( charA );
			expect( charR ).to.have.property( 'previousSibling' ).that.deep.equals( img );
		} );
	} );

	describe( 'constructor', () => {
		it( 'should create empty attribute list if no parameters were passed', () => {
			let foo = new Element( 'foo' );

			expect( foo._attrs ).to.be.instanceof( Map );
			expect( foo._attrs.size ).to.equal( 0 );
		} );

		it( 'should initialize attribute list with passed attributes', () => {
			let attrs = { foo: true, bar: false };
			let foo = new Element( 'foo', attrs );

			expect( foo._attrs.size ).to.equal( 2 );
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

			expect( charB.getIndex() ).to.equal( 0 );
			expect( img.getIndex() ).to.equal( 2 );
			expect( charR.getIndex() ).to.equal( 3 );
		} );

		it( 'should throw an error if parent does not contains element', () => {
			let e = new Element( 'e' );
			let bar = new Element( 'bar', [], [] );

			e.parent = bar;

			expect(
				() => {
					e.getIndex();
				}
			).to.throw( CKEditorError, /node-not-found-in-parent/ );
		} );
	} );

	describe( 'getPath', () => {
		it( 'should return proper path', () => {
			expect( root.getPath() ).to.deep.equal( [] );

			expect( one.getPath() ).to.deep.equal( [ 0 ] );
			expect( two.getPath() ).to.deep.equal( [ 1 ] );
			expect( three.getPath() ).to.deep.equal( [ 2 ] );

			expect( charB.getPath() ).to.deep.equal( [ 1, 0 ] );
			expect( img.getPath() ).to.deep.equal( [ 1, 2 ] );
			expect( charR.getPath() ).to.deep.equal( [ 1, 3 ] );
		} );
	} );

	describe( 'attributes interface', () => {
		let node = new Element( 'p', { foo: 'bar' } );

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
	} );

	describe( 'toJSON', () => {
		it( 'should serialize empty node', () => {
			let node = new Element( 'one' );

			expect( treeModelTestUtils.jsonParseStringify( node ) ).to.deep.equal( {
				_attrs: [],
				_children: {
					_indexMap: [],
					_nodes: []
				},
				name: 'one'
			} );
		} );

		it( 'should serialize node with attributes', () => {
			let node = new Element( 'one', { foo: true, bar: false } );

			expect( treeModelTestUtils.jsonParseStringify( node ) ).to.deep.equal( {
				_attrs: [ [ 'foo', true ], [ 'bar', false ] ],
				_children: {
					_indexMap: [],
					_nodes: []
				},
				name: 'one'
			} );
		} );

		it( 'should serialize node with children', () => {
			expect( treeModelTestUtils.jsonParseStringify( root ) ).to.deep.equal( {
				_attrs: [],
				_children: {
					_indexMap: [ 0, 1, 2 ],
					_nodes: [
						{ _attrs: [], _children: { _indexMap: [], _nodes: [] }, name: 'one' },
						{
							_attrs: [],
							_children: {
								_indexMap: [ 0, 0, 1, 2 ],
								_nodes: [
									{ _attrs: [], text: 'ba' },
									{ _attrs: [], _children: { _indexMap: [], _nodes: [] }, name: 'img' },
									{ _attrs: [], text: 'r' }
								]
							},
							name: 'two'
						},
						{ _attrs: [], _children: { _indexMap: [], _nodes: [] }, name: 'three' }
					]
				},
				name: null
			} );
		} );
	} );
} );
