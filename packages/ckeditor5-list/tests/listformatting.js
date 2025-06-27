/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { Plugin } from '@ckeditor/ckeditor5-core/src/plugin.js';
import { BlockQuoteEditing } from '@ckeditor/ckeditor5-block-quote';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { stubUid } from './list/_utils/uid.js';
import { ListFormatting } from '../src/listformatting.js';
import { ListItemFontFamilyIntegration } from '../src/listformatting/listitemfontfamilyintegration.js';
import { ListItemBoldIntegration } from '../src/listformatting/listitemboldintegration.js';
import { ListItemItalicIntegration } from '../src/listformatting/listitemitalicintegration.js';
import { ListItemFontSizeIntegration } from '../src/listformatting/listitemfontsizeintegration.js';
import { ListItemFontColorIntegration } from '../src/listformatting/listitemfontcolorintegration.js';

describe( 'ListFormatting', () => {
	let editor, model, docSelection;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ ListFormatting, Paragraph, BlockQuoteEditing, MyPlugin, MyPlugin2 ]
		} );

		model = editor.model;
		docSelection = model.document.selection;

		model.schema.extend( '$text', { allowAttributes: [ 'inlineFormat', 'inlineFormat2' ] } );

		model.schema.register( 'blockObject', {
			inheritAllFrom: '$blockObject',
			allowAttributesOf: '$listItem',
			allowAttributes: [ 'listItemFormat' ],
			allowChildren: '$text'
		} );

		editor.conversion.elementToElement( { model: 'blockObject', view: 'blockObject' } );

		model.schema.register( 'inlineObject', {
			inheritAllFrom: '$inlineObject',
			allowChildren: '$text'
		} );

		editor.conversion.elementToElement( { model: 'inlineObject', view: 'inlineObject' } );

		stubUid();
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( ListFormatting.pluginName ).to.equal( 'ListFormatting' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListFormatting.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListFormatting.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListFormatting ) ).to.be.instanceOf( ListFormatting );
	} );

	it( 'should require integration plugins', () => {
		expect( ListFormatting.requires ).to.deep.equal( [
			ListItemBoldIntegration,
			ListItemItalicIntegration,
			ListItemFontSizeIntegration,
			ListItemFontColorIntegration,
			ListItemFontFamilyIntegration
		] );
	} );

	describe( 'post-fixer', () => {
		describe( 'changing formatting in empty list item', () => {
			it( 'should set attribute in empty li when adding formatting', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">[]</paragraph>'
				);

				setSelectionAttribute( model, 'inlineFormat', 'foo' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered" selection:inlineFormat="foo">' +
					'</paragraph>'
				);
			} );

			it( 'should not set attribute in empty block (not li) when adding formatting', () => {
				_setModelData( model,
					'<paragraph>[]</paragraph>'
				);

				setSelectionAttribute( model, 'inlineFormat', 'foo' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph selection:inlineFormat="foo"></paragraph>'
				);
			} );

			it( 'should update attribute in empty li when changing formatting', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">[]</paragraph>'
				);

				setSelectionAttribute( model, 'inlineFormat', 'foo' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered" selection:inlineFormat="foo">' +
					'</paragraph>'
				);

				setSelectionAttribute( model, 'inlineFormat', 'bar' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="bar" listItemId="a" listType="numbered" selection:inlineFormat="bar">' +
					'</paragraph>'
				);
			} );

			it( 'should remove attribute from empty li when removing formatting', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">[]</paragraph>'
				);

				setSelectionAttribute( model, 'inlineFormat', 'foo' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered" selection:inlineFormat="foo">' +
					'</paragraph>'
				);

				removeSelectionAttribute( model, 'inlineFormat' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="numbered"></paragraph>'
				);
			} );
		} );

		describe( 'changing formatting on text inside a list item', () => {
			it( 'should set attribute in li when adding formatting on the whole text', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">[<$text>foo</$text>]</paragraph>'
				);

				setAttribute( model, 'inlineFormat', 'foo', docSelection.getFirstRange() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should not set attribute in li when adding formatting on the part of text', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered"><$text>[fo]o</$text></paragraph>'
				);

				setAttribute( model, 'inlineFormat', 'foo', docSelection.getFirstRange() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">fo</$text>' +
						'o' +
					'</paragraph>'
				);
			} );

			it( 'should not set attribute in block (not li) when adding formatting on the whole text', () => {
				_setModelData( model,
					'<paragraph>[<$text>foo</$text>]</paragraph>'
				);

				setAttribute( model, 'inlineFormat', 'foo', docSelection.getFirstRange() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph><$text inlineFormat="foo">foo</$text></paragraph>'
				);
			} );

			it( 'should update attribute in li when changing formatting on the whole text', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'[<$text inlineFormat="foo">foo</$text>]' +
					'</paragraph>'
				);

				setAttribute( model, 'inlineFormat', 'bar', docSelection.getFirstRange() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="bar" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="bar">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should remove attribute from li when changing formatting on the part of text', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">[fo]o</$text>' +
					'</paragraph>'
				);

				setAttribute( model, 'inlineFormat', 'bar', docSelection.getFirstRange() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="bar">fo</$text>' +
						'<$text inlineFormat="foo">o</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should remove attribute from li when removing formatting from the whole text', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'[<$text inlineFormat="foo">foo</$text>]' +
					'</paragraph>'
				);

				removeAttribute( model, 'inlineFormat', docSelection.getFirstRange() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'foo' +
					'</paragraph>'
				);
			} );

			it( 'should set attribute in li when adding formatting on the whole text in multiple list items', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">[<$text>foo</$text>]</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered">[<$text>bar</$text>]</paragraph>'
				);

				model.change( () => {
					setAttribute( model, 'inlineFormat', 'foo', docSelection.getFirstRange() );
					setAttribute( model, 'inlineFormat', 'foo', docSelection.getLastRange() );
				} );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="b" listType="numbered">' +
						'<$text inlineFormat="foo">bar</$text>' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'inserting a text node into a list item', () => {
			it( 'should set attribute on not formatted empty li if inserted text is formatted', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">[]</paragraph>'
				);

				insertText( model, 'foo', { inlineFormat: 'foo' }, docSelection.getFirstPosition() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should not set attribute in block (not li) if inserted text is formatted', () => {
				_setModelData( model,
					'<paragraph>[]</paragraph>'
				);

				insertText( model, 'foo', { inlineFormat: 'foo' }, docSelection.getFirstPosition() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph><$text inlineFormat="foo">foo</$text></paragraph>'
				);
			} );

			it( 'should not set attribute on not formatted li if inserted text is formatted', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered"><$text>foo[]</$text></paragraph>'
				);

				insertText( model, 'bar', { inlineFormat: 'bar' }, docSelection.getFirstPosition() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'foo' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should not change attribute on formatted li if inserted text has the same format', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo[]</$text>' +
					'</paragraph>'
				);

				insertText( model, 'bar', { inlineFormat: 'foo' }, docSelection.getFirstPosition() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foobar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should remove attribute from formatted li if inserted text has different format', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo[]</$text>' +
					'</paragraph>'
				);

				insertText( model, 'bar', { inlineFormat: 'bar' }, docSelection.getFirstPosition() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo</$text>' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'removing text node from a list item', () => {
			it( 'should remove attribute from li if all formatted text is removed', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'[<$text inlineFormat="foo">foo</$text>]' +
					'</paragraph>'
				);

				editor.execute( 'delete' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="numbered"></paragraph>'
				);
			} );

			it( 'should add attribute to li if part of text with a different format is removed', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'[<$text inlineFormat="foo">foo</$text>]' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);

				editor.execute( 'delete' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="bar" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should not add attribute if part of text with a different format is removed from a block (not li)', () => {
				_setModelData( model,
					'<paragraph>' +
						'[<$text inlineFormat="foo">foo</$text>]' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);

				editor.execute( 'delete' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph>' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'inserting structures', () => {
			it( 'should apply list item format in deeper inserted/pasted structure', () => {
				model.change( writer => {
					const blockQuote = writer.createElement( 'blockQuote' );
					const paragraph = writer.createElement( 'paragraph', {
						listItemId: 'a',
						listIndent: 0,
						listType: 'numbered'
					} );
					const text = writer.createText( 'abc', { inlineFormat: 'foo' } );

					writer.insert( text, paragraph, 0 );
					writer.insert( paragraph, blockQuote, 0 );
					writer.insert( blockQuote, model.document.getRoot(), 'end' );
				} );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph></paragraph>' +
					'<blockQuote>' +
						'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
							'<$text inlineFormat="foo">abc</$text>' +
						'</paragraph>' +
					'</blockQuote>'
				);
			} );
		} );

		describe( 'other elements handling (block objects, inline objects)', () => {
			it( 'should not check inner block widget nodes', () => {
				_setModelData( model,
					'<blockObject listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">abc</$text>' +
					'</blockObject>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<blockObject listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">abc</$text>' +
					'</blockObject>'
				);
			} );

			it( 'should remove list item formatting for block object', () => {
				_setModelData( model,
					'<blockObject listIndent="0" listItemId="a" listType="numbered" listItemFormat="foo" >' +
						'<$text inlineFormat="foo">abc</$text>' +
					'</blockObject>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<blockObject listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">abc</$text>' +
					'</blockObject>'
				);
			} );

			it( 'should not check inner block widget even if empty', () => {
				_setModelData( model,
					'<blockObject listIndent="0" listItemId="a" listType="numbered">[]</blockObject>'
				);

				setSelectionAttribute( model, 'inlineFormat', 'foo' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<blockObject listIndent="0" listItemId="a" listType="numbered" selection:inlineFormat="foo"></blockObject>'
				);
			} );

			it( 'should consider inline object format but ignore internal format', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'<inlineObject inlineFormat="foo">' +
							'<$text inlineFormat="bar">foo</$text>' +
						'</inlineObject>' +
					'</paragraph>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<inlineObject inlineFormat="foo">' +
							'<$text inlineFormat="bar">foo</$text>' +
						'</inlineObject>' +
					'</paragraph>'
				);
			} );

			it( 'should consider inline object format but ignore internal format when next to text', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">abc</$text>' +
						'<inlineObject inlineFormat="foo">' +
							'<$text inlineFormat="bar">foo</$text>' +
						'</inlineObject>' +
						'<$text inlineFormat="foo">def</$text>' +
					'</paragraph>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">abc</$text>' +
						'<inlineObject inlineFormat="foo">' +
							'<$text inlineFormat="bar">foo</$text>' +
						'</inlineObject>' +
						'<$text inlineFormat="foo">def</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should consider inline object format when next to text (if format differs on element)', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">abc</$text>' +
						'<inlineObject inlineFormat="bar"></inlineObject>' +
						'<$text inlineFormat="foo">def</$text>' +
					'</paragraph>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">abc</$text>' +
						'<inlineObject inlineFormat="bar"></inlineObject>' +
						'<$text inlineFormat="foo">def</$text>' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'list structure modifications', () => {
			it( 'it should add attribute to li after splitting list item with consistent formatting', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo[]bar</$text>' +
					'</paragraph>'
				);

				editor.execute( 'enter' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a00" listType="numbered">' +
						'<$text inlineFormat="foo">bar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should add attributes after splitting inconsistent formatting if both have consistent formatting afterwards', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo[]</$text>' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.be.undefined;

				editor.execute( 'enter' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemFormat="bar" listItemId="a00" listType="numbered">' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should add attribute if after deleting part of list, updated list item has consistent formatting', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo</$text>' +
						'<$text inlineFormat="bar">[bar</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemId="b">' +
						'<$text inlineFormat="foo">x]yz</$text>' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.be.undefined;

				editor.execute( 'delete' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">fooyz</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should remove attribute if after deleting part of list, updated list item has inconsistent formatting', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">fo[o</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemId="b">' +
						'<$text inlineFormat="foo">xyz</$text>' +
						'<$text inlineFormat="bar">b]ar</$text>' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.equal( 'foo' );

				editor.execute( 'delete' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">fo</$text>' +
						'<$text inlineFormat="bar">ar</$text>' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'multi-block modifications', () => {
			it( 'should not remove attributes when new multi-block item has different formatting', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered">' +
						'<$text inlineFormat="bar">[]bar</$text>' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.equal( 'foo' );
				expect( model.document.getRoot().getChild( 1 ).getAttribute( 'listItemFormat' ) ).to.equal( 'bar' );

				editor.execute( 'mergeListItemBackward' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should not remove attributes when new multi-block item has no formatting', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemId="b">' +
						'[]bar' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.equal( 'foo' );
				expect( model.document.getRoot().getChild( 1 ).getAttribute( 'listItemFormat' ) ).to.be.undefined;

				editor.execute( 'mergeListItemBackward' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'bar' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'changing block item into list item', () => {
			it( 'should set attribute in li when changing a formatted paragraph into li', () => {
				_setModelData( model,
					'<paragraph>[<$text inlineFormat="foo">foo</$text>]</paragraph>'
				);

				editor.execute( 'bulletedList' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a00" listType="bulleted">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should not set attribute in li when changing a partly formatted paragraph into li', () => {
				_setModelData( model,
					'<paragraph>[<$text inlineFormat="foo">foo</$text>bar]</paragraph>'
				);

				editor.execute( 'bulletedList' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">' +
						'<$text inlineFormat="foo">foo</$text>' +
						'bar' +
					'</paragraph>'
				);
			} );

			it( 'should add attribute if li is empty but has selection formatting', () => {
				_setModelData( model,
					'<paragraph>[]</paragraph>'
				);

				setSelectionAttribute( model, 'inlineFormat', 'foo' );

				editor.execute( 'bulletedList' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a00" listType="bulleted" selection:inlineFormat="foo">' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'when 2 formattings registerd', () => {
			it( 'should set both attributes in empty li when adding formatting', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">[]</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.be.undefined;
				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat2' ) ).to.be.undefined;

				setSelectionAttribute( model, 'inlineFormat', 'foo' );
				setSelectionAttribute( model, 'inlineFormat2', 'bar' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemFormat2="bar" ' +
						'listItemId="a" listType="numbered" selection:inlineFormat="foo" selection:inlineFormat2="bar">' +
					'</paragraph>'
				);
			} );

			it( 'should update only one attribute when changing one formatting', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'[<$text inlineFormat="foo" inlineFormat2="bar">foo</$text>]' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.equal( 'foo' );
				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat2' ) ).to.equal( 'bar' );

				setAttribute( model, 'inlineFormat', 'baz', docSelection.getFirstRange() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="baz" listItemFormat2="bar" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="baz" inlineFormat2="bar">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should remove only one attribute when removing one formatting', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'[<$text inlineFormat="foo" inlineFormat2="bar">foo</$text>]' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.equal( 'foo' );
				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat2' ) ).to.equal( 'bar' );

				removeAttribute( model, 'inlineFormat', docSelection.getFirstRange() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat2="bar" listItemId="a" listType="numbered">' +
						'<$text inlineFormat2="bar">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should remove only one attribute when changing part of the content with the second formatting', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo" inlineFormat2="bar">[fo]o</$text>' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.equal( 'foo' );
				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat2' ) ).to.equal( 'bar' );

				setAttribute( model, 'inlineFormat2', 'baz', docSelection.getFirstRange() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" listType="numbered">' +
						'<$text inlineFormat="foo" inlineFormat2="baz">fo</$text>' +
						'<$text inlineFormat="foo" inlineFormat2="bar">o</$text>' +
					'</paragraph>'
				);
			} );
		} );
	} );

	describe( 'enableListItemMarkerFormatting', () => {
		it( 'should be enabled by default', () => {
			expect( editor.config.get( 'list.enableListItemMarkerFormatting' ) ).to.be.true;
		} );

		describe( 'when enableListItemMarkerFormatting is false (postfixer should not run)', () => {
			let editor, model, docSelection;

			beforeEach( async () => {
				editor = await VirtualTestEditor.create( {
					plugins: [ ListFormatting, Paragraph, MyPlugin ],
					list: {
						enableListItemMarkerFormatting: false
					}
				} );

				model = editor.model;
				docSelection = model.document.selection;

				model.schema.extend( '$text', { allowAttributes: [ 'inlineFormat', 'inlineFormat2' ] } );
			} );

			afterEach( async () => {
				await editor.destroy();
			} );

			it( 'should not set attribute in li when adding formatting on the whole text', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a">[<$text>foo</$text>]</paragraph>'
				);

				setAttribute( model, 'inlineFormat', 'foo', docSelection.getFirstRange() );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>'
				);
			} );
		} );
	} );

	class MyPlugin extends Plugin {
		init() {
			const ListFormatting = this.editor.plugins.get( 'ListFormatting' );

			ListFormatting.registerFormatAttribute( 'inlineFormat', 'listItemFormat' );
		}

		afterInit() {
			const model = this.editor.model;

			model.schema.extend( '$listItem', { allowAttributes: 'listItemFormat' } );
			model.schema.addAttributeCheck( context => {
				const item = context.last;
				if ( !item.getAttribute( 'listItemId' ) ) {
					return false;
				}
			}, 'listItemFormat' );
		}
	}

	class MyPlugin2 extends Plugin {
		init() {
			const ListFormatting = this.editor.plugins.get( 'ListFormatting' );

			ListFormatting.registerFormatAttribute( 'inlineFormat2', 'listItemFormat2' );
		}

		afterInit() {
			const model = this.editor.model;

			model.schema.extend( '$listItem', { allowAttributes: 'listItemFormat2' } );
			model.schema.addAttributeCheck( context => {
				const item = context.last;
				if ( !item.getAttribute( 'listItemId' ) ) {
					return false;
				}
			}, 'listItemFormat2' );
		}
	}

	function setSelectionAttribute( model, attributeName, value ) {
		model.change( writer => {
			writer.setSelectionAttribute( attributeName, value );
		} );
	}

	function removeSelectionAttribute( model, attributeName ) {
		model.change( writer => {
			writer.removeSelectionAttribute( attributeName );
		} );
	}

	function setAttribute( model, attributeName, value, range ) {
		model.change( writer => {
			writer.setAttribute( attributeName, value, range );
		} );
	}

	function removeAttribute( model, attributeName, range ) {
		model.change( writer => {
			writer.removeAttribute( attributeName, range );
		} );
	}

	function insertText( model, text, attributes, position ) {
		model.change( writer => {
			const textNode = writer.createText( text, attributes );
			writer.insert( textNode, position );
		} );
	}
} );
