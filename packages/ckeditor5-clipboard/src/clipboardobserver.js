/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DomEventObserver from '../engine/view/observer/domeventobserver.js';
import DataTransfer from './datatransfer.js';

/**
 * {@link engine.view.Document#paste Paste} event observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to {@link engine.view.Document}
 * by the {@link engine.view.Document#addObserver} method.
 *
 * @memberOf clipboard
 * @extends engine.view.observer.DomEventObserver
 */
export default class ClipboardObserver extends DomEventObserver {
	constructor( doc ) {
		super( doc );

		this.domEventType = [ 'paste', 'copy', 'cut' ];
	}

	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent, {
			dataTransfer: new DataTransfer( domEvent.clipboardData )
		} );
	}
}

/**
 * Fired when user pasted content into one of the editables.
 *
 * Introduced by {@link clipboard.ClipboardObserver}.
 *
 * Note that this event is not available by default. To make it available {@link clipboard.ClipboardObserver} needs to be added
 * to {@link engine.view.Document} by the {@link engine.view.Document#addObserver} method.
 * It's done by the {@link clipboard.Clipboard} feature. If it's not loaded, it must be done manually.
 *
 * @see clipboard.ClipboardObserver
 * @event engine.view.Document#paste
 * @param {engine.view.observer.ClipboardEventData} data Event data.
 */

/**
 * The value of the {@link engine.view.Document#paste} event.
 *
 * In order to access clipboard data use {@link #dataTransfer}.
 *
 * @class engine.view.observer.ClipboardEventData
 * @extends engine.view.observer.DomEventData
 */

/**
 * Data transfer instance.
 *
 * @readonly
 * @member {clipboard.DataTransfer} engine.view.observer.ClipboardEventData#dataTransfer
 */
