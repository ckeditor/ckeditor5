/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DomEventObserver from './domeventobserver.js';

/**
 * {@link engine.view.Document#click Click} event observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to {@link engine.view.Document}
 * by a {@link engine.view.Document#addObserver} method.
 *
 * @memberOf engine.view.observer
 * @extends engine.view.observer.DomEventObserver
 */
export default class ClickObserver extends DomEventObserver {
	constructor( document ) {
		super( document );

		this.domEventType = 'click';
	}

	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}
}

/**
 * Fired when one of the editables has been clicked.
 *
 * Introduced by {@link engine.view.observer.ClickObserver}.
 *
 * Note that this event is not available by default. To make it available {@link engine.view.observer.ClickObserver} needs to be added
 * to {@link engine.view.Document} by a {@link engine.view.Document#addObserver} method.
 *
 * @see engine.view.observer.ClickObserver
 * @event engine.view.Document#click
 * @param {engine.view.observer.DomEventData} data Event data.
 */
