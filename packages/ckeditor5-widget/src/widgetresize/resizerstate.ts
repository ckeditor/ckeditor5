/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgetresize/resizerstate
 */

import { ObservableMixin, Rect } from '@ckeditor/ckeditor5-utils';

import type { ResizerOptions } from '../widgetresize';

/**
 * Stores the internal state of a single resizable object.
 */
export default class ResizeState extends ObservableMixin() {
	/**
	 * The position of the handle that initiated the resizing. E.g. `"top-left"`, `"bottom-right"` etc. or `null`
	 * if unknown.
	 *
	 * @readonly
	 * @observable
	 */
	declare public activeHandlePosition: string | null;

	/**
	 * The width (percents) proposed, but not committed yet, in the current resize process.
	 *
	 * @readonly
	 * @observable
	 */
	declare public proposedWidthPercents: number | null;

	/**
	 * The width (pixels) proposed, but not committed yet, in the current resize process.
	 *
	 * @readonly
	 * @observable
	 */
	declare public proposedWidth: number | null;

	/**
	 * The height (pixels) proposed, but not committed yet, in the current resize process.
	 *
	 * @readonly
	 * @observable
	 */
	declare public proposedHeight: number | null;

	/**
	 * @readonly
	 * @observable
	 */
	declare public proposedHandleHostWidth: number | null;

	/**
	 * @readonly
	 * @observable
	 */
	declare public proposedHandleHostHeight: number | null;

	/**
	 * The reference point of the resizer where the dragging started. It is used to measure the distance the user cursor
	 * traveled, so how much the image should be enlarged.
	 * This information is only known after the DOM was rendered, so it will be updated later.
	 *
	 * @internal
	 */
	public _referenceCoordinates: { x: number; y: number } | null;

	/**
	 * Resizer options.
	 */
	private readonly _options: ResizerOptions;

	/**
	 * The original width (pixels) of the resized object when the resize process was started.
	 *
	 * @readonly
	 */
	private _originalWidth?: number;

	/**
	 * The original height (pixels) of the resized object when the resize process was started.
	 *
	 * @readonly
	 */
	private _originalHeight?: number;

	/**
	 * The original width (percents) of the resized object when the resize process was started.
	 *
	 * @readonly
	 */
	private _originalWidthPercents?: number;

	/**
	 * A width to height ratio of the resized image.
	 *
	 * @readonly
	 */
	private _aspectRatio?: number;

	/**
	 * @param options Resizer options.
	 */
	constructor( options: ResizerOptions ) {
		super();

		this.set( 'activeHandlePosition', null );
		this.set( 'proposedWidthPercents', null );
		this.set( 'proposedWidth', null );
		this.set( 'proposedHeight', null );
		this.set( 'proposedHandleHostWidth', null );
		this.set( 'proposedHandleHostHeight', null );

		this._options = options;
		this._referenceCoordinates = null;
	}

	/**
	 * The original width (pixels) of the resized object when the resize process was started.
	 */
	public get originalWidth(): number | undefined {
		return this._originalWidth;
	}

	/**
	 * The original height (pixels) of the resized object when the resize process was started.
	 */
	public get originalHeight(): number | undefined {
		return this._originalHeight;
	}

	/**
	 * The original width (percents) of the resized object when the resize process was started.
	 */
	public get originalWidthPercents(): number | undefined {
		return this._originalWidthPercents;
	}

	/**
	 * A width to height ratio of the resized image.
	 */
	public get aspectRatio(): number | undefined {
		return this._aspectRatio;
	}

	/**
	 *
	 * @param domResizeHandle The handle used to calculate the reference point.
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

/**
 * Calculates a relative width of a `domResizeHost` compared to its ancestor in percents.
 */
function calculateHostPercentageWidth( domResizeHost: HTMLElement, resizeHostRect: Rect ) {
	const domResizeHostParent = domResizeHost.parentElement;

	// Need to use computed style as it properly excludes parent's paddings from the returned value.
	let parentWidth = parseFloat( domResizeHostParent!.ownerDocument.defaultView!.getComputedStyle( domResizeHostParent! ).width );

	// Sometimes parent width cannot be accessed. If that happens we should go up in the elements tree
	// and try to get width from next ancestor.
	// https://github.com/ckeditor/ckeditor5/issues/10776
	const ancestorLevelLimit = 5;
	let currentLevel = 0;

	let checkedElement = domResizeHostParent!;

	while ( isNaN( parentWidth ) ) {
		checkedElement = checkedElement.parentElement!;

		if ( ++currentLevel > ancestorLevelLimit ) {
			return 0;
		}

		parentWidth = parseFloat(
				domResizeHostParent!.ownerDocument.defaultView!.getComputedStyle( checkedElement ).width
		);
	}

	return resizeHostRect.width / parentWidth * 100;
}

/**
 * Returns coordinates of the top-left corner of an element, relative to the document's top-left corner.
 *
 * @param resizerPosition The position of the resize handle, e.g. `"top-left"`, `"bottom-right"`.
 */
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

/**
 * @param resizerPosition The expected resizer position, like `"top-left"`, `"bottom-right"`.
 * @returns A prefixed HTML class name for the resizer element.
 */
function getResizerHandleClass( resizerPosition: string ) {
	return `ck-widget__resizer__handle-${ resizerPosition }`;
}

/**
 * Determines the position of a given resize handle.
 *
 * @param domHandle Handle used to calculate the reference point.
 * @returns Returns a string like `"top-left"` or `undefined` if not matched.
 */
function getHandlePosition( domHandle: HTMLElement ) {
	const resizerPositions = [ 'top-left', 'top-right', 'bottom-right', 'bottom-left' ];

	for ( const position of resizerPositions ) {
		if ( domHandle.classList.contains( getResizerHandleClass( position ) ) ) {
			return position;
		}
	}
}

/**
 * @param position Like `"top-left"`.
 * @returns Inverted `position`, e.g. it returns `"bottom-right"` if `"top-left"` was given as `position`.
 */
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
