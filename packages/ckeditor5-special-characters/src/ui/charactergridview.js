/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/charactergridview
 */

import { View, ButtonView } from 'ckeditor5/src/ui';

import '../../theme/charactergrid.css';

/**
 * A grid of character tiles. It allows browsing special characters and selecting the character to
 * be inserted into the content.
 *
 * @extends module:ui/view~View
 */
export default class CharacterGridView extends View {
	/**
	 * Creates an instance of a character grid containing tiles representing special characters.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * A collection of the child tile views. Each tile represents a particular character.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.tiles = this.createCollection();

		this.setTemplate( {
			tag: 'div',
			children: [
				{
					tag: 'div',
					attributes: {
						class: [
							'ck',
							'ck-character-grid__tiles'
						]
					},
					children: this.tiles
				}
			],
			attributes: {
				class: [
					'ck',
					'ck-character-grid'
				]
			}
		} );

		/**
		 * Fired when any of {@link #tiles grid tiles} is clicked.
		 *
		 * @event execute
		 * @param {Object} data Additional information about the event.
		 * @param {String} data.name The name of the tile that caused the event (e.g. "greek small letter epsilon").
		 * @param {String} data.character A human-readable character displayed as the label (e.g. "ε").
		 */

		/**
		 * Fired when a mouse or another pointing device caused the cursor to move onto any {@link #tiles grid tile}
		 * (similar to the native `mouseover` DOM event).
		 *
		 * @event tileHover
		 * @param {Object} data Additional information about the event.
		 * @param {String} data.name The name of the tile that caused the event (e.g. "greek small letter epsilon").
		 * @param {String} data.character A human-readable character displayed as the label (e.g. "ε").
		 */
	}

	/**
	 * Creates a new tile for the grid.
	 *
	 * @param {String} character A human-readable character displayed as the label (e.g. "ε").
	 * @param {String} name The name of the character (e.g. "greek small letter epsilon").
	 * @returns {module:ui/button/buttonview~ButtonView}
	 */
	createTile( character, name ) {
		const tile = new ButtonView( this.locale );

		tile.set( {
			label: character,
			withText: true,
			class: 'ck-character-grid__tile'
		} );

		// Labels are vital for the users to understand what character they're looking at.
		// For now we're using native title attribute for that, see #5817.
		tile.extendTemplate( {
			attributes: {
				title: name
			},
			on: {
				mouseover: tile.bindTemplate.to( 'mouseover' )
			}
		} );

		tile.on( 'mouseover', () => {
			this.fire( 'tileHover', { name, character } );
		} );

		tile.on( 'execute', () => {
			this.fire( 'execute', { name, character } );
		} );

		return tile;
	}
}
