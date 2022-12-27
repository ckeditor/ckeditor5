/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/focuscycler
 */

import isVisible from '@ckeditor/ckeditor5-utils/src/dom/isvisible';

/**
 * A utility class that helps cycling over focusable {@link module:ui/view~View views} in a
 * {@link module:ui/viewcollection~ViewCollection} when the focus is tracked by the
 * {@link module:utils/focustracker~FocusTracker} instance. It helps implementing keyboard
 * navigation in HTML forms, toolbars, lists and the like.
 *
 * To work properly it requires:
 * * a collection of focusable (HTML `tabindex` attribute) views that implement the `focus()` method,
 * * an associated focus tracker to determine which view is focused.
 *
 * A simple cycler setup can look like this:
 *
 *		const focusables = new ViewCollection();
 *		const focusTracker = new FocusTracker();
 *
 *		// Add focusable views to the focus tracker.
 *		focusTracker.add( ... );
 *
 * Then, the cycler can be used manually:
 *
 *		const cycler = new FocusCycler( { focusables, focusTracker } );
 *
 *		// Will focus the first focusable view in #focusables.
 *		cycler.focusFirst();
 *
 *		// Will log the next focusable item in #focusables.
 *		console.log( cycler.next );
 *
 * Alternatively, it can work side by side with the {@link module:utils/keystrokehandler~KeystrokeHandler}:
 *
 *		const keystrokeHandler = new KeystrokeHandler();
 *
 *		// Activate the keystroke handler.
 *		keystrokeHandler.listenTo( sourceOfEvents );
 *
 *		const cycler = new FocusCycler( {
 *			focusables, focusTracker, keystrokeHandler,
 *			actions: {
 *				// When arrowup of arrowleft is detected by the #keystrokeHandler,
 *				// focusPrevious() will be called on the cycler.
 *				focusPrevious: [ 'arrowup', 'arrowleft' ],
 *			}
 *		} );
 *
 * Check out the {@glink framework/guides/deep-dive/ui/focus-tracking "Deep dive into focus tracking" guide} to learn more.
 */
export default class FocusCycler {
	/**
	 * Creates an instance of the focus cycler utility.
	 *
	 * @param {Object} options Configuration options.
	 * @param {module:utils/collection~Collection|Object} options.focusables
	 * @param {module:utils/focustracker~FocusTracker} options.focusTracker
	 * @param {module:utils/keystrokehandler~KeystrokeHandler} [options.keystrokeHandler]
	 * @param {Object} [options.actions]
	 */
	constructor( options ) {
		Object.assign( this, options );

		/**
		 * A {@link module:ui/view~View view} collection that the cycler operates on.
		 *
		 * @readonly
		 * @member {module:utils/collection~Collection} #focusables
		 */

		/**
		 * A focus tracker instance that the cycler uses to determine the current focus
		 * state in {@link #focusables}.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker} #focusTracker
		 */

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}
		 * which can respond to certain keystrokes and cycle the focus.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler} #keystrokeHandler
		 */

		/**
		 * Actions that the cycler can take when a keystroke is pressed. Requires
		 * `options.keystrokeHandler` to be passed and working. When an action is
		 * performed, `preventDefault` and `stopPropagation` will be called on the event
		 * the keystroke fired in the DOM.
		 *
		 *		actions: {
		 *			// Will call #focusPrevious() when arrowleft or arrowup is pressed.
		 *			focusPrevious: [ 'arrowleft', 'arrowup' ],
		 *
		 *			// Will call #focusNext() when arrowdown is pressed.
		 *			focusNext: 'arrowdown'
		 *		}
		 *
		 * @readonly
		 * @member {Object} #actions
		 */

		if ( options.actions && options.keystrokeHandler ) {
			for ( const methodName in options.actions ) {
				let actions = options.actions[ methodName ];

				if ( typeof actions == 'string' ) {
					actions = [ actions ];
				}

				for ( const keystroke of actions ) {
					options.keystrokeHandler.set( keystroke, ( data, cancel ) => {
						this[ methodName ]();
						cancel();
					} );
				}
			}
		}
	}

	/**
	 * Returns the first focusable view in {@link #focusables}.
	 * Returns `null` if there is none.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 *
	 * @readonly
	 * @member {module:ui/view~View|null} #first
	 */
	get first() {
		return this.focusables.find( isFocusable ) || null;
	}

	/**
	 * Returns the last focusable view in {@link #focusables}.
	 * Returns `null` if there is none.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 *
	 * @readonly
	 * @member {module:ui/view~View|null} #last
	 */
	get last() {
		return this.focusables.filter( isFocusable ).slice( -1 )[ 0 ] || null;
	}

	/**
	 * Returns the next focusable view in {@link #focusables} based on {@link #current}.
	 * Returns `null` if there is none.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 *
	 * @readonly
	 * @member {module:ui/view~View|null} #next
	 */
	get next() {
		return this._getFocusableItem( 1 );
	}

	/**
	 * Returns the previous focusable view in {@link #focusables} based on {@link #current}.
	 * Returns `null` if there is none.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 *
	 * @readonly
	 * @member {module:ui/view~View|null} #previous
	 */
	get previous() {
		return this._getFocusableItem( -1 );
	}

	/**
	 * An index of the view in the {@link #focusables} which is focused according
	 * to {@link #focusTracker}. Returns `null` when there is no such view.
	 *
	 * @readonly
	 * @member {Number|null} #current
	 */
	get current() {
		let index = null;

		// There's no focused view in the focusables.
		if ( this.focusTracker.focusedElement === null ) {
			return null;
		}

		this.focusables.find( ( view, viewIndex ) => {
			const focused = view.element === this.focusTracker.focusedElement;

			if ( focused ) {
				index = viewIndex;
			}

			return focused;
		} );

		return index;
	}

	/**
	 * Focuses the {@link #first} item in {@link #focusables}.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 */
	focusFirst() {
		this._focus( this.first );
	}

	/**
	 * Focuses the {@link #last} item in {@link #focusables}.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 */
	focusLast() {
		this._focus( this.last );
	}

	/**
	 * Focuses the {@link #next} item in {@link #focusables}.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 */
	focusNext() {
		this._focus( this.next );
	}

	/**
	 * Focuses the {@link #previous} item in {@link #focusables}.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 */
	focusPrevious() {
		this._focus( this.previous );
	}

	/**
	 * Focuses the given view if it exists.
	 *
	 * @protected
	 * @param {module:ui/view~View} view
	 */
	_focus( view ) {
		if ( view ) {
			view.focus();
		}
	}

	/**
	 * Returns the next or previous focusable view in {@link #focusables} with respect
	 * to {@link #current}.
	 *
	 * @protected
	 * @param {Number} step Either `1` for checking forward from {@link #current} or
	 * `-1` for checking backwards.
	 * @returns {module:ui/view~View|null}
	 */
	_getFocusableItem( step ) {
		// Cache for speed.
		const current = this.current;
		const collectionLength = this.focusables.length;

		if ( !collectionLength ) {
			return null;
		}

		// Start from the beginning if no view is focused.
		// https://github.com/ckeditor/ckeditor5-ui/issues/206
		if ( current === null ) {
			return this[ step === 1 ? 'first' : 'last' ];
		}

		// Cycle in both directions.
		let index = ( current + collectionLength + step ) % collectionLength;

		do {
			const view = this.focusables.get( index );

			if ( isFocusable( view ) ) {
				return view;
			}

			// Cycle in both directions.
			index = ( index + collectionLength + step ) % collectionLength;
		} while ( index !== current );

		return null;
	}
}

// Checks whether a view is focusable.
//
// @private
// @param {module:ui/view~View} view A view to be checked.
// @returns {Boolean}
function isFocusable( view ) {
	return !!( view.focus && isVisible( view.element ) );
}
