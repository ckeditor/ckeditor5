/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/charactergridview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import '../../theme/charactergrid.css';

/**
 * A grid of character tiles. Allows browsing special characters and selecting the character to
 * be inserted into the content.
 *
 * @extends module:ui/view~View
 */
export default class CharacterGridView extends View {
	/**
	 * Creates an instance of a character grid containing tiles representing special characters.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {Object} options Component configuration
	 * @param {Number} options.columns A number of columns in the grid.
	 */
	constructor( locale, options ) {
		super( locale );

		const viewStyleAttribute = {};

		if ( options && options.columns ) {
			viewStyleAttribute.gridTemplateColumns = `repeat( ${ options.columns }, 1fr)`;
		}

		/**
		 * Collection of the child tile views. Each tile represents some particular character.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.tiles = this.createCollection();

		this.setTemplate( {
			tag: 'div',
			children: this.tiles,
			attributes: {
				class: [
					'ck',
					'ck-character-grid'
				],
				style: viewStyleAttribute
			}
		} );

		/**
		 * Fired when any {@link #tiles grid tiles} is clicked.
		 *
		 * @event execute
		 * @param {Object} data Additional information about the event.
		 * @param {String} data.name Name of the tile that caused the event (e.g. "greek small letter epsilon").
		 */
	}

	/**
	 * Creates a new tile for the grid.
	 *
	 * @param {String} character A human-readable character displayed as label (e.g. "ε").
	 * @param {String} name A name of the character (e.g. "greek small letter epsilon").
	 * @returns {module:ui/button/button~ButtonView}
	 */
	createTile( character, name ) {
		const tile = new ButtonView( this.locale );

		tile.set( {
			label: character,
			withText: true,
			class: 'ck-character-grid__tile'
		} );

		tile.on( 'execute', () => {
			this.fire( 'execute', { name } );
		} );

		return tile;
	}
}
