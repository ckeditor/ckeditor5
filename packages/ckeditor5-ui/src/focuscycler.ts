/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/focuscycler
 */

import {
	isVisible,
	type ArrayOrItem,
	type FocusTracker,
	type KeystrokeHandler,
	EmitterMixin
} from '@ckeditor/ckeditor5-utils';

import type View from './view';
import type ViewCollection from './viewcollection';

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
 * ```ts
 * const focusables = new ViewCollection();
 * const focusTracker = new FocusTracker();
 *
 * // Add focusable views to the focus tracker.
 * focusTracker.add( ... );
 * ```
 *
 * Then, the cycler can be used manually:
 *
 * ```ts
 * const cycler = new FocusCycler( { focusables, focusTracker } );
 *
 * // Will focus the first focusable view in #focusables.
 * cycler.focusFirst();
 *
 * // Will log the next focusable item in #focusables.
 * console.log( cycler.next );
 * ```
 *
 * Alternatively, it can work side by side with the {@link module:utils/keystrokehandler~KeystrokeHandler}:
 *
 * ```ts
 * const keystrokeHandler = new KeystrokeHandler();
 *
 * // Activate the keystroke handler.
 * keystrokeHandler.listenTo( sourceOfEvents );
 *
 * const cycler = new FocusCycler( {
 * 	focusables, focusTracker, keystrokeHandler,
 * 	actions: {
 * 		// When arrowup of arrowleft is detected by the #keystrokeHandler,
 * 		// focusPrevious() will be called on the cycler.
 * 		focusPrevious: [ 'arrowup', 'arrowleft' ],
 * 	}
 * } );
 * ```
 *
 * Check out the {@glink framework/deep-dive/ui/focus-tracking "Deep dive into focus tracking"} guide to learn more.
 */
export default class FocusCycler extends EmitterMixin() {
	/**
	 * A {@link module:ui/view~View view} collection that the cycler operates on.
	 */
	public readonly focusables: ViewCollection;

	/**
	 * A focus tracker instance that the cycler uses to determine the current focus
	 * state in {@link #focusables}.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}
	 * which can respond to certain keystrokes and cycle the focus.
	 */
	public readonly keystrokeHandler?: KeystrokeHandler;

	/**
	 * Actions that the cycler can take when a keystroke is pressed. Requires
	 * `options.keystrokeHandler` to be passed and working. When an action is
	 * performed, `preventDefault` and `stopPropagation` will be called on the event
	 * the keystroke fired in the DOM.
	 *
	 * ```ts
	 * actions: {
	 * 	// Will call #focusPrevious() when arrowleft or arrowup is pressed.
	 * 	focusPrevious: [ 'arrowleft', 'arrowup' ],
	 *
	 * 	// Will call #focusNext() when arrowdown is pressed.
	 * 	focusNext: 'arrowdown'
	 * }
	 * ```
	 */
	public readonly actions?: FocusCyclerActions;

	/**
	 * Creates an instance of the focus cycler utility.
	 *
	 * @param options Configuration options.
	 */
	constructor( options: {
		focusables: ViewCollection;
		focusTracker: FocusTracker;
		keystrokeHandler?: KeystrokeHandler;
		actions?: FocusCyclerActions;
	} ) {
		super();

		this.focusables = options.focusables;
		this.focusTracker = options.focusTracker;
		this.keystrokeHandler = options.keystrokeHandler;
		this.actions = options.actions;

		if ( options.actions && options.keystrokeHandler ) {
			for ( const methodName in options.actions ) {
				let actions = options.actions[ methodName as keyof FocusCyclerActions ]!;

				if ( typeof actions == 'string' ) {
					actions = [ actions ];
				}

				for ( const keystroke of actions ) {
					options.keystrokeHandler.set( keystroke, ( data, cancel ) => {
						this[ methodName as keyof FocusCyclerActions ]();
						cancel();
					} );
				}
			}
		}

		this.on<FocusCyclerForwardCycleEvent>( 'forwardCycle', () => this.focusFirst(), { priority: 'low' } );
		this.on<FocusCyclerBackwardCycleEvent>( 'backwardCycle', () => this.focusLast(), { priority: 'low' } );
	}

	/**
	 * Returns the first focusable view in {@link #focusables}.
	 * Returns `null` if there is none.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 */
	public get first(): FocusableView | null {
		return ( this.focusables.find( isFocusable ) || null ) as FocusableView | null;
	}

	/**
	 * Returns the last focusable view in {@link #focusables}.
	 * Returns `null` if there is none.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 */
	public get last(): FocusableView | null {
		return ( this.focusables.filter( isFocusable ).slice( -1 )[ 0 ] || null ) as FocusableView | null;
	}

	/**
	 * Returns the next focusable view in {@link #focusables} based on {@link #current}.
	 * Returns `null` if there is none.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 */
	public get next(): FocusableView | null {
		return this._getFocusableItem( 1 );
	}

	/**
	 * Returns the previous focusable view in {@link #focusables} based on {@link #current}.
	 * Returns `null` if there is none.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 */
	public get previous(): FocusableView | null {
		return this._getFocusableItem( -1 );
	}

	/**
	 * An index of the view in the {@link #focusables} which is focused according
	 * to {@link #focusTracker}. Returns `null` when there is no such view.
	 */
	public get current(): number | null {
		let index: number | null = null;

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
	public focusFirst(): void {
		this._focus( this.first, 1 );
	}

	/**
	 * Focuses the {@link #last} item in {@link #focusables}.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 */
	public focusLast(): void {
		this._focus( this.last, -1 );
	}

	/**
	 * Focuses the {@link #next} item in {@link #focusables}.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 */
	public focusNext(): void {
		const next = this.next;

		if ( next && this.focusables.getIndex( next ) === this.current ) {
			return;
		}

		if ( next === this.first ) {
			this.fire<FocusCyclerForwardCycleEvent>( 'forwardCycle' );
		} else {
			this._focus( next, 1 );
		}
	}

	/**
	 * Focuses the {@link #previous} item in {@link #focusables}.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 */
	public focusPrevious(): void {
		const previous = this.previous;

		if ( previous && this.focusables.getIndex( previous ) === this.current ) {
			return;
		}

		if ( previous === this.last ) {
			this.fire<FocusCyclerBackwardCycleEvent>( 'backwardCycle' );
		} else {
			this._focus( previous, -1 );
		}
	}

	/**
	 * Focuses the given view if it exists.
	 *
	 * @param view The view to be focused
	 * @param direction The direction of the focus if the view has focusable children.
	 * @returns
	 */
	private _focus( view: FocusableView | null, direction: 1 | -1 ) {
		if ( view ) {
			view.focus( direction );
		}
	}

	/**
	 * Returns the next or previous focusable view in {@link #focusables} with respect
	 * to {@link #current}.
	 *
	 * @param step Either `1` for checking forward from {@link #current} or `-1` for checking backwards.
	 */
	private _getFocusableItem( step: 1 | -1 ): FocusableView | null {
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
			const view = this.focusables.get( index )!;

			if ( isFocusable( view ) ) {
				return view;
			}

			// Cycle in both directions.
			index = ( index + collectionLength + step ) % collectionLength;
		} while ( index !== current );

		return null;
	}
}

/**
 * A view that can be focused.
 */
export type FocusableView = View & {

	/**
	 * Focuses the view.
	 *
	 * @param direction This optional parameter helps improve the UX by providing additional information about the direction the focus moved
	 * (e.g. in a complex view or a form). It is useful for views that host multiple focusable children (e.g. lists, toolbars):
	 * * `1` indicates that the focus moved forward and, in most cases, the first child of the focused view should get focused,
	 * * `-1` indicates that the focus moved backwards, and the last focusable child should get focused
	 *
	 * See {@link module:ui/focuscycler~FocusCycler#event:forwardCycle} and {@link module:ui/focuscycler~FocusCycler#event:backwardCycle}
	 * to learn more.
	 */
	focus( direction?: 1 | -1 ): void;
};

export interface FocusCyclerActions {
	focusFirst?: ArrayOrItem<string>;
	focusLast?: ArrayOrItem<string>;
	focusNext?: ArrayOrItem<string>;
	focusPrevious?: ArrayOrItem<string>;
}

/**
 * Fired when the focus cycler is about to move the focus from the last focusable item
 * to the first one.
 *
 * @eventName ~FocusCycler#forwardCycle
 */
export type FocusCyclerForwardCycleEvent = {
	name: 'forwardCycle';
	args: [];
};

/**
 * Fired when the focus cycler is about to move the focus from the first focusable item
 * to the last one.
 *
 * @eventName ~FocusCycler#backwardCycle
 */
export type FocusCyclerBackwardCycleEvent = {
	name: 'backwardCycle';
	args: [];
};

/**
 * Checks whether a view is focusable.
 *
 * @param view A view to be checked.
 */
function isFocusable( view: View ): view is FocusableView {
	return !!( 'focus' in view && isVisible( view.element ) );
}
