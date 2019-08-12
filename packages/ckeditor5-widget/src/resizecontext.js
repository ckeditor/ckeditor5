import View from '@ckeditor/ckeditor5-ui/src/view';
import ResizerTopBound from './resizertopbound';
import { getAbsoluteBoundaryPoint } from './utils';
import Template from '@ckeditor/ckeditor5-ui/src/template';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * @module widget/resizecontext
 */

const WIDTH_ATTRIBUTE_NAME = 'width';

/**
 * Stores the internal state of a single resizable object.
 *
 * @class ResizeContext
 */
export default class ResizeContext {
	constructor( options ) {
		/**
		 * View to a wrapper containing all the resizer-related views.
		 *
		 * @member {module:engine/view/uielement~UIElement}
		 */
		this.resizeWrapperElement = null;

		/**
		 * View of a widget associated with the resizer.
		 *
		 * @member {module:engine/view/element~Element}
		 */
		this.widgetWrapperElement = null;

		this.resizeStrategy = new ResizerTopBound( this, options );

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

		/**
		 * The size of resize host before current resize process.
		 *
		 * This information is only known after DOM was rendered, so it will be updated later.
		 */
		this.originalSize = {
			x: 0,
			y: 0
		};

		// @todo: ---- options below seems like a little outside of a scope of a single context ----

		// Reference point of resizer where the dragging started. It is used to measure the distance to user cursor
		// traveled, thus how much the image should be enlarged.
		// This information is only known after DOM was rendered, so it will be updated later.
		this.referenceCoordinates = {
			y: 0,
			x: 0
		};

		this._cleanupContext();

		/**
		 * Width proposed (but not yet accepted) using the widget resizer.
		 *
		 * It goes back to `null` once the resizer is dismissed or accepted.
		 *
		 * @readonly
		 * @observable
		 * @member {Number|null} #proposedX
		 */

		/**
		 * Height proposed (but not yet accepted) using the widget resizer.
		 *
		 * It goes back to `null` once the resizer is dismissed or accepted.
		 *
		 * @readonly
		 * @observable
		 * @member {Number|null} #proposedY
		 */

		/**
		 * Position of a handler that has initiated the resizing. E.g. `"top-left"`, `"bottom-right"` etc or `null`
		 * if not active.
		 *
		 * @readonly
		 * @observable
		 * @member {String|null} #orientation
		 */
	}

	/**
	 * Method to be called to attach a resizer to a given widget element.
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
			that._appendResizers( that.domResizeShadow );
			that._appendSizeUi( that.domResizeShadow );

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
		const clientRect = resizeHost.getBoundingClientRect();

		this.domResizeShadow.classList.add( 'ck-widget__resizer-shadow-active' );

		/**
		 * Position of the handler that has initiated the resizing. E.g. `"top-left"`, `"bottom-right"` etc or `null`
		 * if unknown.
		 *
		 * @member {String|null}
		 */
		this.referenceHandlerPosition = this._getResizerPosition( domResizeHandler );

		this.set( 'orientation', this.referenceHandlerPosition );

		const reversedPosition = this._invertPosition( this.referenceHandlerPosition );

		this.referenceCoordinates = getAbsoluteBoundaryPoint( resizeHost, reversedPosition );

		this.originalSize = {
			width: clientRect.width,
			height: clientRect.height
		};

		this.aspectRatio = this.options.getAspectRatio ?
			this.options.getAspectRatio( resizeHost ) : clientRect.width / clientRect.height;

		this.resizeStrategy.begin( domResizeHandler );
	}

	commit( editor ) {
		const modelEntry = this._getModel( editor, this.widgetWrapperElement );
		const newWidth = this.domResizeShadow.clientWidth;

		this._dismissShadow();

		this.redraw();

		this.resizeStrategy.commit( editor );

		editor.model.change( writer => {
			writer.setAttribute( WIDTH_ATTRIBUTE_NAME, newWidth, modelEntry );
		} );

		this._cleanupContext();
	}

	cancel() {
		this._dismissShadow();

		this.resizeStrategy.cancel();

		this._cleanupContext();
	}

	destroy() {
		this.cancel();

		this.domResizeShadow = null;
		this.wrapper = null;
	}

	/**
	 * Method used to calculate the proposed size as the resize handlers are dragged.
	 *
	 * Proposed size can also be observed with {@link #proposedX} and {@link #proposedY} properties.
	 *
	 * @param {Event} domEventData Event data that caused the size update request. It should be used to calculate the proposed size.
	 */
	updateSize( domEventData ) {
		const proposedSize = this.resizeStrategy.updateSize( domEventData );

		this.domResizeWrapper.style.width = proposedSize.x + 'px';
		this.domResizeWrapper.style.height = proposedSize.y + 'px';

		this.set( {
			proposedX: proposedSize.x,
			proposedY: proposedSize.y
		} );
	}

	redraw() {
		if ( this.domResizeWrapper ) {
			const widgetWrapper = this.domResizeWrapper.parentElement;

			const resizingHost = this._getResizeHost();

			if ( !widgetWrapper.isSameNode( resizingHost ) ) {
				this.domResizeWrapper.style.left = resizingHost.offsetLeft + 'px';
				this.domResizeWrapper.style.top = resizingHost.offsetTop + 'px';

				this.domResizeWrapper.style.height = resizingHost.offsetHeight + 'px';
				this.domResizeWrapper.style.width = resizingHost.offsetWidth + 'px';
			}
		}
	}

	/**
	 * Cleans up the context state.
	 *
	 * @protected
	 */
	_cleanupContext() {
		this.referenceHandlerPosition = null;

		this.set( {
			proposedX: null,
			proposedY: null,
			orientation: null
		} );
	}

	/**
	 * Method used to obtain the resize host.
	 *
	 * Resize host is an object that is actually resized.
	 *
	 * Resize host will not always be an entire widget itself. Take an image as an example. Image widget
	 * contains an image and caption. Only the image should be used to resize the widget, while the caption
	 * will simply follow the image size.
	 *
	 * @protected
	 */
	_getResizeHost() {
		const widgetWrapper = this.domResizeWrapper.parentElement;

		return this.options.getResizeHost ?
			this.options.getResizeHost( widgetWrapper ) : widgetWrapper;
	}

	/**
	 * @private
	 * @param {HTMLDocument} domDocument Document where the widget is used.
	 * @param {HTMLElement} domElement The outer wrapper of resize UI within a given widget.
	 */
	_appendShadowElement( domDocument, domElement ) {
		const shadowElement = domDocument.createElement( 'div' );
		shadowElement.setAttribute( 'class', 'ck ck-widget__resizer-shadow' );
		domElement.appendChild( shadowElement );

		return shadowElement;
	}

	/**
	 * Renders the resize handlers in DOM.
	 *
	 * @private
	 * @param {HTMLElement} domElement Resize shadow where the resizers should be appended to.
	 */
	_appendResizers( domElement ) {
		const resizerPositions = [ 'top-left', 'top-right', 'bottom-right', 'bottom-left' ];

		for ( const currentPosition of resizerPositions ) {
			domElement.appendChild( ( new Template( {
				tag: 'div',
				attributes: {
					class: `ck-widget__resizer ${ this._getResizerClass( currentPosition ) }`
				}
			} ).render() ) );
		}
	}

	/**
	 * @private
	 * @param {HTMLElement} domElement
	 */
	_appendSizeUi( domElement ) {
		const sizeUi = new SizeView();

		sizeUi.bind( 'isVisible' ).to( this, 'proposedX', this, 'proposedY', ( x, y ) =>
			x !== null && y !== null );

		sizeUi.bind( 'label' ).to( this, 'proposedX', this, 'proposedY', ( x, y ) =>
			`${ Math.round( x ) }x${ Math.round( y ) }` );

		sizeUi.bind( 'orientation' ).to( this );

		// Make sure icon#element is rendered before passing to appendChild().
		sizeUi.render();

		this.sizeElement = sizeUi.element;

		domElement.appendChild( this.sizeElement );
	}

	_dismissShadow() {
		this.domResizeShadow.classList.remove( 'ck-widget__resizer-shadow-active' );
		this.domResizeShadow.removeAttribute( 'style' );
	}

	/**
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {module:engine/view/element~Element} widgetWrapperElement
	 * @returns {module:engine/model/element~Element|undefined}
	 * @protected
	 */
	_getModel( editor, widgetWrapperElement ) {
		return editor.editing.mapper.toModelElement( widgetWrapperElement );
	}

	_extractCoordinates( event ) {
		return {
			x: event.pageX,
			y: event.pageY
		};
	}

	/**
	 * @param {String} resizerPosition Expected resizer position like `"top-left"`, `"bottom-right"`.
	 * @returns {String} A prefixed HTML class name for the resizer element
	 * @private
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
	 * @protected
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

mix( ResizeContext, ObservableMixin );

class SizeView extends View {
	constructor() {
		super();

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-size-view',
					bind.to( 'orientation', value => value ? `ck-orientation-${ value }` : '' )
				],
				style: {
					display: bind.if( 'isVisible', 'none', visible => !visible )
				}
			},
			children: [ {
				text: bind.to( 'label' )
			} ]
		} );
	}
}
