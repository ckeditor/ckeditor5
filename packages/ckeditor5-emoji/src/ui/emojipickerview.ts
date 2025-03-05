/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojipickerview
 */

import {
	FocusCycler,
	SearchInfoView,
	View,
	type FocusableView,
	type ViewCollection,
	type SearchTextViewSearchEvent
} from 'ckeditor5/src/ui.js';
import {
	FocusTracker,
	KeystrokeHandler,
	type Locale,
	type ObservableChangeEvent
} from 'ckeditor5/src/utils.js';
import EmojiGridView, { type EmojiSearchQueryCallback } from './emojigridview.js';
import EmojiCategoriesView from './emojicategoriesview.js';
import EmojiSearchView from './emojisearchview.js';
import EmojiToneView from './emojitoneview.js';
import type { SkinToneId } from '../emojiconfig.js';
import type { EmojiCategory, SkinTone } from '../emojirepository.js';

/**
 * A view that glues pieces of the emoji panel together.
 */
export default class EmojiPickerView extends View<HTMLDivElement> {
	/**
	 * A collection of the focusable children of the view.
	 */
	public readonly items: ViewCollection<FocusableView>;

	/**
	 * Tracks information about the DOM focus in the view.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Helps cycling over focusable {@link #items} in the view.
	 */
	public readonly focusCycler: FocusCycler;

	/**
	 * An instance of the `EmojiSearchView`.
	 */
	public readonly searchView: EmojiSearchView;

	/**
	 * An instance of the `EmojiToneView`.
	 */
	public readonly toneView: EmojiToneView;

	/**
	 * An instance of the `EmojiCategoriesView`.
	 */
	public readonly categoriesView: EmojiCategoriesView;

	/**
	 * An instance of the `EmojiGridView`.
	 */
	public readonly gridView: EmojiGridView;

	/**
	 * An instance of the `EmojiGridView`.
	 */
	public readonly infoView: SearchInfoView;

	/**
	 * @inheritDoc
	 */
	constructor(
		locale: Locale,
		{ emojiCategories, getEmojiByQuery, skinTone, skinTones }: {
			emojiCategories: Array<EmojiCategory>;
			getEmojiByQuery: EmojiSearchQueryCallback;
			skinTone: SkinToneId;
			skinTones: Array<SkinTone>;
		}
	) {
		super( locale );

		const categoryName = emojiCategories[ 0 ].title;

		this.gridView = new EmojiGridView( locale, {
			categoryName,
			emojiCategories,
			getEmojiByQuery,
			skinTone
		} );
		this.infoView = new SearchInfoView();
		this.searchView = new EmojiSearchView( locale, {
			gridView: this.gridView,
			resultsView: this.infoView
		} );
		this.categoriesView = new EmojiCategoriesView( locale, {
			emojiCategories,
			categoryName
		} );
		this.toneView = new EmojiToneView( locale, {
			skinTone,
			skinTones
		} );

		this.items = this.createCollection( [
			this.searchView,
			this.toneView,
			this.categoriesView,
			this.gridView,
			this.infoView
		] );

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.focusCycler = new FocusCycler( {
			focusables: this.items,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				focusPrevious: 'shift + tab',
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'div',
			children: [
				{
					tag: 'div',
					children: [
						this.searchView,
						this.toneView
					],
					attributes: {
						class: [ 'ck', 'ck-emoji__search' ]
					}
				},
				this.categoriesView,
				this.gridView,
				{
					tag: 'div',
					children: [
						this.infoView
					],
					attributes: {
						class: [ 'ck', 'ck-search__results' ]
					}
				}
			],
			attributes: {
				tabindex: '-1',
				class: [ 'ck', 'ck-emoji', 'ck-search' ]
			}
		} );

		this._setupEventListeners();
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.focusTracker.add( this.searchView.element! );
		this.focusTracker.add( this.toneView.element! );
		this.focusTracker.add( this.categoriesView.element! );
		this.focusTracker.add( this.gridView.element! );
		this.focusTracker.add( this.infoView.element! );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Focuses the search input.
	 */
	public focus(): void {
		this.searchView.focus();
	}

	/**
	 * Initializes interactions between sub-views.
	 */
	private _setupEventListeners(): void {
		const t = this.locale!.t;

		// Disable the category switcher when filtering by a query.
		this.searchView.on<SearchTextViewSearchEvent>( 'search', ( evt, data ) => {
			if ( data.query ) {
				this.categoriesView.disableCategories();
			} else {
				this.categoriesView.enableCategories();
			}
		} );

		// Show a user-friendly message depending on the search query.
		this.searchView.on<SearchTextViewSearchEvent>( 'search', ( evt, data ) => {
			if ( data.query.length === 1 ) {
				this.infoView.set( {
					primaryText: t( 'Keep on typing to see the emoji.' ),
					secondaryText: t( 'The query must contain at least two characters.' ),
					isVisible: true
				} );
			} else if ( !data.resultsCount ) {
				this.infoView.set( {
					primaryText: t( 'No emojis were found matching "%0".', data.query ),
					secondaryText: t( 'Please try a different phrase or check the spelling.' ),
					isVisible: true
				} );
			} else {
				this.infoView.set( {
					isVisible: false
				} );
			}
		} );

		// Emit an update event to react to balloon dimensions changes.
		this.searchView.on<SearchTextViewSearchEvent>( 'search', () => {
			this.fire<EmojiPickerViewUpdateEvent>( 'update' );
			this.gridView.element!.scrollTo( 0, 0 );
		} );

		// Update the grid of emojis when the selected category is changed.
		this.categoriesView.on<ObservableChangeEvent<string>>( 'change:categoryName', ( ev, args, categoryName ) => {
			this.gridView.categoryName = categoryName;
			this.searchView.search( '' );
		} );

		// Update the grid of emojis when the selected skin tone is changed.
		// In such a case, the displayed emoji should use an updated skin tone value.
		this.toneView.on<ObservableChangeEvent<SkinToneId>>( 'change:skinTone', ( evt, propertyName, newValue ) => {
			this.gridView.skinTone = newValue;
			this.searchView.search( this.searchView.getInputValue() );
		} );
	}
}

/**
 * Fired when the  {@link module:emoji/ui/emojipickerview~EmojiPickerView} layout is changed, either by filtering emoji tiles or
 * showing a hint to a user regarding the provided query.
 *
 * @eventName ~EmojiPickerView#update
 */
export type EmojiPickerViewUpdateEvent = {
	name: 'update';
	args: [];
};
