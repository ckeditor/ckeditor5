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

	beforeEach( () => {
		viewConsumable = new ViewConsumable();
	} );

	describe( 'add', () => {
		let el;

		beforeEach( () => {
			el = new ViewElement( 'p' );
		} );

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
			expect( viewConsumable.test( el ) ).to.be.false;
		} );

		it( 'should allow to add attributes classes and styles in one call', () => {
			viewConsumable.add( { element: el, attribute: 'href', class: 'foobar', style: 'color' } );

			expect( viewConsumable.test( { element: el, attribute: 'href' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, class: 'foobar' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, style: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el ) ).to.be.false;
		} );

		it( 'should allow to add multiple attributes in one call', () => {
			viewConsumable.add( { element: el, attribute: [ 'href', 'target', 'title' ] } );

			expect( viewConsumable.test( { element: el, attribute: 'href' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, attribute: 'target' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, attribute: 'title' } ) ).to.be.true;
			expect( viewConsumable.test( el ) ).to.be.false;
		} );

		it( 'should allow to add multiple classes in one call', () => {
			viewConsumable.add( { element: el, class: [ 'foo', 'bar', 'baz' ] } );

			expect( viewConsumable.test( { element: el, class: 'foo' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, class: 'bar' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, class: 'baz' } ) ).to.be.true;
			expect( viewConsumable.test( el ) ).to.be.false;
		} );

		it( 'should allow to add multiple styles in one call', () => {
			viewConsumable.add( { element: el, style: [ 'color', 'position', 'top' ] } );

			expect( viewConsumable.test( { element: el, style: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, style: 'position' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, style: 'top' } ) ).to.be.true;
			expect( viewConsumable.test( el ) ).to.be.false;
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
} );