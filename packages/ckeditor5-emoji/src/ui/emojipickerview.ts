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
import type { EmojiCategory, SkinTone } from '../emojidatabase.js';

/**
 * A view that glues pieces of the emoji dropdown panel together.
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
	public readonly resultsView: SearchInfoView;

	/**
	 * @inheritDoc
	 */
	constructor(
		locale: Locale,
		{ emojiGroups, getEmojiBySearchQuery, skinTone, skinTones }: {
			emojiGroups: Array<EmojiCategory>;
			getEmojiBySearchQuery: EmojiSearchQueryCallback;
			skinTone: SkinToneId;
			skinTones: Array<SkinTone>;
		}
	) {
		super( locale );

		const categoryName = emojiGroups[ 0 ].title;

		this.gridView = new EmojiGridView( locale, {
			categoryName,
			emojiGroups,
			getEmojiBySearchQuery,
			skinTone
		} );
		this.resultsView = new SearchInfoView();
		this.searchView = new EmojiSearchView( locale, {
			gridView: this.gridView,
			resultsView: this.resultsView
		} );
		this.categoriesView = new EmojiCategoriesView( locale, {
			emojiGroups,
			categoryName
		} );
		this.toneView = new EmojiToneView( locale, {
			skinTone,
			skinTones
		} );

		this.items = this.createCollection();
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
						class: [ 'ck', 'ck-emoji-picker-wrapper' ]
					}
				},
				this.categoriesView,
				this.gridView,
				{
					tag: 'div',
					children: [
						this.resultsView
					],
					attributes: {
						class: [ 'ck', 'ck-search__results' ]
					}
				}
			],
			attributes: {
				// Avoid focus loss when the user clicks the area of the grid that is not a button.
				// https://github.com/ckeditor/ckeditor5/pull/12319#issuecomment-1231779819
				tabindex: '-1',
				class: [ 'ck', 'ck-emoji-picker', 'ck-search' ]
			}
		} );

		this.items.add( this.searchView );
		this.items.add( this.toneView );
		this.items.add( this.categoriesView );
		this.items.add( this.gridView );
		this.items.add( this.resultsView );

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
		this.focusTracker.add( this.resultsView.element! );

		// We need to disable listening for all events within the `SearchTextView` view.
		// Otherwise, its own focus tracker interfere with `EmojiPickerView` which leads to unexpected results.
		// TODO: Could we reuse `keystrokes` from `inputView` instead creating a new one?
		this.searchView.inputView.keystrokes.stopListening();

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
	 * Focuses the first focusable in {@link #items}.
	 */
	public focus(): void {
		this.focusCycler.focusFirst();
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
				this.resultsView.set( {
					primaryText: t( 'Keep on typing to see the results.' ),
					secondaryText: t( 'The query must contain at least two characters.' ),
					isVisible: true
				} );
			} else if ( !data.resultsCount ) {
				this.resultsView.set( {
					primaryText: t( 'No emojis were found matching "%0".', data.query ),
					secondaryText: t( 'Please try a different phrase or check the spelling.' ),
					isVisible: true
				} );
			} else {
				this.resultsView.set( {
					isVisible: false
				} );
			}

			// TODO: So far, it does not work as expected.
			// Messaging can impact a balloon's position. Let's update it.
			// this.fire( 'update' );
		} );

		// Update the grid of emojis when the selected category is changed.
		this.categoriesView.on<ObservableChangeEvent<string>>( 'change:categoryName', ( ev, args, categoryName ) => {
			this.gridView.categoryName = categoryName;
			this.searchView.search( '' );
		} );

		// Update the grid of emojis when the selected skin tone is changed.
		// In such a case, the displayed emoji should use an updated skin tone value.
		this.toneView.on<ObservableChangeEvent>( 'change:skinTone', ( evt, propertyName, newValue ) => {
			this.gridView.skinTone = newValue;
			this.searchView.search( this.searchView.getInputValue() );
		} );
	}
}
