/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';
import Position from '../../../src/model/position';
import Range from '../../../src/model/range';
import AttributeOperation from '../../../src/model/operation/attributeoperation';
import InsertOperation from '../../../src/model/operation/insertoperation';
import MoveOperation from '../../../src/model/operation/moveoperation';
import RemoveOperation from '../../../src/model/operation/removeoperation';
import { wrapInDelta } from '../../../tests/model/_utils/utils';

describe( 'Document change event', () => {
	let doc, root, graveyard, types, changes;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
		graveyard = doc.graveyard;

		types = [];
		changes = [];

		doc.on( 'change', ( evt, type, change ) => {
			types.push( type );
			changes.push( change );
		} );
	} );

	it( 'should be fired when text is inserted', () => {
		doc.applyOperation( wrapInDelta( new InsertOperation( new Position( root, [ 0 ] ), 'foo', doc.version ) ) );

		expect( changes ).to.have.length( 1 );
		expect( types[ 0 ] ).to.equal( 'insert' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 3 ) );
	} );

	it( 'should be fired when element is inserted', () => {
		const element = new Element( 'p' );
		doc.applyOperation( wrapInDelta( new InsertOperation( new Position( root, [ 0 ] ), element, doc.version ) ) );

		expect( changes ).to.have.length( 1 );
		expect( types[ 0 ] ).to.equal( 'insert' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 1 ) );
	} );

	it( 'should be fired when nodes are inserted', () => {
		const element = new Element( 'p' );
		doc.applyOperation( wrapInDelta( new InsertOperation( new Position( root, [ 0 ] ), [ element, 'foo' ], doc.version ) ) );

		expect( changes ).to.have.length( 1 );
		expect( types[ 0 ] ).to.equal( 'insert' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 4 ) );
	} );

	it( 'should be fired when nodes are moved', () => {
		const p1 = new Element( 'p' );
		p1.insertChildren( 0, [ new Element( 'p' ), new Text( 'foo' ) ] );

		const p2 = new Element( 'p' );

		root.insertChildren( 0, [ p1, p2 ] );

		doc.applyOperation( wrapInDelta(
			new MoveOperation(
				new Position( root, [ 0, 0 ] ),
				3,
				new Position( root, [ 1, 0 ] ),
				doc.version
			)
		) );

		expect( changes ).to.have.length( 1 );
		expect( types[ 0 ] ).to.equal( 'move' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( p2, 0, p2, 3 ) );
		expect( changes[ 0 ].sourcePosition ).to.deep.equal( Position.createFromParentAndOffset( p1, 0 ) );
	} );

	it( 'should be fired when multiple nodes are removed and reinserted', () => {
		root.insertChildren( 0, new Text( 'foo' ) );

		const removeOperation = new RemoveOperation( new Position( root, [ 0 ] ), 3, new Position( doc.graveyard, [ 0 ] ), doc.version );
		doc.applyOperation( wrapInDelta( removeOperation ) );

		const reinsertOperation = removeOperation.getReversed();
		doc.applyOperation( wrapInDelta( reinsertOperation ) );

		expect( changes ).to.have.length( 2 );

		expect( types[ 0 ] ).to.equal( 'remove' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( graveyard, 0, graveyard, 3 ) );
		expect( changes[ 0 ].sourcePosition ).to.deep.equal( Position.createFromParentAndOffset( root, 0 ) );

		expect( types[ 1 ] ).to.equal( 'reinsert' );
		expect( changes[ 1 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 3 ) );
		expect( changes[ 1 ].sourcePosition ).to.deep.equal( Position.createFromParentAndOffset( graveyard, 0 ) );
	} );

	it( 'should be fired when attribute is inserted', () => {
		root.insertChildren( 0, new Text( 'foo' ) );

		doc.applyOperation( wrapInDelta(
			new AttributeOperation(
				Range.createFromParentsAndOffsets( root, 0, root, 3 ),
				'key',
				null,
				'new',
				doc.version
			)
		) );

		expect( changes ).to.have.length( 1 );
		expect( types[ 0 ] ).to.equal( 'addAttribute' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, root, 3 ) );
		expect( changes[ 0 ].key ).to.equal( 'key' );
		expect( changes[ 0 ].oldValue ).to.be.null;
		expect( changes[ 0 ].newValue ).to.equal( 'new' );
	} );

	it( 'should be fired when attribute is removed', () => {
		const elem = new Element( 'p', { key: 'old' } );
		root.insertChildren( 0, elem );

		doc.applyOperation( wrapInDelta(
			new AttributeOperation(
				Range.createFromParentsAndOffsets( root, 0, elem, 0 ),
				'key',
				'old',
				null,
				doc.version
			)
		) );

		expect( changes ).to.have.length( 1 );
		expect( types[ 0 ] ).to.equal( 'removeAttribute' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, elem, 0 ) );
		expect( changes[ 0 ].key ).to.equal( 'key' );
		expect( changes[ 0 ].oldValue ).to.equal( 'old' );
		expect( changes[ 0 ].newValue ).to.be.null;
	} );

	it( 'should be fired when attribute changes', () => {
		const elem = new Element( 'p', { key: 'old' } );
		root.insertChildren( 0, elem );

		doc.applyOperation( wrapInDelta(
			new AttributeOperation(
				Range.createFromParentsAndOffsets( root, 0, elem, 0 ),
				'key',
				'old',
				'new',
				doc.version
			)
		) );

		expect( changes ).to.have.length( 1 );
		expect( types[ 0 ] ).to.equal( 'changeAttribute' );
		expect( changes[ 0 ].range ).to.deep.equal( Range.createFromParentsAndOffsets( root, 0, elem, 0 ) );
		expect( changes[ 0 ].key ).to.equal( 'key' );
		expect( changes[ 0 ].oldValue ).to.equal( 'old' );
		expect( changes[ 0 ].newValue ).to.equal( 'new' );
	} );
} );
