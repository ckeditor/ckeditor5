/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

/**
 * @module widget/verticalnavigationhandler
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

		const range = findTextRangeFromSelection( model, editing.mapper, selection, arrowDownPressed );

		if ( !range || range.start.isTouching( range.end ) ) {
			return;
		}

		if ( isSingleLineRange( model, editing, range, arrowDownPressed ) ) {
			model.change( writer => {
				const newPosition = arrowDownPressed ? range.end : range.start;

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

function findTextRangeFromSelection( model, mapper, selection, isForward ) {
	const schema = model.schema;

	if ( isForward ) {
		const startPosition = selection.isCollapsed ? selection.focus : selection.getLastPosition();
		const endPosition = getNearestNonInlineLimit( model, startPosition, 'forward' );

		const range = model.createRange( startPosition, endPosition );
		const lastRangePosition = getNearestVisibleTextPosition( schema, mapper, range, 'backward' );

		if ( lastRangePosition && startPosition.isBefore( lastRangePosition ) ) {
			return model.createRange( startPosition, lastRangePosition );
		}

		return null;
	} else {
		const endPosition = selection.isCollapsed ? selection.focus : selection.getFirstPosition();
		const startPosition = getNearestNonInlineLimit( model, endPosition, 'backward' );

		const range = model.createRange( startPosition, endPosition );
		const firstRangePosition = getNearestVisibleTextPosition( schema, mapper, range, 'forward' );

		if ( firstRangePosition && endPosition.isAfter( firstRangePosition ) ) {
			return model.createRange( firstRangePosition, endPosition );
		}

		return null;
	}
}

function getNearestNonInlineLimit( model, startPosition, direction ) {
	const schema = model.schema;
	const range = model.createRangeIn( startPosition.root );

	for ( const { previousPosition, item } of range.getWalker( { startPosition, direction } ) ) {
		if ( schema.isLimit( item ) && !schema.isInline( item ) ) {
			return previousPosition;
		}
	}

	return direction == 'forward' ? range.end : range.start;
}

function getNearestVisibleTextPosition( schema, mapper, range, direction ) {
	const position = direction == 'backward' ? range.end : range.start;

	if ( schema.checkChild( position, '$text' ) ) {
		return position;
	}

	for ( const { nextPosition } of range.getWalker( { direction } ) ) {
		if ( schema.checkChild( nextPosition, '$text' ) ) {
			const viewElement = mapper.toViewElement( nextPosition.parent );

			if ( viewElement && !viewElement.hasClass( 'ck-hidden' ) ) {
				return nextPosition;
			}
		}
	}
}

function isSingleLineRange( model, editing, modelRange, isForward ) {
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
