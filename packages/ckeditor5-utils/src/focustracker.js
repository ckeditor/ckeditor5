/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global setTimeout, clearTimeout */

/**
 * @module utils/focustracker
 */

import DomEmitterMixin from './dom/emittermixin';
import ObservableMixin from './observablemixin';
import CKEditorError from './ckeditorerror';
import mix from './mix';

/**
 * Allows observing a group of `HTMLElement`s whether at least one of them is focused.
 *
 * Used by the {@link module:core/editor/editor~Editor} in order to track whether the focus is still within the application,
 * or were used outside of its UI.
 *
 * **Note** `focus` and `blur` listeners use event capturing, so it is only needed to register wrapper `HTMLElement`
 * which contain other `focusable` elements. But note that this wrapper element has to be focusable too
 * (have e.g. `tabindex="-1"`).
 *
 * Check out the {@glink framework/guides/deep-dive/ui/focus-tracking "Deep dive into focus tracking" guide} to learn more.
 *
 * @mixes module:utils/dom/emittermixin~EmitterMixin
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class FocusTracker {
	constructor() {
		/**
		 * True when one of the registered elements is focused.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #isFocused
		 */
		this.set( 'isFocused', false );

		/**
		 * The currently focused element.
		 *
		 * While {@link #isFocused `isFocused`} remains `true`, the focus can
		 * move between different UI elements. This property tracks those
		 * elements and tells which one is currently focused.
		 *
		 * @readonly
		 * @observable
		 * @member {HTMLElement|null} #focusedElement
		 */
		this.set( 'focusedElement', null );

		/**
		 * List of registered elements.
		 *
		 * @private
		 * @member {Set.<HTMLElement>}
		 */
		this._elements = new Set();

		/**
		 * Event loop timeout.
		 *
		 * @private
		 * @member {Number}
		 */
		this._nextEventLoopTimeout = null;
	}

	/**
	 * Starts tracking the specified element.
	 *
	 * @param {HTMLElement} element
	 */
	add( element ) {
		if ( this._elements.has( element ) ) {
			/**
			 * This element is already tracked by {@link module:utils/focustracker~FocusTracker}.
			 *
			 * @error focusTracker-add-element-already-exist
			 */
			throw new CKEditorError( 'focusTracker-add-element-already-exist: This element is already tracked by FocusTracker.', this );
		}

		this.listenTo( element, 'focus', () => this._focus( element ), { useCapture: true } );
		this.listenTo( element, 'blur', () => this._blur(), { useCapture: true } );
		this._elements.add( element );
	}

	/**
	 * Stops tracking the specified element and stops listening on this element.
	 *
	 * @param {HTMLElement} element
	 */
	remove( element ) {
		if ( element === this.focusedElement ) {
			this._blur( element );
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
	destroy() {
		this.stopListening();
	}

	/**
	 * Stores currently focused element and set {#isFocused} as `true`.
	 *
	 * @private
	 * @param {HTMLElement} element Element which has been focused.
	 */
	_focus( element ) {
		clearTimeout( this._nextEventLoopTimeout );

		this.focusedElement = element;
		this.isFocused = true;
	}

	/**
	 * Clears currently focused element and set {@link #isFocused} as `false`.
	 * This method uses `setTimeout` to change order of fires `blur` and `focus` events.
	 *
	 * @private
	 * @fires blur
	 */
	_blur() {
		clearTimeout( this._nextEventLoopTimeout );

		this._nextEventLoopTimeout = setTimeout( () => {
			this.focusedElement = null;
			this.isFocused = false;
		}, 0 );
	}

	/**
	 * @event focus
	 */

	/**
	 * @event blur
	 */
}

mix( FocusTracker, DomEmitterMixin );
mix( FocusTracker, ObservableMixin );
