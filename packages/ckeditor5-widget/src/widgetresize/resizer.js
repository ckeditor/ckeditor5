/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgetresize/resizer
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import Template from '@ckeditor/ckeditor5-ui/src/template';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

import ResizeState from './resizerstate';

/**
 * Represents a resizer for a single resizable object.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class Resizer {
	/**
	 * @param {module:widget/widgetresize~ResizerOptions} options Resizer options.
	 */
	constructor( options ) {
		/**
		 * Stores the state of resizable host geometry, such as original width, currently proposed height, etc.
		 *
		 * Note that a new state is created for each resize transaction.
		 *
		 * @readonly
		 * @member {module:widget/widgetresize/resizerstate~ResizerState} #state
		 */

		/**
		 * A view displaying new proposed element's size during the resizing.
		 *
		 * @protected
		 * @readonly
		 * @member {module:widget/widgetresize/resizer~SizeView} #_sizeUI
		 */

		/**
		 * Options passed to the {@link #constructor}.
		 *
		 * @private
		 * @type {module:widget/widgetresize~ResizerOptions}
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
		this._domResizerWrapper = null;

		/**
		 * @observable
		 */
		this.set( 'isEnabled', true );

		this.decorate( 'begin' );
		this.decorate( 'cancel' );
		this.decorate( 'commit' );
		this.decorate( 'updateSize' );
	}

	/**
	 * Attaches the resizer to the DOM.
	 */
	attach() {
		const that = this;
		const widgetElement = this._options.viewElement;
		const writer = this._options.downcastWriter;

		const viewResizerWrapper = writer.createUIElement( 'div', {
			class: 'ck ck-reset_all ck-widget__resizer'
		}, function( domDocument ) {
			const domElement = this.toDomElement( domDocument );

			that._appendHandles( domElement );
			that._appendSizeUI( domElement );

			that._domResizerWrapper = domElement;

			that.on( 'change:isEnabled', ( evt, propName, newValue ) => {
				domElement.style.display = newValue ? '' : 'none';
			} );

			domElement.style.display = that.isEnabled ? '' : 'none';

			return domElement;
		} );

		// Append resizer wrapper to the widget's wrapper.
		writer.insert( writer.createPositionAt( widgetElement, 'end' ), viewResizerWrapper );
		writer.addClass( 'ck-widget_with-resizer', widgetElement );
	}

	/**
	 * Starts the resizing process.
	 *
	 * Creates a new {@link #state} for current process.
	 *
	 * @fires begin
	 * @param {HTMLElement} domResizeHandle Clicked handle.
	 */
	begin( domResizeHandle ) {
		this.state = new ResizeState( this._options );

		this._sizeUI.bindToState( this._options, this.state );

		this.state.begin( domResizeHandle, this._getHandleHost(), this._getResizeHost() );

		this.redraw();
	}

	/**
	 * Updates the proposed size based on `domEventData`.
	 *
	 * @fires updateSize
	 * @param {Event} domEventData
	 */
	updateSize( domEventData ) {
		const domHandleHost = this._getHandleHost();
		const domResizeHost = this._getResizeHost();
		const unit = this._options.unit;
		const newSize = this._proposeNewSize( domEventData );

		domResizeHost.style.width = ( unit === '%' ? newSize.widthPercents : newSize.width ) + this._options.unit;

		const domHandleHostRect = new Rect( domHandleHost );

		newSize.handleHostWidth = Math.round( domHandleHostRect.width );
		newSize.handleHostHeight = Math.round( domHandleHostRect.height );

		const domResizeHostRect = new Rect( domHandleHost );

		newSize.width = Math.round( domResizeHostRect.width );
		newSize.height = Math.round( domResizeHostRect.height );

		this.state.update( newSize );

		// Refresh values based on the real image. Real image might be limited by max-width, and thus fetching it
		// here will reflect this limitation.
		this._domResizerWrapper.style.width = newSize.handleHostWidth + 'px';
		this._domResizerWrapper.style.height = newSize.handleHostHeight + 'px';
	}

	/**
	 * Applies the geometry proposed with the resizer.
	 *
	 * @fires commit
	 */
	commit() {
		const unit = this._options.unit;
		const newValue = ( unit === '%' ? this.state.proposedWidthPercents : this.state.proposedWidth ) + this._options.unit;

		this._options.onCommit( newValue );

		this._cleanup();
	}

	/**
	 * Cancels and rejects proposed resize dimensions hiding all the UI.
	 *
	 * @fires cancel
	 */
	cancel() {
		this._cleanup();
	}

	/**
	 * Destroys the resizer.
	 */
	destroy() {
		this.cancel();
	}

	/**
	 * Redraws the resizer.
	 */
	redraw() {
		// TODO review this
		const domWrapper = this._domResizerWrapper;

		if ( existsInDom( domWrapper ) ) {
			// Refresh only if resizer exists in the DOM.
			const widgetWrapper = domWrapper.parentElement;
			const handleHost = this._getHandleHost();
			const clientRect = new Rect( handleHost );

			domWrapper.style.width = clientRect.width + 'px';
			domWrapper.style.height = clientRect.height + 'px';

			// In case a resizing host is not a widget wrapper, we need to compensate
			// for any additional offsets the resize host might have. E.g. wrapper padding
			// or simply another editable. By doing that the border and resizers are shown
			// only around the resize host.
			if ( !widgetWrapper.isSameNode( handleHost ) ) {
				domWrapper.style.left = handleHost.offsetLeft + 'px';
				domWrapper.style.top = handleHost.offsetTop + 'px';

				domWrapper.style.height = handleHost.offsetHeight + 'px';
				domWrapper.style.width = handleHost.offsetWidth + 'px';
			}
		}

		function existsInDom( element ) {
			return element && element.ownerDocument && element.ownerDocument.contains( element );
		}
	}

	containsHandle( domElement ) {
		return this._domResizerWrapper.contains( domElement );
	}

	static isResizeHandle( domElement ) {
		return domElement.classList.contains( 'ck-widget__resizer__handle' );
	}

	/**
	 * Cleans up the context state.
	 *
	 * @protected
	 */
	_cleanup() {
		this._sizeUI.dismiss();
		this._sizeUI.isVisible = false;
	}

	/**
	 * Method used to calculate the proposed size as the resize handles are dragged.
	 *
	 * @private
	 * @param {Event} domEventData Event data that caused the size update request. It should be used to calculate the proposed size.
	 * @returns {Object} return
	 * @returns {Number} return.width Proposed width.
	 * @returns {Number} return.height Proposed height.
	 */
	_proposeNewSize( domEventData ) {
		const state = this.state;
		const currentCoordinates = extractCoordinates( domEventData );
		const isCentered = this._options.isCentered ? this._options.isCentered( this ) : true;

		// Enlargement defines how much the resize host has changed in a given axis. Naturally it could be a negative number
		// meaning that it has been shrunk.
		//
		// +----------------+--+
		// |                |  |
		// |       img      |  |
		// |  /handle host  |  |
		// +----------------+  | ^
		// |                   | | - enlarge y
		// +-------------------+ v
		// 					<-->
		// 					 enlarge x
		const enlargement = {
			x: state._referenceCoordinates.x - ( currentCoordinates.x + state.originalWidth ),
			y: ( currentCoordinates.y - state.originalHeight ) - state._referenceCoordinates.y
		};

		if ( isCentered && state.activeHandlePosition.endsWith( '-right' ) ) {
			enlargement.x = currentCoordinates.x - ( state._referenceCoordinates.x + state.originalWidth );
		}

		// Objects needs to be resized twice as much in horizontal axis if centered, since enlargement is counted from
		// one resized corner to your cursor. It needs to be duplicated to compensate for the other side too.
		if ( isCentered ) {
			enlargement.x *= 2;
		}

		// const resizeHost = this._getResizeHost();

		// The size proposed by the user. It does not consider the aspect ratio.
		const proposedSize = {
			width: Math.abs( state.originalWidth + enlargement.x ),
			height: Math.abs( state.originalHeight + enlargement.y )
		};

		// Dominant determination must take the ratio into account.
		proposedSize.dominant = proposedSize.width / state.aspectRatio > proposedSize.height ? 'width' : 'height';
		proposedSize.max = proposedSize[ proposedSize.dominant ];

		// Proposed size, respecting the aspect ratio.
		const targetSize = {
			width: proposedSize.width,
			height: proposedSize.height
		};

		if ( proposedSize.dominant == 'width' ) {
			targetSize.height = targetSize.width / state.aspectRatio;
		} else {
			targetSize.width = targetSize.height * state.aspectRatio;
		}

		return {
			width: Math.round( targetSize.width ),
			height: Math.round( targetSize.height ),
			widthPercents: Math.min( Math.round( state.originalWidthPercents / state.originalWidth * targetSize.width * 100 ) / 100, 100 )
		};
	}

	/**
	 * Method used to obtain the resize host.
	 *
	 * Resize host is an object that receives dimensions that are result of resizing.
	 *
	 * @protected
	 * @returns {HTMLElement}
	 */
	_getResizeHost() {
		const widgetWrapper = this._domResizerWrapper.parentElement;

		return this._options.getResizeHost( widgetWrapper );
	}

	/**
	 * Method used to obtain the handle host.
	 *
	 * Handle host is an object to which the handles are aligned to.
	 *
	 * Handle host will not always be an entire widget itself. Take an image as an example. Image widget
	 * contains an image and a caption. Only image should be surrounded with handles.
	 *
	 * @protected
	 * @returns {HTMLElement}
	 */
	_getHandleHost() {
		const widgetWrapper = this._domResizerWrapper.parentElement;

		return this._options.getHandleHost( widgetWrapper );
	}

	/**
	 * Renders the resize handles in DOM.
	 *
	 * @private
	 * @param {HTMLElement} domElement The resizer wrapper.
	 */
	_appendHandles( domElement ) {
		const resizerPositions = [ 'top-left', 'top-right', 'bottom-right', 'bottom-left' ];

		for ( const currentPosition of resizerPositions ) {
			domElement.appendChild( ( new Template( {
				tag: 'div',
				attributes: {
					class: `ck-widget__resizer__handle ${ getResizerClass( currentPosition ) }`
				}
			} ).render() ) );
		}
	}

	/**
	 * Sets up the {@link #_sizeUI} property and adds it to the passed `domElement`.
	 *
	 * @private
	 * @param {HTMLElement} domElement
	 */
	_appendSizeUI( domElement ) {
		const sizeUI = new SizeView();

		// Make sure icon#element is rendered before passing to appendChild().
		sizeUI.render();

		this._sizeUI = sizeUI;

		domElement.appendChild( sizeUI.element );
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
			if ( domHandle.classList.contains( getResizerClass( position ) ) ) {
				return position;
			}
		}
	}

	/**
	 * @event begin
	 */

	/**
	 * @event updateSize
	 */

	/**
	 * @event commit
	 */

	/**
	 * @event cancel
	 */
}

mix( Resizer, ObservableMixin );

/**
 * A view displaying new proposed element's size during the resizing.
 *
 * @extends {module:ui/view~View}
 */
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

	bindToState( options, resizerState ) {
		this.bind( 'isVisible' ).to( resizerState, 'proposedWidth', resizerState, 'proposedHeight', ( width, height ) =>
			width !== null && height !== null );

		this.bind( 'label' ).to(
			resizerState, 'proposedHandleHostWidth',
			resizerState, 'proposedHandleHostHeight',
			resizerState, 'proposedWidthPercents',
			( width, height, widthPercents ) => {
				if ( options.unit === 'px' ) {
					return `${ width }×${ height }`;
				} else {
					return `${ widthPercents }%`;
				}
			}
		);

		this.bind( 'activeHandlePosition' ).to( resizerState );
	}

	dismiss() {
		this.unbind();
		this.isVisible = false;
	}
}

// @param {String} resizerPosition Expected resizer position like `"top-left"`, `"bottom-right"`.
// @returns {String} A prefixed HTML class name for the resizer element
function getResizerClass( resizerPosition ) {
	return `ck-widget__resizer__handle-${ resizerPosition }`;
}

function extractCoordinates( event ) {
	return {
		x: event.pageX,
		y: event.pageY
	};
}
