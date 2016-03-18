/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/editor.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import UndoFeature from '/ckeditor5/undo/undofeature.js';

let element, editor, undo, batch, doc, root;

beforeEach( () => {
	element = document.createElement( 'div' );
	document.body.appendChild( element );

	editor = new Editor( element );
	undo = new UndoFeature( editor );
	undo.init();

	doc = editor.document;
	batch = doc.batch();
	root = doc.createRoot( 'root' );
} );

afterEach( () => {
	undo.destroy();
} );

describe( 'UndoFeature', () => {
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

		undo._undoCommand.fire( 'undo', batch );

		expect( undo._redoCommand.addBatch.calledOnce ).to.be.true;
		expect( undo._redoCommand.addBatch.calledWith( batch ) ).to.be.true;
	} );

	it( 'should add a batch to undo command whenever a batch is redone by redo command', () => {
		batch.insert( new Position( root, [ 0 ] ), 'foobar' );

		sinon.spy( undo._undoCommand, 'addBatch' );

		undo._redoCommand.fire( 'undo', batch );

		expect( undo._undoCommand.addBatch.calledOnce ).to.be.true;
		expect( undo._undoCommand.addBatch.calledWith( batch ) ).to.be.true;
	} );

	it( 'should clear redo command stack whenever a new batch is applied to the document', () => {
		sinon.spy( undo._redoCommand, 'clearStack' );

		batch.insert( new Position( root, [ 0 ] ), 'foobar' );

		expect( undo._redoCommand.clearStack.calledOnce ).to.be.true;
	} );

	it( 'should stop listening when destroyed', () => {
		sinon.spy( undo, 'stopListening' );

		undo.destroy();

		expect( undo.stopListening.called ).to.be.true;
	} );
} );
