/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/ui/emojipickerview
 */

import { View, FocusCycler, type ViewCollection, type FocusableView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import type EmojiGridView from './emojigridview.js';
import type EmojiCategoriesView from './emojicategoriesview.js';
import type EmojiSearchView from './emojisearchview.js';
import type EmojiInfoView from './emojiinfoview.js';
import type EmojiToneView from './emojitoneview.js';
import type { DropdownPanelContent } from '../emojipicker.js';

/**
 * A view that glues pieces of the special characters dropdown panel together:
 *
 * * the navigation view (allows selecting the category),
 * * the grid view (displays characters as a grid),
 * * and the info view (displays detailed info about a specific character).
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
	protected readonly _focusCycler: FocusCycler;

	/**
	 * An instance of the `EmojiSearchView`.
	 */
	public searchView: EmojiSearchView;

	/**
	 * An instance of the `EmojiToneView`.
	 */
	public toneView: EmojiToneView;

	/**
	 * An instance of the `EmojiCategoriesView`.
	 */
	public categoriesView: EmojiCategoriesView;

	/**
	 * An instance of the `EmojiGridView`.
	 */
	public gridView: EmojiGridView;

	/**
	 * An instance of the `EmojiInfoView`.
	 */
	public infoView: EmojiInfoView;

	/**
	 * Creates an instance of the `EmojiPickerView`.
	 */
	constructor( locale: Locale, dropdownPanelContent: DropdownPanelContent ) {
		super( locale );

		this.searchView = dropdownPanelContent.searchView;
		this.toneView = dropdownPanelContent.toneView;
		this.categoriesView = dropdownPanelContent.categoriesView;
		this.gridView = dropdownPanelContent.gridView;
		this.infoView = dropdownPanelContent.infoView;
		this.items = this.createCollection();
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this._focusCycler = new FocusCycler( {
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
				this.infoView
			],
			attributes: {
				// Avoid focus loss when the user clicks the area of the grid that is not a button.
				// https://github.com/ckeditor/ckeditor5/pull/12319#issuecomment-1231779819
				tabindex: '-1'
			}
		} );

		this.items.add( this.searchView );
		this.items.add( this.toneView );
		this.items.add( this.categoriesView );
		this.items.add( this.gridView );
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
		this._focusCycler.focusFirst();
	}
}
