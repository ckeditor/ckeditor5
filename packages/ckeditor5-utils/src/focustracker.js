/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

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
		 * Currently focused element.
		 *
		 * @readonly
		 * @member {HTMLElement}
		 */
		this.focusedElement = null;

		/**
		 * List of registered elements.
		 *
		 * @private
		 * @member {Set.<HTMLElement>}
		 */
		this._elements = new Set();
	}

	/**
	 * Starts tracking the specified element.
	 *
	 * @param {HTMLElement} element
	 */
	add( element ) {
		if ( this._elements.has( element ) ) {
			throw new CKEditorError( 'focusTracker-add-element-already-exist' );
		}

		this.listenTo( element, 'focus', () => this._focus( element ), { useCapture: true } );
		this.listenTo( element, 'blur', ( evt, domEvt ) => this._blur( domEvt ), { useCapture: true } );
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
	 * Stores currently focused element and set {#isFocused} as `true`.
	 *
	 * @private
	 * @param {HTMLElement} element Element which has been focused.
	 */
	_focus( element ) {
		this.focusedElement = element;
		this.isFocused = true;
	}

	/**
	 * Clears currently focused element and set {@link #isFocused} as `false`.
	 *
	 * @private
	 * @param {FocusEvent} domEvt The native DOM FocusEvent instance.
	 */
	_blur( domEvt ) {
		const relatedTarget = domEvt.relatedTarget;
		const isInnerBlur = Array.from( this._elements ).some( element => {
			// element.contains( element ) -> true
			return element.contains( relatedTarget );
		} );

		// If the blur was caused by focusing an element which is either:
		//
		// * registered in this focus tracker,
		// * a child of an element registered in this focus tracker
		//
		// then don't fire the event to prevent rapid #isFocused changes. The focus remains within
		// the registered elements; announcing this change is pointless.
		//
		// Note: In DOM, the native blur always precedes the following focus.
		if ( isInnerBlur ) {
			return;
		}

		this.focusedElement = null;
		this.isFocused = false;
	}
}

mix( FocusTracker, DomEmitterMixin );
mix( FocusTracker, ObservableMixin );
