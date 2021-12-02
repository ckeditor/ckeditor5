/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module minimap/minimappositiontrackerview
 */

import { View } from 'ckeditor5/src/ui';
import { toUnit, global } from 'ckeditor5/src/utils';

const toPx = toUnit( 'px' );

/**
 * The position tracker visualizing the visible subset of the content. Displayed over the minimap.
 *
 * @private
 * @extends module:ui/view~View
 */
export default class MinimapPositionTrackerView extends View {
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * The CSS `height` of the tracker visualizing the subset of the content visible to the user.
		 *
		 * @readonly
		 * @member {Number} #height
		 */
		this.set( 'height', 0 );

		/**
		 * The CSS `top` of the tracker, used to move it vertically over the minimap.
		 *
		 * @readonly
		 * @member {Number} #top
		 */
		this.set( 'top', 0 );

		/**
		 * The scroll progress (in %) displayed over the tracker when being dragged by the user.
		 *
		 * @readonly
		 * @member {Number} #scrollProgress
		 */
		this.set( 'scrollProgress', 0 );

		/**
		 * Indicates whether the tracker is being dragged by the user (e.g. using the mouse).
		 *
		 * @private
		 * @readonly
		 * @member {Boolean} #_isDragging
		 */
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

		/**
		 * Fired when the position tracker is dragged.
		 *
		 * @event drag
		 * @param {Number} movementY The vertical movement of the tracker as a result of dragging.
		 */
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.listenTo( global.document, 'mousemove', ( evt, data ) => {
			if ( !this._isDragging ) {
				return;
			}

			this.fire( 'drag', data.movementY );
		}, { useCapture: true } );

		this.listenTo( global.document, 'mouseup', () => {
			this._isDragging = false;
		}, { useCapture: true } );
	}

	/**
	 * Sets the new height of the tracker to visualize the subset of the content visible to the user.
	 *
	 * @param {Number} newHeight
	 */
	setHeight( newHeight ) {
		this.height = newHeight;
	}

	/**
	 * Sets the top offset of the tracker to move it around vertically.
	 *
	 * @param {Number} newOffset
	 */
	setTopOffset( newOffset ) {
		this.top = newOffset;
	}

	/**
	 * Sets the scroll progress (in %) to inform the user using a label when the tracker is being dragged.
	 *
	 * @param {Number} newProgress
	 */
	setScrollProgress( newProgress ) {
		this.scrollProgress = newProgress;
	}
}
