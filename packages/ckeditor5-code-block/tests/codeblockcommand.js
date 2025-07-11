/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { CodeBlockEditing } from '../src/codeblockediting.js';
import { CodeBlockCommand } from '../src/codeblockcommand.js';

import { AlignmentEditing } from '@ckeditor/ckeditor5-alignment/src/alignmentediting.js';
import { BoldEditing } from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { BlockQuoteEditing } from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'CodeBlockCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ CodeBlockEditing, Paragraph, BlockQuoteEditing, AlignmentEditing, BoldEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new CodeBlockCommand( editor );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( '#value', () => {
		it( 'should be true when the first selected element is a codeBlock element (selection inside code block)', () => {
			_setModelData( model, '<codeBlock language="foo">f[]oo</codeBlock>' );

			expect( command.value ).to.equal( 'foo' );
		} );

		it( 'should be true when the first selected element is a codeBlock element (other blocks in selection are not code block)', () => {
			_setModelData( model, '<codeBlock language="foo">f[oo</codeBlock><paragraph>ba]r</paragraph>' );

			expect( command.value ).to.equal( 'foo' );
		} );

		it( 'should be false when the first selected element is not a code block (all blocks are not code block)', () => {
			_setModelData( model, '<paragraph>f[]oo</paragraph>' );

			expect( command.value ).to.equal( false );
		} );

		it( 'should be false when the first selected element is not a code block (selection ends in code block)', () => {
			_setModelData( model, '<paragraph>f[oo</paragraph><codeBlock language="foo">ba]r</codeBlock>' );

			expect( command.value ).to.equal( false );
		} );
	} );

	describe( '#isEnabled', () => {
		it( 'should be true when the first selected block is a codeBlock (selection inside code block)', () => {
			_setModelData( model, '<codeBlock language="foo">f[]oo</codeBlock>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be true when the first selected block is a codeBlock (other blocks in selection are not code block)', () => {
			_setModelData( model, '<codeBlock language="foo">f[oo</codeBlock><paragraph>ba]r</paragraph>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be true when the first selected block can be a codeBlock (collapsed selection)', () => {
			_setModelData( model, '<paragraph>f[]oo</paragraph>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be true when the first selected block can be a codeBlock (non-collapsed selection, ends in code block)', () => {
			_setModelData( model, '<paragraph>f[oo</paragraph><codeBlock language="foo">ba]r</codeBlock>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be false when selected element is a limit element (selection on element)', () => {
			model.schema.register( 'limit', {
				inheritAllFrom: '$block',
				isLimit: true
			} );

			_setModelData( model, '[<limit>foo</limit>]' );

			expect( command.isEnabled ).to.equal( false );
		} );

		it( 'should be false when selection starts in a blockless space', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );

			_setModelData( model, 'x[]x' );

			expect( command.isEnabled ).to.equal( false );
		} );

		it( 'should be false when selected element is a limit element (selection has mixed limit and non-limit elements)', () => {
			model.schema.register( 'limit', {
				inheritAllFrom: '$block',
				isLimit: true
			} );

			_setModelData( model, '<limit>f[oo</limit><paragraph>ba]r</paragraph>' );

			expect( command.isEnabled ).to.equal( false );
		} );

		it( 'should be true when limit element is not the first selected element', () => {
			model.schema.register( 'limit', {
				inheritAllFrom: '$block',
				isLimit: true
			} );

			_setModelData( model, '<paragraph>f[oo</paragraph><limit>bar</limit><paragraph>bi]z</paragraph>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should make it possible to disallow codeBlock using schema', () => {
			model.schema.addChildCheck( ( context, childDef ) => {
				if ( context.endsWith( 'blockQuote' ) && childDef.name === 'codeBlock' ) {
					return false;
				}
			} );

			_setModelData( model, '<blockQuote><paragraph>f[o]o</paragraph></blockQuote>' );

			expect( command.isEnabled ).to.equal( false );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should change selected empty block to codeBlock', () => {
			_setModelData( model, '<paragraph>[]</paragraph>' );

			command.execute();

			expect( _getModelData( model ) ).to.equal( '<codeBlock language="plaintext">[]</codeBlock>' );
		} );

		it( 'should change selected block to codeBlock', () => {
			_setModelData( model, '<paragraph>fo[]o</paragraph>' );

			command.execute();

			expect( _getModelData( model ) ).to.equal( '<codeBlock language="plaintext">fo[]o</codeBlock>' );
		} );

		it( 'should change multiple selected block to codeBlock', () => {
			_setModelData( model, '<paragraph>f[oo</paragraph><paragraph>ba]r</paragraph>' );

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<codeBlock language="plaintext">f[oo<softBreak></softBreak>ba]r</codeBlock>' );
		} );

		it( 'should merge selected blocks with selected codeBlocks', () => {
			_setModelData( model, '<paragraph>f[oo</paragraph><codeBlock language="plaintext">ba]r</codeBlock>' );

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<codeBlock language="plaintext">f[oo<softBreak></softBreak>ba]r</codeBlock>' );
		} );

		it( 'should not merge codeBlock with siblings when siblings are not selected', () => {
			_setModelData( model,
				'<codeBlock language="plaintext">foo</codeBlock>' +
				'<paragraph>b[a]r</paragraph>' +
				'<codeBlock language="plaintext">biz</codeBlock>'
			);

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<codeBlock language="plaintext">foo</codeBlock>' +
				'<codeBlock language="plaintext">b[a]r</codeBlock>' +
				'<codeBlock language="plaintext">biz</codeBlock>'
			);
		} );

		it( 'should change selected empty codeBlock to paragraph', () => {
			_setModelData( model, '<codeBlock language="plaintext">[]</codeBlock>' );

			command.execute();

			expect( _getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'should change selected codeBlock to paragraph', () => {
			_setModelData( model, '<codeBlock language="plaintext">f[o]o</codeBlock>' );

			command.execute();

			expect( _getModelData( model ) ).to.equal( '<paragraph>f[o]o</paragraph>' );
		} );

		it( 'should change selected multi-line codeBlock to paragraphs', () => {
			_setModelData( model,
				'<codeBlock language="plaintext">foo<softBreak></softBreak>b[]ar<softBreak></softBreak>biz</codeBlock>'
			);

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<paragraph>b[]ar</paragraph>' +
				'<paragraph>biz</paragraph>'
			);
		} );

		it( 'should filter out attributes from nodes changed to codeBlock', () => {
			_setModelData( model, '<paragraph alignment="right"><$text bold="true">f[o]o</$text></paragraph>' );

			command.execute();

			expect( _getModelData( model ) ).to.equal( '<codeBlock language="plaintext">f[o]o</codeBlock>' );
		} );

		it( 'should use forceValue parameter', () => {
			_setModelData( model, '<codeBlock language="plaintext">f[o]o</codeBlock>' );

			command.execute( { forceValue: true } );

			expect( _getModelData( model ) ).to.equal( '<codeBlock language="plaintext">f[o]o</codeBlock>' );
		} );

		it( 'should allow setting the language of the new block', () => {
			_setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( { language: 'css' } );

			expect( _getModelData( model ) ).to.equal( '<codeBlock language="css">f[o]o</codeBlock>' );
		} );

		it( 'should allow changing the language of the existing block', () => {
			_setModelData( model, '<codeBlock language="plaintext">f[o]o</codeBlock>' );

			command.execute( { language: 'css', forceValue: true } );

			expect( _getModelData( model ) ).to.equal( '<codeBlock language="css">f[o]o</codeBlock>' );
		} );

		it( 'should remove all non-allowed nodes when inserting the "codeBlock" element', () => {
			model.schema.register( 'div', { inheritAllFrom: '$block', allowIn: 'paragraph' } );
			editor.conversion.elementToElement( { model: 'div', view: 'div' } );

			_setModelData( model, '[<paragraph>Foo<div></div>Bar</paragraph>]' );

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<codeBlock language="plaintext">[FooBar]</codeBlock>'
			);
		} );

		it( 'should remove all non-allowed nodes when inserting the "codeBlock" element (the softBreak check)', () => {
			model.schema.register( 'div', { inheritAllFrom: '$block', allowIn: 'paragraph' } );
			editor.conversion.elementToElement( { model: 'div', view: 'div' } );

			_setModelData( model, '[<paragraph>Foo<div></div>Bar<softBreak></softBreak>Baz</paragraph>]' );

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<codeBlock language="plaintext">[FooBar<softBreak></softBreak>Baz]</codeBlock>'
			);
		} );

		describe( 'options.usePreviousLanguageChoice=true', () => {
			it( 'it should remember the selected language', () => {
				_setModelData( model, '<paragraph>fo[]o</paragraph>' );

				command.execute( { language: 'php' } );

				expect( command._lastLanguage ).to.equal( 'php' );
			} );

			it( 'it should apply the previous language if specified', () => {
				_setModelData( model, '<paragraph>fo[]o</paragraph>' );

				command._lastLanguage = 'css';

				command.execute( { usePreviousLanguageChoice: true } );

				expect( _getModelData( model ) ).to.equal( '<codeBlock language="css">fo[]o</codeBlock>' );
			} );

			it( 'it should not apply the previous language if specified but usePreviousLanguageChoice=false', () => {
				_setModelData( model, '<paragraph>fo[]o</paragraph>' );

				command._lastLanguage = 'css';

				command.execute();

				expect( _getModelData( model ) ).to.equal( '<codeBlock language="plaintext">fo[]o</codeBlock>' );
			} );

			it( 'it should apply the default language when the last language is not set yet', () => {
				_setModelData( model, '<paragraph>fo[]o</paragraph>' );

				command.execute( { usePreviousLanguageChoice: true } );

				expect( _getModelData( model ) ).to.equal( '<codeBlock language="plaintext">fo[]o</codeBlock>' );
			} );

			it( 'it should prioritize using language passed as an option over previous language', () => {
				_setModelData( model, '<paragraph>fo[]o</paragraph>' );

				command._lastLanguage = 'css';

				command.execute( { language: 'php', usePreviousLanguageChoice: true } );

				expect( _getModelData( model ) ).to.equal( '<codeBlock language="php">fo[]o</codeBlock>' );
			} );
		} );
	} );

	describe( 'BlockQuote integration', () => {
		it( 'should change a paragraph inside a blockQuote to codeBlock', () => {
			_setModelData( model, '<blockQuote><paragraph>f[o]o</paragraph></blockQuote>' );

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<blockQuote><codeBlock language="plaintext">f[o]o</codeBlock></blockQuote>' );
		} );

		it( 'should change a paragraph inside a blockQuote to codeBlock when blockQuote is selected with siblings', () => {
			_setModelData( model,
				'<paragraph>f[oo</paragraph>' +
				'<blockQuote><paragraph>bar</paragraph></blockQuote>' +
				'<paragraph>bi]z</paragraph>'
			);

			command.execute();

			expect( _getModelData( model ) ).to.equal(
				'<codeBlock language="plaintext">f[oo</codeBlock>' +
				'<blockQuote><codeBlock language="plaintext">bar</codeBlock></blockQuote>' +
				'<codeBlock language="plaintext">bi]z</codeBlock>'
			);
		} );
	} );
} );
