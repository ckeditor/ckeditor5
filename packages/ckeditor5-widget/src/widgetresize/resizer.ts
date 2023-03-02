/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgetresize/resizer
 */

import { Template } from '@ckeditor/ckeditor5-ui';
import {
	Rect,
	ObservableMixin,
	compareArrays,
	type ObservableChangeEvent,
	type DecoratedMethodEvent
} from '@ckeditor/ckeditor5-utils';

import ResizeState from './resizerstate';
import SizeView from './sizeview';

import type { ResizerOptions } from '../widgetresize';
import type { ViewElement } from '@ckeditor/ckeditor5-engine';

/**
 * Represents a resizer for a single resizable object.
 */
export default class Resizer extends ObservableMixin() {
	/**
	 * Flag that indicates whether resizer can be used.
	 *
	 * @observable
	 */
	declare public isEnabled: boolean;

	/**
	 * Flag that indicates that resizer is currently focused.
	 *
	 * @observable
	 */
	declare public isSelected: boolean;

	/**
	 * Flag that indicates whether resizer is rendered (visible on the screen).
	 *
	 * @readonly
	 * @observable
	 */
	declare public isVisible: boolean;

	/**
	 * Stores the state of the resizable host geometry, such as the original width, the currently proposed height, etc.
	 *
	 * Note that a new state is created for each resize transaction.
	 */
	private _state!: ResizeState;

	/**
	 * A view displaying the proposed new element size during the resizing.
	 */
	private _sizeView!: SizeView;

	/**
	 * Options passed to the {@link #constructor}.
	 */
	private _options: ResizerOptions;

	/**
	 * A wrapper that is controlled by the resizer. This is usually a widget element.
	 */
	private _viewResizerWrapper: ViewElement | null = null;

	/**
	 * The width of the resized {@link module:widget/widgetresize~ResizerOptions#viewElement viewElement} before the resizing started.
	 */
	private _initialViewWidth: string | undefined;

	/**
	 * @param options Resizer options.
	 */
	constructor( options: ResizerOptions ) {
		super();

		this._options = options;

		this.set( 'isEnabled', true );
		this.set( 'isSelected', false );

		this.bind( 'isVisible' ).to( this, 'isEnabled', this, 'isSelected', ( isEnabled, isSelected ) => isEnabled && isSelected );

		this.decorate( 'begin' );
		this.decorate( 'cancel' );
		this.decorate( 'commit' );
		this.decorate( 'updateSize' );

		this.on( 'commit', event => {
			// State might not be initialized yet. In this case, prevent further handling and make sure that the resizer is
			// cleaned up (#5195).
			if ( !this.state.proposedWidth && !this.state.proposedWidthPercents ) {
				this._cleanup();
				event.stop();
			}
		}, { priority: 'high' } );
	}

	/**
	 * Stores the state of the resizable host geometry, such as the original width, the currently proposed height, etc.
	 *
	 * Note that a new state is created for each resize transaction.
	 */
	public get state(): ResizeState {
		return this._state;
	}

	/**
	 * Makes resizer visible in the UI.
	 */
	public show(): void {
		const editingView = this._options.editor.editing.view;

		editingView.change( writer => {
			writer.removeClass( 'ck-hidden', this._viewResizerWrapper! );
		} );
	}

	/**
	 * Hides resizer in the UI.
	 */
	public hide(): void {
		const editingView = this._options.editor.editing.view;

		editingView.change( writer => {
			writer.addClass( 'ck-hidden', this._viewResizerWrapper! );
		} );
	}

	/**
	 * Attaches the resizer to the DOM.
	 */
	public attach(): void {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		const widgetElement = this._options.viewElement;
		const editingView = this._options.editor.editing.view;

		editingView.change( writer => {
			const viewResizerWrapper = writer.createUIElement( 'div', {
				class: 'ck ck-reset_all ck-widget__resizer'
			}, function( domDocument ) {
				const domElement = this.toDomElement( domDocument );

				that._appendHandles( domElement );
				that._appendSizeUI( domElement );

				return domElement;
			} );

			// Append the resizer wrapper to the widget's wrapper.
			writer.insert( writer.createPositionAt( widgetElement, 'end' ), viewResizerWrapper );
			writer.addClass( 'ck-widget_with-resizer', widgetElement );

			this._viewResizerWrapper = viewResizerWrapper;

			if ( !this.isVisible ) {
				this.hide();
			}
		} );

		this.on<ObservableChangeEvent>( 'change:isVisible', () => {
			if ( this.isVisible ) {
				this.show();
				this.redraw();
			} else {
				this.hide();
			}
		} );
	}

	/**
	 * Starts the resizing process.
	 *
	 * Creates a new {@link #state} for the current process.
	 *
	 * @fires begin
	 * @param domResizeHandle Clicked handle.
	 */
	public begin( domResizeHandle: HTMLElement ): void {
		this._state = new ResizeState( this._options );

		this._sizeView._bindToState( this._options, this.state );

		this._initialViewWidth = this._options.viewElement.getStyle( 'width' );

		this.state.begin( domResizeHandle, this._getHandleHost(), this._getResizeHost() );
	}

	/**
	 * Updates the proposed size based on `domEventData`.
	 *
	 * @fires updateSize
	 */
	public updateSize( domEventData: MouseEvent ): void {
		const newSize = this._proposeNewSize( domEventData );
		const editingView = this._options.editor.editing.view;

		editingView.change( writer => {
			const unit = this._options.unit || '%';
			const newWidth = ( unit === '%' ? newSize.widthPercents : newSize.width ) + unit;

			writer.setStyle( 'width', newWidth, this._options.viewElement );
		} );

		// Get an actual image width, and:
		// * reflect this size to the resize wrapper
		// * apply this **real** size to the state
		const domHandleHost = this._getHandleHost();
		const domHandleHostRect = new Rect( domHandleHost );

		const handleHostWidth = Math.round( domHandleHostRect.width );
		const handleHostHeight = Math.round( domHandleHostRect.height );

		// Handle max-width limitation.
		const domResizeHostRect = new Rect( domHandleHost );

		newSize.width = Math.round( domResizeHostRect.width );
		newSize.height = Math.round( domResizeHostRect.height );

		this.redraw( domHandleHostRect );

		this.state.update( {
			...newSize,
			handleHostWidth,
			handleHostHeight
		} );
	}

	/**
	 * Applies the geometry proposed with the resizer.
	 *
	 * @fires commit
	 */
	public commit(): void {
		const unit = this._options.unit || '%';
		const newValue = ( unit === '%' ? this.state.proposedWidthPercents : this.state.proposedWidth ) + unit;

		// Both cleanup and onCommit callback are very likely to make view changes. Ensure that it is made in a single step.
		this._options.editor.editing.view.change( () => {
			this._cleanup();
			this._options.onCommit( newValue );
		} );
	}

	/**
	 * Cancels and rejects the proposed resize dimensions, hiding the UI.
	 *
	 * @fires cancel
	 */
	public cancel(): void {
		this._cleanup();
	}

	/**
	 * Destroys the resizer.
	 */
	public destroy(): void {
		this.cancel();
	}

	/**
	 * Redraws the resizer.
	 *
	 * @param handleHostRect Handle host rectangle might be given to improve performance.
	 */
	public redraw( handleHostRect?: Rect ): void {
		const domWrapper = this._domResizerWrapper;

		// Refresh only if resizer exists in the DOM.
		if ( !existsInDom( domWrapper ) ) {
			return;
		}

		const widgetWrapper = domWrapper!.parentElement;
		const handleHost = this._getHandleHost();
		const resizerWrapper = this._viewResizerWrapper!;
		const currentDimensions = [
			resizerWrapper.getStyle( 'width' ),
			resizerWrapper.getStyle( 'height' ),
			resizerWrapper.getStyle( 'left' ),
			resizerWrapper.getStyle( 'top' )
		];
		let newDimensions: Array<string | undefined>;

		if ( widgetWrapper!.isSameNode( handleHost ) ) {
			const clientRect = handleHostRect || new Rect( handleHost );

			newDimensions = [
				clientRect.width + 'px',
				clientRect.height + 'px',
				undefined,
				undefined
			];
		}
		// In case a resizing host is not a widget wrapper, we need to compensate
		// for any additional offsets the resize host might have. E.g. wrapper padding
		// or simply another editable. By doing that the border and resizers are shown
		// only around the resize host.
		else {
			newDimensions = [
				handleHost.offsetWidth + 'px',
				handleHost.offsetHeight + 'px',
				handleHost.offsetLeft + 'px',
				handleHost.offsetTop + 'px'
			];
		}

		// Make changes to the view only if the resizer should actually get new dimensions.
		// Otherwise, if View#change() was always called, this would cause EditorUI#update
		// loops because the WidgetResize plugin listens to EditorUI#update and updates
		// the resizer.
		// https://github.com/ckeditor/ckeditor5/issues/7633
		if ( compareArrays( currentDimensions, newDimensions ) !== 'same' ) {
			this._options.editor.editing.view.change( writer => {
				writer.setStyle( {
					width: newDimensions[ 0 ]!,
					height: newDimensions[ 1 ]!,
					left: newDimensions[ 2 ]!,
					top: newDimensions[ 3 ]!
				}, resizerWrapper );
			} );
		}
	}

	public containsHandle( domElement: HTMLElement ): boolean {
		return this._domResizerWrapper!.contains( domElement );
	}

	public static isResizeHandle( domElement: HTMLElement ): boolean {
		return domElement.classList.contains( 'ck-widget__resizer__handle' );
	}

	/**
	 * Cleans up the context state.
	 */
	private _cleanup(): void {
		this._sizeView._dismiss();

		const editingView = this._options.editor.editing.view;

		editingView.change( writer => {
			writer.setStyle( 'width', this._initialViewWidth!, this._options.viewElement );
		} );
	}

	/**
	 * Calculates the proposed size as the resize handles are dragged.
	 *
	 * @param domEventData Event data that caused the size update request. It should be used to calculate the proposed size.
	 */
	private _proposeNewSize( domEventData: MouseEvent ): { width: number; height: number; widthPercents: number } {
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
			x: state._referenceCoordinates!.x - ( currentCoordinates.x + state.originalWidth! ),
			y: ( currentCoordinates.y - state.originalHeight! ) - state._referenceCoordinates!.y
		};

		if ( isCentered && state.activeHandlePosition!.endsWith( '-right' ) ) {
			enlargement.x = currentCoordinates.x - ( state._referenceCoordinates!.x + state.originalWidth! );
		}

		// Objects needs to be resized twice as much in horizontal axis if centered, since enlargement is counted from
		// one resized corner to your cursor. It needs to be duplicated to compensate for the other side too.
		if ( isCentered ) {
			enlargement.x *= 2;
		}

		// const resizeHost = this._getResizeHost();

		// The size proposed by the user. It does not consider the aspect ratio.
		let width = Math.abs( state.originalWidth! + enlargement.x );
		let height = Math.abs( state.originalHeight! + enlargement.y );

		// Dominant determination must take the ratio into account.
		const dominant = width / state.aspectRatio! > height ? 'width' : 'height';

		if ( dominant == 'width' ) {
			height = width / state.aspectRatio!;
		} else {
			width = height * state.aspectRatio!;
		}

		return {
			width: Math.round( width ),
			height: Math.round( height ),
			widthPercents: Math.min( Math.round( state.originalWidthPercents! / state.originalWidth! * width * 100 ) / 100, 100 )
		};
	}

	/**
	 * Obtains the resize host.
	 *
	 * Resize host is an object that receives dimensions which are the result of resizing.
	 */
	private _getResizeHost(): HTMLElement {
		const widgetWrapper = this._domResizerWrapper!.parentElement;

		return this._options.getResizeHost( widgetWrapper! );
	}

	/**
	 * Obtains the handle host.
	 *
	 * Handle host is an object that the handles are aligned to.
	 *
	 * Handle host will not always be an entire widget itself. Take an image as an example. The image widget
	 * contains an image and a caption. Only the image should be surrounded with handles.
	 */
	private _getHandleHost(): HTMLElement {
		const widgetWrapper = this._domResizerWrapper!.parentElement;

		return this._options.getHandleHost( widgetWrapper! );
	}

	/**
	 * DOM container of the entire resize UI.
	 *
	 * Note that this property will have a value only after the element bound with the resizer is rendered
	 * (otherwise `null`).
	 */
	private get _domResizerWrapper(): HTMLElement | null {
		return this._options.editor.editing.view.domConverter.mapViewToDom( this._viewResizerWrapper! ) as any;
	}

	/**
	 * Renders the resize handles in the DOM.
	 *
	 * @param domElement The resizer wrapper.
	 */
	private _appendHandles( domElement: HTMLElement ) {
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
	 * Sets up the {@link #_sizeView} property and adds it to the passed `domElement`.
	 */
	private _appendSizeUI( domElement: HTMLElement ) {
		this._sizeView = new SizeView();

		// Make sure icon#element is rendered before passing to appendChild().
		this._sizeView.render();

		domElement.appendChild( this._sizeView.element! );
	}
}

/**
 * @eventName ~Resizer#begin
 */
export type ResizerBeginEvent = DecoratedMethodEvent<Resizer, 'begin'>;

/**
 * @eventName ~Resizer#cancel
 */
export type ResizerCancelEvent = DecoratedMethodEvent<Resizer, 'cancel'>;

/**
 * @eventName ~Resizer#commit
 */
export type ResizerCommitEvent = DecoratedMethodEvent<Resizer, 'commit'>;

/**
 * @eventName ~Resizer#updateSize
 */
export type ResizerUpdateSizeEvent = DecoratedMethodEvent<Resizer, 'updateSize'>;

/**
 * @param resizerPosition Expected resizer position like `"top-left"`, `"bottom-right"`.
 * @returns A prefixed HTML class name for the resizer element
 */
function getResizerClass( resizerPosition: string ) {
	return `ck-widget__resizer__handle-${ resizerPosition }`;
}

function extractCoordinates( event: MouseEvent ) {
	return {
		x: event.pageX,
		y: event.pageY
	};
}

function existsInDom( element: Node | DocumentFragment | undefined | null ) {
	return element && element.ownerDocument && element.ownerDocument.contains( element );
}
