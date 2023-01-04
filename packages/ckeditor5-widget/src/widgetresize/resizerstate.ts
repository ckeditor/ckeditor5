/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgetresize/resizerstate
 */

import { ObservableMixin, Rect } from '@ckeditor/ckeditor5-utils';

import type { ResizerOptions } from '../widgetresize';

/**
 * Stores the internal state of a single resizable object.
 *
 */
export default class ResizeState extends ObservableMixin() {
	declare public activeHandlePosition: string | null;
	declare public proposedWidthPercents: number | null;
	declare public proposedWidth: number | null;
	declare public proposedHeight: number | null;
	declare public proposedHandleHostWidth: number | null;
	declare public proposedHandleHostHeight: number | null;

	/**
	 * @internal
	 */
	public _referenceCoordinates: { x: number; y: number } | null;

	private readonly _options: ResizerOptions;
	private _originalWidth?: number;
	private _originalHeight?: number;
	private _originalWidthPercents?: number;
	private _aspectRatio?: number;

	/**
	 * @param {module:widget/widgetresize~ResizerOptions} options Resizer options.
	 */
	constructor( options: ResizerOptions ) {
		super();

		/**
		 * The original width (pixels) of the resized object when the resize process was started.
		 *
		 * @readonly
		 * @member {Number} #originalWidth
		 */

		/**
		 * The original height (pixels) of the resized object when the resize process was started.
		 *
		 * @readonly
		 * @member {Number} #originalHeight
		 */

		/**
		 * The original width (percents) of the resized object when the resize process was started.
		 *
		 * @readonly
		 * @member {Number} #originalWidthPercents
		 */

		/**
		 * The position of the handle that initiated the resizing. E.g. `"top-left"`, `"bottom-right"` etc. or `null`
		 * if unknown.
		 *
		 * @readonly
		 * @observable
		 * @member {String|null} #activeHandlePosition
		 */
		this.set( 'activeHandlePosition', null );

		/**
		 * The width (percents) proposed, but not committed yet, in the current resize process.
		 *
		 * @readonly
		 * @observable
		 * @member {Number|null} #proposedWidthPercents
		 */
		this.set( 'proposedWidthPercents', null );

		/**
		 * The width (pixels) proposed, but not committed yet, in the current resize process.
		 *
		 * @readonly
		 * @observable
		 * @member {Number|null} #proposedWidthPixels
		 */
		this.set( 'proposedWidth', null );

		/**
		 * The height (pixels) proposed, but not committed yet, in the current resize process.
		 *
		 * @readonly
		 * @observable
		 * @member {Number|null} #proposedHeightPixels
		 */
		this.set( 'proposedHeight', null );

		this.set( 'proposedHandleHostWidth', null );
		this.set( 'proposedHandleHostHeight', null );

		/**
		 * A width to height ratio of the resized image.
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
		 * The reference point of the resizer where the dragging started. It is used to measure the distance the user cursor
		 * traveled, so how much the image should be enlarged.
		 * This information is only known after the DOM was rendered, so it will be updated later.
		 *
		 * @private
		 * @type {Object}
		 */
		this._referenceCoordinates = null;
	}

	public get originalWidth(): number | undefined {
		return this._originalWidth;
	}

	public get originalHeight(): number | undefined {
		return this._originalHeight;
	}

	public get originalWidthPercents(): number | undefined {
		return this._originalWidthPercents;
	}

	public get aspectRatio(): number | undefined {
		return this._aspectRatio;
	}

	/**
	 *
	 * @param {HTMLElement} domResizeHandle The handle used to calculate the reference point.
	 * @param {HTMLElement} domHandleHost
	 * @param {HTMLElement} domResizeHost
	 */
	public begin( domResizeHandle: HTMLElement, domHandleHost: HTMLElement, domResizeHost: HTMLElement ): void {
		const clientRect = new Rect( domHandleHost );

		this.activeHandlePosition = getHandlePosition( domResizeHandle )!;

		this._referenceCoordinates = getAbsoluteBoundaryPoint( domHandleHost, getOppositePosition( this.activeHandlePosition ) );

		this._originalWidth = clientRect.width;
		this._originalHeight = clientRect.height;

		this._aspectRatio = clientRect.width / clientRect.height;

		const widthStyle = domResizeHost.style.width;

		if ( widthStyle && widthStyle.match( /^\d+(\.\d*)?%$/ ) ) {
			this._originalWidthPercents = parseFloat( widthStyle );
		} else {
			this._originalWidthPercents = calculateHostPercentageWidth( domResizeHost, clientRect );
		}
	}

	public update( newSize: {
		width: number;
		height: number;
		widthPercents: number;
		handleHostWidth: number;
		handleHostHeight: number;
	} ): void {
		this.proposedWidth = newSize.width;
		this.proposedHeight = newSize.height;
		this.proposedWidthPercents = newSize.widthPercents;

		this.proposedHandleHostWidth = newSize.handleHostWidth;
		this.proposedHandleHostHeight = newSize.handleHostHeight;
	}
}

// Calculates a relative width of a `domResizeHost` compared to it's parent in percents.
//
// @private
// @param {HTMLElement} domResizeHost
// @param {module:utils/dom/rect~Rect} resizeHostRect
// @returns {Number}
function calculateHostPercentageWidth( domResizeHost: HTMLElement, resizeHostRect: Rect ) {
	const domResizeHostParent = domResizeHost.parentElement;
	// Need to use computed style as it properly excludes parent's paddings from the returned value.
	const parentWidth = parseFloat( domResizeHostParent!.ownerDocument.defaultView!.getComputedStyle( domResizeHostParent! ).width );

	return resizeHostRect.width / parentWidth * 100;
}

// Returns coordinates of the top-left corner of an element, relative to the document's top-left corner.
//
// @private
// @param {HTMLElement} element
// @param {String} resizerPosition The position of the resize handle, e.g. `"top-left"`, `"bottom-right"`.
// @returns {Object} return
// @returns {Number} return.x
// @returns {Number} return.y
function getAbsoluteBoundaryPoint( element: HTMLElement, resizerPosition: string ) {
	const elementRect = new Rect( element );
	const positionParts = resizerPosition.split( '-' );
	const ret = {
		x: positionParts[ 1 ] == 'right' ? elementRect.right : elementRect.left,
		y: positionParts[ 0 ] == 'bottom' ? elementRect.bottom : elementRect.top
	};

	ret.x += element.ownerDocument.defaultView!.scrollX;
	ret.y += element.ownerDocument.defaultView!.scrollY;

	return ret;
}

// @private
// @param {String} resizerPosition The expected resizer position, like `"top-left"`, `"bottom-right"`.
// @returns {String} A prefixed HTML class name for the resizer element.
function getResizerHandleClass( resizerPosition: string ) {
	return `ck-widget__resizer__handle-${ resizerPosition }`;
}

// Determines the position of a given resize handle.
//
// @private
// @param {HTMLElement} domHandle Handle used to calculate the reference point.
// @returns {String|undefined} Returns a string like `"top-left"` or `undefined` if not matched.
function getHandlePosition( domHandle: HTMLElement ) {
	const resizerPositions = [ 'top-left', 'top-right', 'bottom-right', 'bottom-left' ];

	for ( const position of resizerPositions ) {
		if ( domHandle.classList.contains( getResizerHandleClass( position ) ) ) {
			return position;
		}
	}
}

// @private
// @param {String} position Like `"top-left"`.
// @returns {String} Inverted `position`, e.g. it returns `"bottom-right"` if `"top-left"` was given as `position`.
function getOppositePosition( position: string ) {
	const parts = position.split( '-' );
	const replacements: Record<string, string> = {
		top: 'bottom',
		bottom: 'top',
		left: 'right',
		right: 'left'
	};

	return `${ replacements[ parts[ 0 ] ] }-${ replacements[ parts[ 1 ] ] }`;
}
