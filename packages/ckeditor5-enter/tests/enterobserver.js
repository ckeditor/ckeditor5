/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import View from '@ckeditor/ckeditor5-engine/src/view/view.js';
import EnterObserver from '../src/enterobserver.js';
import createViewRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { fireBeforeInputDomEvent } from '@ckeditor/ckeditor5-typing/tests/_utils/utils.js';
import { getCode, env } from '@ckeditor/ckeditor5-utils';

describe( 'EnterObserver', () => {
	let view, viewDocument, enterSpy;
	let domRoot;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		domRoot = document.createElement( 'div' );

		view = new View();
		viewDocument = view.document;
		createViewRoot( viewDocument );
		view.attachDomRoot( domRoot );
		view.addObserver( EnterObserver );

		enterSpy = testUtils.sinon.spy();
		viewDocument.on( 'enter', enterSpy );
	} );

	afterEach( () => {
		view.destroy();
	} );

	// See #10.
	it( 'can be initialized', () => {
		expect( () => {
			view = new View();
			viewDocument = view.document;
			createViewRoot( viewDocument );
			view.attachDomRoot( document.createElement( 'div' ) );

			view.addObserver( EnterObserver );

			view.destroy();
		} ).to.not.throw();
	} );

	it( 'should not work if the observer is disabled', () => {
		view.getObserver( EnterObserver )._isEnabled = false;

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		sinon.assert.notCalled( enterSpy );
	} );

	it( 'should handle the insertParagraph input type and fire the enter event', () => {
		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		sinon.assert.calledOnce( enterSpy );
		sinon.assert.calledWithMatch( enterSpy, {}, { isSoft: false } );
	} );

	it( 'should handle the insertLineBreak input type and fire the enter event', () => {
		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertLineBreak'
		} );

		sinon.assert.calledOnce( enterSpy );
		sinon.assert.calledWithMatch( enterSpy, {}, { isSoft: true } );
	} );

	it( 'should ignore other input types', () => {
		fireBeforeInputDomEvent( domRoot, {
			inputType: 'anyInputType'
		} );

		sinon.assert.notCalled( enterSpy );
	} );

	// See https://github.com/ckeditor/ckeditor5/issues/13321.
	it( 'should handle the insertParagraph input type and fire the soft enter event if shift key is pressed in Safari', () => {
		sinon.stub( env, 'isSafari' ).value( true );

		fireKeyEvent( 'enter', { shiftKey: true } );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		sinon.assert.calledOnce( enterSpy );
		sinon.assert.calledWithMatch( enterSpy, {}, { isSoft: true } );
		expect( enterSpy.firstCall.args[ 1 ] ).to.have.property( 'isSoft', true );

		// Verify if the effect is not persistent.
		fireKeyEvent( 'enter', { shiftKey: false } );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		sinon.assert.calledTwice( enterSpy );
		expect( enterSpy.firstCall.args[ 1 ] ).to.have.property( 'isSoft', true );
		expect( enterSpy.secondCall.args[ 1 ] ).to.have.property( 'isSoft', false );
	} );

	// See https://github.com/ckeditor/ckeditor5/issues/13321.
	it( 'should handle the insertParagraph input type and fire the enter event if shift key was pressed before in Safari', () => {
		sinon.stub( env, 'isSafari' ).value( true );

		fireKeyEvent( 'shift', { shiftKey: true }, 'keydown' );
		fireKeyEvent( 'shift', { shiftKey: false }, 'keyup' );
		fireKeyEvent( 'enter', { shiftKey: false }, 'keydown' );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		sinon.assert.calledOnce( enterSpy );
		sinon.assert.calledWithMatch( enterSpy, {}, { isSoft: false } );
		expect( enterSpy.firstCall.args[ 1 ] ).to.have.property( 'isSoft', false );
	} );

	it( 'should never preventDefault() the beforeinput event', () => {
		let interceptedEventData;

		viewDocument.on( 'beforeinput', ( evt, data ) => {
			interceptedEventData = data;
			sinon.spy( interceptedEventData, 'preventDefault' );
		}, { priority: Number.POSITIVE_INFINITY } );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		sinon.assert.notCalled( interceptedEventData.preventDefault );
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

		expect( interceptedEventInfo.stop.called ).to.be.true;
	} );

	it( 'should not stop() the beforeinput event if enter event was not stopped', () => {
		let interceptedEventInfo;

		viewDocument.on( 'beforeinput', evt => {
			interceptedEventInfo = evt;
		}, { priority: Number.POSITIVE_INFINITY } );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		expect( interceptedEventInfo.stop.called ).to.be.undefined;
	} );

	it( 'should implement empty #stopObserving() method', () => {
		expect( () => {
			view.getObserver( EnterObserver ).stopObserving();
		} ).to.not.throw();
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
