/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/image/ui/utils
 */

import type { DomOptimalPositionOptions } from '@ckeditor/ckeditor5-utils';
import type { Editor } from '@ckeditor/ckeditor5-core';
import { BalloonPanelView, type ContextualBalloon } from '@ckeditor/ckeditor5-ui';

import { type ImageUtils } from '../../imageutils.js';

/**
 * A helper utility that positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} instance
 * with respect to the image in the editor content, if one is selected.
 *
 * @param editor The editor instance.
 * @internal
 */
export function repositionContextualBalloon( editor: Editor ): void {
	const balloon: ContextualBalloon = editor.plugins.get( 'ContextualBalloon' );
	const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

	if ( imageUtils.getClosestSelectedImageWidget( editor.editing.view.document.selection ) ) {
		const position = getBalloonPositionData( editor );

		balloon.updatePosition( position );
	}
}

/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected element in the editor content.
 *
 * @param editor The editor instance.
 * @internal
 */
export function getBalloonPositionData( editor: Editor ): Partial<DomOptimalPositionOptions> {
	const editingView = editor.editing.view;
	const defaultPositions = BalloonPanelView.defaultPositions;
	const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

	return {
		target: editingView.domConverter.mapViewToDom(
			imageUtils.getClosestSelectedImageWidget( editingView.document.selection )!
		) as HTMLElement,
		positions: [
			// Prefer centering the balloon on the image (unchanged for centered or inline images).
			defaultPositions.northArrowSouth,
			// When centering would overflow the editable (e.g. a left- or right-aligned image that
			// leaves little room on one side), hug the image's near edge instead of drifting toward
			// the editable center: its left edge for left-aligned images, its right edge for
			// right-aligned ones. `getOptimalPosition` picks the first candidate that fully fits, so
			// it self-selects the correct side based on where the image sits.
			defaultPositions.northWestArrowSouthWest,
			defaultPositions.northEastArrowSouthEast,
			// The same set, below the image.
			defaultPositions.southArrowNorth,
			defaultPositions.southWestArrowNorthWest,
			defaultPositions.southEastArrowNorthEast,
			defaultPositions.viewportStickyNorth
		]
	};
}
