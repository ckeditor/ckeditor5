/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ColorTile from './colortile';

export default class ColorGrid extends View {
	constructor( locale, { colorsDefinition = [] } = {} ) {
		super( locale );

		this.items = this.createCollection();

		colorsDefinition.forEach( item => {
			const colorTile = new ColorTile();
			colorTile.set( {
				color: item.color,
				hasBorder: item.options.hasBorder
			} );
			colorTile.delegate( 'execute' ).to( this );
			this.items.add( colorTile );
		} );

		this.setTemplate( {
			tag: 'div',
			children: this.items,
			attributes: {
				class: 'ck-color-table__grid-container'
			}
		} );
	}
}
