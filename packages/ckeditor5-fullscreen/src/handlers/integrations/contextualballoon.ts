/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/integrations/contextualballoon
 */

import { Rect, type GetCallback, type PositioningFunction } from '@ckeditor/ckeditor5-utils';
import type { Editor } from '@ckeditor/ckeditor5-core';
import {
	BalloonPanelView,
	type ContextualBalloon,
	type ContextualBalloonGetPositionOptionsEvent
} from '@ckeditor/ckeditor5-ui';

/**
 * Registers a `getPositionOptions` correction on the ContextualBalloon plugin so that
 * balloons are offset below the fullscreen toolbar and menu bar.
 */
export function registerFullscreenBalloonOffsetCorrection( editor: Editor, wrapper: HTMLElement ): () => void {
	if ( !editor.plugins.has( 'ContextualBalloon' ) ) {
		return () => {};
	}

	const contextualBalloon = editor.plugins.get( 'ContextualBalloon' ) as ContextualBalloon;
	const fullscreenStickyNorth = createFullscreenStickyNorthPosition( wrapper );

	const listener: GetCallback<ContextualBalloonGetPositionOptionsEvent> = evt => {
		const result = evt.return;

		if ( !result?.positions?.includes( BalloonPanelView.defaultPositions.viewportStickyNorth ) ) {
			return;
		}

		const topBarHeight = getFullscreenTopBarHeight( wrapper );

		if ( !topBarHeight ) {
			return;
		}

		const viewportOffsetConfig = { ...result.viewportOffsetConfig };

		evt.return = {
			...result,
			positions: [
				...result.positions,
				fullscreenStickyNorth
			],
			viewportOffsetConfig: {
				...viewportOffsetConfig,
				top: ( viewportOffsetConfig.top || 0 ) + topBarHeight
			}
		};
	};

	contextualBalloon.on<ContextualBalloonGetPositionOptionsEvent>( 'getPositionOptions', listener, { priority: 'low' } );

	if ( contextualBalloon.visibleView ) {
		contextualBalloon.updatePosition();
	}

	return () => {
		contextualBalloon.off( 'getPositionOptions', listener );

		if ( contextualBalloon.visibleView ) {
			contextualBalloon.updatePosition();
		}
	};
}

/**
 * A drop-in replacement for `BalloonPanelView.defaultPositions.viewportStickyNorth` for fullscreen mode.
 *
 * The original uses `document.body` as the scrollable boundary. In fullscreen the editor sits in a
 * `position: fixed` wrapper that is removed from normal document flow, so the body may shrink to just
 * a few pixels - less than the toolbar height. When that happens the body no longer intersects the
 * constrained viewport and the function returns `null`, causing the balloon to fall back to a position
 * that overlaps the toolbar.
 */
function createFullscreenStickyNorthPosition( wrapper: HTMLElement ): PositioningFunction {
	const { stickyVerticalOffset } = BalloonPanelView;

	return ( targetRect, balloonRect, viewportRect ) => {
		const boundaryRect = new Rect( wrapper ).getIntersection( viewportRect.getVisible()! );

		if ( !boundaryRect ) {
			return null;
		}

		const visibleBoundaryRect = boundaryRect.getVisible()!;

		// Check if the target is in the boundary.
		if ( !targetRect.getIntersection( visibleBoundaryRect ) ) {
			return null;
		}

		// Checks if there is enough space to put the balloon on the top or bottom of the target.
		// If not, makes the balloon sticky.
		if ( !(
			visibleBoundaryRect.top - targetRect.top - stickyVerticalOffset < balloonRect.height &&
			visibleBoundaryRect.bottom - targetRect.bottom < balloonRect.height
		) ) {
			return null;
		}

		return {
			top: visibleBoundaryRect.top + stickyVerticalOffset,
			left: targetRect.left + targetRect.width / 2 - balloonRect.width / 2,
			name: 'arrowless',
			config: {
				withArrow: false
			}
		};
	};
}

/**
 * Returns the combined height of the toolbar and menu-bar slots inside the fullscreen wrapper.
 */
function getFullscreenTopBarHeight( wrapper: HTMLElement ): number {
	const toolbarSlot = wrapper.querySelector<HTMLElement>( '[data-ck-fullscreen="toolbar"]' );
	const menuBarSlot = wrapper.querySelector<HTMLElement>( '[data-ck-fullscreen="menu-bar"]' );

	return (
		( toolbarSlot ? new Rect( toolbarSlot ).height : 0 ) +
		( menuBarSlot ? new Rect( menuBarSlot ).height : 0 )
	);
}
