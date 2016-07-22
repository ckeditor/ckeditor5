/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import extend from '../../../utils/lib/lodash/extend.js';

/**
 * Information about a DOM event in context of the {@link engine.view.Document}.
 * It wraps the native event, which usually should not be used as the wrapper contains
 * additional data (like key code for keyboard events).
 *
 * @memberOf engine.view.observer
 */
export default class DomEventData {
	/**
	 * @param {engine.view.Document} document The instance of the tree view Document.
	 * @param {Event} domEvent The DOM event.
	 * @param {Object} [additionalData] Additional properties that the instance should contain.
	 */
	constructor( document, domEvent, additionalData ) {
		/**
		 * The instance of the document.
		 *
		 * @readonly
		 * @member {engine.view.Document} engine.view.observer.DomEvent#view
		 */
		this.document = document;

		/**
		 * The DOM event.
		 *
		 * @readonly
		 * @member {Event} engine.view.observer.DomEvent#domEvent
		 */
		this.domEvent = domEvent;

		/**
		 * The DOM target.
		 *
		 * @readonly
		 * @member {HTMLElement} engine.view.observer.DomEvent#target
		 */
		this.domTarget = domEvent.target;

		extend( this, additionalData );
	}

	/**
	 * The tree view element representing the target.
	 *
	 * @readonly
	 * @type engine.view.Element
	 */
	get target() {
		return this.document.domConverter.getCorrespondingViewElement( this.domTarget );
	}

	/**
	 * Prevents the native's event default action.
	 */
	preventDefault() {
		this.domEvent.preventDefault();
	}

	/**
	 * Stops native event propagation.
	 */
	stopPropagation() {
		this.domEvent.stopPropagation();
	}
}
