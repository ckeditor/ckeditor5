/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/list/listview
 */

import View from '../view';
import Template from '../template';
import FocusTracker from 'ckeditor5-utils/src/focustracker';
import FocusCycler from '../focuscycler';
import KeystrokeHandler from 'ckeditor5-utils/src/keystrokehandler';

/**
 * The list view class.
 *
 * @extends module:ui/view~View
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
		 * Instance of the {@link module:core/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:core/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * Helps cycling over focusable {@link #items} in the list.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._focusCycler = new FocusCycler( this.items, this.focusTracker );

		this.template = new Template( {
			tag: 'ul',

			attributes: {
				class: [
					'ck-reset',
					'ck-list'
				]
			},

			children: this.items
		} );

		this.items.on( 'add', ( evt, item ) => {
			this.focusTracker.add( item.element );
		} );

		this.items.on( 'remove', ( evt, item ) => {
			this.focusTracker.remove( item.element );
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.keystrokes.listenTo( this.element );

		this.keystrokes.set( 'arrowup', ( data, cancel ) => {
			const previousFocusable = this._focusCycler.previous;

			if ( previousFocusable ) {
				previousFocusable.focus();
			}

			cancel();
		} );

		this.keystrokes.set( 'arrowdown', ( data, cancel ) => {
			const nextFocusable = this._focusCycler.next;

			if ( nextFocusable ) {
				nextFocusable.focus();
			}

			cancel();
		} );

		return super.init();
	}

	/**
	 * Focuses the first focusable in {@link #items}.
	 */
	focus() {
		// Find the very first list item that can be focused.
		const firstFocusable = this._focusCycler.first;

		if ( firstFocusable ) {
			firstFocusable.focus();
		}
	}

	/**
	 * Focuses the last focusable in {@link #items}.
	 */
	focusLast() {
		// Find the last list item that can be focused.
		const lastFocusable = this._focusCycler.last;

		if ( lastFocusable ) {
			lastFocusable.focus();
		}
	}
}
