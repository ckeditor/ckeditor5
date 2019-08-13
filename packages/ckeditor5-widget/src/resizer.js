/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/resizer
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import {
	getAbsoluteBoundaryPoint
} from './utils';
import Template from '@ckeditor/ckeditor5-ui/src/template';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Stores the internal state of a single resizable object.
 *
 * @class Resizer
 */
export default class Resizer {
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

		/**
		 * Container of the entire resize UI.
		 *
		 * Note that this property is initialized only after the element bound with the resizer is drawn
		 * so it will be a `null` when uninitialized.
		 *
		 * @private
		 * @type {HTMLElement|null}
		 */
		this._domResizeWrapper = null;

		/**
		 * Reference point of resizer where the dragging started. It is used to measure the distance to user cursor
		 * traveled, thus how much the image should be enlarged.
		 * This information is only known after DOM was rendered, so it will be updated later.
		 *
		 * @private
		 * @type {Object}
		 */
		this._referenceCoordinates = null;

		/**
		 * View to a wrapper containing all the resizer-related views.
		 *
		 * @private
		 * @type {module:engine/view/uielement~UIElement}
		 */
		this._resizeWrapperElement = null;

		/**
		 * @private
		 * @type {HTMLElement|null}
		 */
		this._domResizeShadow = null;

		this.decorate( 'begin' );
		this.decorate( 'cancel' );
		this.decorate( 'commit' );
		this.decorate( 'updateSize' );
	}

	/**
	 *
	 */
	attach() {
		const that = this;
		const viewElement = this._options.viewElement;
		const writer = this._options.downcastWriter;

		this._resizeWrapperElement = writer.createUIElement( 'div', {
			class: 'ck ck-widget__resizer-wrapper'
		}, function( domDocument ) {
			const domElement = this.toDomElement( domDocument );

			that._domResizeShadow = that._appendShadowElement( domElement );
			that._appendResizers( that._domResizeShadow );
			that._appendSizeUi( that._domResizeShadow );

			that._domResizeWrapper = domElement;

			return domElement;
		} );

		// Append resizer wrapper to the widget's wrapper.
		writer.insert( writer.createPositionAt( viewElement, 'end' ), this._resizeWrapperElement );
		writer.addClass( [ 'ck-widget_with-resizer' ], viewElement );
	}

	/**
	 *
	 * @param {HTMLElement} domResizeHandle The handle used to calculate the reference point.
	 */
	begin( domResizeHandle ) {
		const resizeHost = this._getResizeHost();
		const clientRect = new Rect( resizeHost );

		this.activeHandlePosition = this._getHandlePosition( domResizeHandle );

		this._referenceCoordinates = getAbsoluteBoundaryPoint( resizeHost, getOppositePosition( this.activeHandlePosition ) );

		this.originalSize = {
			width: clientRect.width,
			height: clientRect.height
		};

		this.aspectRatio = this._options.getAspectRatio ?
			this._options.getAspectRatio( resizeHost ) : clientRect.width / clientRect.height;

		this.redraw();
	}

	/**
	 * Accepts currently proposed resize and applies it on the resize host.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 */
	commit( editor ) {
		const modelElement = this._options.modelElement;
		const newWidth = this._domResizeShadow.clientWidth;

		this._dismissShadow();

		this.redraw();

		editor.model.change( writer => {
			writer.setAttribute( 'width', newWidth + 'px', modelElement );
		} );

		this._cleanupContext();
	}

	/**
	 * Cancels and rejects proposed resize dimensions hiding all the UI.
	 */
	cancel() {
		this._dismissShadow();

		this._cleanupContext();
	}

	destroy() {
		this.cancel();
	}

	/**
	 * Method used to calculate the proposed size as the resize handles are dragged.
	 *
	 * Proposed size can also be observed with {@link #proposedWidth} and {@link #proposedHeight} properties.
	 *
	 * @param {Event} domEventData Event data that caused the size update request. It should be used to calculate the proposed size.
	 */
	updateSize( domEventData ) {
		this._updateResizeHostSize( domEventData );

		// Refresh values based on real image. Real image might be limited by max-width, and thus fetching it
		// here will reflect this limitation on resizer shadow later on.
		const realSize = this._getRealResizeHostSize();

		this._domResizeWrapper.style.width = realSize.width + 'px';
		this._domResizeWrapper.style.height = realSize.height + 'px';

		this.proposedWidth = realSize.width;
		this.proposedHeight = realSize.height;
	}

	redraw() {
		const domWrapper = this._domResizeWrapper;

		if ( existsInDom( domWrapper ) ) {
			// Refresh only if resizer exists in the DOM.
			const widgetWrapper = domWrapper.parentElement;
			const resizingHost = this._getResizeHost();
			const clientRect = new Rect( resizingHost );

			domWrapper.style.width = clientRect.width + 'px';
			domWrapper.style.height = clientRect.height + 'px';

			// In case a resizing host is not a widget wrapper, we need to compensate
			// for any additional offsets the resize host might have. E.g. wrapper padding
			// or simply another editable. By doing that the border and resizers are shown
			// only around the resize host.
			if ( !widgetWrapper.isSameNode( resizingHost ) ) {
				domWrapper.style.left = resizingHost.offsetLeft + 'px';
				domWrapper.style.top = resizingHost.offsetTop + 'px';

				domWrapper.style.height = resizingHost.offsetHeight + 'px';
				domWrapper.style.width = resizingHost.offsetWidth + 'px';
			}
		}

		function existsInDom( element ) {
			return element && element.ownerDocument && element.ownerDocument.contains( element );
		}
	}

	containsHandle( domElement ) {
		return this._domResizeWrapper.contains( domElement );
	}

	static isResizeHandle( domElement ) {
		return domElement.classList.contains( 'ck-widget__resizer' );
	}

	/**
	 * Cleans up the context state.
	 *
	 * @protected
	 */
	_cleanupContext() {
		this.activeHandlePosition = null;
		this.proposedWidth = null;
		this.proposedHeight = null;
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
	 * @returns {HTMLElement}
	 */
	_getResizeHost() {
		const widgetWrapper = this._domResizeWrapper.parentElement;

		return this._options.getResizeHost ?
			this._options.getResizeHost( widgetWrapper ) : widgetWrapper;
	}

	/**
	 * @protected
	 */
	_dismissShadow() {
		this._domResizeShadow.removeAttribute( 'style' );
	}

	/**
	 * @private
	 * @param {HTMLElement} domElement The outer wrapper of resize UI within a given widget.
	 */
	_appendShadowElement( domElement ) {
		const shadowElement = new Template( {
			tag: 'div',
			attributes: {
				class: 'ck ck-widget__resizer-shadow'
			}
		} ).render();

		domElement.appendChild( shadowElement );

		return shadowElement;
	}

	/**
	 * Renders the resize handles in DOM.
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

		sizeUi.bind( 'isVisible' ).to( this, 'proposedWidth', this, 'proposedHeight', ( x, y ) =>
			x !== null && y !== null );

		sizeUi.bind( 'label' ).to( this, 'proposedWidth', this, 'proposedHeight', ( x, y ) =>
			`${ Math.round( x ) }x${ Math.round( y ) }` );

		sizeUi.bind( 'activeHandlePosition' ).to( this );

		// Make sure icon#element is rendered before passing to appendChild().
		sizeUi.render();

		domElement.appendChild( sizeUi.element );
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
	_updateResizeHostSize( domEventData ) {
		const currentCoordinates = this._extractCoordinates( domEventData );
		const isCentered = this._options.isCentered ? this._options.isCentered( this ) : true;
		const initialSize = this.originalSize;

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
			x: this._referenceCoordinates.x - ( currentCoordinates.x + initialSize.width ),
			y: ( currentCoordinates.y - initialSize.height ) - this._referenceCoordinates.y
		};

		if ( isCentered && this.activeHandlePosition.endsWith( '-right' ) ) {
			enlargement.x = currentCoordinates.x - ( this._referenceCoordinates.x + initialSize.width );
		}

		// Objects needs to be resized twice as much in horizontal axis if centered, since enlargement is counted from
		// one resized corner to your cursor. It needs to be duplicated to compensate for the other side too.
		if ( isCentered ) {
			enlargement.x *= 2;
		}

		const resizeHost = this._getResizeHost();

		// The size proposed by the user. It does not consider the aspect ratio.
		const proposedSize = {
			width: Math.abs( initialSize.width + enlargement.x ),
			height: Math.abs( initialSize.height + enlargement.y )
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

		resizeHost.style.width = `${ targetSize.width }px`;
	}

	_getRealResizeHostSize() {
		const rect = new Rect( this._getResizeHost() );

		return { width: rect.width, height: rect.height };
	}

	/**
	 * @private
	 */
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
	 * Determines the position of a given resize handle.
	 *
	 * @private
	 * @param {HTMLElement} domHandle Handler used to calculate reference point.
	 * @returns {String|undefined} Returns a string like `"top-left"` or `undefined` if not matched.
	 */
	_getHandlePosition( domHandle ) {
		const resizerPositions = [ 'top-left', 'top-right', 'bottom-right', 'bottom-left' ];

		for ( const position of resizerPositions ) {
			if ( domHandle.classList.contains( this._getResizerClass( position ) ) ) {
				return position;
			}
		}
	}
}

mix( Resizer, ObservableMixin );

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
					bind.to( 'activeHandlePosition', value => value ? `ck-orientation-${ value }` : '' )
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
