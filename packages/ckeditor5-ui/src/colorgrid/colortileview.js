/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/colorgrid/colortile
 */

import ButtonView from '../button/buttonview';
import checkIcon from '../../theme/icons/color-tile-check.svg';

/**
 * This class represents a single color tile in the {@link module:ui/colorgrid/colorgrid~ColorGridView}.
 *
 * @extends module:ui/button/buttonview~ButtonView
 */
export default class ColorTileView extends ButtonView {
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * String representing a color shown as tile's background.
		 *
		 * @type {String}
		 */
		this.set( 'color' );

		/**
		 * A flag that toggles a special CSS class responsible for displaying
		 * a border around the button.
		 *
		 * @type {Boolean}
		 */
		this.set( 'hasBorder' );

		this.icon = checkIcon;

		this.extendTemplate( {
			attributes: {
				style: {
					backgroundColor: bind.to( 'color' )
				},
				class: [
					'ck',
					'ck-color-grid__tile',
					bind.if( 'hasBorder', 'ck-color-table__color-tile_bordered' )
				]
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.iconView.fillColor = 'hsl(0, 0%, 100%)';
	}
}
