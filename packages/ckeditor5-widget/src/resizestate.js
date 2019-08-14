/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/resizer
 */
import {
	getAbsoluteBoundaryPoint
} from './utils';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Stores the internal state of a single resizable object.
 *
 * @class ResizeState
 */
export default class ResizeState {
	/**
	 * @param {module:widget/widgetresizer~ResizerOptions} options Resizer options.
	 */
	constructor( options ) {
		/**
		 * The size of resize host before current resize process.
		 *
		 * This information is only known after DOM was rendered, so it will be updated later.
		 *
		 * It contains an object with `width` and `height` properties.
		 *
		 * @type {Object}
		 */
		this.originalSize = null;

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
		 * Width proposed (but not yet accepted) using the widget resizer.
		 *
		 * It goes back to `null` once the resizer is dismissed or accepted.
		 *
		 * @readonly
		 * @observable
		 * @member {Number|null} #proposedWidth
		 */
		this.set( 'proposedWidth', null );

		/**
		 * Height proposed (but not yet accepted) using the widget resizer.
		 *
		 * It goes back to `null` once the resizer is dismissed or accepted.
		 *
		 * @readonly
		 * @observable
		 * @member {Number|null} #proposedHeight
		 */
		this.set( 'proposedHeight', null );

		/**
		 * @private
		 * @type {module:widget/widgetresizer~ResizerOptions}
		 */
		this._options = options;
	}

	/**
	 *
	 * @param {HTMLElement} domResizeHandle The handle used to calculate the reference point.
	 */
	begin( domResizeHandle, resizeHost ) {
		const clientRect = new Rect( resizeHost );

		this.activeHandlePosition = getHandlePosition( domResizeHandle );

		this._referenceCoordinates = getAbsoluteBoundaryPoint( resizeHost, getOppositePosition( this.activeHandlePosition ) );

		this.originalSize = {
			width: clientRect.width,
			height: clientRect.height
		};

		this.aspectRatio = this._options.getAspectRatio ?
			this._options.getAspectRatio( resizeHost ) : clientRect.width / clientRect.height;
	}

	/**
	 * Sets `proposedWidth` / `proposedHeight` properties based on provided element.
	 *
	 * @param {HTMLElement} domElement
	 */
	fetchSizeFromElement( domElement ) {
		const rect = new Rect( domElement );

		this.proposedWidth = rect.width;
		this.proposedHeight = rect.height;
	}

	/**
	 * Method used to calculate the proposed size as the resize handles are dragged.
	 *
	 * @private
	 * @param {Event} domEventData Event data that caused the size update request. It should be used to calculate the proposed size.
	 * @returns {Object} return
	 * @returns {Number} return.x Proposed width.
	 * @returns {Number} return.y Proposed height.
	 */
	proposeNewSize( domEventData ) {
		const currentCoordinates = extractCoordinates( domEventData );
		const isCentered = this._options.isCentered ? this._options.isCentered( this ) : true;
		const originalSize = this.originalSize;

		// Enlargement defines how much the resize host has changed in a given axis. Naturally it could be a negative number
		// meaning that it has been shrunk.
		//
		// +----------------+--+
		// |                |  |
		// |       img      |  |
		// |                |  |
		// +----------------+  | ^
		// |                   | | - enlarge y
		// +-------------------+ v
		// 					<-->
		// 					 enlarge x
		const enlargement = {
			x: this._referenceCoordinates.x - ( currentCoordinates.x + originalSize.width ),
			y: ( currentCoordinates.y - originalSize.height ) - this._referenceCoordinates.y
		};

		if ( isCentered && this.activeHandlePosition.endsWith( '-right' ) ) {
			enlargement.x = currentCoordinates.x - ( this._referenceCoordinates.x + originalSize.width );
		}

		// Objects needs to be resized twice as much in horizontal axis if centered, since enlargement is counted from
		// one resized corner to your cursor. It needs to be duplicated to compensate for the other side too.
		if ( isCentered ) {
			enlargement.x *= 2;
		}

		// const resizeHost = this._getResizeHost();

		// The size proposed by the user. It does not consider the aspect ratio.
		const proposedSize = {
			width: Math.abs( originalSize.width + enlargement.x ),
			height: Math.abs( originalSize.height + enlargement.y )
		};

		// Dominant determination must take the ratio into account.
		proposedSize.dominant = proposedSize.width / this.aspectRatio > proposedSize.height ? 'width' : 'height';
		proposedSize.max = proposedSize[ proposedSize.dominant ];

		// Proposed size, respecting the aspect ratio.
		const targetSize = {
			width: proposedSize.width,
			height: proposedSize.height
		};

		if ( proposedSize.dominant == 'width' ) {
			targetSize.height = targetSize.width / this.aspectRatio;
		} else {
			targetSize.width = targetSize.height * this.aspectRatio;
		}

		// resizeHost.style.width = `${ targetSize.width }px`;

		return targetSize;
	}
}

/**
 * @param {String} resizerPosition Expected resizer position like `"top-left"`, `"bottom-right"`.
 * @returns {String} A prefixed HTML class name for the resizer element
 * @private
 */
function getResizerClass( resizerPosition ) {
	return `ck-widget__resizer-${ resizerPosition }`;
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
		if ( domHandle.classList.contains( getResizerClass( position ) ) ) {
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

function extractCoordinates( event ) {
	return {
		x: event.pageX,
		y: event.pageY
	};
}

mix( ResizeState, ObservableMixin );
