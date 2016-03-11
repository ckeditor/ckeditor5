/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import TreeView from '/ckeditor5/core/treeview/treeview.js';
import DomEventObserver from '/ckeditor5/core/treeview/observer/domeventobserver.js';

const treeView = new TreeView();

class ClickObserver extends DomEventObserver {
	constructor( id ) {
		super();

		this.id = id;
		this.domEventType = 'click';
	}

	onDomEvent( domEvt ) {
		this.fire( 'click', this.id, domEvt.target.id );
	}
}

const observer1 = new ClickObserver( 1 );
const observer2 = new ClickObserver( 2 );

treeView.on( 'click', ( evt, eventId, elementId ) => console.log( 'click', eventId, elementId ) );
document.getElementById( 'enable1' ).addEventListener( 'click', () => observer1.enable() );
document.getElementById( 'disable1' ).addEventListener( 'click', () => observer1.disable() );

// Random order
treeView.addObserver( observer1 );

treeView.createRoot( document.getElementById( 'clickerA' ), 'clickerA' );

treeView.addObserver( observer2 );

treeView.createRoot( document.getElementById( 'clickerB' ), 'clickerB' );