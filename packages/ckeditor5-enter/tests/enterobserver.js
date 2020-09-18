/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import View from '@ckeditor/ckeditor5-engine/src/view/view';
import EnterObserver from '../src/enterobserver';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import createViewRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import env from '@ckeditor/ckeditor5-utils/src/env';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { fireBeforeInputDomEvent } from '@ckeditor/ckeditor5-typing/tests/_utils/utils';

describe( 'EnterObserver', () => {
	let view, viewDocument, enterSpy;

	testUtils.createSinonSandbox();

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

	describe( 'key events-based', () => {
		beforeEach( () => {
			// Force the browser to not use the beforeinput event.
			testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => false );

			view = new View();
			viewDocument = view.document;
			view.addObserver( EnterObserver );

			enterSpy = testUtils.sinon.spy();
			viewDocument.on( 'enter', enterSpy );
		} );

		it( 'should not work if the observer is disabled', () => {
			view.getObserver( EnterObserver ).isEnabled = false;

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'enter' ),
				shiftKey: false
			} ) );

			sinon.assert.notCalled( enterSpy );
		} );

		it( 'should fire enter on keydown', () => {
			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'enter' ),
				shiftKey: false
			} ) );

			expect( enterSpy.calledOnce ).to.be.true;
			expect( enterSpy.firstCall.args[ 1 ].isSoft ).to.be.false;
		} );

		it( 'detects whether shift was pressed along with the "enter" key', () => {
			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'enter' ),
				shiftKey: true
			} ) );

			expect( enterSpy.calledOnce ).to.be.true;
			expect( enterSpy.firstCall.args[ 1 ].isSoft ).to.be.true;
		} );

		it( 'should not fire enter on keydown when keyCode does not match enter', () => {
			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: 1
			} ) );

			expect( enterSpy.calledOnce ).to.be.false;
		} );

		it( 'should stop the keydown event when enter event is stopped', () => {
			const keydownSpy = sinon.spy();
			viewDocument.on( 'keydown', keydownSpy );
			viewDocument.on( 'enter', evt => evt.stop() );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'enter' )
			} ) );

			sinon.assert.notCalled( keydownSpy );
		} );

		it( 'should not stop the keydown event when enter event is not stopped', () => {
			const keydownSpy = sinon.spy();
			viewDocument.on( 'keydown', keydownSpy );
			viewDocument.on( 'enter', evt => evt.stop() );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'x' )
			} ) );

			sinon.assert.calledOnce( keydownSpy );
		} );
	} );

	describe( 'beforeinput-based', () => {
		let domRoot;

		beforeEach( () => {
			// Force the browser to use the beforeinput event.
			testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => true );

			domRoot = document.createElement( 'div' );

			view = new View();
			viewDocument = view.document;
			createViewRoot( viewDocument );
			view.attachDomRoot( domRoot );
			view.addObserver( EnterObserver );

			enterSpy = testUtils.sinon.spy();
			viewDocument.on( 'enter', enterSpy );
		} );

		it( 'should not work if the observer is disabled', () => {
			view.getObserver( EnterObserver ).isEnabled = false;

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

		it( 'should always preventDefault() the beforeinput event', () => {
			let interceptedEventData;

			viewDocument.on( 'beforeinput', ( evt, data ) => {
				interceptedEventData = data;
				sinon.spy( interceptedEventData, 'preventDefault' );
			}, { priority: Number.POSITIVE_INFINITY } );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'insertParagraph'
			} );

			sinon.assert.calledOnce( interceptedEventData.preventDefault );
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

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
} );
