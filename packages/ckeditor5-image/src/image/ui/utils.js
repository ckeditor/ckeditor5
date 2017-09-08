/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/image/ui/utils
 */

import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import { isImageWidgetSelected } from '../utils';

/**
 * A helper utility which positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon} instance
 * with respect to the image in the editor content, if one is selected.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export function repositionContextualBalloon( editor ) {
	const balloon = editor.plugins.get( 'ContextualBalloon' );

	if ( isImageWidgetSelected( editor.editing.view.selection ) ) {
		const position = getBalloonPositionData( editor );

		balloon.updatePosition( position );
	}
}

/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}, with respect
 * to the selected element in the editor content.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @returns {module:utils/dom/position~Options}
 */
export function getBalloonPositionData( editor ) {
	const editingView = editor.editing.view;
	const defaultPositions = BalloonPanelView.defaultPositions;

	return {
		target: editingView.domConverter.viewToDom( editingView.selection.getSelectedElement() ),
		positions: [
			defaultPositions.northArrowSouth,
			defaultPositions.southArrowNorth
		]
	};
}
