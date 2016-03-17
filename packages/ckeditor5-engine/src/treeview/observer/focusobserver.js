/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import DomEventObserver from './domeventobserver.js';

/**
 * {@link core.treeView.TreeView#focus Focus} and {@link core.treeView.TreeView#blur blur} events observer.
 *
 * @memberOf core.treeView.observer
 * @extends core.treeView.observer.DomEventObserver
 */
export default class FocusObserver extends DomEventObserver {
	constructor( treeView ) {
		super( treeView );

		this.domEventType = [ 'focus', 'blur' ];
	}

	onDomEvent( domEvt ) {
		this.fire( domEvt.type, domEvt.target );
	}
}

/**
 * Fired when one of the editables gets focus.
 *
 * @event core.treeView.TreeView#focus
 * @param {HTMLElement} The event target (editable element that was focused).
 */

/**
 * Fired when one of the editables loses focus.
 *
 * @event core.treeView.TreeView#blur
 * @param {HTMLElement} The event target (editable element that was blurred).
 */
