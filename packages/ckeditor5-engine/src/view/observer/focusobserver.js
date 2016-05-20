/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import DomEventObserver from './domeventobserver.js';

/**
 * {@link engine.view.Document#focus Focus} and {@link engine.view.Document#blur blur} events observer.
 *
 * @memberOf engine.view.observer
 * @extends engine.view.observer.DomEventObserver
 */
export default class FocusObserver extends DomEventObserver {
	constructor( document ) {
		super( document );

		this.domEventType = [ 'focus', 'blur' ];
	}

	onDomEvent( domEvt ) {
		this.fire( domEvt.type, domEvt );
	}
}

/**
 * Fired when one of the editables gets focus.
 *
 * @event engine.view.Document#focus
 * @param {engine.view.observer.DomEventData} data Event data.
 */

/**
 * Fired when one of the editables loses focus.
 *
 * @event engine.view.Document#blur
 * @param {engine.view.observer.DomEventData} data Event data.
 */
