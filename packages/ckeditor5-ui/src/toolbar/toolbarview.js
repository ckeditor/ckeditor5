/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/toolbar/toolbarview
 */

import View from '../view';
import Template from '../template';
import FocusTracker from 'ckeditor5-utils/src/focustracker';
import FocusCycler from '../focuscycler';
import KeystrokeHandler from 'ckeditor5-utils/src/keystrokehandler';

/**
 * The toolbar view class.
 *
 * @extends module:ui/view~View
 */
export default class ToolbarView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * Collection of the toolbar items (like buttons).
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
		 * Helps cycling over focusable {@link #items} in the toolbar.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._focusCycler = new FocusCycler( this.items, this.focusTracker );

		this.template = new Template( {
			tag: 'div',
			attributes: {
				class: [
					'ck-toolbar'
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

		const focusNext = ( data, cancel ) => {
			const nextFocusable = this._focusCycler.next;

			if ( nextFocusable ) {
				nextFocusable.focus();
			}

			cancel();
		};

		const focusPrevious = ( data, cancel ) => {
			const previousFocusable = this._focusCycler.previous;

			if ( previousFocusable ) {
				previousFocusable.focus();
			}

			cancel();
		};

		// Navigate toolbar items back using the arrow left/up key.
		this.keystrokes.set( 'arrowleft', focusPrevious );
		this.keystrokes.set( 'arrowup', focusPrevious );

		// Navigate toolbar items forwards using the arrow right/down key.
		this.keystrokes.set( 'arrowright', focusNext );
		this.keystrokes.set( 'arrowdown', focusNext );

		return super.init();
	}

	/**
	 * Focuses the first focusable in {@link #items}.
	 */
	focus() {
		// Find the very first toolbar item that can be focused.
		const firstFocusable = this._focusCycler.first;

		if ( firstFocusable ) {
			firstFocusable.focus();
		}
	}
}

