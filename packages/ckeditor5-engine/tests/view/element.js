/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import count from '@ckeditor/ckeditor5-utils/src/count';
import Node from '../../src/view/node';
import Element from '../../src/view/element';
import Text from '../../src/view/text';
import TextProxy from '../../src/view/textproxy';
import Document from '../../src/view/document';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'Element', () => {
	let document;

	beforeEach( () => {
		document = new Document( new StylesProcessor() );
	} );

	describe( 'constructor()', () => {
		it( 'should create element without attributes', () => {
			const el = new Element( document, 'p' );

			expect( el ).to.be.an.instanceof( Node );
			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
			expect( el ).to.have.property( 'parent' ).that.is.null;
			expect( count( el.getAttributeKeys() ) ).to.equal( 0 );
		} );

		it( 'should create element with attributes as plain object', () => {
			const el = new Element( document, 'p', { foo: 'bar' } );

			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
			expect( count( el.getAttributeKeys() ) ).to.equal( 1 );
			expect( el.getAttribute( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should create element with attributes as map', () => {
			const attrs = new Map();
			attrs.set( 'foo', 'bar' );

			const el = new Element( document, 'p', attrs );

			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
			expect( count( el.getAttributeKeys() ) ).to.equal( 1 );
			expect( el.getAttribute( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should stringify attributes', () => {
			const el = new Element( document, 'p', { foo: true, bar: null, object: {} } );

			expect( el.getAttribute( 'foo' ) ).to.equal( 'true' );
			expect( el.getAttribute( 'bar' ) ).to.be.undefined;
			expect( el.getAttribute( 'object' ) ).to.equal( '[object Object]' );
		} );

		it( 'should create element with children', () => {
			const child = new Element( document, 'p', { foo: 'bar' } );
			const parent = new Element( document, 'div', [], [ child ] );

			expect( parent ).to.have.property( 'name' ).that.equals( 'div' );
			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'p' );
		} );

		it( 'should move class attribute to class set ', () => {
			const el = new Element( document, 'p', { id: 'test', class: 'one two three' } );

			expect( el._attrs.has( 'class' ) ).to.be.false;
			expect( el._attrs.has( 'id' ) ).to.be.true;
			expect( el._classes.has( 'one' ) ).to.be.true;
			expect( el._classes.has( 'two' ) ).to.be.true;
			expect( el._classes.has( 'three' ) ).to.be.true;
		} );

		it( 'should move style attribute to style proxy', () => {
			const el = new Element( document, 'p', { id: 'test', style: 'one: style1; two:style2 ; three : url(http://ckeditor.com)' } );

			expect( el._attrs.has( 'style' ) ).to.be.false;
			expect( el._attrs.has( 'id' ) ).to.be.true;

			expect( el._styles.has( 'one' ) ).to.be.true;
			expect( el._styles.getAsString( 'one' ) ).to.equal( 'style1' );
			expect( el._styles.has( 'two' ) ).to.be.true;
			expect( el._styles.getAsString( 'two' ) ).to.equal( 'style2' );
			expect( el._styles.has( 'three' ) ).to.be.true;
			expect( el._styles.getAsString( 'three' ) ).to.equal( 'url(http://ckeditor.com)' );
		} );
	} );

	describe( 'is()', () => {
		let el;

		before( () => {
			el = new Element( document, 'p' );
		} );

		it( 'should return true for node, element, element with correct name and element name', () => {
			expect( el.is( 'node' ) ).to.be.true;
			expect( el.is( 'view:node' ) ).to.be.true;
			expect( el.is( 'element' ) ).to.be.true;
			expect( el.is( 'view:element' ) ).to.be.true;
			expect( el.is( 'element', 'p' ) ).to.be.true;
			expect( el.is( 'view:element', 'p' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'element', 'span' ) ).to.be.false;
			expect( el.is( 'view:element', 'span' ) ).to.be.false;
			expect( el.is( 'element', 'span' ) ).to.be.false;
			expect( el.is( 'view:span' ) ).to.be.false;
			expect( el.is( '$text' ) ).to.be.false;
			expect( el.is( 'view:$text' ) ).to.be.false;
			expect( el.is( '$textProxy' ) ).to.be.false;
			expect( el.is( 'containerElement' ) ).to.be.false;
			expect( el.is( 'attributeElement' ) ).to.be.false;
			expect( el.is( 'uiElement' ) ).to.be.false;
			expect( el.is( 'emptyElement' ) ).to.be.false;
			expect( el.is( 'view:emptyElement' ) ).to.be.false;
			expect( el.is( 'rootElement' ) ).to.be.false;
			expect( el.is( 'view:ootElement' ) ).to.be.false;
			expect( el.is( 'documentFragment' ) ).to.be.false;
			expect( el.is( 'node', 'p' ) ).to.be.false;
			expect( el.is( 'view:node', 'p' ) ).to.be.false;
		} );
	} );

	describe( 'isEmpty', () => {
		it( 'should return true if there are no children in element', () => {
			const element = new Element( document, 'p' );

			expect( element.isEmpty ).to.be.true;
		} );

		it( 'should return false if there are children in element', () => {
			const fragment = new Element( document, 'p', null, new Element( document, 'img' ) );

			expect( fragment.isEmpty ).to.be.false;
		} );
	} );

	describe( '_clone()', () => {
		it( 'should clone element', () => {
			const el = new Element( document, 'p', { attr1: 'foo', attr2: 'bar' } );
			const clone = el._clone();

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone.getAttribute( 'attr1' ) ).to.equal( 'foo' );
			expect( clone.getAttribute( 'attr2' ) ).to.equal( 'bar' );
		} );

		it( 'should deeply clone element', () => {
			const el = new Element( document, 'p', { attr1: 'foo', attr2: 'bar' }, [
				new Element( document, 'b', { attr: 'baz' } ),
				new Element( document, 'span', { attr: 'qux' } )
			] );
			const count = el.childCount;
			const clone = el._clone( true );

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone.getAttribute( 'attr1' ) ).to.equal( 'foo' );
			expect( clone.getAttribute( 'attr2' ) ).to.equal( 'bar' );
			expect( clone.childCount ).to.equal( count );

			for ( let i = 0; i < count; i++ ) {
				const child = el.getChild( i );
				const clonedChild = clone.getChild( i );

				expect( clonedChild ).to.not.equal( child );
				expect( clonedChild.name ).to.equal( child.name );
				expect( clonedChild.getAttribute( 'attr' ) ).to.equal( child.getAttribute( 'attr' ) );
			}
		} );

		it( 'shouldn\'t clone any children when deep copy is not performed', () => {
			const el = new Element( document, 'p', { attr1: 'foo', attr2: 'bar' }, [
				new Element( document, 'b', { attr: 'baz' } ),
				new Element( document, 'span', { attr: 'qux' } )
			] );
			const clone = el._clone( false );

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone.getAttribute( 'attr1' ) ).to.equal( 'foo' );
			expect( clone.getAttribute( 'attr2' ) ).to.equal( 'bar' );
			expect( clone.childCount ).to.equal( 0 );
		} );

		it( 'should clone class attribute', () => {
			const el = new Element( document, 'p', { foo: 'bar' } );
			el._addClass( [ 'baz', 'qux' ] );
			const clone = el._clone( false );

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( clone.getAttribute( 'class' ) ).to.equal( 'baz qux' );
		} );

		it( 'should clone style attribute', () => {
			const el = new Element( document, 'p', { style: 'color: red; font-size: 12px;' } );
			const clone = el._clone( false );

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone._styles.has( 'color' ) ).to.be.true;
			expect( clone._styles.getAsString( 'color' ) ).to.equal( 'red' );
			expect( clone._styles.has( 'font-size' ) ).to.be.true;
			expect( clone._styles.getAsString( 'font-size' ) ).to.equal( '12px' );
		} );

		it( 'should clone custom properties', () => {
			const el = new Element( document, 'p' );
			const symbol = Symbol( 'custom' );
			el._setCustomProperty( 'foo', 'bar' );
			el._setCustomProperty( symbol, 'baz' );

			const cloned = el._clone();

			expect( cloned.getCustomProperty( 'foo' ) ).to.equal( 'bar' );
			expect( cloned.getCustomProperty( symbol ) ).to.equal( 'baz' );
		} );

		it( 'should clone getFillerOffset', () => {
			const el = new Element( document, 'p' );
			const fm = () => 'foo bar';

			expect( el.getFillerOffset ).to.be.undefined;
			el.getFillerOffset = fm;

			const cloned = el._clone();

			expect( cloned.getFillerOffset ).to.equal( fm );
		} );
	} );

	describe( 'isSimilar()', () => {
		let el;

		beforeEach( () => {
			el = new Element( document, 'p', { foo: 'bar' } );
		} );

		it( 'should return false when comparing to non-element', () => {
			expect( el.isSimilar( null ) ).to.be.false;
			expect( el.isSimilar( {} ) ).to.be.false;
		} );

		it( 'should return true when the same node is provided', () => {
			expect( el.isSimilar( el ) ).to.be.true;
		} );

		it( 'should return true for element with same attributes and name', () => {
			const other = new Element( document, 'p', { foo: 'bar' } );
			expect( el.isSimilar( other ) ).to.be.true;
		} );

		it( 'should return false when name is not the same', () => {
			const other = el._clone();
			other.name = 'div';

			expect( el.isSimilar( other ) ).to.be.false;
		} );

		it( 'should return false when attributes are not the same', () => {
			const other1 = el._clone();
			const other2 = el._clone();
			const other3 = el._clone();
			other1._setAttribute( 'baz', 'qux' );
			other2._setAttribute( 'foo', 'not-bar' );
			other3._removeAttribute( 'foo' );
			expect( el.isSimilar( other1 ) ).to.be.false;
			expect( el.isSimilar( other2 ) ).to.be.false;
			expect( el.isSimilar( other3 ) ).to.be.false;
		} );

		it( 'should compare class attribute', () => {
			const el1 = new Element( document, 'p' );
			const el2 = new Element( document, 'p' );
			const el3 = new Element( document, 'p' );
			const el4 = new Element( document, 'p' );

			el1._addClass( [ 'foo', 'bar' ] );
			el2._addClass( [ 'bar', 'foo' ] );
			el3._addClass( 'baz' );
			el4._addClass( [ 'baz', 'bar' ] );

			expect( el1.isSimilar( el2 ) ).to.be.true;
			expect( el1.isSimilar( el3 ) ).to.be.false;
			expect( el1.isSimilar( el4 ) ).to.be.false;
		} );

		describe( 'comparing styles', () => {
			let element, other;

			beforeEach( () => {
				element = new Element( document, 'p' );
				other = new Element( document, 'p' );

				element._setStyle( 'color', 'red' );
				element._setStyle( 'top', '10px' );
			} );

			it( 'should return true when both elements have the same styles set (same order)', () => {
				other._setStyle( 'color', 'red' );
				other._setStyle( 'top', '10px' );

				expect( element.isSimilar( other ) ).to.be.true;
			} );

			it( 'should return true when both elements have the same styles set (different order)', () => {
				other._setStyle( 'top', '10px' );
				other._setStyle( 'color', 'red' );

				expect( element.isSimilar( other ) ).to.be.true;
			} );

			it( 'should return false when the other has fewer styles', () => {
				other._setStyle( 'top', '20px' );

				expect( element.isSimilar( other ) ).to.be.false;
			} );

			it( 'should return false when the other has fewer styles (but with same values)', () => {
				other._setStyle( 'top', '10px' );

				expect( element.isSimilar( other ) ).to.be.false;
			} );

			it( 'should return false when the other has more styles', () => {
				other._setStyle( 'top', '10px' );
				other._setStyle( 'color', 'red' );
				other._setStyle( 'bottom', '10px' );

				expect( element.isSimilar( other ) ).to.be.false;
			} );

			it( 'should return false when the other has the same styles set but with different values', () => {
				other._setStyle( 'top', '10px' );
				other._setStyle( 'color', 'blue' );

				expect( element.isSimilar( other ) ).to.be.false;
			} );
		} );
	} );

	describe( 'children manipulation methods', () => {
		let parent, el1, el2, el3, el4;

		beforeEach( () => {
			parent = new Element( document, 'p' );
			el1 = new Element( document, 'el1' );
			el2 = new Element( document, 'el2' );
			el3 = new Element( document, 'el3' );
			el4 = new Element( document, 'el4' );
		} );

		describe( 'insertion', () => {
			it( 'should insert children', () => {
				const count1 = parent._insertChild( 0, [ el1, el3 ] );
				const count2 = parent._insertChild( 1, el2 );

				expect( parent.childCount ).to.equal( 3 );
				expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( parent.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el2' );
				expect( parent.getChild( 2 ) ).to.have.property( 'name' ).that.equals( 'el3' );
				expect( count1 ).to.equal( 2 );
				expect( count2 ).to.equal( 1 );
			} );

			it( 'should accept strings', () => {
				parent._insertChild( 0, 'abc' );

				expect( parent.childCount ).to.equal( 1 );
				expect( parent.getChild( 0 ) ).to.have.property( 'data' ).that.equals( 'abc' );

				parent._removeChildren( 0, 1 );
				parent._insertChild( 0, [ new Element( document, 'p' ), 'abc' ] );

				expect( parent.childCount ).to.equal( 2 );
				expect( parent.getChild( 1 ) ).to.have.property( 'data' ).that.equals( 'abc' );
			} );

			it( 'should append children', () => {
				const count1 = parent._insertChild( 0, el1 );
				const count2 = parent._appendChild( el2 );
				const count3 = parent._appendChild( el3 );

				expect( parent.childCount ).to.equal( 3 );
				expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( parent.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el2' );
				expect( parent.getChild( 2 ) ).to.have.property( 'name' ).that.equals( 'el3' );
				expect( count1 ).to.equal( 1 );
				expect( count2 ).to.equal( 1 );
				expect( count3 ).to.equal( 1 );
			} );

			it( 'should accept and correctly handle text proxies', () => {
				const element = new Element( document, 'div' );
				const text = new Text( document, 'abcxyz' );
				const textProxy = new TextProxy( text, 2, 3 );

				element._insertChild( 0, textProxy );

				expect( element.childCount ).to.equal( 1 );
				expect( element.getChild( 0 ) ).to.be.instanceof( Text );
				expect( element.getChild( 0 ).data ).to.equal( 'cxy' );
			} );

			it( 'set proper #document on inserted children', () => {
				const anotherDocument = new Document( new StylesProcessor() );
				const anotherEl = new Element( anotherDocument, 'p' );

				parent._insertChild( 0, anotherEl );

				expect( anotherEl.document ).to.equal( document );
			} );
		} );

		describe( 'getChildIndex', () => {
			it( 'should return child index', () => {
				parent._appendChild( el1 );
				parent._appendChild( el2 );
				parent._appendChild( el3 );

				expect( parent.childCount ).to.equal( 3 );
				expect( parent.getChildIndex( el1 ) ).to.equal( 0 );
				expect( parent.getChildIndex( el2 ) ).to.equal( 1 );
				expect( parent.getChildIndex( el3 ) ).to.equal( 2 );
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
					expect( child ).to.equal( expected[ i ] );
					i++;
				}

				expect( i ).to.equal( 3 );
			} );
		} );

		describe( '_removeChildren', () => {
			it( 'should remove children', () => {
				parent._appendChild( el1 );
				parent._appendChild( el2 );
				parent._appendChild( el3 );
				parent._appendChild( el4 );

				parent._removeChildren( 1, 2 );

				expect( parent.childCount ).to.equal( 2 );
				expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( parent.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el4' );

				expect( el1.parent ).to.equal( parent );
				expect( el2.parent ).to.be.null;
				expect( el3.parent ).to.be.null;
				expect( el4.parent ).equal( parent );
			} );

			it( 'should remove one child when second parameter is not specified', () => {
				parent._appendChild( el1 );
				parent._appendChild( el2 );
				parent._appendChild( el3 );

				const removed = parent._removeChildren( 1 );

				expect( parent.childCount ).to.equal( 2 );
				expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( parent.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el3' );

				expect( removed.length ).to.equal( 1 );
				expect( removed[ 0 ] ).to.have.property( 'name' ).that.equals( 'el2' );
			} );
		} );
	} );

	describe( 'attributes manipulation methods', () => {
		let el;

		beforeEach( () => {
			el = new Element( document, 'p' );
		} );

		describe( '_setAttribute', () => {
			it( 'should set attribute', () => {
				el._setAttribute( 'foo', 'bar' );

				expect( el._attrs.has( 'foo' ) ).to.be.true;
				expect( el._attrs.get( 'foo' ) ).to.equal( 'bar' );
			} );

			it( 'should cast attribute value to a string', () => {
				el._setAttribute( 'foo', true );

				expect( el._attrs.get( 'foo' ) ).to.equal( 'true' );
			} );

			it( 'should fire change event with attributes type', done => {
				el.once( 'change:attributes', eventInfo => {
					expect( eventInfo.source ).to.equal( el );
					done();
				} );

				el._setAttribute( 'foo', 'bar' );
			} );

			it( 'should set class', () => {
				el._setAttribute( 'class', 'foo bar' );

				expect( el._attrs.has( 'class' ) ).to.be.false;
				expect( el._classes.has( 'foo' ) ).to.be.true;
				expect( el._classes.has( 'bar' ) ).to.be.true;
			} );

			it( 'should replace all existing classes', () => {
				el._setAttribute( 'class', 'foo bar baz' );
				el._setAttribute( 'class', 'qux' );

				expect( el._classes.has( 'foo' ) ).to.be.false;
				expect( el._classes.has( 'bar' ) ).to.be.false;
				expect( el._classes.has( 'baz' ) ).to.be.false;
				expect( el._classes.has( 'qux' ) ).to.be.true;
			} );

			it( 'should replace all styles', () => {
				el._setStyle( 'color', 'red' );
				el._setStyle( 'top', '10px' );
				el._setAttribute( 'style', 'margin-top:2em;' );

				expect( el.hasStyle( 'color' ) ).to.be.false;
				expect( el.hasStyle( 'top' ) ).to.be.false;
				expect( el.hasStyle( 'margin-top' ) ).to.be.true;
				expect( el.getStyle( 'margin-top' ) ).to.equal( '2em' );
			} );
		} );

		describe( 'getAttribute', () => {
			it( 'should return attribute', () => {
				el._setAttribute( 'foo', 'bar' );

				expect( el.getAttribute( 'foo' ) ).to.equal( 'bar' );
				expect( el.getAttribute( 'bom' ) ).to.not.be.ok;
			} );

			it( 'should return class attribute', () => {
				el._addClass( [ 'foo', 'bar' ] );

				expect( el.getAttribute( 'class' ) ).to.equal( 'foo bar' );
			} );

			it( 'should return undefined if no class attribute', () => {
				expect( el.getAttribute( 'class' ) ).to.be.undefined;
			} );

			it( 'should return style attribute', () => {
				el._setStyle( 'color', 'red' );
				el._setStyle( 'top', '10px' );

				expect( el.getAttribute( 'style' ) ).to.equal( 'color:red;top:10px;' );
			} );

			it( 'should return undefined if no style attribute', () => {
				expect( el.getAttribute( 'style' ) ).to.be.undefined;
			} );
		} );

		describe( 'getAttributes', () => {
			it( 'should return attributes', () => {
				el._setAttribute( 'foo', 'bar' );
				el._setAttribute( 'abc', 'xyz' );

				expect( Array.from( el.getAttributes() ) ).to.deep.equal( [ [ 'foo', 'bar' ], [ 'abc', 'xyz' ] ] );
			} );

			it( 'should return class and style attribute', () => {
				el._setAttribute( 'class', 'abc' );
				el._setAttribute( 'style', 'width:20px;' );
				el._addClass( 'xyz' );
				el._setStyle( 'font-weight', 'bold' );

				expect( Array.from( el.getAttributes() ) ).to.deep.equal( [
					[ 'class', 'abc xyz' ], [ 'style', 'font-weight:bold;width:20px;' ]
				] );
			} );
		} );

		describe( 'hasAttribute', () => {
			it( 'should return true if element has attribute', () => {
				el._setAttribute( 'foo', 'bar' );

				expect( el.hasAttribute( 'foo' ) ).to.be.true;
				expect( el.hasAttribute( 'bom' ) ).to.be.false;
			} );

			it( 'should return true if element has class attribute', () => {
				expect( el.hasAttribute( 'class' ) ).to.be.false;
				el._addClass( 'foo' );
				expect( el.hasAttribute( 'class' ) ).to.be.true;
			} );

			it( 'should return true if element has style attribute', () => {
				expect( el.hasAttribute( 'style' ) ).to.be.false;
				el._setStyle( 'border', '1px solid red' );
				expect( el.hasAttribute( 'style' ) ).to.be.true;
			} );
		} );

		describe( 'getAttributeKeys', () => {
			it( 'should return keys', () => {
				el._setAttribute( 'foo', true );
				el._setAttribute( 'bar', true );

				const expected = [ 'foo', 'bar' ];
				let i = 0;

				for ( const key of el.getAttributeKeys() ) {
					expect( key ).to.equal( expected[ i ] );
					i++;
				}

				expect( i ).to.equal( 2 );
			} );

			it( 'should return class key', () => {
				el._addClass( 'foo' );
				el._setAttribute( 'bar', true );
				const expected = [ 'class', 'bar' ];
				let i = 0;

				for ( const key of el.getAttributeKeys() ) {
					expect( key ).to.equal( expected[ i ] );
					i++;
				}
			} );

			it( 'should return style key', () => {
				el._setStyle( 'color', 'black' );
				el._setAttribute( 'bar', true );
				const expected = [ 'style', 'bar' ];
				let i = 0;

				for ( const key of el.getAttributeKeys() ) {
					expect( key ).to.equal( expected[ i ] );
					i++;
				}
			} );
		} );

		describe( '_removeAttribute', () => {
			it( 'should remove attributes', () => {
				el._setAttribute( 'foo', true );

				expect( el.hasAttribute( 'foo' ) ).to.be.true;

				el._removeAttribute( 'foo' );

				expect( el.hasAttribute( 'foo' ) ).to.be.false;

				expect( count( el.getAttributeKeys() ) ).to.equal( 0 );
			} );

			it( 'should fire change event with attributes type', done => {
				el._setAttribute( 'foo', 'bar' );
				el.once( 'change:attributes', eventInfo => {
					expect( eventInfo.source ).to.equal( el );
					done();
				} );

				el._removeAttribute( 'foo' );
			} );

			it( 'should remove class attribute', () => {
				el._addClass( [ 'foo', 'bar' ] );
				const el2 = new Element( document, 'p' );
				const removed1 = el._removeAttribute( 'class' );
				const removed2 = el2._removeAttribute( 'class' );

				expect( el.hasAttribute( 'class' ) ).to.be.false;
				expect( el.hasClass( 'foo' ) ).to.be.false;
				expect( el.hasClass( 'bar' ) ).to.be.false;
				expect( removed1 ).to.be.true;
				expect( removed2 ).to.be.false;
			} );

			it( 'should remove style attribute', () => {
				el._setStyle( 'color', 'red' );
				el._setStyle( 'position', 'fixed' );
				const el2 = new Element( document, 'p' );
				const removed1 = el._removeAttribute( 'style' );
				const removed2 = el2._removeAttribute( 'style' );

				expect( el.hasAttribute( 'style' ) ).to.be.false;
				expect( el.hasStyle( 'color' ) ).to.be.false;
				expect( el.hasStyle( 'position' ) ).to.be.false;
				expect( removed1 ).to.be.true;
				expect( removed2 ).to.be.false;
			} );
		} );
	} );

	describe( 'classes manipulation methods', () => {
		let el;

		beforeEach( () => {
			el = new Element( document, 'p' );
		} );

		describe( '_addClass()', () => {
			it( 'should add single class', () => {
				el._addClass( 'one' );

				expect( el._classes.has( 'one' ) ).to.be.true;
			} );

			it( 'should fire change event with attributes type', done => {
				el.once( 'change:attributes', eventInfo => {
					expect( eventInfo.source ).to.equal( el );
					done();
				} );

				el._addClass( 'one' );
			} );

			it( 'should add multiple classes', () => {
				el._addClass( [ 'one', 'two', 'three' ] );

				expect( el._classes.has( 'one' ) ).to.be.true;
				expect( el._classes.has( 'two' ) ).to.be.true;
				expect( el._classes.has( 'three' ) ).to.be.true;
			} );
		} );

		describe( '_removeClass()', () => {
			it( 'should remove single class', () => {
				el._addClass( [ 'one', 'two', 'three' ] );

				el._removeClass( 'one' );

				expect( el._classes.has( 'one' ) ).to.be.false;
				expect( el._classes.has( 'two' ) ).to.be.true;
				expect( el._classes.has( 'three' ) ).to.be.true;
			} );

			it( 'should fire change event with attributes type', done => {
				el._addClass( 'one' );
				el.once( 'change:attributes', eventInfo => {
					expect( eventInfo.source ).to.equal( el );
					done();
				} );

				el._removeClass( 'one' );
			} );

			it( 'should remove multiple classes', () => {
				el._addClass( [ 'one', 'two', 'three', 'four' ] );
				el._removeClass( [ 'one', 'two', 'three' ] );

				expect( el._classes.has( 'one' ) ).to.be.false;
				expect( el._classes.has( 'two' ) ).to.be.false;
				expect( el._classes.has( 'three' ) ).to.be.false;
				expect( el._classes.has( 'four' ) ).to.be.true;
			} );
		} );

		describe( 'hasClass', () => {
			it( 'should check if element has a class', () => {
				el._addClass( [ 'one', 'two', 'three' ] );

				expect( el.hasClass( 'one' ) ).to.be.true;
				expect( el.hasClass( 'two' ) ).to.be.true;
				expect( el.hasClass( 'three' ) ).to.be.true;
				expect( el.hasClass( 'four' ) ).to.be.false;
			} );

			it( 'should check if element has multiple classes', () => {
				el._addClass( [ 'one', 'two', 'three' ] );

				expect( el.hasClass( 'one', 'two' ) ).to.be.true;
				expect( el.hasClass( 'three', 'two' ) ).to.be.true;
				expect( el.hasClass( 'three', 'one', 'two' ) ).to.be.true;
				expect( el.hasClass( 'three', 'one', 'two', 'zero' ) ).to.be.false;
			} );
		} );

		describe( 'getClassNames', () => {
			it( 'should return iterator with all class names', () => {
				const names = [ 'one', 'two', 'three' ];
				el._addClass( names );
				const iterator = el.getClassNames();
				let i = 0;

				for ( const name of iterator ) {
					expect( name ).to.equal( names[ i++ ] );
				}
			} );
		} );
	} );

	describe( 'styles manipulation methods', () => {
		let el;

		beforeEach( () => {
			el = new Element( document, 'p' );
		} );

		describe( '_setStyle()', () => {
			it( 'should set element style', () => {
				el._setStyle( 'color', 'red' );

				expect( el._styles._styles.color ).to.equal( 'red' );
			} );

			it( 'should fire change event with attributes type', done => {
				el.once( 'change:attributes', eventInfo => {
					expect( eventInfo.source ).to.equal( el );
					done();
				} );

				el._setStyle( 'color', 'red' );
			} );

			it( 'should set multiple styles by providing an object', () => {
				el._setStyle( {
					color: 'red',
					position: 'fixed'
				} );

				expect( el._styles._styles.color ).to.equal( 'red' );
				expect( el._styles._styles.position ).to.equal( 'fixed' );
			} );
		} );

		describe( 'getStyle', () => {
			it( 'should get style', () => {
				el._setStyle( {
					color: 'red',
					'margin-top': '1px'
				} );

				expect( el.getStyle( 'color' ) ).to.equal( 'red' );
				expect( el.getStyle( 'margin-top' ) ).to.equal( '1px' );
			} );
		} );

		describe( 'getNormalizedStyle', () => {
			it( 'should get normalized style', () => {
				el._setStyle( {
					color: 'red',
					'margin-top': '1px'
				} );

				expect( el.getNormalizedStyle( 'color' ) ).to.equal( 'red' );
				expect( el.getNormalizedStyle( 'margin-top' ) ).to.equal( '1px' );
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
					expect( name ).to.equal( names[ i++ ] );
				}
			} );
		} );

		describe( 'hasStyle', () => {
			it( 'should check if element has a style', () => {
				el._setStyle( 'padding-top', '10px' );

				expect( el.hasStyle( 'padding-top' ) ).to.be.true;
				expect( el.hasStyle( 'padding-left' ) ).to.be.false;
			} );

			it( 'should check if element has multiple styles', () => {
				el._setStyle( {
					'padding-top': '10px',
					'margin-left': '10px',
					'color': '10px;'
				} );

				expect( el.hasStyle( 'padding-top', 'margin-left' ) ).to.be.true;
				expect( el.hasStyle( 'padding-top', 'margin-left', 'color' ) ).to.be.true;
				expect( el.hasStyle( 'padding-top', 'padding-left' ) ).to.be.false;
			} );
		} );

		describe( '_removeStyle()', () => {
			it( 'should remove style', () => {
				el._setStyle( 'padding-top', '10px' );
				el._removeStyle( 'padding-top' );

				expect( el.hasStyle( 'padding-top' ) ).to.be.false;
			} );

			it( 'should fire change event with attributes type', done => {
				el._setStyle( 'color', 'red' );
				el.once( 'change:attributes', eventInfo => {
					expect( eventInfo.source ).to.equal( el );
					done();
				} );

				el._removeStyle( 'color' );
			} );

			it( 'should remove multiple styles', () => {
				el._setStyle( {
					'padding-top': '10px',
					'margin-top': '10px',
					'color': 'red'
				} );
				el._removeStyle( [ 'padding-top', 'margin-top' ] );

				expect( el.hasStyle( 'padding-top' ) ).to.be.false;
				expect( el.hasStyle( 'margin-top' ) ).to.be.false;
				expect( el.hasStyle( 'color' ) ).to.be.true;
			} );
		} );
	} );

	describe( 'findAncestor', () => {
		it( 'should return null if element have no ancestor', () => {
			const el = new Element( document, 'p' );

			expect( el.findAncestor( 'div' ) ).to.be.null;
		} );

		it( 'should return ancestor if matching', () => {
			const el1 = new Element( document, 'p' );
			const el2 = new Element( document, 'div', null, el1 );

			expect( el1.findAncestor( 'div' ) ).to.equal( el2 );
		} );

		it( 'should return parent\'s ancestor if matching', () => {
			const el1 = new Element( document, 'p' );
			const el2 = new Element( document, 'div', null, el1 );
			const el3 = new Element( document, 'div', { class: 'foo bar' }, el2 );

			expect( el1.findAncestor( { classes: 'foo' } ) ).to.equal( el3 );
		} );

		it( 'should return null if no matches found', () => {
			const el1 = new Element( document, 'p' );
			new Element( document, 'div', null, el1 ); // eslint-disable-line no-new

			expect( el1.findAncestor( {
				name: 'div',
				classes: 'container'
			} ) ).to.be.null;
		} );
	} );

	describe( 'custom properties', () => {
		it( 'should allow to set and get custom properties', () => {
			const el = new Element( document, 'p' );
			el._setCustomProperty( 'foo', 'bar' );

			expect( el.getCustomProperty( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should allow to add symbol property', () => {
			const el = new Element( document, 'p' );
			const symbol = Symbol( 'custom' );
			el._setCustomProperty( symbol, 'bar' );

			expect( el.getCustomProperty( symbol ) ).to.equal( 'bar' );
		} );

		it( 'should allow to remove custom property', () => {
			const el = new Element( document, 'foo' );
			const symbol = Symbol( 'quix' );
			el._setCustomProperty( 'bar', 'baz' );
			el._setCustomProperty( symbol, 'test' );

			expect( el.getCustomProperty( 'bar' ) ).to.equal( 'baz' );
			expect( el.getCustomProperty( symbol ) ).to.equal( 'test' );

			el._removeCustomProperty( 'bar' );
			el._removeCustomProperty( symbol );

			expect( el.getCustomProperty( 'bar' ) ).to.be.undefined;
			expect( el.getCustomProperty( symbol ) ).to.be.undefined;
		} );

		it( 'should allow to iterate over custom properties', () => {
			const el = new Element( document, 'p' );
			el._setCustomProperty( 'foo', 1 );
			el._setCustomProperty( 'bar', 2 );
			el._setCustomProperty( 'baz', 3 );

			const properties = [ ...el.getCustomProperties() ];

			expect( properties[ 0 ][ 0 ] ).to.equal( 'foo' );
			expect( properties[ 0 ][ 1 ] ).to.equal( 1 );
			expect( properties[ 1 ][ 0 ] ).to.equal( 'bar' );
			expect( properties[ 1 ][ 1 ] ).to.equal( 2 );
			expect( properties[ 2 ][ 0 ] ).to.equal( 'baz' );
			expect( properties[ 2 ][ 1 ] ).to.equal( 3 );
		} );
	} );

	describe( 'getIdentity()', () => {
		it( 'should return only name if no other attributes are present', () => {
			const el = new Element( document, 'foo' );

			expect( el.getIdentity() ).to.equal( 'foo' );
		} );

		it( 'should return classes in sorted order', () => {
			const el = new Element( document, 'fruit' );
			el._addClass( [ 'banana', 'lemon', 'apple' ] );

			expect( el.getIdentity() ).to.equal( 'fruit class="apple,banana,lemon"' );
		} );

		it( 'should return styles in sorted order', () => {
			const el = new Element( document, 'foo', {
				style: 'margin-top: 2em; background-color: red'
			} );

			expect( el.getIdentity() ).to.equal( 'foo style="background-color:red;margin-top:2em;"' );
		} );

		it( 'should return attributes in sorted order', () => {
			const el = new Element( document, 'foo', {
				a: 1,
				d: 4,
				b: 3
			} );

			expect( el.getIdentity() ).to.equal( 'foo a="1" b="3" d="4"' );
		} );

		it( 'should return classes, styles and attributes', () => {
			const el = new Element( document, 'baz', {
				foo: 'one',
				bar: 'two',
				style: 'text-align:center;border-radius:10px'
			} );

			el._addClass( [ 'three', 'two', 'one' ] );

			expect( el.getIdentity() ).to.equal(
				'baz class="one,three,two" style="border-radius:10px;text-align:center;" bar="two" foo="one"'
			);
		} );
	} );
} );
