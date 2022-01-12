/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

/**
 * @module widget/verticalnavigationhandler
 */

/**
 * Returns 'keydown' handler for up/down arrow keys that modifies the caret movement if it's in a text line next to an object.
 *
 * @param {module:engine/controller/editingcontroller~EditingController} editing The editing controller.
 * @returns {Function}
 */
export default function verticalNavigationHandler( editing ) {
	const model = editing.model;

	return ( evt, data ) => {
		const arrowUpPressed = data.keyCode == keyCodes.arrowup;
		const arrowDownPressed = data.keyCode == keyCodes.arrowdown;
		const expandSelection = data.shiftKey;
		const selection = model.document.selection;

		if ( !arrowUpPressed && !arrowDownPressed ) {
			return;
		}

		const isForward = arrowDownPressed;

		// Navigation is in the opposite direction than the selection direction so this is shrinking of the selection.
		// Selection for sure will not approach any object.
		if ( expandSelection && selectionWillShrink( selection, isForward ) ) {
			return;
		}

		// Find a range between selection and closest limit element.
		const range = findTextRangeFromSelection( editing, selection, isForward );

		// There is no selection position inside the limit element.
		if ( !range ) {
			return;
		}

		// If already at the edge of a limit element.
		if ( range.isCollapsed ) {
			// A collapsed selection at limit edge - nothing more to do.
			if ( selection.isCollapsed ) {
				return;
			}

			// A non collapsed selection is at the limit edge while expanding the selection - let others do their stuff.
			else if ( expandSelection ) {
				return;
			}
		}

		// If the range is a single line (there is no word wrapping) then move the selection to the position closest to the limit element.
		//
		// We can't move the selection directly to the isObject element (eg. table cell) because of dual position at the end/beginning
		// of wrapped line (it's at the same time at the end of one line and at the start of the next line).
		if ( range.isCollapsed || isSingleLineRange( editing, range, isForward ) ) {
			model.change( writer => {
				const newPosition = isForward ? range.end : range.start;

				if ( expandSelection ) {
					const newSelection = model.createSelection( selection.anchor );
					newSelection.setFocus( newPosition );

					writer.setSelection( newSelection );
				} else {
					writer.setSelection( newPosition );
				}
			} );

			evt.stop();
			data.preventDefault();
			data.stopPropagation();
		}
	};
}

// Finds the range between selection and closest limit element (in the direction of navigation).
// The position next to limit element is adjusted to the closest allowed `$text` position.
//
// Returns `null` if, according to the schema, the resulting range cannot contain a `$text` element.
//
// @param {module:engine/controller/editingcontroller~EditingController} editing The editing controller.
// @param {module:engine/model/selection~Selection} selection The current selection.
// @param {Boolean} isForward The expected navigation direction.
// @returns {module:engine/model/range~Range|null}
//
function findTextRangeFromSelection( editing, selection, isForward ) {
	const model = editing.model;

	if ( isForward ) {
		const startPosition = selection.isCollapsed ? selection.focus : selection.getLastPosition();
		const endPosition = getNearestNonInlineLimit( model, startPosition, 'forward' );

		// There is no limit element, browser should handle this.
		if ( !endPosition ) {
			return null;
		}

		const range = model.createRange( startPosition, endPosition );
		const lastRangePosition = getNearestTextPosition( model.schema, range, 'backward' );

		if ( lastRangePosition ) {
			return model.createRange( startPosition, lastRangePosition );
		}

		return null;
	} else {
		const endPosition = selection.isCollapsed ? selection.focus : selection.getFirstPosition();
		const startPosition = getNearestNonInlineLimit( model, endPosition, 'backward' );

		// There is no limit element, browser should handle this.
		if ( !startPosition ) {
			return null;
		}

		const range = model.createRange( startPosition, endPosition );
		const firstRangePosition = getNearestTextPosition( model.schema, range, 'forward' );

		if ( firstRangePosition ) {
			return model.createRange( firstRangePosition, endPosition );
		}

		return null;
	}
}

// Finds the limit element position that is closest to startPosition.
//
// @param {module:engine/model/model~Model} model
// @param {<module:engine/model/position~Position>} startPosition
// @param {'forward'|'backward'} direction Search direction.
// @returns {<module:engine/model/position~Position>|null}
//
function getNearestNonInlineLimit( model, startPosition, direction ) {
	const schema = model.schema;
	const range = model.createRangeIn( startPosition.root );

	const walkerValueType = direction == 'forward' ? 'elementStart' : 'elementEnd';

	for ( const { previousPosition, item, type } of range.getWalker( { startPosition, direction } ) ) {
		if ( schema.isLimit( item ) && !schema.isInline( item ) ) {
			return previousPosition;
		}

		// Stop looking for isLimit element if the next element is a block element (it is for sure not single line).
		if ( type == walkerValueType && schema.isBlock( item ) ) {
			return null;
		}
	}

	return null;
}

// Basing on the provided range, finds the first or last (depending on `direction`) position inside the range
// that can contain `$text` (according to schema).
//
// @param {module:engine/model/schema~Schema} schema The schema.
// @param {module:engine/model/range~Range} range The range to find the position in.
// @param {'forward'|'backward'} direction Search direction.
// @returns {module:engine/model/position~Position|null} The nearest selection position.
//
function getNearestTextPosition( schema, range, direction ) {
	const position = direction == 'backward' ? range.end : range.start;

	if ( schema.checkChild( position, '$text' ) ) {
		return position;
	}

	for ( const { nextPosition } of range.getWalker( { direction } ) ) {
		if ( schema.checkChild( nextPosition, '$text' ) ) {
			return nextPosition;
		}
	}

	return null;
}

// Checks if the DOM range corresponding to the provided model range renders as a single line by analyzing DOMRects
// (verifying if they visually wrap content to the next line).
//
// @param {module:engine/controller/editingcontroller~EditingController} editing The editing controller.
// @param {module:engine/model/range~Range} modelRange The current table cell content range.
// @param {Boolean} isForward The expected navigation direction.
// @returns {Boolean}
//
function isSingleLineRange( editing, modelRange, isForward ) {
	const model = editing.model;
	const domConverter = editing.view.domConverter;

	// Wrapped lines contain exactly the same position at the end of current line
	// and at the beginning of next line. That position's client rect is at the end
	// of current line. In case of caret at first position of the last line that 'dual'
	// position would be detected as it's not the last line.
	if ( isForward ) {
		const probe = model.createSelection( modelRange.start );

		model.modifySelection( probe );

		// If the new position is at the end of the container then we can't use this position
		// because it would provide incorrect result for eg caption of image and selection
		// just before end of it. Also in this case there is no "dual" position.
		if ( !probe.focus.isAtEnd && !modelRange.start.isEqual( probe.focus ) ) {
			modelRange = model.createRange( probe.focus, modelRange.end );
		}
	}

	const viewRange = editing.mapper.toViewRange( modelRange );
	const domRange = domConverter.viewRangeToDom( viewRange );
	const rects = Rect.getDomRangeRects( domRange );

	let boundaryVerticalPosition;

	for ( const rect of rects ) {
		if ( boundaryVerticalPosition === undefined ) {
			boundaryVerticalPosition = Math.round( rect.bottom );
			continue;
		}

		// Let's check if this rect is in new line.
		if ( Math.round( rect.top ) >= boundaryVerticalPosition ) {
			return false;
		}

		boundaryVerticalPosition = Math.max( boundaryVerticalPosition, Math.round( rect.bottom ) );
	}

	return true;
}

function selectionWillShrink( selection, isForward ) {
	return !selection.isCollapsed && selection.isBackward == isForward;
}
