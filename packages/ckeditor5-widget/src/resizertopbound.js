import {
	getAbsoluteBoundaryPoint
} from './utils';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

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
 * @class ResizerCentral
 */
export default class ResizerCentral {
	constructor( context, options ) {
		this.context = context;
		this.options = options || {};
	}

	attach() {}

	begin() {
		const resizeHost = this.context._getResizeHost();
		this.closestReferencePoint = getAbsoluteBoundaryPoint( resizeHost, this.context.referenceHandlerPosition );
	}

	commit() {}

	cancel() {}

	destroy() {}

	updateSize( domEventData ) {
		const context = this.context;
		const currentCoordinates = context._extractCoordinates( domEventData );

		const enlargement = {
			x: ( currentCoordinates.x - this.closestReferencePoint.x ) * 2,
			y: ( currentCoordinates.y - this.closestReferencePoint.y )
		};

		const resizeHost = this.context._getResizeHost();

		const originalSize = {
			x: resizeHost.width,
			y: resizeHost.height
		};

		const proposedSize = {
			x: Math.abs( this.closestReferencePoint.x - context.referenceCoordinates.x + enlargement.x ),
			y: Math.abs( this.closestReferencePoint.y - context.referenceCoordinates.y + enlargement.y )
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

		// Reset shadow bounding.
		context.domResizeShadow.style.top = 'auto';
		context.domResizeShadow.style.left = 'auto';
		context.domResizeShadow.style.bottom = 'auto';
		context.domResizeShadow.style.right = 'auto';

		const invertedPosition = this.context._invertPosition( context.referenceHandlerPosition );

		const diff2 = {
			x: parseFloat( originalSize.x ) - drawnSize.x,
			y: parseFloat( originalSize.y ) - drawnSize.y
		};

		// context.domResizeShadow.style[ invertedPosition.split( '-' )[ 0 ] ] = `${ diff2.y / 2 }px`;
		context.domResizeShadow.style[ invertedPosition.split( '-' )[ 0 ] ] = '0px';
		context.domResizeShadow.style[ invertedPosition.split( '-' )[ 1 ] ] = `${ diff2.x / 2 }px`;

		// Apply the actual shadow dimensions.
		context.domResizeShadow.style.width = `${ drawnSize.x }px`;
		context.domResizeShadow.style.height = `${ drawnSize.y }px`;

		return drawnSize; // @todo decide what size should actually be returned.
	}

	redraw() {}
}

mix( ResizerCentral, ObservableMixin );
