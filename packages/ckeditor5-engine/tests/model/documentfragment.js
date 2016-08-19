/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

import Element from '/ckeditor5/engine/model/element.js';
import Text from '/ckeditor5/engine/model/text.js';
import DocumentFragment from '/ckeditor5/engine/model/documentfragment.js';
import { jsonParseStringify } from '/tests/engine/model/_utils/utils.js';

describe( 'DocumentFragment', () => {
	describe( 'constructor', () => {
		it( 'should create empty document fragment', () => {
			let frag = new DocumentFragment();

			expect( frag.childCount ).to.equal( 0 );
			expect( frag.maxOffset ).to.equal( 0 );
		} );

		it( 'should create document fragment with children', () => {
			let frag = new DocumentFragment( [ new Text( 'xx' ), new Element( 'p' ), new Text( 'yy' ) ] );

			expect( frag.childCount ).to.equal( 3 );
			expect( frag.maxOffset ).to.equal( 5 );

			expect( frag.getChild( 0 ) ).to.have.property( 'data' ).that.equals( 'xx' );
			expect( frag.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'p' );
			expect( frag.getChild( 2 ) ).to.have.property( 'data' ).that.equals( 'yy' );
		} );

		it( 'should have root property, equal to itself', () => {
			let frag = new DocumentFragment();

			expect( frag ).to.have.property( 'root' ).that.equals( frag );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over document fragment\'s children', () => {
			let xx = new Text( 'xx' );
			let p = new Element( 'p' );
			let yy = new Text( 'yy' );
			let frag = new DocumentFragment( [ xx, p, yy ] );

			expect( Array.from( frag ) ).to.deep.equal( [ xx, p, yy ] );
		} );
	} );

	describe( 'getPath', () => {
		it( 'should return empty array', () => {
			let frag = new DocumentFragment( [ new Text( 'x' ), new Element( 'p' ), new Text( 'y' ) ] );

			expect( frag.getPath() ).to.deep.equal( [] );
		} );
	} );

	describe( 'isEmpty', () => {
		it( 'should return true if document fragment has no children', () => {
			let frag = new DocumentFragment();

			expect( frag.isEmpty ).to.be.true;
		} );

		it( 'should return false if document fragment has children', () => {
			let frag = new DocumentFragment( new Text( 'a' ) );

			expect( frag.isEmpty ).to.be.false;
		} );
	} );

	describe( 'offsetToIndex', () => {
		let frag;

		beforeEach( () => {
			frag = new Element( 'elem', [], [ new Element( 'p' ), new Text( 'bar' ), new Element( 'h' ) ] );
		} );

		it( 'should return index of a node that occupies given offset in this element', () => {
			expect( frag.offsetToIndex( 0 ) ).to.equal( 0 );
			expect( frag.offsetToIndex( 1 ) ).to.equal( 1 );
			expect( frag.offsetToIndex( 2 ) ).to.equal( 1 );
			expect( frag.offsetToIndex( 3 ) ).to.equal( 1 );
			expect( frag.offsetToIndex( 4 ) ).to.equal( 2 );
		} );

		it( 'should throw if given offset is too high or too low', () => {
			expect( () => {
				frag.offsetToIndex( -1 );
			} ).to.throwCKEditorError( /nodelist-offset-out-of-bounds/ );

			expect( () => {
				frag.offsetToIndex( 55 );
			} ).to.throwCKEditorError( /nodelist-offset-out-of-bounds/ );
		} );

		it( 'should return length if given offset is equal to maxOffset', () => {
			expect( frag.offsetToIndex( 5 ) ).to.equal( 3 );
		} );
	} );

	describe( 'insertChildren', () => {
		it( 'should add children to the document fragment', () => {
			let frag = new DocumentFragment( new Text( 'xy' ) );
			frag.insertChildren( 1, new Text( 'foo' ) );

			expect( frag.childCount ).to.equal( 2 );
			expect( frag.maxOffset ).to.equal( 5 );
			expect( frag.getChild( 0 ) ).to.have.property( 'data' ).that.equals( 'xy' );
			expect( frag.getChild( 1 ) ).to.have.property( 'data' ).that.equals( 'foo' );
		} );

		it( 'should accept strings and arrays', () => {
			let frag = new DocumentFragment();

			frag.insertChildren( 0, 'abc' );
			expect( frag.childCount ).to.equal( 1 );
			expect( frag.maxOffset ).to.equal( 3 );
			expect( frag.getChild( 0 ) ).to.have.property( 'data' ).that.equals( 'abc' );

			frag.removeChildren( 0, 1 );
			frag.insertChildren( 0, [ new Element( 'p' ), 'abc' ] );

			expect( frag.childCount ).to.equal( 2 );
			expect( frag.maxOffset ).to.equal( 4 );
			expect( frag.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'p' );
			expect( frag.getChild( 1 ) ).to.have.property( 'data' ).that.equals( 'abc' );
		} );
	} );

	describe( 'appendChildren', () => {
		it( 'should add children to the end of the element', () => {
			let frag = new DocumentFragment( new Text( 'xy' ) );
			frag.appendChildren( new Text( 'foo' ) );

			expect( frag.childCount ).to.equal( 2 );
			expect( frag.maxOffset ).to.equal( 5 );
			expect( frag.getChild( 0 ) ).to.have.property( 'data' ).that.equals( 'xy' );
			expect( frag.getChild( 1 ) ).to.have.property( 'data' ).that.equals( 'foo' );
		} );
	} );

	describe( 'removeChildren', () => {
		it( 'should remove children from the element and return them as an array', () => {
			let frag = new DocumentFragment( [ new Text( 'foobar' ), new Element( 'image' ) ] );
			let removed = frag.removeChildren( 1, 1 );

			expect( frag.childCount ).to.equal( 1 );
			expect( frag.maxOffset ).to.equal( 6 );

			expect( frag.getChild( 0 ) ).to.have.property( 'data' ).that.equals( 'foobar' );

			expect( removed.length ).to.equal( 1 );
			expect( removed[ 0 ].name ).to.equal( 'image' );
		} );

		it( 'should remove one child when second parameter is not specified', () => {
			let frag = new DocumentFragment( [ new Text( 'foo' ), new Element( 'image' ) ] );
			let removed = frag.removeChildren( 0 );

			expect( frag.childCount ).to.equal( 1 );
			expect( frag.maxOffset ).to.equal( 1 );
			expect( frag.getChild( 0 ).name ).to.equal( 'image' );

			expect( removed.length ).to.equal( 1 );
			expect( removed[ 0 ].data ).to.equal( 'foo' );
		} );
	} );

	describe( 'getChildIndex', () => {
		it( 'should return child index', () => {
			let frag = new DocumentFragment( [ new Element( 'p' ), new Text( 'bar' ), new Element( 'h' ) ] );
			let p = frag.getChild( 0 );
			let textBAR = frag.getChild( 1 );
			let h = frag.getChild( 2 );

			expect( frag.getChildIndex( p ) ).to.equal( 0 );
			expect( frag.getChildIndex( textBAR ) ).to.equal( 1 );
			expect( frag.getChildIndex( h ) ).to.equal( 2 );
		} );
	} );

	describe( 'getChildStartOffset', () => {
		it( 'should return child start offset', () => {
			let frag = new DocumentFragment( [ new Element( 'p' ), new Text( 'bar' ), new Element( 'h' ) ] );

			let p = frag.getChild( 0 );
			let textBAR = frag.getChild( 1 );
			let h = frag.getChild( 2 );

			expect( frag.getChildStartOffset( p ) ).to.equal( 0 );
			expect( frag.getChildStartOffset( textBAR ) ).to.equal( 1 );
			expect( frag.getChildStartOffset( h ) ).to.equal( 4 );
		} );

		it( 'should return null if node is not a child of that document fragment', () => {
			let frag = new DocumentFragment( [ new Element( 'p' ), new Text( 'bar' ), new Element( 'h' ) ] );

			let p = new Element( 'p' );

			expect( frag.getChildStartOffset( p ) ).to.equal( null );
		} );
	} );

	describe( 'getChildCount', () => {
		it( 'should return number of children nodes', () => {
			let frag = new DocumentFragment( new Text( 'bar' ) );

			expect( frag.childCount ).to.equal( 1 );
		} );
	} );

	describe( 'getMaxOffset', () => {
		it( 'should return offset after the last children', () => {
			let frag = new DocumentFragment( new Text( 'bar' ) );

			expect( frag.maxOffset ).to.equal( 3 );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should serialize empty document fragment', () => {
			let frag = new DocumentFragment();

			expect( jsonParseStringify( frag ) ).to.deep.equal( [] );
		} );

		it( 'should serialize document fragment with children', () => {
			let img = new Element( 'img' );
			let one = new Element( 'one' );
			let two = new Element( 'two', null, [ new Text( 'ba' ), img, new Text( 'r' ) ] );
			let three = new Element( 'three' );

			let frag = new DocumentFragment( [ one, two, three ] );

			expect( jsonParseStringify( frag ) ).to.deep.equal( [
				{ name: 'one' },
				{
					name: 'two',
					children: [
						{ data: 'ba' },
						{ name: 'img' },
						{ data: 'r' }
					]
				},
				{ name: 'three' }
			] );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create document fragment without children', () => {
			const frag = new DocumentFragment();

			let serialized = jsonParseStringify( frag );
			let deserialized = DocumentFragment.fromJSON( serialized );

			expect( deserialized.isEmpty ).to.be.true;
		} );

		it( 'should create element with children', () => {
			const p = new Element( 'p' );
			const foo = new Text( 'foo' );
			const frag = new DocumentFragment( [ p, foo ] );

			let serialized = jsonParseStringify( frag );
			let deserialized = DocumentFragment.fromJSON( serialized );

			expect( deserialized.childCount ).to.equal( 2 );

			expect( deserialized.getChild( 0 ).name ).to.equal( 'p' );
			expect( deserialized.getChild( 0 ).parent ).to.equal( deserialized );

			expect( deserialized.getChild( 1 ).data ).to.equal( 'foo' );
			expect( deserialized.getChild( 1 ).parent ).to.equal( deserialized );
		} );
	} );
} );
