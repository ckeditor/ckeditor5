/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';

import { UndoEditing } from '../src/undoediting.js';
import { env, keyCodes } from '@ckeditor/ckeditor5-utils';

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
		const addBatchSpy = vi.spyOn( undo._undoCommand, 'addBatch' );
		const clearStackSpy = vi.spyOn( undo._redoCommand, 'clearStack' );

		expect( addBatchSpy ).not.toHaveBeenCalled();
		expect( clearStackSpy ).not.toHaveBeenCalled();

		model.change( writer => {
			writer.insertText( 'foobar', root );
		} );

		expect( addBatchSpy ).toHaveBeenCalledTimes( 1 );
		expect( clearStackSpy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should add each batch only once', () => {
		const addBatchSpy = vi.spyOn( undo._undoCommand, 'addBatch' );

		model.change( writer => {
			writer.insertText( 'foobar', root );
			writer.insertText( 'foobar', root );
		} );

		expect( addBatchSpy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should add a batch to undo command, if it\'s type is undo and it comes from redo command', () => {
		const addBatchSpy = vi.spyOn( undo._undoCommand, 'addBatch' );
		const clearStackSpy = vi.spyOn( undo._redoCommand, 'clearStack' );

		const batch = model.createBatch();

		undo._redoCommand._createdBatches.add( batch );

		model.enqueueChange( batch, writer => {
			writer.insertText( 'foobar', root );
		} );

		expect( addBatchSpy ).toHaveBeenCalledTimes( 1 );
		expect( clearStackSpy ).not.toHaveBeenCalled();
	} );

	it( 'should add a batch to redo command on undo revert event', () => {
		const addBatchSpy = vi.spyOn( undo._redoCommand, 'addBatch' );
		const clearStackSpy = vi.spyOn( undo._redoCommand, 'clearStack' );

		undo._undoCommand.fire( 'revert', null, model.createBatch() );

		expect( addBatchSpy ).toHaveBeenCalledTimes( 1 );
		expect( clearStackSpy ).not.toHaveBeenCalled();
	} );

	it( 'should add redo batch to undo', () => {
		const addBatchSpy = vi.spyOn( undo._undoCommand, 'addBatch' );

		model.change( writer => {
			writer.insertText( 'foobar', root );
		} );

		model.change( writer => {
			writer.insertText( 'baz', root );
		} );

		editor.execute( 'undo' );
		editor.execute( 'undo' );

		editor.execute( 'redo' );
		expect( addBatchSpy ).toHaveBeenCalledTimes( 3 );

		editor.execute( 'redo' );
		expect( addBatchSpy ).toHaveBeenCalledTimes( 4 );
	} );

	it( 'should not add a batch that has only non-document operations', () => {
		const addBatchSpy = vi.spyOn( undo._undoCommand, 'addBatch' );

		model.change( writer => {
			const docFrag = writer.createDocumentFragment();
			const element = writer.createElement( 'paragraph' );
			writer.insert( element, docFrag, 0 );
			writer.insertText( 'foo', null, element, 0 );
		} );

		expect( addBatchSpy ).not.toHaveBeenCalled();
	} );

	it( 'should not add a transparent batch', () => {
		const addBatchSpy = vi.spyOn( undo._undoCommand, 'addBatch' );

		model.enqueueChange( { isUndoable: false }, writer => {
			writer.insertText( 'foobar', root );
		} );

		expect( addBatchSpy ).not.toHaveBeenCalled();
	} );

	it( 'should add a batch that has both document and non-document operations', () => {
		const addBatchSpy = vi.spyOn( undo._undoCommand, 'addBatch' );

		model.change( writer => {
			const element = writer.createElement( 'paragraph' );
			writer.insertText( 'foo', null, element, 0 );
			writer.insert( element, root, 0 );
		} );

		expect( addBatchSpy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should set CTRL+Z keystroke', () => {
		const spy = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );

		const wasHandled = editor.keystrokes.press( {
			keyCode: keyCodes.z,
			ctrlKey: !env.isMac,
			metaKey: env.isMac,
			preventDefault: vi.fn(),
			stopPropagation: vi.fn()
		} );

		expect( wasHandled ).to.be.true;
		expect( spy ).toHaveBeenCalledWith( 'undo' );
	} );

	it( 'should set CTRL+Y keystroke', () => {
		const spy = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );

		const wasHandled = editor.keystrokes.press( {
			keyCode: keyCodes.y,
			ctrlKey: !env.isMac,
			metaKey: env.isMac,
			preventDefault: vi.fn(),
			stopPropagation: vi.fn()
		} );

		expect( wasHandled ).to.be.true;
		expect( spy ).toHaveBeenCalledWith( 'redo' );
	} );

	it( 'should set CTRL+SHIFT+Z keystroke', () => {
		const spy = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
		const keyEventData = {
			keyCode: keyCodes.z,
			ctrlKey: !env.isMac,
			metaKey: env.isMac,
			shiftKey: true,
			preventDefault: vi.fn(),
			stopPropagation: vi.fn()
		};

		const wasHandled = editor.keystrokes.press( keyEventData );

		expect( wasHandled ).to.be.true;
		expect( spy ).toHaveBeenCalledWith( 'redo' );
		expect( keyEventData.preventDefault ).toHaveBeenCalledTimes( 1 );
	} );
} );
