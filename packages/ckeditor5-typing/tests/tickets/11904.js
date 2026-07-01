/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

import { DeleteObserver } from '../../src/deleteobserver.js';
import { InsertTextObserver } from '../../src/inserttextobserver.js';

import { EditingView, ViewDocumentDomEventData } from '@ckeditor/ckeditor5-engine';
import { createViewRoot } from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';
import { env, getCode } from '@ckeditor/ckeditor5-utils';
import { fireBeforeInputDomEvent } from '../_utils/utils.js';

describe( 'Bug ckeditor5-typing#11904', () => {
	let view, domRoot, viewDocument;
	let deleteSpy;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		domRoot = document.createElement( 'div' );
		document.body.appendChild( domRoot );

		view = new EditingView();
		viewDocument = view.document;
		createViewRoot( viewDocument );
		view.attachDomRoot( domRoot );
		view.addObserver( DeleteObserver );
		view.addObserver( InsertTextObserver );

		deleteSpy = vi.fn();
		viewDocument.on( 'delete', deleteSpy );
	} );

	afterEach( () => {
		view.destroy();
		domRoot.remove();
	} );

	describe( 'Blink', () => {
		it( 'should fire `delete` event on `keyup` if no deleting `beforeinput` received (backward deletion)', () => {
			viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			viewDocument.fire( 'keyup', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
			expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( { unit: 'selection', direction: 'backward' } ) );
		} );

		it( 'should fire `delete` event on `keyup` if no deleting `beforeinput` received (forward deletion)', () => {
			viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			viewDocument.fire( 'keyup', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
			expect( deleteSpy.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( { unit: 'selection', direction: 'forward' } ) );
		} );

		it( 'should not fire additional `delete` event on `keyup` if deleting `beforeinput` received (same direction)', () => {
			viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'deleteContentBackward'
			} );

			viewDocument.fire( 'keyup', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should fire additional `delete` event on `keyup` if deleting `beforeinput` received (opposite direction)', () => {
			viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'deleteContentForward'
			} );

			viewDocument.fire( 'keyup', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			expect( deleteSpy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should not fire additional `delete` event on `keyup` if delete event was stopped', () => {
			viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			viewDocument.on( 'delete', evt => evt.stop() );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'deleteContentBackward'
			} );

			viewDocument.fire( 'keyup', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should ignore `beforeinput` inserting single delete (x7f) character', () => {
			const insertTextSpy = vi.fn();
			viewDocument.on( 'insertText', insertTextSpy );

			viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'insertText',
				data: '\x7f'
			} );

			viewDocument.fire( 'keyup', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			expect( insertTextSpy ).toHaveBeenCalledTimes( 0 );
		} );

		it( 'should not ignore unrelated `beforeinput`', () => {
			const insertTextSpy = vi.fn();
			viewDocument.on( 'insertText', insertTextSpy );

			viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'insertText',
				data: 'abc'
			} );

			viewDocument.fire( 'keyup', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			expect( insertTextSpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'Non-Blink', () => {
		beforeAll( () => {
			env.isBlink = false;
		} );

		afterAll( () => {
			env.isBlink = true;
		} );

		it( 'should not fire `delete` event on `keyup` if no deleting `beforeinput` received', () => {
			viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			viewDocument.fire( 'keyup', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			expect( deleteSpy ).toHaveBeenCalledTimes( 0 );
		} );

		it( 'should not ignore `beforeinput` inserting single delete (x7f) character', () => {
			const insertTextSpy = vi.fn();
			viewDocument.on( 'insertText', insertTextSpy );

			viewDocument.fire( 'keydown', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'insertText',
				data: '\x7f'
			} );

			viewDocument.fire( 'keyup', new ViewDocumentDomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			expect( insertTextSpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	function getDomEvent() {
		return {
			preventDefault: vi.fn()
		};
	}
} );
