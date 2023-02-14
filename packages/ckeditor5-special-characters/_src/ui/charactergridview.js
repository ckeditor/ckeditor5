/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/charactergridview
 */

import { View, ButtonView, addKeyboardHandlingForGrid } from 'ckeditor5/src/ui';

import { KeystrokeHandler, FocusTracker, global } from 'ckeditor5/src/utils';

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
		 * Tracks information about the DOM focus in the grid.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		addKeyboardHandlingForGrid( {
			keystrokeHandler: this.keystrokes,
			focusTracker: this.focusTracker,
			gridItems: this.tiles,
			numberOfColumns: () => global.window
				.getComputedStyle( this.element.firstChild ) // Responsive .ck-character-grid__tiles
				.getPropertyValue( 'grid-template-columns' )
				.split( ' ' )
				.length,
			uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
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

		/**
		 * Fired when {@link #tiles grid tile} is focused (e.g. by navigating with arrow keys).
		 *
		 * @event tileFocus
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
				mouseover: tile.bindTemplate.to( 'mouseover' ),
				focus: tile.bindTemplate.to( 'focus' )
			}
		} );

		tile.on( 'mouseover', () => {
			this.fire( 'tileHover', { name, character } );
		} );

		tile.on( 'focus', () => {
			this.fire( 'tileFocus', { name, character } );
		} );

		tile.on( 'execute', () => {
			this.fire( 'execute', { name, character } );
		} );

		return tile;
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		for ( const item of this.tiles ) {
			this.focusTracker.add( item.element );
		}

		this.tiles.on( 'change', ( eventInfo, { added, removed } ) => {
			if ( added.length > 0 ) {
				for ( const item of added ) {
					this.focusTracker.add( item.element );
				}
			}
			if ( removed.length > 0 ) {
				for ( const item of removed ) {
					this.focusTracker.remove( item.element );
				}
			}
		} );

		this.keystrokes.listenTo( this.element );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this.keystrokes.destroy();
	}

	/**
	 * Focuses the first focusable in {@link #tiles}.
	 */
	focus() {
		this.tiles.get( 0 ).focus();
	}
}
