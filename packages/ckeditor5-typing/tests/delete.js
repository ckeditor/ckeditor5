/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
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
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

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

		viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
			direction: 'backward',
			unit: 'character',
			sequence: 5
		} ) );

		expect( spy.calledTwice ).to.be.true;
		expect( spy.calledWithMatch( 'delete', { unit: 'character', sequence: 5 } ) ).to.be.true;
	} );

	it( 'passes options.selection parameter to delete command if selection to remove was specified and unit is "selection"', () => {
		editor.setData( '<p>Foobar</p>' );

		const spy = editor.execute = sinon.spy();
		const view = editor.editing.view;
		const viewDocument = view.document;
		const domEvt = getDomEvent();

		const viewSelection = view.createSelection( view.createRangeIn( viewDocument.getRoot() ) );

		viewDocument.fire( 'delete', new DomEventData( viewDocument, domEvt, {
			direction: 'backward',
			unit: 'selection',
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

	it( 'should preventDefault() the original beforeinput event if not while composing', () => {
		const spy = sinon.spy();

		viewDocument.fire( 'delete', {
			preventDefault: spy,
			direction: 'backward',
			unit: 'character'
		} );

		sinon.assert.calledOnce( spy );
	} );

	it( 'should not preventDefault() the original beforeinput event if while composing', () => {
		const spy = sinon.spy();

		viewDocument.isComposing = true;

		viewDocument.fire( 'delete', {
			preventDefault: spy,
			direction: 'backward',
			unit: 'character'
		} );

		sinon.assert.notCalled( spy );
	} );
} );

describe( 'Delete using the beforeinput event', () => {
	let element, editor, view, viewDocument, executeSpy;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ Delete, Paragraph ],
			initialData: '<p>foo</p>'
		} );

		view = editor.editing.view;
		viewDocument = editor.editing.view.document;

		executeSpy = testUtils.sinon.spy( editor, 'execute' );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	it( 'should scroll the editing view after delete', () => {
		const viewFooText = viewDocument.getRoot().getChild( 0 ).getChild( 0 );
		const scrollSpy = testUtils.sinon.spy( view, 'scrollToTheSelection' );

		viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
			direction: 'backward',
			unit: 'word',
			sequence: 42,
			selectionToRemove: view.createSelection( viewFooText, 2 )
		} ) );

		sinon.assert.calledOnce( scrollSpy );
		sinon.assert.callOrder( executeSpy, scrollSpy );
	} );

	describe( 'for "codePoint" and "character" delete units', () => {
		it( 'should always use the #unit despite #selectionToRemove available next to "codePoint" (non-Android)', () => {
			viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
				direction: 'backward',
				unit: 'codePoint',
				sequence: 3,
				selectionToRemove: view.createSelection( viewDocument.getRoot(), 'in' )
			} ) );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithMatch( executeSpy, 'delete', {
				sequence: 3,
				unit: 'codePoint',
				selection: undefined
			} );
		} );

		it( 'should use the #selectionToRemove for the "codePoint" unit on Android', () => {
			testUtils.sinon.stub( env, 'isAndroid' ).get( () => true );

			viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
				direction: 'backward',
				unit: 'selection',
				sequence: 3,
				selectionToRemove: view.createSelection( viewDocument.getRoot(), 'in' )
			} ) );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithMatch( executeSpy, 'delete', {
				sequence: 3,
				selection: sinon.match.object
			} );
		} );

		it( 'should always use the #unit despite #selectionToRemove available next to "character" (non-Android)', () => {
			viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
				direction: 'forward',
				unit: 'character',
				sequence: 5,
				selectionToRemove: view.createSelection( viewDocument.getRoot(), 'in' )
			} ) );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithMatch( executeSpy, 'deleteForward', {
				sequence: 5,
				unit: 'character',
				selection: undefined
			} );
		} );

		it( 'should always use the #unit despite #selectionToRemove available next to "character" (Android)', () => {
			testUtils.sinon.stub( env, 'isAndroid' ).get( () => true );

			viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
				direction: 'forward',
				unit: 'character',
				sequence: 5,
				selectionToRemove: view.createSelection( viewDocument.getRoot(), 'in' )
			} ) );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithMatch( executeSpy, 'deleteForward', {
				sequence: 5,
				unit: 'character',
				selection: undefined
			} );
		} );
	} );

	describe( 'for other input types', () => {
		it.skip( 'should always use the #selectionToRemove passed from the DeleteObserver', () => {
			const modelParagraph = editor.model.document.getRoot().getChild( 0 );

			// <paragraph>fo[]o</paragraph>
			const expectedFirstCallDeleteRange = editor.model.createRange(
				editor.model.createPositionAt( modelParagraph, 2 ),
				editor.model.createPositionAt( modelParagraph, 2 )
			);

			// <paragraph>f[]o</paragraph>
			const expectedSecondCallDeleteRange = editor.model.createRange(
				editor.model.createPositionAt( modelParagraph, 1 ),
				editor.model.createPositionAt( modelParagraph, 1 )
			);

			// <paragraph>f[]</paragraph>
			const expectedThirdCallDeleteRange = editor.model.createRange(
				editor.model.createPositionAt( modelParagraph, 1 ),
				editor.model.createPositionAt( modelParagraph, 1 )
			);

			viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
				direction: 'backward',
				unit: 'word',
				sequence: 1,
				selectionToRemove: view.createSelection( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 2 )
			} ) );

			viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
				direction: 'forward',
				unit: 'selection',
				sequence: 1,
				selectionToRemove: view.createSelection( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 1 )
			} ) );

			viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
				direction: 'forward',
				sequence: 1,
				selectionToRemove: view.createSelection( viewDocument.getRoot().getChild( 0 ).getChild( 0 ), 0 )
			} ) );

			sinon.assert.calledThrice( executeSpy );
			sinon.assert.calledWithMatch( executeSpy.firstCall, 'delete', {
				sequence: 1,
				unit: 'selection',
				selection: sinon.match.object
			} );

			sinon.assert.calledWithMatch( executeSpy.secondCall, 'deleteForward', {
				sequence: 1,
				unit: 'selection',
				selection: sinon.match.object
			} );

			sinon.assert.calledWithMatch( executeSpy.thirdCall, 'deleteForward', {
				sequence: 1,
				unit: 'selection',
				selection: sinon.match.object
			} );

			const firstCallModelRange = executeSpy.firstCall.args[ 1 ].selection.getFirstRange();
			const secondCallModelRange = executeSpy.secondCall.args[ 1 ].selection.getFirstRange();
			const thirdCallModelRange = executeSpy.secondCall.args[ 1 ].selection.getFirstRange();

			expect( firstCallModelRange.isEqual( expectedFirstCallDeleteRange ) ).to.be.true;
			expect( secondCallModelRange.isEqual( expectedSecondCallDeleteRange ) ).to.be.true;
			expect( thirdCallModelRange.isEqual( expectedThirdCallDeleteRange ) ).to.be.true;
		} );

		it( 'should respect the #direction passed from the DeleteObserver observer', () => {
			const viewFooText = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

			viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
				direction: 'forward',
				selectionToRemove: view.createSelection( viewFooText, 2 )
			} ) );

			viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
				direction: 'backward',
				selectionToRemove: view.createSelection( viewFooText, 2 )
			} ) );

			sinon.assert.calledTwice( executeSpy );
			sinon.assert.calledWith( executeSpy.firstCall, 'deleteForward' );
			sinon.assert.calledWith( executeSpy.secondCall, 'delete' );
		} );

		it( 'should respect the #sequence passed from the DeleteObserver observer', () => {
			const viewFooText = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

			viewDocument.fire( 'delete', new DomEventData( viewDocument, getDomEvent(), {
				direction: 'backward',
				unit: 'word',
				sequence: 42,
				selectionToRemove: view.createSelection( viewFooText, 2 )
			} ) );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithMatch( executeSpy, 'delete', {
				sequence: 42
			} );
		} );
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
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

				eventData.selectionToRemove = viewDocument.selection;

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
				sequence: 1,
				selectionToRemove: viewDocument.selection
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
