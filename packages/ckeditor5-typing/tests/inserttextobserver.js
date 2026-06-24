/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { InsertTextObserver } from '../src/inserttextobserver.js';
import { fireBeforeInputDomEvent, fireCompositionEndDomEvent } from './_utils/utils.js';

import { EditingView, _setViewData } from '@ckeditor/ckeditor5-engine';
import { createViewRoot } from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';
import { env } from '@ckeditor/ckeditor5-utils';

describe( 'InsertTextObserver', () => {
	let view, viewDocument, insertTextEventSpy;
	let domRoot;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		domRoot = document.createElement( 'div' );

		view = new EditingView();
		viewDocument = view.document;
		createViewRoot( viewDocument );
		view.attachDomRoot( domRoot );
		view.addObserver( InsertTextObserver );

		insertTextEventSpy = vi.fn();
		viewDocument.on( 'insertText', insertTextEventSpy );
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'can be initialized', () => {
		expect( () => {
			view = new EditingView();
			viewDocument = view.document;
			createViewRoot( viewDocument );
			view.attachDomRoot( document.createElement( 'div' ) );

			view.addObserver( InsertTextObserver );

			view.destroy();
		} ).not.toThrow();
	} );

	it( 'should not work if the observer is disabled (beforeinput)', () => {
		view.getObserver( InsertTextObserver )._isEnabled = false;

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		expect( insertTextEventSpy ).not.toHaveBeenCalled();
	} );

	it( 'should not work if the observer is disabled (composition)', () => {
		view.getObserver( InsertTextObserver )._isEnabled = false;

		fireCompositionEndDomEvent( domRoot, {
			data: 'foo'
		} );

		expect( insertTextEventSpy ).not.toHaveBeenCalled();
	} );

	it( 'should ignore other input types', () => {
		fireBeforeInputDomEvent( domRoot, {
			inputType: 'anyInputType'
		} );

		expect( insertTextEventSpy ).not.toHaveBeenCalled();
	} );

	it( 'should stop the beforeinput event propagation if insertText event was stopped', () => {
		let interceptedEventInfo;

		viewDocument.on( 'beforeinput', evt => {
			interceptedEventInfo = evt;
		}, { priority: Number.POSITIVE_INFINITY } );

		viewDocument.on( 'insertText', evt => {
			evt.stop();
		} );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertText'
		} );

		expect( interceptedEventInfo.stop.called ).toBe( true );
	} );

	it( 'should not stop the beforeinput event propagation if insertText event was not stopped', () => {
		let interceptedEventInfo;

		viewDocument.on( 'beforeinput', evt => {
			interceptedEventInfo = evt;
		}, { priority: Number.POSITIVE_INFINITY } );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertText'
		} );

		expect( interceptedEventInfo.stop.called ).toBeUndefined();
	} );

	it( 'should never preventDefault() the beforeinput event', () => {
		_setViewData( view, '<p>fo{}o</p>' );

		const viewRange = view.document.selection.getFirstRange();
		const domRange = view.domConverter.viewRangeToDom( viewRange );

		let interceptedEventData;

		viewDocument.on( 'beforeinput', ( evt, data ) => {
			interceptedEventData = data;
			vi.spyOn( interceptedEventData, 'preventDefault' );
		}, { priority: Number.POSITIVE_INFINITY } );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertText',
			ranges: [ domRange ],
			data: 'bar'
		} );

		expect( interceptedEventData.preventDefault ).not.toHaveBeenCalled();
	} );

	it( 'should handle the insertText input type and fire the insertText event', () => {
		_setViewData( view, '<p>fo{}o</p>' );

		const viewRange = view.document.selection.getFirstRange();
		const domRange = view.domConverter.viewRangeToDom( viewRange );
		const viewSelection = view.createSelection( viewRange );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertText',
			ranges: [ domRange ],
			data: 'bar'
		} );

		expect( insertTextEventSpy ).toHaveBeenCalledOnce();

		const firstCallArgs = insertTextEventSpy.mock.calls[ 0 ][ 1 ];

		expect( firstCallArgs.text ).toEqual( 'bar' );
		expect( firstCallArgs.selection.isEqual( viewSelection ) ).toBe( true );
		expect( firstCallArgs.isComposing ).toBeUndefined();
	} );

	it( 'should handle the insertText input type and fire the insertText event while composing', () => {
		_setViewData( view, '<p>fo{}o</p>' );

		const viewRange = view.document.selection.getFirstRange();
		const domRange = view.domConverter.viewRangeToDom( viewRange );
		const viewSelection = view.createSelection( viewRange );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertText',
			ranges: [ domRange ],
			data: 'bar',
			isComposing: true
		} );

		expect( insertTextEventSpy ).toHaveBeenCalledOnce();

		const firstCallArgs = insertTextEventSpy.mock.calls[ 0 ][ 1 ];

		expect( firstCallArgs.text ).toEqual( 'bar' );
		expect( firstCallArgs.selection.isEqual( viewSelection ) ).toBe( true );
		expect( firstCallArgs.isComposing ).toBe( true );
	} );

	it( 'should handle the insertReplacementText input type and fire the insertText event', () => {
		_setViewData( view, '<p>fo{}o</p>' );

		const viewRange = view.document.selection.getFirstRange();
		const domRange = view.domConverter.viewRangeToDom( viewRange );
		const viewSelection = view.createSelection( viewRange );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertReplacementText',
			ranges: [ domRange ],
			data: 'bar'
		} );

		expect( insertTextEventSpy ).toHaveBeenCalledOnce();

		const firstCallArgs = insertTextEventSpy.mock.calls[ 0 ][ 1 ];

		expect( firstCallArgs.text ).toEqual( 'bar' );
		expect( firstCallArgs.selection.isEqual( viewSelection ) ).toBe( true );
	} );

	it( 'should handle the compositionend event and fire the insertText event', () => {
		_setViewData( view, '<p>fo{}o</p>' );

		fireCompositionEndDomEvent( domRoot, {
			data: 'bar'
		} );

		expect( insertTextEventSpy ).toHaveBeenCalledOnce();

		const firstCallArgs = insertTextEventSpy.mock.calls[ 0 ][ 1 ];

		expect( firstCallArgs.text ).toEqual( 'bar' );
		expect( firstCallArgs.selection ).toBeUndefined();
		expect( firstCallArgs.isComposing ).toBe( true );
	} );

	it( 'should ignore the empty compositionend event (without any data)', () => {
		_setViewData( view, '<p>fo{}o</p>' );

		fireCompositionEndDomEvent( domRoot, {
			data: ''
		} );

		expect( insertTextEventSpy ).not.toHaveBeenCalled();
	} );

	// See https://github.com/ckeditor/ckeditor5/issues/14569.
	it( 'should flush focus observer to enable selection rendering', () => {
		_setViewData( view, '<p>fo{}o</p>' );

		const flushSpy = vi.spyOn( view.getObserver( InsertTextObserver ).focusObserver, 'flush' );

		const viewRange = view.document.selection.getFirstRange();
		const domRange = view.domConverter.viewRangeToDom( viewRange );
		const viewSelection = view.createSelection( viewRange );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertText',
			ranges: [ domRange ],
			data: 'bar'
		} );

		expect( insertTextEventSpy ).toHaveBeenCalledOnce();
		expect( flushSpy ).toHaveBeenCalledOnce();

		const firstCallArgs = insertTextEventSpy.mock.calls[ 0 ][ 1 ];

		expect( firstCallArgs.text ).toEqual( 'bar' );
		expect( firstCallArgs.selection.isEqual( viewSelection ) ).toBe( true );
	} );

	describe( 'in Android environment', () => {
		let view, viewDocument, insertTextEventSpy;
		let domRoot;

		beforeEach( () => {
			vi.spyOn( env, 'isAndroid', 'get' ).mockReturnValue( true );

			domRoot = document.createElement( 'div' );

			view = new EditingView();
			viewDocument = view.document;
			createViewRoot( viewDocument );
			view.attachDomRoot( domRoot );
			view.addObserver( InsertTextObserver );

			insertTextEventSpy = vi.fn();
			viewDocument.on( 'insertText', insertTextEventSpy );
		} );

		afterEach( () => {
			view.destroy();
		} );

		it( 'should handle the insertCompositionText input type and fire the insertText event', () => {
			_setViewData( view, '<p>f{o}o</p>' );

			const viewRange = view.document.selection.getFirstRange();
			const domRange = view.domConverter.viewRangeToDom( viewRange );
			const viewSelection = view.createSelection( viewRange );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'insertCompositionText',
				ranges: [ domRange ],
				data: 'bar'
			} );

			expect( insertTextEventSpy ).toHaveBeenCalledOnce();

			const firstCallArgs = insertTextEventSpy.mock.calls[ 0 ][ 1 ];

			expect( firstCallArgs.text ).toEqual( 'bar' );
			expect( firstCallArgs.selection.isEqual( viewSelection ) ).toBe( true );
		} );
	} );

	it( 'should implement empty #stopObserving() method', () => {
		expect( () => {
			view.getObserver( InsertTextObserver ).stopObserving();
		} ).not.toThrow();
	} );
} );
