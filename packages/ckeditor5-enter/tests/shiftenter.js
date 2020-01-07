/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ShiftEnter from '../src/shiftenter';
import ShiftEnterCommand from '../src/shiftentercommand';
import EnterObserver from '../src/enterobserver';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';

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
		sinon.restore();

		return editor.destroy();
	} );

	it( 'creates the commands', () => {
		expect( editor.commands.get( 'shiftEnter' ) ).to.be.instanceof( ShiftEnterCommand );
	} );

	it( 'should set proper schema rules', () => {
		expect( editor.model.schema.isRegistered( 'softBreak' ) ).to.be.true;

		expect( editor.model.schema.checkChild( [ '$block' ], 'softBreak' ) ).to.be.true;

		expect( editor.model.schema.isInline( 'softBreak' ) ).to.be.true;
	} );

	it( 'registers the EnterObserver', () => {
		const observer = editor.editing.view.getObserver( EnterObserver );

		expect( observer ).to.be.an.instanceOf( EnterObserver );
	} );

	it( 'listens to the editing view enter event', () => {
		const spy = editor.execute = sinon.spy();
		const domEvt = getDomEvent();
		sinon.stub( editor.editing.view, 'scrollToTheSelection' );

		viewDocument.fire( 'enter', new DomEventData( viewDocument, domEvt, { isSoft: true } ) );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.calledWithExactly( 'shiftEnter' ) ).to.be.true;

		expect( domEvt.preventDefault.calledOnce ).to.be.true;
	} );

	it( 'scrolls the editing document to the selection after executing the command', () => {
		const domEvt = getDomEvent();
		const executeSpy = editor.execute = sinon.spy();
		const scrollSpy = sinon.stub( editor.editing.view, 'scrollToTheSelection' );

		viewDocument.fire( 'enter', new DomEventData( viewDocument, domEvt, { isSoft: true } ) );

		sinon.assert.calledOnce( scrollSpy );
		sinon.assert.callOrder( domEvt.preventDefault, executeSpy, scrollSpy );
	} );

	it( 'does not execute the command if hard enter should be used', () => {
		const domEvt = getDomEvent();
		const commandExecuteSpy = sinon.stub( editor.commands.get( 'shiftEnter' ), 'execute' );

		viewDocument.fire( 'enter', new DomEventData( viewDocument, domEvt, { isSoft: false } ) );

		sinon.assert.notCalled( commandExecuteSpy );
	} );

	it( 'prevents default event action even if the command should not be executed', () => {
		const domEvt = getDomEvent();

		viewDocument.fire( 'enter', new DomEventData( viewDocument, domEvt, { isSoft: false } ) );

		sinon.assert.calledOnce( domEvt.preventDefault );
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
} );
