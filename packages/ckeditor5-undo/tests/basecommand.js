/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import BaseCommand from '../src/basecommand';

describe( 'BaseCommand', () => {
	let editor, doc, base;

	beforeEach( () => {
		editor = new ModelTestEditor();
		base = new BaseCommand( editor );

		doc = editor.document;
	} );

	afterEach( () => {
		base.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create command with empty batch stack', () => {
			expect( base.isEnabled ).to.be.false;
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be false if there are no batches in command stack', () => {
			expect( base.isEnabled ).to.be.false;
		} );

		it( 'should be true if there are batches in command stack', () => {
			base.addBatch( doc.batch() );

			expect( base.isEnabled ).to.be.true;
		} );
	} );

	describe( 'clearStack', () => {
		it( 'should remove all batches from the stack', () => {
			base.addBatch( doc.batch() );
			base.clearStack();

			expect( base.isEnabled ).to.be.false;
		} );
	} );
} );
