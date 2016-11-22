/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/observer/domeventobserver
 */

import Observer from './observer.js';
import DomEventData from './domeventdata.js';

/**
 * Base class for DOM event observers. This class handles
 * {@link module:engine/view/observer/observer~Observer#observe adding} listeners to DOM elements,
 * {@link module:engine/view/observer/observer~Observer#disable disabling} and
 * {@link module:engine/view/observer/observer~Observer#enable re-enabling} events.
 * Child class needs to define
 * {@link module:engine/view/observer/observer~Observer.DomEventObserver#domEventType DOM event type} and
 * {@link module:engine/view/observer/observer~Observer.DomEventObserver#onDomEvent callback}.
 *
 * For instance:
 *
 *		class ClickObserver extends DomEventObserver {
 *			// It can also be defined as a normal property in the constructor.
 *			get domEventType() {
 *				return 'click';
 *			}
 *
 *			onDomEvent( domEvent ) {
 *				this.fire( 'click', domEvent );
 *			}
 *		}
 *
 * @extends module:engine/view/observer/observer~Observer.Observer
 */
export default class DomEventObserver extends Observer {
	/**
	 * Type of the DOM event the observer should listen on. Array of types can be defined
	 * if the obsever should listen to multiple DOM events.
	 *
	 * @readonly
	 * @member {String|Array.<String>} module:engine/view/observer/observer~Observer.DomEventObserver#domEventType
	 */

	/**
	 * Callback which should be called when the DOM event occurred. Note that the callback will not be called if
	 * observer {@link module:engine/view/observer/observer~Observer.DomEventObserver#isEnabled is not enabled}.
	 *
	 * @see module:engine/view/observer/observer~Observer.DomEventObserver#domEventType
	 * @abstract
	 * @method module:engine/view/observer/observer~Observer.DomEventObserver#onDomEvent
	 */

	/**
	 * @inheritDoc
	 */
	observe( domElement ) {
		const types = typeof this.domEventType == 'string' ? [ this.domEventType ] : this.domEventType;

		types.forEach( type => {
			this.listenTo( domElement, type, ( eventInfo, domEvent ) => {
				if ( this.isEnabled ) {
					this.onDomEvent( domEvent );
				}
			} );
		} );
	}

	/**
	 * Calls {@link module:engine/view/document~Document#fire} if observer
	 * {@link module:engine/view/observer/observer~Observer.DomEventObserver#isEnabled is enabled}.
	 *
	 * @see module:engine/view/document~Document#fire
	 * @param {String} eventType The event type (name).
	 * @param {Event} domEvent The DOM event.
	 * @param {Object} [additionalData] The additional data which should extend the
	 * {@link module:engine/view/observer/domeventdata~DomEventData event data} object.
	 */
	fire( eventType, domEvent, additionalData ) {
		if ( this.isEnabled ) {
			this.document.fire( eventType, new DomEventData( this.document, domEvent, additionalData ) );
		}
	}
}
