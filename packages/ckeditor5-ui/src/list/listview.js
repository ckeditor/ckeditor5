/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/list/listview
 */

import View from '../view';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '../focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import '../../theme/components/list/list.css';

/**
 * The list view class.
 *
 * @extends module:ui/view~View
 * @implements module:ui/dropdown/dropdownpanelfocusable~DropdownPanelFocusable
 */
export default class ListView extends View {
	/**
	 * @inheritDoc
	 */
	constructor() {
		super();

		/**
		 * Collection of the child list views.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this.createCollection();

		/**
		 * Tracks information about DOM focus in the list.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * Helps cycling over focusable {@link #items} in the list.
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
				// Navigate list items backwards using the arrowup key.
				focusPrevious: 'arrowup',

				// Navigate toolbar items forwards using the arrowdown key.
				focusNext: 'arrowdown'
			}
		} );

		this.setTemplate( {
			tag: 'ul',

			attributes: {
				class: [
					'ck',
					'ck-reset',
					'ck-list'
				]
			},

			children: this.items
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		// Items added before rendering should be known to the #focusTracker.
		for ( const item of this.items ) {
			this.focusTracker.add( item.element );
		}

		this.items.on( 'add', ( evt, item ) => {
			this.focusTracker.add( item.element );
		} );

		this.items.on( 'remove', ( evt, item ) => {
			this.focusTracker.remove( item.element );
		} );

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
		this._focusCycler.focusFirst();
	}

	/**
	 * Focuses the last focusable in {@link #items}.
	 */
	focusLast() {
		this._focusCycler.focusLast();
	}
}
