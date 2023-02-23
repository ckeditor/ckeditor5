/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global setTimeout, clearTimeout */

/**
 * @module utils/focustracker
 */

import DomEmitterMixin from './dom/emittermixin';
import ObservableMixin from './observablemixin';
import CKEditorError from './ckeditorerror';

/**
 * Allows observing a group of `Element`s whether at least one of them is focused.
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
export default class FocusTracker extends DomEmitterMixin( ObservableMixin() ) {
	/**
	 * True when one of the registered elements is focused.
	 *
	 * @readonly
	 * @observable
	 */
	declare public isFocused: boolean;

	/**
	 * The currently focused element.
	 *
	 * While {@link #isFocused `isFocused`} remains `true`, the focus can
	 * move between different UI elements. This property tracks those
	 * elements and tells which one is currently focused.
	 *
	 * @readonly
	 * @observable
	 */
	declare public focusedElement: Element | null;

	/**
	 * List of registered elements.
	 */
	private _elements: Set<Element> = new Set();

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
	 * Starts tracking the specified element.
	 */
	public add( element: Element ): void {
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
	 * Stops tracking the specified element and stops listening on this element.
	 */
	public remove( element: Element ): void {
		if ( element === this.focusedElement ) {
			this._blur();
		}

		if ( this._elements.has( element ) ) {
			this.stopListening( element );
			this._elements.delete( element );
		}
	}

	/**
	 * Destroys the focus tracker by:
	 * - Disabling all event listeners attached to tracked elements.
	 * - Removing all tracked elements that were previously added.
	 */
	public destroy(): void {
		this.stopListening();
	}

	/**
	 * Stores currently focused element and set {@link #isFocused} as `true`.
	 */
	private _focus( element: Element ): void {
		clearTimeout( this._nextEventLoopTimeout! );

		this.focusedElement = element;
		this.isFocused = true;
	}

	/**
	 * Clears currently focused element and set {@link #isFocused} as `false`.
	 * This method uses `setTimeout` to change order of fires `blur` and `focus` events.
	 */
	private _blur(): void {
		clearTimeout( this._nextEventLoopTimeout! );

		this._nextEventLoopTimeout = setTimeout( () => {
			this.focusedElement = null;
			this.isFocused = false;
		}, 0 );
	}
}
