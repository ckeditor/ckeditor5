/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document */

import Document from '/ckeditor5/engine/view/document.js';
import DomEventObserver from '/ckeditor5/engine/view/observer/domeventobserver.js';

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
		this.fire( 'click', domEvt, { id: this.id } );
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
		this.fire( 'click', domEvt, { id: this.id } );
	}
}

viewDocument.on( 'click', ( evt, evtData ) => console.log( 'click', evtData.id, evtData.domTarget.id ) );
document.getElementById( 'enable1' ).addEventListener( 'click', () => observer1.enable() );
document.getElementById( 'disable1' ).addEventListener( 'click', () => observer1.disable() );

// Random order.
viewDocument.addObserver( ClickObserver1 );

viewDocument.createRoot( document.getElementById( 'clickerA' ), 'clickerA' );

viewDocument.addObserver( ClickObserver2 );

viewDocument.createRoot( document.getElementById( 'clickerB' ), 'clickerB' );
