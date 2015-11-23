/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

const modules = bender.amd.require(
	'document/document',
	'document/element',
	'document/rootelement',
	'document/attribute',
	'document/position',
	'document/range',
	'document/operation/changeoperation',
	'document/operation/insertoperation',
	'document/operation/moveoperation',
	'document/operation/reinsertoperation',
	'document/operation/removeoperation'
);

describe( 'Document change event', () => {
	let Document, RootElement, Element, Range, Position;
	let ChangeOperation, InsertOperation, MoveOperation, ReinsertOperation, RemoveOperation, Attribute;

	before( () => {
		Document = modules[ 'document/document' ];
		Element = modules[ 'document/element' ];
		RootElement = modules[ 'document/rootelement' ];
		Attribute = modules[ 'document/attribute' ];
		Position = modules[ 'document/position' ];
		Range = modules[ 'document/range' ];

		InsertOperation = modules[ 'document/operation/insertoperation' ];
		ChangeOperation = modules[ 'document/operation/changeoperation' ];
		MoveOperation = modules[ 'document/operation/moveoperation' ];
		ReinsertOperation = modules[ 'document/operation/reinsertoperation' ];
		RemoveOperation = modules[ 'document/operation/removeoperation' ];
	} );

	let doc, root, graveyard, changes;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		graveyard = doc._graveyard;

		changes = [];

		doc.on( 'change', ( evt ) => {
			changes = evt.changes;
		} );
	} );

	it( 'should be fired when text is inserted', () => {
		this.doc.applyOperation( new InsertOperation( new Position( [ 0 ], root ), 'foo', this.doc.version ) );

		expect( changes ).to.have.length( 1 );
		expect( changes[ 0 ].type ).to.equal( 'insert' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 3 ) );
	} );

	it( 'should be fired when element is inserted', () => {
		const element = new Element( 'p' );
		this.doc.applyOperation( new InsertOperation( new Position( [ 0 ], root ), element, this.doc.version ) );

		expect( changes ).to.have.length( 1 );
		expect( changes[ 0 ].type ).to.equal( 'insert' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 1 ) );
	} );

	it( 'should be fired when nodes are inserted', () => {
		const element = new Element( 'p' );
		this.doc.applyOperation( new InsertOperation( new Position( [ 0 ], root ), [ element, 'foo' ], this.doc.version ) );

		expect( changes ).to.have.length( 1 );
		expect( changes[ 0 ].type ).to.equal( 'insert' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 4 ) );
	} );

	it( 'should be fired when multiple nodes are moved', () => {
		const p1 = new Element( 'p' );
		p1.insertChildren( 0, [ new Element( 'p' ), 'foo' ] );

		const p2 = new Element( 'p' );

		root.insertChildren( 0, [ p1, p2 ] );

		this.doc.applyOperation(
			new MoveOperation(
				new Position( [ 0, 0 ], root ),
				new Position( [ 1, 0 ], root ),
				3,
				this.doc.version
			)
		);

		expect( changes ).to.have.length( 1 );
		expect( changes[ 0 ].type ).to.equal( 'move' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( p2, 0, p2, 3 ) );
		expect( changes[ 0 ].sourcePosition ).to.deep.equal( Position.createFromParentAndOffset( p1, 0 ) );
	} );

	it( 'should be fired when multiple nodes are removed and reinserted', () => {
		root.insertChildren( 0, 'foo' );

		const removeOperation = new RemoveOperation( new Position( [ 0 ], root ), 3, this.doc.version );
		this.doc.applyOperation( removeOperation );

		const reinsertOperation = removeOperation.getReversed();
		this.doc.applyOperation( reinsertOperation );

		expect( changes ).to.have.length( 2 );

		expect( changes[ 0 ].type ).to.equal( 'remove' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( graveyard, 0, graveyard, 3 ) );
		expect( changes[ 0 ].sourcePosition ).to.deep.equal( Position.createFromParentAndOffset( root, 0 ) );

		expect( changes[ 1 ].type ).to.equal( 'reinsert' );
		expect( changes[ 1 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 3 ) );
		expect( changes[ 1 ].sourcePosition ).to.deep.equal( Position.createFromParentAndOffset( graveyard, 0 ) );
	} );

	it( 'should be fired when attribute is inserted', () => {
		root.insertChildren( 0, 'foo' );

		this.doc.applyOperation(
			new ChangeOperation(
				Range.createFromParentsAndOffsets( root, 0, root, 3 ),
				null,
				new Attribute( 'key', 'new' ),
				this.doc.version
			)
		);

		expect( changes ).to.have.length( 1 );
		expect( changes[ 0 ].type ).to.equal( 'addAttr' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 3 ) );
		expect( changes[ 0 ].newAttr ).to.deep.equal( new Attribute( 'key', 'new' ) );
	} );

	it( 'should be fired when attribute is removed', () => {
		root.insertChildren( 0, new Element( 'p', [ new Attribute( 'key', 'old' ) ] ) );

		this.doc.applyOperation(
			new ChangeOperation(
				Range.createFromParentsAndOffsets( root, 0, root, 3 ),
				new Attribute( 'key', 'old' ),
				null,
				this.doc.version
			)
		);

		expect( changes ).to.have.length( 1 );
		expect( changes[ 0 ].type ).to.equal( 'removeAttr' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 1 ) );
		expect( changes[ 0 ].oldAttr ).to.deep.equal( new Attribute( 'key', 'old' ) );
	}  );

	it( 'should be fired when attribute changes', () => {
		root.insertChildren( 0, new Element( 'p', [ new Attribute( 'key', 'old' ) ] ) );

		this.doc.applyOperation(
			new ChangeOperation(
				Range.createFromParentsAndOffsets( root, 0, root, 3 ),
				new Attribute( 'key', 'old' ),
				new Attribute( 'key', 'new' ),
				this.doc.version
			)
		);

		expect( changes ).to.have.length( 1 );
		expect( changes[ 0 ].type ).to.equal( 'changeAttr' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 1 ) );
		expect( changes[ 0 ].oldAttr ).to.deep.equal( new Attribute( 'key', 'old' ) );
		expect( changes[ 0 ].newAttr ).to.deep.equal( new Attribute( 'key', 'new' ) );
	}  );
} );
