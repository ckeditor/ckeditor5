/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import count from '@ckeditor/ckeditor5-utils/src/count';
import Node from '../../src/view/node';
import Element from '../../src/view/element';

import encodedImage from './_utils/encodedimage.txt';

describe( 'Element', () => {
	describe( 'constructor()', () => {
		it( 'should create element without attributes', () => {
			const el = new Element( 'p' );

			expect( el ).to.be.an.instanceof( Node );
			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
			expect( el ).to.have.property( 'parent' ).that.is.null;
			expect( count( el.getAttributeKeys() ) ).to.equal( 0 );
		} );

		it( 'should create element with attributes as plain object', () => {
			const el = new Element( 'p', { foo: 'bar' } );

			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
			expect( count( el.getAttributeKeys() ) ).to.equal( 1 );
			expect( el.getAttribute( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should create element with attributes as map', () => {
			const attrs = new Map();
			attrs.set( 'foo', 'bar' );

			const el = new Element( 'p', attrs );

			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
			expect( count( el.getAttributeKeys() ) ).to.equal( 1 );
			expect( el.getAttribute( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should create element with children', () => {
			const child = new Element( 'p', { foo: 'bar' } );
			const parent = new Element( 'div', [], [ child ] );

			expect( parent ).to.have.property( 'name' ).that.equals( 'div' );
			expect( parent.childCount ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'p' );
		} );

		it( 'should move class attribute to class set ', () => {
			const el = new Element( 'p', { id: 'test', class: 'one two three' } );

			expect( el._attrs.has( 'class' ) ).to.be.false;
			expect( el._attrs.has( 'id' ) ).to.be.true;
			expect( el._classes.has( 'one' ) ).to.be.true;
			expect( el._classes.has( 'two' ) ).to.be.true;
			expect( el._classes.has( 'three' ) ).to.be.true;
		} );

		it( 'should move style attribute to style map', () => {
			const el = new Element( 'p', { id: 'test', style: 'one: style1; two:style2 ; three : url(http://ckeditor.com)' } );

			expect( el._attrs.has( 'style' ) ).to.be.false;
			expect( el._attrs.has( 'id' ) ).to.be.true;
			expect( el._styles.has( 'one' ) ).to.be.true;
			expect( el._styles.get( 'one' ) ).to.equal( 'style1' );
			expect( el._styles.has( 'two' ) ).to.be.true;
			expect( el._styles.get( 'two' ) ).to.equal( 'style2' );
			expect( el._styles.has( 'three' ) ).to.be.true;
			expect( el._styles.get( 'three' ) ).to.equal( 'url(http://ckeditor.com)' );
		} );
	} );

	describe( 'is', () => {
		let el;

		before( () => {
			el = new Element( 'p' );
		} );

		it( 'should return true for element, element with correct name and element name', () => {
			expect( el.is( 'element' ) ).to.be.true;
			expect( el.is( 'element', 'p' ) ).to.be.true;
			expect( el.is( 'p' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( el.is( 'element', 'span' ) ).to.be.false;
			expect( el.is( 'span' ) ).to.be.false;
			expect( el.is( 'text' ) ).to.be.false;
			expect( el.is( 'textProxy' ) ).to.be.false;
			expect( el.is( 'containerElement' ) ).to.be.false;
			expect( el.is( 'attributeElement' ) ).to.be.false;
			expect( el.is( 'uiElement' ) ).to.be.false;
			expect( el.is( 'emptyElement' ) ).to.be.false;
			expect( el.is( 'rootElement' ) ).to.be.false;
			expect( el.is( 'documentFragment' ) ).to.be.false;
		} );
	} );

	describe( 'isEmpty', () => {
		it( 'should return true if there are no children in element', () => {
			const element = new Element( 'p' );

			expect( element.isEmpty ).to.be.true;
		} );

		it( 'should return false if there are children in element', () => {
			const fragment = new Element( 'p', null, new Element( 'img' ) );

			expect( fragment.isEmpty ).to.be.false;
		} );
	} );

	describe( 'clone', () => {
		it( 'should clone element', () => {
			const el = new Element( 'p', { attr1: 'foo', attr2: 'bar' } );
			const clone = el.clone();

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone.getAttribute( 'attr1' ) ).to.equal( 'foo' );
			expect( clone.getAttribute( 'attr2' ) ).to.equal( 'bar' );
		} );

		it( 'should deeply clone element', () => {
			const el = new Element( 'p', { attr1: 'foo', attr2: 'bar' }, [
				new Element( 'b', { attr: 'baz' } ),
				new Element( 'span', { attr: 'qux' } )
			] );
			const count = el.childCount;
			const clone = el.clone( true );

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
			const el = new Element( 'p', { attr1: 'foo', attr2: 'bar' }, [
				new Element( 'b', { attr: 'baz' } ),
				new Element( 'span', { attr: 'qux' } )
			] );
			const clone = el.clone( false );

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone.getAttribute( 'attr1' ) ).to.equal( 'foo' );
			expect( clone.getAttribute( 'attr2' ) ).to.equal( 'bar' );
			expect( clone.childCount ).to.equal( 0 );
		} );

		it( 'should clone class attribute', () => {
			const el = new Element( 'p', { foo: 'bar' } );
			el.addClass( 'baz', 'qux' );
			const clone = el.clone( false );

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( clone.getAttribute( 'class' ) ).to.equal( 'baz qux' );
		} );

		it( 'should clone style attribute', () => {
			const el = new Element( 'p', { style: 'color: red; font-size: 12px;' } );
			const clone = el.clone( false );

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone._styles.has( 'color' ) ).to.be.true;
			expect( clone._styles.get( 'color' ) ).to.equal( 'red' );
			expect( clone._styles.has( 'font-size' ) ).to.be.true;
			expect( clone._styles.get( 'font-size' ) ).to.equal( '12px' );
		} );

		it( 'should clone custom properties', () => {
			const el = new Element( 'p' );
			const symbol = Symbol( 'custom' );
			el.setCustomProperty( 'foo', 'bar' );
			el.setCustomProperty( symbol, 'baz' );

			const cloned = el.clone();

			expect( cloned.getCustomProperty( 'foo' ) ).to.equal( 'bar' );
			expect( cloned.getCustomProperty( symbol ) ).to.equal( 'baz' );
		} );

		it( 'should clone getFillerOffset', () => {
			const el = new Element( 'p' );
			const fm = () => 'foo bar';

			expect( el.getFillerOffset ).to.be.undefined;
			el.getFillerOffset = fm;

			const cloned = el.clone();

			expect( cloned.getFillerOffset ).to.equal( fm );
		} );
	} );

	describe( 'isSimilar', () => {
		const el = new Element( 'p', { foo: 'bar' } );
		it( 'should return false when comparing to non-element', () => {
			expect( el.isSimilar( null ) ).to.be.false;
			expect( el.isSimilar( {} ) ).to.be.false;
		} );

		it( 'should return true when the same node is provided', () => {
			expect( el.isSimilar( el ) ).to.be.true;
		} );

		it( 'should return true for element with same attributes and name', () => {
			const other = new Element( 'p', { foo: 'bar' } );
			expect( el.isSimilar( other ) ).to.be.true;
		} );

		it( 'sould return false when name is not the same', () => {
			const other = el.clone();
			other.name = 'div';

			expect( el.isSimilar( other ) ).to.be.false;
		} );

		it( 'should return false when attributes are not the same', () => {
			const other1 = el.clone();
			const other2 = el.clone();
			const other3 = el.clone();
			other1.setAttribute( 'baz', 'qux' );
			other2.setAttribute( 'foo', 'not-bar' );
			other3.removeAttribute( 'foo' );
			expect( el.isSimilar( other1 ) ).to.be.false;
			expect( el.isSimilar( other2 ) ).to.be.false;
			expect( el.isSimilar( other3 ) ).to.be.false;
		} );

		it( 'should compare class attribute', () => {
			const el1 = new Element( 'p' );
			const el2 = new Element( 'p' );
			const el3 = new Element( 'p' );
			const el4 = new Element( 'p' );

			el1.addClass( 'foo', 'bar' );
			el2.addClass( 'bar', 'foo' );
			el3.addClass( 'baz' );
			el4.addClass( 'baz', 'bar' );

			expect( el1.isSimilar( el2 ) ).to.be.true;
			expect( el1.isSimilar( el3 ) ).to.be.false;
			expect( el1.isSimilar( el4 ) ).to.be.false;
		} );

		it( 'should compare styles attribute', () => {
			const el1 = new Element( 'p' );
			const el2 = new Element( 'p' );
			const el3 = new Element( 'p' );
			const el4 = new Element( 'p' );

			el1.setStyle( 'color', 'red' );
			el1.setStyle( 'top', '10px' );
			el2.setStyle( 'top', '20px' );
			el3.setStyle( 'top', '10px' );
			el3.setStyle( 'color', 'red' );
			el4.setStyle( 'color', 'blue' );
			el4.setStyle( 'top', '10px' );

			expect( el1.isSimilar( el2 ) ).to.be.false;
			expect( el1.isSimilar( el3 ) ).to.be.true;
			expect( el2.isSimilar( el3 ) ).to.be.false;
			expect( el3.isSimilar( el4 ) ).to.be.false;
		} );
	} );

	describe( 'children manipulation methods', () => {
		let parent, el1, el2, el3, el4;

		beforeEach( () => {
			parent = new Element( 'p' );
			el1 = new Element( 'el1' );
			el2 = new Element( 'el2' );
			el3 = new Element( 'el3' );
			el4 = new Element( 'el4' );
		} );

		describe( 'insertion', () => {
			it( 'should insert children', () => {
				const count1 = parent.insertChildren( 0, [ el1, el3 ] );
				const count2 = parent.insertChildren( 1, el2 );

				expect( parent.childCount ).to.equal( 3 );
				expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( parent.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el2' );
				expect( parent.getChild( 2 ) ).to.have.property( 'name' ).that.equals( 'el3' );
				expect( count1 ).to.equal( 2 );
				expect( count2 ).to.equal( 1 );
			} );

			it( 'should accept strings', () => {
				parent.insertChildren( 0, 'abc' );

				expect( parent.childCount ).to.equal( 1 );
				expect( parent.getChild( 0 ) ).to.have.property( 'data' ).that.equals( 'abc' );

				parent.removeChildren( 0, 1 );
				parent.insertChildren( 0, [ new Element( 'p' ), 'abc' ] );

				expect( parent.childCount ).to.equal( 2 );
				expect( parent.getChild( 1 ) ).to.have.property( 'data' ).that.equals( 'abc' );
			} );

			it( 'should append children', () => {
				const count1 = parent.insertChildren( 0, el1 );
				const count2 = parent.appendChildren( el2 );
				const count3 = parent.appendChildren( el3 );

				expect( parent.childCount ).to.equal( 3 );
				expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( parent.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el2' );
				expect( parent.getChild( 2 ) ).to.have.property( 'name' ).that.equals( 'el3' );
				expect( count1 ).to.equal( 1 );
				expect( count2 ).to.equal( 1 );
				expect( count3 ).to.equal( 1 );
			} );
		} );

		describe( 'getChildIndex', () => {
			it( 'should return child index', () => {
				parent.appendChildren( el1 );
				parent.appendChildren( el2 );
				parent.appendChildren( el3 );

				expect( parent.childCount ).to.equal( 3 );
				expect( parent.getChildIndex( el1 ) ).to.equal( 0 );
				expect( parent.getChildIndex( el2 ) ).to.equal( 1 );
				expect( parent.getChildIndex( el3 ) ).to.equal( 2 );
			} );
		} );

		describe( 'getChildren', () => {
			it( 'should renturn children iterator', () => {
				parent.appendChildren( el1 );
				parent.appendChildren( el2 );
				parent.appendChildren( el3 );

				const expected = [ el1, el2, el3 ];
				let i = 0;

				for ( const child of parent.getChildren() ) {
					expect( child ).to.equal( expected[ i ] );
					i++;
				}

				expect( i ).to.equal( 3 );
			} );
		} );

		describe( 'removeChildren', () => {
			it( 'should remove children', () => {
				parent.appendChildren( el1 );
				parent.appendChildren( el2 );
				parent.appendChildren( el3 );
				parent.appendChildren( el4 );

				parent.removeChildren( 1, 2 );

				expect( parent.childCount ).to.equal( 2 );
				expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( parent.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el4' );

				expect( el1.parent ).to.equal( parent );
				expect( el2.parent ).to.be.null;
				expect( el3.parent ).to.be.null;
				expect( el4.parent ).equal( parent );
			} );

			it( 'should remove one child when second parameter is not specified', () => {
				parent.appendChildren( el1 );
				parent.appendChildren( el2 );
				parent.appendChildren( el3 );

				const removed = parent.removeChildren( 1 );

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
			el = new Element( 'p' );
		} );

		describe( 'setAttribute', () => {
			it( 'should set attribute', () => {
				el.setAttribute( 'foo', 'bar' );

				expect( el._attrs.has( 'foo' ) ).to.be.true;
				expect( el._attrs.get( 'foo' ) ).to.equal( 'bar' );
			} );

			it( 'should fire change event with attributes type', done => {
				el.once( 'change:attributes', eventInfo => {
					expect( eventInfo.source ).to.equal( el );
					done();
				} );

				el.setAttribute( 'foo', 'bar' );
			} );

			it( 'should set class', () => {
				el.setAttribute( 'class', 'foo bar' );

				expect( el._attrs.has( 'class' ) ).to.be.false;
				expect( el._classes.has( 'foo' ) ).to.be.true;
				expect( el._classes.has( 'bar' ) ).to.be.true;
			} );

			it( 'should replace all existing classes', () => {
				el.setAttribute( 'class', 'foo bar baz' );
				el.setAttribute( 'class', 'qux' );

				expect( el._classes.has( 'foo' ) ).to.be.false;
				expect( el._classes.has( 'bar' ) ).to.be.false;
				expect( el._classes.has( 'baz' ) ).to.be.false;
				expect( el._classes.has( 'qux' ) ).to.be.true;
			} );

			it( 'should replace all styles', () => {
				el.setStyle( 'color', 'red' );
				el.setStyle( 'top', '10px' );
				el.setAttribute( 'style', 'border:none' );

				expect( el.hasStyle( 'color' ) ).to.be.false;
				expect( el.hasStyle( 'top' ) ).to.be.false;
				expect( el.hasStyle( 'border' ) ).to.be.true;
				expect( el.getStyle( 'border' ) ).to.equal( 'none' );
			} );
		} );

		describe( 'getAttribute', () => {
			it( 'should return attribute', () => {
				el.setAttribute( 'foo', 'bar' );

				expect( el.getAttribute( 'foo' ) ).to.equal( 'bar' );
				expect( el.getAttribute( 'bom' ) ).to.not.be.ok;
			} );

			it( 'should return class attribute', () => {
				el.addClass( 'foo', 'bar' );

				expect( el.getAttribute( 'class' ) ).to.equal( 'foo bar' );
			} );

			it( 'should return undefined if no class attribute', () => {
				expect( el.getAttribute( 'class' ) ).to.be.undefined;
			} );

			it( 'should return style attribute', () => {
				el.setStyle( 'color', 'red' );
				el.setStyle( 'top', '10px' );

				expect( el.getAttribute( 'style' ) ).to.equal( 'color:red;top:10px;' );
			} );

			it( 'should return undefined if no style attribute', () => {
				expect( el.getAttribute( 'style' ) ).to.be.undefined;
			} );
		} );

		describe( 'getAttributes', () => {
			it( 'should return attributes', () => {
				el.setAttribute( 'foo', 'bar' );
				el.setAttribute( 'abc', 'xyz' );

				expect( Array.from( el.getAttributes() ) ).to.deep.equal( [ [ 'foo', 'bar' ], [ 'abc', 'xyz' ] ] );
			} );

			it( 'should return class and style attribute', () => {
				el.setAttribute( 'class', 'abc' );
				el.setAttribute( 'style', 'width:20px;' );
				el.addClass( 'xyz' );
				el.setStyle( 'font-weight', 'bold' );

				expect( Array.from( el.getAttributes() ) ).to.deep.equal( [
					[ 'class', 'abc xyz' ], [ 'style', 'width:20px;font-weight:bold;' ]
				] );
			} );
		} );

		describe( 'hasAttribute', () => {
			it( 'should return true if element has attribute', () => {
				el.setAttribute( 'foo', 'bar' );

				expect( el.hasAttribute( 'foo' ) ).to.be.true;
				expect( el.hasAttribute( 'bom' ) ).to.be.false;
			} );

			it( 'should return true if element has class attribute', () => {
				expect( el.hasAttribute( 'class' ) ).to.be.false;
				el.addClass( 'foo' );
				expect( el.hasAttribute( 'class' ) ).to.be.true;
			} );

			it( 'should return true if element has style attribute', () => {
				expect( el.hasAttribute( 'style' ) ).to.be.false;
				el.setStyle( 'border', '1px solid red' );
				expect( el.hasAttribute( 'style' ) ).to.be.true;
			} );
		} );

		describe( 'getAttributeKeys', () => {
			it( 'should return keys', () => {
				el.setAttribute( 'foo', true );
				el.setAttribute( 'bar', true );

				const expected = [ 'foo', 'bar' ];
				let i = 0;

				for ( const key of el.getAttributeKeys() ) {
					expect( key ).to.equal( expected[ i ] );
					i++;
				}

				expect( i ).to.equal( 2 );
			} );

			it( 'should return class key', () => {
				el.addClass( 'foo' );
				el.setAttribute( 'bar', true );
				const expected = [ 'class', 'bar' ];
				let i = 0;

				for ( const key of el.getAttributeKeys() ) {
					expect( key ).to.equal( expected[ i ] );
					i++;
				}
			} );

			it( 'should return style key', () => {
				el.setStyle( 'color', 'black' );
				el.setAttribute( 'bar', true );
				const expected = [ 'style', 'bar' ];
				let i = 0;

				for ( const key of el.getAttributeKeys() ) {
					expect( key ).to.equal( expected[ i ] );
					i++;
				}
			} );
		} );

		describe( 'removeAttribute', () => {
			it( 'should remove attributes', () => {
				el.setAttribute( 'foo', true );

				expect( el.hasAttribute( 'foo' ) ).to.be.true;

				el.removeAttribute( 'foo' );

				expect( el.hasAttribute( 'foo' ) ).to.be.false;

				expect( count( el.getAttributeKeys() ) ).to.equal( 0 );
			} );

			it( 'should fire change event with attributes type', done => {
				el.setAttribute( 'foo', 'bar' );
				el.once( 'change:attributes', eventInfo => {
					expect( eventInfo.source ).to.equal( el );
					done();
				} );

				el.removeAttribute( 'foo' );
			} );

			it( 'should remove class attribute', () => {
				el.addClass( 'foo', 'bar' );
				const el2 = new Element( 'p' );
				const removed1 = el.removeAttribute( 'class' );
				const removed2 = el2.removeAttribute( 'class' );

				expect( el.hasAttribute( 'class' ) ).to.be.false;
				expect( el.hasClass( 'foo' ) ).to.be.false;
				expect( el.hasClass( 'bar' ) ).to.be.false;
				expect( removed1 ).to.be.true;
				expect( removed2 ).to.be.false;
			} );

			it( 'should remove style attribute', () => {
				el.setStyle( 'color', 'red' );
				el.setStyle( 'position', 'fixed' );
				const el2 = new Element( 'p' );
				const removed1 = el.removeAttribute( 'style' );
				const removed2 = el2.removeAttribute( 'style' );

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
			el = new Element( 'p' );
		} );

		describe( 'addClass', () => {
			it( 'should add single class', () => {
				el.addClass( 'one' );

				expect( el._classes.has( 'one' ) ).to.be.true;
			} );

			it( 'should fire change event with attributes type', done => {
				el.once( 'change:attributes', eventInfo => {
					expect( eventInfo.source ).to.equal( el );
					done();
				} );

				el.addClass( 'one' );
			} );

			it( 'should add multiple classes', () => {
				el.addClass( 'one', 'two', 'three' );

				expect( el._classes.has( 'one' ) ).to.be.true;
				expect( el._classes.has( 'two' ) ).to.be.true;
				expect( el._classes.has( 'three' ) ).to.be.true;
			} );
		} );

		describe( 'removeClass', () => {
			it( 'should remove single class', () => {
				el.addClass( 'one', 'two', 'three' );

				el.removeClass( 'one' );

				expect( el._classes.has( 'one' ) ).to.be.false;
				expect( el._classes.has( 'two' ) ).to.be.true;
				expect( el._classes.has( 'three' ) ).to.be.true;
			} );

			it( 'should fire change event with attributes type', done => {
				el.addClass( 'one' );
				el.once( 'change:attributes', eventInfo => {
					expect( eventInfo.source ).to.equal( el );
					done();
				} );

				el.removeClass( 'one' );
			} );

			it( 'should remove multiple classes', () => {
				el.addClass( 'one', 'two', 'three', 'four' );
				el.removeClass( 'one', 'two', 'three' );

				expect( el._classes.has( 'one' ) ).to.be.false;
				expect( el._classes.has( 'two' ) ).to.be.false;
				expect( el._classes.has( 'three' ) ).to.be.false;
				expect( el._classes.has( 'four' ) ).to.be.true;
			} );
		} );

		describe( 'hasClass', () => {
			it( 'should check if element has a class', () => {
				el.addClass( 'one', 'two', 'three' );

				expect( el.hasClass( 'one' ) ).to.be.true;
				expect( el.hasClass( 'two' ) ).to.be.true;
				expect( el.hasClass( 'three' ) ).to.be.true;
				expect( el.hasClass( 'four' ) ).to.be.false;
			} );

			it( 'should check if element has multiple classes', () => {
				el.addClass( 'one', 'two', 'three' );

				expect( el.hasClass( 'one', 'two' ) ).to.be.true;
				expect( el.hasClass( 'three', 'two' ) ).to.be.true;
				expect( el.hasClass( 'three', 'one', 'two' ) ).to.be.true;
				expect( el.hasClass( 'three', 'one', 'two', 'zero' ) ).to.be.false;
			} );
		} );

		describe( 'getClassNames', () => {
			it( 'should return iterator with all class names', () => {
				const names = [ 'one', 'two', 'three' ];
				el.addClass( ...names );
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
			el = new Element( 'p' );
		} );

		describe( 'setStyle', () => {
			it( 'should set element style', () => {
				el.setStyle( 'color', 'red' );

				expect( el._styles.has( 'color' ) ).to.be.true;
				expect( el._styles.get( 'color' ) ).to.equal( 'red' );
			} );

			it( 'should fire change event with attributes type', done => {
				el.once( 'change:attributes', eventInfo => {
					expect( eventInfo.source ).to.equal( el );
					done();
				} );

				el.setStyle( 'color', 'red' );
			} );

			it( 'should set multiple styles by providing an object', () => {
				el.setStyle( {
					color: 'red',
					position: 'fixed'
				} );

				expect( el._styles.has( 'color' ) ).to.be.true;
				expect( el._styles.has( 'position' ) ).to.be.true;
				expect( el._styles.get( 'color' ) ).to.equal( 'red' );
				expect( el._styles.get( 'position' ) ).to.equal( 'fixed' );
			} );
		} );

		describe( 'getStyle', () => {
			it( 'should get style', () => {
				el.setStyle( {
					color: 'red',
					border: '1px solid red'
				} );

				expect( el.getStyle( 'color' ) ).to.equal( 'red' );
				expect( el.getStyle( 'border' ) ).to.equal( '1px solid red' );
			} );
		} );

		describe( 'getStyleNames', () => {
			it( 'should return iterator with all style names', () => {
				const names = [ 'color', 'position' ];

				el.setStyle( {
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
				el.setStyle( 'padding-top', '10px' );

				expect( el.hasStyle( 'padding-top' ) ).to.be.true;
				expect( el.hasStyle( 'padding-left' ) ).to.be.false;
			} );

			it( 'should check if element has multiple styles', () => {
				el.setStyle( {
					'padding-top': '10px',
					'margin-left': '10px',
					'color': '10px;'
				} );

				expect( el.hasStyle( 'padding-top', 'margin-left' ) ).to.be.true;
				expect( el.hasStyle( 'padding-top', 'margin-left', 'color' ) ).to.be.true;
				expect( el.hasStyle( 'padding-top', 'padding-left' ) ).to.be.false;
			} );
		} );

		describe( 'removeStyle', () => {
			it( 'should remove style', () => {
				el.setStyle( 'padding-top', '10px' );
				el.removeStyle( 'padding-top' );

				expect( el.hasStyle( 'padding-top' ) ).to.be.false;
			} );

			it( 'should fire change event with attributes type', done => {
				el.setStyle( 'color', 'red' );
				el.once( 'change:attributes', eventInfo => {
					expect( eventInfo.source ).to.equal( el );
					done();
				} );

				el.removeStyle( 'color' );
			} );

			it( 'should remove multiple styles', () => {
				el.setStyle( {
					'padding-top': '10px',
					'margin-top': '10px',
					'color': 'red'
				} );
				el.removeStyle( 'padding-top', 'margin-top' );

				expect( el.hasStyle( 'padding-top' ) ).to.be.false;
				expect( el.hasStyle( 'margin-top' ) ).to.be.false;
				expect( el.hasStyle( 'color' ) ).to.be.true;
			} );
		} );

		describe( 'styles parsing edge cases and incorrect styles', () => {
			it( 'should not crash and not add any styles if styles attribute was empty', () => {
				const element = new Element( 'div', { style: '' } );
				const styles = Array.from( element.getStyleNames() );

				expect( styles ).to.deep.equal( [] );
			} );

			it( 'should be able to parse big styles definition', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new Element( 'div', { style: `background-image:url('data:image/jpeg;base64,${ encodedImage }')` } );
				} ).not.to.throw();
			} );

			it( 'should work with both types of quotes and ignore values inside quotes', () => {
				let element;

				element = new Element( 'div', { style: 'background-image:url("im;color:g.jpg")' } );
				expect( element.getStyle( 'background-image' ) ).to.equal( 'url("im;color:g.jpg")' );

				element = new Element( 'div', { style: 'background-image:url(\'im;color:g.jpg\')' } );
				expect( element.getStyle( 'background-image' ) ).to.equal( 'url(\'im;color:g.jpg\')' );
			} );

			it( 'should not be confused by whitespaces', () => {
				const element = new Element( 'div', { style: '\ncolor:\n red ' } );

				expect( element.getStyle( 'color' ) ).to.equal( 'red' );
			} );

			it( 'should not be confused by duplicated semicolon', () => {
				const element = new Element( 'div', { style: 'color: red;; display: inline' } );

				expect( element.getStyle( 'color' ) ).to.equal( 'red' );
				expect( element.getStyle( 'display' ) ).to.equal( 'inline' );
			} );

			it( 'should not throw when value is missing', () => {
				const element = new Element( 'div', { style: 'color:; display: inline' } );

				expect( element.getStyle( 'color' ) ).to.equal( '' );
				expect( element.getStyle( 'display' ) ).to.equal( 'inline' );
			} );

			it( 'should not throw when colon is duplicated', () => {
				const element = new Element( 'div', { style: 'color:: red; display: inline' } );

				// The result makes no sense, but here we just check that the algorithm doesn't crash.
				expect( element.getStyle( 'color' ) ).to.equal( ': red' );
				expect( element.getStyle( 'display' ) ).to.equal( 'inline' );
			} );

			it( 'should not throw when random stuff passed', () => {
				const element = new Element( 'div', { style: 'color: red;:; ;;" ":  display: inline; \'aaa;:' } );

				// The result makes no sense, but here we just check that the algorithm doesn't crash.
				expect( element.getStyle( 'color' ) ).to.equal( 'red' );
				expect( element.getStyle( 'display' ) ).to.be.undefined;
			} );
		} );
	} );

	describe( 'findAncestor', () => {
		it( 'should return null if element have no ancestor', () => {
			const el = new Element( 'p' );

			expect( el.findAncestor( 'div' ) ).to.be.null;
		} );

		it( 'should return ancestor if matching', () => {
			const el1 = new Element( 'p' );
			const el2 = new Element( 'div', null, el1 );

			expect( el1.findAncestor( 'div' ) ).to.equal( el2 );
		} );

		it( 'should return parent\'s ancestor if matching', () => {
			const el1 = new Element( 'p' );
			const el2 = new Element( 'div', null, el1 );
			const el3 = new Element( 'div', { class: 'foo bar' }, el2 );

			expect( el1.findAncestor( { class: 'foo' } ) ).to.equal( el3 );
		} );

		it( 'should return null if no matches found', () => {
			const el1 = new Element( 'p' );
			new Element( 'div', null, el1 ); // eslint-disable-line no-new

			expect( el1.findAncestor( {
				name: 'div',
				class: 'container'
			} ) ).to.be.null;
		} );
	} );

	describe( 'custom properties', () => {
		it( 'should allow to set and get custom properties', () => {
			const el = new Element( 'p' );
			el.setCustomProperty( 'foo', 'bar' );

			expect( el.getCustomProperty( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should allow to add symbol property', () => {
			const el = new Element( 'p' );
			const symbol = Symbol( 'custom' );
			el.setCustomProperty( symbol, 'bar' );

			expect( el.getCustomProperty( symbol ) ).to.equal( 'bar' );
		} );

		it( 'should allow to remove custom property', () => {
			const el = new Element( 'foo' );
			const symbol = Symbol( 'quix' );
			el.setCustomProperty( 'bar', 'baz' );
			el.setCustomProperty( symbol, 'test' );

			expect( el.getCustomProperty( 'bar' ) ).to.equal( 'baz' );
			expect( el.getCustomProperty( symbol ) ).to.equal( 'test' );

			el.removeCustomProperty( 'bar' );
			el.removeCustomProperty( symbol );

			expect( el.getCustomProperty( 'bar' ) ).to.be.undefined;
			expect( el.getCustomProperty( symbol ) ).to.be.undefined;
		} );

		it( 'should allow to iterate over custom properties', () => {
			const el = new Element( 'p' );
			el.setCustomProperty( 'foo', 1 );
			el.setCustomProperty( 'bar', 2 );
			el.setCustomProperty( 'baz', 3 );

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
			const el = new Element( 'foo' );

			expect( el.getIdentity() ).to.equal( 'foo' );
		} );

		it( 'should return classes in sorted order', () => {
			const el = new Element( 'fruit' );
			el.addClass( 'banana', 'lemon', 'apple' );

			expect( el.getIdentity() ).to.equal( 'fruit class="apple,banana,lemon"' );
		} );

		it( 'should return styles in sorted order', () => {
			const el = new Element( 'foo', {
				style: 'border: 1px solid red; background-color: red'
			} );

			expect( el.getIdentity() ).to.equal( 'foo style="background-color:red;border:1px solid red"' );
		} );

		it( 'should return attributes in sorted order', () => {
			const el = new Element( 'foo', {
				a: 1,
				d: 4,
				b: 3
			} );

			expect( el.getIdentity() ).to.equal( 'foo a="1" b="3" d="4"' );
		} );

		it( 'should return classes, styles and attributes', () => {
			const el = new Element( 'baz', {
				foo: 'one',
				bar: 'two',
				style: 'text-align:center;border-radius:10px'
			} );

			el.addClass( 'three', 'two', 'one' );

			expect( el.getIdentity() ).to.equal(
				'baz class="one,three,two" style="border-radius:10px;text-align:center" bar="two" foo="one"'
			);
		} );
	} );
} );
