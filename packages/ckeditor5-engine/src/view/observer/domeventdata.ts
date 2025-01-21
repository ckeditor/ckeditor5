/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/observer/domeventdata
 */

import { extend } from 'es-toolkit/compat';

import type Document from '../document.js';
import type Element from '../element.js';
import type View from '../view.js';

/**
 * Information about a DOM event in context of the {@link module:engine/view/document~Document}.
 * It wraps the native event, which usually should not be used as the wrapper contains
 * additional data (like key code for keyboard events).
 *
 * @typeParam TEvent The type of DOM Event that this class represents.
 */
export default class DomEventData<TEvent extends Event = Event> {
	/**
	 * Instance of the view controller.
	 */
	public readonly view: View;

	/**
	 * The instance of the document.
	 */
	public readonly document: Document;

	/**
	 * The DOM event.
	 */
	public readonly domEvent: TEvent;

	/**
	 * The DOM target.
	 */
	public readonly domTarget: HTMLElement;

	/**
	 * @param view The instance of the view controller.
	 * @param domEvent The DOM event.
	 * @param additionalData Additional properties that the instance should contain.
	 */
	constructor( view: View, domEvent: TEvent, additionalData?: object ) {
		this.view = view;
		this.document = view.document;
		this.domEvent = domEvent;
		this.domTarget = domEvent.target as any;

		extend( this, additionalData );
	}

	/**
	 * The tree view element representing the target.
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
