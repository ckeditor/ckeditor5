/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Schema from '/ckeditor5/core/treemodel/schema.js';
import { SchemaItem as SchemaItem } from '/ckeditor5/core/treemodel/schema.js';
import Document from '/ckeditor5/core/treemodel/document.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

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
		expect( schema.registerItem.calledWithExactly( '$root', null ) );

		Schema.prototype.registerItem.restore();
	} );

	it( 'should allow inline in block', () => {
		expect( schema.checkForPath( { name: '$inline' }, [ '$block' ] ) ).to.be.true;
	} );

	it( 'should allow block in root', () => {
		expect( schema.checkForPath( { name: '$block' }, [ '$root' ] ) ).to.be.true;
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

		expect( schema._baseChains.first ).to.deep.equal( [ 'first' ] );
		expect( schema._baseChains.secondA ).to.deep.equal( [ 'first', 'secondA' ] );
		expect( schema._baseChains.secondB ).to.deep.equal( [ 'first', 'secondB' ] );
		expect( schema._baseChains.third ).to.deep.equal( [ 'first', 'secondA', 'third' ] );
	} );

	it( 'should make registered item inherit allows from base item', () => {
		schema.registerItem( 'div', '$block' );

		expect( schema.checkForPath( { name: 'div' }, [ '$root' ] ) ).to.be.true;
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

		expect( schema.checkForPath( { name: 'p' }, [ 'div' ] ) ).to.be.false;

		schema.allow( { name: 'p', inside: 'div' } );

		expect( schema.checkForPath( { name: 'p' }, [ 'div' ] ) ).to.be.true;
	} );
} );

describe( 'disallow', () => {
	it( 'should add passed query to disallowed in schema', () => {
		schema.registerItem( 'p', '$block' );
		schema.registerItem( 'div', '$block' );

		schema.allow( { name: '$block', attribute: 'bold', inside: 'div' } );

		expect( schema.checkForPath( { name: 'p', attribute: 'bold' }, [ 'div' ] ) ).to.be.true;

		schema.disallow( { name: 'p', attribute: 'bold', inside: 'div' } );

		expect( schema.checkForPath( { name: 'p', attribute: 'bold' }, [ 'div' ] ) ).to.be.false;
	} );
} );

describe( 'checkAtPosition', () => {
	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

		root.insertChildren( 0, [
			new Element( 'div' ),
			new Element( 'header' ),
			new Element( 'p' )
		] );

		schema.registerItem( 'div', '$block' );
		schema.registerItem( 'header', '$block' );
		schema.registerItem( 'p', '$block' );

		schema.allow( { name: 'p', inside: 'div' } );
		schema.allow( { name: 'header', inside: 'div' } );
		schema.allow( { name: '$inline', attribute: 'bold', inside: '$block' } );

		schema.disallow( { name: '$inline', attribute: 'bold', inside: 'header' } );
	} );

	it( 'should return true if given element is allowed by schema at given position', () => {
		// Block should be allowed in root.
		expect( schema.checkAtPosition( { name: '$block' }, new Position( root, [ 0 ] ) ) ).to.be.true;

		// P is block and block should be allowed in root.
		expect( schema.checkAtPosition( { name: 'p' }, new Position( root, [ 0 ] ) ) ).to.be.true;

		// P is allowed in DIV by the set rule.
		expect( schema.checkAtPosition( { name: 'p' }, new Position( root, [ 0, 0 ] ) ) ).to.be.true;

		// Inline is allowed in any block and is allowed with attribute bold.
		// We do not check if it is allowed in header, because it is disallowed by the set rule.
		expect( schema.checkAtPosition( { name: '$inline' }, new Position( root, [ 0, 0 ] ) ) ).to.be.true;
		expect( schema.checkAtPosition( { name: '$inline' }, new Position( root, [ 2, 0 ] ) ) ).to.be.true;
		expect( schema.checkAtPosition( { name: '$inline', attribute: 'bold' }, new Position( root, [ 0, 0 ] ) ) ).to.be.true;
		expect( schema.checkAtPosition( { name: '$inline', attribute: 'bold' }, new Position( root, [ 2, 0 ] ) ) ).to.be.true;

		// Header is allowed in DIV.
		expect( schema.checkAtPosition( { name: 'header' }, new Position( root, [ 0, 0 ] ) ) ).to.be.true;
	} );

	it( 'should return false if given element is not allowed by schema at given position', () => {
		// Inline is not allowed in root.
		expect( schema.checkAtPosition( { name: '$inline' }, new Position( root, [ 0 ] ) ) ).to.be.false;

		// P with attribute is not allowed anywhere.
		expect( schema.checkAtPosition( { name: 'p', attribute: 'bold' }, new Position( root, [ 0 ] ) ) ).to.be.false;
		expect( schema.checkAtPosition( { name: 'p', attribute: 'bold' }, new Position( root, [ 0, 0 ] ) ) ).to.be.false;

		// Bold text is not allowed in header
		expect( schema.checkAtPosition( { name: '$inline', attribute: 'bold' }, new Position( root, [ 1, 0 ] ) ) ).to.be.false;
	} );

	it( 'should return false if given element is not registered in schema', () => {
		expect( schema.checkAtPosition( { name: 'new' }, new Position( root, [ 0 ] ) ) ).to.be.false;
	} );
} );

describe( 'checkForPath', () => {
	it( 'should return false if given element is not registered in schema', () => {
		expect( schema.checkForPath( { name: 'new' }, 'div header' ) ).to.be.false;
	} );

	it( 'should handle path given as string', () => {
		expect( schema.checkForPath( { name: '$inline' }, '$block $root' ) ).to.be.true;
	} );
} );
