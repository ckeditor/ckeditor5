/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/arrowkeysobserver
 */

import BubblingObserver from './bubblingobserver';

import { isArrowKeyCode } from '@ckeditor/ckeditor5-utils';

/**
 * Arrow keys observer introduces the {@link module:engine/view/document~Document#event:arrowkey} event.
 *
 * @extends module:engine/view/observer/bubblingobserver~BubblingObserver
 */
export default class ArrowKeysObserver extends BubblingObserver {
	constructor( view ) {
		super( view, 'keydown', 'arrowkey' );
	}

	/**
	 * @inheritDoc
	 */
	observe() {}

	/**
	 * @inheritDoc
	 */
	_translateEvent( data, ...args ) {
		if ( !isArrowKeyCode( data.keyCode ) ) {
			return false;
		}

		return super._translateEvent( data, ...args );
	}
}

/**
 * Event fired when the user presses an arrow keys.
 *
 * Introduced by {@link module:engine/view/observer/arrowkeysobserver~ArrowKeysObserver}.
 *
 * Note that because {@link module:engine/view/observer/arrowkeysobserver~ArrowKeysObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @event module:engine/view/document~Document#event:arrowkey
 * @param {module:engine/view/observer/domeventdata~DomEventData} data
 */
