/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '@ckeditor/ckeditor5-ui/src/view';

export default class ColorTile extends View {
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'color' );
		this.set( 'label' );
		this.set( 'hasBorder' );

		this.setTemplate( {
			tag: 'span',
			attributes: {
				style: {
					backgroundColor: bind.to( 'color' )
				},
				class: [
					'ck-color-table__color-tile',
					bind.if( 'hasBorder', 'ck-color-table__color-tile_bordered' )
				]
			},
			on: {
				click: bind.to( () => {
					this.fire( 'execute', { value: this.color, hasBorder: this.hasBorder } );
				} )
			}
		} );
	}
}
