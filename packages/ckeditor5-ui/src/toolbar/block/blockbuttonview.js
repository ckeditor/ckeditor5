/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/toolbar/block/blockbuttonview
 */

import ButtonView from '../../button/buttonview';
import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
import '../../../theme/components/toolbar/blocktoolbar.css';

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
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		// Hide button on init.
		this.isVisible = false;

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
					left: bind.to( 'left', val => toPx( val ) ),
				}
			}
		} );
	}
}
