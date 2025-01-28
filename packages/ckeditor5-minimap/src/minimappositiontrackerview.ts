/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module minimap/minimappositiontrackerview
 */

import { View } from 'ckeditor5/src/ui.js';
import { toUnit, global, type Locale } from 'ckeditor5/src/utils.js';
import type { MinimapDragEvent } from './minimapview.js';

const toPx = /* #__PURE__ */ toUnit( 'px' );

/**
 * The position tracker visualizing the visible subset of the content. Displayed over the minimap.
 *
 * @internal
 */
export default class MinimapPositionTrackerView extends View {
	/**
	 * The CSS `height` of the tracker visualizing the subset of the content visible to the user.
	 *
	 * @readonly
	 */
	declare public height: number;

	/**
	 * The CSS `top` of the tracker, used to move it vertically over the minimap.
	 *
	 * @readonly
	 */
	declare public top: number;

	/**
	 * The scroll progress (in %) displayed over the tracker when being dragged by the user.
	 *
	 * @readonly
	 */
	declare public scrollProgress: number;

	/**
	 * Indicates whether the tracker is being dragged by the user (e.g. using the mouse).
	 *
	 * @internal
	 * @readonly
	 */
	declare public _isDragging: boolean;

	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'height', 0 );
		this.set( 'top', 0 );
		this.set( 'scrollProgress', 0 );
		this.set( '_isDragging', false );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-minimap__position-tracker',
					bind.if( '_isDragging', 'ck-minimap__position-tracker_dragging' )
				],
				style: {
					top: bind.to( 'top', top => toPx( top ) ),
					height: bind.to( 'height', height => toPx( height ) )
				},
				'data-progress': bind.to( 'scrollProgress' )
			},
			on: {
				mousedown: bind.to( () => {
					this._isDragging = true;
				} )
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.listenTo( global.document, 'mousemove', ( evt, data ) => {
			if ( !this._isDragging ) {
				return;
			}

			this.fire<MinimapDragEvent>( 'drag', data.movementY );
		}, { useCapture: true } );

		this.listenTo( global.document, 'mouseup', () => {
			this._isDragging = false;
		}, { useCapture: true } );
	}

	/**
	 * Sets the new height of the tracker to visualize the subset of the content visible to the user.
	 */
	public setHeight( newHeight: number ): void {
		this.height = newHeight;
	}

	/**
	 * Sets the top offset of the tracker to move it around vertically.
	 */
	public setTopOffset( newOffset: number ): void {
		this.top = newOffset;
	}

	/**
	 * Sets the scroll progress (in %) to inform the user using a label when the tracker is being dragged.
	 */
	public setScrollProgress( newProgress: number ): void {
		this.scrollProgress = newProgress;
	}
}
