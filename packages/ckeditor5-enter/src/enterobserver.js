/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Observer from '../engine/view/observer/observer.js';
import DomEventData from '../engine/view/observer/domeventdata.js';
import { keyCodes } from '../utils/keyboard.js';

/**
 * Enter observer introduces the {@link engine.view.Document#enter} event.
 *
 * @memberOf enter
 * @extends engine.view.observer.Observer
 */
export default class EnterObserver extends Observer {
	constructor( document ) {
		super( document );

		document.on( 'keydown', ( evt, data ) => {
			if ( this.isEnabled && data.keyCode == keyCodes.enter ) {
				document.fire( 'enter', new DomEventData( document, data.domEvent ) );
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	observe() {}
}

/**
 * Event fired when the user presses the <kbd>Enter</kbd> key.
 *
 * Note: This event is fired by the {@link enter.EnterObserver observer}
 * (usually registered by the {@link enter.Enter Enter feature}).
 *
 * @event engine.view.Document#enter
 * @param {engine.view.observer.DomEventData} data
 */
