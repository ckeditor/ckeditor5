/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/symboltileview
 */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

/**
 * @extends module:ui/button/buttonview~ButtonView
 */
export default class SymbolTileView extends ButtonView {
	constructor( locale ) {
		super( locale );

		/**
		 * String representing a symbol shown as tile's value.
		 *
		 * @type {String}
		 */
		this.set( 'symbol' );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck',
					'ck-symbol-grid__tile',
				]
			}
		} );
	}
}
