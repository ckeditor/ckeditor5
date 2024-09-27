/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global setTimeout, clearTimeout */

/**
 * @module utils/focustracker
 */

import DomEmitterMixin from './dom/emittermixin.js';
import ObservableMixin, { type ObservableChangeEvent } from './observablemixin.js';
import CKEditorError from './ckeditorerror.js';
import { type View } from '@ckeditor/ckeditor5-ui';
import { isElement as _isElement } from 'lodash-es';
import { getAncestors, global } from './index.js';

class GlobalFocusTracker extends /* #__PURE__ */ DomEmitterMixin( /* #__PURE__ */ ObservableMixin() ) {
	public childFocusTrackers: Set<FocusTracker> = new Set();

	/**
	 * The currently focused element.
	 *
	 * @readonly
	 * @observable
	 */
	declare public focusedElement: Element | null;

	/**
	 * Event loop timeout.
	 */
	private _nextEventLoopTimeout: ReturnType<typeof setTimeout> | null = null;

	/**
	 * TODO
	 */
	public constructor() {
		super();

		this.set( 'focusedElement', document.activeElement );

		this.on<ObservableChangeEvent<Element | null>>( 'change:focusedElement', ( evt, name, focusedElement ) => {
			console.log( '[GlobalFocusTracker] focusedElement =', focusedElement );

			console.time( '[GlobalFocusTracker] _updateChildFocusTrackers' );
			this._updateChildFocusTrackers( focusedElement );
			console.timeEnd( '[GlobalFocusTracker] _updateChildFocusTrackers' );
		} );

		this.listenTo<'focus'>( global.document, 'focus', () => {
			clearTimeout( this._nextEventLoopTimeout! );

			this.focusedElement = document.activeElement;
		}, { useCapture: true } );

		this.listenTo<'blur'>( global.document.body, 'blur', () => {
			clearTimeout( this._nextEventLoopTimeout! );

			this._nextEventLoopTimeout = setTimeout( () => {
				this.focusedElement = document.activeElement;
			}, 0 );
		}, { useCapture: true } );
	}

	/**
	 * TODO
	 */
	public add( childFocusTracker: FocusTracker ) {
		this.childFocusTrackers.add( childFocusTracker );

		childFocusTracker.on( 'destroy', () => {
			// Destroy the global one when the last local focus tracker is destroyed.
			if ( !this.childFocusTrackers.size ) {
				this.destroy();
			}
		} );
	}

	public _updateChildFocusTrackers( focusedElement: Element | null ) {
		console.group( '[GlobalFocusTracker] _updateChildFocusTrackers' );

		const stateMap = new Map<FocusTracker, {
			isFocused: boolean;
			focusedElement: Element | null;
			isRelationsUpdated: boolean;
		}>();

		// 1. Discover state based only on DOM #elements.
		for ( const childFocusTracker of this.childFocusTrackers ) {
			const focusedElementCandidates: Array<[ Element, number ]> = [];

			// Update states based on the local #elements.
			for ( const element of childFocusTracker.elements ) {
				if ( element.contains( focusedElement ) ) {
					focusedElementCandidates.push( [ element, getAncestors( element ).length ] );
				}
			}

			stateMap.set( childFocusTracker, {
				isFocused: !!focusedElementCandidates.length,

				// Pick the candidate that is the as deep in the DOM tree as possible in case some candidates are nested in each other.
				focusedElement: focusedElementCandidates.length ? focusedElementCandidates
					.sort( ( candidateA, candidateB ) => candidateB[ 1 ] - candidateA[ 1 ] )[ 0 ][ 0 ] : null,

				isRelationsUpdated: false
			} );
		}

		function updateFocusTrackerRelations( focusTracker: FocusTracker ) {
			const trackerState = stateMap.get( focusTracker )!;

			if ( !trackerState.isRelationsUpdated ) {
				console.group( `[GlobalFocusTracker] updateFocusTrackerRelations, visit "${ _getLabel( focusTracker ) }"` );

				for ( const externalView of focusTracker._externalViews ) {
					const { isFocused: isExternalFocusTrackerFocused } = updateFocusTrackerRelations( externalView.focusTracker );

					// Some focus trackers deeper in the relation net are focused.
					if ( isExternalFocusTrackerFocused ) {
						if ( trackerState.focusedElement ) {
							const currentFocusedElementDepth = getAncestors( trackerState.focusedElement ).length;
							const externalViewFocusedElementDepth = getAncestors( externalView.element! ).length;
							const isTheSameSubTree = trackerState.focusedElement.contains( externalView.element );

							// If they belong to the same sub-tree of DOM, they myst be deeper than the current focused element
							// to be considered as focused.
							// If the belong to other sub-trees, just take the focus from the related one.
							if ( isTheSameSubTree ? currentFocusedElementDepth < externalViewFocusedElementDepth : true ) {
								trackerState.focusedElement = externalView.element;
								trackerState.isFocused = true;
							}
						} else {
							trackerState.focusedElement = externalView.element;
							trackerState.isFocused = true;
						}
					}
				}

				trackerState.isRelationsUpdated = true;

				console.groupEnd();
			}

			return trackerState;
		}

		// 2. Update states based on relations between focus trackers and externals views that contribute to their states.
		for ( const childFocusTracker of this.childFocusTrackers ) {
			console.group( `[GlobalFocusTracker] update based on relations "${ _getLabel( childFocusTracker ) }"` );

			updateFocusTrackerRelations( childFocusTracker );

			console.groupEnd();
		}

		// 3. Commit state to the focus trackers.
		for ( const childFocusTracker of this.childFocusTrackers ) {
			const childFocusTrackerState = stateMap.get( childFocusTracker )!;

			childFocusTracker.focusedElement = childFocusTrackerState.focusedElement;
			childFocusTracker.isFocused = childFocusTrackerState.isFocused;
		}

		console.groupEnd();
	}

	/**
	 * TODO
	 */
	public destroy(): void {
		this.stopListening();
		this.childFocusTrackers.clear();
	}
}

/**
 * Allows observing a group of DOM `Element`s whether at least one of them (or their child) is focused.
 *
 * Used by the {@link module:core/editor/editor~Editor} in order to track whether the focus is still within the application,
 * or were used outside of its UI.
 *
 * **Note** `focus` and `blur` listeners use event capturing, so it is only needed to register wrapper `Element`
 * which contain other `focusable` elements. But note that this wrapper element has to be focusable too
 * (have e.g. `tabindex="-1"`).
 *
 * Check out the {@glink framework/deep-dive/ui/focus-tracking "Deep dive into focus tracking"} guide to learn more.
 */
export default class FocusTracker extends /* #__PURE__ */ DomEmitterMixin( /* #__PURE__ */ ObservableMixin() ) {
	/**
	 * True when one of the registered {@link #elements} or {@link #externalFocusTrackers} is focused.
	 *
	 * @readonly
	 * @observable
	 */
	declare public isFocused: boolean;

	/**
	 * The currently focused element.
	 *
	 * While {@link #isFocused `isFocused`} remains `true`, the focus can move between different UI elements. This property tracks those
	 * elements and tells which one is currently focused.
	 *
	 * **Note**: The values of this property are restricted to {@link #elements} or elements registered in {@link #externalFocusTrackers}.
	 *
	 * @readonly
	 * @observable
	 */
	declare public focusedElement: Element | null;

	/**
	 * List of registered elements.
	 *
	 * @internal
	 */
	public _elements: Set<Element> = new Set();
	public _externalElements: Set<Element> = new Set();
	public _externalViews: Set<ViewWithFocusTracker> = new Set();

	/**
	 * List of external focus trackers that contribute to the state of this focus tracker.
	 *
	 * @internal
	 */
	public _externalFocusTrackers: Set<FocusTracker> = new Set();

	/**
	 * Event loop timeout.
	 */
	private _nextEventLoopTimeout: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		super();

		if ( !FocusTracker._globalFocusTracker ) {
			FocusTracker._globalFocusTracker = new GlobalFocusTracker();
		}

		this.set( 'isFocused', false );
		this.set( 'focusedElement', null );

		this.decorate( 'add' );
		this.decorate( 'remove' );
		this.decorate( 'destroy' );

		FocusTracker._globalFocusTracker.add( this );
		// FocusTracker._globalFocusTracker.on( 'change:focusedElement', ( evt, name, focusedElement ) => {
		// 	this._update( focusedElement );
		// } );

		// this._update( FocusTracker._globalFocusTracker.focusedElement );
	}

	/**
	 * List of registered DOM elements.
	 *
	 * **Note**: The list does do not include elements from {@link #externalFocusTrackers}.
	 */
	public get elements(): Array<Element> {
		return Array.from( this._elements.values() );
	}

	public get externalElements(): Array<Element> {
		return Array.from( this._externalElements.values() );
	}

	/**
	 * List of external focus trackers that contribute to the state of this focus tracker. See {@link #add} to learn more.
	 */
	public get externalFocusTrackers(): Array<FocusTracker> {
		return Array.from( this._externalFocusTrackers.values() );
	}

	/**
	 * Starts tracking a specified DOM element or a {@link module:ui/view~View} instance.
	 *
	 * * If a DOM element is passed, the focus tracker listens to the `focus` and `blur` events on this element.
	 * Tracked elements are listed in {@link #elements}.
	 * * If a {@link module:ui/view~View} instance is passed that has a `FocusTracker` instance ({@link ~ViewWithFocusTracker}),
	 * the external focus tracker's state ({@link #isFocused}, {@link #focusedElement}) starts contributing to the current tracker instance.
	 * This allows for increasing the "reach" of a focus tracker instance, by connecting two or more focus trackers together when DOM
	 * elements they track are located in different subtrees in DOM. External focus trackers are listed in {@link #externalFocusTrackers}.
	 * * If a {@link module:ui/view~View} instance is passed that has no `FocusTracker` (**not** a {@link ~ViewWithFocusTracker}),
	 * its {@link module:ui/view~View#element} is used to track focus like any other DOM element.
	 */
	public add( elementOrView: Element | View ): void {
		if ( isElement( elementOrView ) ) {
			this._addElement( elementOrView );
		} else {
			this._addView( elementOrView );
		}
	}

	/**
	 * Stops tracking focus in the specified DOM element or a {@link module:ui/view~View view instance}. See {@link #add} to learn more.
	 */
	public remove( elementOrView: Element | View ): void {
		if ( isElement( elementOrView ) ) {
			this._removeElement( elementOrView );
		} else {
			this._removeView( elementOrView );
			// if ( isViewWithFocusTracker( elementOrView ) ) {
			// 	this._removeFocusTracker( elementOrView.focusTracker );
			// } else {
			// 	if ( !elementOrView.element ) {
			// 		/**
			// 		 * The {@link module:ui/view~View} removed from the {@link module:utils/focustracker~FocusTracker} does not have an
			// 		 * {@link module:ui/view~View#element}. Make sure the view is {@link module:ui/view~View#render} before removing
			// 		 * it from the focus tracker.
			// 		 *
			// 		 * @error focustracker-remove-view-missing-element
			// 		 */
			// 		throw new CKEditorError( 'focustracker-remove-view-missing-element', {
			// 			focusTracker: this,
			// 			view: elementOrView
			// 		} );
			// 	}

			// 	this._removeElement( elementOrView.element );
			// }
		}
	}

	/**
	 * Adds a DOM element to the focus tracker and starts listening to the `focus` and `blur` events on it.
	 */
	private _addElement( element: Element ): void {
		console.log( `[FocusTracker] "${ _getLabel( this ) }": adding DOM element`, element );

		this._elements.add( element );
	}

	/**
	 * Removes a DOM element from the focus tracker.
	 */
	private _removeElement( element: Element ): void {
		console.log( `[FocusTracker] "${ _getLabel( this ) }": removing DOM element`, element );

		this._elements.delete( element );
	}

	private _addView( view: View ): void {
		// if ( isViewWithFocusTracker( view ) ) {
		// 	this._addElement( view.element! );
		// 	this._addFocusTracker( view.focusTracker );
		// } else {
		// 	if ( !view.element ) {
		// 		/**
		// 		 * The {@link module:ui/view~View} added to the {@link module:utils/focustracker~FocusTracker} does not have an
		// 		 * {@link module:ui/view~View#element}. Make sure the view is {@link module:ui/view~View#render} before adding
		// 		 * it to the focus tracker.
		// 		 *
		// 		 * @error focustracker-add-view-missing-element
		// 		 */
		// 		throw new CKEditorError( 'focustracker-add-view-missing-element', {
		// 			focusTracker: this,
		// 			view
		// 		} );
		// 	}

		// 	this._addElement( view.element! );
		// }

		if ( isViewWithFocusTracker( view ) ) {
			this._externalViews.add( view );
		} else {
			if ( !view.element ) {
				/**
				 * The {@link module:ui/view~View} added to the {@link module:utils/focustracker~FocusTracker} does not have an
				 * {@link module:ui/view~View#element}. Make sure the view is {@link module:ui/view~View#render} before adding
				 * it to the focus tracker.
				 *
				 * @error focustracker-add-view-missing-element
				 */
				throw new CKEditorError( 'focustracker-add-view-missing-element', {
					focusTracker: this,
					view
				} );
			}

			this._addElement( view.element );
		}
	}

	public _removeView( view: View ): void {
		if ( isViewWithFocusTracker( view ) ) {
			this._externalViews.delete( view );
		} else {
			if ( !view.element ) {
				/**
				 * The {@link module:ui/view~View} removed from the {@link module:utils/focustracker~FocusTracker} does not have an
				 * {@link module:ui/view~View#element}. Make sure the view is {@link module:ui/view~View#render} before removing
				 * it from the focus tracker.
				 *
				 * @error focustracker-remove-view-missing-element
				 */
				throw new CKEditorError( 'focustracker-remove-view-missing-element', {
					focusTracker: this,
					view
				} );
			}

			this._removeElement( view.element );
		}
	}

	/**
	 * Adds an external `FocusTracker` instance to this focus tracker and makes it contribute to this focus tracker's state.
	 */
	private _addFocusTracker( focusTracker: FocusTracker ): void {
		console.log( `[FocusTracker] "${ _getLabel( this ) }": adds another FT "${ _getLabel( focusTracker ) }"` );

		for ( const element of focusTracker.elements ) {
			this._externalElements.add( element );
		}

		// this._externalFocusTrackers.add( focusTracker );
	}

	/**
	 * Removes an external `FocusTracker` instance from this focus tracker.
	 */
	private _removeFocusTracker( focusTracker: FocusTracker ): void {
		console.log( `[FocusTracker] "${ _getLabel( this ) }": removes another FT "${ _getLabel( focusTracker ) }"` );

		this._externalFocusTrackers.delete( focusTracker );
	}

	/**
	 * Destroys the focus tracker by:
	 * - Disabling all event listeners attached to tracked elements.
	 * - Removing all tracked elements that were previously added.
	 */
	public destroy(): void {
		this.stopListening();

		this._elements.clear();
		this._externalFocusTrackers.clear();

		this.isFocused = false;
		this.focusedElement = null;
	}

	/**
	 * Stores currently focused element as {@link #focusedElement} and sets {@link #isFocused} `true`.
	 */
	private _focus( element: Element ): void {
		clearTimeout( this._nextEventLoopTimeout! );

		this.focusedElement = element;
		this.isFocused = true;
	}

	/**
	 * Clears currently {@link #focusedElement} and sets {@link #isFocused} `false`.
	 *
	 * This method uses `setTimeout()` to change order of fires `blur` and `focus` events ensuring that moving focus between
	 * two elements within a single focus tracker's scope, will not cause `[ blurA, focusB ]` sequence but just `[ focusB ]`.
	 * The former would cause a momentary change of `#isFocused` to `false` which is not desired because any logic listening to
	 * a focus tracker state would experience UI flashes and glitches as the user focus travels across the UI.
	 */
	private _blur(): void {
		// Avoid blurs that would be incorrect as a result of "local" elements and external focus trackers coexisting:
		// * External FT blurs (e.g. when the focus still remains in one of the "local" elements or another external focus tracker),
		// * "Local" element blurs (e.g. when the focus still remains in one of external focus trackers).
		// if (
		// 	this.elements.find( element => element.contains( document.activeElement ) ) ||
		// 	this.externalFocusTrackers.find( ( { isFocused } ) => isFocused )
		// ) {
		// 	return;
		// }

		clearTimeout( this._nextEventLoopTimeout! );

		this._nextEventLoopTimeout = setTimeout( () => {
			this.focusedElement = null;
			this.isFocused = false;
		}, 0 );
	}

	// private _update( focusedElement: Element ): void {
	// 	for ( const localElement of this.elements ) {
	// 		if ( localElement.contains( focusedElement ) ) {
	// 			this.focusedElement = localElement;
	// 			this.isFocused = true;

	// 			return;
	// 		}
	// 	}

	// 	this.focusedElement = null;
	// 	this.isFocused = false;
	// }

	private static _globalFocusTracker: GlobalFocusTracker | null = null;
}

/**
 * A {@link module:ui/view~View} instance with a {@link module:utils/focustracker~FocusTracker} instance exposed
 * at the `#focusTracker` property.
 */
export type ViewWithFocusTracker = View & { focusTracker: FocusTracker };

/**
 * Checks whether a view is an instance of {@link ~ViewWithFocusTracker}.
 */
export function isViewWithFocusTracker( view: any ): view is ViewWithFocusTracker {
	return 'focusTracker' in view && view.focusTracker instanceof FocusTracker;
}

function isElement( value: any ): value is Element {
	return _isElement( value );
}

function _getLabel( ft: FocusTracker ): void {
	return ft._label || 'unknown';
}

window.logFocusTrackers = () => {
	console.group( 'FocusTrackers' );

	// const data = [];
	for ( const ft of FocusTracker._globalFocusTracker.childFocusTrackers ) {
		if ( ft.isFocused ) {
			console.group( `"${ _getLabel( ft ) }"` );
			console.log( 'isFocused =', ft.isFocused );
			console.log( 'focusedElement =', ft.focusedElement );
			console.log( ft );
			console.groupEnd();
		}
	}

	// for ( const ft of FocusTracker._globalFocusTracker.childFocusTrackers ) {
	// 	data.push( {
	// 		label: _getLabel( ft ),
	// 		isFocused: ft.isFocused,
	// 		focusedElement: ft.focusedElement
	// 	} );
	// }

	// console.table( data );
	console.groupEnd();
};
