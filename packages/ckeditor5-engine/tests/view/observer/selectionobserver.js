/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ViewRange } from '../../../src/view/range.js';
import { ViewDocumentSelection } from '../../../src/view/documentselection.js';
import { ViewSelection } from '../../../src/view/selection.js';
import { EditingView } from '../../../src/view/view.js';
import { SelectionObserver } from '../../../src/view/observer/selectionobserver.js';
import { FocusObserver } from '../../../src/view/observer/focusobserver.js';
import { MutationObserver } from '../../../src/view/observer/mutationobserver.js';
import { createViewRoot } from '../_utils/createroot.js';
import { _parseView } from '../../../src/dev-utils/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';
import { env, priorities } from '@ckeditor/ckeditor5-utils';

describe( 'SelectionObserver', () => {
	let view, viewDocument, viewRoot, selectionObserver, domRoot, domMain, domDocument;

	beforeEach( () => {
		domDocument = document;
		domRoot = domDocument.createElement( 'div' );
		domRoot.innerHTML = '<div contenteditable="true"></div><div contenteditable="true" id="additional"></div>';
		domMain = domRoot.childNodes[ 0 ];
		domDocument.body.appendChild( domRoot );
		view = new EditingView( new StylesProcessor() );
		viewDocument = view.document;
		createViewRoot( viewDocument );
		view.attachDomRoot( domMain );

		selectionObserver = view.getObserver( SelectionObserver );

		viewRoot = viewDocument.getRoot();

		view.change( writer => {
			viewRoot._appendChild( _parseView(
				'<container:p>xxx<ui:span></ui:span></container:p>' +
				'<container:p>yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy</container:p>' ) );

			writer.setSelection( null );
			domDocument.getSelection().removeAllRanges();

			viewDocument.isFocused = true;

			domMain.focus();

			viewDocument._isFocusChanging = false;
		} );

		selectionObserver.enable();

		// Ensure selectionchange will not be fired.
		return new Promise( resolve => setTimeout( resolve, 100 ) );
	} );

	afterEach( () => {
		domRoot.parentElement.removeChild( domRoot );

		view.destroy();
	} );

	it( 'should fire selectionChange when it is the only change', () => {
		return new Promise( resolve => {
			viewDocument.on( 'selectionChange', ( evt, data ) => {
				expect( data ).toHaveProperty( 'domSelection', domDocument.getSelection() );

				expect( data ).toHaveProperty( 'oldSelection' );
				expect( data.oldSelection ).toBeInstanceOf( ViewDocumentSelection );
				expect( data.oldSelection.rangeCount ).toBe( 0 );

				expect( data ).toHaveProperty( 'newSelection' );
				expect( data.newSelection ).toBeInstanceOf( ViewSelection );
				expect( data.newSelection.rangeCount ).toBe( 1 );

				const newViewRange = data.newSelection.getFirstRange();
				const viewFoo = viewDocument.getRoot().getChild( 1 ).getChild( 0 );

				expect( newViewRange.start.parent ).toBe( viewFoo );
				expect( newViewRange.start.offset ).toBe( 2 );
				expect( newViewRange.end.parent ).toBe( viewFoo );
				expect( newViewRange.end.offset ).toBe( 2 );

				resolve();
			} );

			changeDomSelection();
		} );
	} );

	it( 'should call focusObserver#flush when selection is changed', () => {
		const flushSpy = vi.spyOn( selectionObserver.focusObserver, 'flush' );

		return new Promise( resolve => {
			viewDocument.on( 'selectionChange', () => {
				expect( flushSpy ).toHaveBeenCalledOnce();

				resolve();
			} );

			changeDomSelection();
		} );
	} );

	// See https://github.com/ckeditor/ckeditor5/issues/14569.
	it( 'should call focusObserver#flush when selection is in the editable but not changed', () => {
		// Set DOM selection.
		changeDomSelection();

		// Update view selection to match DOM selection.
		const domSelection = domDocument.getSelection();
		const viewPosition = view.domConverter.domPositionToView( domSelection.focusNode, domSelection.focusOffset );

		view.change( writer => writer.setSelection( viewPosition ) );

		const flushSpy = vi.spyOn( selectionObserver.focusObserver, 'flush' );

		// Fire selection change without actually moving selection.
		domDocument.dispatchEvent( new Event( 'selectionchange' ) );

		expect( flushSpy ).toHaveBeenCalledOnce();
	} );

	it( 'should not fire selectionChange while editable is not focused', () => {
		viewDocument.on( 'selectionChange', () => {
			throw new Error( 'selectionChange fired while editable is not focused' );
		} );

		viewDocument.isFocused = false;
		changeDomSelection();

		return new Promise( resolve => setTimeout( resolve, 100 ) );
	} );

	it( 'should fire selectionChange after editor is focused and there were pending selection changes', () => {
		return new Promise( resolve => {
			viewDocument.on( 'selectionChange', () => resolve() );

			viewDocument.isFocused = false;
			changeDomSelection();

			setTimeout( () => {
				viewDocument.isFocused = true;
			}, 100 );
		} );
	} );

	// See https://github.com/ckeditor/ckeditor5/issues/18514.
	it( 'should fire selectionChange while editable is not focused but the editor is in read-only mode', () => {
		const spy = vi.fn();

		viewDocument.on( 'selectionChange', spy );

		viewDocument.isReadOnly = true;
		viewDocument.isFocused = false;
		changeDomSelection();

		return new Promise( resolve => setTimeout( () => {
			expect( spy ).toHaveBeenCalledOnce();
			resolve();
		}, 100 ) );
	} );

	it( 'should not fire selectionChange while user is composing', () => {
		viewDocument.on( 'selectionChange', () => {
			throw new Error( 'selectionChange fired while composing' );
		} );

		viewDocument.isComposing = true;
		changeDomSelection();

		return new Promise( resolve => setTimeout( resolve, 100 ) );
	} );

	it( 'should fire selectionChange while user is composing on Android', () => {
		vi.spyOn( env, 'isAndroid', 'get' ).mockReturnValue( true );

		viewDocument.isComposing = true;

		return new Promise( resolve => {
			viewDocument.on( 'selectionChange', ( evt, data ) => {
				expect( data ).toHaveProperty( 'domSelection', domDocument.getSelection() );

				expect( data ).toHaveProperty( 'oldSelection' );
				expect( data.oldSelection ).toBeInstanceOf( ViewDocumentSelection );
				expect( data.oldSelection.rangeCount ).toBe( 0 );

				expect( data ).toHaveProperty( 'newSelection' );
				expect( data.newSelection ).toBeInstanceOf( ViewSelection );
				expect( data.newSelection.rangeCount ).toBe( 1 );

				const newViewRange = data.newSelection.getFirstRange();
				const viewFoo = viewDocument.getRoot().getChild( 1 ).getChild( 0 );

				expect( newViewRange.start.parent ).toBe( viewFoo );
				expect( newViewRange.start.offset ).toBe( 2 );
				expect( newViewRange.end.parent ).toBe( viewFoo );
				expect( newViewRange.end.offset ).toBe( 2 );

				resolve();
			} );

			changeDomSelection();
		} );
	} );

	it( 'should detect "restricted objects" in Firefox DOM ranges and prevent an error being thrown', () => {
		vi.spyOn( env, 'isGecko', 'get' ).mockReturnValue( true );

		changeDomSelection();
		domDocument.dispatchEvent( new Event( 'selectionchange' ) );

		expect( view.hasDomSelection ).toBe( true );

		const domFoo = domDocument.getSelection().anchorNode;

		vi.spyOn( domFoo, Symbol.toStringTag, 'get' ).mockImplementation( () => {
			throw new Error( 'Permission denied to access property Symbol.toStringTag' );
		} );

		domDocument.dispatchEvent( new Event( 'selectionchange' ) );

		expect( view.hasDomSelection ).toBe( false );
	} );

	it( 'should add only one #selectionChange listener to one document', () => {
		// Add second roots to ensure that listener is added once.
		createViewRoot( viewDocument, 'div', 'additional' );
		view.attachDomRoot( domDocument.getElementById( 'additional' ), 'additional' );

		return new Promise( resolve => {
			viewDocument.on( 'selectionChange', () => {
				resolve();
			} );

			changeDomSelection();
		} );
	} );

	it( 'should fire selectionChange synchronously on composition start event (at lowest priority)', () => {
		let eventCount = 0;
		let priorityCheck = 0;

		viewDocument.on( 'selectionChange', ( evt, data ) => {
			expect( data ).toHaveProperty( 'domSelection', domDocument.getSelection() );

			expect( data ).toHaveProperty( 'oldSelection' );
			expect( data.oldSelection ).toBeInstanceOf( ViewDocumentSelection );
			expect( data.oldSelection.rangeCount ).toBe( 0 );

			expect( data ).toHaveProperty( 'newSelection' );
			expect( data.newSelection ).toBeInstanceOf( ViewSelection );
			expect( data.newSelection.rangeCount ).toBe( 1 );

			const newViewRange = data.newSelection.getFirstRange();
			const viewFoo = viewDocument.getRoot().getChild( 1 ).getChild( 0 );

			expect( newViewRange.start.parent ).toBe( viewFoo );
			expect( newViewRange.start.offset ).toBe( 2 );
			expect( newViewRange.end.parent ).toBe( viewFoo );
			expect( newViewRange.end.offset ).toBe( 2 );

			expect( priorityCheck ).toBe( 1 );

			eventCount++;
		} );

		viewDocument.on( 'compositionstart', () => {
			priorityCheck++;
		}, { priority: priorities.lowest + 1 } );

		viewDocument.on( 'compositionstart', () => {
			priorityCheck++;
		}, { priority: priorities.lowest - 1 } );

		changeDomSelection();

		viewDocument.fire( 'compositionstart' );

		expect( eventCount ).toBe( 1 );
		expect( priorityCheck ).toBe( 2 );
	} );

	it( 'should not fire selectionChange for ignored target', () => {
		viewDocument.on( 'selectionChange', () => {
			throw new Error( 'selectionChange fired in ignored elements' );
		} );

		view.getObserver( MutationObserver ).disable();
		domMain.childNodes[ 1 ].setAttribute( 'data-cke-ignore-events', 'true' );

		changeDomSelection();

		return new Promise( resolve => setTimeout( resolve, 100 ) );
	} );

	it( 'should not fire selectionChange on render', () => {
		viewDocument.on( 'selectionChange', () => {
			throw new Error( 'selectionChange on render' );
		} );

		const viewBar = viewDocument.getRoot().getChild( 1 ).getChild( 0 );

		view.change( writer => {
			writer.setSelection( ViewRange._createFromParentsAndOffsets( viewBar, 1, viewBar, 2 ) );
		} );

		return new Promise( resolve => setTimeout( resolve, 70 ) );
	} );

	it( 'should not fire if observer is disabled', () => {
		view.getObserver( SelectionObserver ).disable();

		viewDocument.on( 'selectionChange', () => {
			throw new Error( 'selectionChange on render' );
		} );

		changeDomSelection();

		return new Promise( resolve => setTimeout( resolve, 70 ) );
	} );

	it( 'should not fire if the DOM selection was set outside editable', () => {
		const viewFoo = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

		view.change( writer => {
			writer.setSelection( viewFoo, 0 );
		} );

		const spy = vi.fn();

		viewDocument.on( 'selectionChange', spy );

		const domSelection = domDocument.getSelection();
		const editable = domRoot.childNodes[ 1 ];
		editable.focus();

		domSelection.collapse( editable, 0 );

		return new Promise( resolve => setTimeout( () => {
			expect( spy ).not.toHaveBeenCalled();
			resolve();
		}, 70 ) );
	} );

	it( 'should not enter infinite loop', () => {
		const viewFoo = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
		view.change( writer => {
			writer.setSelection( viewFoo, 0 );
		} );

		let wasInfiniteLoopDetected = false;
		vi.spyOn( selectionObserver, '_reportInfiniteLoop' ).mockImplementation( () => {
			wasInfiniteLoopDetected = true;
		} );
		const selectionChangeSpy = vi.fn();

		selectionObserver._clearInfiniteLoop();
		viewDocument.on( 'selectionChange', selectionChangeSpy );

		let counter = 70;

		const simulateSelectionChanges = () => {
			if ( !counter ) {
				return;
			}

			changeDomSelection();
			counter--;

			setTimeout( simulateSelectionChanges, 10 );
		};

		return new Promise( resolve => {
			viewDocument.on( 'selectionChangeDone', () => {
				expect( wasInfiniteLoopDetected ).toBe( true );
				expect( selectionChangeSpy ).toHaveBeenCalledTimes( 60 );

				counter = 0;
				resolve();
			} );

			simulateSelectionChanges();
		} );
	} );

	it.skip( 'SelectionObserver#_reportInfiniteLoop() should throw an error', () => {
		expect( () => {
			selectionObserver._reportInfiniteLoop();
		} ).toThrow( Error );
	} );

	it( 'should not be treated as an infinite loop if selection is changed only few times', () => {
		const viewFoo = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
		viewDocument.selection._setTo( ViewRange._createFromParentsAndOffsets( viewFoo, 0, viewFoo, 0 ) );
		const consoleWarnSpy = vi.spyOn( console, 'warn' );

		return new Promise( resolve => {
			viewDocument.on( 'selectionChangeDone', () => {
				expect( consoleWarnSpy ).not.toHaveBeenCalled();
				resolve();
			} );

			for ( let i = 0; i < 10; i++ ) {
				changeDomSelection();
			}
		} );
	} );

	it( 'should not be treated as an infinite loop if changes are not often', () => {
		vi.useFakeTimers( {
			toFake: [ 'setInterval', 'clearInterval' ]
		} );
		const consoleWarnStub = vi.spyOn( console, 'warn' );

		// We need to recreate SelectionObserver, so it will use mocked setInterval.
		selectionObserver.disable();
		selectionObserver.destroy();
		view._observers.delete( SelectionObserver );
		view.addObserver( SelectionObserver );

		return doChanges()
			.then( doChanges )
			.then( () => {
				expect( consoleWarnStub ).not.toHaveBeenCalled();
				vi.useRealTimers();
			} );

		function doChanges() {
			return new Promise( resolve => {
				viewDocument.once( 'selectionChangeDone', () => {
					vi.advanceTimersByTime( 1100 );
					resolve();
				} );

				for ( let i = 0; i < 50; i++ ) {
					changeDomSelection();
				}
			} );
		}
	} );

	it( 'should fire `selectionChangeDone` event after selection stop changing', () => {
		const spy = vi.fn();

		viewDocument.on( 'selectionChangeDone', spy );

		// Disable focus observer to not re-render view on each focus.
		view.getObserver( FocusObserver ).disable();

		// Change selection.
		changeDomSelection();

		return new Promise( resolve => {
			// Wait 100ms.
			setTimeout( () => {
				// Check if spy was called.
				expect( spy.mock.calls.length === 0 ).toBe( true );

				// Change selection one more time.
				changeDomSelection();

				// Wait 210ms (debounced function should be called).
				setTimeout( () => {
					const data = spy.mock.calls[ 0 ][ 1 ];

					expect( spy ).toHaveBeenCalledOnce();
					expect( data ).toHaveProperty( 'domSelection' );
					expect( data.domSelection ).toBe( domDocument.getSelection() );

					expect( data ).toHaveProperty( 'oldSelection' );
					expect( data.oldSelection ).toBeInstanceOf( ViewDocumentSelection );
					expect( data.oldSelection.rangeCount ).toBe( 0 );

					expect( data ).toHaveProperty( 'newSelection' );
					expect( data.newSelection ).toBeInstanceOf( ViewSelection );
					expect( data.newSelection.rangeCount ).toBe( 1 );

					const newViewRange = data.newSelection.getFirstRange();
					const viewFoo = viewDocument.getRoot().getChild( 1 ).getChild( 0 );

					expect( newViewRange.start.parent ).toBe( viewFoo );
					expect( newViewRange.start.offset ).toBe( 3 );
					expect( newViewRange.end.parent ).toBe( viewFoo );
					expect( newViewRange.end.offset ).toBe( 3 );

					resolve();
				}, 210 );
			}, 100 );
		} );
	} );

	it( 'should not fire `selectionChangeDone` event when observer will be destroyed', () => {
		const spy = vi.fn();

		viewDocument.on( 'selectionChangeDone', spy );

		// Change selection.
		changeDomSelection();

		return new Promise( resolve => {
			// Wait 100ms.
			setTimeout( () => {
				// And destroy observer.
				selectionObserver.destroy();

				// Wait another 110ms.
				setTimeout( () => {
					// Check that event won't be called.
					expect( spy.mock.calls.length === 0 ).toBe( true );

					resolve();
				}, 110 );
			}, 100 );
		} );
	} );

	it( 're-render view if selections are similar if DOM selection is in incorrect place', () => {
		const sel = domDocument.getSelection();
		const domParagraph = domMain.childNodes[ 0 ];
		const domText = domParagraph.childNodes[ 0 ];
		const domUI = domParagraph.childNodes[ 1 ];
		const viewRenderSpy = vi.fn();

		return new Promise( resolve => {
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
					expect( viewRenderSpy ).toHaveBeenCalledOnce();

					resolve();
				}, { priority: 'lowest' } );

				// 3. Now, collapse selection in similar position, but in UI element.
				// Current and new selection position are similar in view (but not equal!).
				// Also add a spy to `viewDocument#render` to see if view will be re-rendered.
				sel.collapse( domUI, 0 );
				view.on( 'render', viewRenderSpy );

				// Some browsers like Safari won't allow to put selection inside empty ui element.
				// In that situation selection should stay in correct place.
				if ( sel.anchorNode !== domUI ) {
					expect( sel.anchorNode ).toBe( domText );
					expect( sel.anchorOffset ).toBe( 3 );
					expect( sel.isCollapsed ).toBe( true );

					resolve();
				}
			}, { priority: 'lowest' } );

			// 1. Collapse in a text node, before ui element, and wait for async selectionchange to fire selection change handling.
			sel.collapse( domText, 3 );
		} );
	} );

	// See: https://github.com/ckeditor/ckeditor5/issues/18744
	it( 'should not crash even if domConverter returns view range with items detached from root', () => {
		const { domConverter } = selectionObserver;

		const forceRenderSpy = vi.spyOn( view, 'forceRender' ).mockImplementation( () => {} );
		const originalDomSelectionToView = domConverter.domSelectionToView.bind( domConverter );

		vi.spyOn( domConverter, 'domSelectionToView' ).mockImplementation( ( ...args ) => {
			const selection = originalDomSelectionToView( ...args );
			const originalGetRanges = selection.getRanges.bind( selection );

			vi.spyOn( selection, 'getRanges' ).mockImplementation( () => {
				const ranges = [ ...originalGetRanges() ];

				// Let's assume that domConverter returned ranges that are detached from the root.
				// For example - when it's not fully synchronized with the DOM during some async events.
				// It should not happen if mapper is used correctly, not during applying changes to the DOM.
				ranges.forEach( range => {
					vi.spyOn( range.start, 'root', 'get' ).mockReturnValue( null );
					vi.spyOn( range.end, 'root', 'get' ).mockReturnValue( null );
				} );

				return ranges;
			} );

			return selection;
		} );

		changeDomSelection();
		domDocument.dispatchEvent( new Event( 'selectionchange' ) );

		return new Promise( resolve => setTimeout( () => {
			expect( forceRenderSpy ).toHaveBeenCalled();
			resolve();
		}, 70 ) );
	} );

	describe( 'stopListening()', () => {
		it( 'should not fire selectionChange after stopped observing a DOM element', () => {
			const spy = vi.fn();

			viewDocument.on( 'selectionChange', spy );

			selectionObserver.stopListening( domMain );

			changeDomSelection();

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Management of view Document#isSelecting', () => {
		it( 'should not set #isSelecting to true upon the "selectstart" event outside the DOM root', () => {
			const selectStartChangedSpy = vi.fn();

			expect( viewDocument.isSelecting ).toBe( false );

			// Make sure isSelecting was already updated by the listener with the highest priority.
			// Note: The listener in SelectionObserver has the same priority but was attached first.
			selectionObserver.listenTo( domMain, 'selectstart', selectStartChangedSpy, { priority: 'highest' } );

			// The event was fired somewhere else in DOM.
			domDocument.dispatchEvent( new Event( 'selectstart' ) );

			expect( viewDocument.isSelecting ).toBe( false );
			expect( selectStartChangedSpy ).not.toHaveBeenCalled();
		} );

		it( 'should set #isSelecting to true upon the "selectstart" event', () => {
			expect( viewDocument.isSelecting ).toBe( false );

			// Make sure isSelecting was already updated by the listener with the highest priority.
			// Note: The listener in SelectionObserver has the same priority but was attached first.
			selectionObserver.listenTo( domMain, 'selectstart', () => {
				expect( viewDocument.isSelecting ).toBe( true );
			}, { priority: 'highest' } );

			domMain.dispatchEvent( new Event( 'selectstart' ) );

			expect( viewDocument.isSelecting ).toBe( true );
		} );

		it( 'should set #isSelecting to false upon the "mouseup" event', () => {
			viewDocument.isSelecting = true;

			// Make sure isSelecting was already updated by the listener with the highest priority.
			// Note: The listener in SelectionObserver has the same priority but was attached first.
			selectionObserver.listenTo( domDocument, 'mouseup', () => {
				expect( viewDocument.isSelecting ).toBe( false );
			}, { priority: 'highest', useCapture: true } );

			domDocument.dispatchEvent( new Event( 'mouseup' ) );

			expect( viewDocument.isSelecting ).toBe( false );
		} );

		it( 'should fire selectionChange event upon the "mouseup" event (if DOM selection differs from view selection', () => {
			return new Promise( resolve => {
				// Disable DOM selectionchange event to make sure that mouseup triggered view event.
				selectionObserver.listenTo( domDocument, 'selectionchange', evt => {
					evt.stop();
				}, { priority: 'highest' } );

				viewDocument.on( 'selectionChange', ( evt, data ) => {
					expect( data ).toHaveProperty( 'domSelection', domDocument.getSelection() );

					expect( data ).toHaveProperty( 'oldSelection' );
					expect( data.oldSelection ).toBeInstanceOf( ViewDocumentSelection );
					expect( data.oldSelection.rangeCount ).toBe( 0 );

					expect( data ).toHaveProperty( 'newSelection' );
					expect( data.newSelection ).toBeInstanceOf( ViewSelection );
					expect( data.newSelection.rangeCount ).toBe( 1 );

					const newViewRange = data.newSelection.getFirstRange();
					const viewFoo = viewDocument.getRoot().getChild( 1 ).getChild( 0 );

					expect( newViewRange.start.parent ).toBe( viewFoo );
					expect( newViewRange.start.offset ).toBe( 2 );
					expect( newViewRange.end.parent ).toBe( viewFoo );
					expect( newViewRange.end.offset ).toBe( 2 );

					// Make sure that selectionChange event was triggered before the isSelecting flag reset
					// so that model and view selection could get updated before isSelecting is reset
					// and renderer updates the DOM selection.
					expect( viewDocument.isSelecting ).toBe( true );

					resolve();
				} );

				viewDocument.isSelecting = true;

				changeDomSelection();
				domDocument.dispatchEvent( new Event( 'mouseup' ) );

				expect( viewDocument.isSelecting ).toBe( false );
			} );
		} );

		it( 'should not fire selectionChange event upon the "mouseup" event if it was not selecting', () => {
			// Disable DOM selectionchange event to make sure that mouseup triggered view event.
			selectionObserver.listenTo( domDocument, 'selectionchange', evt => {
				evt.stop();
			}, { priority: 'highest' } );

			viewDocument.on( 'selectionChange', () => {
				throw new Error( 'selectionChange fired' );
			} );

			viewDocument.isSelecting = false;

			changeDomSelection();
			domDocument.dispatchEvent( new Event( 'mouseup' ) );

			return new Promise( resolve => setTimeout( resolve, 100 ) );
		} );

		it( 'should set #isSelecting to false upon the "mouseup" event only once (editor with multiple roots)', () => {
			const isSelectingSetSpy = vi.fn();

			createViewRoot( viewDocument, 'div', 'additional' );
			view.attachDomRoot( domDocument.getElementById( 'additional' ), 'additional' );

			viewDocument.isSelecting = true;

			viewDocument.on( 'set:isSelecting', isSelectingSetSpy );

			domDocument.dispatchEvent( new Event( 'mouseup' ) );
			expect( viewDocument.isSelecting ).toBe( false );
			expect( isSelectingSetSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should not set #isSelecting to false upon the "keydown" event outside the DOM root', () => {
			const keydownSpy = vi.fn();

			viewDocument.isSelecting = true;

			// Make sure isSelecting was already updated by the listener with the highest priority.
			// Note: The listener in SelectionObserver has the same priority but was attached first.
			selectionObserver.listenTo( domMain, 'keydown', () => keydownSpy, { priority: 'highest' } );

			domMain.dispatchEvent( new Event( 'keydown' ) );

			expect( viewDocument.isSelecting ).toBe( false );
			expect( keydownSpy ).not.toHaveBeenCalled();
		} );

		it( 'should set #isSelecting to false upon the "keydown" event', () => {
			viewDocument.isSelecting = true;

			// Make sure isSelecting was already updated by the listener with the highest priority.
			// Note: The listener in SelectionObserver has the same priority but was attached first.
			selectionObserver.listenTo( domMain, 'keydown', () => {
				expect( viewDocument.isSelecting ).toBe( false );
			}, { priority: 'highest', useCapture: true } );

			domMain.dispatchEvent( new Event( 'keydown' ) );

			expect( viewDocument.isSelecting ).toBe( false );
		} );

		it( 'should not set #isSelecting to false upon the "keyup" event outside the DOM root', () => {
			const keyupSpy = vi.fn();

			viewDocument.isSelecting = true;

			// Make sure isSelecting was already updated by the listener with the highest priority.
			// Note: The listener in SelectionObserver has the same priority but was attached first.
			selectionObserver.listenTo( domMain, 'keyup', () => keyupSpy, { priority: 'highest' } );

			domMain.dispatchEvent( new Event( 'keyup' ) );

			expect( viewDocument.isSelecting ).toBe( false );
			expect( keyupSpy ).not.toHaveBeenCalled();
		} );

		it( 'should set #isSelecting to false upon the "keyup" event', () => {
			viewDocument.isSelecting = true;

			// Make sure isSelecting was already updated by the listener with the highest priority.
			// Note: The listener in SelectionObserver has the same priority but was attached first.
			selectionObserver.listenTo( domMain, 'keyup', () => {
				expect( viewDocument.isSelecting ).toBe( false );
			}, { priority: 'highest', useCapture: true } );

			domMain.dispatchEvent( new Event( 'keyup' ) );

			expect( viewDocument.isSelecting ).toBe( false );
		} );

		describe( 'isSelecting restoring after a timeout', () => {
			beforeEach( () => {
				vi.useFakeTimers();

				// We need to recreate SelectionObserver, so it will use mocked setTimeout.
				selectionObserver.disable();
				selectionObserver.destroy();
				view._observers.delete( SelectionObserver );
				view.addObserver( SelectionObserver );
			} );

			afterEach( () => {
				vi.useRealTimers();
			} );

			it( 'should set #isSelecting to false after 5000ms since the selectstart event', () => {
				expect( viewDocument.isSelecting ).toBe( false );

				domMain.dispatchEvent( new Event( 'selectstart' ) );

				expect( viewDocument.isSelecting ).toBe( true );

				vi.advanceTimersByTime( 4500 );
				expect( viewDocument.isSelecting ).toBe( true );

				vi.advanceTimersByTime( 1500 );
				expect( viewDocument.isSelecting ).toBe( false );
			} );

			it( 'should postpone setting #isSelecting to false after 5000ms if "selectionchange" fired in the meantime', () => {
				expect( viewDocument.isSelecting ).toBe( false );

				domMain.dispatchEvent( new Event( 'selectstart' ) );

				expect( viewDocument.isSelecting ).toBe( true );

				// Advance to 2500ms and fire selectionchange to postpone the timeout
				vi.advanceTimersByTime( 2500 );
				expect( viewDocument.isSelecting ).toBe( true );
				// This will postpone the timeout by another 5000ms.
				domDocument.dispatchEvent( new Event( 'selectionchange' ) );

				// Advance to what would have been 5500ms (3000ms more) - but with the postpone it should still be true
				vi.advanceTimersByTime( 3000 );
				expect( viewDocument.isSelecting ).toBe( true );

				// Advance by 5000ms more to complete the postponed timeout (total 10500ms from start)
				vi.advanceTimersByTime( 5000 );
				expect( viewDocument.isSelecting ).toBe( false );
			} );

			it( 'should cancel the 5000s timeout if the observer is destroyed', () => {
				const spy = vi.spyOn( selectionObserver._documentIsSelectingInactivityTimeoutDebounced, 'cancel' );

				selectionObserver.destroy();

				expect( spy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	function changeDomSelection() {
		const domSelection = domDocument.getSelection();
		const domFoo = domMain.childNodes[ 1 ].childNodes[ 0 ];
		const offset = domSelection.anchorOffset;

		domSelection.collapse( domFoo, offset == 2 ? 3 : 2 );
	}
} );
