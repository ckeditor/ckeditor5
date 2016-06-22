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

	it( 'should add a batch to undo command and clear redo stack, if it\'s type is different than "undo" and "redo"', () => {
		sinon.spy( undo._undoCommand, 'addBatch' );
		sinon.spy( undo._redoCommand, 'clearStack' );

		expect( undo._undoCommand.addBatch.called ).to.be.false;
		expect( undo._redoCommand.clearStack.called ).to.be.false;

		batch.insert( new Position( root, [ 0 ] ), 'foobar' );

		expect( undo._undoCommand.addBatch.calledOnce ).to.be.true;
		expect( undo._redoCommand.clearStack.calledOnce ).to.be.true;
	} );

	it( 'should add a batch to undo command, if it\'s type is redo and not clear redo stack', () => {
		sinon.spy( undo._undoCommand, 'addBatch' );
		sinon.spy( undo._redoCommand, 'clearStack' );

		batch.type = 'redo';

		expect( undo._undoCommand.addBatch.called ).to.be.false;
		expect( undo._redoCommand.clearStack.called ).to.be.false;

		batch.insert( new Position( root, [ 0 ] ), 'foobar' );

		expect( undo._undoCommand.addBatch.calledOnce ).to.be.true;
		expect( undo._redoCommand.clearStack.calledOnce ).to.be.false;
	} );

	it( 'should add a batch to redo command, if it\'s type is undo', () => {
		batch.type = 'undo';

		sinon.spy( undo._redoCommand, 'addBatch' );

		batch.insert( new Position( root, [ 0 ] ), 'foobar' );

		expect( undo._redoCommand.addBatch.calledOnce ).to.be.true;
		expect( undo._redoCommand.addBatch.calledWith( batch ) ).to.be.true;
	} );
} );
