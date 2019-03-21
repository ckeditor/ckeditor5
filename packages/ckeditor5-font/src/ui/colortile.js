/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

export default class ColorTile extends ButtonView {
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'color' );
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
