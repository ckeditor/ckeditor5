/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgetresize/sizeview
 */

import { View } from '@ckeditor/ckeditor5-ui';
import type { ResizerOptions } from '../widgetresize';
import type ResizeState from './resizerstate';

/**
 * A view displaying the proposed new element size during the resizing.
 */
export default class SizeView extends View {
	/**
	 * The visibility of the view defined based on the existence of the host proposed dimensions.
	 *
	 * @internal
	 * @observable
	 * @readonly
	 */
	declare public _isVisible: boolean;

	/**
	 * The text that will be displayed in the `SizeView` child.
	 * It can be formatted as the pixel values (e.g. 10x20) or the percentage value (e.g. 10%).
	 *
	 * @internal
	 * @observable
	 * @readonly
	 */
	declare public _label: string;

	/**
	 * The position of the view defined based on the host size and active handle position.
	 *
	 * @internal
	 * @observable
	 * @readonly
	 */
	declare public _viewPosition: string;

	constructor() {
		super();

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-size-view',
					bind.to( '_viewPosition', value => value ? `ck-orientation-${ value }` : '' )
				],
				style: {
					display: bind.if( '_isVisible', 'none', visible => !visible )
				}
			},
			children: [ {
				text: bind.to( '_label' )
			} ]
		} );
	}

	/**
	 * A method used for binding the `SizeView` instance properties to the `ResizeState` instance observable properties.
	 *
	 * @internal
	 * @param options An object defining the resizer options, used for setting the proper size label.
	 * @param resizeState The `ResizeState` class instance, used for keeping the `SizeView` state up to date.
	 */
	public _bindToState( options: ResizerOptions, resizeState: ResizeState ): void {
		this.bind( '_isVisible' ).to( resizeState, 'proposedWidth', resizeState, 'proposedHeight', ( width, height ) =>
			width !== null && height !== null );

		this.bind( '_label' ).to(
			resizeState, 'proposedHandleHostWidth',
			resizeState, 'proposedHandleHostHeight',
			resizeState, 'proposedWidthPercents',
			( width, height, widthPercents ) => {
				if ( options.unit === 'px' ) {
					return `${ width }×${ height }`;
				} else {
					return `${ widthPercents }%`;
				}
			}
		);

		this.bind( '_viewPosition' ).to(
			resizeState, 'activeHandlePosition',
			resizeState, 'proposedHandleHostWidth',
			resizeState, 'proposedHandleHostHeight',
			// If the widget is too small to contain the size label, display the label above.
			( position, width, height ) => width! < 50 || height! < 50 ? 'above-center' : position!
		);
	}

	/**
	 * A method used for cleaning up. It removes the bindings and hides the view.
	 *
	 * @internal
	 */
	public _dismiss(): void {
		this.unbind();
		this._isVisible = false;
	}
}
