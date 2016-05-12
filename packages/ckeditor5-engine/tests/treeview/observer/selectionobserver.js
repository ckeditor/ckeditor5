/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import ViewRange from '/ckeditor5/engine/treeview/range.js';
import ViewSelection from '/ckeditor5/engine/treeview/selection.js';
import TreeView from '/ckeditor5/engine/treeview/treeview.js';
import SelectionObserver from '/ckeditor5/engine/treeview/observer/selectionobserver.js';
import MutationObserver from '/ckeditor5/engine/treeview/observer/mutationobserver.js';

import EmitterMixin from '/ckeditor5/utils/emittermixin.js';

import { parse } from '/tests/engine/_utils/view.js';

describe( 'SelectionObserver', () => {
	let treeView, viewRoot, mutationObserver, selectionObserver, listenter;

	before( () => {
		listenter = Object.create( EmitterMixin );

		treeView = new TreeView();

		treeView.createRoot( document.getElementById( 'main' ) );

		mutationObserver = treeView.addObserver( MutationObserver );
		selectionObserver = treeView.addObserver( SelectionObserver );

		viewRoot = treeView.getRoot();

		viewRoot.appendChildren( parse( '<container:p>foo</container:p><container:p>bar</container:p>' ) );

		treeView.render();
	} );

	beforeEach( ( done ) => {
		treeView.selection.removeAllRanges();
		document.getSelection().removeAllRanges();

		treeView.getObserver( SelectionObserver ).enable();

		// Ensure selectionchange will not be fired.
		setTimeout( () => done(), 100 );
	} );

	afterEach( () => {
		listenter.stopListening();
	} );

	it( 'should fire selectionChange when it is the only change', ( done ) => {
		listenter.listenTo( treeView, 'selectionChange', ( evt, data ) => {
			expect( data ).to.have.property( 'domSelection' ).that.equals( document.getSelection() );

			expect( data ).to.have.property( 'oldSelection' ).that.is.instanceof( ViewSelection );
			expect( data.oldSelection.rangeCount ).to.equal( 0 );

			expect( data ).to.have.property( 'newSelection' ).that.is.instanceof( ViewSelection );
			expect( data.newSelection.rangeCount ).to.equal( 1 );

			const newViewRange = data.newSelection.getFirstRange();
			const viewFoo = treeView.getRoot().getChild( 0 ).getChild( 0 );

			expect( newViewRange.start.parent ).to.equal( viewFoo );
			expect( newViewRange.start.offset ).to.equal( 1 );
			expect( newViewRange.end.parent ).to.equal( viewFoo );
			expect( newViewRange.end.offset ).to.equal( 2 );

			done();
		} );

		changeDomSelection();
	} );

	it( 'should add only one listener to one document', ( done ) => {
		// Add second roots to ensure that listener is added once.
		treeView.createRoot( document.getElementById( 'additional' ), 'additional' );

		listenter.listenTo( treeView, 'selectionChange', () => {
			done();
		} );

		changeDomSelection();
	} );

	it( 'should not fire selectionChange on render', ( done ) => {
		listenter.listenTo( treeView, 'selectionChange', () => {
			throw 'selectionChange on render';
		} );

		setTimeout( () => done(), 70 );

		const viewBar = treeView.getRoot().getChild( 1 ).getChild( 0 );
		treeView.selection.addRange( ViewRange.createFromParentsAndOffsets( viewBar, 1, viewBar, 2 ) );
		treeView.render();
	} );

	it( 'should not fired if observer is disabled', ( done ) => {
		treeView.getObserver( SelectionObserver ).disable();

		listenter.listenTo( treeView, 'selectionChange', () => {
			throw 'selectionChange on render';
		} );

		setTimeout( () => done(), 70 );

		changeDomSelection();
	} );

	it( 'should call render after selection change which reset selection if it was not changed', ( done ) => {
		const viewBar = treeView.getRoot().getChild( 1 ).getChild( 0 );
		treeView.selection.addRange( ViewRange.createFromParentsAndOffsets( viewBar, 0, viewBar, 1 ) );

		listenter.listenTo( treeView, 'selectionChange', () => {
			setTimeout( () => {
				const domSelection = document.getSelection();

				expect( domSelection.rangeCount ).to.equal( 1 );

				const domRange = domSelection.getRangeAt( 0 );
				const domBar = document.getElementById( 'main' ).childNodes[ 1 ].childNodes[ 0 ];

				expect( domRange.startContainer ).to.equal( domBar );
				expect( domRange.startOffset ).to.equal( 0 );
				expect( domRange.endContainer ).to.equal( domBar );
				expect( domRange.endOffset ).to.equal( 1 );

				done();
			} );
		} );

		changeDomSelection();
	} );
} );

function changeDomSelection() {
	const domSelection = document.getSelection();
	domSelection.removeAllRanges();
	const domFoo = document.getElementById( 'main' ).childNodes[ 0 ].childNodes[ 0 ];
	const domRange = new Range();
	domRange.setStart( domFoo, 1 );
	domRange.setEnd( domFoo, 2 );
	domSelection.addRange( domRange );
}
