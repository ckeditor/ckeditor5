/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/mode/utils/selection-post-fixer
 */

import Range from '../range';
import Position from '../position';

/**
 * Injects selection post-fixer to the model.
 *
 * The role of the selection post-fixer is to ensure that the selection is in a correct place
 * after a {@link module:engine/model/model~Model#change `change()`} block was executed.
 *
 * The correct position means that:
 *
 * * All collapsed selection ranges are in a place where the {@link module:engine/model/schema~Schema}
 * allows a `$text`.
 * * None of the selection's non-collapsed ranges crosses a {@link module:engine/model/schema~Schema#isLimit limit element}
 * boundary (a range must be rooted within one limit element).
 * * Only {@link module:engine/model/schema~Schema#isObject object elements} can be selected from the outside
 * (e.g. `[<paragraph>foo</paragraph>]` is invalid). This rule applies independently to both selection ends, so this
 * selection is correct: `<paragraph>f[oo</paragraph><image></image>]`.
 *
 * If the position is not correct, the post-fixer will automatically correct it.
 *
 * ## Fixing a non-collapsed selection
 *
 * See as an example a selection that starts in a P1 element and ends inside the text of a TD element
 * (`[` and `]` are range boundaries and `(l)` denotes an element defined as `isLimit=true`):
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
 * In the example above, the TABLE, TR and TD are defined as `isLimit=true` in the schema. The range which is not contained within
 * a single limit element must be expanded to select the outermost limit element. The range end is inside the text node of the TD element.
 * As the TD element is a child of the TR and TABLE elements, where both are defined as `isLimit=true` in the schema, the range must be
 * expanded to select the whole TABLE element.
 *
 * **Note** If the selection contains multiple ranges, the method returns a minimal set of ranges that are not intersecting after expanding
 * them to select `isLimit=true` elements.
 *
 * @param {module:engine/model/model~Model} model
 */
export function injectSelectionPostFixer( model ) {
	model.document.registerPostFixer( writer => selectionPostFixer( writer, model ) );
}

// The selection post-fixer.
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
		const correctedRange = tryFixingRange( modelRange, schema );

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
		const combinedRanges = combineOverlapingRanges( ranges );

		writer.setSelection( combinedRanges, { backward: selection.isBackward } );
	}
}

// Tries fixing a range if it's incorrect.
//
// @param {module:engine/model/range~Range} range
// @param {module:engine/model/schema~Schema} schema
// @returns {module:engine/model/range~Range|null} Returns fixed range or null if range is valid.
function tryFixingRange( range, schema ) {
	if ( range.isCollapsed ) {
		return tryFixingCollapsedRange( range, schema );
	}

	return tryFixingNonCollpasedRage( range, schema );
}

// Tries to fix collapsed ranges.
//
// * Fixes situation when a range is in a place where $text is not allowed
//
// @param {module:engine/model/range~Range} range Collapsed range to fix.
// @param {module:engine/model/schema~Schema} schema
// @returns {module:engine/model/range~Range|null} Returns fixed range or null if range is valid.
function tryFixingCollapsedRange( range, schema ) {
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
function tryFixingNonCollpasedRage( range, schema ) {
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
function combineOverlapingRanges( ranges ) {
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
