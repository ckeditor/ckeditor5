/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import WidgetResize from '../../../src/widgetresize';

export const mouseMock = {
	down( editor, domTarget ) {
		this._getPlugin( editor )._mouseDownListener( {}, {
			target: domTarget
		} );
	},
	move( editor, domTarget, eventData ) {
		const combinedEventData = Object.assign( {}, eventData, {
			target: domTarget
		} );

		this._getPlugin( editor )._mouseMoveListener( {}, combinedEventData );
	},
	up( editor ) {
		this._getPlugin( editor )._mouseUpListener();
	},

	/**
	 * Emulates mouse drag gesture by triggering:
	 *
	 * * the `mousedown` event on the `domTarget`,
	 * * the `mousemove` event on `domTarget`, with the pointer coordinates at `finalPosition`,
	 * * the `mouseup` event.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {HTMLElement} domTarget
	 * @param {Point} finalPosition
	 */
	dragTo( editor, domTarget, finalPosition ) {
		const moveEventData = {
			pageX: finalPosition.x,
			pageY: finalPosition.y
		};

		this.down( editor, domTarget );
		this.move( editor, domTarget, moveEventData );
		this.up( editor );
	},

	_getPlugin( editor ) {
		return editor.plugins.get( WidgetResize );
	}
};

export class Point {
	constructor( x, y ) {
		this.x = x;
		this.y = y;
	}

	/**
	 * Moves the point by a given `changeX` and `changeY`.
	 *
	 * @param {Number} changeX
	 * @param {Number} changeY
	 * @returns {Point} Returns current instance.
	 */
	moveBy( changeX, changeY ) {
		this.x += changeX;
		this.y += changeY;
		return this;
	}

	/**
	 * @returns {Point}
	 */
	clone() {
		return new Point( this.x, this.y );
	}
}
