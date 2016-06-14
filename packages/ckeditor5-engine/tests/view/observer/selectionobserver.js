/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

'use strict';

import ViewRange from '/ckeditor5/engine/view/range.js';
import testUtils from '/tests/ckeditor5/_utils/utils.js';
import ViewSelection from '/ckeditor5/engine/view/selection.js';
import ViewDocument from '/ckeditor5/engine/view/document.js';
import SelectionObserver from '/ckeditor5/engine/view/observer/selectionobserver.js';
import MutationObserver from '/ckeditor5/engine/view/observer/mutationobserver.js';

import EmitterMixin from '/ckeditor5/utils/emittermixin.js';
import log from '/ckeditor5/utils/log.js';

import { parse } from '/tests/engine/_utils/view.js';

testUtils.createSinonSandbox();

describe( 'SelectionObserver', () => {
	let viewDocument, viewRoot, mutationObserver, selectionObserver, listenter;

	before( () => {
		listenter = Object.create( EmitterMixin );

		viewDocument = new ViewDocument();

		viewDocument.createRoot( document.getElementById( 'main' ) );

		mutationObserver = viewDocument.addObserver( MutationObserver );
		selectionObserver = viewDocument.addObserver( SelectionObserver );

		viewRoot = viewDocument.getRoot();

		viewRoot.appendChildren( parse(
			'<container:p>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</container:p>' +
			'<container:p>yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy</container:p>' ) );

		viewDocument.render();
	} );

	beforeEach( ( done ) => {
		viewDocument.selection.removeAllRanges();
		document.getSelection().removeAllRanges();

		viewDocument.focusedEditable = viewRoot;

		viewDocument.getObserver( SelectionObserver ).enable();

		// Ensure selectionchange will not be fired.
		setTimeout( () => done(), 100 );
	} );

	afterEach( () => {
		listenter.stopListening();
	} );

	it( 'should fire selectionChange when it is the only change', ( done ) => {
		listenter.listenTo( viewDocument, 'selectionChange', ( evt, data ) => {
			expect( data ).to.have.property( 'domSelection' ).that.equals( document.getSelection() );

			expect( data ).to.have.property( 'oldSelection' ).that.is.instanceof( ViewSelection );
			expect( data.oldSelection.rangeCount ).to.equal( 0 );

			expect( data ).to.have.property( 'newSelection' ).that.is.instanceof( ViewSelection );
			expect( data.newSelection.rangeCount ).to.equal( 1 );

			const newViewRange = data.newSelection.getFirstRange();
			const viewFoo = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

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
		viewDocument.createRoot( document.getElementById( 'additional' ), 'additional' );

		listenter.listenTo( viewDocument, 'selectionChange', () => {
			done();
		} );

		changeDomSelection();
	} );

	it( 'should not fire selectionChange on render', ( done ) => {
		listenter.listenTo( viewDocument, 'selectionChange', () => {
			throw 'selectionChange on render';
		} );

		setTimeout( () => done(), 70 );

		const viewBar = viewDocument.getRoot().getChild( 1 ).getChild( 0 );
		viewDocument.selection.addRange( ViewRange.createFromParentsAndOffsets( viewBar, 1, viewBar, 2 ) );
		viewDocument.render();
	} );

	it( 'should not fired if observer is disabled', ( done ) => {
		viewDocument.getObserver( SelectionObserver ).disable();

		listenter.listenTo( viewDocument, 'selectionChange', () => {
			throw 'selectionChange on render';
		} );

		setTimeout( () => done(), 70 );

		changeDomSelection();
	} );

	it( 'should not fired if there is no focusedEditable', ( done ) => {
		viewDocument.focusedEditable = null;

		listenter.listenTo( viewDocument, 'selectionChange', () => {
			throw 'selectionChange on render';
		} );

		setTimeout( () => done(), 70 );

		changeDomSelection();
	} );

	it( 'should warn and not enter infinite loop', ( done ) => {
		let counter = 30;

		const viewFoo = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
		viewDocument.selection.addRange( ViewRange.createFromParentsAndOffsets( viewFoo, 0, viewFoo, 0 ) );

		listenter.listenTo( viewDocument, 'selectionChange', () => {
			counter--;

			if ( counter > 0 ) {
				setTimeout( changeDomSelection );
			} else {
				throw( 'Infinite loop!' );
			}
		} );

		testUtils.sinon.stub( log, 'warn', ( msg ) => {
			expect( msg ).to.match( /^selectionchange-inifite-loop/ );
			done();

			// Prevent "done() called multiple times" error.
			done = () => {};
		} );

		changeDomSelection();
	} );

	it( 'should not be thread as an infinite loop if the position is different', ( done ) => {
		let counter = 30;

		const viewFoo = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
		viewDocument.selection.addRange( ViewRange.createFromParentsAndOffsets( viewFoo, 0, viewFoo, 0 ) );

		listenter.listenTo( viewDocument, 'selectionChange', () => {
			counter--;

			if ( counter > 0 ) {
				setTimeout( () => changeCollapsedDomSelection( counter ) );
			} else {
				done();
			}
		} );

		changeCollapsedDomSelection( counter );
	} );

	it( 'should not be thread as an infinite loop if it is less then 3 times', ( done ) => {
		let counter = 3;

		const viewFoo = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
		viewDocument.selection.addRange( ViewRange.createFromParentsAndOffsets( viewFoo, 0, viewFoo, 0 ) );

		listenter.listenTo( viewDocument, 'selectionChange', () => {
			counter--;

			if ( counter > 0 ) {
				setTimeout( () => changeDomSelection() );
			} else {
				done();
			}
		} );

		changeDomSelection();
	} );

	it( 'should call render after selection change which reset selection if it was not changed', ( done ) => {
		const viewBar = viewDocument.getRoot().getChild( 1 ).getChild( 0 );
		viewDocument.selection.addRange( ViewRange.createFromParentsAndOffsets( viewBar, 0, viewBar, 1 ) );

		listenter.listenTo( viewDocument, 'selectionChange', () => {
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

function changeCollapsedDomSelection( pos = 1 ) {
	const domSelection = document.getSelection();
	domSelection.removeAllRanges();
	const domFoo = document.getElementById( 'main' ).childNodes[ 0 ].childNodes[ 0 ];
	const domRange = new Range();
	domRange.setStart( domFoo, pos );
	domRange.setEnd( domFoo, pos );
	domSelection.addRange( domRange );
}

function changeDomSelection() {
	const domSelection = document.getSelection();
	domSelection.removeAllRanges();
	const domFoo = document.getElementById( 'main' ).childNodes[ 0 ].childNodes[ 0 ];
	const domRange = new Range();
	domRange.setStart( domFoo, 1 );
	domRange.setEnd( domFoo, 2 );
	domSelection.addRange( domRange );
}
