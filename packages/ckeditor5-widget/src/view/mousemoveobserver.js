/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/view/MouseMoveObserver
 */

import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver';
import { throttle } from 'lodash-es';

/**
 * Mouse move observer.
 *
 * It throttles the event so that it doesn't fire too often.
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class MouseMoveObserver extends DomEventObserver {
	constructor( view ) {
		super( view );

		this.domEventType = 'mousemove';

		this._fireMouseMoveEvent = throttle( domEvent => this.fire( domEvent.type, domEvent ), 60 );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this._fireMouseMoveEvent.cancel();
	}

	onDomEvent( domEvent ) {
		this._fireMouseMoveEvent( domEvent );
	}
}

/**
 * Fired when mouse moves over the editable.
 *
 * Introduced by {@link module:widget/view/MouseMoveObserver~MouseMoveObserver}.
 *
 * Note that this event is not available by default. To make it available {@link widget/view/MouseMoveObserver~MouseMoveObserver}
 * needs to be added to {@link module:engine/view/view~View} by a {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:widget/view/MouseMoveObserver~MouseMoveObserver
 * @event module:engine/view/document~Document#event:mousemove
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */
