/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ViewDocument } from '../../src/view/document.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewText } from '../../src/view/text.js';
import { ViewDocumentFragment } from '../../src/view/documentfragment.js';
import { ViewConsumable } from '../../src/conversion/viewconsumable.js';
import { addBorderStylesRules } from '../../src/view/styles/border.js';
import { addMarginStylesRules } from '../../src/view/styles/margin.js';
import { addPaddingStylesRules } from '../../src/view/styles/padding.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'ViewConsumable', () => {
	let viewConsumable, el, viewDocument;

	beforeEach( () => {
		const stylesProcessor = new StylesProcessor();
		viewDocument = new ViewDocument( stylesProcessor );

		addBorderStylesRules( stylesProcessor );
		addMarginStylesRules( stylesProcessor );
		addPaddingStylesRules( stylesProcessor );

		viewConsumable = new ViewConsumable();
		el = new ViewElement( viewDocument, 'p' );
	} );

	describe( 'add', () => {
		it( 'should allow to add element name', () => {
			viewConsumable.add( el, { name: true } );

			expect( viewConsumable.test( el, { name: true } ) ).toBe( true );
		} );

		it( 'should allow to add text node', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			viewConsumable.add( text );

			expect( viewConsumable.test( text ) ).toBe( true );
		} );

		it( 'should allow to add document fragment', () => {
			const fragment = new ViewDocumentFragment( viewDocument );
			viewConsumable.add( fragment );
			expect( viewConsumable.test( fragment ) ).toBe( true );
		} );

		it( 'should allow to add attribute classes and styles', () => {
			viewConsumable.add( el, { attributes: 'href' } );
			viewConsumable.add( el, { classes: 'foobar' } );
			viewConsumable.add( el, { styles: 'color' } );

			expect( viewConsumable.test( el, { attributes: 'href' } ) ).toBe( true );
			expect( viewConsumable.test( el, { classes: 'foobar' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'color' } ) ).toBe( true );
			expect( viewConsumable.test( el, { name: true } ) ).toBeNull();
		} );

		it( 'should allow to add attribute classes and styles in one call', () => {
			viewConsumable.add( el, { attributes: 'href', classes: 'foobar', styles: 'color' } );

			expect( viewConsumable.test( el, { attributes: 'href' } ) ).toBe( true );
			expect( viewConsumable.test( el, { classes: 'foobar' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'color' } ) ).toBe( true );
			expect( viewConsumable.test( el, { name: true } ) ).toBeNull();
		} );

		it( 'should allow to add multiple attribute in one call', () => {
			viewConsumable.add( el, { attributes: [ 'href', 'target', 'title' ] } );

			expect( viewConsumable.test( el, { attributes: 'href' } ) ).toBe( true );
			expect( viewConsumable.test( el, { attributes: 'target' } ) ).toBe( true );
			expect( viewConsumable.test( el, { attributes: 'title' } ) ).toBe( true );
			expect( viewConsumable.test( el, { name: true } ) ).toBeNull();
		} );

		it( 'should allow to add multiple classes in one call', () => {
			viewConsumable.add( el, { classes: [ 'foo', 'bar', 'baz' ] } );

			expect( viewConsumable.test( el, { classes: 'foo' } ) ).toBe( true );
			expect( viewConsumable.test( el, { classes: 'bar' } ) ).toBe( true );
			expect( viewConsumable.test( el, { classes: 'baz' } ) ).toBe( true );
			expect( viewConsumable.test( el, { name: true } ) ).toBeNull();
		} );

		it( 'should allow to add multiple styles in one call', () => {
			viewConsumable.add( el, { styles: [ 'color', 'position', 'top' ] } );

			expect( viewConsumable.test( el, { styles: 'color' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'position' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'top' } ) ).toBe( true );
			expect( viewConsumable.test( el, { name: true } ) ).toBeNull();
		} );

		it( 'should throw if class attribute is added', () => {
			expect( () => {
				viewConsumable.add( el, { attributes: 'class' } );
			} ).toThrow( 'viewconsumable-invalid-attribute' );
		} );

		it( 'should throw if style attribute is added', () => {
			expect( () => {
				viewConsumable.add( el, { attributes: 'style' } );
			} ).toThrow( 'viewconsumable-invalid-attribute' );
		} );
	} );

	describe( 'test', () => {
		it( 'should test element name', () => {
			const el2 = new ViewElement( viewDocument, 'p' );

			viewConsumable.add( el, { name: true } );

			expect( viewConsumable.test( el, { name: true } ) ).toBe( true );
			expect( viewConsumable.test( el2, { name: true } ) ).toBeNull();
		} );

		it( 'should test text nodes', () => {
			const text1 = new ViewText( viewDocument );
			const text2 = new ViewText( viewDocument );

			viewConsumable.add( text1 );

			expect( viewConsumable.test( text1 ) ).toBe( true );
			expect( viewConsumable.test( text2 ) ).toBeNull();
		} );

		it( 'should test document fragments', () => {
			const fragment1 = new ViewDocumentFragment( viewDocument );
			const fragment2 = new ViewDocumentFragment( viewDocument );

			viewConsumable.add( fragment1 );

			expect( viewConsumable.test( fragment1 ) ).toBe( true );
			expect( viewConsumable.test( fragment2 ) ).toBeNull();
		} );

		it( 'should test attribute, classes and styles', () => {
			const el = new ViewElement( viewDocument, 'p', { href: '#', class: 'foobar', style: 'color:red' } );

			ViewConsumable.createFrom( el, viewConsumable );

			expect( viewConsumable.test( el, { attributes: 'href' } ) ).toBe( true );
			expect( viewConsumable.test( el, { classes: 'foobar' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'color' } ) ).toBe( true );
			expect( viewConsumable.test( el, { attributes: 'href', classes: 'foobar', styles: 'color' } ) ).toBe( true );
			expect( viewConsumable.test( el, { attributes: 'href', classes: 'baz' } ) ).toBeNull();
			expect( viewConsumable.test( el, { name: true } ) ).toBe( true );

			viewConsumable.consume( el, { styles: 'color' } );
			expect( viewConsumable.test( el, { attributes: 'href', styles: 'color' } ) ).toBe( false );
		} );

		it( 'should allow to test multiple attribute in one call', () => {
			el._setAttribute( 'href', '#' );
			el._setAttribute( 'title', 'foo' );
			el._setAttribute( 'target', 'blank' );
			ViewConsumable.createFrom( el, viewConsumable );

			expect( viewConsumable.test( el, { attributes: [ 'href', 'title', 'target' ] } ) ).toBe( true );
			expect( viewConsumable.test( el, { attributes: [ 'href', 'title', 'alt' ] } ) ).toBeNull();

			viewConsumable.consume( el, { attributes: 'target' } );
			expect( viewConsumable.test( el, { attributes: [ 'href', 'title', 'target' ] } ) ).toBe( false );
		} );

		it( 'should allow to test multiple classes in one call', () => {
			el._setAttribute( 'class', 'foo bar baz' );
			ViewConsumable.createFrom( el, viewConsumable );

			expect( viewConsumable.test( el, { classes: [ 'foo', 'bar', 'baz' ] } ) ).toBe( true );
			expect( viewConsumable.test( el, { classes: [ 'foo', 'bar', 'qux' ] } ) ).toBeNull();

			viewConsumable.consume( el, { classes: 'bar' } );
			expect( viewConsumable.test( el, { classes: [ 'foo', 'bar', 'baz' ] } ) ).toBe( false );
		} );

		it( 'should allow to test multiple styles in one call', () => {
			el._setAttribute( 'style', 'color: red; position: fixed; top: 2px;' );
			ViewConsumable.createFrom( el, viewConsumable );

			expect( viewConsumable.test( el, { styles: [ 'color', 'position', 'top' ] } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: [ 'color', 'position', 'left' ] } ) ).toBeNull();

			viewConsumable.consume( el, { styles: 'top' } );
			expect( viewConsumable.test( el, { styles: [ 'color', 'position', 'top' ] } ) ).toBe( false );
		} );

		it( 'should return null if not consumable', () => {
			expect( viewConsumable.test( el ) ).toBeNull();
		} );

		it( 'should return false if already consumed', () => {
			viewConsumable.add( el, { name: true } );
			viewConsumable.consume( el, { name: true } );

			expect( viewConsumable.test( el, { name: true } ) ).toBe( false );
		} );

		it( 'should return null if first non-consumable item is found', () => {
			viewConsumable.add( el, { attributes: 'foo' } );

			expect( viewConsumable.test( el, { attributes: [ 'foo', 'bar' ] } ) ).toBeNull();
		} );

		it( 'should return false if first already consumed item is found', () => {
			el._setAttribute( 'foo', 'a' );
			el._setAttribute( 'bar', 'b' );
			ViewConsumable.createFrom( el, viewConsumable );
			viewConsumable.consume( el, { attributes: 'bar' } );
			viewConsumable.consume( el, { name: true } );

			expect( viewConsumable.test( el, { attributes: [ 'foo', 'bar' ] } ) ).toBe( false );
			expect( viewConsumable.test( el, { name: true } ) ).toBe( false );
		} );

		it( 'should test all classes if class attribute is tested', () => {
			el._setAttribute( 'class', 'foo bar baz' );
			ViewConsumable.createFrom( el, viewConsumable );
			expect( viewConsumable.test( el, { attributes: 'class' } ) ).toBe( true );
			expect( viewConsumable.consume( el, { classes: 'baz' } ) ).toBe( true );
			expect( viewConsumable.test( el, { attributes: 'class' } ) ).toBe( false );
		} );

		it( 'should test all styles if style attribute is tested', () => {
			el._setAttribute( 'style', 'color: red; top: 3px; position: relative;' );
			ViewConsumable.createFrom( el, viewConsumable );
			expect( viewConsumable.test( el, { attributes: 'style' } ) ).toBe( true );
			expect( viewConsumable.consume( el, { styles: 'top' } ) ).toBe( true );
			expect( viewConsumable.test( el, { attributes: 'style' } ) ).toBe( false );
		} );

		it( 'should return false when testing class attribute when consumed classes exists', () => {
			el._setAttribute( 'class', 'foo baz' );
			ViewConsumable.createFrom( el, viewConsumable );
			expect( viewConsumable.consume( el, { classes: 'baz' } ) ).toBe( true );
			expect( viewConsumable.test( el, { attributes: 'class' } ) ).toBe( false );
			expect( viewConsumable.consume( el, { attributes: 'class' } ) ).toBe( false );
		} );

		it( 'should return false when testing style attribute when consumed styles exists', () => {
			el._setAttribute( 'style', 'top: 2px; left: 10px;' );
			ViewConsumable.createFrom( el, viewConsumable );
			expect( viewConsumable.consume( el, { styles: 'top' } ) ).toBe( true );
			expect( viewConsumable.test( el, { attributes: 'style' } ) ).toBe( false );
			expect( viewConsumable.consume( el, { attributes: 'style' } ) ).toBe( false );
		} );
	} );

	describe( 'consume', () => {
		it( 'should consume element', () => {
			viewConsumable.add( el, { name: true } );
			const consumed = viewConsumable.consume( el, { name: true } );

			expect( viewConsumable.test( el, { name: true } ) ).toBe( false );
			expect( consumed ).toBe( true );
		} );

		it( 'should consume text node', () => {
			const text = new ViewText( viewDocument );
			viewConsumable.add( text );
			const consumed = viewConsumable.consume( text );
			expect( consumed ).toBe( true );
			expect( viewConsumable.test( text ) ).toBe( false );
			expect( viewConsumable.consume( text ) ).toBe( false );
		} );

		it( 'should consume document fragment', () => {
			const fragment = new ViewDocumentFragment( viewDocument );
			viewConsumable.add( fragment );
			const consumed = viewConsumable.consume( fragment );
			expect( consumed ).toBe( true );
			expect( viewConsumable.test( fragment ) ).toBe( false );
			expect( viewConsumable.consume( fragment ) ).toBe( false );
		} );

		it( 'should not consume element not marked for consumption', () => {
			expect( viewConsumable.consume( el, { name: true } ) ).toBe( false );
		} );

		it( 'should not consume element already consumed', () => {
			viewConsumable.add( el, { name: true } );

			expect( viewConsumable.consume( el, { name: true } ) ).toBe( true );
			expect( viewConsumable.consume( el, { name: true } ) ).toBe( false );
		} );

		it( 'should consume attribute, classes and styles', () => {
			el._addClass( 'foobar' );
			el._setAttribute( 'href', '#' );
			el._setStyle( 'color', 'red' );
			ViewConsumable.createFrom( el, viewConsumable );

			const consumed1 = viewConsumable.consume( el, { classes: 'foobar' } );
			const consumed2 = viewConsumable.consume( el, { attributes: 'href' } );
			const consumed3 = viewConsumable.consume( el, { styles: 'color' } );

			expect( consumed1 ).toBe( true );
			expect( consumed2 ).toBe( true );
			expect( consumed3 ).toBe( true );

			expect( viewConsumable.test( el, { classes: 'foobar' } ) ).toBe( false );
			expect( viewConsumable.test( el, { attributes: 'href' } ) ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'color' } ) ).toBe( false );
		} );

		it( 'should consume multiple attribute', () => {
			el._setAttribute( 'href', '#' );
			el._setAttribute( 'title', 'foo' );
			el._setAttribute( 'name', 'bar' );
			ViewConsumable.createFrom( el, viewConsumable );

			const consumed = viewConsumable.consume( el, { attributes: [ 'href', 'title' ] } );

			expect( consumed ).toBe( true );
			expect( viewConsumable.test( el, { attributes: 'href' } ) ).toBe( false );
			expect( viewConsumable.test( el, { attributes: 'title' } ) ).toBe( false );
			expect( viewConsumable.test( el, { attributes: 'name' } ) ).toBe( true );
		} );

		it( 'should consume multiple styles', () => {
			el._setStyle( { color: 'red', top: '2px', position: 'relative' } );
			ViewConsumable.createFrom( el, viewConsumable );

			const consumed = viewConsumable.consume( el, { styles: [ 'color', 'position' ] } );

			expect( consumed ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'color' } ) ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'position' } ) ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'top' } ) ).toBe( true );
		} );

		it( 'should consume multiple classes', () => {
			el._addClass( [ 'foo', 'bar', 'baz' ] );
			ViewConsumable.createFrom( el, viewConsumable );

			const consumed = viewConsumable.consume( el, { classes: [ 'bar', 'baz' ] } );

			expect( consumed ).toBe( true );
			expect( viewConsumable.test( el, { classes: 'bar' } ) ).toBe( false );
			expect( viewConsumable.test( el, { classes: 'baz' } ) ).toBe( false );
			expect( viewConsumable.test( el, { classes: 'foo' } ) ).toBe( true );
		} );

		it( 'should consume only if all items can be consumed', () => {
			viewConsumable.add( el, { styles: [ 'position', 'color' ], attributes: [ 'href', 'title' ] } );

			const consumed = viewConsumable.consume( el, { styles: [ 'color', 'top' ] } );
			expect( consumed ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'color' } ) ).toBe( true );
		} );

		it( 'should consume all classes when class attribute is provided', () => {
			expect( viewConsumable.consume( el, { attributes: 'class' } ) ).toBe( false );
			viewConsumable.add( el, { classes: [ 'foo', 'bar', 'baz' ] } );
			expect( viewConsumable.consume( el, { attributes: 'class' } ) ).toBe( true );
			expect( viewConsumable.test( el, { attributes: 'class' } ) ).toBe( false );
			expect( viewConsumable.test( el, { classes: 'foo' } ) ).toBe( false );
			expect( viewConsumable.test( el, { classes: 'bar' } ) ).toBe( false );
			expect( viewConsumable.test( el, { classes: 'baz' } ) ).toBe( false );
		} );

		it( 'should consume all styles when style attribute is provided', () => {
			expect( viewConsumable.consume( el, { attributes: 'style' } ) ).toBe( false );
			viewConsumable.add( el, { styles: [ 'color', 'top', 'position' ] } );
			expect( viewConsumable.consume( el, { attributes: 'style' } ) ).toBe( true );
			expect( viewConsumable.test( el, { attributes: 'style' } ) ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'color' } ) ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'top' } ) ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'position' } ) ).toBe( false );
		} );
	} );

	describe( 'revert', () => {
		it( 'should revert single element', () => {
			viewConsumable.add( el, { name: true } );
			viewConsumable.consume( el, { name: true } );
			expect( viewConsumable.test( el, { name: true } ) ).toBe( false );
			viewConsumable.revert( el, { name: true } );
			expect( viewConsumable.test( el, { name: true } ) ).toBe( true );
		} );

		it( 'should revert text node', () => {
			const text1 = new ViewText( viewDocument );
			const text2 = new ViewText( viewDocument );

			viewConsumable.add( text1 );
			viewConsumable.consume( text1 );

			viewConsumable.revert( text1 );
			viewConsumable.revert( text2 );

			expect( viewConsumable.test( text1 ) ).toBe( true );
			expect( viewConsumable.test( text2 ) ).toBeNull();
		} );

		it( 'should revert document fragment', () => {
			const fragment1 = new ViewDocumentFragment( viewDocument );
			const fragment2 = new ViewDocumentFragment( viewDocument );

			viewConsumable.add( fragment1 );
			viewConsumable.consume( fragment1 );

			viewConsumable.revert( fragment1 );
			viewConsumable.revert( fragment2 );

			expect( viewConsumable.test( fragment1 ) ).toBe( true );
			expect( viewConsumable.test( fragment2 ) ).toBeNull();
		} );

		it( 'should not revert element that was never added', () => {
			viewConsumable.revert( el, { name: true } );
			expect( viewConsumable.test( el, { name: true } ) ).toBeNull();
		} );

		it( 'should do nothing on not consumed element', () => {
			viewConsumable.add( el, { name: true } );
			viewConsumable.revert( el, { name: true } );
			expect( viewConsumable.test( el, { name: true } ) ).toBe( true );
		} );

		it( 'should revert classes, attribute and styles', () => {
			el._setAttribute( 'class', 'foobar' );
			el._setAttribute( 'style', 'color: red;' );
			el._setAttribute( 'name', 'foo' );

			ViewConsumable.createFrom( el, viewConsumable );
			expect( viewConsumable.test( el, { classes: 'foobar', styles: 'color', attributes: 'name' } ) ).toBe( true );

			viewConsumable.consume( el, { classes: 'foobar', styles: 'color', attributes: 'name' } );
			expect( viewConsumable.test( el, { classes: 'foobar', styles: 'color', attributes: 'name' } ) ).toBe( false );

			viewConsumable.revert( el, { classes: 'foobar' } );
			viewConsumable.revert( el, { styles: 'color' } );
			viewConsumable.revert( el, { attributes: 'name' } );
			expect( viewConsumable.test( el, { classes: 'foobar', styles: 'color', attributes: 'name' } ) ).toBe( true );
		} );

		it( 'should revert multiple classes, attribute and styles in one call #1', () => {
			el._addClass( 'foobar' );
			el._setStyle( 'color', 'red' );
			el._setAttribute( 'name', 'foo' );

			ViewConsumable.createFrom( el, viewConsumable );
			expect( viewConsumable.test( el, { classes: 'foobar', styles: 'color', attributes: 'name' } ) ).toBe( true );

			viewConsumable.consume( el, { classes: 'foobar', styles: 'color', attributes: 'name' } );
			expect( viewConsumable.test( el, { classes: 'foobar', styles: 'color', attributes: 'name' } ) ).toBe( false );

			viewConsumable.revert( el, { classes: 'foobar', styles: 'color', attributes: 'name' } );
			expect( viewConsumable.test( el, { classes: 'foobar', styles: 'color', attributes: 'name' } ) ).toBe( true );
		} );

		it( 'should revert multiple classes, attribute and styles in one call #2', () => {
			const consumables = {
				classes: [ 'foobar', 'baz' ],
				styles: [ 'color', 'position' ],
				attributes: [ 'name', 'href' ]
			};

			el._addClass( [ 'foobar', 'baz' ] );
			el._setStyle( 'color', 'red' );
			el._setStyle( 'position', 'absolute' );
			el._setAttribute( 'name', 'foo' );
			el._setAttribute( 'href', 'bar' );

			ViewConsumable.createFrom( el, viewConsumable );
			expect( viewConsumable.test( el, consumables ) ).toBe( true );

			viewConsumable.consume( el, consumables );
			expect( viewConsumable.test( el, consumables ) ).toBe( false );

			viewConsumable.revert( el, consumables );
			expect( viewConsumable.test( el, consumables ) ).toBe( true );
		} );

		it( 'should revert only items that were previously added', () => {
			el._addClass( 'foobar' );

			ViewConsumable.createFrom( el, viewConsumable );
			expect( viewConsumable.test( el, { classes: 'foobar' } ) ).toBe( true );
			expect( viewConsumable.test( el, { attributes: 'name' } ) ).toBeNull();

			viewConsumable.consume( el, { classes: 'foobar' } );
			expect( viewConsumable.test( el, { classes: 'foobar' } ) ).toBe( false );
			expect( viewConsumable.test( el, { attributes: 'name' } ) ).toBeNull();

			viewConsumable.revert( el, { classes: 'foobar', attributes: 'name' } );
			expect( viewConsumable.test( el, { classes: 'foobar' } ) ).toBe( true );
			expect( viewConsumable.test( el, { attributes: 'name' } ) ).toBeNull();
		} );

		it( 'should revert all classes when class attribute is provided', () => {
			el._addClass( [ 'foo', 'bar', 'baz' ] );

			ViewConsumable.createFrom( el, viewConsumable );
			expect( viewConsumable.test( el, { classes: 'foo' } ) ).toBe( true );
			expect( viewConsumable.test( el, { classes: 'bar' } ) ).toBe( true );
			expect( viewConsumable.test( el, { classes: 'baz' } ) ).toBe( true );
			expect( viewConsumable.test( el, { classes: 'qux' } ) ).toBeNull();

			expect( viewConsumable.consume( el, { classes: [ 'foo', 'bar', 'baz' ] } ) ).toBe( true );
			expect( viewConsumable.test( el, { classes: 'foo' } ) ).toBe( false );
			expect( viewConsumable.test( el, { classes: 'bar' } ) ).toBe( false );
			expect( viewConsumable.test( el, { classes: 'baz' } ) ).toBe( false );
			expect( viewConsumable.test( el, { classes: 'qux' } ) ).toBeNull();

			viewConsumable.revert( el, { attributes: 'class' } );
			expect( viewConsumable.test( el, { classes: 'foo' } ) ).toBe( true );
			expect( viewConsumable.test( el, { classes: 'bar' } ) ).toBe( true );
			expect( viewConsumable.test( el, { classes: 'baz' } ) ).toBe( true );
			expect( viewConsumable.test( el, { classes: 'qux' } ) ).toBeNull();
		} );

		it( 'should revert all styles when style attribute is provided', () => {
			el._setStyle( 'color', 'red' );
			el._setStyle( 'top', '3px' );

			ViewConsumable.createFrom( el, viewConsumable );
			expect( viewConsumable.test( el, { styles: 'color' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'top' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'qux' } ) ).toBeNull();

			expect( viewConsumable.consume( el, { styles: [ 'color', 'top' ] } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'color' } ) ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'top' } ) ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'qux' } ) ).toBeNull();

			viewConsumable.revert( el, { attributes: 'style' } );
			expect( viewConsumable.test( el, { styles: 'color' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'top' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'qux' } ) ).toBeNull();
		} );

		it( 'should revert a consumed class token so it can be consumed again', () => {
			el._setAttribute( 'class', 'foo bar' );

			ViewConsumable.createFrom( el, viewConsumable );
			expect( viewConsumable.test( el, { classes: 'foo' } ) ).toBe( true );

			viewConsumable.consume( el, { classes: 'foo' } );
			expect( viewConsumable.test( el, { classes: 'foo' } ) ).toBe( false );

			viewConsumable.revert( el, { classes: 'foo' } );
			expect( viewConsumable.test( el, { classes: 'foo' } ) ).toBe( true );
			expect( viewConsumable.test( el, { classes: 'bar' } ) ).toBe( true );
		} );

		it( 'should do nothing when reverting a class token that was not consumed', () => {
			el._setAttribute( 'class', 'foo' );

			ViewConsumable.createFrom( el, viewConsumable );
			expect( viewConsumable.test( el, { classes: 'foo' } ) ).toBe( true );

			viewConsumable.revert( el, { classes: 'foo' } );

			expect( viewConsumable.test( el, { classes: 'foo' } ) ).toBe( true );
		} );
	} );

	describe( 'createFrom', () => {
		it( 'should return new ViewConsumable instance', () => {
			const newConsumable = ViewConsumable.createFrom( el );

			expect( newConsumable ).toBeInstanceOf( ViewConsumable );
			expect( newConsumable.test( el, { name: true } ) ).toBe( true );
		} );

		it( 'should return new ViewConsumable instance from document fragment', () => {
			const fragment = new ViewDocumentFragment( viewDocument );
			const newConsumable = ViewConsumable.createFrom( fragment );

			expect( newConsumable ).toBeInstanceOf( ViewConsumable );
			expect( newConsumable.test( fragment ) ).toBe( true );
		} );

		it( 'should add all child elements', () => {
			const text1 = new ViewText( viewDocument, 'foo' );
			const text2 = new ViewText( viewDocument, 'bar' );
			const child1 = new ViewElement( viewDocument, 'p', { 'title': 'baz' }, [ text1 ] );
			const child2 = new ViewElement( viewDocument, 'p' );
			const child3 = new ViewElement( viewDocument, 'p', { 'style': 'top:10px;', 'class': 'qux bar' }, [ text2, child2 ] );
			el._appendChild( [ child1, child3 ] );

			const newConsumable = ViewConsumable.createFrom( el );

			expect( newConsumable.test( el, { name: true } ) ).toBe( true );
			expect( newConsumable.test( text1 ) ).toBe( true );
			expect( newConsumable.test( text2 ) ).toBe( true );
			expect( newConsumable.test( child1, { name: true, attributes: 'title' } ) ).toBe( true );
			expect( newConsumable.test( child2, { name: true } ) ).toBe( true );
			expect( newConsumable.test( child3, { name: true, styles: 'top', classes: [ 'qux', 'bar' ] } ) ).toBe( true );
		} );

		it( 'should add all attribute', () => {
			el._setAttribute( 'title', 'foobar' );
			el._setAttribute( 'href', 'https://ckeditor.com' );

			const newConsumable = ViewConsumable.createFrom( el );

			expect( newConsumable.test( el, { attributes: [ 'title', 'href' ] } ) ).toBe( true );
			expect( newConsumable.test( el, { name: true } ) ).toBe( true );
		} );

		it( 'should add all classes', () => {
			el._addClass( [ 'foo', 'bar', 'baz' ] );

			const newConsumable = ViewConsumable.createFrom( el );

			expect( newConsumable.test( el, { classes: [ 'foo', 'bar', 'baz' ] } ) ).toBe( true );
			expect( newConsumable.test( el, { name: true } ) ).toBe( true );
		} );

		it( 'should add all styles', () => {
			el._setStyle( {
				color: 'red',
				position: 'absolute'
			} );

			const newConsumable = ViewConsumable.createFrom( el );

			expect( newConsumable.test( el, { styles: [ 'color', 'position' ] } ) ).toBe( true );
			expect( newConsumable.test( el, { name: true } ) ).toBe( true );
		} );

		it( 'should create consumable from a view element with children', () => {
			const child = new ViewElement( viewDocument, 'span', { class: 'foo' } );
			el._appendChild( child );

			const newConsumable = ViewConsumable.createFrom( el );

			expect( newConsumable.test( el, { name: true } ) ).toBe( true );
			expect( newConsumable.test( child, { name: true } ) ).toBe( true );
			expect( newConsumable.test( child, { classes: 'foo' } ) ).toBe( true );
		} );
	} );

	describe( 'style shorthands handling', () => {
		describe( 'add', () => {
			it( 'should add padding shorthands', () => {
				el._setStyle( 'margin', '10px' );
				ViewConsumable.createFrom( el, viewConsumable );

				expect( viewConsumable.test( el, { styles: 'margin-top' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'margin-bottom' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'margin-right' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'margin-left' } ) ).toBe( true );
			} );

			it( 'should add margin shorthands', () => {
				el._setStyle( 'padding', '10px' );
				ViewConsumable.createFrom( el, viewConsumable );

				expect( viewConsumable.test( el, { styles: 'padding-top' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'padding-bottom' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'padding-right' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'padding-left' } ) ).toBe( true );
			} );

			it( 'should add table shorthands', () => {
				el._setStyle( 'border', '2px solid red' );
				ViewConsumable.createFrom( el, viewConsumable );

				expect( viewConsumable.test( el, { styles: 'border-style' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'border-top-style' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'border-bottom-style' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'border-right-style' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'border-left-style' } ) ).toBe( true );

				expect( viewConsumable.test( el, { styles: 'border-color' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'border-top-color' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'border-bottom-color' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'border-right-color' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'border-left-color' } ) ).toBe( true );

				expect( viewConsumable.test( el, { styles: 'border-width' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'border-top-width' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'border-bottom-width' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'border-right-width' } ) ).toBe( true );
				expect( viewConsumable.test( el, { styles: 'border-left-width' } ) ).toBe( true );
			} );
		} );

		it( 'should return false when testing style shorthand for consumed longhand', () => {
			el._setStyle( 'margin', '10px' );
			ViewConsumable.createFrom( el, viewConsumable );

			expect( viewConsumable.test( el, { styles: 'margin' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'margin-top' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'margin-bottom' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'margin-right' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'margin-left' } ) ).toBe( true );

			viewConsumable.consume( el, { styles: 'margin' } );

			expect( viewConsumable.test( el, { styles: 'margin' } ) ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'margin-top' } ) ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'margin-bottom' } ) ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'margin-right' } ) ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'margin-left' } ) ).toBe( false );
		} );

		it( 'should return false when testing style shorthand for consumed shorthand', () => {
			el._setStyle( 'margin', '10px' );
			ViewConsumable.createFrom( el, viewConsumable );

			expect( viewConsumable.test( el, { styles: 'margin' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'margin-top' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'margin-bottom' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'margin-right' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'margin-left' } ) ).toBe( true );

			viewConsumable.consume( el, { styles: 'margin-top' } );

			expect( viewConsumable.test( el, { styles: 'margin' } ) ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'margin-top' } ) ).toBe( false );
			expect( viewConsumable.test( el, { styles: 'margin-bottom' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'margin-right' } ) ).toBe( true );
			expect( viewConsumable.test( el, { styles: 'margin-left' } ) ).toBe( true );
		} );
	} );
} );
