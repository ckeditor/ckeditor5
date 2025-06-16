/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import stubUid from '../list/_utils/uid.js';
import ListEditing from '../../src/list/listediting.js';
import ListItemBoldIntegration from '../../src/listformatting/listitemboldintegration.js';

describe( 'ListItemBoldIntegration', () => {
	let editor, model, view;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				ListItemBoldIntegration,
				BoldEditing,
				Paragraph,
				BlockQuoteEditing,
				CodeBlockEditing,
				HeadingEditing,
				TableEditing
			]
		} );

		model = editor.model;
		view = editor.editing.view;

		stubUid();
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( ListItemBoldIntegration.pluginName ).to.equal( 'ListItemBoldIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListItemBoldIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListItemBoldIntegration.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListItemBoldIntegration ) ).to.be.instanceOf( ListItemBoldIntegration );
	} );

	it( 'should require ListEditing plugin', () => {
		expect( ListItemBoldIntegration.requires ).to.deep.equal( [
			ListEditing
		] );
	} );

	describe( 'schema', () => {
		it( 'should allow listItemBold attribute in $listItem', () => {
			model.schema.register( 'myElement', {
				inheritAllFrom: '$block',
				allowAttributesOf: '$listItem'
			} );

			const modelElement = new ModelElement( 'myElement', { listItemId: 'a' } );

			expect( model.schema.checkAttribute( [ '$root', modelElement ], 'listItemBold' ) ).to.be.true;
		} );

		it( 'listItemBold attribute should have isFormatting set to true', () => {
			expect( model.schema.getAttributeProperties( 'listItemBold' ) ).to.include( {
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

			expect( model.schema.checkAttribute( [ '$root', listItemParagraph ], 'listItemBold' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemBlockQuote ], 'listItemBold' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemHeading ], 'listItemBold' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemTable ], 'listItemBold' ) ).to.be.true;

			expect( model.schema.checkAttribute( [ '$root', paragraph ], 'listItemBold' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', blockQuote ], 'listItemBold' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', heading ], 'listItemBold' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', table ], 'listItemBold' ) ).to.be.false;
		} );
	} );

	describe( 'downcast', () => {
		it( 'should downcast listItemBold attribute as class in <li>', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemBold="true">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-bold">' +
						'<span class="ck-list-bogus-paragraph">' +
							'<strong>foo</strong>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-bold">' +
						'<strong>foo</strong>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemBold attribute as class in nested list', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemBold="true">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listItemBold="true">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-bold">' +
						'<span class="ck-list-bogus-paragraph">' +
							'<strong>foo</strong>' +
						'</span>' +
						'<ul>' +
							'<li class="ck-bold">' +
								'<span class="ck-list-bogus-paragraph">' +
									'<strong>foo</strong>' +
								'</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-bold">' +
						'<strong>foo</strong>' +
						'<ul>' +
							'<li class="ck-bold">' +
								'<strong>' +
									'foo' +
								'</strong>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemBold attribute as class in <li> in multi-block', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemBold="true">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listItemBold="true">' +
					'<$text bold="true">bar</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-bold">' +
						'<p>' +
							'<strong>foo</strong>' +
						'</p>' +
						'<p>' +
							'<strong>bar</strong>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-bold">' +
						'<p>' +
							'<strong>foo</strong>' +
						'</p>' +
						'<p>' +
							'<strong>bar</strong>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemBold attribute as class in <li> in blockquote list item', () => {
			setModelData( model,
				'<blockQuote listIndent="0" listItemId="a" listItemBold="true">' +
					'<paragraph>' +
						'<$text bold="true">foo</$text>' +
					'</paragraph>' +
				'</blockQuote>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-bold">' +
						'<blockquote>' +
							'<p>' +
								'<strong>foo</strong>' +
							'</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-bold">' +
						'<blockquote>' +
							'<p>' +
								'<strong>foo</strong>' +
							'</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemBold attribute as class in <li> in heading list item', () => {
			setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listItemBold="true">' +
					'<$text bold="true">foo</$text>' +
				'</heading1>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-bold">' +
						'<h2>' +
							'<strong>foo</strong>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-bold">' +
						'<h2>' +
							'<strong>foo</strong>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemBold attribute as class in <li> in table list item', () => {
			setModelData( model,
				'<table listIndent="0" listItemId="a" listItemBold="true">' +
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
					'<li class="ck-bold">' +
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
					'<li class="ck-bold">' +
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
	} );

	describe( 'upcast', () => {
		it( 'should upcast class in <li> to listItemBold attribute (unordered list)', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-bold">' +
						'<strong>foo</strong>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemBold="true" listItemId="a00" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast class in <li> to listItemBold attribute (ordered list)', () => {
			editor.setData(
				'<ol>' +
					'<li class="ck-bold">' +
						'<strong>foo</strong>' +
					'</li>' +
				'</ol>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemBold="true" listItemId="a00" listType="numbered">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should only upcast class set in <li> (not <ul> and not <p>)', () => {
			editor.setData(
				'<ul class="ck-bold;">' +
					'<li class="ck-bold">' +
						'<p class="ck-bold;">' +
							'<strong>foo</strong>' +
						'</p>' +
					'</li>' +
				'</ul>' +
				'<p class="ck-bold;">baz</p>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemBold="true" listItemId="a00" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>' +
				'<paragraph>baz</paragraph>'
			);
		} );

		it( 'should upcast class in <li> to listItemBold attribute (nested list)', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-bold">' +
						'<strong>foo</strong>' +
						'<ul>' +
							'<li class="ck-bold">' +
								'<strong>bar</strong>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemBold="true" listItemId="a01" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemBold="true" listItemId="a00" listType="bulleted">' +
					'<$text bold="true">bar</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast class in <li> to listItemBold attribute in multi-block', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-bold">' +
						'<p>' +
							'<strong>foo</strong>' +
						'</p>' +
						'<p>' +
							'<strong>bar</strong>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemBold="true" listItemId="a00" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemBold="true" listItemId="a00" listType="bulleted">' +
					'<$text bold="true">bar</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast class in <li> to listItemBold attribute for blockquote', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-bold">' +
						'<blockquote>' +
							'<strong>foo</strong>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<blockQuote listIndent="0" listItemBold="true" listItemId="a00" listType="bulleted">' +
					'<paragraph>' +
						'<$text bold="true">foo</$text>' +
					'</paragraph>' +
				'</blockQuote>'
			);
		} );

		it( 'should upcast class in <li> to listItemBold attribute for heading', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-bold">' +
						'<h2>' +
							'<strong>foo</strong>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<heading1 listIndent="0" listItemBold="true" listItemId="a00" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</heading1>'
			);
		} );

		it( 'should upcast class in <li> to listItemBold attribute for table', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-bold">' +
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

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<table listIndent="0" listItemBold="true" listItemId="a00" listType="bulleted">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>' +
								'foo' +
							'</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );
	} );

	describe( 'when BoldEditing is not loaded', () => {
		let editor, model, view;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [
					ListItemBoldIntegration,
					Paragraph
				]
			} );

			model = editor.model;
			view = editor.editing.view;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not downcast listItemBold attribute as class in <li>', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemBold="true">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li>' +
						'<p>' +
							'foo' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li>' +
						'<p>' +
							'foo' +
						'</p>' +
					'</li>' +
				'</ul>'
			);
		} );
	} );
} );
