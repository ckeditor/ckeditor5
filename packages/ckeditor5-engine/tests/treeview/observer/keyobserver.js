/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import KeyObserver from '/ckeditor5/engine/treeview/observer/keyobserver.js';
import TreeView from '/ckeditor5/engine/treeview/treeview.js';
import { getCode } from '/ckeditor5/utils/keyboard.js';

describe( 'KeyObserver', () => {
	let treeView, observer;

	beforeEach( () => {
		treeView = new TreeView();
		treeView.addObserver( KeyObserver );

		observer = Array.from( treeView._observers )[ 0 ];
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.equal( 'keydown' );
	} );

	describe( 'onDomEvent', () => {
		it( 'should fire keydown with the target and key info', () => {
			const spy = sinon.spy();

			treeView.on( 'keydown', spy );

			observer.onDomEvent( { target: document.body, keyCode: 111, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data ).to.have.property( 'domTarget', document.body );
			expect( data ).to.have.property( 'keyCode', 111 );
			expect( data ).to.have.property( 'altKey', false );
			expect( data ).to.have.property( 'ctrlKey', false );
			expect( data ).to.have.property( 'shiftKey', false );
			expect( data ).to.have.property( 'keystroke', getCode( data ) );

			// Just to be sure.
			expect( getCode( data ) ).to.equal( 111 );
		} );

		it( 'should fire keydown with proper key modifiers info', () => {
			const spy = sinon.spy();

			treeView.on( 'keydown', spy );

			observer.onDomEvent( { target: document.body, keyCode: 111, altKey: true, ctrlKey: true, metaKey: false, shiftKey: true } );

			const data = spy.args[ 0 ][ 1 ];
			expect( data ).to.have.property( 'keyCode', 111 );
			expect( data ).to.have.property( 'altKey', true );
			expect( data ).to.have.property( 'ctrlKey', true );
			expect( data ).to.have.property( 'shiftKey', true );
			expect( data ).to.have.property( 'keystroke', getCode( data ) );

			// Just to be sure.
			expect( getCode( data ) ).to.be.greaterThan( 111 );
		} );

		it( 'should fire keydown ctrlKey set to true one meta (cmd) was pressed', () => {
			const spy = sinon.spy();

			treeView.on( 'keydown', spy );

			observer.onDomEvent( { target: document.body, keyCode: 111, metaKey: true } );

			const data = spy.args[ 0 ][ 1 ];
			expect( data ).to.have.property( 'ctrlKey', true );
		} );
	} );
} );
