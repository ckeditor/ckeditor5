/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import DomEventObserver from './domeventobserver.js';

/**
 * {@link engine.treeView.TreeView#focus Focus} and {@link engine.treeView.TreeView#blur blur} events observer.
 *
 * @memberOf engine.treeView.observer
 * @extends engine.treeView.observer.DomEventObserver
 */
export default class FocusObserver extends DomEventObserver {
	constructor( treeView ) {
		super( treeView );

		this.domEventType = [ 'focus', 'blur' ];
	}

	onDomEvent( domEvt ) {
		const treeView = this.treeView;

		this.fire( domEvt.type, {
			get target() {
				return treeView.domConverter.getCorrespondingViewElement( domEvt.target );
			},

			domTarget: domEvt.target
		} );
	}
}

/**
 * Fired when one of the editables gets focus.
 *
 * @event engine.treeView.TreeView#focus
 * @param {engine.treeView.Element} data.target The event view target (editable element that was focused).
 * @param {HTMLElement} data.domTarget The event DOM target (editable element that was focused).
 */

/**
 * Fired when one of the editables loses focus.
 *
 * @event engine.treeView.TreeView#blur
 * @param {engine.treeView.Element} data.target The event view target (editable element that was blurred).
 * @param {HTMLElement} data.domTarget The event DOM target (editable element that was blurred).
 */
