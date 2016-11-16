/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DomEventObserver from '../engine/view/observer/domeventobserver.js';

/**
 * {@link engine.view.Document#mousedown} event observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to {@link engine.view.Document}
 * by {@link engine.view.Document#addObserver} method.
 *
 * @memberOf image
 * @extends engine.view.observer.DomEventObserver
 */
export default class MouseDownObserver extends DomEventObserver {
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
 * Introduced by {@link image.MouseDownObserver}.
 *
 * Note that this event is not available by default. To make it available {@link image.MouseDownObserver} needs to be added
 * to {@link engine.view.Document} by a {@link engine.view.Document#addObserver} method.
 *
 * @see image.MouseDownObserver
 * @event engine.view.Document#mousedown
 * @param {engine.view.observer.DomEventData} data Event data.
 */
