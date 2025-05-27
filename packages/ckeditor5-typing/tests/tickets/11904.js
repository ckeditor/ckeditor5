/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import DeleteObserver from '../../src/deleteobserver.js';
import InsertTextObserver from '../../src/inserttextobserver.js';

import View from '@ckeditor/ckeditor5-engine/src/view/view.js';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata.js';
import createViewRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import { fireBeforeInputDomEvent } from '../_utils/utils.js';

describe( 'Bug ckeditor5-typing#11904', () => {
	let view, domRoot, viewDocument;
	let deleteSpy;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		domRoot = document.createElement( 'div' );
		document.body.appendChild( domRoot );

		view = new View();
		viewDocument = view.document;
		createViewRoot( viewDocument );
		view.attachDomRoot( domRoot );
		view.addObserver( DeleteObserver );
		view.addObserver( InsertTextObserver );

		deleteSpy = testUtils.sinon.spy();
		viewDocument.on( 'delete', deleteSpy );
	} );

	afterEach( () => {
		view.destroy();
		domRoot.remove();
	} );

	describe( 'Blink', () => {
		it( 'should fire `delete` event on `keyup` if no deleting `beforeinput` received (backward deletion)', () => {
			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			sinon.assert.callCount( deleteSpy, 1 );
			sinon.assert.calledWithMatch( deleteSpy.getCall( 0 ), {}, { unit: 'selection', direction: 'backward' } );
		} );

		it( 'should fire `delete` event on `keyup` if no deleting `beforeinput` received (forward deletion)', () => {
			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			sinon.assert.callCount( deleteSpy, 1 );
			sinon.assert.calledWithMatch( deleteSpy.getCall( 0 ), {}, { unit: 'selection', direction: 'forward' } );
		} );

		it( 'should not fire additional `delete` event on `keyup` if deleting `beforeinput` received (same direction)', () => {
			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'deleteContentBackward'
			} );

			viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			sinon.assert.callCount( deleteSpy, 1, { unit: 'codePoint', directin: 'backward' } );
		} );

		it( 'should fire additional `delete` event on `keyup` if deleting `beforeinput` received (opposite direction)', () => {
			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'deleteContentForward'
			} );

			viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			sinon.assert.callCount( deleteSpy, 2 );
		} );

		it( 'should not fire additional `delete` event on `keyup` if delete event was stopped', () => {
			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			viewDocument.on( 'delete', evt => evt.stop() );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'deleteContentBackward'
			} );

			viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			sinon.assert.callCount( deleteSpy, 1, { unit: 'codePoint', directin: 'backward' } );
		} );

		it( 'should ignore `beforeinput` inserting single delete (x7f) character', () => {
			const insertTextSpy = testUtils.sinon.spy();
			viewDocument.on( 'insertText', insertTextSpy );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'insertText',
				data: '\x7f'
			} );

			viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			sinon.assert.callCount( insertTextSpy, 0 );
		} );

		it( 'should not ignore unrelated `beforeinput`', () => {
			const insertTextSpy = testUtils.sinon.spy();
			viewDocument.on( 'insertText', insertTextSpy );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'insertText',
				data: 'abc'
			} );

			viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			sinon.assert.callCount( insertTextSpy, 1 );
		} );
	} );

	describe( 'Non-Blink', () => {
		before( () => {
			env.isBlink = false;
		} );

		after( () => {
			env.isBlink = true;
		} );

		it( 'should not fire `delete` event on `keyup` if no deleting `beforeinput` received', () => {
			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' )
			} ) );

			sinon.assert.callCount( deleteSpy, 0 );
		} );

		it( 'should not ignore `beforeinput` inserting single delete (x7f) character', () => {
			const insertTextSpy = testUtils.sinon.spy();
			viewDocument.on( 'insertText', insertTextSpy );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'insertText',
				data: '\x7f'
			} );

			viewDocument.fire( 'keyup', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			sinon.assert.callCount( insertTextSpy, 1 );
			sinon.assert.callCount( insertTextSpy, 1, { text: '\x7f' } );
		} );
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
} );
