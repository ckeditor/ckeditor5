/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection/mouseeventsobserver
 */

import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver';

/**
 * Mouse selection events observer.
 *
 * It register listener for DOM events:
 *
 * - `'mousemove'`
 * - `'mouseup'`
 * - `'mouseleave'`
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~View} by {@link module:engine/view/view~View#addObserver} method.
 *
 * It is registered by {@link module:table/tableselection/mouseselectionhandler~MouseSelectionHandler}.
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class MouseEventsObserver extends DomEventObserver {
	/**
	 * @inheritDoc
	 */
	constructor( view ) {
		super( view );

		this.domEventType = [ 'mousemove', 'mouseup', 'mouseleave' ];
	}

	/**
	 * @inheritDoc
	 */
	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}
}

/**
 * Fired when mouse button is released over one of the editables.
 *
 * Introduced by {@link module:table/tableselection/mouseeventsobserver~MouseEventsObserver}.
 *
 * Note that this event is not available by default. To make it available
 * {@link module:table/tableselection/mouseeventsobserver~MouseEventsObserver}  needs to be added
 * to {@link module:engine/view/view~View} by a {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:table/tableselection/mouseeventsobserver~MouseEventsObserver
 * @event module:engine/view/document~Document#event:mouseup
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */

/**
 * Fired when mouse is moved over one of the editables.
 *
 * Introduced by {@link module:table/tableselection/mouseeventsobserver~MouseEventsObserver}.
 *
 * Note that this event is not available by default. To make it available
 * {@link module:table/tableselection/mouseeventsobserver~MouseEventsObserver}  needs to be added
 * to {@link module:engine/view/view~View} by a {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:table/tableselection/mouseeventsobserver~MouseEventsObserver
 * @event module:engine/view/document~Document#event:mousemove
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */

/**
 * Fired when mouse is moved away from one of the editables.
 *
 * Introduced by {@link module:table/tableselection/mouseeventsobserver~MouseEventsObserver}.
 *
 * Note that this event is not available by default. To make it available
 * {@link module:table/tableselection/mouseeventsobserver~MouseEventsObserver}  needs to be added
 * to {@link module:engine/view/view~View} by a {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:table/tableselection/mouseeventsobserver~MouseEventsObserver
 * @event module:engine/view/document~Document#event:mouseleave
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */
