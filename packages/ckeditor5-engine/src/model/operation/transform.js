import InsertOperation from './insertoperation';
import AttributeOperation from './attributeoperation';
import RenameOperation from './renameoperation';
import MarkerOperation from './markeroperation';
import MoveOperation from './moveoperation';
import RootAttributeOperation from './rootattributeoperation';
import MergeOperation from './mergeoperation';
import SplitOperation from './splitoperation';
import WrapOperation from './wrapoperation';
import UnwrapOperation from './unwrapoperation';
import NoOperation from './nooperation';
import Range from '../range';
import Position from '../position';

import compareArrays from '@ckeditor/ckeditor5-utils/src/comparearrays';
import log from '@ckeditor/ckeditor5-utils/src/log';

const transformations = new Map();

/**
 * @module engine/model/operation/transform
 */

/**
 * Sets a transformation function to be be used to transform instances of class `OperationA` by instances of class `OperationB`.
 *
 * The `transformationFunction` is passed three parameters:
 *
 * * `a` - operation to be transformed, an instance of `OperationA`,
 * * `b` - operation to be transformed by, an instance of `OperationB`,
 * * {@link module:engine/model/operation/transform~TransformationContext `context`} - object with additional information about
 * transformation context.
 *
 * The `transformationFunction` should return transformation result, which is an array with one or multiple
 * {@link module:engine/model/operation/operation~Operation operation} instances.
 *
 * @protected
 * @param {Function} OperationA
 * @param {Function} OperationB
 * @param {Function} transformationFunction Function to use for transforming.
 */
function setTransformation( OperationA, OperationB, transformationFunction ) {
	let aGroup = transformations.get( OperationA );

	if ( !aGroup ) {
		aGroup = new Map();
		transformations.set( OperationA, aGroup );
	}

	aGroup.set( OperationB, transformationFunction );
}

/**
 * Returns a previously set transformation function for transforming an instance of `OperationA` by an instance of `OperationB`.
 *
 * If no transformation was set for given pair of operations, {@link module:engine/model/operation/transform~noUpdateTransformation}
 * is returned. This means that if no transformation was set, the `OperationA` instance will not change when transformed
 * by the `OperationB` instance.
 *
 * @private
 * @param {Function} OperationA
 * @param {Function} OperationB
 * @returns {Function} Function set to transform an instance of `OperationA` by an instance of `OperationB`.
 */
function getTransformation( OperationA, OperationB ) {
	const aGroup = transformations.get( OperationA );

	if ( aGroup && aGroup.has( OperationB ) ) {
		return aGroup.get( OperationB );
	}

	return noUpdateTransformation;
}

/**
 * A transformation function that only clones operation to transform, without changing it.
 *
 * @private
 * @param {module:engine/model/operation/operation~Operation} a Operation to transform.
 * @returns {Array.<module:engine/model/operation/operation~Operation>}
 */
function noUpdateTransformation( a ) {
	return [ a ];
}

/**
 * Transforms operation `a` by operation `b`.
 *
 * @param {module:engine/model/operation/operation~Operation} a Operation to be transformed.
 * @param {module:engine/model/operation/operation~Operation} b Operation to transform by.
 * @param {module:engine/model/operation/transform~TransformationContext} context Transformation context for this transformation.
 * @returns {Array.<module:engine/model/operation/operation~Operation>} Transformation result.
 */
export function transform( a, b, context = {} ) {
	const transformationFunction = getTransformation( a.constructor, b.constructor );

	try {
		a = a.clone();

		return transformationFunction( a, b, context );
	} catch ( e ) {
		log.error( 'Error during operation transformation!', e.message );
		log.error( 'Transformed operation', a );
		log.error( 'Operation transformed by', b );
		log.error( 'context.aIsStrong', context.aIsStrong );
		log.error( 'context.aWasUndone', context.aWasUndone );
		log.error( 'context.bWasUndone', context.bWasUndone );
		log.error( 'context.abRelation', context.abRelation );
		log.error( 'context.baRelation', context.baRelation );

		throw e;
	}
}

/**
 * Performs a transformation of two sets of operations - `operationsA` and `operationsB`. The transformation is two-way -
 * both transformed `operationsA` and transformed `operationsB` are returned.
 *
 * Note, that the first operation in each set should base on the same document state (
 * {@link module:engine/model/document~Document#version document version}).
 *
 * It is assumed that `operationsA` are "more important" during conflict resolution between two operations.
 *
 * New copies of both passed arrays and operations inside them are returned. Passed arguments are not altered.
 *
 * Base versions of the transformed operations sets are updated accordingly. For example, assume that base versions are `4`
 * and there are `3` operations in `operationsA` and `5` operations in `operationsB`. Then:
 *
 * * transformed `operationsA` will start from base version `9` (`4` base version + `5` operations B),
 * * transformed `operationsB` will start from base version `7` (`4` base version + `3` operations A).
 *
 * If no operation was broken into two during transformation, then both sets will end up with an operation that bases on version `11`:
 *
 * * transformed `operationsA` start from `9` and there are `3` of them, so the last will have `baseVersion` equal to `11`,
 * * transformed `operationsB` start from `7` and there are `5` of them, so the last will have `baseVersion` equal to `11`.
 *
 * @param {Array.<module:engine/model/operation/operation~Operation>} operationsA
 * @param {Array.<module:engine/model/operation/operation~Operation>} operationsB
 * @param {Object} options Additional transformation options.
 * @param {module:engine/model/document~Document|null} options.document Document which the operations change.
 * @param {Boolean} [options.useContext=false] Whether during transformation additional context information should be gathered and used.
 * @param {Boolean} [options.padWithNoOps=false] Whether additional {@link module:engine/model/operation/nooperation~NoOperation}s
 * should be added to the transformation results to force the same last base version for both transformed sets (in case
 * if some operations got broken into multiple operations during transformation).
 * @returns {Object} Transformation result.
 * @returns {Array.<module:engine/model/operation/operation~Operation>} return.operationsA Transformed `operationsA`.
 * @returns {Array.<module:engine/model/operation/operation~Operation>} return.operationsB Transformed `operationsB`.
 */
export function transformSets( operationsA, operationsB, options ) {
	// Create new arrays so the originally passed arguments are not changed.
	// No need to clone operations, they are cloned as they are transformed.
	operationsA = operationsA.slice();
	operationsB = operationsB.slice();

	// If one of sets is empty there is simply nothing to transform, so return sets as they are.
	if ( operationsA.length == 0 || operationsB.length == 0 ) {
		return { operationsA, operationsB };
	}
	//
	// Following is a description of transformation process:
	//
	// There are `operationsA` and `operationsB` to be transformed, both by both.
	//
	// So, suppose we have sets of two operations each: `operationsA` = `[ a1, a2 ]`, `operationsB` = `[ b1, b2 ]`.
	//
	// Remember, that we can only transform operations that base on the same context. We assert that `a1` and `b1` base on
	// the same context and we transform them. Then, we get `a1'` and `b1'`. `a2` bases on a context with `a1` -- `a2`
	// is an operation that followed `a1`. Similarly, `b2` bases on a context with `b1`.
	//
	// However, since `a1'` is a result of transformation by `b1`, `a1'` now also has a context with `b1`. This means that
	// we can safely transform `a1'` by `b2`. As we finish transforming `a1`, we also transformed all `operationsB`.
	// All `operationsB` also have context including `a1`. Now, we can properly transform `a2` by those operations.
	//
	// The transformation process can be visualized on a transformation diagram ("diamond diagram"):
	//
	//          [the initial state]
	//         [common for a1 and b1]
	//
	//                   *
	//                  / \
	//                 /   \
	//               b1     a1
	//               /       \
	//              /         \
	//             *           *
	//            / \         / \
	//           /   \       /   \
	//         b2    a1'   b1'    a2
	//         /       \   /       \
	//        /         \ /         \
	//       *           *           *
	//        \         / \         /
	//         \       /   \       /
	//        a1''   b2'   a2'   b1''
	//           \   /       \   /
	//            \ /         \ /
	//             *           *
	//              \         /
	//               \       /
	//              a2''   b2''
	//                 \   /
	//                  \ /
	//                   *
	//
	//           [the final state]
	//
	// The final state can be reached from the initial state by applying `a1`, `a2`, `b1''` and `b2''`, as well as by
	// applying `b1`, `b2`, `a1''`, `a2''`. Note how the operations get to a proper common state before each pair is
	// transformed.
	//
	// Another thing to consider is that an operation during transformation can be broken into multiple operations.
	// Suppose that `a1` * `b1` = `[ a11', a12' ]` (instead of `a1'` that we considered previously).
	//
	// In that case, we leave `a12'` for later and we continue transforming `a11'` until it is transformed by all `operationsB`
	// (in our case it is just `b2`). At this point, `b1` is transformed by "whole" `a1`, while `b2` is only transformed
	// by `a11'`. Similarly, `a12'` is only transformed by `b1`. This leads to a conclusion that we need to start transforming `a12'`
	// from the moment just after it was broken. So, `a12'` is transformed by `b2`. Now, "the whole" `a1` is transformed
	// by `operationsB`, while all `operationsB` are transformed by "the whole" `a1`. This means that we can continue with
	// following `operationsA` (in our case it is just `a2`).
	//
	// Of course, also `operationsB` can be broken. However, since we focus on transforming operation `a` to the end,
	// the only thing to do is to store both pieces of operation `b`, so that the next transformed operation `a` will
	// be transformed by both of them.
	//
	//                       *
	//                      / \
	//                     /   \
	//                    /     \
	//                  b1       a1
	//                  /         \
	//                 /           \
	//                /             \
	//               *               *
	//              / \             / \
	//             /  a11'         /   \
	//            /     \         /     \
	//          b2       *      b1'      a2
	//          /       / \     /         \
	//         /       /  a12' /           \
	//        /       /     \ /             \
	//       *       b2'     *               *
	//        \     /       / \             /
	//       a11'' /     b21'' \           /
	//          \ /       /     \         /
	//           *       *      a2'     b1''
	//            \     / \       \     /
	//          a12'' b22''\       \   /
	//              \ /     \       \ /
	//               *      a2''     *
	//                \       \     /
	//                 \       \  b21'''
	//                  \       \ /
	//                a2'''      *
	//                    \     /
	//                     \  b22'''
	//                      \ /
	//                       *
	//
	// Note, how `a1` is broken and transformed into `a11'` and `a12'`, while `b2'` got broken and transformed into `b21''` and `b22''`.
	//
	// Having all that on mind, here is an outline for the transformation process algorithm:
	//
	// 1. We have `operationsA` and `operationsB` array, which we dynamically update as the transformation process goes.
	//
	// 2. We take next (or first) operation from `operationsA` and check from which operation `b` we need to start transforming it.
	// All original `operationsA` are set to be transformed starting from the first operation `b`.
	//
	// 3. We take operations from `operationsB`, one by one, starting from the correct one, and transform operation `a`
	// by operation `b` (and vice versa). We update `operationsA` and `operationsB` by replacing the original operations
	// with the transformation results.
	//
	// 4. If operation is broken into multiple operations, we save all the new operations in the place of the
	// original operation.
	//
	// 5. Additionally, if operation `a` was broken, for the "new" operation, we remember from which operation `b` it should
	// be transformed by.
	//
	// 6. We continue transforming "current" operation `a` until it is transformed by all `operationsB`. Then, go to 2.
	// unless the last operation `a` was transformed.
	//
	// The actual implementation of the above algorithm is slightly different, as only one loop (while) is used.
	// The difference is that we have "current" `a` operation to transform and we store the index of the next `b` operation
	// to transform by. Each loop operates on two indexes then: index pointing to currently processed `a` operation and
	// index pointing to next `b` operation. Each loop is just one `a * b` + `b * a` transformation. After each loop
	// operation `b` index is updated. If all `b` operations were visited for the current `a` operation, we change
	// current `a` operation index to the next one.
	//

	// For each operation `a`, keeps information what is the index in `operationsB` from which the transformation should start.
	const nextTransformIndex = new WeakMap();

	// For all the original `operationsA`, set that they should be transformed starting from the first of `operationsB`.
	for ( const op of operationsA ) {
		nextTransformIndex.set( op, 0 );
	}

	// Additional data that is used for some postprocessing after the main transformation process is done.
	const data = {
		nextBaseVersionA: operationsA[ operationsA.length - 1 ].baseVersion + 1,
		nextBaseVersionB: operationsB[ operationsB.length - 1 ].baseVersion + 1,
		originalOperationsACount: operationsA.length,
		originalOperationsBCount: operationsB.length
	};

	const contextFactory = new ContextFactory( options.document, options.useContext );
	contextFactory.setOriginalOperations( operationsA );
	contextFactory.setOriginalOperations( operationsB );

	// Index of currently transformed operation `a`.
	let i = 0;

	// While not all `operationsA` are transformed...
	while ( i < operationsA.length ) {
		// Get "current" operation `a`.
		const opA = operationsA[ i ];

		// For the "current" operation `a`, get the index of the next operation `b` to transform by.
		const indexB = nextTransformIndex.get( opA );

		// If operation `a` was already transformed by every operation `b`, change "current" operation `a` to the next one.
		if ( indexB == operationsB.length ) {
			i++;
			continue;
		}

		const opB = operationsB[ indexB ];

		// Transform `a` by `b` and `b` by `a`.
		const newOpsA = transform( opA, opB, contextFactory.getContext( opA, opB, true ) );
		const newOpsB = transform( opB, opA, contextFactory.getContext( opB, opA, false ) );
		// As a result we get one or more `newOpsA` and one or more `newOpsB` operations.

		// Update contextual information about operations.
		contextFactory.updateRelation( opA, opB );

		contextFactory.setOriginalOperations( newOpsA, opA );
		contextFactory.setOriginalOperations( newOpsB, opB );

		// For new `a` operations, update their index of the next operation `b` to transform them by.
		//
		// This is needed even if there was only one result (`a` was not broken) because that information is used
		// at the beginning of this loop every time.
		for ( const newOpA of newOpsA ) {
			// Acknowledge, that operation `b` also might be broken into multiple operations.
			//
			// This is why we raise `indexB` not just by 1. If `newOpsB` are multiple operations, they will be
			// spliced in the place of `opB`. So we need to change `transformBy` accordingly, so that an operation won't
			// be transformed by the same operation (part of it) again.
			nextTransformIndex.set( newOpA, indexB + newOpsB.length );
		}

		// Update `operationsA` and `operationsB` with the transformed versions.
		operationsA.splice( i, 1, ...newOpsA );
		operationsB.splice( indexB, 1, ...newOpsB );
	}

	if ( options.padWithNoOps ) {
		// If no-operations padding is enabled, count how many extra `a` and `b` operations were generated.
		const brokenOperationsACount = operationsA.length - data.originalOperationsACount;
		const brokenOperationsBCount = operationsB.length - data.originalOperationsBCount;

		// Then, if that number is not the same, pad `operationsA` or `operationsB` with correct number of no-ops so
		// that the base versions are equalled.
		//
		// Note that only one array will be updated, as only one of those subtractions can be greater than zero.
		padWithNoOps( operationsA, brokenOperationsBCount - brokenOperationsACount );
		padWithNoOps( operationsB, brokenOperationsACount - brokenOperationsBCount );
	}

	// Finally, update base versions of transformed operations.
	updateBaseVersions( operationsA, data.nextBaseVersionB );
	updateBaseVersions( operationsB, data.nextBaseVersionA );

	return { operationsA, operationsB };
}

// Gathers additional data about operations processed during transformation. Can be used to obtain contextual information
// about two operations that are about to be transformed. This contextual information can be used for better conflict resolution.
class ContextFactory {
	// Creates `ContextFactory` instance.
	//
	// @param {module:engine/model/document~Document} document Document which the operations change.
	// @param {Boolean} useContext Whether during transformation additional context information should be gathered and used.
	constructor( document, useContext ) {
		// `model.History` instance which information about undone operations will be taken from.
		this._history = document.history;

		// Whether additional context should be used.
		this._useContext = useContext;

		// For each operation that is created during transformation process, we keep a reference to the original operation
		// which it comes from. The original operation works as a kind of "identifier". Every contextual information
		// gathered during transformation that we want to save for given operation, is actually saved for the original operation.
		// This way no matter if operation `a` is cloned, then transformed, even breaks, we still have access to the previously
		// gathered data through original operation reference.
		this._originalOperations = new Map();

		// Relations is a double-map structure (maps in map) where for two operations we store how those operations were related
		// to each other. Those relations are evaluated during transformation process. For every transformated pair of operations
		// we keep relations between them.
		this._relations = new Map();
	}

	// Sets "original operation" for given operations.
	//
	// During transformation process, operations are cloned, then changed, then processed again, sometimes broken into two
	// or multiple operations. When gathering additional data it is important that all operations can be somehow linked
	// so a cloned and transformed "version" still kept track of the data assigned earlier to it.
	//
	// The original operation object will be used as such an universal linking id. Throughout the transformation process
	// all cloned operations will refer to "the original operation" when storing and reading additional data.
	//
	// If `takeFrom` is not set, each operation from `operations` array will be assigned itself as "the original operation".
	// This should be used as an initialization step.
	//
	// If `takeFrom` is set, each operation from `operations` will be assigned the same original operation as assigned
	// for `takeFrom` operation. This should be used to update original operations. It should be used in a way that
	// `operations` are the result of `takeFrom` transformation to ensure proper "original operation propagation".
	//
	// @param {Array.<module:engine/model/operation/operation~Operation>} operations
	// @param {module:engine/model/operation/operation~Operation|null} [takeFrom=null]
	setOriginalOperations( operations, takeFrom = null ) {
		const originalOperation = takeFrom ? this._originalOperations.get( takeFrom ) : null;

		for ( const operation of operations ) {
			this._originalOperations.set( operation, originalOperation || operation );
		}
	}

	// Saves a relation between operations `opA` and `opB`.
	//
	// Relations are then later used to help solve conflicts when operations are transformed.
	//
	// @param {module:engine/model/operation/operation~Operation} opA
	// @param {module:engine/model/operation/operation~Operation} opB
	updateRelation( opA, opB ) {
		// The use of relations is described in a bigger detail in transformation functions.
		//
		// In brief, this function, for specified pairs of operation types, checks how positions defined in those operations relate.
		// Then those relations are saved. For example, for two move operations, it is saved if one of those operations target
		// position is before the other operation source position. This kind of information gives contextual information when
		// transformation is used during undo. Similar checks are done for other pairs of operations.
		//
		switch ( opA.constructor ) {
			case MoveOperation: {
				switch ( opB.constructor ) {
					case MergeOperation: {
						if ( opA.targetPosition.isEqual( opB.sourcePosition ) || opB.movedRange.containsPosition( opA.targetPosition ) ) {
							this._setRelation( opA, opB, 'insertAtSource' );
						} else if ( opA.targetPosition.isEqual( opB.deletionPosition ) ) {
							this._setRelation( opA, opB, 'insertBetween' );
						}

						break;
					}

					case MoveOperation: {
						if ( opA.targetPosition.isEqual( opB.sourcePosition ) || opA.targetPosition.isBefore( opB.sourcePosition ) ) {
							this._setRelation( opA, opB, 'insertBefore' );
						} else {
							this._setRelation( opA, opB, 'insertAfter' );
						}

						break;
					}

					case UnwrapOperation: {
						const isInside = opA.targetPosition.hasSameParentAs( opB.position );

						if ( isInside ) {
							this._setRelation( opA, opB, 'insertInside' );
						}

						break;
					}
				}

				break;
			}

			case SplitOperation: {
				switch ( opB.constructor ) {
					case MergeOperation: {
						if ( opA.position.isBefore( opB.sourcePosition ) ) {
							this._setRelation( opA, opB, 'splitBefore' );
						}

						break;
					}

					case MoveOperation: {
						if ( opA.position.isEqual( opB.sourcePosition ) || opA.position.isBefore( opB.sourcePosition ) ) {
							this._setRelation( opA, opB, 'splitBefore' );
						}

						break;
					}
				}

				break;
			}
		}
	}

	// Evaluates and returns contextual information about two given operations `opA` and `opB` which are about to be transformed.
	//
	// @param {module:engine/model/operation/operation~Operation} opA
	// @param {module:engine/model/operation/operation~Operation} opB
	// @returns {module:engine/model/operation/transform~TransformationContext}
	getContext( opA, opB, aIsStrong ) {
		if ( !this._useContext ) {
			return {
				aIsStrong,
				aWasUndone: false,
				bWasUndone: false,
				abRelation: null,
				baRelation: null
			};
		}

		return {
			aIsStrong,
			aWasUndone: this._wasUndone( opA ),
			bWasUndone: this._wasUndone( opB ),
			abRelation: this._getRelation( opA, opB ),
			baRelation: this._getRelation( opB, opA )
		};
	}

	// Returns whether given operation `op` has already been undone.
	//
	// This is only used when additional context mode is on (options.useContext == true).
	//
	// Information whether an operation was undone gives more context when making a decision when two operations are in conflict.
	//
	// @param {module:engine/model/operation/operation~Operation} op
	// @returns {Boolean}
	_wasUndone( op ) {
		// For `op`, get its original operation. After all, if `op` is a clone (or even transformed clone) of another
		// operation, literally `op` couldn't be undone. It was just generated. If anything, it was the operation it origins
		// from which was undone. So get that original operation.
		const originalOp = this._originalOperations.get( op );

		// And check with the document if the original operation was undone.
		return this._history.isUndoneOperation( originalOp );
	}

	// Returns a relation between `opA` and an operation which is undone by `opB`. This can be `String` value if a relation
	// was set earlier or `null` if there was no relation between those operations.
	//
	// This is only used when additional context mode is on (options.useContext == true).
	//
	// This is a little tricky to understand, so let's compare it to `ContextFactory#_wasUndone`.
	//
	// When `wasUndone( opB )` is used, we check if the `opB` has already been undone. It is obvious, that the
	// undoing operation must happen after the undone operation. So, essentially, we have `opB`, we take document history,
	// we look forward in the future and ask if in that future `opB` was undone.
	//
	// Relations is a backward process to `wasUndone()`.
	//
	// Long story short - using relations is asking what happened in the past. Looking back. This time we have an undoing
	// operation `opB` which has undone some other operation. When there is a transformation `opA` x `opB` and there is
	// a conflict to solve and `opB` is an undoing operation, we can look back in the history and see what was a relation
	// between `opA` and the operation which `opB` undone. Basing on that relation from the past, we can now make
	// a better decision when resolving a conflict between two operations, because we know more about the context of
	// those two operations.
	//
	// This is why this function does not return a relation directly between `opA` and `opB` because we need to look
	// back to search for a meaningful contextual information.
	//
	// @param {module:engine/model/operation/operation~Operation} opA
	// @param {module:engine/model/operation/operation~Operation} opB
	// @returns {String|null}
	_getRelation( opA, opB ) {
		// Get the original operation. Similarly as in `wasUndone()` it is used as an universal identifier for stored data.
		const origB = this._originalOperations.get( opB );
		const undoneB = this._history.getUndoneOperation( origB );

		// If `opB` is not undoing any operation, there is no relation.
		if ( !undoneB ) {
			return null;
		}

		const origA = this._originalOperations.get( opA );
		const relationsA = this._relations.get( origA );

		// Get all relations for `opA`, and check if there is a relation with `opB`-undone-counterpart. If so, return it.
		if ( relationsA ) {
			return relationsA.get( undoneB ) || null;
		}

		return null;
	}

	// Helper function for `ContextFactory#updateRelations`.
	//
	// @private
	// @param {module:engine/model/operation/operation~Operation} opA
	// @param {module:engine/model/operation/operation~Operation} opB
	// @param {String} relation
	_setRelation( opA, opB, relation ) {
		// As always, setting is for original operations, not the clones/transformed operations.
		const origA = this._originalOperations.get( opA );
		const origB = this._originalOperations.get( opB );

		let relationsA = this._relations.get( origA );

		if ( !relationsA ) {
			relationsA = new Map();
			this._relations.set( origA, relationsA );
		}

		relationsA.set( origB, relation );
	}
}

/**
 * Holds additional contextual information about a transformed pair of operations (`a` and `b`). Those information
 * can be used for better conflict resolving.
 *
 * @typedef {Object} module:engine/model/operation/transform~TransformationContext
 *
 * @property {Boolean} aIsStrong Whether `a` is strong operation in this transformation, or weak.
 * @property {Boolean} aWasUndone Whether `a` operation was undone.
 * @property {Boolean} bWasUndone Whether `b` operation was undone.
 * @property {String|null} abRelation The relation between `a` operation and an operation undone by `b` operation.
 * @property {String|null} baRelation The relation between `b` operation and an operation undone by `a` operation.
 */

/**
 * An utility function that updates {@link module:engine/model/operation/operation~Operation#baseVersion base versions}
 * of passed operations.
 *
 * The function simply sets `baseVersion` as a base version of the first passed operation and then increments it for
 * each following operation in `operations`.
 *
 * @private
 * @param {Array.<module:engine/model/operation/operation~Operation>} operations Operations to update.
 * @param {Number} baseVersion Base version to set for the first operation in `operations`.
 */
function updateBaseVersions( operations, baseVersion ) {
	for ( const operation of operations ) {
		operation.baseVersion = baseVersion++;
	}
}

/**
 * Adds `howMany` instances of {@link module:engine/model/operation/nooperation~NoOperation} to `operations` set.
 *
 * @private
 * @param {Array.<module:engine/model/operation/operation~Operation>} operations
 * @param {Number} howMany
 */
function padWithNoOps( operations, howMany ) {
	for ( let i = 0; i < howMany; i++ ) {
		operations.push( new NoOperation( 0 ) );
	}
}

// -----------------------

setTransformation( AttributeOperation, AttributeOperation, ( a, b, context ) => {
	if ( a.key === b.key ) {
		// If operations attributes are in conflict, check if their ranges intersect and manage them properly.

		// First, we want to apply change to the part of a range that has not been changed by the other operation.
		const operations = a.range.getDifference( b.range ).map( range => {
			return new AttributeOperation( range, a.key, a.oldValue, a.newValue, 0 );
		} );

		// Then we take care of the common part of ranges.
		const common = a.range.getIntersection( b.range );

		if ( common ) {
			// If this operation is more important, we also want to apply change to the part of the
			// original range that has already been changed by the other operation. Since that range
			// got changed we also have to update `oldValue`.
			if ( context.aIsStrong ) {
				operations.push( new AttributeOperation( common, b.key, b.newValue, a.newValue, 0 ) );
			}
		}

		if ( operations.length == 0 ) {
			return [ new NoOperation( 0 ) ];
		}

		return operations;
	} else {
		// If operations don't conflict, simply return an array containing just a clone of this operation.
		return [ a ];
	}
} );

setTransformation( AttributeOperation, InsertOperation, ( a, b ) => {
	// Case 1:
	//
	// The attribute operation range includes the position where nodes were inserted.
	// There are two possible scenarios: the inserted nodes were text and they should receive attributes or
	// the inserted nodes were elements and they should not receive attributes.
	//
	if ( a.range.start.hasSameParentAs( b.position ) && a.range.containsPosition( b.position ) ) {
		// If new nodes should not receive attributes, two separated ranges will be returned.
		// Otherwise, one expanded range will be returned.
		const range = a.range._getTransformedByInsertion( b.position, b.howMany, !b.shouldReceiveAttributes );
		const result = range.map( r => {
			return new AttributeOperation( r, a.key, a.oldValue, a.newValue, a.baseVersion );
		} );

		if ( b.shouldReceiveAttributes ) {
			// `AttributeOperation#range` includes some newly inserted text.
			// The operation should also change the attribute of that text. An example:
			//
			// Bold should be applied on the following range:
			// <p>Fo[zb]ar</p>
			//
			// In meantime, new text is typed:
			// <p>Fozxxbar</p>
			//
			// Bold should be applied also on the new text:
			// <p>Fo[zxxb]ar</p>
			// <p>Fo<$text bold="true">zxxb</$text>ar</p>
			//
			// There is a special case to consider here to consider.
			//
			// Consider setting an attribute with multiple possible values, for example `highlight`. The inserted text might
			// have already an attribute value applied and the `oldValue` property of the attribute operation might be wrong:
			//
			// Attribute `highlight="yellow"` should be applied on the following range:
			// <p>Fo[zb]ar<p>
			//
			// In meantime, character `x` with `highlight="red"` is typed:
			// <p>Fo[z<$text highlight="red">x</$text>b]ar</p>
			//
			// In this case we cannot simply apply operation changing the attribute value from `null` to `"yellow"` for the whole range
			// because that would lead to an exception (`oldValue` is incorrect for `x`).
			//
			// We also cannot break the original range as this would mess up a scenario when there are multiple following
			// insert operations, because then only the first inserted character is included in those ranges:
			// <p>Fo[z][x][b]ar</p>   -->   <p>Fo[z][x]x[b]ar</p>   -->   <p>Fo[z][x]xx[b]ar</p>
			//
			// So, the attribute range needs be expanded, no matter what attributes are set on the inserted nodes:
			//
			// <p>Fo[z<$text highlight="red">x</$text>b]ar</p>      <--- Change from `null` to `yellow`, throwing an exception.
			//
			// But before that operation would be applied, we will add an additional attribute operation that will change
			// attributes on the inserted nodes in a way which would make the original operation correct:
			//
			// <p>Fo[z{<$text highlight="red">}x</$text>b]ar</p>    <--- Change range `{}` from `red` to `null`.
			// <p>Fo[zxb]ar</p>                                     <--- Now change from `null` to `yellow` is completely fine.
			//

			// Generate complementary attribute operation. Be sure to add it before the original operation.
			const op = _getComplementaryAttributeOperations( b, a.key, a.oldValue );

			if ( op ) {
				result.unshift( op );
			}
		}

		// If nodes should not receive new attribute, we are done here.
		return result;
	}

	// If insert operation is not expanding the attribute operation range, simply transform the range.
	a.range = a.range._getTransformedByInsertion( b.position, b.howMany, false )[ 0 ];

	return [ a ];
} );

/**
 * Helper function for `AttributeOperation` x `InsertOperation` (and reverse) transformation.
 *
 * For given `insertOperation` it checks the inserted node if it has an attribute `key` set to a value different
 * than `newValue`. If so, it generates an `AttributeOperation` which changes the value of `key` attribute to `newValue`.
 *
 * @private
 * @param {module:engine/model/operation/insertoperation~InsertOperation} insertOperation
 * @param {String} key
 * @param {*} newValue
 * @returns {module:engine/model/operation/attributeoperation~AttributeOperation|null}
 */
function _getComplementaryAttributeOperations( insertOperation, key, newValue ) {
	const nodes = insertOperation.nodes;

	// At the beginning we store the attribute value from the first node.
	const insertValue = nodes.getNode( 0 ).getAttribute( key );

	if ( insertValue == newValue ) {
		return null;
	}

	const range = new Range( insertOperation.position, insertOperation.position.getShiftedBy( insertOperation.howMany ) );

	return new AttributeOperation( range, key, insertValue, newValue, 0 );
}

setTransformation( AttributeOperation, MergeOperation, ( a, b ) => {
	const ranges = [];

	// Case 1:
	//
	// Attribute change on the merged element. In this case, the merged element was moved to the graveyard.
	// An additional attribute operation that will change the (re)moved element needs to be generated.
	//
	if ( a.range.start.hasSameParentAs( b.deletionPosition ) ) {
		if ( a.range.containsPosition( b.deletionPosition ) || a.range.start.isEqual( b.deletionPosition ) ) {
			ranges.push( Range.createFromPositionAndShift( b.graveyardPosition, 1 ) );
		}
	}

	const range = a.range._getTransformedByMergeOperation( b );

	// Do not add empty (collapsed) ranges to the result. `range` may be collapsed if it contained only the merged element.
	if ( !range.isCollapsed ) {
		ranges.push( range );
	}

	// Create `AttributeOperation`s out of the ranges.
	return ranges.map( range => {
		return new AttributeOperation( range, a.key, a.oldValue, a.newValue, a.baseVersion );
	} );
} );

setTransformation( AttributeOperation, MoveOperation, ( a, b ) => {
	const ranges = _breakRangeByMoveOperation( a.range, b );

	// Create `AttributeOperation`s out of the ranges.
	return ranges.map( range => new AttributeOperation( range, a.key, a.oldValue, a.newValue, a.baseVersion ) );
} );

// Helper function for `AttributeOperation` x `MoveOperation` transformation.
//
// Takes the passed `range` and transforms it by move operation `moveOp` in a specific way. Only top-level nodes of `range`
// are considered to be in the range. If move operation moves nodes deep from inside of the range, those nodes won't
// be included in the result. In other words, top-level nodes of the ranges from the result are exactly the same as
// top-level nodes of the original `range`.
//
// This is important for `AttributeOperation` because, for its range, it changes only the top-level nodes. So we need to
// track only how those nodes have been affected by `MoveOperation`.
//
// @private
// @param {module:engine/model/range~Range} range
// @param {module:engine/model/operation/moveoperation~MoveOperation} moveOp
// @returns {Array.<module:engine/model/range~Range>}
function _breakRangeByMoveOperation( range, moveOp ) {
	const moveRange = Range.createFromPositionAndShift( moveOp.sourcePosition, moveOp.howMany );

	// We are transforming `range` (original range) by `moveRange` (range moved by move operation). As usual when it comes to
	// transforming a ranges, we may have a common part of the ranges and we may have a difference part (zero to two ranges).
	let common = null;
	let difference = [];

	// Let's compare the ranges.
	if ( moveRange.containsRange( range, true ) ) {
		// If the whole original range is moved, treat it whole as a common part. There's also no difference part.
		common = range;
	} else if ( range.start.hasSameParentAs( moveRange.start ) ) {
		// If the ranges are "on the same level" (in the same parent) then move operation may move exactly those nodes
		// that are changed by the attribute operation. In this case we get common part and difference part in the usual way.
		difference = range.getDifference( moveRange );
		common = range.getIntersection( moveRange );
	} else {
		// In any other situation we assume that original range is different than move range, that is that move operation
		// moves other nodes that attribute operation change. Even if the moved range is deep inside in the original range.
		//
		// Note that this is different than in `.getIntersection` (we would get a common part in that case) and different
		// than `.getDifference` (we would get two ranges).
		difference = [ range ];
	}

	const result = [];

	// The default behaviour of `_getTransformedByMove` might get wrong results for difference part, though, so
	// we do it by hand.
	for ( let diff of difference ) {
		// First, transform the range by removing moved nodes. Since this is a difference, this is safe, `null` won't be returned
		// as the range is different than the moved range.
		diff = diff._getTransformedByDeletion( moveOp.sourcePosition, moveOp.howMany );

		// Transform also `targetPosition`.
		const targetPosition = moveOp.getMovedRangeStart();

		// Spread the range only if moved nodes are inserted only between the top-level nodes of the `diff` range.
		const spread = diff.start.hasSameParentAs( targetPosition );

		// Transform by insertion of moved nodes.
		diff = diff._getTransformedByInsertion( targetPosition, moveOp.howMany, spread );

		result.push( ...diff );
	}

	// Common part can be simply transformed by the move operation. This is because move operation will not target to
	// that common part (the operation would have to target inside its own moved range).
	if ( common ) {
		result.push(
			common._getTransformedByMove( moveOp.sourcePosition, moveOp.targetPosition, moveOp.howMany, false )[ 0 ]
		);
	}

	return result;
}

setTransformation( AttributeOperation, SplitOperation, ( a, b ) => {
	// Case 1:
	//
	// Split node is the last node in `AttributeOperation#range`.
	// `AttributeOperation#range` needs to be expanded to include the new (split) node.
	//
	// Attribute `type` to be changed to `numbered` but the `listItem` is split.
	// <listItem type="bulleted">foobar</listItem>
	//
	// After split:
	// <listItem type="bulleted">foo</listItem><listItem type="bulleted">bar</listItem>
	//
	// After attribute change:
	// <listItem type="numbered">foo</listItem><listItem type="numbered">foo</listItem>
	//
	if ( a.range.end.isEqual( b.insertionPosition ) && !b.graveyardPosition ) {
		a.range.end.offset++;

		return [ a ];
	}

	// Case 2:
	//
	// Split position is inside `AttributeOperation#range`, at the same level, so the nodes to change are
	// not going to make a flat range.
	//
	// Content with range-to-change and split position:
	// <p>Fo[zb^a]r</p>
	//
	// After split:
	// <p>Fozb</p><p>ar</p>
	//
	// Make two separate ranges containing all nodes to change:
	// <p>Fo[zb]</p><p>[a]r</p>
	//
	if ( a.range.start.hasSameParentAs( b.position ) && a.range.containsPosition( b.position ) ) {
		const secondPart = a.clone();

		secondPart.range = new Range(
			Position.createFromPosition( b.moveTargetPosition ),
			a.range.end._getCombined( b.position, b.moveTargetPosition )
		);

		a.range.end = Position.createFromPosition( b.position );
		a.range.end.stickiness = 'toPrevious';

		return [ a, secondPart ];
	}

	// The default case.
	//
	a.range = a.range._getTransformedBySplitOperation( b );

	return [ a ];
} );

setTransformation( AttributeOperation, WrapOperation, ( a, b ) => {
	// Case 1:
	//
	// `AttributeOperation#range` and range to wrap intersect. Multiple `AttributeOperation`s may be needed
	// to handle this situation as, after wrapping, the nodes to change may be in different parents.
	//
	// Both list items' type should be changed to numbered:
	// [<listItem type="bulleted">Foo</listItem><listItem type="bulleted">Bar</listItem>]
	//
	// Wrap one of the items inside block quote:
	// <blockQuote><listItem type="bulleted">Foo</listItem></blockQuote><listItem type="bulleted">Bar</listItem>
	//
	// Two operations are needed:
	// <blockQuote>[<listItem type="bulleted">Foo</listItem>]</blockQuote>[<listItem type="bulleted">Bar</listItem>]
	//
	// Up to there operations/ranges might be needed in other cases.
	//
	if ( a.range.start.hasSameParentAs( b.position ) ) {
		const ranges = a.range.getDifference( b.wrappedRange );
		const common = a.range.getIntersection( b.wrappedRange );

		if ( common ) {
			ranges.push( common );
		}

		// Create `AttributeOperation`s out of the ranges.
		return ranges.map( range => {
			return new AttributeOperation( range._getTransformedByWrapOperation( b ), a.key, a.oldValue, a.newValue, 0 );
		} );
	}

	// The default case.
	//
	a.range = a.range._getTransformedByWrapOperation( b );

	return [ a ];
} );

setTransformation( AttributeOperation, UnwrapOperation, ( a, b ) => {
	// Case 1:
	//
	// `AttributeOperation#range` contains element to unwrap. Two or three `AttributeOperation`s are needed to handle this
	// situation. The unwrapped element was moved to graveyard and needs a separate operation. Then, if the unwrapped
	// nodes end up inside the attribute operation range, the range needs to be broken on two parts.
	//
	if ( a.range.start.hasSameParentAs( b.targetPosition ) ) {
		const insertionPosition = b.targetPosition.getShiftedBy( b.howMany );

		let ranges = a.range._getTransformedByInsertion( b.targetPosition, b.howMany );

		ranges = ranges.reduce( ( result, range ) => {
			return result.concat( range._getTransformedByMove( insertionPosition, b.graveyardPosition, 1 ) );
		}, [] );

		// Create `AttributeOperation`s out of the ranges.
		return ranges.map( range => {
			return new AttributeOperation( range, a.key, a.oldValue, a.newValue, 0 );
		} );
	}

	// The default case.
	//
	a.range = a.range._getTransformedByUnwrapOperation( b );

	return [ a ];
} );

// -----------------------

setTransformation( InsertOperation, AttributeOperation, ( a, b ) => {
	const result = [ a ];

	// Case 1:
	//
	// The attribute operation range includes the position where nodes were inserted.
	// There are two possible scenarios: the inserted nodes were text and they should receive attributes or
	// the inserted nodes were elements and they should not receive attributes.
	//
	// This is a mirror scenario to the one described in `AttributeOperation` x `InsertOperation` transformation,
	// although this case is a little less complicated. In this case we simply need to change attributes of the
	// inserted nodes and that's it.
	//
	if ( a.shouldReceiveAttributes && a.position.hasSameParentAs( b.range.start ) && b.range.containsPosition( a.position ) ) {
		const op = _getComplementaryAttributeOperations( a, b.key, b.newValue );

		if ( op ) {
			result.push( op );
		}
	}

	// The default case is: do nothing.
	// `AttributeOperation` does not change the model tree structure so `InsertOperation` does not need to be changed.
	//
	return result;
} );

setTransformation( InsertOperation, InsertOperation, ( a, b, context ) => {
	// Case 1:
	//
	// Two insert operations insert nodes at the same position. Since they are the same, it needs to be decided
	// what will be the order of inserted nodes. However, there is no additional information to help in that
	// decision. Also, when `b` will be transformed by `a`, the same order must be maintained.
	//
	// To achieve that, we will check if the operation is strong.
	// If it is, it won't get transformed. If it is not, it will be moved.
	//
	if ( a.position.isEqual( b.position ) && context.aIsStrong ) {
		return [ a ];
	}

	// The default case.
	//
	a.position = a.position._getTransformedByInsertOperation( b );

	return [ a ];
} );

setTransformation( InsertOperation, MoveOperation, ( a, b ) => {
	// The default case.
	//
	a.position = a.position._getTransformedByMoveOperation( b );

	return [ a ];
} );

setTransformation( InsertOperation, SplitOperation, ( a, b ) => {
	// The default case.
	//
	a.position = a.position._getTransformedBySplitOperation( b );

	return [ a ];
} );

setTransformation( InsertOperation, MergeOperation, ( a, b ) => {
	a.position = a.position._getTransformedByMergeOperation( b );

	return [ a ];
} );

setTransformation( InsertOperation, WrapOperation, ( a, b ) => {
	// The default case.
	//
	a.position = a.position._getTransformedByWrapOperation( b );

	return [ a ];
} );

setTransformation( InsertOperation, UnwrapOperation, ( a, b ) => {
	a.position = a.position._getTransformedByUnwrapOperation( b );

	return [ a ];
} );

// -----------------------

setTransformation( MarkerOperation, InsertOperation, ( a, b ) => {
	if ( a.oldRange ) {
		a.oldRange = a.oldRange._getTransformedByInsertOperation( b )[ 0 ];
	}

	if ( a.newRange ) {
		a.newRange = a.newRange._getTransformedByInsertOperation( b )[ 0 ];
	}

	return [ a ];
} );

setTransformation( MarkerOperation, MarkerOperation, ( a, b, context ) => {
	if ( a.name == b.name ) {
		if ( context.aIsStrong ) {
			a.oldRange = b.newRange ? Range.createFromRange( b.newRange ) : null;
		} else {
			return [ new NoOperation( 0 ) ];
		}
	}

	return [ a ];
} );

setTransformation( MarkerOperation, MergeOperation, ( a, b ) => {
	if ( a.oldRange ) {
		a.oldRange = a.oldRange._getTransformedByMergeOperation( b );
	}

	if ( a.newRange ) {
		a.newRange = a.newRange._getTransformedByMergeOperation( b );
	}

	return [ a ];
} );

setTransformation( MarkerOperation, MoveOperation, ( a, b ) => {
	if ( a.oldRange ) {
		a.oldRange = Range.createFromRanges( a.oldRange._getTransformedByMoveOperation( b ) );
	}

	if ( a.newRange ) {
		a.newRange = Range.createFromRanges( a.newRange._getTransformedByMoveOperation( b ) );
	}

	return [ a ];
} );

setTransformation( MarkerOperation, SplitOperation, ( a, b ) => {
	if ( a.oldRange ) {
		a.oldRange = a.oldRange._getTransformedBySplitOperation( b );
	}

	if ( a.newRange ) {
		a.newRange = a.newRange._getTransformedBySplitOperation( b );
	}

	return [ a ];
} );

setTransformation( MarkerOperation, WrapOperation, ( a, b ) => {
	if ( a.oldRange ) {
		a.oldRange = a.oldRange._getTransformedByWrapOperation( b );
	}

	if ( a.newRange ) {
		a.newRange = a.newRange._getTransformedByWrapOperation( b );
	}

	return [ a ];
} );

setTransformation( MarkerOperation, UnwrapOperation, ( a, b ) => {
	if ( a.oldRange ) {
		a.oldRange = a.oldRange._getTransformedByUnwrapOperation( b );
	}

	if ( a.newRange ) {
		a.newRange = a.newRange._getTransformedByUnwrapOperation( b );
	}

	return [ a ];
} );

// -----------------------

setTransformation( MergeOperation, InsertOperation, ( a, b ) => {
	if ( a.sourcePosition.hasSameParentAs( b.position ) ) {
		a.howMany += b.howMany;
	}

	a.sourcePosition = a.sourcePosition._getTransformedByInsertOperation( b );
	a.targetPosition = a.targetPosition._getTransformedByInsertOperation( b );

	return [ a ];
} );

setTransformation( MergeOperation, MergeOperation, ( a, b, context ) => {
	// Case 1:
	//
	// Same merge operations.
	//
	// Both operations have same source and target positions. So the element already got merged and there is
	// theoretically nothing to do.
	//
	// In this case, keep the source operation in the merged element - in the graveyard - and don't change target position.
	// Doing this instead of returning `NoOperation` allows for a correct undo later.
	//
	if ( a.sourcePosition.isEqual( b.sourcePosition ) && a.targetPosition.isEqual( b.targetPosition ) ) {
		const path = b.graveyardPosition.path.slice();
		path.push( 0 );

		a.sourcePosition = new Position( b.graveyardPosition.root, path );
		a.howMany = 0;

		return [ a ];
	}

	// The default case.
	//
	if ( a.sourcePosition.hasSameParentAs( b.targetPosition ) ) {
		a.howMany += b.howMany;
	}

	a.sourcePosition = a.sourcePosition._getTransformedByMergeOperation( b );
	a.targetPosition = a.targetPosition._getTransformedByMergeOperation( b );

	// Handle positions in graveyard.
	// If graveyard positions are same and `a` operation is strong - do not transform.
	if ( !a.graveyardPosition.isEqual( b.graveyardPosition ) || !context.aIsStrong ) {
		a.graveyardPosition._getTransformedByInsertion( b.graveyardPosition, 1 );
	}

	return [ a ];
} );

setTransformation( MergeOperation, MoveOperation, ( a, b, context ) => {
	// Case 1:
	//
	// The element to merge got removed.
	//
	// Merge operation does support merging elements which are not siblings. So it would not be a problem
	// from technical point of view. However, if the element was removed, the intention of the user deleting it
	// was to have it all deleted, together with its children. From user experience point of view, moving back the
	// removed nodes might be unexpected. This means that in this scenario we will block the merging.
	//
	// The exception of this rule would be if the remove operation was later undone.
	//
	const removedRange = Range.createFromPositionAndShift( b.sourcePosition, b.howMany );

	if ( b.type == 'remove' && !context.bWasUndone ) {
		if ( a.deletionPosition.hasSameParentAs( b.sourcePosition ) && removedRange.containsPosition( a.sourcePosition ) ) {
			return [ new NoOperation( 0 ) ];
		}
	}

	// The default case.
	//
	if ( a.sourcePosition.hasSameParentAs( b.targetPosition ) ) {
		a.howMany += b.howMany;
	}

	if ( a.sourcePosition.hasSameParentAs( b.sourcePosition ) ) {
		a.howMany -= b.howMany;
	}

	a.sourcePosition = a.sourcePosition._getTransformedByMoveOperation( b );
	a.targetPosition = a.targetPosition._getTransformedByMoveOperation( b );

	// `MergeOperation` graveyard position is like `MoveOperation` target position. It is a position where element(s) will
	// be moved. Like in other similar cases, we need to consider the scenario when those positions are same.
	// Here, we will treat `MergeOperation` like it is always strong (see `InsertOperation` x `InsertOperation` for comparison).
	// This means that we won't transform graveyard position if it is equal to move operation target position.
	if ( !a.graveyardPosition.isEqual( b.targetPosition ) ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByMoveOperation( b );
	}

	return [ a ];
} );

setTransformation( MergeOperation, SplitOperation, ( a, b ) => {
	if ( b.graveyardPosition ) {
		// If `b` operation defines graveyard position, a node from graveyard will be moved. This means that we need to
		// transform `a.graveyardPosition` accordingly.
		a.graveyardPosition = a.graveyardPosition._getTransformedByDeletion( b.graveyardPosition, 1 );

		// This is a scenario foreseen in `MergeOperation` x `MergeOperation`, with two identical merge operations.
		//
		// So, there was `MergeOperation` x `MergeOperation` transformation earlier. Now, `a` is a merge operation which
		// source position is in graveyard. Interestingly, split operation wants to use the node to be merged by `a`. This
		// means that `b` is undoing that merge operation from earlier, which caused `a` to be in graveyard.
		//
		// If that's the case, at this point, we will only "fix" `a.howMany`. It was earlier set to `0` in
		// `MergeOperation` x `MergeOperation` transformation. Later transformations in this function will change other
		// properties.
		//
		if ( a.deletionPosition.isEqual( b.graveyardPosition ) ) {
			a.howMany = b.howMany;
		}
	}

	// Case 1:
	//
	// Merge operation moves nodes to the place where split happens.
	// This is a classic situation when there are two paragraphs, and there is a split (enter) after the first
	// paragraph and there is a merge (delete) at the beginning of the second paragraph:
	//
	// <p>Foo{}</p><p>[]Bar</p>.
	//
	// Split is after `Foo`, while merge is from `Bar` to the end of `Foo`.
	//
	// State after split:
	// <p>Foo</p><p></p><p>Bar</p>
	//
	// Now, `Bar` should be merged to the new paragraph:
	// <p>Foo</p><p>Bar</p>
	//
	// Instead of merging it to the original paragraph:
	// <p>FooBar</p><p></p>
	//
	// This means that `targetPosition` needs to be transformed. This is the default case though.
	// For example, if the split would be after `F`, `targetPosition` should also be transformed.
	//
	// There are two exception, though, when we want to keep `targetPosition` as it was.
	//
	// First exception is when the merge target position is inside an element (not at the end, as usual). This
	// happens when the merge operation earlier was transformed by "the same" merge operation. If merge operation
	// targets inside the element we want to keep the original target position (and not transform it) because
	// we have additional context telling us that we want to merge to the original element. We can check if the
	// merge operation points inside element by checking what is `SplitOperation#howMany`. Since merge target position
	// is same as split position, if `howMany` is non-zero, it means that the merge target position is inside an element.
	//
	// Second exception is when the element to merge is in the graveyard and split operation uses it. In that case
	// if target position would be transformed, the merge operation would target at the source position:
	//
	// root: <p>Foo</p>				graveyard: <p></p>
	//
	// SplitOperation: root [ 0, 3 ] using graveyard [ 0 ] (howMany = 0)
	// MergeOperation: graveyard [ 0, 0 ] -> root [ 0, 3 ] (howMany = 0)
	//
	// Since split operation moves the graveyard node back to the root, the merge operation source position changes.
	// We would like to merge from the empty <p> to the "Foo" <p>:
	//
	// root: <p>Foo</p><p></p>			graveyard:
	//
	// MergeOperation#sourcePosition = root [ 1, 0 ]
	//
	// If `targetPosition` is transformed, it would become root [ 1, 0 ] as well. It has to be kept as it was.
	//
	if ( a.targetPosition.isEqual( b.position ) ) {
		if ( b.howMany != 0 || ( b.graveyardPosition && a.deletionPosition.isEqual( b.graveyardPosition ) ) ) {
			a.sourcePosition = a.sourcePosition._getTransformedBySplitOperation( b );

			return [ a ];
		}
	}

	// The default case.
	//
	if ( a.sourcePosition.hasSameParentAs( b.position ) ) {
		a.howMany = b.position.offset;
	}

	a.sourcePosition = a.sourcePosition._getTransformedBySplitOperation( b );
	a.targetPosition = a.targetPosition._getTransformedBySplitOperation( b );

	return [ a ];
} );

setTransformation( MergeOperation, WrapOperation, ( a, b ) => {
	if ( b.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByDeletion( b.graveyardPosition, 1 );
	}

	if ( a.sourcePosition.hasSameParentAs( b.position ) ) {
		a.howMany = a.howMany + 1 - b.howMany;
	}

	// Case 2:
	//
	// Merged element is wrapped and this is the last (only) element in the wrap.
	// Because of how this is resolved in `WrapOperation` x `MergeOperation`, we need to apply special handling here.
	// If the last element from wrapped range is "removed" from it, the wrap is effectively on empty range.
	// In that case, the wrapper element is moved to graveyard. This happens in `WrapOperation` x
	// `MergeOperation` and we need to mirror it here.
	//
	if ( b.position.isEqual( a.deletionPosition ) && b.howMany == 1 ) {
		// We need to change `MergeOperation#graveyardPosition` so the merged node is moved into the wrapper element.
		// Since `UnwrapOperation` created from reverse has graveyard position at [ 0 ], we can safely set the path here to [ 0, 0 ].
		a.graveyardPosition = new Position( a.graveyardPosition.root, [ 0, 0 ] );

		return [
			b.getReversed(),
			a
		];
	}

	// The default case.
	//
	a.sourcePosition = a.sourcePosition._getTransformedByWrapOperation( b );
	a.targetPosition = a.targetPosition._getTransformedByWrapOperation( b );

	return [ a ];
} );

setTransformation( MergeOperation, UnwrapOperation, ( a, b, context ) => {
	// Case 1:
	//
	// The element to merge got unwrapped.
	//
	// There are multiple possible solutions to resolve this conflict:
	//
	//  * unwrap also merge target (all nodes are unwrapped),
	//  * move the unwrapped nodes to the merge target (no nodes stayed unwrapped),
	//  * leave merge position in the unwrapped node (some nodes are unwrapped and some are not).
	//
	// Third option is chosen in this algorithm. If the unwrap operation is undone before merge is applied,
	// the merge operation will work as expected. If the unwrap operation is not undone, then the merge
	// operation won't merge any nodes, so it will behave similarly to noop.
	//
	if ( a.sourcePosition.isEqual( b.position ) ) {
		const path = b.graveyardPosition.path.slice();
		path.push( 0 );

		a.sourcePosition = new Position( b.graveyardPosition.root, path );
		a.howMany = 0;

		return [ a ];
	}

	// Case 2:	The element to merge into got unwrapped.
	//
	//			In this case there is nothing to merge into. We can imagine, that the merge operation was a little earlier
	//			than unwrap operation, so first elements got merged, and then both were unwrapped. To simulate this,
	//			we will change this merge into unwrap.
	//
	//			We have this:
	//			<blockQuote><p>Foo</p></blockQuote><blockQuote><p>Bar</p></blockQuote>
	//
	//			Unwrap already happened:
	//			<p>Foo</p><blockQuote><p>Bar</p></blockQuote>
	//
	//			Let's act like merge happened first and lead to this state:
	//			<p>Foo</p><p>Bar</p>
	//
	if ( a.targetPosition.hasSameParentAs( b.position ) ) {
		const graveyard = a.sourcePosition.root.document.graveyard;
		const graveyardPosition = new Position( graveyard, [ 0 ] );

		return [ new UnwrapOperation( a.sourcePosition, a.howMany, graveyardPosition, 0 ) ];
	}

	// The default case.
	//
	if ( a.sourcePosition.hasSameParentAs( b.targetPosition ) ) {
		a.howMany = a.howMany - 1 + b.howMany;
	}

	a.sourcePosition = a.sourcePosition._getTransformedByUnwrapOperation( b );
	a.targetPosition = a.targetPosition._getTransformedByUnwrapOperation( b );

	// Handle positions in graveyard.
	// If graveyard positions are same and `a` operation is strong - do not transform.
	if ( !a.graveyardPosition.isEqual( b.graveyardPosition ) || !context.aIsStrong ) {
		a.graveyardPosition._getTransformedByInsertion( b.graveyardPosition, 1 );
	}

	return [ a ];
} );

// -----------------------

setTransformation( MoveOperation, InsertOperation, ( a, b ) => {
	const moveRange = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );
	const transformed = moveRange._getTransformedByInsertOperation( b, false )[ 0 ];

	a.sourcePosition = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;

	// See `InsertOperation` x `MoveOperation` transformation for details on this case.
	//
	// In summary, both operations point to the same place, so the order of nodes needs to be decided.
	// `MoveOperation` is considered weaker, so it is always transformed, unless there was a certain relation
	// between operations.
	//
	if ( !a.targetPosition.isEqual( b.position ) ) {
		a.targetPosition = a.targetPosition._getTransformedByInsertOperation( b );
	}

	return [ a ];
} );

setTransformation( MoveOperation, MoveOperation, ( a, b, context ) => {
	//
	// Setting and evaluating some variables that will be used in special cases and default algorithm.
	//
	// Create ranges from `MoveOperations` properties.
	const rangeA = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );
	const rangeB = Range.createFromPositionAndShift( b.sourcePosition, b.howMany );

	// Assign `context.aIsStrong` to a different variable, because the value may change during execution of
	// this algorithm and we do not want to override original `context.aIsStrong` that will be used in later transformations.
	let aIsStrong = context.aIsStrong;

	// This will be used to decide the order of nodes if both operations target at the same position.
	// By default, use strong/weak operation mechanism.
	let insertBefore = !context.aIsStrong;

	// If the relation is set, then use it to decide nodes order.
	if ( context.abRelation == 'insertBefore' ) {
		insertBefore = true;
	} else if ( context.abRelation == 'insertAfter' ) {
		insertBefore = false;
	}

	// `a.targetPosition` could be affected by the `b` operation. We will transform it.
	let newTargetPosition;

	if ( a.targetPosition.isEqual( b.targetPosition ) && insertBefore ) {
		newTargetPosition = a.targetPosition._getTransformedByDeletion(
			b.sourcePosition,
			b.howMany
		);
	} else {
		newTargetPosition = a.targetPosition._getTransformedByMove(
			b.sourcePosition,
			b.targetPosition,
			b.howMany
		);
	}

	//
	// Special case #1 + mirror.
	//
	// Special case when both move operations' target positions are inside nodes that are
	// being moved by the other move operation. So in other words, we move ranges into inside of each other.
	// This case can't be solved reasonably (on the other hand, it should not happen often).
	if ( _moveTargetIntoMovedRange( a, b ) && _moveTargetIntoMovedRange( b, a ) ) {
		// Instead of transforming operation, we return a reverse of the operation that we transform by.
		// So when the results of this "transformation" will be applied, `b` MoveOperation will get reversed.
		return [ b.getReversed() ];
	}
	//
	// End of special case #1.
	//

	//
	// Special case #2.
	//
	// Check if `b` operation targets inside `rangeA`. Use stickiness if possible.
	const bTargetsToA = rangeA.containsPosition( b.targetPosition );

	// If `b` targets to `rangeA` and `rangeA` contains `rangeB`, `b` operation has no influence on `a` operation.
	// You might say that operation `b` is captured inside operation `a`.
	if ( bTargetsToA && rangeA.containsRange( rangeB, true ) ) {
		// There is a mini-special case here, where `rangeB` is on other level than `rangeA`. That's why
		// we need to transform `a` operation anyway.
		rangeA.start = rangeA.start._getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany );
		rangeA.end = rangeA.end._getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany );

		return _makeMoveOperationsFromRanges( [ rangeA ], newTargetPosition );
	}

	//
	// Special case #2 mirror.
	//
	const aTargetsToB = rangeB.containsPosition( a.targetPosition );

	if ( aTargetsToB && rangeB.containsRange( rangeA, true ) ) {
		// `a` operation is "moved together" with `b` operation.
		// Here, just move `rangeA` "inside" `rangeB`.
		rangeA.start = rangeA.start._getCombined( b.sourcePosition, b.getMovedRangeStart() );
		rangeA.end = rangeA.end._getCombined( b.sourcePosition, b.getMovedRangeStart() );

		return _makeMoveOperationsFromRanges( [ rangeA ], newTargetPosition );
	}
	//
	// End of special case #2.
	//

	//
	// Special case #3 + mirror.
	//
	// `rangeA` has a node which is an ancestor of `rangeB`. In other words, `rangeB` is inside `rangeA`
	// but not on the same tree level. In such case ranges have common part but we have to treat it
	// differently, because in such case those ranges are not really conflicting and should be treated like
	// two separate ranges. Also we have to discard two difference parts.
	const aCompB = compareArrays( a.sourcePosition.getParentPath(), b.sourcePosition.getParentPath() );

	if ( aCompB == 'prefix' || aCompB == 'extension' ) {
		// Transform `rangeA` by `b` operation and make operation out of it, and that's all.
		// Note that this is a simplified version of default case, but here we treat the common part (whole `rangeA`)
		// like a one difference part.
		rangeA.start = rangeA.start._getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany );
		rangeA.end = rangeA.end._getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany );

		return _makeMoveOperationsFromRanges( [ rangeA ], newTargetPosition );
	}
	//
	// End of special case #3.
	//

	//
	// Default case - ranges are on the same level or are not connected with each other.
	//
	// Modifier for default case.
	// Modifies `aIsStrong` flag in certain conditions.
	//
	// If only one of operations is a remove operation, we force remove operation to be the "stronger" one
	// to provide more expected results.
	if ( a.type == 'remove' && b.type != 'remove' && !context.aWasUndone ) {
		aIsStrong = true;
	} else if ( a.type != 'remove' && b.type == 'remove' && !context.bWasUndone ) {
		aIsStrong = false;
	}

	// Handle operation's source ranges - check how `rangeA` is affected by `b` operation.
	// This will aggregate transformed ranges.
	const ranges = [];

	// Get the "difference part" of `a` operation source range.
	// This is an array with one or two ranges. Two ranges if `rangeB` is inside `rangeA`.
	const difference = rangeA.getDifference( rangeB );

	for ( const range of difference ) {
		// Transform those ranges by `b` operation. For example if `b` moved range from before those ranges, fix those ranges.
		range.start = range.start._getTransformedByDeletion( b.sourcePosition, b.howMany );
		range.end = range.end._getTransformedByDeletion( b.sourcePosition, b.howMany );

		// If `b` operation targets into `rangeA` on the same level, spread `rangeA` into two ranges.
		const shouldSpread = compareArrays( range.start.getParentPath(), b.getMovedRangeStart().getParentPath() ) == 'same';
		const newRanges = range._getTransformedByInsertion( b.getMovedRangeStart(), b.howMany, shouldSpread );

		ranges.push( ...newRanges );
	}

	// Then, we have to manage the "common part" of both move ranges.
	const common = rangeA.getIntersection( rangeB );

	if ( common !== null && aIsStrong && !bTargetsToA ) {
		// Calculate the new position of that part of original range.
		common.start = common.start._getCombined( b.sourcePosition, b.getMovedRangeStart() );
		common.end = common.end._getCombined( b.sourcePosition, b.getMovedRangeStart() );

		// Take care of proper range order.
		//
		// Put `common` at appropriate place. Keep in mind that we are interested in original order.
		// Basically there are only three cases: there is zero, one or two difference ranges.
		//
		// If there is zero difference ranges, just push `common` in the array.
		if ( ranges.length === 0 ) {
			ranges.push( common );
		}
		// If there is one difference range, we need to check whether common part was before it or after it.
		else if ( ranges.length == 1 ) {
			if ( rangeB.start.isBefore( rangeA.start ) || rangeB.start.isEqual( rangeA.start ) ) {
				ranges.unshift( common );
			} else {
				ranges.push( common );
			}
		}
		// If there are more ranges (which means two), put common part between them. This is the only scenario
		// where there could be two difference ranges so we don't have to make any comparisons.
		else {
			ranges.splice( 1, 0, common );
		}
	}

	if ( ranges.length === 0 ) {
		// If there are no "source ranges", nothing should be changed.
		// Note that this can happen only if `aIsStrong == false` and `rangeA.isEqual( rangeB )`.
		return [ new NoOperation( a.baseVersion ) ];
	}

	return _makeMoveOperationsFromRanges( ranges, newTargetPosition );
} );

setTransformation( MoveOperation, SplitOperation, ( a, b, context ) => {
	let newTargetPosition = a.targetPosition._getTransformedBySplitOperation( b );

	// Case 1:
	//
	// Last element in the moved range got split.
	//
	// In this case the default range transformation will not work correctly as the element created by
	// split operation would be outside the range. The range to move needs to be fixed manually.
	// Do it only if this is a "natural" split, not a one that comes from undo.
	// TODO: this should be done on relations
	//
	const moveRange = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );

	if ( moveRange.end.isEqual( b.insertionPosition ) && !b.graveyardPosition ) {
		a.howMany++;
		a.targetPosition = newTargetPosition;

		return [ a ];
	}

	// Case 2:
	//
	// Split happened between the moved nodes. In this case two ranges to move need to be generated.
	//
	// Characters `ozba` are moved to the end of paragraph `Xyz` but split happened.
	// <p>F[oz|ba]r</p><p>Xyz</p>
	//
	// After split:
	// <p>F[oz</p><p>ba]r</p><p>Xyz</p>
	//
	// Correct ranges:
	// <p>F[oz]</p><p>[ba]r</p><p>Xyz</p>
	//
	// After move:
	// <p>F</p><p>r</p><p>Xyzozba</p>
	//
	if ( moveRange.start.hasSameParentAs( b.position ) && moveRange.containsPosition( b.position ) ) {
		let rightRange = new Range( b.position, moveRange.end );
		rightRange = rightRange._getTransformedBySplitOperation( b );

		const ranges = [
			new Range( moveRange.start, b.position ),
			rightRange
		];

		return _makeMoveOperationsFromRanges( ranges, newTargetPosition );
	}

	// Case 3:
	//
	// Move operation targets at the split position. We need to decide if the nodes should be inserted
	// at the end of the split element or at the beginning of the new element.
	//
	if ( a.targetPosition.isEqual( b.position ) && context.abRelation == 'insertAtSource' ) {
		newTargetPosition = b.moveTargetPosition;
	}

	// Case 4:
	//
	// Move operation targets just after the split element. We need to decide if the nodes should be inserted
	// between two parts of split element, or after the new element.
	//
	// Split at `|`, while move operation moves `<p>Xyz</p>` and targets at `^`:
	// <p>Foo|bar</p>^<p>baz</p>
	// <p>Foo</p>^<p>bar</p><p>baz</p> or <p>Foo</p><p>bar</p>^<p>baz</p>?
	//
	// If there is no contextual information between operations (for example, they come from collaborative
	// editing), we don't want to put some unrelated content (move) between parts of related content (split parts).
	// However, if the split is from undo, in the past, the moved content might be targeting between the
	// split parts, meaning that was exactly user's intention:
	//
	// <p>Foo</p>^<p>bar</p>		<--- original situation, in "past".
	// <p>Foobar</p>^				<--- after merge target position is transformed.
	// <p>Foo|bar</p>^				<--- then the merge is undone, and split happens, which leads us to current situation.
	//
	// In this case it is pretty clear that the intention was to put new paragraph between those nodes,
	// so we need to transform accordingly. We can detect this scenario thanks to relations.
	//
	if ( a.targetPosition.isEqual( b.insertionPosition ) && context.abRelation == 'insertBetween' ) {
		newTargetPosition = a.targetPosition;
	}

	// The default case.
	//
	const transformed = moveRange._getTransformedBySplitOperation( b );

	a.sourcePosition = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;
	a.targetPosition = newTargetPosition;

	return [ a ];
} );

setTransformation( MoveOperation, MergeOperation, ( a, b, context ) => {
	const movedRange = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );

	if ( b.deletionPosition.hasSameParentAs( a.sourcePosition ) && movedRange.containsPosition( b.sourcePosition ) ) {
		if ( a.type == 'remove' ) {
			// Case 1:
			//
			// The element to remove got merged.
			//
			// Merge operation does support merging elements which are not siblings. So it would not be a problem
			// from technical point of view. However, if the element was removed, the intention of the user
			// deleting it was to have it all deleted. From user experience point of view, moving back the
			// removed nodes might be unexpected. This means that in this scenario we will reverse merging and remove the element.
			//
			if ( !context.aWasUndone ) {
				return [ b.getReversed(), a ];
			}
		} else {
			// Case 2:
			//
			// The element to move got merged and it was the only element to move.
			// In this case just don't do anything, leave the node in the graveyard. Without special case
			// it would be a move operation that moves 0 nodes, so maybe it is better just to return no-op.
			//
			if ( a.howMany == 1 ) {
				if ( !context.bWasUndone ) {
					return [ new NoOperation( 0 ) ];
				} else {
					a.sourcePosition = Position.createFromPosition( b.graveyardPosition );
					a.targetPosition = a.targetPosition._getTransformedByMergeOperation( b );

					return [ a ];
				}
			}
		}
	}

	// The default case.
	//
	const moveRange = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );
	const transformed = moveRange._getTransformedByMergeOperation( b );

	a.sourcePosition = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;
	a.targetPosition = a.targetPosition._getTransformedByMergeOperation( b );

	return [ a ];
} );

setTransformation( MoveOperation, WrapOperation, ( a, b, context ) => {
	const moveRange = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );
	let newTargetPosition = a.targetPosition._getTransformedByWrapOperation( b );

	// Case 1:
	//
	// Move operation targets to the beginning of the wrapped range. We need to decide if the moved nodes
	// should also be wrapped.
	//
	if ( a.targetPosition.isEqual( b.position ) && context.abRelation == 'insertInside' ) {
		newTargetPosition = b.targetPosition;
	}

	// Case 2:
	//
	// Some of the nodes to move got wrapped. In this case multiple ranges to move might need to be generated.
	//
	// First paragraph and the image should are wrapped, while the two images are moved after the last paragraph:
	// [<paragraph>Foo</paragraph>{<image />]<image />}<paragraph>Bar</paragraph>
	//
	// After wrap:
	// <blockQuote><paragraph>Foo</paragraph>[<image />]</blockQuote>[<image />]<paragraph>Bar</paragraph>
	//
	// After move:
	// <blockQuote><paragraph>Foo</paragraph></blockQuote><paragraph>Bar</paragraph><image /><image />
	//
	if ( a.sourcePosition.hasSameParentAs( b.position ) ) {
		// If move range contains or is equal to the wrapped range, just move it all together.
		// Change `howMany` to reflect that nodes got wrapped.
		if ( moveRange.containsRange( b.wrappedRange, true ) ) {
			a.howMany = a.howMany - b.howMany + 1;

			return [ a ];
		}

		const result = [];

		let difference = moveRange.getDifference( b.wrappedRange )[ 0 ];
		let common = moveRange.getIntersection( b.wrappedRange );

		if ( difference ) {
			difference = difference._getTransformedByWrapOperation( b );

			result.push( new MoveOperation( difference.start, difference.end.offset - difference.start.offset, newTargetPosition, 0 ) );
		}

		if ( common ) {
			common = common._getTransformedByWrapOperation( b );

			result.push( new MoveOperation( common.start, common.end.offset - common.start.offset, newTargetPosition, 0 ) );
		}

		return result;
	}

	// The default case.
	//
	const transformed = moveRange._getTransformedByWrapOperation( b );

	a.sourcePosition = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;
	a.targetPosition = newTargetPosition;

	return [ a ];
} );

setTransformation( MoveOperation, UnwrapOperation, ( a, b ) => {
	const moveRange = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );
	const transformed = moveRange._getTransformedByUnwrapOperation( b );

	a.sourcePosition = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;
	a.targetPosition = a.targetPosition._getTransformedByUnwrapOperation( b );

	return [ a ];
} );

// -----------------------

setTransformation( RenameOperation, InsertOperation, ( a, b ) => {
	a.position = a.position._getTransformedByInsertOperation( b );

	return [ a ];
} );

setTransformation( RenameOperation, MergeOperation, ( a, b ) => {
	// Case 1:
	//
	// Element to rename got merged, so it was moved to `b.graveyardPosition`.
	//
	if ( a.position.isEqual( b.deletionPosition ) ) {
		a.position = Position.createFromPosition( b.graveyardPosition );
		a.position.stickiness = 'toNext';

		return [ a ];
	}

	a.position = a.position._getTransformedByMergeOperation( b );

	return [ a ];
} );

setTransformation( RenameOperation, MoveOperation, ( a, b ) => {
	a.position = a.position._getTransformedByMoveOperation( b );

	return [ a ];
} );

setTransformation( RenameOperation, RenameOperation, ( a, b, context ) => {
	if ( a.position.isEqual( b.position ) ) {
		if ( context.aIsStrong ) {
			a.oldName = b.newName;
		} else {
			return [ new NoOperation( 0 ) ];
		}
	}

	return [ a ];
} );

setTransformation( RenameOperation, SplitOperation, ( a, b ) => {
	// Case 1:
	//
	// The element to rename has been split. In this case, the new element should be also renamed.
	//
	// User decides to change the paragraph to a list item:
	// <paragraph>Foobar</paragraph>
	//
	// However, in meantime, split happens:
	// <paragraph>Foo</paragraph><paragraph>bar</paragraph>
	//
	// As a result, rename both elements:
	// <listItem>Foo</listItem><listItem>bar</listItem>
	//
	const renamePath = a.position.path;
	const splitPath = b.position.getParentPath();

	if ( compareArrays( renamePath, splitPath ) == 'same' && !b.graveyardPosition ) {
		const extraRename = new RenameOperation( a.position.getShiftedBy( 1 ), a.oldName, a.newName, 0 );

		return [ a, extraRename ];
	}

	// The default case.
	//
	a.position = a.position._getTransformedBySplitOperation( b );

	return [ a ];
} );

setTransformation( RenameOperation, WrapOperation, ( a, b ) => {
	a.position = a.position._getTransformedByWrapOperation( b );

	return [ a ];
} );

setTransformation( RenameOperation, UnwrapOperation, ( a, b ) => {
	// Case 1:
	//
	// Element to rename got unwrapped, so it was moved to `b.graveyardPosition`.
	//
	if ( a.position.isEqual( b.targetPosition ) ) {
		a.position = Position.createFromPosition( b.graveyardPosition );

		return [ a ];
	}

	a.position = a.position._getTransformedByUnwrapOperation( b );

	return [ a ];
} );

// -----------------------

setTransformation( RootAttributeOperation, RootAttributeOperation, ( a, b, context ) => {
	if ( a.root === b.root && a.key === b.key ) {
		if ( !context.aIsStrong || a.newValue === b.newValue ) {
			return [ new NoOperation( 0 ) ];
		} else {
			a.oldValue = b.newValue;
		}
	}

	return [ a ];
} );

// -----------------------

setTransformation( SplitOperation, InsertOperation, ( a, b ) => {
	// The default case.
	//
	if ( a.position.hasSameParentAs( b.position ) && a.position.offset < b.position.offset ) {
		a.howMany += b.howMany;
	}

	a.position = a.position._getTransformedByInsertOperation( b );

	return [ a ];
} );

setTransformation( SplitOperation, MergeOperation, ( a, b ) => {
	if ( a.position.hasSameParentAs( b.deletionPosition ) && !a.position.isAfter( b.deletionPosition ) ) {
		a.howMany--;
	}

	if ( a.position.hasSameParentAs( b.targetPosition ) ) {
		a.howMany += b.howMany;
	}

	a.position = a.position._getTransformedByMergeOperation( b );

	if ( a.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByMergeOperation( b );
	}

	return [ a ];
} );

setTransformation( SplitOperation, MoveOperation, ( a, b, context ) => {
	if ( a.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByMoveOperation( b );
	}

	// Case 1:
	//
	// If the split position is inside the moved range, we need to shift the split position to a proper place.
	// The position cannot be moved together with moved range because that would result in splitting of an incorrect element.
	//
	// Characters `bc` should be moved to the second paragraph while split position is between them:
	// <paragraph>A[b|c]d</paragraph><paragraph>Xyz</paragraph>
	//
	// After move, new split position is incorrect:
	// <paragraph>Ad</paragraph><paragraph>Xb|cyz</paragraph>
	//
	// Correct split position:
	// <paragraph>A|d</paragraph><paragraph>Xbcyz</paragraph>
	//
	// After split:
	// <paragraph>A</paragraph><paragraph>d</paragraph><paragraph>Xbcyz</paragraph>
	//
	const rangeToMove = Range.createFromPositionAndShift( b.sourcePosition, b.howMany );

	if ( a.position.hasSameParentAs( b.sourcePosition ) && rangeToMove.containsPosition( a.position ) ) {
		const howManyRemoved = b.howMany - ( a.position.offset - b.sourcePosition.offset );
		a.howMany -= howManyRemoved;

		if ( a.position.hasSameParentAs( b.targetPosition ) && a.position.offset < b.targetPosition.offset ) {
			a.howMany += b.howMany;
		}

		a.position = Position.createFromPosition( b.sourcePosition );

		return [ a ];
	}

	// Case 2:
	//
	// Split is at a position where nodes were moved.
	//
	// This is a scenario described in `MoveOperation` x `SplitOperation` transformation but from the
	// "split operation point of view".
	//
	if ( a.position.isEqual( b.targetPosition ) && ( context.baRelation == 'insertAtSource' || context.abRelation == 'splitBefore' ) ) {
		a.howMany += b.howMany;
		a.position = a.position._getTransformedByDeletion( b.sourcePosition, b.howMany );

		return [ a ];
	}

	// The default case.
	//
	if ( a.position.hasSameParentAs( b.sourcePosition ) && a.position.offset <= b.sourcePosition.offset ) {
		a.howMany -= b.howMany;
	}

	if ( a.position.hasSameParentAs( b.targetPosition ) && a.position.offset < b.targetPosition.offset ) {
		a.howMany += b.howMany;
	}

	// Change position stickiness to force a correct transformation.
	a.position.stickiness = 'toNone';
	a.position = a.position._getTransformedByMoveOperation( b );
	a.position.stickiness = 'toNext';

	return [ a ];
} );

setTransformation( SplitOperation, SplitOperation, ( a, b, context ) => {
	// Case 1:
	//
	// Split at the same position.
	//
	// If there already was a split at the same position as in `a` operation, it means that the intention
	// conveyed by `a` operation has already been fulfilled and `a` should not do anything (to avoid double split).
	//
	// However, there is a difference if these are new splits or splits created by undo. These have different
	// intentions. Also splits moving back different elements from graveyard have different intentions. They
	// are just different operations.
	//
	// So we cancel split operation only if it was really identical.
	//
	if ( a.position.isEqual( b.position ) ) {
		if ( !a.graveyardPosition && !b.graveyardPosition ) {
			return [ new NoOperation( 0 ) ];
		}

		if ( a.graveyardPosition && b.graveyardPosition && a.graveyardPosition.isEqual( b.graveyardPosition ) ) {
			return [ new NoOperation( 0 ) ];
		}
	}

	if ( a.graveyardPosition && b.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByDeletion( b.graveyardPosition, 1 );
	}

	// Case 2:
	//
	// Position where operation `b` inserted a new node after split is the same as the operation `a` split position.
	// As in similar cases, there is ambiguity if the split should be before the new node (created by `b`) or after.
	//
	if ( a.position.isEqual( b.insertionPosition ) && context.abRelation == 'splitBefore' ) {
		a.howMany++;

		return [ a ];
	}

	// Case 3:
	//
	// This is a mirror to the case 2. above.
	//
	if ( b.position.isEqual( a.insertionPosition ) && context.baRelation == 'splitBefore' ) {
		const newPositionPath = b.insertionPosition.path.slice();
		newPositionPath.push( 0 );

		const newPosition = new Position( b.insertionPosition.root, newPositionPath );
		const moveOp = new MoveOperation( a.insertionPosition, 1, newPosition, 0 );

		return [ a, moveOp ];
	}

	// The default case.
	//
	if ( a.position.hasSameParentAs( b.position ) && a.position.offset < b.position.offset ) {
		a.howMany -= b.howMany;
	}

	a.position = a.position._getTransformedBySplitOperation( b );

	return [ a ];
} );

setTransformation( SplitOperation, WrapOperation, ( a, b ) => {
	if ( a.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByWrapOperation( b );
	}

	// Case 1:
	//
	// If split position has been wrapped, reverse the wrapping so that split can be applied as intended.
	// This is an edge case scenario where it is difficult to find a correct solution.
	// Since it will be a rare (or only theoretical) scenario, the algorithm will perform the easy solution.
	//
	if ( a.position.hasSameParentAs( b.position ) && b.wrappedRange.containsPosition( a.position ) ) {
		const reversed = b.getReversed();

		return [ reversed, a ];
	}

	// Case 2:
	//
	// Split position is in a wrapper element in graveyard. This is a case that happens in undo. Earlier, `SplitOperation`
	// was transformed by `UnwrapOperation` and it was left in the unwrapped node. Now the unwrapped node will be re-used
	// and we need to fix `howMany` property in the `SplitOperation`.
	//
	if ( b.graveyardPosition && a.insertionPosition.isEqual( b.graveyardPosition.getShiftedBy( 1 ) ) ) {
		a.position = a.position._getCombined( b.graveyardPosition, b.position );
		a.howMany = a.howMany + b.howMany;

		return [ a ];
	}

	// The default case.
	//
	if ( a.position.hasSameParentAs( b.position ) && a.position.offset < b.position.offset ) {
		a.howMany = a.howMany + 1 - b.howMany;
	}

	a.position = a.position._getTransformedByWrapOperation( b );

	return [ a ];
} );

setTransformation( SplitOperation, UnwrapOperation, ( a, b, context ) => {
	if ( a.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByUnwrapOperation( b );
	}

	// Case 1:
	//
	// The element to split got unwrapped.
	//
	// At this moment, there is nothing to split. We probably shouldn't split the "new parent" because that
	// might be very different from the user's intention. Instead, we will leave split position inside the
	// unwrapped element, which is now in graveyard.
	//
	// There is an exception to that - if the unwrap operation got undone. In this case we will follow normal
	// transformation (move split position together with unwrapped nodes). Because later it will be in the wrapper
	// element back again.
	//
	const splitInside = a.position.hasSameParentAs( b.position );

	if ( splitInside ) {
		const path = b.graveyardPosition.path.slice();
		path.push( 0 );

		a.position = new Position( b.graveyardPosition.root, path );

		if ( !context.bWasUndone ) {
			a.howMany = 0;
		} else {
			// New `howMany` will be 0 or below. Will be fixed in SplitOperation x WrapOperation.
			a.howMany = a.howMany - b.howMany;
		}

		return [ a ];
	}

	// The default case.
	//
	if ( a.position.hasSameParentAs( b.targetPosition ) && a.position.offset < b.targetPosition.offset ) {
		a.howMany = a.howMany - 1 + b.howMany;
	}

	a.position = a.position._getTransformedByUnwrapOperation( b );

	return [ a ];
} );

// -----------------------

setTransformation( WrapOperation, InsertOperation, ( a, b ) => {
	// The default case.
	//
	const transformed = a.wrappedRange._getTransformedByInsertOperation( b, false )[ 0 ];

	a.position = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;

	return [ a ];
} );

setTransformation( WrapOperation, MergeOperation, ( a, b ) => {
	if ( a.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByInsertion( b.graveyardPosition, 1 );
	}

	// Case 1:
	//
	// The element to wrap got merged and it was the only element to wrap. Let's wrap it in the graveyard.
	//
	if ( a.position.isEqual( b.deletionPosition ) && a.howMany == 1 ) {
		a.position = Position.createFromPosition( b.graveyardPosition );
		a.position.stickiness = 'toNext';

		return [ a ];
	}

	// The default case.
	//
	const transformed = a.wrappedRange._getTransformedByMergeOperation( b );

	a.position = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;

	return [ a ];
} );

setTransformation( WrapOperation, MoveOperation, ( a, b, context ) => {
	if ( a.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByMoveOperation( b );
	}

	// Case 1:
	//
	// Move operation targets to the beginning of the wrapped range.
	// We need to decide if the moved node should also be wrapped.
	//
	if ( a.position.isEqual( b.targetPosition ) && context.baRelation == 'insertInside' ) {
		a.position._getTransformedByDeletion( b.sourcePosition, b.howMany );
		a.howMany += b.howMany;

		return [ a ];
	}

	const moveRange = Range.createFromPositionAndShift( b.sourcePosition, b.howMany );
	const wrappedRange = a.wrappedRange;

	// Case 2:
	//
	// Range to wrap is equal to moved range or is wholly inside the moved range. In other words, all nodes
	// to wrap has been moved. In this case, wrap all of those nodes in their new place.
	//
	// Note that this is different than the default case. In the default case, if only some nodes are moved
	// those moved nodes are not wrapped at their new location. Only those nodes which didn't move are wrapped
	// at their old location.
	//
	if ( moveRange.containsRange( wrappedRange, true ) ) {
		a.position = a.position._getCombined( b.sourcePosition, b.getMovedRangeStart() );

		return [ a ];
	}

	// The default case.
	//
	let transformed = wrappedRange._getTransformedByDeletion( b.sourcePosition, b.howMany );
	transformed = transformed._getTransformedByInsertion( b.targetPosition, b.howMany, false )[ 0 ];

	a.position = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;

	return [ a ];
} );

setTransformation( WrapOperation, SplitOperation, ( a, b ) => {
	// Case 1:
	//
	// If range to wrap got split cancel the wrapping. See `SplitOperation` x `WrapOperation`.
	//
	const isInside = a.position.hasSameParentAs( b.position ) && a.wrappedRange.containsPosition( b.position );

	if ( isInside ) {
		// We cannot just return no-op in this case, because in the mirror case scenario the wrap is reversed, which
		// might introduce a new node in the graveyard (if the wrap didn't have `graveyardPosition`, then the wrap
		// created a new element which was put to the graveyard when the wrap was reversed).
		//
		// Instead, a node in graveyard will be inserted.
		//
		if ( a.element ) {
			const graveyard = a.position.root.document.graveyard;
			const graveyardPosition = new Position( graveyard, [ 0 ] );

			return [ new InsertOperation( graveyardPosition, a.element, 0 ) ];
		} else {
			// If `WrapOperation` comes from undo then the, in `SplitOperation` x `WrapOperation`, after it is reversed
			// that element will be moved to graveyard, at offset `0`. We should reflect it here to avoid different
			// graveyard root states.
			//
			const gyPos = new Position( a.graveyardPosition.root, [ 0 ] );

			return [ new MoveOperation( a.graveyardPosition, 1, gyPos, 0 ) ];
		}
	}

	if ( a.graveyardPosition && b.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByDeletion( b.graveyardPosition, 1 );
	}

	// Case 2:
	//
	// If last element from range to wrap has been split, include the newly created element in the wrap range.
	//
	if ( b.insertionPosition.isEqual( a.wrappedRange.end ) ) {
		a.howMany++;

		return [ a ];
	}

	// The default case.
	//
	const transformed = a.wrappedRange._getTransformedBySplitOperation( b );

	a.position = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;

	return [ a ];
} );

setTransformation( WrapOperation, WrapOperation, ( a, b, context ) => {
	let newGraveyardPosition = a.graveyardPosition;

	if ( a.graveyardPosition && b.graveyardPosition ) {
		newGraveyardPosition = a.graveyardPosition._getTransformedByDeletion( b.graveyardPosition, 1 );
	}

	// Case 1:
	//
	// If ranges to wrap intersect on the same level then there is a conflict.
	// Depending on `context.aIsStrong` the nodes in the intersecting part should be left as they were wrapped
	// or moved to the new wrapping element.
	//
	// `Foo` and `Bar` are to be wrapped in `blockQuote`, while `Bar` and `Xyz` in `div`.
	// [<paragraph>Foo</paragraph>{<paragraph>Bar</paragraph>]<paragraph>Xyz</paragraph>}
	//
	// After `blockQuote` wrap:
	// <blockQuote>
	// 	<paragraph>Foo</paragraph><paragraph>Bar</paragraph>
	// </blockQuote>
	// <paragraph>Xyz</paragraph>
	//
	// After `div` wrap:
	// <blockQuote>
	// 	<paragraph>Foo</paragraph><paragraph>Bar</paragraph>
	// </blockQuote>
	// <div>
	// 	<paragraph>Xyz</paragraph>
	// </div>
	//
	// Or, if `div` wrap is stronger:
	// <blockQuote>
	// 	<paragraph>Foo</paragraph>
	// </blockQuote>
	// <div>
	// 	<paragraph>Bar</paragraph><paragraph>Xyz</paragraph>
	// </div>
	//
	// The range from incoming operation may be also wholly included in the range from operation `b`.
	// Then, cancel the wrapping. The same happens when the ranges are identical but in that case,
	// `context.aIsStrong` decides which wrapping should be cancelled.
	//
	// Lastly, the range from operation `b` may be wholly included in the range from incoming operation.
	// Then, unwrap the range from operation `b` and do a wrap on full range from operation `a`.
	//
	if ( a.position.hasSameParentAs( b.position ) ) {
		const ranges = a.wrappedRange.getDifference( b.wrappedRange );

		// Range from `a` is contained in range from `b` or ranges are equal.
		if ( ranges.length == 0 ) {
			if ( a.wrappedRange.isEqual( b.wrappedRange ) && context.aIsStrong ) {
				// If ranges are equal and `a` is a stronger operation, reverse `b` operation and then apply `a` operation.
				const reversed = b.getReversed();

				if ( a.graveyardPosition ) {
					a.graveyardPosition = a.graveyardPosition._getTransformedByUnwrapOperation( reversed );
				}

				return [ reversed, a ];
			}

			// If `a` is contained in `b` or they are same but `b` is stronger, operation `a` should do nothing.
			// However, to keep the model state same on both clients, it is needed to create a wrapping element in the graveyard.
			const graveyard = a.position.root.document.graveyard;
			a.position = new Position( graveyard, [ 0 ] );
			a.howMany = 0;
			a.graveyardPosition = newGraveyardPosition;

			return [ a ];
		}
		// Ranges intersect.
		else {
			// Range from `b` has some extra nodes other than nodes from `a`.
			if ( !a.wrappedRange.containsRange( b.wrappedRange, true ) ) {
				if ( context.aIsStrong ) {
					// If the incoming wrap operation is strong, we need to reverse the previous wrap, then apply the incoming
					// operation as is, then re-wrap the other nodes that were wrapped in the previous wrap.
					//
					// Content already wrapped into `blockQuote` but that wrap is not strong:
					// <blockQuote><p>Foo</p><p>Bar</p></blockQuote><p>Xyz</p>
					//
					// Unwrap:
					// <p>Foo</p><p>Bar</p><p>Xyz</p>
					//
					// Wrap with stronger wrap:
					// <p>Foo</p><div><p>Bar</p><p>Xyz</p></div>
					//
					// Re-wrap:
					// <blockQuote><p>Foo</p></blockQuote><div><p>Bar</p><p>Xyz</p></div>
					//
					const reversed = b.getReversed();

					if ( a.graveyardPosition ) {
						a.graveyardPosition = a.graveyardPosition._getTransformedByUnwrapOperation( reversed );
					}

					const bOnlyRange = b.wrappedRange.getDifference( a.wrappedRange )[ 0 ];
					const rewrapRange = bOnlyRange._getTransformedByWrapOperation( a );
					const rewrapHowMany = rewrapRange.end.offset - rewrapRange.start.offset;
					const rewrap = new WrapOperation( rewrapRange.start, rewrapHowMany, reversed.graveyardPosition, 0 );

					return [ reversed, a, rewrap ];
				} else {
					// If the incoming wrap operation is not strong, just wrap those nodes which were not wrapped already.
					const range = ranges[ 0 ]._getTransformedByWrapOperation( b );

					a.position = range.start;
					a.howMany = range.end.offset - range.start.offset;
					a.graveyardPosition = newGraveyardPosition;

					return [ a ];
				}
			}
			// Range from `b` is contained in range from `a`. Reverse operation `b` in addition to operation `a`.
			else {
				const reversed = b.getReversed();

				if ( a.graveyardPosition ) {
					a.graveyardPosition = a.graveyardPosition._getTransformedByUnwrapOperation( reversed );
				}

				return [ reversed, a ];
			}
		}
	}

	// The default case.
	//
	const transformed = a.wrappedRange._getTransformedByWrapOperation( b );

	a.position = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;
	a.graveyardPosition = newGraveyardPosition;

	return [ a ];
} );

setTransformation( WrapOperation, UnwrapOperation, ( a, b ) => {
	const transformed = a.wrappedRange._getTransformedByUnwrapOperation( b );

	a.position = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;

	if ( a.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByUnwrapOperation( b );
	}

	return [ a ];
} );

// -----------------------

setTransformation( UnwrapOperation, InsertOperation, ( a, b ) => {
	// Case 1:
	//
	// Insert operation inserts nodes into the unwrapped element.
	// This does not have any impact on `UnwrapOperation#position`, but `#howMany` has to be changed.
	//
	if ( a.position.hasSameParentAs( b.position ) ) {
		a.howMany += b.howMany;
	}

	a.position = a.position._getTransformedByInsertOperation( b );

	return [ a ];
} );

setTransformation( UnwrapOperation, MergeOperation, ( a, b, context ) => {
	// Case 1:
	//
	// The element to unwrap got merged.
	//
	// There are multiple possible solution to resolve this conflict:
	//
	// * unwrap the merge target element (all nodes are unwrapped),
	// * cancel the unwrap (no nodes stayed unwrapped),
	// * reverse the merge and apply the original unwrap (some nodes are unwrapped and some are not).
	//
	if ( a.position.isEqual( b.sourcePosition ) ) {
		return [ b.getReversed(), a ];
	}

	// The default case.
	//
	// There are some scenarios here where `UnwrapOperation#howMany` needs to be changed, but they are pretty straightforward.
	//
	if ( a.position.hasSameParentAs( b.targetPosition ) ) {
		a.howMany += b.howMany;
	}

	if ( a.position.hasSameParentAs( b.graveyardPosition ) ) {
		a.howMany++;
	}

	if ( a.position.hasSameParentAs( b.deletionPosition ) ) {
		a.howMany--;
	}

	a.position = a.position._getTransformedByMergeOperation( b );

	if ( !a.graveyardPosition.isEqual( b.graveyardPosition ) || !context.aIsStrong ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByMergeOperation( b );
	}

	return [ a ];
} );

setTransformation( UnwrapOperation, MoveOperation, ( a, b ) => {
	// Case 1:
	//
	// Move operation moves nodes from the unwrapped element.
	// This does not have any impact on `UnwrapOperation#position`, but `#howMany` has to be changed.
	//
	if ( a.position.hasSameParentAs( b.sourcePosition ) ) {
		a.howMany -= b.howMany;
	}

	// Case 2:
	//
	// Move operation moves nodes into the unwrapped element.
	// This does not have any impact on `UnwrapOperation#position`, but `#howMany` has to be changed.
	// Note, that case 1 and case 2 may happen together.
	//
	if ( a.position.hasSameParentAs( b.targetPosition ) ) {
		a.howMany += b.howMany;
	}

	// The default case.
	//
	a.position = a.position._getTransformedByMoveOperation( b );

	if ( !a.graveyardPosition.isEqual( b.targetPosition ) ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByMoveOperation( b );
	}

	return [ a ];
} );

setTransformation( UnwrapOperation, SplitOperation, ( a, b ) => {
	// Case 1:
	//
	// The element to unwrap got split, so now there are two elements to unwrap.
	// This can be solved either by providing two unwrap operations or by reversing the split and applying the original unwrap.
	//
	if ( a.position.hasSameParentAs( b.position ) ) {
		const reversed = b.getReversed();

		// Merge operation (reversed split) always puts a node into a graveyard. Not every split operation pulls a node
		// from the graveyard, though. This means that after reversing a split operation, there might be a need to
		// update a position in graveyard.
		if ( !b.graveyardPosition ) {
			a.graveyardPosition = a.graveyardPosition._getTransformedByInsertion( reversed.graveyardPosition, 1 );
		}

		return [ reversed, a ];
	}

	// Case 2:
	//
	// The split element is the last element in unwrapped element. In this case, we need to manually modify
	// `howMany` property because it wouldn't be correctly calculated by `_getTransformedBySplitOperation`.
	//
	if ( a.position.hasSameParentAs( b.insertionPosition ) ) {
		a.howMany++;

		return [ a ];
	}

	// The default case.
	//
	a.position = a.position._getTransformedBySplitOperation( b );

	if ( b.graveyardPosition && b.graveyardPosition.hasSameParentAs( a.position ) ) {
		a.howMany--;
	}

	a.graveyardPosition = a.graveyardPosition._getTransformedBySplitOperation( b );

	return [ a ];
} );

setTransformation( UnwrapOperation, WrapOperation, ( a, b ) => {
	// Case 1:
	//
	// Unwrapping an element that was in graveyard and was used to wrap nodes.
	//
	// Unwrap operation that unwraps in graveyard is a result of transformation of two same `UnwrapOperation`.
	// Then `a` unwraps an element in graveyard and has `howMany` set to `0`. Now, the unwrap operation
	// is going to be transformed by a wrap operation which undoes the previous operation. Operation `a` is
	// in a state that is ready for this, but `howMany` has to be set again to a proper value.
	//
	if ( b.graveyardPosition && compareArrays( a.position.getParentPath(), b.graveyardPosition.path ) == 'same' ) {
		a.howMany = b.howMany;
	}

	// The default case.
	//
	if ( a.position.hasSameParentAs( b.position ) ) {
		a.howMany = a.howMany - b.howMany + 1;
	}

	a.position = a.position._getTransformedByWrapOperation( b );
	a.graveyardPosition = a.graveyardPosition._getTransformedByWrapOperation( b );

	return [ a ];
} );

setTransformation( UnwrapOperation, UnwrapOperation, ( a, b, context ) => {
	// Case 1:
	//
	// Operations unwrap the same element.
	//
	// This situation is similar to `MergeOperation` x `MergeOperation` case. See it for more details.
	//
	if ( a.position.isEqual( b.position ) ) {
		const path = b.graveyardPosition.path.slice();
		path.push( 0 );

		a.position = new Position( b.graveyardPosition.root, path );
		a.howMany = 0;
		a.graveyardPosition = Position.createFromPosition( b.graveyardPosition );

		return [ a ];
	}

	// The default case.
	//
	a.position = a.position._getTransformedByUnwrapOperation( b );

	if ( !a.graveyardPosition.isEqual( b.graveyardPosition ) || !context.aIsStrong ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByUnwrapOperation( b );
	}

	return [ a ];
} );

// Checks whether `MoveOperation` `targetPosition` is inside a node from the moved range of the other `MoveOperation`.
//
// @private
// @param {module:engine/model/operation/moveoperation~MoveOperation} a
// @param {module:engine/model/operation/moveoperation~MoveOperation} b
// @returns {Boolean}
function _moveTargetIntoMovedRange( a, b ) {
	return a.targetPosition._getTransformedByDeletion( b.sourcePosition, b.howMany ) === null;
}

// Helper function for `MoveOperation` x `MoveOperation` transformation. Converts given ranges and target position to
// move operations and returns them.
//
// Ranges and target position will be transformed on-the-fly when generating operations.
//
// Given `ranges` should be in the order of how they were in the original transformed operation.
//
// Given `targetPosition` is the target position of the first range from `ranges`.
//
// @private
// @param {Array.<module:engine/model/range~Range>} ranges
// @param {module:engine/model/position~Position} targetPosition
// @returns {Array.<module:engine/model/operation/moveoperation~MoveOperation>}
function _makeMoveOperationsFromRanges( ranges, targetPosition ) {
	// At this moment we have some ranges and a target position, to which those ranges should be moved.
	// Order in `ranges` array is the go-to order of after transformation.
	//
	// We are almost done. We have `ranges` and `targetPosition` to make operations from.
	// Unfortunately, those operations may affect each other. Precisely, first operation after move
	// may affect source range and target position of second and third operation. Same with second
	// operation affecting third.
	//
	// We need to fix those source ranges and target positions once again, before converting `ranges` to operations.
	const operations = [];

	// Keep in mind that nothing will be transformed if there is just one range in `ranges`.
	for ( let i = 0; i < ranges.length; i++ ) {
		// Create new operation out of a range and target position.
		const range = ranges[ i ];
		const op = new MoveOperation( range.start, range.end.offset - range.start.offset, targetPosition, 0 );

		operations.push( op );

		// Transform other ranges by the generated operation.
		for ( let j = i + 1; j < ranges.length; j++ ) {
			// All ranges in `ranges` array should be:
			//
			// * non-intersecting (these are part of original operation source range), and
			// * `targetPosition` does not target into them (opposite would mean that transformed operation targets "inside itself").
			//
			// This means that the transformation will be "clean" and always return one result.
			ranges[ j ] = ranges[ j ]._getTransformedByMove( op.sourcePosition, op.targetPosition, op.howMany )[ 0 ];
		}

		targetPosition = targetPosition._getTransformedByMove( op.sourcePosition, op.targetPosition, op.howMany );
	}

	return operations;
}
