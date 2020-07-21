/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/utils/ui/contextualballoon
 */

import { centeredBalloonPositionForLongWidgets } from '@ckeditor/ckeditor5-widget/src/utils';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import { getTableWidgetAncestor } from './widget';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';

const DEFAULT_BALLOON_POSITIONS = BalloonPanelView.defaultPositions;

const BALLOON_POSITIONS = [
	DEFAULT_BALLOON_POSITIONS.northArrowSouth,
	DEFAULT_BALLOON_POSITIONS.northArrowSouthWest,
	DEFAULT_BALLOON_POSITIONS.northArrowSouthEast,
	DEFAULT_BALLOON_POSITIONS.southArrowNorth,
	DEFAULT_BALLOON_POSITIONS.southArrowNorthWest,
	DEFAULT_BALLOON_POSITIONS.southArrowNorthEast
];

const TABLE_PROPERTIES_BALLOON_POSITIONS = [
	...BALLOON_POSITIONS,
	centeredBalloonPositionForLongWidgets
];

/**
 * A helper utility that positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} instance
 * with respect to the table in the editor content, if one is selected.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @param {String} target Either "cell" or "table". Determines the target the balloon will
 * be attached to.
 */
export function repositionContextualBalloon( editor, target ) {
	const balloon = editor.plugins.get( 'ContextualBalloon' );

	if ( getTableWidgetAncestor( editor.editing.view.document.selection ) ) {
		let position;

		if ( target === 'cell' ) {
			position = getBalloonCellPositionData( editor );
		} else {
			position = getBalloonTablePositionData( editor );
		}

		balloon.updatePosition( position );
	}
}

/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected table in the editor content.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @returns {module:utils/dom/position~Options}
 */
export function getBalloonTablePositionData( editor ) {
	const firstPosition = editor.model.document.selection.getFirstPosition();
	const modelTable = firstPosition.findAncestor( 'table' );
	const viewTable = editor.editing.mapper.toViewElement( modelTable );

	return {
		target: editor.editing.view.domConverter.viewToDom( viewTable ),
		positions: TABLE_PROPERTIES_BALLOON_POSITIONS
	};
}

/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected table cell in the editor content.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @returns {module:utils/dom/position~Options}
 */
export function getBalloonCellPositionData( editor ) {
	const mapper = editor.editing.mapper;
	const domConverter = editor.editing.view.domConverter;
	const selection = editor.model.document.selection;

	if ( selection.rangeCount > 1 ) {
		return {
			target: () => createBoundingRect( selection.getRanges(), modelRange => {
				const modelTableCell = getTableCellAtPosition( modelRange.start );
				const viewTableCell = mapper.toViewElement( modelTableCell );
				return new Rect( domConverter.viewToDom( viewTableCell ) );
			} ),
			positions: BALLOON_POSITIONS
		};
	}

	const modelTableCell = getTableCellAtPosition( selection.getFirstPosition() );
	const viewTableCell = mapper.toViewElement( modelTableCell );

	return {
		target: domConverter.viewToDom( viewTableCell ),
		positions: BALLOON_POSITIONS
	};
}

// Returns the first selected table cell from a multi-cell or in-cell selection.
//
// @param {module:engine/model/position~Position} position Document position.
// @returns {module:engine/model/element~Element}
function getTableCellAtPosition( position ) {
	const isTableCellSelected = position.nodeAfter && position.nodeAfter.is( 'element', 'tableCell' );

	return isTableCellSelected ? position.nodeAfter : position.findAncestor( 'tableCell' );
}

// Returns bounding rect for list of rects.
//
// @param {Array.<module:utils/dom/rect~Rect>|Array.<*>} list List of `Rect`s or any list to map by `mapFn`.
// @param {Function} mapFn Mapping function for list elements.
// @returns {module:utils/dom/rect~Rect}
function createBoundingRect( list, mapFn ) {
	const rectData = {
		left: Number.POSITIVE_INFINITY,
		top: Number.POSITIVE_INFINITY,
		right: Number.NEGATIVE_INFINITY,
		bottom: Number.NEGATIVE_INFINITY
	};

	for ( const item of list ) {
		const rect = mapFn( item );

		rectData.left = Math.min( rectData.left, rect.left );
		rectData.top = Math.min( rectData.top, rect.top );
		rectData.right = Math.max( rectData.right, rect.right );
		rectData.bottom = Math.max( rectData.bottom, rect.bottom );
	}

	rectData.width = rectData.right - rectData.left;
	rectData.height = rectData.bottom - rectData.top;

	return new Rect( rectData );
}
