/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import WidgetResize from '../../../src/widgetresize.js';

import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect.js';

export const resizerMouseSimulator = {
	down( editor, domTarget, options = {} ) {
		const preventDefault = options.preventDefault || sinon.spy().named( 'preventDefault' );
		const stop = options.stop || sinon.spy().named( 'stop' );

		this._getPlugin( editor )._mouseDownListener( { stop }, { domTarget, preventDefault } );
	},

	/**
	 * Calls the resizer `mousemove` handler with given parameters.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {HTMLElement} domTarget
	 * @param {Object} [eventData]
	 * @param {Point} [targetPoint] Place where the pointer should be moved to, overrides `eventData.pageX` and `eventData.pageY`.
	 */
	move( editor, domTarget, eventData, targetPoint ) {
		const combinedEventData = Object.assign( {}, eventData, {
			target: domTarget
		} );

		if ( targetPoint ) {
			combinedEventData.pageX = targetPoint.x;
			combinedEventData.pageY = targetPoint.y;
		}

		this._getPlugin( editor )._mouseMoveListener( {}, combinedEventData );
	},
	up( editor ) {
		this._getPlugin( editor )._mouseUpListener();
	},

	/**
	 * Emulates mouse drag gesture by triggering:
	 *
	 * * the `mousedown` event on the `domTarget`,
	 * * the `mousemove` event on `domTarget`, with the pointer coordinates at `position.from`,
	 * * the `mousemove` event on `domTarget`, with the pointer coordinates at `position.to` (fired
	 *	only if `position.to` differs from `position.from`),
	 * * the `mouseup` event.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {HTMLElement} domTarget
	 * @param {Object/Point} position If a `Point` instance is given, the drag is performed without acutal pointer move.
	 * @param {Point} position.from Coordinates of where the drag begins.
	 * @param {Point} position.to Coordinates of where the drag ends.
	 */
	dragTo( editor, domTarget, position ) {
		const fromPosition = position.from || position;
		const finalPosition = position.to || position;

		this.down( editor, domTarget );

		this.move( editor, domTarget, {
			pageX: fromPosition.x,
			pageY: fromPosition.y
		} );

		if ( !finalPosition.equals( fromPosition ) ) {
			this.move( editor, domTarget, {
				pageX: finalPosition.x,
				pageY: finalPosition.y
			} );
		}

		this.up( editor );
	},

	_getPlugin( editor ) {
		return editor.plugins.get( WidgetResize );
	}
};

export function getWidgetDomParts( editor, widget, resizerPosition ) {
	const view = editor.editing.view;
	const domWidget = view.domConverter.mapViewToDom( widget );

	return {
		resizeWrapper: domWidget.querySelector( '.ck-widget__resizer' ),
		resizeHandle: domWidget.querySelector( `.ck-widget__resizer__handle-${ resizerPosition }` ),
		widget: domWidget
	};
}

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

	/**
	 * Checks if two points are equal.
	 *
	 * @param {Point} pointB
	 * @returns {Boolean}
	 */
	equals( pointB ) {
		return pointB.x == this.x && pointB.y == this.y;
	}
}

/**
 * Returns a center point for a given handle.
 *
 * @param {HTMLElement} domWrapper Wrapper of an element that contains the resizer.
 * @param {String} [handlePosition='top-left']
 * @returns {Point}
 */
export function getHandleCenterPoint( domWrapper, handlePosition ) {
	const wrapperRect = new Rect( domWrapper );
	const returnValue = new Point( wrapperRect.left, wrapperRect.top );
	const cornerPositionParts = handlePosition.split( '-' );

	if ( cornerPositionParts.includes( 'right' ) ) {
		returnValue.x = wrapperRect.right;
	}

	if ( cornerPositionParts.includes( 'bottom' ) ) {
		returnValue.y = wrapperRect.bottom;
	}

	return returnValue;
}

export async function focusEditor( editor ) {
	editor.editing.view.focus();
	editor.ui.focusTracker.isFocused = true;

	// It may take some time for DOM to react in Chrome, especially if the focus is somewhere else
	// like in dev tools or the window is blurred. Let's give it that time before proceeding any further.
	// See https://github.com/ckeditor/ckeditor5/issues/8571.
	return new Promise( resolve => {
		setTimeout( () => {
			resolve();
		}, 50 );
	} );
}
