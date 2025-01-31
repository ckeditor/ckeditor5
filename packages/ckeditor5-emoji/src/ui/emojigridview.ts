/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojigridview
 */

import { addKeyboardHandlingForGrid, ButtonView, type FilteredView, View, type ViewCollection } from 'ckeditor5/src/ui.js';
import { FocusTracker, global, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import type { EmojiCategory, EmojiEntry } from '../emojirepository.js';
import type { SkinToneId } from '../emojiconfig.js';

import '../../theme/emojigrid.css';

/**
 * A grid of emoji tiles. It allows browsing emojis and selecting them to be inserted into the content.
 */
export default class EmojiGridView extends View<HTMLDivElement> implements FilteredView {
	/**
	 * Defines the active category name.
	 *
	 * @observable
	 */
	declare public categoryName: string;

	/**
	 * Active skin tone.
	 *
	 * @observable
	 */
	declare public skinTone: SkinToneId;

	/**
	 * Set to `true` when the {@link #tiles} collection does not contain items to display.
	 *
	 * @observable
	 */
	declare public isEmpty: boolean;

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
	 * An array containing all emojis grouped by their categories.
	 */
	public readonly emojiCategories: Array<EmojiCategory>;

	/**
	 * A collection of all already created tile views. Each tile represents a particular emoji.
	 * The cached tiles collection is used for efficiency purposes to avoid re-creating a particular
	 * tile again when the grid view has changed.
	 */
	public readonly cachedTiles: ViewCollection<ButtonView>;

	/**
	 * A callback used to filter grid items by a specified query.
	 */
	private readonly _getEmojiByQuery: EmojiSearchQueryCallback;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, { categoryName, emojiCategories, getEmojiByQuery, skinTone }: {
		categoryName: string;
		emojiCategories: Array<EmojiCategory>;
		getEmojiByQuery: EmojiSearchQueryCallback;
		skinTone: SkinToneId;
	} ) {
		super( locale );

		this.set( 'isEmpty', true );
		this.set( 'categoryName', categoryName );
		this.set( 'skinTone', skinTone );

		this.tiles = this.createCollection() as ViewCollection<ButtonView>;
		this.cachedTiles = this.createCollection() as ViewCollection<ButtonView>;

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this._getEmojiByQuery = getEmojiByQuery;
		this.emojiCategories = emojiCategories;

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'div',
			children: [
				{
					tag: 'div',
					attributes: {
						role: 'grid',
						class: [
							'ck',
							'ck-emoji__grid'
						]
					},
					children: this.tiles
				}
			],
			attributes: {
				role: 'tabpanel',
				class: [
					'ck',
					'ck-emoji__tiles',
					// To avoid issues with focus cycling, ignore a grid when it's empty.
					bind.if( 'isEmpty', 'ck-hidden', value => value )
				]
			}
		} );

		addKeyboardHandlingForGrid( {
			keystrokeHandler: this.keystrokes,
			focusTracker: this.focusTracker,
			gridItems: this.tiles,
			numberOfColumns: () => global.window
				.getComputedStyle( this.element!.firstChild as Element ) // Responsive `.ck-emoji-grid__tiles`.
				.getPropertyValue( 'grid-template-columns' )
				.split( ' ' )
				.length,
			uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
		} );
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

	/**
	 * Filters the grid view by the given regular expression.
	 *
	 * It filters either by the pattern or an emoji category, but never both.
	 *
	 * @param pattern Expression to search or `null` when filter by category name.
	 */
	public filter( pattern: RegExp | null ): { resultsCount: number; totalItemsCount: number } {
		const { matchingItems, allItems } = pattern ? this._getItemsByQuery( pattern.source ) : this._getItemsByCategory();

		this._updateGrid( matchingItems );
		this.set( 'isEmpty', matchingItems.length === 0 );

		return {
			resultsCount: matchingItems.length,
			totalItemsCount: allItems.length
		};
	}

	/**
	 * Filters emojis to show based on the specified query phrase.
	 *
	 * @param query A query used to filter the grid.
	 */
	private _getItemsByQuery( query: string ): { matchingItems: Array<EmojiEntry>; allItems: Array<EmojiEntry> } {
		return {
			matchingItems: this._getEmojiByQuery( query ),
			allItems: this.emojiCategories.flatMap( group => group.items )
		};
	}

	/**
	 * Returns emojis that belong to the specified category.
	 */
	private _getItemsByCategory(): { matchingItems: Array<EmojiEntry>; allItems: Array<EmojiEntry> } {
		const emojiCategory = this.emojiCategories.find( item => item.title === this.categoryName )!;
		const { items } = emojiCategory;

		return {
			matchingItems: items,
			allItems: items
		};
	}

	/**
	 * Updates the grid by removing the existing items and insert the new ones.
	 *
	 * @param items An array of items to insert.
	 */
	private _updateGrid( items: Array<EmojiEntry> ): void {
		// Clean-up.
		[ ...this.tiles ].forEach( item => {
			this.focusTracker.remove( item );
			this.tiles.remove( item );
		} );

		items
			// Create tiles from matching results.
			.map( item => {
				const emoji = item.skins[ this.skinTone ] || item.skins.default;

				return this.cachedTiles.get( emoji ) || this._createTile( emoji, item.annotation );
			} )
			// Insert new elements.
			.forEach( item => {
				this.tiles.add( item );
				this.focusTracker.add( item );
			} );
	}

	/**
	 * Creates a new tile for the grid. Created tile is added to the {@link #cachedTiles} collection for further usage, if needed.
	 *
	 * @param emoji The emoji itself.
	 * @param name The name of the emoji (e.g. "Smiling Face with Smiling Eyes").
	 */
	private _createTile( emoji: string, name: string ): ButtonView {
		const tile = new ButtonView( this.locale );

		tile.viewUid = emoji;

		tile.extendTemplate( {
			attributes: {
				class: [
					'ck-emoji__tile'
				]
			}
		} );

		tile.set( {
			label: emoji,
			tooltip: name,
			withText: true,
			ariaLabel: name,
			// To improve accessibility, disconnect a button and its label connection so that screen
			// readers can read the `[aria-label]` attribute directly from the more descriptive button.
			ariaLabelledBy: undefined
		} );

		tile.on( 'execute', () => {
			this.fire<EmojiGridViewExecuteEvent>( 'execute', { name, emoji } );
		} );

		this.cachedTiles.add( tile );

		return tile;
	}
}

/**
 * A callback used to filter grid items by a specified query.
 */
export type EmojiSearchQueryCallback = ( query: string ) => Array<EmojiEntry>;

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

export type EmojiGridViewEventData = {

	/**
	 * The name of the emoji (e.g. "Smiling Face with Smiling Eyes").
	 */
	name: string;

	/**
	 * The emoji itself.
	 */
	emoji: string;
};
