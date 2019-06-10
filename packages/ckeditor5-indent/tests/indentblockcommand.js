/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import IndentBlockCommand from '../src/indentblockcommand';

describe( 'IndentBlockCommand', () => {
	let editor, command, model, doc, selection;

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				selection = doc.selection;

				model.schema.register( 'paragraph', { inheritAllFrom: '$block', allowAttributes: [ 'indent' ] } );
			} );
	} );

	afterEach( () => {
		command.destroy();

		return editor.destroy();
	} );

	describe( 'indent', () => {
		describe( 'using classes', () => {
			beforeEach( () => {
				command = new IndentBlockCommand( editor, {
					indentBlock: {
						classes: [
							'indent-1',
							'indent-2',
							'indent-3',
							'indent-4'
						]
					}
				} );
			} );

			describe( 'isEnabled' );

			describe( 'execute()' );
		} );

		describe( 'using offset', () => {
			beforeEach( () => {
				command = new IndentBlockCommand( editor, {
					indentBlock: {
						offset: 50,
						unit: 'px'
					}
				} );
			} );

			describe( 'isEnabled' );

			describe( 'execute()' );
		} );
	} );

	describe( 'outdent', () => {
		describe( 'using classes', () => {
			beforeEach( () => {
				command = new IndentBlockCommand( editor, {
					indentBlock: {
						classes: [
							'indent-1',
							'indent-2',
							'indent-3',
							'indent-4'
						]
					}
				} );
			} );

			describe( 'isEnabled' );

			describe( 'execute()' );
		} );

		describe( 'using offset', () => {
			beforeEach( () => {
				command = new IndentBlockCommand( editor, {
					indentBlock: {
						offset: 50,
						unit: 'px'
					}
				} );
			} );

			describe( 'isEnabled' );

			describe( 'execute()' );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'should return true if characters with the attribute can be placed at caret position', () => {
			setData( model, '<paragraph>f[]oo</paragraph>' );
			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		it( 'inserts mention object if mention was passed as string', () => {
			setData( model, '<paragraph>foo @Jo[]bar</paragraph>' );

			command.execute( {
				marker: '@',
				mention: '@John',
				range: model.createRange( selection.focus.getShiftedBy( -3 ), selection.focus )
			} );

			// assertIndentBlock( doc.getRoot().getChild( 0 ).getChild( 1 ), '@John' );
		} );
	} );
} );
