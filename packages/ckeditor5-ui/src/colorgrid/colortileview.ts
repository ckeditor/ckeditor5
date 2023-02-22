/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/colorgrid/colortileview
 */

import ButtonView from '../button/buttonview';

import type { Locale } from '@ckeditor/ckeditor5-utils';

import checkIcon from '../../theme/icons/color-tile-check.svg';

/**
 * This class represents a single color tile in the {@link module:ui/colorgrid/colorgridview~ColorGridView}.
 */
export default class ColorTileView extends ButtonView {
	/**
	 * String representing a color shown as tile's background.
	 */
	declare public color: string | undefined;

	/**
	 * A flag that toggles a special CSS class responsible for displaying
	 * a border around the button.
	 */
	declare public hasBorder: boolean;

	constructor( locale?: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'color', undefined );
		this.set( 'hasBorder', false );

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
	public override render(): void {
		super.render();

		this.iconView.fillColor = 'hsl(0, 0%, 100%)';
	}
}
