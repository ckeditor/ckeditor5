/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/charactergridview
 */

import {
	View,
	ButtonView,
	addKeyboardHandlingForGrid,
	type ViewCollection
} from 'ckeditor5/src/ui';
import {
	KeystrokeHandler,
	FocusTracker,
	global,
	type Locale
} from 'ckeditor5/src/utils';

import '../../theme/charactergrid.css';

/**
 * A grid of character tiles. It allows browsing special characters and selecting the character to
 * be inserted into the content.
 */
export default class CharacterGridView extends View<HTMLDivElement> {
	/**
	 * A collection of the child tile views. Each tile represents a particular character.
	 */
	public readonly tiles: ViewCollection<ButtonView>;

	/**
	 * Tracks information about the DOM focus in the grid.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Creates an instance of a character grid containing tiles representing special characters.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.tiles = this.createCollection() as ViewCollection<ButtonView>;

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

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		addKeyboardHandlingForGrid( {
			keystrokeHandler: this.keystrokes,
			focusTracker: this.focusTracker,
			gridItems: this.tiles,
			numberOfColumns: () => global.window
				.getComputedStyle( this.element!.firstChild as Element ) // Responsive .ck-character-grid__tiles
				.getPropertyValue( 'grid-template-columns' )
				.split( ' ' )
				.length,
			uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
		} );
	}

	/**
	 * Creates a new tile for the grid.
	 *
	 * @param character A human-readable character displayed as the label (e.g. "ε").
	 * @param name The name of the character (e.g. "greek small letter epsilon").
	 */
	public createTile( character: string, name: string ): ButtonView {
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
			this.fire<CharacterGridViewTileHoverEvent>( 'tileHover', { name, character } );
		} );

		tile.on( 'focus', () => {
			this.fire<CharacterGridViewTileFocusEvent>( 'tileFocus', { name, character } );
		} );

		tile.on( 'execute', () => {
			this.fire<CharacterGridViewExecuteEvent>( 'execute', { name, character } );
		} );

		return tile;
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		for ( const item of this.tiles ) {
			this.focusTracker.add( item.element! );
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

		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.keystrokes.destroy();
	}

	/**
	 * Focuses the first focusable in {@link ~CharacterGridView#tiles}.
	 */
	public focus(): void {
		this.tiles.first!.focus();
	}
}

/**
 * Fired when any of {@link ~CharacterGridView#tiles grid tiles} is clicked.
 *
 * @eventName ~CharacterGridView#execute
 * @param data Additional information about the event.
 */
export type CharacterGridViewExecuteEvent = {
	name: 'execute';
	args: [ data: CharacterGridViewEventData ];
};

/**
 * Fired when a mouse or another pointing device caused the cursor to move onto any {@link ~CharacterGridView#tiles grid tile}
 * (similar to the native `mouseover` DOM event).
 *
 * @eventName ~CharacterGridView#tileHover
 * @param data Additional information about the event.
 */
export type CharacterGridViewTileHoverEvent = {
	name: 'tileHover';
	args: [ data: CharacterGridViewEventData ];
};

/**
 * Fired when {@link ~CharacterGridView#tiles grid tile} is focused (e.g. by navigating with arrow keys).
 *
 * @eventName ~CharacterGridView#tileFocus
 * @param data Additional information about the event.
 */
export type CharacterGridViewTileFocusEvent = {
	name: 'tileFocus';
	args: [ data: CharacterGridViewEventData ];
};

export interface CharacterGridViewEventData {

	/**
	 * The name of the tile that caused the event (e.g. "greek small letter epsilon").
	 */
	name: string;

	/**
	 * A human-readable character displayed as the label (e.g. "ε").
	 */
	character: string;
}
