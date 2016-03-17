/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import FocusObserver from '/ckeditor5/core/treeview/observer/focusobserver.js';
import TreeView from '/ckeditor5/core/treeview/treeview.js';

describe( 'FocusObserver', () => {
	let treeView, observer;

	beforeEach( () => {
		treeView = new TreeView();
		treeView.addObserver( FocusObserver );

		observer = Array.from( treeView._observers )[ 0 ];
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.deep.equal( [ 'focus', 'blur' ] );
	} );

	describe( 'onDomEvent', () => {
		it( 'should fire focus with the target', () => {
			const spy = sinon.spy();

			treeView.on( 'focus', spy );

			observer.onDomEvent( { type: 'focus', target: document.body } );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.calledWith( document.body ) );
		} );

		it( 'should fire blur with the target', () => {
			const spy = sinon.spy();

			treeView.on( 'blur', spy );

			observer.onDomEvent( { type: 'blur', target: document.body } );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.calledWith( document.body ) );
		} );
	} );
} );
