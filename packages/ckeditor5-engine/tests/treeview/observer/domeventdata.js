/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import DomEventData from '/ckeditor5/engine/treeview/observer/domeventdata.js';
import TreeView from '/ckeditor5/engine/treeview/treeview.js';

describe( 'DomEventData', () => {
	let treeView, viewBody;

	beforeEach( () => {
		treeView = new TreeView();

		viewBody = treeView.domConverter.domToView( document.body, { bind: true } );
	} );

	describe( 'constructor', () => {
		it( 'sets properties', () => {
			const domEvt = { target: document.body };
			const data = new DomEventData( treeView, domEvt, { foo: 1, bar: true } );

			expect( data ).to.have.property( 'treeView', treeView );
			expect( data ).to.have.property( 'domEvent', domEvt );
			expect( data ).to.have.property( 'domTarget', document.body );

			expect( data ).to.have.property( 'foo', 1 );
			expect( data ).to.have.property( 'bar', true );
		} );
	} );

	describe( 'target', () => {
		it( 'returns bound element', () => {
			const domEvt = { target: document.body };
			const data = new DomEventData( treeView, domEvt );

			expect( data ).to.have.property( 'target', viewBody );
		} );
	} );
} );
