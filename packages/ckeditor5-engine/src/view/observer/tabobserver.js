/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
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
 * Enter observer introduces the {@link module:engine/view/document~Document#event:tab} event. TODO: Check how link works and add tab event
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
			if ( !this.isEnabled || data.keyCode != keyCodes.tab || data.ctrlKey ) {
				return;
			}

			const event = new BubblingEventInfo( doc, 'tab', doc.selection.getFirstRange() );

			doc.fire( event, new DomEventData( doc, data.domEvent, {
				altKey: data.altKey,
				ctrlKey: data.ctrlKey,
				shiftKey: data.shiftKey,
				metaKey: data.metaKey,
				get keystroke() {
					return getCode( this );
				}
			} ) );

			// Stop `keydown` event if `enter` event was stopped.
			// https://github.com/ckeditor/ckeditor5/issues/753
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
 * Fired when a key has been pressed.
 *
 * Introduced by {@link module:engine/view/observer/keyobserver~KeyObserver}.
 *
 * Note that because {@link module:engine/view/observer/keyobserver~KeyObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/keyobserver~KeyObserver
 * @event module:engine/view/document~Document#event:keydown
 * @param {module:engine/view/observer/keyobserver~KeyEventData} keyEventData
 */

/**
 * Fired when a key has been released.
 *
 * Introduced by {@link module:engine/view/observer/keyobserver~KeyObserver}.
 *
 * Note that because {@link module:engine/view/observer/keyobserver~KeyObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/keyobserver~KeyObserver
 * @event module:engine/view/document~Document#event:keyup
 * @param {module:engine/view/observer/keyobserver~KeyEventData} keyEventData
 */

/**
 * The value of both events - {@link module:engine/view/document~Document#event:keydown} and
 * {@link module:engine/view/document~Document#event:keyup}.
 *
 * @class module:engine/view/observer/keyobserver~KeyEventData
 * @extends module:engine/view/observer/domeventdata~DomEventData
 * @implements module:utils/keyboard~KeystrokeInfo
 */

/**
 * Code of the whole keystroke. See {@link module:utils/keyboard~getCode}.
 *
 * @readonly
 * @member {Number} module:engine/view/observer/keyobserver~KeyEventData#keystroke
 */
