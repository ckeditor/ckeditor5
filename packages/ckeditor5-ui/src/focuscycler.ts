/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/focuscycler
 */

import {
	isVisible,
	EmitterMixin,
	type ArrayOrItem,
	type FocusTracker,
	type KeystrokeHandler,
	type KeystrokeHandlerOptions
} from '@ckeditor/ckeditor5-utils';

import type View from './view.js';
import type ViewCollection from './viewcollection.js';

/**
 * A utility class that helps cycling over {@link module:ui/focuscycler~FocusableView focusable views} in a
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
 * const focusables = new ViewCollection<FocusableView>();
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
export default class FocusCycler extends /* #__PURE__ */ EmitterMixin() {
	/**
	 * A {@link module:ui/focuscycler~FocusableView focusable views} collection that the cycler operates on.
	 */
	public readonly focusables: ViewCollection<FocusableView>;

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
		focusables: ViewCollection<FocusableView>;
		focusTracker: FocusTracker;
		keystrokeHandler?: KeystrokeHandler;
		keystrokeHandlerOptions?: KeystrokeHandlerOptions;
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
					}, options.keystrokeHandlerOptions );
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
		return ( this.focusables.find( isDomFocusable ) || null ) as FocusableView | null;
	}

	/**
	 * Returns the last focusable view in {@link #focusables}.
	 * Returns `null` if there is none.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 */
	public get last(): FocusableView | null {
		return ( this.focusables.filter( isDomFocusable ).slice( -1 )[ 0 ] || null ) as FocusableView | null;
	}

	/**
	 * Returns the next focusable view in {@link #focusables} based on {@link #current}.
	 * Returns `null` if there is none.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 */
	public get next(): FocusableView | null {
		return this._getDomFocusableItem( 1 );
	}

	/**
	 * Returns the previous focusable view in {@link #focusables} based on {@link #current}.
	 * Returns `null` if there is none.
	 *
	 * **Note**: Hidden views (e.g. with `display: none`) are ignored.
	 */
	public get previous(): FocusableView | null {
		return this._getDomFocusableItem( -1 );
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

		// If there's only one focusable item, we need to let the outside world know
		// that the next cycle is about to happen. This may be useful
		// e.g. if you want to move the focus to the parent focus cycler.
		// Note that the focus is not actually moved in this case.
		if ( next && this.focusables.getIndex( next ) === this.current ) {
			this.fire<FocusCyclerForwardCycleEvent>( 'forwardCycle' );

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
			this.fire<FocusCyclerBackwardCycleEvent>( 'backwardCycle' );

			return;
		}

		if ( previous === this.last ) {
			this.fire<FocusCyclerBackwardCycleEvent>( 'backwardCycle' );
		} else {
			this._focus( previous, -1 );
		}
	}

	/**
	 * Allows for creating continuous focus cycling across multiple focus cyclers and their collections of {@link #focusables}.
	 *
	 * It starts listening to the {@link module:ui/focuscycler~FocusCyclerForwardCycleEvent} and
	 * {@link module:ui/focuscycler~FocusCyclerBackwardCycleEvent} events of the chained focus cycler and engages,
	 * whenever the user reaches the last (forwards navigation) or first (backwards navigation) focusable view
	 * and would normally start over. Instead, the navigation continues on the higher level (flattens).
	 *
	 * For instance, for the following nested focus navigation structure, the focus would get stuck the moment
	 * the AB gets focused and its focus cycler starts managing it:
	 *
	 *	   ┌────────────┐   ┌──────────────────────────────────┐   ┌────────────┐
	 *	   │ AA         │   │ AB                               │   │ AC         │
	 *	   │            │   │                                  │   │            │
	 *	   │            │   │    ┌─────┐  ┌─────┐  ┌─────┐     │   │            │
	 *	   │            │   │ ┌──► ABA ├──► ABB ├──► ABC ├───┐ │   │            │
	 *	   │            ├───► │  └─────┘  └─────┘  └─────┘   │ │   │            │
	 *	   │            │   │ │                              │ │   │            │
	 *	   │            │   │ │                              │ │   │            │
	 *	   │            │   │ └──────────────────────────────┘ │   │            │
	 *	   │            │   │                                  │   │            │
	 *	   └────────────┘   └──────────────────────────────────┘   └────────────┘
	 *
	 * Chaining a focus tracker that manages AA, AB, and AC with the focus tracker that manages ABA, ABB, and ABC
	 * creates a seamless navigation experience instead:
	 *
	 *	   ┌────────────┐   ┌──────────────────────────────────┐   ┌────────────┐
	 *	   │ AA         │   │ AB                               │   │ AC         │
	 *	   │            │   │                                  │   │            │
	 *	   │            │   │    ┌─────┐  ┌─────┐  ┌─────┐     │   │            │
	 *	   │            │   │ ┌──► ABA ├──► ABB ├──► ABC ├──┐  │   │            │
	 *	┌──►            ├───┼─┘  └─────┘  └─────┘  └─────┘  └──┼───►            ├──┐
	 *	│  │            │   │                                  │   │            │  │
	 *	│  │            │   │                                  │   │            │  │
	 *	│  │            │   │                                  │   │            │  │
	 *	│  │            │   │                                  │   │            │  │
	 *	│  └────────────┘   └──────────────────────────────────┘   └────────────┘  │
	 *	│                                                                          │
	 *	│                                                                          │
	 *	└──────────────────────────────────────────────────────────────────────────┘
	 *
	 * See {@link #unchain} to reverse the chaining.
	 */
	public chain( chainedFocusCycler: FocusCycler ): void {
		const getCurrentFocusedView = () => {
			// This may happen when one focus cycler does not include focusables of the other (horizontal case).
			if ( this.current === null ) {
				return null;
			}

			return this.focusables.get( this.current );
		};

		this.listenTo<FocusCyclerForwardCycleEvent>( chainedFocusCycler, 'forwardCycle', evt => {
			const oldCurrent = getCurrentFocusedView();

			this.focusNext();

			// Stop the event propagation only if an attempt at focusing the view actually moved the focus.
			// If not, let the otherFocusCycler handle the event.
			if ( oldCurrent !== getCurrentFocusedView() ) {
				evt.stop();
			}

		// The priority is critical for cycling across multiple chain levels when there's a single view at some of them only.
		}, { priority: 'low' } );

		this.listenTo<FocusCyclerBackwardCycleEvent>( chainedFocusCycler, 'backwardCycle', evt => {
			const oldCurrent = getCurrentFocusedView();

			this.focusPrevious();

			// Stop the event propagation only if an attempt at focusing the view actually moved the focus.
			// If not, let the otherFocusCycler handle the event.
			if ( oldCurrent !== getCurrentFocusedView() ) {
				evt.stop();
			}

		// The priority is critical for cycling across multiple chain levels when there's a single view at some of them only.
		}, { priority: 'low' } );
	}

	/**
	 * Reverses a chaining made by {@link #chain}.
	 */
	public unchain( otherFocusCycler: FocusCycler ): void {
		this.stopListening( otherFocusCycler );
	}

	/**
	 * Focuses the given view if it exists.
	 *
	 * @param view The view to be focused
	 * @param direction The direction of the focus if the view has focusable children.
	 * @returns
	 */
	private _focus( view: FocusableView | null, direction: 1 | -1 ) {
		// Don't fire focus events if the view is already focused.
		// Such attempt may occur when cycling with only one focusable item:
		// even though `focusNext()` method returns without changing focus,
		// the `forwardCycle` event is fired, triggering the `focusFirst()` method.
		if ( view && this.focusTracker.focusedElement !== view.element ) {
			view.focus( direction );
		}
	}

	/**
	 * Returns the next or previous focusable view in {@link #focusables} with respect
	 * to {@link #current}.
	 *
	 * @param step Either `1` for checking forward from {@link #current} or `-1` for checking backwards.
	 */
	private _getDomFocusableItem( step: 1 | -1 ): FocusableView | null {
		// Cache for speed.
		const collectionLength = this.focusables.length;

		if ( !collectionLength ) {
			return null;
		}

		const current = this.current;

		// Start from the beginning if no view is focused.
		// https://github.com/ckeditor/ckeditor5-ui/issues/206
		if ( current === null ) {
			return this[ step === 1 ? 'first' : 'last' ];
		}

		// Note: If current is the only focusable view, it will also be returned for the given step.
		let focusableItem = this.focusables.get( current )!;

		// Cycle in both directions.
		let index = ( current + collectionLength + step ) % collectionLength;

		do {
			const focusableItemCandidate = this.focusables.get( index )!;

			if ( isDomFocusable( focusableItemCandidate ) ) {
				focusableItem = focusableItemCandidate;
				break;
			}

			// Cycle in both directions.
			index = ( index + collectionLength + step ) % collectionLength;
		} while ( index !== current );

		return focusableItem;
	}
}

/**
 * A {@link module:ui/view~View} that can be focused (e.g. has `focus()` method).
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

/**
 * A {@link module:ui/view~View} that hosts one or more of focusable children being managed by a {@link module:ui/focuscycler~FocusCycler}
 * instance exposed under `focusCycler` property.
 */
export type ViewWithFocusCycler = FocusableView & {
	focusCycler: FocusCycler;
};

export type FocusCyclerActions = {
	[ key in 'focusFirst' | 'focusLast' | 'focusPrevious' | 'focusNext' ]?: ArrayOrItem<string>
};

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
 * Checks whether a view can be focused (has `focus()` method and is visible).
 *
 * @param view A view to be checked.
 */
function isDomFocusable( view: View ) {
	return isFocusable( view ) && isVisible( view.element );
}

/**
 * Checks whether a view is {@link ~FocusableView}.
 *
 * @param view A view to be checked.
 */
export function isFocusable( view: View ): view is FocusableView {
	return !!( 'focus' in view && typeof view.focus == 'function' );
}

/**
 * Checks whether a view is an instance of {@link ~ViewWithFocusCycler}.
 *
 * @param view A view to be checked.
 */
export function isViewWithFocusCycler( view: View ): view is ViewWithFocusCycler {
	return isFocusable( view ) && 'focusCycler' in view && view.focusCycler instanceof FocusCycler;
}
