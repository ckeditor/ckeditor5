/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgetresize/resizerstate
 */

import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Stores the internal state of a single resizable object.
 *
 */
export default class ResizeState {
	/**
	 * @param {module:widget/widgetresize~ResizerOptions} options Resizer options.
	 */
	constructor( options ) {
		/**
		 * TODO
		 *
		 * @readonly
		 * @member {Number} #originalWidth
		 */

		/**
		 * TODO
		 *
		 * @readonly
		 * @member {Number} #originalHeight
		 */

		/**
		 * TODO
		 *
		 * @readonly
		 * @member {Number} #originalWidthPercents
		 */

		/**
		 * Position of the handle that has initiated the resizing. E.g. `"top-left"`, `"bottom-right"` etc or `null`
		 * if unknown.
		 *
		 * @readonly
		 * @observable
		 * @member {String|null} #activeHandlePosition
		 */
		this.set( 'activeHandlePosition', null );

		/**
		 * TODO
		 *
		 * @readonly
		 * @observable
		 * @member {Number|null} #proposedWidthPercents
		 */
		this.set( 'proposedWidthPercents', null );

		/**
		 * TODO
		 *
		 * @readonly
		 * @observable
		 * @member {Number|null} #proposedWidthPixels
		 */
		this.set( 'proposedWidth', null );

		/**
		 * TODO
		 *
		 * @readonly
		 * @observable
		 * @member {Number|null} #proposedHeightPixels
		 */
		this.set( 'proposedHeight', null );

		this.set( 'proposedHandleHostWidth', null );
		this.set( 'proposedHandleHostHeight', null );

		/**
		 * TODO
		 *
		 * @readonly
		 * @member {Number} #aspectRatio
		 */

		/**
		 * @private
		 * @type {module:widget/widgetresize~ResizerOptions}
		 */
		this._options = options;

		/**
		 * Reference point of resizer where the dragging started. It is used to measure the distance to user cursor
		 * traveled, thus how much the image should be enlarged.
		 * This information is only known after DOM was rendered, so it will be updated later.
		 *
		 * @private
		 * @type {Object}
		 */
		this._referenceCoordinates = null;
	}

	/**
	 *
	 * @param {HTMLElement} domResizeHandle The handle used to calculate the reference point.
	 * @param {HTMLElement} domHandleHost
	 * @param {HTMLElement} domResizeHost
	 */
	begin( domResizeHandle, domHandleHost, domResizeHost ) {
		const clientRect = new Rect( domHandleHost );

		this.activeHandlePosition = getHandlePosition( domResizeHandle );

		this._referenceCoordinates = getAbsoluteBoundaryPoint( domHandleHost, getOppositePosition( this.activeHandlePosition ) );

		this.originalWidth = clientRect.width;
		this.originalHeight = clientRect.height;

		this.aspectRatio = clientRect.width / clientRect.height;

		const widthStyle = domResizeHost.style.width;

		if ( widthStyle ) {
			if ( widthStyle.match( /^\d+\.?\d*%$/ ) ) {
				this.originalWidthPercents = parseFloat( widthStyle );
			} else {
				// TODO we need to check it via comparing to the parent's width.
				this.originalWidthPercents = 50;
			}
		} else {
			this.originalWidthPercents = 100;
		}
	}

	update( newSize ) {
		this.proposedWidth = newSize.width;
		this.proposedHeight = newSize.height;
		this.proposedWidthPercents = newSize.widthPercents;

		this.proposedHandleHostWidth = newSize.handleHostWidth;
		this.proposedHandleHostHeight = newSize.handleHostHeight;
	}
}

mix( ResizeState, ObservableMixin );

/**
 * Returns coordinates of top-left corner of a element, relative to the document's top-left corner.
 *
 * @private
 * @param {HTMLElement} element
 * @param {String} resizerPosition Position of the resize handler, e.g. `"top-left"`, `"bottom-right"`.
 * @returns {Object} return
 * @returns {Number} return.x
 * @returns {Number} return.y
 */
function getAbsoluteBoundaryPoint( element, resizerPosition ) {
	const elementRect = new Rect( element );
	const positionParts = resizerPosition.split( '-' );
	const ret = {
		x: positionParts[ 1 ] == 'right' ? elementRect.right : elementRect.left,
		y: positionParts[ 0 ] == 'bottom' ? elementRect.bottom : elementRect.top
	};

	ret.x += element.ownerDocument.defaultView.scrollX;
	ret.y += element.ownerDocument.defaultView.scrollY;

	return ret;
}

/**
 * @private
 * @param {String} resizerPosition Expected resizer position like `"top-left"`, `"bottom-right"`.
 * @returns {String} A prefixed HTML class name for the resizer element
 */
function getResizerHandleClass( resizerPosition ) {
	return `ck-widget__resizer__handle-${ resizerPosition }`;
}

/**
 * Determines the position of a given resize handle.
 *
 * @private
 * @param {HTMLElement} domHandle Handler used to calculate reference point.
 * @returns {String|undefined} Returns a string like `"top-left"` or `undefined` if not matched.
 */
function getHandlePosition( domHandle ) {
	const resizerPositions = [ 'top-left', 'top-right', 'bottom-right', 'bottom-left' ];

	for ( const position of resizerPositions ) {
		if ( domHandle.classList.contains( getResizerHandleClass( position ) ) ) {
			return position;
		}
	}
}

/**
 * @param {String} position Like `"top-left"`.
 * @returns {String} Inverted `position`, e.g. returns `"bottom-right"` if `"top-left"` was given as `position`.
 */
function getOppositePosition( position ) {
	const parts = position.split( '-' );
	const replacements = {
		top: 'bottom',
		bottom: 'top',
		left: 'right',
		right: 'left'
	};

	return `${ replacements[ parts[ 0 ] ] }-${ replacements[ parts[ 1 ] ] }`;
}
