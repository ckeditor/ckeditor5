/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/inputobserver
 */

import DomEventObserver from './domeventobserver';

/**
 * Observer for events connected with data input.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~View} and is available by default.
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class InputObserver extends DomEventObserver {
	constructor( view ) {
		super( view );

		this.domEventType = [ 'beforeinput' ];
	}

	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}
}

/**
 * Fired before browser inputs (or deletes) some data.
 *
 * This event is available only on browsers which support DOM `beforeinput` event.
 *
 * Introduced by {@link module:engine/view/observer/inputobserver~InputObserver}.
 *
 * Note that because {@link module:engine/view/observer/inputobserver~InputObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/inputobserver~InputObserver
 * @event module:engine/view/document~Document#event:beforeinput
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */
