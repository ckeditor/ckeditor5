/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import ListFormatting from '../src/listformatting.js';
import ListItemFontFamilyIntegration from '../src/listformatting/listitemfontfamilyintegration.js';

describe( 'ListFormatting', () => {
	let editor, model, docSelection;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ ListFormatting, Paragraph, MyPlugin ]
		} );

		model = editor.model;
		docSelection = model.document.selection;

		model.schema.extend( '$text', { allowAttributes: 'inlineFormat' } );
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
			ListItemFontFamilyIntegration
		] );
	} );

	describe( 'postfixer', () => {
		describe( 'changing formatting in empty list item', () => {
			it( 'should set attribute in empty li when adding formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">[]</paragraph>'
				);

				model.change( writer => {
					writer.setSelectionAttribute( 'inlineFormat', 'foo' );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" selection:inlineFormat="foo">' +
					'</paragraph>'
				);
			} );

			it( 'should not set attribute in empty block (not li) when adding formatting', () => {
				setModelData( model,
					'<paragraph>[]</paragraph>'
				);

				model.change( writer => {
					writer.setSelectionAttribute( 'inlineFormat', 'foo' );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph selection:inlineFormat="foo"></paragraph>'
				);
			} );

			it( 'should update attribute in empty li when changing formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">[]</paragraph>'
				);

				model.change( writer => {
					writer.setSelectionAttribute( 'inlineFormat', 'foo' );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" selection:inlineFormat="foo">' +
					'</paragraph>'
				);

				model.change( writer => {
					writer.setSelectionAttribute( 'inlineFormat', 'bar' );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="bar" listItemId="a" selection:inlineFormat="bar">' +
					'</paragraph>'
				);
			} );

			it( 'should remove attribute from empty li when removing formatting', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a">[]</paragraph>'
				);

				model.change( writer => {
					writer.setSelectionAttribute( 'inlineFormat', 'foo' );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a" selection:inlineFormat="foo">' +
					'</paragraph>'
				);

				model.change( writer => {
					writer.removeSelectionAttribute( 'inlineFormat' );
				} );

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

				model.change( writer => {
					writer.setAttribute( 'inlineFormat', 'foo', docSelection.getFirstRange() );
				} );

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

				model.change( writer => {
					writer.setAttribute( 'inlineFormat', 'foo', docSelection.getFirstRange() );
				} );

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

				model.change( writer => {
					writer.setAttribute( 'inlineFormat', 'foo', docSelection.getFirstRange() );
				} );

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

				model.change( writer => {
					writer.setAttribute( 'inlineFormat', 'bar', docSelection.getFirstRange() );
				} );

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

				model.change( writer => {
					writer.setAttribute( 'inlineFormat', 'bar', docSelection.getFirstRange() );
				} );

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

				model.change( writer => {
					writer.removeAttribute( 'inlineFormat', docSelection.getFirstRange() );
				} );

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

				model.change( writer => {
					const textNode = writer.createText( 'foo', { inlineFormat: 'foo' } );
					writer.insert( textNode, docSelection.getFirstPosition() );
				} );

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

				model.change( writer => {
					const textNode = writer.createText( 'foo', { inlineFormat: 'foo' } );
					writer.insert( textNode, docSelection.getFirstPosition() );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph><$text inlineFormat="foo">foo</$text></paragraph>'
				);
			} );

			it( 'should not set attribute on not formatted li if inserted text is formatted', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a"><$text>foo[]</$text></paragraph>'
				);

				model.change( writer => {
					const textNode = writer.createText( 'bar', { inlineFormat: 'foo' } );
					writer.insert( textNode, docSelection.getFirstPosition() );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a">' +
						'foo' +
						'<$text inlineFormat="foo">bar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should not change attribute on formatted li if inserted text has the same format', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemFormat="foo" listItemId="a">' +
						'<$text inlineFormat="foo">foo[]</$text>' +
					'</paragraph>'
				);

				model.change( writer => {
					const textNode = writer.createText( 'bar', { inlineFormat: 'foo' } );
					writer.insert( textNode, docSelection.getFirstPosition() );
				} );

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

				model.change( writer => {
					const textNode = writer.createText( 'bar', { inlineFormat: 'bar' } );
					writer.insert( textNode, docSelection.getFirstPosition() );
				} );

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
	} );

	class MyPlugin extends Plugin {
		init() {
			const ListFormatting = this.editor.plugins.get( 'ListFormatting' );

			ListFormatting._addFormatting( 'listItemFormat', 'inlineFormat' );
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
} );
