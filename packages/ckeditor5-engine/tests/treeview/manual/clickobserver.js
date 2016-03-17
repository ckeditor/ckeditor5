/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import TreeView from '/ckeditor5/core/treeview/treeview.js';
import DomEventObserver from '/ckeditor5/core/treeview/observer/domeventobserver.js';

const treeView = new TreeView();
let observer1, observer2;

class ClickObserver1 extends DomEventObserver {
	constructor( treeView ) {
		super( treeView );

		this.id = 1;
		this.domEventType = 'click';
		observer1 = this;
	}

	onDomEvent( domEvt ) {
		this.fire( 'click', this.id, domEvt.target.id );
	}
}

class ClickObserver2 extends DomEventObserver {
	constructor( treeView ) {
		super( treeView );

		this.id = 2;
		this.domEventType = 'click';
		observer2 = this;
	}

	onDomEvent( domEvt ) {
		this.fire( 'click', this.id, domEvt.target.id );
	}
}

treeView.on( 'click', ( evt, eventId, elementId ) => console.log( 'click', eventId, elementId ) );
document.getElementById( 'enable1' ).addEventListener( 'click', () => observer1.enable() );
document.getElementById( 'disable1' ).addEventListener( 'click', () => observer1.disable() );

// Random order.
treeView.addObserver( ClickObserver1 );

treeView.createRoot( document.getElementById( 'clickerA' ), 'clickerA' );

treeView.addObserver( ClickObserver2 );

treeView.createRoot( document.getElementById( 'clickerB' ), 'clickerB' );
