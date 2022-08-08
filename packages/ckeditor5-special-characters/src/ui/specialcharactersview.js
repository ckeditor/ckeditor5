/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/specialcharactersview
 */

import { View, FocusCycler } from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';

/**
 * A view containing navigationView, gridView, infoView of the SpecialCharacters feature.
 *
 * @extends module:ui/view~View
 */
export default class SpecialCharactersView extends View {
	/**
	 * Creates an instance of the SpecialCharacters view.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
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

		this.navigationView = navigationView;
		this.gridView = gridView;
		this.infoView = infoView;

		this.setTemplate( {
			tag: 'div',
			children: [
				this.navigationView,
				this.gridView,
				this.infoView
			]
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
