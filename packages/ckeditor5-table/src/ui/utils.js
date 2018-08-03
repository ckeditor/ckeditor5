/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/ui/utils
 */

import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import { findAncestor } from '../commands/utils';

/**
 * A helper utility that positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} instance
 * with respect to the table in the editor content, if one is selected.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export function repositionContextualBalloon( editor ) {
	const balloon = editor.plugins.get( 'ContextualBalloon' );

	balloon.updatePosition( getBalloonPositionData( editor ) );
}

/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected element in the editor content.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @returns {module:utils/dom/position~Options}
 */
export function getBalloonPositionData( editor ) {
	const editingView = editor.editing.view;
	const defaultPositions = BalloonPanelView.defaultPositions;
	const viewSelection = editingView.document.selection;

	const parentTable = findAncestor( 'table', viewSelection.getFirstPosition() );

	return {
		target: editingView.domConverter.viewToDom( parentTable ),
		positions: [
			defaultPositions.northArrowSouth,
			defaultPositions.northArrowSouthWest,
			defaultPositions.northArrowSouthEast,
			defaultPositions.southArrowNorth,
			defaultPositions.southArrowNorthWest,
			defaultPositions.southArrowNorthEast
		]
	};
}
