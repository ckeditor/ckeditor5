/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module special-characters/ui/specialcharactersview
 */

import { View, FocusCycler, type ViewCollection, type FocusableView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import type CharacterGridView from './charactergridview.js';
import type CharacterInfoView from './characterinfoview.js';
import type SpecialCharactersCategoriesView from './specialcharacterscategoriesview.js';

/**
 * A view that glues pieces of the special characters dropdown panel together:
 *
 * * the navigation view (allows selecting the category),
 * * the grid view (displays characters as a grid),
 * * and the info view (displays detailed info about a specific character).
 */
export default class SpecialCharactersView extends View<HTMLDivElement> {
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
	 * An instance of the `SpecialCharactersCategoriesView`.
	 */
	public categoriesView: SpecialCharactersCategoriesView;

	/**
	 * An instance of the `CharacterGridView`.
	 */
	public gridView: CharacterGridView;

	/**
	 * An instance of the `CharacterInfoView`.
	 */
	public infoView: CharacterInfoView;

	/**
	 * Creates an instance of the `SpecialCharactersView`.
	 */
	constructor(
		locale: Locale,
		categoriesView: SpecialCharactersCategoriesView,
		gridView: CharacterGridView,
		infoView: CharacterInfoView
	) {
		super( locale );

		this.categoriesView = categoriesView;
		this.gridView = gridView;
		this.infoView = infoView;
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

		this.items.add( this.categoriesView );
		this.items.add( this.gridView );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

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
