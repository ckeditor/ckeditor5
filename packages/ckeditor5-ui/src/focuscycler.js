/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/focuscycler
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';

/**
 * Helps cycling over focusable views in a {@link module:ui/viewcollection~ViewCollection}
 * when the focus is tracked by {@link module:utils/focustracker~FocusTracker} instance.
 *
 * It requires a collection of focusable views and associated focus tracker:
 *
 *		const focusables = new ViewCollection();
 *		const focusTracker = new FocusTracker();
 *
 *		// Add focusables to the focus tracker.
 *		focusTracker.add( ... );
 *
 * The cycler can be used manually:
 *
 *		const cycler = new FocusCycler( { focusables, focusTracker } );
 *
 *		// Will focus the first forusable view in #focusables.
 *		cycler.focusFirst();
 *
 *		// Will log next focusable item in #focusables.
 *		console.log( cycler.next );
 *
 * or it can be used as an automated, keystroke–detecting utility:
 *
 *		const keystrokeHandler = new KeystrokeHandler();
 *
 *		// Activate the keystroke handler.
 *		keystrokeHandler.listenTo( sourceOfEvents );
 *
 *		const cycler = new FocusCycler( {
 *			focusables, focusTracker, keystrokeHandler,
 *			actions: {
 *				// When arrowup of arrowleft is detected by the #keystrokeHandler
 *				// focusPrevious() will be called by the cycler.
 *				focusPrevious: [ 'arrowup', 'arrowleft' ],
 *			}
 *		} );
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
		 * A view collection the cycler operates on.
		 *
		 * @readonly
		 * @member {module:utils/collection~Collection} #focusables
		 */

		/**
		 * A focus tracker instance that cycler uses to determine focus
		 * state in {@link #focusables}.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker} #focusTracker
		 */

		/**
		 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler} #keystrokeHandler
		 */

		/**
		 * Actions that the cycler can take when a keystroke is pressed. Requires
		 * `options.keystrokeHandler` to be passed and working. When an action is
		 * performed, the event the keystroke fired is will be `preventDefault` and
		 * `stopPropagation` in DOM.
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
	 * `null` if there's none.
	 *
	 * @readonly
	 * @member {module:ui/view~View|null} #first
	 */
	get first() {
		return this.focusables.find( isFocusable ) || null;
	}

	/**
	 * Returns the last focusable view in {@link #focusables}.
	 * `null` if there's none.
	 *
	 * @readonly
	 * @member {module:ui/view~View|null} #last
	 */
	get last() {
		return this.focusables.filter( isFocusable ).slice( -1 )[ 0 ] || null;
	}

	/**
	 * Returns the next focusable view in {@link #focusables} based on {@link #current}.
	 * `null` if there's none.
	 *
	 * @readonly
	 * @member {module:ui/view~View|null} #next
	 */
	get next() {
		return this._getFocusableItem( 1 );
	}

	/**
	 * Returns the previous focusable view in {@link #focusables} based on {@link #current}.
	 * `null` if there's none.
	 *
	 * @readonly
	 * @member {module:ui/view~View|null} #previous
	 */
	get previous() {
		return this._getFocusableItem( -1 );
	}

	/**
	 * An index of the view in the {@link #focusables} which is focused according
	 * to {@link #focusTracker}. `null` when there's no such view.
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
	 * Focuses the {@link #first} item.
	 */
	focusFirst() {
		this._focus( this.first );
	}

	/**
	 * Focuses the {@link #last} item.
	 */
	focusLast() {
		this._focus( this.last );
	}

	/**
	 * Focuses the {@link #next} item.
	 */
	focusNext() {
		this._focus( this.next );
	}

	/**
	 * Focuses the {@link #previous} item.
	 */
	focusPrevious() {
		this._focus( this.previous );
	}

	/**
	 * Focuses the given view, if exists.
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
	 * Returns the next/previous focusable view in {@link #focusables} with respect
	 * to {@link #current}.
	 *
	 * @protected
	 * @param {Number} step Either `1` for checking forward of {@link #current} or
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

			// TODO: Check if view is visible.
			if ( isFocusable( view ) ) {
				return view;
			}

			// Cycle in both directions.
			index = ( index + collectionLength + step ) % collectionLength;
		} while ( index !== current );

		return null;
	}
}

// Checks whether an view is focusable.
//
// @private
// @param {module:ui/view~View} view A view to be checked.
// @returns {Boolean}
function isFocusable( view ) {
	return !!( view.focus && global.window.getComputedStyle( view.element ).display != 'none' );
}
