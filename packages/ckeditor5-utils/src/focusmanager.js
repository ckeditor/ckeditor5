/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global setTimeout, clearTimeout */

import DOMEmitterMixin from '../ui/domemittermixin.js';
import ObservableMixin from './observablemixin.js';
import CKEditorError from './ckeditorerror.js';
import mix from './mix.js';

/**
 * Observes if registered HTMLElements are focused. It is mainly used for keeping information if at least one of the editor component
 * is currently focused which means that editor is focused.
 *
 * **Note** `focus` and `blur` listeners use event capturing, so it is only needed to register wrapper HTMLElement
 * which contain other `focusable` elements. But note that this wrapper element has to be `focusable` too.
 *
 * @memberOf utils
 * @mixes DOMEmitterMixin
 * @mixes ObservableMixin
 */
export default class FocusManager {
	constructor() {
		/**
		 * True when one of the registered elements is focused.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} utils.FocusManager#isFocused
		 */
		this.set( 'isFocused', false );

		/**
		 * List of registered elements.
		 *
		 * @private
		 * @member {Array<HTMLElement>} utils.FocusManager#_elements
		 */
		this._elements = [];

		/**
		 * Event loop timeout.
		 *
		 * @private
		 * @member {Number} utils.FocusManager#_nextEventLoopTimeout
		 */
		this._nextEventLoopTimeout = null;

		/**
		 * Currently focused element.
		 *
		 * @private
		 * @member {HTMLElement} utils.FocusManager#_focusedElement
		 */
		this._focusedElement = null;
	}

	/**
	 * Adds specified element and and start listening `focus` and `blur` events on this element.
	 *
	 * @param {HTMLElement} element
	 */
	add( element ) {
		if ( this._elements.indexOf( element ) >= 0 ) {
			throw new CKEditorError( 'focusManager-add-element-already-exist' );
		}

		this.listenTo( element, 'focus', () => this._focus( element ), { useCapture: true } );
		this.listenTo( element, 'blur', () => this._blur(), { useCapture: true } );
		this._elements.push( element );
	}

	/**
	 * Removes specified element and stop listening events on this element.
	 * When element is focused then blur it firs.
	 *
	 * @param {HTMLElement} element
	 */
	remove( element ) {
		if ( element === this._focusedElement ) {
			this._blur( element );
		}

		const elementIndex = this._elements.indexOf( element );

		if ( elementIndex > -1 ) {
			this.stopListening( element );
			this._elements.slice( elementIndex, 1 );
		}
	}

	/**
	 * Stores currently focused element and set {utils.FocusManager#isFocused} as `true`.
	 *
	 * @private
	 * @param {HTMLElement} element Element which has been focused.
	 */
	_focus( element ) {
		clearTimeout( this._nextEventLoopTimeout );

		this._focusedElement = element;
		this.isFocused = true;
	}

	/**
	 * Clears currently focused element and set {utils.FocusManager#isFocused} as `false`.
	 * This method uses `setTimeout` to change order of fires `blur` and `focus` events.
	 *
	 * @private
	 * @fires utils.FocusManager#blur
	 */
	_blur() {
		this._nextEventLoopTimeout = setTimeout( () => {
			this._focusedElement = null;
			this.isFocused = false;
		}, 0 );
	}
}

mix( FocusManager, DOMEmitterMixin );
mix( FocusManager, ObservableMixin );
