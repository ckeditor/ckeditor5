/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import RestrictedEditingExceptionCommand from '../src/restrictededitingexceptioncommand.js';

describe( 'RestrictedEditingExceptionCommand', () => {
	let editor, command, model;

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new RestrictedEditingExceptionCommand( editor );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );
				model.schema.register( 'h1', { inheritAllFrom: '$block' } );
				model.schema.register( 'img', {
					allowWhere: [ '$block', '$text' ],
					isObject: true
				} );

				editor.model.schema.extend( '$text', { allowAttributes: [ 'restrictedEditingException' ] } );
			} );
	} );

	afterEach( () => {
		command.destroy();

		return editor.destroy();
	} );

	describe( 'value', () => {
		it( 'is true when collapsed selection has the attribute', () => {
			model.change( writer => {
				writer.setSelectionAttribute( 'restrictedEditingException', true );
			} );

			expect( command.value ).to.be.true;
		} );

		it( 'is false when collapsed selection does not have the attribute', () => {
			model.change( writer => {
				writer.setSelectionAttribute( 'restrictedEditingException', true );
			} );

			model.change( writer => {
				writer.removeSelectionAttribute( 'restrictedEditingException' );
			} );

			expect( command.value ).to.be.false;
		} );

		it( 'is true when the selection is inside a text with the attribute', () => {
			setData( model, '<p><$text restrictedEditingException="true">fo[]o</$text></p><h1>bar</h1>' );

			expect( command.value ).to.be.true;
		} );

		it( 'is true when the selection is on a text with the attribute', () => {
			setData( model, '<p>foo[<$text restrictedEditingException="true">bar</$text>]baz</p>' );

			expect( command.value ).to.be.true;
		} );
	} );

	describe( 'isEnabled', () => {
		beforeEach( () => {
			model.schema.register( 'x', { inheritAllFrom: '$block' } );

			model.schema.addAttributeCheck( ( ctx, attributeName ) => {
				if ( ctx.endsWith( 'x $text' ) && attributeName == 'restrictedEditingException' ) {
					return false;
				}
			} );
		} );

		describe( 'when the selection is collapsed', () => {
			it( 'should return true if the attribute is allowed at the caret position', () => {
				setData( model, '<p>f[]oo</p>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should return true if the attribute is not allowed at the caret position', () => {
				setData( model, '<x>fo[]o</x>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'when the selection is not collapsed', () => {
			it( 'should return true if there is at least one node in the selection that can have the attribute', () => {
				setData( model, '<p>[foo]</p>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should return false if there are no nodes in the selection that can have the attribute', () => {
				setData( model, '<x>[foo]</x>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'collapsed selection', () => {
			it( 'should set the selection attribute if there is a text without the attribute', () => {
				setData( model, '<p>abcfoo[]barbaz</p>' );

				command.execute();

				expect( model.document.selection.hasAttribute( 'restrictedEditingException' ) ).to.be.true;
			} );

			it( 'should not set the selection attribute if there is a text without the attribute (forceValue="false")', () => {
				setData( model, '<p>abcfoo[]barbaz</p>' );

				command.execute( { forceValue: false } );

				expect( model.document.selection.hasAttribute( 'restrictedEditingException' ) ).to.be.false;
			} );

			it( 'should not change the selection attribute if selection has the attribute already (forceValue="true")', () => {
				setData( model, '<p>abcfoo[]barbaz</p>' );
				model.change( writer => {
					writer.setSelectionAttribute( 'restrictedEditingException', true );
				} );

				command.execute( { forceValue: true } );

				expect( model.document.selection.hasAttribute( 'restrictedEditingException' ) ).to.be.true;
			} );

			it( 'should remove an attribute from text node if a text has the non-restricted attribute', () => {
				setData( model, '<p>abc<$text restrictedEditingException="true">foo[]bar</$text>baz</p>' );

				command.execute();

				expect( model.document.selection.hasAttribute( 'restrictedEditingException' ) ).to.be.false;
				expect( getData( model ) ).to.equal( '<p>abcfoo[]barbaz</p>' );
			} );

			it( 'should remove attribute from text node if a text has the non-restricted attribute (forceValue="false")', () => {
				setData( model, '<p>abc<$text restrictedEditingException="true">foo[]bar</$text>baz</p>' );

				command.execute( { forceValue: false } );

				expect( model.document.selection.hasAttribute( 'restrictedEditingException' ) ).to.be.false;
				expect( getData( model ) ).to.equal( '<p>abcfoo[]barbaz</p>' );
			} );

			it( 'should not remove attribute from text node if a text has the non-restricted attribute (forceValue="true")', () => {
				setData( model, '<p>abc<$text restrictedEditingException="true">foo[]bar</$text>baz</p>' );

				command.execute( { forceValue: true } );

				expect( model.document.selection.hasAttribute( 'restrictedEditingException' ) ).to.be.true;
				expect( getData( model ) ).to.equal( '<p>abc<$text restrictedEditingException="true">foo[]bar</$text>baz</p>' );
			} );

			it( 'should not remove exception when selection is at the beginning of restricted text', () => {
				setData( model, '<p>abc<$text restrictedEditingException="true">[]foobar</$text>baz</p>' );

				command.execute();

				expect( model.document.selection.hasAttribute( 'restrictedEditingException' ) ).to.be.true;
				expect( getData( model ) ).to.equal( '<p>abc<$text restrictedEditingException="true">[]foobar</$text>baz</p>' );
			} );

			it( 'should remove attribute from text nodes when other attributes are present', () => {
				setData( model,
					'<p>' +
					'<$text bold="true">abc</$text>' +
					'<$text bold="true" restrictedEditingException="true">foo[]</$text>' +
					'<$text restrictedEditingException="true">bar</$text>' +
					'baz' +
					'</p>'
				);

				command.execute();

				expect( model.document.selection.hasAttribute( 'restrictedEditingException' ) ).to.be.false;
				expect( getData( model ) ).to.equal( '<p><$text bold="true">abcfoo[]</$text>barbaz</p>' );
			} );

			it( 'should remove selection attribute if selection does not have it (selection at the beginning)', () => {
				setData( model, '<p>abc<$text restrictedEditingException="true">[]foobar</$text>baz</p>' );

				model.change( writer => {
					writer.setSelectionAttribute( 'restrictedEditingException', 'true' );
				} );

				command.execute();

				expect( model.document.selection.hasAttribute( 'restrictedEditingException' ) ).to.be.false;
				expect( getData( model ) ).to.equal( '<p>abc[]<$text restrictedEditingException="true">foobar</$text>baz</p>' );
			} );

			it( 'should not remove exception when selection is at the end of restricted text', () => {
				setData( model, '<p>abc<$text restrictedEditingException="true">foobar[]</$text>baz</p>' );

				command.execute();

				expect( model.document.selection.hasAttribute( 'restrictedEditingException' ) ).to.be.false;
				expect( getData( model ) ).to.equal( '<p>abc<$text restrictedEditingException="true">foobar</$text>[]baz</p>' );
			} );

			it( 'should set selection attribute if selection does not have it (selection at the end)', () => {
				setData( model, '<p>abc<$text restrictedEditingException="true">foobar[]</$text>baz</p>' );

				model.change( writer => {
					writer.removeSelectionAttribute( 'restrictedEditingException' );
				} );

				command.execute();

				expect( model.document.selection.hasAttribute( 'restrictedEditingException' ) ).to.be.true;
				expect( getData( model ) ).to.equal( '<p>abc<$text restrictedEditingException="true">foobar[]</$text>baz</p>' );
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'should do nothing if the command is disabled', () => {
				setData( model, '<p>fo[ob]ar</p>' );

				command.isEnabled = false;

				command.execute();

				expect( getData( model ) ).to.equal( '<p>fo[ob]ar</p>' );
			} );

			it( 'should add the attribute on a text without the attribute', () => {
				setData( model, '<p>foo[bar]baz</p>' );

				command.execute();

				expect( getData( model ) ).to.equal( '<p>foo[<$text restrictedEditingException="true">bar</$text>]baz</p>' );
			} );

			it( 'should add the attribute on a selected text if a selected part already has the attribute', () => {
				setData( model, '<p>[foo<$text restrictedEditingException="true">bar</$text>]baz</p>' );

				command.execute();

				expect( getData( model ) ).to.equal( '<p>[<$text restrictedEditingException="true">foobar</$text>]baz</p>' );
			} );

			it( 'should remove the attribute only from the selected part of a non-restricted text', () => {
				setData( model, '<p><$text restrictedEditingException="true">foo[bar]baz</$text></p>' );

				command.execute();

				expect( getData( model ) ).to.equal(
					'<p><$text restrictedEditingException="true">foo</$text>[bar]<$text restrictedEditingException="true">baz</$text></p>'
				);
			} );

			it( 'should remove the attribute from the selected text if all text contains the attribute', () => {
				setData( model, '<p>abc[<$text restrictedEditingException="true">foo]bar</$text>baz</p>' );

				command.execute();

				expect( getData( model ) ).to.equal( '<p>abc[foo]<$text restrictedEditingException="true">bar</$text>baz</p>' );
			} );

			it( 'should add the attribute on a selected text if the "forceValue" parameter was true', () => {
				setData( model, '<p>abc<$text restrictedEditingException="true">foob[ar</$text>x]yz</p>' );

				expect( command.value ).to.be.true;

				command.execute( { forceValue: true } );

				expect( command.value ).to.be.true;
				expect( getData( model ) ).to.equal( '<p>abc<$text restrictedEditingException="true">foob[arx</$text>]yz</p>' );
			} );

			it( 'should remove the attribute on selected nodes if the "forceValue" parameter was set false', () => {
				setData( model, '<p>a[bc<$text restrictedEditingException="true">fo]obar</$text>xyz</p>' );

				command.execute( { forceValue: false } );

				expect( command.value ).to.be.false;
				expect( getData( model ) ).to.equal( '<p>a[bcfo]<$text restrictedEditingException="true">obar</$text>xyz</p>' );
			} );
		} );
	} );
} );
