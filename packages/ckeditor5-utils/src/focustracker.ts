/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/focustracker
 */

import DomEmitterMixin from './dom/emittermixin.js';
import ObservableMixin from './observablemixin.js';
import CKEditorError from './ckeditorerror.js';
import type { View } from '@ckeditor/ckeditor5-ui';
import { isElement as _isElement } from 'es-toolkit/compat';

/**
 * Allows observing a group of DOM `Element`s or {@link module:ui/view~View view instances} whether at least one of them (or their child)
 * is focused.
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
	 * True when one of the registered {@link #elements} or {@link #externalViews} is focused.
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
	 * **Note**: The values of this property are restricted to {@link #elements} or {@link module:ui/view~View#element elements}
	 * registered in {@link #externalViews}.
	 *
	 * @readonly
	 * @observable
	 */
	declare public focusedElement: Element | null;

	/**
	 * List of registered DOM elements.
	 *
	 * @internal
	 */
	public _elements: Set<Element> = new Set();

	/**
	 * List of views with external focus trackers that contribute to the state of this focus tracker.
	 *
	 * @internal
	 */
	public _externalViews: Set<ViewWithFocusTracker> = new Set();

	/**
	 * Asynchronous blur event timeout.
	 */
	private _blurTimeout: ReturnType<typeof setTimeout> | null = null;

	// @if CK_DEBUG_FOCUSTRACKER // public _label?: string;

	constructor() {
		super();

		this.set( 'isFocused', false );
		this.set( 'focusedElement', null );

		// @if CK_DEBUG_FOCUSTRACKER // FocusTracker._instances.push( this );
	}

	/**
	 * List of registered DOM elements.
	 *
	 * **Note**: The list does do not include elements from {@link #externalViews}.
	 */
	public get elements(): Array<Element> {
		return Array.from( this._elements.values() );
	}

	/**
	 * List of external focusable views that contribute to the state of this focus tracker. See {@link #add} to learn more.
	 */
	public get externalViews(): Array<ViewWithFocusTracker> {
		return Array.from( this._externalViews.values() );
	}

	/**
	 * Starts tracking a specified DOM element or a {@link module:ui/view~View} instance.
	 *
	 * * If a DOM element is passed, the focus tracker listens to the `focus` and `blur` events on this element.
	 * Tracked elements are listed in {@link #elements}.
	 * * If a {@link module:ui/view~View} instance is passed that has a `FocusTracker` instance ({@link ~ViewWithFocusTracker}),
	 * the external focus tracker's state ({@link #isFocused}, {@link #focusedElement}) starts contributing to the current tracker instance.
	 * This allows for increasing the "reach" of a focus tracker instance, by connecting two or more focus trackers together when DOM
	 * elements they track are located in different subtrees in DOM. External focus trackers are listed in {@link #externalViews}.
	 * * If a {@link module:ui/view~View} instance is passed that has no `FocusTracker` (**not** a {@link ~ViewWithFocusTracker}),
	 * its {@link module:ui/view~View#element} is used to track focus like any other DOM element.
	 */
	public add( elementOrView: Element | View ): void {
		if ( isElement( elementOrView ) ) {
			this._addElement( elementOrView );
		} else {
			if ( isViewWithFocusTracker( elementOrView ) ) {
				this._addView( elementOrView );
			} else {
				if ( !elementOrView.element ) {
					/**
					 * The {@link module:ui/view~View} added to the {@link module:utils/focustracker~FocusTracker} does not have an
					 * {@link module:ui/view~View#element}. Make sure the view is {@link module:ui/view~View#render} before adding
					 * it to the focus tracker.
					 *
					 * @error focustracker-add-view-missing-element
					 */
					throw new CKEditorError( 'focustracker-add-view-missing-element', {
						focusTracker: this,
						view: elementOrView
					} );
				}

				this._addElement( elementOrView.element );
			}
		}
	}

	/**
	 * Stops tracking focus in the specified DOM element or a {@link module:ui/view~View view instance}. See {@link #add} to learn more.
	 */
	public remove( elementOrView: Element | View ): void {
		if ( isElement( elementOrView ) ) {
			this._removeElement( elementOrView );
		} else {
			if ( isViewWithFocusTracker( elementOrView ) ) {
				this._removeView( elementOrView );
			} else {
				// Assuming that if the view was successfully added, it must have come with an existing #element.
				this._removeElement( elementOrView.element! );
			}
		}
	}

	/**
	 * Adds a DOM element to the focus tracker and starts listening to the `focus` and `blur` events on it.
	 */
	private _addElement( element: Element ): void {
		if ( this._elements.has( element ) ) {
			/**
			 * This element is already tracked by {@link module:utils/focustracker~FocusTracker}.
			 *
			 * @error focustracker-add-element-already-exist
			 */
			throw new CKEditorError( 'focustracker-add-element-already-exist', this );
		}

		this.listenTo( element, 'focus', () => {
			// @if CK_DEBUG_FOCUSTRACKER // console.log( `"${ getName( this ) }": Focus with useCapture on DOM element` );

			const externalFocusedViewInSubtree = this.externalViews.find( view => isExternalViewSubtreeFocused( element, view ) );

			if ( externalFocusedViewInSubtree ) {
				this._focus( externalFocusedViewInSubtree.element! );
			} else {
				this._focus( element );
			}
		}, { useCapture: true } );

		this.listenTo( element, 'blur', () => {
			// @if CK_DEBUG_FOCUSTRACKER // console.log( `"${ getName( this ) }": Blur with useCapture on DOM element` );

			this._blur();
		}, { useCapture: true } );

		this._elements.add( element );
	}

	/**
	 * Removes a DOM element from the focus tracker.
	 */
	private _removeElement( element: Element ): void {
		if ( this._elements.has( element ) ) {
			this.stopListening( element );
			this._elements.delete( element );
		}

		if ( element === this.focusedElement ) {
			this._blur();
		}
	}

	/**
	 * Adds an external {@link module:ui/view~View view instance} to this focus tracker and makes it contribute to this focus tracker's
	 * state either by its `View#element` or by its `View#focusTracker` instance.
	 */
	private _addView( view: ViewWithFocusTracker ): void {
		if ( view.element ) {
			this._addElement( view.element );
		}

		this.listenTo( view.focusTracker, 'change:focusedElement', () => {
			// @if CK_DEBUG_FOCUSTRACKER // console.log(
			// @if CK_DEBUG_FOCUSTRACKER // 	`"${ getName( this ) }": Related "${ getName( view.focusTracker ) }"#focusedElement = `,
			// @if CK_DEBUG_FOCUSTRACKER // 	view.focusTracker.focusedElement
			// @if CK_DEBUG_FOCUSTRACKER // );

			if ( view.focusTracker.focusedElement ) {
				if ( view.element ) {
					this._focus( view.element );
				}
			} else {
				this._blur();
			}
		} );

		this._externalViews.add( view );
	}

	/**
	 * Removes an external {@link module:ui/view~View view instance} from this focus tracker.
	 */
	private _removeView( view: ViewWithFocusTracker ): void {
		if ( view.element ) {
			this._removeElement( view.element );
		}

		this.stopListening( view.focusTracker );
		this._externalViews.delete( view );
	}

	/**
	 * Destroys the focus tracker by:
	 * - Disabling all event listeners attached to tracked elements or external views.
	 * - Removing all tracked elements and views that were previously added.
	 */
	public destroy(): void {
		this.stopListening();

		this._elements.clear();
		this._externalViews.clear();

		this.isFocused = false;
		this.focusedElement = null;
	}

	/**
	 * Stores currently focused element as {@link #focusedElement} and sets {@link #isFocused} `true`.
	 */
	private _focus( element: Element ): void {
		// @if CK_DEBUG_FOCUSTRACKER // console.log( `"${ getName( this ) }": _focus() on element`, element );

		this._clearBlurTimeout();

		this.focusedElement = element;
		this.isFocused = true;
	}

	/**
	 * Clears currently {@link #focusedElement} and sets {@link #isFocused} `false`.
	 *
	 * This method uses `setTimeout()` to change order of `blur` and `focus` events calls, ensuring that moving focus between
	 * two elements within a single focus tracker's scope, will not cause `[ blurA, focusB ]` sequence but just `[ focusB ]`.
	 * The former would cause a momentary change of `#isFocused` to `false` which is not desired because any logic listening to
	 * a focus tracker state would experience UI flashes and glitches as the user focus travels across the UI.
	 */
	private _blur(): void {
		const isAnyElementFocused = this.elements.find( element => element.contains( document.activeElement ) );

		// Avoid blurs originating from external FTs when the focus still remains in one of the #elements.
		if ( isAnyElementFocused ) {
			return;
		}

		const isAnyExternalViewFocused = this.externalViews.find( view => {
			// Do not consider external views's focus trackers as focused if there's a blur timeout pending.
			return view.focusTracker.isFocused && !view.focusTracker._blurTimeout;
		} );

		// Avoid unnecessary DOM blurs coming from #elements when the focus still remains in one of #externalViews.
		if ( isAnyExternalViewFocused ) {
			return;
		}

		this._clearBlurTimeout();

		this._blurTimeout = setTimeout( () => {
			// @if CK_DEBUG_FOCUSTRACKER // console.log( `"${ getName( this ) }": Blur.` );

			this.focusedElement = null;
			this.isFocused = false;
		}, 0 );
	}

	/**
	 * Clears the asynchronous blur event timeout on demand. See {@link #_blur} to learn more.
	 */
	private _clearBlurTimeout(): void {
		clearTimeout( this._blurTimeout! );
		this._blurTimeout = null;
	}

	// @if CK_DEBUG_FOCUSTRACKER // public static _instances: Array<FocusTracker> = [];
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

function isExternalViewSubtreeFocused( subTreeRoot: Element, view: ViewWithFocusTracker ): boolean {
	if ( isFocusedView( subTreeRoot, view ) ) {
		return true;
	}

	return !!view.focusTracker.externalViews.find( view => isFocusedView( subTreeRoot, view ) );
}

function isFocusedView( subTreeRoot: Element, view: View ): boolean {
	// Note: You cannot depend on externalView.focusTracker.focusedElement because blurs are asynchronous and the value may
	// be outdated when moving focus between two elements. Using document.activeElement instead.
	return !!view.element && view.element.contains( document.activeElement ) && subTreeRoot.contains( view.element );
}

// @if CK_DEBUG_FOCUSTRACKER // declare global {
// @if CK_DEBUG_FOCUSTRACKER // 	interface Window {
// @if CK_DEBUG_FOCUSTRACKER // 		logFocusTrackers: Function;
// @if CK_DEBUG_FOCUSTRACKER // 	}
// @if CK_DEBUG_FOCUSTRACKER // }
// @if CK_DEBUG_FOCUSTRACKER //
// @if CK_DEBUG_FOCUSTRACKER // function getName( focusTracker: FocusTracker ): string {
// @if CK_DEBUG_FOCUSTRACKER // 	return focusTracker._label || 'Unknown';
// @if CK_DEBUG_FOCUSTRACKER // }
// @if CK_DEBUG_FOCUSTRACKER //
// @if CK_DEBUG_FOCUSTRACKER // function logState(
// @if CK_DEBUG_FOCUSTRACKER // 	focusTracker: FocusTracker,
// @if CK_DEBUG_FOCUSTRACKER // 	keysToLog: Array<string> = [ 'isFocused', 'focusedElement' ]
// @if CK_DEBUG_FOCUSTRACKER // ): string {
// @if CK_DEBUG_FOCUSTRACKER // 	keysToLog.forEach( key => { console.log( `${ key }=`, focusTracker[ key ] ) } );
// @if CK_DEBUG_FOCUSTRACKER // 	console.log( 'elements', focusTracker.elements );
// @if CK_DEBUG_FOCUSTRACKER // 	console.log( 'externalViews', focusTracker.externalViews );
// @if CK_DEBUG_FOCUSTRACKER // }
// @if CK_DEBUG_FOCUSTRACKER //
// @if CK_DEBUG_FOCUSTRACKER // window.logFocusTrackers = (
// @if CK_DEBUG_FOCUSTRACKER // 	filter = () => true,
// @if CK_DEBUG_FOCUSTRACKER // 	keysToLog: Array<string>
// @if CK_DEBUG_FOCUSTRACKER // ): void => {
// @if CK_DEBUG_FOCUSTRACKER // 	console.group( 'FocusTrackers' );
// @if CK_DEBUG_FOCUSTRACKER //
// @if CK_DEBUG_FOCUSTRACKER // 	for ( const focusTracker of FocusTracker._instances ) {
// @if CK_DEBUG_FOCUSTRACKER // 		if ( filter( focusTracker ) ) {
// @if CK_DEBUG_FOCUSTRACKER // 			console.group( `"${ getName( focusTracker ) }"` );
// @if CK_DEBUG_FOCUSTRACKER // 			logState( focusTracker, keysToLog );
// @if CK_DEBUG_FOCUSTRACKER // 			console.groupEnd();
// @if CK_DEBUG_FOCUSTRACKER // 		}
// @if CK_DEBUG_FOCUSTRACKER // 	}
// @if CK_DEBUG_FOCUSTRACKER //
// @if CK_DEBUG_FOCUSTRACKER // 	console.groupEnd();
// @if CK_DEBUG_FOCUSTRACKER // };
// @if CK_DEBUG_FOCUSTRACKER //
// @if CK_DEBUG_FOCUSTRACKER // window.logFocusTrackerTree = (
// @if CK_DEBUG_FOCUSTRACKER // 	rootFocusTracker: FocusTracker,
// @if CK_DEBUG_FOCUSTRACKER // 	filter = () => true,
// @if CK_DEBUG_FOCUSTRACKER // 	keysToLog: Array<string>
// @if CK_DEBUG_FOCUSTRACKER // ): void => {
// @if CK_DEBUG_FOCUSTRACKER // 	console.group( 'FocusTrackers tree' );
// @if CK_DEBUG_FOCUSTRACKER //
// @if CK_DEBUG_FOCUSTRACKER // 	logBranch( rootFocusTracker, filter );
// @if CK_DEBUG_FOCUSTRACKER //
// @if CK_DEBUG_FOCUSTRACKER // 	function logBranch( focusTracker, filter ) {
// @if CK_DEBUG_FOCUSTRACKER // 		console.group( `"${ getName( focusTracker ) }"` );
// @if CK_DEBUG_FOCUSTRACKER // 		logState( focusTracker, keysToLog );
// @if CK_DEBUG_FOCUSTRACKER //
// @if CK_DEBUG_FOCUSTRACKER // 		for ( const externalView of focusTracker.externalViews ) {
// @if CK_DEBUG_FOCUSTRACKER // 			if ( filter( externalView.focusTracker ) ) {
// @if CK_DEBUG_FOCUSTRACKER // 				logBranch( externalView.focusTracker, filter );
// @if CK_DEBUG_FOCUSTRACKER // 			}
// @if CK_DEBUG_FOCUSTRACKER // 		}
// @if CK_DEBUG_FOCUSTRACKER //
// @if CK_DEBUG_FOCUSTRACKER // 		console.groupEnd();
// @if CK_DEBUG_FOCUSTRACKER // 	}
// @if CK_DEBUG_FOCUSTRACKER //
// @if CK_DEBUG_FOCUSTRACKER // 	console.groupEnd();
// @if CK_DEBUG_FOCUSTRACKER // };
