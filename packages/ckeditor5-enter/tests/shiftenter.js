/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { ShiftEnter } from '../src/shiftenter.js';
import { ShiftEnterCommand } from '../src/shiftentercommand.js';
import { EnterObserver } from '../src/enterobserver.js';
import { ViewDocumentDomEventData } from '@ckeditor/ckeditor5-engine';

describe( 'ShiftEnter feature', () => {
	let element, editor, viewDocument;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ ShiftEnter ]
			} )
			.then( newEditor => {
				editor = newEditor;
				viewDocument = editor.editing.view.document;
			} );
	} );

	afterEach( () => {
		element.remove();
		vi.restoreAllMocks();

		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( ShiftEnter.pluginName ).toBe( 'ShiftEnter' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ShiftEnter.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ShiftEnter.isPremiumPlugin ).toBe( false );
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).toContainEqual( {
			label: 'Insert a soft break (a <code>&lt;br&gt;</code> element)',
			keystroke: 'Shift+Enter'
		} );
	} );

	it( 'creates the commands', () => {
		expect( editor.commands.get( 'shiftEnter' ) ).toBeInstanceOf( ShiftEnterCommand );
	} );

	it( 'should set proper schema rules', () => {
		expect( editor.model.schema.isRegistered( 'softBreak' ) ).toBe( true );

		expect( editor.model.schema.checkChild( [ '$block' ], 'softBreak' ) ).toBe( true );

		expect( editor.model.schema.isInline( 'softBreak' ) ).toBe( true );
	} );

	it( 'registers the EnterObserver', () => {
		const observer = editor.editing.view.getObserver( EnterObserver );

		expect( observer ).toBeInstanceOf( EnterObserver );
	} );

	it( 'listens to the editing view enter event', () => {
		const spy = editor.execute = vi.fn();
		const domEvt = getDomEvent();
		vi.spyOn( editor.editing.view, 'scrollToTheSelection' ).mockImplementation( () => {} );

		viewDocument.fire( 'enter', new ViewDocumentDomEventData( viewDocument, domEvt, { isSoft: true } ) );

		expect( spy ).toHaveBeenCalledOnce();
		expect( spy ).toHaveBeenCalledWith( 'shiftEnter' );

		expect( domEvt.preventDefault ).toHaveBeenCalledOnce();
	} );

	it( 'scrolls the editing document to the selection after executing the command', () => {
		const domEvt = getDomEvent();
		const executeSpy = editor.execute = vi.fn();
		const scrollSpy = vi.spyOn( editor.editing.view, 'scrollToTheSelection' ).mockImplementation( () => {} );

		viewDocument.fire( 'enter', new ViewDocumentDomEventData( viewDocument, domEvt, { isSoft: true } ) );

		expect( scrollSpy ).toHaveBeenCalledOnce();

		expect( domEvt.preventDefault.mock.invocationCallOrder[ 0 ] ).toBeLessThan( executeSpy.mock.invocationCallOrder[ 0 ] );
		expect( executeSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( scrollSpy.mock.invocationCallOrder[ 0 ] );
	} );

	it( 'does not execute the command if hard enter should be used', () => {
		const domEvt = getDomEvent();
		const commandExecuteSpy = vi.spyOn( editor.commands.get( 'shiftEnter' ), 'execute' ).mockImplementation( () => {} );

		viewDocument.fire( 'enter', new ViewDocumentDomEventData( viewDocument, domEvt, { isSoft: false } ) );

		expect( commandExecuteSpy ).not.toHaveBeenCalled();
	} );

	it( 'prevents default event action even if the command should not be executed', () => {
		const domEvt = getDomEvent();

		viewDocument.fire( 'enter', new ViewDocumentDomEventData( viewDocument, domEvt, { isSoft: false } ) );

		expect( domEvt.preventDefault ).toHaveBeenCalledOnce();
	} );

	it( 'does not prevent default event action in composing mode', () => {
		const domEvt = getDomEvent();

		viewDocument.isComposing = true;

		viewDocument.fire( 'enter', new ViewDocumentDomEventData( viewDocument, domEvt, { isSoft: false } ) );

		expect( domEvt.preventDefault ).not.toHaveBeenCalled();
	} );

	function getDomEvent() {
		return {
			preventDefault: vi.fn()
		};
	}
} );
