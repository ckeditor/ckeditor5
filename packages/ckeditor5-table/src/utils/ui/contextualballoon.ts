/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/utils/ui/contextualballoon
 */

import { Rect, type PositionOptions } from 'ckeditor5/src/utils.js';
import { BalloonPanelView, type ContextualBalloon } from 'ckeditor5/src/ui.js';
import type { Editor } from 'ckeditor5/src/core.js';
import type { Element, Position, Range } from 'ckeditor5/src/engine.js';

import { getSelectionAffectedTableWidget, getTableWidgetAncestor } from './widget.js';
import { getSelectionAffectedTable } from '../common.js';

const BALLOON_POSITIONS = /* #__PURE__ */ ( () => [
	BalloonPanelView.defaultPositions.northArrowSouth,
	BalloonPanelView.defaultPositions.northArrowSouthWest,
	BalloonPanelView.defaultPositions.northArrowSouthEast,
	BalloonPanelView.defaultPositions.southArrowNorth,
	BalloonPanelView.defaultPositions.southArrowNorthWest,
	BalloonPanelView.defaultPositions.southArrowNorthEast,
	BalloonPanelView.defaultPositions.viewportStickyNorth
] )();

/**
 * A helper utility that positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} instance
 * with respect to the table in the editor content, if one is selected.
 *
 * @param editor The editor instance.
 * @param target Either "cell" or "table". Determines the target the balloon will be attached to.
 */
export function repositionContextualBalloon( editor: Editor, target: string ): void {
	const balloon: ContextualBalloon = editor.plugins.get( 'ContextualBalloon' );
	const selection = editor.editing.view.document.selection;
	let position;

	if ( target === 'cell' ) {
		if ( getTableWidgetAncestor( selection ) ) {
			position = getBalloonCellPositionData( editor );
		}
	}
	else if ( getSelectionAffectedTableWidget( selection ) ) {
		position = getBalloonTablePositionData( editor );
	}

	if ( position ) {
		balloon.updatePosition( position );
	}
}

/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected table in the editor content.
 *
 * @param editor The editor instance.
 */
export function getBalloonTablePositionData( editor: Editor ): Partial<PositionOptions> {
	const selection = editor.model.document.selection;
	const modelTable = getSelectionAffectedTable( selection );
	const viewTable = editor.editing.mapper.toViewElement( modelTable )!;

	return {
		target: editor.editing.view.domConverter.mapViewToDom( viewTable )!,
		positions: BALLOON_POSITIONS
	};
}

/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected table cell in the editor content.
 *
 * @param editor The editor instance.
 */
export function getBalloonCellPositionData( editor: Editor ): Partial<PositionOptions> {
	const mapper = editor.editing.mapper;
	const domConverter = editor.editing.view.domConverter;
	const selection = editor.model.document.selection;

	if ( selection.rangeCount > 1 ) {
		return {
			target: () => createBoundingRect( selection.getRanges(), editor ),
			positions: BALLOON_POSITIONS
		};
	}

	const modelTableCell = getTableCellAtPosition( selection.getFirstPosition()! );
	const viewTableCell = mapper.toViewElement( modelTableCell )!;

	return {
		target: domConverter.mapViewToDom( viewTableCell ),
		positions: BALLOON_POSITIONS
	};
}

/**
 * Returns the first selected table cell from a multi-cell or in-cell selection.
 *
 * @param position Document position.
 */
function getTableCellAtPosition( position: Position ): Element {
	const isTableCellSelected = position.nodeAfter && position.nodeAfter.is( 'element', 'tableCell' );

	return isTableCellSelected ? position.nodeAfter : position.findAncestor( 'tableCell' )!;
}

/**
 * Returns bounding rectangle for given model ranges.
 *
 * @param ranges Model ranges that the bounding rect should be returned for.
 * @param editor The editor instance.
 */
function createBoundingRect( ranges: Iterable<Range>, editor: Editor ): Rect {
	const mapper = editor.editing.mapper;
	const domConverter = editor.editing.view.domConverter;
	const rects = Array.from( ranges ).map( range => {
		const modelTableCell = getTableCellAtPosition( range.start );
		const viewTableCell = mapper.toViewElement( modelTableCell )!;
		return new Rect( domConverter.mapViewToDom( viewTableCell )! );
	} );

	return Rect.getBoundingRect( rects )!;
}
