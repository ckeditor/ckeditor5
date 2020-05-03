/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Element from '../../src/model/element';
import Text from '../../src/model/text';
import TextProxy from '../../src/model/textproxy';
import DocumentFragment from '../../src/model/documentfragment';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'DocumentFragment', () => {
	describe( 'constructor()', () => {
		it( 'should create empty document fragment', () => {
			const frag = new DocumentFragment();

			expect( frag.childCount ).to.equal( 0 );
			expect( frag.maxOffset ).to.equal( 0 );
		} );

		it( 'should create document fragment with children', () => {
			const frag = new DocumentFragment( [ new Text( 'xx' ), new Element( 'p' ), new Text( 'yy' ) ] );

			expect( frag.childCount ).to.equal( 3 );
			expect( frag.maxOffset ).to.equal( 5 );

			expect( frag.getChild( 0 ) ).to.have.property( 'data' ).that.equals( 'xx' );
			expect( frag.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'p' );
			expect( frag.getChild( 2 ) ).to.have.property( 'data' ).that.equals( 'yy' );
		} );

		it( 'should have markers list', () => {
			const frag = new DocumentFragment();

			expect( frag ).to.have.property( 'markers' ).to.instanceof( Map );
		} );

		it( 'should have root property, equal to itself', () => {
			const frag = new DocumentFragment();

			expect( frag ).to.have.property( 'root' ).that.equals( frag );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should iterate over document fragment\'s children', () => {
			const xx = new Text( 'xx' );
			const p = new Element( 'p' );
			const yy = new Text( 'yy' );
			const frag = new DocumentFragment( [ xx, p, yy ] );

			expect( Array.from( frag ) ).to.deep.equal( [ xx, p, yy ] );
		} );
	} );

	describe( 'getPath', () => {
		it( 'should return empty array', () => {
			const frag = new DocumentFragment( [ new Text( 'x' ), new Element( 'p' ), new Text( 'y' ) ] );

			expect( frag.getPath() ).to.deep.equal( [] );
		} );
	} );

	describe( 'is()', () => {
		let frag;

		before( () => {
			frag = new DocumentFragment();
		} );

		it( 'should return true for documentFragment', () => {
			expect( frag.is( 'documentFragment' ) ).to.be.true;
			expect( frag.is( 'model:documentFragment' ) ).to.be.true;
		} );

		it( 'should return false for other values', () => {
			expect( frag.is( 'node' ) ).to.be.false;
			expect( frag.is( 'text' ) ).to.be.false;
			expect( frag.is( 'textProxy' ) ).to.be.false;
			expect( frag.is( 'element' ) ).to.be.false;
			expect( frag.is( 'rootElement' ) ).to.be.false;
			expect( frag.is( 'view:documentFragment' ) ).to.be.false;
		} );
	} );

	describe( 'isEmpty', () => {
		it( 'should return true if document fragment has no children', () => {
			const frag = new DocumentFragment();

			expect( frag.isEmpty ).to.be.true;
		} );

		it( 'should return false if document fragment has children', () => {
			const frag = new DocumentFragment( new Text( 'a' ) );

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
			expectToThrowCKEditorError( () => {
				frag.offsetToIndex( -1 );
			}, /nodelist-offset-out-of-bounds/, frag );

			expectToThrowCKEditorError( () => {
				frag.offsetToIndex( 55 );
			}, /nodelist-offset-out-of-bounds/, frag );
		} );

		it( 'should return length if given offset is equal to maxOffset', () => {
			expect( frag.offsetToIndex( 5 ) ).to.equal( 3 );
		} );
	} );

	describe( '_insertChild', () => {
		it( 'should add children to the document fragment', () => {
			const frag = new DocumentFragment( new Text( 'xy' ) );
			frag._insertChild( 1, new Text( 'foo' ) );

			expect( frag.childCount ).to.equal( 2 );
			expect( frag.maxOffset ).to.equal( 5 );
			expect( frag.getChild( 0 ) ).to.have.property( 'data' ).that.equals( 'xy' );
			expect( frag.getChild( 1 ) ).to.have.property( 'data' ).that.equals( 'foo' );
		} );

		it( 'should accept strings and arrays', () => {
			const frag = new DocumentFragment();

			frag._insertChild( 0, 'abc' );
			expect( frag.childCount ).to.equal( 1 );
			expect( frag.maxOffset ).to.equal( 3 );
			expect( frag.getChild( 0 ) ).to.have.property( 'data' ).that.equals( 'abc' );

			frag._removeChildren( 0, 1 );
			frag._insertChild( 0, [ new Element( 'p' ), 'abc' ] );

			expect( frag.childCount ).to.equal( 2 );
			expect( frag.maxOffset ).to.equal( 4 );
			expect( frag.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'p' );
			expect( frag.getChild( 1 ) ).to.have.property( 'data' ).that.equals( 'abc' );
		} );

		it( 'should accept and correctly handle text proxies', () => {
			const frag = new DocumentFragment();
			const text = new Text( 'abcxyz', { bold: true } );
			const textProxy = new TextProxy( text, 2, 3 );

			frag._insertChild( 0, textProxy );

			expect( frag.childCount ).to.equal( 1 );
			expect( frag.maxOffset ).to.equal( 3 );
			expect( frag.getChild( 0 ) ).to.be.instanceof( Text );
			expect( frag.getChild( 0 ).data ).to.equal( 'cxy' );
			expect( frag.getChild( 0 ).getAttribute( 'bold' ) ).to.equal( true );
		} );
	} );

	describe( '_appendChild', () => {
		it( 'should add children to the end of the element', () => {
			const frag = new DocumentFragment( new Text( 'xy' ) );
			frag._appendChild( new Text( 'foo' ) );

			expect( frag.childCount ).to.equal( 2 );
			expect( frag.maxOffset ).to.equal( 5 );
			expect( frag.getChild( 0 ) ).to.have.property( 'data' ).that.equals( 'xy' );
			expect( frag.getChild( 1 ) ).to.have.property( 'data' ).that.equals( 'foo' );
		} );
	} );

	describe( '_removeChildren', () => {
		it( 'should remove children from the element and return them as an array', () => {
			const frag = new DocumentFragment( [ new Text( 'foobar' ), new Element( 'image' ) ] );
			const removed = frag._removeChildren( 1, 1 );

			expect( frag.childCount ).to.equal( 1 );
			expect( frag.maxOffset ).to.equal( 6 );

			expect( frag.getChild( 0 ) ).to.have.property( 'data' ).that.equals( 'foobar' );

			expect( removed.length ).to.equal( 1 );
			expect( removed[ 0 ].name ).to.equal( 'image' );
		} );

		it( 'should remove one child when second parameter is not specified', () => {
			const frag = new DocumentFragment( [ new Text( 'foo' ), new Element( 'image' ) ] );
			const removed = frag._removeChildren( 0 );

			expect( frag.childCount ).to.equal( 1 );
			expect( frag.maxOffset ).to.equal( 1 );
			expect( frag.getChild( 0 ).name ).to.equal( 'image' );

			expect( removed.length ).to.equal( 1 );
			expect( removed[ 0 ].data ).to.equal( 'foo' );
		} );
	} );

	describe( 'getChildIndex', () => {
		it( 'should return child index', () => {
			const frag = new DocumentFragment( [ new Element( 'p' ), new Text( 'bar' ), new Element( 'h' ) ] );
			const p = frag.getChild( 0 );
			const textBAR = frag.getChild( 1 );
			const h = frag.getChild( 2 );

			expect( frag.getChildIndex( p ) ).to.equal( 0 );
			expect( frag.getChildIndex( textBAR ) ).to.equal( 1 );
			expect( frag.getChildIndex( h ) ).to.equal( 2 );
		} );
	} );

	describe( 'getChildStartOffset', () => {
		it( 'should return child start offset', () => {
			const frag = new DocumentFragment( [ new Element( 'p' ), new Text( 'bar' ), new Element( 'h' ) ] );

			const p = frag.getChild( 0 );
			const textBAR = frag.getChild( 1 );
			const h = frag.getChild( 2 );

			expect( frag.getChildStartOffset( p ) ).to.equal( 0 );
			expect( frag.getChildStartOffset( textBAR ) ).to.equal( 1 );
			expect( frag.getChildStartOffset( h ) ).to.equal( 4 );
		} );

		it( 'should return null if node is not a child of that document fragment', () => {
			const frag = new DocumentFragment( [ new Element( 'p' ), new Text( 'bar' ), new Element( 'h' ) ] );

			const p = new Element( 'p' );

			expect( frag.getChildStartOffset( p ) ).to.equal( null );
		} );
	} );

	describe( 'getChildCount', () => {
		it( 'should return number of children nodes', () => {
			const frag = new DocumentFragment( new Text( 'bar' ) );

			expect( frag.childCount ).to.equal( 1 );
		} );
	} );

	describe( 'getMaxOffset', () => {
		it( 'should return offset after the last children', () => {
			const frag = new DocumentFragment( new Text( 'bar' ) );

			expect( frag.maxOffset ).to.equal( 3 );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should serialize empty document fragment', () => {
			const frag = new DocumentFragment();

			expect( frag.toJSON() ).to.deep.equal( [] );
		} );

		it( 'should serialize document fragment with children', () => {
			const img = new Element( 'img' );
			const one = new Element( 'one' );
			const two = new Element( 'two', null, [ new Text( 'ba' ), img, new Text( 'r' ) ] );
			const three = new Element( 'three' );

			const frag = new DocumentFragment( [ one, two, three ] );

			expect( frag.toJSON() ).to.deep.equal( [
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

			const serialized = frag.toJSON();
			const deserialized = DocumentFragment.fromJSON( serialized );

			expect( deserialized.isEmpty ).to.be.true;
		} );

		it( 'should create element with children', () => {
			const p = new Element( 'p' );
			const foo = new Text( 'foo' );
			const frag = new DocumentFragment( [ p, foo ] );

			const serialized = frag.toJSON();
			const deserialized = DocumentFragment.fromJSON( serialized );

			expect( deserialized.childCount ).to.equal( 2 );

			expect( deserialized.getChild( 0 ).name ).to.equal( 'p' );
			expect( deserialized.getChild( 0 ).parent ).to.equal( deserialized );

			expect( deserialized.getChild( 1 ).data ).to.equal( 'foo' );
			expect( deserialized.getChild( 1 ).parent ).to.equal( deserialized );
		} );
	} );

	describe( 'getNodeByPath', () => {
		it( 'should return the whole document fragment if path is empty', () => {
			const frag = new DocumentFragment();

			expect( frag.getNodeByPath( [] ) ).to.equal( frag );
		} );

		it( 'should return a descendant of this node', () => {
			const foo = new Text( 'foo' );
			const image = new Element( 'image' );
			const element = new Element( 'elem', [], [
				new Element( 'elem', [], [
					foo,
					image
				] )
			] );
			const frag = new DocumentFragment( element );

			expect( frag.getNodeByPath( [ 0, 0, 0 ] ) ).to.equal( foo );
			expect( frag.getNodeByPath( [ 0, 0, 1 ] ) ).to.equal( foo );
			expect( frag.getNodeByPath( [ 0, 0, 2 ] ) ).to.equal( foo );
			expect( frag.getNodeByPath( [ 0, 0, 3 ] ) ).to.equal( image );
		} );

		it( 'works fine with offsets', () => {
			const abc = new Text( 'abc' );
			const xyz = new Text( 'xyz' );
			const bar = new Text( 'bar' );
			const foo = new Text( 'foo' );
			const bom = new Text( 'bom' );
			const bold = new Element( 'b', [], [
				bar
			] );
			const paragraph = new Element( 'paragraph', [], [
				foo,
				bold,
				bom
			] );
			const frag = new DocumentFragment( [
				abc,
				paragraph,
				xyz
			] );

			// abc<paragraph>foo<bold>bar</bold>bom</paragraph>xyz

			expect( frag.getNodeByPath( [ 0 ] ), 1 ).to.equal( abc );
			expect( frag.getNodeByPath( [ 1 ] ), 2 ).to.equal( abc );
			expect( frag.getNodeByPath( [ 2 ] ), 3 ).to.equal( abc );
			expect( frag.getNodeByPath( [ 3 ] ), 4 ).to.equal( paragraph );
			expect( frag.getNodeByPath( [ 3, 0 ] ), 5 ).to.equal( foo );
			expect( frag.getNodeByPath( [ 3, 1 ] ), 6 ).to.equal( foo );
			expect( frag.getNodeByPath( [ 3, 2 ] ), 7 ).to.equal( foo );
			expect( frag.getNodeByPath( [ 3, 3 ] ), 8 ).to.equal( bold );
			expect( frag.getNodeByPath( [ 3, 3, 0 ] ), 9 ).to.equal( bar );
			expect( frag.getNodeByPath( [ 3, 3, 1 ] ), 10 ).to.equal( bar );
			expect( frag.getNodeByPath( [ 3, 3, 2 ] ), 11 ).to.equal( bar );
			expect( frag.getNodeByPath( [ 3, 3, 3 ] ), 12 ).to.equal( null );
			expect( frag.getNodeByPath( [ 3, 4 ] ), 13 ).to.equal( bom );
			expect( frag.getNodeByPath( [ 3, 5 ] ), 14 ).to.equal( bom );
			expect( frag.getNodeByPath( [ 3, 6 ] ), 15 ).to.equal( bom );
			expect( frag.getNodeByPath( [ 3, 7 ] ), 16 ).to.equal( null );
			expect( frag.getNodeByPath( [ 4 ] ), 17 ).to.equal( xyz );
			expect( frag.getNodeByPath( [ 5 ] ), 18 ).to.equal( xyz );
			expect( frag.getNodeByPath( [ 6 ] ), 19 ).to.equal( xyz );
			expect( frag.getNodeByPath( [ 7 ] ), 20 ).to.equal( null );
		} );
	} );
} );
