/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DomEventObserver from './domeventobserver.js';

/**
 * Mouse events observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to {@link engine.view.Document}
 * by {@link engine.view.Document#addObserver} method.
 *
 * @memberOf engine.view.observer
 * @extends engine.view.observer.DomEventObserver
 */
export default class MouseObserver extends DomEventObserver {
	constructor( document ) {
		super( document );

		this.domEventType = 'mousedown';
	}

	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}
}

/**
 * Fired when mouse button is pressed down on one of the editables.
 *
 * Introduced by {@link engine.view.observer.MouseObserver}.
 *
 * Note that this event is not available by default. To make it available {@link engine.view.observer.MouseObserver}
 * needs to be added to {@link engine.view.Document} by a {@link engine.view.Document#addObserver} method.
 *
 * @see engine.view.observer.MouseObserver
 * @event engine.view.Document#mousedown
 * @param {engine.view.observer.DomEventData} data Event data.
 */
