/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/toolbar/block/blockbuttonview
 */

import ButtonView from '../../button/buttonview.js';

import { toUnit, type Locale } from '@ckeditor/ckeditor5-utils';

import '../../../theme/components/toolbar/blocktoolbar.css';

const toPx = /* #__PURE__ */ toUnit( 'px' );

/**
 * The block button view class.
 *
 * This view represents a button attached next to block element where the selection is anchored.
 *
 * See {@link module:ui/toolbar/block/blocktoolbar~BlockToolbar}.
 */
export default class BlockButtonView extends ButtonView {
	/**
	 * Top offset.
	 *
	 * @observable
	 */
	declare public top: number;

	/**
	 * Left offset.
	 *
	 * @observable
	 */
	declare public left: number;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		// Hide button on init.
		this.isVisible = false;

		this.isToggleable = true;

		this.set( 'top', 0 );
		this.set( 'left', 0 );

		this.extendTemplate( {
			attributes: {
				class: 'ck-block-toolbar-button',
				style: {
					top: bind.to( 'top', val => toPx( val ) ),
					left: bind.to( 'left', val => toPx( val ) )
				}
			}
		} );
	}
}
