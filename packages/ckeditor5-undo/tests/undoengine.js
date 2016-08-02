/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '/tests/core/_utils/modeltesteditor.js';
import Position from '/ckeditor5/engine/model/position.js';
import UndoEngine from '/ckeditor5/undo/undoengine.js';

let editor, undo, batch, doc, root;

beforeEach( () => {
	editor = new ModelTestEditor();

	doc = editor.document;
	batch = doc.batch();
	root = doc.getRoot();

	undo = new UndoEngine( editor );
	undo.init();
} );

afterEach( () => {
	undo.destroy();
} );

describe( 'UndoEngine', () => {
	it( 'should register undo command and redo command', () => {
		expect( editor.commands.get( 'undo' ) ).to.equal( undo._undoCommand );
		expect( editor.commands.get( 'redo' ) ).to.equal( undo._redoCommand );
	} );

	it( 'should add a batch to undo command and clear redo stack, if it\'s type is "default"', () => {
		sinon.spy( undo._undoCommand, 'addBatch' );
		sinon.spy( undo._redoCommand, 'clearStack' );

		expect( undo._undoCommand.addBatch.called ).to.be.false;
		expect( undo._redoCommand.clearStack.called ).to.be.false;

		batch.insert( new Position( root, [ 0 ] ), 'foobar' );

		expect( undo._undoCommand.addBatch.calledOnce ).to.be.true;
		expect( undo._redoCommand.clearStack.calledOnce ).to.be.true;
	} );

	it( 'should add each batch only once', () => {
		sinon.spy( undo._undoCommand, 'addBatch' );

		batch.insert( new Position( root, [ 0 ] ), 'foobar' ).insert( new Position( root, [ 0 ] ), 'foobar' );

		expect( undo._undoCommand.addBatch.calledOnce ).to.be.true;
	} );

	it( 'should add a batch to undo command, if it\'s type is undo and it comes from redo command', () => {
		sinon.spy( undo._undoCommand, 'addBatch' );
		sinon.spy( undo._redoCommand, 'clearStack' );

		undo._redoCommand._createdBatches.add( batch );

		batch.insert( new Position( root, [ 0 ] ), 'foobar' );

		expect( undo._undoCommand.addBatch.calledOnce ).to.be.true;
		expect( undo._redoCommand.clearStack.called ).to.be.false;
	} );

	it( 'should add a batch to redo command, if it\'s type is undo', () => {
		sinon.spy( undo._redoCommand, 'addBatch' );
		sinon.spy( undo._redoCommand, 'clearStack' );

		undo._undoCommand._createdBatches.add( batch );

		batch.insert( new Position( root, [ 0 ] ), 'foobar' );

		expect( undo._redoCommand.addBatch.calledOnce ).to.be.true;
		expect( undo._redoCommand.clearStack.called ).to.be.false;
	} );
} );
