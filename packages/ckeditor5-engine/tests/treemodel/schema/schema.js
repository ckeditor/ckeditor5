/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Schema from '/ckeditor5/engine/treemodel/schema.js';
import { SchemaItem as SchemaItem } from '/ckeditor5/engine/treemodel/schema.js';
import Document from '/ckeditor5/engine/treemodel/document.js';
import Element from '/ckeditor5/engine/treemodel/element.js';
import Position from '/ckeditor5/engine/treemodel/position.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

let schema;

beforeEach( () => {
	schema = new Schema();
} );

describe( 'constructor', () => {
	it( 'should register base items: inline, block, root', () => {
		sinon.spy( Schema.prototype, 'registerItem' );

		schema = new Schema();

		expect( schema.registerItem.calledWithExactly( '$inline', null ) );
		expect( schema.registerItem.calledWithExactly( '$block', null ) );

		Schema.prototype.registerItem.restore();
	} );

	it( 'should allow inline in block', () => {
		expect( schema.checkQuery( { name: '$inline', inside: [ '$block' ] } ) ).to.be.true;
	} );
} );

describe( 'registerItem', () => {
	it( 'should register in schema item under given name', () => {
		schema.registerItem( 'new' );

		expect( schema.hasItem( 'new' ) ).to.be.true;
	} );

	it( 'should build correct base chains', () => {
		schema.registerItem( 'first' );
		schema.registerItem( 'secondA', 'first' );
		schema.registerItem( 'secondB', 'first' );
		schema.registerItem( 'third', 'secondA' );

		expect( schema._extensionChains.get( 'first' ) ).to.deep.equal( [ 'first' ] );
		expect( schema._extensionChains.get( 'secondA' ) ).to.deep.equal( [ 'first', 'secondA' ] );
		expect( schema._extensionChains.get( 'secondB' ) ).to.deep.equal( [ 'first', 'secondB' ] );
		expect( schema._extensionChains.get( 'third' ) ).to.deep.equal( [ 'first', 'secondA', 'third' ] );
	} );

	it( 'should make registered item inherit allows from base item', () => {
		schema.registerItem( 'image', '$inline' );

		expect( schema.checkQuery( { name: 'image', inside: [ '$block' ] } ) ).to.be.true;
	} );

	it( 'should throw if item with given name has already been registered in schema', () => {
		schema.registerItem( 'new' );

		expect( () => {
			schema.registerItem( 'new' );
		} ).to.throw( CKEditorError, /schema-item-exists/ );
	} );

	it( 'should throw if base item has not been registered in schema', () => {
		expect( () => {
			schema.registerItem( 'new', 'old' );
		} ).to.throw( CKEditorError, /schema-no-item/ );
	} );
} );

describe( 'hasItem', () => {
	it( 'should return true if given item name has been registered in schema', () => {
		expect( schema.hasItem( '$block' ) ).to.be.true;
	} );

	it( 'should return false if given item name has not been registered in schema', () => {
		expect( schema.hasItem( 'new' ) ).to.be.false;
	} );
} );

describe( '_getItem', () => {
	it( 'should return SchemaItem registered under given name', () => {
		schema.registerItem( 'new' );

		let item = schema._getItem( 'new' );

		expect( item ).to.be.instanceof( SchemaItem );
	} );

	it( 'should throw if there is no item registered under given name', () => {
		expect( () => {
			schema._getItem( 'new' );
		} ).to.throw( CKEditorError, /schema-no-item/ );
	} );
} );

describe( 'allow', () => {
	it( 'should add passed query to allowed in schema', () => {
		schema.registerItem( 'p', '$block' );
		schema.registerItem( 'div', '$block' );

		expect( schema.checkQuery( { name: 'p', inside: [ 'div' ] } ) ).to.be.false;

		schema.allow( { name: 'p', inside: 'div' } );

		expect( schema.checkQuery( { name: 'p', inside: [ 'div' ] } ) ).to.be.true;
	} );
} );

describe( 'disallow', () => {
	it( 'should add passed query to disallowed in schema', () => {
		schema.registerItem( 'p', '$block' );
		schema.registerItem( 'div', '$block' );

		schema.allow( { name: '$block', attributes: 'bold', inside: 'div' } );

		expect( schema.checkQuery( { name: 'p', attributes: 'bold', inside: [ 'div' ] } ) ).to.be.true;

		schema.disallow( { name: 'p', attributes: 'bold', inside: 'div' } );

		expect( schema.checkQuery( { name: 'p', attributes: 'bold', inside: [ 'div' ] } ) ).to.be.false;
	} );
} );

describe( 'checkAtPosition', () => {
	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root', 'div' );

		root.insertChildren( 0, [
			new Element( 'div' ),
			new Element( 'header' ),
			new Element( 'p' )
		] );

		schema.registerItem( 'div', '$block' );
		schema.registerItem( 'header', '$block' );
		schema.registerItem( 'p', '$block' );

		schema.allow( { name: '$block', inside: 'div' } );
		schema.allow( { name: '$inline', attributes: 'bold', inside: '$block' } );

		schema.disallow( { name: '$inline', attributes: 'bold', inside: 'header' } );
	} );

	it( 'should return true if given element is allowed by schema at given position', () => {
		// Block should be allowed in root.
		expect( schema.checkAtPosition( new Position( root, [ 0 ] ), '$block' ) ).to.be.true;

		// P is block and block should be allowed in root.
		expect( schema.checkAtPosition( new Position( root, [ 0 ] ), 'p' ) ).to.be.true;

		// P is allowed in DIV by the set rule.
		expect( schema.checkAtPosition( new Position( root, [ 0, 0 ] ), 'p' ) ).to.be.true;

		// Inline is allowed in any block and is allowed with attribute bold.
		// We do not check if it is allowed in header, because it is disallowed by the set rule.
		expect( schema.checkAtPosition( new Position( root, [ 0, 0 ] ), '$inline' ) ).to.be.true;
		expect( schema.checkAtPosition( new Position( root, [ 2, 0 ] ), '$inline' ) ).to.be.true;
		expect( schema.checkAtPosition( new Position( root, [ 0, 0 ] ), '$inline', 'bold' ) ).to.be.true;
		expect( schema.checkAtPosition( new Position( root, [ 2, 0 ] ), '$inline', 'bold' ) ).to.be.true;

		// Header is allowed in DIV.
		expect( schema.checkAtPosition( new Position( root, [ 0, 0 ] ), 'header' ) ).to.be.true;

		// Inline is allowed in block and root is DIV, which is block.
		expect( schema.checkAtPosition( new Position( root, [ 0 ] ), '$inline' ) ).to.be.true;
	} );

	it( 'should return false if given element is not allowed by schema at given position', () => {
		// P with attribute is not allowed anywhere.
		expect( schema.checkAtPosition( new Position( root, [ 0 ] ), 'p', 'bold' ) ).to.be.false;
		expect( schema.checkAtPosition( new Position( root, [ 0, 0 ] ), 'p', 'bold' ) ).to.be.false;

		// Bold text is not allowed in header
		expect( schema.checkAtPosition( new Position( root, [ 1, 0 ] ), '$text', 'bold' ) ).to.be.false;
	} );

	it( 'should return false if given element is not registered in schema', () => {
		expect( schema.checkAtPosition( new Position( root, [ 0 ] ), 'new' ) ).to.be.false;
	} );
} );

describe( 'checkInElements', () => {
	beforeEach( () => {
		schema.registerItem( 'div', '$block' );
		schema.registerItem( 'header', '$block' );
		schema.registerItem( 'p', '$block' );
		schema.registerItem( 'img', '$inline' );

		schema.allow( { name: '$block', inside: 'div' } );
		schema.allow( { name: '$inline', attributes: 'bold', inside: '$block' } );

		schema.disallow( { name: '$inline', attributes: 'bold', inside: 'header' } );
	} );

	it( 'should return true if given element is allowed by schema at given position', () => {
		// P is block and block is allowed in DIV.
		expect( schema.checkInElements( [ new Element( 'div' ) ], 'p' ) ).to.be.true;

		// IMG is inline and inline is allowed in block.
		expect( schema.checkInElements( [ new Element( 'div' ) ], 'img' ) ).to.be.true;
		expect( schema.checkInElements( [ new Element( 'p' ) ], 'img' ) ).to.be.true;

		// Inline is allowed in any block and is allowed with attribute bold.
		expect( schema.checkInElements( [ new Element( 'div' ) ], 'img', [ 'bold' ] ) ).to.be.true;
		expect( schema.checkInElements( [ new Element( 'p' ) ], 'img', [ 'bold' ] ) ).to.be.true;

		// Inline is allowed in header which is allowed in DIV.
		expect( schema.checkInElements( [ new Element( 'div' ) ], 'header' ) ).to.be.true;
		expect( schema.checkInElements( [ new Element( 'header' ) ], 'img' ) ).to.be.true;
		expect( schema.checkInElements( [ new Element( 'div' ), new Element( 'header' ) ], 'img' ) ).to.be.true;
	} );

	it( 'should return false if given element is not allowed by schema at given position', () => {
		// P with attribute is not allowed.
		expect( schema.checkInElements( [ new Element( 'div' ) ], 'p', 'bold' ) ).to.be.false;

		// Bold text is not allowed in header
		expect( schema.checkInElements( [ new Element( 'header' ) ], '$text', 'bold' ) ).to.be.false;
	} );

	it( 'should return false if given element is not registered in schema', () => {
		expect( schema.checkInElements( [ new Element( 'div' ) ], 'new' ) ).to.be.false;
	} );
} );

describe( 'checkQuery', () => {
	it( 'should return false if given element is not registered in schema', () => {
		expect( schema.checkQuery( { name: 'new', inside: [ 'div', 'header' ] } ) ).to.be.false;
	} );

	it( 'should handle path given as string', () => {
		expect( schema.checkQuery( { name: '$inline', inside: '$block $block $block' } ) ).to.be.true;
	} );

	it( 'should handle attributes', () => {
		schema.registerItem( 'p', '$block' );
		schema.allow( { name: 'p', inside: '$block' } );

		expect( schema.checkQuery( { name: 'p', inside: '$block' } ) ).to.be.true;
		expect( schema.checkQuery( { name: 'p', attributes: 'bold', inside: '$block' } ) ).to.be.false;
	} );

	it( 'should support required attributes', () => {
		schema.registerItem( 'a', '$inline' );
		schema.requireAttributes( 'a', [ 'name' ] );
		schema.requireAttributes( 'a', [ 'href' ] );
		schema.allow( { name: 'a', inside: '$block', attributes: [ 'name', 'href', 'title', 'target' ] } );

		// Even though a is allowed in $block thanks to inheriting from $inline, we require href or name attribute.
		expect( schema.checkQuery( { name: 'a', inside: '$block' } ) ).to.be.false;

		// Even though a with title is allowed, we have to meet at least on required attributes set.
		expect( schema.checkQuery( { name: 'a', inside: '$block', attributes: [ 'title' ] } ) ).to.be.false;

		expect( schema.checkQuery( { name: 'a', inside: '$block', attributes: [ 'name' ] } ) ).to.be.true;
		expect( schema.checkQuery( { name: 'a', inside: '$block', attributes: [ 'href' ] } ) ).to.be.true;
		expect( schema.checkQuery( { name: 'a', inside: '$block', attributes: [ 'name', 'href' ] } ) ).to.be.true;
		expect( schema.checkQuery( { name: 'a', inside: '$block', attributes: [ 'name', 'title', 'target' ] } ) ).to.be.true;
	} );

	it( 'should support multiple attributes', () => {
		// Let's take example case, where image item has to have a pair of "alt" and "src" attributes.
		// Then it could have other attribute which is allowed on inline elements, i.e. "bold".
		schema.registerItem( 'img', '$inline' );
		schema.requireAttributes( 'img', [ 'alt', 'src' ] );
		schema.allow( { name: '$inline', inside: '$block', attributes: 'bold' } );
		schema.allow( { name: 'img', inside: '$block', attributes: [ 'alt', 'src' ] } );

		// Image without any attributes is not allowed.
		expect( schema.checkQuery( { name: 'img', inside: '$block', attributes: [ 'alt' ] } ) ).to.be.false;

		// Image can't have just alt or src.
		expect( schema.checkQuery( { name: 'img', inside: '$block', attributes: [ 'alt' ] } ) ).to.be.false;
		expect( schema.checkQuery( { name: 'img', inside: '$block', attributes: [ 'src' ] } ) ).to.be.false;

		expect( schema.checkQuery( { name: 'img', inside: '$block', attributes: [ 'alt', 'src' ] } ) ).to.be.true;

		// Because of inherting from $inline, image can have bold
		expect( schema.checkQuery( { name: 'img', inside: '$block', attributes: [ 'alt', 'src', 'bold' ] } ) ).to.be.true;
		// But it can't have only bold without alt or/and src.
		expect( schema.checkQuery( { name: 'img', inside: '$block', attributes: [ 'alt', 'bold' ] } ) ).to.be.false;
		expect( schema.checkQuery( { name: 'img', inside: '$block', attributes: [ 'src', 'bold' ] } ) ).to.be.false;
		expect( schema.checkQuery( { name: 'img', inside: '$block', attributes: [ 'bold' ] } ) ).to.be.false;

		// Even if image has src and alt, it can't have attributes that weren't allowed
		expect( schema.checkQuery( { name: 'img', inside: '$block', attributes: [ 'alt', 'src', 'attr' ] } ) ).to.be.false;
	} );
} );
