/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treecontroller */

'use strict';

import ViewElement from '/ckeditor5/core/treeview/element.js';
import ViewConsumable from '/ckeditor5/core/treecontroller/viewconsumable.js';

describe( 'ViewConsumable', () => {
	let viewConsumable;
	let el;

	beforeEach( () => {
		viewConsumable = new ViewConsumable();
		el = new ViewElement( 'p' );
	} );

	describe( 'add', () => {
		it( 'should allow to add element', () => {
			viewConsumable.add( el );

			expect( viewConsumable.test( el ) ).to.be.true;
		} );

		it( 'should allow to add element inside description object', () => {
			viewConsumable.add( { element: el } );

			expect( viewConsumable.test( el ) ).to.be.true;
		} );

		it( 'should allow to add attributes classes and styles', () => {
			viewConsumable.add( { element: el, attribute: 'href' } );
			viewConsumable.add( { element: el, class: 'foobar' } );
			viewConsumable.add( { element: el, style: 'color' } );

			expect( viewConsumable.test( { element: el, attribute: 'href' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, class: 'foobar' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, style: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el ) ).to.be.null;
		} );

		it( 'should allow to add attributes classes and styles in one call', () => {
			viewConsumable.add( { element: el, attribute: 'href', class: 'foobar', style: 'color' } );

			expect( viewConsumable.test( { element: el, attribute: 'href' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, class: 'foobar' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, style: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el ) ).to.be.null;
		} );

		it( 'should allow to add multiple attributes in one call', () => {
			viewConsumable.add( { element: el, attribute: [ 'href', 'target', 'title' ] } );

			expect( viewConsumable.test( { element: el, attribute: 'href' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, attribute: 'target' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, attribute: 'title' } ) ).to.be.true;
			expect( viewConsumable.test( el ) ).to.be.null;
		} );

		it( 'should allow to add multiple classes in one call', () => {
			viewConsumable.add( { element: el, class: [ 'foo', 'bar', 'baz' ] } );

			expect( viewConsumable.test( { element: el, class: 'foo' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, class: 'bar' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, class: 'baz' } ) ).to.be.true;
			expect( viewConsumable.test( el ) ).to.be.null;
		} );

		it( 'should allow to add multiple styles in one call', () => {
			viewConsumable.add( { element: el, style: [ 'color', 'position', 'top' ] } );

			expect( viewConsumable.test( { element: el, style: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, style: 'position' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, style: 'top' } ) ).to.be.true;
			expect( viewConsumable.test( el ) ).to.be.null;
		} );

		it( 'should allow to add multiple consumables in one call', () => {
			viewConsumable.add( el, { element: el, style: 'color' } );

			expect( viewConsumable.test( el ) ).to.be.true;
			expect( viewConsumable.test( { element: el, style: 'color' } ) );
		} );

		it( 'should throw an error when element is not provided', () => {
			expect( () => {
				viewConsumable.add( { style: 'color' } );
			} ).to.throw( 'viewconsumable-element-missing' );
		} );

		it( 'should throw if class attribute is added', () => {
			expect( () => {
				viewConsumable.add( { element: el, attribute: 'class' } );
			} ).to.throw( 'viewconsumable-invalid-attribute' );
		} );

		it( 'should throw if style attribute is added', () => {
			expect( () => {
				viewConsumable.add( { element: el, attribute: 'style' } );
			} ).to.throw( 'viewconsumable-invalid-attribute' );
		} );
	} );

	describe( 'test', () => {
		it( 'should test added element', () => {
			const el2 = new ViewElement( 'p' );

			viewConsumable.add( el );

			expect( viewConsumable.test( el ) ).to.be.true;
			expect( viewConsumable.test( { element: el } ) ).to.be.true;
			expect( viewConsumable.test( el2 ) ).to.be.null;
			expect( viewConsumable.test( { element: el2 } ) ).to.be.null;
		} );

		it( 'should test attributes, classes and styles', () => {
			const el = new ViewElement( 'p' );

			viewConsumable.add( { element: el, attribute: 'href', class: 'foobar', style: 'color' } );

			expect( viewConsumable.test( { element: el, attribute: 'href' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, class: 'foobar' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, style: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, attribute: 'href', class: 'foobar', style: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el ) ).to.be.null;
		} );

		it( 'should allow to test multiple attributes in one call', () => {
			viewConsumable.add( { element: el, attribute: [ 'href', 'title', 'target' ] } );

			expect( viewConsumable.test( { element: el, attribute: [ 'href', 'title', 'target' ] } ) ).to.be.true;
		} );

		it( 'should allow to test multiple classes in one call', () => {
			viewConsumable.add( { element: el, class: [ 'foo', 'bar', 'baz' ] } );

			expect( viewConsumable.test( { element: el, class: [ 'foo', 'bar', 'baz' ] } ) ).to.be.true;
		} );

		it( 'should allow to test multiple styles in one call', () => {
			viewConsumable.add( { element: el, style: [ 'color', 'position', 'top' ] } );

			expect( viewConsumable.test( { element: el, style: [ 'color', 'position', 'top' ] } ) ).to.be.true;
		} );

		it( 'should allow to test with multiple parameters', () => {
			viewConsumable.add( el, { element: el, class: 'foobar' }, { element: el, 'style': 'red' } );

			expect( viewConsumable.test( el, { element: el, style: 'red' }, { element: el, class: 'foobar' } ) ).to.be.true;
		} );

		it( 'should return null if not consumable', () => {
			expect( viewConsumable.test( el ) ).to.be.null;
		} );

		it( 'should return false if already consumed', () => {
			viewConsumable.add( el );
			viewConsumable.consume( el );

			expect( viewConsumable.test( el ) ).to.be.false;
		} );

		it( 'should return null if first non-consumable item is found', () => {
			viewConsumable.add( { element: el, attribute: 'foo' } );

			expect( viewConsumable.test( { element: el, attribute: [ 'foo', 'bar' ] } ) ).to.be.null;
			expect( viewConsumable.test( { element: el, attribute: 'foo' }, el ) ).to.be.null;
		} );

		it( 'should return false if first already consumed item is found', () => {
			viewConsumable.add( { element: el, attribute: [ 'foo', 'bar' ] }, el );
			viewConsumable.consume( { element: el, attribute: 'bar' } );
			viewConsumable.consume( el );

			expect( viewConsumable.test( { element: el, attribute: [ 'foo', 'bar' ] } ) ).to.be.false;
			expect( viewConsumable.test( el ) ).to.be.false;
		} );

		it( 'should throw an error when element is not provided', () => {
			expect( () => {
				viewConsumable.test( { style: 'color' } );
			} ).to.throw( 'viewconsumable-element-missing' );
		} );

		it( 'should throw if class attribute is tested', () => {
			viewConsumable.add( { element: el, class: 'foobar' } );

			expect( () => {
				viewConsumable.test( { element: el, attribute: 'class' } );
			} ).to.throw( 'viewconsumable-invalid-attribute' );
		} );

		it( 'should throw if style attribute is tested', () => {
			viewConsumable.add( { element: el, style: 'color' } );

			expect( () => {
				viewConsumable.test( { element: el, attribute: 'style' } );
			} ).to.throw( 'viewconsumable-invalid-attribute' );
		} );
	} );
} );