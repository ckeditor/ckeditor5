/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CodeBlockEditing } from '../src/codeblockediting.js';
import { IndentCodeBlockCommand } from '../src/indentcodeblockcommand.js';

import { AlignmentEditing } from '@ckeditor/ckeditor5-alignment';
import { BoldEditing } from '@ckeditor/ckeditor5-basic-styles';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { BlockQuoteEditing } from '@ckeditor/ckeditor5-block-quote';

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';

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
		vi.restoreAllMocks();

		return editor.destroy();
	} );

	describe( '#isEnabled', () => {
		it( 'should be true when the first selected block is a codeBlock #1', () => {
			_setModelData( model, '<codeBlock language="foo">f[]oo</codeBlock>' );

			expect( indentCommand.isEnabled ).toBe( true );
		} );

		it( 'should be true when the first selected block is a codeBlock #2', () => {
			_setModelData( model, '<codeBlock language="foo">f[oo</codeBlock><paragraph>ba]r</paragraph>' );

			expect( indentCommand.isEnabled ).toBe( true );
		} );

		it( 'should be false when there is no code block in the selection', () => {
			_setModelData( model, '<paragraph>foo[]</paragraph>' );

			expect( indentCommand.isEnabled ).toBe( false );
		} );

		it( 'should be false when the selection is not anchored in the code block', () => {
			_setModelData( model, '<paragraph>f[oo</paragraph><codeBlock language="foo">bar</codeBlock><paragraph>ba]z</paragraph>' );

			expect( indentCommand.isEnabled ).toBe( false );
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

						_setModelData( model, '<codeBlock language="foo">[]foo</codeBlock>' );

						expect( indentCommand.isEnabled ).toBe( false );

						return editor.destroy();
					} );
			} );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should indent when a selection is collapsed in an empty code block', () => {
			_setModelData( model, '<codeBlock language="foo">[]</codeBlock>' );

			indentCommand.execute();

			expect( _getModelData( model ) ).toBe( '<codeBlock language="foo">	[]</codeBlock>' );
		} );

		it( 'should indent when a selection is collapsed', () => {
			_setModelData( model, '<codeBlock language="foo">f[]oo</codeBlock>' );

			indentCommand.execute();

			expect( _getModelData( model ) ).toBe( '<codeBlock language="foo">f	[]oo</codeBlock>' );
		} );

		it( 'should indent a whole line when a selection is expanded', () => {
			_setModelData( model, '<codeBlock language="foo">f[o]o</codeBlock>' );

			indentCommand.execute();

			expect( _getModelData( model ) ).toBe( '<codeBlock language="foo">	f[o]o</codeBlock>' );
		} );

		it( 'should indent multiple lines when a selection is expanded', () => {
			_setModelData( model, '<codeBlock language="foo">f[oo<softBreak></softBreak>b]ar</codeBlock>' );

			indentCommand.execute();

			expect( _getModelData( model ) ).toBe( '<codeBlock language="foo">	f[oo<softBreak></softBreak>	b]ar</codeBlock>' );
		} );

		it( 'should append the indentation to the line\'s leading white spaces (#1)', () => {
			_setModelData( model, '<codeBlock language="foo">[]foo</codeBlock>' );

			// <codeBlock language="foo">    []foo</codeBlock>
			model.change( writer => {
				writer.insertText( '    ', model.document.getRoot().getChild( 0 ) );
			} );

			indentCommand.execute();

			expect( _getModelData( model ) ).toBe( '<codeBlock language="foo">    	[]foo</codeBlock>' );
		} );

		it( 'should append the indentation to the line\'s leading white spaces (#2)', () => {
			_setModelData( model, '<codeBlock language="foo">f[oo<softBreak></softBreak>b]ar</codeBlock>' );

			// <codeBlock language="foo">    f[oo<softBreak></softBreak>    b]ar</codeBlock>
			model.change( writer => {
				writer.insertText( '    ', model.document.getRoot().getChild( 0 ), 4 );
				writer.insertText( '    ', model.document.getRoot().getChild( 0 ), 0 );
			} );

			indentCommand.execute();

			expect( _getModelData( model ) ).toBe(
				'<codeBlock language="foo">    	f[oo<softBreak></softBreak>    	b]ar</codeBlock>' );
		} );

		describe( 'if an element is present in the code block', () => {
			beforeEach( () => {
				model.schema.register( 'element', {
					allowWhere: '$text'
				} );
			} );

			it( 'should indent when a selection is collapsed before an element', () => {
				_setModelData( model, '<codeBlock language="foo">[]<element></element></codeBlock>' );

				indentCommand.execute();

				expect( _getModelData( model ) ).toBe( '<codeBlock language="foo">	[]<element></element></codeBlock>' );
			} );

			it( 'should indent when a selection is collapsed after an element', () => {
				_setModelData( model, '<codeBlock language="foo"><element></element>[]</codeBlock>' );

				indentCommand.execute();

				expect( _getModelData( model ) ).toBe( '<codeBlock language="foo"><element></element>	[]</codeBlock>' );
			} );

			it( 'should indent a whole line when a selection is expanded before element', () => {
				_setModelData( model, '<codeBlock language="foo">f[o]o<element></element></codeBlock>' );

				indentCommand.execute();

				expect( _getModelData( model ) ).toBe( '<codeBlock language="foo">	f[o]o<element></element></codeBlock>' );
			} );

			it( 'should indent a whole line when a selection is expanded after element', () => {
				_setModelData( model, '<codeBlock language="foo"><element></element>f[o]o</codeBlock>' );

				indentCommand.execute();

				expect( _getModelData( model ) ).toBe( '<codeBlock language="foo">	<element></element>f[o]o</codeBlock>' );
			} );

			it( 'should indent a whole line when a selection is expanded including element', () => {
				_setModelData( model, '<codeBlock language="foo">f[<element></element>]o</codeBlock>' );

				indentCommand.execute();

				expect( _getModelData( model ) ).toBe( '<codeBlock language="foo">	f[<element></element>]o</codeBlock>' );
			} );

			it( 'should indent multiple lines when a selection is expanded', () => {
				_setModelData( model, '<codeBlock language="foo">f[o<element></element>o<softBreak></softBreak>' +
					'b]a<element></element>r</codeBlock>' );

				indentCommand.execute();

				expect( _getModelData( model ) ).toBe( '<codeBlock language="foo">	f[o<element></element>o<softBreak></softBreak>' +
					'	b]a<element></element>r</codeBlock>' );
			} );

			it( 'should append the indentation to the line\'s leading white spaces (#1)', () => {
				_setModelData( model, '<codeBlock language="foo">[]foo<element></element></codeBlock>' );

				// <codeBlock language="foo">    []foo<element></element></codeBlock>
				model.change( writer => {
					writer.insertText( '    ', model.document.getRoot().getChild( 0 ) );
				} );

				indentCommand.execute();

				expect( _getModelData( model ) ).toBe( '<codeBlock language="foo">    	[]foo<element></element></codeBlock>' );
			} );

			it( 'should append the indentation to the line\'s leading white spaces (#2)', () => {
				_setModelData( model, '<codeBlock language="foo">f[o<element></element>o<softBreak></softBreak>' +
					'<element></element>b]ar</codeBlock>' );

				// <codeBlock language="foo">    f[o<element></element>o<softBreak></softBreak>    <element></element>b]ar</codeBlock>
				model.change( writer => {
					writer.insertText( '    ', model.document.getRoot().getChild( 0 ), 5 );
					writer.insertText( '    ', model.document.getRoot().getChild( 0 ), 0 );
				} );

				indentCommand.execute();

				expect( _getModelData( model ) ).toBe(
					'<codeBlock language="foo">    	f[o<element></element>o<softBreak></softBreak>' +
					'    	<element></element>b]ar</codeBlock>' );
			} );
		} );

		// Need to ensure that insertContent() will not be reverted to model.change() to not break integration
		// with Track Changes.
		it( 'should insert indent with insertContent()', () => {
			const insertContentSpy = vi.spyOn( model, 'insertContent' );
			const modelChangeSpy = vi.spyOn( model, 'change' );

			_setModelData( model, '<codeBlock language="foo">[]Foo</codeBlock>' );

			indentCommand.execute();

			expect( insertContentSpy ).toHaveBeenCalledOnce();
			const insertOrder = insertContentSpy.mock.invocationCallOrder[ 0 ];
			const lastChangeOrder = Math.max( ...modelChangeSpy.mock.invocationCallOrder );
			expect( lastChangeOrder ).toBeGreaterThan( insertOrder );
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

						_setModelData( model, '<codeBlock language="foo">f[o]o</codeBlock>' );

						indentCommand.execute();

						expect( _getModelData( model ) ).toBe( '<codeBlock language="foo">  f[o]o</codeBlock>' );

						return editor.destroy();
					} );
			} );
		} );
	} );
} );
