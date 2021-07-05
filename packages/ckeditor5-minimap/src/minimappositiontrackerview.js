/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

/**
 * @module TODO
 */

import { View } from 'ckeditor5/src/ui';
import { toUnit } from 'ckeditor5/src/utils';

const toPx = toUnit( 'px' );

/**
 * TODO
 */
export default class MinimapPositionTrackerView extends View {
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * TODO
		 */
		this.set( 'height', 0 );

		/**
		 * TODO
		 */
		this.set( 'top', 0 );

		/**
		 * TODO
		 */
		this.set( 'scrollProgress', 0 );

		/**
		 * TODO
		 *
		 * @private
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
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.listenTo( document, 'mousemove', ( evt, data ) => {
			if ( !this._isDragging ) {
				return;
			}

			this.fire( 'drag', data.movementY );
		}, { useCapture: true } );

		this.listenTo( document, 'mouseup', () => {
			this._isDragging = false;
		}, { useCapture: true } );
	}

	/**
	 * TODO
	 *
	 * @param {*} newHeight
	 */
	setHeight( newHeight ) {
		this.height = newHeight;
	}

	/**
	 * TODO
	 *
	 * @param {*} newOffset
	 */
	setTopOffset( newOffset ) {
		this.top = newOffset;
	}

	/**
	 * TODO
	 *
	 * @param {*} newProgress
	 */
	setScrollProgress( newProgress ) {
		this.scrollProgress = newProgress;
	}
}
