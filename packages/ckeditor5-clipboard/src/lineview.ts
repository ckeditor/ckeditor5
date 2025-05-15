/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module clipboard/lineview
 */

/* istanbul ignore file -- @preserve */

import { View } from '@ckeditor/ckeditor5-ui';
import { toUnit } from '@ckeditor/ckeditor5-utils';

const toPx = /* #__PURE__ */ toUnit( 'px' );

/**
 * The horizontal drop target line view.
 */
export default class LineView extends View {
	/**
	 * Controls whether the line is visible.
	 *
	 * @observable
	 * @default false
	 */
	declare public isVisible: boolean;

	/**
	 * Controls the line position x coordinate.
	 *
	 * @observable
	 * @default null
	 */
	declare public left: number | null;

	/**
	 * Controls the line width.
	 *
	 * @observable
	 * @default null
	 */
	declare public width: number | null;

	/**
	 * Controls the line position y coordinate.
	 *
	 * @observable
	 * @default null
	 */
	declare public top: number | null;

	/**
	 * @inheritDoc
	 */
	constructor() {
		super();

		const bind = this.bindTemplate;

		this.set( {
			isVisible: false,
			left: null,
			top: null,
			width: null
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-clipboard-drop-target-line',
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				],
				style: {
					left: bind.to( 'left', left => toPx( left! ) ),
					top: bind.to( 'top', top => toPx( top! ) ),
					width: bind.to( 'width', width => toPx( width! ) )
				}
			}
		} );
	}
}
