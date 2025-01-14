/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojigridview
 */

import '../../theme/emojigrid.css';

import { addKeyboardHandlingForGrid, ButtonView, View, type ViewCollection } from 'ckeditor5/src/ui.js';
import { FocusTracker, global, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import type { SkinToneId } from './emojitoneview';
import type { EmojiDatabaseEntry, EmojiCategory } from '../emojidatabase.js';
import { EmojiGroup } from '../emojipicker';

export type EmojiGridViewOptions = {
	emojiGroups: Arrary<EmojiCategory>;
	initialCategory: EmojiCategory[ 'title' ];
	getEmojiBySearchQuery: ( query: string ) => Array<EmojiDatabaseEntry>;
};

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

	declare public isEmpty: boolean;
	declare public currentCategoryName: string;
	declare public searchQuery: string;
	declare public activeEmojiGroup: any;
	declare public selectedSkinTone: SkinToneId;

	private readonly getEmojiBySearchQuery: EmojiGridViewOptions[ 'getEmojiBySearchQuery' ];
	private readonly emojiGroups: EmojiGridViewOptions['emojiGroups'];

	private readonly initialCategory: EmojiGridViewOptions['initialCategory'];

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, { emojiGroups, initialCategory, getEmojiBySearchQuery }: EmojiGridViewOptions ) {
		super( locale );

		this.tiles = this.createCollection() as ViewCollection<ButtonView>;
		this.set( 'isEmpty', true );

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this.getEmojiBySearchQuery = getEmojiBySearchQuery;
		this.emojiGroups = emojiGroups;

		const bind = this.bindTemplate;

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
				}
			],
			attributes: {
				class: [
					'ck',
					'ck-emoji-grid',
					// To avoid issues with focus cycling, ignore a grid when it's empty.
					bind.if( 'isEmpty', 'ck-hidden', value => value )
				]
			}
		} );

		this.on( 'change:currentCategoryName', () => {
			this.activeEmojiGroup = emojiGroups.find( item => item.title === this.currentCategoryName );
			this.filter( '' );
		} );

		this.set( 'searchQuery', '' );
		this.set( 'activeEmojiGroup', '' ); // TODO: ???
		this.set( 'currentCategoryName', initialCategory );
		this.set( 'selectedSkinTone', 'default' );

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

	public filter( pattern: RegExp | null ): any {
		let itemsToRender = this.activeEmojiGroup.items;
		let allItems;

		if ( pattern ) {
			allItems = this.emojiGroups.flatMap( group => group.items );
			itemsToRender = this.getEmojiBySearchQuery( pattern.source );
		}

		const arrayOfMatchingItems = itemsToRender.map( item => {
			const emoji = item.skins[ this.selectedSkinTone ] || item.skins.default;

			return this.createTile( emoji, item.annotation );
		} );

		[ ...this.tiles ].forEach( item => {
			this.focusTracker.remove( item );
		} );

		this.tiles.clear();
		this.tiles.addMany( arrayOfMatchingItems );

		this.set( 'isEmpty', arrayOfMatchingItems.length === 0 );

		arrayOfMatchingItems.forEach( item => {
			this.focusTracker.add( item );
		} );

		return {
			resultsCount: arrayOfMatchingItems.length,
			totalItemsCount: !pattern ? this.activeEmojiGroup.items.length : allItems.length
		};
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

		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.keystrokes.destroy();
		this.focusTracker.destroy();
	}

	/**
	 * Focuses the first focusable in {@link ~EmojiGridView#tiles} if available.
	 */
	public focus(): void {
		const firstTile = this.tiles.first;

		if ( firstTile ) {
			firstTile.focus();
		}
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
