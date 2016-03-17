/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Observer from './observer.js';

/**
 * Base class for DOM event observers. This class handles
 * {@link core.treeView.observer.Observer#observe adding} listeners to DOM elements,
 * {@link core.treeView.observer.Observer#disable disabling} and
 * {@link core.treeView.observer.Observer#enable re-enabling} events.
 * Child class needs to define
 * {@link core.treeView.observer.DomEventObserver#domEventType DOM event type} and
 * {@link core.treeView.observer.DomEventObserver#onDomEvent callback}.
 *
 * For instance:
 *
 *		class ClickObserver extends DomEventObserver {
 *			// It can also be defined as a normal property in the constructor.
 *			get domEventType() {
 *				return 'click';
 *			}
 *
 *			onDomEvent( domEvt ) {
 *				this.fire( 'click' );
 *			}
 *		}
 *
 * @memberOf core.treeView.observer
 * @extends core.treeView.observer.Observer
 */
export default class DomEventObserver extends Observer {
	constructor( treeView ) {
		super( treeView );

		/**
		 * Type of the DOM event the observer should listen on. Array of types can be defined
		 * if the obsever should listen to multiple DOM events.
		 *
		 * @readonly
		 * @member {String|Array.<String>} core.treeView.observer.DomEventObserver#domEventType
		 */
	}

	/**
	 * Callback which should be called when the DOM event occurred. Note that the callback will not be called if
	 * observer {@link core.treeView.observer.DomEventObserver#isEnabled is not enabled}.
	 *
	 * @see core.treeView.observer.DomEventObserver#domEventType
	 * @abstract
	 * @method core.treeView.observer.DomEventObserver#onDomEvent
	 */

	/**
	 * @inheritDoc
	 */
	observe( domElement ) {
		const types = typeof this.domEventType == 'string' ? [ this.domEventType ] : this.domEventType;

		types.forEach( type => {
			domElement.addEventListener( type, domEvent => this.isEnabled && this.onDomEvent( domEvent ) );
		} );
	}

	/**
	 * Calls {@link core.treeView.TreeView#fire} if observer
	 * {@link core.treeView.observer.DomEventObserver#isEnabled is enabled}.
	 *
	 * @see core.treeView.TreeView#fire
	 * @param {...*} args Fire arguments {@link core.treeView.TreeView#fire}.
	 */
	fire( ...args ) {
		if ( this.isEnabled ) {
			this.treeView.fire( ...args );
		}
	}
}
