/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals setTimeout, document, console */

import ViewRange from '../../../src/view/range';
import DocumentSelection from '../../../src/view/documentselection';
import ViewSelection from '../../../src/view/selection';
import View from '../../../src/view/view';
import SelectionObserver from '../../../src/view/observer/selectionobserver';
import FocusObserver from '../../../src/view/observer/focusobserver';
import createViewRoot from '../_utils/createroot';
import { parse } from '../../../src/dev-utils/view';
import { StylesProcessor } from '../../../src/view/stylesmap';

describe( 'SelectionObserver', () => {
	let view, viewDocument, viewRoot, selectionObserver, domRoot, domMain, domDocument;
	let stylesProcessor;

	before( () => {
		stylesProcessor = new StylesProcessor();
	} );

	beforeEach( done => {
		domDocument = document;
		domRoot = domDocument.createElement( 'div' );
		domRoot.innerHTML = '<div contenteditable="true"></div><div contenteditable="true" id="additional"></div>';
		domMain = domRoot.childNodes[ 0 ];
		domDocument.body.appendChild( domRoot );

		view = new View( stylesProcessor );
		viewDocument = view.document;
		createViewRoot( viewDocument );
		view.attachDomRoot( domMain );

		selectionObserver = view.getObserver( SelectionObserver );

		viewRoot = viewDocument.getRoot();

		view.change( writer => {
			viewRoot._appendChild( parse(
				'<container:p>xxx<ui:span></ui:span></container:p>' +
				'<container:p>yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy</container:p>' ) );

			writer.setSelection( null );
			domDocument.getSelection().removeAllRanges();

			viewDocument.isFocused = true;
			domMain.focus();
		} );

		selectionObserver.enable();

		// Ensure selectionchange will not be fired.
		setTimeout( () => done(), 100 );
	} );

	afterEach( () => {
		sinon.restore();
		domRoot.parentElement.removeChild( domRoot );

		view.destroy();
	} );

	it( 'should fire selectionChange when it is the only change', done => {
		viewDocument.on( 'selectionChange', ( evt, data ) => {
			expect( data ).to.have.property( 'domSelection' ).that.equals( domDocument.getSelection() );

			expect( data ).to.have.property( 'oldSelection' ).that.is.instanceof( DocumentSelection );
			expect( data.oldSelection.rangeCount ).to.equal( 0 );

			expect( data ).to.have.property( 'newSelection' ).that.is.instanceof( ViewSelection );
			expect( data.newSelection.rangeCount ).to.equal( 1 );

			const newViewRange = data.newSelection.getFirstRange();
			const viewFoo = viewDocument.getRoot().getChild( 1 ).getChild( 0 );

			expect( newViewRange.start.parent ).to.equal( viewFoo );
			expect( newViewRange.start.offset ).to.equal( 2 );
			expect( newViewRange.end.parent ).to.equal( viewFoo );
			expect( newViewRange.end.offset ).to.equal( 2 );

			done();
		} );

		changeDomSelection();
	} );

	it( 'should add only one listener to one document', done => {
		// Add second roots to ensure that listener is added once.
		createViewRoot( viewDocument, 'div', 'additional' );
		view.attachDomRoot( domDocument.getElementById( 'additional' ), 'additional' );

		viewDocument.on( 'selectionChange', () => {
			done();
		} );

		changeDomSelection();
	} );

	it( 'should not fire selectionChange on render', done => {
		viewDocument.on( 'selectionChange', () => {
			throw 'selectionChange on render';
		} );

		setTimeout( done, 70 );

		const viewBar = viewDocument.getRoot().getChild( 1 ).getChild( 0 );

		view.change( writer => {
			writer.setSelection( ViewRange._createFromParentsAndOffsets( viewBar, 1, viewBar, 2 ) );
		} );
	} );

	it( 'should not fire if observer is disabled', done => {
		view.getObserver( SelectionObserver ).disable();

		viewDocument.on( 'selectionChange', () => {
			throw 'selectionChange on render';
		} );

		setTimeout( done, 70 );

		changeDomSelection();
	} );

	it( 'should not fire if the DOM selection was set outside editable', done => {
		const viewFoo = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

		view.change( writer => {
			writer.setSelection( viewFoo, 0 );
		} );

		const spy = sinon.spy();

		viewDocument.on( 'selectionChange', spy );

		setTimeout( () => {
			expect( spy.called ).to.be.false;

			done();
		}, 70 );

		const domSelection = domDocument.getSelection();
		const editable = domRoot.childNodes[ 1 ];
		editable.focus();

		domSelection.collapse( editable, 0 );
	} );

	it( 'should not enter infinite loop', () => {
		let counter = 70;

		const viewFoo = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
		view.change( writer => {
			writer.setSelection( viewFoo, 0 );
		} );

		const selectionChangeSpy = sinon.spy();

		// Catches the "Selection change observer detected an infinite rendering loop." warning in the CK_DEBUG mode.
		sinon.stub( console, 'warn' );

		viewDocument.on( 'selectionChange', selectionChangeSpy );

		return new Promise( resolve => {
			viewDocument.on( 'selectionChangeDone', () => {
				expect( selectionChangeSpy.callCount ).to.equal( 60 );

				resolve();
			} );

			while ( counter > 0 ) {
				changeDomSelection();
				counter--;
			}
		} );
	} );

	it( 'should not be treated as an infinite loop if selection is changed only few times', done => {
		const viewFoo = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
		viewDocument.selection._setTo( ViewRange._createFromParentsAndOffsets( viewFoo, 0, viewFoo, 0 ) );
		const consoleWarnSpy = sinon.spy( console, 'warn' );

		viewDocument.on( 'selectionChangeDone', () => {
			expect( consoleWarnSpy.called ).to.be.false;
			done();
		} );

		for ( let i = 0; i < 10; i++ ) {
			changeDomSelection();
		}
	} );

	it( 'should not be treated as an infinite loop if changes are not often', () => {
		const clock = sinon.useFakeTimers( {
			toFake: [ 'setInterval', 'clearInterval' ]
		} );
		const consoleWarnStub = sinon.stub( console, 'warn' );

		// We need to recreate SelectionObserver, so it will use mocked setInterval.
		selectionObserver.disable();
		selectionObserver.destroy();
		view._observers.delete( SelectionObserver );
		view.addObserver( SelectionObserver );

		return doChanges()
			.then( doChanges )
			.then( () => {
				sinon.assert.notCalled( consoleWarnStub );
				clock.restore();
			} );

		function doChanges() {
			return new Promise( resolve => {
				viewDocument.once( 'selectionChangeDone', () => {
					clock.tick( 1100 );
					resolve();
				} );

				for ( let i = 0; i < 50; i++ ) {
					changeDomSelection();
				}
			} );
		}
	} );

	it( 'should fire `selectionChangeDone` event after selection stop changing', done => {
		const spy = sinon.spy();

		viewDocument.on( 'selectionChangeDone', spy );

		// Disable focus observer to not re-render view on each focus.
		view.getObserver( FocusObserver ).disable();

		// Change selection.
		changeDomSelection();

		// Wait 100ms.
		setTimeout( () => {
			// Check if spy was called.
			expect( spy.notCalled ).to.true;

			// Change selection one more time.
			changeDomSelection();

			// Wait 210ms (debounced function should be called).
			setTimeout( () => {
				const data = spy.firstCall.args[ 1 ];

				expect( spy.calledOnce ).to.true;
				expect( data ).to.have.property( 'domSelection' ).to.equal( domDocument.getSelection() );

				expect( data ).to.have.property( 'oldSelection' ).to.instanceof( DocumentSelection );
				expect( data.oldSelection.rangeCount ).to.equal( 0 );

				expect( data ).to.have.property( 'newSelection' ).to.instanceof( ViewSelection );
				expect( data.newSelection.rangeCount ).to.equal( 1 );

				const newViewRange = data.newSelection.getFirstRange();
				const viewFoo = viewDocument.getRoot().getChild( 1 ).getChild( 0 );

				expect( newViewRange.start.parent ).to.equal( viewFoo );
				expect( newViewRange.start.offset ).to.equal( 3 );
				expect( newViewRange.end.parent ).to.equal( viewFoo );
				expect( newViewRange.end.offset ).to.equal( 3 );

				done();
			}, 210 );
		}, 100 );
	} );

	it( 'should not fire `selectionChangeDone` event when observer will be destroyed', done => {
		const spy = sinon.spy();

		viewDocument.on( 'selectionChangeDone', spy );

		// Change selection.
		changeDomSelection();

		// Wait 100ms.
		setTimeout( () => {
			// And destroy observer.
			selectionObserver.destroy();

			// Wait another 110ms.
			setTimeout( () => {
				// Check that event won't be called.
				expect( spy.notCalled ).to.true;

				done();
			}, 110 );
		}, 100 );
	} );

	it( 'should re-render view if selections are similar if DOM selection is in incorrect place', done => {
		const sel = domDocument.getSelection();
		const domParagraph = domMain.childNodes[ 0 ];
		const domText = domParagraph.childNodes[ 0 ];
		const domUI = domParagraph.childNodes[ 1 ];
		const viewRenderSpy = sinon.spy();

		// Add rendering on selectionChange event to check this feature.
		viewDocument.on( 'selectionChange', () => {
			// Manually set selection because no handlers are set for selectionChange event in this test.
			// Normally this is handled by view -> model -> view selection converters chain.
			const viewAnchor = view.domConverter.domPositionToView( sel.anchorNode, sel.anchorOffset );
			const viewFocus = view.domConverter.domPositionToView( sel.focusNode, sel.focusOffset );

			view.change( writer => {
				writer.setSelection( viewAnchor );
				writer.setSelectionFocus( viewFocus );
			} );
		} );

		viewDocument.once( 'selectionChange', () => {
			// 2. Selection change has been handled.

			selectionObserver.listenTo( domDocument, 'selectionchange', () => {
				// 4. Check if view was re-rendered.
				sinon.assert.calledOnce( viewRenderSpy );

				done();
			}, { priority: 'lowest' } );

			// 3. Now, collapse selection in similar position, but in UI element.
			// Current and new selection position are similar in view (but not equal!).
			// Also add a spy to `viewDocument#render` to see if view will be re-rendered.
			sel.collapse( domUI, 0 );
			view.on( 'render', viewRenderSpy );

			// Some browsers like Safari won't allow to put selection inside empty ui element.
			// In that situation selection should stay in correct place.
			if ( sel.anchorNode !== domUI ) {
				expect( sel.anchorNode ).to.equal( domText );
				expect( sel.anchorOffset ).to.equal( 3 );
				expect( sel.isCollapsed ).to.be.true;

				done();
			}
		}, { priority: 'lowest' } );

		// 1. Collapse in a text node, before ui element, and wait for async selectionchange to fire selection change handling.
		sel.collapse( domText, 3 );
	} );

	function changeDomSelection() {
		const domSelection = domDocument.getSelection();
		const domFoo = domMain.childNodes[ 1 ].childNodes[ 0 ];
		const offset = domSelection.anchorOffset;

		domSelection.collapse( domFoo, offset == 2 ? 3 : 2 );
	}
} );
