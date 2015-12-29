/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

const modules = bender.amd.require(
	'core/treemodel/document',
	'core/treemodel/element',
	'core/treemodel/rootelement',
	'core/treemodel/attribute',
	'core/treemodel/position',
	'core/treemodel/range',
	'core/treemodel/operation/attributeoperation',
	'core/treemodel/operation/insertoperation',
	'core/treemodel/operation/moveoperation',
	'core/treemodel/operation/reinsertoperation',
	'core/treemodel/operation/removeoperation'
);

describe( 'Document change event', () => {
	let Document, RootElement, Element, Range, Position;
	let AttributeOperation, InsertOperation, MoveOperation, ReinsertOperation, RemoveOperation, Attribute;

	before( () => {
		Document = modules[ 'core/treemodel/document' ];
		Element = modules[ 'core/treemodel/element' ];
		RootElement = modules[ 'core/treemodel/rootelement' ];
		Attribute = modules[ 'core/treemodel/attribute' ];
		Position = modules[ 'core/treemodel/position' ];
		Range = modules[ 'core/treemodel/range' ];

		InsertOperation = modules[ 'core/treemodel/operation/insertoperation' ];
		AttributeOperation = modules[ 'core/treemodel/operation/attributeoperation' ];
		MoveOperation = modules[ 'core/treemodel/operation/moveoperation' ];
		ReinsertOperation = modules[ 'core/treemodel/operation/reinsertoperation' ];
		RemoveOperation = modules[ 'core/treemodel/operation/removeoperation' ];
	} );

	let doc, root, graveyard, types, changes;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		graveyard = doc.graveyard;

		types = [];
		changes = [];

		doc.on( 'change', ( evt, type, change ) => {
			types.push( type );
			changes.push( change );
		} );
	} );

	it( 'should be fired when text is inserted', () => {
		doc.applyOperation( new InsertOperation( new Position( root, [ 0 ] ), 'foo', doc.version ) );

		expect( changes ).to.have.length( 1 );
		expect( types[ 0 ] ).to.equal( 'insert' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 3 ) );
	} );

	it( 'should be fired when element is inserted', () => {
		const element = new Element( 'p' );
		doc.applyOperation( new InsertOperation( new Position( root, [ 0 ] ), element, doc.version ) );

		expect( changes ).to.have.length( 1 );
		expect( types[ 0 ] ).to.equal( 'insert' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 1 ) );
	} );

	it( 'should be fired when nodes are inserted', () => {
		const element = new Element( 'p' );
		doc.applyOperation( new InsertOperation( new Position( root, [ 0 ] ), [ element, 'foo' ], doc.version ) );

		expect( changes ).to.have.length( 1 );
		expect( types[ 0 ] ).to.equal( 'insert' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 4 ) );
	} );

	it( 'should be fired when nodes are moved', () => {
		const p1 = new Element( 'p' );
		p1.insertChildren( 0, [ new Element( 'p' ), 'foo' ] );

		const p2 = new Element( 'p' );

		root.insertChildren( 0, [ p1, p2 ] );

		doc.applyOperation(
			new MoveOperation(
				new Position( root, [ 0, 0 ] ),
				3,
				new Position( root, [ 1, 0 ] ),
				doc.version
			)
		);

		expect( changes ).to.have.length( 1 );
		expect( types[ 0 ] ).to.equal( 'move' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( p2, 0, p2, 3 ) );
		expect( changes[ 0 ].sourcePosition ).to.deep.equal( Position.createFromParentAndOffset( p1, 0 ) );
	} );

	it( 'should be fired when multiple nodes are removed and reinserted', () => {
		root.insertChildren( 0, 'foo' );

		const removeOperation = new RemoveOperation( new Position( root, [ 0 ] ), 3, doc.version );
		doc.applyOperation( removeOperation );

		const reinsertOperation = removeOperation.getReversed();
		doc.applyOperation( reinsertOperation );

		expect( changes ).to.have.length( 2 );

		expect( types[ 0 ] ).to.equal( 'remove' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( graveyard, 0, graveyard, 3 ) );
		expect( changes[ 0 ].sourcePosition ).to.deep.equal( Position.createFromParentAndOffset( root, 0 ) );

		expect( types[ 1 ] ).to.equal( 'reinsert' );
		expect( changes[ 1 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 3 ) );
		expect( changes[ 1 ].sourcePosition ).to.deep.equal( Position.createFromParentAndOffset( graveyard, 0 ) );
	} );

	it( 'should be fired when attribute is inserted', () => {
		root.insertChildren( 0, 'foo' );

		doc.applyOperation(
			new AttributeOperation(
				Range.createFromParentsAndOffsets( root, 0, root, 3 ),
				null,
				new Attribute( 'key', 'new' ),
				doc.version
			)
		);

		expect( changes ).to.have.length( 1 );
		expect( types[ 0 ] ).to.equal( 'attr' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 3 ) );
		expect( changes[ 0 ].oldAttr ).to.be.null;
		expect( changes[ 0 ].newAttr ).to.deep.equal( new Attribute( 'key', 'new' ) );
	} );

	it( 'should be fired when attribute is removed', () => {
		const elem = new Element( 'p', [ new Attribute( 'key', 'old' ) ] );
		root.insertChildren( 0, elem );

		doc.applyOperation(
			new AttributeOperation(
				Range.createFromParentsAndOffsets( root, 0, elem, 0 ),
				new Attribute( 'key', 'old' ),
				null,
				doc.version
			)
		);

		expect( changes ).to.have.length( 1 );
		expect( types[ 0 ] ).to.equal( 'attr' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, elem, 0 ) );
		expect( changes[ 0 ].oldAttr ).to.deep.equal( new Attribute( 'key', 'old' ) );
		expect( changes[ 0 ].newAttr ).to.be.null;
	}  );

	it( 'should be fired when attribute changes', () => {
		const elem = new Element( 'p', [ new Attribute( 'key', 'old' ) ] );
		root.insertChildren( 0, elem );

		doc.applyOperation(
			new AttributeOperation(
				Range.createFromParentsAndOffsets( root, 0, elem, 0 ),
				new Attribute( 'key', 'old' ),
				new Attribute( 'key', 'new' ),
				doc.version
			)
		);

		expect( changes ).to.have.length( 1 );
		expect( types[ 0 ] ).to.equal( 'attr' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, elem, 0 ) );
		expect( changes[ 0 ].oldAttr ).to.deep.equal( new Attribute( 'key', 'old' ) );
		expect( changes[ 0 ].newAttr ).to.deep.equal( new Attribute( 'key', 'new' ) );
	}  );
} );
