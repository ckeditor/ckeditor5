/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treecontroller */

'use strict';

import ViewElement from '/ckeditor5/engine/treeview/element.js';
import ViewConsumable from '/ckeditor5/engine/treecontroller/viewconsumable.js';

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

	describe( 'consume', () => {
		it( 'should consume element', () => {
			viewConsumable.add( el );
			const consumed = viewConsumable.consume( el );

			expect( viewConsumable.test( el ) ).to.be.false;
			expect( consumed ).to.be.true;
		} );

		it( 'should not consume element not marked for consumption', () => {
			expect( viewConsumable.consume( el ) ).to.be.false;
		} );

		it( 'should not consume element already consumed', () => {
			viewConsumable.add( el );

			expect( viewConsumable.consume( el ) ).to.be.true;
			expect( viewConsumable.consume( el ) ).to.be.false;
		} );

		it( 'should consume attributes, classes and styles', () => {
			viewConsumable.add( { element: el, class: 'foobar', attribute: 'href', style: 'color' } );

			const consumed1 = viewConsumable.consume( { element: el, class: 'foobar' } );
			const consumed2 = viewConsumable.consume( { element: el, attribute: 'href' } );
			const consumed3 = viewConsumable.consume( { element: el, style: 'color' } );

			expect( consumed1 ).to.be.true;
			expect( consumed2 ).to.be.true;
			expect( consumed3 ).to.be.true;

			expect( viewConsumable.test( { element: el, class: 'foobar' } ) ).to.be.false;
			expect( viewConsumable.test( { element: el, attribute: 'href' } ) ).to.be.false;
			expect( viewConsumable.test( { element: el, style: 'color' } ) ).to.be.false;
		} );

		it( 'should consume multiple attributes', () => {
			viewConsumable.add( { element: el, attribute: [ 'href', 'title', 'name' ] } );

			const consumed = viewConsumable.consume( { element: el, attribute: [ 'href', 'title' ] } );

			expect( consumed ).to.be.true;
			expect( viewConsumable.test( { element: el, attribute: 'href' } ) ).to.be.false;
			expect( viewConsumable.test( { element: el, attribute: 'title' } ) ).to.be.false;
			expect( viewConsumable.test( { element: el, attribute: 'name' } ) ).to.be.true;
		} );

		it( 'should consume multiple styles', () => {
			viewConsumable.add( { element: el, style: [ 'color', 'top', 'position' ] } );

			const consumed = viewConsumable.consume( { element: el, style: [ 'color', 'position' ] } );

			expect( consumed ).to.be.true;
			expect( viewConsumable.test( { element: el, style: 'color' } ) ).to.be.false;
			expect( viewConsumable.test( { element: el, style: 'position' } ) ).to.be.false;
			expect( viewConsumable.test( { element: el, style: 'top' } ) ).to.be.true;
		} );

		it( 'should consume multiple classes', () => {
			viewConsumable.add( { element: el, class: [ 'foo', 'bar', 'baz' ] } );

			const consumed = viewConsumable.consume( { element: el, class: [ 'bar', 'baz' ] } );

			expect( consumed ).to.be.true;
			expect( viewConsumable.test( { element: el, class: 'bar' } ) ).to.be.false;
			expect( viewConsumable.test( { element: el, class: 'baz' } ) ).to.be.false;
			expect( viewConsumable.test( { element: el, class: 'foo' } ) ).to.be.true;
		} );

		it( 'should consume multiple items', () => {
			viewConsumable.add( {
				element: el,
				attribute: [ 'name', 'href', 'title' ],
				class: [ 'foo', 'bar', 'baz' ],
				style: [ 'color', 'position' ]
			} );

			const consumed = viewConsumable.consume(
				{ element: el, attribute: 'name', class: 'foo' } ,
				{ element: el, attribute: 'href', class: [ 'bar', 'baz' ] } ,
				{ element: el, attribute: 'title', style: 'color' }
			);

			expect( consumed ).to.be.true;
			expect( viewConsumable.test( { element: el, attribute: 'name' } ) ).to.be.false;
			expect( viewConsumable.test( { element: el, attribute: 'href' } ) ).to.be.false;
			expect( viewConsumable.test( { element: el, attribute: 'title' } ) ).to.be.false;

			expect( viewConsumable.test( { element: el, class: 'foo' } ) ).to.be.false;
			expect( viewConsumable.test( { element: el, class: 'bar' } ) ).to.be.false;
			expect( viewConsumable.test( { element: el, class: 'baz' } ) ).to.be.false;

			expect( viewConsumable.test( { element: el, style: 'color' } ) ).to.be.false;
			expect( viewConsumable.test( { element: el, style: 'position' } ) ).to.be.true;
		} );

		it( 'should consume element provided as only item in object', () => {
			viewConsumable.add( el );
			const consumed = viewConsumable.consume( { element: el } );

			expect( viewConsumable.test( el ) ).to.be.false;
			expect( consumed ).to.be.true;
		} );

		it( 'should consume only if all items can be consumed', () => {
			viewConsumable.add( { element: el, style: [ 'position', 'color' ], attribute: [ 'href', 'title' ] } );

			let consumed = viewConsumable.consume( el, { element: el, style: 'color' } );
			expect( consumed ).to.be.false;
			expect( viewConsumable.test( { element: el, style: 'color' } ) ).to.be.true;

			consumed = viewConsumable.consume( { element: el, style: [ 'color', 'top' ] } );
			expect( consumed ).to.be.false;
			expect( viewConsumable.test( { element: el, style: 'color' } ) ).to.be.true;
		} );

		it( 'should throw an error when element is not provided', () => {
			expect( () => {
				viewConsumable.consume( { style: 'color' } );
			} ).to.throw( 'viewconsumable-element-missing' );
		} );

		it( 'should throw if class attribute is provided', () => {
			viewConsumable.add( { element: el, class: 'foobar' } );

			expect( () => {
				viewConsumable.consume( { element: el, attribute: 'class' } );
			} ).to.throw( 'viewconsumable-invalid-attribute' );
		} );

		it( 'should throw if style attribute is provided', () => {
			viewConsumable.add( { element: el, style: 'color' } );

			expect( () => {
				viewConsumable.consume( { element: el, attribute: 'style' } );
			} ).to.throw( 'viewconsumable-invalid-attribute' );
		} );
	} );

	describe( 'revert', () => {
		it( 'should revert single element', () => {
			viewConsumable.add( el );
			viewConsumable.consume( el );
			expect( viewConsumable.test( el ) ).to.be.false;
			viewConsumable.revert( el );
			expect( viewConsumable.test( el ) ).to.be.true;
		} );

		it( 'should not revert element that was never added', () => {
			viewConsumable.revert( el );
			expect( viewConsumable.test( el ) ).to.be.null;
		} );

		it( 'should do nothing on not consumed element', () => {
			viewConsumable.add( el );
			viewConsumable.revert( el );
			expect( viewConsumable.test( el ) ).to.be.true;
		} );

		it( 'should revert classes, attributes and styles', () => {
			viewConsumable.add( { element: el, class: 'foobar', style: 'color', attribute: 'name' } );
			viewConsumable.consume( { element: el, class: 'foobar', style: 'color', attribute: 'name' } );

			viewConsumable.revert( { element: el, class: 'foobar' } );
			viewConsumable.revert( { element: el, style: 'color' } );
			viewConsumable.revert( { element: el, attribute: 'name' } );

			expect( viewConsumable.test( { element: el, class: 'foobar', style: 'color', attribute: 'name' } ) ).to.be.true;
		} );

		it( 'should revert multiple classes, attributes and styles in one call #1', () => {
			viewConsumable.add( {
				element: el,
				class: 'foobar',
				style: 'color',
				attribute: 'name'
			} );
			viewConsumable.consume( { element: el, class: 'foobar', style: 'color', attribute: 'name' } );
			viewConsumable.revert( { element: el, class: 'foobar', style: 'color', attribute: 'name' } );

			expect( viewConsumable.test( { element: el, class: 'foobar', style: 'color', attribute: 'name' } ) ).to.be.true;
		} );

		it( 'should revert multiple classes, attributes and styles in one call #2', () => {
			const description = {
				element: el,
				class: [ 'foobar', 'baz' ],
				style: [ 'color', 'position' ],
				attribute: [ 'name', 'href' ]
			};

			viewConsumable.add( description );
			viewConsumable.consume( description );
			viewConsumable.revert( description );

			expect( viewConsumable.test( description ) ).to.be.true;
		} );

		it( 'should not revert non consumable items', () => {
			viewConsumable.add( { element: el, class: 'foobar' } );
			viewConsumable.consume( { element: el, class: 'foobar' }  );
			viewConsumable.revert( { element: el, class: 'foobar', attribute: 'name' } );

			expect( viewConsumable.test( { element: el, class: 'foobar' } ) ).to.be.true;
			expect( viewConsumable.test( { element: el, attribute: 'name' } ) ).to.be.null;
		} );

		it( 'should allow to use additional parameters in one call', () => {
			const el2 = new ViewElement( 'p' );
			viewConsumable.add( el, el2 );
			expect( viewConsumable.consume( el, el2 ) ).to.be.true;
			viewConsumable.revert( el, el2 );

			expect( viewConsumable.test( el, el2 ) ).to.be.true;
		} );

		it( 'should throw an error when element is not provided', () => {
			expect( () => {
				viewConsumable.revert( { style: 'color' } );
			} ).to.throw( 'viewconsumable-element-missing' );
		} );

		it( 'should throw if class attribute is provided', () => {
			viewConsumable.add( { element: el, class: 'foobar' } );
			viewConsumable.consume( { element: el, class: 'foobar' } );

			expect( () => {
				viewConsumable.revert( { element: el, attribute: 'class' } );
			} ).to.throw( 'viewconsumable-invalid-attribute' );
		} );

		it( 'should throw if style attribute is provided', () => {
			viewConsumable.add( { element: el, style: 'color' } );
			viewConsumable.consume( { element: el, style: 'color' } );

			expect( () => {
				viewConsumable.revert( { element: el, attribute: 'style' } );
			} ).to.throw( 'viewconsumable-invalid-attribute' );
		} );
	} );
} );
