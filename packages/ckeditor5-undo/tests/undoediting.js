/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';

import UndoEditing from '../src/undoediting.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';

describe( 'UndoEditing', () => {
	let editor, undo, model, root;

	beforeEach( () => {
		editor = new ModelTestEditor();

		model = editor.model;
		root = model.document.getRoot();

		undo = new UndoEditing( editor );
		undo.init();
	} );

	afterEach( () => {
		undo.destroy();
	} );

	it( 'should have a name', () => {
		expect( UndoEditing.pluginName ).to.equal( 'UndoEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( UndoEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( UndoEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
			label: 'Undo',
			keystroke: 'CTRL+Z'
		} );

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
			label: 'Redo',
			keystroke: [ [ 'CTRL+Y' ], [ 'CTRL+SHIFT+Z' ] ]
		} );
	} );

	it( 'should register undo command and redo command', () => {
		expect( editor.commands.get( 'undo' ) ).to.equal( undo._undoCommand );
		expect( editor.commands.get( 'redo' ) ).to.equal( undo._redoCommand );
	} );

	it( 'should add a batch to undo command and clear redo stack, if it\'s type is "default"', () => {
		sinon.spy( undo._undoCommand, 'addBatch' );
		sinon.spy( undo._redoCommand, 'clearStack' );

		expect( undo._undoCommand.addBatch.called ).to.be.false;
		expect( undo._redoCommand.clearStack.called ).to.be.false;

		model.change( writer => {
			writer.insertText( 'foobar', root );
		} );

		expect( undo._undoCommand.addBatch.calledOnce ).to.be.true;
		expect( undo._redoCommand.clearStack.calledOnce ).to.be.true;
	} );

	it( 'should add each batch only once', () => {
		sinon.spy( undo._undoCommand, 'addBatch' );

		model.change( writer => {
			writer.insertText( 'foobar', root );
			writer.insertText( 'foobar', root );
		} );

		expect( undo._undoCommand.addBatch.calledOnce ).to.be.true;
	} );

	it( 'should add a batch to undo command, if it\'s type is undo and it comes from redo command', () => {
		sinon.spy( undo._undoCommand, 'addBatch' );
		sinon.spy( undo._redoCommand, 'clearStack' );

		const batch = model.createBatch();

		undo._redoCommand._createdBatches.add( batch );

		model.enqueueChange( batch, writer => {
			writer.insertText( 'foobar', root );
		} );

		expect( undo._undoCommand.addBatch.calledOnce ).to.be.true;
		expect( undo._redoCommand.clearStack.called ).to.be.false;
	} );

	it( 'should add a batch to redo command on undo revert event', () => {
		sinon.spy( undo._redoCommand, 'addBatch' );
		sinon.spy( undo._redoCommand, 'clearStack' );

		undo._undoCommand.fire( 'revert', null, model.createBatch() );

		expect( undo._redoCommand.addBatch.calledOnce ).to.be.true;
		expect( undo._redoCommand.clearStack.called ).to.be.false;
	} );

	it( 'should add redo batch to undo', () => {
		sinon.spy( undo._undoCommand, 'addBatch' );

		model.change( writer => {
			writer.insertText( 'foobar', root );
		} );

		model.change( writer => {
			writer.insertText( 'baz', root );
		} );

		editor.execute( 'undo' );
		editor.execute( 'undo' );

		editor.execute( 'redo' );
		sinon.assert.calledThrice( undo._undoCommand.addBatch );

		editor.execute( 'redo' );
		sinon.assert.callCount( undo._undoCommand.addBatch, 4 );
	} );

	it( 'should not add a batch that has only non-document operations', () => {
		sinon.spy( undo._undoCommand, 'addBatch' );

		model.change( writer => {
			const docFrag = writer.createDocumentFragment();
			const element = writer.createElement( 'paragraph' );
			writer.insert( element, docFrag, 0 );
			writer.insertText( 'foo', null, element, 0 );
		} );

		expect( undo._undoCommand.addBatch.called ).to.be.false;
	} );

	it( 'should not add a transparent batch', () => {
		sinon.spy( undo._undoCommand, 'addBatch' );

		model.enqueueChange( { isUndoable: false }, writer => {
			writer.insertText( 'foobar', root );
		} );

		expect( undo._undoCommand.addBatch.called ).to.be.false;
	} );

	it( 'should add a batch that has both document and non-document operations', () => {
		sinon.spy( undo._undoCommand, 'addBatch' );

		model.change( writer => {
			const element = writer.createElement( 'paragraph' );
			writer.insertText( 'foo', null, element, 0 );
			writer.insert( element, root, 0 );
		} );

		expect( undo._undoCommand.addBatch.calledOnce ).to.be.true;
	} );

	it( 'should set CTRL+Z keystroke', () => {
		const spy = sinon.stub( editor, 'execute' );

		const wasHandled = editor.keystrokes.press( {
			keyCode: keyCodes.z,
			ctrlKey: !env.isMac,
			metaKey: env.isMac,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );

		expect( wasHandled ).to.be.true;
		expect( spy.calledWithExactly( 'undo' ) ).to.be.true;
	} );

	it( 'should set CTRL+Y keystroke', () => {
		const spy = sinon.stub( editor, 'execute' );

		const wasHandled = editor.keystrokes.press( {
			keyCode: keyCodes.y,
			ctrlKey: !env.isMac,
			metaKey: env.isMac,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		} );

		expect( wasHandled ).to.be.true;
		expect( spy.calledWithExactly( 'redo' ) ).to.be.true;
	} );

	it( 'should set CTRL+SHIFT+Z keystroke', () => {
		const spy = sinon.stub( editor, 'execute' );
		const keyEventData = {
			keyCode: keyCodes.z,
			ctrlKey: !env.isMac,
			metaKey: env.isMac,
			shiftKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};

		const wasHandled = editor.keystrokes.press( keyEventData );

		expect( wasHandled ).to.be.true;
		expect( spy.calledWithExactly( 'redo' ) ).to.be.true;
		expect( keyEventData.preventDefault.calledOnce ).to.be.true;
	} );
} );
