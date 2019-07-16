/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/utils/selection-post-fixer
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
		let fixedRanges = ranges;

		// Fixing selection with many ranges usually breaks the selection in Firefox. As only Firefox supports multiple selection ranges
		// we simply create one continuous range from fixed selection ranges (even if they are not adjacent).
		if ( ranges.length > 1 ) {
			const selectionStart = ranges[ 0 ].start;
			const selectionEnd = ranges[ ranges.length - 1 ].end;

			fixedRanges = [ new Range( selectionStart, selectionEnd ) ];
		}

		writer.setSelection( fixedRanges, { backward: selection.isBackward } );
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

	return tryFixingNonCollapsedRage( range, schema );
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
		return new Range( fixedPosition, Position._createAfter( fixedPosition.nodeAfter ) );
	}

	return new Range( fixedPosition );
}

// Tries to fix an expanded range.
//
// @param {module:engine/model/range~Range} range Expanded range to fix.
// @param {module:engine/model/schema~Schema} schema
// @returns {module:engine/model/range~Range|null} Returns fixed range or null if range is valid.
function tryFixingNonCollapsedRage( range, schema ) {
	const start = range.start;
	const end = range.end;

	const isTextAllowedOnStart = schema.checkChild( start, '$text' );
	const isTextAllowedOnEnd = schema.checkChild( end, '$text' );

	const startLimitElement = schema.getLimitElement( start );
	const endLimitElement = schema.getLimitElement( end );

	// Ranges which both end are inside the same limit element (or root) might needs only minor fix.
	if ( startLimitElement === endLimitElement ) {
		// Range is valid when both position allows to place a text:
		// - <block>f[oobarba]z</block>
		// This would be "fixed" by a next check but as it will be the same it's better to return null so the selection stays the same.
		if ( isTextAllowedOnStart && isTextAllowedOnEnd ) {
			return null;
		}

		// Range that is on non-limit element (or is partially) must be fixed so it is placed inside the block around $text:
		// - [<block>foo</block>]    ->    <block>[foo]</block>
		// - [<block>foo]</block>    ->    <block>[foo]</block>
		// - <block>f[oo</block>]    ->    <block>f[oo]</block>
		// - [<block>foo</block><object></object>]    ->    <block>[foo</block><object></object>]
		if ( checkSelectionOnNonLimitElements( start, end, schema ) ) {
			const isStartObject = start.nodeAfter && schema.isObject( start.nodeAfter );
			const fixedStart = isStartObject ? null : schema.getNearestSelectionRange( start, 'forward' );

			const isEndObject = end.nodeBefore && schema.isObject( end.nodeBefore );
			const fixedEnd = isEndObject ? null : schema.getNearestSelectionRange( end, 'backward' );

			// The schema.getNearestSelectionRange might return null - if that happens use original position.
			const rangeStart = fixedStart ? fixedStart.start : start;
			const rangeEnd = fixedEnd ? fixedEnd.start : end;

			return new Range( rangeStart, rangeEnd );
		}
	}

	const isStartInLimit = startLimitElement && !startLimitElement.is( 'rootElement' );
	const isEndInLimit = endLimitElement && !endLimitElement.is( 'rootElement' );

	// At this point we eliminated valid positions on text nodes so if one of range positions is placed inside a limit element
	// then the range crossed limit element boundaries and needs to be fixed.
	if ( isStartInLimit || isEndInLimit ) {
		const bothInSameParent = ( start.nodeAfter && end.nodeBefore ) && start.nodeAfter.parent === end.nodeBefore.parent;

		const expandStart = isStartInLimit && ( !bothInSameParent || !isInObject( start.nodeAfter, schema ) );
		const expandEnd = isEndInLimit && ( !bothInSameParent || !isInObject( end.nodeBefore, schema ) );

		// Although we've already found limit element on start/end positions we must find the outer-most limit element.
		// as limit elements might be nested directly inside (ie table > tableRow > tableCell).
		let fixedStart = start;
		let fixedEnd = end;

		if ( expandStart ) {
			fixedStart = Position._createBefore( findOutermostLimitAncestor( startLimitElement, schema ) );
		}

		if ( expandEnd ) {
			fixedEnd = Position._createAfter( findOutermostLimitAncestor( endLimitElement, schema ) );
		}

		return new Range( fixedStart, fixedEnd );
	}

	// Range was not fixed at this point so it is valid - ie it was placed around limit element already.
	return null;
}

// Finds the outer-most ancestor.
//
// @param {module:engine/model/node~Node} startingNode
// @param {module:engine/model/schema~Schema} schema
// @param {String} expandToDirection Direction of expansion - either 'start' or 'end' of the range.
// @returns {module:engine/model/node~Node}
function findOutermostLimitAncestor( startingNode, schema ) {
	let isLimitNode = startingNode;
	let parent = isLimitNode;

	// Find outer most isLimit block as such blocks might be nested (ie. in tables).
	while ( schema.isLimit( parent ) && parent.parent ) {
		isLimitNode = parent;
		parent = parent.parent;
	}

	return isLimitNode;
}

// Checks whether any of range boundaries is placed around non-limit elements.
//
// @param {module:engine/model/position~Position} start
// @param {module:engine/model/position~Position} end
// @param {module:engine/model/schema~Schema} schema
// @returns {Boolean}
function checkSelectionOnNonLimitElements( start, end, schema ) {
	const startIsOnBlock = ( start.nodeAfter && !schema.isLimit( start.nodeAfter ) ) || schema.checkChild( start, '$text' );
	const endIsOnBlock = ( end.nodeBefore && !schema.isLimit( end.nodeBefore ) ) || schema.checkChild( end, '$text' );

	// We should fix such selection when one of those nodes needs fixing.
	return startIsOnBlock || endIsOnBlock;
}

// Checks if node exists and if it's an object.
//
// @param {module:engine/model/node~Node} node
// @param {module:engine/model/schema~Schema} schema
// @returns {Boolean}
function isInObject( node, schema ) {
	return node && schema.isObject( node );
}

