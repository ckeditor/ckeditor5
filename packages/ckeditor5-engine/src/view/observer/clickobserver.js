
/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/clickobserver
 */

import DomEventObserver from './domeventobserver';

/**
 * {@link module:engine/view/document~Document#event:click Click} event observer.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~View view controller}
 * by a {@link module:engine/view/view~View#addObserver} method.
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class ClickObserver extends DomEventObserver {
	constructor( view ) {
		super( view );

		this.domEventType = 'click';
	}

	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}
}

/**
 * Fired when one of the editables has been clicked.
 *
 * Introduced by {@link module:engine/view/observer/clickobserver~ClickObserver}.
 *
 * Note that this event is not available by default. To make it available
 * {@link module:engine/view/observer/clickobserver~ClickObserver} needs to be added
 * to {@link module:engine/view/view~View} by a {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:engine/view/observer/clickobserver~ClickObserver
 * @event module:engine/view/document~Document#event:click
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */
