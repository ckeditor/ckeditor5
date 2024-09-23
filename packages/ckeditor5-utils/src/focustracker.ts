/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global setTimeout, clearTimeout */

/**
 * @module utils/focustracker
 */

import DomEmitterMixin from './dom/emittermixin.js';
import ObservableMixin from './observablemixin.js';
import CKEditorError from './ckeditorerror.js';
import { type View } from '@ckeditor/ckeditor5-ui';
import { isElement as _isElement } from 'lodash-es';

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

		this.set( 'isFocused', false );
		this.set( 'focusedElement', null );
	}

	/**
	 * List of registered DOM elements.
	 *
	 * **Note**: The list does do not include elements from {@link #externalFocusTrackers}.
	 */
	public get elements(): Array<Element> {
		return Array.from( this._elements.values() );
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
			if ( isViewWithFocusTracker( elementOrView ) ) {
				this._addFocusTracker( elementOrView.focusTracker );
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
				this._removeFocusTracker( elementOrView.focusTracker );
			} else {
				if ( !elementOrView.element ) {
					/**
					 * The {@link module:ui/view~View} removed from the {@link module:utils/focustracker~FocusTracker} does not have an
					 * {@link module:ui/view~View#element}. Make sure the view is {@link module:ui/view~View#render} before removing
					 * it from the focus tracker.
					 *
					 * @error focustracker-remove-view-missing-element
					 */
					throw new CKEditorError( 'focustracker-remove-view-missing-element', {
						focusTracker: this,
						view: elementOrView
					} );
				}

				this._removeElement( elementOrView.element );
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

		this.listenTo( element, 'focus', () => this._focus( element ), { useCapture: true } );
		this.listenTo( element, 'blur', () => this._blur(), { useCapture: true } );
		this._elements.add( element );
	}

	/**
	 * Removes a DOM element from the focus tracker.
	 */
	private _removeElement( element: Element ): void {
		if ( element === this.focusedElement ) {
			this._blur();
		}

		if ( this._elements.has( element ) ) {
			this.stopListening( element );
			this._elements.delete( element );
		}
	}

	/**
	 * Adds an external `FocusTracker` instance to this focus tracker and makes it contribute to this focus tracker's state.
	 */
	private _addFocusTracker( focusTracker: FocusTracker ): void {
		this.listenTo( focusTracker, 'change:isFocused', () => {
			if ( focusTracker.isFocused ) {
				this._focus( focusTracker.focusedElement! );
			} else {
				this._blur();
			}
		} );

		this._externalFocusTrackers.add( focusTracker );
	}

	/**
	 * Removes an external `FocusTracker` instance from this focus tracker.
	 */
	private _removeFocusTracker( focusTracker: FocusTracker ): void {
		this.stopListening( focusTracker );
		this._externalFocusTrackers.delete( focusTracker );

		if ( focusTracker.isFocused ) {
			this._blur();
		}
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
		if (
			this.elements.find( element => element.contains( document.activeElement ) ) ||
			this.externalFocusTrackers.find( ( { isFocused } ) => isFocused )
		) {
			return;
		}

		clearTimeout( this._nextEventLoopTimeout! );

		this._nextEventLoopTimeout = setTimeout( () => {
			this.focusedElement = null;
			this.isFocused = false;
		}, 0 );
	}
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
