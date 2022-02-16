/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/tabobserver
 */

import Observer from './observer';
import DomEventData from './domeventdata';
import BubblingEventInfo from './bubblingeventinfo';

import { keyCodes, getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';

/**
 * Tab observer introduces the {@link module:engine/view/document~Document#event:tab} event.
 *
 * @extends module:engine/view/observer/observer~Observer
 */
export default class TabObserver extends Observer {
	/**
	 * @inheritDoc
	 */
	constructor( view ) {
		super( view );

		const doc = this.document;

		doc.on( 'keydown', ( evt, data ) => {
			if ( !this.isEnabled || data.keyCode != keyCodes.tab ) {
				return;
			}

			const event = new BubblingEventInfo( doc, 'tab', doc.selection.getFirstRange() );

			doc.fire( event, new DomEventData( doc, data, {
				altKey: data.altKey,
				ctrlKey: data.ctrlKey,
				shiftKey: data.shiftKey,
				metaKey: data.metaKey,
				get keystroke() {
					return getCode( this );
				}
			} ) );

			if ( event.stop.called ) {
				evt.stop();
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	observe() {}
}

/**
 * Event fired when the user presses a tab key.
 *
 * Introduced by {@link module:engine/view/observer/tabobserver~TabObserver}.
 *
 * Note that because {@link module:engine/view/observer/tabobserver~TabObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @event module:engine/view/document~Document#event:tab
 *
 * @param {module:engine/view/observer/domeventdata~DomEventData} data
 */
