/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { ModelNode } from '../../src/model/node.js';
import { ModelElement } from '../../src/model/element.js';
import { ModelText } from '../../src/model/text.js';
import { ModelTextProxy } from '../../src/model/textproxy.js';
import { count } from '@ckeditor/ckeditor5-utils';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'Element', () => {
	describe( 'constructor()', () => {
		it( 'should create empty element', () => {
			const element = new ModelElement( 'elem' );

			expect( element ).toBeInstanceOf( ModelNode );
			expect( element ).toHaveProperty( 'name', 'elem' );

			expect( count( element.getAttributes() ) ).toBe( 0 );
			expect( count( element.getChildren() ) ).toBe( 0 );
		} );

		it( 'should create element with attributes', () => {
			const element = new ModelElement( 'elem', { foo: 'bar' } );

			expect( count( element.getAttributes() ) ).toBe( 1 );
			expect( element.getAttribute( 'foo' ) ).toBe( 'bar' );
		} );

		it( 'should create element with children', () => {
			const element = new ModelElement( 'elem', [], new ModelText( 'foo' ) );

			expect( element.childCount ).toBe( 1 );
			expect( element.maxOffset ).toBe( 3 );
			expect( element.getChild( 0 ).data ).toBe( 'foo' );
		} );
	} );

	describe( 'is()', () => {
		let element;

		beforeAll( () => {
			element = new ModelElement( 'paragraph' );
		} );

		it( 'should return true for node, element, element with same name and element name', () => {
			expect( element.is( 'node' ) ).toBe( true );
			expect( element.is( 'model:node' ) ).toBe( true );
			expect( element.is( 'element' ) ).toBe( true );
			expect( element.is( 'model:element' ) ).toBe( true );
			expect( element.is( 'element', 'paragraph' ) ).toBe( true );
			expect( element.is( 'model:element', 'paragraph' ) ).toBe( true );
			expect( element.is( 'element', 'paragraph' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( element.is( 'element', 'imageBlock' ) ).toBe( false );
			expect( element.is( 'model:element', 'imageBlock' ) ).toBe( false );
			expect( element.is( 'element', 'imageBlock' ) ).toBe( false );
			expect( element.is( 'model:imageBlock' ) ).toBe( false );
			expect( element.is( '$text' ) ).toBe( false );
			expect( element.is( 'model:$text' ) ).toBe( false );
			expect( element.is( '$textProxy' ) ).toBe( false );
			expect( element.is( 'documentFragment' ) ).toBe( false );
			expect( element.is( 'rootElement' ) ).toBe( false );
			expect( element.is( 'model:rootElement' ) ).toBe( false );
			expect( element.is( 'view:node' ) ).toBe( false );
			expect( element.is( 'view:element' ) ).toBe( false );
			expect( element.is( 'view:element' ) ).toBe( false );
			expect( element.is( 'node', 'paragraph' ) ).toBe( false );
			expect( element.is( 'model:node', 'paragraph' ) ).toBe( false );
		} );
	} );

	describe( '_clone()', () => {
		it( 'should return an element with same name, attributes and same instances of children if clone was not deep', () => {
			const p = new ModelElement( 'p' );
			const foo = new ModelText( 'foo' );

			const element = new ModelElement( 'elem', { bold: true, italic: true }, [ p, foo ] );
			const copy = element._clone();

			expect( copy.name ).toBe( 'elem' );
			expect( Array.from( copy.getAttributes() ) ).toEqual( [ [ 'bold', true ], [ 'italic', true ] ] );
			expect( Array.from( copy.getChildren() ) ).toEqual( [] );
		} );

		it( 'should clone children (deeply), if clone is deep', () => {
			const foo = new ModelText( 'foo' );
			const bar = new ModelText( 'bar' );
			const p = new ModelElement( 'p', null, bar );

			const element = new ModelElement( 'elem', { bold: true, italic: true }, [ p, foo ] );
			const copy = element._clone( true );

			expect( copy.name ).toBe( 'elem' );
			expect( Array.from( copy.getAttributes() ) ).toEqual( [ [ 'bold', true ], [ 'italic', true ] ] );
			expect( copy.childCount ).toBe( 2 );

			expect( copy.getChild( 0 ) ).not.toBe( p );
			expect( copy.getChild( 0 ).getChild( 0 ) ).not.toBe( bar );
			expect( copy.getChild( 1 ) ).not.toBe( foo );

			expect( copy.getChild( 0 ).name ).toBe( 'p' );
			expect( copy.getChild( 0 ).getChild( 0 ).data ).toBe( 'bar' );
			expect( copy.getChild( 1 ).data ).toBe( 'foo' );
		} );
	} );

	describe( '_insertChild', () => {
		it( 'should add a child to the element', () => {
			const element = new ModelElement( 'elem', [], new ModelText( 'xy' ) );
			element._insertChild( 1, new ModelText( 'foo' ) );

			expect( element.childCount ).toBe( 2 );
			expect( element.maxOffset ).toBe( 5 );
			expect( element.getChild( 0 ).data ).toBe( 'xy' );
			expect( element.getChild( 1 ).data ).toBe( 'foo' );
		} );

		it( 'should accept arrays and strings', () => {
			const element = new ModelElement( 'elem' );
			element._insertChild( 0, [ new ModelElement( 'imageBlock' ), 'xy', new ModelElement( 'list' ) ] );

			expect( element.childCount ).toBe( 3 );
			expect( element.maxOffset ).toBe( 4 );
			expect( element.getChild( 0 ).name ).toBe( 'imageBlock' );
			expect( element.getChild( 1 ).data ).toBe( 'xy' );
			expect( element.getChild( 2 ).name ).toBe( 'list' );
		} );

		it( 'should accept strings', () => {
			const element = new ModelElement( 'div' );
			element._insertChild( 0, 'abc' );

			expect( element.childCount ).toBe( 1 );
			expect( element.maxOffset ).toBe( 3 );
			expect( element.getChild( 0 ) ).toHaveProperty( 'data', 'abc' );
		} );

		it( 'should accept and correctly handle text proxies', () => {
			const element = new ModelElement( 'div' );
			const text = new ModelText( 'abcxyz', { bold: true } );
			const textProxy = new ModelTextProxy( text, 2, 3 );

			element._insertChild( 0, textProxy );

			expect( element.childCount ).toBe( 1 );
			expect( element.maxOffset ).toBe( 3 );
			expect( element.getChild( 0 ) ).toBeInstanceOf( ModelText );
			expect( element.getChild( 0 ).data ).toBe( 'cxy' );
			expect( element.getChild( 0 ).getAttribute( 'bold' ) ).toBe( true );
		} );
	} );

	describe( '_appendChild', () => {
		it( 'should use _insertChild to add children at the end of the element', () => {
			const element = new ModelElement( 'elem', [], new ModelText( 'xy' ) );

			vi.spyOn( element, '_insertChild' );

			const text = new ModelText( 'foo' );
			element._appendChild( text );

			expect( element._insertChild ).toHaveBeenCalled();
		} );
	} );

	describe( '_removeChildren', () => {
		it( 'should remove children from the element and return them as an array', () => {
			const element = new ModelElement( 'elem', [], [ new ModelText( 'foobar' ), new ModelElement( 'imageBlock' ) ] );
			const removed = element._removeChildren( 1, 1 );

			expect( element.childCount ).toBe( 1 );
			expect( element.maxOffset ).toBe( 6 );

			expect( element.getChild( 0 ).data ).toBe( 'foobar' );

			expect( removed.length ).toBe( 1 );
			expect( removed[ 0 ].name ).toBe( 'imageBlock' );
		} );

		it( 'should remove one child when second parameter is not specified', () => {
			const element = new ModelElement( 'element', [], [ new ModelText( 'foo' ), new ModelElement( 'imageBlock' ) ] );
			const removed = element._removeChildren( 0 );

			expect( element.childCount ).toBe( 1 );
			expect( element.maxOffset ).toBe( 1 );
			expect( element.getChild( 0 ).name ).toBe( 'imageBlock' );

			expect( removed.length ).toBe( 1 );
			expect( removed[ 0 ].data ).toBe( 'foo' );
		} );
	} );

	describe( '_removeChildrenArray', () => {
		it( 'should remove children from the element', () => {
			const _1 = new ModelText( '_1' );
			const _2 = new ModelText( '_2' );
			const _3 = new ModelText( '_3' );
			const _4 = new ModelText( '_4' );
			const _5 = new ModelText( '_5' );
			const _6 = new ModelText( '_6' );

			const element = new ModelElement( 'elem', [], [ _1, _2, _3, _4, _5, _6 ] );

			element._removeChildrenArray( [ _2, _3, _4 ] );

			expect( element.childCount ).toBe( 3 );
			expect( element.maxOffset ).toBe( 6 );

			expect( element.getChild( 0 ) ).toHaveProperty( 'data', '_1' );
			expect( element.getChild( 1 ) ).toHaveProperty( 'data', '_5' );
			expect( element.getChild( 2 ) ).toHaveProperty( 'data', '_6' );
		} );
	} );

	describe( 'getNodeByPath', () => {
		it( 'should return this node if path is empty', () => {
			const element = new ModelElement( 'elem' );

			expect( element.getNodeByPath( [] ) ).toBe( element );
		} );

		it( 'should return a descendant of this node', () => {
			const foo = new ModelText( 'foo' );
			const image = new ModelElement( 'imageBlock' );
			const element = new ModelElement( 'elem', [], [
				new ModelElement( 'elem', [], [
					foo,
					image
				] )
			] );

			expect( element.getNodeByPath( [ 0, 0 ] ) ).toBe( foo );
			expect( element.getNodeByPath( [ 0, 1 ] ) ).toBe( foo );
			expect( element.getNodeByPath( [ 0, 2 ] ) ).toBe( foo );
			expect( element.getNodeByPath( [ 0, 3 ] ) ).toBe( image );
		} );

		it( 'works fine with offsets', () => {
			const bar = new ModelText( 'bar' );
			const foo = new ModelText( 'foo' );
			const bom = new ModelText( 'bom' );
			const bold = new ModelElement( 'b', [], [
				bar
			] );
			const paragraph = new ModelElement( 'paragraph', [], [
				foo,
				bold,
				bom
			] );

			// <paragraph>foo<bold>bar</bold>bom</paragraph>

			expect( paragraph.getNodeByPath( [ 0 ] ) ).toBe( foo );
			expect( paragraph.getNodeByPath( [ 1 ] ) ).toBe( foo );
			expect( paragraph.getNodeByPath( [ 2 ] ) ).toBe( foo );
			expect( paragraph.getNodeByPath( [ 3 ] ) ).toBe( bold );
			expect( paragraph.getNodeByPath( [ 3, 0 ] ) ).toBe( bar );
			expect( paragraph.getNodeByPath( [ 3, 1 ] ) ).toBe( bar );
			expect( paragraph.getNodeByPath( [ 3, 2 ] ) ).toBe( bar );
			expect( paragraph.getNodeByPath( [ 3, 3 ] ) ).toBe( null );
			expect( paragraph.getNodeByPath( [ 4 ] ) ).toBe( bom );
			expect( paragraph.getNodeByPath( [ 5 ] ) ).toBe( bom );
			expect( paragraph.getNodeByPath( [ 6 ] ) ).toBe( bom );
			expect( paragraph.getNodeByPath( [ 7 ] ) ).toBe( null );
		} );
	} );

	describe( 'findAncestor', () => {
		let p, td, tr, table;

		beforeEach( () => {
			p = new ModelElement( 'p', [], [ new ModelText( 'foo' ) ] );
			td = new ModelElement( 'td', [], [ p ] );
			tr = new ModelElement( 'tr', [], [ td ] );
			table = new ModelElement( 'table', [], [ tr ] );
		} );

		it( 'should return ancestor', () => {
			expect( p.findAncestor( 'p' ) ).toBeNull();
			expect( p.findAncestor( 'td' ) ).toBe( td );
			expect( p.findAncestor( 'tr' ) ).toBe( tr );
			expect( p.findAncestor( 'table' ) ).toBe( table );
			expect( p.findAncestor( 'abc' ) ).toBeNull();
		} );

		it( 'should return ancestor or self (includeSelf = true)', () => {
			expect( p.findAncestor( 'p', { includeSelf: true } ) ).toBe( p );
			expect( p.findAncestor( 'td', { includeSelf: true } ) ).toBe( td );
			expect( p.findAncestor( 'tr', { includeSelf: true } ) ).toBe( tr );
			expect( p.findAncestor( 'table', { includeSelf: true } ) ).toBe( table );
			expect( p.findAncestor( 'abc', { includeSelf: true } ) ).toBeNull();
		} );
	} );

	describe( 'getChildIndex', () => {
		it( 'should return child index', () => {
			const element = new ModelElement( 'elem', [], [ new ModelElement( 'p' ), new ModelText( 'bar' ), new ModelElement( 'h' ) ] );
			const p = element.getChild( 0 );
			const bar = element.getChild( 1 );
			const h = element.getChild( 2 );

			expect( element.getChildIndex( p ) ).toBe( 0 );
			expect( element.getChildIndex( bar ) ).toBe( 1 );
			expect( element.getChildIndex( h ) ).toBe( 2 );
		} );
	} );

	describe( 'getChildStartOffset', () => {
		it( 'should return child offset', () => {
			const element = new ModelElement( 'elem', [], [ new ModelElement( 'p' ), new ModelText( 'bar' ), new ModelElement( 'h' ) ] );
			const p = element.getChild( 0 );
			const bar = element.getChild( 1 );
			const h = element.getChild( 2 );

			expect( element.getChildStartOffset( p ) ).toBe( 0 );
			expect( element.getChildStartOffset( bar ) ).toBe( 1 );
			expect( element.getChildStartOffset( h ) ).toBe( 4 );
		} );
	} );

	describe( 'getChildAtOffset', () => {
		it( 'should return child at given offset', () => {
			const element = new ModelElement( 'elem', [], [ new ModelElement( 'p' ), new ModelText( 'bar' ), new ModelElement( 'h' ) ] );
			const p = element.getChild( 0 );
			const bar = element.getChild( 1 );
			const h = element.getChild( 2 );

			expect( element.getChildAtOffset( 0 ) ).toBe( p );
			expect( element.getChildAtOffset( 1 ) ).toBe( bar );
			expect( element.getChildAtOffset( 2 ) ).toBe( bar );
			expect( element.getChildAtOffset( 3 ) ).toBe( bar );
			expect( element.getChildAtOffset( 4 ) ).toBe( h );
		} );

		it( 'should return null for incorrect offset', () => {
			const element = new ModelElement( 'elem', [], [ new ModelElement( 'p' ), new ModelText( 'bar' ), new ModelElement( 'h' ) ] );

			expect( element.getChildAtOffset( -1 ) ).toBeNull();
			expect( element.getChildAtOffset( 5 ) ).toBeNull();
		} );
	} );

	describe( 'getChildCount', () => {
		it( 'should return number of children', () => {
			const element = new ModelElement( 'elem', [], new ModelText( 'bar' ) );

			expect( element.childCount ).toBe( 1 );
		} );
	} );

	describe( 'getMaxOffset', () => {
		it( 'should return offset number after the last child', () => {
			const element = new ModelElement( 'elem', [], [ new ModelElement( 'p' ), new ModelText( 'bar' ), new ModelElement( 'h' ) ] );

			expect( element.maxOffset ).toBe( 5 );
		} );
	} );

	describe( 'isEmpty', () => {
		it( 'checks whether element has no children', () => {
			expect( new ModelElement( 'a' ).isEmpty ).toBe( true );
			expect( new ModelElement( 'a', null, new ModelText( 'x' ) ).isEmpty ).toBe( false );
		} );
	} );

	describe( 'offsetToIndex', () => {
		let element;

		beforeEach( () => {
			element = new ModelElement( 'elem', [], [ new ModelElement( 'p' ), new ModelText( 'bar' ), new ModelElement( 'h' ) ] );
		} );

		it( 'should return index of a node that occupies given offset in this element', () => {
			expect( element.offsetToIndex( 0 ) ).toBe( 0 );
			expect( element.offsetToIndex( 1 ) ).toBe( 1 );
			expect( element.offsetToIndex( 2 ) ).toBe( 1 );
			expect( element.offsetToIndex( 3 ) ).toBe( 1 );
			expect( element.offsetToIndex( 4 ) ).toBe( 2 );
		} );

		it( 'should throw if given offset is too high or too low', () => {
			expectToThrowCKEditorError( () => {
				element.offsetToIndex( -1 );
			}, /nodelist-offset-out-of-bounds/, element );

			expectToThrowCKEditorError( () => {
				element.offsetToIndex( 55 );
			}, /nodelist-offset-out-of-bounds/, element );
		} );

		it( 'should return length if given offset is equal to maxOffset', () => {
			expect( element.offsetToIndex( 5 ) ).toBe( 3 );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should serialize empty element', () => {
			const element = new ModelElement( 'one' );

			expect( element.toJSON() ).toEqual( { name: 'one' } );
		} );

		it( 'should serialize element with attributes', () => {
			const element = new ModelElement( 'one', { foo: true, bar: false } );

			expect( element.toJSON() ).toEqual( {
				attributes: {
					foo: true,
					bar: false
				},
				name: 'one'
			} );
		} );

		it( 'should serialize node with children', () => {
			const img = new ModelElement( 'img' );
			const one = new ModelElement( 'one' );
			const two = new ModelElement( 'two', null, [ new ModelText( 'ba' ), img, new ModelText( 'r' ) ] );
			const three = new ModelElement( 'three' );

			const node = new ModelElement( null, null, [ one, two, three ] );

			expect( node.toJSON() ).toEqual( {
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
			const el = new ModelElement( 'el' );

			const serialized = el.toJSON();

			const deserialized = ModelElement.fromJSON( serialized );

			expect( deserialized.parent ).toBeNull();
			expect( deserialized.name ).toBe( 'el' );
			expect( deserialized.childCount ).toBe( 0 );
		} );

		it( 'should create element with attributes', () => {
			const el = new ModelElement( 'el', { foo: true } );

			const serialized = el.toJSON();

			const deserialized = ModelElement.fromJSON( serialized );

			expect( deserialized.parent ).toBeNull();
			expect( deserialized.name ).toBe( 'el' );
			expect( deserialized.childCount ).toBe( 0 );
			expect( deserialized.hasAttribute( 'foo' ) ).toBe( true );
			expect( deserialized.getAttribute( 'foo' ) ).toBe( true );
		} );

		it( 'should create element with children', () => {
			const p = new ModelElement( 'p' );
			const text = new ModelText( 'foo' );
			const el = new ModelElement( 'el', null, [ p, text ] );

			const serialized = el.toJSON();

			const deserialized = ModelElement.fromJSON( serialized );

			expect( deserialized.parent ).toBeNull();
			expect( deserialized.name ).toBe( 'el' );
			expect( deserialized.childCount ).toBe( 2 );

			expect( deserialized.getChild( 0 ).name ).toBe( 'p' );
			expect( deserialized.getChild( 0 ).parent ).toBe( deserialized );

			expect( deserialized.getChild( 1 ).data ).toBe( 'foo' );
			expect( deserialized.getChild( 1 ).parent ).toBe( deserialized );
		} );
	} );
} );
