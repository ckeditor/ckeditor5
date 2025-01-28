/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import BaseCommand from '../src/basecommand.js';

describe( 'BaseCommand', () => {
	let editor, base;

	beforeEach( () => {
		editor = new ModelTestEditor();
		base = new BaseCommand( editor );
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
			base.addBatch( editor.model.createBatch() );

			expect( base.isEnabled ).to.be.true;
		} );
	} );

	describe( 'clearStack', () => {
		it( 'should remove all batches from the stack', () => {
			base.addBatch( editor.model.createBatch() );
			base.clearStack();

			expect( base.isEnabled ).to.be.false;
		} );
	} );
} );
