/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, operation */

'use strict';

import Document from '/ckeditor5/engine/model/document.js';
import Element from '/ckeditor5/engine/model/element.js';

import Position from '/ckeditor5/engine/model/position.js';
import Range from '/ckeditor5/engine/model/range.js';

import AttributeDelta from '/ckeditor5/engine/model/delta/attributedelta.js';
import InsertDelta from '/ckeditor5/engine/model/delta/insertdelta.js';
import WeakInsertDelta from '/ckeditor5/engine/model/delta/weakinsertdelta.js';
import RemoveDelta from '/ckeditor5/engine/model/delta/removedelta.js';
import MoveDelta from '/ckeditor5/engine/model/delta/movedelta.js';
import MergeDelta from '/ckeditor5/engine/model/delta/mergedelta.js';
import SplitDelta from '/ckeditor5/engine/model/delta/splitdelta.js';
import WrapDelta from '/ckeditor5/engine/model/delta/wrapdelta.js';
import UnwrapDelta from '/ckeditor5/engine/model/delta/unwrapdelta.js';

import AttributeOperation from '/ckeditor5/engine/model/operation/attributeoperation.js';
import InsertOperation from '/ckeditor5/engine/model/operation/insertoperation.js';
import MoveOperation from '/ckeditor5/engine/model/operation/moveoperation.js';
import RemoveOperation from '/ckeditor5/engine/model/operation/removeoperation.js';

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
			expect( op.nodeList._nodes ).to.deep.equal( params[ i ] );
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
	const root = doc.createRoot( 'root' );

	root.insertChildren( 0, [
		new Element( 'x' ),
		new Element( 'x' ),
		new Element( 'x', [], 'a' ),
		new Element( 'div', [], [
			new Element( 'x' ),
			new Element( 'x' ),
			new Element( 'x', [], 'a' ),
			new Element( 'div', [], [
				new Element( 'x' ),
				new Element( 'x' ),
				new Element( 'x', [], 'abcd' ),
				new Element( 'p', [], 'abcfoobarxyz' )
			] )
		] )
	] );

	return doc;
}
