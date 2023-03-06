/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module minimap/minimapview
 */

import { View } from 'ckeditor5/src/ui';
import { Rect, type Locale } from 'ckeditor5/src/utils';

import MinimapIframeView from './minimapiframeview';
import MinimapPositionTrackerView from './minimappositiontrackerview';

export type MinimapViewOptions = {
	domRootClone: HTMLElement;
	pageStyles: Array<string | { href: string }>;
	scaleRatio: number;
	useSimplePreview?: boolean;
	extraClasses?: string;
};

/**
 * The main view of the minimap. It renders the original content but scaled down with a tracker element
 * visualizing the subset of the content visible to the user and allowing interactions (scrolling, dragging).
 *
 * @internal
 */
export default class MinimapView extends View {
	/**
	 * An instance of the tracker view displayed over the minimap.
	 */
	private readonly _positionTrackerView: MinimapPositionTrackerView;

	/**
	 * The scale ratio of the minimap relative to the original editing DOM root with the content.
	 */
	private readonly _scaleRatio: number;

	/**
	 * An instance of the iframe view that hosts the minimap.
	 */
	private readonly _minimapIframeView: MinimapIframeView;

	/**
	 * Creates an instance of the minimap view.
	 */
	constructor(
		{ locale, scaleRatio, pageStyles, extraClasses, useSimplePreview, domRootClone }: { locale: Locale } & MinimapViewOptions
	) {
		super( locale );

		const bind = this.bindTemplate;

		this._positionTrackerView = new MinimapPositionTrackerView( locale );
		this._positionTrackerView.delegate( 'drag' ).to( this );

		this._scaleRatio = scaleRatio;

		this._minimapIframeView = new MinimapIframeView( locale, {
			useSimplePreview,
			pageStyles,
			extraClasses,
			scaleRatio,
			domRootClone
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-minimap'
				]
			},
			children: [
				this._positionTrackerView
			],
			on: {
				click: bind.to( this._handleMinimapClick.bind( this ) ),
				wheel: bind.to( this._handleMinimapMouseWheel.bind( this ) )
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this._minimapIframeView.destroy();

		super.destroy();
	}

	/**
	 * Returns the DOM {@link module:utils/dom/rect~Rect} height of the minimap.
	 */
	public get height(): number {
		return new Rect( this.element! ).height;
	}

	/**
	 * Returns the number of available space (pixels) the position tracker (visible subset of the content) can use to scroll vertically.
	 */
	public get scrollHeight(): number {
		return Math.max( 0, Math.min( this.height, this._minimapIframeView.height ) - this._positionTrackerView.height );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this._minimapIframeView.render();

		this.element!.appendChild( this._minimapIframeView.element! );
	}

	/**
	 * Sets the new height of the minimap (in px) to respond to the changes in the original editing DOM root.
	 *
	 * **Note**:The provided value should be the `offsetHeight` of the original editing DOM root.
	 */
	public setContentHeight( newHeight: number ): void {
		this._minimapIframeView.setHeight( newHeight * this._scaleRatio );
	}

	/**
	 * Sets the minimap scroll progress.
	 *
	 * The minimap scroll progress is linked to the original editing DOM root and its scrollable container (ancestor).
	 * Changing the progress will alter the vertical position of the minimap (and its position tracker) and give the user an accurate
	 * overview of the visible document.
	 *
	 * **Note**: The value should be between 0 and 1. 0 when the DOM root has not been scrolled, 1 when the
	 * scrolling has reached the end.
	 */
	public setScrollProgress( newScrollProgress: number ): void {
		const iframeView = this._minimapIframeView;
		const positionTrackerView = this._positionTrackerView;

		// The scrolling should end when the bottom edge of the iframe touches the bottom edge of the minimap.
		if ( iframeView.height < this.height ) {
			iframeView.setTopOffset( 0 );
			positionTrackerView.setTopOffset( ( iframeView.height - positionTrackerView.height ) * newScrollProgress );
		} else {
			const totalOffset = iframeView.height - this.height;

			iframeView.setTopOffset( -totalOffset * newScrollProgress );
			positionTrackerView.setTopOffset( ( this.height - positionTrackerView.height ) * newScrollProgress );
		}

		positionTrackerView.setScrollProgress( Math.round( newScrollProgress * 100 ) );
	}

	/**
	 * Sets the new height of the tracker (in px) to visualize the subset of the content visible to the user.
	 */
	public setPositionTrackerHeight( trackerHeight: number ): void {
		this._positionTrackerView.setHeight( trackerHeight * this._scaleRatio );
	}

	/**
	 * @param data DOM event data
	 */
	private _handleMinimapClick( data: Event ) {
		const positionTrackerView = this._positionTrackerView;

		if ( data.target === positionTrackerView.element ) {
			return;
		}

		const trackerViewRect = new Rect( positionTrackerView.element! );
		const diff = ( data as MouseEvent ).clientY - trackerViewRect.top - trackerViewRect.height / 2;
		const percentage = diff / this._minimapIframeView.height;

		this.fire<MinimapClickEvent>( 'click', percentage );
	}

	/**
	 * @param data DOM event data
	 */
	private _handleMinimapMouseWheel( data: Event ) {
		this.fire<MinimapDragEvent>( 'drag', ( data as WheelEvent ).deltaY * this._scaleRatio );
	}
}

/**
 * Fired when the minimap view is clicked.
 *
 * @eventName ~MinimapView#click
 * @param percentage The number between 0 and 1 representing a place in the minimap (its height) that was clicked.
 */
export type MinimapClickEvent = {
	name: 'click';
	args: [ percentage: number ];
};

/**
 * Fired when the position tracker is dragged or the minimap is scrolled via mouse wheel.
 *
 * @eventName ~MinimapView#drag
 * @param movementY The vertical movement of the minimap as a result of dragging or scrolling.
 */
export type MinimapDragEvent = {
	name: 'drag';
	args: [ movementY: number ];
};
