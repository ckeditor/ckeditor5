/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals setTimeout, document */

import ViewRange from '../../../src/view/range';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ViewSelection from '../../../src/view/selection';
import ViewDocument from '../../../src/view/document';
import SelectionObserver from '../../../src/view/observer/selectionobserver';
import MutationObserver from '../../../src/view/observer/mutationobserver';
import FocusObserver from '../../../src/view/observer/focusobserver';
import log from '@ckeditor/ckeditor5-utils/src/log';
import { parse } from '../../../src/dev-utils/view';

testUtils.createSinonSandbox();

describe( 'SelectionObserver', () => {
	let viewDocument, viewRoot, mutationObserver, selectionObserver, domRoot, domMain, domDocument;

	beforeEach( ( done ) => {
		domDocument = document;
		domRoot = domDocument.createElement( 'div' );
		domRoot.innerHTML = `<div contenteditable="true"></div><div contenteditable="true" id="additional"></div>`;
		domMain = domRoot.childNodes[ 0 ];
		domDocument.body.appendChild( domRoot );

		viewDocument = new ViewDocument();
		viewDocument.createRoot( domMain );

		mutationObserver = viewDocument.getObserver( MutationObserver );
		selectionObserver = viewDocument.getObserver( SelectionObserver );

		viewRoot = viewDocument.getRoot();

		viewRoot.appendChildren( parse(
			'<container:p>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</container:p>' +
			'<container:p>yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy</container:p>' ) );

		viewDocument.render();

		viewDocument.selection.removeAllRanges();
		domDocument.getSelection().removeAllRanges();

		viewDocument.isFocused = true;

		selectionObserver.enable();

		// Ensure selectionchange will not be fired.
		setTimeout( () => done(), 100 );
	} );

	afterEach( () => {
		domRoot.parentElement.removeChild( domRoot );

		viewDocument.destroy();
	} );

	it( 'should fire selectionChange when it is the only change', ( done ) => {
		viewDocument.on( 'selectionChange', ( evt, data ) => {
			expect( data ).to.have.property( 'domSelection' ).that.equals( domDocument.getSelection() );

			expect( data ).to.have.property( 'oldSelection' ).that.is.instanceof( ViewSelection );
			expect( data.oldSelection.rangeCount ).to.equal( 0 );

			expect( data ).to.have.property( 'newSelection' ).that.is.instanceof( ViewSelection );
			expect( data.newSelection.rangeCount ).to.equal( 1 );

			const newViewRange = data.newSelection.getFirstRange();
			const viewFoo = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

			expect( newViewRange.start.parent ).to.equal( viewFoo );
			expect( newViewRange.start.offset ).to.equal( 2 );
			expect( newViewRange.end.parent ).to.equal( viewFoo );
			expect( newViewRange.end.offset ).to.equal( 2 );

			done();
		} );

		changeDomSelection();
	} );

	it( 'should add only one listener to one document', ( done ) => {
		// Add second roots to ensure that listener is added once.
		viewDocument.createRoot( domDocument.getElementById( 'additional' ), 'additional' );

		viewDocument.on( 'selectionChange', () => {
			done();
		} );

		changeDomSelection();
	} );

	it( 'should not fire selectionChange on render', ( done ) => {
		viewDocument.on( 'selectionChange', () => {
			throw 'selectionChange on render';
		} );

		setTimeout( done, 70 );

		const viewBar = viewDocument.getRoot().getChild( 1 ).getChild( 0 );
		viewDocument.selection.addRange( ViewRange.createFromParentsAndOffsets( viewBar, 1, viewBar, 2 ) );
		viewDocument.render();
	} );

	it( 'should not fired if observer is disabled', ( done ) => {
		viewDocument.getObserver( SelectionObserver ).disable();

		viewDocument.on( 'selectionChange', () => {
			throw 'selectionChange on render';
		} );

		setTimeout( done, 70 );

		changeDomSelection();
	} );

	it( 'should not fired if there is no focus', ( done ) => {
		viewDocument.isFocused = false;

		// changeDomSelection() may focus the editable element (happens on Chrome)
		// so cancel this because it sets the isFocused flag.
		viewDocument.on( 'focus', ( evt ) => evt.stop(), { priority: 'highest' } );

		viewDocument.on( 'selectionChange', () => {
			// Validate the correctness of the test. May help tracking issue with this test.
			expect( viewDocument.isFocused ).to.be.false;

			throw 'selectionChange on render';
		} );

		setTimeout( done, 70 );

		changeDomSelection();
	} );

	it( 'should warn and not enter infinite loop', () => {
		// Selectionchange event is called twice per `changeDomSelection()` execution.
		let counter = 105;

		const viewFoo = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
		viewDocument.selection.addRange( ViewRange.createFromParentsAndOffsets( viewFoo, 0, viewFoo, 0 ) );

		return new Promise( ( resolve, reject ) => {
			testUtils.sinon.stub( log, 'warn', ( msg ) => {
				expect( msg ).to.match( /^selectionchange-infinite-loop/ );

				resolve();
			} );

			viewDocument.on( 'selectionChangeDone', () => {
				if ( !counter ) {
					reject( new Error( 'Infinite loop warning was not logged.' ) );
				}
			} );

			while ( counter > 0 ) {
				changeDomSelection();
				counter--;
			}
		} );
	} );

	it( 'should not be treated as an infinite loop if selection is changed only few times', ( done ) => {
		const viewFoo = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
		viewDocument.selection.addRange( ViewRange.createFromParentsAndOffsets( viewFoo, 0, viewFoo, 0 ) );
		const spy = testUtils.sinon.spy( log, 'warn' );

		viewDocument.on( 'selectionChangeDone', () => {
			expect( spy.called ).to.be.false;
			done();
		} );

		for ( let i = 0; i < 10; i++ ) {
			changeDomSelection();
		}
	} );

	it( 'should not be treated as an infinite loop if changes are not often', () => {
		const clock = testUtils.sinon.useFakeTimers( 'setInterval', 'clearInterval' );
		const stub = testUtils.sinon.stub( log, 'warn' );

		// We need to recreate SelectionObserver, so it will use mocked setInterval.
		selectionObserver.disable();
		selectionObserver.destroy();
		viewDocument._observers.delete( SelectionObserver );
		viewDocument.addObserver( SelectionObserver );

		return doChanges()
			.then( doChanges )
			.then( () => {
				sinon.assert.notCalled( stub );
				clock.restore();
			} );

		// Selectionchange event is called twice per `changeDomSelection()` execution. We call it 75 times to get
		// 150 events. Infinite loop counter is reset, so calling this method twice should not show any warning.
		function doChanges() {
			return new Promise( resolve => {
				viewDocument.once( 'selectionChangeDone', () => {
					clock.tick( 1100 );
					resolve();
				} );

				for ( let i = 0; i < 75; i++ ) {
					changeDomSelection();
				}
			} );
		}
	} );

	it( 'should fire `selectionChangeDone` event after selection stop changing', ( done ) => {
		const spy = sinon.spy();

		viewDocument.on( 'selectionChangeDone', spy );

		// Disable focus observer to not re-render view on each focus.
		viewDocument.getObserver( FocusObserver ).disable();

		// Change selection.
		changeDomSelection();

		// Wait 100ms.
		// Note that it's difficult/not possible to test lodash#debounce with sinon fake timers.
		// See: https://github.com/lodash/lodash/issues/304
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

				expect( data ).to.have.property( 'oldSelection' ).to.instanceof( ViewSelection );
				expect( data.oldSelection.rangeCount ).to.equal( 0 );

				expect( data ).to.have.property( 'newSelection' ).to.instanceof( ViewSelection );
				expect( data.newSelection.rangeCount ).to.equal( 1 );

				const newViewRange = data.newSelection.getFirstRange();
				const viewFoo = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

				expect( newViewRange.start.parent ).to.equal( viewFoo );
				expect( newViewRange.start.offset ).to.equal( 3 );
				expect( newViewRange.end.parent ).to.equal( viewFoo );
				expect( newViewRange.end.offset ).to.equal( 3 );

				done();
			}, 210 );
		}, 100 );
	} );

	it( 'should not fire `selectionChangeDone` event when observer will be destroyed', ( done ) => {
		const spy = sinon.spy();

		viewDocument.on( 'selectionChangeDone', spy );

		// Change selection.
		changeDomSelection();

		// Wait 100ms.
		// Note that it's difficult/not possible to test lodash#debounce with sinon fake timers.
		// See: https://github.com/lodash/lodash/issues/304
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

	function changeDomSelection() {
		const domSelection = domDocument.getSelection();
		const domFoo = domMain.childNodes[ 0 ].childNodes[ 0 ];
		const offset = domSelection.anchorOffset;

		domSelection.removeAllRanges();
		domSelection.collapse( domFoo, offset == 2 ? 3 : 2 );
	}
} );
