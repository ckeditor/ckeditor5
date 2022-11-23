/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/domeventobserver
 */

import Observer from './observer';
import DomEventData from './domeventdata';
import type View from '../view';

import type { EventInfo } from '@ckeditor/ckeditor5-utils';

/**
 * Base class for DOM event observers. This class handles
 * {@link module:engine/view/observer/observer~Observer#observe adding} listeners to DOM elements,
 * {@link module:engine/view/observer/observer~Observer#disable disabling} and
 * {@link module:engine/view/observer/observer~Observer#enable re-enabling} events.
 * Child class needs to define
 * {@link module:engine/view/observer/domeventobserver~DomEventObserver#domEventType DOM event type} and
 * {@link module:engine/view/observer/domeventobserver~DomEventObserver#onDomEvent callback}.
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
 * @extends module:engine/view/observer/observer~Observer
 */

export default abstract class DomEventObserver<
	EventType extends keyof HTMLElementEventMap,
	AdditionalData extends object = object
> extends Observer {
	public domEventType!: EventType | Array<EventType>;

	public useCapture: boolean;

	/**
	 * Type of the DOM event the observer should listen to. Array of types can be defined
	 * if the observer should listen to multiple DOM events.
	 *
	 * @readonly
	 * @member {String|Array.<String>} #domEventType
	 */

	/**
	 * Callback which should be called when the DOM event occurred. Note that the callback will not be called if
	 * observer {@link #isEnabled is not enabled}.
	 *
	 * @see #domEventType
	 * @abstract
	 * @method #onDomEvent
	 */

	public abstract onDomEvent( event: HTMLElementEventMap[ EventType ] ): void;

	/**
	 * @inheritDoc
	 */
	constructor( view: View ) {
		super( view );

		/**
		 * If set to `true` DOM events will be listened on the capturing phase.
		 * Default value is `false`.
		 *
		 * @member {Boolean}
		 */
		this.useCapture = false;
	}

	/**
	 * @inheritDoc
	 */
	public override observe( domElement: HTMLElement ): void {
		const types = typeof this.domEventType == 'string' ? [ this.domEventType ] : this.domEventType;

		types.forEach( type => {
			this.listenTo( domElement, type, ( eventInfo, domEvent ) => {
				if ( this.isEnabled && !this.checkShouldIgnoreEventFromTarget( domEvent.target as any ) ) {
					this.onDomEvent( domEvent );
				}
			}, { useCapture: this.useCapture } );
		} );
	}

	/**
	 * Calls `Document#fire()` if observer {@link #isEnabled is enabled}.
	 *
	 * @see module:utils/emittermixin~EmitterMixin#fire
	 * @param {String} eventType The event type (name).
	 * @param {Event} domEvent The DOM event.
	 * @param {Object} [additionalData] The additional data which should extend the
	 * {@link module:engine/view/observer/domeventdata~DomEventData event data} object.
	 */
	public override fire( eventType: string | EventInfo, domEvent: Event, additionalData?: AdditionalData ): void {
		if ( this.isEnabled ) {
			this.document.fire( eventType, new DomEventData( this.view, domEvent, additionalData ) );
		}
	}
}
