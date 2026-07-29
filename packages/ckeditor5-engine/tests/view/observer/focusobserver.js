/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { FocusObserver } from '../../../src/view/observer/focusobserver.js';
import { EditingView } from '../../../src/view/view.js';
import { createViewRoot } from '../_utils/createroot.js';
import { _setViewData } from '../../../src/dev-utils/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'FocusObserver', () => {
	let view, viewDocument, observer;

	beforeEach( () => {
		view = new EditingView( new StylesProcessor() );
		viewDocument = view.document;
		observer = view.getObserver( FocusObserver );
	} );

	afterEach( () => {
		vi.useRealTimers();
		view.destroy();
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).toEqual( [ 'focus', 'blur' ] );
	} );

	it( 'should use capturing phase', () => {
		expect( observer.useCapture ).toBe( true );
	} );

	describe( 'onDomEvent', () => {
		it( 'should fire focus with the right event data', () => {
			const spy = vi.fn();

			viewDocument.on( 'focus', spy );

			observer.onDomEvent( { type: 'focus', target: document.body } );

			expect( spy ).toHaveBeenCalledOnce();

			const data = spy.mock.calls[ 0 ][ 1 ];
			expect( data.domTarget ).toBe( document.body );
		} );

		it( 'should fire blur with the right event data', () => {
			const spy = vi.fn();

			viewDocument.on( 'blur', spy );

			observer.onDomEvent( { type: 'blur', target: document.body } );

			expect( spy ).toHaveBeenCalledOnce();

			const data = spy.mock.calls[ 0 ][ 1 ];
			expect( data.domTarget ).toBe( document.body );
		} );

		it( 'should render document after focus (after the next view change block)', () => {
			vi.useFakeTimers();
			const renderSpy = vi.fn();
			view.on( 'render', renderSpy );
			viewDocument.isFocused = false;

			observer.onDomEvent( { type: 'focus', target: document.body } );
			vi.advanceTimersByTime( 50 );

			view.change( () => {} );

			expect( renderSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should render document after blurring (after the next view change block)', () => {
			const renderSpy = vi.fn();
			view.on( 'render', renderSpy );
			viewDocument.isFocused = true;

			observer.onDomEvent( { type: 'blur', target: document.body } );
			view.change( () => {} );

			expect( renderSpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'handle isFocused property of the document', () => {
		let domMain, domHeader, viewMain;

		beforeEach( () => {
			vi.useFakeTimers();

			domMain = document.createElement( 'div' );
			domHeader = document.createElement( 'h1' );

			viewMain = createViewRoot( viewDocument );
			view.attachDomRoot( domMain );
		} );

		afterEach( () => {
			vi.useRealTimers();
		} );

		it( 'should set isFocused to true on focus after 50ms', () => {
			observer.onDomEvent( { type: 'focus', target: domMain } );

			vi.advanceTimersByTime( 50 );

			expect( viewDocument.isFocused ).toBe( true );
		} );

		it( 'should set isFocused to false on blur', () => {
			observer.onDomEvent( { type: 'focus', target: domMain } );

			vi.advanceTimersByTime( 50 );

			expect( viewDocument.isFocused ).toBe( true );

			observer.onDomEvent( { type: 'blur', target: domMain } );

			expect( viewDocument.isFocused ).toBe( false );
		} );

		it( 'should set isFocused to false on blur when selection in same editable', () => {
			view.change( writer => {
				writer.setSelection( viewMain, 0 );
			} );

			observer.onDomEvent( { type: 'focus', target: domMain } );

			vi.advanceTimersByTime( 50 );

			expect( viewDocument.isFocused ).toBe( true );

			observer.onDomEvent( { type: 'blur', target: domMain } );

			expect( viewDocument.isFocused ).toBe( false );
		} );

		it( 'should not set isFocused to false on blur when it is fired on other editable', () => {
			view.change( writer => {
				writer.setSelection( viewMain, 0 );
			} );

			observer.onDomEvent( { type: 'focus', target: domMain } );

			vi.advanceTimersByTime( 50 );

			expect( viewDocument.isFocused ).toBe( true );

			observer.onDomEvent( { type: 'blur', target: domHeader } );

			expect( viewDocument.isFocused ).toBe( true );
		} );

		it( 'should trigger fallback rendering after 50ms', () => {
			const renderSpy = vi.fn();
			view.on( 'render', renderSpy );

			observer.onDomEvent( { type: 'focus', target: domMain } );
			expect( renderSpy ).not.toHaveBeenCalled();
			vi.advanceTimersByTime( 50 );
			expect( renderSpy ).toHaveBeenCalled();
		} );

		it( 'should not call render if destroyed', () => {
			const renderSpy = vi.fn();
			view.on( 'render', renderSpy );

			observer.onDomEvent( { type: 'focus', target: domMain } );
			expect( renderSpy ).not.toHaveBeenCalled();
			observer.destroy();
			vi.advanceTimersByTime( 50 );
			expect( renderSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not update isFocused when focusing has been cancelled', () => {
			const renderSpy = vi.fn();
			view.on( 'render', renderSpy );

			observer.onDomEvent( { type: 'focus', target: domMain } );

			observer._isFocusChanging = false;

			vi.advanceTimersByTime( 50 );

			expect( viewDocument.isFocused ).toBe( false );
		} );

		it( 'should set isFocused to true on beforeinput after 50ms', () => {
			expect( viewDocument.isFocused ).toBe( false );

			observer.onDomEvent( { type: 'beforeinput', target: domMain } );
			expect( viewDocument.isFocused ).toBe( false );

			vi.advanceTimersByTime( 50 );
			expect( viewDocument.isFocused ).toBe( true );
		} );

		it( 'should set isFocused to true on beforeinput after flush', () => {
			expect( viewDocument.isFocused ).toBe( false );

			observer.onDomEvent( { type: 'beforeinput', target: domMain } );
			expect( viewDocument.isFocused ).toBe( false );

			observer.flush();
			expect( viewDocument.isFocused ).toBe( true );
		} );

		it( 'should not set isFocused to true on beforeinput on other element after 50ms', () => {
			expect( viewDocument.isFocused ).toBe( false );

			observer.onDomEvent( { type: 'beforeinput', target: document } );
			expect( viewDocument.isFocused ).toBe( false );

			vi.advanceTimersByTime( 50 );
			expect( viewDocument.isFocused ).toBe( true );
		} );

		it( 'should not set isFocused to true on beforeinput on focused document after 50ms', () => {
			viewDocument.isFocused = true;

			observer.onDomEvent( { type: 'beforeinput', target: document } );
			expect( viewDocument.isFocused ).toBe( true );

			vi.advanceTimersByTime( 50 );
			expect( viewDocument.isFocused ).toBe( true );
		} );
	} );

	describe( 'handle _isFocusChanging property of the document', () => {
		let domMain, viewMain;

		beforeEach( () => {
			domMain = document.createElement( 'div' );

			viewMain = createViewRoot( viewDocument );
			view.attachDomRoot( domMain );
		} );

		it( 'should set _isFocusChanging to true on focus', () => {
			view.change( writer => {
				writer.setSelection( viewMain, 0 );
			} );

			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( observer._isFocusChanging ).toBe( true );
		} );

		it( 'should set _isFocusChanging to false after 50ms', () => {
			const renderSpy = vi.fn();
			view.on( 'render', renderSpy );
			vi.useFakeTimers();

			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( renderSpy ).not.toHaveBeenCalled();
			expect( observer._isFocusChanging ).toBe( true );

			vi.advanceTimersByTime( 50 );

			expect( renderSpy ).toHaveBeenCalled();
			expect( observer._isFocusChanging ).toBe( false );

			vi.useRealTimers();
		} );
	} );

	describe( 'flush method', () => {
		it( 'should set the focus properties', () => {
			viewDocument.isFocused = false;
			observer._isFocusChanging = true;

			observer.flush();

			expect( viewDocument.isFocused ).toBe( true );
			expect( observer._isFocusChanging ).toBe( false );
		} );

		it( 'should do nothing when the _isFocusChanging property is false', () => {
			viewDocument.isFocused = false;
			observer._isFocusChanging = false;

			observer.flush();

			expect( viewDocument.isFocused ).toBe( false );
			expect( observer._isFocusChanging ).toBe( false );
		} );
	} );

	describe( 'integration test', () => {
		let viewDocument, domRoot, observer;

		beforeEach( () => {
			domRoot = document.createElement( 'div' );
			document.body.appendChild( domRoot );

			view = new EditingView( new StylesProcessor() );
			viewDocument = view.document;
			createViewRoot( viewDocument );
			view.attachDomRoot( domRoot );

			observer = view.getObserver( FocusObserver );
		} );

		afterEach( () => {
			view.destroy();
			domRoot.remove();
		} );

		it( 'should always render document after selectionChange event', () => {
			return new Promise( resolve => {
				const selectionChangeSpy = vi.fn();
				const renderSpy = vi.fn();

				_setViewData( view, '<div contenteditable="true">foo bar</div>' );
				view.forceRender();

				viewDocument.on( 'selectionChange', selectionChangeSpy );
				view.on( 'render', renderSpy );

				view.on( 'render', () => {
					expect( selectionChangeSpy.mock.invocationCallOrder[ 0 ] )
						.toBeLessThan( renderSpy.mock.invocationCallOrder[ 0 ] );
					resolve();
				} );

				// Mock selectionchange event after focus event. Render called by focus observer should be fired after
				// async selection change.
				viewDocument.fire( 'focus' );
				viewDocument.fire( 'selectionChange' );
				view.change( () => {} );
			} );
		} );

		it( 'should render without selectionChange event', () => {
			return new Promise( resolve => {
				const selectionChangeSpy = vi.fn();
				const renderSpy = vi.fn();

				_setViewData( view, '<div contenteditable="true">foo bar</div>' );
				view.forceRender();
				const domEditable = domRoot.childNodes[ 0 ];

				viewDocument.on( 'selectionChange', selectionChangeSpy );
				view.on( 'render', renderSpy );

				view.on( 'render', () => {
					expect( selectionChangeSpy ).not.toHaveBeenCalled();
					expect( renderSpy ).toHaveBeenCalled();

					resolve();
				} );

				observer.onDomEvent( { type: 'focus', target: domEditable } );
				view.change( () => {} );
			} );
		} );
	} );
} );
