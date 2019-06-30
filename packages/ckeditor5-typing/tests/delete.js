/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Delete from '../src/delete';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

/* globals document */

describe( 'Delete feature', () => {
	let element, editor, viewDocument;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Delete ] } )
			.then( newEditor => {
				editor = newEditor;
				viewDocument = editor.editing.view.document;
			} );
	} );

	afterEach( () => {
		element.remove();
		return editor.destroy();
	} );

	it( 'creates two commands', () => {
		expect( editor.commands.get( 'delete' ) ).to.have.property( 'direction', 'backward' );
		expect( editor.commands.get( 'forwardDelete' ) ).to.have.property( 'direction', 'forward' );
	} );

	it( 'listens to the editing view document delete event', () => {
		const spy = editor.execute = sinon.spy();
		const viewDocument = editor.editing.view.document;
		const domEvt = getDomEvent();

		viewDocument.fire( 'delete', new DomEventData( viewDocument, domEvt, {
			direction: 'forward',
			unit: 'character',
			sequence: 1
		} ) );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.calledWithMatch( 'forwardDelete', { unit: 'character', sequence: 1 } ) ).to.be.true;

		expect( domEvt.preventDefault.calledOnce ).to.be.true;

		viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
			direction: 'backward',
			unit: 'character',
			sequence: 5
		} ) );

		expect( spy.calledTwice ).to.be.true;
		expect( spy.calledWithMatch( 'delete', { unit: 'character', sequence: 5 } ) ).to.be.true;
	} );

	it( 'passes options.selection parameter to delete command if selection to remove was specified', () => {
		editor.setData( '<p>Foobar</p>' );

		const spy = editor.execute = sinon.spy();
		const view = editor.editing.view;
		const viewDocument = view.document;
		const domEvt = getDomEvent();

		const viewSelection = view.createSelection( view.createRangeIn( viewDocument.getRoot() ) );

		viewDocument.fire( 'delete', new DomEventData( viewDocument, domEvt, {
			direction: 'backward',
			unit: 'character',
			sequence: 1,
			selectionToRemove: viewSelection
		} ) );

		expect( spy.calledOnce ).to.be.true;

		const commandName = spy.args[ 0 ][ 0 ];
		const options = spy.args[ 0 ][ 1 ];
		const expectedSelection = editor.model.createSelection( editor.model.createRangeIn( editor.model.document.getRoot() ) );

		expect( commandName ).to.equal( 'delete' );
		expect( options.selection.isEqual( expectedSelection ) ).to.be.true;
	} );

	it( 'scrolls the editing document to the selection after executing the command', () => {
		const scrollSpy = sinon.stub( editor.editing.view, 'scrollToTheSelection' );
		const executeSpy = editor.execute = sinon.spy();

		viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
			direction: 'backward',
			unit: 'character'
		} ) );

		sinon.assert.calledOnce( scrollSpy );
		sinon.assert.callOrder( executeSpy, scrollSpy );
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
} );
