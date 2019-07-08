import IconView from '@ckeditor/ckeditor5-ui/src/icon/iconview';
import dragHandlerIcon from '../theme/icons/drag-handler.svg';

/**
 * @module widget/resizecontext
 */

const HEIGHT_ATTRIBUTE_NAME = 'height';

/**
 * Returns coordinates of top-left corner of a element, relative to the document's top-left corner.
 *
 * @param {HTMLElement} element
 * @param {String} resizerPosition Position of the resize handler, e.g. `"top-left"`, `"bottom-right"`.
 * @returns {Object} return
 * @returns {Number} return.x
 * @returns {Number} return.y
 */
function getAbsoluteBoundaryPoint( element, resizerPosition ) {
	const nativeRectangle = element.getBoundingClientRect();
	const positionParts = resizerPosition.split( '-' );
	const ret = {
		x: positionParts[ 1 ] == 'right' ? nativeRectangle.right : nativeRectangle.left,
		y: positionParts[ 0 ] == 'bottom' ? nativeRectangle.bottom : nativeRectangle.top
	};

	ret.x += element.ownerDocument.defaultView.scrollX;
	ret.y += element.ownerDocument.defaultView.scrollY;

	return ret;
}

function getAspectRatio( element ) {
	const nativeRectangle = element.getBoundingClientRect();

	return nativeRectangle.width / nativeRectangle.height;
}

/**
 * Stores the internal state of a single resizable object.
 *
 * @class ResizeContext
 */
export default class ResizeContext {
	constructor( options ) {
		// HTMLElement??? - @todo seems to be not needed.
		// this.resizeHost = null;
		// view/UiElement
		this.resizeWrapperElement = null;
		// view/Element
		this.widgetWrapperElement = null;

		/**
		 * Container of entire resize UI.
		 *
		 * Note that this property is initialized only after the element bound with resizer is drawn
		 * so it will be a `null` when uninitialized.
		 *
		 * @member {HTMLElement|null}
		 */
		this.domResizeWrapper = null;

		/**
		 * @member {HTMLElement|null}
		 */
		this.domResizeShadow = null;

		this.options = options || {};

		// @todo: ---- options below seems like a little outside of a scope of a single context ----

		// Reference point of resizer where the dragging started. It is used to measure the distance to user cursor
		// traveled, thus how much the image should be enlarged.
		// This information is only known after DOM was rendered, so it will be updated later.
		this.referenceCoordinates = {
			y: 0,
			x: 0
		};
	}

	/**
	 *
	 * @param {module:engine/view/element~Element} widgetElement Widget's wrapper.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
	 */
	attach( widgetElement, writer ) {
		const that = this;

		this.widgetWrapperElement = widgetElement;

		this.resizeWrapperElement = writer.createUIElement( 'div', {
			class: 'ck ck-widget__resizer-wrapper'
		}, function( domDocument ) {
			const domElement = this.toDomElement( domDocument );

			that.domResizeShadow = that._appendShadowElement( domDocument, domElement );
			that._appendResizers( domElement );

			that.domResizeWrapper = domElement;

			return domElement;
		} );

		// Append resizer wrapper to the widget's wrapper.
		writer.insert( writer.createPositionAt( widgetElement, widgetElement.childCount ), this.resizeWrapperElement );
		writer.addClass( [ 'ck-widget_with-resizer' ], widgetElement );
	}

	/**
	 *
	 * @param {HTMLElement} domResizeHandler Handler used to calculate reference point.
	 */
	begin( domResizeHandler ) {
		const resizeHost = this._getResizeHost();

		this.domResizeShadow.classList.add( 'ck-widget__resizer-shadow-active' );

		/**
		 * Position of the handler that has initiated the resizing. E.g. `"top-left"`, `"bottom-right"` etc of `null`
		 * if unknown.
		 *
		 * @member {String|null}
		 */
		this.referenceHandlerPosition = this._getResizerPosition( domResizeHandler );

		const reversedPosition = this._invertPosition( this.referenceHandlerPosition );

		this.referenceCoordinates = getAbsoluteBoundaryPoint( resizeHost, reversedPosition );

		if ( resizeHost ) {
			this.aspectRatio = getAspectRatio( resizeHost, this.referenceHandlerPosition );
		}
	}

	commit( editor ) {
		const modelEntry = this._getModel( editor, this.widgetWrapperElement );
		const newHeight = this.domResizeShadow.clientHeight;

		this._dismissShadow();

		editor.model.change( writer => {
			writer.setAttribute( HEIGHT_ATTRIBUTE_NAME, newHeight, modelEntry );
		} );

		this.redraw();

		// Again, render will most likely change image size, so resizers needs a redraw.
		editor.editing.view.once( 'render', () => this.redraw() );

		this.referenceHandlerPosition = null;
	}

	cancel() {
		this._dismissShadow();

		this.referenceHandlerPosition = null;
	}

	destroy() {
		this.cancel();

		this.domResizeShadow = null;
		this.wrapper = null;
		this.referenceHandlerPosition = null;
	}

	updateSize( domEventData ) {
		const currentCoordinates = this._extractCoordinates( domEventData );

		const proposedSize = {
			x: Math.abs( currentCoordinates.x - this.referenceCoordinates.x ),
			y: Math.abs( currentCoordinates.y - this.referenceCoordinates.y )
		};

		// Dominant determination must take the ratio into account.
		proposedSize.dominant = proposedSize.x / this.aspectRatio > proposedSize.y ? 'x' : 'y';
		proposedSize.max = proposedSize[ proposedSize.dominant ];

		const drawnSize = {
			x: proposedSize.x,
			y: proposedSize.y
		};

		if ( proposedSize.dominant == 'x' ) {
			drawnSize.y = drawnSize.x / this.aspectRatio;
		} else {
			drawnSize.x = drawnSize.y * this.aspectRatio;
		}

		// Reset shadow bounding.
		this.domResizeShadow.style.top = 0;
		this.domResizeShadow.style.left = 0;
		this.domResizeShadow.style.bottom = 0;
		this.domResizeShadow.style.right = 0;

		this.domResizeShadow.style[ this.referenceHandlerPosition.split( '-' )[ 0 ] ] = 'auto';
		this.domResizeShadow.style[ this.referenceHandlerPosition.split( '-' )[ 1 ] ] = 'auto';

		// Apply the actual shadow dimensions.
		this.domResizeShadow.style.width = `${ drawnSize.x }px`;
		this.domResizeShadow.style.height = `${ drawnSize.y }px`;
	}

	redraw() {
		if ( this.domResizeWrapper ) {
			const widgetWrapper = this.domResizeWrapper.parentElement;

			const resizingHost = this._getResizeHost();

			if ( !widgetWrapper.isSameNode( resizingHost ) ) {
				this.domResizeWrapper.style.left = resizingHost.offsetLeft + 'px';
				this.domResizeWrapper.style.right = resizingHost.offsetLeft + 'px';
			}
		}
	}

	_getResizeHost() {
		const widgetWrapper = this.domResizeWrapper.parentElement;

		return this.options.getResizeHost ?
			this.options.getResizeHost( widgetWrapper ) : widgetWrapper;
	}

	_appendShadowElement( domDocument, domElement ) {
		const shadowElement = domDocument.createElement( 'div' );
		shadowElement.setAttribute( 'class', 'ck ck-widget__resizer-shadow' );
		domElement.appendChild( shadowElement );

		return shadowElement;
	}

	_appendResizers( domElement ) {
		const resizerPositions = [ 'top-left', 'top-right', 'bottom-right', 'bottom-left' ];

		for ( const currentPosition of resizerPositions ) {
			// Use the IconView from the UI library.
			const icon = new IconView();
			icon.set( 'content', dragHandlerIcon );
			icon.extendTemplate( {
				attributes: {
					'class': `ck-widget__resizer ${ this._getResizerClass( currentPosition ) }`
				}
			} );

			// Make sure icon#element is rendered before passing to appendChild().
			icon.render();

			domElement.appendChild( icon.element );
		}
	}

	_dismissShadow() {
		this.domResizeShadow.classList.remove( 'ck-widget__resizer-shadow-active' );
		this.domResizeShadow.removeAttribute( 'style' );
	}

	/**
	 *
	 * @param {module:@ckeditor/ckeditor5-core/src/editor/editor~Editor} editor
	 * @param {module:@ckeditor/ckeditor5-engine/src/view/element~Element} widgetWrapperElement
	 * @returns {module:@ckeditor/ckeditor5-engine/src/model/element~Element|undefined}
	 */
	_getModel( editor, widgetWrapperElement ) {
		return editor.editing.mapper.toModelElement( widgetWrapperElement );
	}

	_extractCoordinates( event ) {
		return {
			x: event.domEvent.pageX,
			y: event.domEvent.pageY
		};
	}

	/**
	 * @private
	 * @param {String} resizerPosition Expected resizer position like `"top-left"`, `"bottom-right"`.
	 * @returns {String} A prefixed HTML class name for the resizer element
	 */
	_getResizerClass( resizerPosition ) {
		return `ck-widget__resizer-${ resizerPosition }`;
	}

	/**
	 * Determines the position of a given resize handler.
	 *
	 * @private
	 * @param {HTMLElement} domResizeHandler Handler used to calculate reference point.
	 * @returns {String|undefined} Returns a string like `"top-left"` or `undefined` if not matched.
	 */
	_getResizerPosition( domResizeHandler ) {
		const resizerPositions = [ 'top-left', 'top-right', 'bottom-right', 'bottom-left' ];

		for ( const position of resizerPositions ) {
			if ( domResizeHandler.classList.contains( this._getResizerClass( position ) ) ) {
				return position;
			}
		}
	}

	/**
	 * @param {String} position Like `"top-left"`.
	 * @returns {String} Inverted `position`.
	 */
	_invertPosition( position ) {
		const parts = position.split( '-' );
		const replacements = {
			top: 'bottom',
			bottom: 'top',
			left: 'right',
			right: 'left'
		};

		return `${ replacements[ parts[ 0 ] ] }-${ replacements[ parts[ 1 ] ] }`;
	}
}
