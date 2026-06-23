/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { count } from '@ckeditor/ckeditor5-utils';
import { ViewNode } from '../../src/view/node.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewText } from '../../src/view/text.js';
import { ViewTextProxy } from '../../src/view/textproxy.js';
import { ViewDocument } from '../../src/view/document.js';
import { addBorderStylesRules } from '../../src/view/styles/border.js';
import { addMarginStylesRules } from '../../src/view/styles/margin.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { ViewTokenList } from '../../src/view/tokenlist.js';
import { StylesMap, ViewRootEditableElement } from '@ckeditor/ckeditor5-engine';

describe( 'Element', () => {
	let document;

	beforeEach( () => {
		document = new ViewDocument( new StylesProcessor() );
	} );

	describe( 'constructor()', () => {
		it( 'should create element without attributes', () => {
			const el = new ViewElement( document, 'p' );

			expect( el ).toBeInstanceOf( ViewNode );
			expect( el ).toHaveProperty( 'name', 'p' );
			expect( el.parent ).toBeNull();
			expect( count( el.getAttributeKeys() ) ).toBe( 0 );
		} );

		it( 'should create element with attributes as plain object', () => {
			const el = new ViewElement( document, 'p', { foo: 'bar' } );

			expect( el ).toHaveProperty( 'name', 'p' );
			expect( count( el.getAttributeKeys() ) ).toBe( 1 );
			expect( el.getAttribute( 'foo' ) ).toBe( 'bar' );
		} );

		it( 'should create element with attributes as map', () => {
			const attrs = new Map();
			attrs.set( 'foo', 'bar' );

			const el = new ViewElement( document, 'p', attrs );

			expect( el ).toHaveProperty( 'name', 'p' );
			expect( count( el.getAttributeKeys() ) ).toBe( 1 );
			expect( el.getAttribute( 'foo' ) ).toBe( 'bar' );
		} );

		it( 'should stringify attributes', () => {
			const el = new ViewElement( document, 'p', { foo: true, bar: null, object: {} } );

			expect( el.getAttribute( 'foo' ) ).toBe( 'true' );
			expect( el.getAttribute( 'bar' ) ).toBeUndefined();
			expect( el.getAttribute( 'object' ) ).toBe( '[object Object]' );
		} );

		it( 'should create element with children', () => {
			const child = new ViewElement( document, 'p', { foo: 'bar' } );
			const parent = new ViewElement( document, 'div', [], [ child ] );

			expect( parent ).toHaveProperty( 'name', 'div' );
			expect( parent.childCount ).toBe( 1 );
			expect( parent.getChild( 0 ) ).toHaveProperty( 'name', 'p' );
		} );

		it( 'should move class attribute to class set ', () => {
			const el = new ViewElement( document, 'p', { id: 'test', class: 'one two three' } );

			expect( el._attrs.get( 'class' ) ).toBeInstanceOf( ViewTokenList );
			expect( el._attrs.has( 'id' ) ).toBe( true );
			expect( el._attrs.get( 'class' ).has( 'one' ) ).toBe( true );
			expect( el._attrs.get( 'class' ).has( 'two' ) ).toBe( true );
			expect( el._attrs.get( 'class' ).has( 'three' ) ).toBe( true );
		} );

		it( 'should move style attribute to style proxy', () => {
			const el = new ViewElement(
				document, 'p', { id: 'test', style: 'one: style1; two:style2 ; three : url(http://ckeditor.com)' }
			);

			expect( el._attrs.get( 'style' ) ).toBeInstanceOf( StylesMap );
			expect( el._attrs.has( 'id' ) ).toBe( true );

			expect( el._attrs.get( 'style' ).has( 'one' ) ).toBe( true );
			expect( el._attrs.get( 'style' ).getAsString( 'one' ) ).toBe( 'style1' );
			expect( el._attrs.get( 'style' ).has( 'two' ) ).toBe( true );
			expect( el._attrs.get( 'style' ).getAsString( 'two' ) ).toBe( 'style2' );
			expect( el._attrs.get( 'style' ).has( 'three' ) ).toBe( true );
			expect( el._attrs.get( 'style' ).getAsString( 'three' ) ).toBe( 'url(http://ckeditor.com)' );
		} );
	} );

	describe( 'is()', () => {
		let el;

		beforeEach( () => {
			el = new ViewElement( document, 'p' );
		} );

		it( 'should return true for node, element, element with correct name and element name', () => {
			expect( el.is( 'node' ) ).toBe( true );
			expect( el.is( 'view:node' ) ).toBe( true );
			expect( el.is( 'element' ) ).toBe( true );
			expect( el.is( 'view:element' ) ).toBe( true );
			expect( el.is( 'element', 'p' ) ).toBe( true );
			expect( el.is( 'view:element', 'p' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'element', 'span' ) ).toBe( false );
			expect( el.is( 'view:element', 'span' ) ).toBe( false );
			expect( el.is( 'element', 'span' ) ).toBe( false );
			expect( el.is( 'view:span' ) ).toBe( false );
			expect( el.is( '$text' ) ).toBe( false );
			expect( el.is( 'view:$text' ) ).toBe( false );
			expect( el.is( '$textProxy' ) ).toBe( false );
			expect( el.is( 'containerElement' ) ).toBe( false );
			expect( el.is( 'attributeElement' ) ).toBe( false );
			expect( el.is( 'uiElement' ) ).toBe( false );
			expect( el.is( 'emptyElement' ) ).toBe( false );
			expect( el.is( 'view:emptyElement' ) ).toBe( false );
			expect( el.is( 'rootElement' ) ).toBe( false );
			expect( el.is( 'view:ootElement' ) ).toBe( false );
			expect( el.is( 'documentFragment' ) ).toBe( false );
			expect( el.is( 'node', 'p' ) ).toBe( false );
			expect( el.is( 'view:node', 'p' ) ).toBe( false );
		} );
	} );

	describe( 'isEmpty', () => {
		it( 'should return true if there are no children in element', () => {
			const element = new ViewElement( document, 'p' );

			expect( element.isEmpty ).toBe( true );
		} );

		it( 'should return false if there are children in element', () => {
			const fragment = new ViewElement( document, 'p', null, new ViewElement( document, 'img' ) );

			expect( fragment.isEmpty ).toBe( false );
		} );
	} );

	describe( '_clone()', () => {
		it( 'should clone element', () => {
			const el = new ViewElement( document, 'p', { attr1: 'foo', attr2: 'bar' } );
			const clone = el._clone();

			expect( clone ).not.toBe( el );
			expect( clone.name ).toBe( el.name );
			expect( clone.getAttribute( 'attr1' ) ).toBe( 'foo' );
			expect( clone.getAttribute( 'attr2' ) ).toBe( 'bar' );
		} );

		it( 'should deeply clone element', () => {
			const el = new ViewElement( document, 'p', { attr1: 'foo', attr2: 'bar' }, [
				new ViewElement( document, 'b', { attr: 'baz' } ),
				new ViewElement( document, 'span', { attr: 'qux' } )
			] );
			const count = el.childCount;
			const clone = el._clone( true );

			expect( clone ).not.toBe( el );
			expect( clone.name ).toBe( el.name );
			expect( clone.getAttribute( 'attr1' ) ).toBe( 'foo' );
			expect( clone.getAttribute( 'attr2' ) ).toBe( 'bar' );
			expect( clone.childCount ).toBe( count );

			for ( let i = 0; i < count; i++ ) {
				const child = el.getChild( i );
				const clonedChild = clone.getChild( i );

				expect( clonedChild ).not.toBe( child );
				expect( clonedChild.name ).toBe( child.name );
				expect( clonedChild.getAttribute( 'attr' ) ).toBe( child.getAttribute( 'attr' ) );
			}
		} );

		it( 'shouldn\'t clone any children when deep copy is not performed', () => {
			const el = new ViewElement( document, 'p', { attr1: 'foo', attr2: 'bar' }, [
				new ViewElement( document, 'b', { attr: 'baz' } ),
				new ViewElement( document, 'span', { attr: 'qux' } )
			] );
			const clone = el._clone( false );

			expect( clone ).not.toBe( el );
			expect( clone.name ).toBe( el.name );
			expect( clone.getAttribute( 'attr1' ) ).toBe( 'foo' );
			expect( clone.getAttribute( 'attr2' ) ).toBe( 'bar' );
			expect( clone.childCount ).toBe( 0 );
		} );

		it( 'should clone class attribute', () => {
			const el = new ViewElement( document, 'p', { foo: 'bar' } );
			el._addClass( [ 'baz', 'qux' ] );
			const clone = el._clone( false );

			expect( clone ).not.toBe( el );
			expect( clone.name ).toBe( el.name );
			expect( clone.getAttribute( 'foo' ) ).toBe( 'bar' );
			expect( clone.getAttribute( 'class' ) ).toBe( 'baz qux' );
		} );

		it( 'should clone style attribute', () => {
			const el = new ViewElement( document, 'p', { style: 'color: red; font-size: 12px;' } );
			const clone = el._clone( false );

			expect( clone ).not.toBe( el );
			expect( clone.name ).toBe( el.name );
			expect( clone._attrs.get( 'style' ).has( 'color' ) ).toBe( true );
			expect( clone._attrs.get( 'style' ).getAsString( 'color' ) ).toBe( 'red' );
			expect( clone._attrs.get( 'style' ).has( 'font-size' ) ).toBe( true );
			expect( clone._attrs.get( 'style' ).getAsString( 'font-size' ) ).toBe( '12px' );
		} );

		it( 'should clone custom properties', () => {
			const el = new ViewElement( document, 'p' );
			const symbol = Symbol( 'custom' );
			el._setCustomProperty( 'foo', 'bar' );
			el._setCustomProperty( symbol, 'baz' );

			const cloned = el._clone();

			expect( cloned.getCustomProperty( 'foo' ) ).toBe( 'bar' );
			expect( cloned.getCustomProperty( symbol ) ).toBe( 'baz' );
		} );

		it( 'should clone getFillerOffset', () => {
			const el = new ViewElement( document, 'p' );
			const fm = () => 'foo bar';

			expect( el.getFillerOffset ).toBeUndefined();
			el.getFillerOffset = fm;

			const cloned = el._clone();

			expect( cloned.getFillerOffset ).toBe( fm );
		} );
	} );

	describe( 'isSimilar()', () => {
		let el;

		beforeEach( () => {
			el = new ViewElement( document, 'p', { foo: 'bar' } );
		} );

		it( 'should return false when comparing to non-element', () => {
			expect( el.isSimilar( null ) ).toBe( false );
			expect( el.isSimilar( {} ) ).toBe( false );
		} );

		it( 'should return true when the same node is provided', () => {
			expect( el.isSimilar( el ) ).toBe( true );
		} );

		it( 'should return true for element with same attributes and name', () => {
			const other = new ViewElement( document, 'p', { foo: 'bar' } );
			expect( el.isSimilar( other ) ).toBe( true );
		} );

		it( 'should return false when name is not the same', () => {
			const other = el._clone();
			other.name = 'div';

			expect( el.isSimilar( other ) ).toBe( false );
		} );

		it( 'should return false when attributes are not the same', () => {
			const other1 = el._clone();
			const other2 = el._clone();
			const other3 = el._clone();
			other1._setAttribute( 'baz', 'qux' );
			other2._setAttribute( 'foo', 'not-bar' );
			other3._removeAttribute( 'foo' );
			expect( el.isSimilar( other1 ) ).toBe( false );
			expect( el.isSimilar( other2 ) ).toBe( false );
			expect( el.isSimilar( other3 ) ).toBe( false );
		} );

		it( 'should compare class attribute', () => {
			const el1 = new ViewElement( document, 'p' );
			const el2 = new ViewElement( document, 'p' );
			const el3 = new ViewElement( document, 'p' );
			const el4 = new ViewElement( document, 'p' );

			el1._addClass( [ 'foo', 'bar' ] );
			el2._addClass( [ 'bar', 'foo' ] );
			el3._addClass( 'baz' );
			el4._addClass( [ 'baz', 'bar' ] );

			expect( el1.isSimilar( el2 ) ).toBe( true );
			expect( el1.isSimilar( el3 ) ).toBe( false );
			expect( el1.isSimilar( el4 ) ).toBe( false );
		} );

		describe( 'comparing styles', () => {
			let element, other;

			beforeEach( () => {
				element = new ViewElement( document, 'p' );
				other = new ViewElement( document, 'p' );

				element._setStyle( 'color', 'red' );
				element._setStyle( 'top', '10px' );
			} );

			it( 'should return true when both elements have the same styles set (same order)', () => {
				other._setStyle( 'color', 'red' );
				other._setStyle( 'top', '10px' );

				expect( element.isSimilar( other ) ).toBe( true );
			} );

			it( 'should return true when both elements have the same styles set (different order)', () => {
				other._setStyle( 'top', '10px' );
				other._setStyle( 'color', 'red' );

				expect( element.isSimilar( other ) ).toBe( true );
			} );

			it( 'should return false when the other has fewer styles', () => {
				other._setStyle( 'top', '20px' );

				expect( element.isSimilar( other ) ).toBe( false );
			} );

			it( 'should return false when the other has fewer styles (but with same values)', () => {
				other._setStyle( 'top', '10px' );

				expect( element.isSimilar( other ) ).toBe( false );
			} );

			it( 'should return false when the other has more styles', () => {
				other._setStyle( 'top', '10px' );
				other._setStyle( 'color', 'red' );
				other._setStyle( 'bottom', '10px' );

				expect( element.isSimilar( other ) ).toBe( false );
			} );

			it( 'should return false when the other has the same styles set but with different values', () => {
				other._setStyle( 'top', '10px' );
				other._setStyle( 'color', 'blue' );

				expect( element.isSimilar( other ) ).toBe( false );
			} );
		} );
	} );

	describe( 'children manipulation methods', () => {
		let parent, el1, el2, el3, el4;

		beforeEach( () => {
			parent = new ViewElement( document, 'p' );
			el1 = new ViewElement( document, 'el1' );
			el2 = new ViewElement( document, 'el2' );
			el3 = new ViewElement( document, 'el3' );
			el4 = new ViewElement( document, 'el4' );
		} );

		describe( 'insertion', () => {
			it( 'should insert children', () => {
				const count1 = parent._insertChild( 0, [ el1, el3 ] );
				const count2 = parent._insertChild( 1, el2 );

				expect( parent.childCount ).toBe( 3 );
				expect( parent.getChild( 0 ) ).toHaveProperty( 'name', 'el1' );
				expect( parent.getChild( 1 ) ).toHaveProperty( 'name', 'el2' );
				expect( parent.getChild( 2 ) ).toHaveProperty( 'name', 'el3' );
				expect( count1 ).toBe( 2 );
				expect( count2 ).toBe( 1 );
			} );

			it( 'should accept strings', () => {
				parent._insertChild( 0, 'abc' );

				expect( parent.childCount ).toBe( 1 );
				expect( parent.getChild( 0 ) ).toHaveProperty( 'data', 'abc' );

				parent._removeChildren( 0, 1 );
				parent._insertChild( 0, [ new ViewElement( document, 'p' ), 'abc' ] );

				expect( parent.childCount ).toBe( 2 );
				expect( parent.getChild( 1 ) ).toHaveProperty( 'data', 'abc' );
			} );

			it( 'should append children', () => {
				const count1 = parent._insertChild( 0, el1 );
				const count2 = parent._appendChild( el2 );
				const count3 = parent._appendChild( el3 );

				expect( parent.childCount ).toBe( 3 );
				expect( parent.getChild( 0 ) ).toHaveProperty( 'name', 'el1' );
				expect( parent.getChild( 1 ) ).toHaveProperty( 'name', 'el2' );
				expect( parent.getChild( 2 ) ).toHaveProperty( 'name', 'el3' );
				expect( count1 ).toBe( 1 );
				expect( count2 ).toBe( 1 );
				expect( count3 ).toBe( 1 );
			} );

			it( 'should accept and correctly handle text proxies', () => {
				const element = new ViewElement( document, 'div' );
				const text = new ViewText( document, 'abcxyz' );
				const textProxy = new ViewTextProxy( text, 2, 3 );

				element._insertChild( 0, textProxy );

				expect( element.childCount ).toBe( 1 );
				expect( element.getChild( 0 ) ).toBeInstanceOf( ViewText );
				expect( element.getChild( 0 ).data ).toBe( 'cxy' );
			} );

			it( 'set proper #document on inserted children', () => {
				const anotherDocument = new ViewDocument( new StylesProcessor() );
				const anotherEl = new ViewElement( anotherDocument, 'p' );

				parent._insertChild( 0, anotherEl );

				expect( anotherEl.document ).toBe( document );
			} );
		} );

		describe( 'getChildIndex', () => {
			it( 'should return child index', () => {
				parent._appendChild( el1 );
				parent._appendChild( el2 );
				parent._appendChild( el3 );

				expect( parent.childCount ).toBe( 3 );
				expect( parent.getChildIndex( el1 ) ).toBe( 0 );
				expect( parent.getChildIndex( el2 ) ).toBe( 1 );
				expect( parent.getChildIndex( el3 ) ).toBe( 2 );
			} );
		} );

		describe( 'getChildren', () => {
			it( 'should renturn children iterator', () => {
				parent._appendChild( el1 );
				parent._appendChild( el2 );
				parent._appendChild( el3 );

				const expected = [ el1, el2, el3 ];
				let i = 0;

				for ( const child of parent.getChildren() ) {
					expect( child ).toBe( expected[ i ] );
					i++;
				}

				expect( i ).toBe( 3 );
			} );
		} );

		describe( '_removeChildren', () => {
			it( 'should remove children', () => {
				parent._appendChild( el1 );
				parent._appendChild( el2 );
				parent._appendChild( el3 );
				parent._appendChild( el4 );

				parent._removeChildren( 1, 2 );

				expect( parent.childCount ).toBe( 2 );
				expect( parent.getChild( 0 ) ).toHaveProperty( 'name', 'el1' );
				expect( parent.getChild( 1 ) ).toHaveProperty( 'name', 'el4' );

				expect( el1.parent ).toBe( parent );
				expect( el2.parent ).toBeNull();
				expect( el3.parent ).toBeNull();
				expect( el4.parent ).equal( parent );
			} );

			it( 'should remove one child when second parameter is not specified', () => {
				parent._appendChild( el1 );
				parent._appendChild( el2 );
				parent._appendChild( el3 );

				const removed = parent._removeChildren( 1 );

				expect( parent.childCount ).toBe( 2 );
				expect( parent.getChild( 0 ) ).toHaveProperty( 'name', 'el1' );
				expect( parent.getChild( 1 ) ).toHaveProperty( 'name', 'el3' );

				expect( removed.length ).toBe( 1 );
				expect( removed[ 0 ] ).toHaveProperty( 'name', 'el2' );
			} );
		} );
	} );

	describe( 'attributes manipulation methods', () => {
		let el;

		beforeEach( () => {
			el = new ViewElement( document, 'p' );
		} );

		describe( '_setAttribute', () => {
			it( 'should set attribute', () => {
				el._setAttribute( 'foo', 'bar' );

				expect( el._attrs.has( 'foo' ) ).toBe( true );
				expect( el._attrs.get( 'foo' ) ).toBe( 'bar' );
			} );

			it( 'should cast attribute value to a string', () => {
				el._setAttribute( 'foo', true );

				expect( el._attrs.get( 'foo' ) ).toBe( 'true' );
			} );

			it( 'should fire change event with attributes type', () => {
				return new Promise( resolve => {
					el.once( 'change:attributes', eventInfo => {
						expect( eventInfo.source ).toBe( el );
						resolve();
					} );

					el._setAttribute( 'foo', 'bar' );
				} );
			} );

			it( 'should set class', () => {
				el._setAttribute( 'class', 'foo bar' );

				expect( el._attrs.get( 'class' ) ).toBeInstanceOf( ViewTokenList );
				expect( el._attrs.get( 'class' ).has( 'foo' ) ).toBe( true );
				expect( el._attrs.get( 'class' ).has( 'bar' ) ).toBe( true );
			} );

			it( 'should replace all existing classes', () => {
				el._setAttribute( 'class', 'foo bar baz' );
				el._setAttribute( 'class', 'qux' );

				expect( el._attrs.get( 'class' ).has( 'foo' ) ).toBe( false );
				expect( el._attrs.get( 'class' ).has( 'bar' ) ).toBe( false );
				expect( el._attrs.get( 'class' ).has( 'baz' ) ).toBe( false );
				expect( el._attrs.get( 'class' ).has( 'qux' ) ).toBe( true );
			} );

			it( 'should not replace all existing classes if reset is set to false', () => {
				el._setAttribute( 'class', 'foo bar baz', false );
				el._setAttribute( 'class', 'qux', false );

				expect( el._attrs.get( 'class' ).has( 'foo' ) ).toBe( true );
				expect( el._attrs.get( 'class' ).has( 'bar' ) ).toBe( true );
				expect( el._attrs.get( 'class' ).has( 'baz' ) ).toBe( true );
				expect( el._attrs.get( 'class' ).has( 'qux' ) ).toBe( true );
			} );

			it( 'should replace all styles', () => {
				el._setStyle( 'color', 'red' );
				el._setStyle( 'top', '10px' );
				el._setAttribute( 'style', 'margin-top:2em;' );

				expect( el.hasStyle( 'color' ) ).toBe( false );
				expect( el.hasStyle( 'top' ) ).toBe( false );
				expect( el.hasStyle( 'margin-top' ) ).toBe( true );
				expect( el.getStyle( 'margin-top' ) ).toBe( '2em' );
			} );

			it( 'should not replace all styles if reset is set to false', () => {
				el._setAttribute( 'style', [ 'color', 'red' ], false );
				el._setAttribute( 'style', [ 'top', '10px' ], false );
				el._setAttribute( 'style', [ 'margin-top', '2em' ], false );

				expect( el.getStyle( 'color' ) ).toBe( 'red' );
				expect( el.getStyle( 'top' ) ).toBe( '10px' );
				expect( el.getStyle( 'margin-top' ) ).toBe( '2em' );
			} );

			it( 'should replace rel attribute if reset is set to false but not on `a` element', () => {
				el._setAttribute( 'rel', 'foo', false );
				el._setAttribute( 'rel', 'bar', false );
				el._setAttribute( 'rel', 'baz', false );

				expect( el.getAttribute( 'rel' ) ).toBe( 'baz' );
			} );

			it( 'should not replace all rel attribute tokens if reset is set to false', () => {
				el = new ViewElement( document, 'a' );
				el._setAttribute( 'rel', 'foo', false );
				el._setAttribute( 'rel', 'bar', false );
				el._setAttribute( 'rel', 'baz', false );

				expect( el.getAttribute( 'rel' ) ).toBe( 'foo bar baz' );
			} );
		} );

		describe( 'getAttribute', () => {
			it( 'should return attribute', () => {
				el._setAttribute( 'foo', 'bar' );

				expect( el.getAttribute( 'foo' ) ).toBe( 'bar' );
				expect( el.getAttribute( 'bom' ) ).to.not.be.ok;
			} );

			it( 'should return class attribute', () => {
				el._addClass( [ 'foo', 'bar' ] );

				expect( el.getAttribute( 'class' ) ).toBe( 'foo bar' );
			} );

			it( 'should return undefined if no class attribute', () => {
				expect( el.getAttribute( 'class' ) ).toBeUndefined();
			} );

			it( 'should return style attribute', () => {
				el._setStyle( 'color', 'red' );
				el._setStyle( 'top', '10px' );

				expect( el.getAttribute( 'style' ) ).toBe( 'color:red;top:10px;' );
			} );

			it( 'should return undefined if no style attribute', () => {
				expect( el.getAttribute( 'style' ) ).toBeUndefined();
			} );
		} );

		describe( 'getAttributes', () => {
			it( 'should return attributes', () => {
				el._setAttribute( 'foo', 'bar' );
				el._setAttribute( 'abc', 'xyz' );

				expect( Array.from( el.getAttributes() ) ).toEqual( [ [ 'foo', 'bar' ], [ 'abc', 'xyz' ] ] );
			} );

			it( 'should return class and style attribute', () => {
				el._setAttribute( 'class', 'abc' );
				el._setAttribute( 'style', 'width:20px;' );
				el._addClass( 'xyz' );
				el._setStyle( 'font-weight', 'bold' );

				expect( Array.from( el.getAttributes() ) ).toEqual( [
					[ 'class', 'abc xyz' ], [ 'style', 'font-weight:bold;width:20px;' ]
				] );
			} );
		} );

		describe( 'hasAttribute', () => {
			it( 'should return true if element has attribute', () => {
				el._setAttribute( 'foo', 'bar' );

				expect( el.hasAttribute( 'foo' ) ).toBe( true );
				expect( el.hasAttribute( 'bom' ) ).toBe( false );
			} );

			it( 'should return true if element has class attribute', () => {
				expect( el.hasAttribute( 'class' ) ).toBe( false );
				el._addClass( 'foo' );
				expect( el.hasAttribute( 'class' ) ).toBe( true );
			} );

			it( 'should return true if element has style attribute', () => {
				expect( el.hasAttribute( 'style' ) ).toBe( false );
				el._setStyle( 'border', '1px solid red' );
				expect( el.hasAttribute( 'style' ) ).toBe( true );
			} );

			describe( 'tokenized attributes', () => {
				it( 'should check if element has a class', () => {
					el._addClass( [ 'one', 'two', 'three' ] );

					expect( el.hasAttribute( 'class', 'one' ) ).toBe( true );
					expect( el.hasAttribute( 'class', 'two' ) ).toBe( true );
					expect( el.hasAttribute( 'class', 'three' ) ).toBe( true );
					expect( el.hasAttribute( 'class', 'four' ) ).toBe( false );
				} );

				it( 'should check if element has a style', () => {
					el._setStyle( 'padding-top', '10px' );

					expect( el.hasAttribute( 'style', 'padding-top' ) ).toBe( true );
					expect( el.hasAttribute( 'style', 'padding-left' ) ).toBe( false );
				} );

				it( 'should check if element has a rel token (on link)', () => {
					const el = new ViewElement( document, 'a' );

					el._setAttribute( 'rel', 'nofollow noreferrer' );

					expect( el.hasAttribute( 'rel', 'nofollow' ) ).toBe( true );
					expect( el.hasAttribute( 'rel', 'noreferrer' ) ).toBe( true );
					expect( el.hasAttribute( 'rel', 'noopener' ) ).toBe( false );
				} );

				it( 'should not tokenize a rel attribute on non link elements', () => {
					el._setAttribute( 'rel', 'nofollow noreferrer' );

					expect( el.hasAttribute( 'rel' ) ).toBe( true );
					expect( el.hasAttribute( 'rel', 'nofollow noreferrer' ) ).toBe( true );
					expect( el.hasAttribute( 'rel', 'nofollow' ) ).toBe( false );
					expect( el.hasAttribute( 'rel', 'noreferrer' ) ).toBe( false );
					expect( el.hasAttribute( 'rel', 'noopener' ) ).toBe( false );
				} );
			} );
		} );

		describe( 'getAttributeKeys', () => {
			it( 'should return keys', () => {
				el._setAttribute( 'foo', true );
				el._setAttribute( 'bar', true );

				const expected = [ 'foo', 'bar' ];
				let i = 0;

				for ( const key of el.getAttributeKeys() ) {
					expect( key ).toBe( expected[ i ] );
					i++;
				}

				expect( i ).toBe( 2 );
			} );

			it( 'should return class key', () => {
				el._addClass( 'foo' );
				el._setAttribute( 'bar', true );
				const expected = [ 'class', 'bar' ];
				let i = 0;

				for ( const key of el.getAttributeKeys() ) {
					expect( key ).toBe( expected[ i ] );
					i++;
				}
			} );

			it( 'should return style key', () => {
				el._setStyle( 'color', 'black' );
				el._setAttribute( 'bar', true );
				const expected = [ 'style', 'bar' ];
				let i = 0;

				for ( const key of el.getAttributeKeys() ) {
					expect( key ).toBe( expected[ i ] );
					i++;
				}
			} );
		} );

		describe( '_removeAttribute', () => {
			it( 'should remove attributes', () => {
				el._setAttribute( 'foo', true );

				expect( el.hasAttribute( 'foo' ) ).toBe( true );

				el._removeAttribute( 'foo' );

				expect( el.hasAttribute( 'foo' ) ).toBe( false );

				expect( count( el.getAttributeKeys() ) ).toBe( 0 );
			} );

			it( 'should fire change event with attributes type', () => {
				el._setAttribute( 'foo', 'bar' );
				return new Promise( resolve => {
					el.once( 'change:attributes', eventInfo => {
						expect( eventInfo.source ).toBe( el );
						resolve();
					} );

					el._removeAttribute( 'foo' );
				} );
			} );

			it( 'should remove class attribute', () => {
				el._addClass( [ 'foo', 'bar' ] );
				const el2 = new ViewElement( document, 'p' );
				const removed1 = el._removeAttribute( 'class' );
				const removed2 = el2._removeAttribute( 'class' );

				expect( el.hasAttribute( 'class' ) ).toBe( false );
				expect( el.hasClass( 'foo' ) ).toBe( false );
				expect( el.hasClass( 'bar' ) ).toBe( false );
				expect( removed1 ).toBe( true );
				expect( removed2 ).toBe( false );
			} );

			it( 'should remove only specified class tokens', () => {
				el._addClass( [ 'foo', 'bar' ] );

				const removed1 = el._removeAttribute( 'class', 'foo' );
				expect( el.hasAttribute( 'class' ) ).toBe( true );
				expect( el.hasClass( 'foo' ) ).toBe( false );
				expect( el.hasClass( 'bar' ) ).toBe( true );
				expect( removed1 ).toBe( false );

				const removed2 = el._removeAttribute( 'class', 'bar' );
				expect( el.hasAttribute( 'class' ) ).toBe( false );
				expect( el.hasClass( 'foo' ) ).toBe( false );
				expect( el.hasClass( 'bar' ) ).toBe( false );
				expect( removed2 ).toBe( true );
			} );

			it( 'should remove style attribute', () => {
				el._setStyle( 'color', 'red' );
				el._setStyle( 'position', 'fixed' );
				const el2 = new ViewElement( document, 'p' );
				const removed1 = el._removeAttribute( 'style' );
				const removed2 = el2._removeAttribute( 'style' );

				expect( el.hasAttribute( 'style' ) ).toBe( false );
				expect( el.hasStyle( 'color' ) ).toBe( false );
				expect( el.hasStyle( 'position' ) ).toBe( false );
				expect( removed1 ).toBe( true );
				expect( removed2 ).toBe( false );
			} );

			it( 'should remove only specified style tokens', () => {
				el._setStyle( 'color', 'red' );
				el._setStyle( 'position', 'fixed' );

				const removed1 = el._removeAttribute( 'style', 'color' );
				expect( el.hasAttribute( 'style' ) ).toBe( true );
				expect( el.hasStyle( 'color' ) ).toBe( false );
				expect( el.hasStyle( 'position' ) ).toBe( true );
				expect( removed1 ).toBe( false );

				const removed2 = el._removeAttribute( 'style', 'position' );
				expect( el.hasAttribute( 'style' ) ).toBe( false );
				expect( el.hasStyle( 'color' ) ).toBe( false );
				expect( el.hasStyle( 'position' ) ).toBe( false );
				expect( removed2 ).toBe( true );
			} );

			it( 'should remove only specified rel tokens', () => {
				el = new ViewElement( document, 'a', { rel: 'foo bar' } );

				const removed1 = el._removeAttribute( 'rel', 'foo' );
				expect( el.hasAttribute( 'rel' ) ).toBe( true );
				expect( el.getAttribute( 'rel' ) ).toBe( 'bar' );
				expect( removed1 ).toBe( false );

				const removed2 = el._removeAttribute( 'rel', 'bar' );
				expect( el.hasAttribute( 'rel' ) ).toBe( false );
				expect( removed2 ).toBe( true );
			} );
		} );

		describe( '_collectAttributesMatch()', () => {
			let match;

			beforeEach( () => {
				match = [];
			} );

			it( 'should match attributes when patternKey=true, patternToken=true, patternValue=true', () => {
				el = new ViewElement( document, 'p', { foo: 'bar', class: 'abc def', style: 'color: red; position: absolute;' } );

				expect( el._collectAttributesMatch( [ [ true, true, true ] ], match ) ).toBe( true );
				expect( match ).toEqual( [
					[ 'foo' ],
					[ 'class', 'abc' ],
					[ 'class', 'def' ],
					[ 'style', 'color' ],
					[ 'style', 'position' ]
				] );
			} );

			it( 'should ignore excluded attributes and match when patternKey=true, patternToken=true, patternValue=true', () => {
				el = new ViewElement(
					document, 'p', { foo: 'bar', xyz: '123', class: 'abc def', style: 'color: red; position: absolute;' }
				);

				expect( el._collectAttributesMatch( [ [ true, true, true ] ], match, [ 'class', 'style' ] ) ).toBe( true );
				expect( match ).toEqual( [
					[ 'foo' ],
					[ 'xyz' ]
				] );
			} );

			it( 'should match attributes when patternKey=string, patternToken=true, patternValue=true', () => {
				el = new ViewElement(
					document, 'p', { foo: 'bar', xyz: '123', class: 'abc def', style: 'color: red; position: absolute;' }
				);

				expect( el._collectAttributesMatch( [ [ 'foo', true, true ] ], match ) ).toBe( true );
				expect( match ).toEqual( [
					[ 'foo' ]
				] );
			} );

			it( 'should match attributes when patternKey=string, patternToken=true, patternValue=true (multiple patterns)', () => {
				el = new ViewElement(
					document, 'p', { foo: 'bar', xyz: '123', class: 'abc def', style: 'color: red; position: absolute;' }
				);

				expect( el._collectAttributesMatch( [
					[ 'foo', true, true ],
					[ 'xyz', true, true ]
				], match ) ).toBe( true );
				expect( match ).toEqual( [
					[ 'foo' ],
					[ 'xyz' ]
				] );
			} );

			it( 'should match attributes when patternKey=regexp, patternToken=true', () => {
				el = new ViewElement(
					document, 'p', { foo: 'bar', xyz: '123', class: 'abc def', style: 'color: red; position: absolute;' }
				);

				expect( el._collectAttributesMatch( [ [ /a|z/, true ] ], match ) ).toBe( true );
				expect( match ).toEqual( [
					[ 'xyz' ],
					[ 'class', 'abc' ],
					[ 'class', 'def' ]
				] );
			} );

			it( 'should match attributes when patternKey=string, patternToken=regexp', () => {
				el = new ViewElement( document, 'p', { foo: 'bar', class: 'foo bar baz', style: 'color: red; position: absolute;' } );

				expect( el._collectAttributesMatch( [ [ 'class', /^b/ ] ], match ) ).toBe( true );
				expect( match ).toEqual( [
					[ 'class', 'bar' ],
					[ 'class', 'baz' ]
				] );
			} );

			it( 'should match attributes when patternKey=string, patternToken=string, patternValue=string', () => {
				el = new ViewElement( document, 'p', { style: 'color: red; position: absolute;' } );

				expect( el._collectAttributesMatch( [ [ 'style', 'color', 'red' ] ], match ) ).toBe( true );
				expect( match ).toEqual( [
					[ 'style', 'color' ]
				] );
			} );

			it( 'should match attributes when patternKey=string, patternToken=string, patternValue=regexp', () => {
				el = new ViewElement( document, 'p', { style: 'color: red; position: absolute;' } );

				expect( el._collectAttributesMatch( [ [ 'style', 'color', /^r/ ] ], match ) ).toBe( true );
				expect( match ).toEqual( [
					[ 'style', 'color' ]
				] );
			} );

			it( 'should not match attributes when patternKey=string, patternToken=string, patternValue=string', () => {
				el = new ViewElement( document, 'p', { style: 'color: red; position: absolute;' } );

				expect( el._collectAttributesMatch( [ [ 'style', 'color', 'blue' ] ], match ) ).toBe( false );
				expect( match ).toEqual( [] );
			} );

			it( 'should not match attributes when patternKey=string, patternToken=string when not matching', () => {
				el = new ViewElement( document, 'p', { foo: 'bar', class: 'foo bar baz', style: 'color: red; position: absolute;' } );

				expect( el._collectAttributesMatch( [ [ 'class', 'abc' ], [ 'class', 'def' ] ], match ) ).toBe( false );
				expect( match ).toEqual( [] );
			} );

			it( 'should not match attributes when patternKey=string, patternToken=string when not matching plain value', () => {
				el = new ViewElement( document, 'p', { foo: 'bar', class: 'foo bar baz', style: 'color: red; position: absolute;' } );

				expect( el._collectAttributesMatch( [ [ 'foo', 'abc' ] ], match ) ).toBe( false );
				expect( match ).toEqual( [] );
			} );

			it( 'should return false when string attribute value does not match tokenPattern and keyPattern is not a RegExp', () => {
				el = new ViewElement( document, 'p', { href: 'https://other.com' } );

				expect( el._collectAttributesMatch( [ [ 'href', 'https://specific.com' ] ], match ) ).toBe( false );
				expect( match ).toEqual( [] );
			} );

			it( 'should return false when tokenized attribute token does not match and keyPattern is not a RegExp', () => {
				el = new ViewElement( document, 'p', { class: 'bar' } );

				expect( el._collectAttributesMatch( [ [ 'class', 'foo' ] ], match ) ).toBe( false );
				expect( match ).toEqual( [] );
			} );

			it( 'should not match attributes when patternKey=regexp, patternToken=true when not matching', () => {
				el = new ViewElement( document, 'p', { foo: 'bar', class: 'foo bar baz', style: 'color: red; position: absolute;' } );

				expect( el._collectAttributesMatch( [ [ /^q/, true ] ], match ) ).toBe( false );
				expect( match ).toEqual( [] );
			} );

			it( 'should return false when string attribute value does not match tokenPattern and keyPattern is a RegExp', () => {
				el = new ViewElement( document, 'p', { href: 'https://other.com' } );

				expect( el._collectAttributesMatch( [ [ /href/, 'https://specific.com' ] ], match ) ).toBe( false );
				expect( match ).toEqual( [] );
			} );

			it( 'should return false when tokenized attribute token does not match and keyPattern is a RegExp', () => {
				el = new ViewElement( document, 'p', { class: 'bar' } );

				expect( el._collectAttributesMatch( [ [ /^class/, 'foo' ] ], match ) ).toBe( false );
				expect( match ).toEqual( [] );
			} );

			it( 'should return true if there are no patterns provided', () => {
				expect( el._collectAttributesMatch( [], match ) ).toBe( true );
				expect( match.length ).toBe( 0 );
			} );
		} );

		describe( '_getConsumables()', () => {
			it( 'should return all consumables', () => {
				addMarginStylesRules( document.stylesProcessor );
				el = new ViewElement( document, 'p', { foo: 'bar', class: 'foo bar', style: 'color: red; margin: 10px;' } );

				expect( el._getConsumables() ).toEqual( {
					name: true,
					attributes: [
						[ 'foo' ],
						[ 'class', 'foo' ],
						[ 'class', 'bar' ],
						[ 'style', 'color' ],
						[ 'style', 'margin-top' ],
						[ 'style', 'margin-right' ],
						[ 'style', 'margin-bottom' ],
						[ 'style', 'margin-left' ],
						[ 'style', 'margin' ]
					]
				} );
			} );

			it( 'should return filtered consumables', () => {
				addMarginStylesRules( document.stylesProcessor );
				el = new ViewElement( document, 'p', { foo: 'bar', class: 'foo bar', style: 'color: red; margin: 10px;' } );

				expect( el._getConsumables( 'foo' ) ).toEqual( {
					name: false,
					attributes: [
						[ 'foo' ]
					]
				} );
			} );

			it( 'should return filtered consumables with related values', () => {
				addMarginStylesRules( document.stylesProcessor );
				el = new ViewElement( document, 'p', { foo: 'bar', class: 'foo bar', style: 'color: red; margin: 10px;' } );

				expect( el._getConsumables( 'style', 'margin' ) ).toEqual( {
					name: false,
					attributes: [
						[ 'style', 'margin' ],
						[ 'style', 'margin-top' ],
						[ 'style', 'margin-right' ],
						[ 'style', 'margin-bottom' ],
						[ 'style', 'margin-left' ]
					]
				} );
			} );

			it( 'should return filtered consumables for a tokenized attribute with a token reference', () => {
				el = new ViewElement( document, 'p', { class: 'foo bar' } );

				expect( el._getConsumables( 'class', 'foo' ) ).toEqual( {
					name: false,
					attributes: [
						[ 'class', 'foo' ]
					]
				} );
			} );

			it( 'should return filtered consumables for a plain string attribute when key is provided', () => {
				el = new ViewElement( document, 'p', { href: 'https://example.com' } );

				expect( el._getConsumables( 'href' ) ).toEqual( {
					name: false,
					attributes: [
						[ 'href' ]
					]
				} );
			} );

			it( 'should return empty attributes for a key not present in element attrs', () => {
				el = new ViewElement( document, 'p' );

				expect( el._getConsumables( 'nonexistent' ) ).toEqual( {
					name: false,
					attributes: []
				} );
			} );
		} );

		describe( '_canMergeAttributesFrom() and _mergeAttributesFrom()', () => {
			it( 'should not merge attributes of different name elements', () => {
				const el = new ViewElement( document, 'p' );
				const other = new ViewElement( document, 'h2' );

				expect( el._canMergeAttributesFrom( other ) ).toBe( false );
			} );

			it( 'should not merge attributes if plain attribute is conflicting', () => {
				const el = new ViewElement( document, 'span', { foo: 'a' } );
				const other = new ViewElement( document, 'span', { foo: 'b' } );

				expect( el._canMergeAttributesFrom( other ) ).toBe( false );
			} );

			it( 'should not merge attributes if style attribute is conflicting', () => {
				const el = new ViewElement( document, 'span', { style: 'color:red' } );
				const other = new ViewElement( document, 'span', { style: 'color:blue' } );

				expect( el._canMergeAttributesFrom( other ) ).toBe( false );
			} );

			it( 'should merge attributes if attribute is not set on target', () => {
				const el = new ViewElement( document, 'span', { foo: 'bar' } );
				const other = new ViewElement( document, 'span', { baz: '123' } );

				expect( el._canMergeAttributesFrom( other ) ).toBe( true );

				el._mergeAttributesFrom( other );

				expect( el.getAttribute( 'foo' ) ).toBe( 'bar' );
				expect( el.getAttribute( 'baz' ) ).toBe( '123' );
			} );

			it( 'should merge attributes if attribute is same on both', () => {
				const el = new ViewElement( document, 'span', { foo: 'bar' } );
				const other = new ViewElement( document, 'span', { foo: 'bar', abc: '123' } );

				expect( el._canMergeAttributesFrom( other ) ).toBe( true );

				el._mergeAttributesFrom( other );

				expect( el.getAttribute( 'foo' ) ).toBe( 'bar' );
				expect( el.getAttribute( 'abc' ) ).toBe( '123' );
			} );

			it( 'should merge attributes if class attribute is set on both', () => {
				const el = new ViewElement( document, 'span', { class: 'foo' } );
				const other = new ViewElement( document, 'span', { class: 'bar' } );

				expect( el._canMergeAttributesFrom( other ) ).toBe( true );

				el._mergeAttributesFrom( other );

				expect( el.getAttribute( 'class' ) ).toBe( 'foo bar' );
			} );

			it( 'should merge attributes if style attribute is set on both but not conflicting', () => {
				const el = new ViewElement( document, 'span', { style: 'color:red;' } );
				const other = new ViewElement( document, 'span', { style: 'margin:10px;' } );

				expect( el._canMergeAttributesFrom( other ) ).toBe( true );

				el._mergeAttributesFrom( other );

				expect( el.getAttribute( 'style' ) ).toBe( 'color:red;margin:10px;' );
			} );
		} );

		describe( '_canSubtractAttributesOf() and _subtractAttributesOf()', () => {
			it( 'should not subtract attributes of different name elements', () => {
				const el = new ViewElement( document, 'p' );
				const other = new ViewElement( document, 'h2' );

				expect( el._canSubtractAttributesOf( other ) ).toBe( false );
			} );

			it( 'should not subtract attributes if there is no attribute to subtract', () => {
				const el = new ViewElement( document, 'span', { foo: 'bar' } );
				const other = new ViewElement( document, 'span', { baz: '123' } );

				expect( el._canSubtractAttributesOf( other ) ).toBe( false );
			} );

			it( 'should not subtract attributes if the value differs', () => {
				const el = new ViewElement( document, 'span', { foo: 'bar' } );
				const other = new ViewElement( document, 'span', { foo: '123' } );

				expect( el._canSubtractAttributesOf( other ) ).toBe( false );
			} );

			it( 'should not subtract attributes if the classes value differs', () => {
				const el = new ViewElement( document, 'span', { class: 'foo' } );
				const other = new ViewElement( document, 'span', { class: 'bar' } );

				expect( el._canSubtractAttributesOf( other ) ).toBe( false );
			} );

			it( 'should not subtract attributes if the style value differs', () => {
				const el = new ViewElement( document, 'span', { style: 'color:red' } );
				const other = new ViewElement( document, 'span', { style: 'color:blue' } );

				expect( el._canSubtractAttributesOf( other ) ).toBe( false );
			} );

			it( 'should subtract attributes if the value is same', () => {
				const el = new ViewElement( document, 'span', { foo: 'bar' } );
				const other = new ViewElement( document, 'span', { foo: 'bar' } );

				expect( el._canSubtractAttributesOf( other ) ).toBe( true );

				el._subtractAttributesOf( other );

				expect( el.hasAttribute( 'foo' ) ).toBe( false );
			} );

			it( 'should subtract attributes if the classes value matches', () => {
				const el = new ViewElement( document, 'span', { class: 'foo bar' } );
				const other = new ViewElement( document, 'span', { class: 'bar' } );

				expect( el._canSubtractAttributesOf( other ) ).toBe( true );

				el._subtractAttributesOf( other );

				expect( el.getAttribute( 'class' ) ).toBe( 'foo' );
			} );

			it( 'should subtract attributes if the style value matches', () => {
				const el = new ViewElement( document, 'span', { style: 'color:red;position:absolute;' } );
				const other = new ViewElement( document, 'span', { style: 'color:red' } );

				expect( el._canSubtractAttributesOf( other ) ).toBe( true );

				el._subtractAttributesOf( other );

				expect( el.getAttribute( 'style' ) ).toBe( 'position:absolute;' );
			} );

			it( 'should remove classes attribute if all are subtracted', () => {
				const el = new ViewElement( document, 'span', { class: 'bar' } );
				const other = new ViewElement( document, 'span', { class: 'bar' } );

				expect( el._canSubtractAttributesOf( other ) ).toBe( true );

				el._subtractAttributesOf( other );

				expect( el.hasAttribute( 'class' ) ).toBe( false );
			} );

			it( 'should remove style attribute if all are subtracted', () => {
				const el = new ViewElement( document, 'span', { style: 'color:red' } );
				const other = new ViewElement( document, 'span', { style: 'color:red' } );

				expect( el._canSubtractAttributesOf( other ) ).toBe( true );

				el._subtractAttributesOf( other );

				expect( el.hasAttribute( 'style' ) ).toBe( false );
			} );
		} );
	} );

	describe( 'classes manipulation methods', () => {
		let el;

		beforeEach( () => {
			el = new ViewElement( document, 'p' );
		} );

		describe( '_addClass()', () => {
			it( 'should add single class', () => {
				el._addClass( 'one' );

				expect( el._attrs.get( 'class' ).has( 'one' ) ).toBe( true );
			} );

			it( 'should fire change event with attributes type', () => {
				return new Promise( resolve => {
					el.once( 'change:attributes', eventInfo => {
						expect( eventInfo.source ).toBe( el );
						resolve();
					} );

					el._addClass( 'one' );
				} );
			} );

			it( 'should add multiple classes', () => {
				el._addClass( [ 'one', 'two', 'three' ] );

				expect( el._attrs.get( 'class' ).has( 'one' ) ).toBe( true );
				expect( el._attrs.get( 'class' ).has( 'two' ) ).toBe( true );
				expect( el._attrs.get( 'class' ).has( 'three' ) ).toBe( true );
			} );
		} );

		describe( '_removeClass()', () => {
			it( 'should remove single class', () => {
				el._addClass( [ 'one', 'two', 'three' ] );

				el._removeClass( 'one' );

				expect( el._attrs.get( 'class' ).has( 'one' ) ).toBe( false );
				expect( el._attrs.get( 'class' ).has( 'two' ) ).toBe( true );
				expect( el._attrs.get( 'class' ).has( 'three' ) ).toBe( true );
			} );

			it( 'should fire change event with attributes type', () => {
				el._addClass( 'one' );
				return new Promise( resolve => {
					el.once( 'change:attributes', eventInfo => {
						expect( eventInfo.source ).toBe( el );
						resolve();
					} );

					el._removeClass( 'one' );
				} );
			} );

			it( 'should remove multiple classes', () => {
				el._addClass( [ 'one', 'two', 'three', 'four' ] );
				el._removeClass( [ 'one', 'two', 'three' ] );

				expect( el._attrs.get( 'class' ).has( 'one' ) ).toBe( false );
				expect( el._attrs.get( 'class' ).has( 'two' ) ).toBe( false );
				expect( el._attrs.get( 'class' ).has( 'three' ) ).toBe( false );
				expect( el._attrs.get( 'class' ).has( 'four' ) ).toBe( true );
			} );
		} );

		describe( 'hasClass', () => {
			it( 'should check if element has a class', () => {
				el._addClass( [ 'one', 'two', 'three' ] );

				expect( el.hasClass( 'one' ) ).toBe( true );
				expect( el.hasClass( 'two' ) ).toBe( true );
				expect( el.hasClass( 'three' ) ).toBe( true );
				expect( el.hasClass( 'four' ) ).toBe( false );
			} );

			it( 'should check if element has multiple classes', () => {
				el._addClass( [ 'one', 'two', 'three' ] );

				expect( el.hasClass( 'one', 'two' ) ).toBe( true );
				expect( el.hasClass( 'three', 'two' ) ).toBe( true );
				expect( el.hasClass( 'three', 'one', 'two' ) ).toBe( true );
				expect( el.hasClass( 'three', 'one', 'two', 'zero' ) ).toBe( false );
			} );
		} );

		describe( 'getClassNames', () => {
			it( 'should return iterable with all class names', () => {
				const names = [ 'one', 'two', 'three' ];

				el._addClass( names );

				const iterable = el.getClassNames();
				let i = 0;

				for ( const name of iterable ) {
					expect( name ).toBe( names[ i++ ] );
				}
			} );

			// MathType uses legacy `element.getClassNames().next().value`.
			it( 'should return iterator with all class names', () => {
				const names = [ 'one', 'two', 'three' ];

				el._addClass( names );

				const iterator = el.getClassNames();
				let i = 0;

				expect( iterator.next() ).toEqual( { value: names[ i++ ], done: false } );
				expect( iterator.next() ).toEqual( { value: names[ i++ ], done: false } );
				expect( iterator.next() ).toEqual( { value: names[ i++ ], done: false } );
				expect( iterator.next() ).toEqual( { value: undefined, done: true } );
			} );
		} );
	} );

	describe( 'styles manipulation methods', () => {
		let el;

		beforeEach( () => {
			el = new ViewElement( document, 'p' );
		} );

		describe( '_setStyle()', () => {
			it( 'should set element style', () => {
				el._setStyle( 'color', 'red' );

				expect( el._attrs.get( 'style' )._styles.color ).toBe( 'red' );
			} );

			it( 'should fire change event with attributes type', () => {
				return new Promise( resolve => {
					el.once( 'change:attributes', eventInfo => {
						expect( eventInfo.source ).toBe( el );
						resolve();
					} );

					el._setStyle( 'color', 'red' );
				} );
			} );

			it( 'should set multiple styles by providing an object', () => {
				el._setStyle( {
					color: 'red',
					position: 'fixed'
				} );

				expect( el._attrs.get( 'style' )._styles.color ).toBe( 'red' );
				expect( el._attrs.get( 'style' )._styles.position ).toBe( 'fixed' );
			} );
		} );

		describe( 'getStyle', () => {
			it( 'should get style', () => {
				el._setStyle( {
					color: 'red',
					'margin-top': '1px'
				} );

				expect( el.getStyle( 'color' ) ).toBe( 'red' );
				expect( el.getStyle( 'margin-top' ) ).toBe( '1px' );
			} );
		} );

		describe( 'getNormalizedStyle', () => {
			it( 'should get normalized style', () => {
				el._setStyle( {
					color: 'red',
					'margin-top': '1px'
				} );

				expect( el.getNormalizedStyle( 'color' ) ).toBe( 'red' );
				expect( el.getNormalizedStyle( 'margin-top' ) ).toBe( '1px' );
			} );
		} );

		describe( 'getStyleNames', () => {
			it( 'should return iterator with all style names', () => {
				const names = [ 'color', 'position' ];

				el._setStyle( {
					color: 'red',
					position: 'absolute'
				} );

				const iterator = el.getStyleNames();
				let i = 0;

				for ( const name of iterator ) {
					expect( name ).toBe( names[ i++ ] );
				}
			} );
		} );

		describe( 'getStyleNames - expand = true', () => {
			it( 'should return all styles in an expanded form', () => {
				addBorderStylesRules( el.document.stylesProcessor );
				addMarginStylesRules( el.document.stylesProcessor );

				el._setStyle( {
					margin: '1 em',
					border: '2px dotted silver'
				} );

				const styles = Array.from( el.getStyleNames( true ) );

				expect( styles ).toEqual( [
					'border',
					'border-color',
					'border-style',
					'border-width',
					'border-top',
					'border-right',
					'border-bottom',
					'border-left',
					'border-top-color',
					'border-right-color',
					'border-bottom-color',
					'border-left-color',
					'border-top-style',
					'border-right-style',
					'border-bottom-style',
					'border-left-style',
					'border-top-width',
					'border-right-width',
					'border-bottom-width',
					'border-left-width',
					'margin',
					'margin-top',
					'margin-right',
					'margin-bottom',
					'margin-left'
				] );
			} );
		} );

		describe( 'hasStyle', () => {
			it( 'should check if element has a style', () => {
				el._setStyle( 'padding-top', '10px' );

				expect( el.hasStyle( 'padding-top' ) ).toBe( true );
				expect( el.hasStyle( 'padding-left' ) ).toBe( false );
			} );

			it( 'should check if element has multiple styles', () => {
				el._setStyle( {
					'padding-top': '10px',
					'margin-left': '10px',
					'color': '10px;'
				} );

				expect( el.hasStyle( 'padding-top', 'margin-left' ) ).toBe( true );
				expect( el.hasStyle( 'padding-top', 'margin-left', 'color' ) ).toBe( true );
				expect( el.hasStyle( 'padding-top', 'padding-left' ) ).toBe( false );
			} );
		} );

		describe( '_removeStyle()', () => {
			it( 'should remove style', () => {
				el._setStyle( 'padding-top', '10px' );
				el._removeStyle( 'padding-top' );

				expect( el.hasStyle( 'padding-top' ) ).toBe( false );
			} );

			it( 'should fire change event with attributes type', () => {
				el._setStyle( 'color', 'red' );
				return new Promise( resolve => {
					el.once( 'change:attributes', eventInfo => {
						expect( eventInfo.source ).toBe( el );
						resolve();
					} );

					el._removeStyle( 'color' );
				} );
			} );

			it( 'should remove multiple styles', () => {
				el._setStyle( {
					'padding-top': '10px',
					'margin-top': '10px',
					'color': 'red'
				} );
				el._removeStyle( [ 'padding-top', 'margin-top' ] );

				expect( el.hasStyle( 'padding-top' ) ).toBe( false );
				expect( el.hasStyle( 'margin-top' ) ).toBe( false );
				expect( el.hasStyle( 'color' ) ).toBe( true );
			} );
		} );
	} );

	describe( 'findAncestor', () => {
		it( 'should return null if element have no ancestor', () => {
			const el = new ViewElement( document, 'p' );

			expect( el.findAncestor( 'div' ) ).toBeNull();
		} );

		it( 'should return ancestor if matching', () => {
			const el1 = new ViewElement( document, 'p' );
			const el2 = new ViewElement( document, 'div', null, el1 );

			expect( el1.findAncestor( 'div' ) ).toBe( el2 );
		} );

		it( 'should return parent\'s ancestor if matching', () => {
			const el1 = new ViewElement( document, 'p' );
			const el2 = new ViewElement( document, 'div', null, el1 );
			const el3 = new ViewElement( document, 'div', { class: 'foo bar' }, el2 );

			expect( el1.findAncestor( { classes: 'foo' } ) ).toBe( el3 );
		} );

		it( 'should return null if no matches found', () => {
			const el1 = new ViewElement( document, 'p' );
			new ViewElement( document, 'div', null, el1 ); // eslint-disable-line no-new

			expect( el1.findAncestor( {
				name: 'div',
				classes: 'container'
			} ) ).toBeNull();
		} );
	} );

	describe( 'custom properties', () => {
		it( 'should allow to set and get custom properties', () => {
			const el = new ViewElement( document, 'p' );
			el._setCustomProperty( 'foo', 'bar' );

			expect( el.getCustomProperty( 'foo' ) ).toBe( 'bar' );
		} );

		it( 'should allow to add symbol property', () => {
			const el = new ViewElement( document, 'p' );
			const symbol = Symbol( 'custom' );
			el._setCustomProperty( symbol, 'bar' );

			expect( el.getCustomProperty( symbol ) ).toBe( 'bar' );
		} );

		it( 'should allow to remove custom property', () => {
			const el = new ViewElement( document, 'foo' );
			const symbol = Symbol( 'quix' );
			el._setCustomProperty( 'bar', 'baz' );
			el._setCustomProperty( symbol, 'test' );

			expect( el.getCustomProperty( 'bar' ) ).toBe( 'baz' );
			expect( el.getCustomProperty( symbol ) ).toBe( 'test' );

			el._removeCustomProperty( 'bar' );
			el._removeCustomProperty( symbol );

			expect( el.getCustomProperty( 'bar' ) ).toBeUndefined();
			expect( el.getCustomProperty( symbol ) ).toBeUndefined();
		} );

		it( 'should allow to iterate over custom properties', () => {
			const el = new ViewElement( document, 'p' );
			el._setCustomProperty( 'foo', 1 );
			el._setCustomProperty( 'bar', 2 );
			el._setCustomProperty( 'baz', 3 );

			const properties = [ ...el.getCustomProperties() ];

			expect( properties[ 0 ][ 0 ] ).toBe( 'foo' );
			expect( properties[ 0 ][ 1 ] ).toBe( 1 );
			expect( properties[ 1 ][ 0 ] ).toBe( 'bar' );
			expect( properties[ 1 ][ 1 ] ).toBe( 2 );
			expect( properties[ 2 ][ 0 ] ).toBe( 'baz' );
			expect( properties[ 2 ][ 1 ] ).toBe( 3 );
		} );
	} );

	describe( 'getIdentity()', () => {
		it( 'should return only name if no other attributes are present', () => {
			const el = new ViewElement( document, 'foo' );

			expect( el.getIdentity() ).toBe( 'foo' );
		} );

		it( 'should return classes in sorted order', () => {
			const el = new ViewElement( document, 'fruit' );
			el._addClass( [ 'banana', 'lemon', 'apple' ] );

			expect( el.getIdentity() ).toBe( 'fruit class="apple,banana,lemon"' );
		} );

		it( 'should return styles in sorted order', () => {
			const el = new ViewElement( document, 'foo', {
				style: 'margin-top: 2em; background-color: red'
			} );

			expect( el.getIdentity() ).toBe( 'foo style="background-color:red;margin-top:2em;"' );
		} );

		it( 'should return attributes in sorted order', () => {
			const el = new ViewElement( document, 'foo', {
				a: 1,
				d: 4,
				b: 3
			} );

			expect( el.getIdentity() ).toBe( 'foo a="1" b="3" d="4"' );
		} );

		it( 'should return classes, styles and attributes', () => {
			const el = new ViewElement( document, 'baz', {
				foo: 'one',
				bar: 'two',
				style: 'text-align:center;border-radius:10px'
			} );

			el._addClass( [ 'three', 'two', 'one' ] );

			expect( el.getIdentity() ).toBe( 'baz class="one,three,two" style="border-radius:10px;text-align:center;" bar="two" foo="one"'
			);
		} );
	} );

	describe( 'shouldRenderUnsafeAttribute()', () => {
		let element;

		beforeEach( () => {
			element = new ViewElement( document, 'p' );
		} );

		it( 'should return true if the atribute name is among unsafe attributes', () => {
			element._unsafeAttributesToRender = [ 'foo', 'bar', 'baz' ];

			expect( element.shouldRenderUnsafeAttribute( 'foo' ) ).toBe( true );
			expect( element.shouldRenderUnsafeAttribute( 'bar' ) ).toBe( true );
			expect( element.shouldRenderUnsafeAttribute( 'baz' ) ).toBe( true );
		} );

		it( 'should return false if the atribute name is not among unsafe attributes', () => {
			element._unsafeAttributesToRender = [ 'foo', 'bar', 'baz' ];

			expect( element.shouldRenderUnsafeAttribute( 'abc' ) ).toBe( false );
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should provide node type, root name, path, child nodes, and attributes', () => {
			const text = new ViewText( document, 'foo' );
			const paragraph = new ViewElement( document, 'p', { class: 'abc  asd', style: 'color:red', align: 'right' } );
			const root = new ViewRootEditableElement( document, 'div' );
			paragraph._appendChild( text );
			root._appendChild( paragraph );

			const json = JSON.stringify( paragraph );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				name: 'p',
				path: [ 0 ],
				root: 'main',
				type: 'Element',
				attributes: {
					align: 'right',
					class: 'abc asd',
					style: 'color:red;'
				},
				children: [
					{
						data: 'foo',
						path: [ 0, 0 ],
						root: 'main',
						type: 'Text'
					}
				]
			} );
		} );
	} );
} );
