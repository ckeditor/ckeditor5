/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import CodeBlockEditing from '../src/codeblockediting.js';
import IndentCodeBlockCommand from '../src/indentcodeblockcommand.js';

import AlignmentEditing from '@ckeditor/ckeditor5-alignment/src/alignmentediting.js';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'IndentCodeBlockCommand', () => {
	let editor, model, indentCommand;

	testUtils.createSinonSandbox();

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

		describe( 'if an element is present in the code block', () => {
			beforeEach( () => {
				model.schema.register( 'element', {
					allowWhere: '$text'
				} );
			} );

			it( 'should indent when a selection is collapsed before an element', () => {
				setModelData( model, '<codeBlock language="foo">[]<element></element></codeBlock>' );

				indentCommand.execute();

				expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">	[]<element></element></codeBlock>' );
			} );

			it( 'should indent when a selection is collapsed after an element', () => {
				setModelData( model, '<codeBlock language="foo"><element></element>[]</codeBlock>' );

				indentCommand.execute();

				expect( getModelData( model ) ).to.equal( '<codeBlock language="foo"><element></element>	[]</codeBlock>' );
			} );

			it( 'should indent a whole line when a selection is expanded before element', () => {
				setModelData( model, '<codeBlock language="foo">f[o]o<element></element></codeBlock>' );

				indentCommand.execute();

				expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">	f[o]o<element></element></codeBlock>' );
			} );

			it( 'should indent a whole line when a selection is expanded after element', () => {
				setModelData( model, '<codeBlock language="foo"><element></element>f[o]o</codeBlock>' );

				indentCommand.execute();

				expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">	<element></element>f[o]o</codeBlock>' );
			} );

			it( 'should indent a whole line when a selection is expanded including element', () => {
				setModelData( model, '<codeBlock language="foo">f[<element></element>]o</codeBlock>' );

				indentCommand.execute();

				expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">	f[<element></element>]o</codeBlock>' );
			} );

			it( 'should indent multiple lines when a selection is expanded', () => {
				setModelData( model, '<codeBlock language="foo">f[o<element></element>o<softBreak></softBreak>' +
					'b]a<element></element>r</codeBlock>' );

				indentCommand.execute();

				expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">	f[o<element></element>o<softBreak></softBreak>' +
					'	b]a<element></element>r</codeBlock>' );
			} );

			it( 'should append the indentation to the line\'s leading white spaces (#1)', () => {
				setModelData( model, '<codeBlock language="foo">[]foo<element></element></codeBlock>' );

				// <codeBlock language="foo">    []foo<element></element></codeBlock>
				model.change( writer => {
					writer.insertText( '    ', model.document.getRoot().getChild( 0 ) );
				} );

				indentCommand.execute();

				expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">    	[]foo<element></element></codeBlock>' );
			} );

			it( 'should append the indentation to the line\'s leading white spaces (#2)', () => {
				setModelData( model, '<codeBlock language="foo">f[o<element></element>o<softBreak></softBreak>' +
					'<element></element>b]ar</codeBlock>' );

				// <codeBlock language="foo">    f[o<element></element>o<softBreak></softBreak>    <element></element>b]ar</codeBlock>
				model.change( writer => {
					writer.insertText( '    ', model.document.getRoot().getChild( 0 ), 5 );
					writer.insertText( '    ', model.document.getRoot().getChild( 0 ), 0 );
				} );

				indentCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<codeBlock language="foo">    	f[o<element></element>o<softBreak></softBreak>' +
					'    	<element></element>b]ar</codeBlock>' );
			} );
		} );

		// Need to ensure that insertContent() will not be reverted to model.change() to not break integration
		// with Track Changes.
		it( 'should insert indent with insertContent()', () => {
			const insertContentSpy = sinon.spy( model, 'insertContent' );
			const modelChangeSpy = sinon.spy( model, 'change' );

			setModelData( model, '<codeBlock language="foo">[]Foo</codeBlock>' );

			indentCommand.execute();

			expect( insertContentSpy.calledOnce ).to.be.true;
			expect( modelChangeSpy.calledAfter( insertContentSpy ) ).to.be.true;
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
