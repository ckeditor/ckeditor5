/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import stubUid from './list/_utils/uid.js';
import ListFormatting from '../src/listformatting.js';
import ListItemFontFamilyIntegration from '../src/listformatting/listitemfontfamilyintegration.js';
import ListItemFontSizeIntegration from '../src/listformatting/listitemfontsizeintegration.js';

describe( 'ListFormatting', () => {
	let editor, model, docSelection;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ ListFormatting, Paragraph, MyPlugin, MyPlugin2 ]
		} );

		model = editor.model;
		docSelection = model.document.selection;

		model.schema.extend( '$text', { allowAttributes: [ 'inlineFormat', 'inlineFormat2' ] } );

		model.schema.register( 'limitElement', {
			inheritAllFrom: '$blockObject',
			allowAttributes: [ 'listItemId', 'listIndent', 'listItemFormat' ]
		} );

		editor.conversion.elementToElement( { model: 'limitElement', view: 'limitElement' } );

		model.schema.register( 'innerBlock', {
			inheritAllFrom: '$block',
			allowIn: 'paragraph'
		} );

		editor.conversion.elementToElement( { model: 'innerBlock', view: 'innerBlock' } );

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
			ListItemFontFamilyIntegration,
			ListItemFontSizeIntegration
		] );
	} );

	describe( 'postfixer', () => {
		describe( 'changing formatting in empty list item', () => {
			it( 'should set attribute in empty li when adding formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">[]</paragraph>'
				);

				setSelectionAttribute( model, 'inlineFormat', 'foo' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" selection:inlineFormat="foo">' +
					'</paragraph>'
				);
			} );

			it( 'should not set attribute in empty block (not li) when adding formatting', () => {
				setModelData( model,
					'<paragraph>[]</paragraph>'
				);

				setSelectionAttribute( model, 'inlineFormat', 'foo' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph selection:inlineFormat="foo"></paragraph>'
				);
			} );

			it( 'should update attribute in empty li when changing formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">[]</paragraph>'
				);

				setSelectionAttribute( model, 'inlineFormat', 'foo' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" selection:inlineFormat="foo">' +
					'</paragraph>'
				);

				setSelectionAttribute( model, 'inlineFormat', 'bar' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="bar" listItemId="a" selection:inlineFormat="bar">' +
					'</paragraph>'
				);
			} );

			it( 'should remove attribute from empty li when removing formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">[]</paragraph>'
				);

				setSelectionAttribute( model, 'inlineFormat', 'foo' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" selection:inlineFormat="foo">' +
					'</paragraph>'
				);

				removeSelectionAttribute( model, 'inlineFormat' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a"></paragraph>'
				);
			} );
		} );

		describe( 'changing formatting on text inside a list item', () => {
			it( 'should set attribute in li when adding formatting on the whole text', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">[<$text>foo</$text>]</paragraph>'
				);

				setAttribute( model, 'inlineFormat', 'foo', docSelection.getFirstRange() );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should not set attribute in li when adding formatting on the part of text', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a"><$text>[fo]o</$text></paragraph>'
				);

				setAttribute( model, 'inlineFormat', 'foo', docSelection.getFirstRange() );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a">' +
						'<$text inlineFormat="foo">fo</$text>' +
						'o' +
					'</paragraph>'
				);
			} );

			it( 'should not set attribute in block (not li) when adding formatting on the whole text', () => {
				setModelData( model,
					'<paragraph>[<$text>foo</$text>]</paragraph>'
				);

				setAttribute( model, 'inlineFormat', 'foo', docSelection.getFirstRange() );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph><$text inlineFormat="foo">foo</$text></paragraph>'
				);
			} );

			it( 'should update attribute in li when changing formatting on the whole text', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'[<$text inlineFormat="foo">foo</$text>]' +
					'</paragraph>'
				);

				setAttribute( model, 'inlineFormat', 'bar', docSelection.getFirstRange() );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="bar" listItemId="a">' +
						'<$text inlineFormat="bar">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should remove attribute from li when changing formatting on the part of text', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'<$text inlineFormat="foo">[fo]o</$text>' +
					'</paragraph>'
				);

				setAttribute( model, 'inlineFormat', 'bar', docSelection.getFirstRange() );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a">' +
						'<$text inlineFormat="bar">fo</$text>' +
						'<$text inlineFormat="foo">o</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should remove attribute from li when removing formatting from the whole text', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'[<$text inlineFormat="foo">foo</$text>]' +
					'</paragraph>'
				);

				removeAttribute( model, 'inlineFormat', docSelection.getFirstRange() );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a">' +
						'foo' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'inserting a text node into a list item', () => {
			it( 'should set attribute on not formatted empty li if inserted text is formatted', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">[]</paragraph>'
				);

				insertText( model, 'foo', { inlineFormat: 'foo' }, docSelection.getFirstPosition() );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should not set attribute in block (not li) if inserted text is formatted', () => {
				setModelData( model,
					'<paragraph>[]</paragraph>'
				);

				insertText( model, 'foo', { inlineFormat: 'foo' }, docSelection.getFirstPosition() );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph><$text inlineFormat="foo">foo</$text></paragraph>'
				);
			} );

			it( 'should not set attribute on not formatted li if inserted text is formatted', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a"><$text>foo[]</$text></paragraph>'
				);

				insertText( model, 'bar', { inlineFormat: 'bar' }, docSelection.getFirstPosition() );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a">' +
						'foo' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should not change attribute on formatted li if inserted text has the same format', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'<$text inlineFormat="foo">foo[]</$text>' +
					'</paragraph>'
				);

				insertText( model, 'bar', { inlineFormat: 'foo' }, docSelection.getFirstPosition() );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'<$text inlineFormat="foo">foobar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should remove attribute from formatted li if inserted text has different format', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'<$text inlineFormat="foo">foo[]</$text>' +
					'</paragraph>'
				);

				insertText( model, 'bar', { inlineFormat: 'bar' }, docSelection.getFirstPosition() );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a">' +
						'<$text inlineFormat="foo">foo</$text>' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'removing text node from a list item', () => {
			it( 'should remove attribute from li if all formatted text is removed', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'[<$text inlineFormat="foo">foo</$text>]' +
					'</paragraph>'
				);

				editor.execute( 'delete' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a"></paragraph>'
				);
			} );

			it( 'should add attribute to li if part of text with a different format is removed', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">' +
						'[<$text inlineFormat="foo">foo</$text>]' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);

				editor.execute( 'delete' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="bar" listItemId="a">' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should not add attribute if part of text with a different format is removed from a block (not li)', () => {
				setModelData( model,
					'<paragraph>' +
						'[<$text inlineFormat="foo">foo</$text>]' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);

				editor.execute( 'delete' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph>' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'other blocks handling (tables etc.)', () => {
			it( 'should not remove attribute form the limit elements (like table)', () => {
				setModelData( model,
					'<limitElement listIndent="0" listItemId="a" listItemFormat="foo"></limitElement>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.equal( 'foo' );
			} );

			it( 'should check all nested items and add attribute when checking if the list item is formatted consistently', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">' +
						'<innerBlock listIndent="0" listItemId="b">' +
							'<$text inlineFormat="foo">foo</$text>' +
						'</innerBlock>' +
					'</paragraph>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'<innerBlock listIndent="0" listItemId="b">' +
							'<$text inlineFormat="foo">foo</$text>' +
						'</innerBlock>' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'list structure modifications', () => {
			it( 'it should add attribute to li after splitting list item with consistent formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'<$text inlineFormat="foo">foo[]bar</$text>' +
					'</paragraph>'
				);

				editor.execute( 'enter' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a"><$text inlineFormat="foo">foo</$text></paragraph>' +
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a00"><$text inlineFormat="foo">bar</$text></paragraph>'
				);
			} );

			it( 'should add attributes after splitting inconsistent formatting if both have consistent formatting afterwards', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">' +
						'<$text inlineFormat="foo">foo[]</$text>' +
						'<$text inlineFormat="bar">bar</$text>' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.be.undefined;

				editor.execute( 'enter' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a"><$text inlineFormat="foo">foo</$text></paragraph>' +
					'<paragraph listIndent="0" listItemFormat="bar" listItemId="a00"><$text inlineFormat="bar">bar</$text></paragraph>'
				);
			} );

			it( 'should add attribute if after deleting part of list, updated list item has consistent formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">' +
						'<$text inlineFormat="foo">foo</$text>' +
						'<$text inlineFormat="bar">[bar</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemId="b">' +
						'<$text inlineFormat="foo">x]yz</$text>' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.be.undefined;

				editor.execute( 'delete' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a"><$text inlineFormat="foo">fooyz</$text></paragraph>'
				);
			} );

			it( 'should remove attribute if after deleting part of list, updated list item has inconsistent formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'<$text inlineFormat="foo">fo[o</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemId="b">' +
						'<$text inlineFormat="foo">xyz</$text>' +
						'<$text inlineFormat="bar">b]ar</$text>' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.equal( 'foo' );

				editor.execute( 'delete' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a">' +
						'<$text inlineFormat="foo">fo</$text>' +
						'<$text inlineFormat="bar">ar</$text>' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'multi-block modifications', () => {
			it( 'should remove attributes when new multi-block item has different formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemId="b">' +
						'<$text inlineFormat="bar">[]bar</$text>' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.equal( 'foo' );
				expect( model.document.getRoot().getChild( 1 ).getAttribute( 'listItemFormat' ) ).to.equal( 'bar' );

				editor.execute( 'mergeListItemBackward' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a"><$text inlineFormat="foo">foo</$text></paragraph>' +
					'<paragraph listIndent="0" listItemId="a"><$text inlineFormat="bar">bar</$text></paragraph>'
				);
			} );

			it( 'should remove attributes when multi-block item has no formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemId="b">' +
						'[]bar' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.equal( 'foo' );
				expect( model.document.getRoot().getChild( 1 ).getAttribute( 'listItemFormat' ) ).to.be.undefined;

				editor.execute( 'mergeListItemBackward' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemId="a">' +
						'bar' +
					'</paragraph>'
				);
			} );

			it( 'should add attribute when empty multi-block item with different selection formatting is removed', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a"></paragraph>]'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.be.undefined;
				expect( model.document.getRoot().getChild( 1 ).getAttribute( 'listItemFormat' ) ).to.be.undefined;

				editor.execute( 'delete' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'changing block item into list item', () => {
			it( 'should set attribute in li when changing a formatted paragraph into li', () => {
				setModelData( model,
					'<paragraph>[<$text inlineFormat="foo">foo</$text>]</paragraph>'
				);

				editor.execute( 'bulletedList' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a00" listType="bulleted">' +
						'<$text inlineFormat="foo">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should not set attribute in li when changing a partly formatted paragraph into li', () => {
				setModelData( model,
					'<paragraph>[<$text inlineFormat="foo">foo</$text>bar]</paragraph>'
				);

				editor.execute( 'bulletedList' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">' +
						'<$text inlineFormat="foo">foo</$text>' +
						'bar' +
					'</paragraph>'
				);
			} );

			it( 'should add attribute if li is empty but has selection formatting', () => {
				setModelData( model,
					'<paragraph>[]</paragraph>'
				);

				setSelectionAttribute( model, 'inlineFormat', 'foo' );

				editor.execute( 'bulletedList' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a00" listType="bulleted" selection:inlineFormat="foo">' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'when 2 formattings registerd', () => {
			it( 'should set both attributes in empty li when adding formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">[]</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.be.undefined;
				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat2' ) ).to.be.undefined;

				setSelectionAttribute( model, 'inlineFormat', 'foo' );
				setSelectionAttribute( model, 'inlineFormat2', 'bar' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemFormat2="bar" ' +
						'listItemId="a" selection:inlineFormat="foo" selection:inlineFormat2="bar">' +
					'</paragraph>'
				);
			} );

			it( 'should update only one attribute when changing one formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">' +
						'[<$text inlineFormat="foo" inlineFormat2="bar">foo</$text>]' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.equal( 'foo' );
				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat2' ) ).to.equal( 'bar' );

				setAttribute( model, 'inlineFormat', 'baz', docSelection.getFirstRange() );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="baz" listItemFormat2="bar" listItemId="a">' +
						'<$text inlineFormat="baz" inlineFormat2="bar">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should remove only one attribute when removing one formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">' +
						'[<$text inlineFormat="foo" inlineFormat2="bar">foo</$text>]' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.equal( 'foo' );
				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat2' ) ).to.equal( 'bar' );

				removeAttribute( model, 'inlineFormat', docSelection.getFirstRange() );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat2="bar" listItemId="a">' +
						'<$text inlineFormat2="bar">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should remove only one attribute when changing part of the content with the second formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">' +
						'<$text inlineFormat="foo" inlineFormat2="bar">[fo]o</$text>' +
					'</paragraph>'
				);

				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat' ) ).to.equal( 'foo' );
				expect( model.document.getRoot().getChild( 0 ).getAttribute( 'listItemFormat2' ) ).to.equal( 'bar' );

				setAttribute( model, 'inlineFormat2', 'baz', docSelection.getFirstRange() );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'<$text inlineFormat="foo" inlineFormat2="baz">fo</$text>' +
						'<$text inlineFormat="foo" inlineFormat2="bar">o</$text>' +
					'</paragraph>'
				);
			} );
		} );
	} );

	class MyPlugin extends Plugin {
		init() {
			const ListFormatting = this.editor.plugins.get( 'ListFormatting' );

			ListFormatting.registerFormatAttribute( 'listItemFormat', 'inlineFormat' );
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

			ListFormatting.registerFormatAttribute( 'listItemFormat2', 'inlineFormat2' );
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
