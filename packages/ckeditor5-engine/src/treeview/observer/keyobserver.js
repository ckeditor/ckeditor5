/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import DomEventObserver from './domeventobserver.js';
import { getCode } from '../../../utils/keyboard.js';

/**
 * {@link engine.treeView.TreeView#keydown Key down} event observer.
 *
 * @memberOf engine.treeView.observer
 * @extends engine.treeView.observer.DomEventObserver
 */
export default class KeyObserver extends DomEventObserver {
	constructor( treeView ) {
		super( treeView );

		this.domEventType = 'keydown';
	}

	onDomEvent( domEvt ) {
		this.fire( 'keydown', domEvt, {
			keyCode: domEvt.keyCode,

			altKey: domEvt.altKey,
			ctrlKey: domEvt.ctrlKey || domEvt.metaKey,
			shiftKey: domEvt.shiftKey,

			get keystroke() {
				return getCode( this );
			}
		} );
	}
}

/**
 * Fired when a key has been pressed.
 *
 * @event engine.treeView.TreeView#keydown
 * @param {engine.treeView.observer.keyObserver.KeyEventInfo} keyEventInfo
 */

/**
 * The value of the {@link engine.treeView.TreeView#keydown} event.
 *
 * @class engine.treeView.observer.keyObserver.KeyEventInfo
 * @extends engine.treeView.observer.DomEventData
 * @implements utils.keyboard.KeystrokeInfo
 */

/**
 * Code of the whole keystroke. See {@link utils.keyboard.getCode}.
 *
 * @readonly
 * @member {Number} engine.treeView.observer.keyObserver.KeyEventInfo#keystroke
 */
