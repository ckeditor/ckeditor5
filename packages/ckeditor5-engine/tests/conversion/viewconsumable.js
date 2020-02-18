/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ViewDocument from '../../src/view/document';
import ViewElement from '../../src/view/element';
import ViewText from '../../src/view/text';
import ViewDocumentFragment from '../../src/view/documentfragment';
import ViewConsumable from '../../src/conversion/viewconsumable';
import { addBorderRules } from '../../src/view/styles/border';
import { addMarginRules } from '../../src/view/styles/margin';
import { addPaddingRules } from '../../src/view/styles/padding';

describe( 'ViewConsumable', () => {
	let viewConsumable, el, viewDocument;

	before( () => {
		viewDocument = new ViewDocument();

		addBorderRules( viewDocument.stylesProcessor );
		addMarginRules( viewDocument.stylesProcessor );
		addPaddingRules( viewDocument.stylesProcessor );
	} );

	beforeEach( () => {
		viewConsumable = new ViewConsumable();
		el = new ViewElement( viewDocument, 'p' );
	} );

	describe( 'add', () => {
		it( 'should allow to add element name', () => {
			viewConsumable.add( el, { name: true } );

			expect( viewConsumable.test( el, { name: true } ) ).to.be.true;
		} );

		it( 'should allow to add text node', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			viewConsumable.add( text );

			expect( viewConsumable.test( text ) ).to.be.true;
		} );

		it( 'should allow to add document fragment', () => {
			const fragment = new ViewDocumentFragment( viewDocument );
			viewConsumable.add( fragment );
			expect( viewConsumable.test( fragment ) ).to.be.true;
		} );

		it( 'should allow to add attribute classes and styles', () => {
			viewConsumable.add( el, { attributes: 'href' } );
			viewConsumable.add( el, { classes: 'foobar' } );
			viewConsumable.add( el, { styles: 'color' } );

			expect( viewConsumable.test( el, { attributes: 'href' } ) ).to.be.true;
			expect( viewConsumable.test( el, { classes: 'foobar' } ) ).to.be.true;
			expect( viewConsumable.test( el, { styles: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el, { name: true } ) ).to.be.null;
		} );

		it( 'should allow to add attribute classes and styles in one call', () => {
			viewConsumable.add( el, { attributes: 'href', classes: 'foobar', styles: 'color' } );

			expect( viewConsumable.test( el, { attributes: 'href' } ) ).to.be.true;
			expect( viewConsumable.test( el, { classes: 'foobar' } ) ).to.be.true;
			expect( viewConsumable.test( el, { styles: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el, { name: true } ) ).to.be.null;
		} );

		it( 'should allow to add multiple attribute in one call', () => {
			viewConsumable.add( el, { attributes: [ 'href', 'target', 'title' ] } );

			expect( viewConsumable.test( el, { attributes: 'href' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attributes: 'target' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attributes: 'title' } ) ).to.be.true;
			expect( viewConsumable.test( el, { name: true } ) ).to.be.null;
		} );

		it( 'should allow to add multiple classes in one call', () => {
			viewConsumable.add( el, { classes: [ 'foo', 'bar', 'baz' ] } );

			expect( viewConsumable.test( el, { classes: 'foo' } ) ).to.be.true;
			expect( viewConsumable.test( el, { classes: 'bar' } ) ).to.be.true;
			expect( viewConsumable.test( el, { classes: 'baz' } ) ).to.be.true;
			expect( viewConsumable.test( el, { name: true } ) ).to.be.null;
		} );

		it( 'should allow to add multiple styles in one call', () => {
			viewConsumable.add( el, { styles: [ 'color', 'position', 'top' ] } );

			expect( viewConsumable.test( el, { styles: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el, { styles: 'position' } ) ).to.be.true;
			expect( viewConsumable.test( el, { styles: 'top' } ) ).to.be.true;
			expect( viewConsumable.test( el, { name: true } ) ).to.be.null;
		} );

		it( 'should throw if class attribute is added', () => {
			expect( () => {
				viewConsumable.add( el, { attributes: 'class' } );
			} ).to.throw( 'viewconsumable-invalid-attribute' );
		} );

		it( 'should throw if style attribute is added', () => {
			expect( () => {
				viewConsumable.add( el, { attributes: 'style' } );
			} ).to.throw( 'viewconsumable-invalid-attribute' );
		} );
	} );

	describe( 'test', () => {
		it( 'should test element name', () => {
			const el2 = new ViewElement( viewDocument, 'p' );

			viewConsumable.add( el, { name: true } );

			expect( viewConsumable.test( el, { name: true } ) ).to.be.true;
			expect( viewConsumable.test( el2, { name: true } ) ).to.be.null;
		} );

		it( 'should test text nodes', () => {
			const text1 = new ViewText( viewDocument );
			const text2 = new ViewText( viewDocument );

			viewConsumable.add( text1 );

			expect( viewConsumable.test( text1 ) ).to.be.true;
			expect( viewConsumable.test( text2 ) ).to.be.null;
		} );

		it( 'should test document fragments', () => {
			const fragment1 = new ViewDocumentFragment( viewDocument );
			const fragment2 = new ViewDocumentFragment( viewDocument );

			viewConsumable.add( fragment1 );

			expect( viewConsumable.test( fragment1 ) ).to.be.true;
			expect( viewConsumable.test( fragment2 ) ).to.be.null;
		} );

		it( 'should test attribute, classes and styles', () => {
			const el = new ViewElement( viewDocument, 'p' );

			viewConsumable.add( el, { attributes: 'href', classes: 'foobar', styles: 'color' } );

			expect( viewConsumable.test( el, { attributes: 'href' } ) ).to.be.true;
			expect( viewConsumable.test( el, { classes: 'foobar' } ) ).to.be.true;
			expect( viewConsumable.test( el, { styles: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attributes: 'href', classes: 'foobar', styles: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attributes: 'href', classes: 'baz' } ) ).to.be.null;
			expect( viewConsumable.test( el, { name: true } ) ).to.be.null;

			viewConsumable.consume( el, { styles: 'color' } );
			expect( viewConsumable.test( el, { attributes: 'href', styles: 'color' } ) ).to.be.false;
		} );

		it( 'should allow to test multiple attribute in one call', () => {
			viewConsumable.add( el, { attributes: [ 'href', 'title', 'target' ] } );

			expect( viewConsumable.test( el, { attributes: [ 'href', 'title', 'target' ] } ) ).to.be.true;
			expect( viewConsumable.test( el, { attributes: [ 'href', 'title', 'alt' ] } ) ).to.be.null;

			viewConsumable.consume( el, { attributes: 'target' } );
			expect( viewConsumable.test( el, { attributes: [ 'href', 'title', 'target' ] } ) ).to.be.false;
		} );

		it( 'should allow to test multiple classes in one call', () => {
			viewConsumable.add( el, { classes: [ 'foo', 'bar', 'baz' ] } );

			expect( viewConsumable.test( el, { classes: [ 'foo', 'bar', 'baz' ] } ) ).to.be.true;
			expect( viewConsumable.test( el, { classes: [ 'foo', 'bar', 'qux' ] } ) ).to.be.null;

			viewConsumable.consume( el, { classes: 'bar' } );
			expect( viewConsumable.test( el, { classes: [ 'foo', 'bar', 'baz' ] } ) ).to.be.false;
		} );

		it( 'should allow to test multiple styles in one call', () => {
			viewConsumable.add( el, { styles: [ 'color', 'position', 'top' ] } );

			expect( viewConsumable.test( el, { styles: [ 'color', 'position', 'top' ] } ) ).to.be.true;
			expect( viewConsumable.test( el, { styles: [ 'color', 'position', 'left' ] } ) ).to.be.null;

			viewConsumable.consume( el, { styles: 'top' } );
			expect( viewConsumable.test( el, { styles: [ 'color', 'position', 'top' ] } ) ).to.be.false;
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
			viewConsumable.add( el, { attributes: 'foo' } );

			expect( viewConsumable.test( el, { attributes: [ 'foo', 'bar' ] } ) ).to.be.null;
		} );

		it( 'should return false if first already consumed item is found', () => {
			viewConsumable.add( el, { name: true, attributes: [ 'foo', 'bar' ] } );
			viewConsumable.consume( el, { attributes: 'bar' } );
			viewConsumable.consume( el, { name: true } );

			expect( viewConsumable.test( el, { attributes: [ 'foo', 'bar' ] } ) ).to.be.false;
			expect( viewConsumable.test( el, { name: true } ) ).to.be.false;
		} );

		it( 'should test all classes if class attribute is tested', () => {
			viewConsumable.add( el, { classes: [ 'foo', 'bar', 'baz' ] } );
			expect( viewConsumable.test( el, { attributes: 'class' } ) ).to.be.true;
			expect( viewConsumable.consume( el, { classes: 'baz' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attributes: 'class' } ) ).to.be.false;
		} );

		it( 'should test all styles if style attribute is tested', () => {
			viewConsumable.add( el, { styles: [ 'color', 'top', 'position' ] } );
			expect( viewConsumable.test( el, { attributes: 'style' } ) ).to.be.true;
			expect( viewConsumable.consume( el, { styles: 'top' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attributes: 'style' } ) ).to.be.false;
		} );

		it( 'should return false when testing class attribute when consumed classes exists', () => {
			viewConsumable.add( el, { classes: [ 'foo', 'baz' ] } );
			expect( viewConsumable.consume( el, { classes: 'baz' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attributes: 'class' } ) ).to.be.false;
			expect( viewConsumable.consume( el, { attributes: 'class' } ) ).to.be.false;
		} );

		it( 'should return false when testing style attribute when consumed styles exists', () => {
			viewConsumable.add( el, { styles: [ 'top', 'left' ] } );
			expect( viewConsumable.consume( el, { styles: 'top' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attributes: 'style' } ) ).to.be.false;
			expect( viewConsumable.consume( el, { attributes: 'style' } ) ).to.be.false;
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
			const text = new ViewText( viewDocument );
			viewConsumable.add( text );
			const consumed = viewConsumable.consume( text );
			expect( consumed ).to.be.true;
			expect( viewConsumable.test( text ) ).to.be.false;
			expect( viewConsumable.consume( text ) ).to.be.false;
		} );

		it( 'should consume document fragment', () => {
			const fragment = new ViewDocumentFragment( viewDocument );
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

		it( 'should consume attribute, classes and styles', () => {
			viewConsumable.add( el, { classes: 'foobar', attributes: 'href', styles: 'color' } );

			const consumed1 = viewConsumable.consume( el, { classes: 'foobar' } );
			const consumed2 = viewConsumable.consume( el, { attributes: 'href' } );
			const consumed3 = viewConsumable.consume( el, { styles: 'color' } );

			expect( consumed1 ).to.be.true;
			expect( consumed2 ).to.be.true;
			expect( consumed3 ).to.be.true;

			expect( viewConsumable.test( el, { classes: 'foobar' } ) ).to.be.false;
			expect( viewConsumable.test( el, { attributes: 'href' } ) ).to.be.false;
			expect( viewConsumable.test( el, { styles: 'color' } ) ).to.be.false;
		} );

		it( 'should consume multiple attribute', () => {
			viewConsumable.add( el, { attributes: [ 'href', 'title', 'name' ] } );

			const consumed = viewConsumable.consume( el, { attributes: [ 'href', 'title' ] } );

			expect( consumed ).to.be.true;
			expect( viewConsumable.test( el, { attributes: 'href' } ) ).to.be.false;
			expect( viewConsumable.test( el, { attributes: 'title' } ) ).to.be.false;
			expect( viewConsumable.test( el, { attributes: 'name' } ) ).to.be.true;
		} );

		it( 'should consume multiple styles', () => {
			viewConsumable.add( el, { styles: [ 'color', 'top', 'position' ] } );

			const consumed = viewConsumable.consume( el, { styles: [ 'color', 'position' ] } );

			expect( consumed ).to.be.true;
			expect( viewConsumable.test( el, { styles: 'color' } ) ).to.be.false;
			expect( viewConsumable.test( el, { styles: 'position' } ) ).to.be.false;
			expect( viewConsumable.test( el, { styles: 'top' } ) ).to.be.true;
		} );

		it( 'should consume multiple classes', () => {
			viewConsumable.add( el, { classes: [ 'foo', 'bar', 'baz' ] } );

			const consumed = viewConsumable.consume( el, { classes: [ 'bar', 'baz' ] } );

			expect( consumed ).to.be.true;
			expect( viewConsumable.test( el, { classes: 'bar' } ) ).to.be.false;
			expect( viewConsumable.test( el, { classes: 'baz' } ) ).to.be.false;
			expect( viewConsumable.test( el, { classes: 'foo' } ) ).to.be.true;
		} );

		it( 'should consume only if all items can be consumed', () => {
			viewConsumable.add( el, { styles: [ 'position', 'color' ], attributes: [ 'href', 'title' ] } );

			const consumed = viewConsumable.consume( el, { styles: [ 'color', 'top' ] } );
			expect( consumed ).to.be.false;
			expect( viewConsumable.test( el, { styles: 'color' } ) ).to.be.true;
		} );

		it( 'should consume all classes when class attribute is provided', () => {
			expect( viewConsumable.consume( el, { attributes: 'class' } ) ).to.be.false;
			viewConsumable.add( el, { classes: [ 'foo', 'bar', 'baz' ] } );
			expect( viewConsumable.consume( el, { attributes: 'class' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attributes: 'class' } ) ).to.be.false;
			expect( viewConsumable.test( el, { classes: 'foo' } ) ).to.be.false;
			expect( viewConsumable.test( el, { classes: 'bar' } ) ).to.be.false;
			expect( viewConsumable.test( el, { classes: 'baz' } ) ).to.be.false;
		} );

		it( 'should consume all styles when style attribute is provided', () => {
			expect( viewConsumable.consume( el, { attributes: 'style' } ) ).to.be.false;
			viewConsumable.add( el, { styles: [ 'color', 'top', 'position' ] } );
			expect( viewConsumable.consume( el, { attributes: 'style' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attributes: 'style' } ) ).to.be.false;
			expect( viewConsumable.test( el, { styles: 'color' } ) ).to.be.false;
			expect( viewConsumable.test( el, { styles: 'top' } ) ).to.be.false;
			expect( viewConsumable.test( el, { styles: 'position' } ) ).to.be.false;
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
			const text1 = new ViewText( viewDocument );
			const text2 = new ViewText( viewDocument );

			viewConsumable.add( text1 );
			viewConsumable.consume( text1 );

			viewConsumable.revert( text1 );
			viewConsumable.revert( text2 );

			expect( viewConsumable.test( text1 ) ).to.be.true;
			expect( viewConsumable.test( text2 ) ).to.be.null;
		} );

		it( 'should revert document fragment', () => {
			const fragment1 = new ViewDocumentFragment( viewDocument );
			const fragment2 = new ViewDocumentFragment( viewDocument );

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

		it( 'should revert classes, attribute and styles', () => {
			viewConsumable.add( el, { classes: 'foobar', styles: 'color', attributes: 'name' } );
			viewConsumable.consume( el, { classes: 'foobar', styles: 'color', attributes: 'name' } );

			viewConsumable.revert( el, { classes: 'foobar' } );
			viewConsumable.revert( el, { styles: 'color' } );
			viewConsumable.revert( el, { attributes: 'name' } );

			expect( viewConsumable.test( el, { classes: 'foobar', styles: 'color', attributes: 'name' } ) ).to.be.true;
		} );

		it( 'should revert multiple classes, attribute and styles in one call #1', () => {
			viewConsumable.add( el, {
				classes: 'foobar',
				styles: 'color',
				attributes: 'name'
			} );
			viewConsumable.consume( el, { classes: 'foobar', styles: 'color', attributes: 'name' } );
			viewConsumable.revert( el, { classes: 'foobar', styles: 'color', attributes: 'name' } );

			expect( viewConsumable.test( el, { classes: 'foobar', styles: 'color', attributes: 'name' } ) ).to.be.true;
		} );

		it( 'should revert multiple classes, attribute and styles in one call #2', () => {
			const consumables = {
				classes: [ 'foobar', 'baz' ],
				styles: [ 'color', 'position' ],
				attributes: [ 'name', 'href' ]
			};

			viewConsumable.add( el, consumables );
			viewConsumable.consume( el, consumables );
			viewConsumable.revert( el, consumables );

			expect( viewConsumable.test( el, consumables ) ).to.be.true;
		} );

		it( 'should revert only items that were previously added', () => {
			viewConsumable.add( el, { classes: 'foobar' } );
			viewConsumable.consume( el, { classes: 'foobar' } );
			viewConsumable.revert( el, { classes: 'foobar', attributes: 'name' } );

			expect( viewConsumable.test( el, { classes: 'foobar' } ) ).to.be.true;
			expect( viewConsumable.test( el, { attributes: 'name' } ) ).to.be.null;
		} );

		it( 'should revert all classes when class attribute is provided', () => {
			viewConsumable.add( el, { classes: [ 'foo', 'bar', 'baz' ] } );
			expect( viewConsumable.consume( el, { classes: [ 'foo', 'bar', 'baz' ] } ) ).to.be.true;
			viewConsumable.revert( el, { attributes: 'class' } );

			expect( viewConsumable.test( el, { classes: 'foo' } ) ).to.be.true;
			expect( viewConsumable.test( el, { classes: 'bar' } ) ).to.be.true;
			expect( viewConsumable.test( el, { classes: 'baz' } ) ).to.be.true;
			expect( viewConsumable.test( el, { classes: 'qux' } ) ).to.be.null;
		} );

		it( 'should revert all styles when style attribute is provided', () => {
			viewConsumable.add( el, { styles: [ 'color', 'top' ] } );
			expect( viewConsumable.consume( el, { styles: [ 'color', 'top' ] } ) ).to.be.true;
			viewConsumable.revert( el, { attributes: 'style' } );

			expect( viewConsumable.test( el, { styles: 'color' } ) ).to.be.true;
			expect( viewConsumable.test( el, { styles: 'top' } ) ).to.be.true;
			expect( viewConsumable.test( el, { styles: 'qux' } ) ).to.be.null;
		} );
	} );

	describe( 'consumablesFromElement', () => {
		it( 'should create consumable object from element', () => {
			const consumables = ViewConsumable.consumablesFromElement( el );

			expect( consumables ).to.be.an( 'object' );
			expect( consumables.name ).to.be.true;
			expect( consumables.attributes ).to.be.an( 'array' );
			expect( consumables.attributes.length ).to.equal( 0 );
			expect( consumables.classes ).to.be.an( 'array' );
			expect( consumables.classes.length ).to.equal( 0 );
			expect( consumables.styles ).to.be.an( 'array' );
			expect( consumables.styles.length ).to.equal( 0 );
		} );

		it( 'should add all attribute', () => {
			el._setAttribute( 'title', 'foobar' );
			el._setAttribute( 'href', 'https://ckeditor.com' );

			const consumables = ViewConsumable.consumablesFromElement( el );
			expect( consumables.attributes.length ).to.equal( 2 );
			expect( consumables.attributes.indexOf( 'title' ) > -1 ).to.be.true;
			expect( consumables.attributes.indexOf( 'href' ) > -1 ).to.be.true;
			expect( consumables.classes.length ).to.equal( 0 );
			expect( consumables.styles.length ).to.equal( 0 );
			expect( consumables.name ).to.be.true;
		} );

		it( 'should add all classes', () => {
			el._addClass( [ 'foo', 'bar', 'baz' ] );

			const consumables = ViewConsumable.consumablesFromElement( el );
			expect( consumables.classes.length ).to.equal( 3 );
			expect( consumables.classes.indexOf( 'foo' ) > -1 ).to.be.true;
			expect( consumables.classes.indexOf( 'bar' ) > -1 ).to.be.true;
			expect( consumables.classes.indexOf( 'baz' ) > -1 ).to.be.true;
			expect( consumables.attributes.length ).to.equal( 0 );
			expect( consumables.styles.length ).to.equal( 0 );
			expect( consumables.name ).to.be.true;
		} );

		it( 'should add all styles', () => {
			el._setStyle( {
				color: 'red',
				position: 'absolute'
			} );

			const consumables = ViewConsumable.consumablesFromElement( el );
			expect( consumables.styles.length ).to.equal( 2 );
			expect( consumables.styles.indexOf( 'color' ) > -1 ).to.be.true;
			expect( consumables.styles.indexOf( 'position' ) > -1 ).to.be.true;
			expect( consumables.attributes.length ).to.equal( 0 );
			expect( consumables.classes.length ).to.equal( 0 );
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
			const fragment = new ViewDocumentFragment( viewDocument );
			const newConsumable = ViewConsumable.createFrom( fragment );

			expect( newConsumable ).to.be.instanceof( ViewConsumable );
			expect( newConsumable.test( fragment ) ).to.be.true;
		} );

		it( 'should add all child elements', () => {
			const text1 = new ViewText( viewDocument, 'foo' );
			const text2 = new ViewText( viewDocument, 'bar' );
			const child1 = new ViewElement( viewDocument, 'p', { 'title': 'baz' }, [ text1 ] );
			const child2 = new ViewElement( viewDocument, 'p' );
			const child3 = new ViewElement( viewDocument, 'p', { 'style': 'top:10px;', 'class': 'qux bar' }, [ text2, child2 ] );
			el._appendChild( [ child1, child3 ] );

			const newConsumable = ViewConsumable.createFrom( el );

			expect( newConsumable.test( el, { name: true } ) ).to.be.true;
			expect( newConsumable.test( text1 ) ).to.be.true;
			expect( newConsumable.test( text2 ) ).to.be.true;
			expect( newConsumable.test( child1, { name: true, attributes: 'title' } ) ).to.be.true;
			expect( newConsumable.test( child2, { name: true } ) ).to.be.true;
			expect( newConsumable.test( child3, { name: true, styles: 'top', classes: [ 'qux', 'bar' ] } ) ).to.be.true;
		} );
	} );

	describe( 'style shorthands handling', () => {
		before( () => {

		} );

		describe( 'add', () => {
			it( 'should add padding shorthands', () => {
				viewConsumable.add( el, { styles: [ 'margin' ] } );

				expect( viewConsumable.test( el, { styles: 'margin-top' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'margin-bottom' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'margin-right' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'margin-left' } ) ).to.be.true;
			} );

			it( 'should add margin shorthands', () => {
				viewConsumable.add( el, { styles: [ 'padding' ] } );

				expect( viewConsumable.test( el, { styles: 'padding-top' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'padding-bottom' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'padding-right' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'padding-left' } ) ).to.be.true;
			} );

			it( 'should add table shorthands', () => {
				viewConsumable.add( el, { styles: [ 'border' ] } );

				expect( viewConsumable.test( el, { styles: 'border-style' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'border-top-style' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'border-bottom-style' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'border-right-style' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'border-left-style' } ) ).to.be.true;

				expect( viewConsumable.test( el, { styles: 'border-color' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'border-top-color' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'border-bottom-color' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'border-right-color' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'border-left-color' } ) ).to.be.true;

				expect( viewConsumable.test( el, { styles: 'border-width' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'border-top-width' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'border-bottom-width' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'border-right-width' } ) ).to.be.true;
				expect( viewConsumable.test( el, { styles: 'border-left-width' } ) ).to.be.true;
			} );
		} );

		it( 'should return false when testing style shorthand for consumed longhand', () => {
			viewConsumable.add( el, { styles: [ 'margin' ] } );

			expect( viewConsumable.test( el, { styles: 'margin' } ) ).to.be.true;
			viewConsumable.consume( el, { styles: 'margin' } );
			expect( viewConsumable.test( el, { styles: 'margin-top' } ) ).to.be.false;
			expect( viewConsumable.test( el, { styles: 'margin-bottom' } ) ).to.be.false;
			expect( viewConsumable.test( el, { styles: 'margin-right' } ) ).to.be.false;
			expect( viewConsumable.test( el, { styles: 'margin-left' } ) ).to.be.false;
		} );

		it( 'should return false when testing style shorthand for consumed shorthand', () => {
			viewConsumable.add( el, { styles: [ 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left' ] } );

			expect( viewConsumable.test( el, { styles: 'margin-top' } ) ).to.be.true;
			viewConsumable.consume( el, { styles: 'margin-top' } );
			expect( viewConsumable.test( el, { styles: 'margin' } ) ).to.be.false;
			expect( viewConsumable.test( el, { styles: 'margin-top' } ) ).to.be.false;
			expect( viewConsumable.test( el, { styles: 'margin-bottom' } ) ).to.be.true;
			expect( viewConsumable.test( el, { styles: 'margin-right' } ) ).to.be.true;
			expect( viewConsumable.test( el, { styles: 'margin-left' } ) ).to.be.true;
		} );
	} );
} );
