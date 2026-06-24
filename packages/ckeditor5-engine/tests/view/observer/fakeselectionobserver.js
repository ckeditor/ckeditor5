/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { createElement, keyCodes } from '@ckeditor/ckeditor5-utils';
import { FakeSelectionObserver } from '../../../src/view/observer/fakeselectionobserver.js';
import { EditingView } from '../../../src/view/view.js';
import { ViewDocumentDomEventData } from '../../../src/view/observer/domeventdata.js';
import { createViewRoot } from '../_utils/createroot.js';
import { _setViewData, _stringifyView } from '../../../src/dev-utils/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'FakeSelectionObserver', () => {
	let observer, view, viewDocument, root, domRoot;

	beforeEach( () => {
		view = new EditingView( new StylesProcessor() );
		viewDocument = view.document;
		root = createViewRoot( viewDocument );
		view.attachDomRoot( domRoot );
		observer = view.getObserver( FakeSelectionObserver );
		viewDocument.selection._setTo( null, { fake: true } );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		vi.useRealTimers();
		view.destroy();
	} );

	beforeAll( () => {
		domRoot = createElement( document, 'div', {
			contenteditable: 'true'
		} );
		document.body.appendChild( domRoot );
	} );

	afterAll( () => {
		domRoot.parentElement.removeChild( domRoot );
	} );

	it( 'should do nothing if selection is not fake', () => {
		viewDocument.selection._setTo( null, { fake: false } );

		return checkEventPrevention( keyCodes.arrowleft, false );
	} );

	it( 'should do nothing if is disabled', () => {
		observer.disable();

		return checkEventPrevention( keyCodes.arrowleft, false );
	} );

	it( 'should prevent default for left arrow key', ( ) => {
		return checkEventPrevention( keyCodes.arrowleft );
	} );

	it( 'should prevent default for right arrow key', ( ) => {
		return checkEventPrevention( keyCodes.arrowright );
	} );

	it( 'should prevent default for up arrow key', ( ) => {
		return checkEventPrevention( keyCodes.arrowup );
	} );

	it( 'should prevent default for down arrow key', ( ) => {
		return checkEventPrevention( keyCodes.arrowdown );
	} );

	it( 'should fire selectionChange event with new selection when left arrow key is pressed', () => {
		return checkSelectionChange(
			'<container:p>foo[<strong>bar</strong>]baz</container:p>',
			keyCodes.arrowleft,
			'<container:p>foo[]<strong>bar</strong>baz</container:p>'
		);
	} );

	it( 'should fire selectionChange event with new selection when right arrow key is pressed', () => {
		return checkSelectionChange(
			'<container:p>foo[<strong>bar</strong>]baz</container:p>',
			keyCodes.arrowright,
			'<container:p>foo<strong>bar</strong>[]baz</container:p>'
		);
	} );

	it( 'should fire selectionChange event with new selection when up arrow key is pressed', () => {
		return checkSelectionChange(
			'<container:p>foo[<strong>bar</strong>]baz</container:p>',
			keyCodes.arrowup,
			'<container:p>foo[]<strong>bar</strong>baz</container:p>'
		);
	} );

	it( 'should fire selectionChange event with new selection when down arrow key is pressed', () => {
		return checkSelectionChange(
			'<container:p>foo[<strong>bar</strong>]baz</container:p>',
			keyCodes.arrowdown,
			'<container:p>foo<strong>bar</strong>[]baz</container:p>'
		);
	} );

	it( 'should fire `selectionChangeDone` event after selection stop changing', () => {
		vi.useFakeTimers();
		const spy = vi.fn();

		viewDocument.on( 'selectionChangeDone', spy );

		// Change selection.
		changeFakeSelectionPressing( keyCodes.arrowdown );

		// Wait 100ms.
		vi.advanceTimersByTime( 100 );

		// Check if spy was called.
		expect( spy ).not.toHaveBeenCalled();

		// Change selection one more time.
		changeFakeSelectionPressing( keyCodes.arrowdown );

		// Wait 210ms (debounced function should be called).
		vi.advanceTimersByTime( 210 );
		expect( spy ).toHaveBeenCalledOnce();
	} );

	it( 'should not fire `selectionChangeDone` event when observer will be destroyed', () => {
		vi.useFakeTimers();
		const spy = vi.fn();

		viewDocument.on( 'selectionChangeDone', spy );

		// Change selection.
		changeFakeSelectionPressing( keyCodes.arrowdown );

		// Wait 100ms.
		vi.advanceTimersByTime( 100 );

		// And destroy observer.
		observer.destroy();

		// Wait another 110ms.
		vi.advanceTimersByTime( 110 );

		// Check that event won't be called.
		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should implement empty #stopObserving() method', () => {
		expect( () => {
			observer.stopObserving();
		} ).not.toThrow();
	} );

	// Checks if preventDefault method was called by FakeSelectionObserver for specified key code.
	//
	// @param {Number} keyCode
	// @param {Boolean} shouldPrevent If set to true method checks if event was prevented.
	// @returns {Promise}
	function checkEventPrevention( keyCode, shouldPrevent = true ) {
		return new Promise( resolve => {
			const data = {
				keyCode,
				preventDefault: vi.fn()
			};

			viewDocument.once( 'keydown', () => {
				if ( shouldPrevent ) {
					expect( data.preventDefault ).toHaveBeenCalledOnce();
				} else {
					expect( data.preventDefault ).not.toHaveBeenCalled();
				}

				resolve();
			}, { priority: 'lowest' } );

			viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, { target: document.body }, data ) );
		} );
	}

	// Checks if proper selectionChange event is fired by FakeSelectionObserver for specified key.
	//
	// @param {String} initialData
	// @param {Number} keyCode
	// @param {String} output
	// @returns {Promise}
	function checkSelectionChange( initialData, keyCode, output ) {
		return new Promise( resolve => {
			viewDocument.once( 'selectionChange', ( eventInfo, data ) => {
				expect( _stringifyView( root.getChild( 0 ), data.newSelection, { showType: true } ) ).toBe( output );
				resolve();
			} );

			_setViewData( view, initialData );
			changeFakeSelectionPressing( keyCode );
		} );
	}

	// Sets fake selection to the document and fire `keydown` event what cause `selectionChange` event.
	//
	// @param {Number} keyCode
	function changeFakeSelectionPressing( keyCode ) {
		viewDocument.selection._setTo( viewDocument.selection.getRanges(), {
			backward: viewDocument.selection.isBackward,
			fake: true
		} );

		const data = {
			keyCode,
			preventDefault: vi.fn()
		};

		viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, { target: document.body }, data ) );
	}
} );
