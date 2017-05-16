/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewElement from '../../src/view/element';
import ViewText from '../../src/view/text';
import ViewDocumentFragment from '../../src/view/documentfragment';
import ViewConsumable from '../../src/conversion/viewconsumable';

describe( 'ViewConsumable', () => {
	let viewConsumable, el;

	beforeEach( () => {
		viewConsumable = new ViewConsumable();
		el = new ViewElement( 'p' );
	} );

	describe( 'add', () => {
		it( 'should allow to add element name', () => {
			viewConsumable.add( el, { name: true } );

			expect( viewConsumable.test( el, { name: true } ) ).to.be.true;
		} );

		it( 'should allow to add text node', () => {
			const text = new ViewText( 'foobar' );
			viewConsumable.add( text );

			expect( viewConsumable.test( text ) ).to.be.true;
		} );

		it( 'should allow to add document fragment', () => {
			const fragment = new ViewDocumentFragment();
			viewConsumable.add( fragment );
			expect( viewConsumable.test( fragment ) ).to.be.true;
		} );

		it( 'should allow to add attributes classes and styles', () => {
			viewConsumable.add( el, { attribute: 'href' } );
			viewConsumable.add( el, { class: 'foobar' } );
			viewConsumable.add( el, { style: 'color' } );

			expect( viewConsumable.test( el, { attribute: 'href' } ) ).to.be.true;
			expect( viewConsumable.test( el, { class: 'foobar' } ) ).to.be.true;
			expect( viewConsumable.test( el, { style: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el, { name: true } ) ).to.be.null;
		} );

		it( 'should allow to add attributes classes and styles in one call', () => {
			viewConsumable.add( el, { attribute: 'href', class: 'foobar', style: 'color' } );

			expect( viewConsumable.test( el, { attribute: 'href' } ) ).to.be.true;
			expect( viewConsumable.test( el, { class: 'foobar' } ) ).to.be.true;
			expect( viewConsumable.test( el, { style: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el, { name: true } ) ).to.be.null;
		} );

		it( 'should allow to add multiple attributes in one call', () => {
			viewConsumable.add( el, { attribute: [ 'href', 'target', 'title' ] } );

			expect( viewConsumable.test( el, { attribute: 'href' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attribute: 'target' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attribute: 'title' } ) ).to.be.true;
			expect( viewConsumable.test( el, { name: true } ) ).to.be.null;
		} );

		it( 'should allow to add multiple classes in one call', () => {
			viewConsumable.add( el, { class: [ 'foo', 'bar', 'baz' ] } );

			expect( viewConsumable.test( el, { class: 'foo' } ) ).to.be.true;
			expect( viewConsumable.test( el, { class: 'bar' } ) ).to.be.true;
			expect( viewConsumable.test( el, { class: 'baz' } ) ).to.be.true;
			expect( viewConsumable.test( el, { name: true } ) ).to.be.null;
		} );

		it( 'should allow to add multiple styles in one call', () => {
			viewConsumable.add( el, { style: [ 'color', 'position', 'top' ] } );

			expect( viewConsumable.test( el, { style: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el, { style: 'position' } ) ).to.be.true;
			expect( viewConsumable.test( el, { style: 'top' } ) ).to.be.true;
			expect( viewConsumable.test( el, { name: true } ) ).to.be.null;
		} );

		it( 'should throw if class attribute is added', () => {
			expect( () => {
				viewConsumable.add( el, { attribute: 'class' } );
			} ).to.throw( 'viewconsumable-invalid-attribute' );
		} );

		it( 'should throw if style attribute is added', () => {
			expect( () => {
				viewConsumable.add( el, { attribute: 'style' } );
			} ).to.throw( 'viewconsumable-invalid-attribute' );
		} );
	} );

	describe( 'test', () => {
		it( 'should test element name', () => {
			const el2 = new ViewElement( 'p' );

			viewConsumable.add( el, { name: true } );

			expect( viewConsumable.test( el, { name: true } ) ).to.be.true;
			expect( viewConsumable.test( el2, { name: true } ) ).to.be.null;
		} );

		it( 'should test text nodes', () => {
			const text1 = new ViewText();
			const text2 = new ViewText();

			viewConsumable.add( text1 );

			expect( viewConsumable.test( text1 ) ).to.be.true;
			expect( viewConsumable.test( text2 ) ).to.be.null;
		} );

		it( 'should test document fragments', () => {
			const fragment1 = new ViewDocumentFragment();
			const fragment2 = new ViewDocumentFragment();

			viewConsumable.add( fragment1 );

			expect( viewConsumable.test( fragment1 ) ).to.be.true;
			expect( viewConsumable.test( fragment2 ) ).to.be.null;
		} );

		it( 'should test attributes, classes and styles', () => {
			const el = new ViewElement( 'p' );

			viewConsumable.add( el, { attribute: 'href', class: 'foobar', style: 'color' } );

			expect( viewConsumable.test( el, { attribute: 'href' } ) ).to.be.true;
			expect( viewConsumable.test( el, { class: 'foobar' } ) ).to.be.true;
			expect( viewConsumable.test( el, { style: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attribute: 'href', class: 'foobar', style: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attribute: 'href', class: 'baz' } ) ).to.be.null;
			expect( viewConsumable.test( el, { name: true } ) ).to.be.null;

			viewConsumable.consume( el, { style: 'color' } );
			expect( viewConsumable.test( el, { attribute: 'href', style: 'color' } ) ).to.be.false;
		} );

		it( 'should allow to test multiple attributes in one call', () => {
			viewConsumable.add( el, { attribute: [ 'href', 'title', 'target' ] } );

			expect( viewConsumable.test( el, { attribute: [ 'href', 'title', 'target' ] } ) ).to.be.true;
			expect( viewConsumable.test( el, { attribute: [ 'href', 'title', 'alt' ] } ) ).to.be.null;

			viewConsumable.consume( el, { attribute: 'target' } );
			expect( viewConsumable.test( el, { attribute: [ 'href', 'title', 'target' ] } ) ).to.be.false;
		} );

		it( 'should allow to test multiple classes in one call', () => {
			viewConsumable.add( el, { class: [ 'foo', 'bar', 'baz' ] } );

			expect( viewConsumable.test( el, { class: [ 'foo', 'bar', 'baz' ] } ) ).to.be.true;
			expect( viewConsumable.test( el, { class: [ 'foo', 'bar', 'qux' ] } ) ).to.be.null;

			viewConsumable.consume( el, { class: 'bar' } );
			expect( viewConsumable.test( el, { class: [ 'foo', 'bar', 'baz' ] } ) ).to.be.false;
		} );

		it( 'should allow to test multiple styles in one call', () => {
			viewConsumable.add( el, { style: [ 'color', 'position', 'top' ] } );

			expect( viewConsumable.test( el, { style: [ 'color', 'position', 'top' ] } ) ).to.be.true;
			expect( viewConsumable.test( el, { style: [ 'color', 'position', 'left' ] } ) ).to.be.null;

			viewConsumable.consume( el, { style: 'top' } );
			expect( viewConsumable.test( el, { style: [ 'color', 'position', 'top' ] } ) ).to.be.false;
		} );

		it( 'should return null if not consumable', () => {
			expect( viewConsumable.test( el ) ).to.be.null;
		} );

		it( 'should return false if already consumed', () => {
			viewConsumable.add( el, { name: true } );
			viewConsumable.consume( el, { name: true } );

			expect( viewConsumable.test( el, { name: true } ) ).to.be.false;
		} );

		it( 'should return null if first non-consumable item is found', () => {
			viewConsumable.add( el, { attribute: 'foo' } );

			expect( viewConsumable.test( el, { attribute: [ 'foo', 'bar' ] } ) ).to.be.null;
		} );

		it( 'should return false if first already consumed item is found', () => {
			viewConsumable.add( el, { name: true, attribute: [ 'foo', 'bar' ] } );
			viewConsumable.consume( el, { attribute: 'bar' } );
			viewConsumable.consume( el, { name: true } );

			expect( viewConsumable.test( el, { attribute: [ 'foo', 'bar' ] } ) ).to.be.false;
			expect( viewConsumable.test( el, { name: true } ) ).to.be.false;
		} );

		it( 'should test all classes if class attribute is tested', () => {
			viewConsumable.add( el, { class: [ 'foo', 'bar', 'baz' ] } );
			expect( viewConsumable.test( el, { attribute: 'class' } ) ).to.be.true;
			expect( viewConsumable.consume( el, { class: 'baz' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attribute: 'class' } ) ).to.be.false;
		} );

		it( 'should test all styles if style attribute is tested', () => {
			viewConsumable.add( el, { style: [ 'color', 'top', 'position' ] } );
			expect( viewConsumable.test( el, { attribute: 'style' } ) ).to.be.true;
			expect( viewConsumable.consume( el, { style: 'top' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attribute: 'style' } ) ).to.be.false;
		} );

		it( 'should return false when testing class attribute when consumed classes exists', () => {
			viewConsumable.add( el, { class: [ 'foo', 'baz' ] } );
			expect( viewConsumable.consume( el, { class: 'baz' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attribute: 'class' } ) ).to.be.false;
			expect( viewConsumable.consume( el, { attribute: 'class' } ) ).to.be.false;
		} );

		it( 'should return false when testing style attribute when consumed styles exists', () => {
			viewConsumable.add( el, { style: [ 'top', 'left' ] } );
			expect( viewConsumable.consume( el, { style: 'top' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attribute: 'style' } ) ).to.be.false;
			expect( viewConsumable.consume( el, { attribute: 'style' } ) ).to.be.false;
		} );
	} );

	describe( 'consume', () => {
		it( 'should consume element', () => {
			viewConsumable.add( el, { name: true } );
			const consumed = viewConsumable.consume( el, { name: true } );

			expect( viewConsumable.test( el, { name: true } ) ).to.be.false;
			expect( consumed ).to.be.true;
		} );

		it( 'should consume text node', () => {
			const text = new ViewText();
			viewConsumable.add( text );
			const consumed = viewConsumable.consume( text );
			expect( consumed ).to.be.true;
			expect( viewConsumable.test( text ) ).to.be.false;
			expect( viewConsumable.consume( text ) ).to.be.false;
		} );

		it( 'should consume document fragment', () => {
			const fragment = new ViewDocumentFragment();
			viewConsumable.add( fragment );
			const consumed = viewConsumable.consume( fragment );
			expect( consumed ).to.be.true;
			expect( viewConsumable.test( fragment ) ).to.be.false;
			expect( viewConsumable.consume( fragment ) ).to.be.false;
		} );

		it( 'should not consume element not marked for consumption', () => {
			expect( viewConsumable.consume( el, { name: true } ) ).to.be.false;
		} );

		it( 'should not consume element already consumed', () => {
			viewConsumable.add( el, { name: true } );

			expect( viewConsumable.consume( el, { name: true } ) ).to.be.true;
			expect( viewConsumable.consume( el, { name: true } ) ).to.be.false;
		} );

		it( 'should consume attributes, classes and styles', () => {
			viewConsumable.add( el, { class: 'foobar', attribute: 'href', style: 'color' } );

			const consumed1 = viewConsumable.consume( el, { class: 'foobar' } );
			const consumed2 = viewConsumable.consume( el, { attribute: 'href' } );
			const consumed3 = viewConsumable.consume( el, { style: 'color' } );

			expect( consumed1 ).to.be.true;
			expect( consumed2 ).to.be.true;
			expect( consumed3 ).to.be.true;

			expect( viewConsumable.test( el, { class: 'foobar' } ) ).to.be.false;
			expect( viewConsumable.test( el, { attribute: 'href' } ) ).to.be.false;
			expect( viewConsumable.test( el, { style: 'color' } ) ).to.be.false;
		} );

		it( 'should consume multiple attributes', () => {
			viewConsumable.add( el, { attribute: [ 'href', 'title', 'name' ] } );

			const consumed = viewConsumable.consume( el, { attribute: [ 'href', 'title' ] } );

			expect( consumed ).to.be.true;
			expect( viewConsumable.test( el, { attribute: 'href' } ) ).to.be.false;
			expect( viewConsumable.test( el, { attribute: 'title' } ) ).to.be.false;
			expect( viewConsumable.test( el, { attribute: 'name' } ) ).to.be.true;
		} );

		it( 'should consume multiple styles', () => {
			viewConsumable.add( el, { style: [ 'color', 'top', 'position' ] } );

			const consumed = viewConsumable.consume( el, { style: [ 'color', 'position' ] } );

			expect( consumed ).to.be.true;
			expect( viewConsumable.test( el, { style: 'color' } ) ).to.be.false;
			expect( viewConsumable.test( el, { style: 'position' } ) ).to.be.false;
			expect( viewConsumable.test( el, { style: 'top' } ) ).to.be.true;
		} );

		it( 'should consume multiple classes', () => {
			viewConsumable.add( el, { class: [ 'foo', 'bar', 'baz' ] } );

			const consumed = viewConsumable.consume( el, { class: [ 'bar', 'baz' ] } );

			expect( consumed ).to.be.true;
			expect( viewConsumable.test( el, { class: 'bar' } ) ).to.be.false;
			expect( viewConsumable.test( el, { class: 'baz' } ) ).to.be.false;
			expect( viewConsumable.test( el, { class: 'foo' } ) ).to.be.true;
		} );

		it( 'should consume only if all items can be consumed', () => {
			viewConsumable.add( el, { style: [ 'position', 'color' ], attribute: [ 'href', 'title' ] } );

			const consumed = viewConsumable.consume( el, { style: [ 'color', 'top' ] } );
			expect( consumed ).to.be.false;
			expect( viewConsumable.test( el, { style: 'color' } ) ).to.be.true;
		} );

		it( 'should consume all classes when class attribute is provided', () => {
			expect( viewConsumable.consume( el, { attribute: 'class' } ) ).to.be.false;
			viewConsumable.add( el, { class: [ 'foo', 'bar', 'baz' ] } );
			expect( viewConsumable.consume( el, { attribute: 'class' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attribute: 'class' } ) ).to.be.false;
			expect( viewConsumable.test( el, { class: 'foo' } ) ).to.be.false;
			expect( viewConsumable.test( el, { class: 'bar' } ) ).to.be.false;
			expect( viewConsumable.test( el, { class: 'baz' } ) ).to.be.false;
		} );

		it( 'should consume all styles when style attribute is provided', () => {
			expect( viewConsumable.consume( el, { attribute: 'style' } ) ).to.be.false;
			viewConsumable.add( el, { style: [ 'color', 'top', 'position' ] } );
			expect( viewConsumable.consume( el, { attribute: 'style' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attribute: 'style' } ) ).to.be.false;
			expect( viewConsumable.test( el, { style: 'color' } ) ).to.be.false;
			expect( viewConsumable.test( el, { style: 'top' } ) ).to.be.false;
			expect( viewConsumable.test( el, { style: 'position' } ) ).to.be.false;
		} );
	} );

	describe( 'revert', () => {
		it( 'should revert single element', () => {
			viewConsumable.add( el, { name: true } );
			viewConsumable.consume( el, { name: true } );
			expect( viewConsumable.test( el, { name: true } ) ).to.be.false;
			viewConsumable.revert( el, { name: true } );
			expect( viewConsumable.test( el, { name: true } ) ).to.be.true;
		} );

		it( 'should revert text node', () => {
			const text1 = new ViewText();
			const text2 = new ViewText();

			viewConsumable.add( text1 );
			viewConsumable.consume( text1 );

			viewConsumable.revert( text1 );
			viewConsumable.revert( text2 );

			expect( viewConsumable.test( text1 ) ).to.be.true;
			expect( viewConsumable.test( text2 ) ).to.be.null;
		} );

		it( 'should revert document fragment', () => {
			const fragment1 = new ViewDocumentFragment();
			const fragment2 = new ViewDocumentFragment();

			viewConsumable.add( fragment1 );
			viewConsumable.consume( fragment1 );

			viewConsumable.revert( fragment1 );
			viewConsumable.revert( fragment2 );

			expect( viewConsumable.test( fragment1 ) ).to.be.true;
			expect( viewConsumable.test( fragment2 ) ).to.be.null;
		} );

		it( 'should not revert element that was never added', () => {
			viewConsumable.revert( el, { name: true } );
			expect( viewConsumable.test( el, { name: true } ) ).to.be.null;
		} );

		it( 'should do nothing on not consumed element', () => {
			viewConsumable.add( el, { name: true } );
			viewConsumable.revert( el, { name: true } );
			expect( viewConsumable.test( el, { name: true } ) ).to.be.true;
		} );

		it( 'should revert classes, attributes and styles', () => {
			viewConsumable.add( el, { class: 'foobar', style: 'color', attribute: 'name' } );
			viewConsumable.consume( el, { class: 'foobar', style: 'color', attribute: 'name' } );

			viewConsumable.revert( el, { class: 'foobar' } );
			viewConsumable.revert( el, { style: 'color' } );
			viewConsumable.revert( el, { attribute: 'name' } );

			expect( viewConsumable.test( el, { class: 'foobar', style: 'color', attribute: 'name' } ) ).to.be.true;
		} );

		it( 'should revert multiple classes, attributes and styles in one call #1', () => {
			viewConsumable.add( el, {
				class: 'foobar',
				style: 'color',
				attribute: 'name'
			} );
			viewConsumable.consume( el, { class: 'foobar', style: 'color', attribute: 'name' } );
			viewConsumable.revert( el, { class: 'foobar', style: 'color', attribute: 'name' } );

			expect( viewConsumable.test( el, { class: 'foobar', style: 'color', attribute: 'name' } ) ).to.be.true;
		} );

		it( 'should revert multiple classes, attributes and styles in one call #2', () => {
			const consumables = {
				class: [ 'foobar', 'baz' ],
				style: [ 'color', 'position' ],
				attribute: [ 'name', 'href' ]
			};

			viewConsumable.add( el, consumables );
			viewConsumable.consume( el, consumables );
			viewConsumable.revert( el, consumables );

			expect( viewConsumable.test( el, consumables ) ).to.be.true;
		} );

		it( 'should revert only items that were previously added', () => {
			viewConsumable.add( el, { class: 'foobar' } );
			viewConsumable.consume( el, { class: 'foobar' } );
			viewConsumable.revert( el, { class: 'foobar', attribute: 'name' } );

			expect( viewConsumable.test( el, { class: 'foobar' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attribute: 'name' } ) ).to.be.null;
		} );

		it( 'should revert all classes when class attribute is provided', () => {
			viewConsumable.add( el, { class: [ 'foo', 'bar', 'baz' ] } );
			expect( viewConsumable.consume( el, { class: [ 'foo', 'bar', 'baz' ] } ) ).to.be.true;
			viewConsumable.revert( el, { attribute: 'class' } );

			expect( viewConsumable.test( el, { class: 'foo' } ) ).to.be.true;
			expect( viewConsumable.test( el, { class: 'bar' } ) ).to.be.true;
			expect( viewConsumable.test( el, { class: 'baz' } ) ).to.be.true;
			expect( viewConsumable.test( el, { class: 'qux' } ) ).to.be.null;
		} );

		it( 'should revert all styles when style attribute is provided', () => {
			viewConsumable.add( el, { style: [ 'color', 'top' ] } );
			expect( viewConsumable.consume( el, { style: [ 'color', 'top' ] } ) ).to.be.true;
			viewConsumable.revert( el, { attribute: 'style' } );

			expect( viewConsumable.test( el, { style: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el, { style: 'top' } ) ).to.be.true;
			expect( viewConsumable.test( el, { style: 'qux' } ) ).to.be.null;
		} );
	} );

	describe( 'consumablesFromElement', () => {
		it( 'should create consumable object from element', () => {
			const consumables = ViewConsumable.consumablesFromElement( el );

			expect( consumables ).to.be.an( 'object' );
			expect( consumables.name ).to.be.true;
			expect( consumables.attribute ).to.be.an( 'array' );
			expect( consumables.attribute.length ).to.equal( 0 );
			expect( consumables.class ).to.be.an( 'array' );
			expect( consumables.class.length ).to.equal( 0 );
			expect( consumables.style ).to.be.an( 'array' );
			expect( consumables.style.length ).to.equal( 0 );
		} );

		it( 'should add all attributes', () => {
			el.setAttribute( 'title', 'foobar' );
			el.setAttribute( 'href', 'https://ckeditor.com' );

			const consumables = ViewConsumable.consumablesFromElement( el );
			expect( consumables.attribute.length ).to.equal( 2 );
			expect( consumables.attribute.indexOf( 'title' ) > -1 ).to.be.true;
			expect( consumables.attribute.indexOf( 'href' ) > -1 ).to.be.true;
			expect( consumables.class.length ).to.equal( 0 );
			expect( consumables.style.length ).to.equal( 0 );
			expect( consumables.name ).to.be.true;
		} );

		it( 'should add all classes', () => {
			el.addClass( 'foo', 'bar', 'baz' );

			const consumables = ViewConsumable.consumablesFromElement( el );
			expect( consumables.class.length ).to.equal( 3 );
			expect( consumables.class.indexOf( 'foo' ) > -1 ).to.be.true;
			expect( consumables.class.indexOf( 'bar' ) > -1 ).to.be.true;
			expect( consumables.class.indexOf( 'baz' ) > -1 ).to.be.true;
			expect( consumables.attribute.length ).to.equal( 0 );
			expect( consumables.style.length ).to.equal( 0 );
			expect( consumables.name ).to.be.true;
		} );

		it( 'should add all styles', () => {
			el.setStyle( {
				color: 'red',
				position: 'absolute'
			} );

			const consumables = ViewConsumable.consumablesFromElement( el );
			expect( consumables.style.length ).to.equal( 2 );
			expect( consumables.style.indexOf( 'color' ) > -1 ).to.be.true;
			expect( consumables.style.indexOf( 'position' ) > -1 ).to.be.true;
			expect( consumables.attribute.length ).to.equal( 0 );
			expect( consumables.class.length ).to.equal( 0 );
			expect( consumables.name ).to.be.true;
		} );
	} );

	describe( 'createFrom', () => {
		it( 'should return new ViewConsumable instance', () => {
			const newConsumable = ViewConsumable.createFrom( el );

			expect( newConsumable ).to.be.instanceof( ViewConsumable );
			expect( newConsumable.test( el, { name: true } ) ).to.be.true;
		} );

		it( 'should return new ViewConsumable instance from document fragment', () => {
			const fragment = new ViewDocumentFragment();
			const newConsumable = ViewConsumable.createFrom( fragment );

			expect( newConsumable ).to.be.instanceof( ViewConsumable );
			expect( newConsumable.test( fragment ) ).to.be.true;
		} );

		it( 'should add all child elements', () => {
			const text1 = new ViewText( 'foo' );
			const text2 = new ViewText( 'bar' );
			const child1 = new ViewElement( 'p', { 'title': 'baz' }, [ text1 ] );
			const child2 = new ViewElement( 'p' );
			const child3 = new ViewElement( 'p', { 'style': 'top:10px;', 'class': 'qux bar' }, [ text2, child2 ] );
			el.appendChildren( [ child1, child3 ] );

			const newConsumable = ViewConsumable.createFrom( el );

			expect( newConsumable.test( el, { name: true } ) ).to.be.true;
			expect( newConsumable.test( text1 ) ).to.be.true;
			expect( newConsumable.test( text2 ) ).to.be.true;
			expect( newConsumable.test( child1, { name: true, attribute: 'title' } ) ).to.be.true;
			expect( newConsumable.test( child2, { name: true } ) ).to.be.true;
			expect( newConsumable.test( child3, { name: true, style: 'top', class: [ 'qux', 'bar' ] } ) ).to.be.true;
		} );
	} );
} );
