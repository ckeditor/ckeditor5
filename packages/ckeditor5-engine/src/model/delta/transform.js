/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @protected
 * @module engine/model/delta/transform
 */

import Delta from './delta';
import MoveDelta from './movedelta';
import RemoveDelta from './removedelta';
import MergeDelta from './mergedelta';
import SplitDelta from './splitdelta';
import WrapDelta from './wrapdelta';
import UnwrapDelta from './unwrapdelta';
import RenameDelta from './renamedelta';
import AttributeDelta from './attributedelta';
import operationTransform from '../operation/transform';
import NoOperation from '../operation/nooperation';
import MoveOperation from '../operation/moveoperation';
import RemoveOperation from '../operation/removeoperation';
import arrayUtils from '@ckeditor/ckeditor5-utils/src/lib/lodash/array';
import compareArrays from '@ckeditor/ckeditor5-utils/src/comparearrays';

const specialCases = new Map();

/**
 * @namespace
 */
const transform = {
	/**
	 * Transforms given {@link module:engine/model/delta/delta~Delta delta} by another {@link module:engine/model/delta/delta~Delta delta}
	 * and returns the result of that transformation as an array containing one or more {@link module:engine/model/delta/delta~Delta delta}
	 * instances.
	 *
	 * Delta transformations heavily base on {@link module:engine/model/operation/transform~transform operational transformations}. Since
	 * delta is a list of operations most situations can be handled thanks to operational transformation. Unfortunately,
	 * deltas are more complicated than operations and have they semantic meaning, as they represent user's editing intentions.
	 *
	 * Sometimes, simple operational transformation on deltas' operations might result in some unexpected results. Those
	 * results would be fine from OT point of view, but would not reflect user's intentions. Because of such conflicts
	 * we need to handle transformations in special cases in a custom way.
	 *
	 * The function itself looks whether two given delta types have a special case function registered. If so, the deltas are
	 * transformed using that function. If not,
	 * {@link module:engine/model/delta/transform~transform.defaultTransform default transformation algorithm} is used.
	 *
	 * @param {module:engine/model/delta/delta~Delta} a Delta that will be transformed.
	 * @param {module:engine/model/delta/delta~Delta} b Delta to transform by.
	 * @param {module:engine/model/delta/transform~transformationContext} context Transformation context object.
	 * @returns {Array.<module:engine/model/delta/delta~Delta>} Result of the transformation.
	 */
	transform( a, b, context ) {
		const transformAlgorithm = transform.getTransformationCase( a, b ) || transform.defaultTransform;

		// Make new instance of context object, so all changes done during transformation are not saved in original object.
		const transformed = transformAlgorithm( a, b, Object.assign( {}, context ) );
		const baseVersion = arrayUtils.last( b.operations ).baseVersion;

		return updateBaseVersion( baseVersion, transformed );
	},

	/**
	 * The default delta transformation function. It is used for those deltas that are not in special case conflict.
	 *
	 * This algorithm is similar to a popular `dOPT` algorithm used in operational transformation, as we are in fact
	 * transforming two sets of operations by each other.
	 *
	 * @param {module:engine/model/delta/delta~Delta} a Delta that will be transformed.
	 * @param {module:engine/model/delta/delta~Delta} b Delta to transform by.
	 * @param {module:engine/model/delta/transform~transformationContext} context Transformation context object.
	 * @returns {Array.<module:engine/model/delta/delta~Delta>} Result of the transformation.
	 */
	defaultTransform( a, b, context ) {
		// This will hold operations from delta `a` that will be transformed by operations from delta `b`.
		// Eventually, those operations will be used to create result delta(s).
		const transformed = [];

		// Array containing operations that we will transform by. At the beginning these are just operations from
		let byOps = b.operations;

		// This array is storing operations from `byOps` which got transformed by operation from delta `a`.
		let newByOps = [];

		// We take each operation from original set of operations to transform.
		for ( const opA of a.operations ) {
			// We wrap the operation in the array. This is important, because operation transformation algorithm returns
			// an array of operations so we need to make sure that our algorithm is ready to handle arrays.
			const ops = [ opA ];

			// Now the real algorithm takes place.
			for ( const opB of byOps ) {
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

					// Transform operation from delta A by operation from delta B.
					const results = operationTransform( op, opB, context );

					// We replace currently processed operation from `ops` array by the results of transformation.
					// Note, that we process single operation but `operationTransform` result is an array, so we
					// might have to splice-in more than one operation. Save them in `ops` array and move `i` pointer by a proper offset.
					Array.prototype.splice.apply( ops, [ i, 1 ].concat( results ) );

					i += results.length - 1;

					// Then, transform operation from delta B by operation from delta A.
					// Since this is a "mirror" transformation, first, we "mirror" some of context values.
					const reverseContext = Object.assign( {}, context );
					reverseContext.isStrong = !context.isStrong;
					reverseContext.insertBefore = context.insertBefore !== undefined ? !context.insertBefore : undefined;

					// Transform operations.
					const updatedOpB = operationTransform( opB, op, reverseContext );

					// Update `newByOps` by transformed, updated `opB`.
					// Using push.apply because `operationTransform` returns an array with one or multiple results.
					Array.prototype.push.apply( newByOps, updatedOpB );
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
			for ( const op of ops ) {
				transformed.push( op );
			}

			// In next loop, we will take another operation from delta A and transform it through (transformed) operations
			// from delta B...
		}

		return getNormalizedDeltas( a.constructor, transformed );
	},

	/**
	 * Adds a special case callback for given delta classes.
	 *
	 * @param {Function} A Delta constructor which instance will get transformed.
	 * @param {Function} B Delta constructor which instance will be transformed by.
	 * @param {Function} resolver A callback that will handle custom special case transformation for instances of given delta classes.
	 */
	addTransformationCase( A, B, resolver ) {
		let casesA = specialCases.get( A );

		if ( !casesA ) {
			casesA = new Map();
			specialCases.set( A, casesA );
		}

		casesA.set( B, resolver );
	},

	/**
	 * Gets a special case callback which was previously {@link module:engine/model/delta/transform~transform.addTransformationCase added}.
	 *
	 * @param {module:engine/model/delta/delta~Delta} a Delta to transform.
	 * @param {module:engine/model/delta/delta~Delta} b Delta to be transformed by.
	 */
	getTransformationCase( a, b ) {
		let casesA = specialCases.get( a.constructor );

		// If there are no special cases registered for class which `a` is instance of, we will
		// check if there are special cases registered for any parent class.
		if ( !casesA || !casesA.get( b.constructor ) ) {
			const cases = specialCases.keys();

			for ( const caseClass of cases ) {
				if ( a instanceof caseClass && specialCases.get( caseClass ).get( b.constructor ) ) {
					casesA = specialCases.get( caseClass );

					break;
				}
			}
		}

		if ( casesA ) {
			return casesA.get( b.constructor );
		}

		return undefined;
	},

	/**
	 * Transforms two sets of deltas by themselves. Returns both transformed sets.
	 *
	 * @param {Array.<module:engine/model/delta/delta~Delta>} deltasA Array with the first set of deltas to transform. These
	 * deltas are considered more important (than `deltasB`) when resolving conflicts.
	 * @param {Array.<module:engine/model/delta/delta~Delta>} deltasB Array with the second set of deltas to transform. These
	 * deltas are considered less important (than `deltasA`) when resolving conflicts.
	 * @param {module:engine/model/document~Document} [document=null] If set, deltas will be transformed in "undo mode"
	 * and given `document` will be used to determine relations between deltas. If not set (default), deltas will be
	 * transforming without additional context information.
	 * @returns {Object}
	 * @returns {Array.<module:engine/model/delta/delta~Delta>} return.deltasA The first set of deltas transformed
	 * by the second set of deltas.
	 * @returns {Array.<module:engine/model/delta/delta~Delta>} return.deltasB The second set of deltas transformed
	 * by the first set of deltas.
	 */
	transformDeltaSets( deltasA, deltasB, document = null ) {
		const transformedDeltasA = Array.from( deltasA );
		const transformedDeltasB = Array.from( deltasB );

		const useAdditionalContext = document !== null;

		const contextAB = {
			isStrong: true
		};

		if ( useAdditionalContext ) {
			contextAB.wasAffected = new Map();
			contextAB.originalDelta = new Map();
			contextAB.document = document;
			contextAB.undoMode = true;

			for ( const delta of transformedDeltasB ) {
				contextAB.originalDelta.set( delta, delta );
			}
		}

		for ( let i = 0; i < transformedDeltasA.length; i++ ) {
			const deltaA = [ transformedDeltasA[ i ] ];

			for ( let j = 0; j < transformedDeltasB.length; j++ ) {
				const deltaB = [ transformedDeltasB[ j ] ];

				for ( let k = 0; k < deltaA.length; k++ ) {
					for ( let l = 0; l < deltaB.length; l++ ) {
						if ( useAdditionalContext ) {
							_setContext( deltaA[ k ], deltaB[ l ], contextAB );
						}

						const resultAB = transform.transform( deltaA[ k ], deltaB[ l ], {
							insertBefore: contextAB.insertBefore,
							forceNotSticky: contextAB.forceNotSticky,
							isStrong: contextAB.isStrong,
							forceWeakRemove: contextAB.forceWeakRemove,
							undoMode: contextAB.undoMode
						} );

						const resultBA = transform.transform( deltaB[ l ], deltaA[ k ], {
							insertBefore: !contextAB.insertBefore,
							forceNotSticky: contextAB.forceNotSticky,
							isStrong: !contextAB.isStrong,
							forceWeakRemove: contextAB.forceWeakRemove,
							undoMode: contextAB.undoMode
						} );

						if ( useAdditionalContext ) {
							_updateContext( deltaA[ k ], resultAB, contextAB );

							const originalDelta = contextAB.originalDelta.get( deltaB[ l ] );

							for ( const deltaBA of resultBA ) {
								contextAB.originalDelta.set( deltaBA, originalDelta );
							}
						}

						deltaA.splice( k, 1, ...resultAB );
						k += resultAB.length - 1;

						deltaB.splice( l, 1, ...resultBA );
						l += resultBA.length - 1;
					}
				}

				transformedDeltasB.splice( j, 1, ...deltaB );
				j += deltaB.length - 1;
			}

			transformedDeltasA.splice( i, 1, ...deltaA );
			i += deltaA.length - 1;
		}

		const opsDiffA = getOpsCount( transformedDeltasA ) - getOpsCount( deltasA );
		const opsDiffB = getOpsCount( transformedDeltasB ) - getOpsCount( deltasB );

		if ( opsDiffB < opsDiffA ) {
			padWithNoOps( transformedDeltasB, opsDiffA - opsDiffB );
		} else if ( opsDiffA < opsDiffB ) {
			padWithNoOps( transformedDeltasA, opsDiffB - opsDiffA );
		}

		return { deltasA: transformedDeltasA, deltasB: transformedDeltasB };
	}
};

export default transform;

// Updates base versions of operations inside deltas (which are the results of delta transformation).
function updateBaseVersion( baseVersion, deltas ) {
	for ( const delta of deltas ) {
		for ( const op of delta.operations ) {
			op.baseVersion = ++baseVersion;
		}
	}

	return deltas;
}

// Returns number of operations in given array of deltas.
function getOpsCount( deltas ) {
	return deltas.reduce( ( current, delta ) => {
		return current + delta.operations.length;
	}, 0 );
}

// Adds a delta containing `howMany` `NoOperation` instances to given array with deltas.
// Used to "synchronize" the number of operations in two delta sets.
function padWithNoOps( deltas, howMany ) {
	const lastDelta = deltas[ deltas.length - 1 ];
	let baseVersion = lastDelta.operations.length + lastDelta.baseVersion;

	const noDelta = new Delta();

	for ( let i = 0; i < howMany; i++ ) {
		noDelta.addOperation( new NoOperation( baseVersion++ ) );
	}

	deltas.push( noDelta );
}

// Sets context data before delta `a` by delta `b` transformation.
// Using data given in `context` object, sets `context.insertBefore` and `context.forceNotSticky` flags.
// Also updates `context.wasAffected`.
function _setContext( a, b, context ) {
	_setWasAffected( a, b, context );
	_setInsertBeforeContext( a, b, context );
	_setForceWeakRemove( b, context );
	_setForceNotSticky( b, context );
}

// Sets `context.insertBefore` basing on `context.document` history for `a` by `b` transformation.
//
// Simply saying, if `b` is "undoing delta" it means that `a` might already be transformed by the delta
// which was undone by `b` (let's call it `oldB`). If this is true, `a` by `b` transformation has to consider
// how `a` was transformed by `oldB` to get an expected result.
//
// This is used to resolve conflict when two operations want to insert nodes at the same position. If the operations
// are not related, it doesn't matter in what order operations insert those nodes. However if the operations are
// related (for example, in undo) we need to keep the same order.
//
// For example, assume that editor has two letters: 'ab'. Then, both letters are removed, creating two operations:
// (op. 1) REM [ 1 ] - [ 2 ] => (graveyard) [ 0 ]
// (op. 2) REM [ 0 ] - [ 1 ] => (graveyard) [ 1 ]
// Then, we undo operation 2:
// REM [ 0 ] - [ 1 ] => (graveyard) [ 1 ] is reversed to REI (graveyard) [ 1 ] => [ 0 ] - [ 1 ] and is applied.
// History stack is:
// (op. 1) REM [ 1 ] - [ 2 ] => (graveyard) [ 0 ]
// (op. 2) REM [ 0 ] - [ 1 ] => (graveyard) [ 1 ]
// (op. 3) REI (graveyard) [ 1 ] => [ 0 ] - [ 1 ]
// Then, we undo operation 1:
// REM [ 1 ] - [ 2 ] => (graveyard) [ 0 ] is reversed to REI (graveyard) [ 0 ] => [ 1 ] - [ 2 ] then,
// is transformed by (op. 2) REM [ 0 ] - [ 1 ] => (graveyard) [ 1 ] and becomes REI (graveyard) [ 0 ] => [ 0 ] - [ 1 ] then,
// is transformed by (op. 3) REI (graveyard) [ 1 ] => [ 0 ] - [ 1 ] and we have a conflict because both operations
// insert at the same position, but thanks to keeping the context, we know that in this case, the transformed operation should
// insert the node after operation 3.
//
// Keep in mind, that `context.insertBefore` may be either `Boolean` or `undefined`. If it is `Boolean` then the order is
// known (deltas are related and `a` should insert nodes before or after `b`). However, if deltas were not related,
// `context.isBefore` is `undefined` and other factors will be taken into consideration when resolving the order
// (this, however, happens in operational transformation algorithms).
//
// This affects both `MoveOperation` (and its derivatives) and `InsertOperation`.
function _setInsertBeforeContext( a, b, context ) {
	// If `b` is a delta that undoes other delta...
	const originalDelta = context.originalDelta.get( b );

	if ( context.document.history.isUndoingDelta( originalDelta ) ) {
		// Get the undone delta...
		const undoneDelta = context.document.history.getUndoneDelta( originalDelta );
		// Get a map with deltas related to `a` delta...
		const aWasAffectedBy = context.wasAffected.get( a );
		// And check if the undone delta is related with delta `a`.
		const affected = aWasAffectedBy.get( undoneDelta );

		if ( affected !== undefined ) {
			// If deltas are related, set `context.insertBefore` basing on whether `a` was affected by the undone delta.
			context.insertBefore = affected;
		}
	}
}

// Sets `context.forceNotSticky` basing on `context.document` history for transformation by `b` delta.
//
// `MoveOperation` may be "sticky" which means, that anything that was inserted at the boundary of moved range, should
// also be moved. This is particularly helpful for actions like splitting or merging a node. However, this behavior
// sometimes leads to an error, for example in undo.
//
// Simply saying, if delta is going to be transformed by delta `b`, stickiness should not be taken into consideration
// if delta `b` was already undone or if delta `b` is an undoing delta.
//
// This affects `MoveOperation` (and its derivatives).
function _setForceNotSticky( b, context ) {
	const originalDelta = context.originalDelta.get( b );
	const history = context.document.history;

	context.forceNotSticky = history.isUndoneDelta( originalDelta ) || history.isUndoingDelta( originalDelta );
}

// Sets `context.forceWeakRemove` basing on `context.document` history for transformation by `b` delta.
//
// When additional context is not used, default `MoveOperation` x `RemoveOperation` transformation
// always treats `RemoveOperation` as a stronger one, no matter how `context.isStrong` is set. It is like this
// to provide better results when transformations happen.
//
// This, however, works fine only when additional context is not used.
//
// When additional context is used, we need a better way to decide whether `RemoveOperation` is "dominating" (or in other
// words, whether nodes removed by given operation should stay in graveyard if other operation wants to move them).
//
// The answer to this is easy: if `RemoveOperation` has been already undone, we are not forcing given nodes to stay
// in graveyard. In such scenario, we set `context.forceWeakRemove` to `true`. However, if the `RemoveOperation` has
// not been undone, we set `context.forceWeakRemove` to `false` because we want the operation to be "dominating".
function _setForceWeakRemove( b, context ) {
	const history = context.document.history;
	const originalB = context.originalDelta.get( b );

	// If `b` delta has not been undone yet, forceWeakRemove should be `false`.
	// It should be `true`, in any other case, if additional context is used.
	context.forceWeakRemove = history.isUndoneDelta( originalB );
}

// Sets `context.wasAffected` which holds context information about how transformed deltas are related. `context.wasAffected`
// is used by `_setInsertBeforeContext` helper function.
function _setWasAffected( a, b, context ) {
	if ( !context.wasAffected.get( a ) ) {
		// Create a new map with relations for `a` delta.
		context.wasAffected.set( a, new Map() );
	}

	const originalDelta = context.originalDelta.get( b );
	let wasAffected = !!context.wasAffected.get( a ).get( originalDelta );

	// Cross-check all operations from both deltas...
	for ( const opA of a.operations ) {
		for ( const opB of b.operations ) {
			if ( opA instanceof MoveOperation && opB instanceof MoveOperation ) {
				if ( _isOperationAffected( opA, opB ) ) {
					// If any of them are move operations that affect each other, set the relation accordingly.
					wasAffected = true;

					break;
				}
			}
		}

		// Break both loops if affecting pair has been found.
		if ( wasAffected ) {
			break;
		}
	}

	context.wasAffected.get( a ).set( originalDelta, wasAffected );
}

// Checks whether `opA` is affected by `opB`. It is assumed that both operations are `MoveOperation`.
// Operation is affected only if the other operation's source range is before that operation's source range.
function _isOperationAffected( opA, opB ) {
	const target = opA.targetPosition;
	const source = opB.sourcePosition;

	const cmpResult = compareArrays( source.getParentPath(), target.getParentPath() );

	if ( target.root != source.root ) {
		return false;
	}

	return cmpResult == 'same' && source.offset < target.offset;
}

// Updates `context` object after delta by delta transformation is done.
//
// This means two things:
// 1. Some information are removed from context (those that apply only to the transformation that just happened).
// 2. `context.wasAffected` is updated because `oldDelta` has been transformed to one or many `newDeltas` and we
// need to update entries in `context.wasAffected`. Basically, anything that was in `context.wasAffected` under
// `oldDelta` key should be rewritten to `newDeltas`. This way in next transformation steps, `newDeltas` "remember"
// the context of `oldDelta`.
function _updateContext( oldDelta, newDeltas, context ) {
	delete context.insertBefore;
	delete context.forceNotSticky;
	delete context.forceWeakRemove;

	const wasAffected = context.wasAffected.get( oldDelta );

	context.wasAffected.delete( oldDelta );

	for ( const delta of newDeltas ) {
		context.wasAffected.set( delta, new Map( wasAffected ) );
	}
}

// Takes base delta class (`DeltaClass`) and a set of `operations` that are transformation results and creates
// one or more deltas, acknowledging that the result is a transformation of a delta that is of `DeltaClass`.
//
// The normalization ensures that each delta has it's "normal" state, that is, for example, `MoveDelta` has
// just one `MoveOperation`, `SplitDelta` has just two operations of which first is `InsertOperation` and second
// is `MoveOperation` or `NoOperation`, etc.
function getNormalizedDeltas( DeltaClass, operations ) {
	let deltas = [];
	let delta = null;
	let attributeOperationIndex;

	switch ( DeltaClass ) {
		case MoveDelta:
		case RemoveDelta:
			// Normal MoveDelta has just one MoveOperation.
			// Take all operations and create MoveDelta for each of them.
			for ( const o of operations ) {
				if ( o instanceof NoOperation ) {
					// An operation may be instance of NoOperation and this may be correct.
					// If that's the case, do not create a MoveDelta with singular NoOperation.
					// Create "no delta" instead, that is Delta instance with NoOperation.
					delta = new Delta();
				} else {
					if ( o instanceof RemoveOperation ) {
						delta = new RemoveDelta();
					} else {
						delta = new MoveDelta();
					}
				}

				delta.addOperation( o );
				deltas.push( delta );
			}

			// Return all created MoveDeltas.
			return deltas;
		case SplitDelta:
		case WrapDelta:
			// Normal SplitDelta and WrapDelta have two operations: first is InsertOperation and second is MoveOperation.
			// The MoveOperation may be split into multiple MoveOperations.
			// If that's the case, convert additional MoveOperations into MoveDeltas.
			// First, create normal SplitDelta or WrapDelta, using first two operations.
			delta = new DeltaClass();
			delta.addOperation( operations[ 0 ] );
			delta.addOperation( operations[ 1 ] );
			// Then, take all but last two operations and use them to create normalized MoveDeltas.
			deltas = getNormalizedDeltas( MoveDelta, operations.slice( 2 ) );

			// Return all deltas as one array, in proper order.
			return [ delta ].concat( deltas );
		case MergeDelta:
		case UnwrapDelta:
			// Normal MergeDelta and UnwrapDelta have two operations: first is MoveOperation and second is RemoveOperation.
			// The MoveOperation may be split into multiple MoveOperations.
			// If that's the case, convert additional MoveOperations into MoveDeltas.
			// Take all but last two operations and use them to create normalized MoveDeltas.
			deltas = getNormalizedDeltas( MoveDelta, operations.slice( 0, -2 ) );
			// Then, create normal MergeDelta or UnwrapDelta, using last two operations.
			delta = new DeltaClass();
			delta.addOperation( operations[ operations.length - 2 ] );
			delta.addOperation( operations[ operations.length - 1 ] );

			// Return all deltas as one array, in proper order.
			return deltas.concat( delta );
		case RenameDelta:
			// RenameDelta may become a "no delta" if it's only operation is transformed to NoOperation.
			// This may happen when RenameOperation is transformed by RenameOperation.
			// Keep in mind that RenameDelta always have just one operation.
			if ( operations[ 0 ] instanceof NoOperation ) {
				delta = new Delta();
			} else {
				delta = new RenameDelta();
			}

			delta.addOperation( operations[ 0 ] );

			return [ delta ];
		case AttributeDelta:
			// AttributeDelta is allowed to have multiple AttributeOperations and also NoOperations but
			// the first operation has to be an AttributeOperation as it is used as a reference for deltas properties.
			// Keep in mind that we cannot simply remove NoOperations cause that would mess up base versions.
			// Find an index of first operation that is not a NoOperation.
			for ( attributeOperationIndex = 0; attributeOperationIndex < operations.length; attributeOperationIndex++ ) {
				if ( !( operations[ attributeOperationIndex ] instanceof NoOperation ) ) {
					break;
				}
			}

			// No AttributeOperations has been found. Convert AttributeDelta to "no delta".
			if ( attributeOperationIndex == operations.length ) {
				delta = new Delta();
			}
			// AttributeOperation found.
			else {
				delta = new AttributeDelta();

				// AttributeOperation wasn't the first operation.
				if ( attributeOperationIndex != 0 ) {
					// Move AttributeOperation to the beginning.
					operations.unshift( operations.splice( attributeOperationIndex, 1 )[ 0 ] );
					// No need to update base versions - they are updated at the end of transformation algorithm anyway.
				}
			}

			// Add all operations to the delta (even if it is just a couple of NoOperations we have to keep them all).
			for ( const o of operations ) {
				delta.addOperation( o );
			}

			return [ delta ];
		default:
			// For all other deltas no normalization is needed.
			delta = new DeltaClass();

			for ( const o of operations ) {
				delta.addOperation( o );
			}

			return [ delta ];
	}
}

/**
 * Object containing values and flags describing context of a transformation.
 *
 * @typedef {Object} module:engine/model/delta/transform~transformationContext
 * @property {Boolean} useAdditionalContext Whether additional context should be evaluated and used during transformations.
 * @property {Boolean} isStrong Whether transformed deltas are more (`true`) or less (`false`) important than deltas to transform by.
 * @property {module:engine/model/document~Document} [document] Model document which is a context for transformations.
 * Available only if `useAdditionalContext` is `true`.
 * @property {Boolean|undefined} forceWeakRemove Whether {@link module:engine/model/operation/removeoperation~RemoveOperation}
 * should be always more important than other operations. Available only if `useAdditionalContext` is `true`.
 * @property {Boolean|undefined} insertBefore Used when transforming {@link module:engine/model/operation/moveoperation~MoveOperation}s
 * If two `MoveOperation`s target to the same position, `insertBefore` is used to resolve such conflict. This flag
 * is set and used internally by transformation algorithms. Available only if `useAdditionalContext` is `true`.
 * @property {Boolean|undefined} forceNotSticky Used when transforming
 * {@link module:engine/model/operation/moveoperation~MoveOperation#isSticky sticky MoveOperation}. If set to `true`,
 * `isSticky` flag is discarded during transformations. This flag is set and used internally by transformation algorithms.
 * Available only if `useAdditionalContext` is `true`.
 * @property {Map|undefined} wasAffected Used to evaluate `insertBefore` flag. This map is set and used internally by
 * transformation algorithms. Available only if `useAdditionalContext` is `true`.
 */
