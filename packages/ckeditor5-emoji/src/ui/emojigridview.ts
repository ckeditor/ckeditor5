/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojigridview
 */

import '../../theme/emojigrid.css';

import { addKeyboardHandlingForGrid, ButtonView, View, type ViewCollection } from 'ckeditor5/src/ui.js';
import { FocusTracker, global, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';

/**
 * A grid of emoji tiles. It allows browsing emojis and selecting them to be inserted into the content.
 */
export default class EmojiGridView extends View<HTMLDivElement> {
	/**
	 * A collection of the child tile views. Each tile represents a particular emoji.
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
	 * @inheritDoc
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
							'ck-emoji-grid__tiles'
						]
					},
					children: this.tiles
				},
				{
					tag: 'div',
					attributes: {
						class: [
							'ck',
							'ck-emoji-nothing-found',
							'hidden'
						]
					},
					children: [ { text: 'Nothing found.' } ]
				}
			],
			attributes: {
				class: [
					'ck',
					'ck-emoji-grid'
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
				.getComputedStyle( this.element!.firstChild as Element ) // Responsive .ck-emoji-grid__tiles
				.getPropertyValue( 'grid-template-columns' )
				.split( ' ' )
				.length,
			uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
		} );
	}

	/**
	 * Creates a new tile for the grid.
	 *
	 * @param emoji The emoji itself.
	 * @param name The name of the emoji (e.g. "Smiling Face with Smiling Eyes").
	 */
	public createTile( emoji: string, name: string ): ButtonView {
		const tile = new ButtonView( this.locale );

		tile.set( {
			label: emoji,
			withText: true,
			class: 'ck-emoji-grid__tile'
		} );

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
			this.fire<EmojiGridViewTileHoverEvent>( 'tileHover', { name, emoji } );
		} );

		tile.on( 'focus', () => {
			this.fire<EmojiGridViewTileFocusEvent>( 'tileFocus', { name, emoji } );
		} );

		tile.on( 'execute', () => {
			this.fire<EmojiGridViewExecuteEvent>( 'execute', { name, emoji } );
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
			const nothingFoundDiv = document.querySelector( '.ck.ck-emoji-nothing-found' )!;

			if ( this.tiles.length === 0 ) {
				nothingFoundDiv.classList.remove( 'hidden' );
			} else {
				nothingFoundDiv.classList.add( 'hidden' );
			}

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
	 * Focuses the first focusable in {@link ~EmojiGridView#tiles}.
	 */
	public focus(): void {
		this.tiles.first!.focus();
	}
}

/**
 * Fired when any of {@link ~EmojiGridView#tiles grid tiles} is clicked.
 *
 * @eventName ~EmojiGridView#execute
 * @param data Additional information about the event.
 */
export type EmojiGridViewExecuteEvent = {
	name: 'execute';
	args: [ data: EmojiGridViewEventData ];
};

/**
 * Fired when a mouse or another pointing device caused the cursor to move onto any {@link ~EmojiGridView#tiles grid tile}
 * (similar to the native `mouseover` DOM event).
 *
 * @eventName ~EmojiGridView#tileHover
 * @param data Additional information about the event.
 */
export type EmojiGridViewTileHoverEvent = {
	name: 'tileHover';
	args: [ data: EmojiGridViewEventData ];
};

/**
 * Fired when {@link ~EmojiGridView#tiles grid tile} is focused (e.g. by navigating with arrow keys).
 *
 * @eventName ~EmojiGridView#tileFocus
 * @param data Additional information about the event.
 */
export type EmojiGridViewTileFocusEvent = {
	name: 'tileFocus';
	args: [ data: EmojiGridViewEventData ];
};

export interface EmojiGridViewEventData {

	/**
	 * The name of the emoji (e.g. "Smiling Face with Smiling Eyes").
	 */
	name: string;

	/**
	 * The emoji itself.
	 */
	emoji: string;
}
