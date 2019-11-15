/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import RestrictedDocumentCommand from '../src/restricteddocumentcommand';

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'RestrictedDocumentCommand', () => {
	let editor, command, model;

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new RestrictedDocumentCommand( editor, 'nonRestricted' );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );
				model.schema.register( 'h1', { inheritAllFrom: '$block' } );
				model.schema.register( 'img', {
					allowWhere: [ '$block', '$text' ],
					isObject: true
				} );

				editor.model.schema.extend( '$text', { allowAttributes: [ 'nonRestricted' ] } );
			} );
	} );

	afterEach( () => {
		command.destroy();

		return editor.destroy();
	} );

	describe( 'value', () => {
		it( 'is true when collapsed selection has the attribute', () => {
			model.change( writer => {
				writer.setSelectionAttribute( 'nonRestricted', true );
			} );

			expect( command.value ).to.be.true;
		} );

		it( 'is false when collapsed selection does not have the attribute', () => {
			model.change( writer => {
				writer.setSelectionAttribute( 'nonRestricted', true );
			} );

			model.change( writer => {
				writer.removeSelectionAttribute( 'nonRestricted' );
			} );

			expect( command.value ).to.be.false;
		} );

		it( 'is true when selection is inside text with attribute', () => {
			setData( model, '<p><$text nonRestricted="true">fo[]o</$text></p><h1>bar</h1>' );

			expect( command.value ).to.be.true;
		} );

		it( 'is true when selection is on text with attribute', () => {
			setData( model, '<p>foo[<$text nonRestricted="true">bar</$text>]baz</p>' );

			expect( command.value ).to.be.true;
		} );
	} );

	describe( 'isEnabled', () => {
		beforeEach( () => {
			model.schema.register( 'x', { inheritAllFrom: '$block' } );

			model.schema.addAttributeCheck( ( ctx, attributeName ) => {
				if ( ctx.endsWith( 'x $text' ) && attributeName == 'nonRestricted' ) {
					return false;
				}
			} );
		} );

		describe( 'when selection is collapsed', () => {
			it( 'should return true if attribute is allowed at caret position', () => {
				setData( model, '<p>f[]oo</p>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should return true if attribute is not allowed at caret position', () => {
				setData( model, '<x>fo[]o</x>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'when selection is not collapsed', () => {
			it( 'should return true if there is at least one node in selection that can have the attribute', () => {
				setData( model, '<p>[foo]</p>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should return false if there are no nodes in selection that can have the attribute', () => {
				setData( model, '<x>[foo]</x>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'collapsed selection', () => {
			it( 'should set selection attribute if text without attribute', () => {
				setData( model, '<p>abcfoo[]barbaz</p>' );

				command.execute();

				expect( model.document.selection.hasAttribute( 'nonRestricted' ) ).to.be.true;
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'should do nothing if the command is disabled', () => {
				setData( model, '<p>fo[ob]ar</p>' );

				command.isEnabled = false;

				command.execute();

				expect( getData( model ) ).to.equal( '<p>fo[ob]ar</p>' );
			} );

			it( 'should add attribute on text without attribute', () => {
				setData( model, '<p>foo[bar]baz</p>' );

				command.execute();

				expect( getData( model ) ).to.equal( '<p>foo[<$text nonRestricted="true">bar</$text>]baz</p>' );
			} );

			it( 'should add attribute on selected text if part of selected text have attribute already', () => {
				setData( model, '<p>[foo<$text nonRestricted="true">bar</$text>]baz</p>' );

				command.execute();

				expect( getData( model ) ).to.equal( '<p>[<$text nonRestricted="true">foobar</$text>]baz</p>' );
			} );

			it( 'should remove attribute only from selected part of non-restricted text', () => {
				setData( model, '<p><$text nonRestricted="true">foo[bar]baz</$text></p>' );

				command.execute();

				expect( getData( model ) ).to.equal(
					'<p><$text nonRestricted="true">foo</$text>[bar]<$text nonRestricted="true">baz</$text></p>'
				);
			} );

			it( 'should remove attribute from selected text if all text contains attribute', () => {
				setData( model, '<p>abc[<$text nonRestricted="true">foo]bar</$text>baz</p>' );

				command.execute();

				expect( getData( model ) ).to.equal( '<p>abc[foo]<$text nonRestricted="true">bar</$text>baz</p>' );
			} );
		} );
	} );
} );
