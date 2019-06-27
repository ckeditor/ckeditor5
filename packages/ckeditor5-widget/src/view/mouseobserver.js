/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/view/mouseobserver
 */

import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver';

/**
 * Mouse events observer.
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
 * Fired when mouse button is pressed down on one of the editables.
 *
 * Introduced by {@link module:engine/view/observer/mouseobserver~MouseObserver}.
 *
 * Note that this event is not available by default. To make it available {@link module:engine/view/observer/mouseobserver~MouseObserver}
 * needs to be added to {@link module:engine/view/view~View} by a {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:engine/view/observer/mouseobserver~MouseObserver
 * @event module:engine/view/document~Document#event:mousedown
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */
