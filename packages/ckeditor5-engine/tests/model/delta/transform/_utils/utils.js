/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, operation */

import Document from 'ckeditor5-engine/src/model/document';
import Element from 'ckeditor5-engine/src/model/element';
import Text from 'ckeditor5-engine/src/model/text';

import Position from 'ckeditor5-engine/src/model/position';
import Range from 'ckeditor5-engine/src/model/range';

import AttributeDelta from 'ckeditor5-engine/src/model/delta/attributedelta';
import InsertDelta from 'ckeditor5-engine/src/model/delta/insertdelta';
import WeakInsertDelta from 'ckeditor5-engine/src/model/delta/weakinsertdelta';
import RenameDelta from 'ckeditor5-engine/src/model/delta/renamedelta';
import RemoveDelta from 'ckeditor5-engine/src/model/delta/removedelta';
import MoveDelta from 'ckeditor5-engine/src/model/delta/movedelta';
import MergeDelta from 'ckeditor5-engine/src/model/delta/mergedelta';
import SplitDelta from 'ckeditor5-engine/src/model/delta/splitdelta';
import WrapDelta from 'ckeditor5-engine/src/model/delta/wrapdelta';
import UnwrapDelta from 'ckeditor5-engine/src/model/delta/unwrapdelta';

import AttributeOperation from 'ckeditor5-engine/src/model/operation/attributeoperation';
import InsertOperation from 'ckeditor5-engine/src/model/operation/insertoperation';
import MoveOperation from 'ckeditor5-engine/src/model/operation/moveoperation';
import RemoveOperation from 'ckeditor5-engine/src/model/operation/removeoperation';
import RenameOperation from 'ckeditor5-engine/src/model/operation/renameoperation';

export function getAttributeDelta( range, key, oldValue, newValue, version ) {
	let delta = new AttributeDelta();
	delta.addOperation( new AttributeOperation( range, key, oldValue, newValue, version ) );

	return delta;
}

export function getInsertDelta( position, nodes, version ) {
	let delta = new InsertDelta();
	delta.addOperation( new InsertOperation( position, nodes, version ) );

	return delta;
}

export function getWeakInsertDelta( position, nodes, version ) {
	let delta = new WeakInsertDelta();
	delta.addOperation( new InsertOperation( position, nodes, version ) );

	return delta;
}

export function getMergeDelta( position, howManyInPrev, howManyInNext, version ) {
	let delta = new MergeDelta();

	let sourcePosition = Position.createFromPosition( position );
	sourcePosition.path.push( 0 );

	let targetPosition = Position.createFromPosition( position );
	targetPosition.offset--;
	targetPosition.path.push( howManyInPrev );

	let move = new MoveOperation( sourcePosition, howManyInNext, targetPosition, version );
	move.isSticky = true;

	delta.addOperation( move );
	delta.addOperation( new RemoveOperation( position, 1, version + 1 ) );

	return delta;
}

export function getMoveDelta( sourcePosition, howMany, targetPosition, baseVersion ) {
	let delta = new MoveDelta();

	let move = new MoveOperation( sourcePosition, howMany, targetPosition, baseVersion );
	delta.addOperation( move );

	return delta;
}

export function getRemoveDelta( sourcePosition, howMany, baseVersion ) {
	let delta = new RemoveDelta();

	let remove = new RemoveOperation( sourcePosition, howMany, baseVersion );
	delta.addOperation( remove );

	return delta;
}

export function getRenameDelta( position, oldName, newName, baseVersion ) {
	let delta = new RenameDelta();

	let rename = new RenameOperation( position, oldName, newName, baseVersion );
	delta.addOperation( rename );

	return delta;
}

export function getSplitDelta( position, nodeCopy, howManyMove, version ) {
	let delta = new SplitDelta();

	let insertPosition = Position.createFromPosition( position );
	insertPosition.path = insertPosition.getParentPath();
	insertPosition.offset++;

	let targetPosition = Position.createFromPosition( insertPosition );
	targetPosition.path.push( 0 );

	delta.addOperation( new InsertOperation( insertPosition, [ nodeCopy ], version ) );

	let move = new MoveOperation( position, howManyMove, targetPosition, version + 1 );
	move.isSticky = true;

	delta.addOperation( move );

	return delta;
}

export function getWrapDelta( range, element, version ) {
	let delta = new WrapDelta();

	let insert = new InsertOperation( range.end, element, version );

	let targetPosition = Position.createFromPosition( range.end );
	targetPosition.path.push( 0 );
	let move = new MoveOperation( range.start, range.end.offset - range.start.offset, targetPosition, version + 1 );

	delta.addOperation( insert );
	delta.addOperation( move );

	return delta;
}

export function getUnwrapDelta( positionBefore, howManyChildren, version ) {
	let delta = new UnwrapDelta();

	let sourcePosition = Position.createFromPosition( positionBefore );
	sourcePosition.path.push( 0 );

	let move = new MoveOperation( sourcePosition, howManyChildren, positionBefore, version );
	move.isSticky = true;

	let removePosition = Position.createFromPosition( positionBefore );
	removePosition.offset += howManyChildren;

	let remove = new RemoveOperation( removePosition, 1, version + 1 );

	delta.addOperation( move );
	delta.addOperation( remove );

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
	for ( let i in params ) {
		if ( i == 'type' ) {
			expect( op ).to.be.instanceof( params[ i ] );
		}
		else if ( i == 'nodes' ) {
			expect( Array.from( op.nodes ) ).to.deep.equal( params[ i ] );
		} else if ( params[ i ] instanceof Position || params[ i ] instanceof Range ) {
			expect( op[ i ].isEqual( params[ i ] ) ).to.be.true;
		} else {
			expect( op[ i ] ).to.equal( params[ i ] );
		}
	}
}

export function applyDelta( delta, document ) {
	for ( let op of delta.operations ) {
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
