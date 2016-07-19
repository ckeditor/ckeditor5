/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

'use strict';

import Node from '/ckeditor5/engine/model/node.js';
import Element from '/ckeditor5/engine/model/element.js';
import Text from '/ckeditor5/engine/model/text.js';
import { jsonParseStringify } from '/tests/engine/model/_utils/utils.js';
import count from '/ckeditor5/utils/count.js';

describe( 'Element', () => {
	describe( 'constructor', () => {
		it( 'should create empty element', () => {
			let element = new Element( 'elem' );

			expect( element ).to.be.an.instanceof( Node );
			expect( element ).to.have.property( 'name' ).that.equals( 'elem' );

			expect( count( element.getAttributes() ) ).to.equal( 0 );
			expect( count( element.getChildren() ) ).to.equal( 0 );
		} );

		it( 'should create element with attributes', () => {
			let element = new Element( 'elem', { foo: 'bar' } );

			expect( count( element.getAttributes() ) ).to.equal( 1 );
			expect( element.getAttribute( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should create element with children', () => {
			let element = new Element( 'elem', [], new Text( 'foo' ) );

			expect( element.getChildCount() ).to.equal( 1 );
			expect( element.getMaxOffset() ).to.equal( 3 );
			expect( element.getChild( 0 ).data ).to.equal( 'foo' );
		} );
	} );

	describe( 'clone', () => {
		it( 'should return an element with same name, attributes and same instances of children if clone was not deep', () => {
			let p = new Element( 'p' );
			let foo = new Text( 'foo' );

			let element = new Element( 'elem', { bold: true, italic: true }, [ p, foo ] );
			let copy = element.clone();

			expect( copy.name ).to.equal( 'elem' );
			expect( Array.from( copy.getAttributes() ) ).to.deep.equal( [ [ 'bold', true ], [ 'italic', true ] ] );
			expect( Array.from( copy.getChildren() ) ).to.deep.equal( [ p, foo ] );
		} );

		it( 'should clone children, if clone is deep', () => {
			let p = new Element( 'p' );
			let foo = new Text( 'foo' );

			let element = new Element( 'elem', { bold: true, italic: true }, [ p, foo ] );
			let copy = element.clone( true );

			expect( copy.name ).to.equal( 'elem' );
			expect( Array.from( copy.getAttributes() ) ).to.deep.equal( [ [ 'bold', true ], [ 'italic', true ] ] );
			expect( copy.getChildCount() ).to.equal( 2 );

			expect( copy.getChild( 0 ) ).not.to.equal( p );
			expect( copy.getChild( 1 ) ).not.to.equal( foo );

			expect( copy.getChild( 0 ).name ).to.equal( 'p' );
			expect( copy.getChild( 1 ).data ).to.equal( 'foo' );
		} );
	} );

	describe( 'insertChildren', () => {
		it( 'should add a child to the element', () => {
			let element = new Element( 'elem', [], new Text( 'xy' ) );
			element.insertChildren( 1, new Text( 'foo' ) );

			expect( element.getChildCount() ).to.equal( 2 );
			expect( element.getMaxOffset() ).to.equal( 5 );
			expect( element.getChild( 0 ).data ).to.equal( 'xy' );
			expect( element.getChild( 1 ).data ).to.equal( 'foo' );
		} );

		it( 'should add children to the element', () => {
			let element = new Element( 'elem' );
			element.insertChildren( 0, [ new Element( 'image' ), new Text( 'xy' ), new Element( 'list' ) ] );

			expect( element.getChildCount() ).to.equal( 3 );
			expect( element.getMaxOffset() ).to.equal( 4 );
			expect( element.getChild( 0 ).name ).to.equal( 'image' );
			expect( element.getChild( 1 ).data ).to.equal( 'xy' );
			expect( element.getChild( 2 ).name ).to.equal( 'list' );
		} );
	} );

	describe( 'appendChildren', () => {
		it( 'should use insertChildren to add children at the end of the element', () => {
			let element = new Element( 'elem', [], new Text( 'xy' ) );

			sinon.spy( element, 'insertChildren' );

			let text = new Text( 'foo' );
			element.appendChildren( text );

			expect( element.insertChildren.calledWithExactly( 0, text ) );
		} );
	} );

	describe( 'removeChildren', () => {
		it( 'should remove children from the element and return them as an array', () => {
			let element = new Element( 'elem', [], [ new Text( 'foobar' ), new Element( 'image' ) ] );
			let removed = element.removeChildren( 1, 1 );

			expect( element.getChildCount() ).to.equal( 1 );
			expect( element.getMaxOffset() ).to.equal( 6 );

			expect( element.getChild( 0 ).data ).to.equal( 'foobar' );

			expect( removed.length ).to.equal( 1 );
			expect( removed[ 0 ].name ).to.equal( 'image' );
		} );

		it( 'should remove one child when second parameter is not specified', () => {
			let element = new Element( 'element', [], [ new Text( 'foo' ), new Element( 'image' ) ] );
			let removed = element.removeChildren( 0 );

			expect( element.getChildCount() ).to.equal( 1 );
			expect( element.getMaxOffset() ).to.equal( 1 );
			expect( element.getChild( 0 ).name ).to.equal( 'image' );

			expect( removed.length ).to.equal( 1 );
			expect( removed[ 0 ].data ).to.equal( 'foo' );
		} );
	} );

	describe( 'getChildIndex', () => {
		it( 'should return child index', () => {
			let element = new Element( 'elem', [], [ new Element( 'p' ), new Text( 'bar' ), new Element( 'h' ) ] );
			let p = element.getChild( 0 );
			let bar = element.getChild( 1 );
			let h = element.getChild( 2 );

			expect( element.getChildIndex( p ) ).to.equal( 0 );
			expect( element.getChildIndex( bar ) ).to.equal( 1 );
			expect( element.getChildIndex( h ) ).to.equal( 2 );
		} );
	} );

	describe( 'getChildStartOffset', () => {
		it( 'should return child offset', () => {
			let element = new Element( 'elem', [], [ new Element( 'p' ), new Text( 'bar' ), new Element( 'h' ) ] );
			let p = element.getChild( 0 );
			let bar = element.getChild( 1 );
			let h = element.getChild( 2 );

			expect( element.getChildStartOffset( p ) ).to.equal( 0 );
			expect( element.getChildStartOffset( bar ) ).to.equal( 1 );
			expect( element.getChildStartOffset( h ) ).to.equal( 4 );
		} );
	} );

	describe( 'getChildCount', () => {
		it( 'should return number of children', () => {
			let element = new Element( 'elem', [], new Text( 'bar' ) );

			expect( element.getChildCount() ).to.equal( 1 );
		} );
	} );

	describe( 'getMaxOffset', () => {
		it( 'should return offset number after the last child', () => {
			let element = new Element( 'elem', [], [ new Element( 'p' ), new Text( 'bar' ), new Element( 'h' ) ] );

			expect( element.getMaxOffset() ).to.equal( 5 );
		} );
	} );

	describe( 'isEmpty', () => {
		it( 'checks whether element has no children', () => {
			expect( new Element( 'a' ).isEmpty() ).to.be.true;
			expect( new Element( 'a', null, new Text( 'x' ) ).isEmpty() ).to.be.false;
		} );
	} );

	describe( 'offsetToIndex', () => {
		let element;

		beforeEach( () => {
			element = new Element( 'elem', [], [ new Element( 'p' ), new Text( 'bar' ), new Element( 'h' ) ] );
		} );

		it( 'should return index of a node that occupies given offset in this element', () => {
			expect( element.offsetToIndex( 0 ) ).to.equal( 0 );
			expect( element.offsetToIndex( 1 ) ).to.equal( 1 );
			expect( element.offsetToIndex( 2 ) ).to.equal( 1 );
			expect( element.offsetToIndex( 3 ) ).to.equal( 1 );
			expect( element.offsetToIndex( 4 ) ).to.equal( 2 );
		} );

		it( 'should return 0 if offset is too low', () => {
			expect( element.offsetToIndex( -1 ) ).to.equal( 0 );
		} );

		it( 'should return element\'s child count if offset is too high', () => {
			expect( element.offsetToIndex( 5 ) ).to.equal( 3 );
			expect( element.offsetToIndex( 33 ) ).to.equal( 3 );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should serialize empty element', () => {
			let element = new Element( 'one' );

			expect( jsonParseStringify( element ) ).to.deep.equal( { name: 'one' } );
		} );

		it( 'should serialize element with attributes', () => {
			let element = new Element( 'one', { foo: true, bar: false } );

			expect( jsonParseStringify( element ) ).to.deep.equal( {
				attributes: [ [ 'foo', true ], [ 'bar', false ] ],
				name: 'one'
			} );
		} );

		it( 'should serialize node with children', () => {
			let img = new Element( 'img' );
			let one = new Element( 'one' );
			let two = new Element( 'two', null, [ new Text( 'ba' ), img, new Text( 'r' ) ] );
			let three = new Element( 'three' );

			let node = new Element( null, null, [ one, two, three ] );

			expect( jsonParseStringify( node ) ).to.deep.equal( {
				children: [
					{ name: 'one' },
					{
						children: [
							{ data: 'ba' },
							{ name: 'img' },
							{ data: 'r' }
						],
						name: 'two'
					},
					{ name: 'three' }
				],
				name: null
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create element without attributes', () => {
			const el = new Element( 'el' );

			let serialized = jsonParseStringify( el );

			let deserialized = Element.fromJSON( serialized );

			expect( deserialized.parent ).to.be.null;
			expect( deserialized.name ).to.equal( 'el' );
			expect( deserialized.getChildCount() ).to.equal( 0 );
		} );

		it( 'should create element with attributes', () => {
			const el = new Element( 'el', { foo: true } );

			let serialized = jsonParseStringify( el );

			let deserialized = Element.fromJSON( serialized );

			expect( deserialized.parent ).to.be.null;
			expect( deserialized.name ).to.equal( 'el' );
			expect( deserialized.getChildCount() ).to.equal( 0 );
			expect( deserialized.hasAttribute( 'foo' ) ).to.be.true;
			expect( deserialized.getAttribute( 'foo' ) ).to.be.true;
		} );

		it( 'should create element with children', () => {
			const p = new Element( 'p' );
			const text = new Text( 'foo' );
			const el = new Element( 'el', null, [ p, text ] );

			let serialized = jsonParseStringify( el );

			let deserialized = Element.fromJSON( serialized );

			expect( deserialized.parent ).to.be.null;
			expect( deserialized.name ).to.equal( 'el' );
			expect( deserialized.getChildCount() ).to.equal( 2 );

			expect( deserialized.getChild( 0 ).name ).to.equal( 'p' );
			expect( deserialized.getChild( 0 ).parent ).to.equal( deserialized );

			expect( deserialized.getChild( 1 ).data ).to.equal( 'foo' );
			expect( deserialized.getChild( 1 ).parent ).to.equal( deserialized );
		} );
	} );
} );
