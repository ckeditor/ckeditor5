/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojigridview
 */

import '../../theme/emojigrid.css';

import { addKeyboardHandlingForGrid, ButtonView, View, type FilteredView, type ViewCollection } from 'ckeditor5/src/ui.js';
import { FocusTracker, global, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import type { SkinToneId } from './emojitoneview.js';
import type { EmojiDatabaseEntry, EmojiCategory } from '../emojidatabase.js';

export type EmojiGridViewOptions = {
	emojiGroups: Arrary<EmojiCategory>;
	initialCategory: EmojiCategory[ 'title' ];
	getEmojiBySearchQuery: ( query: string ) => Array<EmojiDatabaseEntry>;
};

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
	 * A query provided by a user in the search field.
	 *
	 * @observable
	 * @default ''
	 */
	declare public searchQuery: string;

	/**
	 * Active skin tone.
	 *
	 * @observable
	 * @default 'default'
	 */
	declare public skinTone: SkinToneId;

	/**
	 * Set to `true` when the {@link #tiles} collection is empty.
	 */
	declare private _isEmpty: boolean;

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

	private readonly getEmojiBySearchQuery: EmojiGridViewOptions[ 'getEmojiBySearchQuery' ];
	private readonly emojiGroups: EmojiGridViewOptions['emojiGroups'];

	private readonly initialCategory: EmojiGridViewOptions['initialCategory'];

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, { emojiGroups, initialCategory, getEmojiBySearchQuery }: EmojiGridViewOptions ) {
		super( locale );

		this.set( '_isEmpty', true );

		this.tiles = this.createCollection() as ViewCollection<ButtonView>;
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
					bind.if( '_isEmpty', 'ck-hidden', value => value )
				]
			}
		} );

		this.on( 'change:categoryName', () => {
			this.filter( '' );
		} );

		this.set( 'searchQuery', '' );
		this.set( 'categoryName', initialCategory );
		this.set( 'skinTone', 'default' );

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
	 * Filters the grid view by the given regular expression.
	 *
	 * It filters either by the pattern or an emoji category, but never both.
	 */
	public filter( pattern: RegExp | null ): { resultsCount: number; totalItemsCount: number } {
		const emojiCategory = this.emojiGroups.find( item => item.title === this.categoryName );

		let itemsToRender = emojiCategory.items;
		let allItems;

		// When filtering by a query, the mechanism checks the entire database.
		if ( pattern ) {
			allItems = this.emojiGroups.flatMap( group => group.items );
			itemsToRender = this.getEmojiBySearchQuery( pattern.source );
		}

		const arrayOfMatchingItems = itemsToRender.map( item => {
			const emoji = item.skins[ this.skinTone ] || item.skins.default;

			return this._createTile( emoji, item.annotation );
		} );

		// Clean-up.
		[ ...this.tiles ].forEach( item => {
			this.focusTracker.remove( item );
			this.tiles.remove( item );
		} );

		// Insert new elements.
		arrayOfMatchingItems.forEach( item => {
			this.tiles.add( item );
			this.focusTracker.add( item );
		} );

		this.set( 'isEmpty', arrayOfMatchingItems.length === 0 );

		return {
			resultsCount: arrayOfMatchingItems.length,
			totalItemsCount: !pattern ? emojiCategory.items.length : allItems.length
		};
	}

	/**
	 * Creates a new tile for the grid.
	 *
	 * @param emoji The emoji itself.
	 * @param name The name of the emoji (e.g. "Smiling Face with Smiling Eyes").
	 */
	private _createTile( emoji: string, name: string ): ButtonView {
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
