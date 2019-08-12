import {
	getAbsoluteBoundaryPoint
} from './utils';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

/**
 *
 * This resizer is top bound, and expands symmetrically towards left, right and increasingly fast toward bottom
 * (to compensate for top anchoring).
 *
 *
 *
 */

/**
 * Implements a resizer that enlarges/shrinks in all directions.
 *
 * @class ResizerTopBound
 */
export default class ResizerTopBound {
	constructor( context, options ) {
		this.context = context;
		this.options = options || {};
	}

	attach() {}

	begin() {
		this.redrawShadow();

		const resizeHost = this.context._getResizeHost();
		this.closestReferencePoint = getAbsoluteBoundaryPoint( resizeHost, this.context.referenceHandlerPosition );
	}

	redrawShadow() {
		if ( this.context.domResizeWrapper ) {
			const clientRect = this.context._getResizeHost().getBoundingClientRect();

			this.context.domResizeWrapper.style.width = clientRect.width + 'px';
			this.context.domResizeWrapper.style.height = clientRect.height + 'px';
		}
	}

	commit() {}

	cancel() {}

	destroy() {}

	/**
	 * Method used to calculate the proposed size as the resize handlers are dragged.
	 *
	 * @param {Event} domEventData Event data that caused the size update request. It should be used to calculate the proposed size.
	 * @returns {Object} return
	 * @returns {Number} return.x Proposed width.
	 * @returns {Number} return.y Proposed height.
	 */
	updateSize( domEventData ) {
		const context = this.context;
		const currentCoordinates = context._extractCoordinates( domEventData );
		const isCentered = this.options.isCentered ? this.options.isCentered( this.context ) : true;
		const initialSize = this.context.originalSize;

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
			x: this.context.referenceCoordinates.x - ( currentCoordinates.x + initialSize.width ),
			y: ( currentCoordinates.y - initialSize.height ) - this.context.referenceCoordinates.y
		};

		if ( isCentered && this.context.referenceHandlerPosition.endsWith( '-right' ) ) {
			enlargement.x = currentCoordinates.x - ( this.context.referenceCoordinates.x + initialSize.width );
		}

		// Objects needs to be resized twice as much in horizontal axis if centered, since enlargement is counted from one resized
		// corner to your cursor. It needs to be duplicated to compensate for the other side too.
		if ( isCentered ) {
			enlargement.x *= 2;
		}

		const resizeHost = this.context._getResizeHost();
		const clientRect = resizeHost.getBoundingClientRect();

		// The size of currently visible resize host.
		const currentSize = {
			x: clientRect.width,
			y: clientRect.height
		};

		const proposedSize = {
			x: Math.abs( initialSize.width + enlargement.x ),
			y: Math.abs( initialSize.height + enlargement.y )
		};

		// Dominant determination must take the ratio into account.
		proposedSize.dominant = proposedSize.x / context.aspectRatio > proposedSize.y ? 'x' : 'y';
		proposedSize.max = proposedSize[ proposedSize.dominant ];

		const drawnSize = {
			x: proposedSize.x,
			y: proposedSize.y
		};

		if ( proposedSize.dominant == 'x' ) {
			drawnSize.y = drawnSize.x / context.aspectRatio;
		} else {
			drawnSize.x = drawnSize.y * context.aspectRatio;
		}

		const resizeUsingImage = global.window.pocResizeUsingImage !== false;
		let shadowBoundValue = '0px';

		if ( !resizeUsingImage ) {
			shadowBoundValue = 'auto';
		}

		// Reset shadow bounding.
		context.domResizeShadow.style.top = shadowBoundValue;
		context.domResizeShadow.style.left = shadowBoundValue;
		context.domResizeShadow.style.bottom = shadowBoundValue;
		context.domResizeShadow.style.right = shadowBoundValue;

		if ( resizeUsingImage ) {
			resizeHost.style.width = `${ drawnSize.x }px`;
			// resizeHost.style.height = `${ drawnSize.y }px`;

			const latestRect = resizeHost.getBoundingClientRect();

			// Refresh values based on real image. Real image might be limited by max-width, and thus fetching it
			// here will reflect this limitation on resizer shadow later on.
			drawnSize.x = latestRect.width;
			drawnSize.y = latestRect.height;
		} else {
			const invertedPosition = this.context._invertPosition( context.referenceHandlerPosition );

			const diff2 = {
				x: parseFloat( currentSize.x ) - drawnSize.x,
				y: parseFloat( currentSize.y ) - drawnSize.y
			};

			context.domResizeShadow.style[ invertedPosition.split( '-' )[ 0 ] ] = '0px';
			context.domResizeShadow.style[ invertedPosition.split( '-' )[ 1 ] ] = `${ diff2.x / 2 }px`;

			// Apply the actual shadow dimensions.
			context.domResizeShadow.style.width = `${ drawnSize.x }px`;
			context.domResizeShadow.style.height = `${ drawnSize.y }px`;
		}

		return drawnSize;
	}

	redraw() {}
}

mix( ResizerTopBound, ObservableMixin );
