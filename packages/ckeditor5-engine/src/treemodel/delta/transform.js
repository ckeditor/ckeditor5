/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import OT from '../operation/transform.js';

import AttributeDelta from './attributedelta.js';
import InsertDelta from './insertdelta.js';
import MergeDelta from './mergedelta.js';
import MoveDelta from './movedelta.js';
import RemoveDelta from './removedelta.js';
import SplitDelta from './splitdelta.js';
import Delta from './delta.js';

import arrayUtils from '../../lib/lodash/array.js';
import utils from '../../utils.js';

const baseDeltas = [ AttributeDelta, InsertDelta, MoveDelta, RemoveDelta ];
const specialCases = new Map();

export default function transform( a, b, isStrong ) {
	let transformAlgorithm = defaultTransform;

	let casesA = specialCases.get( a.constructor );

	if ( casesA ) {
		let caseB = casesA.get( b.constructor );
		transformAlgorithm = caseB || transformAlgorithm;
	}

	let transformed = transformAlgorithm( a, b, isStrong );
	let baseVersion = arrayUtils.last( b.operations ).baseVersion;

	return updateBaseVersion( baseVersion, transformed );
}

export function defaultTransform( a, b, isStrong ) {
	isStrong = getPriority( a, b, isStrong );

	const transformed = new a.constructor();

	let byOps = b.operations;
	let newByOps = [];

	for ( let opA of a.operations ) {
		let ops = [ opA ];

		for ( let opB of byOps ) {
			for ( let i = 0; i < ops.length; i++ ) {
				let op = ops[ i ];

				// Using push.apply because OT function is returning an array with one or multiple results.
				Array.prototype.push.apply( newByOps, OT( opB, op, !isStrong ) );

				// Using splice.apply for the same reason.
				let results = OT( op, opB, isStrong );
				Array.prototype.splice.apply( ops, [ i, 1 ].concat( results ) );

				i += results.length - 1;
			}
		}

		byOps = newByOps;
		newByOps = [];

		for ( let op of ops ) {
			transformed.addOperation( op );
		}
	}

	return [ transformed ];
}

export function addSpecialCase( a, b, resolver ) {
	let casesA = specialCases.get( a );

	if ( !casesA ) {
		casesA = new Map();
		specialCases.set( a, casesA );
	}

	casesA.set( b, resolver );
}

addSpecialCase( InsertDelta, MergeDelta, ( a, b, isStrong ) => {
	// If insert is applied at the same position where merge happened, we reverse the merge (we treat it like it
	// didn't happen) and then apply the original insert operation. This is "mirrored" in MergeDelta x InsertDelta
	// transformation below, where we simply do not apply MergeDelta.
	if ( a.position.isEqual( b.position ) ) {
		return [
			b.getReversed(),
			a.clone()
		];
	}

	return defaultTransform( a, b, isStrong );
} );

addSpecialCase( MergeDelta, InsertDelta, ( a, b, isStrong ) => {
	// If merge is applied at the same position where we inserted a range of nodes we cancel the merge as it's results
	// may be unexpected and very weird. Even if we do some "magic" we don't know what really are users' expectations.
	if ( a.position.isEqual( b.position ) ) {
		// This is "no-op" delta, it has no type and no operations, it basically does nothing.
		// It is used when we don't want to apply changes but still we need to return a delta.
		return [ new Delta() ];
	}

	return defaultTransform( a, b, isStrong );
} );

addSpecialCase( SplitDelta, SplitDelta, ( a, b, isStrong ) => {
	let pathA = a.position.getParentPath();
	let pathB = b.position.getParentPath();

	// The special case is for splits inside the same parent.
	if ( utils.compareArrays( pathA, pathB ) == 'SAME' ) {
		if ( a.position.offset == b.position.offset ) {
			// We are applying split at the position where split already happened. Additional split is not needed.
			return [ new Delta() ];
		} else if ( a.position.offset < b.position.offset ) {
			// Incoming split delta splits at closer offset. So we simply have to once again split the same node,
			// but since it was already split (at further offset) there are less child nodes in the split node.
			// This means that we have to update `howMany` parameter of `MoveOperation` for that delta.

			let delta = a.clone();
			delta.moveOperation.howMany = b.position.offset - a.position.offset;

			return [ delta ];
		} else if ( a.position.offset > b.position.offset ) {
			// Incoming split delta splits at further offset. We have to simulate that we are not splitting the
			// original split node but the node after it, which got created by the other split delta.
			// To do so, we increment offsets so it looks like the split delta was created in the next node.

			let delta = a.clone();

			delta.cloneOperation.position.offset++;
			delta.moveOperation.sourcePosition.path[ delta.moveOperation.sourcePosition.path.length - 2 ]++;
			delta.moveOperation.targetPosition.path[ delta.moveOperation.targetPosition.path.length - 2 ]++;
			delta.moveOperation.sourcePosition.offset = a.position.offset - b.position.offset;

			return [ delta ];
		}
	}

	return defaultTransform( a, b, isStrong );
} );

function getPriority( a, b, isStrong ) {
	let aIsBase = baseDeltas.indexOf( a ) > -1;
	let bIsBase = baseDeltas.indexOf( b ) > -1;

	if ( aIsBase != bIsBase ) {
		return aIsBase;
	} else {
		return isStrong;
	}
}

function updateBaseVersion( baseVersion, deltas ) {
	for ( let delta of deltas ) {
		for ( let op of delta.operations ) {
			op.baseVersion = ++baseVersion;
		}
	}

	return deltas;
}
