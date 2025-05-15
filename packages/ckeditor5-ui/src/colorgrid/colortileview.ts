/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/colorgrid/colortileview
 */

import { IconColorTileCheck } from '@ckeditor/ckeditor5-icons';
import { env, type Locale } from '@ckeditor/ckeditor5-utils';
import ButtonView from '../button/buttonview.js';

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

		this.icon = IconColorTileCheck;

		this.extendTemplate( {
			attributes: {
				style: {
					// https://github.com/ckeditor/ckeditor5/issues/14907
					backgroundColor: bind.to( 'color', color => env.isMediaForcedColors ? null : color )
				},
				class: [
					'ck',
					'ck-color-grid__tile',
					bind.if( 'hasBorder', 'ck-color-selector__color-tile_bordered' )
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
