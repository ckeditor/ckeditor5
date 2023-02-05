/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import InsertTextObserver from '../src/inserttextobserver';
import { fireBeforeInputDomEvent, fireCompositionEndDomEvent } from './_utils/utils';

import View from '@ckeditor/ckeditor5-engine/src/view/view';
import createViewRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData as viewSetData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import env from '@ckeditor/ckeditor5-utils/src/env';

describe( 'InsertTextObserver', () => {
	let view, viewDocument, insertTextEventSpy;
	let domRoot;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		domRoot = document.createElement( 'div' );

		view = new View();
		viewDocument = view.document;
		createViewRoot( viewDocument );
		view.attachDomRoot( domRoot );
		view.addObserver( InsertTextObserver );

		insertTextEventSpy = testUtils.sinon.spy();
		viewDocument.on( 'insertText', insertTextEventSpy );
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'can be initialized', () => {
		expect( () => {
			view = new View();
			viewDocument = view.document;
			createViewRoot( viewDocument );
			view.attachDomRoot( document.createElement( 'div' ) );

			view.addObserver( InsertTextObserver );

			view.destroy();
		} ).to.not.throw();
	} );

	it( 'should not work if the observer is disabled (beforeinput)', () => {
		view.getObserver( InsertTextObserver )._isEnabled = false;

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertParagraph'
		} );

		sinon.assert.notCalled( insertTextEventSpy );
	} );

	it( 'should not work if the observer is disabled (composition)', () => {
		view.getObserver( InsertTextObserver )._isEnabled = false;

		fireCompositionEndDomEvent( domRoot, {
			data: 'foo'
		} );

		sinon.assert.notCalled( insertTextEventSpy );
	} );

	it( 'should ignore other input types', () => {
		fireBeforeInputDomEvent( domRoot, {
			inputType: 'anyInputType'
		} );

		sinon.assert.notCalled( insertTextEventSpy );
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

		expect( interceptedEventInfo.stop.called ).to.be.true;
	} );

	it( 'should not stop the beforeinput event propagation if insertText event was not stopped', () => {
		let interceptedEventInfo;

		viewDocument.on( 'beforeinput', evt => {
			interceptedEventInfo = evt;
		}, { priority: Number.POSITIVE_INFINITY } );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertText'
		} );

		expect( interceptedEventInfo.stop.called ).to.be.undefined;
	} );

	it( 'should never preventDefault() the beforeinput event', () => {
		viewSetData( view, '<p>fo{}o</p>' );

		const viewRange = view.document.selection.getFirstRange();
		const domRange = view.domConverter.viewRangeToDom( viewRange );

		let interceptedEventData;

		viewDocument.on( 'beforeinput', ( evt, data ) => {
			interceptedEventData = data;
			sinon.spy( interceptedEventData, 'preventDefault' );
		}, { priority: Number.POSITIVE_INFINITY } );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertText',
			ranges: [ domRange ],
			data: 'bar'
		} );

		sinon.assert.notCalled( interceptedEventData.preventDefault );
	} );

	it( 'should handle the insertText input type and fire the insertText event', () => {
		viewSetData( view, '<p>fo{}o</p>' );

		const viewRange = view.document.selection.getFirstRange();
		const domRange = view.domConverter.viewRangeToDom( viewRange );
		const viewSelection = view.createSelection( viewRange );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertText',
			ranges: [ domRange ],
			data: 'bar'
		} );

		sinon.assert.calledOnce( insertTextEventSpy );

		const firstCallArgs = insertTextEventSpy.firstCall.args[ 1 ];

		expect( firstCallArgs.text ).to.equal( 'bar' );
		expect( firstCallArgs.selection.isEqual( viewSelection ) ).to.be.true;
	} );

	it( 'should handle the insertReplacementText input type and fire the insertText event', () => {
		viewSetData( view, '<p>fo{}o</p>' );

		const viewRange = view.document.selection.getFirstRange();
		const domRange = view.domConverter.viewRangeToDom( viewRange );
		const viewSelection = view.createSelection( viewRange );

		fireBeforeInputDomEvent( domRoot, {
			inputType: 'insertReplacementText',
			ranges: [ domRange ],
			data: 'bar'
		} );

		sinon.assert.calledOnce( insertTextEventSpy );

		const firstCallArgs = insertTextEventSpy.firstCall.args[ 1 ];

		expect( firstCallArgs.text ).to.equal( 'bar' );
		expect( firstCallArgs.selection.isEqual( viewSelection ) ).to.be.true;
	} );

	it( 'should handle the compositionend event and fire the insertText event', () => {
		viewSetData( view, '<p>fo{}o</p>' );

		fireCompositionEndDomEvent( domRoot, {
			data: 'bar'
		} );

		sinon.assert.calledOnce( insertTextEventSpy );

		const firstCallArgs = insertTextEventSpy.firstCall.args[ 1 ];

		expect( firstCallArgs.text ).to.equal( 'bar' );
		expect( firstCallArgs.selection.isEqual( view.document.selection ) ).to.be.true;
	} );

	it( 'should ignore the empty compositionend event (without any data)', () => {
		viewSetData( view, '<p>fo{}o</p>' );

		fireCompositionEndDomEvent( domRoot, {
			data: ''
		} );

		sinon.assert.notCalled( insertTextEventSpy );
	} );

	describe( 'in Android environment', () => {
		let view, viewDocument, insertTextEventSpy;
		let domRoot;

		beforeEach( () => {
			testUtils.sinon.stub( env, 'isAndroid' ).value( true );

			domRoot = document.createElement( 'div' );

			view = new View();
			viewDocument = view.document;
			createViewRoot( viewDocument );
			view.attachDomRoot( domRoot );
			view.addObserver( InsertTextObserver );

			insertTextEventSpy = testUtils.sinon.spy();
			viewDocument.on( 'insertText', insertTextEventSpy );
		} );

		afterEach( () => {
			view.destroy();
		} );

		it( 'should handle the insertCompositionText input type and fire the insertText event', () => {
			viewSetData( view, '<p>f{o}o</p>' );

			const viewRange = view.document.selection.getFirstRange();
			const domRange = view.domConverter.viewRangeToDom( viewRange );
			const viewSelection = view.createSelection( viewRange );

			fireBeforeInputDomEvent( domRoot, {
				inputType: 'insertCompositionText',
				ranges: [ domRange ],
				data: 'bar'
			} );

			sinon.assert.calledOnce( insertTextEventSpy );

			const firstCallArgs = insertTextEventSpy.firstCall.args[ 1 ];

			expect( firstCallArgs.text ).to.equal( 'bar' );
			expect( firstCallArgs.selection.isEqual( viewSelection ) ).to.be.true;
		} );
	} );
} );
