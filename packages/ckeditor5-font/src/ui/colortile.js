/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/ui/colortile
 */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

/**
 * Class represents single color tile possible to click in dropdown. Element was designed
 * for being used in {@link module:font/ui/colorgrid~ColorGrid}.
 *
 * @extends module:ui/button/buttonview~ButtonView
 */
export default class ColorTile extends ButtonView {
	constructor( locale ) {
		super( locale );
		const bind = this.bindTemplate;

		/**
		 * String representing color which will be shown as tile's background.
		 * @type {String}
		 */
		this.set( 'color' );

		/**
		 * Parameter which trigger adding special CSS class to button.
		 * This class is responsible for displaying border around button.
		 * @type {Boolean}
		 */
		this.set( 'hasBorder' );

		this.extendTemplate( {
			attributes: {
				style: {
					backgroundColor: bind.to( 'color' )
				},
				class: [
					'ck-color-table__color-tile',
					bind.if( 'hasBorder', 'ck-color-table__color-tile_bordered' )
				]
			}
		} );
	}
}
