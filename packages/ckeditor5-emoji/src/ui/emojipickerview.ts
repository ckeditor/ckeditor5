/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojipickerview
 */

import { View, FocusCycler, type SearchInfoView, type ViewCollection, type FocusableView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import type EmojiGridView from './emojigridview.js';
import type EmojiCategoriesView from './emojicategoriesview.js';
import type EmojiSearchView from './emojisearchview.js';
import type EmojiToneView from './emojitoneview.js';

export type EmojiDropdownPanelContent = {
	searchView: EmojiSearchView;
	toneView: EmojiToneView;
	categoriesView: EmojiCategoriesView;
	gridView: EmojiGridView;
	resultsView: SearchInfoView;
};

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
	constructor( locale: Locale, dropdownPanelContent: EmojiDropdownPanelContent ) {
		super( locale );

		this.searchView = dropdownPanelContent.searchView;
		this.categoriesView = dropdownPanelContent.categoriesView;
		this.gridView = dropdownPanelContent.gridView;
		this.toneView = dropdownPanelContent.toneView;
		this.resultsView = dropdownPanelContent.resultsView;

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
						class: [ 'ck', 'ck-search-tone-wrapper' ]
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
}
