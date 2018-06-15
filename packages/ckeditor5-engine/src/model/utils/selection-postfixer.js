/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/mode/utils/selection-postfixer
 */

import Range from '../range';
import Position from '../position';

/**
 * Injects selection post fixer to the model.
 *
 * The selection post fixer checks if nodes with `isLimit` property in schema are properly selected.
 *
 * See as an example selection that starts in P1 element and ends inside text of TD element
 * (`[` and `]` are range boundaries and `(l)` denotes element defines as `isLimit=true`):
 *
 *		root
 *		 |- element P1
 *		 |   |- "foo"                                      root
 *		 |- element TABLE (l)                   P1         TABLE             P2
 *		 |   |- element TR (l)                 f o[o     TR      TR         b a r
 *		 |   |   |- element TD (l)                       TD      TD
 *		 |   |       |- "aaa"                          a]a a    b b b
 *		 |   |- element TR (l)
 *		 |   |   |- element TD (l)                           ||
 *		 |   |       |- "bbb"                                ||
 *		 |- element P2                                       VV
 *		 |   |- "bar"
 *		                                                   root
 *		                                        P1         TABLE]            P2
 *		                                       f o[o     TR      TR         b a r
 *		                                                 TD      TD
 *		                                               a a a    b b b
 *
 * In above example, the TABLE, TR and TD are defined as `isLimit=true` in the schema. The range that is not contained withing
 * single limit element must be expanded to select outer most parent limit element. The range end is inside text node of TD element.
 * As TD element is a child of TR element and TABLE elements which both are defined as `isLimit=true` in schema the range must be expanded
 * to select whole TABLE element.
 *
 * **Note** If selection contains multiple ranges the method returns minimal set of ranges that are not intersecting after expanding them
 * to select `isLimit=true` elements.
 *
 * See {@link module:engine/model/schema~Schema#isLimit}.
 *
 * @param {module:engine/model/model~Model} model
 */
export function injectSelectionPostFixer( model ) {
	model.document.registerPostFixer( writer => selectionPostFixer( writer, model ) );
}

// The selection post fixer.
//
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/model~Model} model
function selectionPostFixer( writer, model ) {
	const selection = model.document.selection;
	const schema = model.schema;

	const ranges = [];

	let wasFixed = false;

	for ( const modelRange of selection.getRanges() ) {
		// Go through all ranges in selection and try fixing each of them.
		// Those ranges might overlap but will be corrected later.
		const correctedRange = tryFixRangeWithIsLimitBlocks( modelRange, schema );

		if ( correctedRange ) {
			ranges.push( correctedRange );
			wasFixed = true;
		} else {
			ranges.push( modelRange );
		}
	}

	// If any of ranges were corrected update the selection.
	if ( wasFixed ) {
		// The above algorithm might create ranges that intersects each other when selection contains more then one range.
		// This is case happens mostly on Firefox which creates multiple ranges for selected table.
		const safeRange = combineRangesOnLimitNodes( ranges );

		writer.setSelection( safeRange, { backward: selection.isBackward } );
	}
}

// Tries to correct a range if it contains blocks defined as `isLimit` in schema.
//
// @param {module:engine/model/range~Range} range
// @param {module:engine/model/schema~Schema} schema
// @returns {module:engine/model/range~Range|null} Returns fixed range or null if range is valid.
function tryFixRangeWithIsLimitBlocks( range, schema ) {
	if ( range.isCollapsed ) {
		return tryFixCollapsedRange( range, schema );
	}

	return tryFixExpandedRange( range, schema );
}

// Tries to fix collapsed ranges - ie. when collapsed selection is in limit node that contains other limit nodes.
//
// @param {module:engine/model/range~Range} range Collapsed range to fix.
// @param {module:engine/model/schema~Schema} schema
// @returns {module:engine/model/range~Range|null} Returns fixed range or null if range is valid.
function tryFixCollapsedRange( range, schema ) {
	const originalPosition = range.start;

	const nearestSelectionRange = schema.getNearestSelectionRange( originalPosition );

	// This might be null ie when editor data is empty.
	// In such cases there is no need to fix the selection range.
	if ( !nearestSelectionRange ) {
		return null;
	}

	const fixedPosition = nearestSelectionRange.start;

	// Fixed position is the same as original - no need to return corrected range.
	if ( originalPosition.isEqual( fixedPosition ) ) {
		return null;
	}

	// Check single node selection (happens in tables).
	if ( fixedPosition.nodeAfter && schema.isLimit( fixedPosition.nodeAfter ) ) {
		return new Range( fixedPosition, Position.createAfter( fixedPosition.nodeAfter ) );
	}

	return new Range( fixedPosition );
}

// Tries to fix a expanded range that overlaps limit nodes.
//
// @param {module:engine/model/range~Range} range Expanded range to fix.
// @param {module:engine/model/schema~Schema} schema
// @returns {module:engine/model/range~Range|null} Returns fixed range or null if range is valid.
function tryFixExpandedRange( range, schema ) {
	// No need to check flat ranges as they will not cross node boundary.
	if ( range.isFlat ) {
		return null;
	}

	const start = range.start;
	const end = range.end;

	const updatedStart = expandSelectionOnIsLimitNode( start, schema, 'start' );
	const updatedEnd = expandSelectionOnIsLimitNode( end, schema, 'end' );

	if ( !start.isEqual( updatedStart ) || !end.isEqual( updatedEnd ) ) {
		return new Range( updatedStart, updatedEnd );
	}

	return null;
}

// Expands selection so it contains whole limit node.
//
// @param {module:engine/model/position~Position} position
// @param {module:engine/model/schema~Schema} schema
// @param {String} expandToDirection Direction of expansion - either 'start' or 'end' of the range.
// @returns {module:engine/model/position~Position}
function expandSelectionOnIsLimitNode( position, schema, expandToDirection ) {
	let node = position.parent;
	let parent = node;

	// Find outer most isLimit block as such blocks might be nested (ie. in tables).
	while ( schema.isLimit( parent ) && parent.parent ) {
		node = parent;
		parent = parent.parent;
	}

	if ( node === parent ) {
		// If there is not is limit block the return original position.
		return position;
	}

	// Depending on direction of expanding selection return position before or after found node.
	return expandToDirection === 'start' ? Position.createBefore( node ) : Position.createAfter( node );
}

// Returns minimal set of continuous ranges.
//
// @param {Array.<module:engine/model/range~Range>} ranges
// @returns {Array.<module:engine/model/range~Range>}
function combineRangesOnLimitNodes( ranges ) {
	const combinedRanges = [];

	// Seed the state.
	let previousRange = ranges[ 0 ];
	combinedRanges.push( previousRange );

	// Go through each ranges and check if it can be merged with previous one.
	for ( const range of ranges ) {
		// Do not push same ranges (ie might be created in a table).
		if ( range.isEqual( previousRange ) ) {
			continue;
		}

		// Merge intersecting range into previous one.
		if ( range.isIntersecting( previousRange ) ) {
			const newStart = previousRange.start.isBefore( range.start ) ? previousRange.start : range.start;
			const newEnd = range.end.isAfter( previousRange.end ) ? range.end : previousRange.end;
			const combinedRange = new Range( newStart, newEnd );

			// Replace previous range with the combined one.
			combinedRanges.splice( combinedRanges.indexOf( previousRange ), 1, combinedRange );

			previousRange = combinedRange;

			continue;
		}

		previousRange = range;
		combinedRanges.push( range );
	}

	return combinedRanges;
}
