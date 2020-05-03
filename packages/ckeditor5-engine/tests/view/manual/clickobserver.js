/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document */

import View from '../../../src/view/view';
import DomEventObserver from '../../../src/view/observer/domeventobserver';
import createViewRoot from '../_utils/createroot';
import { StylesProcessor } from '../../../src/view/stylesmap';

const view = new View( new StylesProcessor() );
const viewDocument = view.document;

// Disable rendering for this example, because it re-enables all observers each time view is rendered.
view.render = () => {};

class ClickObserver1 extends DomEventObserver {
	constructor( view ) {
		super( view );

		this.id = 1;
		this.domEventType = 'click';
	}

	onDomEvent( domEvt ) {
		this.fire( 'click', domEvt, { id: this.id } );
	}
}

class ClickObserver2 extends DomEventObserver {
	constructor( view ) {
		super( view );

		this.id = 2;
		this.domEventType = 'click';
	}

	onDomEvent( domEvt ) {
		this.fire( 'click', domEvt, { id: this.id } );
	}
}

viewDocument.on( 'click', ( evt, evtData ) => console.log( 'click', evtData.id, evtData.domTarget.id ) );

// Random order.
view.addObserver( ClickObserver1 );
createViewRoot( viewDocument, 'div', 'clickerA' );
view.attachDomRoot( document.getElementById( 'clickerA' ), 'clickerA' );

view.addObserver( ClickObserver2 );
createViewRoot( viewDocument, 'div', 'clickerB' );
view.attachDomRoot( document.getElementById( 'clickerB' ), 'clickerB' );

document.getElementById( 'enable1' ).addEventListener( 'click', () => view.getObserver( ClickObserver1 ).enable() );
document.getElementById( 'disable1' ).addEventListener( 'click', () => view.getObserver( ClickObserver1 ).disable() );
