/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import MentionCommand from '../src/mentioncommand';

describe( 'MentionCommand', () => {
	let editor, command, model, doc, selection;

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				selection = doc.selection;

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.register( 'x', { inheritAllFrom: '$block' } );
				model.schema.extend( '$text', { allowAttributes: [ 'mention' ] } );

				command = new MentionCommand( editor );
			} );
	} );

	afterEach( () => {
		command.destroy();

		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should return true if characters with the attribute can be placed at caret position', () => {
			setData( model, '<paragraph>f[]oo</paragraph>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should return false if characters with the attribute cannot be placed at caret position', () => {
			model.schema.addAttributeCheck( ( ctx, attributeName ) => {
				// Allow 'bold' on p>$text.
				if ( ctx.endsWith( 'x $text' ) && attributeName == 'mention' ) {
					return false;
				}
			} );

			setData( model, '<x>fo[]o</x>' );
			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'inserts mention attribute for given range', () => {
			setData( model, '<paragraph>foo @Jo[]bar</paragraph>' );

			command.execute( {
				mention: { name: 'John' },
				range: model.createRange( selection.focus.getShiftedBy( -3 ), selection.focus )
			} );

			expect( getData( model ) ).to.equal( '<paragraph>foo <$text mention="{"name":"John"}">@John</$text> []bar</paragraph>' );
		} );

		it( 'inserts mention object if mention was passed as string', () => {
			setData( model, '<paragraph>foo @Jo[]bar</paragraph>' );

			command.execute( {
				mention: 'John',
				range: model.createRange( selection.focus.getShiftedBy( -3 ), selection.focus )
			} );

			expect( getData( model ) ).to.equal( '<paragraph>foo <$text mention="{"name":"John"}">@John</$text> []bar</paragraph>' );
		} );

		it( 'inserts mention attribute with passed marker for given range', () => {
			setData( model, '<paragraph>foo @Jo[]bar</paragraph>' );

			const end = model.createPositionAt( selection.focus );
			const start = end.getShiftedBy( -3 );

			command.execute( {
				mention: { name: 'John' },
				range: model.createRange( start, end ),
				marker: '#'
			} );

			expect( getData( model ) ).to.equal( '<paragraph>foo <$text mention="{"name":"John"}">#John</$text> []bar</paragraph>' );
		} );

		it( 'inserts mention attribute at current selection if no range was passed', () => {
			setData( model, '<paragraph>foo []bar</paragraph>' );

			command.execute( {
				mention: { name: 'John' }
			} );

			expect( getData( model ) ).to.equal( '<paragraph>foo <$text mention="{"name":"John"}">@John</$text> []bar</paragraph>' );
		} );

		it( 'should set also other styles in inserted text', () => {
			model.schema.extend( '$text', { allowAttributes: [ 'bold' ] } );

			setData( model, '<paragraph><$text bold="true">foo@John[]bar</$text></paragraph>' );

			command.execute( {
				mention: { name: 'John' },
				range: model.createRange( selection.focus.getShiftedBy( -5 ), selection.focus )
			} );

			expect( getData( model ) ).to.equal(
				'<paragraph>' +
					'<$text bold="true">foo</$text>' +
					'<$text bold="true" mention="{"name":"John"}">@John</$text>' +
					'<$text bold="true"> []bar</$text>' +
				'</paragraph>'
			);
		} );
	} );
} );
