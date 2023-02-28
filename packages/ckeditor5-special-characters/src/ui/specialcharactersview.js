/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/specialcharactersview
 */

import { View, FocusCycler } from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';

/**
 * A view that glues pieces of the special characters dropdown panel together:
 *
 * * the navigation view (allows selecting the category),
 * * the grid view (displays characters as a grid),
 * * and the info view (displays detailed info about a specific character).
 *
 * @extends module:ui/view~View
 */
export default class SpecialCharactersView extends View {
	/**
	 * Creates an instance of the `SpecialCharactersView`.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 * @param {module:special-characters/ui/specialcharactersnavigationview~SpecialCharactersNavigationView} navigationView
	 * @param {module:special-characters/ui/charactergridview~CharacterGridView} gridView
	 * @param {module:special-characters/ui/characterinfoview~CharacterInfoView} infoView
	 */
	constructor( locale, navigationView, gridView, infoView ) {
		super( locale );

		/**
		 * A collection of the focusable children of the view.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this.createCollection();

		/**
		 * Tracks information about the DOM focus in the view.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * Helps cycling over focusable {@link #items} in the view.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._focusCycler = new FocusCycler( {
			focusables: this.items,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				focusPrevious: 'shift + tab',
				focusNext: 'tab'
			}
		} );

		/**
		 * An instance of the `SpecialCharactersNavigationView`.
		 *
		 * @member {module:special-characters/ui/specialcharactersnavigationview~SpecialCharactersNavigationView}
		 */
		this.navigationView = navigationView;

		/**
		 * An instance of the `CharacterGridView`.
		 *
		 * @member {module:special-characters/ui/charactergridview~CharacterGridView}
		 */
		this.gridView = gridView;

		/**
		 * An instance of the `CharacterInfoView`.
		 *
		 * @member {module:special-characters/ui/characterinfoview~CharacterInfoView}
		 */
		this.infoView = infoView;

		this.setTemplate( {
			tag: 'div',
			children: [
				this.navigationView,
				this.gridView,
				this.infoView
			],
			attributes: {
				// Avoid focus loss when the user clicks the area of the grid that is not a button.
				// https://github.com/ckeditor/ckeditor5/pull/12319#issuecomment-1231779819
				tabindex: '-1'
			}
		} );

		this.items.add( this.navigationView.groupDropdownView.buttonView );
		this.items.add( this.gridView );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.focusTracker.add( this.navigationView.groupDropdownView.buttonView.element );
		this.focusTracker.add( this.gridView.element );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Focuses the first focusable in {@link #items}.
	 */
	focus() {
		this.navigationView.focus();
	}
}
