/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '/tests/ckeditor5/_utils/modeltesteditor.js';
import BaseCommand from '/ckeditor5/undo/basecommand.js';

let editor, doc, root, base;

beforeEach( () => {
	editor = new ModelTestEditor();
	base = new BaseCommand( editor );

	doc = editor.document;

	root = doc.getRoot();
} );

afterEach( () => {
	base.destroy();
} );

describe( 'BaseCommand', () => {
	describe( 'constructor', () => {
		it( 'should create command with empty batch stack', () => {
			expect( base._checkEnabled() ).to.be.false;
		} );
	} );

	describe( '_checkEnabled', () => {
		it( 'should return false if there are no batches in command stack', () => {
			expect( base._checkEnabled() ).to.be.false;
		} );

		it( 'should return true if there are batches in command stack', () => {
			base.addBatch( doc.batch() );

			expect( base._checkEnabled() ).to.be.true;
		} );
	} );

	describe( 'clearStack', () => {
		it( 'should remove all batches from the stack', () => {
			base.addBatch( doc.batch() );
			base.clearStack();

			expect( base._checkEnabled() ).to.be.false;
		} );
	} );
} );
