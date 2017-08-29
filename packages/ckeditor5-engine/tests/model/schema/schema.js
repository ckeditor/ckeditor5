/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { default as Schema, SchemaItem } from '../../../src/model/schema';
import Document from '../../../src/model/document';
import Element from '../../../src/model/element';
import Position from '../../../src/model/position';
import Range from '../../../src/model/range';
import Selection from '../../../src/model/selection';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData, stringify } from '../../../src/dev-utils/model';

testUtils.createSinonSandbox();

describe( 'Schema', () => {
	let schema;

	beforeEach( () => {
		schema = new Schema();
	} );

	describe( 'constructor()', () => {
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

		it( 'should create the objects set', () => {
			expect( schema.objects ).to.be.instanceOf( Set );
		} );

		it( 'should create the limits set', () => {
			expect( schema.limits ).to.be.instanceOf( Set );
		} );

		it( 'should mark $root as a limit element', () => {
			expect( schema.limits.has( '$root' ) ).to.be.true;
		} );

		describe( '$clipboardHolder', () => {
			it( 'should allow $block', () => {
				expect( schema.check( { name: '$block', inside: [ '$clipboardHolder' ] } ) ).to.be.true;
			} );

			it( 'should allow $inline', () => {
				expect( schema.check( { name: '$inline', inside: [ '$clipboardHolder' ] } ) ).to.be.true;
			} );

			it( 'should allow $text', () => {
				expect( schema.check( { name: '$text', inside: [ '$clipboardHolder' ] } ) ).to.be.true;
			} );
		} );
	} );

	describe( 'registerItem()', () => {
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

	describe( 'hasItem()', () => {
		it( 'should return true if given item name has been registered in schema', () => {
			expect( schema.hasItem( '$block' ) ).to.be.true;
		} );

		it( 'should return false if given item name has not been registered in schema', () => {
			expect( schema.hasItem( 'new' ) ).to.be.false;
		} );
	} );

	describe( '_getItem()', () => {
		it( 'should return SchemaItem registered under given name', () => {
			schema.registerItem( 'new' );

			const item = schema._getItem( 'new' );

			expect( item ).to.be.instanceof( SchemaItem );
		} );

		it( 'should throw if there is no item registered under given name', () => {
			expect( () => {
				schema._getItem( 'new' );
			} ).to.throw( CKEditorError, /model-schema-no-item/ );
		} );
	} );

	describe( 'allow()', () => {
		it( 'should add passed query to allowed in schema', () => {
			schema.registerItem( 'p', '$block' );
			schema.registerItem( 'div', '$block' );

			expect( schema.check( { name: 'p', inside: [ 'div' ] } ) ).to.be.false;

			schema.allow( { name: 'p', inside: 'div' } );

			expect( schema.check( { name: 'p', inside: [ 'div' ] } ) ).to.be.true;
		} );
	} );

	describe( 'disallow()', () => {
		it( 'should add passed query to disallowed in schema', () => {
			schema.registerItem( 'p', '$block' );
			schema.registerItem( 'div', '$block' );

			schema.allow( { name: '$block', attributes: 'bold', inside: 'div' } );

			expect( schema.check( { name: 'p', attributes: 'bold', inside: [ 'div' ] } ) ).to.be.true;

			schema.disallow( { name: 'p', attributes: 'bold', inside: 'div' } );

			expect( schema.check( { name: 'p', attributes: 'bold', inside: [ 'div' ] } ) ).to.be.false;
		} );
	} );

	describe( 'check()', () => {
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

			it( 'should omit path elements that are added to schema', () => {
				expect( schema.check( { name: '$inline', inside: '$block new $block' } ) ).to.be.true;
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

		describe( 'bug #732', () => {
			// Ticket case.
			it( 'should return false if given element is allowed in the root but not deeper', () => {
				schema.registerItem( 'paragraph', '$block' );

				expect( schema.check( { name: 'paragraph', inside: [ '$root', 'paragraph' ] } ) ).to.be.false;
			} );

			// Two additional, real life cases accompanying the ticket case.
			it( 'should return true if checking whether text is allowed in $root > paragraph', () => {
				schema.registerItem( 'paragraph', '$block' );

				expect( schema.check( { name: '$text', inside: [ '$root', 'paragraph' ] } ) ).to.be.true;
			} );

			it( 'should return true if checking whether text is allowed in paragraph', () => {
				schema.registerItem( 'paragraph', '$block' );

				expect( schema.check( { name: '$text', inside: [ 'paragraph' ] } ) ).to.be.true;
			} );

			// Veryfing the matching algorithm.
			// The right ends of the element to check and "inside" paths must match.
			describe( 'right ends of paths must match', () => {
				beforeEach( () => {
					schema.registerItem( 'a' );
					schema.registerItem( 'b' );
					schema.registerItem( 'c' );
					schema.registerItem( 'd' );
					schema.registerItem( 'e' );

					schema.allow( { name: 'a', inside: [ 'b', 'c', 'd' ] } );
					schema.allow( { name: 'e', inside: [ 'a' ] } );
				} );

				// Simple chains created by a single allow() call.

				it( 'a inside b, c', () => {
					expect( schema.check( { name: 'a', inside: [ 'b', 'c' ] } ) ).to.be.false;
				} );

				it( 'a inside b', () => {
					expect( schema.check( { name: 'a', inside: [ 'b' ] } ) ).to.be.false;
				} );

				it( 'a inside b, c, d', () => {
					expect( schema.check( { name: 'a', inside: [ 'b', 'c', 'd' ] } ) ).to.be.true;
				} );

				it( 'a inside c, d', () => {
					expect( schema.check( { name: 'a', inside: [ 'c', 'd' ] } ) ).to.be.true;
				} );

				it( 'a inside d', () => {
					expect( schema.check( { name: 'a', inside: [ 'd' ] } ) ).to.be.true;
				} );

				// "Allowed in" chains created by two separate allow() calls (`e inside a` and `a inside b,c,d`).

				it( 'e inside a, d', () => {
					expect( schema.check( { name: 'e', inside: [ 'd', 'a' ] } ) ).to.be.true;
				} );

				it( 'e inside b, c, d', () => {
					expect( schema.check( { name: 'e', inside: [ 'b', 'c', 'd' ] } ) ).to.be.false;
				} );
			} );
		} );
	} );

	describe( 'itemExtends()', () => {
		it( 'should return true if given item extends another given item', () => {
			schema.registerItem( 'div', '$block' );
			schema.registerItem( 'myDiv', 'div' );

			expect( schema.itemExtends( 'div', '$block' ) ).to.be.true;
			expect( schema.itemExtends( 'myDiv', 'div' ) ).to.be.true;
			expect( schema.itemExtends( 'myDiv', '$block' ) ).to.be.true;
		} );

		it( 'should return false if given item does not extend another given item', () => {
			schema.registerItem( 'div' );
			schema.registerItem( 'myDiv', 'div' );

			expect( schema.itemExtends( 'div', '$block' ) ).to.be.false;
			expect( schema.itemExtends( 'div', 'myDiv' ) ).to.be.false;
		} );

		it( 'should throw if one or both given items are not registered in schema', () => {
			expect( () => {
				schema.itemExtends( 'foo', '$block' );
			} ).to.throw( CKEditorError, /model-schema-no-item/ );

			expect( () => {
				schema.itemExtends( '$block', 'foo' );
			} ).to.throw( CKEditorError, /model-schema-no-item/ );
		} );
	} );

	describe( '_normalizeQueryPath()', () => {
		it( 'should normalize string with spaces to an array of strings', () => {
			expect( Schema._normalizeQueryPath( '$root div strong' ) ).to.deep.equal( [ '$root', 'div', 'strong' ] );
		} );

		it( 'should normalize model position to an array of strings', () => {
			const doc = new Document();
			const root = doc.createRoot();

			root.insertChildren( 0, [
				new Element( 'div', null, [
					new Element( 'header' )
				] )
			] );

			const position = new Position( root, [ 0, 0, 0 ] );

			expect( Schema._normalizeQueryPath( position ) ).to.deep.equal( [ '$root', 'div', 'header' ] );
		} );

		it( 'should normalize array with strings and model elements to an array of strings and drop unrecognized parts', () => {
			const input = [
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

	describe( 'checkAttributeInSelection()', () => {
		const attribute = 'bold';
		let doc, schema;

		beforeEach( () => {
			doc = new Document();
			doc.createRoot();

			schema = doc.schema;

			schema.registerItem( 'p', '$block' );
			schema.registerItem( 'h1', '$block' );
			schema.registerItem( 'img', '$inline' );
			schema.registerItem( 'figure' );

			// Bold text is allowed only in P.
			schema.allow( { name: '$text', attributes: 'bold', inside: 'p' } );
			schema.allow( { name: 'p', attributes: 'bold', inside: '$root' } );

			// Disallow bold on image.
			schema.disallow( { name: 'img', attributes: 'bold', inside: '$root' } );

			// Figure must have name attribute and optional title attribute.
			schema.requireAttributes( 'figure', [ 'name' ] );
			schema.allow( { name: 'figure', attributes: [ 'title', 'name' ], inside: '$root' } );
		} );

		describe( 'when selection is collapsed', () => {
			it( 'should return true if characters with the attribute can be placed at caret position', () => {
				setData( doc, '<p>f[]oo</p>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.true;
			} );

			it( 'should return false if characters with the attribute cannot be placed at caret position', () => {
				setData( doc, '<h1>[]</h1>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.false;

				setData( doc, '[]' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.false;
			} );
		} );

		describe( 'when selection is not collapsed', () => {
			it( 'should return true if there is at least one node in selection that can have the attribute', () => {
				// Simple selection on a few characters.
				setData( doc, '<p>[foo]</p>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.true;

				// Selection spans over characters but also include nodes that can't have attribute.
				setData( doc, '<p>fo[o<img />b]ar</p>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.true;

				// Selection on whole root content. Characters in P can have an attribute so it's valid.
				setData( doc, '[<p>foo<img />bar</p><h1></h1>]' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.true;

				// Selection on empty P. P can have the attribute.
				setData( doc, '[<p></p>]' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.true;
			} );

			it( 'should return false if there are no nodes in selection that can have the attribute', () => {
				// Selection on DIV which can't have bold text.
				setData( doc, '[<h1></h1>]' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.false;

				// Selection on two images which can't be bold.
				setData( doc, '<p>foo[<img /><img />]bar</p>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.false;
			} );

			it( 'should return true when checking element with required attribute', () => {
				setData( doc, '[<figure name="figure"></figure>]' );
				expect( schema.checkAttributeInSelection( doc.selection, 'title' ) ).to.be.true;
			} );

			it( 'should return true when checking element when attribute is already present', () => {
				setData( doc, '[<figure name="figure" title="title"></figure>]' );
				expect( schema.checkAttributeInSelection( doc.selection, 'title' ) ).to.be.true;
			} );
		} );
	} );

	describe( 'getValidRanges()', () => {
		const attribute = 'bold';
		let doc, root, schema, ranges;

		beforeEach( () => {
			doc = new Document();
			schema = doc.schema;
			root = doc.createRoot();

			schema.registerItem( 'p', '$block' );
			schema.registerItem( 'h1', '$block' );
			schema.registerItem( 'img', '$inline' );

			schema.allow( { name: '$text', attributes: 'bold', inside: 'p' } );
			schema.allow( { name: 'p', attributes: 'bold', inside: '$root' } );

			setData( doc, '<p>foo<img />bar</p>' );
			ranges = [ Range.createOn( root.getChild( 0 ) ) ];
		} );

		it( 'should return unmodified ranges when attribute is allowed on each item (text is not allowed in img)', () => {
			schema.allow( { name: 'img', attributes: 'bold', inside: 'p' } );

			expect( schema.getValidRanges( ranges, attribute ) ).to.deep.equal( ranges );
		} );

		it( 'should return unmodified ranges when attribute is allowed on each item (text is allowed in img)', () => {
			schema.allow( { name: 'img', attributes: 'bold', inside: 'p' } );
			schema.allow( { name: '$text', inside: 'img' } );

			expect( schema.getValidRanges( ranges, attribute ) ).to.deep.equal( ranges );
		} );

		it( 'should return two ranges when attribute is not allowed on one item', () => {
			schema.allow( { name: 'img', attributes: 'bold', inside: 'p' } );
			schema.allow( { name: '$text', inside: 'img' } );

			setData( doc, '[<p>foo<img>xxx</img>bar</p>]' );

			const validRanges = schema.getValidRanges( doc.selection.getRanges(), attribute );
			const sel = new Selection();
			sel.setRanges( validRanges );

			expect( stringify( root, sel ) ).to.equal( '[<p>foo<img>]xxx[</img>bar</p>]' );
		} );

		it( 'should return three ranges when attribute is not allowed on one element but is allowed on its child', () => {
			schema.allow( { name: '$text', inside: 'img' } );
			schema.allow( { name: '$text', attributes: 'bold', inside: 'img' } );

			setData( doc, '[<p>foo<img>xxx</img>bar</p>]' );

			const validRanges = schema.getValidRanges( doc.selection.getRanges(), attribute );
			const sel = new Selection();
			sel.setRanges( validRanges );

			expect( stringify( root, sel ) ).to.equal( '[<p>foo]<img>[xxx]</img>[bar</p>]' );
		} );

		it( 'should not leak beyond the given ranges', () => {
			setData( doc, '<p>[foo<img></img>bar]x[bar<img></img>foo]</p>' );

			const validRanges = schema.getValidRanges( doc.selection.getRanges(), attribute );
			const sel = new Selection();
			sel.setRanges( validRanges );

			expect( stringify( root, sel ) ).to.equal( '<p>[foo]<img></img>[bar]x[bar]<img></img>[foo]</p>' );
		} );

		it( 'should correctly handle a range which ends in a disallowed position', () => {
			schema.allow( { name: '$text', inside: 'img' } );

			setData( doc, '<p>[foo<img>bar]</img>bom</p>' );

			const validRanges = schema.getValidRanges( doc.selection.getRanges(), attribute );
			const sel = new Selection();
			sel.setRanges( validRanges );

			expect( stringify( root, sel ) ).to.equal( '<p>[foo]<img>bar</img>bom</p>' );
		} );

		it( 'should split range into two ranges and omit disallowed element', () => {
			// Disallow bold on img.
			doc.schema.disallow( { name: 'img', attributes: 'bold', inside: 'p' } );

			const result = schema.getValidRanges( ranges, attribute );

			expect( result ).to.length( 2 );
			expect( result[ 0 ].start.path ).to.members( [ 0 ] );
			expect( result[ 0 ].end.path ).to.members( [ 0, 3 ] );
			expect( result[ 1 ].start.path ).to.members( [ 0, 4 ] );
			expect( result[ 1 ].end.path ).to.members( [ 1 ] );
		} );
	} );

	describe( 'getLimitElement()', () => {
		let doc, root;

		beforeEach( () => {
			doc = new Document();
			schema = doc.schema;
			root = doc.createRoot();

			schema.registerItem( 'div', '$block' );
			schema.registerItem( 'article', '$block' );
			schema.registerItem( 'section', '$block' );
			schema.registerItem( 'paragraph', '$block' );
			schema.registerItem( 'widget', '$block' );
			schema.registerItem( 'image', '$block' );
			schema.registerItem( 'caption', '$block' );
			schema.allow( { name: 'image', inside: 'widget' } );
			schema.allow( { name: 'caption', inside: 'image' } );
			schema.allow( { name: 'paragraph', inside: 'article' } );
			schema.allow( { name: 'article', inside: 'section' } );
			schema.allow( { name: 'section', inside: 'div' } );
			schema.allow( { name: 'widget', inside: 'div' } );
		} );

		it( 'always returns $root element if any other limit was not defined', () => {
			schema.limits.clear();

			setData( doc, '<div><section><article><paragraph>foo[]bar</paragraph></article></section></div>' );
			expect( schema.getLimitElement( doc.selection ) ).to.equal( root );
		} );

		it( 'returns the limit element which is the closest element to common ancestor for collapsed selection', () => {
			schema.limits.add( 'article' );
			schema.limits.add( 'section' );

			setData( doc, '<div><section><article><paragraph>foo[]bar</paragraph></article></section></div>' );

			const article = root.getNodeByPath( [ 0, 0, 0 ] );

			expect( schema.getLimitElement( doc.selection ) ).to.equal( article );
		} );

		it( 'returns the limit element which is the closest element to common ancestor for non-collapsed selection', () => {
			schema.limits.add( 'article' );
			schema.limits.add( 'section' );

			setData( doc, '<div><section><article>[foo</article><article>bar]</article></section></div>' );

			const section = root.getNodeByPath( [ 0, 0 ] );

			expect( schema.getLimitElement( doc.selection ) ).to.equal( section );
		} );

		it( 'works fine with multi-range selections', () => {
			schema.limits.add( 'article' );
			schema.limits.add( 'widget' );
			schema.limits.add( 'div' );

			setData(
				doc,
				'<div>' +
					'<section>' +
						'<article>' +
							'<paragraph>[foo]</paragraph>' +
						'</article>' +
					'</section>' +
					'<widget>' +
						'<image>' +
							'<caption>b[a]r</caption>' +
						'</image>' +
					'</widget>' +
				'</div>'
			);

			const div = root.getNodeByPath( [ 0 ] );
			expect( schema.getLimitElement( doc.selection ) ).to.equal( div );
		} );

		it( 'works fine with multi-range selections even if limit elements are not defined', () => {
			schema.limits.clear();

			setData(
				doc,
				'<div>' +
					'<section>' +
						'<article>' +
							'<paragraph>[foo]</paragraph>' +
						'</article>' +
					'</section>' +
				'</div>' +
				'<section>b[]ar</section>'
			);

			expect( schema.getLimitElement( doc.selection ) ).to.equal( root );
		} );
	} );
} );
