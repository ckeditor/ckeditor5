/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, document */

import Document from '../../../src/view/document';
import DomEventObserver from '../../../src/view/observer/domeventobserver';

const viewDocument = new Document();

class ClickObserver1 extends DomEventObserver {
	constructor( viewDocument ) {
		super( viewDocument );

		this.id = 1;
		this.domEventType = 'click';
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
	}

	onDomEvent( domEvt ) {
		this.fire( 'click', domEvt, { id: this.id } );
	}
}

const observer1 = new ClickObserver1( viewDocument );

viewDocument.on( 'click', ( evt, evtData ) => console.log( 'click', evtData.id, evtData.domTarget.id ) );
document.getElementById( 'enable1' ).addEventListener( 'click', () => observer1.enable() );
document.getElementById( 'disable1' ).addEventListener( 'click', () => observer1.disable() );

// Random order.
viewDocument.addObserver( ClickObserver1 );

viewDocument.createRoot( document.getElementById( 'clickerA' ), 'clickerA' );

viewDocument.addObserver( ClickObserver2 );

viewDocument.createRoot( document.getElementById( 'clickerB' ), 'clickerB' );
