/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import DomEventObserver from './domeventobserver.js';

/**
 * {@link engine.view.Document#focus Focus} and {@link engine.view.Document#blur blur} events observer.
 * Focus observer handle also {@link engine.view.RootEditableElement#isFocused isFocused} property of the
 * {@link engine.view.RootEditableElement root elements}.
 *
 * Note that this observer is attached by the {@link engine.EditingController} and is available by default.
 *
 * @memberOf engine.view.observer
 * @extends engine.view.observer.DomEventObserver
 */
export default class FocusObserver extends DomEventObserver {
	constructor( document ) {
		super( document );

		this.domEventType = [ 'focus', 'blur' ];
	}

	onDomEvent( domEvent ) {
		const target = this.document.domConverter.getCorrespondingViewElement( domEvent.target );

		// Update `isFocus` property of root elements.
		for ( let root of this.document.roots.values() ) {
			if ( target === root ) {
				if ( domEvent.type == 'focus' ) {
					root.isFocused = true;
				} else {
					root.isFocused = false;
				}
			}
		}

		this.fire( domEvent.type, domEvent );
	}
}

/**
 * Fired when one of the editables gets focus.
 *
 * Introduced by {@link engine.view.observer.FocusObserver}.
 *
 * Note that because {@link engine.view.observer.FocusObserver} is attached by the {@link engine.EditingController}
 * this event is available by default.
 *
 * @see engine.view.observer.FocusObserver
 * @event engine.view.Document#focus
 * @param {engine.view.observer.DomEventData} data Event data.
 */

/**
 * Fired when one of the editables loses focus.
 *
 * Introduced by {@link engine.view.observer.FocusObserver}.
 *
 * Note that because {@link engine.view.observer.FocusObserver} is attached by the {@link engine.EditingController}
 * this event is available by default.
 *
 * @see engine.view.observer.FocusObserver
 * @event engine.view.Document#blur
 * @param {engine.view.observer.DomEventData} data Event data.
 */
