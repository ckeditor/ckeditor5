/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import CodeBlockEditing from '../src/codeblockediting';
import IndentCodeBlockCommand from '../src/indentcodeblockcommand';

import AlignmentEditing from '@ckeditor/ckeditor5-alignment/src/alignmentediting';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'IndentCodeBlockCommand', () => {
	let editor, model, indentCommand;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ CodeBlockEditing, Paragraph, BlockQuoteEditing, AlignmentEditing, BoldEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				indentCommand = new IndentCodeBlockCommand( editor, 'forward' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( '#isEnabled', () => {
		it( 'should be true when the first selected block is a codeBlock #1', () => {
			setModelData( model, '<codeBlock language="foo">f[]oo</codeBlock>' );

			expect( indentCommand.isEnabled ).to.be.true;
		} );

		it( 'should be true when the first selected block is a codeBlock #2', () => {
			setModelData( model, '<codeBlock language="foo">f[oo</codeBlock><paragraph>ba]r</paragraph>' );

			expect( indentCommand.isEnabled ).to.be.true;
		} );

		it( 'should be false when there is no code block in the selection', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );

			expect( indentCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false when the selection is not anchored in the code block', () => {
			setModelData( model, '<paragraph>f[oo</paragraph><codeBlock language="foo">bar</codeBlock><paragraph>ba]z</paragraph>' );

			expect( indentCommand.isEnabled ).to.be.false;
		} );

		describe( 'config.codeBlock.indentSequence', () => {
			it( 'should disable the command when the config is not set', () => {
				return ModelTestEditor
					.create( {
						plugins: [ CodeBlockEditing, Paragraph, BlockQuoteEditing, AlignmentEditing, BoldEditing ],
						codeBlock: {
							indentSequence: false
						}
					} )
					.then( newEditor => {
						const editor = newEditor;
						const model = editor.model;
						const indentCommand = new IndentCodeBlockCommand( editor, 'forward' );

						setModelData( model, '<codeBlock language="foo">[]foo</codeBlock>' );

						expect( indentCommand.isEnabled ).to.be.false;

						return editor.destroy();
					} );
			} );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should indent when a selection is collapsed in an empty code block', () => {
			setModelData( model, '<codeBlock language="foo">[]</codeBlock>' );

			indentCommand.execute();

			expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">	[]</codeBlock>' );
		} );

		it( 'should indent when a selection is collapsed', () => {
			setModelData( model, '<codeBlock language="foo">f[]oo</codeBlock>' );

			indentCommand.execute();

			expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">f	[]oo</codeBlock>' );
		} );

		it( 'should indent a whole line when a selection is expanded', () => {
			setModelData( model, '<codeBlock language="foo">f[o]o</codeBlock>' );

			indentCommand.execute();

			expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">	f[o]o</codeBlock>' );
		} );

		it( 'should indent multiple lines when a selection is expanded', () => {
			setModelData( model, '<codeBlock language="foo">f[oo<softBreak></softBreak>b]ar</codeBlock>' );

			indentCommand.execute();

			expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">	f[oo<softBreak></softBreak>	b]ar</codeBlock>' );
		} );

		it( 'should append the indentation to the line\'s leading white spaces (#1)', () => {
			setModelData( model, '<codeBlock language="foo">[]foo</codeBlock>' );

			// <codeBlock language="foo">    []foo</codeBlock>
			model.change( writer => {
				writer.insertText( '    ', model.document.getRoot().getChild( 0 ) );
			} );

			indentCommand.execute();

			expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">    	[]foo</codeBlock>' );
		} );

		it( 'should append the indentation to the line\'s leading white spaces (#2)', () => {
			setModelData( model, '<codeBlock language="foo">f[oo<softBreak></softBreak>b]ar</codeBlock>' );

			// <codeBlock language="foo">    f[oo<softBreak></softBreak>    b]ar</codeBlock>
			model.change( writer => {
				writer.insertText( '    ', model.document.getRoot().getChild( 0 ), 4 );
				writer.insertText( '    ', model.document.getRoot().getChild( 0 ), 0 );
			} );

			indentCommand.execute();

			expect( getModelData( model ) ).to.equal(
				'<codeBlock language="foo">    	f[oo<softBreak></softBreak>    	b]ar</codeBlock>' );
		} );

		describe( 'config.codeBlock.indentSequence', () => {
			it( 'should be used when indenting', () => {
				return ModelTestEditor
					.create( {
						plugins: [ CodeBlockEditing, Paragraph, BlockQuoteEditing, AlignmentEditing, BoldEditing ],
						codeBlock: {
							indentSequence: '  '
						}
					} )
					.then( newEditor => {
						const editor = newEditor;
						const model = editor.model;
						const indentCommand = new IndentCodeBlockCommand( editor, 'forward' );

						setModelData( model, '<codeBlock language="foo">f[o]o</codeBlock>' );

						indentCommand.execute();

						expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">  f[o]o</codeBlock>' );

						return editor.destroy();
					} );
			} );
		} );
	} );
} );
