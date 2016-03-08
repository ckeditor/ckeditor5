/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import operationTransform from '../operation/transform.js';
import arrayUtils from '../../lib/lodash/array.js';

const specialCases = new Map();

/**
 * Transforms given {@link core.treeModel.delta.Delta delta} by another {@link core.treeModel.delta.Delta delta} and
 * returns the result of that transformation as an array containing one or more {@link core.treeModel.delta.Delta delta}
 * instances.
 *
 * Delta transformations heavily base on {@link core.treeModel.operation.transform operational transformations}. Since
 * delta is a list of operations most situations can be handled thanks to operational transformation. Unfortunately,
 * deltas are more complicated than operations and have they semantic meaning, as they represent user's editing intentions.
 *
 * Sometimes, simple operational transformation on deltas' operations might result in some unexpected results. Those
 * results would be fine from OT point of view, but would not reflect user's intentions. Because of such conflicts
 * we need to handle transformations in special cases in a custom way.
 *
 * The function itself looks whether two given delta types have a special case function registered. If so, the deltas are
 * transformed using that function. If not, {@link core.treeModel.delta.defaultTransform default transformation algorithm}
 * is used.
 *
 * @see core.treeModel.operation.transform
 *
 * @external core.treeModel.delta.transform
 * @function core.treeModel.delta.transform.transform
 * @param {core.treeModel.delta.Delta} a Delta that will be transformed.
 * @param {core.treeModel.delta.Delta} b Delta to transform by.
 * @param {Boolean} isAMoreImportantThanB Flag indicating whether the delta which will be transformed (`a`) should be treated
 * as more important when resolving conflicts. Note that this flag is used only if provided deltas have same
 * {@link core.treeModel.delta.priorities priority}. If deltas have different priorities, their importance is resolved
 * automatically and overwrites this flag.
 * @returns {Array.<core.treeModel.delta.Delta>} Result of the transformation.
 */
export default function transform( a, b, isAMoreImportantThanB ) {
	const transformAlgorithm = getTransformationCase( a, b ) || defaultTransform;

	const transformed = transformAlgorithm( a, b, isAMoreImportantThanB );
	const baseVersion = arrayUtils.last( b.operations ).baseVersion;

	return updateBaseVersion( baseVersion, transformed );
}

// Updates base versions of operations inside deltas (which are the results of delta transformation).
function updateBaseVersion( baseVersion, deltas ) {
	for ( let delta of deltas ) {
		for ( let op of delta.operations ) {
			op.baseVersion = ++baseVersion;
		}
	}

	return deltas;
}

/**
 * The default delta transformation function. It is used for those deltas that are not in special case conflict.
 *
 * This algorithm is similar to popular `dOPT` algorithm used in operational transformation, as we are in fact
 * transforming two sets of operations by each other.
 *
 * @param {core.treeModel.delta.Delta} a Delta that will be transformed.
 * @param {core.treeModel.delta.Delta} b Delta to transform by.
 * @param {Boolean} isAMoreImportantThanB Flag indicating whether the delta which will be transformed (`a`) should be treated
 * as more important when resolving conflicts. Note that this flag is used only if provided deltas have same
 * {@link core.treeModel.delta.priorities priority}. If deltas have different priorities, their importance is resolved
 * automatically and overwrites this flag.
 * @returns {Array.<core.treeModel.delta.Delta>} Result of the transformation, that is an array with single delta instance.
 */
export function defaultTransform( a, b, isAMoreImportantThanB ) {
	// First, resolve the flag real value.
	isAMoreImportantThanB = getPriority( a.constructor, b.constructor, isAMoreImportantThanB );

	// Create a new delta instance. Make sure that the new delta is of same type as transformed delta.
	// We will transform operations in that delta but it doesn't mean the delta's "meaning" which is connected to
	// the delta's type. Since the delta's type is heavily used in transformations and probably other parts
	// of system it is important to keep proper delta type through all transformation process.
	const transformed = new a.constructor();

	// Array containing operations that we will transform by. At the beginning these are just operations from
	let byOps = b.operations;

	// This array is storing operations from `byOps` which got transformed by operation from delta `a`.
	let newByOps = [];

	// We take each operation from original set of operations to transform.
	for ( let opA of a.operations ) {
		// We wrap the operation in the array. This is important, because operation transformation algorithm returns
		// an array of operations so we need to make sure that our algorithm is ready to handle arrays.
		const ops = [ opA ];

		// Now the real algorithm takes place.
		for ( let opB of byOps ) {
			// For each operation that we need transform by...
			for ( let i = 0; i < ops.length; i++ ) {
				// We take each operation to transform...
				const op = ops[ i ];

				// And transform both of them by themselves.

				// The result of transforming operation from delta B by operation from delta A is saved in
				// `newByOps` array. We will use that array for transformations in next loops. We need delta B
				// operations after transformed by delta A operations to get correct results of transformations
				// of next operations from delta A.
				//
				// It's like this because 2nd operation from delta A assumes that 1st operation from delta A
				// is "already applied". When we transform 2nd operation from delta A by operations from delta B
				// we have to be sure that operations from delta B are in a state that acknowledges 1st operation
				// from delta A.
				//
				// This can be easier understood when operations sets to transform are represented by diamond diagrams:
				// http://www.codecommit.com/blog/java/understanding-and-applying-operational-transformation

				// Using push.apply because operationTransform function is returning an array with one or multiple results.
				Array.prototype.push.apply( newByOps, operationTransform( opB, op, !isAMoreImportantThanB ) );

				// Then, we transform operation from delta A by operation from delta B.
				const results = operationTransform( op, opB, isAMoreImportantThanB );

				// We replace currently processed operation from `ops` array by the results of transformation.
				// Note, that we process single operation but the operationTransform result might be an array, so we
				// might splice-in more operations. We will process them further in next iterations. Right now we
				// just save them in `ops` array and move `i` pointer by proper offset.
				Array.prototype.splice.apply( ops, [ i, 1 ].concat( results ) );

				i += results.length - 1;
			}

			// At this point a single operation from delta A got transformed by a single operation from delta B.
			// The transformation result is in `ops` array and it may be one or more operations. This was just the first step.
			// Operation from delta A has to be further transformed by the other operations from delta B.
			// So in next iterator loop we will take another operation from delta B and use transformed delta A (`ops`)
			// to transform it further.
		}

		// We got through all delta B operations and have a final transformed state of an operation from delta A.

		// As previously mentioned, we substitute operations from delta B by their transformed equivalents.
		byOps = newByOps;
		newByOps = [];

		// We add transformed operation from delta A to newly created delta.
		// Remember that transformed operation from delta A may consist of multiple operations.
		for ( let op of ops ) {
			transformed.addOperation( op );
		}

		// In next loop, we will take another operation from delta A and transform it through (transformed) operations
		// from delta B...
	}

	return [ transformed ];
}

/**
 * Adds a special case callback for given delta classes.
 *
 * @param {Function} A Delta constructor which instance will get transformed.
 * @param {Function} B Delta constructor which instance will be transformed by.
 * @param {Function} resolver A callback that will handle custom special case transformation for instances of given delta classes.
 * @external core.treeModel.delta.transform
 * @function core.treeModel.delta.transform.addTransformationCase
 */
export function addTransformationCase( A, B, resolver ) {
	let casesA = specialCases.get( A );

	if ( !casesA ) {
		casesA = new Map();
		specialCases.set( A, casesA );
	}

	casesA.set( B, resolver );
}

/**
 * Gets a special case callback which was previously {@link core.treeModel.delta.transform.addTransformationCase added}.
 *
 * @param {core.treeModel.delta.Delta} a Delta to transform.
 * @param {core.treeModel.delta.Delta} b Delta to be transformed by.
 * @external core.treeModel.delta.transform
 * @function core.treeModel.delta.transform.getTransformationCase
 */
export function getTransformationCase( a, b ) {
	let casesA = specialCases.get( a.constructor );

	// If there are no special cases registered for class which `a` is instance of, we will
	// check if there are special cases registered for any parent class.
	if ( !casesA || !casesA.get( b.constructor ) ) {
		const cases = specialCases.keys();

		for ( let caseClass of cases ) {
			if ( a instanceof caseClass ) {
				casesA = specialCases.get( caseClass );
			}
		}
	}

	if ( casesA ) {
		return casesA.get( b.constructor );
	}

	return undefined;
}

// Checks priorities of passed constructors and decides which one is more important.
// If both priorities are same, value passed in `isAMoreImportantThanB` parameter is used.
function getPriority( A, B, isAMoreImportantThanB ) {
	if ( A._priority > B._priority ) {
		return true;
	} else if ( A._priority < B._priority ) {
		return false;
	} else {
		return isAMoreImportantThanB;
	}
}
