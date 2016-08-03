/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

import Schema from '/ckeditor5/engine/model/schema.js';
import { SchemaItem as SchemaItem } from '/ckeditor5/engine/model/schema.js';
import Document from '/ckeditor5/engine/model/document.js';
import Element from '/ckeditor5/engine/model/element.js';
import Position from '/ckeditor5/engine/model/position.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import testUtils from '/tests/core/_utils/utils.js';

testUtils.createSinonSandbox();

let schema;

beforeEach( () => {
	schema = new Schema();
} );

describe( 'constructor', () => {
	it( 'should register base items: inline, block, root', () => {
		testUtils.sinon.spy( Schema.prototype, 'registerItem' );

		schema = new Schema();

		expect( schema.registerItem.calledWithExactly( '$root', null ) );
		expect( schema.registerItem.calledWithExactly( '$block', null ) );
		expect( schema.registerItem.calledWithExactly( '$inline', null ) );
	} );

	it( 'should allow block in root', () => {
		expect( schema.check( { name: '$block', inside: [ '$root' ] } ) ).to.be.true;
	} );

	it( 'should allow inline in block', () => {
		expect( schema.check( { name: '$inline', inside: [ '$block' ] } ) ).to.be.true;
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

		expect( schema.check( { name: 'image', inside: [ '$block' ] } ) ).to.be.true;
	} );

	it( 'should throw if item with given name has already been registered in schema', () => {
		schema.registerItem( 'new' );

		expect( () => {
			schema.registerItem( 'new' );
		} ).to.throw( CKEditorError, /model-schema-item-exists/ );
	} );

	it( 'should throw if base item has not been registered in schema', () => {
		expect( () => {
			schema.registerItem( 'new', 'old' );
		} ).to.throw( CKEditorError, /model-schema-no-item/ );
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
		} ).to.throw( CKEditorError, /model-schema-no-item/ );
	} );
} );

describe( 'allow', () => {
	it( 'should add passed query to allowed in schema', () => {
		schema.registerItem( 'p', '$block' );
		schema.registerItem( 'div', '$block' );

		expect( schema.check( { name: 'p', inside: [ 'div' ] } ) ).to.be.false;

		schema.allow( { name: 'p', inside: 'div' } );

		expect( schema.check( { name: 'p', inside: [ 'div' ] } ) ).to.be.true;
	} );
} );

describe( 'disallow', () => {
	it( 'should add passed query to disallowed in schema', () => {
		schema.registerItem( 'p', '$block' );
		schema.registerItem( 'div', '$block' );

		schema.allow( { name: '$block', attributes: 'bold', inside: 'div' } );

		expect( schema.check( { name: 'p', attributes: 'bold', inside: [ 'div' ] } ) ).to.be.true;

		schema.disallow( { name: 'p', attributes: 'bold', inside: 'div' } );

		expect( schema.check( { name: 'p', attributes: 'bold', inside: [ 'div' ] } ) ).to.be.false;
	} );
} );

describe( 'check', () => {
	describe( 'string or array of strings as inside', () => {
		it( 'should return false if given element is not registered in schema', () => {
			expect( schema.check( { name: 'new', inside: [ 'div', 'header' ] } ) ).to.be.false;
		} );

		it( 'should handle path given as string', () => {
			expect( schema.check( { name: '$inline', inside: '$block $block $block' } ) ).to.be.true;
		} );

		it( 'should handle attributes', () => {
			schema.registerItem( 'p', '$block' );
			schema.allow( { name: 'p', inside: '$block' } );

			expect( schema.check( { name: 'p', inside: [ '$block' ] } ) ).to.be.true;
			expect( schema.check( { name: 'p', inside: [ '$block' ], attributes: 'bold' } ) ).to.be.false;
		} );

		it( 'should support required attributes', () => {
			schema.registerItem( 'a', '$inline' );
			schema.requireAttributes( 'a', [ 'name' ] );
			schema.requireAttributes( 'a', [ 'href' ] );
			schema.allow( { name: 'a', inside: '$block', attributes: [ 'name', 'href', 'title', 'target' ] } );

			// Even though a is allowed in $block thanks to inheriting from $inline, we require href or name attribute.
			expect( schema.check( { name: 'a', inside: '$block' } ) ).to.be.false;

			// Even though a with title is allowed, we have to meet at least on required attributes set.
			expect( schema.check( { name: 'a', inside: '$block', attributes: [ 'title' ] } ) ).to.be.false;

			expect( schema.check( { name: 'a', inside: '$block', attributes: [ 'name' ] } ) ).to.be.true;
			expect( schema.check( { name: 'a', inside: '$block', attributes: [ 'href' ] } ) ).to.be.true;
			expect( schema.check( { name: 'a', inside: '$block', attributes: [ 'name', 'href' ] } ) ).to.be.true;
			expect( schema.check( { name: 'a', inside: '$block', attributes: [ 'name', 'title', 'target' ] } ) ).to.be.true;
		} );

		it( 'should not require attributes from parent schema items', () => {
			schema.registerItem( 'parent' );
			schema.registerItem( 'child', 'parent' );
			schema.allow( { name: 'parent', inside: '$block' } );
			schema.requireAttributes( 'parent', [ 'required' ] );

			// Even though we require "required" attribute on parent, the requirement should not be inherited.
			expect( schema.check( { name: 'child', inside: '$block' } ) ).to.be.true;
		} );

		it( 'should support multiple attributes', () => {
			// Let's take example case, where image item has to have a pair of "alt" and "src" attributes.
			// Then it could have other attribute which is allowed on inline elements, i.e. "bold".
			schema.registerItem( 'img', '$inline' );
			schema.requireAttributes( 'img', [ 'alt', 'src' ] );
			schema.allow( { name: '$inline', inside: '$block', attributes: 'bold' } );
			schema.allow( { name: 'img', inside: '$block', attributes: [ 'alt', 'src' ] } );

			// Image without any attributes is not allowed.
			expect( schema.check( { name: 'img', inside: '$block', attributes: [ 'alt' ] } ) ).to.be.false;

			// Image can't have just alt or src.
			expect( schema.check( { name: 'img', inside: '$block', attributes: [ 'alt' ] } ) ).to.be.false;
			expect( schema.check( { name: 'img', inside: '$block', attributes: [ 'src' ] } ) ).to.be.false;

			expect( schema.check( { name: 'img', inside: '$block', attributes: [ 'alt', 'src' ] } ) ).to.be.true;

			// Because of inherting from $inline, image can have bold
			expect( schema.check( { name: 'img', inside: '$block', attributes: [ 'alt', 'src', 'bold' ] } ) ).to.be.true;
			// But it can't have only bold without alt or/and src.
			expect( schema.check( { name: 'img', inside: '$block', attributes: [ 'alt', 'bold' ] } ) ).to.be.false;
			expect( schema.check( { name: 'img', inside: '$block', attributes: [ 'src', 'bold' ] } ) ).to.be.false;
			expect( schema.check( { name: 'img', inside: '$block', attributes: [ 'bold' ] } ) ).to.be.false;

			// Even if image has src and alt, it can't have attributes that weren't allowed
			expect( schema.check( { name: 'img', inside: '$block', attributes: [ 'alt', 'src', 'attr' ] } ) ).to.be.false;
		} );
	} );

	describe( 'array of elements as inside', () => {
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
			expect( schema.check( { name: 'p', inside: [ new Element( 'div' ) ] } ) ).to.be.true;

			// IMG is inline and inline is allowed in block.
			expect( schema.check( { name: 'img', inside: [ new Element( 'div' ) ] } ) ).to.be.true;
			expect( schema.check( { name: 'img', inside: [ new Element( 'p' ) ] } ) ).to.be.true;

			// Inline is allowed in any block and is allowed with attribute bold.
			expect( schema.check( { name: 'img', inside: [ new Element( 'div' ) ], attributes: [ 'bold' ] } ) ).to.be.true;
			expect( schema.check( { name: 'img', inside: [ new Element( 'p' ) ], attributes: [ 'bold' ] } ) ).to.be.true;

			// Inline is allowed in header which is allowed in DIV.
			expect( schema.check( { name: 'header', inside: [ new Element( 'div' ) ] } ) ).to.be.true;
			expect( schema.check( { name: 'img', inside: [ new Element( 'header' ) ] } ) ).to.be.true;
			expect( schema.check( { name: 'img', inside: [ new Element( 'div' ), new Element( 'header' ) ] } ) ).to.be.true;
		} );

		it( 'should return false if given element is not allowed by schema at given position', () => {
			// P with attribute is not allowed.
			expect( schema.check( { name: 'p', inside: [ new Element( 'div' ) ], attributes: 'bold' } ) ).to.be.false;

			// Bold text is not allowed in header
			expect( schema.check( { name: '$text', inside: [ new Element( 'header' ) ], attributes: 'bold' } ) ).to.be.false;
		} );

		it( 'should return false if given element is not registered in schema', () => {
			expect( schema.check( { name: 'new', inside: [ new Element( 'div' ) ] } ) ).to.be.false;
		} );
	} );

	describe( 'position as inside', () => {
		let doc, root;

		beforeEach( () => {
			doc = new Document();
			root = doc.createRoot( 'div' );

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
			expect( schema.check( { name: '$block', inside: new Position( root, [ 0 ] ) } ) ).to.be.true;

			// P is block and block should be allowed in root.
			expect( schema.check( { name: 'p', inside: new Position( root, [ 0 ] ) } ) ).to.be.true;

			// P is allowed in DIV by the set rule.
			expect( schema.check( { name: 'p', inside: new Position( root, [ 0, 0 ] ) } ) ).to.be.true;

			// Inline is allowed in any block and is allowed with attribute bold.
			// We do not check if it is allowed in header, because it is disallowed by the set rule.
			expect( schema.check( { name: '$inline', inside: new Position( root, [ 0, 0 ] ) } ) ).to.be.true;
			expect( schema.check( { name: '$inline', inside: new Position( root, [ 2, 0 ] ) } ) ).to.be.true;
			expect( schema.check( { name: '$inline', inside: new Position( root, [ 0, 0 ] ), attributes: 'bold' } ) ).to.be.true;
			expect( schema.check( { name: '$inline', inside: new Position( root, [ 2, 0 ] ), attributes: 'bold' } ) ).to.be.true;

			// Header is allowed in DIV.
			expect( schema.check( { name: 'header', inside: new Position( root, [ 0, 0 ] ) } ) ).to.be.true;

			// Inline is allowed in block and root is DIV, which is block.
			expect( schema.check( { name: '$inline', inside: new Position( root, [ 0 ] ) } ) ).to.be.true;
		} );

		it( 'should return false if given element is not allowed by schema at given position', () => {
			// P with attribute is not allowed anywhere.
			expect( schema.check( { name: 'p', inside: new Position( root, [ 0 ] ), attributes: 'bold' } ) ).to.be.false;
			expect( schema.check( { name: 'p', inside: new Position( root, [ 0, 0 ] ), attributes: 'bold' } ) ).to.be.false;

			// Bold text is not allowed in header
			expect( schema.check( { name: '$text', inside: new Position( root, [ 1, 0 ] ), attributes: 'bold' } ) ).to.be.false;
		} );

		it( 'should return false if given element is not registered in schema', () => {
			expect( schema.check( { name: 'new', inside: new Position( root, [ 0 ] ) } ) ).to.be.false;
		} );
	} );
} );

describe( '_normalizeQueryPath', () => {
	it( 'should normalize string with spaces to an array of strings', () => {
		expect( Schema._normalizeQueryPath( '$root div strong' ) ).to.deep.equal( [ '$root', 'div', 'strong' ] );
	} );

	it( 'should normalize model position to an array of strings', () => {
		let doc = new Document();
		let root = doc.createRoot();

		root.insertChildren( 0, [
			new Element( 'div', null, [
				new Element( 'header' )
			] )
		] );

		let position = new Position( root, [ 0, 0, 0 ] );

		expect( Schema._normalizeQueryPath( position ) ).to.deep.equal( [ '$root', 'div', 'header' ] );
	} );

	it( 'should normalize array with strings and model elements to an array of strings and drop unrecognized parts', () => {
		let input = [
			'$root',
			[ 'div' ],
			new Element( 'div' ),
			null,
			new Element( 'p' ),
			'strong'
		];

		expect( Schema._normalizeQueryPath( input ) ).to.deep.equal( [ '$root', 'div', 'p', 'strong' ] );
	} );
} );
