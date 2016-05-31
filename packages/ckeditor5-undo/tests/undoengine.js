/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ModelTestEditor from '/tests/ckeditor5/_utils/modeltesteditor.js';
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

	it( 'should add a batch to undo command whenever a new batch is applied to the document', () => {
		sinon.spy( undo._undoCommand, 'addBatch' );

		expect( undo._undoCommand.addBatch.called ).to.be.false;

		batch.insert( new Position( root, [ 0 ] ), 'foobar' );

		expect( undo._undoCommand.addBatch.calledOnce ).to.be.true;

		batch.insert( new Position( root, [ 0 ] ), 'foobar' );

		expect( undo._undoCommand.addBatch.calledOnce ).to.be.true;
	} );

	it( 'should add a batch to redo command whenever a batch is undone by undo command', () => {
		batch.insert( new Position( root, [ 0 ] ), 'foobar' );

		sinon.spy( undo._redoCommand, 'addBatch' );

		undo._undoCommand.fire( 'revert', batch );

		expect( undo._redoCommand.addBatch.calledOnce ).to.be.true;
		expect( undo._redoCommand.addBatch.calledWith( batch ) ).to.be.true;
	} );

	it( 'should add a batch to undo command whenever a batch is redone by redo command', () => {
		batch.insert( new Position( root, [ 0 ] ), 'foobar' );

		sinon.spy( undo._undoCommand, 'addBatch' );

		undo._redoCommand.fire( 'revert', batch );

		expect( undo._undoCommand.addBatch.calledOnce ).to.be.true;
		expect( undo._undoCommand.addBatch.calledWith( batch ) ).to.be.true;
	} );

	it( 'should clear redo command stack whenever a new batch is applied to the document', () => {
		sinon.spy( undo._redoCommand, 'clearStack' );

		batch.insert( new Position( root, [ 0 ] ), 'foobar' );

		expect( undo._redoCommand.clearStack.calledOnce ).to.be.true;
	} );
} );
