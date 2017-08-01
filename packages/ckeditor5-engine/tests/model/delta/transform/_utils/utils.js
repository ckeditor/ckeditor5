/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../../../src/model/document';
import Element from '../../../../../src/model/element';
import Text from '../../../../../src/model/text';

import Position from '../../../../../src/model/position';
import Range from '../../../../../src/model/range';

import Batch from '../../../../../src/model/batch';

import AttributeDelta from '../../../../../src/model/delta/attributedelta';
import InsertDelta from '../../../../../src/model/delta/insertdelta';
import WeakInsertDelta from '../../../../../src/model/delta/weakinsertdelta';
import RenameDelta from '../../../../../src/model/delta/renamedelta';
import RemoveDelta from '../../../../../src/model/delta/removedelta';
import MarkerDelta from '../../../../../src/model/delta/markerdelta';
import MoveDelta from '../../../../../src/model/delta/movedelta';
import MergeDelta from '../../../../../src/model/delta/mergedelta';
import SplitDelta from '../../../../../src/model/delta/splitdelta';
import WrapDelta from '../../../../../src/model/delta/wrapdelta';
import UnwrapDelta from '../../../../../src/model/delta/unwrapdelta';

import AttributeOperation from '../../../../../src/model/operation/attributeoperation';
import InsertOperation from '../../../../../src/model/operation/insertoperation';
import MarkerOperation from '../../../../../src/model/operation/markeroperation';
import MoveOperation from '../../../../../src/model/operation/moveoperation';
import RemoveOperation from '../../../../../src/model/operation/removeoperation';
import RenameOperation from '../../../../../src/model/operation/renameoperation';

export function getAttributeDelta( range, key, oldValue, newValue, version ) {
	const delta = new AttributeDelta();
	delta.addOperation( new AttributeOperation( range, key, oldValue, newValue, version ) );

	return delta;
}

export function getInsertDelta( position, nodes, version ) {
	const delta = new InsertDelta();
	delta.addOperation( new InsertOperation( position, nodes, version ) );

	wrapInBatch( delta );

	return delta;
}

export function getWeakInsertDelta( position, nodes, version ) {
	const delta = new WeakInsertDelta();
	delta.addOperation( new InsertOperation( position, nodes, version ) );

	wrapInBatch( delta );

	return delta;
}

export function getMarkerDelta( name, oldRange, newRange, version ) {
	const delta = new MarkerDelta();
	delta.addOperation( new MarkerOperation( name, oldRange, newRange, version ) );

	wrapInBatch( delta );

	return delta;
}

export function getMergeDelta( position, howManyInPrev, howManyInNext, version ) {
	const delta = new MergeDelta();

	const sourcePosition = Position.createFromPosition( position );
	sourcePosition.path.push( 0 );

	const targetPosition = Position.createFromPosition( position );
	targetPosition.offset--;
	targetPosition.path.push( howManyInPrev );

	const move = new MoveOperation( sourcePosition, howManyInNext, targetPosition, version );
	move.isSticky = true;

	delta.addOperation( move );

	const gy = sourcePosition.root.document.graveyard;
	const gyPos = Position.createAt( gy, 0 );

	delta.addOperation( new RemoveOperation( position, 1, gyPos, version + 1 ) );

	wrapInBatch( delta );

	return delta;
}

export function getMoveDelta( sourcePosition, howMany, targetPosition, baseVersion ) {
	const delta = new MoveDelta();

	const move = new MoveOperation( sourcePosition, howMany, targetPosition, baseVersion );
	delta.addOperation( move );

	wrapInBatch( delta );

	return delta;
}

export function getRemoveDelta( sourcePosition, howMany, baseVersion ) {
	const delta = new RemoveDelta();

	const gy = sourcePosition.root.document.graveyard;
	const gyPos = Position.createAt( gy, 0 );

	const remove = new RemoveOperation( sourcePosition, howMany, gyPos, baseVersion );
	delta.addOperation( remove );

	wrapInBatch( delta );

	return delta;
}

export function getRenameDelta( position, oldName, newName, baseVersion ) {
	const delta = new RenameDelta();

	const rename = new RenameOperation( position, oldName, newName, baseVersion );
	delta.addOperation( rename );

	wrapInBatch( delta );

	return delta;
}

export function getSplitDelta( position, nodeCopy, howManyMove, version ) {
	const delta = new SplitDelta();

	const insertPosition = Position.createFromPosition( position );
	insertPosition.path = insertPosition.getParentPath();
	insertPosition.offset++;

	const targetPosition = Position.createFromPosition( insertPosition );
	targetPosition.path.push( 0 );

	delta.addOperation( new InsertOperation( insertPosition, [ nodeCopy ], version ) );

	const move = new MoveOperation( position, howManyMove, targetPosition, version + 1 );
	move.isSticky = true;

	delta.addOperation( move );

	wrapInBatch( delta );

	return delta;
}

export function getWrapDelta( range, element, version ) {
	const delta = new WrapDelta();

	const insert = new InsertOperation( range.end, element, version );

	const targetPosition = Position.createFromPosition( range.end );
	targetPosition.path.push( 0 );
	const move = new MoveOperation( range.start, range.end.offset - range.start.offset, targetPosition, version + 1 );

	delta.addOperation( insert );
	delta.addOperation( move );

	wrapInBatch( delta );

	return delta;
}

export function getUnwrapDelta( positionBefore, howManyChildren, version ) {
	const delta = new UnwrapDelta();

	const sourcePosition = Position.createFromPosition( positionBefore );
	sourcePosition.path.push( 0 );

	const move = new MoveOperation( sourcePosition, howManyChildren, positionBefore, version );
	move.isSticky = true;

	const removePosition = Position.createFromPosition( positionBefore );
	removePosition.offset += howManyChildren;

	const gy = sourcePosition.root.document.graveyard;
	const gyPos = Position.createAt( gy, 0 );

	const remove = new RemoveOperation( removePosition, 1, gyPos, version + 1 );

	delta.addOperation( move );
	delta.addOperation( remove );

	wrapInBatch( delta );

	return delta;
}

export function expectDelta( delta, expected ) {
	expect( delta ).to.be.instanceof( expected.type );
	expect( delta.operations.length ).to.equal( expected.operations.length );

	for ( let i = 0; i < delta.operations.length; i++ ) {
		expectOperation( delta.operations[ i ], expected.operations[ i ] );
	}
}

export function expectOperation( op, params ) {
	for ( const i in params ) {
		if ( i == 'type' ) {
			expect( op, 'operation type' ).to.be.instanceof( params[ i ] );
		}
		else if ( i == 'nodes' ) {
			expect( Array.from( op.nodes ), 'nodes' ).to.deep.equal( params[ i ] );
		} else if ( params[ i ] instanceof Position || params[ i ] instanceof Range ) {
			expect( op[ i ].isEqual( params[ i ] ), 'property ' + i ).to.be.true;
		} else {
			expect( op[ i ], 'property ' + 1 ).to.equal( params[ i ] );
		}
	}
}

export function applyDelta( delta, document ) {
	for ( const op of delta.operations ) {
		document.applyOperation( op );
	}
}

export function getFilledDocument() {
	const doc = new Document();
	const root = doc.createRoot();

	root.insertChildren( 0, [
		new Element( 'x' ),
		new Element( 'x' ),
		new Element( 'x', [], new Text( 'a' ) ),
		new Element( 'div', [], [
			new Element( 'x' ),
			new Element( 'x' ),
			new Element( 'x', [], new Text( 'a' ) ),
			new Element( 'div', [], [
				new Element( 'x' ),
				new Element( 'x' ),
				new Element( 'x', [], new Text( 'abcd' ) ),
				new Element( 'p', [], new Text( 'abcfoobarxyz' ) )
			] )
		] )
	] );

	return doc;
}

function wrapInBatch( delta ) {
	// Batch() requires the document but only a few lines of code needs batch in `document#changes`
	// so we may have an invalid batch instance for some tests.
	const batch = new Batch();

	batch.addDelta( delta );
}
