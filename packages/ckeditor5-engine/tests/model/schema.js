/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Schema, { SchemaContext } from '../../src/model/schema.js';

import Model from '../../src/model/model.js';

import DocumentFragment from '../../src/model/documentfragment.js';
import Element from '../../src/model/element.js';
import Text from '../../src/model/text.js';
import TextProxy from '../../src/model/textproxy.js';
import Position from '../../src/model/position.js';
import Range from '../../src/model/range.js';

import { getData, setData, stringify, parse } from '../../src/dev-utils/model.js';

import AttributeOperation from '../../src/model/operation/attributeoperation.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'Schema', () => {
	let schema, root1, r1p1, r1p2, r1bQ, r1bQp, root2;

	beforeEach( () => {
		schema = new Schema();

		root1 = new Element( '$root', null, [
			new Element( 'paragraph', null, 'foo' ),
			new Element( 'paragraph', { align: 'right' }, 'bar' ),
			new Element( 'blockQuote', null, [
				new Element( 'paragraph', null, 'foo' )
			] )
		] );
		r1p1 = root1.getChild( 0 );
		r1p2 = root1.getChild( 1 );
		r1bQ = root1.getChild( 2 );
		r1bQp = r1bQ.getChild( 0 );

		root2 = new Element( '$root2' );
	} );

	describe( 'register()', () => {
		it( 'allows registering an item', () => {
			schema.register( 'foo' );

			expect( schema.getDefinition( 'foo' ) ).to.be.an( 'object' );
		} );

		it( 'copies definitions objects', () => {
			const definitions = {};

			schema.register( 'foo', definitions );

			definitions.isBlock = true;

			expect( schema.getDefinitions().foo.isBlock ).to.be.false;
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

			expect( schema.getDefinition( 'foo' ) ).to.have.property( 'isBlock', true );
		} );

		it( 'copies definitions objects', () => {
			schema.register( 'foo', {} );

			const definitions = {};
			schema.extend( 'foo', definitions );

			definitions.isBlock = true;

			expect( schema.getDefinitions().foo.isBlock ).to.be.false;
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

				expect( schema.getAttributeProperties( 'testAttribute' ) ).to.deep.equal( {
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

				expect( schema.getAttributeProperties( 'testAttribute' ) ).to.deep.equal( {
					first: 'foo',
					second: 'bar'
				} );
			} );
		} );

		describe( 'getAttributeProperties()', () => {
			it( 'it returns a proper value if the attribute has no properties', () => {
				expect( schema.getAttributeProperties( 'noPropertiesAttribute' ) ).to.deep.equal( {} );
			} );

			it( 'it returns a proper value for unknown attribute', () => {
				expect( schema.getAttributeProperties( 'unregistered-attribute' ) ).to.deep.equal( {} );
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

			expect( definitions.foo ).to.deep.equal( {
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

			expect( definitions.foo ).to.have.property( 'isBlock', true );
			expect( definitions.foo ).to.have.property( 'isSelectable', false );
			expect( definitions.foo ).to.have.property( 'isInline', false );
		} );

		it( 'does not recompile definitions if not needed', () => {
			schema.register( 'foo' );

			expect( schema.getDefinitions() ).to.equal( schema.getDefinitions() );
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

			expect( definitions.foo ).to.deep.equal( {
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

			expect( definitions.foo ).to.deep.equal( {
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

			expect( definitions.paragraph ).to.deep.equal( {
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

			expect( definitions.paragraph ).to.deep.equal( {
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

			expect( schema.getDefinition( 'foo' ).isBlock ).to.be.true;
		} );

		it( 'returns a definition based on an element name', () => {
			schema.register( 'foo', {
				isBlock: true
			} );

			expect( schema.getDefinition( new Element( 'foo' ) ).isBlock ).to.be.true;
		} );

		it( 'returns a definition based on a text node', () => {
			schema.register( '$text', {
				isBlock: true
			} );

			expect( schema.getDefinition( new Text( 'foo' ) ).isBlock ).to.be.true;
		} );

		it( 'returns a definition based on a text proxy', () => {
			schema.register( '$text', {
				isBlock: true
			} );

			const text = new Text( 'foo' );
			const textProxy = new TextProxy( text, 0, 1 );

			expect( schema.getDefinition( textProxy ).isBlock ).to.be.true;
		} );

		it( 'returns a definition based on a schema context item', () => {
			schema.register( 'foo', {
				isBlock: true
			} );
			const ctx = new SchemaContext( [ '$root', 'foo' ] );

			expect( schema.getDefinition( ctx.last ).isBlock ).to.be.true;
		} );

		it( 'returns undefined when trying to get an non-registered item', () => {
			expect( schema.getDefinition( '404' ) ).to.be.undefined;
		} );
	} );

	describe( 'isRegistered()', () => {
		it( 'returns true if an item was registered', () => {
			schema.register( 'foo' );

			expect( schema.isRegistered( 'foo' ) ).to.be.true;
		} );

		it( 'returns false if an item was not registered', () => {
			expect( schema.isRegistered( 'foo' ) ).to.be.false;
		} );

		it( 'uses getDefinition()\'s item to definition normalization', () => {
			const stub = sinon.stub( schema, 'getDefinition' ).returns( {} );

			expect( schema.isRegistered( 'foo' ) ).to.be.true;
			expect( stub.calledOnce ).to.be.true;
		} );
	} );

	describe( 'isBlock()', () => {
		it( 'returns true if an item was registered as a block', () => {
			schema.register( 'foo', {
				isBlock: true
			} );

			expect( schema.isBlock( 'foo' ) ).to.be.true;
		} );

		it( 'returns false if an item was not registered as a block', () => {
			schema.register( 'foo' );

			expect( schema.isBlock( 'foo' ) ).to.be.false;
		} );

		it( 'returns false if an item was not registered at all', () => {
			expect( schema.isBlock( 'foo' ) ).to.be.false;
		} );

		it( 'uses getDefinition()\'s item to definition normalization', () => {
			const stub = sinon.stub( schema, 'getDefinition' ).returns( { isBlock: true } );

			expect( schema.isBlock( 'foo' ) ).to.be.true;
			expect( stub.calledOnce ).to.be.true;
		} );
	} );

	describe( 'isLimit()', () => {
		it( 'returns true if an item was registered as a limit element', () => {
			schema.register( 'foo', {
				isLimit: true
			} );

			expect( schema.isLimit( 'foo' ) ).to.be.true;
		} );

		it( 'returns true if an item was registered as an object element (because all objects are limits too)', () => {
			schema.register( 'foo', {
				isObject: true
			} );

			expect( schema.isLimit( 'foo' ) ).to.be.true;
		} );

		it( 'returns false if an item was not registered as a limit element', () => {
			schema.register( 'foo' );

			expect( schema.isLimit( 'foo' ) ).to.be.false;
		} );

		it( 'returns false if an item was not registered at all', () => {
			expect( schema.isLimit( 'foo' ) ).to.be.false;
		} );

		it( 'uses getDefinition()\'s item to definition normalization', () => {
			const stub = sinon.stub( schema, 'getDefinition' ).returns( { isLimit: true } );

			expect( schema.isLimit( 'foo' ) ).to.be.true;
			expect( stub.calledOnce ).to.be.true;
		} );
	} );

	describe( 'isObject()', () => {
		it( 'returns true if an item was registered as an object', () => {
			schema.register( 'foo', {
				isObject: true
			} );

			expect( schema.isObject( 'foo' ) ).to.be.true;
		} );

		it( 'returns true if an item is a limit, selectable, and a content at once (but not explicitely an object)', () => {
			schema.register( 'foo', {
				isLimit: true,
				isSelectable: true,
				isContent: true
			} );

			expect( schema.isObject( 'foo' ) ).to.be.true;
		} );

		it( 'returns false if an item was registered as a limit (because not all limits are objects)', () => {
			schema.register( 'foo', {
				isLimit: true
			} );

			expect( schema.isObject( 'foo' ) ).to.be.false;
		} );

		it( 'returns false if an item is a limit and a selectable but not a content ' +
			'(because an object must always find its way into data regardless of its children)',
		() => {
			schema.register( 'foo', {
				isLimit: true,
				isSelectable: true
			} );

			expect( schema.isObject( 'foo' ) ).to.be.false;
		} );

		it( 'returns false if an item is a limit and content but not a selectable ' +
			'(because the user must always be able to select an object)',
		() => {
			schema.register( 'foo', {
				isLimit: true,
				isContent: true
			} );

			expect( schema.isObject( 'foo' ) ).to.be.false;
		} );

		it( 'returns false if an item is a selectable and a content but not a limit ' +
			'(because an object should never be split or crossed by the selection)',
		() => {
			schema.register( 'foo', {
				isSelectable: true,
				isContent: true
			} );

			expect( schema.isObject( 'foo' ) ).to.be.false;
		} );

		it( 'returns false if an item was not registered as an object', () => {
			schema.register( 'foo' );

			expect( schema.isObject( 'foo' ) ).to.be.false;
		} );

		it( 'returns false if an item was not registered at all', () => {
			expect( schema.isObject( 'foo' ) ).to.be.false;
		} );

		it( 'uses getDefinition()\'s item to definition normalization', () => {
			const stub = sinon.stub( schema, 'getDefinition' ).returns( { isObject: true } );

			expect( schema.isObject( 'foo' ) ).to.be.true;
			expect( stub.calledOnce ).to.be.true;
		} );
	} );

	describe( 'isInline()', () => {
		it( 'returns true if an item was registered as inline', () => {
			schema.register( 'foo', {
				isInline: true
			} );

			expect( schema.isInline( 'foo' ) ).to.be.true;
		} );

		it( 'returns false if an item was registered as a limit (because not all limits are objects)', () => {
			schema.register( 'foo', {
				isLimit: true
			} );

			expect( schema.isInline( 'foo' ) ).to.be.false;
		} );

		it( 'returns false if an item was not registered as an object', () => {
			schema.register( 'foo' );

			expect( schema.isInline( 'foo' ) ).to.be.false;
		} );

		it( 'returns false if an item was not registered at all', () => {
			expect( schema.isInline( 'foo' ) ).to.be.false;
		} );

		it( 'uses getDefinition()\'s item to definition normalization', () => {
			const stub = sinon.stub( schema, 'getDefinition' ).returns( { isInline: true } );

			expect( schema.isInline( 'foo' ) ).to.be.true;
			expect( stub.calledOnce ).to.be.true;
		} );
	} );

	describe( 'isSelectable()', () => {
		it( 'should return true if an item was registered as a selectable', () => {
			schema.register( 'foo', {
				isSelectable: true
			} );

			expect( schema.isSelectable( 'foo' ) ).to.be.true;
		} );

		it( 'should return true if an item was registered as an object (because all objects are selectables)', () => {
			schema.register( 'foo', {
				isObject: true
			} );

			expect( schema.isSelectable( 'foo' ) ).to.be.true;
		} );

		it( 'should return false if an item was not registered as an object or selectable', () => {
			schema.register( 'foo' );

			expect( schema.isSelectable( 'foo' ) ).to.be.false;
		} );

		it( 'should return false if an item was not registered at all', () => {
			expect( schema.isSelectable( 'foo' ) ).to.be.false;
		} );

		it( 'uses getDefinition()\'s item to definition normalization', () => {
			const stub = sinon.stub( schema, 'getDefinition' ).returns( { isSelectable: true } );

			expect( schema.isSelectable( 'foo' ) ).to.be.true;
			expect( stub.calledOnce ).to.be.true;
		} );
	} );

	describe( 'isContent()', () => {
		it( 'should return true if an item was registered as a content', () => {
			schema.register( 'foo', {
				isContent: true
			} );

			expect( schema.isContent( 'foo' ) ).to.be.true;
		} );

		it( 'should return true if an item was registered as an object (because all objects are content)', () => {
			schema.register( 'foo', {
				isObject: true
			} );

			expect( schema.isContent( 'foo' ) ).to.be.true;
		} );

		it( 'should return false if an item was not registered as an object or a content', () => {
			schema.register( 'foo' );

			expect( schema.isContent( 'foo' ) ).to.be.false;
		} );

		it( 'should return false if an item was not registered at all', () => {
			expect( schema.isContent( 'foo' ) ).to.be.false;
		} );

		it( 'uses getDefinition()\'s item to definition normalization', () => {
			const stub = sinon.stub( schema, 'getDefinition' ).returns( { isContent: true } );

			expect( schema.isContent( 'foo' ) ).to.be.true;
			expect( stub.calledOnce ).to.be.true;
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
			expect( schema.checkChild( root1, 'paragraph' ) ).to.be.true;
			expect( schema.checkChild( root1, '$text' ) ).to.be.false;
		} );

		it( 'accepts a schemaContext instance as a context', () => {
			const rootContext = new SchemaContext( Position._createAt( root1, 0 ) );
			const paragraphContext = new SchemaContext( Position._createAt( r1p1, 0 ) );

			expect( schema.checkChild( rootContext, 'paragraph' ) ).to.be.true;
			expect( schema.checkChild( rootContext, '$text' ) ).to.be.false;

			expect( schema.checkChild( paragraphContext, '$text' ) ).to.be.true;
			expect( schema.checkChild( paragraphContext, 'paragraph' ) ).to.be.false;
		} );

		it( 'accepts a position as a context', () => {
			const posInRoot = Position._createAt( root1, 0 );
			const posInParagraph = Position._createAt( r1p1, 0 );

			expect( schema.checkChild( posInRoot, 'paragraph' ) ).to.be.true;
			expect( schema.checkChild( posInRoot, '$text' ) ).to.be.false;

			expect( schema.checkChild( posInParagraph, '$text' ) ).to.be.true;
			expect( schema.checkChild( posInParagraph, 'paragraph' ) ).to.be.false;
		} );

		// This is a temporary feature which is needed to make the current V->M conversion works.
		// It should be removed once V->M conversion uses real positions.
		// Of course, real positions have this advantage that we know element attributes at this point.
		it( 'accepts an array of element names as a context', () => {
			const contextInRoot = [ '$root' ];
			const contextInParagraph = [ '$root', 'paragraph' ];

			expect( schema.checkChild( contextInRoot, 'paragraph' ) ).to.be.true;
			expect( schema.checkChild( contextInRoot, '$text' ) ).to.be.false;

			expect( schema.checkChild( contextInParagraph, '$text' ) ).to.be.true;
			expect( schema.checkChild( contextInParagraph, 'paragraph' ) ).to.be.false;
		} );

		it( 'accepts an array of elements as a context', () => {
			const contextInRoot = [ root1 ];
			const contextInParagraph = [ root1, r1p1 ];

			expect( schema.checkChild( contextInRoot, 'paragraph' ) ).to.be.true;
			expect( schema.checkChild( contextInRoot, '$text' ) ).to.be.false;

			expect( schema.checkChild( contextInParagraph, '$text' ) ).to.be.true;
			expect( schema.checkChild( contextInParagraph, 'paragraph' ) ).to.be.false;
		} );

		// Again, this is needed temporarily to handle current V->M conversion
		it( 'accepts a mixed array of elements and strings as a context', () => {
			const contextInParagraph = [ '$root', r1p1 ];

			expect( schema.checkChild( contextInParagraph, '$text' ) ).to.be.true;
			expect( schema.checkChild( contextInParagraph, 'paragraph' ) ).to.be.false;
		} );

		it( 'accepts a node as a child', () => {
			expect( schema.checkChild( root1, r1p1 ) ).to.be.true;
			expect( schema.checkChild( root1, new Text( 'foo' ) ) ).to.be.false;
		} );

		it( 'fires the checkChild event with already normalized params', done => {
			schema.on( 'checkChild', ( evt, [ ctx, child ] ) => {
				expect( ctx ).to.be.instanceof( SchemaContext );
				expect( child ).to.equal( schema.getDefinition( 'paragraph' ) );

				done();
			}, { priority: 'highest' } );

			schema.checkChild( root1, r1p1 );
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
			expect( schema.checkAttribute( r1p1, 'align' ) ).to.be.true;
			expect( schema.checkAttribute( r1p1, 'bold' ) ).to.be.false;
		} );

		it( 'accepts a text as a context', () => {
			expect( schema.checkAttribute( new Text( 'foo' ), 'bold' ) ).to.be.true;
			expect( schema.checkAttribute( new Text( 'foo' ), 'align' ) ).to.be.false;
		} );

		it( 'accepts a position as a context', () => {
			const posInRoot = Position._createAt( root1, 0 );
			const posInParagraph = Position._createAt( r1p1, 0 );

			expect( schema.checkAttribute( posInRoot, 'align' ) ).to.be.false;
			expect( schema.checkAttribute( posInParagraph, 'align' ) ).to.be.true;
		} );

		it( 'accepts a schemaContext instance as a context', () => {
			const rootContext = new SchemaContext( Position._createAt( root1, 0 ) );
			const paragraphContext = new SchemaContext( Position._createAt( r1p1, 0 ) );

			expect( schema.checkAttribute( rootContext, 'align' ) ).to.be.false;
			expect( schema.checkAttribute( paragraphContext, 'align' ) ).to.be.true;
		} );

		it( 'accepts an array of node names as a context', () => {
			const contextInRoot = [ '$root' ];
			const contextInParagraph = [ '$root', 'paragraph' ];
			const contextInText = [ '$root', 'paragraph', '$text' ];

			expect( schema.checkAttribute( contextInRoot, 'align' ) ).to.be.false;
			expect( schema.checkAttribute( contextInParagraph, 'align' ) ).to.be.true;
			expect( schema.checkAttribute( contextInText, 'bold' ) ).to.be.true;
		} );

		it( 'accepts an array of nodes as a context', () => {
			const contextInRoot = [ root1 ];
			const contextInParagraph = [ root1, r1p1 ];
			const contextInText = [ root1, r1p1, r1p1.getChild( 0 ) ];

			expect( schema.checkAttribute( contextInRoot, 'align' ) ).to.be.false;
			expect( schema.checkAttribute( contextInParagraph, 'align' ) ).to.be.true;
			expect( schema.checkAttribute( contextInText, 'bold' ) ).to.be.true;
		} );

		it( 'fires the checkAttribute event with already normalized context', done => {
			schema.on( 'checkAttribute', ( evt, [ ctx, attributeName ] ) => {
				expect( ctx ).to.be.instanceof( SchemaContext );
				expect( attributeName ).to.equal( 'bold' );

				done();
			}, { priority: 'highest' } );

			schema.checkAttribute( r1p1, 'bold' );
		} );
	} );

	describe( 'addChildCheck()', () => {
		beforeEach( () => {
			schema.register( '$root' );
			schema.register( 'paragraph', {
				allowIn: '$root'
			} );
		} );

		it( 'adds a high-priority listener', () => {
			const order = [];

			schema.on( 'checkChild', () => {
				order.push( 'checkChild:high-before' );
			}, { priority: 'high' } );

			schema.addChildCheck( () => {
				order.push( 'addChildCheck' );
			} );

			schema.on( 'checkChild', () => {
				order.push( 'checkChild:high-after' );
			}, { priority: 'high' } );

			schema.checkChild( root1, r1p1 );

			expect( order.join() ).to.equal( 'checkChild:high-before,addChildCheck,checkChild:high-after' );
		} );

		it( 'stops the event and overrides the return value when callback returned true', () => {
			schema.register( '$text' );

			expect( schema.checkChild( root1, '$text' ) ).to.be.false;

			schema.addChildCheck( () => {
				return true;
			} );

			schema.on( 'checkChild', () => {
				throw new Error( 'the event should be stopped' );
			}, { priority: 'high' } );

			expect( schema.checkChild( root1, '$text' ) ).to.be.true;
		} );

		it( 'stops the event and overrides the return value when callback returned false', () => {
			expect( schema.checkChild( root1, r1p1 ) ).to.be.true;

			schema.addChildCheck( () => {
				return false;
			} );

			schema.on( 'checkChild', () => {
				throw new Error( 'the event should be stopped' );
			}, { priority: 'high' } );

			expect( schema.checkChild( root1, r1p1 ) ).to.be.false;
		} );

		it( 'receives context and child definition as params', () => {
			schema.addChildCheck( ( ctx, childDef ) => {
				expect( ctx ).to.be.instanceOf( SchemaContext );
				expect( childDef ).to.equal( schema.getDefinition( 'paragraph' ) );
			} );

			expect( schema.checkChild( root1, r1p1 ) ).to.be.true;
		} );

		it( 'is not called when checking a non-registered element', () => {
			expect( schema.getDefinition( 'foo' ) ).to.be.undefined;

			schema.addChildCheck( () => {
				throw new Error( 'callback should not be called' );
			} );

			expect( schema.checkChild( root1, 'foo' ) ).to.be.false;
		} );
	} );

	describe( 'addAttributeCheck()', () => {
		beforeEach( () => {
			schema.register( 'paragraph', {
				allowAttributes: 'foo'
			} );
		} );

		it( 'adds a high-priority listener', () => {
			const order = [];

			schema.on( 'checkAttribute', () => {
				order.push( 'checkAttribute:high-before' );
			}, { priority: 'high' } );

			schema.addAttributeCheck( () => {
				order.push( 'addAttributeCheck' );
			} );

			schema.on( 'checkAttribute', () => {
				order.push( 'checkAttribute:high-after' );
			}, { priority: 'high' } );

			schema.checkAttribute( r1p1, 'foo' );

			expect( order.join() ).to.equal( 'checkAttribute:high-before,addAttributeCheck,checkAttribute:high-after' );
		} );

		it( 'stops the event and overrides the return value when callback returned true', () => {
			expect( schema.checkAttribute( r1p1, 'bar' ) ).to.be.false;

			schema.addAttributeCheck( () => {
				return true;
			} );

			schema.on( 'checkAttribute', () => {
				throw new Error( 'the event should be stopped' );
			}, { priority: 'high' } );

			expect( schema.checkAttribute( r1p1, 'bar' ) ).to.be.true;
		} );

		it( 'stops the event and overrides the return value when callback returned false', () => {
			expect( schema.checkAttribute( r1p1, 'foo' ) ).to.be.true;

			schema.addAttributeCheck( () => {
				return false;
			} );

			schema.on( 'checkAttribute', () => {
				throw new Error( 'the event should be stopped' );
			}, { priority: 'high' } );

			expect( schema.checkAttribute( r1p1, 'foo' ) ).to.be.false;
		} );

		it( 'receives context and attribute name as params', () => {
			schema.addAttributeCheck( ( ctx, attributeName ) => {
				expect( ctx ).to.be.instanceOf( SchemaContext );
				expect( attributeName ).to.equal( 'foo' );
			} );

			expect( schema.checkAttribute( r1p1, 'foo' ) ).to.be.true;
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
			const paragraph = new Element( 'paragraph', null, [
				new Text( 'xyz' )
			] );
			const blockQuote = new Element( 'blockQuote', null, [ paragraph ] );
			const listItem = new Element( 'listItem' );

			expect( schema.checkMerge( listItem, blockQuote ) ).to.be.false;
		} );

		it( 'returns false if a block cannot be merged with other block (disallowed element is not the first child)', () => {
			const paragraph = new Element( 'paragraph', null, [
				new Text( 'foo' )
			] );
			const blockQuote = new Element( 'blockQuote', null, [
				new Text( 'bar', { bold: true } ),
				new Text( 'xyz' ),
				paragraph
			] );
			const listItem = new Element( 'listItem' );

			expect( schema.checkMerge( listItem, blockQuote ) ).to.be.false;
		} );

		it( 'returns true if a block can be merged with other block', () => {
			const listItem = new Element( 'listItem' );
			const listItemToMerge = new Element( 'listItem', null, [
				new Text( 'xyz' )
			] );

			expect( schema.checkMerge( listItem, listItemToMerge ) ).to.be.true;
		} );

		it( 'return true if two elements between the position can be merged', () => {
			const listItem = new Element( 'listItem', null, [
				new Text( 'foo' )
			] );
			const listItemToMerge = new Element( 'listItem', null, [
				new Text( 'bar' )
			] );

			// eslint-disable-next-line no-new
			new Element( '$root', null, [
				listItem, listItemToMerge
			] );
			const position = Position._createAfter( listItem );

			expect( schema.checkMerge( position ) ).to.be.true;
		} );

		it( 'return false if elements on the left is a block object', () => {
			const left = new Element( 'blockObject' );
			const right = new Element( 'paragraph' );

			expect( schema.checkMerge( left, right ) ).to.be.false;
		} );

		it( 'return false if elements on the right is a block object', () => {
			const left = new Element( 'paragraph' );
			const right = new Element( 'blockObject' );

			expect( schema.checkMerge( left, right ) ).to.be.false;
		} );

		it( 'return false if both elements are block objects', () => {
			const left = new Element( 'blockObject' );
			const right = new Element( 'blockObject' );

			expect( schema.checkMerge( left, right ) ).to.be.false;
		} );

		it( 'return false if both elements are inline objects', () => {
			const left = new Element( 'inlineObject' );
			const right = new Element( 'inlineObject' );

			expect( schema.checkMerge( left, right ) ).to.be.false;
		} );

		it( 'throws an error if there is no element before the position', () => {
			const listItem = new Element( 'listItem', null, [
				new Text( 'foo' )
			] );

			// eslint-disable-next-line no-new
			new Element( '$root', null, [
				listItem
			] );

			const position = Position._createBefore( listItem );

			expectToThrowCKEditorError( () => {
				expect( schema.checkMerge( position ) );
			}, 'schema-check-merge-no-element-before', schema );
		} );

		it( 'throws an error if the node before the position is not the element', () => {
			const listItem = new Element( 'listItem', null, [
				new Text( 'foo' )
			] );

			// eslint-disable-next-line no-new
			new Element( '$root', null, [
				new Text( 'bar' ),
				listItem
			] );

			const position = Position._createBefore( listItem );

			expectToThrowCKEditorError( () => {
				expect( schema.checkMerge( position ) );
			}, 'schema-check-merge-no-element-before', schema );
		} );

		it( 'throws an error if there is no element after the position', () => {
			const listItem = new Element( 'listItem', null, [
				new Text( 'foo' )
			] );

			// eslint-disable-next-line no-new
			new Element( '$root', null, [
				listItem
			] );

			const position = Position._createAfter( listItem );

			expectToThrowCKEditorError( () => {
				expect( schema.checkMerge( position ) );
			}, 'schema-check-merge-no-element-after', schema );
		} );

		it( 'throws an error if the node after the position is not the element', () => {
			const listItem = new Element( 'listItem', null, [
				new Text( 'foo' )
			] );

			// eslint-disable-next-line no-new
			new Element( '$root', null, [
				listItem,
				new Text( 'bar' )
			] );

			const position = Position._createBefore( listItem );

			expectToThrowCKEditorError( () => {
				expect( schema.checkMerge( position ) );
			}, 'schema-check-merge-no-element-before', schema );
		} );

		// This is an invalid case by definition – the baseElement should not contain disallowed elements
		// in the first place. However, the check is focused on the elementToMerge's children so let's make sure
		// that only them counts.
		it( 'returns true if element to merge contains a valid content but base element contains disallowed elements', () => {
			const listItem = new Element( 'listItem', null, [
				new Text( 'foo' ),
				new Element( 'paragraph', null, [
					new Text( 'bar' )
				] )
			] );
			const listItemToMerge = new Element( 'listItem', null, [
				new Text( 'xyz' )
			] );

			expect( schema.checkMerge( listItem, listItemToMerge ) ).to.be.true;
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
			expect( schema.isLimit( '$root' ) ).to.be.false;

			setData( model, '<div><section><article><paragraph>foo[]bar</paragraph></article></section></div>' );
			expect( schema.getLimitElement( doc.selection ) ).to.equal( root );
		} );

		it( 'returns the limit element which is the closest element to common ancestor for collapsed selection', () => {
			schema.extend( 'article', { isLimit: true } );
			schema.extend( 'section', { isLimit: true } );

			setData( model, '<div><section><article><paragraph>foo[]bar</paragraph></article></section></div>' );

			const article = root.getNodeByPath( [ 0, 0, 0 ] );

			expect( schema.getLimitElement( doc.selection ) ).to.equal( article );
		} );

		it( 'returns the limit element which is the closest element to common ancestor for non-collapsed selection', () => {
			schema.extend( 'article', { isLimit: true } );
			schema.extend( 'section', { isLimit: true } );

			model.enqueueChange( { isUndoable: false }, () => {
				setData( model, '<div><section><article>[foo</article><article>bar]</article></section></div>' );

				const section = root.getNodeByPath( [ 0, 0 ] );

				expect( schema.getLimitElement( doc.selection ) ).to.equal( section );
			} );
		} );

		it( 'works fine with multi-range selections', () => {
			schema.extend( 'article', { isLimit: true } );
			schema.extend( 'widget', { isLimit: true } );
			schema.extend( 'div', { isLimit: true } );

			setData(
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
			expect( schema.getLimitElement( doc.selection ) ).to.equal( div );
		} );

		it( 'works fine with multi-range selections even if limit elements are not defined', () => {
			setData(
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

			expect( schema.getLimitElement( doc.selection ) ).to.equal( root );
		} );

		it( 'works fine with multi-range selections if the first range has the root element as a limit element', () => {
			setData(
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

			expect( schema.getLimitElement( doc.selection ) ).to.equal( root );
		} );

		it( 'works fine with multi-range selections if the last range has the root element as a limit element', () => {
			setData(
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

			expect( schema.getLimitElement( doc.selection ) ).to.equal( root );
		} );

		it( 'accepts range as an argument', () => {
			schema.extend( 'article', { isLimit: true } );
			schema.extend( 'section', { isLimit: true } );

			const data = '<div><section><article><paragraph>foobar</paragraph></article></section></div>';
			const parsedModel = parse( data, model.schema, { context: [ root.name ] } );

			model.change( writer => {
				writer.insert( parsedModel, root );
			} );

			const article = root.getNodeByPath( [ 0, 0, 0 ] );

			expect( schema.getLimitElement( new Range( new Position( root, [ 0, 0, 0, 0, 2 ] ) ) ) ).to.equal( article );
		} );

		it( 'accepts position as an argument', () => {
			schema.extend( 'article', { isLimit: true } );
			schema.extend( 'section', { isLimit: true } );

			const data = '<div><section><article><paragraph>foobar</paragraph></article></section></div>';
			const parsedModel = parse( data, model.schema, { context: [ root.name ] } );

			model.change( writer => {
				writer.insert( parsedModel, root );
			} );

			const article = root.getNodeByPath( [ 0, 0, 0 ] );

			expect( schema.getLimitElement( new Position( root, [ 0, 0, 0, 0, 2 ] ) ) ).to.equal( article );
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
				setData( model, '<p>f[]oo</p>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.true;
			} );

			it( 'should return false if characters with the attribute cannot be placed at caret position', () => {
				setData( model, '<h1>[]</h1>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.false;

				setData( model, '[]' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.false;
			} );

			it( 'should check attributes of the selection (selection inside the $text[bold])', () => {
				setData( model, '<p><$text bold="true">f[]oo</$text></p>' );

				expect( schema.checkAttributeInSelection( doc.selection, 'italic' ) ).to.be.false;

				model.change( writer => {
					writer.removeSelectionAttribute( 'bold' );
				} );

				expect( schema.checkAttributeInSelection( doc.selection, 'italic' ) ).to.be.true;
			} );

			it( 'should check attributes of the selection (attribute set manually on selection)', () => {
				setData( model, '<p>foo[]bar</p>' );

				expect( schema.checkAttributeInSelection( doc.selection, 'italic' ) ).to.be.true;

				model.change( writer => {
					writer.setSelectionAttribute( 'bold', true );
				} );

				expect( schema.checkAttributeInSelection( doc.selection, 'italic' ) ).to.be.false;
			} );

			it( 'should pass all selection\'s attributes to checkAttribute()', done => {
				schema.on( 'checkAttribute', ( evt, args ) => {
					const context = args[ 0 ];
					const attributeName = args[ 1 ];

					expect( attributeName ).to.equal( 'italic' );
					expect( Array.from( context.last.getAttributeKeys() ) ).to.deep.equal( [ 'bold', 'underline' ] );

					done();
				}, { priority: 'highest' } );

				setData( model, '<p>foo[]bar</p>' );

				model.change( writer => {
					writer.setSelectionAttribute( 'bold', true );
					writer.setSelectionAttribute( 'underline', true );
				} );

				expect( schema.checkAttributeInSelection( doc.selection, 'italic' ) ).to.be.false;
			} );
		} );

		describe( 'when selection is not collapsed', () => {
			it( 'should return true if there is at least one node in selection that can have the attribute', () => {
				// Simple selection on a few characters.
				setData( model, '<p>[foo]</p>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.true;

				// Selection spans over characters but also include nodes that can't have attribute.
				setData( model, '<p>fo[o<img />b]ar</p>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.true;

				// Selection on whole root content. Characters in P can have an attribute so it's valid.
				setData( model, '[<p>foo<img />bar</p><h1></h1>]' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.true;

				// Selection on empty P. P can have the attribute.
				setData( model, '[<p></p>]' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.true;
			} );

			it( 'should return false if there are no nodes in selection that can have the attribute', () => {
				// Selection on DIV which can't have bold text.
				setData( model, '[<h1></h1>]' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.false;

				// Selection on two images which can't be bold.
				setData( model, '<p>foo[<img /><img />]bar</p>' );
				expect( schema.checkAttributeInSelection( doc.selection, attribute ) ).to.be.false;
			} );

			it( 'should return true when checking element with required attribute', () => {
				setData( model, '[<figure name="figure"></figure>]' );
				expect( schema.checkAttributeInSelection( doc.selection, 'title' ) ).to.be.true;
			} );

			it( 'should return true when checking element when attribute is already present', () => {
				setData( model, '[<figure name="figure" title="title"></figure>]' );
				expect( schema.checkAttributeInSelection( doc.selection, 'title' ) ).to.be.true;
			} );

			it( 'should check attributes of text', () => {
				setData( model, '<p><$text bold="true">f[o]o</$text></p>' );
				expect( schema.checkAttributeInSelection( doc.selection, 'italic' ) ).to.be.false;
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

		function testValidRangesForAttribute( input, attribute, output ) {
			setData( model, input );

			const validRanges = schema.getValidRanges( doc.selection.getRanges(), attribute );
			const sel = model.createSelection( validRanges );

			expect( stringify( root, sel ) ).to.equal( output );
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

			setData( model, '[<p>foo<img></img>bar</p>]' );

			const validRanges = Array.from( schema.getValidRanges( doc.selection.getRanges(), 'foo' ) );

			expect( validRanges.length ).to.equal( 2 );

			expect( validRanges[ 0 ].start.path ).to.deep.equal( [ 0, 0 ] );
			expect( validRanges[ 0 ].end.path ).to.deep.equal( [ 0, 7 ] );

			expect( validRanges[ 1 ].start.path ).to.deep.equal( [ 0 ] );
			expect( validRanges[ 1 ].end.path ).to.deep.equal( [ 1 ] );
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

			expect( range ).to.be.null;
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
					setData( model, data );
					range = schema.getNearestSelectionRange( selection.anchor, direction );
				} );

				if ( expected === null ) {
					expect( range ).to.be.null;
				} else {
					model.change( writer => {
						writer.setSelection( range );
					} );
					expect( getData( model ) ).to.equal( expected );
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
			const node = new Element( 'paragraph' );

			const allowedParent = schema.findAllowedParent( Position._createAt( r1bQp, 0 ), node );

			expect( allowedParent ).to.equal( r1bQ );
		} );

		it( 'should return position ancestor that allows to insert given node to it - works with a string too', () => {
			const allowedParent = schema.findAllowedParent( Position._createAt( r1bQp, 0 ), 'paragraph' );

			expect( allowedParent ).to.equal( r1bQ );
		} );

		it( 'should return position ancestor that allows to insert given node to it when position is already i such an element', () => {
			const node = new Text( 'text' );

			const parent = schema.findAllowedParent( Position._createAt( r1bQp, 0 ), node );

			expect( parent ).to.equal( r1bQp );
		} );

		it( 'should return null when limit element is reached before allowed parent', () => {
			schema.extend( 'blockQuote', {
				isLimit: true
			} );
			schema.register( 'div', {
				allowIn: '$root'
			} );
			const node = new Element( 'div' );

			const parent = schema.findAllowedParent( Position._createAt( r1bQp, 0 ), node );

			expect( parent ).to.null;
		} );

		it( 'should return null when object element is reached before allowed parent', () => {
			schema.extend( 'blockQuote', {
				isObject: true
			} );
			schema.register( 'div', {
				allowIn: '$root'
			} );
			const node = new Element( 'div' );

			const parent = schema.findAllowedParent( Position._createAt( r1bQp, 0 ), node );

			expect( parent ).to.null;
		} );

		it( 'should return null when there is no allowed ancestor for given position', () => {
			const node = new Element( 'section' );

			const parent = schema.findAllowedParent( Position._createAt( r1bQp, 0 ), node );

			expect( parent ).to.null;
		} );

		it( 'should return null when there is no allowed ancestor for given position – works with a string too', () => {
			const parent = schema.findAllowedParent( Position._createAt( r1bQp, 0 ), 'section' );

			expect( parent ).to.null;
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

			const text = new Text( 'foo', { a: 1, b: 1 } );
			const image = new Element( 'imageBlock', { a: 1, b: 1 } );

			root._appendChild( [ text, image ] );

			model.change( writer => {
				schema.removeDisallowedAttributes( root.getChildren(), writer );

				expect( Array.from( text.getAttributeKeys() ) ).to.deep.equal( [ 'a' ] );
				expect( Array.from( image.getAttributeKeys() ) ).to.deep.equal( [ 'b' ] );

				expect( writer.batch.operations ).to.length( 2 );
				expect( writer.batch.operations[ 0 ] ).to.instanceof( AttributeOperation );
				expect( writer.batch.operations[ 1 ] ).to.instanceof( AttributeOperation );

				expect( getData( model, { withoutSelection: true } ) )
					.to.equal( '<$text a="1">foo</$text><imageBlock b="1"></imageBlock>' );
			} );
		} );

		it( 'should filter out disallowed attributes from empty element', () => {
			schema.extend( 'div', { allowAttributes: 'a' } );

			const div = new Element( 'div', { a: 1, b: 1 } );

			root._appendChild( [ div ] );

			model.change( writer => {
				schema.removeDisallowedAttributes( [ div ], writer );

				expect( getData( model, { withoutSelection: true } ) )
					.to.equal( '<div a="1"></div>' );
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

			const foo = new Text( 'foo', { a: 1, b: 1 } );
			const bar = new Text( 'bar', { a: 1, b: 1 } );
			const imageInDiv = new Element( 'imageBlock', { a: 1, b: 1 } );
			const imageInParagraph = new Element( 'imageBlock', { a: 1, b: 1 } );
			const paragraph = new Element( 'paragraph', { a: 1, b: 1 }, [ foo, imageInParagraph ] );
			const div = new Element( 'div', [], [ paragraph, bar, imageInDiv ] );

			root._appendChild( [ div ] );

			model.change( writer => {
				schema.removeDisallowedAttributes( root.getChildren(), writer );

				expect( getData( model, { withoutSelection: true } ) )
					.to.equal(
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

			const foo = new Text( 'foo', { a: 1, b: 1 } );
			const div = new Element( 'div', { a: 1, b: 1 }, [ foo ] );

			root._appendChild( [ div ] );

			model.change( writer => {
				schema.removeDisallowedAttributes( root.getChildren(), writer );

				expect( getData( model, { withoutSelection: true } ) )
					.to.equal( '<div a="1"><$text b="1">foo</$text></div>' );
			} );
		} );

		it( 'should filter out all attributes from nodes that are merged while clearing', () => {
			const a = new Text( 'a', { a: 1, b: 1 } );
			const b = new Text( 'b', { b: 1 } );
			const c = new Text( 'c', { a: 1, b: 1 } );
			const div = new Element( 'div', [], [ a, b, c ] );

			root._appendChild( [ div ] );

			model.change( writer => {
				schema.removeDisallowedAttributes( [ div ], writer );

				expect( getData( model, { withoutSelection: true } ) ).to.equal( '<div>abc</div>' );
			} );
		} );

		it( 'should do not filter out sibling nodes', () => {
			const foo = new Text( 'foo', { a: 1 } );
			const bar = new Text( 'bar', { a: 1, b: 1 } );
			const biz = new Text( 'biz', { a: 1 } );
			const div = new Element( 'div', [], [ foo, bar, biz ] );

			root._appendChild( [ div ] );

			model.change( writer => {
				schema.removeDisallowedAttributes( [ bar ], writer );

				expect( getData( model, { withoutSelection: true } ) )
					.to.equal( '<div><$text a="1">foo</$text>bar<$text a="1">biz</$text></div>' );
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

			expect( root.getAttribute( 'allowed' ) ).to.equal( 'value' );
			expect( root.getAttribute( 'other' ) ).to.be.undefined;
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

			const text = new Text( 'foo', { a: 1 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isFooable' );

			expect( attributesWithProperty ).to.deep.equal( { a: 1 } );
		} );

		it( 'should get attributes with given property', () => {
			schema.extend( '$text', { allowAttributes: [ 'a', 'b' ] } );

			schema.setAttributeProperties( 'a', {
				isFooable: true
			} );

			schema.setAttributeProperties( 'b', {
				isFooable: true
			} );

			const text = new Text( 'foo', { a: 1, b: 2 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isFooable' );

			expect( attributesWithProperty ).to.deep.equal( { a: 1, b: 2 } );
		} );

		it( 'should get an attribute with given property that matches desired value', () => {
			schema.extend( '$text', { allowAttributes: [ 'a' ] } );

			schema.setAttributeProperties( 'a', {
				isFooable: 'yes'
			} );

			const text = new Text( 'foo', { a: 1 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isFooable', 'yes' );

			expect( attributesWithProperty ).to.deep.equal( { a: 1 } );
		} );

		it( 'should get attributes with given property that match desired value', () => {
			schema.extend( '$text', { allowAttributes: [ 'a', 'b' ] } );

			schema.setAttributeProperties( 'a', {
				isFooable: 'yes'
			} );

			schema.setAttributeProperties( 'b', {
				isFooable: 'yes'
			} );

			const text = new Text( 'foo', { a: 1, b: 2 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isFooable', 'yes' );

			expect( attributesWithProperty ).to.deep.equal( { a: 1, b: 2 } );
		} );

		it( 'should not return an attribute if it has properties but not the one being lookied for', () => {
			schema.extend( '$text', { allowAttributes: [ 'a' ] } );

			schema.setAttributeProperties( 'a', {
				isFooable: true
			} );

			const text = new Text( 'foo', { a: 1 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isBarable' );

			expect( attributesWithProperty ).to.deep.equal( {} );
		} );

		it( 'should not return an attribute if it does not have given property', () => {
			schema.extend( '$text', { allowAttributes: [ 'a' ] } );

			const text = new Text( 'foo', { a: 1 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isFooable' );

			expect( attributesWithProperty ).to.deep.equal( {} );
		} );

		it( 'should not return an attribute if value does not match', () => {
			schema.extend( '$text', { allowAttributes: [ 'a' ] } );

			schema.setAttributeProperties( 'a', {
				isFooable: 'no'
			} );

			const text = new Text( 'foo', { a: 1 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isFooable', 'yes' );

			expect( attributesWithProperty ).to.deep.equal( {} );
		} );

		it( 'should return only an attribute that matches value', () => {
			schema.extend( '$text', { allowAttributes: [ 'a', 'b' ] } );

			schema.setAttributeProperties( 'a', {
				isFooable: 'no'
			} );

			schema.setAttributeProperties( 'b', {
				isFooable: 'yes'
			} );

			const text = new Text( 'foo', { a: 1, b: 2 } );

			root._appendChild( text );

			const attributesWithProperty = schema.getAttributesWithProperty( root.getChild( 0 ), 'isFooable', 'yes' );

			expect( attributesWithProperty ).to.deep.equal( { b: 2 } );
		} );
	} );

	describe( 'definitions compilation', () => {
		describe( 'allowIn cases', () => {
			it( 'passes $root>paragraph', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).to.be.true;
			} );

			it( 'passes $root>paragraph and $root2>paragraph – support for array values', () => {
				schema.register( '$root' );
				schema.register( '$root2' );
				schema.register( 'paragraph', {
					allowIn: [ '$root', '$root2' ]
				} );

				expect( schema.checkChild( root1, r1p1 ) ).to.be.true;
				expect( schema.checkChild( root2, r1p1 ) ).to.be.true;
			} );

			it( 'passes $root>paragraph[align] – attributes does not matter', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( root1, r1p2 ) ).to.be.true;
			} );

			it( 'passes $root>div>div – in case of circular refs', () => {
				schema.register( '$root' );
				schema.register( 'div', {
					allowIn: [ '$root', 'div' ]
				} );

				const div = new Element( 'div' );
				root1._appendChild( div );

				const div2 = new Element( 'div' );

				expect( schema.checkChild( div, div2 ) ).to.be.true;
			} );

			it( 'passes $root>div>div – in case of circular refs, when div1==div2', () => {
				schema.register( '$root' );
				schema.register( 'div', {
					allowIn: [ '$root', 'div' ]
				} );

				const div = new Element( 'div' );
				root1._appendChild( div );

				expect( schema.checkChild( div, div ) ).to.be.true;
			} );

			it( 'rejects $root>paragraph – non-registered paragraph', () => {
				schema.register( '$root' );

				expect( schema.checkChild( root1, r1p1 ) ).to.be.false;
			} );

			it( 'rejects $root>paragraph – registered different item', () => {
				schema.register( '$root' );
				schema.register( 'paragraph' );
				schema.register( 'listItem', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).to.be.false;
			} );

			it( 'rejects $root>paragraph – paragraph allowed in different context', () => {
				schema.register( '$root' );
				schema.register( '$fancyRoot' );
				schema.register( 'paragraph', {
					allowIn: '$fancyRoot'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).to.be.false;
			} );

			it( 'rejects $root>blockQuote>paragraph – since paragraph is only allowed in $root', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( r1bQ, r1bQp ) ).to.be.false;
			} );

			it( 'rejects $root>blockQuote>paragraph – since paragraph is only allowed in $root v2', () => {
				schema.register( '$root' );
				schema.register( 'blockQuote', {
					allowIn: '$root'
				} );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( r1bQ, r1bQp ) ).to.be.false;
			} );

			it( 'rejects $root>blockQuote>paragraph>$text - since paragraph is not allowed in blockQuote', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );
				schema.register( '$text', {
					allowIn: 'paragraph'
				} );

				expect( schema.checkChild( root1, r1bQp.getChild( 0 ) ) ).to.be.false;
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

				expect( schema.checkChild( root1, r1bQp.getChild( 0 ) ) ).to.be.false;
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

				expect( schema.checkChild( root1, r1p1 ) ).to.be.true;
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

				expect( schema.checkChild( root1, r1p1 ), '$root' ).to.be.true;
				expect( schema.checkChild( root2, r1p1 ), '$root2' ).to.be.true;
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

				expect( schema.checkChild( root1, r1p1 ) ).to.be.true;
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

				expect( schema.checkChild( root1, r1p1 ) ).to.be.true;
			} );

			it( 'rejects $root>paragraph – paragraph inherits from $block but $block is not allowed in $root', () => {
				schema.register( '$root' );
				schema.register( '$block' );
				schema.register( 'paragraph', {
					allowWhere: '$block'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).to.be.false;
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

				expect( schema.checkChild( root1, r1p1.getChild( 0 ) ) ).to.be.false;
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

				expect( schema.checkChild( root2, r1p1 ) ).to.be.true;
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

				const root3 = new Element( '$root3' );
				const heading1 = new Element( 'heading1' );

				expect( schema.checkChild( root3, r1p1 ), 'paragraph' ).to.be.true;
				expect( schema.checkChild( root3, heading1 ), 'heading1' ).to.be.true;
			} );

			it( 'passes $root2>paragraph – $root2 inherits from $root, order of definitions does not matter', () => {
				schema.register( '$root' );
				schema.register( '$root2', {
					allowContentOf: '$root'
				} );
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( root2, r1p1 ) ).to.be.true;
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

				expect( schema.checkChild( r1p1, r1p1.getChild( 0 ) ) ).to.be.true;
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

				expect( schema.checkChild( r1bQ, r1bQp ) ).to.be.true;
			} );

			it( 'rejects $root2>paragraph – $root2 inherits from $root, but paragraph is not allowed there anyway', () => {
				schema.register( '$root' );
				schema.register( 'paragraph' );
				schema.register( '$root2', {
					allowContentOf: '$root'
				} );

				expect( schema.checkChild( root2, r1p1 ) ).to.be.false;
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

				expect( schema.checkChild( r1p1, r1p1.getChild( 0 ) ) ).to.be.true;
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

				expect( schema.checkChild( root1, 'paragraph' ), 'root1' ).to.be.true;
				expect( schema.checkChild( root2, 'paragraph' ), 'root2' ).to.be.true;
			} );

			it( 'passes d>a where d inherits content of c which inherits content of b', () => {
				schema.register( 'b' );
				schema.register( 'a', { allowIn: 'b' } );
				schema.register( 'c', { allowContentOf: 'b' } );
				schema.register( 'd', { allowContentOf: 'c' } );

				const d = new Element( 'd' );

				expect( schema.checkChild( d, 'a' ) ).to.be.true;
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
			// 	expect( schema.checkChild( d, 'a' ) ).to.be.true;
			// } );
		} );

		describe( 'allowChildren', () => {
			it( 'allows item in another item', () => {
				schema.register( 'paragraph' );

				schema.register( '$root', {
					allowChildren: 'paragraph'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).to.be.true;
			} );

			it( 'supports the array syntax', () => {
				schema.register( 'paragraph' );
				schema.register( 'blockQuote' );

				schema.register( '$root', {
					allowChildren: [ 'paragraph', 'blockQuote' ]
				} );

				expect( schema.checkChild( root1, r1p1 ) ).to.be.true;
				expect( schema.checkChild( root1, r1bQ ) ).to.be.true;
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

				expect( schema.checkChild( r1p1, r1bQ ) ).to.be.true;
				expect( schema.checkChild( r1bQ, r1p1 ) ).to.be.true;
			} );

			it( 'supports self-reference', () => {
				schema.register( '$root', {
					allowChildren: 'paragraph'
				} );

				schema.register( 'paragraph', {
					allowChildren: 'paragraph'
				} );

				expect( schema.checkChild( r1p1, r1p1 ) ).to.be.true;
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

				const paragraph = new Element( 'paragraph' );
				root1._appendChild( paragraph );

				const div = new Element( 'div' );
				paragraph._appendChild( div );

				const blockQuote = new Element( 'blockQuote' );
				div._appendChild( blockQuote );

				expect( schema.checkChild( root1, paragraph ) ).to.be.true;
				expect( schema.checkChild( paragraph, div ) ).to.be.true;
				expect( schema.checkChild( div, blockQuote ) ).to.be.true;

				expect( schema.checkChild( paragraph, blockQuote ) ).to.be.false;
				expect( schema.checkChild( div, paragraph ) ).to.be.false;
			} );

			it( 'should keep allowChildren', () => {
				schema.register( '$root', {
					allowChildren: 'paragraph'
				} );

				schema.register( 'paragraph' );

				expect( schema.getDefinition( '$root' ) ).to.deep.equal( {
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

				expect( schema.getDefinition( '$root' ) ).to.deep.equal( {
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

				expect( schema.getDefinition( '$root' ) ).to.deep.equal( {
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

				expect( schema.getDefinition( 'paragraph' ) ).to.deep.equal( {
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

				expect( schema.getDefinition( 'paragraph' ) ).to.deep.equal( {
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

				expect( schema.getDefinition( 'paragraph' ) ).to.deep.equal( {
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

				expect( schema.getDefinition( 'blockQuote' ) ).to.deep.equal( {
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

				expect( schema.getDefinition( 'paragraph' ) ).to.deep.equal( {
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

				expect( schema.getDefinition( 'paragraph' ).isBlock ).to.be.true;
				expect( schema.getDefinition( 'paragraph' ).isLimit ).to.be.true;
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

				expect( schema.getDefinition( 'paragraph' ).isBlock ).to.be.true;
				expect( schema.getDefinition( 'paragraph' ).isLimit ).to.be.true;
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

				expect( schema.getDefinition( 'paragraph' ).isBlock ).to.be.true;
				expect( schema.getDefinition( 'paragraph' ).isLimit ).to.be.false;
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

				expect( schema.checkChild( root1, r1p1 ) ).to.be.true;
			} );

			it( 'paragraph inherit properties of $block', () => {
				schema.register( '$block', {
					isBlock: true
				} );
				schema.register( 'paragraph', {
					inheritAllFrom: '$block'
				} );

				expect( schema.isBlock( r1p1 ) ).to.be.true;
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

				expect( schema.checkChild( r1p1, r1p1.getChild( 0 ) ) ).to.be.true;
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

				expect( schema.checkChild( root1, r1p1 ) ).to.be.true;
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

				expect( schema.checkChild( r1p1, r1p1.getChild( 0 ) ) ).to.be.true;
			} );

			it( 'passes paragraph[align] – paragraph inherits attributes of $block', () => {
				schema.register( '$block', {
					allowAttributes: 'align'
				} );
				schema.register( 'paragraph', {
					inheritAllFrom: '$block'
				} );

				expect( schema.checkAttribute( r1p1, 'align' ) ).to.be.true;
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

				expect( schema.checkAttribute( r1p1, 'align' ) ).to.be.true;
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

				const notExisting = new Element( 'not-existing-elem' );
				r1p1._appendChild( notExisting );

				expect( schema.checkChild( root1, r1p1 ) ).to.be.true;
				expect( schema.checkChild( r1p1, notExisting ) ).to.be.false;
			} );

			it( 'does not keep the rule disallowIn when pointing to a non-registered element', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowIn: '$root',
					allowChildren: [ '$root' ],
					disallowIn: [ 'not-existing-elem' ]
				} );

				const notExisting = new Element( 'not-existing-elem' );
				const p = new Element( 'paragraph' );
				root1._appendChild( notExisting );

				expect( schema.checkChild( root1, r1p1 ) ).to.be.true;
				expect( schema.checkChild( notExisting, p ) ).to.be.false;
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

				expect( schema.checkChild( r1bQ, r1bQp ) ).to.be.false;
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

				expect( schema.checkChild( r1bQ, r1bQp ) ).to.be.false;
			} );

			it( 'disallows previously allowed items via disallowIn rule', () => {
				schema.register( '$root', { allowChildren: [ 'paragraph' ] } );
				schema.register( '$root2', { allowChildren: [ 'paragraph' ] } );
				schema.register( 'paragraph', {
					disallowIn: [ '$root', '$root2' ]
				} );

				expect( schema.checkChild( root1, r1p1 ) ).to.be.false;
				expect( schema.checkChild( root2, r1p1 ) ).to.be.false;
			} );

			it( 'disallows item if a rule contains both allowChildren and disallowChildren', () => {
				schema.register( '$root', {
					allowChildren: [ 'paragraph' ],
					disallowChildren: [ 'paragraph' ]
				} );

				schema.register( 'paragraph' );

				expect( schema.checkChild( root1, r1p1 ) ).to.be.false;
			} );

			it( 'disallows item if a rule contains both allowIn and disallowIn', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowIn: [ '$root' ],
					disallowIn: [ '$root' ]
				} );

				expect( schema.checkChild( root1, r1p1 ) ).to.be.false;
			} );

			it( 'disallowIn is inherited', () => {
				schema.register( 'baseParent' );
				schema.register( 'baseChild', { allowIn: [ 'baseParent' ] } );

				schema.register( 'extendedChild', { inheritAllFrom: 'baseChild', disallowIn: [ 'baseParent' ] } );
				schema.register( 'extendedChild2', { inheritAllFrom: 'extendedChild' } ); // Direct inherit of a disallow rule.
				schema.register( 'extendedChild3', { inheritAllFrom: 'extendedChild2' } ); // Indirect inherit of a disallow rule.

				expect( schema.checkChild( [ 'baseParent' ], 'baseChild' ) ).to.be.true;
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild' ) ).to.be.false;
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild2' ) ).to.be.false; // Direct inherit of a disallow rule.
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild3' ) ).to.be.false; // Indirect inherit of a disallow rule.

				// Check if rules for `baseParent` are correctly inherited.
				schema.register( 'extendedParent', { inheritAllFrom: 'baseParent' } );

				expect( schema.checkChild( [ 'extendedParent' ], 'baseChild' ) ).to.be.true;
				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild' ) ).to.be.false;
				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild2' ) ).to.be.false; // Direct inherit of a disallow rule.
				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild3' ) ).to.be.false; // Indirect inherit of a disallow rule.
			} );

			it( 'disallowChildren is inherited', () => {
				schema.register( 'baseParent' );
				schema.register( 'baseChild', { allowIn: [ 'baseParent' ] } );

				schema.register( 'extendedParent', { inheritAllFrom: 'baseParent', disallowChildren: [ 'baseChild' ] } );
				schema.register( 'extendedParent2', { inheritAllFrom: 'extendedParent' } ); // Direct inherit of a disallow rule.
				schema.register( 'extendedParent3', { inheritAllFrom: 'extendedParent2' } ); // Indirect inherit of a disallow rule.

				expect( schema.checkChild( [ 'baseParent' ], 'baseChild' ) ).to.be.true;
				expect( schema.checkChild( [ 'extendedParent' ], 'baseChild' ) ).to.be.false;
				expect( schema.checkChild( [ 'extendedParent2' ], 'baseChild' ) ).to.be.false; // Direct inherit of a disallow rule.
				expect( schema.checkChild( [ 'extendedParent3' ], 'baseChild' ) ).to.be.false; // Indirect inherit of a disallow rule.

				// Check if rules for `baseChild` are correctly inherited.
				schema.register( 'extendedChild', { inheritAllFrom: 'baseChild' } );

				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild' ) ).to.be.true;
				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild' ) ).to.be.false;
				expect( schema.checkChild( [ 'extendedParent2' ], 'extendedChild' ) ).to.be.false; // Direct inherit of a disallow rule.
				expect( schema.checkChild( [ 'extendedParent3' ], 'extendedChild' ) ).to.be.false; // Indirect inherit of a disallow rule.
			} );

			it( 'disallowIn disallows parents that inherit from the base parent', () => {
				schema.register( 'baseParent' );
				schema.register( 'baseChild', { allowIn: [ 'baseParent' ] } );

				schema.register( 'extendedParent', { inheritAllFrom: 'baseParent' } );
				schema.register( 'extendedChild', { inheritAllFrom: 'baseChild', disallowIn: 'extendedParent' } );

				schema.register( 'extendedParent2', { inheritAllFrom: 'extendedParent' } ); // Direct inherit of a disallow rule.
				schema.register( 'extendedParent3', { inheritAllFrom: 'extendedParent2' } ); // Indirect inherit of a disallow rule.

				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild' ) ).to.be.true;
				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild' ) ).to.be.false;
				expect( schema.checkChild( [ 'extendedParent2' ], 'extendedChild' ) ).to.be.false; // Direct inherit of a disallow rule.
				expect( schema.checkChild( [ 'extendedParent3' ], 'extendedChild' ) ).to.be.false; // Indirect inherit of a disallow rule.
			} );

			it( 'disallowChildren disallows children that inherit from the base child', () => {
				schema.register( 'baseParent' );
				schema.register( 'baseChild', { allowIn: [ 'baseParent' ] } );

				schema.register( 'extendedChild', { inheritAllFrom: 'baseChild' } );
				schema.register( 'extendedParent', { inheritAllFrom: 'baseParent', disallowChildren: [ 'extendedChild' ] } );

				schema.register( 'extendedChild2', { inheritAllFrom: 'extendedChild' } ); // Direct inherit of a disallow rule.
				schema.register( 'extendedChild3', { inheritAllFrom: 'extendedChild2' } ); // Indirect inherit of a disallow rule.

				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild' ) ).to.be.true;
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild2' ) ).to.be.true;
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild3' ) ).to.be.true;

				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild' ) ).to.be.false;
				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild2' ) ).to.be.false; // Direct inherit of a disallow rule.
				expect( schema.checkChild( [ 'extendedParent' ], 'extendedChild3' ) ).to.be.false; // Indirect inherit of a disallow rule.
			} );

			it( 'own allowIn rule has bigger priority than inherited (re-allow)', () => {
				schema.register( 'baseParent' );
				schema.register( 'baseChild', { allowIn: 'baseParent' } );
				schema.register( 'extendedChild', { inheritAllFrom: 'baseChild', disallowIn: 'baseParent' } );
				schema.register( 'extendedChild2', { inheritAllFrom: 'extendedChild', allowIn: 'baseParent' } );
				schema.register( 'extendedChild3', { inheritAllFrom: 'extendedChild2' } ); // Re-allow is inherited.

				expect( schema.checkChild( [ 'baseParent' ], 'baseChild' ) ).to.be.true;
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild' ) ).to.be.false;
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild2' ) ).to.be.true;
				expect( schema.checkChild( [ 'baseParent' ], 'extendedChild3' ) ).to.be.true; // Re-allow is inherited.
			} );

			it( 'own allowChildren rule has bigger priority than inherited (re-allow)', () => {
				schema.register( 'baseParent' );
				schema.register( 'baseChild', { allowIn: 'baseParent' } );
				schema.register( 'extendedParent', { inheritAllFrom: 'baseParent', disallowChildren: [ 'baseChild' ] } );
				schema.register( 'extendedParent2', { inheritAllFrom: 'extendedParent', allowChildren: [ 'baseChild' ] } );
				schema.register( 'extendedParent3', { inheritAllFrom: 'extendedParent2' } ); // Re-allow is inherited.

				expect( schema.checkChild( [ 'baseParent' ], 'baseChild' ) ).to.be.true;
				expect( schema.checkChild( [ 'extendedParent' ], 'baseChild' ) ).to.be.false;
				expect( schema.checkChild( [ 'extendedParent2' ], 'baseChild' ) ).to.be.true;
				expect( schema.checkChild( [ 'extendedParent3' ], 'baseChild' ) ).to.be.true; // Re-allow is inherited.
			} );
		} );

		describe( 'disallow rules - attributes', () => {
			it( 'disallows attribute in a paragraph with disallowAttributes rule', () => {
				schema.register( '$root' );
				schema.register( 'paragraph', {
					allowAttributes: [ 'alignment', 'listStyle', 'listType' ],
					disallowAttributes: [ 'listStyle' ]
				} );

				expect( schema.checkAttribute( r1p1, 'alignment' ) ).to.be.true;
				expect( schema.checkAttribute( r1p1, 'listStyle' ) ).to.be.false;
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

				const baseElem = new Element( 'baseElement' );
				const p = new Element( 'paragraph' );
				const pD = new Element( 'paragraphDescendant' );

				expect( schema.checkAttribute( baseElem, 'alignment' ) ).to.be.true;
				expect( schema.checkAttribute( baseElem, 'indent' ) ).to.be.true;
				expect( schema.checkAttribute( p, 'alignment' ) ).to.be.false;
				expect( schema.checkAttribute( p, 'indent' ) ).to.be.false;
				expect( schema.checkAttribute( pD, 'alignment' ) ).to.be.false;
				expect( schema.checkAttribute( pD, 'indent' ) ).to.be.false;
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
					.to.have.members( [ 'listStyle', 'listType', 'listStart' ] );
				expect( schema.getDefinition( 'paragraphDescendant' ).allowAttributes )
					.to.not.have.members( [ 'alignment', 'indent' ] );
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

				const baseElem = new Element( 'baseElement' );
				const p = new Element( 'paragraph' );
				const pD = new Element( 'paragraphDescendant' );

				expect( schema.checkAttribute( baseElem, 'indent' ) ).to.be.false;
				expect( schema.checkAttribute( p, 'listStart' ) ).to.be.false;
				expect( schema.checkAttribute( p, 'indent' ) ).to.be.false;
				expect( schema.checkAttribute( pD, 'listStart' ) ).to.be.true;
				expect( schema.checkAttribute( pD, 'indent' ) ).to.be.true;
			} );
		} );

		// We need to handle cases where some independent features registered definitions which might use
		// optional elements (elements which might not have been registered).
		describe( 'missing structure definitions', () => {
			it( 'does not break when trying to check a child which is not registered', () => {
				schema.register( '$root' );

				expect( schema.checkChild( root1, 'foo404' ) ).to.be.false;
			} );

			it( 'does not break when trying to check registered child in a context which contains non-registered elements', () => {
				const foo404 = new Element( 'foo404' );

				root1._appendChild( foo404 );

				schema.register( '$root' );
				schema.register( '$text', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( foo404, '$text' ) ).to.be.false;
			} );

			it( 'does not break when used allowedIn pointing to an non-registered element', () => {
				schema.register( '$root' );
				schema.register( '$text', {
					allowIn: 'foo404'
				} );

				expect( schema.checkChild( root1, '$text' ) ).to.be.false;
			} );

			it( 'does not break when used allowChildren pointing to an non-register element', () => {
				schema.register( '$root' );
				schema.register( '$text', {
					allowChildren: 'foo404'
				} );

				expect( schema.checkChild( root1, '$text' ) ).to.be.false;
			} );

			it( 'does not break when used allowWhere pointing to an non-registered element', () => {
				schema.register( '$root' );
				schema.register( '$text', {
					allowWhere: 'foo404'
				} );

				expect( schema.checkChild( root1, '$text' ) ).to.be.false;
			} );

			it( 'does not break when used allowContentOf pointing to an non-registered element', () => {
				schema.register( '$root', {
					allowContentOf: 'foo404'
				} );
				schema.register( '$text', {
					allowIn: '$root'
				} );

				expect( schema.checkChild( root1, '$text' ) ).to.be.true;
			} );

			it( 'checks whether allowIn uses a registered element', () => {
				schema.register( 'paragraph', {
					allowIn: '$root'
				} );
				// $root isn't registered!

				expect( schema.checkChild( root1, 'paragraph' ) ).to.be.false;
			} );

			it( 'does not break when inheriting all from an non-registered element', () => {
				schema.register( 'paragraph', {
					inheritAllFrom: '$block'
				} );

				expect( schema.checkChild( root1, r1p1 ) ).to.be.false;
			} );
		} );

		describe( 'allowAttributes', () => {
			it( 'passes paragraph[align]', () => {
				schema.register( 'paragraph', {
					allowAttributes: 'align'
				} );

				expect( schema.checkAttribute( r1p1, 'align' ) ).to.be.true;
			} );

			it( 'passes paragraph[align] and paragraph[dir] – support for array values', () => {
				schema.register( 'paragraph', {
					allowAttributes: [ 'align', 'dir' ]
				} );

				expect( schema.checkAttribute( r1p1, 'align' ), 'align' ).to.be.true;
				expect( schema.checkAttribute( r1p1, 'dir' ), 'dir' ).to.be.true;
			} );

			it( 'passes paragraph>$text[bold]', () => {
				schema.register( 'paragraph' );
				schema.register( '$text', {
					allowIn: 'paragraph',
					allowAttributes: 'bold'
				} );

				expect( schema.checkAttribute( r1p1.getChild( 0 ), 'bold' ) ).to.be.true;
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

				expect( schema.checkAttribute( r1p1, 'align' ) ).to.be.true;
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

				expect( schema.checkAttribute( r1p1, 'align' ), 'align' ).to.be.true;
				expect( schema.checkAttribute( r1p1, 'dir' ), 'dir' ).to.be.true;
			} );

			it( 'passes paragraph[align] and paragraph[dir] – support for combined allowAttributes and allowAttributesOf', () => {
				schema.register( '$block', {
					allowAttributes: 'align'
				} );
				schema.register( 'paragraph', {
					allowAttributes: 'dir',
					allowAttributesOf: '$block'
				} );

				expect( schema.checkAttribute( r1p1, 'align' ), 'align' ).to.be.true;
				expect( schema.checkAttribute( r1p1, 'dir' ), 'dir' ).to.be.true;
			} );

			// The support for allowAttributesOf is broken in the similar way as for allowContentOf (see the comment above).
			// However, those situations are rather theoretical, so we're not going to waste time on them now.
		} );

		describe( 'missing attribute definitions', () => {
			it( 'does not crash when checking an attribute of a non-registered element', () => {
				expect( schema.checkAttribute( r1p1, 'align' ) ).to.be.false;
			} );

			it( 'does not crash when inheriting attributes of a non-registered element', () => {
				schema.register( 'paragraph', {
					allowAttributesOf: '$block'
				} );

				expect( schema.checkAttribute( r1p1, 'whatever' ) ).to.be.false;
			} );

			it( 'does not crash when inheriting all from a non-registered element', () => {
				schema.register( 'paragraph', {
					allowAttributesOf: '$block'
				} );

				expect( schema.checkAttribute( r1p1, 'whatever' ) ).to.be.false;
			} );
		} );

		describe( 'missing types definitions', () => {
			it( 'does not crash when inheriting types of an non-registered element', () => {
				schema.register( 'paragraph', {
					inheritTypesFrom: '$block'
				} );

				expect( schema.getDefinition( 'paragraph' ) ).to.be.an( 'object' );
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

			root1 = new Element( '$root', null, [
				new Element( 'paragraph', null, 'foo' ),
				new Element( 'paragraph', { alignment: 'right' }, 'bar' ),
				new Element( 'listItem', { listType: 'x', listIndent: 0 }, 'foo' ),
				new Element( 'heading1', null, 'foo' ),
				new Element( 'blockQuote', null, [
					new Element( 'paragraph', null, 'foo' ),
					new Element( 'listItem', { listType: 'x', listIndent: 0 }, 'foo' ),
					new Element( 'imageBlock', null, [
						new Element( 'caption', null, 'foo' )
					] )
				] ),
				new Element( 'imageBlock', null, [
					new Element( 'caption', null, 'foo' )
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
			expect( schema.checkChild( root1, 'paragraph' ) ).to.be.true;
		} );

		it( 'passes $root>paragraph>$text', () => {
			expect( schema.checkChild( r1p1, '$text' ), 'paragraph' ).to.be.true;
			expect( schema.checkChild( r1p2, '$text' ), 'paragraph[alignment]' ).to.be.true;
		} );

		it( 'passes $root>listItem', () => {
			expect( schema.checkChild( root1, 'listItem' ) ).to.be.true;
		} );

		it( 'passes $root>listItem>$text', () => {
			expect( schema.checkChild( r1lI, '$text' ) ).to.be.true;
		} );

		it( 'passes $root>blockQuote>paragraph', () => {
			expect( schema.checkChild( r1bQ, 'paragraph' ) ).to.be.true;
		} );

		it( 'passes $root>blockQuote>paragraph>$text', () => {
			expect( schema.checkChild( r1bQp, '$text' ) ).to.be.true;
		} );

		it( 'passes $root>blockQuote>listItem', () => {
			expect( schema.checkChild( r1bQ, 'listItem' ) ).to.be.true;
		} );

		it( 'passes $root>blockQuote>listItem>$text', () => {
			expect( schema.checkChild( r1bQlI, '$text' ) ).to.be.true;
		} );

		it( 'passes $root>blockQuote>image', () => {
			expect( schema.checkChild( r1bQ, 'imageBlock' ) ).to.be.true;
		} );

		it( 'passes $root>blockQuote>image>caption', () => {
			expect( schema.checkChild( r1bQi, 'caption' ) ).to.be.true;
		} );

		it( 'passes $root>blockQuote>image>caption>$text', () => {
			expect( schema.checkChild( r1bQi.getChild( 0 ), '$text' ) ).to.be.true;
		} );

		it( 'passes $root>image', () => {
			expect( schema.checkChild( root1, 'imageBlock' ) ).to.be.true;
		} );

		it( 'passes $root>image>caption', () => {
			expect( schema.checkChild( r1i, 'caption' ) ).to.be.true;
		} );

		it( 'passes $root>image>caption>$text', () => {
			expect( schema.checkChild( r1i.getChild( 0 ), '$text' ) ).to.be.true;
		} );

		it( 'rejects $root>$root', () => {
			expect( schema.checkChild( root1, '$root' ) ).to.be.false;
		} );

		it( 'rejects $root>$text', () => {
			expect( schema.checkChild( root1, '$text' ) ).to.be.false;
		} );

		it( 'rejects $root>caption', () => {
			expect( schema.checkChild( root1, 'caption' ) ).to.be.false;
		} );

		it( 'rejects $root>paragraph>paragraph', () => {
			expect( schema.checkChild( r1p1, 'paragraph' ) ).to.be.false;
		} );

		it( 'rejects $root>paragraph>paragraph>$text', () => {
			// Edge case because p>p should not exist in the first place.
			// But it's good to know that it blocks also this.
			const p = new Element( 'p' );
			r1p1._appendChild( p );

			expect( schema.checkChild( p, '$text' ) ).to.be.false;
		} );

		it( 'rejects $root>paragraph>$block', () => {
			expect( schema.checkChild( r1p1, '$block' ) ).to.be.false;
		} );

		it( 'rejects $root>paragraph>blockQuote', () => {
			expect( schema.checkChild( r1p1, 'blockQuote' ) ).to.be.false;
		} );

		it( 'rejects $root>paragraph>image', () => {
			expect( schema.checkChild( r1p1, 'imageBlock' ) ).to.be.false;
		} );

		it( 'rejects $root>paragraph>caption', () => {
			expect( schema.checkChild( r1p1, 'caption' ) ).to.be.false;
		} );

		it( 'rejects $root>blockQuote>blockQuote', () => {
			expect( schema.checkChild( r1bQ, 'blockQuote' ) ).to.be.false;
		} );

		it( 'rejects $root>blockQuote>caption', () => {
			expect( schema.checkChild( r1p1, 'imageBlock' ) ).to.be.false;
		} );

		it( 'rejects $root>blockQuote>$text', () => {
			expect( schema.checkChild( r1bQ, '$text' ) ).to.be.false;
		} );

		it( 'rejects $root>image>$text', () => {
			expect( schema.checkChild( r1i, '$text' ) ).to.be.false;
		} );

		it( 'rejects $root>image>paragraph', () => {
			expect( schema.checkChild( r1i, 'paragraph' ) ).to.be.false;
		} );

		it( 'rejects $root>image>caption>paragraph', () => {
			expect( schema.checkChild( r1i.getChild( 0 ), 'paragraph' ) ).to.be.false;
		} );

		it( 'rejects $root>image>caption>blockQuote', () => {
			expect( schema.checkChild( r1i.getChild( 0 ), 'blockQuote' ) ).to.be.false;
		} );

		it( 'accepts attribute $root>paragraph[alignment]', () => {
			expect( schema.checkAttribute( r1p1, 'alignment' ) ).to.be.true;
		} );

		it( 'accepts attribute $root>paragraph>$text[bold]', () => {
			expect( schema.checkAttribute( r1p1.getChild( 0 ), 'bold' ) ).to.be.true;
		} );

		it( 'accepts attribute $root>heading1>$text[italic]', () => {
			expect( schema.checkAttribute( r1h.getChild( 0 ), 'italic' ) ).to.be.true;
		} );

		it( 'accepts attribute $root>blockQuote>paragraph>$text[bold]', () => {
			expect( schema.checkAttribute( r1bQp.getChild( 0 ), 'bold' ) ).to.be.true;
		} );

		it( 'accepts attribute $root>listItem[alignment]', () => {
			expect( schema.checkAttribute( r1lI, 'alignment' ) ).to.be.true;
		} );

		it( 'accepts attribute $root>listItem[indent]', () => {
			expect( schema.checkAttribute( r1lI, 'listIndent' ) ).to.be.true;
		} );

		it( 'accepts attribute $root>listItem[type]', () => {
			expect( schema.checkAttribute( r1lI, 'listType' ) ).to.be.true;
		} );

		it( 'accepts attribute $root>image[src]', () => {
			expect( schema.checkAttribute( r1i, 'src' ) ).to.be.true;
		} );

		it( 'accepts attribute $root>image[alt]', () => {
			expect( schema.checkAttribute( r1i, 'alt' ) ).to.be.true;
		} );

		it( 'accepts attribute $root>image>caption>$text[bold]', () => {
			expect( schema.checkAttribute( r1i.getChild( 0 ).getChild( 0 ), 'bold' ) ).to.be.true;
		} );

		it( 'rejects attribute $root[indent]', () => {
			expect( schema.checkAttribute( root1, 'listIndent' ) ).to.be.false;
		} );

		it( 'rejects attribute $root>paragraph[indent]', () => {
			expect( schema.checkAttribute( r1p1, 'listIndent' ) ).to.be.false;
		} );

		it( 'accepts attribute $root>heading1>$text[bold]', () => {
			expect( schema.checkAttribute( r1h.getChild( 0 ), 'bold' ) ).to.be.false;
		} );

		it( 'rejects attribute $root>paragraph>$text[alignment]', () => {
			expect( schema.checkAttribute( r1p1.getChild( 0 ), 'alignment' ) ).to.be.false;
		} );

		it( 'rejects attribute $root>blockQuote[indent]', () => {
			expect( schema.checkAttribute( r1bQ, 'listIndent' ) ).to.be.false;
		} );

		it( 'rejects attribute $root>blockQuote[alignment]', () => {
			expect( schema.checkAttribute( r1bQ, 'alignment' ) ).to.be.false;
		} );

		it( 'rejects attribute $root>image[indent]', () => {
			expect( schema.checkAttribute( r1i, 'listIndent' ) ).to.be.false;
		} );

		it( 'rejects attribute $root>image[alignment]', () => {
			expect( schema.checkAttribute( r1i, 'alignment' ) ).to.be.false;
		} );

		it( '$text is inline', () => {
			expect( schema.isLimit( '$text' ) ).to.be.false;
			expect( schema.isBlock( '$text' ) ).to.be.false;
			expect( schema.isObject( '$text' ) ).to.be.false;
			expect( schema.isInline( '$text' ) ).to.be.true;
		} );

		it( '$root is limit', () => {
			expect( schema.isLimit( '$root' ) ).to.be.true;
			expect( schema.isBlock( '$root' ) ).to.be.false;
			expect( schema.isObject( '$root' ) ).to.be.false;
			expect( schema.isInline( '$root' ) ).to.be.false;
		} );

		it( 'paragraph is block', () => {
			expect( schema.isLimit( 'paragraph' ) ).to.be.false;
			expect( schema.isBlock( 'paragraph' ) ).to.be.true;
			expect( schema.isObject( 'paragraph' ) ).to.be.false;
			expect( schema.isInline( 'paragraph' ) ).to.be.false;
		} );

		it( 'heading1 is block', () => {
			expect( schema.isLimit( 'heading1' ) ).to.be.false;
			expect( schema.isBlock( 'heading1' ) ).to.be.true;
			expect( schema.isObject( 'heading1' ) ).to.be.false;
			expect( schema.isInline( 'heading1' ) ).to.be.false;
		} );

		it( 'listItem is block', () => {
			expect( schema.isLimit( 'listItem' ) ).to.be.false;
			expect( schema.isBlock( 'listItem' ) ).to.be.true;
			expect( schema.isObject( 'listItem' ) ).to.be.false;
			expect( schema.isInline( 'lisItem' ) ).to.be.false;
		} );

		it( 'image is block object', () => {
			expect( schema.isLimit( 'imageBlock' ) ).to.be.true;
			expect( schema.isBlock( 'imageBlock' ) ).to.be.true;
			expect( schema.isObject( 'imageBlock' ) ).to.be.true;
			expect( schema.isInline( 'imageBlock' ) ).to.be.false;
		} );

		it( 'caption is limit', () => {
			expect( schema.isLimit( 'caption' ) ).to.be.true;
			expect( schema.isBlock( 'caption' ) ).to.be.false;
			expect( schema.isObject( 'caption' ) ).to.be.false;
			expect( schema.isInline( 'caption' ) ).to.be.false;
		} );
	} );

	describe( 'createContext()', () => {
		it( 'should return SchemaContext instance', () => {
			const ctx = schema.createContext( [ 'a', 'b', 'c' ] );

			expect( ctx ).to.be.instanceof( SchemaContext );
		} );
	} );
} );

describe( 'SchemaContext', () => {
	let root;

	beforeEach( () => {
		root = new Element( '$root', null, [
			new Element( 'blockQuote', { foo: 1 }, [
				new Element( 'paragraph', { align: 'left' }, [
					new Text( 'foo', { bold: true, italic: true } )
				] )
			] )
		] );
	} );

	describe( 'constructor()', () => {
		it( 'creates context based on an array of strings', () => {
			const ctx = new SchemaContext( [ 'a', 'b', 'c' ] );

			expect( ctx.length ).to.equal( 3 );

			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ 'a', 'b', 'c' ] );
			expect( ctx.getItem( 0 ).name ).to.equal( 'a' );

			expect( Array.from( ctx.getItem( 0 ).getAttributeKeys() ) ).to.be.empty;
			expect( ctx.getItem( 0 ).getAttribute( 'foo' ) ).to.be.undefined;
		} );

		it( 'creates context based on an array of elements', () => {
			const blockQuote = root.getChild( 0 );
			const text = blockQuote.getChild( 0 ).getChild( 0 );

			const ctx = new SchemaContext( [ blockQuote, text ] );

			expect( ctx.length ).to.equal( 2 );

			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ 'blockQuote', '$text' ] );
			expect( ctx.getItem( 0 ).name ).to.equal( 'blockQuote' );

			expect( Array.from( ctx.getItem( 1 ).getAttributeKeys() ).sort() ).to.deep.equal( [ 'bold', 'italic' ] );
			expect( ctx.getItem( 1 ).getAttribute( 'bold' ) ).to.be.true;
		} );

		it( 'creates context based on a mixed array of strings and elements', () => {
			const blockQuote = root.getChild( 0 );
			const text = blockQuote.getChild( 0 ).getChild( 0 );

			const ctx = new SchemaContext( [ blockQuote, 'paragraph', text ] );

			expect( ctx.length ).to.equal( 3 );

			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ 'blockQuote', 'paragraph', '$text' ] );
		} );

		it( 'creates context based on a root element', () => {
			const ctx = new SchemaContext( root );

			expect( ctx.length ).to.equal( 1 );

			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ '$root' ] );

			expect( Array.from( ctx.getItem( 0 ).getAttributeKeys() ) ).to.be.empty;
			expect( ctx.getItem( 0 ).getAttribute( 'foo' ) ).to.be.undefined;
		} );

		it( 'creates context based on a nested element', () => {
			const ctx = new SchemaContext( root.getChild( 0 ).getChild( 0 ) );

			expect( ctx.length ).to.equal( 3 );

			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ '$root', 'blockQuote', 'paragraph' ] );

			expect( Array.from( ctx.getItem( 1 ).getAttributeKeys() ) ).to.deep.equal( [ 'foo' ] );
			expect( ctx.getItem( 1 ).getAttribute( 'foo' ) ).to.equal( 1 );
			expect( Array.from( ctx.getItem( 2 ).getAttributeKeys() ) ).to.deep.equal( [ 'align' ] );
			expect( ctx.getItem( 2 ).getAttribute( 'align' ) ).to.equal( 'left' );
		} );

		it( 'creates context based on a text node', () => {
			const ctx = new SchemaContext( root.getChild( 0 ).getChild( 0 ).getChild( 0 ) );

			expect( ctx.length ).to.equal( 4 );

			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ '$root', 'blockQuote', 'paragraph', '$text' ] );

			expect( Array.from( ctx.getItem( 3 ).getAttributeKeys() ).sort() ).to.deep.equal( [ 'bold', 'italic' ] );
			expect( ctx.getItem( 3 ).getAttribute( 'bold' ) ).to.be.true;
		} );

		it( 'creates context based on a text proxy', () => {
			const text = root.getChild( 0 ).getChild( 0 ).getChild( 0 );
			const textProxy = new TextProxy( text, 0, 1 );
			const ctx = new SchemaContext( textProxy );

			expect( ctx.length ).to.equal( 4 );

			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ '$root', 'blockQuote', 'paragraph', '$text' ] );

			expect( Array.from( ctx.getItem( 3 ).getAttributeKeys() ).sort() ).to.deep.equal( [ 'bold', 'italic' ] );
			expect( ctx.getItem( 3 ).getAttribute( 'bold' ) ).to.be.true;
		} );

		it( 'creates context based on a position', () => {
			const pos = Position._createAt( root.getChild( 0 ).getChild( 0 ), 0 );
			const ctx = new SchemaContext( pos );

			expect( ctx.length ).to.equal( 3 );

			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ '$root', 'blockQuote', 'paragraph' ] );

			expect( Array.from( ctx.getItem( 2 ).getAttributeKeys() ).sort() ).to.deep.equal( [ 'align' ] );
		} );

		it( 'creates context based on a string', () => {
			const ctx = new SchemaContext( 'paragraph' );

			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ 'paragraph' ] );
		} );

		it( 'creates context based on a SchemaContext instance', () => {
			const previousCtx = new SchemaContext( [ 'a', 'b', 'c' ] );

			const ctx = new SchemaContext( previousCtx );

			expect( ctx ).to.equal( previousCtx );
		} );

		it( 'creates context in DocumentFragment - array with string', () => {
			const ctx = new SchemaContext( [ new DocumentFragment(), 'paragraph' ] );

			expect( ctx.length ).to.equal( 2 );
			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ '$documentFragment', 'paragraph' ] );
		} );

		it( 'creates context in DocumentFragment - element', () => {
			const p = new Element( 'paragraph' );
			const docFrag = new DocumentFragment();
			docFrag._appendChild( p );

			const ctx = new SchemaContext( p );

			expect( ctx.length ).to.equal( 2 );
			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ '$documentFragment', 'paragraph' ] );
		} );

		it( 'creates context in DocumentFragment - position', () => {
			const p = new Element( 'paragraph' );
			const docFrag = new DocumentFragment( p );
			const pos = Position._createAt( docFrag.getChild( 0 ), 0 );
			const ctx = new SchemaContext( pos );

			expect( ctx.length ).to.equal( 2 );
			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ '$documentFragment', 'paragraph' ] );
		} );
	} );

	describe( 'length', () => {
		it( 'gets the number of items', () => {
			const ctx = new SchemaContext( [ 'a', 'b', 'c' ] );

			expect( ctx.length ).to.equal( 3 );
		} );
	} );

	describe( 'last', () => {
		it( 'gets the last item', () => {
			const ctx = new SchemaContext( [ 'a', 'b', 'c' ] );

			expect( ctx.last ).to.be.an( 'object' );
			expect( ctx.last.name ).to.equal( 'c' );
		} );
	} );

	describe( 'Symbol.iterator', () => {
		it( 'exists', () => {
			const ctx = new SchemaContext( [ 'a', 'b', 'c' ] );

			expect( ctx[ Symbol.iterator ] ).to.be.a( 'function' );
			expect( Array.from( ctx ).map( item => item.name ) ).to.deep.equal( [ 'a', 'b', 'c' ] );
		} );
	} );

	describe( 'getItem()', () => {
		it( 'returns item by index', () => {
			const ctx = new SchemaContext( [ 'a', 'b', 'c' ] );

			expect( ctx.getItem( 1 ) ).to.be.an( 'object' );
			expect( ctx.getItem( 1 ).name ).to.equal( 'b' );
		} );

		it( 'returns undefined if index exceeds the range', () => {
			const ctx = new SchemaContext( [ 'a', 'b', 'c' ] );

			expect( ctx.getItem( 3 ) ).to.be.undefined;
		} );
	} );

	describe( 'push()', () => {
		it( 'creates new SchemaContext instance with new item - #string', () => {
			const ctx = new SchemaContext( [ 'a', 'b', 'c' ] );

			const newCtx = ctx.push( 'd' );

			expect( newCtx ).to.instanceof( SchemaContext );
			expect( newCtx ).to.not.equal( ctx );
			expect( Array.from( newCtx.getNames() ) ).to.deep.equal( [ 'a', 'b', 'c', 'd' ] );
			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ 'a', 'b', 'c' ] );
		} );

		it( 'creates new SchemaContext instance with new item - #text', () => {
			const node = new Text( 'd' );
			const ctx = new SchemaContext( [ 'a', 'b', 'c' ] );

			const newCtx = ctx.push( node );

			expect( newCtx ).to.instanceof( SchemaContext );
			expect( newCtx ).to.not.equal( ctx );
			expect( Array.from( newCtx.getNames() ) ).to.deep.equal( [ 'a', 'b', 'c', '$text' ] );
			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ 'a', 'b', 'c' ] );
		} );

		it( 'creates new SchemaContext instance with new item - #element', () => {
			const ctx = new SchemaContext( [ 'a', 'b', 'c' ] );
			const parent = new Element( 'parent', null, new Element( 'd' ) );

			const newCtx = ctx.push( parent.getChild( 0 ) );

			expect( newCtx ).to.instanceof( SchemaContext );
			expect( newCtx ).to.not.equal( ctx );
			expect( Array.from( newCtx.getNames() ) ).to.deep.equal( [ 'a', 'b', 'c', 'd' ] );
			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ 'a', 'b', 'c' ] );
		} );
	} );

	describe( 'getNames()', () => {
		it( 'returns an iterator', () => {
			const ctx = new SchemaContext( [ 'a', 'b', 'c' ] );

			expect( ctx.getNames().next ).to.be.a( 'function' );
		} );

		it( 'returns an iterator which returns all item names', () => {
			const ctx = new SchemaContext( [ 'a', 'b', 'c' ] );

			expect( Array.from( ctx.getNames() ) ).to.deep.equal( [ 'a', 'b', 'c' ] );
		} );
	} );

	describe( 'endsWith()', () => {
		it( 'returns true if the end of the context matches the query - 1 item', () => {
			const ctx = new SchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.endsWith( 'dom' ) ).to.be.true;
		} );

		it( 'returns true if the end of the context matches the query - 2 items', () => {
			const ctx = new SchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.endsWith( 'bom dom' ) ).to.be.true;
		} );

		it( 'returns true if the end of the context matches the query - full match of 3 items', () => {
			const ctx = new SchemaContext( [ 'foo', 'bar', 'bom' ] );

			expect( ctx.endsWith( 'foo bar bom' ) ).to.be.true;
		} );

		it( 'returns true if the end of the context matches the query - full match of 1 items', () => {
			const ctx = new SchemaContext( [ 'foo' ] );

			expect( ctx.endsWith( 'foo' ) ).to.be.true;
		} );

		it( 'returns true if not only the end of the context matches the query', () => {
			const ctx = new SchemaContext( [ 'foo', 'foo', 'foo', 'foo' ] );

			expect( ctx.endsWith( 'foo foo' ) ).to.be.true;
		} );

		it( 'returns false if query matches the middle of the context', () => {
			const ctx = new SchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.endsWith( 'bom' ) ).to.be.false;
		} );

		it( 'returns false if query matches the start of the context', () => {
			const ctx = new SchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.endsWith( 'foo' ) ).to.be.false;
		} );

		it( 'returns false if query does not match', () => {
			const ctx = new SchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.endsWith( 'dom bar' ) ).to.be.false;
		} );

		it( 'returns false if query is longer than context', () => {
			const ctx = new SchemaContext( [ 'foo' ] );

			expect( ctx.endsWith( 'bar', 'foo' ) ).to.be.false;
		} );
	} );

	describe( 'startsWith()', () => {
		it( 'returns true if the start of the context matches the query - 1 item', () => {
			const ctx = new SchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.startsWith( 'foo' ) ).to.be.true;
		} );

		it( 'returns true if the start of the context matches the query - 2 items', () => {
			const ctx = new SchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.startsWith( 'foo bar' ) ).to.be.true;
		} );

		it( 'returns true if the start of the context matches the query - full match of 3 items', () => {
			const ctx = new SchemaContext( [ 'foo', 'bar', 'bom' ] );

			expect( ctx.startsWith( 'foo bar bom' ) ).to.be.true;
		} );

		it( 'returns true if the start of the context matches the query - full match of 1 items', () => {
			const ctx = new SchemaContext( [ 'foo' ] );

			expect( ctx.startsWith( 'foo' ) ).to.be.true;
		} );

		it( 'returns true if not only the start of the context matches the query', () => {
			const ctx = new SchemaContext( [ 'foo', 'foo', 'foo', 'foo' ] );

			expect( ctx.startsWith( 'foo foo' ) ).to.be.true;
		} );

		it( 'returns false if query matches the middle of the context', () => {
			const ctx = new SchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.startsWith( 'bom' ) ).to.be.false;
		} );

		it( 'returns false if query matches the end of the context', () => {
			const ctx = new SchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.startsWith( 'dom' ) ).to.be.false;
		} );

		it( 'returns false if query does not match', () => {
			const ctx = new SchemaContext( [ 'foo', 'bar', 'bom', 'dom' ] );

			expect( ctx.startsWith( 'dom bar' ) ).to.be.false;
		} );

		it( 'returns false if query is longer than context', () => {
			const ctx = new SchemaContext( [ 'foo' ] );

			expect( ctx.startsWith( 'bar', 'foo' ) ).to.be.false;
		} );
	} );
} );
