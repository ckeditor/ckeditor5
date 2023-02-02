/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import View from '@ckeditor/ckeditor5-engine/src/view/view';
import EnterObserver from '../src/enterobserver';
import createViewRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { fireBeforeInputDomEvent } from '@ckeditor/ckeditor5-typing/tests/_utils/utils';

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
} );
