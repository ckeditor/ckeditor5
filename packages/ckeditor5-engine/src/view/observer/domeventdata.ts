/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/domeventdata
 */

import { extend } from 'lodash-es';

import type Document from '../document';
import type Element from '../element';
import type View from '../view';

/**
 * Information about a DOM event in context of the {@link module:engine/view/document~Document}.
 * It wraps the native event, which usually should not be used as the wrapper contains
 * additional data (like key code for keyboard events).
 */
export default class DomEventData<TEvent extends Event = Event> {
	public readonly view: View;
	public readonly document: Document;
	public readonly domEvent: TEvent;
	public readonly domTarget: HTMLElement;

	/**
	 * @param {module:engine/view/view~View} view The instance of the view controller.
	 * @param {Event} domEvent The DOM event.
	 * @param {Object} [additionalData] Additional properties that the instance should contain.
	 */
	constructor( view: View, domEvent: TEvent, additionalData?: object ) {
		/**
		 * Instance of the view controller.
		 *
		 * @readonly
		 * @member {module:engine/view/view~View} module:engine/view/observer/observer~Observer.DomEvent#view
		 */
		this.view = view;

		/**
		 * The instance of the document.
		 *
		 * @readonly
		 * @member {module:engine/view/document~Document} module:engine/view/observer/observer~Observer.DomEvent#document
		 */
		this.document = view.document;

		/**
		 * The DOM event.
		 *
		 * @readonly
		 * @member {Event} module:engine/view/observer/observer~Observer.DomEvent#domEvent
		 */
		this.domEvent = domEvent;

		/**
		 * The DOM target.
		 *
		 * @readonly
		 * @member {HTMLElement} module:engine/view/observer/observer~Observer.DomEvent#target
		 */
		this.domTarget = domEvent.target as any;

		extend( this, additionalData );
	}

	/**
	 * The tree view element representing the target.
	 *
	 * @readonly
	 * @type module:engine/view/element~Element
	 */
	public get target(): Element {
		return this.view.domConverter.mapDomToView( this.domTarget ) as Element;
	}

	/**
	 * Prevents the native's event default action.
	 */
	public preventDefault(): void {
		this.domEvent.preventDefault();
	}

	/**
	 * Stops native event propagation.
	 */
	public stopPropagation(): void {
		this.domEvent.stopPropagation();
	}
}
