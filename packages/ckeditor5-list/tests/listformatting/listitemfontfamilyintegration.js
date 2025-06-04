/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import FontFamilyEditing from '@ckeditor/ckeditor5-font/src/fontfamily/fontfamilyediting.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import stubUid from '../list/_utils/uid.js';
import ListEditing from '../../src/list/listediting.js';
import ListItemFontFamilyIntegration from '../../src/listformatting/listitemfontfamilyintegration.js';

describe( 'ListItemFontFamilyIntegration', () => {
	let editor, model, view;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				ListItemFontFamilyIntegration,
				FontFamilyEditing,
				Paragraph,
				BlockQuoteEditing,
				CodeBlockEditing,
				HeadingEditing,
				TableEditing
			],
			fontFamily: {
				supportAllValues: true
			}
		} );

		model = editor.model;
		view = editor.editing.view;

		stubUid();
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( ListItemFontFamilyIntegration.pluginName ).to.equal( 'ListItemFontFamilyIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListItemFontFamilyIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListItemFontFamilyIntegration.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListItemFontFamilyIntegration ) ).to.be.instanceOf( ListItemFontFamilyIntegration );
	} );

	it( 'should require ListEditing plugin', () => {
		expect( ListItemFontFamilyIntegration.requires ).to.deep.equal( [
			ListEditing
		] );
	} );

	describe( 'schema', () => {
		it( 'should allow listItemFontFamily attribute in $listItem', () => {
			expect( model.schema.checkAttribute( [ '$root', '$listItem' ], 'listItemFontFamily' ) ).to.be.true;
		} );

		it( 'listItemFontFamily attribute should have isFormatting set to true', () => {
			expect( editor.model.schema.getAttributeProperties( 'listItemFontFamily' ) ).to.include( {
				isFormatting: true
			} );
		} );

		it( 'should set proper schema rules', () => {
			const listItemParagraph = new ModelElement( 'paragraph', { listItemId: 'a' } );
			const listItemBlockQuote = new ModelElement( 'blockQuote', { listItemId: 'a' } );
			const listItemHeading = new ModelElement( 'heading1', { listItemId: 'a' } );
			const listItemTable = new ModelElement( 'table', { listItemId: 'a' } );

			const paragraph = new ModelElement( 'paragraph' );
			const blockQuote = new ModelElement( 'blockQuote' );
			const heading = new ModelElement( 'heading1' );
			const table = new ModelElement( 'table' );

			expect( model.schema.checkAttribute( [ '$root', listItemParagraph ], 'listItemFontFamily' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemBlockQuote ], 'listItemFontFamily' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemHeading ], 'listItemFontFamily' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemTable ], 'listItemFontFamily' ) ).to.be.true;

			expect( model.schema.checkAttribute( [ '$root', paragraph ], 'listItemFontFamily' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', blockQuote ], 'listItemFontFamily' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', heading ], 'listItemFontFamily' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', table ], 'listItemFontFamily' ) ).to.be.false;
		} );
	} );

	describe( 'downcast', () => {
		it( 'should downcast listItemFontFamily attribute as style in <li>', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontFamily="Arial">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li style="font-family:Arial">' +
						'<span class="ck-list-bogus-paragraph">' +
							'<span style="font-family:Arial">foo</span>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li style="font-family:Arial;">' +
						'<span style="font-family:Arial;">foo</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontFamily attribute as style in nested list', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontFamily="Arial">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listItemFontFamily="Arial">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li style="font-family:Arial">' +
						'<span class="ck-list-bogus-paragraph">' +
							'<span style="font-family:Arial">foo</span>' +
						'</span>' +
						'<ul>' +
							'<li style="font-family:Arial">' +
								'<span class="ck-list-bogus-paragraph">' +
									'<span style="font-family:Arial">foo</span>' +
								'</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li style="font-family:Arial;">' +
						'<span style="font-family:Arial;">foo</span>' +
						'<ul>' +
							'<li style="font-family:Arial;">' +
								'<span style="font-family:Arial;">foo</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontFamily attribute as style in <li> in multi-block', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontFamily="Arial">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listItemFontFamily="Arial">' +
					'<$text fontFamily="Arial">bar</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li style="font-family:Arial">' +
						'<p>' +
							'<span style="font-family:Arial">foo</span>' +
						'</p>' +
						'<p>' +
							'<span style="font-family:Arial">bar</span>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li style="font-family:Arial;">' +
						'<p>' +
							'<span style="font-family:Arial;">foo</span>' +
						'</p>' +
						'<p>' +
							'<span style="font-family:Arial;">bar</span>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontFamily attribute as style in <li> in blockquote list item', () => {
			setModelData( model,
				'<blockQuote listIndent="0" listItemId="a" listItemFontFamily="Arial">' +
					'<paragraph>' +
						'<$text fontFamily="Arial">foo</$text>' +
					'</paragraph>' +
				'</blockQuote>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li style="font-family:Arial">' +
						'<blockquote>' +
							'<p>' +
								'<span style="font-family:Arial">foo</span>' +
							'</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li style="font-family:Arial;">' +
						'<blockquote>' +
							'<p>' +
								'<span style="font-family:Arial;">foo</span>' +
							'</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontFamily attribute as style in <li> in heading list item', () => {
			setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listItemFontFamily="Arial">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</heading1>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li style="font-family:Arial">' +
						'<h2>' +
							'<span style="font-family:Arial">foo</span>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li style="font-family:Arial;">' +
						'<h2>' +
							'<span style="font-family:Arial;">foo</span>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontFamily attribute as style in <li> in table list item', () => {
			setModelData( model,
				'<table listIndent="0" listItemId="a" listItemFontFamily="Arial">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>' +
								'foo' +
							'</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li style="font-family:Arial">' +
						'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
							'<div class="ck ck-widget__selection-handle"></div>' +
							'<table>' +
								'<tbody>' +
									'<tr>' +
										'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" ' +
											'tabindex="-1">' +
											'<span class="ck-table-bogus-paragraph">' +
												'foo' +
											'</span>' +
										'</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li style="font-family:Arial;">' +
						'<figure class="table">' +
							'<table>' +
								'<tbody>' +
									'<tr>' +
										'<td>' +
											'foo' +
										'</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should not downcast listItemFontFamily attribute if value is empty', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontFamily="">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li>' +
						'<span class="ck-list-bogus-paragraph">' +
							'<span style="font-family:Arial">foo</span>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li>' +
						'<span style="font-family:Arial;">foo</span>' +
					'</li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'upcast', () => {
		it( 'should upcast style in <li> to listItemFontFamily attribute (unordered list)', () => {
			editor.setData(
				'<ul>' +
					'<li style="font-family:Arial;">' +
						'<span style="font-family:Arial;">foo</span>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast style in <li> to listItemFontFamily attribute (ordered list)', () => {
			editor.setData(
				'<ol>' +
					'<li style="font-family:Arial;">' +
						'<span style="font-family:Arial;">foo</span>' +
					'</li>' +
				'</ol>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="numbered">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should only upcast style set in <li> (not <ul> and not <p>)', () => {
			editor.setData(
				'<ul style="font-family:Tahoma;">' +
					'<li style="font-family:Arial;">' +
						'<p style="font-family:Verdana;">' +
							'<span style="font-family:Arial;">foo</span>' +
						'</p>' +
					'</li>' +
				'</ul>' +
				'<p style="font-family:Helvetica;">baz</p>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>' +
				'<paragraph>baz</paragraph>'
			);
		} );

		it( 'should upcast style in <li> to listItemFontFamily attribute (nested list)', () => {
			editor.setData(
				'<ul>' +
					'<li style="font-family:Arial;">' +
						'<span style="font-family:Arial;">foo</span>' +
						'<ul>' +
							'<li style="font-family:Arial;">' +
								'<span style="font-family:Arial;">bar</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontFamily="Arial" listItemId="a01" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemFontFamily="Arial" listItemId="a00" listType="bulleted">' +
					'<$text fontFamily="Arial">bar</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast style in <li> to listItemFontFamily attribute in multi-block', () => {
			editor.setData(
				'<ul>' +
					'<li style="font-family:Arial;">' +
						'<p>' +
							'<span style="font-family:Arial;">foo</span>' +
						'</p>' +
						'<p>' +
							'<span style="font-family:Arial;">bar</span>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="bulleted">' +
					'<$text fontFamily="Arial">bar</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast style in <li> to listItemFontFamily attribute for blockquote', () => {
			editor.setData(
				'<ul>' +
					'<li style="font-family:Arial;">' +
						'<blockquote>' +
							'<span style="font-family:Arial;">foo</span>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<blockQuote listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="bulleted">' +
					'<paragraph>' +
						'<$text fontFamily="Arial">foo</$text>' +
					'</paragraph>' +
				'</blockQuote>'
			);
		} );

		it( 'should upcast style in <li> to listItemFontFamily attribute for heading', () => {
			editor.setData(
				'<ul>' +
					'<li style="font-family:Arial;">' +
						'<h2>' +
							'<span style="font-family:Arial;">foo</span>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<heading1 listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</heading1>'
			);
		} );

		it( 'should upcast style in <li> to listItemFontFamily attribute for table', () => {
			editor.setData(
				'<ul>' +
					'<li style="font-family:Arial;">' +
						'<figure class="table">' +
							'<table>' +
								'<tbody>' +
									'<tr>' +
										'<td>' +
											'<span style="font-family:Arial;">foo</span>' +
										'</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<table listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="bulleted">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>' +
								'<$text fontFamily="Arial">foo</$text>' +
							'</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );
	} );
} );
