/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import TabObserver from '../../../src/view/observer/tabobserver.js';
import View from '../../../src/view/view.js';
import createViewRoot from '../../../tests/view/_utils/createroot.js';

import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard.js';

describe( 'TabObserver', () => {
	let view, viewDocument;

	beforeEach( () => {
		view = new View();
		viewDocument = view.document;
		view.addObserver( TabObserver );
	} );

	it( 'can be initialized', () => {
		expect( () => {
			createViewRoot( viewDocument );
			view.attachDomRoot( document.createElement( 'div' ) );
		} ).to.not.throw();
	} );

	describe( 'tab event', () => {
		it( 'is fired on keydown', () => {
			const spy = sinon.spy();

			viewDocument.on( 'tab', spy );

			viewDocument.fire( 'keydown', {
				keyCode: getCode( 'Tab' )
			} );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'is not fired on keydown when keyCode does not match tab', () => {
			const spy = sinon.spy();

			viewDocument.on( 'tab', spy );

			viewDocument.fire( 'keydown', {
				keyCode: 1
			} );

			expect( spy.calledOnce ).to.be.false;
		} );

		it( 'should stop keydown event when tab event is stopped', () => {
			const keydownSpy = sinon.spy();

			viewDocument.on( 'keydown', keydownSpy );
			viewDocument.on( 'tab', evt => evt.stop() );

			viewDocument.fire( 'keydown', {
				keyCode: getCode( 'Tab' )
			} );

			sinon.assert.notCalled( keydownSpy );
		} );

		it( 'should not stop keydown event when tab event is not stopped', () => {
			const keydownSpy = sinon.spy();
			const tabSpy = sinon.spy();

			viewDocument.on( 'keydown', keydownSpy );
			viewDocument.on( 'tab', tabSpy );

			viewDocument.fire( 'keydown', {
				keyCode: getCode( 'Tab' )
			} );

			sinon.assert.calledOnce( keydownSpy );
			sinon.assert.calledOnce( tabSpy );
		} );

		it( 'should not be fired when tab key is pressed with ctrl key', () => {
			const keydownSpy = sinon.spy();
			const tabSpy = sinon.spy();

			viewDocument.on( 'keydown', keydownSpy );
			viewDocument.on( 'tab', tabSpy );

			viewDocument.fire( 'keydown', {
				keyCode: getCode( 'Tab' ),
				ctrlKey: true
			} );

			sinon.assert.calledOnce( keydownSpy );
			sinon.assert.notCalled( tabSpy );
		} );
	} );

	it( 'should implement empty #stopObserving() method', () => {
		expect( () => {
			view.getObserver( TabObserver ).stopObserving();
		} ).to.not.throw();
	} );
} );
