/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/mouseobserver
 */

import DomEventObserver from './domeventobserver';

/**
 * Mouse events observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~View} by {@link module:engine/view/view~View#addObserver} method.
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class MouseObserver extends DomEventObserver {
	constructor( view ) {
		super( view );

		this.domEventType = [ 'mousedown', 'mouseup' ];
	}

	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}
}

/**
 * Fired when the mouse button is pressed down on one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/mouseobserver~MouseObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:engine/view/observer/mouseobserver~MouseObserver}
 * needs to be added to {@link module:engine/view/view~View} by the {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:engine/view/observer/mouseobserver~MouseObserver
 * @event module:engine/view/document~Document#event:mousedown
 * @param {module:engine/view/observer/domeventdata~DomEventData} data The event data.
 */

/**
 * Fired when the mouse button is released over one of the editing roots of the editor.
 *
 * Introduced by {@link module:engine/view/observer/mouseobserver~MouseObserver}.
 *
 * Note that this event is not available by default. To make it available, {@link module:engine/view/observer/mouseobserver~MouseObserver}
 * needs to be added to {@link module:engine/view/view~View} by the {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:engine/view/observer/mouseobserver~MouseObserver
 * @event module:engine/view/document~Document#event:mouseup
 * @param {module:engine/view/observer/domeventdata~DomEventData} data The event data.
 */
