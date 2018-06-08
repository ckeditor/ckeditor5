/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/controller/selectionpostfixer
 */

import Range from '../model/range';
import Position from '../model/position';

/**
 * The selection post fixer which check if nodes with `isLimit` property in schema are properly selected.
 *
 * @param {module:engine/model/writer~Writer} writer
 * @param {module:engine/model/model~Model} model
 */
export default function selectionPostFixer( writer, model ) {
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

	let previousRange;

	for ( let i = 0; i < ranges.length; i++ ) {
		const range = ranges[ i ];

		if ( !previousRange ) {
			previousRange = range;
			combinedRanges.push( previousRange );
			continue;
		}

		// Do not push same ranges (ie might be created in a table)
		if ( range.isEqual( previousRange ) ) {
			continue;
		}

		if ( range.isIntersecting( previousRange ) ) {
			const newStart = previousRange.start.isBefore( range.start ) ? previousRange.start : range.start;
			const newEnd = range.end.isAfter( previousRange.end ) ? range.end : previousRange.end;
			const newRange = new Range( newStart, newEnd );

			combinedRanges.splice( combinedRanges.indexOf( previousRange ), 1, newRange );

			previousRange = newRange;

			continue;
		}

		previousRange = range;
		combinedRanges.push( range );
	}

	return combinedRanges;
}
