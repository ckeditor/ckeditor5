/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Enter from '../src/enter.js';
import EnterCommand from '../src/entercommand.js';
import EnterObserver from '../src/enterobserver.js';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata.js';

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
		sinon.restore();

		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( Enter.pluginName ).to.equal( 'Enter' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Enter.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Enter.isPremiumPlugin ).to.be.false;
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
			label: 'Insert a hard break (a new paragraph)',
			keystroke: 'Enter'
		} );
	} );

	it( 'creates the commands', () => {
		expect( editor.commands.get( 'enter' ) ).to.be.instanceof( EnterCommand );
	} );

	it( 'registers the EnterObserver', () => {
		const observer = editor.editing.view.getObserver( EnterObserver );

		expect( observer ).to.be.an.instanceOf( EnterObserver );
	} );

	it( 'listens to the editing view enter event', () => {
		const spy = editor.execute = sinon.spy();
		const domEvt = getDomEvent();
		sinon.stub( editor.editing.view, 'scrollToTheSelection' );

		viewDocument.fire( 'enter', new DomEventData( viewDocument, domEvt, { isSoft: false } ) );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.calledWithExactly( 'enter' ) ).to.be.true;

		expect( domEvt.preventDefault.calledOnce ).to.be.true;
	} );

	it( 'scrolls the editing document to the selection after executing the command', () => {
		const domEvt = getDomEvent();
		const executeSpy = editor.execute = sinon.spy();
		const scrollSpy = sinon.stub( editor.editing.view, 'scrollToTheSelection' );

		viewDocument.fire( 'enter', new DomEventData( viewDocument, domEvt ) );

		sinon.assert.calledOnce( scrollSpy );
		sinon.assert.callOrder( domEvt.preventDefault, executeSpy, scrollSpy );
	} );

	it( 'does not execute the command if soft enter should be used', () => {
		const domEvt = getDomEvent();
		const commandExecuteSpy = sinon.stub( editor.commands.get( 'enter' ), 'execute' );

		viewDocument.fire( 'enter', new DomEventData( viewDocument, domEvt, { isSoft: true } ) );

		sinon.assert.notCalled( commandExecuteSpy );
	} );

	it( 'prevents default event action even if the command should not be executed', () => {
		const domEvt = getDomEvent();

		viewDocument.fire( 'enter', new DomEventData( viewDocument, domEvt, { isSoft: true } ) );

		sinon.assert.calledOnce( domEvt.preventDefault );
	} );

	it( 'does not prevent default event action in composing mode', () => {
		const domEvt = getDomEvent();

		viewDocument.isComposing = true;

		viewDocument.fire( 'enter', new DomEventData( viewDocument, domEvt, { isSoft: true } ) );

		sinon.assert.notCalled( domEvt.preventDefault );
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
} );
