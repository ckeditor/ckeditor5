import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * @module widget/resizecontext
 */

/**
 * Implements a resizer that enlarges to the dragged side.
 *
 * @class ResizerSide
 */
export default class ResizerSide {
	constructor( context, options ) {
		this.context = context;
		this.options = options || {};
	}

	attach() {}

	begin() {}

	commit() {}

	cancel() {}

	destroy() {}

	updateSize( domEventData ) {
		const context = this.context;
		const currentCoordinates = context._extractCoordinates( domEventData );

		const proposedSize = {
			x: Math.abs( currentCoordinates.x - context.referenceCoordinates.x ),
			y: Math.abs( currentCoordinates.y - context.referenceCoordinates.y )
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
		context.domResizeShadow.style.top = 0;
		context.domResizeShadow.style.left = 0;
		context.domResizeShadow.style.bottom = 0;
		context.domResizeShadow.style.right = 0;

		context.domResizeShadow.style[ context.referenceHandlerPosition.split( '-' )[ 0 ] ] = 'auto';
		context.domResizeShadow.style[ context.referenceHandlerPosition.split( '-' )[ 1 ] ] = 'auto';

		// Apply the actual shadow dimensions.
		context.domResizeShadow.style.width = `${ drawnSize.x }px`;
		context.domResizeShadow.style.height = `${ drawnSize.y }px`;

		return drawnSize; // @todo decide what size should actually be returned.
	}

	redraw() {}

	_getResizeHost() {}
}

mix( ResizerSide, ObservableMixin );
