/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DomEventObserver from '../engine/view/observer/domeventobserver.js';

export default class MouseDownObserver extends DomEventObserver {
	constructor( document ) {
		super( document );

		this.domEventType = 'mousedown';
	}

	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}
}
