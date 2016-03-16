/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import utils from '/ckeditor5/utils/utils.js';
import Node from '/ckeditor5/core/treeview/node.js';
import ViewElement from '/ckeditor5/core/treeview/element.js';

describe( 'Element', () => {
	describe( 'constructor', () => {
		it( 'should create element without attributes', () => {
			const el = new ViewElement( 'p' );

			expect( el ).to.be.an.instanceof( Node );
			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
			expect( el ).to.have.property( 'parent' ).that.is.null;
			expect( utils.count( el.getAttributeKeys() ) ).to.equal( 0 );
		} );

		it( 'should create element with attributes as plain object', () => {
			const el = new ViewElement( 'p', { foo: 'bar' } );

			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
			expect( utils.count( el.getAttributeKeys() ) ).to.equal( 1 );
			expect( el.getAttribute( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should create element with attributes as map', () => {
			const attrs = new Map();
			attrs.set( 'foo', 'bar' );

			const el = new ViewElement( 'p', attrs );

			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
			expect( utils.count( el.getAttributeKeys() ) ).to.equal( 1 );
			expect( el.getAttribute( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should create element with children', () => {
			const child = new ViewElement( 'p', { foo: 'bar' } );
			const parent = new ViewElement( 'div', [], [ child ] );

			expect( parent ).to.have.property( 'name' ).that.equals( 'div' );
			expect( parent.getChildCount() ).to.equal( 1 );
			expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'p' );
		} );

		it( 'should move class attribute to class set ', () => {
			const el = new ViewElement( 'p', { id: 'test', class: 'one two three' } );

			expect( el._attrs.has( 'class' ) ).to.be.false;
			expect( el._attrs.has( 'id' ) ).to.be.true;
			expect( el._classes.has( 'one' ) ).to.be.true;
			expect( el._classes.has( 'two' ) ).to.be.true;
			expect( el._classes.has( 'three' ) ).to.be.true;
		} );
	} );

	describe( 'clone', () => {
		it( 'should clone element', () => {
			const el = new ViewElement( 'p', { attr1: 'foo', attr2: 'bar' } );
			const clone = el.clone();

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone.getAttribute( 'attr1' ) ).to.equal( 'foo' );
			expect( clone.getAttribute( 'attr2' ) ).to.equal( 'bar' );
		} );

		it( 'should deeply clone element', () => {
			const el = new ViewElement( 'p', { attr1: 'foo', attr2: 'bar' }, [
				new ViewElement( 'b', { attr: 'baz' } ),
				new ViewElement( 'span', { attr: 'qux' } )
			] );
			const count = el.getChildCount();
			const clone = el.clone( true );

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone.getAttribute( 'attr1' ) ).to.equal( 'foo' );
			expect( clone.getAttribute( 'attr2' ) ).to.equal( 'bar' );
			expect( clone.getChildCount() ).to.equal( count );

			for ( let i = 0; i < count; i++ ) {
				const child = el.getChild( i );
				const clonedChild = clone.getChild( i );

				expect( clonedChild ).to.not.equal( child );
				expect( clonedChild.name ).to.equal( child.name );
				expect( clonedChild.getAttribute( 'attr' ) ).to.equal( child.getAttribute( 'attr' ) );
			}
		} );

		it( 'shouldn\'t clone any children when deep copy is not performed', () => {
			const el = new ViewElement( 'p', { attr1: 'foo', attr2: 'bar' }, [
				new ViewElement( 'b', { attr: 'baz' } ),
				new ViewElement( 'span', { attr: 'qux' } )
			] );
			const clone = el.clone( false );

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone.getAttribute( 'attr1' ) ).to.equal( 'foo' );
			expect( clone.getAttribute( 'attr2' ) ).to.equal( 'bar' );
			expect( clone.getChildCount() ).to.equal( 0 );
		} );
	} );

	describe( 'isSimilar', () => {
		const el = new ViewElement( 'p', { foo: 'bar' } );
		it( 'should return false when comparing to non-element', () => {
			expect( el.isSimilar( null ) ).to.be.false;
			expect( el.isSimilar( {} ) ).to.be.false;
		} );

		it( 'should return true when the same node is provided', () => {
			expect( el.isSimilar( el ) ).to.be.true;
		} );

		it( 'should return true for element with same attributes and name', () => {
			const other = new ViewElement( 'p', { foo: 'bar' } );
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
	} );

	describe( 'children manipulation methods', () => {
		let parent, el1, el2, el3, el4;

		beforeEach( () => {
			parent = new ViewElement( 'p' );
			el1 = new ViewElement( 'el1' );
			el2 = new ViewElement( 'el2' );
			el3 = new ViewElement( 'el3' );
			el4 = new ViewElement( 'el4' );
		} );

		describe( 'insertion', () => {
			it( 'should insert children', () => {
				const count1 = parent.insertChildren( 0, [ el1, el3 ] );
				const count2 = parent.insertChildren( 1, el2 );

				expect( parent.getChildCount() ).to.equal( 3 );
				expect( parent.getChild( 0 ) ).to.have.property( 'name' ).that.equals( 'el1' );
				expect( parent.getChild( 1 ) ).to.have.property( 'name' ).that.equals( 'el2' );
				expect( parent.getChild( 2 ) ).to.have.property( 'name' ).that.equals( 'el3' );
				expect( count1 ).to.equal( 2 );
				expect( count2 ).to.equal( 1 );
			} );

			it( 'should append children', () => {
				const count1 = parent.insertChildren( 0, el1 );
				const count2 = parent.appendChildren( el2 );
				const count3 = parent.appendChildren( el3 );

				expect( parent.getChildCount() ).to.equal( 3 );
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

				expect( parent.getChildCount() ).to.equal( 3 );
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

				for ( let child of parent.getChildren() ) {
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

				expect( parent.getChildCount() ).to.equal( 2 );
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

				expect( parent.getChildCount() ).to.equal( 2 );
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
			el = new ViewElement( 'p' );
		} );

		describe( 'getAttribute', () => {
			it( 'should return attribute', () => {
				el.setAttribute( 'foo', 'bar' );

				expect( el.getAttribute( 'foo' ) ).to.equal( 'bar' );
				expect( el.getAttribute( 'bom' ) ).to.not.be.ok;
			} );
		} );

		describe( 'hasAttribute', () => {
			it( 'should return true if element has attribute', () => {
				el.setAttribute( 'foo', 'bar' );

				expect( el.hasAttribute( 'foo' ) ).to.be.true;
				expect( el.hasAttribute( 'bom' ) ).to.be.false;
			} );
		} );

		describe( 'getAttributeKeys', () => {
			it( 'should return keys', () => {
				el.setAttribute( 'foo', true );
				el.setAttribute( 'bar', true );

				const expected = [ 'foo', 'bar' ];
				let i = 0;

				for ( let key of el.getAttributeKeys() ) {
					expect( key ).to.equal( expected[ i ] );
					i++;
				}

				expect( i ).to.equal( 2 );
			} );
		} );

		describe( 'removeAttribute', () => {
			it( 'should remove attributes', () => {
				el.setAttribute( 'foo', true );

				expect( el.hasAttribute( 'foo' ) ).to.be.true;

				el.removeAttribute( 'foo' );

				expect( el.hasAttribute( 'foo' ) ).to.be.false;

				expect( utils.count( el.getAttributeKeys() ) ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'addClass', () => {
		it( 'should add single class', () => {
			const el = new ViewElement( 'foo' );

			el.addClass( 'one' );

			expect( el._classes.has( 'one' ) ).to.be.true;
		} );

		it( 'should add multiple classes', () => {
			const el = new ViewElement( 'foo' );

			el.addClass( 'one', 'two', 'three' );

			expect( el._classes.has( 'one' ) ).to.be.true;
			expect( el._classes.has( 'two' ) ).to.be.true;
			expect( el._classes.has( 'three' ) ).to.be.true;
		} );
	} );

	describe( 'removeClass', () => {
		it( 'should remove single class', () => {
			const el = new ViewElement( 'foo', { class: 'one two three' } );

			el.removeClass( 'one' );

			expect( el._classes.has( 'one' ) ).to.be.false;
			expect( el._classes.has( 'two' ) ).to.be.true;
			expect( el._classes.has( 'three' ) ).to.be.true;
		} );

		it( 'should remove multiple classes', () => {
			const el = new ViewElement( 'foo', { class: 'one two three four' } );

			el.removeClass( 'one', 'two', 'three' );

			expect( el._classes.has( 'one' ) ).to.be.false;
			expect( el._classes.has( 'two' ) ).to.be.false;
			expect( el._classes.has( 'three' ) ).to.be.false;
			expect( el._classes.has( 'four' ) ).to.be.true;
		} );
	} );
} );
