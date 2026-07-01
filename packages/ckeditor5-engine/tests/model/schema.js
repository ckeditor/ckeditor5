/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ModelSchema, ModelSchemaContext } from '../../src/model/schema.js';

import { Model } from '../../src/model/model.js';

import { ModelDocumentFragment } from '../../src/model/documentfragment.js';
import { ModelElement } from '../../src/model/element.js';
import { ModelText } from '../../src/model/text.js';
import { ModelTextProxy } from '../../src/model/textproxy.js';
import { ModelPosition } from '../../src/model/position.js';
import { ModelRange } from '../../src/model/range.js';

import { _getModelData, _setModelData, _stringifyModel, _parseModel } from '../../src/dev-utils/model.js';

import { AttributeOperation } from '../../src/model/operation/attributeoperation.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'Schema', () => {
	let schema, root1, r1p1, r1p2, r1bQ, r1bQp, root2;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		schema = new ModelSchema();

		root1 = new ModelElement( '$root', null, [
			new ModelElement( 'paragraph', null, 'foo' ),
			new ModelElement( 'paragraph', { align: 'right' }, 'bar' ),
			new ModelElement( 'blockQuote', null, [
				new ModelElement( 'paragraph', null, 'foo' )
			] )
		] );
		r1p1 = root1.getChild( 0 );
		r1p2 = root1.getChild( 1 );
		r1bQ = root1.getChild( 2 );
		r1bQp = r1bQ.getChild( 0 );

		root2 = new ModelElement( '$root2' );
	} );

	describe( 'register()', () => {
		it( 'allows registering an item', () => {
			schema.register( 'foo' );

			expect( schema.getDefinition( 'foo' ) ).not.toBeNull();
		} );

		it( 'copies definitions objects', () => {
			const definitions = {};

			schema.register( 'foo', definitions );

			definitions.isBlock = true;

			expect( schema.getDefinitions().foo.isBlock ).toBe( false );
		} );

		it( 'throws when trying to register for a single item twice', () => {
			schema.register( 'foo' );

			expectToThrowCKEditorError( () => {
				schema.register( 'foo' );
			}, 'schema-cannot-register-item-twice', schema );
		} );
	} );

	describe( 'extend()', () => {
		it( 'allows extending item\'s definitions', () => {
			schema.register( 'foo' );

			schema.extend( 'foo', {
				isBlock: true
			} );

			expect( schema.getDefinition( 'foo' ) ).toMatchObject( { isBlock: true } );
		} );

		it( 'copies definitions objects', () => {
			schema.register( 'foo', {} );

			const definitions = {};
			schema.extend( 'foo', definitions );

			definitions.isBlock = true;

			expect( schema.getDefinitions().foo.isBlock ).toBe( false );
		} );

		it( 'throws when trying to extend a not yet registered item', () => {
			expectToThrowCKEditorError( () => {
				schema.extend( 'foo' );
			}, 'schema-cannot-extend-missing-item', schema );
		} );
	} );

	describe( 'attribute properties', () => {
		beforeEach( () => {
			schema.register( '$root' );
			schema.register( 'paragraph', {
				allowIn: '$root'
			} );
			schema.register( '$text', {
				allowIn: 'paragraph'
			} );
			schema.extend( '$text', { allowAttributes: [ 'testAttribute', 'noPropertiesAttribute' ] } );
		} );

		describe( 'setAttributeProperties()', () => {
			it( 'allows registering new properties', () => {
				schema.setAttributeProperties( 'testAttribute', {
					foo: 'bar',
					baz: 'bom'
				} );

				expect( schema.getAttributeProperties( 'testAttribute' ) ).toEqual( {
					foo: 'bar',
					baz: 'bom'
				} );
			} );

			it( 'support adding properties in subsequent calls', () => {
				schema.setAttributeProperties( 'testAttribute', {
					first: 'foo'
				} );

				schema.setAttributeProperties( 'testAttribute', {
					second: 'bar'
				} );

				expect( schema.getAttributeProperties( 'testAttribute' ) ).toEqual( {
					first: 'foo',
					second: 'bar'
				} );
			} );
		} );

		describe( 'getAttributeProperties()', () => {
			it( 'it returns a proper value if the attribute has no properties', () => {
				expect( schema.getAttributeProperties( 'noPropertiesAttribute' ) ).toEqual( {} );
			} );

			it( 'it returns a proper value for unknown attribute', () => {
				expect( schema.getAttributeProperties( 'unregistered-attribute' ) ).toEqual( {} );
			} );
		} );
	} );

	describe( 'getDefinitions()', () => {
		it( 'returns compiled definitions', () => {
			schema.register( '$root' );

			schema.register( 'foo', {
				allowIn: '$root'
			} );

			schema.extend( 'foo', {
				isBlock: true
			} );

			const definitions = schema.getDefinitions();

			expect( definitions.foo ).toEqual( {
				name: 'foo',
				allowIn: [ '$root' ],
				allowChildren: [],
				allowAttributes: [],
				isBlock: true,
				isContent: false,
				isInline: false,
				isLimit: false,
				isObject: false,
				isSelectable: false
			} );
		} );

		it( 'copies all is* types', () => {
			schema.register( 'foo', {
				isBlock: true,
				isInline: true
			} );

			schema.extend( 'foo', {
				isSelectable: false,
				isInline: false // Check that the last one wins.
			} );

			const definitions = schema.getDefinitions();

			expect( definitions.foo ).toMatchObject( { isBlock: true } );
			expect( definitions.foo ).toMatchObject( { isSelectable: false } );
			expect( definitions.foo ).toMatchObject( { isInline: false } );
		} );

		it( 'does not recompile definitions if not needed', () => {
			schema.register( 'foo' );

			expect( schema.getDefinitions() ).toBe( schema.getDefinitions() );
		} );

		it( 'ensures no duplicates in allowIn', () => {
			schema.register( '$root' );
			schema.register( 'foo', {
				allowIn: '$root'
			} );
			schema.extend( 'foo', {
				allowIn: '$root'
			} );

			const definitions = schema.getDefinitions();

			expect( definitions.foo ).toEqual( {
				name: 'foo',
				allowIn: [ '$root' ],
				allowChildren: [],
				allowAttributes: [],
				isBlock: false,
				isContent: false,
				isInline: false,
				isLimit: false,
				isObject: false,
				isSelectable: false
			} );
		} );

		it( 'ensures no non-registered items in allowIn', () => {
			schema.register( 'foo', {
				allowIn: '$root'
			} );

			const definitions = schema.getDefinitions();

			expect( definitions.foo ).toEqual( {
				name: 'foo',
				allowIn: [],
				allowChildren: [],
				allowAttributes: [],
				isBlock: false,
				isContent: false,
				isInline: false,
				isLimit: false,
				isObject: false,
				isSelectable: false
			} );
		} );

		it( 'ensures no duplicates in allowAttributes', () => {
			schema.register( 'paragraph', {
				allowAttributes: 'foo'
			} );
			schema.extend( 'paragraph', {
				allowAttributes: 'foo'
			} );

			const definitions = schema.getDefinitions();

			expect( definitions.paragraph ).toEqual( {
				name: 'paragraph',
				allowIn: [],
				allowChildren: [],
				allowAttributes: [ 'foo' ],
				isBlock: false,
				isContent: false,
				isInline: false,
				isLimit: false,
				isObject: false,
				isSelectable: false
			} );
		} );

		it( 'ensures no duplicates in allowAttributes duplicated by allowAttributesOf', () => {
			schema.register( 'paragraph', {
				allowAttributes: 'foo',
				allowAttributesOf: '$block'
			} );
			schema.register( '$block', {
				allowAttributes: 'foo'
			} );

			const definitions = schema.getDefinitions();

			expect( definitions.paragraph ).toEqual( {
				name: 'paragraph',
				allowIn: [],
				allowChildren: [],
				allowAttributes: [ 'foo' ],
				isBlock: false,
				isContent: false,
				isInline: false,
				isLimit: false,
				isObject: false,
				isSelectable: false
			} );
		} );
	} );

	describe( 'getDefinition()', () => {
		it( 'returns a definition based on an item name', () => {
			schema.register( 'foo', {
				isBlock: true
			} );

			expect( schema.getDefinition( 'foo' ).isBlock ).toBe( true );
		} );

		it( 'returns a definition based on an element name', () => {
			schema.register( 'foo', {
				isBlock: true
			} );

			expect( schema.getDefinition( new ModelElement( 'foo' ) ).isBlock ).toBe( true );
		} );

		it( 'returns a definition based on a text node', () => {
			schema.register( '$text', {
				isBlock: true
			} );

			expect( schema.getDefinition( new ModelText( 'foo' ) ).isBlock ).toBe( true );
		} );

		it( 'returns a definition based on a text proxy', () => {
			schema.register( '$text', {
				isBlock: true
			} );

			const text = new ModelText( 'foo' );
			const textProxy = new ModelTextProxy( text, 0, 1 );

			expect( schema.getDefinition( textProxy ).isBlock ).toBe( true );
		} );

		it( 'returns a definition based on a schema context item', () => {
			schema.register( 'foo', {
				isBlock: true
			} );
			const ctx = new ModelSchemaContext( [ '$root', 'foo' ] );

			expect( schema.getDefinition( ctx.last ).isBlock ).toBe( true );
		} );

		it( 'returns undefined when trying to get an non-registered item', () => {
			expect( schema.getDefinition( '404' ) ).toBeUndefined();
		} );
	} );

	describe( 'isRegistered()', () => {
		it( 'returns true if an item was registered', () => {
			schema.register( 'foo' );

			expect( schema.isRegistered( 'foo' ) ).toBe( true );
		} );

		it( 'returns false if an item was not registered', () => {
			expect( schema.isRegistered( 'foo' ) ).toBe( false );
		} );

		it( 'uses getDefinition()\'s item to definition normalization', () => {
			const stub = vi.spyOn( schema, 'getDefinition' ).mockReturnValue( {} );

			expect( schema.isRegistered( 'foo' ) ).toBe( true );
			expect( stub ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'isBlock()', () => {
		it( 'returns true if an item was registered as a block', () => {
			schema.register( 'foo', {
				isBlock: true
			} );

			expect( schema.isBlock( 'foo' ) ).toBe( true );
		} );

		it( 'returns false if an item was not registered as a block', () => {
			schema.register( 'foo' );

			expect( schema.isBlock( 'foo' ) ).toBe( false );
		} );

		it( 'returns false if an item was not registered at all', () => {
			expect( schema.isBlock( 'foo' ) ).toBe( false );
		} );

		it( 'uses getDefinition()\'s item to definition normalization', () => {
			const stub = vi.spyOn( schema, 'getDefinition' ).mockReturnValue( { isBlock: true } );

			expect( schema.isBlock( 'foo' ) ).toBe( true );
			expect( stub ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'isLimit()', () => {
		it( 'returns true if an item was registered as a limit element', () => {
			schema.register( 'foo', {
				isLimit: true
			} );

			expect( schema.isLimit( 'foo' ) ).toBe( true );
		} );

		it( 'returns true if an item was registered as an object element (because all objects are limits too)', () => {
			schema.register( 'foo', {
				isObject: true
			} );

			expect( schema.isLimit( 'foo' ) ).toBe( true );
		} );

		it( 'returns false if an item was not registered as a limit element', () => {
			schema.register( 'foo' );

			expect( schema.isLimit( 'foo' ) ).toBe( false );
		} );

		it( 'returns false if an item was not registered at all', () => {
			expect( schema.isLimit( 'foo' ) ).toBe( false );
		} );

		it( 'uses getDefinition()\'s item to definition normalization', () => {
			const stub = vi.spyOn( schema, 'getDefinition' ).mockReturnValue( { isLimit: true } );

			expect( schema.isLimit( 'foo' ) ).toBe( true );
			expect( stub ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'isObject()', () => {
		it( 'returns true if an item was registered as an object', () => {
			schema.register( 'foo', {
				isObject: true
			} );

			expect( schema.isObject( 'foo' ) ).toBe( true );
		} );

		it( 'returns true if an item is a limit, selectable, and a content at once (but not explicitely an object)', () => {
			schema.register( 'foo', {
				isLimit: true,
				isSelectable: true,
				isContent: true
			} );

			expect( schema.isObject( 'foo' ) ).toBe( true );
		} );

		it( 'returns false if an item was registered as a limit (because not all limits are objects)', () => {
			schema.register( 'foo', {
				isLimit: true
			} );

			expect( schema.isObject( 'foo' ) ).toBe( false );
		} );

		it( 'returns false if an item is a limit and a selectable but not a content ' +
			'(because an object must always find its way into data regardless of its children)',
		() => {
			schema.register( 'foo', {
				isLimit: true,
				isSelectable: true
			} );

			expect( schema.isObject( 'foo' ) ).toBe( false );
		} );

		it( 'returns false if an item is a limit and content but not a selectable ' +
			'(because the user must always be able to select an object)',
		() => {
			schema.register( 'foo', {
				isLimit: true,
				isContent: true
			} );

			expect( schema.isObject( 'foo' ) ).toBe( false );
		} );

		it( 'returns false if an item is a selectable and a content but not a limit ' +
			'(because an object should never be split or crossed by the selection)',
		() => {
			schema.register( 'foo', {
				isSelectable: true,
				isContent: true
			} );

			expect( schema.isObject( 'foo' ) ).toBe( false );
		} );

		it( 'returns false if an item was not registered as an object', () => {
			schema.register( 'foo' );

			expect( schema.isObject( 'foo' ) ).toBe( false );
		} );

		it( 'returns false if an item was not registered at all', () => {
			expect( schema.isObject( 'foo' ) ).toBe( false );
		} );

		it( 'uses getDefinition()\'s item to definition normalization', () => {
			const stub = vi.spyOn( schema, 'getDefinition' ).mockReturnValue( { isObject: true } );

			expect( schema.isObject( 'foo' ) ).toBe( true );
			expect( stub ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'isInline()', () => {
		it( 'returns true if an item was registered as inline', () => {
			schema.register( 'foo', {
				isInline: true
			} );

			expect( schema.isInline( 'foo' ) ).toBe( true );
		} );

		it( 'returns false if an item was registered as a limit (because not all limits are objects)', () => {
			schema.register( 'foo', {
				isLimit: true
			} );

			expect( schema.isInline( 'foo' ) ).toBe( false );
		} );

		it( 'returns false if an item was not registered as an object', () => {
			schema.register( 'foo' );

			expect( schema.isInline( 'foo' ) ).toBe( false );
		} );

		it( 'returns false if an item was not registered at all', () => {
			expect( schema.isInline( 'foo' ) ).toBe( false );
		} );

		it( 'uses getDefinition()\'s item to definition normalization', () => {
			const stub = vi.spyOn( schema, 'getDefinition' ).mockReturnValue( { isInline: true } );

			expect( schema.isInline( 'foo' ) ).toBe( true );
			expect( stub ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'isSelectable()', () => {
		it( 'should return true if an item was registered as a selectable', () => {
			schema.register( 'foo', {
				isSelectable: true
			} );

			expect( schema.isSelectable( 'foo' ) ).toBe( true );
		} );

		it( 'should return true if an item was registered as an object (because all objects are selectables)', () => {
			schema.register( 'foo', {
				isObject: true
			} );

			expect( schema.isSelectable( 'foo' ) ).toBe( true );
		} );

		it( 'should return false if an item was not registered as an object or selectable', () => {
			schema.register( 'foo' );

			expect( schema.isSelectable( 'foo' ) ).toBe( false );
		} );

		it( 'should return false if an item was not registered at all', () => {
			expect( schema.isSelectable( 'foo' ) ).toBe( false );
		} );

		it( 'uses getDefinition()\'s item to definition normalization', () => {
			const stub = vi.spyOn( schema, 'getDefinition' ).mockReturnValue( { isSelectable: true } );

			expect( schema.isSelectable( 'foo' ) ).toBe( true );
			expect( stub ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'isContent()', () => {
		it( 'should return true if an item was registered as a content', () => {
			schema.register( 'foo', {
				isContent: true
			} );

			expect( schema.isContent( 'foo' ) ).toBe( true );
		} );

		it( 'should return true if an item was registered as an object (because all objects are content)', () => {
			schema.register( 'foo', {
				isObject: true
			} );

			expect( schema.isContent( 'foo' ) ).toBe( true );
		} );

		it( 'should return false if an item was not registered as an object or a content', () => {
			schema.register( 'foo' );

			expect( schema.isContent( 'foo' ) ).toBe( false );
		} );

		it( 'should return false if an item was not registered at all', () => {
			expect( schema.isContent( 'foo' ) ).toBe( false );
		} );

		it( 'uses getDefinition()\'s item to definition normalization', () => {
			const stub = vi.spyOn( schema, 'getDefinition' ).mockReturnValue( { isContent: true } );

			expect( schema.isContent( 'foo' ) ).toBe( true );
			expect( stub ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'checkChild()', () => {
		beforeEach( () => {
			schema.register( '$root' );
			schema.register( 'paragraph', {
				allowIn: '$root'
			} );
			schema.register( '$text', {
				allowIn: 'paragraph'
			} );
		} );

		it( 'accepts an element as a context and a node name as a child', () => {
			expect( schema.checkChild( root1, 'paragraph' ) ).toBe( true );
			expect( schema.checkChild( root1, '$text' ) ).toBe( false );
		} );

		it( 'accepts a schemaContext instance as a context', () => {
			const rootContext = new ModelSchemaContext( ModelPosition._createAt( root1, 0 ) );
			const paragraphContext = new ModelSchemaContext( ModelPosition._createAt( r1p1, 0 ) );

			expect( schema.checkChild( rootContext, 'paragraph' ) ).toBe( true );
			expect( schema.checkChild( rootContext, '$text' ) ).toBe( false );

			expect( schema.checkChild( paragraphContext, '$text' ) ).toBe( true );
			expect( schema.checkChild( paragraphContext, 'paragraph' ) ).toBe( false );
		} );

		it( 'accepts a position as a context', () => {
			const posInRoot = ModelPosition._createAt( root1, 0 );
			const posInParagraph = ModelPosition._createAt( r1p1, 0 );

			expect( schema.checkChild( posInRoot, 'paragraph' ) ).toBe( true );
			expect( schema.checkChild( posInRoot, '$text' ) ).toBe( false );

			expect( schema.checkChild( posInParagraph, '$text' ) ).toBe( true );
			expect( schema.checkChild( posInParagraph, 'paragraph' ) ).toBe( false );
		} );

		// This is a temporary feature which is needed to make the current V->M conversion works.
		// It should be removed once V->M conversion uses real positions.
		// Of course, real positions have this advantage that we know element attributes at this point.
		it( 'accepts an array of element names as a context', () => {
			const contextInRoot = [ '$root' ];
			const contextInParagraph = [ '$root', 'paragraph' ];

			expect( schema.checkChild( contextInRoot, 'paragraph' ) ).toBe( true );
			expect( schema.checkChild( contextInRoot, '$text' ) ).toBe( false );

			expect( schema.checkChild( contextInParagraph, '$text' ) ).toBe( true );
			expect( schema.checkChild( contextInParagraph, 'paragraph' ) ).toBe( false );
		} );

		it( 'accepts an array of elements as a context', () => {
			const contextInRoot = [ root1 ];
			const contextInParagraph = [ root1, r1p1 ];

			expect( schema.checkChild( contextInRoot, 'paragraph' ) ).toBe( true );
			expect( schema.checkChild( contextInRoot, '$text' ) ).toBe( false );

			expect( schema.checkChild( contextInParagraph, '$text' ) ).toBe( true );
			expect( schema.checkChild( contextInParagraph, 'paragraph' ) ).toBe( false );
		} );

		// Again, this is needed temporarily to handle current V->M conversion
		it( 'accepts a mixed array of elements and strings as a context', () => {
			const contextInParagraph = [ '$root', r1p1 ];

			expect( schema.checkChild( contextInParagraph, '$text' ) ).toBe( true );
			expect( schema.checkChild( contextInParagraph, 'paragraph' ) ).toBe( false );
		} );

		it( 'accepts a node as a child', () => {
			expect( schema.checkChild( root1, r1p1 ) ).toBe( true );
			expect( schema.checkChild( root1, new ModelText( 'foo' ) ) ).toBe( false );
		} );

		it( 'fires the checkChild event with already normalized params', () => {
			return new Promise( resolve => {
				schema.on( 'checkChild', ( evt, [ ctx, child ] ) => {
					expect( ctx ).toBeInstanceOf( ModelSchemaContext );
					expect( child ).toBe( schema.getDefinition( 'paragraph' ) );

					resolve();
				}, { priority: 'highest' } );

				schema.checkChild( root1, r1p1 );
			} );
		} );

		it( 'fires custom callback for each item in the context - generic callback', () => {
			schema.register( 'div' );

			const stub = vi.fn().mockReturnValue( true );

			schema.addChildCheck( stub );

			schema.checkChild( [ '$root', 'div', 'paragraph' ], '$text' );

			expect( stub ).toHaveBeenCalledTimes( 3 ); // $text, paragraph, div. Not called for top-level parent ($root in this case).
		} );

		it( 'returns false if any of context items is not defined', () => {
			// Force all elements to be allowed.
			schema.addChildCheck( () => true );

			// ... but div is not registered.
			const result = schema.checkChild( [ '$root', 'div', 'paragraph' ], '$text' );

			expect( result ).toBe( false );
		} );
	} );

	describe( 'checkAttribute()', () => {
		beforeEach( () => {
			schema.register( 'paragraph', {
				allowAttributes: 'align'
			} );
			schema.register( '$text', {
				allowAttributes: 'bold'
			} );
		} );

		it( 'accepts an element as a context', () => {
			expect( schema.checkAttribute( r1p1, 'align' ) ).toBe( true );
			expect( schema.checkAttribute( r1p1, 'bold' ) ).toBe( false );
		} );

		it( 'accepts a text as a context', () => {
			expect( schema.checkAttribute( new ModelText( 'foo' ), 'bold' ) ).toBe( true );
			expect( schema.checkAttribute( new ModelText( 'foo' ), 'align' ) ).toBe( false );
		} );

		it( 'accepts a position as a context', () => {
			const posInRoot = ModelPosition._createAt( root1, 0 );
			const posInParagraph = ModelPosition._createAt( r1p1, 0 );

			expect( schema.checkAttribute( posInRoot, 'align' ) ).toBe( false );
			expect( schema.checkAttribute( posInParagraph, 'align' ) ).toBe( true );
		} );

		it( 'accepts a schemaContext instance as a context', () => {
			const rootContext = new ModelSchemaContext( ModelPosition._createAt( root1, 0 ) );
			const paragraphContext = new ModelSchemaContext( ModelPosition._createAt( r1p1, 0 ) );

			expect( schema.checkAttribute( rootContext, 'align' ) ).toBe( false );
			expect( schema.checkAttribute( paragraphContext, 'align' ) ).toBe( true );
		} );

		it( 'accepts an array of node names as a context', () => {
			const contextInRoot = [ '$root' ];
			const contextInParagraph = [ '$root', 'paragraph' ];
			const contextInText = [ '$root', 'paragraph', '$text' ];

			expect( schema.checkAttribute( contextInRoot, 'align' ) ).toBe( false );
			expect( schema.checkAttribute( contextInParagraph, 'align' ) ).toBe( true );
			expect( schema.checkAttribute( contextInText, 'bold' ) ).toBe( true );
		} );

		it( 'accepts an array of nodes as a context', () => {
			const contextInRoot = [ root1 ];
			const contextInParagraph = [ root1, r1p1 ];
			const contextInText = [ root1, r1p1, r1p1.getChild( 0 ) ];

			expect( schema.checkAttribute( contextInRoot, 'align' ) ).toBe( false );
			expect( schema.checkAttribute( contextInParagraph, 'align' ) ).toBe( true );
			expect( schema.checkAttribute( contextInText, 'bold' ) ).toBe( true );
		} );

		it( 'fires the checkAttribute event with already normalized context', () => {
			return new Promise( resolve => {
				schema.on( 'checkAttribute', ( evt, [ ctx, attributeName ] ) => {
					expect( ctx ).toBeInstanceOf( ModelSchemaContext );
					expect( attributeName ).toBe( 'bold' );

					resolve();
				}, { priority: 'highest' } );

				schema.checkAttribute( r1p1, 'bold' );
			} );
		} );
	} );

	describe( 'addChildCheck()', () => {
		beforeEach( () => {
			schema.register( '$root' );
			schema.register( 'paragraph', { allowIn: '$root' } );
			schema.register( 'blockQuote', { allowIn: '$root' } );
			schema.register( 'foo' );
		} );

		it( 'supports generic and specific checks', () => {
			const spyGeneric = vi.fn();
			const spySpecificP = vi.fn();
			const spySpecificBar = vi.fn();

			schema.addChildCheck( spyGeneric );
			schema.addChildCheck( spySpecificP, 'paragraph' );
			schema.addChildCheck( spySpecificBar, 'bar' );

			schema.checkChild( [ '$root' ], 'paragraph' );

			expect( spyGeneric ).toHaveBeenCalledOnce();
			expect( spySpecificP ).toHaveBeenCalledOnce();
			expect( spySpecificBar ).not.toHaveBeenCalled();
		} );

		it( 'proper checks order', () => {
			const order = [];

			schema.addChildCheck( () => {
				order.push( 'addChildCheckSpecific' );
			}, 'paragraph' );

			schema.addChildCheck( () => {
				order.push( 'addChildCheckGeneric' );
			} );

			schema.on( 'checkChild', () => {
				order.push( 'checkChild:high' );
			}, { priority: 'high' } );

			schema.checkChild( root1, r1p1 );

			expect( order.join() ).toBe( 'checkChild:high,addChildCheckGeneric,addChildCheckSpecific' );
		} );

		it( 'overrides the declarative check - force allow', () => {
			expect( schema.checkChild( [ '$root' ], 'foo' ) ).toBe( false );

			schema.addChildCheck( () => true, 'foo' );

			expect( schema.checkChild( [ '$root' ], 'foo' ) ).toBe( true );
		} );

		it( 'overrides the declarative check - force disallow', () => {
			expect( schema.checkChild( [ '$root' ], 'paragraph' ) ).toBe( true );

			schema.addChildCheck( () => false, 'paragraph' );

			expect( schema.checkChild( [ '$root' ], 'paragraph' ) ).toBe( false );
		} );

		it( 'uses declarative check when undefined is returned', () => {
			expect( schema.checkChild( [ '$root' ], 'paragraph' ) ).toBe( true );

			schema.addChildCheck( () => {}, 'paragraph' );

			expect( schema.checkChild( [ '$root' ], 'paragraph' ) ).toBe( true );
		} );

		it( 'receives context and child definition as params', () => {
			schema.addChildCheck( ( ctx, childDef ) => {
				expect( ctx ).toBeInstanceOf( ModelSchemaContext );
				expect( childDef ).toBe( schema.getDefinition( 'paragraph' ) );
			} );

			expect( schema.checkChild( root1, r1p1 ) ).toBe( true );
		} );

		it( 'is not called when checking a non-registered element', () => {
			expect( schema.getDefinition( 'bar' ) ).toBeUndefined();

			schema.addChildCheck( () => {
				throw new Error( 'callback should not be called' );
			} );

			expect( schema.checkChild( root1, 'bar' ) ).toBe( false );
		} );
	} );

	describe( 'addAttributeCheck()', () => {
		beforeEach( () => {
			schema.register( '$root' );
			schema.register( 'paragraph', { allowIn: '$root', allowAttributes: [ 'foo' ] } );
		} );

		it( 'supports generic and specific checks', () => {
			const spyGeneric = vi.fn();
			const spySpecificX = vi.fn();
			const spySpecificBar = vi.fn();

			schema.addAttributeCheck( spyGeneric );
			schema.addAttributeCheck( spySpecificX, 'x' );
			schema.addAttributeCheck( spySpecificBar, 'bar' );

			schema.checkAttribute( [ '$root', 'paragraph' ], 'x' );

			expect( spyGeneric ).toHaveBeenCalledOnce();
			expect( spySpecificX ).toHaveBeenCalledOnce();
			expect( spySpecificBar ).not.toHaveBeenCalled();
		} );

		it( 'proper checks order', () => {
			const order = [];

			schema.addAttributeCheck( () => {
				order.push( 'addAttributeCheckSpecific' );
			}, 'foo' );

			schema.addAttributeCheck( () => {
				order.push( 'addAttributeCheckGeneric' );
			} );

			schema.on( 'checkAttribute', () => {
				order.push( 'checkAttribute:high' );
			}, { priority: 'high' } );

			schema.checkAttribute( r1p1, 'foo' );

			expect( order.join() ).toBe( 'checkAttribute:high,addAttributeCheckGeneric,addAttributeCheckSpecific' );
		} );

		it( 'overrides the return value when callback returned true', () => {
			expect( schema.checkAttribute( r1p1, 'bar' ) ).toBe( false );

			schema.addAttributeCheck( () => {
				return true;
			} );

			expect( schema.checkAttribute( r1p1, 'bar' ) ).toBe( true );
		} );

		it( 'overrides the return value when callback returned false', () => {
			expect( schema.checkAttribute( r1p1, 'foo' ) ).toBe( true );

			schema.addAttributeCheck( () => {
				return false;
			} );

			expect( schema.checkAttribute( r1p1, 'foo' ) ).toBe( false );
		} );

		it( 'receives context and attribute name as params', () => {
			schema.addAttributeCheck( ( ctx, attributeName ) => {
				expect( ctx ).toBeInstanceOf( ModelSchemaContext );
				expect( attributeName ).toBe( 'foo' );
			} );

			expect( schema.checkAttribute( r1p1, 'foo' ) ).toBe( true );
		} );
	} );

	describe( 'checkMerge()', () => {
		beforeEach( () => {
			schema.register( '$root' );
			schema.register( '$block', {
				allowIn: '$root',
				isBlock: true
			} );
			schema.register( '$text', {
				allowIn: '$block'
			} );
			schema.register( 'paragraph', {
				inheritAllFrom: '$block'
			} );
			schema.register( 'listItem', {
				inheritAllFrom: '$block'
			} );
			schema.register( 'blockQuote', {
				allowWhere: '$block',
				allowContentOf: '$root'
			} );
			schema.register( 'blockObject', {
				allowWhere: '$block',
				isBlock: true,
				isObject: true
			} );
			schema.register( 'inlineObject', {
				allowWhere: '$text',
				allowAttributesOf: '$text',
				isInline: true,
				isObject: true
			} );
		} );

		it( 'returns false if a block cannot be merged with other block (disallowed element is the first child)', () => {
			const paragraph = new ModelElement( 'paragraph', null, [
				new ModelText( 'xyz' )
			] );
			const blockQuote = new ModelElement( 'blockQuote', null, [ paragraph ] );
			const listItem = new ModelElement( 'listItem' );

			expect( schema.checkMerge( listItem, blockQuote ) ).toBe( false );
		} );

		it( 'returns false if a block cannot be merged with other block (disallowed element is not the first child)', () => {
			const paragraph = new ModelElement( 'paragraph', null, [
				new ModelText( 'foo' )
			] );
			const blockQuote = new ModelElement( 'blockQuote', null, [
				new ModelText( 'bar', { bold: true } ),
				new ModelText( 'xyz' ),
				paragraph
			] );
			const listItem = new ModelElement( 'listItem' );

			expect( schema.checkMerge( listItem, blockQuote ) ).toBe( false );
		} );

		it( 'returns true if a block can be merged with other block', () => {
			const listItem = new ModelElement( 'listItem' );
			const listItemToMerge = new ModelElement( 'listItem', null, [
				new ModelText( 'xyz' )
			] );

			expect( schema.checkMerge( listItem, listItemToMerge ) ).toBe( true );
		} );

		it( 'return true if two elements between the position can be merged', () => {
			const listItem = new ModelElement( 'listItem', null, [
				new ModelText( 'foo' )
			] );
			const listItemToMerge = new ModelElement( 'listItem', null, [
				new ModelText( 'bar' )
			] );

			// eslint-disable-next-line no-new
			new ModelElement( '$root', null, [
				listItem, listItemToMerge
			] );
			const position = ModelPosition._createAfter( listItem );

			expect( schema.checkMerge( position ) ).toBe( true );
		} );

		it( 'return false if elements on the left is a block object', () => {
			const left = new ModelElement( 'blockObject' );
			const right = new ModelElement( 'paragraph' );

			expect( schema.checkMerge( left, right ) ).toBe( false );
		} );

		it( 'return false if elements on the right is a block object', () => {
			const left = new ModelElement( 'paragraph' );
			const right = new ModelElement( 'blockObject' );

			expect( schema.checkMerge( left, right ) ).toBe( false );
		} );

		it( 'return false if both elements are block objects', () => {
			const left = new ModelElement( 'blockObject' );
			const right = new ModelElement( 'blockObject' );

			expect( schema.checkMerge( left, right ) ).toBe( false );
		} );

		it( 'return false if both elements are inline objects', () => {
			const left = new ModelElement( 'inlineObject' );
			const right = new ModelElement( 'inlineObject' );

			expect( schema.checkMerge( left, right ) ).toBe( false );
		} );

		it( 'throws an error if there is no element before the position', () => {
			const listItem = new ModelElement( 'listItem', null, [
				new ModelText( 'foo' )
			] );

			// eslint-disable-next-line no-new
			new ModelElement( '$root', null, [
				listItem
			] );

			const position = ModelPosition._createBefore( listItem );

			expectToThrowCKEditorError( () => {
				expect( schema.checkMerge( position ) );
			}, 'schema-check-merge-no-element-before', schema );
		} );

		it( 'throws an error if the node before the position is not the element', () => {
			const listItem = new ModelElement( 'listItem', null, [
				new ModelText( 'foo' )
			] );

			// eslint-disable-next-line no-new
			new ModelElement( '$root', null, [
				new ModelText( 'bar' ),
				listItem
			] );

			const position = ModelPosition._createBefore( listItem );

			expectToThrowCKEditorError( () => {
				expect( schema.checkMerge( position ) );
			}, 'schema-check-merge-no-element-before', schema );
		} );

		it( 'throws an error if there is no element after the position', () => {
			const listItem = new ModelElement( 'listItem', null, [
				new ModelText( 'foo' )
			] );

			// eslint-disable-next-line no-new
			new ModelElement( '$root', null, [
				listItem
			] );

			const position = ModelPosition._createAfter( listItem );

			expectToThrowCKEditorError( () => {
				expect( schema.checkMerge( position ) );
			}, 'schema-check-merge-no-element-after', schema );
		} );

		it( 'throws an error if the node after the position is not the element', () => {
			const listItem = new ModelElement( 'listItem', null, [
				new ModelText( 'foo' )
			] );

			// eslint-disable-next-line no-new
			new ModelElement( '$root', null, [
				listItem,
				new ModelText( 'bar' )
			] );

			const position = ModelPosition._createBefore( listItem );

			expectToThrowCKEditorError( () => {
				expect( schema.checkMerge( position ) );
			}, 'schema-check-merge-no-element-before', schema );
		} );

		// This is an invalid case by definition – the baseElement should not contain disallowed elements
		// in the first place. However, the check is focused on the elementToMerge's children so let's make sure
		// that only them counts.
		it( 'returns true if element to merge contains a valid content but base element contains disallowed elements', () => {
			const listItem = new ModelElement( 'listItem', null, [
				new ModelText( 'foo' ),
				new ModelElement( 'paragraph', null, [
					new ModelText( 'bar' )
				] )
			] );
			const listItemToMerge = new ModelElement( 'listItem', null, [
				new ModelText( 'xyz' )
			] );

			expect( schema.checkMerge( listItem, listItemToMerge ) ).toBe( true );
		} );

		// The checkMerge() method should also check whether all ancestors of elementToMerge are allowed in their new
		// context (now, we check only immediate children), but for now we ignore these cases.
	} );

	describe( 'getLimitElement()', () => {
		let model, doc, root;

		beforeEach( () => {
			model = new Model();
			doc = model.document;
			schema = model.schema;
			root = doc.createRoot();

			schema.register( 'div', {
				inheritAllFrom: '$block'
			} );
			schema.register( 'article', {
				inheritAllFrom: '$block',
				allowIn: 'section'
			} );
			schema.register( 'section', {
				inheritAllFrom: '$block',
				allowIn: 'div'
			} );
			schema.register( 'paragraph', {
				inheritAllFrom: '$block',
				allowIn: 'article'
			} );
			schema.register( 'widget', {
				inheritAllFrom: '$block',
				allowIn: 'div'
			} );
			schema.register( 'imageBlock', {
				inheritAllFrom: '$block',
				allowIn: 'widget'
			} );
			schema.register( 'caption', {
				inheritAllFrom: '$block',
				allowIn: 'imageBlock'
			} );
		} );

		it( 'always returns $root element if any other limit was not defined', () => {
			schema.extend( '$root', {
				isLimit: false
			} );
			expect( schema.isLimit( '$root' ) ).toBe( false );

			_setModelData( model, '<div><section><article><paragraph>foo[]bar</paragraph></article></section></div>' );
			expect( schema.getLimitElement( doc.selection ) ).toBe( root );
		} );

		it( 'returns the limit element which is the closest element to common ancestor for collapsed selection', () => {
			schema.extend( 'article', { isLimit: true } );
			schema.extend( 'section', { isLimit: true } );

			_setModelData( model, '<div><section><article><paragraph>foo[]bar</paragraph></article></section></div>' );

			const article = root.getNodeByPath( [ 0, 0, 0 ] );

			expect( schema.getLimitElement( doc.selection ) ).toBe( article );
		} );

		it( 'returns the limit element which is the closest element to common ancestor for non-collapsed selection', () => {
			schema.extend( 'article', { isLimit: true } );
			schema.extend( 'section', { isLimit: true } );

			model.enqueueChange( { isUndoable: false }, () => {
				_setModelData( model, '<div><section><article>[foo</article><article>bar]</article></section></div>' );

				const section = root.getNodeByPath( [ 0, 0 ] );

				expect( schema.getLimitElement( doc.selection ) ).toBe( section );
			} );
		} );

		it( 'works fine with multi-range selections', () => {
			schema.extend( 'article', { isLimit: true } );
			schema.extend( 'widget', { isLimit: true } );
			schema.extend( 'div', { isLimit: true } );

			_setModelData(
				model,
				'<div>' +
				'<section>' +
				'<article>' +
				'<paragraph>[foo]</paragraph>' +
				'</article>' +
				'</section>' +
				'<widget>' +
				'<imageBlock>' +
				'<caption>b[a]r</caption>' +
				'</imageBlock>' +
				'</widget>' +
				'</div>'
			);

			const div = root.getNodeByPath( [ 0 ] );
			expect( schema.getLimitElement( doc.selection ) ).toBe( div );
		} );

		it( 'works fine with multi-range selections even if limit elements are not defined', () => {
			_setModelData(
				model,
				'<div>' +
				'<section>' +
				'<article>' +
				'<paragraph>[foo]</paragraph>' +
				'</article>' +
				'</section>' +
				'</div>' +
				'<section>b[]ar</section>'
			);

			expect( schema.getLimitElement( doc.selection ) ).toBe( root );
		} );

		it( 'works fine with multi-range selections if the first range has the root element as a limit element', () => {
			_setModelData(
				model,
				'<imageBlock>' +
				'<caption>[Foo</caption>' +
				'</imageBlock>' +
				'<article>' +
				'<paragraph>Paragraph in article]</paragraph>' +
				'</article>' +
				'<paragraph>Paragraph item 1</paragraph>' +
				'<paragraph>Paragraph [item 2]</paragraph>'
			);

			expect( schema.getLimitElement( doc.selection ) ).toBe( root );
		} );

		it( 'works fine with multi-range selections if the last range has the root element as a limit element', () => {
			_setModelData(
				model,
				'<paragraph>Paragraph item 1</paragraph>' +
				'<paragraph>Paragraph [item 2]</paragraph>' +
				'<imageBlock>' +
				'<caption>[Foo</caption>' +
				'</imageBlock>' +
				'<article>' +
				'<paragraph>Paragraph in article]</paragraph>' +
				'</article>'
			);

			expect( schema.getLimitElement( doc.selection ) ).toBe( root );
		} );

		it( 'accepts range as an argument', () => {
			schema.extend( 'article', { isLimit: true } );
			schema.extend( 'section', { isLimit: true } );

			const data = '<div><section><article><paragraph>foobar</paragraph></article></section></div>';
			const parsedModel = _parseModel( data, model.schema, { context: [ root.name ] } );

			model.change( writer => {
				writer.insert( parsedModel, root );
			} );

			const article = root.getNodeByPath( [ 0, 0, 0 ] );

			expect( schema.getLimitElement( new ModelRange( new ModelPosition( root, [ 0, 0, 0, 0, 2 ] ) ) ) ).toBe( article );
		} );

		it( 'accepts position as an argument', () => {
			schema.extend( 'article', { isLimit: true } );
			schema.extend( 'section', { isLimit: true } );

			const data = '<div><section><article><paragraph>foobar</paragraph></article></section></div>';
			const parsedModel = _parseModel( data, model.schema, { context: [ root.name ] } );

			model.change( writer => {
				writer.insert( parsedModel, root );
			} );

			const article = root.getNodeByPath( [ 0, 0, 0 ] );

			expect( schema.getLimitElement( new ModelPosition( root, [ 0, 0, 0, 0, 2 ] ) ) ).toBe( article );
		} );
	} );

	describe( 'checkAttributeInSelection()', () => {
		const attribute = 'bold';
		let model, doc, schema;

		beforeEach( () => {
			model = new Model();
			doc = model.document;
			doc.createRoot();

			schema = model.schema;

			schema.register( 'p', { inheritAllFrom: '$block' } );
			schema.register( 'h1', { inheritAllFrom: '$block' } );
			schema.register( 'img', { allowWhere: '$text' } );
			schema.register( 'figure', {
				allowIn: '$root',
				allowAttributes: [ 'name', 'title' ]
			} );
			schema.extend( '$text', {
				allowAttributes: [ 'italic' ]
			} );

			schema.addAttributeCheck( ( ctx, attributeName ) => {
				// Allow 'bold' on p>$text.
				if ( ctx.endsWith( 'p $text' ) && attributeName == 'bold' ) {
					return true;
				}

				// Allow 'bold' on $root>p.
				if ( ctx.endsWith( '$root p' ) && attributeName == 'bold' ) {
					return true;
				}

				// Disallow 'italic' on $text that has 'bold' already.
				if ( inTextWithBold( ctx ) && attributeName == 'italic' ) {
					return false;
				}

				function inTextWithBold( context ) {
					return context.endsWith( '$text' ) && context.last.getAttribute( 'bold' );
				}
			} );
		} );

		describe( 'when selection is collapsed', () => {
			it( 'should return true if characters with the attribute can be placed at caret position', () => {
				_setModelData( model, '<p>f[]oo</p>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).toBe( true );
			} );

			it( 'should return false if characters with the attribute cannot be placed at caret position', () => {
				_setModelData( model, '<h1>[]</h1>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).toBe( false );

				_setModelData( model, '[]' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).toBe( false );
			} );

			it( 'should check attributes of the selection (selection inside the $text[bold])', () => {
				_setModelData( model, '<p><$text bold="true">f[]oo</$text></p>' );

				expect( schema.checkAttributeInSelection( doc.selection, 'italic' ) ).toBe( false );

				model.change( writer => {
					writer.removeSelectionAttribute( 'bold' );
				} );

				expect( schema.checkAttributeInSelection( doc.selection, 'italic' ) ).toBe( true );
			} );

			it( 'should check attributes of the selection (attribute set manually on selection)', () => {
				_setModelData( model, '<p>foo[]bar</p>' );

				expect( schema.checkAttributeInSelection( doc.selection, 'italic' ) ).toBe( true );

				model.change( writer => {
					writer.setSelectionAttribute( 'bold', true );
				} );

				expect( schema.checkAttributeInSelection( doc.selection, 'italic' ) ).toBe( false );
			} );

			it( 'should pass all selection\'s attributes to checkAttribute()', () => {
				return new Promise( resolve => {
					schema.on( 'checkAttribute', ( evt, args ) => {
						const context = args[ 0 ];
						const attributeName = args[ 1 ];

						expect( attributeName ).toBe( 'italic' );
						expect( Array.from( context.last.getAttributeKeys() ) ).toEqual( [ 'bold', 'underline' ] );

						resolve();
					}, { priority: 'highest' } );

					_setModelData( model, '<p>foo[]bar</p>' );

					model.change( writer => {
						writer.setSelectionAttribute( 'bold', true );
						writer.setSelectionAttribute( 'underline', true );
					} );

					expect( schema.checkAttributeInSelection( doc.selection, 'italic' ) ).toBe( false );
				} );
			} );
		} );

		describe( 'when selection is not collapsed', () => {
			it( 'should return true if there is at least one node in selection that can have the attribute', () => {
				// Simple selection on a few characters.
				_setModelData( model, '<p>[foo]</p>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).toBe( true );

				// Selection spans over characters but also include nodes that can't have attribute.
				_setModelData( model, '<p>fo[o<img />b]ar</p>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).toBe( true );

				// Selection on whole root content. Characters in P can have an attribute so it's valid.
				_setModelData( model, '[<p>foo<img />bar</p><h1></h1>]' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).toBe( true );

				// Selection on empty P. P can have the attribute.
				_setModelData( model, '[<p></p>]' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).toBe( true );
			} );

			it( 'should return false if there are no nodes in selection that can have the attribute', () => {
				// Selection on DIV which can't have bold text.
				_setModelData( model, '[<h1></h1>]' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).toBe( false );

				// Selection on two images which can't be bold.
				_setModelData( model, '<p>foo[<img /><img />]bar</p>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).toBe( false );
			} );

			it( 'should return true when checking element with required attribute', () => {
				_setModelData( model, '[<figure name="figure"></figure>]' );
				expect( schema.checkAttributeInSelection( doc.selection, 'title' ) ).toBe( true );
			} );

			it( 'should return true when checking element when attribute is already present', () => {
				_setModelData( model, '[<figure name="figure" title="title"></figure>]' );
				expect( schema.checkAttributeInSelection( doc.selection, 'title' ) ).toBe( true );
			} );

			it( 'should check attributes of text', () => {
				_setModelData( model, '<p><$text bold="true">f[o]o</$text></p>' );
				expect( schema.checkAttributeInSelection( doc.selection, 'italic' ) ).toBe( false );
			} );
		} );
	} );

	describe( 'getValidRanges()', () => {
		let model, doc, root, schema;

		beforeEach( () => {
			model = new Model();
			doc = model.document;
			schema = model.schema;
			root = doc.createRoot();

			schema.register( 'p', { inheritAllFrom: '$block' } );
			schema.register( 'img', { allowWhere: '$text' } );

			// This is a "hack" to allow setting any ranges in `setData` util.
			schema.extend( '$text', { allowIn: '$root' } );
		} );

		function testValidRangesForAttribute( input, attribute, output, options ) {
			_setModelData( model, input );

			const validRanges = schema.getValidRanges( doc.selection.getRanges(), attribute, options );
			const sel = model.createSelection( validRanges );

			expect( _stringifyModel( root, sel ) ).toBe( output );
		}

		it( 'should return a range with p for an attribute allowed only on p', () => {
			schema.extend( 'p', { allowAttributes: 'foo' } );

			testValidRangesForAttribute(
				'[<p>foo<img></img>bar</p>]',
				'foo',
				'[<p>foo<img></img>bar</p>]'
			);
		} );

		it( 'should return ranges on text nodes for an attribute allowed only on text', () => {
			schema.extend( '$text', { allowAttributes: 'bold' } );

			testValidRangesForAttribute(
				'[<p>foo<img></img>bar</p>]',
				'bold',
				'<p>[foo]<img></img>[bar]</p>'
			);
		} );

		it( 'should return a range on img for an attribute allowed only on img', () => {
			schema.extend( 'img', { allowAttributes: 'src' } );

			testValidRangesForAttribute(
				'[<p>foo<img></img>bar</p>]',
				'src',
				'<p>foo[<img></img>]bar</p>'
			);
		} );

		it( 'should return a range containing all children for an attribute allowed on all children', () => {
			schema.extend( '$text', { allowAttributes: 'bold' } );
			schema.extend( 'img', { allowAttributes: 'bold' } );

			testValidRangesForAttribute(
				'[<p>foo<img></img>bar</p>]',
				'bold',
				'<p>[foo<img></img>bar]</p>'
			);
		} );

		it( 'should return a range with p and a range on all children for an attribute allowed on p and its children', () => {
			schema.extend( 'p', { allowAttributes: 'foo' } );
			schema.extend( '$text', { allowAttributes: 'foo' } );
			schema.extend( 'img', { allowAttributes: 'foo' } );

			_setModelData( model, '[<p>foo<img></img>bar</p>]' );

			const validRanges = Array.from( schema.getValidRanges( doc.selection.getRanges(), 'foo' ) );

			expect( validRanges.length ).toBe( 2 );

			expect( validRanges[ 0 ].start.path ).toEqual( [ 0, 0 ] );
			expect( validRanges[ 0 ].end.path ).toEqual( [ 0, 7 ] );

			expect( validRanges[ 1 ].start.path ).toEqual( [ 0 ] );
			expect( validRanges[ 1 ].end.path ).toEqual( [ 1 ] );
		} );

		it( 'should not break a range if children are not allowed to have the attribute', () => {
			schema.extend( 'p', { allowAttributes: 'foo' } );

			testValidRangesForAttribute(
				'[<p>foo</p><p>bar</p>]',
				'foo',
				'[<p>foo</p><p>bar</p>]'
			);
		} );

		it( 'should search deeply', () => {
			schema.extend( '$text', { allowAttributes: 'bold', allowIn: 'img' } );

			testValidRangesForAttribute(
				'[<p>foo<img>xxx</img>bar</p>]',
				'bold',
				'<p>[foo]<img>[xxx]</img>[bar]</p>'
			);
		} );

		it( 'should work with multiple ranges', () => {
			schema.extend( '$text', { allowAttributes: 'bold' } );

			testValidRangesForAttribute(
				'[<p>a</p><p>b</p>]<p>c</p><p>[d]</p>',
				'bold',
				'<p>[a]</p><p>[b]</p><p>c</p><p>[d]</p>'
			);
		} );

		it( 'should work with non-flat ranges', () => {
			schema.extend( '$text', { allowAttributes: 'bold' } );

			testValidRangesForAttribute(
				'[<p>a</p><p>b</p><p>c]</p><p>d</p>',
				'bold',
				'<p>[a]</p><p>[b]</p><p>[c]</p><p>d</p>'
			);
		} );

		it( 'should not leak beyond the given ranges', () => {
			schema.extend( '$text', { allowAttributes: 'bold' } );

			testValidRangesForAttribute(
				'[<p>foo</p><p>b]a[r</p><p>x]yz</p>',
				'bold',
				'<p>[foo]</p><p>[b]a[r]</p><p>[x]yz</p>'
			);
		} );

		it( 'should correctly handle a range which ends in a disallowed position', () => {
			schema.extend( '$text', { allowAttributes: 'bold', allowIn: 'img' } );

			// Disallow bold on text inside image.
			schema.addAttributeCheck( ( ctx, attributeName ) => {
				if ( ctx.endsWith( 'img $text' ) && attributeName == 'bold' ) {
					return false;
				}
			} );

			testValidRangesForAttribute(
				'[<p>foo<img>xx]x</img>bar</p>',
				'bold',
				'<p>[foo]<img>xxx</img>bar</p>'
			);
		} );

		it( 'should not include empty elements when includeEmptyRanges is not set', () => {
			schema.extend( '$text', { allowAttributes: 'foo' } );

			testValidRangesForAttribute(
				'[<p>foo</p><p></p><p>bar</p>]',
				'foo',
				'<p>[foo]</p><p></p><p>[bar]</p>'
			);
		} );

		it( 'should include empty elements when includeEmptyRanges is true', () => {
			schema.extend( '$text', { allowAttributes: 'foo' } );

			testValidRangesForAttribute(
				'[<p>foo</p><p></p><p>bar</p>]',
				'foo',
				'<p>[foo]</p><p>[]</p><p>[bar]</p>',
				{ includeEmptyRanges: true }
			);
		} );

		it( 'should not include empty inline elements when includeEmptyRanges is true', () => {
			schema.extend( '$text', { allowAttributes: 'foo' } );

			// Paragraph with text, empty img, text. img is inline object (not block).
			testValidRangesForAttribute(
				'[<p>foo<img></img>bar</p>]',
				'foo',
				'<p>[foo]<img></img>[bar]</p>',
				{ includeEmptyRanges: true }
			);
		} );
	} );

	describe( 'getNearestSelectionRange()', () => {
		let selection, model, doc;

		beforeEach( () => {
			model = new Model();
			doc = model.document;
			schema = model.schema;
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			model.schema.register( 'emptyBlock', { allowIn: '$root' } );

			model.schema.register( 'widget', {
				allowIn: '$root',
				isObject: true
			} );

			// Similar to the <caption> case.
			model.schema.register( 'blockWidget', {
				allowIn: '$root',
				allowContentOf: '$block',
				isObject: true
			} );

			// Similar to the <tableCell> case.
			model.schema.register( 'blockContainerWidget', {
				allowIn: '$root',
				allowContentOf: '$root',
				isObject: true
			} );

			doc.createRoot();
			selection = doc.selection;
		} );

		test(
			'should return collapsed range if text node can be placed at that position - both',
			'<paragraph>[]</paragraph>',
			'both',
			'<paragraph>[]</paragraph>'
		);

		test(
			'should return collapsed range if text node can be placed at that position - forward',
			'<paragraph>[]</paragraph>',
			'forward',
			'<paragraph>[]</paragraph>'
		);

		test(
			'should return collapsed range if text node can be placed at that position - backward',
			'<paragraph>[]</paragraph>',
			'backward',
			'<paragraph>[]</paragraph>'
		);

		test( 'should return null in empty document - both', '', 'both', null );

		test( 'should return null in empty document - backward', '', 'backward', null );

		test( 'should return null in empty document - forward', '', 'forward', null );

		test(
			'should find range before when searching both ways',
			'<paragraph></paragraph>[]<paragraph></paragraph>',
			'both',
			'<paragraph>[]</paragraph><paragraph></paragraph>'
		);

		test(
			'should find range before when searching backward',
			'<paragraph></paragraph>[]<paragraph></paragraph>',
			'backward',
			'<paragraph>[]</paragraph><paragraph></paragraph>'
		);

		test(
			'should find range after when searching forward',
			'<paragraph></paragraph>[]<paragraph></paragraph>',
			'forward',
			'<paragraph></paragraph><paragraph>[]</paragraph>'
		);

		test(
			'should find range after when searching both ways when it is closer',
			'<paragraph></paragraph><emptyBlock></emptyBlock>[]<paragraph></paragraph>',
			'both',
			'<paragraph></paragraph><emptyBlock></emptyBlock><paragraph>[]</paragraph>'
		);

		test(
			'should find range before when searching both ways when it is closer',
			'<paragraph></paragraph><emptyBlock></emptyBlock>[]<emptyBlock></emptyBlock><emptyBlock></emptyBlock><paragraph></paragraph>',
			'both',
			'<paragraph>[]</paragraph><emptyBlock></emptyBlock><emptyBlock></emptyBlock><emptyBlock></emptyBlock><paragraph></paragraph>'
		);

		test(
			'should return null if there is no valid range',
			'[]<emptyBlock></emptyBlock>',
			'both',
			null
		);

		test(
			'should return null if there is no valid range in given direction - backward',
			'[]<paragraph></paragraph>',
			'backward',
			null
		);

		test(
			'should return null if there is no valid range in given direction - forward',
			'<paragraph></paragraph>[]',
			'forward',
			null
		);

		test(
			'should move forward when placed at root start',
			'[]<paragraph></paragraph><paragraph></paragraph>',
			'both',
			'<paragraph>[]</paragraph><paragraph></paragraph>'
		);

		test(
			'should move backward when placed at root end',
			'<paragraph></paragraph><paragraph></paragraph>[]',
			'both',
			'<paragraph></paragraph><paragraph>[]</paragraph>'
		);

		it( 'should return null for a position in graveyard even if there is a paragraph there', () => {
			model.enqueueChange( { isUndoable: false }, writer => {
				writer.insertElement( 'paragraph', model.document.graveyard, 0 );
			} );

			const range = schema.getNearestSelectionRange( model.createPositionFromPath( model.document.graveyard, [ 0 ] ) );

			expect( range ).toBeNull();
		} );

		describe( 'in case of objects which do not allow text inside', () => {
			test(
				'should select nearest object (o[]o) - both',
				'<widget></widget>[]<widget></widget>',
				'both',
				'[<widget></widget>]<widget></widget>'
			);

			test(
				'should select nearest object (o[]o) - forward',
				'<widget></widget>[]<widget></widget>',
				'forward',
				'<widget></widget>[<widget></widget>]'
			);

			test(
				'should select nearest object (o[]o) - backward',
				'<widget></widget>[]<widget></widget>',
				'both',
				'[<widget></widget>]<widget></widget>'
			);

			test(
				'should select nearest object (p[]o) - forward',
				'<paragraph></paragraph>[]<widget></widget>',
				'forward',
				'<paragraph></paragraph>[<widget></widget>]'
			);

			test(
				'should select nearest object (o[]p) - both',
				'<widget></widget>[]<paragraph></paragraph>',
				'both',
				'[<widget></widget>]<paragraph></paragraph>'
			);

			test(
				'should select nearest object (o[]p) - backward',
				'<widget></widget>[]<paragraph></paragraph>',
				'backward',
				'[<widget></widget>]<paragraph></paragraph>'
			);

			test(
				'should select nearest object ([]o) - both',
				'[]<widget></widget><paragraph></paragraph>',
				'both',
				'[<widget></widget>]<paragraph></paragraph>'
			);

			test(
				'should select nearest object ([]o) - forward',
				'[]<widget></widget><paragraph></paragraph>',
				'forward',
				'[<widget></widget>]<paragraph></paragraph>'
			);

			test(
				'should select nearest object (o[]) - both',
				'<paragraph></paragraph><widget></widget>[]',
				'both',
				'<paragraph></paragraph>[<widget></widget>]'
			);

			test(
				'should select nearest object (o[]) - backward',
				'<paragraph></paragraph><widget></widget>[]',
				'both',
				'<paragraph></paragraph>[<widget></widget>]'
			);
		} );

		describe( 'in case of objects which allow text inside', () => {
			test(
				'should select nearest object which allows text (o[]o) - both',
				'<blockWidget></blockWidget>[]<blockWidget></blockWidget>',
				'both',
				'[<blockWidget></blockWidget>]<blockWidget></blockWidget>'
			);

			test(
				'should select nearest object (o[]p) - both',
				'<blockWidget></blockWidget>[]<paragraph></paragraph>',
				'both',
				'[<blockWidget></blockWidget>]<paragraph></paragraph>'
			);

			test(
				'should select nearest object which allows text ([]o) - both',
				'[]<blockWidget></blockWidget><paragraph></paragraph>',
				'both',
				'[<blockWidget></blockWidget>]<paragraph></paragraph>'
			);
		} );

		describe( 'in case of other types of objects', () => {
			test(
				'should return null when cannot leave a limit element',
				'<blockContainerWidget>[]</blockContainerWidget>',
				'both',
				null
			);

			test(
				'should return null when cannot leave a limit element (surrounded with paragraphs)',
				'<paragraph>x</paragraph><blockContainerWidget>[]</blockContainerWidget><paragraph>x</paragraph>',
				'both',
				null
			);

			test(
				'should return null when cannot leave a limit element (surrounded by other widgets)',

				'<blockContainerWidget><paragraph>x</paragraph></blockContainerWidget>' +
				'<blockContainerWidget>[]</blockContainerWidget>' +
				'<blockContainerWidget><paragraph>x</paragraph></blockContainerWidget>',

				'both',

				null
			);

			test(
				'should keep scanning even though encountering a limit in one direction (left)',
				'<paragraph>x</paragraph><blockContainerWidget>[]<paragraph>x</paragraph></blockContainerWidget><paragraph>x</paragraph>',
				'both',
				'<paragraph>x</paragraph><blockContainerWidget><paragraph>[]x</paragraph></blockContainerWidget><paragraph>x</paragraph>'
			);

			test(
				'should keep scanning even though encountering a limit in one direction (right)',
				'<paragraph>x</paragraph><blockContainerWidget><paragraph>x</paragraph>[]</blockContainerWidget><paragraph>x</paragraph>',
				'both',
				'<paragraph>x</paragraph><blockContainerWidget><paragraph>x[]</paragraph></blockContainerWidget><paragraph>x</paragraph>'
			);
		} );

		function test( testName, data, direction, expected ) {
			it( testName, () => {
				let range;

				model.enqueueChange( { isUndoable: false }, () => {
					_setModelData( model, data );
					range = schema.getNearestSelectionRange( selection.anchor, direction );
				} );

				if ( expected === null ) {
					expect( range ).toBeNull();
				} else {
					model.change( writer => {
						writer.setSelection( range );
					} );
					expect( _getModelData( model ) ).toBe( expected );
				}
			} );
		}
	} );

	describe( 'findAllowedParent()', () => {
		beforeEach( () => {
			schema.register( '$root' );
			schema.register( 'blockQuote', {
				allowIn: '$root'
			} );
			schema.register( 'paragraph', {
				allowIn: 'blockQuote'
			} );
			schema.register( '$text', {
				allowIn: 'paragraph'
			} );
		} );

		it( 'should return position ancestor that allows to insert given node to it', () => {
			const node = new ModelElement( 'paragraph' );

			const allowedParent = schema.findAllowedParent( ModelPosition._createAt( r1bQp, 0 ), node );

			expect( allowedParent ).toBe( r1bQ );
		} );

		it( 'should return position ancestor that allows to insert given node to it - works with a string too', () => {
			const allowedParent = schema.findAllowedParent( ModelPosition._createAt( r1bQp, 0 ), 'paragraph' );

			expect( allowedParent ).toBe( r1bQ );
		} );

		it( 'should return position ancestor that allows to insert given node to it when position is already i such an element', () => {
			const node = new ModelText( 'text' );

			const parent = schema.findAllowedParent( ModelPosition._createAt( r1bQp, 0 ), node );

			expect( parent ).toBe( r1bQp );
		} );

		it( 'should return null when limit element is reached before allowed parent', () => {
			schema.extend( 'blockQuote', {
				isLimit: true
			} );
			schema.register( 'div', {
				allowIn: '$root'
			} );
			const node = new ModelElement( 'div' );

			const parent = schema.findAllowedParent( ModelPosition._createAt( r1bQp, 0 ), node );

			expect( parent ).toBeNull();
		} );

		it( 'should return null when object element is reached before allowed parent', () => {
			schema.extend( 'blockQuote', {
				isObject: true
			} );
			schema.register( 'div', {
				allowIn: '$root'
			} );
			const node = new ModelElement( 'div' );

			const parent = schema.findAllowedParent( ModelPosition._createAt( r1bQp, 0 ), node );

			expect( parent ).toBeNull();
		} );

		it( 'should return null when there is no allowed ancestor for given position', () => {
			const node = new ModelElement( 'section' );

			const parent = schema.findAllowedParent( ModelPosition._createAt( r1bQp, 0 ), node );

			expect( parent ).toBeNull();
		} );

		it( 'should return null when there is no allowed ancestor for given position – works with a string too', () => {
			const parent = schema.findAllowedParent( ModelPosition._createAt( r1bQp, 0 ), 'section' );

			expect( parent ).toBeNull();
		} );
	} );

	describe( 'removeDisallowedAttributes()', () => {
		let model, doc, root;

		beforeEach( () => {
			model = new Model();
			doc = model.document;
			root = doc.createRoot();
			schema = model.schema;

			schema.register( 'paragraph', {
				inheritAllFrom: '$block'
			} );
			schema.register( 'div', {
				inheritAllFrom: '$block'
			} );
			schema.register( 'imageBlock', {
				isObject: true
			} );
			schema.extend( '$block', {
				allowIn: 'div'
			} );
		} );

		it( 'should filter out disallowed attributes from given nodes', () => {
			schema.extend( '$text', { allowAttributes: 'a' } );
			schema.extend( 'imageBlock', { allowAttributes: 'b' } );

			const text = new ModelText( 'foo', { a: 1, b: 1 } );
			const image = new ModelElement( 'imageBlock', { a: 1, b: 1 } );

			root._appendChild( [ text, image ] );

			model.change( writer => {
				schema.removeDisallowedAttributes( root.getChildren(), writer );

				expect( Array.from( text.getAttributeKeys() ) ).toEqual( [ 'a' ] );
				expect( Array.from( image.getAttributeKeys() ) ).toEqual( [ 'b' ] );

				expect( writer.batch.operations ).toHaveLength( 2 );
				expect( writer.batch.operations[ 0 ] ).toBeInstanceOf( AttributeOperation );
				expect( writer.batch.operations[ 1 ] ).toBeInstanceOf( AttributeOperation );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<$text a="1">foo</$text><imageBlock b="1"></imageBlock>' );
			} );
		} );

		it( 'should filter out disallowed attributes from empty element', () => {
			schema.extend( 'div', { allowAttributes: 'a' } );

			const div = new ModelElement( 'div', { a: 1, b: 1 } );

			root._appendChild( [ div ] );

			model.change( writer => {
				schema.removeDisallowedAttributes( [ div ], writer );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<div a="1"></div>' );
			} );
		} );

		it( 'should filter out disallowed attributes from all descendants of given nodes', () => {
			schema.addAttributeCheck( ( ctx, attributeName ) => {
				// Allow 'a' on div>$text.
				if ( ctx.endsWith( 'div $text' ) && attributeName == 'a' ) {
					return true;
				}

				// Allow 'b' on div>paragraph>$text.
				if ( ctx.endsWith( 'div paragraph $text' ) && attributeName == 'b' ) {
					return true;
				}

				// Allow 'a' on div>image.
				if ( ctx.endsWith( 'div imageBlock' ) && attributeName == 'a' ) {
					return true;
				}

				// Allow 'b' on div>paragraph>imageBlock.
				if ( ctx.endsWith( 'div paragraph imageBlock' ) && attributeName == 'b' ) {
					return true;
				}

				// Allow 'a' on div>paragraph.
				if ( ctx.endsWith( 'div paragraph' ) && attributeName == 'a' ) {
					return true;
				}
			} );

			const foo = new ModelText( 'foo', { a: 1, b: 1 } );
			const bar = new ModelText( 'bar', { a: 1, b: 1 } );
			const imageInDiv = new ModelElement( 'imageBlock', { a: 1, b: 1 } );
			const imageInParagraph = new ModelElement( 'imageBlock', { a: 1, b: 1 } );
			const paragraph = new ModelElement( 'paragraph', { a: 1, b: 1 }, [ foo, imageInParagraph ] );
			const div = new ModelElement( 'div', [], [ paragraph, bar, imageInDiv ] );

			root._appendChild( [ div ] );

			model.change( writer => {
				schema.removeDisallowedAttributes( root.getChildren(), writer );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe(
						'<div>' +
							'<paragraph a="1">' +
								'<$text b="1">foo</$text>' +
								'<imageBlock b="1"></imageBlock>' +
							'</paragraph>' +
							'<$text a="1">bar</$text>' +
							'<imageBlock a="1"></imageBlock>' +
						'</div>'
					);
			} );
		} );

		it( 'should filter out disallowed attributes from parent node and all descendants nodes', () => {
			schema.extend( 'div', { allowAttributes: 'a' } );
			schema.extend( '$text', { allowAttributes: 'b' } );

			const foo = new ModelText( 'foo', { a: 1, b: 1 } );
			const div = new ModelElement( 'div', { a: 1, b: 1 }, [ foo ] );

			root._appendChild( [ div ] );

			model.change( writer => {
				schema.removeDisallowedAttributes( root.getChildren(), writer );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<div a="1"><$text b="1">foo</$text></div>' );
			} );
		} );

		it( 'should filter out all attributes from nodes that are merged while clearing', () => {
			const a = new ModelText( 'a', { a: 1, b: 1 } );
			const b = new ModelText( 'b', { b: 1 } );
			const c = new ModelText( 'c', { a: 1, b: 1 } );
			const div = new ModelElement( 'div', [], [ a, b, c ] );

			root._appendChild( [ div ] );

			model.change( writer => {
				schema.removeDisallowedAttributes( [ div ], writer );

				expect( _getModelData( model, { withoutSelection: true } ) ).toBe( '<div>abc</div>' );
			} );
		} );

		it( 'should do not filter out sibling nodes', () => {
			const foo = new ModelText( 'foo', { a: 1 } );
			const bar = new ModelText( 'bar', { a: 1, b: 1 } );
			const biz = new ModelText( 'biz', { a: 1 } );
			const div = new ModelElement( 'div', [], [ foo, bar, biz ] );

			root._appendChild( [ div ] );

			model.change( writer => {
				schema.removeDisallowedAttributes( [ bar ], writer );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<div><$text a="1">foo</$text>bar<$text a="1">biz</$text></div>' );
			} );
		} );

		// Related to https://github.com/ckeditor/ckeditor5/issues/15246.
		it( 'should filter out only non-allowed root attributes', () => {
			schema.extend( '$root', { allowAttributes: 'allowed' } );

			model.change( writer => {
				writer.setAttribute( 'allowed', 'value', root );
				writer.setAttribute( 'other', true, root );

				schema.removeDisallowedAttributes( [ root ], writer );
			} );

			expect( root.getAttribute( 'allowed' ) ).toBe( 'value' );
			expect( root.getAttribute( 'other' ) ).toBeUndefined();
		} );
	} );

	describe( 'getAttributesWithProperty()', () => {
		let model, doc, root;

		beforeEach( () => {
			model = new Model();
			doc = model.document;
			root = doc.createRoot();
			schema = model.schema;

			schema.register( 'paragraph', {
				inheritAllFrom: '$block'
			} );
		} );

		it( 'should get an attribute with given property', () => {
			schema.extend( '$text', { allowAttributes: 'a' } );

			schema.setAttributeProperties( 'a', {
				isFooable: true
			} );

			const text = new ModelText( 'foo', { a: 1 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isFooable' );

			expect( attributesWithProperty ).toEqual( { a: 1 } );
		} );

		it( 'should get attributes with given property', () => {
			schema.extend( '$text', { allowAttributes: [ 'a', 'b' ] } );

			schema.setAttributeProperties( 'a', {
				isFooable: true
			} );

			schema.setAttributeProperties( 'b', {
				isFooable: true
			} );

			const text = new ModelText( 'foo', { a: 1, b: 2 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isFooable' );

			expect( attributesWithProperty ).toEqual( { a: 1, b: 2 } );
		} );

		it( 'should get an attribute with given property that matches desired value', () => {
			schema.extend( '$text', { allowAttributes: [ 'a' ] } );

			schema.setAttributeProperties( 'a', {
				isFooable: 'yes'
			} );

			const text = new ModelText( 'foo', { a: 1 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isFooable', 'yes' );

			expect( attributesWithProperty ).toEqual( { a: 1 } );
		} );

		it( 'should get attributes with given property that match desired value', () => {
			schema.extend( '$text', { allowAttributes: [ 'a', 'b' ] } );

			schema.setAttributeProperties( 'a', {
				isFooable: 'yes'
			} );

			schema.setAttributeProperties( 'b', {
				isFooable: 'yes'
			} );

			const text = new ModelText( 'foo', { a: 1, b: 2 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isFooable', 'yes' );

			expect( attributesWithProperty ).toEqual( { a: 1, b: 2 } );
		} );

		it( 'should not return an attribute if it has properties but not the one being lookied for', () => {
			schema.extend( '$text', { allowAttributes: [ 'a' ] } );

			schema.setAttributeProperties( 'a', {
				isFooable: true
			} );

			const text = new ModelText( 'foo', { a: 1 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isBarable' );

			expect( attributesWithProperty ).toEqual( {} );
		} );

		it( 'should not return an attribute if it does not have given property', () => {
			schema.extend( '$text', { allowAttributes: [ 'a' ] } );

			const text = new ModelText( 'foo', { a: 1 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isFooable' );

			expect( attributesWithProperty ).toEqual( {} );
		} );

		it( 'should not return an attribute if value does not match', () => {
			schema.extend( '$text', { allowAttributes: [ 'a' ] } );

			schema.setAttributeProperties( 'a', {
				isFooable: 'no'
			} );

			const text = new ModelText( 'foo', { a: 1 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isFooable', 'yes' );

			expect( attributesWithProperty ).toEqual( {} );
		} );

		it( 'should return only an attribute that matches value', () => {
			schema.extend( '$text', { allowAttributes: [ 'a', 'b' ] } );

			schema.setAttributeProperties( 'a', {
				isFooable: 'no'
			} );

			schema.setAttributeProperties( 'b', {
				isFooable: 'yes'
			} );

			const text = new ModelText( 'foo', { a: 1, b: 2 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isFooable', 'yes' );

			expect( attributesWithProperty ).toEqual( { b: 2 } );
		} );
	} );

	describe( 'definitions compilation', () => {
		describe( 'allowIn cases', () => {
			it( 'passes $root>paragraph', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( true );
			} );

			it( 'passes $root>paragraph and $root2>paragraph – support for array values', () => {
				schema.register( '$root' );
				schema.register( '$root2' );
				schema.register( 'paragraph', {
					allowIn: [ '$root', '$root2' ]
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( true );
				expect( schema.checkChild( root2, r1p1 ) ).toBe( true );
			} );

			it( 'passes $root>paragraph[align] – attributes does not matter', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( root1, r1p2 ) ).toBe( true );
			} );

			it( 'passes $root>div>div – in case of circular refs', () => {
				schema.register( '$root' );
				schema.register( 'div', {
					allowIn: [ '$root', 'div' ]
				} );

				const div = new ModelElement( 'div' );
				root1._appendChild( div );

				const div2 = new ModelElement( 'div' );

				expect( schema.checkChild( div, div2 ) ).toBe( true );
			} );

			it( 'passes $root>div>div – in case of circular refs, when div1==div2', () => {
				schema.register( '$root' );
				schema.register( 'div', {
					allowIn: [ '$root', 'div' ]
				} );

				const div = new ModelElement( 'div' );
				root1._appendChild( div );

				expect( schema.checkChild( div, div ) ).toBe( true );
			} );

			it( 'rejects $root>paragraph – non-registered paragraph', () => {
				schema.register( '$root' );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( false );
			} );

			it( 'rejects $root>paragraph – registered different item', () => {
				schema.register( '$root' );
				schema.register( 'paragraph' );
				schema.register( 'listItem', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( false );
			} );

			it( 'rejects $root>paragraph – paragraph allowed in different context', () => {
				schema.register( '$root' );
				schema.register( '$fancyRoot' );
				schema.register( 'paragraph', {
					allowIn: '$fancyRoot'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( false );
			} );

			it( 'rejects $root>blockQuote>paragraph – since paragraph is only allowed in $root', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( r1bQ, r1bQp ) ).toBe( false );
			} );

			it( 'rejects $root>blockQuote>paragraph – since paragraph is only allowed in $root v2', () => {
				schema.register( '$root' );
				schema.register( 'blockQuote', {
					allowIn: '$root'
				} );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( r1bQ, r1bQp ) ).toBe( false );
			} );

			it( 'rejects $root>blockQuote>paragraph>$text - since paragraph is not allowed in blockQuote', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );
				schema.register( '$text', {
					allowIn: 'paragraph'
				} );

				expect( schema.checkChild( root1, r1bQp.getChild( 0 ) ) ).toBe( false );
			} );

			it( 'rejects $root>blockQuote>paragraph>$text - since blockQuote is not allowed in $root', () => {
				schema.register( '$root' );
				schema.register( 'blockQuote' );
				schema.register( 'paragraph', {
					allowIn: [ 'blockQuote', '$root' ]
				} );
				schema.register( '$text', {
					allowIn: 'paragraph'
				} );

				expect( schema.checkChild( root1, r1bQp.getChild( 0 ) ) ).toBe( false );
			} );
		} );

		describe( 'allowWhere cases', () => {
			it( 'passes $root>paragraph – paragraph inherits from $block', () => {
				schema.register( '$root' );
				schema.register( '$block', {
					allowIn: '$root'
				} );
				schema.register( 'paragraph', {
					allowWhere: '$block'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( true );
			} );

			it( 'supports the array syntax', () => {
				schema.register( '$root' );
				schema.register( '$root2' );
				schema.register( '$block', {
					allowIn: '$root'
				} );
				schema.register( '$block2', {
					allowIn: '$root2'
				} );
				schema.register( 'paragraph', {
					allowWhere: [ '$block', '$block2' ]
				} );

				expect( schema.checkChild( root1, r1p1 ), '$root' ).toBe( true );
				expect( schema.checkChild( root2, r1p1 ), '$root2' ).toBe( true );
			} );

			// This checks if some inapropriate caching or preprocessing isn't applied by register().
			it( 'passes $root>paragraph – paragraph inherits from $block, order of definitions does not matter', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowWhere: '$block'
				} );
				schema.register( '$block', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( true );
			} );

			it( 'passes $root>paragraph – paragraph inherits from $specialBlock which inherits from $block', () => {
				schema.register( '$root' );
				schema.register( '$block', {
					allowIn: '$root'
				} );
				schema.register( '$specialBlock', {
					allowWhere: '$block'
				} );
				schema.register( 'paragraph', {
					allowWhere: '$specialBlock'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( true );
			} );

			it( 'rejects $root>paragraph – paragraph inherits from $block but $block is not allowed in $root', () => {
				schema.register( '$root' );
				schema.register( '$block' );
				schema.register( 'paragraph', {
					allowWhere: '$block'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( false );
			} );

			it( 'rejects $root>paragraph>$text – paragraph inherits from $block but $block is not allowed in $root', () => {
				schema.register( '$root' );
				schema.register( '$block' );
				schema.register( 'paragraph', {
					allowWhere: '$block'
				} );
				schema.register( '$text', {
					allowIn: 'paragraph'
				} );

				expect( schema.checkChild( root1, r1p1.getChild( 0 ) ) ).toBe( false );
			} );
		} );

		describe( 'allowContentOf cases', () => {
			it( 'passes $root2>paragraph – $root2 inherits from $root', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );
				schema.register( '$root2', {
					allowContentOf: '$root'
				} );

				expect( schema.checkChild( root2, r1p1 ) ).toBe( true );
			} );

			it( 'supports the array syntax', () => {
				schema.register( '$root' );
				schema.register( '$root2' );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );
				schema.register( 'heading1', {
					allowIn: '$root2'
				} );
				schema.register( '$root3', {
					allowContentOf: [ '$root', '$root2' ]
				} );

				const root3 = new ModelElement( '$root3' );
				const heading1 = new ModelElement( 'heading1' );

				expect( schema.checkChild( root3, r1p1 ), 'paragraph' ).toBe( true );
				expect( schema.checkChild( root3, heading1 ), 'heading1' ).toBe( true );
			} );

			it( 'passes $root2>paragraph – $root2 inherits from $root, order of definitions does not matter', () => {
				schema.register( '$root' );
				schema.register( '$root2', {
					allowContentOf: '$root'
				} );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( root2, r1p1 ) ).toBe( true );
			} );

			it( 'passes $root>paragraph>$text – paragraph inherits content of $block', () => {
				schema.register( '$root' );
				schema.register( '$block' );
				schema.register( 'paragraph', {
					allowIn: '$root',
					allowContentOf: '$block'
				} );
				schema.register( '$text', {
					allowIn: '$block'
				} );

				expect( schema.checkChild( r1p1, r1p1.getChild( 0 ) ) ).toBe( true );
			} );

			it( 'passes $root>blockQuote>paragraph – blockQuote inherits content of $root', () => {
				schema.register( '$root' );
				schema.register( 'blockQuote', {
					allowIn: '$root',
					allowContentOf: '$root'
				} );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( r1bQ, r1bQp ) ).toBe( true );
			} );

			it( 'rejects $root2>paragraph – $root2 inherits from $root, but paragraph is not allowed there anyway', () => {
				schema.register( '$root' );
				schema.register( 'paragraph' );
				schema.register( '$root2', {
					allowContentOf: '$root'
				} );

				expect( schema.checkChild( root2, r1p1 ) ).toBe( false );
			} );
		} );

		describe( 'mix of allowContentOf and allowWhere', () => {
			it( 'passes $root>paragraph>$text – paragraph inherits all from $block', () => {
				schema.register( '$root' );
				schema.register( '$block', {
					allowIn: '$root'
				} );
				schema.register( 'paragraph', {
					allowContentOf: '$block',
					allowWhere: '$block'
				} );
				schema.register( '$text', {
					allowIn: '$block'
				} );

				expect( schema.checkChild( r1p1, r1p1.getChild( 0 ) ) ).toBe( true );
			} );

			it( 'passes $root>paragraph and $root2>paragraph – where $root2 inherits content of $root ' +
			'and paragraph inherits allowWhere from $block', () => {
				schema.register( '$root' );
				schema.register( '$root2', {
					allowContentOf: '$root'
				} );
				schema.register( '$block', {
					allowIn: '$root'
				} );
				schema.register( 'paragraph', {
					allowWhere: '$block'
				} );

				expect( schema.checkChild( root1, 'paragraph' ), 'root1' ).toBe( true );
				expect( schema.checkChild( root2, 'paragraph' ), 'root2' ).toBe( true );
			} );

			it( 'passes d>a where d inherits content of c which inherits content of b', () => {
				schema.register( 'b' );
				schema.register( 'a', { allowIn: 'b' } );
				schema.register( 'c', { allowContentOf: 'b' } );
				schema.register( 'd', { allowContentOf: 'c' } );

				const d = new ModelElement( 'd' );

				expect( schema.checkChild( d, 'a' ) ).toBe( true );
			} );

			// This case won't pass becuase we compile the definitions in a pretty naive way.
			// To make chains like this work we'd need to repeat compilation of allowContentOf definitions
			// as long as the previous iteration found something to compile.
			// This way, even though we'd not compile d<-c in the first run, we'd still find b<-c
			// and since we've found something, we'd now try d<-c which would work.
			//
			// We ignore those situations for now as they are very unlikely to happen and would
			// significantly raised the complexity of definition compilation.
			//
			// it( 'passes d>a where d inherits content of c which inherits content of b', () => {
			// 	schema.register( 'b' );
			// 	schema.register( 'a', { allowIn: 'b' } );
			// 	schema.register( 'd', { allowContentOf: 'c' } );
			// 	schema.register( 'c', { allowContentOf: 'b' } );
			//
			// 	const d = new Element( 'd' );
			//
			// 	expect( schema.checkChild( d, 'a' ) ).toBe(true);
			// } );
		} );

		describe( 'allowChildren', () => {
			it( 'allows item in another item', () => {
				schema.register( 'paragraph' );

				schema.register( '$root', {
					allowChildren: 'paragraph'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( true );
			} );

			it( 'supports the array syntax', () => {
				schema.register( 'paragraph' );
				schema.register( 'blockQuote' );

				schema.register( '$root', {
					allowChildren: [ 'paragraph', 'blockQuote' ]
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( true );
				expect( schema.checkChild( root1, r1bQ ) ).toBe( true );
			} );

			it( 'supports circular references', () => {
				schema.register( '$root', {
					allowChildren: [ 'paragraph', 'blockQuote' ]
				} );

				schema.register( 'paragraph', {
					allowChildren: 'blockQuote'
				} );

				schema.register( 'blockQuote', {
					allowChildren: 'paragraph'
				} );

				expect( schema.checkChild( r1p1, r1bQ ) ).toBe( true );
				expect( schema.checkChild( r1bQ, r1p1 ) ).toBe( true );
			} );

			it( 'supports self-reference', () => {
				schema.register( '$root', {
					allowChildren: 'paragraph'
				} );

				schema.register( 'paragraph', {
					allowChildren: 'paragraph'
				} );

				expect( schema.checkChild( r1p1, r1p1 ) ).toBe( true );
			} );

			it( 'passes $root>$paragraph>div>blockQuote - deep nesting', () => {
				schema.register( '$root', {
					allowChildren: 'paragraph'
				} );

				schema.register( 'paragraph', {
					allowChildren: 'div'
				} );

				schema.register( 'div', {
					allowChildren: 'blockQuote'
				} );

				schema.register( 'blockQuote' );

				const paragraph = new ModelElement( 'paragraph' );
				root1._appendChild( paragraph );

				const div = new ModelElement( 'div' );
				paragraph._appendChild( div );

				const blockQuote = new ModelElement( 'blockQuote' );
				div._appendChild( blockQuote );

				expect( schema.checkChild( root1, paragraph ) ).toBe( true );
				expect( schema.checkChild( paragraph, div ) ).toBe( true );
				expect( schema.checkChild( div, blockQuote ) ).toBe( true );

				expect( schema.checkChild( paragraph, blockQuote ) ).toBe( false );
				expect( schema.checkChild( div, paragraph ) ).toBe( false );
			} );

			it( 'should keep allowChildren', () => {
				schema.register( '$root', {
					allowChildren: 'paragraph'
				} );

				schema.register( 'paragraph' );

				expect( schema.getDefinition( '$root' ) ).toEqual( {
					allowAttributes: [],
					allowChildren: [ 'paragraph' ],
					allowIn: [],
					name: '$root',
					isBlock: false,
					isContent: false,
					isInline: false,
					isLimit: false,
					isObject: false,
					isSelectable: false
				} );
			} );

			it( 'should resolve allowChildren from allowIn', () => {
				schema.register( '$root' );

				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				schema.register( 'blockQuote', {
					allowIn: '$root'
				} );

				expect( schema.getDefinition( '$root' ) ).toEqual( {
					allowAttributes: [],
					allowChildren: [ 'paragraph', 'blockQuote' ],
					allowIn: [],
					name: '$root',
					isBlock: false,
					isContent: false,
					isInline: false,
					isLimit: false,
					isObject: false,
					isSelectable: false
				} );
			} );

			it( 'should not duplicate allowChildren', () => {
				schema.register( '$root', {
					allowChildren: 'paragraph'
				} );

				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				expect( schema.getDefinition( '$root' ) ).toEqual( {
					allowAttributes: [],
					allowChildren: [ 'paragraph' ],
					allowIn: [],
					name: '$root',
					isBlock: false,
					isContent: false,
					isInline: false,
					isLimit: false,
					isObject: false,
					isSelectable: false
				} );
			} );

			it( 'should add parent item to child allowIn property', () => {
				schema.register( '$root', {
					allowChildren: 'paragraph'
				} );

				schema.register( 'div', {
					allowChildren: 'paragraph'
				} );

				schema.register( 'paragraph' );

				expect( schema.getDefinition( 'paragraph' ) ).toEqual( {
					allowAttributes: [],
					allowChildren: [],
					allowIn: [ '$root', 'div' ],
					name: 'paragraph',
					isBlock: false,
					isContent: false,
					isInline: false,
					isLimit: false,
					isObject: false,
					isSelectable: false
				} );
			} );

			it( 'should add parent item to child allowIn property - self reference', () => {
				schema.register( 'paragraph', {
					allowChildren: 'paragraph'
				} );

				expect( schema.getDefinition( 'paragraph' ) ).toEqual( {
					allowAttributes: [],
					allowChildren: [ 'paragraph' ],
					allowIn: [ 'paragraph' ],
					name: 'paragraph',
					isBlock: false,
					isContent: false,
					isInline: false,
					isLimit: false,
					isObject: false,
					isSelectable: false
				} );
			} );

			it( 'should add parent item to child allowIn property - circular reference', () => {
				schema.register( 'paragraph', {
					allowChildren: 'blockQuote'
				} );

				schema.register( 'blockQuote', {
					allowChildren: 'paragraph'
				} );

				expect( schema.getDefinition( 'paragraph' ) ).toEqual( {
					allowAttributes: [],
					allowChildren: [ 'blockQuote' ],
					allowIn: [ 'blockQuote' ],
					name: 'paragraph',
					isBlock: false,
					isContent: false,
					isInline: false,
					isLimit: false,
					isObject: false,
					isSelectable: false
				} );

				expect( schema.getDefinition( 'blockQuote' ) ).toEqual( {
					allowAttributes: [],
					allowIn: [ 'paragraph' ],
					allowChildren: [ 'paragraph' ],
					name: 'blockQuote',
					isBlock: false,
					isContent: false,
					isInline: false,
					isLimit: false,
					isObject: false,
					isSelectable: false
				} );
			} );

			it( 'should include only one allowIn item for definition defined in both allowIn and allowChildren', () => {
				schema.register( '$root', {
					allowChildren: 'paragraph'
				} );

				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				expect( schema.getDefinition( 'paragraph' ) ).toEqual( {
					allowAttributes: [],
					allowChildren: [],
					allowIn: [ '$root' ],
					name: 'paragraph',
					isBlock: false,
					isContent: false,
					isInline: false,
					isLimit: false,
					isObject: false,
					isSelectable: false
				} );
			} );
		} );

		describe( 'inheritTypesFrom', () => {
			it( 'inherit properties of another item', () => {
				schema.register( '$block', {
					isBlock: true,
					isLimit: true
				} );
				schema.register( 'paragraph', {
					inheritTypesFrom: '$block'
				} );

				expect( schema.getDefinition( 'paragraph' ).isBlock ).toBe( true );
				expect( schema.getDefinition( 'paragraph' ).isLimit ).toBe( true );
			} );

			it( 'inherit properties of other items – support for arrays', () => {
				schema.register( '$block', {
					isBlock: true
				} );
				schema.register( '$block2', {
					isLimit: true
				} );
				schema.register( 'paragraph', {
					inheritTypesFrom: [ '$block', '$block2' ]
				} );

				expect( schema.getDefinition( 'paragraph' ).isBlock ).toBe( true );
				expect( schema.getDefinition( 'paragraph' ).isLimit ).toBe( true );
			} );

			it( 'does not override existing props', () => {
				schema.register( '$block', {
					isBlock: true,
					isLimit: true
				} );
				schema.register( 'paragraph', {
					inheritTypesFrom: '$block',
					isLimit: false
				} );

				expect( schema.getDefinition( 'paragraph' ).isBlock ).toBe( true );
				expect( schema.getDefinition( 'paragraph' ).isLimit ).toBe( false );
			} );
		} );

		describe( 'inheritAllFrom', () => {
			it( 'passes $root>paragraph – paragraph inherits allowIn from $block', () => {
				schema.register( '$root' );
				schema.register( '$block', {
					allowIn: '$root'
				} );
				schema.register( 'paragraph', {
					inheritAllFrom: '$block'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( true );
			} );

			it( 'paragraph inherit properties of $block', () => {
				schema.register( '$block', {
					isBlock: true
				} );
				schema.register( 'paragraph', {
					inheritAllFrom: '$block'
				} );

				expect( schema.isBlock( r1p1 ) ).toBe( true );
			} );

			it( 'passes $root>paragraph>$text – paragraph inherits allowed content of $block', () => {
				schema.register( '$root' );
				schema.register( '$block', {
					allowIn: '$root'
				} );
				schema.register( '$text', {
					allowIn: '$block'
				} );
				schema.register( 'paragraph', {
					inheritAllFrom: '$block'
				} );

				expect( schema.checkChild( r1p1, r1p1.getChild( 0 ) ) ).toBe( true );
			} );

			it( 'passes $root>paragraph>$text – paragraph inherits allowIn from $block through $block\'s allowWhere', () => {
				schema.register( '$root' );
				schema.register( '$blockProto', {
					allowIn: '$root'
				} );
				schema.register( '$block', {
					allowWhere: '$blockProto'
				} );
				schema.register( 'paragraph', {
					inheritAllFrom: '$block'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( true );
			} );

			it( 'passes $root>paragraph>$text – paragraph inherits allowed content from $block through $block\'s allowContentOf', () => {
				schema.register( '$root' );
				schema.register( '$blockProto' );
				schema.register( '$block', {
					allowContentOf: '$blockProto',
					allowIn: '$root'
				} );
				schema.register( '$text', {
					allowIn: '$blockProto'
				} );
				schema.register( 'paragraph', {
					inheritAllFrom: '$block'
				} );

				expect( schema.checkChild( r1p1, r1p1.getChild( 0 ) ) ).toBe( true );
			} );

			it( 'passes paragraph[align] – paragraph inherits attributes of $block', () => {
				schema.register( '$block', {
					allowAttributes: 'align'
				} );
				schema.register( 'paragraph', {
					inheritAllFrom: '$block'
				} );

				expect( schema.checkAttribute( r1p1, 'align' ) ).toBe( true );
			} );

			it( 'passes paragraph[align] – paragraph inherits attributes of $block through allowAttributesOf', () => {
				schema.register( '$blockProto', {
					allowAttributes: 'align'
				} );
				schema.register( '$block', {
					allowAttributesOf: '$blockProto'
				} );
				schema.register( 'paragraph', {
					inheritAllFrom: '$block'
				} );

				expect( schema.checkAttribute( r1p1, 'align' ) ).toBe( true );
			} );
		} );

		describe( 'disallow rules - children', () => {
			it( 'does not keep the disallowChildren rule when pointing to a non-registered element', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowIn: '$root',
					allowChildren: [ '$root' ],
					disallowChildren: [ 'not-existing-elem' ]
				} );

				const notExisting = new ModelElement( 'not-existing-elem' );
				r1p1._appendChild( notExisting );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( true );
				expect( schema.checkChild( r1p1, notExisting ) ).toBe( false );
			} );

			it( 'does not keep the rule disallowIn when pointing to a non-registered element', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowIn: '$root',
					allowChildren: [ '$root' ],
					disallowIn: [ 'not-existing-elem' ]
				} );

				const notExisting = new ModelElement( 'not-existing-elem' );
				const p = new ModelElement( 'paragraph' );
				root1._appendChild( notExisting );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( true );
				expect( schema.checkChild( notExisting, p ) ).toBe( false );
			} );

			it( 'disallows children in an item with disallowChildren rule', () => {
				schema.register( '$root' );

				schema.register( 'blockQuote', {
					allowIn: [ '$root' ],
					allowContentOf: [ '$root' ],
					disallowChildren: [ 'paragraph' ]
				} );

				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( r1bQ, r1bQp ) ).toBe( false );
			} );

			it( 'disallows item in a parent with disallowIn rule', () => {
				schema.register( '$root' );

				schema.register( 'blockQuote', {
					allowIn: [ '$root' ],
					allowContentOf: [ '$root' ]
				} );

				schema.register( 'paragraph', {
					allowIn: '$root',
					disallowIn: 'blockQuote'
				} );

				expect( schema.checkChild( r1bQ, r1bQp ) ).toBe( false );
			} );

			it( 'disallows previously allowed items via disallowIn rule', () => {
				schema.register( '$root', { allowChildren: [ 'paragraph' ] } );
				schema.register( '$root2', { allowChildren: [ 'paragraph' ] } );
				schema.register( 'paragraph', {
					disallowIn: [ '$root', '$root2' ]
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( false );
				expect( schema.checkChild( root2, r1p1 ) ).toBe( false );
			} );

			it( 'disallows item if a rule contains both allowChildren and disallowChildren', () => {
				schema.register( '$root', {
					allowChildren: [ 'paragraph' ],
					disallowChildren: [ 'paragraph' ]
				} );

				schema.register( 'paragraph' );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( false );
			} );

			it( 'disallows item if a rule contains both allowIn and disallowIn', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowIn: [ '$root' ],
					disallowIn: [ '$root' ]
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( false );
			} );

			it( 'disallowIn is inherited', () => {
				schema.register( 'baseParent' );
				schema.register( 'baseChild', { allowIn: [ 'baseParent' ] } );

				schema.register( 'extendedChild', { inheritAllFrom: 'baseChild', disallowIn: [ 'baseParent' ] } );
				schema.register( 'extendedChild2', { inheritAllFrom: 'extendedChild' } ); // Direct inherit of a disallow rule.
				schema.register( 'extendedChild3', { inheritAllFrom: 'extendedChild2' } ); // Indirect inherit of a disallow rule.

				expect( schema.checkChild( [ 'baseParent' ], 'baseChild' ) ).toBe( true );
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild' ) ).toBe( false );
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild2' ) ).toBe( false ); // Direct inherit of a disallow rule.
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild3' ) ).toBe( false ); // Indirect inherit of a disallow rule.

				// Check if rules for `baseParent` are correctly inherited.
				schema.register( 'extendedParent', { inheritAllFrom: 'baseParent' } );

				expect( schema.checkChild( [ 'extendedParent' ], 'baseChild' ) ).toBe( true );
				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild' ) ).toBe( false );
				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild2' ) ).toBe( false ); // Direct inherit of a disallow rule.
				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild3' ) ).toBe( false ); // Indirect inherit of a disallow rule.
			} );

			it( 'disallowChildren is inherited', () => {
				schema.register( 'baseParent' );
				schema.register( 'baseChild', { allowIn: [ 'baseParent' ] } );

				schema.register( 'extendedParent', { inheritAllFrom: 'baseParent', disallowChildren: [ 'baseChild' ] } );
				schema.register( 'extendedParent2', { inheritAllFrom: 'extendedParent' } ); // Direct inherit of a disallow rule.
				schema.register( 'extendedParent3', { inheritAllFrom: 'extendedParent2' } ); // Indirect inherit of a disallow rule.

				expect( schema.checkChild( [ 'baseParent' ], 'baseChild' ) ).toBe( true );
				expect( schema.checkChild( [ 'extendedParent' ], 'baseChild' ) ).toBe( false );
				expect( schema.checkChild( [ 'extendedParent2' ], 'baseChild' ) ).toBe( false ); // Direct inherit of a disallow rule.
				expect( schema.checkChild( [ 'extendedParent3' ], 'baseChild' ) ).toBe( false ); // Indirect inherit of a disallow rule.

				// Check if rules for `baseChild` are correctly inherited.
				schema.register( 'extendedChild', { inheritAllFrom: 'baseChild' } );

				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild' ) ).toBe( true );
				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild' ) ).toBe( false );
				expect( schema.checkChild( [ 'extendedParent2' ], 'extendedChild' ) ).toBe( false ); // Direct inherit of a disallow rule.
				expect( schema.checkChild( [ 'extendedParent3' ], 'extendedChild' ) ).toBe( false ); // Indirect inherit of a disallow rule.
			} );

			it( 'disallowIn disallows parents that inherit from the base parent', () => {
				schema.register( 'baseParent' );
				schema.register( 'baseChild', { allowIn: [ 'baseParent' ] } );

				schema.register( 'extendedParent', { inheritAllFrom: 'baseParent' } );
				schema.register( 'extendedChild', { inheritAllFrom: 'baseChild', disallowIn: 'extendedParent' } );

				schema.register( 'extendedParent2', { inheritAllFrom: 'extendedParent' } ); // Direct inherit of a disallow rule.
				schema.register( 'extendedParent3', { inheritAllFrom: 'extendedParent2' } ); // Indirect inherit of a disallow rule.

				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild' ) ).toBe( true );
				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild' ) ).toBe( false );
				expect( schema.checkChild( [ 'extendedParent2' ], 'extendedChild' ) ).toBe( false ); // Direct inherit of a disallow rule.
				expect( schema.checkChild( [ 'extendedParent3' ], 'extendedChild' ) ).toBe( false ); // Indirect inherit of a disallow rule.
			} );

			it( 'disallowChildren disallows children that inherit from the base child', () => {
				schema.register( 'baseParent' );
				schema.register( 'baseChild', { allowIn: [ 'baseParent' ] } );

				schema.register( 'extendedChild', { inheritAllFrom: 'baseChild' } );
				schema.register( 'extendedParent', { inheritAllFrom: 'baseParent', disallowChildren: [ 'extendedChild' ] } );

				schema.register( 'extendedChild2', { inheritAllFrom: 'extendedChild' } ); // Direct inherit of a disallow rule.
				schema.register( 'extendedChild3', { inheritAllFrom: 'extendedChild2' } ); // Indirect inherit of a disallow rule.

				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild' ) ).toBe( true );
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild2' ) ).toBe( true );
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild3' ) ).toBe( true );

				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild' ) ).toBe( false );
				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild2' ) ).toBe( false ); // Direct inherit of a disallow rule.
				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild3' ) ).toBe( false ); // Indirect inherit of a disallow rule.
			} );

			it( 'own allowIn rule has bigger priority than inherited (re-allow)', () => {
				schema.register( 'baseParent' );
				schema.register( 'baseChild', { allowIn: 'baseParent' } );
				schema.register( 'extendedChild', { inheritAllFrom: 'baseChild', disallowIn: 'baseParent' } );
				schema.register( 'extendedChild2', { inheritAllFrom: 'extendedChild', allowIn: 'baseParent' } );
				schema.register( 'extendedChild3', { inheritAllFrom: 'extendedChild2' } ); // Re-allow is inherited.

				expect( schema.checkChild( [ 'baseParent' ], 'baseChild' ) ).toBe( true );
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild' ) ).toBe( false );
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild2' ) ).toBe( true );
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild3' ) ).toBe( true ); // Re-allow is inherited.
			} );

			it( 'own allowChildren rule has bigger priority than inherited (re-allow)', () => {
				schema.register( 'baseParent' );
				schema.register( 'baseChild', { allowIn: 'baseParent' } );
				schema.register( 'extendedParent', { inheritAllFrom: 'baseParent', disallowChildren: [ 'baseChild' ] } );
				schema.register( 'extendedParent2', { inheritAllFrom: 'extendedParent', allowChildren: [ 'baseChild' ] } );
				schema.register( 'extendedParent3', { inheritAllFrom: 'extendedParent2' } ); // Re-allow is inherited.

				expect( schema.checkChild( [ 'baseParent' ], 'baseChild' ) ).toBe( true );
				expect( schema.checkChild( [ 'extendedParent' ], 'baseChild' ) ).toBe( false );
				expect( schema.checkChild( [ 'extendedParent2' ], 'baseChild' ) ).toBe( true );
				expect( schema.checkChild( [ 'extendedParent3' ], 'baseChild' ) ).toBe( true ); // Re-allow is inherited.
			} );
		} );

		describe( 'disallow rules - attributes', () => {
			it( 'disallows attribute in a paragraph with disallowAttributes rule', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowAttributes: [ 'alignment', 'listStyle', 'listType' ],
					disallowAttributes: [ 'listStyle' ]
				} );

				expect( schema.checkAttribute( r1p1, 'alignment' ) ).toBe( true );
				expect( schema.checkAttribute( r1p1, 'listStyle' ) ).toBe( false );
			} );

			it( 'disallows inherited attribute in a paragraph descendant', () => {
				schema.register( 'baseElement', {
					allowAttributes: [ 'alignment', 'listStyle', 'listType', 'indent' ]
				} );
				schema.register( 'paragraph', {
					allowAttributesOf: 'baseElement',
					disallowAttributes: [ 'alignment', 'indent' ]
				} );
				schema.register( 'paragraphDescendant', {
					allowAttributesOf: 'paragraph'
				} );

				const baseElem = new ModelElement( 'baseElement' );
				const p = new ModelElement( 'paragraph' );
				const pD = new ModelElement( 'paragraphDescendant' );

				expect( schema.checkAttribute( baseElem, 'alignment' ) ).toBe( true );
				expect( schema.checkAttribute( baseElem, 'indent' ) ).toBe( true );
				expect( schema.checkAttribute( p, 'alignment' ) ).toBe( false );
				expect( schema.checkAttribute( p, 'indent' ) ).toBe( false );
				expect( schema.checkAttribute( pD, 'alignment' ) ).toBe( false );
				expect( schema.checkAttribute( pD, 'indent' ) ).toBe( false );
			} );

			it( 'should not inherit attributes which have been disallowed in the ancestor definition', () => {
				schema.register( 'baseElement', {
					allowAttributes: [ 'alignment', 'listStyle', 'listType', 'indent' ]
				} );
				schema.register( 'paragraph', {
					allowAttributesOf: 'baseElement',
					disallowAttributes: [ 'alignment', 'indent' ]
				} );
				schema.register( 'paragraphDescendant', {
					allowAttributesOf: 'paragraph',
					allowAttributes: [ 'listStart' ]
				} );

				expect( schema.getDefinition( 'paragraphDescendant' ).allowAttributes )
					.toEqual( expect.arrayContaining( [ 'listStyle', 'listType', 'listStart' ] ) );
				expect( schema.getDefinition( 'paragraphDescendant' ).allowAttributes )
					.not.toEqual( expect.arrayContaining( [ 'alignment', 'indent' ] ) );
			} );

			it( 'should reallow attribute which have been disallowed in the ancestor definition', () => {
				schema.register( 'baseElement', {
					allowAttributes: [ 'alignment', 'listStyle', 'listType', 'indent', 'listStart' ],
					disallowAttributes: [ 'indent' ]
				} );
				schema.register( 'paragraph', {
					allowAttributesOf: 'baseElement',
					disallowAttributes: [ 'listStart' ]
				} );
				schema.register( 'paragraphDescendant', {
					allowAttributesOf: 'paragraph',
					allowAttributes: [ 'indent', 'listStart' ]
				} );

				const baseElem = new ModelElement( 'baseElement' );
				const p = new ModelElement( 'paragraph' );
				const pD = new ModelElement( 'paragraphDescendant' );

				expect( schema.checkAttribute( baseElem, 'indent' ) ).toBe( false );
				expect( schema.checkAttribute( p, 'listStart' ) ).toBe( false );
				expect( schema.checkAttribute( p, 'indent' ) ).toBe( false );
				expect( schema.checkAttribute( pD, 'listStart' ) ).toBe( true );
				expect( schema.checkAttribute( pD, 'indent' ) ).toBe( true );
			} );
		} );

		// We need to handle cases where some independent features registered definitions which might use
		// optional elements (elements which might not have been registered).
		describe( 'missing structure definitions', () => {
			it( 'does not break when trying to check a child which is not registered', () => {
				schema.register( '$root' );

				expect( schema.checkChild( root1, 'foo404' ) ).toBe( false );
			} );

			it( 'does not break when trying to check registered child in a context which contains non-registered elements', () => {
				const foo404 = new ModelElement( 'foo404' );

				root1._appendChild( foo404 );

				schema.register( '$root' );
				schema.register( '$text', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( foo404, '$text' ) ).toBe( false );
			} );

			it( 'does not break when used allowedIn pointing to an non-registered element', () => {
				schema.register( '$root' );
				schema.register( '$text', {
					allowIn: 'foo404'
				} );

				expect( schema.checkChild( root1, '$text' ) ).toBe( false );
			} );

			it( 'does not break when used allowChildren pointing to an non-register element', () => {
				schema.register( '$root' );
				schema.register( '$text', {
					allowChildren: 'foo404'
				} );

				expect( schema.checkChild( root1, '$text' ) ).toBe( false );
			} );

			it( 'does not break when used allowWhere pointing to an non-registered element', () => {
				schema.register( '$root' );
				schema.register( '$text', {
					allowWhere: 'foo404'
				} );

				expect( schema.checkChild( root1, '$text' ) ).toBe( false );
			} );

			it( 'does not break when used allowContentOf pointing to an non-registered element', () => {
				schema.register( '$root', {
					allowContentOf: 'foo404'
				} );
				schema.register( '$text', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( root1, '$text' ) ).toBe( true );
			} );

			it( 'checks whether allowIn uses a registered element', () => {
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );
				// $root isn't registered!

				expect( schema.checkChild( root1, 'paragraph' ) ).toBe( false );
			} );

			it( 'does not break when inheriting all from an non-registered element', () => {
				schema.register( 'paragraph', {
					inheritAllFrom: '$block'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).toBe( false );
			} );
		} );

		describe( 'allowAttributes', () => {
			it( 'passes paragraph[align]', () => {
				schema.register( 'paragraph', {
					allowAttributes: 'align'
				} );

				expect( schema.checkAttribute( r1p1, 'align' ) ).toBe( true );
			} );

			it( 'passes paragraph[align] and paragraph[dir] – support for array values', () => {
				schema.register( 'paragraph', {
					allowAttributes: [ 'align', 'dir' ]
				} );

				expect( schema.checkAttribute( r1p1, 'align' ), 'align' ).toBe( true );
				expect( schema.checkAttribute( r1p1, 'dir' ), 'dir' ).toBe( true );
			} );

			it( 'passes paragraph>$text[bold]', () => {
				schema.register( 'paragraph' );
				schema.register( '$text', {
					allowIn: 'paragraph',
					allowAttributes: 'bold'
				} );

				expect( schema.checkAttribute( r1p1.getChild( 0 ), 'bold' ) ).toBe( true );
			} );
		} );

		describe( 'allowAttributesOf', () => {
			it( 'passes paragraph[align] – paragraph inherits from $block', () => {
				schema.register( '$block', {
					allowAttributes: 'align'
				} );
				schema.register( 'paragraph', {
					allowAttributesOf: '$block'
				} );

				expect( schema.checkAttribute( r1p1, 'align' ) ).toBe( true );
			} );

			it( 'passes paragraph[align] and paragraph[dir] – support for array values', () => {
				schema.register( '$block', {
					allowAttributes: 'align'
				} );
				schema.register( '$block2', {
					allowAttributes: 'dir'
				} );
				schema.register( 'paragraph', {
					allowAttributesOf: [ '$block', '$block2' ]
				} );

				expect( schema.checkAttribute( r1p1, 'align' ), 'align' ).toBe( true );
				expect( schema.checkAttribute( r1p1, 'dir' ), 'dir' ).toBe( true );
			} );

			it( 'passes paragraph[align] and paragraph[dir] – support for combined allowAttributes and allowAttributesOf', () => {
				schema.register( '$block', {
					allowAttributes: 'align'
				} );
				schema.register( 'paragraph', {
					allowAttributes: 'dir',
					allowAttributesOf: '$block'
				} );

				expect( schema.checkAttribute( r1p1, 'align' ), 'align' ).toBe( true );
				expect( schema.checkAttribute( r1p1, 'dir' ), 'dir' ).toBe( true );
			} );

			// The support for allowAttributesOf is broken in the similar way as for allowContentOf (see the comment above).
			// However, those situations are rather theoretical, so we're not going to waste time on them now.
		} );

		describe( 'missing attribute definitions', () => {
			it( 'does not crash when checking an attribute of a non-registered element', () => {
				expect( schema.checkAttribute( r1p1, 'align' ) ).toBe( false );
			} );

			it( 'does not crash when inheriting attributes of a non-registered element', () => {
				schema.register( 'paragraph', {
					allowAttributesOf: '$block'
				} );

				expect( schema.checkAttribute( r1p1, 'whatever' ) ).toBe( false );
			} );

			it( 'does not crash when inheriting all from a non-registered element', () => {
				schema.register( 'paragraph', {
					allowAttributesOf: '$block'
				} );

				expect( schema.checkAttribute( r1p1, 'whatever' ) ).toBe( false );
			} );
		} );

		describe( 'missing types definitions', () => {
			it( 'does not crash when inheriting types of an non-registered element', () => {
				schema.register( 'paragraph', {
					inheritTypesFrom: '$block'
				} );

				expect( schema.getDefinition( 'paragraph' ) ).not.toBeNull();
			} );
		} );
	} );

	describe( 'real scenarios', () => {
		let r1bQi, r1i, r1lI, r1h, r1bQlI;

		const definitions = [
			() => {
				schema.register( 'paragraph', {
					inheritAllFrom: '$block'
				} );
			},
			() => {
				schema.register( 'heading1', {
					inheritAllFrom: '$block'
				} );
			},
			() => {
				schema.register( 'listItem', {
					inheritAllFrom: '$block',
					allowAttributes: [ 'listIndent', 'listType' ]
				} );
			},
			() => {
				schema.register( 'blockQuote', {
					allowWhere: '$block',
					allowContentOf: '$root'
				} );

				// Disallow blockQuote in blockQuote.
				schema.addChildCheck( ( ctx, childDef ) => {
					if ( childDef.name == 'blockQuote' && ctx.endsWith( 'blockQuote' ) ) {
						return false;
					}
				} );
			},
			() => {
				schema.register( 'imageBlock', {
					allowWhere: '$block',
					allowAttributes: [ 'src', 'alt' ],
					isObject: true,
					isBlock: true
				} );
			},
			() => {
				schema.register( 'caption', {
					allowIn: 'imageBlock',
					allowContentOf: '$block',
					isLimit: true
				} );
			},
			() => {
				schema.extend( '$text', {
					allowAttributes: [ 'bold', 'italic' ],
					isInline: true
				} );

				// Disallow bold in heading1.
				schema.addAttributeCheck( ( ctx, attributeName ) => {
					if ( ctx.endsWith( 'heading1 $text' ) && attributeName == 'bold' ) {
						return false;
					}
				} );
			},
			() => {
				schema.extend( '$block', {
					allowAttributes: 'alignment'
				} );
			}
		];

		beforeEach( () => {
			schema.register( '$root', {
				isLimit: true
			} );
			schema.register( '$block', {
				allowIn: '$root',
				isBlock: true
			} );
			schema.register( '$text', {
				allowIn: '$block',
				isInline: true
			} );

			for ( const definition of definitions ) {
				definition();
			}

			// or...
			//
			// Use the below code to shuffle the definitions.
			// Don't look here, Szymon!
			//
			// const definitionsCopy = definitions.slice();
			//
			// while ( definitionsCopy.length ) {
			// 	const r = Math.floor( Math.random() * definitionsCopy.length );
			// 	definitionsCopy.splice( r, 1 )[ 0 ]();
			// }

			root1 = new ModelElement( '$root', null, [
				new ModelElement( 'paragraph', null, 'foo' ),
				new ModelElement( 'paragraph', { alignment: 'right' }, 'bar' ),
				new ModelElement( 'listItem', { listType: 'x', listIndent: 0 }, 'foo' ),
				new ModelElement( 'heading1', null, 'foo' ),
				new ModelElement( 'blockQuote', null, [
					new ModelElement( 'paragraph', null, 'foo' ),
					new ModelElement( 'listItem', { listType: 'x', listIndent: 0 }, 'foo' ),
					new ModelElement( 'imageBlock', null, [
						new ModelElement( 'caption', null, 'foo' )
					] )
				] ),
				new ModelElement( 'imageBlock', null, [
					new ModelElement( 'caption', null, 'foo' )
				] )
			] );
			r1p1 = root1.getChild( 0 );
			r1p2 = root1.getChild( 1 );
			r1lI = root1.getChild( 2 );
			r1h = root1.getChild( 3 );
			r1bQ = root1.getChild( 4 );
			r1i = root1.getChild( 5 );
			r1bQp = r1bQ.getChild( 0 );
			r1bQlI = r1bQ.getChild( 1 );
			r1bQi = r1bQ.getChild( 2 );
		} );

		it( 'passes $root>paragraph', () => {
			expect( schema.checkChild( root1, 'paragraph' ) ).toBe( true );
		} );

		it( 'passes $root>paragraph>$text', () => {
			expect( schema.checkChild( r1p1, '$text' ), 'paragraph' ).toBe( true );
			expect( schema.checkChild( r1p2, '$text' ), 'paragraph[alignment]' ).toBe( true );
		} );

		it( 'passes $root>listItem', () => {
			expect( schema.checkChild( root1, 'listItem' ) ).toBe( true );
		} );

		it( 'passes $root>listItem>$text', () => {
			expect( schema.checkChild( r1lI, '$text' ) ).toBe( true );
		} );

		it( 'passes $root>blockQuote>paragraph', () => {
			expect( schema.checkChild( r1bQ, 'paragraph' ) ).toBe( true );
		} );

		it( 'passes $root>blockQuote>paragraph>$text', () => {
			expect( schema.checkChild( r1bQp, '$text' ) ).toBe( true );
		} );

		it( 'passes $root>blockQuote>listItem', () => {
			expect( schema.checkChild( r1bQ, 'listItem' ) ).toBe( true );
		} );

		it( 'passes $root>blockQuote>listItem>$text', () => {
			expect( schema.checkChild( r1bQlI, '$text' ) ).toBe( true );
		} );

		it( 'passes $root>blockQuote>image', () => {
			expect( schema.checkChild( r1bQ, 'imageBlock' ) ).toBe( true );
		} );

		it( 'passes $root>blockQuote>image>caption', () => {
			expect( schema.checkChild( r1bQi, 'caption' ) ).toBe( true );
		} );

		it( 'passes $root>blockQuote>image>caption>$text', () => {
			expect( schema.checkChild( r1bQi.getChild( 0 ), '$text' ) ).toBe( true );
		} );

		it( 'passes $root>image', () => {
			expect( schema.checkChild( root1, 'imageBlock' ) ).toBe( true );
		} );

		it( 'passes $root>image>caption', () => {
			expect( schema.checkChild( r1i, 'caption' ) ).toBe( true );
		} );

		it( 'passes $root>image>caption>$text', () => {
			expect( schema.checkChild( r1i.getChild( 0 ), '$text' ) ).toBe( true );
		} );

		it( 'rejects $root>$root', () => {
			expect( schema.checkChild( root1, '$root' ) ).toBe( false );
		} );

		it( 'rejects $root>$text', () => {
			expect( schema.checkChild( root1, '$text' ) ).toBe( false );
		} );

		it( 'rejects $root>caption', () => {
			expect( schema.checkChild( root1, 'caption' ) ).toBe( false );
		} );

		it( 'rejects $root>paragraph>paragraph', () => {
			expect( schema.checkChild( r1p1, 'paragraph' ) ).toBe( false );
		} );

		it( 'rejects $root>paragraph>paragraph>$text', () => {
			// Edge case because p>p should not exist in the first place.
			// But it's good to know that it blocks also this.
			const p = new ModelElement( 'p' );
			r1p1._appendChild( p );

			expect( schema.checkChild( p, '$text' ) ).toBe( false );
		} );

		it( 'rejects $root>paragraph>$block', () => {
			expect( schema.checkChild( r1p1, '$block' ) ).toBe( false );
		} );

		it( 'rejects $root>paragraph>blockQuote', () => {
			expect( schema.checkChild( r1p1, 'blockQuote' ) ).toBe( false );
		} );

		it( 'rejects $root>paragraph>image', () => {
			expect( schema.checkChild( r1p1, 'imageBlock' ) ).toBe( false );
		} );

		it( 'rejects $root>paragraph>caption', () => {
			expect( schema.checkChild( r1p1, 'caption' ) ).toBe( false );
		} );

		it( 'rejects $root>blockQuote>blockQuote', () => {
			expect( schema.checkChild( r1bQ, 'blockQuote' ) ).toBe( false );
		} );

		it( 'rejects $root>blockQuote>caption', () => {
			expect( schema.checkChild( r1p1, 'imageBlock' ) ).toBe( false );
		} );

		it( 'rejects $root>blockQuote>$text', () => {
			expect( schema.checkChild( r1bQ, '$text' ) ).toBe( false );
		} );

		it( 'rejects $root>image>$text', () => {
			expect( schema.checkChild( r1i, '$text' ) ).toBe( false );
		} );

		it( 'rejects $root>image>paragraph', () => {
			expect( schema.checkChild( r1i, 'paragraph' ) ).toBe( false );
		} );

		it( 'rejects $root>image>caption>paragraph', () => {
			expect( schema.checkChild( r1i.getChild( 0 ), 'paragraph' ) ).toBe( false );
		} );

		it( 'rejects $root>image>caption>blockQuote', () => {
			expect( schema.checkChild( r1i.getChild( 0 ), 'blockQuote' ) ).toBe( false );
		} );

		it( 'accepts attribute $root>paragraph[alignment]', () => {
			expect( schema.checkAttribute( r1p1, 'alignment' ) ).toBe( true );
		} );

		it( 'accepts attribute $root>paragraph>$text[bold]', () => {
			expect( schema.checkAttribute( r1p1.getChild( 0 ), 'bold' ) ).toBe( true );
		} );

		it( 'accepts attribute $root>heading1>$text[italic]', () => {
			expect( schema.checkAttribute( r1h.getChild( 0 ), 'italic' ) ).toBe( true );
		} );

		it( 'accepts attribute $root>blockQuote>paragraph>$text[bold]', () => {
			expect( schema.checkAttribute( r1bQp.getChild( 0 ), 'bold' ) ).toBe( true );
		} );

		it( 'accepts attribute $root>listItem[alignment]', () => {
			expect( schema.checkAttribute( r1lI, 'alignment' ) ).toBe( true );
		} );

		it( 'accepts attribute $root>listItem[indent]', () => {
			expect( schema.checkAttribute( r1lI, 'listIndent' ) ).toBe( true );
		} );

		it( 'accepts attribute $root>listItem[type]', () => {
			expect( schema.checkAttribute( r1lI, 'listType' ) ).toBe( true );
		} );

		it( 'accepts attribute $root>image[src]', () => {
			expect( schema.checkAttribute( r1i, 'src' ) ).toBe( true );
		} );

		it( 'accepts attribute $root>image[alt]', () => {
			expect( schema.checkAttribute( r1i, 'alt' ) ).toBe( true );
		} );

		it( 'accepts attribute $root>image>caption>$text[bold]', () => {
			expect( schema.checkAttribute( r1i.getChild( 0 ).getChild( 0 ), 'bold' ) ).toBe( true );
		} );

		it( 'rejects attribute $root[indent]', () => {
			expect( schema.checkAttribute( root1, 'listIndent' ) ).toBe( false );
		} );

		it( 'rejects attribute $root>paragraph[indent]', () => {
			expect( schema.checkAttribute( r1p1, 'listIndent' ) ).toBe( false );
		} );

		it( 'accepts attribute $root>heading1>$text[bold]', () => {
			expect( schema.checkAttribute( r1h.getChild( 0 ), 'bold' ) ).toBe( false );
		} );

		it( 'rejects attribute $root>paragraph>$text[alignment]', () => {
			expect( schema.checkAttribute( r1p1.getChild( 0 ), 'alignment' ) ).toBe( false );
		} );

		it( 'rejects attribute $root>blockQuote[indent]', () => {
			expect( schema.checkAttribute( r1bQ, 'listIndent' ) ).toBe( false );
		} );

		it( 'rejects attribute $root>blockQuote[alignment]', () => {
			expect( schema.checkAttribute( r1bQ, 'alignment' ) ).toBe( false );
		} );

		it( 'rejects attribute $root>image[indent]', () => {
			expect( schema.checkAttribute( r1i, 'listIndent' ) ).toBe( false );
		} );

		it( 'rejects attribute $root>image[alignment]', () => {
			expect( schema.checkAttribute( r1i, 'alignment' ) ).toBe( false );
		} );

		it( '$text is inline', () => {
			expect( schema.isLimit( '$text' ) ).toBe( false );
			expect( schema.isBlock( '$text' ) ).toBe( false );
			expect( schema.isObject( '$text' ) ).toBe( false );
			expect( schema.isInline( '$text' ) ).toBe( true );
		} );

		it( '$root is limit', () => {
			expect( schema.isLimit( '$root' ) ).toBe( true );
			expect( schema.isBlock( '$root' ) ).toBe( false );
			expect( schema.isObject( '$root' ) ).toBe( false );
			expect( schema.isInline( '$root' ) ).toBe( false );
		} );

		it( 'paragraph is block', () => {
			expect( schema.isLimit( 'paragraph' ) ).toBe( false );
			expect( schema.isBlock( 'paragraph' ) ).toBe( true );
			expect( schema.isObject( 'paragraph' ) ).toBe( false );
			expect( schema.isInline( 'paragraph' ) ).toBe( false );
		} );

		it( 'heading1 is block', () => {
			expect( schema.isLimit( 'heading1' ) ).toBe( false );
			expect( schema.isBlock( 'heading1' ) ).toBe( true );
			expect( schema.isObject( 'heading1' ) ).toBe( false );
			expect( schema.isInline( 'heading1' ) ).toBe( false );
		} );

		it( 'listItem is block', () => {
			expect( schema.isLimit( 'listItem' ) ).toBe( false );
			expect( schema.isBlock( 'listItem' ) ).toBe( true );
			expect( schema.isObject( 'listItem' ) ).toBe( false );
			expect( schema.isInline( 'lisItem' ) ).toBe( false );
		} );

		it( 'image is block object', () => {
			expect( schema.isLimit( 'imageBlock' ) ).toBe( true );
			expect( schema.isBlock( 'imageBlock' ) ).toBe( true );
			expect( schema.isObject( 'imageBlock' ) ).toBe( true );
			expect( schema.isInline( 'imageBlock' ) ).toBe( false );
		} );

		it( 'caption is limit', () => {
			expect( schema.isLimit( 'caption' ) ).toBe( true );
			expect( schema.isBlock( 'caption' ) ).toBe( false );
			expect( schema.isObject( 'caption' ) ).toBe( false );
			expect( schema.isInline( 'caption' ) ).toBe( false );
		} );
	} );

	describe( 'createContext()', () => {
		it( 'should return ModelSchemaContext instance', () => {
			const ctx = schema.createContext( [ 'a', 'b', 'c' ] );

			expect( ctx ).toBeInstanceOf( ModelSchemaContext );
		} );
	} );
} );

describe( 'ModelSchemaContext', () => {
	let root;

	beforeEach( () => {
		root = new ModelElement( '$root', null, [
			new ModelElement( 'blockQuote', { foo: 1 }, [
				new ModelElement( 'paragraph', { align: 'left' }, [
					new ModelText( 'foo', { bold: true, italic: true } )
				] )
			] )
		] );
	} );

	describe( 'constructor()', () => {
		it( 'creates context based on an array of strings', () => {
			const ctx = new ModelSchemaContext( [ 'a', 'b', 'c' ] );

			expect( ctx.length ).toBe( 3 );

			expect( Array.from( ctx.getNames() ) ).toEqual( [ 'a', 'b', 'c' ] );
			expect( ctx.getItem( 0 ).name ).toBe( 'a' );

			expect( Array.from( ctx.getItem( 0 ).getAttributeKeys() ) ).toHaveLength( 0 );
			expect( ctx.getItem( 0 ).getAttribute( 'foo' ) ).toBeUndefined();
		} );

		it( 'creates context based on an array of elements', () => {
			const blockQuote = root.getChild( 0 );
			const text = blockQuote.getChild( 0 ).getChild( 0 );

			const ctx = new ModelSchemaContext( [ blockQuote, text ] );

			expect( ctx.length ).toBe( 2 );

			expect( Array.from( ctx.getNames() ) ).toEqual( [ 'blockQuote', '$text' ] );
			expect( ctx.getItem( 0 ).name ).toBe( 'blockQuote' );

			expect( Array.from( ctx.getItem( 1 ).getAttributeKeys() ).sort() ).toEqual( [ 'bold', 'italic' ] );
			expect( ctx.getItem( 1 ).getAttribute( 'bold' ) ).toBe( true );
		} );

		it( 'creates context based on a mixed array of strings and elements', () => {
			const blockQuote = root.getChild( 0 );
			const text = blockQuote.getChild( 0 ).getChild( 0 );

			const ctx = new ModelSchemaContext( [ blockQuote, 'paragraph', text ] );

			expect( ctx.length ).toBe( 3 );

			expect( Array.from( ctx.getNames() ) ).toEqual( [ 'blockQuote', 'paragraph', '$text' ] );
		} );

		it( 'creates context based on a root element', () => {
			const ctx = new ModelSchemaContext( root );

			expect( ctx.length ).toBe( 1 );

			expect( Array.from( ctx.getNames() ) ).toEqual( [ '$root' ] );

			expect( Array.from( ctx.getItem( 0 ).getAttributeKeys() ) ).toHaveLength( 0 );
			expect( ctx.getItem( 0 ).getAttribute( 'foo' ) ).toBeUndefined();
		} );

		it( 'creates context based on a nested element', () => {
			const ctx = new ModelSchemaContext( root.getChild( 0 ).getChild( 0 ) );

			expect( ctx.length ).toBe( 3 );

			expect( Array.from( ctx.getNames() ) ).toEqual( [ '$root', 'blockQuote', 'paragraph' ] );

			expect( Array.from( ctx.getItem( 1 ).getAttributeKeys() ) ).toEqual( [ 'foo' ] );
			expect( ctx.getItem( 1 ).getAttribute( 'foo' ) ).toBe( 1 );
			expect( Array.from( ctx.getItem( 2 ).getAttributeKeys() ) ).toEqual( [ 'align' ] );
			expect( ctx.getItem( 2 ).getAttribute( 'align' ) ).toBe( 'left' );
		} );

		it( 'creates context based on a text node', () => {
			const ctx = new ModelSchemaContext( root.getChild( 0 ).getChild( 0 ).getChild( 0 ) );

			expect( ctx.length ).toBe( 4 );

			expect( Array.from( ctx.getNames() ) ).toEqual( [ '$root', 'blockQuote', 'paragraph', '$text' ] );

			expect( Array.from( ctx.getItem( 3 ).getAttributeKeys() ).sort() ).toEqual( [ 'bold', 'italic' ] );
			expect( ctx.getItem( 3 ).getAttribute( 'bold' ) ).toBe( true );
		} );

		it( 'creates context based on a text proxy', () => {
			const text = root.getChild( 0 ).getChild( 0 ).getChild( 0 );
			const textProxy = new ModelTextProxy( text, 0, 1 );
			const ctx = new ModelSchemaContext( textProxy );

			expect( ctx.length ).toBe( 4 );

			expect( Array.from( ctx.getNames() ) ).toEqual( [ '$root', 'blockQuote', 'paragraph', '$text' ] );

			expect( Array.from( ctx.getItem( 3 ).getAttributeKeys() ).sort() ).toEqual( [ 'bold', 'italic' ] );
			expect( ctx.getItem( 3 ).getAttribute( 'bold' ) ).toBe( true );
		} );

		it( 'creates context based on a position', () => {
			const pos = ModelPosition._createAt( root.getChild( 0 ).getChild( 0 ), 0 );
			const ctx = new ModelSchemaContext( pos );

			expect( ctx.length ).toBe( 3 );

			expect( Array.from( ctx.getNames() ) ).toEqual( [ '$root', 'blockQuote', 'paragraph' ] );

			expect( Array.from( ctx.getItem( 2 ).getAttributeKeys() ).sort() ).toEqual( [ 'align' ] );
		} );

		it( 'creates context based on a string', () => {
			const ctx = new ModelSchemaContext( 'paragraph' );

			expect( Array.from( ctx.getNames() ) ).toEqual( [ 'paragraph' ] );
		} );

		it( 'creates context based on a ModelSchemaContext instance', () => {
			const previousCtx = new ModelSchemaContext( [ 'a', 'b', 'c' ] );

			const ctx = new ModelSchemaContext( previousCtx );

			expect( ctx ).toBe( previousCtx );
		} );

		it( 'creates context in ModelDocumentFragment - array with string', () => {
			const ctx = new ModelSchemaContext( [ new ModelDocumentFragment(), 'paragraph' ] );

			expect( ctx.length ).toBe( 2 );
			expect( Array.from( ctx.getNames() ) ).toEqual( [ '$documentFragment', 'paragraph' ] );
		} );

		it( 'creates context in ModelDocumentFragment - element', () => {
			const p = new ModelElement( 'paragraph' );
			const docFrag = new ModelDocumentFragment();
			docFrag._appendChild( p );

			const ctx = new ModelSchemaContext( p );

			expect( ctx.length ).toBe( 2 );
			expect( Array.from( ctx.getNames() ) ).toEqual( [ '$documentFragment', 'paragraph' ] );
		} );

		it( 'creates context in ModelDocumentFragment - position', () => {
			const p = new ModelElement( 'paragraph' );
			const docFrag = new ModelDocumentFragment( p );
			const pos = ModelPosition._createAt( docFrag.getChild( 0 ), 0 );
			const ctx = new ModelSchemaContext( pos );

			expect( ctx.length ).toBe( 2 );
			expect( Array.from( ctx.getNames() ) ).toEqual( [ '$documentFragment', 'paragraph' ] );
		} );
	} );

	describe( 'length', () => {
		it( 'gets the number of items', () => {
			const ctx = new ModelSchemaContext( [ 'a', 'b', 'c' ] );

			expect( ctx.length ).toBe( 3 );
		} );
	} );

	describe( 'last', () => {
		it( 'gets the last item', () => {
			const ctx = new ModelSchemaContext( [ 'a', 'b', 'c' ] );

			expect( ctx.last ).not.toBeNull();
			expect( ctx.last.name ).toBe( 'c' );
		} );
	} );

	describe( 'Symbol.iterator', () => {
		it( 'exists', () => {
			const ctx = new ModelSchemaContext( [ 'a', 'b', 'c' ] );

			expect( ctx[ Symbol.iterator ] ).toBeTypeOf( 'function' );
			expect( Array.from( ctx ).map( item => item.name ) ).toEqual( [ 'a', 'b', 'c' ] );
		} );
	} );

	describe( 'getItem()', () => {
		it( 'returns item by index', () => {
			const ctx = new ModelSchemaContext( [ 'a', 'b', 'c' ] );

			expect( ctx.getItem( 1 ) ).not.toBeNull();
			expect( ctx.getItem( 1 ).name ).toBe( 'b' );
		} );

		it( 'returns undefined if index exceeds the range', () => {
			const ctx = new ModelSchemaContext( [ 'a', 'b', 'c' ] );

			expect( ctx.getItem( 3 ) ).toBeUndefined();
		} );
	} );

	describe( 'push()', () => {
		it( 'creates new ModelSchemaContext instance with new item - #string', () => {
			const ctx = new ModelSchemaContext( [ 'a', 'b', 'c' ] );

			const newCtx = ctx.push( 'd' );

			expect( newCtx ).toBeInstanceOf( ModelSchemaContext );
			expect( newCtx ).not.toBe( ctx );
			expect( Array.from( newCtx.getNames() ) ).toEqual( [ 'a', 'b', 'c', 'd' ] );
			expect( Array.from( ctx.getNames() ) ).toEqual( [ 'a', 'b', 'c' ] );
		} );

		it( 'creates new ModelSchemaContext instance with new item - #text', () => {
			const node = new ModelText( 'd' );
			const ctx = new ModelSchemaContext( [ 'a', 'b', 'c' ] );

			const newCtx = ctx.push( node );

			expect( newCtx ).toBeInstanceOf( ModelSchemaContext );
			expect( newCtx ).not.toBe( ctx );
			expect( Array.from( newCtx.getNames() ) ).toEqual( [ 'a', 'b', 'c', '$text' ] );
			expect( Array.from( ctx.getNames() ) ).toEqual( [ 'a', 'b', 'c' ] );
		} );

		it( 'creates new ModelSchemaContext instance with new item - #element', () => {
			const ctx = new ModelSchemaContext( [ 'a', 'b', 'c' ] );
			const parent = new ModelElement( 'parent', null, new ModelElement( 'd' ) );

			const newCtx = ctx.push( parent.getChild( 0 ) );

			expect( newCtx ).toBeInstanceOf( ModelSchemaContext );
			expect( newCtx ).not.toBe( ctx );
			expect( Array.from( newCtx.getNames() ) ).toEqual( [ 'a', 'b', 'c', 'd' ] );
			expect( Array.from( ctx.getNames() ) ).toEqual( [ 'a', 'b', 'c' ] );
		} );
	} );

	describe( 'trimLast()', () => {
		it( 'creates new ModelSchemaContext instance without the last item - #string', () => {
			const ctx = new ModelSchemaContext( [ 'a', 'b', 'c' ] );

			const newCtx = ctx.trimLast();

			expect( newCtx ).toBeInstanceOf( ModelSchemaContext );
			expect( newCtx ).not.toBe( ctx );
			expect( Array.from( newCtx.getNames() ) ).toEqual( [ 'a', 'b' ] );
			expect( Array.from( ctx.getNames() ) ).toEqual( [ 'a', 'b', 'c' ] );
		} );
	} );

	describe( 'getNames()', () => {
		it( 'returns an iterator', () => {
			const ctx = new ModelSchemaContext( [ 'a', 'b', 'c' ] );

			expect( ctx.getNames().next ).toBeTypeOf( 'function' );
		} );

		it( 'returns an iterator which returns all item names', () => {
			const ctx = new ModelSchemaContext( [ 'a', 'b', 'c' ] );

			expect( Array.from( ctx.getNames() ) ).toEqual( [ 'a', 'b', 'c' ] );
		} );
	} );

	describe( 'endsWith()', () => {
		it( 'returns true if the end of the context matches the query - 1 item', () => {
			const ctx = new ModelSchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.endsWith( 'dom' ) ).toBe( true );
		} );

		it( 'returns true if the end of the context matches the query - 2 items', () => {
			const ctx = new ModelSchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.endsWith( 'bom dom' ) ).toBe( true );
		} );

		it( 'returns true if the end of the context matches the query - full match of 3 items', () => {
			const ctx = new ModelSchemaContext( [ 'foo', 'bar', 'bom' ] );

			expect( ctx.endsWith( 'foo bar bom' ) ).toBe( true );
		} );

		it( 'returns true if the end of the context matches the query - full match of 1 items', () => {
			const ctx = new ModelSchemaContext( [ 'foo' ] );

			expect( ctx.endsWith( 'foo' ) ).toBe( true );
		} );

		it( 'returns true if not only the end of the context matches the query', () => {
			const ctx = new ModelSchemaContext( [ 'foo', 'foo', 'foo', 'foo' ] );

			expect( ctx.endsWith( 'foo foo' ) ).toBe( true );
		} );

		it( 'returns false if query matches the middle of the context', () => {
			const ctx = new ModelSchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.endsWith( 'bom' ) ).toBe( false );
		} );

		it( 'returns false if query matches the start of the context', () => {
			const ctx = new ModelSchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.endsWith( 'foo' ) ).toBe( false );
		} );

		it( 'returns false if query does not match', () => {
			const ctx = new ModelSchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.endsWith( 'dom bar' ) ).toBe( false );
		} );

		it( 'returns false if query is longer than context', () => {
			const ctx = new ModelSchemaContext( [ 'foo' ] );

			expect( ctx.endsWith( 'bar', 'foo' ) ).toBe( false );
		} );
	} );

	describe( 'startsWith()', () => {
		it( 'returns true if the start of the context matches the query - 1 item', () => {
			const ctx = new ModelSchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.startsWith( 'foo' ) ).toBe( true );
		} );

		it( 'returns true if the start of the context matches the query - 2 items', () => {
			const ctx = new ModelSchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.startsWith( 'foo bar' ) ).toBe( true );
		} );

		it( 'returns true if the start of the context matches the query - full match of 3 items', () => {
			const ctx = new ModelSchemaContext( [ 'foo', 'bar', 'bom' ] );

			expect( ctx.startsWith( 'foo bar bom' ) ).toBe( true );
		} );

		it( 'returns true if the start of the context matches the query - full match of 1 items', () => {
			const ctx = new ModelSchemaContext( [ 'foo' ] );

			expect( ctx.startsWith( 'foo' ) ).toBe( true );
		} );

		it( 'returns true if not only the start of the context matches the query', () => {
			const ctx = new ModelSchemaContext( [ 'foo', 'foo', 'foo', 'foo' ] );

			expect( ctx.startsWith( 'foo foo' ) ).toBe( true );
		} );

		it( 'returns false if query matches the middle of the context', () => {
			const ctx = new ModelSchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.startsWith( 'bom' ) ).toBe( false );
		} );

		it( 'returns false if query matches the end of the context', () => {
			const ctx = new ModelSchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.startsWith( 'dom' ) ).toBe( false );
		} );

		it( 'returns false if query does not match', () => {
			const ctx = new ModelSchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.startsWith( 'dom bar' ) ).toBe( false );
		} );

		it( 'returns false if query is longer than context', () => {
			const ctx = new ModelSchemaContext( [ 'foo' ] );

			expect( ctx.startsWith( 'bar', 'foo' ) ).toBe( false );
		} );
	} );
} );
