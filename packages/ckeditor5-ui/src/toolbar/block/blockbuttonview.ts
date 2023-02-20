/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/toolbar/block/blockbuttonview
 */

import ButtonView from '../../button/buttonview';
import '../../../theme/components/toolbar/blocktoolbar.css';

import { toUnit, type Locale } from '@ckeditor/ckeditor5-utils';

const toPx = toUnit( 'px' );

/**
 * The block button view class.
 *
 * This view represents a button attached next to block element where the selection is anchored.
 *
 * See {@link module:ui/toolbar/block/blocktoolbar~BlockToolbar}.
 *
 * @extends {module:ui/button/buttonview~ButtonView}
 */
export default class BlockButtonView extends ButtonView {
	declare public top: number;
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

		/**
		 * Top offset.
		 *
		 * @member {Number} #top
		 */
		this.set( 'top', 0 );

		/**
		 * Left offset.
		 *
		 * @member {Number} #left
		 */
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
