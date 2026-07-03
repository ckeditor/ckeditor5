/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Enter } from '../src/enter.js';
import { EnterCommand } from '../src/entercommand.js';
import { EnterObserver } from '../src/enterobserver.js';
import { ViewDocumentDomEventData } from '@ckeditor/ckeditor5-engine';

describe( 'Enter feature', () => {
	let element, editor, viewDocument;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Enter ]
			} )
			.then( newEditor => {
				editor = newEditor;
				viewDocument = editor.editing.view.document;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( Enter.pluginName ).toBe( 'Enter' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Enter.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Enter.isPremiumPlugin ).toBe( false );
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).toContainEqual( {
			label: 'Insert a hard break (a new paragraph)',
			keystroke: 'Enter'
		} );
	} );

	it( 'creates the commands', () => {
		expect( editor.commands.get( 'enter' ) ).toBeInstanceOf( EnterCommand );
	} );

	it( 'registers the EnterObserver', () => {
		const observer = editor.editing.view.getObserver( EnterObserver );

		expect( observer ).toBeInstanceOf( EnterObserver );
	} );

	it( 'listens to the editing view enter event', () => {
		const spy = editor.execute = vi.fn();
		const domEvt = getDomEvent();
		vi.spyOn( editor.editing.view, 'scrollToTheSelection' ).mockImplementation( () => {} );

		viewDocument.fire( 'enter', new ViewDocumentDomEventData( viewDocument, domEvt, { isSoft: false } ) );

		expect( spy ).toHaveBeenCalledOnce();
		expect( spy ).toHaveBeenCalledWith( 'enter' );

		expect( domEvt.preventDefault ).toHaveBeenCalledOnce();
	} );

	it( 'scrolls the editing document to the selection after executing the command', () => {
		const domEvt = getDomEvent();
		const executeSpy = editor.execute = vi.fn();
		const scrollSpy = vi.spyOn( editor.editing.view, 'scrollToTheSelection' ).mockImplementation( () => {} );

		viewDocument.fire( 'enter', new ViewDocumentDomEventData( viewDocument, domEvt ) );

		expect( scrollSpy ).toHaveBeenCalledOnce();

		const preventDefaultOrder = domEvt.preventDefault.mock.invocationCallOrder[ 0 ];
		const executeOrder = executeSpy.mock.invocationCallOrder[ 0 ];
		const scrollOrder = scrollSpy.mock.invocationCallOrder[ 0 ];

		expect( preventDefaultOrder ).toBeLessThan( executeOrder );
		expect( executeOrder ).toBeLessThan( scrollOrder );
	} );

	it( 'does not execute the command if soft enter should be used', () => {
		const domEvt = getDomEvent();
		const commandExecuteSpy = vi.spyOn( editor.commands.get( 'enter' ), 'execute' ).mockImplementation( () => {} );

		viewDocument.fire( 'enter', new ViewDocumentDomEventData( viewDocument, domEvt, { isSoft: true } ) );

		expect( commandExecuteSpy ).not.toHaveBeenCalled();
	} );

	it( 'prevents default event action even if the command should not be executed', () => {
		const domEvt = getDomEvent();

		viewDocument.fire( 'enter', new ViewDocumentDomEventData( viewDocument, domEvt, { isSoft: true } ) );

		expect( domEvt.preventDefault ).toHaveBeenCalledOnce();
	} );

	it( 'does not prevent default event action in composing mode', () => {
		const domEvt = getDomEvent();

		viewDocument.isComposing = true;

		viewDocument.fire( 'enter', new ViewDocumentDomEventData( viewDocument, domEvt, { isSoft: true } ) );

		expect( domEvt.preventDefault ).not.toHaveBeenCalled();
	} );

	function getDomEvent() {
		return {
			preventDefault: vi.fn()
		};
	}
} );
