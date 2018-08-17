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

function setTransformation( OperationA, OperationB, transformationFunction ) {
	let aGroup = transformations.get( OperationA );

	if ( !aGroup ) {
		aGroup = new Map();
		transformations.set( OperationA, aGroup );
	}

	aGroup.set( OperationB, transformationFunction );
}

function getTransformation( a, b ) {
	const aGroup = transformations.get( a.constructor );

	if ( aGroup && aGroup.has( b.constructor ) ) {
		return aGroup.get( b.constructor );
	}

	return noUpdateTransformation;
}

function noUpdateTransformation( a ) {
	return [ a.clone() ];
}

function updateBaseVersions( operations, baseVersion ) {
	for ( const operation of operations ) {
		operation.baseVersion = baseVersion++;
	}

	return operations;
}

export function transform( a, b, context = {} ) {
	const transformationFunction = getTransformation( a, b );

	try {
		a = a.clone();

		return transformationFunction( a, b, context );
	} catch ( e ) {
		log.error( 'Error during operation transformation!' );
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

export function transformSets( operationsA, operationsB, options ) {
	operationsA = operationsA.slice();
	operationsB = operationsB.slice();

	if ( operationsA.length == 0 || operationsB.length == 0 ) {
		return { operationsA, operationsB };
	}

	const nextTransformIndex = new WeakMap();

	for ( const op of operationsA ) {
		nextTransformIndex.set( op, 0 );
	}

	const data = {
		nextBaseVersionA: operationsA[ operationsA.length - 1 ].baseVersion + 1,
		nextBaseVersionB: operationsB[ operationsB.length - 1 ].baseVersion + 1,
		extraOpsA: 0,
		extraOpsB: 0
	};

	const context = initializeContext( operationsA, operationsB, options );

	let i = 0;

	while ( i < operationsA.length ) {
		const opA = operationsA[ i ];

		const transformByIndex = nextTransformIndex.get( opA );

		if ( transformByIndex == operationsB.length ) {
			i++;
			continue;
		}

		const opB = operationsB[ transformByIndex ];

		if ( options.useContext ) {
			updateRelations( context, opA, opB );
		}

		const contextAB = {
			aIsStrong: true,
			aWasUndone: context.wasUndone( opA ),
			bWasUndone: context.wasUndone( opB ),
			abRelation: context.getRelation( opA, opB ),
			baRelation: context.getRelation( opB, opA )
		};

		const contextBA = {
			aIsStrong: false,
			aWasUndone: context.wasUndone( opB ),
			bWasUndone: context.wasUndone( opA ),
			abRelation: context.getRelation( opB, opA ),
			baRelation: context.getRelation( opA, opB )
		};

		const newOpsA = transform( opA, opB, contextAB );
		const newOpsB = transform( opB, opA, contextBA );

		if ( options.useContext ) {
			updateOriginalOperation( context, opA, newOpsA );
			updateOriginalOperation( context, opB, newOpsB );
		}

		for ( const newOpA of newOpsA ) {
			nextTransformIndex.set( newOpA, transformByIndex + newOpsB.length );
		}

		operationsA.splice( i, 1, ...newOpsA );
		operationsB.splice( transformByIndex, 1, ...newOpsB );

		data.extraOpsA += newOpsA.length - 1;
		data.extraOpsB += newOpsB.length - 1;
	}

	if ( options.padWithNoOps ) {
		padWithNoOps( operationsA, data.extraOpsB - data.extraOpsA );
		padWithNoOps( operationsB, data.extraOpsA - data.extraOpsB );
	}

	updateBaseVersions( operationsA, data.nextBaseVersionB );
	updateBaseVersions( operationsB, data.nextBaseVersionA );

	return { operationsA, operationsB };
}

function padWithNoOps( operations, howMany ) {
	for ( let i = 0; i < howMany; i++ ) {
		operations.push( new NoOperation( 0 ) );
	}
}

function initializeContext( opsA, opsB, options ) {
	const context = {};

	context.originalOperations = new Map();

	for ( const op of opsA.concat( opsB ) ) {
		context.originalOperations.set( op, op );
	}

	context.document = options.document;
	context.relations = new Map();

	context.wasUndone = function( op ) {
		if ( !options.useContext ) {
			return false;
		}

		const originalOp = this.originalOperations.get( op );

		return this.document.history.isUndoneOperation( originalOp );
	};

	context.getRelation = function( opA, opB ) {
		if ( !options.useContext ) {
			return null;
		}

		const origB = this.originalOperations.get( opB );
		const undoneB = this.document.history.getUndoneOperation( origB );

		if ( !undoneB ) {
			return null;
		}

		const origA = this.originalOperations.get( opA );
		const relationsA = this.relations.get( origA );

		if ( relationsA ) {
			return relationsA.get( undoneB ) || null;
		}

		return null;
	};

	return context;
}

function updateRelations( context, opA, opB ) {
	switch ( opA.constructor ) {
		case MoveOperation: {
			switch ( opB.constructor ) {
				case MergeOperation: {
					if ( opA.targetPosition.isEqual( opB.sourcePosition ) || opB.movedRange.containsPosition( opA.targetPosition ) ) {
						setRelation( context, opA, opB, 'insertAtSource' );
						setRelation( context, opB, opA, 'splitBefore' );
					} else if ( opA.targetPosition.isEqual( opB.deletionPosition ) ) {
						setRelation( context, opA, opB, 'insertBetween' );
					}

					break;
				}

				case MoveOperation: {
					if ( opA.targetPosition.isEqual( opB.sourcePosition ) || opA.targetPosition.isBefore( opB.sourcePosition ) ) {
						setRelation( context, opA, opB, 'insertBefore' );
						setRelation( context, opB, opA, 'insertAfter' );
					} else {
						setRelation( context, opA, opB, 'insertAfter' );
						setRelation( context, opB, opA, 'insertBefore' );
					}

					break;
				}

				case UnwrapOperation: {
					const isInside = opA.targetPosition.hasSameParentAs( opB.targetPosition );

					if ( isInside ) {
						setRelation( context, opA, opB, 'insertInside' );
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
						setRelation( context, opA, opB, 'splitBefore' );
						setRelation( context, opB, opA, 'splitAfter' );
					}

					break;
				}

				case MoveOperation: {
					if ( opA.position.isEqual( opB.sourcePosition ) || opA.position.isBefore( opB.sourcePosition ) ) {
						setRelation( context, opA, opB, 'splitBefore' );
						setRelation( context, opB, opA, 'insertAtSource' );
					}

					break;
				}

				case UnwrapOperation: {
					const isInside = opA.position.hasSameParentAs( opB.position );

					if ( isInside ) {
						setRelation( context, opA, opB, 'splitInside' );
					}

					break;
				}
			}

			break;
		}

		case InsertOperation: {
			switch ( opB.constructor ) {
				case MergeOperation: {
					if ( opA.position.isEqual( opB.sourcePosition ) || opB.movedRange.containsPosition( opA.position ) ) {
						setRelation( context, opA, opB, 'insertAtSource' );
					} else if ( opA.position.isEqual( opB.deletionPosition ) ) {
						setRelation( context, opA, opB, 'insertBetween' );
					}

					break;
				}

				case MoveOperation: {
					if ( opA.position.isEqual( opB.sourcePosition ) || opA.position.isBefore( opB.sourcePosition ) ) {
						setRelation( context, opA, opB, 'insertBefore' );
					}

					break;
				}

				case UnwrapOperation: {
					const isInside = opA.position.hasSameParentAs( opB.position );

					if ( isInside ) {
						setRelation( context, opA, opB, 'insertInside' );
					}

					break;
				}
			}

			break;
		}
	}
}

function setRelation( context, opA, opB, relation ) {
	const origA = context.originalOperations.get( opA );
	const origB = context.originalOperations.get( opB );

	let relationsA = context.relations.get( origA );

	if ( !relationsA ) {
		relationsA = new Map();
		context.relations.set( origA, relationsA );
	}

	relationsA.set( origB, relation );
}

function updateOriginalOperation( context, oldOp, newOps ) {
	const originalOp = context.originalOperations.get( oldOp );

	for ( const op of newOps ) {
		context.originalOperations.set( op, originalOp );
	}
}

function getNoOp() {
	return [ new NoOperation( 0 ) ];
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
			return getNoOp();
		}

		return operations;
	} else {
		// If operations don't conflict, simply return an array containing just a clone of this operation.
		return [ a ];
	}
} );

setTransformation( AttributeOperation, InsertOperation, ( a, b ) => {
	// Case 1:	The attribute operation range includes the position where nodes were inserted.
	//			There are two possible scenarios: the inserted nodes were text and they should receive attributes or
	//			the inserted nodes were elements and they should not receive attributes. In any case the attribute
	//			operation range needs to be split. For text insertion, extra operation needs to be generated.
	//
	if ( a.range.start.hasSameParentAs( b.position ) && a.range.containsPosition( b.position ) ) {
		// This will return an array with a single, expanded range.
		const range = a.range._getTransformedByInsertion( b.position, b.howMany, !b.shouldReceiveAttributes );
		const result = range.map( r => {
			return new AttributeOperation( r, a.key, a.oldValue, a.newValue, a.baseVersion );
		} );

		// `AttributeOperation#range` includes some newly inserted text.
		// The operation should also change the attribute of that text.
		//
		// Bold should be applied on the following range:
		// <p>Fo[zb]ar</p>
		//
		// New text is typed:
		// <p>Fozxxbar</p>
		//
		// Bold should be applied also on the new text:
		// <p>Fo<$text bold=true>zxxb</$text>ar</p>
		//
		// There is a special case to consider here, which will dictate how the final solution will look like. The inserted
		// text might have already an attribute applied and the `oldValue` property of the attribute operation might be wrong:
		//
		// Attribute `highlight="yellow"` should be applied on the following range:
		// <p>Fo[zb]ar<p>
		//
		// But before that, new text with `highlight="red"` is typed:
		// <p>Fo[z<$text highlight="red">x</$text>a]r</p>
		//
		// In this case we cannot simply apply operation changing the attribute value from `null` to `"yellow"` for the whole range
		// because that would lead to an exception (`oldValue` is incorrect for `x`).
		//
		// We also cannot break the original range as this would mess up a scenario when there are multiple following insert operations.
		//
		// So, the attribute range will be expanded, no matter what attributes are set on the inserted nodes:
		//
		// <p>Fo[z<$text highlight="red">x</$text>a]r</p>		<--- Change from `null` to `yellow`, still throwing an exception.
		//
		// But before that operation would be applied, we will add an additional attribute operation that will change
		// attributes on inserted nodes in a way which would make the original operation correct:
		//
		// <p>Fo[z{<$text highlight="red">}x</$text>a]r</p>		<--- Change `{}` from `red` to `null`.
		// <p>Fo[zxa]r</p>										<--- Now change from `null` to `yellow` is completely fine.
		//
		if ( b.shouldReceiveAttributes ) {
			// Be sure to add those operations before the original operation.
			result.unshift( ..._getComplementaryAttributeOperations( b, a.key, a.oldValue ) );
		}
		// If nodes should not receive new attribute, just leave the spread ranges as they are.
		return result;
	}

	// If insert operation is not expanding the attribute operation range, simply transform the range.
	a.range = a.range._getTransformedByInsertion( b.position, b.howMany, false )[ 0 ];

	return [ a ];
} );

function _getComplementaryAttributeOperations( insertOperation, key, newValue ) {
	const nodes = insertOperation.nodes;
	const result = [];

	// At the beginning we store the attribute value from the first node.
	let val = nodes.getNode( 0 ).getAttribute( key );

	// This stores the last index of node list where the attribute value has changed.
	// We need it to create separate `AttributeOperation`s for nodes with different attribute values.
	let lastOffset = 0;

	// Sum of offsets of already processed nodes.
	let offsetSum = nodes.getNode( 0 ).offsetSize;

	for ( let i = 1; i < nodes.length; i++ ) {
		const node = nodes.getNode( i );
		const nodeAttrVal = node.getAttribute( key );

		// If previous node has different attribute value, we will create an operation to the point before current node.
		// So all nodes with the same attributes up to this point will be included in one `AttributeOperation`.
		if ( nodeAttrVal != val ) {
			// New operation is created only when it is needed. If given node already has proper value for this
			// attribute we simply skip it without adding a new operation.
			if ( val != newValue ) {
				addOperation();
			}

			val = nodeAttrVal;
			lastOffset = offsetSum;
		}

		offsetSum = offsetSum + node.offsetSize;
	}

	// At the end we have to add additional `AttributeOperation` for the last part of node list.
	// If all nodes on the node list had same attributes, this will be the only returned operation.
	addOperation();

	return result;

	function addOperation() {
		const range = new Range(
			insertOperation.position.getShiftedBy( lastOffset ),
			insertOperation.position.getShiftedBy( offsetSum )
		);

		result.push(
			new AttributeOperation( range, key, val, newValue, 0 )
		);
	}
}

setTransformation( AttributeOperation, MergeOperation, ( a, b ) => {
	const ranges = [];

	// Case 1:	Attribute change on the merged element. In this case, the merged element was moved to graveyard.
	//			An additional attribute operation that will change the (re)moved element needs to be generated.
	//			Do it only, if there is more than one element in attribute range. If there is only one element,
	//			it will be handled by the default algorithm.
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
	const ranges = breakRangeByMoveOperation( a.range, b, true );

	// Create `AttributeOperation`s out of the ranges.
	return ranges.map( range => new AttributeOperation( range, a.key, a.oldValue, a.newValue, a.baseVersion ) );
} );

function breakRangeByMoveOperation( range, moveOp, includeCommon ) {
	let common = null;
	let difference = [];

	const moveRange = Range.createFromPositionAndShift( moveOp.sourcePosition, moveOp.howMany );

	if ( moveRange.containsRange( range, true ) ) {
		common = range;
	} else if ( range.start.hasSameParentAs( moveRange.start ) ) {
		difference = range.getDifference( moveRange );
		common = includeCommon ? range.getIntersection( moveRange ) : null;
	} else {
		difference = [ range ];
	}

	const result = [];

	for ( let diff of difference ) {
		diff = diff._getTransformedByDeletion( moveOp.sourcePosition, moveOp.howMany );

		const targetPosition = moveOp.getMovedRangeStart();
		const spread = diff.start.hasSameParentAs( targetPosition );
		diff = diff._getTransformedByInsertion( targetPosition, moveOp.howMany, spread );

		result.push( ...diff );
	}

	if ( common ) {
		result.push(
			common._getTransformedByMove( moveOp.sourcePosition, moveOp.targetPosition, moveOp.howMany, false )[ 0 ]
		);
	}

	return result;
}

setTransformation( AttributeOperation, SplitOperation, ( a, b ) => {
	// Case 1:	Split node is the last node in `AttributeOperation#range`.
	//			`AttributeOperation#range` needs to be expanded to include the new (split) node.
	//
	//			<listItem type="bulleted">foobar</listItem>
	//
	//			After split:
	//			<listItem type="bulleted">foo</listItem><listItem type="bulleted">bar</listItem>
	//
	//			After attribute change:
	//			<listItem type="numbered">foo</listItem><listItem type="numbered">foo</listItem>
	//
	if ( a.range.end.isEqual( b.insertionPosition ) && !b.graveyardPosition ) {
		a.range.end.offset++;

		return [ a ];
	}

	// Case 2:	Split is inside `AttributeOperation#range` but the parent is not inside that range.
	//			Transformed attribute operation should not include the element created by split.
	//
	//			Content with range-to-change and split position:
	//			<p>Fo[zb^a]r</p>
	//
	//			After split:
	//			<p>Fo[zb</p><p>a]r</p>
	//
	//			Transformed range contains the new element. This is wrong. It should be like this:
	//			<p>Fo[zb]</p><p>[a]r</p>
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
	// Case 1:	`AttributeOperation#range` and range to wrap intersect. Two `AttributeOperation`s may be needed to handle this
	//			situation as, after wrapping, the nodes to change may be in different parents.
	//
	//			Both list items' type should be changed to numbered:
	//			[<listItem type="bulleted">Foo</listItem><listItem type="bulleted">Bar</listItem>]
	//
	//			Wrap one of the items inside block quote:
	//			<blockQuote><listItem type="bulleted">Foo</listItem></blockQuote><listItem type="bulleted">Bar</listItem>
	//
	//			Two operations are needed:
	//			<blockQuote>[<listItem type="bulleted">Foo</listItem>]</blockQuote>[<listItem type="bulleted">Bar</listItem>]
	//
	//			There might be three ranges needed, if the attribute operation range started before and ended after the wrap range.
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
	// Case 1:	`AttributeOperation#range` contains element to unwrap. Two or three `AttributeOperation`s are needed to handle this
	//			situation. The unwrapped element was moved to graveyard and needs a separate operation. Then, if the unwrapped
	//			nodes are inside attribute operation range, the range needs to be broken on two parts.
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

	a.range = a.range._getTransformedByUnwrapOperation( b );

	return [ a ];
} );

// -----------------------

setTransformation( InsertOperation, AttributeOperation, ( a, b ) => {
	const result = [ a ];

	if ( a.shouldReceiveAttributes && a.position.hasSameParentAs( b.range.start ) && b.range.containsPosition( a.position ) ) {
		result.push( ..._getComplementaryAttributeOperations( a, b.key, b.newValue ) );
	}

	return result;
} );

setTransformation( InsertOperation, InsertOperation, ( a, b, context ) => {
	if ( a.position.isEqual( b.position ) && context.aIsStrong ) {
		return [ a ];
	}

	a.position = a.position._getTransformedByInsertOperation( b );

	return [ a ];
} );

setTransformation( InsertOperation, MoveOperation, ( a, b, context ) => {
	if ( a.position.isEqual( b.targetPosition ) && context.abRelation == 'insertBefore' ) {
		return [ a ];
	}

	a.position = a.position._getTransformedByMoveOperation( b );

	return [ a ];
} );

setTransformation( InsertOperation, SplitOperation, ( a, b, context ) => {
	if ( a.position.isEqual( b.position ) && context.abRelation == 'insertAtSource' ) {
		a.position = b.moveTargetPosition;

		return [ a ];
	}

	a.position = a.position._getTransformedBySplitOperation( b );

	return [ a ];
} );

setTransformation( InsertOperation, MergeOperation, ( a, b ) => {
	a.position = a.position._getTransformedByMergeOperation( b );

	return [ a ];
} );

setTransformation( InsertOperation, WrapOperation, ( a, b, context ) => {
	if ( a.position.isEqual( b.position ) && context.abRelation == 'insertInside' ) {
		a.position = b.targetPosition;

		return [ a ];
	}

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
			a.oldRange = Range.createFromRange( b.newRange );
		} else {
			return getNoOp();
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
	// Case 1:	Same merge operations. Both operations have same source and target positions. So the element already got merged.
	//			In this case, keep the source operation in the merged element - in the graveyard and don't change target position.
	//			This allows for a correct undo.
	//
	if ( a.sourcePosition.isEqual( b.sourcePosition ) && a.targetPosition.isEqual( b.targetPosition ) ) {
		const path = b.graveyardPosition.path.slice();
		path.push( 0 );

		a.sourcePosition = new Position( b.graveyardPosition.root, path );
		a.howMany = 0;

		return [ a ];
	}

	// Case 2:	Same source position but different target positions. The same element got merged into different elements.
	//

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
	// Case 1:	The element to merge got removed.
	//			Merge operation does support merging elements which are not siblings. So it would not be a problem
	//			from technical point of view. However, if the element was removed, the intention of the user
	//			deleting it was to have it all deleted. From user experience point of view, moving back the
	//			removed nodes might be unexpected. This means that in this scenario we will block the merging.
	//			The exception of this rule would be if the remove operation was undone. Then, treat it as a normal move.
	//
	const removedRange = Range.createFromPositionAndShift( b.sourcePosition, b.howMany );

	if ( b.type == 'remove' && !context.bWasUndone ) {
		if ( a.deletionPosition.hasSameParentAs( b.sourcePosition ) && removedRange.containsPosition( a.sourcePosition ) ) {
			return getNoOp();
		}
	}

	if ( a.sourcePosition.hasSameParentAs( b.targetPosition ) ) {
		a.howMany += b.howMany;
	}

	if ( a.sourcePosition.hasSameParentAs( b.sourcePosition ) ) {
		a.howMany -= b.howMany;
	}

	a.sourcePosition = a.sourcePosition._getTransformedByMoveOperation( b );
	a.targetPosition = a.targetPosition._getTransformedByMoveOperation( b );

	if ( !a.graveyardPosition.isEqual( b.targetPosition ) ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByMoveOperation( b );
	}

	return [ a ];
} );

setTransformation( MergeOperation, SplitOperation, ( a, b ) => {
	if ( b.graveyardPosition ) {
		if ( a.deletionPosition.isEqual( b.graveyardPosition ) ) {
			a.howMany = b.howMany;
		}

		a.graveyardPosition = a.graveyardPosition._getTransformedByDeletion( b.graveyardPosition, 1 );
	}

	// Case 1:	Merge operation moves nodes to the place where split happens.
	//			This is a classic situation when there are two paragraphs, and there is a split (enter) after the first
	//			paragraph and there is a merge (delete) at the beginning of the second paragraph:
	//
	//			<p>Foo{}</p><p>[]Bar</p>.
	//
	//			Split is after `Foo`, while merge is from `Bar` to the end of `Foo`.
	//
	//			State after split:
	//			<p>Foo</p><p></p><p>Bar</p>
	//
	//			Now, `Bar` should be merged to the new paragraph:
	//			<p>Foo</p><p>Bar</p>
	//
	//			Instead of merging it to the original paragraph:
	//			<p>FooBar</p><p></p>
	//
	//			This means that `targetPosition` needs to be transformed. This is the default case though.
	//			For example, if the split would be after `F`, `targetPosition` should also be transformed.
	//
	//			There are two exception, though, when we want to keep `targetPosition` as it was.
	//
	//			First exception is when the merge target position is inside an element (not at the end, as usual). This
	//			happens when the merge operation earlier was transformed by "the same" merge operation. If merge operation
	//			targets inside the element we want to keep the original target position (and not transform it) because
	//			we have additional context telling us that we want to merge to the original element. We can check if the
	//			merge operation points inside element by checking what is `SplitOperation#howMany`. Since merge target position
	//			is same as split position, if `howMany` is non-zero, it means that the merge target position is inside an element.
	//
	//			Second exception is when the element to merge is in the graveyard and split operation uses it. In that case
	//			if target position would be transformed, the merge operation would target at the source position:
	//
	//			root: <p>Foo</p>				graveyard: <p></p>
	//
	//			SplitOperation: root [ 0, 3 ] using graveyard [ 0 ] (howMany = 0)
	//			MergeOperation: graveyard [ 0, 0 ] -> root [ 0, 3 ] (howMany = 0)
	//
	//			Since split operation moves the graveyard node back to the root, the merge operation source position changes.
	//			We would like to merge from the empty <p> to the "Foo" <p>:
	//
	//			root: <p>Foo</p><p></p>			graveyard:
	//
	//			MergeOperation#sourcePosition = root [ 1, 0 ]
	//
	//			If `targetPosition` is transformed, it would become root [ 1, 0 ] as well. It has to be kept as it was.
	//
	if ( a.targetPosition.isEqual( b.position ) ) {
		if ( b.howMany != 0 || ( b.graveyardPosition && a.deletionPosition.isEqual( b.graveyardPosition ) ) ) {
			a.sourcePosition = a.sourcePosition._getTransformedBySplitOperation( b );

			return [ a ];
		}
	}

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

	// Case 1:	Wrap is with an element from graveyard, which also is merge operation target. This happens
	//			in some undo scenarios. In this case, the target position needs to be properly transformed.
	//
	const path = a.targetPosition.path.slice( 0, -1 );
	const posBeforeTargetElement = new Position( a.targetPosition.root, path );

	if ( b.graveyardPosition && b.graveyardPosition.isEqual( posBeforeTargetElement ) ) {
		a.sourcePosition = a.sourcePosition._getTransformedByWrapOperation( b );
		a.targetPosition = b.targetPosition.getShiftedBy( b.howMany );

		return [ a ];
	}

	// Case 2:	Merged element is wrapped and this is the last (only) element in the wrap.
	//			Because of how this is resolved in `WrapOperation` x `MergeOperation`, we need to apply special handling here.
	//			If the last element from wrapped range is "removed" from it, the wrap is effectively on empty range.
	//			In that case, the wrapper element is moved to graveyard. This happens in `WrapOperation` x
	//			`MergeOperation` and we need to mirror it here.
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

	a.sourcePosition = a.sourcePosition._getTransformedByWrapOperation( b );
	a.targetPosition = a.targetPosition._getTransformedByWrapOperation( b );

	return [ a ];
} );

setTransformation( MergeOperation, UnwrapOperation, ( a, b, context ) => {
	// Case 1:	The element to merge got unwrapped.
	//			There are multiple possible solution to resolve this conflict:
	//			 * unwrap also merge target (all nodes are unwrapped),
	//			 * move the unwrapped nodes to the merge target (no nodes stayed unwrapped),
	//			 * leave merge position in the unwrapped node (some nodes are unwrapped and some are not).
	//
	//			Third option is chosen in this algorithm. If the unwrap operation is undone before merge is applied,
	//			the merge operation will work as expected. If the unwrap operation is not undone, then the merge
	//			operation won't merge any nodes, so it will behave similarly to noop.
	//
	if ( a.sourcePosition.isEqual( b.position ) ) {
		const path = b.graveyardPosition.path.slice();
		path.push( 0 );

		a.sourcePosition = new Position( b.graveyardPosition.root, path );
		a.howMany = 0;

		return [ a ];
	}

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

setTransformation( MoveOperation, InsertOperation, ( a, b, context ) => {
	const moveRange = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );
	const transformed = moveRange._getTransformedByInsertOperation( b, false )[ 0 ];

	a.sourcePosition = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;

	if ( !a.targetPosition.isEqual( b.position ) || context.abRelation == 'insertBefore' ) {
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
	let insertBefore = !context.aIsStrong;

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
	if ( moveTargetIntoMovedRange( a, b ) && moveTargetIntoMovedRange( b, a ) ) {
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

		return makeMoveOperationsFromRanges( [ rangeA ], newTargetPosition );
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

		return makeMoveOperationsFromRanges( [ rangeA ], newTargetPosition );
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

		return makeMoveOperationsFromRanges( [ rangeA ], newTargetPosition );
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

	return makeMoveOperationsFromRanges( ranges, newTargetPosition );
} );

setTransformation( MoveOperation, SplitOperation, ( a, b, context ) => {
	const newTargetPosition = a.targetPosition._getTransformedBySplitOperation( b );

	// Case 1:	Last element in the moved range got split.
	//			In this case the default range transformation will not work correctly as the element created by
	//			split operation would be outside the range. The range to move needs to be fixed manually.
	//
	const moveRange = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );

	if ( moveRange.end.isEqual( b.insertionPosition ) && !b.graveyardPosition ) {
		a.howMany++;
		a.targetPosition = newTargetPosition;

		return [ a ];
	}

	// Case 2:	Split happened between the moved nodes. In this case two ranges to move need to be generated.
	//
	//			Characters `ozba` are moved to the end of paragraph `Xyz` but split happened.
	//			<p>F[oz|ba]r</p><p>Xyz</p>
	//
	//			After split:
	//			<p>F[oz</p><p>ba]r</p><p>Xyz</p>
	//
	//			Correct ranges:
	//			<p>F[oz]</p><p>[ba]r</p><p>Xyz</p>
	//
	//			After move:
	//			<p>F</p><p>r</p><p>Xyzozba</p>
	//
	if ( moveRange.start.hasSameParentAs( b.position ) && moveRange.containsPosition( b.position ) ) {
		let rightRange = new Range( b.position, moveRange.end );
		rightRange = rightRange._getTransformedBySplitOperation( b );

		const ranges = [
			new Range( moveRange.start, b.position ),
			rightRange
		];

		return makeMoveOperationsFromRanges( ranges, newTargetPosition );
	}

	// The default case.
	//
	const transformed = moveRange._getTransformedBySplitOperation( b );

	a.sourcePosition = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;

	if ( a.targetPosition.isEqual( b.position ) && context.abRelation == 'insertAtSource' ) {
		a.targetPosition = b.moveTargetPosition;
	} else if ( a.targetPosition.isEqual( b.insertionPosition ) && context.abRelation == 'insertBetween' ) {
		a.targetPosition = a.targetPosition;
	} else {
		a.targetPosition = newTargetPosition;
	}

	return [ a ];
} );

setTransformation( MoveOperation, MergeOperation, ( a, b, context ) => {
	const movedRange = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );

	if ( b.deletionPosition.hasSameParentAs( a.sourcePosition ) && movedRange.containsPosition( b.sourcePosition ) ) {
		if ( a.type == 'remove' ) {
			// Case 1:	The element to remove got merged.
			//			Merge operation does support merging elements which are not siblings. So it would not be a problem
			//			from technical point of view. However, if the element was removed, the intention of the user
			//			deleting it was to have it all deleted. From user experience point of view, moving back the
			//			removed nodes might be unexpected. This means that in this scenario we will reverse merging and remove the element.
			//
			if ( !context.aWasUndone ) {
				return [ b.getReversed(), a ];
			}
		} else {
			// Case 2:	The element to move got merged and it was the only element to move.
			//			In this case just don't do anything, leave the node in the graveyard. Without special case
			//			it would be a move operation that moves 0 nodes, so maybe it is better just to return no-op.
			//
			if ( a.howMany == 1 ) {
				if ( !context.bWasUndone ) {
					return getNoOp();
				} else {
					a.sourcePosition = Position.createFromPosition( b.graveyardPosition );
					a.targetPosition = a.targetPosition._getTransformedByMergeOperation( b );

					return [ a ];
				}
			}
		}
	}

	const moveRange = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );
	const transformed = moveRange._getTransformedByMergeOperation( b );

	a.sourcePosition = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;
	a.targetPosition = a.targetPosition._getTransformedByMergeOperation( b );

	return [ a ];
} );

setTransformation( MoveOperation, WrapOperation, ( a, b, context ) => {
	const moveRange = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );
	const newTargetPosition = a.targetPosition._getTransformedByWrapOperation( b );

	// Case 1:	Some of the nodes to move got wrapped. In this case multiple ranges to move might need to be generated.
	//
	//			First paragraph and the image should are wrapped, while the two images are moved after the last paragraph:
	//			[<paragraph>Foo</paragraph>{<image />]<image />}<paragraph>Bar</paragraph>
	//
	//			After wrap:
	//			<blockQuote><paragraph>Foo</paragraph>[<image />]</blockQuote>[<image />]<paragraph>Bar</paragraph>
	//
	//			After move:
	//			<blockQuote><paragraph>Foo</paragraph></blockQuote><paragraph>Bar</paragraph><image /><image />
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

	if ( a.targetPosition.isEqual( b.position ) && context.abRelation == 'insertInside' ) {
		a.targetPosition = b.targetPosition;
	}

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
			return getNoOp();
		}
	}

	return [ a ];
} );

setTransformation( RenameOperation, SplitOperation, ( a, b ) => {
	// Case 1:	The element to rename has been split. In this case, the new element should be also renamed.
	//
	//			This element should be renamed:
	//			<paragraph>Foobar</paragraph>
	//
	//			After split:
	//			<paragraph>Foo</paragraph><paragraph>bar</paragraph>
	//
	//			Rename both elements:
	//			<listItem>Foo</listItem><listItem>bar</listItem>
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

setTransformation( SplitOperation, InsertOperation, ( a, b, context ) => {
	if ( a.position.isEqual( b.position ) && context.baRelation == 'insertAtSource' ) {
		a.howMany += b.howMany;

		return [ a ];
	}

	if ( a.position.hasSameParentAs( b.position ) && a.position.offset < b.position.offset ) {
		a.howMany += b.howMany;
	}

	a.position = a.position._getTransformedByInsertOperation( b );

	return [ a ];
} );

setTransformation( SplitOperation, MergeOperation, ( a, b ) => {
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

	// Case 1:	If the split position is inside the moved range, we need to move the split position to a proper place.
	//			The position cannot be moved together with moved range because that would result in splitting an incorrect element.
	//
	//			Characters `bc` should be moved to the second paragraph while split position is between them:
	//			<paragraph>A[b|c]d</paragraph><paragraph>Xyz</paragraph>
	//
	//			After move, new split position is incorrect:
	//			<paragraph>Ad</paragraph><paragraph>Xb|cyz</paragraph>
	//
	//			Correct split position:
	//			<paragraph>A|d</paragraph><paragraph>Xbcyz</paragraph>
	//
	//			After split:
	//			<paragraph>A</paragraph><paragraph>d</paragraph><paragraph>Xbcyz</paragraph>
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

	if ( a.position.isEqual( b.targetPosition ) && context.abRelation == 'splitBefore' ) {
		a.howMany += b.howMany;
		a.position = a.position._getTransformedByDeletion( b.sourcePosition, b.howMany );

		return [ a ];
	}

	// The default case.
	//
	if ( a.position.hasSameParentAs( b.sourcePosition ) && a.position.offset < b.sourcePosition.offset ) {
		a.howMany -= b.howMany;
	}

	if ( a.position.hasSameParentAs( b.targetPosition ) && a.position.offset < b.targetPosition.offset ) {
		a.howMany += b.howMany;
	}

	a.position = a.position._getTransformedByMoveOperation( b );

	return [ a ];
} );

setTransformation( SplitOperation, SplitOperation, ( a, b, context ) => {
	if ( a.position.isEqual( b.position ) ) {
		if ( !a.graveyardPosition && !b.graveyardPosition ) {
			return getNoOp();
		}

		if ( a.graveyardPosition && b.graveyardPosition && a.graveyardPosition.isEqual( b.graveyardPosition ) ) {
			return getNoOp();
		}

		a.howMany = 0;
	} else if ( a.position.isEqual( b.insertionPosition ) && context.abRelation == 'splitBefore' ) {
		return [ a ];
	} else {
		if ( a.position.hasSameParentAs( b.position ) && a.position.offset < b.position.offset ) {
			a.howMany -= b.howMany;
		}

		a.position = a.position._getTransformedBySplitOperation( b );
	}

	if ( a.graveyardPosition && b.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByDeletion( b.graveyardPosition, 1 );
	}

	return [ a ];
} );

setTransformation( SplitOperation, WrapOperation, ( a, b, context ) => {
	// Case 1:	If split position has been wrapped, reverse the wrapping so that split can be applied as intended.
	//			This is an edge case scenario where it is difficult to find a correct solution.
	//			Since it will be a rare (or only theoretical) scenario, the algorithm will perform the easy solution.
	//
	if ( a.position.hasSameParentAs( b.position ) && b.wrappedRange.containsPosition( a.position ) ) {
		const reversed = b.getReversed();

		// Unwrap operation (reversed wrap) always puts a node into a graveyard. Not every wrap operation pulls a node
		// from the graveyard, though. This means that after reversing a wrap operation, there might be a need to
		// update a position in graveyard.
		if ( !b.graveyardPosition && a.graveyardPosition ) {
			a.graveyardPosition = a.graveyardPosition._getTransformedByInsertion( reversed.graveyardPosition, 1 );
		}

		return [ reversed, a ];
	}

	if ( a.position.isEqual( b.position ) && context.abRelation == 'splitInside' ) {
		a.position = b.targetPosition;
		a.howMany = b.howMany;
	} else {
		if ( a.position.hasSameParentAs( b.position ) && a.position.offset < b.position.offset ) {
			a.howMany = a.howMany + 1 - b.howMany;
		}

		a.position = a.position._getTransformedByWrapOperation( b );
	}

	if ( a.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByWrapOperation( b );
	}

	return [ a ];
} );

setTransformation( SplitOperation, UnwrapOperation, ( a, b, context ) => {
	const splitInside = a.position.hasSameParentAs( b.position );

	if ( splitInside && !context.bWasUndone ) {
		const path = b.graveyardPosition.path.slice();
		path.push( 0 );

		a.position = new Position( b.graveyardPosition.root, path );
		a.howMany = 0;
	} else {
		if ( a.position.hasSameParentAs( b.targetPosition ) && a.position.offset < b.targetPosition.offset ) {
			a.howMany = a.howMany - 1 + b.howMany;
		}

		a.position = a.position._getTransformedByUnwrapOperation( b );
	}

	if ( a.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByUnwrapOperation( b );
	}

	return [ a ];
} );

// -----------------------

setTransformation( WrapOperation, InsertOperation, ( a, b, context ) => {
	if ( a.position.isEqual( b.position ) && context.baRelation == 'insertInside' ) {
		a.howMany += b.howMany;

		return [ a ];
	}

	const transformed = a.wrappedRange._getTransformedByInsertOperation( b, false )[ 0 ];

	a.position = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;

	return [ a ];
} );

setTransformation( WrapOperation, MergeOperation, ( a, b ) => {
	if ( a.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByInsertion( b.graveyardPosition, 1 );
	}

	// Case 1:	The element to wrap got merged.
	//
	if ( a.position.isEqual( b.deletionPosition ) ) {
		a.position = Position.createFromPosition( b.graveyardPosition );
		a.position.stickiness = 'toNext';

		return [ a ];
	}

	const transformed = a.wrappedRange._getTransformedByMergeOperation( b );

	a.position = transformed.start;
	a.howMany = transformed.end.offset - transformed.start.offset;

	return [ a ];
} );

setTransformation( WrapOperation, MoveOperation, ( a, b, context ) => {
	if ( a.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByMoveOperation( b );
	}

	if ( a.position.isEqual( b.targetPosition ) && context.baRelation == 'insertInside' ) {
		a.position._getTransformedByDeletion( b.sourcePosition, b.howMany );
		a.howMany += b.howMany;

		return [ a ];
	}

	const moveRange = Range.createFromPositionAndShift( b.sourcePosition, b.howMany );
	const wrappedRange = a.wrappedRange;

	if ( moveRange.containsRange( wrappedRange, true ) ) {
		a.position = a.position._getCombined( b.sourcePosition, b.getMovedRangeStart() );
	} else {
		let transformed = wrappedRange._getTransformedByDeletion( b.sourcePosition, b.howMany );
		transformed = transformed._getTransformedByInsertion( b.targetPosition, b.howMany, false )[ 0 ];

		a.position = transformed.start;
		a.howMany = transformed.end.offset - transformed.start.offset;
	}

	return [ a ];
} );

setTransformation( WrapOperation, SplitOperation, ( a, b, context ) => {
	// Case 1:	If range to wrap got split cancel the wrapping.
	//			Do that only if this is not undo mode. If `b` operation was earlier transformed by unwrap operation
	//			and the split position was inside the unwrapped range, then proceed without special case.
	//
	const isInside = a.position.hasSameParentAs( b.position ) && a.wrappedRange.containsPosition( b.position );

	if ( isInside && context.baRelation !== 'splitInside' ) {
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
			return getNoOp();
		}
	}

	if ( a.graveyardPosition && b.graveyardPosition ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByDeletion( b.graveyardPosition, 1 );
	}

	// Case 2:	If last element from range to wrap has been split, include the newly created element in the wrap range.
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

	// Case 1:	If ranges to wrap intersect on the same level then there is a conflict.
	//			Depending on `context.aIsStrong` the nodes in the intersecting part should be left as they were wrapped
	//			or moved to the new wrapping element.
	//
	//			`Foo` and `Bar` are to be wrapped in `blockQuote`, while `Bar` and `Xyz` in `div`.
	//			[<paragraph>Foo</paragraph>{<paragraph>Bar</paragraph>]<paragraph>Xyz</paragraph>}
	//
	//			After `blockQuote` wrap:
	//			<blockQuote>
	//				<paragraph>Foo</paragraph><paragraph>Bar</paragraph>
	//			</blockQuote>
	//			<paragraph>Xyz</paragraph>
	//
	//			After `div` wrap:
	//			<blockQuote>
	//				<paragraph>Foo</paragraph><paragraph>Bar</paragraph>
	//			</blockQuote>
	//			<div>
	//				<paragraph>Xyz</paragraph>
	// 			</div>
	//
	//			Or, if `div` wrap is stronger:
	//			<blockQuote>
	//				<paragraph>Foo</paragraph>
	//			</blockQuote>
	//			<div>
	//				<paragraph>Bar</paragraph><paragraph>Xyz</paragraph>
	//			</div>
	//
	//			The range from incoming operation may be also wholly included in the range from operation `b`.
	//			Then, cancel the wrapping. The same happens when the ranges are identical but in that case,
	//			`context.aIsStrong` decides which wrapping should be cancelled.
	//
	//			Lastly, the range from operation `b` may be wholly included in the range from incoming operation.
	//			Then, unwrap the range from operation `b` and do a wrap on full range from operation `a`.
	//
	if ( a.position.hasSameParentAs( b.position ) ) {
		const ranges = a.wrappedRange.getDifference( b.wrappedRange );

		// Range from `a` is contained in range from `b` or ranges are equal.
		if ( ranges.length == 0 ) {
			if ( a.wrappedRange.isEqual( b.wrappedRange ) && context.aIsStrong ) {
				// If ranges are equal and `a` is a stronger operation, reverse `b` operation and then apply `a` operation.
				const reversed = b.getReversed();

				// Unwrap operation (reversed wrap) always puts a node into a graveyard. Not every wrap operation pulls a node
				// from the graveyard, though. This means that after reversing a wrap operation, there might be a need to
				// update a position in graveyard.
				if ( !b.graveyardPosition && a.graveyardPosition ) {
					a.graveyardPosition = a.graveyardPosition._getTransformedByInsertion( reversed.graveyardPosition, 1 );
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

					// Unwrap operation (reversed wrap) always puts a node into a graveyard. Not every wrap operation pulls a node
					// from the graveyard, though. This means that after reversing a wrap operation, there might be a need to
					// update a position in graveyard.
					if ( !b.graveyardPosition && a.graveyardPosition ) {
						a.graveyardPosition = a.graveyardPosition._getTransformedByInsertion( reversed.graveyardPosition, 1 );
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

				// Unwrap operation (reversed wrap) always puts a node into a graveyard. Not every wrap operation pulls a node
				// from the graveyard, though. This means that after reversing a wrap operation, there might be a need to
				// update a position in graveyard.
				if ( !b.graveyardPosition && a.graveyardPosition ) {
					a.graveyardPosition = a.graveyardPosition._getTransformedByInsertion( reversed.graveyardPosition, 1 );
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
	// Case 1:	Insert operation inserts nodes into the unwrapped element.
	//			This does not have any impact on `UnwrapOperation#position`, but `#howMany` has to be changed.
	//
	if ( a.position.hasSameParentAs( b.position ) ) {
		a.howMany += b.howMany;
	}

	a.position = a.position._getTransformedByInsertOperation( b );

	return [ a ];
} );

setTransformation( UnwrapOperation, MergeOperation, ( a, b, context ) => {
	// Case 1:	The element to unwrap got merged.
	//			There are multiple possible solution to resolve this conflict:
	//			 * unwrap the merge target element (all nodes are unwrapped),
	//			 * cancel the unwrap (no nodes stayed unwrapped),
	//			 * reverse the merge and apply the original unwrap (some nodes are unwrapped and some are not).
	//
	if ( a.position.isEqual( b.sourcePosition ) ) {
		return [ b.getReversed(), a ];
	}

	// Case 2:	The element to unwrap was merged-to and has new nodes.
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
	// Case 1:	Move operation moves nodes from the unwrapped element.
	//			This does not have any impact on `UnwrapOperation#position`, but `#howMany` has to be changed.
	//
	if ( a.position.hasSameParentAs( b.sourcePosition ) ) {
		a.howMany -= b.howMany;
	}

	// Case 2:	Move operation moves nodes into the unwrapped element.
	//			This does not have any impact on `UnwrapOperation#position`, but `#howMany` has to be changed.
	//			Note, that case 1 and case 2 may happen together.
	//
	if ( a.position.hasSameParentAs( b.targetPosition ) ) {
		a.howMany += b.howMany;
	}

	a.position = a.position._getTransformedByMoveOperation( b );

	if ( !a.graveyardPosition.isEqual( b.targetPosition ) ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByMoveOperation( b );
	}

	return [ a ];
} );

setTransformation( UnwrapOperation, SplitOperation, ( a, b ) => {
	// Case 1:	The element to unwrap got split, so now there are two elements to unwrap.
	//			This can be solved either by providing two unwrap operations or by reversing the split and applying the original unwrap.
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

	// Case 2:	The split element is the last element in unwrapped element. In this case, we need to manually modify
	//			`howMany` property because it wouldn't be correctly calculated by `_getTransformedBySplitOperation`.
	//
	if ( a.position.hasSameParentAs( b.insertionPosition ) ) {
		a.howMany++;

		return [ a ];
	}

	a.position = a.position._getTransformedBySplitOperation( b );

	if ( b.graveyardPosition && b.graveyardPosition.hasSameParentAs( a.position ) ) {
		a.howMany--;
	}

	a.graveyardPosition = a.graveyardPosition._getTransformedBySplitOperation( b );

	return [ a ];
} );

setTransformation( UnwrapOperation, WrapOperation, ( a, b ) => {
	// Case 1:	Wrapping took place inside the element to unwrap. `UnwrapOperation#howMany` needs to be updated.
	//
	if ( a.position.hasSameParentAs( b.position ) ) {
		a.howMany = a.howMany - b.howMany + 1;
	}

	if ( b.graveyardPosition && compareArrays( a.position.getParentPath(), b.graveyardPosition.path ) == 'same' ) {
		a.howMany = b.howMany;
	}

	// The default case.
	//
	a.position = a.position._getTransformedByWrapOperation( b );
	a.graveyardPosition = a.graveyardPosition._getTransformedByWrapOperation( b );

	return [ a ];
} );

setTransformation( UnwrapOperation, UnwrapOperation, ( a, b, context ) => {
	// Case 1:	Operations unwrap the same element.
	//
	if ( a.position.isEqual( b.position ) ) {
		const path = b.graveyardPosition.path.slice();
		path.push( 0 );

		a.position = new Position( b.graveyardPosition.root, path );
		a.howMany = 0;
		a.graveyardPosition = Position.createFromPosition( b.graveyardPosition );

		return [ a ];
	}

	a.position = a.position._getTransformedByUnwrapOperation( b );

	if ( !a.graveyardPosition.isEqual( b.graveyardPosition ) || !context.aIsStrong ) {
		a.graveyardPosition = a.graveyardPosition._getTransformedByUnwrapOperation( b );
	}

	return [ a ];
} );

// Checks whether MoveOperation targetPosition is inside a node from the moved range of the other MoveOperation.
function moveTargetIntoMovedRange( a, b ) {
	return a.targetPosition._getTransformedByDeletion( b.sourcePosition, b.howMany ) === null;
}

// Helper function for `MoveOperation` x `MoveOperation` transformation.
// Convert given ranges and target position to move operations and return them.
// Ranges and target position will be transformed on-the-fly when generating operations.
// Given `ranges` should be in the order of how they were in the original transformed operation.
// Given `targetPosition` is the target position of the first range from `ranges`.
function makeMoveOperationsFromRanges( ranges, targetPosition ) {
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
		const op = makeMoveOperation( ranges[ i ], targetPosition );

		operations.push( op );

		// Transform other ranges by the generated operation.
		for ( let j = i + 1; j < ranges.length; j++ ) {
			// All ranges in `ranges` array should be:
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

function makeMoveOperation( range, targetPosition ) {
	targetPosition.stickiness = 'toNone';

	return new MoveOperation(
		range.start,
		range.end.offset - range.start.offset,
		targetPosition,
		0
	);
}
