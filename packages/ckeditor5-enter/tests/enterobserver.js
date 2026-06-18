/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EditingView } from '@ckeditor/ckeditor5-engine';
import { EnterObserver } from '../src/enterobserver.js';
import { createViewRoot } from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';
import { fireBeforeInputDomEvent } from '@ckeditor/ckeditor5-typing/tests/_utils/utils.js';
import { getCode, env } from '@ckeditor/ckeditor5-utils';

describe( 'EnterObserver', () => {
	let view, viewDocument, enterSpy;
	let domRoot;

	beforeEach( () => {
		domRoot = document.createElement( 'div' );

		view = new EditingView();
		viewDocument = view.document;
		createViewRoot( viewDocument );
		view.attachDomRoot( domRoot );
		view.addObserver( EnterObserver );

		enterSpy = vi.fn();
		viewDocument.on( 'enter', enterSpy );
	} );

	afterEach( () => {
		view.destroy();
		vi.restoreAllMocks();
	} );

	// See https://github.com/ckeditor/ckeditor5-enter/issues/10.
	it( 'can be initialized', () => {
		expect( () => {
			view = new EditingView();
			viewDocument = view.document;
			createViewRoot( viewDocument );
			view.attachDomRoot( document.createElement( 'div' ) );

			view.addObserver( EnterObserver );

			view.destroy();
		} ).not.toThrow();
	} );

	it( 'should not work if the observer is disabled', () => {
		view.getObserver( EnterObserver )._isEnabled = false;

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		expect( enterSpy ).not.toHaveBeenCalled();
	} );

	it( 'should handle the insertParagraph input type and fire the enter event', () => {
		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		expect( enterSpy ).toHaveBeenCalledOnce();
		expect( enterSpy ).toHaveBeenCalledWith( expect.anything(), expect.objectContaining( { isSoft: false } ) );
	} );

	it( 'should handle the insertLineBreak input type and fire the enter event', () => {
		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertLineBreak'
		} );

		expect( enterSpy ).toHaveBeenCalledOnce();
		expect( enterSpy ).toHaveBeenCalledWith( expect.anything(), expect.objectContaining( { isSoft: true } ) );
	} );

	it( 'should ignore other input types', () => {
		fireBeforeInputDomEvent( domRoot, {
			inputType: 'anyInputType'
		} );

		expect( enterSpy ).not.toHaveBeenCalled();
	} );

	// See https://github.com/ckeditor/ckeditor5/issues/13321.
	it( 'should handle the insertParagraph input type and fire the soft enter event if shift key is pressed in Safari', () => {
		vi.spyOn( env, 'isSafari', 'get' ).mockReturnValue( true );

		fireKeyEvent( 'enter', { shiftKey: true } );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		expect( enterSpy ).toHaveBeenCalledOnce();
		expect( enterSpy ).toHaveBeenCalledWith( expect.anything(), expect.objectContaining( { isSoft: true } ) );
		expect( enterSpy.mock.calls[ 0 ][ 1 ] ).toHaveProperty( 'isSoft', true );

		// Verify if the effect is not persistent.
		fireKeyEvent( 'enter', { shiftKey: false } );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		expect( enterSpy ).toHaveBeenCalledTimes( 2 );
		expect( enterSpy.mock.calls[ 0 ][ 1 ] ).toHaveProperty( 'isSoft', true );
		expect( enterSpy.mock.calls[ 1 ][ 1 ] ).toHaveProperty( 'isSoft', false );
	} );

	// See https://github.com/ckeditor/ckeditor5/issues/13321.
	it( 'should handle the insertParagraph input type and fire the enter event if shift key was pressed before in Safari', () => {
		vi.spyOn( env, 'isSafari', 'get' ).mockReturnValue( true );

		fireKeyEvent( 'shift', { shiftKey: true }, 'keydown' );
		fireKeyEvent( 'shift', { shiftKey: false }, 'keyup' );
		fireKeyEvent( 'enter', { shiftKey: false }, 'keydown' );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		expect( enterSpy ).toHaveBeenCalledOnce();
		expect( enterSpy ).toHaveBeenCalledWith( expect.anything(), expect.objectContaining( { isSoft: false } ) );
		expect( enterSpy.mock.calls[ 0 ][ 1 ] ).toHaveProperty( 'isSoft', false );
	} );

	it( 'should never preventDefault() the beforeinput event', () => {
		let interceptedEventData;

		viewDocument.on( 'beforeinput', ( evt, data ) => {
			interceptedEventData = data;
			vi.spyOn( interceptedEventData, 'preventDefault' );
		}, { priority: Number.POSITIVE_INFINITY } );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		expect( interceptedEventData.preventDefault ).not.toHaveBeenCalled();
	} );

	it( 'should stop() the beforeinput event if enter event was also stopped', () => {
		let interceptedEventInfo;

		viewDocument.on( 'beforeinput', evt => {
			interceptedEventInfo = evt;
		}, { priority: Number.POSITIVE_INFINITY } );

		viewDocument.on( 'enter', evt => {
			evt.stop();
		} );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		expect( interceptedEventInfo.stop.called ).toBe( true );
	} );

	it( 'should not stop() the beforeinput event if enter event was not stopped', () => {
		let interceptedEventInfo;

		viewDocument.on( 'beforeinput', evt => {
			interceptedEventInfo = evt;
		}, { priority: Number.POSITIVE_INFINITY } );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		expect( interceptedEventInfo.stop.called ).toBeUndefined();
	} );

	it( 'should implement empty #stopObserving() method', () => {
		expect( () => {
			view.getObserver( EnterObserver ).stopObserving();
		} ).not.toThrow();
	} );

	function fireKeyEvent( key, options, type = 'keydown' ) {
		viewDocument.fire( type, {
			keyCode: getCode( key ),
			preventDefault: () => {},
			domTarget: document.body,
			...options
		} );
	}
} );
