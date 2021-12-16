/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Delete from '../src/delete';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import Batch from '@ckeditor/ckeditor5-engine/src/model/batch';
import env from '@ckeditor/ckeditor5-utils/src/env';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';

/* globals window, document */

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
		expect( editor.commands.get( 'deleteForward' ) ).to.have.property( 'direction', 'forward' );
	} );

	it( 'should register forwardDelete command as an alias for deleteForward command', () => {
		expect( editor.commands.get( 'forwardDelete' ) ).to.equal( editor.commands.get( 'deleteForward' ) );
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
		expect( spy.calledWithMatch( 'deleteForward', { unit: 'character', sequence: 1 } ) ).to.be.true;

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
} );

describe( 'Delete feature - Android', () => {
	let element, editor, oldEnvIsAndroid;

	before( () => {
		oldEnvIsAndroid = env.isAndroid;
		env.isAndroid = true;
	} );

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Delete, Paragraph ] } )
			.then( newEditor => {
				editor = newEditor;

				const modelRoot = editor.model.document.getRoot();

				editor.model.change( writer => {
					writer.insertElement( 'paragraph', modelRoot, 0 );
					writer.insertText( 'Foobar', modelRoot.getChild( 0 ), 0 );

					writer.setSelection( modelRoot.getChild( 0 ), 3 );
				} );
			} );
	} );

	afterEach( () => {
		element.remove();
		return editor.destroy();
	} );

	after( () => {
		env.isAndroid = oldEnvIsAndroid;
	} );

	it( 'should re-set selection on keyup event if it was changed after deletion but before the input was fired', () => {
		// This test covers a quirk on Android. We will recreate what browser does in this scenario.
		// The test is not perfect because there are difficulties converting model selection to DOM in unit tests.
		const view = editor.editing.view;
		const viewDocument = view.document;

		const domEvt = {
			preventDefault: sinon.spy()
		};

		const domRoot = view.getDomRoot();
		const domSelection = window.getSelection();
		const domText = domRoot.childNodes[ 0 ].childNodes[ 0 ];

		// Change the selection ("manual conversion").
		// Because it all works quite bad the selection will be moved to quite a random place after delete is fired but all we care is
		// checking if the selection is reversed on `keyup` event.
		domSelection.collapse( domText, 3 );

		// On `delete` the selection is saved.
		viewDocument.fire( 'delete', new DomEventData( viewDocument, domEvt, {
			direction: 'backward',
			unit: 'character',
			sequence: 1,
			domTarget: domRoot
		} ) );

		// Store what was the selection when it was saved in `delete`.
		const anchorNodeBefore = domSelection.anchorNode;
		const anchorOffsetBefore = domSelection.anchorOffset;
		const focusNodeBefore = domSelection.focusNode;
		const focusOffsetBefore = domSelection.focusOffset;

		// Change the selection.
		domSelection.collapse( domText, 0 );

		// On `keyup` it should be reversed.
		viewDocument.fire( 'keyup', new DomEventData( viewDocument, domEvt, {
			domTarget: domRoot
		} ) );

		expect( domSelection.anchorNode ).to.equal( anchorNodeBefore );
		expect( domSelection.anchorOffset ).to.equal( anchorOffsetBefore );
		expect( domSelection.focusNode ).to.equal( focusNodeBefore );
		expect( domSelection.focusOffset ).to.equal( focusOffsetBefore );
	} );

	it( 'should not crash on keyup event if it was not changed after typing', () => {
		// This test covers a quirk on Android. We will recreate what browser does in this scenario.
		const view = editor.editing.view;
		const viewDocument = view.document;

		const domEvt = {
			preventDefault: sinon.spy()
		};

		const domRoot = view.getDomRoot();
		const domEvent = {
			preventDefault: sinon.spy()
		};

		viewDocument.fire( 'input', domEvent );
		viewDocument.fire( 'keydown', new DomEventData( viewDocument, domEvent, { keyCode: getCode( 'A' ) } ) );

		expect( () => {
			viewDocument.fire( 'keyup', new DomEventData( viewDocument, domEvt, {
				domTarget: domRoot
			} ) );
		} ).not.to.throw();
	} );
} );

describe( 'Delete feature - undo by pressing backspace', () => {
	let element, editor, viewDocument, plugin;

	const deleteEventEventData = {
		direction: 'backward',
		unit: 'codePoint',
		sequence: 1
	};

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Delete, UndoEditing ] } )
			.then( newEditor => {
				editor = newEditor;
				viewDocument = editor.editing.view.document;
				plugin = newEditor.plugins.get( 'Delete' );
			} );
	} );

	afterEach( () => {
		element.remove();
		return editor.destroy();
	} );

	it( 'executes `undo` once on pressing backspace after requestUndoOnBackspace()', () => {
		const spy = editor.execute = sinon.spy();
		const domEvt = getDomEvent();
		const event = new EventInfo( viewDocument, 'delete' );

		plugin.requestUndoOnBackspace();

		viewDocument.fire( event, new DomEventData( viewDocument, domEvt, deleteEventEventData ) );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.calledWithMatch( 'undo' ) ).to.be.true;

		expect( event.stop.called ).to.be.true;
		expect( domEvt.preventDefault.calledOnce ).to.be.true;

		viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), deleteEventEventData ) );

		expect( spy.calledTwice ).to.be.true;
		expect( spy.calledWithMatch( 'delete', {} ) ).to.be.true;
	} );

	describe( 'does not execute `undo` instead of deleting', () => {
		const testCases = [
			{
				condition: 'it\'s forward deletion',
				eventData: { direction: 'forward', unit: 'codePoint', sequence: 1 }
			},
			{
				condition: 'the sequence doesn\'t equal 1',
				eventData: { direction: 'backward', unit: 'codePoint', sequence: 2 }
			},
			{
				condition: 'the unit is not `codePoint`',
				eventData: { direction: 'backward', unit: 'word', sequence: 1 }
			}
		];

		testCases.forEach( ( { condition, eventData } ) => {
			it( 'if ' + condition, () => {
				const spy = editor.execute = sinon.spy();

				plugin.requestUndoOnBackspace();

				viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), eventData ) );

				expect( spy.calledOnce ).to.be.true;
				expect( spy.calledWithMatch( 'undo' ) ).to.be.false;
				expect( spy.calledWithMatch( 'delete', {} ) ).to.be.true;
			} );
		} );

		it( 'if requestUndoOnBackspace() hasn\'t been called', () => {
			const spy = editor.execute = sinon.spy();

			viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), deleteEventEventData ) );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.calledWithMatch( 'undo' ) ).to.be.false;
			expect( spy.calledWithMatch( 'delete', {} ) ).to.be.true;
		} );

		it( 'if `UndoEditing` plugin is not loaded', async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, { plugins: [ Delete ] } );
			viewDocument = editor.editing.view.document;
			plugin = editor.plugins.get( 'Delete' );

			const spy = editor.execute = sinon.spy();

			plugin.requestUndoOnBackspace();

			viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
				direction: 'backward',
				unit: 'word',
				sequence: 1
			} ) );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.calledWithMatch( 'undo' ) ).to.be.false;
			expect( spy.calledWithMatch( 'delete', {} ) ).to.be.true;
		} );

		it( 'after model has changed', () => {
			const modelDocument = editor.model.document;
			const spy = editor.execute = sinon.spy();

			plugin.requestUndoOnBackspace();

			modelDocument.fire( 'change', new Batch() );
			viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), deleteEventEventData ) );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.calledWithMatch( 'undo' ) ).to.be.false;
			expect( spy.calledWithMatch( 'delete', {} ) ).to.be.true;
		} );
	} );
} );

function getDomEvent() {
	return {
		preventDefault: sinon.spy()
	};
}
