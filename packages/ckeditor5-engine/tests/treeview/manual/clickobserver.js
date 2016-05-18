/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import Document from '/ckeditor5/engine/treeview/document.js';
import DomEventObserver from '/ckeditor5/engine/treeview/observer/domeventobserver.js';

const viewDocument = new Document();
let observer1, observer2;

class ClickObserver1 extends DomEventObserver {
	constructor( viewDocument ) {
		super( viewDocument );

		this.id = 1;
		this.domEventType = 'click';
		observer1 = this;
	}

	onDomEvent( domEvt ) {
		this.fire( 'click', this.id, domEvt.target.id );
	}
}

class ClickObserver2 extends DomEventObserver {
	constructor( viewDocument ) {
		super( viewDocument );

		this.id = 2;
		this.domEventType = 'click';
		observer2 = this;
	}

	onDomEvent( domEvt ) {
		this.fire( 'click', this.id, domEvt.target.id );
	}
}

viewDocument.on( 'click', ( evt, eventId, elementId ) => console.log( 'click', eventId, elementId ) );
document.getElementById( 'enable1' ).addEventListener( 'click', () => observer1.enable() );
document.getElementById( 'disable1' ).addEventListener( 'click', () => observer1.disable() );

// Random order.
viewDocument.addObserver( ClickObserver1 );

viewDocument.createRoot( document.getElementById( 'clickerA' ), 'clickerA' );

viewDocument.addObserver( ClickObserver2 );

viewDocument.createRoot( document.getElementById( 'clickerB' ), 'clickerB' );
