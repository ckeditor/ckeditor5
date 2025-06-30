/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Paragraph } from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { BlockQuoteEditing } from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import { CodeBlockEditing } from '@ckeditor/ckeditor5-code-block/src/codeblockediting.js';
import { HeadingEditing } from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import { TableEditing } from '@ckeditor/ckeditor5-table/src/tableediting.js';
import { FontColorEditing } from '@ckeditor/ckeditor5-font/src/fontcolor/fontcolorediting.js';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ModelElement } from '@ckeditor/ckeditor5-engine/src/model/element.js';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { _setModelData, _getModelData, _stringifyModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { _getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import { stubUid } from '../list/_utils/uid.js';
import { ListEditing } from '../../src/list/listediting.js';
import { ListItemFontColorIntegration } from '../../src/listformatting/listitemfontcolorintegration.js';

describe( 'ListItemFontColorIntegration', () => {
	let editor, model, view;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				ListItemFontColorIntegration,
				FontColorEditing,
				Paragraph,
				BlockQuoteEditing,
				CodeBlockEditing,
				HeadingEditing,
				TableEditing,
				ClipboardPipeline
			]
		} );

		model = editor.model;
		view = editor.editing.view;

		stubUid();
		sinon.stub( editor.editing.view, 'scrollToTheSelection' );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( ListItemFontColorIntegration.pluginName ).to.equal( 'ListItemFontColorIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListItemFontColorIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListItemFontColorIntegration.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListItemFontColorIntegration ) ).to.be.instanceOf( ListItemFontColorIntegration );
	} );

	it( 'should require ListEditing plugin', () => {
		expect( ListItemFontColorIntegration.requires ).to.deep.equal( [
			ListEditing
		] );
	} );

	describe( 'schema', () => {
		it( 'should allow listItemFontColor attribute in $listItem', () => {
			model.schema.register( 'myElement', {
				inheritAllFrom: '$block',
				allowAttributesOf: '$listItem'
			} );

			const modelElement = new ModelElement( 'myElement', { listItemId: 'a' } );

			expect( model.schema.checkAttribute( [ '$root', modelElement ], 'listItemFontColor' ) ).to.be.true;
		} );

		it( 'listItemFontColor attribute should have isFormatting set to true', () => {
			expect( model.schema.getAttributeProperties( 'listItemFontColor' ) ).to.include( {
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

			expect( model.schema.checkAttribute( [ '$root', listItemParagraph ], 'listItemFontColor' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemBlockQuote ], 'listItemFontColor' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemHeading ], 'listItemFontColor' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemTable ], 'listItemFontColor' ) ).to.be.true;

			expect( model.schema.checkAttribute( [ '$root', paragraph ], 'listItemFontColor' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', blockQuote ], 'listItemFontColor' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', heading ], 'listItemFontColor' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', table ], 'listItemFontColor' ) ).to.be.false;
		} );
	} );

	describe( 'downcast', () => {
		it( 'should downcast listItemFontColor attribute as style in <li>', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontColor="red" listType="bulleted">' +
					'<$text fontColor="red">foo</$text>' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red">' +
						'<span class="ck-list-bogus-paragraph">' +
							'<span style="color:red">foo</span>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
						'<span style="color:red;">foo</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontColor attribute as style in nested list', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontColor="red" listType="bulleted">' +
					'<$text fontColor="red">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listItemFontColor="red" listType="bulleted">' +
					'<$text fontColor="red">foo</$text>' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red">' +
						'<span class="ck-list-bogus-paragraph">' +
							'<span style="color:red">foo</span>' +
						'</span>' +
						'<ul>' +
							'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red">' +
								'<span class="ck-list-bogus-paragraph">' +
									'<span style="color:red">foo</span>' +
								'</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
						'<span style="color:red;">foo</span>' +
						'<ul>' +
							'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
								'<span style="color:red;">foo</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontColor attribute as style in <li> in multi-block', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontColor="red" listType="bulleted">' +
					'<$text fontColor="red">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listItemFontColor="red" listType="bulleted">' +
					'<$text fontColor="red">bar</$text>' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red">' +
						'<p>' +
							'<span style="color:red">foo</span>' +
						'</p>' +
						'<p>' +
							'<span style="color:red">bar</span>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
						'<p>' +
							'<span style="color:red;">foo</span>' +
						'</p>' +
						'<p>' +
							'<span style="color:red;">bar</span>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontColor attribute as style in <li> in blockquote list item', () => {
			_setModelData( model,
				'<blockQuote listIndent="0" listItemId="a" listItemFontColor="red" listType="bulleted">' +
					'<paragraph>' +
						'<$text fontColor="red">foo</$text>' +
					'</paragraph>' +
				'</blockQuote>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red">' +
						'<blockquote>' +
							'<p>' +
								'<span style="color:red">foo</span>' +
							'</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
						'<blockquote>' +
							'<p>' +
								'<span style="color:red;">foo</span>' +
							'</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontColor attribute as style in <li> in heading list item', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listItemFontColor="red" listType="bulleted">' +
					'<$text fontColor="red">foo</$text>' +
				'</heading1>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red">' +
						'<h2>' +
							'<span style="color:red">foo</span>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
						'<h2>' +
							'<span style="color:red;">foo</span>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);
		} );

		// Post-fixer currently removes `listItemFontColor` attribute from table list items.
		it.skip( 'should downcast listItemFontColor attribute as style in <li> in table list item', () => {
			_setModelData( model,
				'<table listIndent="0" listItemId="a" listItemFontColor="red" listType="bulleted">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>' +
								'foo' +
							'</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red">' +
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

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
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
		it( 'should upcast style in <li> to listItemFontColor attribute (unordered list)', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
						'<span style="color:red;">foo</span>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontColor="red" listItemId="a00" listType="bulleted">' +
					'<$text fontColor="red">foo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast style in <li> to listItemFontColor attribute (ordered list)', () => {
			editor.setData(
				'<ol>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
						'<span style="color:red;">foo</span>' +
					'</li>' +
				'</ol>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontColor="red" listItemId="a00" listType="numbered">' +
					'<$text fontColor="red">foo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should only upcast style set in <li> (not <ul> and not <p>)', () => {
			editor.setData(
				'<ul class="ck-list-marker-color" style="--ck-content-list-marker-color:blue;">' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
						'<p class="ck-list-marker-color" style="--ck-content-list-marker-color:green;">' +
							'<span style="color:red;">foo</span>' +
						'</p>' +
					'</li>' +
				'</ul>' +
				'<p class="ck-list-marker-color" style="--ck-content-list-marker-color:orange;">baz</p>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontColor="red" listItemId="a00" listType="bulleted">' +
					'<$text fontColor="red">foo</$text>' +
				'</paragraph>' +
				'<paragraph>baz</paragraph>'
			);
		} );

		it( 'should upcast style in <li> to listItemFontColor attribute (nested list)', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
						'<span style="color:red;">foo</span>' +
						'<ul>' +
							'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
								'<span style="color:red;">bar</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontColor="red" listItemId="a01" listType="bulleted">' +
					'<$text fontColor="red">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemFontColor="red" listItemId="a00" listType="bulleted">' +
					'<$text fontColor="red">bar</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast style in <li> to listItemFontColor attribute in multi-block', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
						'<p>' +
							'<span style="color:red;">foo</span>' +
						'</p>' +
						'<p>' +
							'<span style="color:red;">bar</span>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontColor="red" listItemId="a00" listType="bulleted">' +
					'<$text fontColor="red">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemFontColor="red" listItemId="a00" listType="bulleted">' +
					'<$text fontColor="red">bar</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast style in <li> to listItemFontColor attribute for blockquote', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
						'<blockquote>' +
							'<span style="color:red;">foo</span>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<blockQuote listIndent="0" listItemFontColor="red" listItemId="a00" listType="bulleted">' +
					'<paragraph>' +
						'<$text fontColor="red">foo</$text>' +
					'</paragraph>' +
				'</blockQuote>'
			);
		} );

		it( 'should upcast style in <li> to listItemFontColor attribute for heading', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
						'<h2>' +
							'<span style="color:red;">foo</span>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<heading1 listIndent="0" listItemFontColor="red" listItemId="a00" listType="bulleted">' +
					'<$text fontColor="red">foo</$text>' +
				'</heading1>'
			);
		} );

		// Post-fixer currently removes `listItemFontColor` attribute from table list items.
		it.skip( 'should upcast style in <li> to listItemFontColor attribute for table', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
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

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<table listIndent="0" listItemFontColor="red" listItemId="a00" listType="bulleted">' +
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

		it( 'should upcast and consume class', () => {
			const upcastCheck = sinon.spy( ( evt, data, conversionApi ) => {
				expect( conversionApi.consumable.test( data.viewItem, { classes: 'ck-list-marker-color' } ) ).to.be.false;
				expect( conversionApi.consumable.test( data.viewItem, { styles: '--ck-content-list-marker-color' } ) ).to.be.false;
			} );

			editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:li', upcastCheck, { priority: 'lowest' } ) );

			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">' +
						'<span style="color:red">foo</span>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontColor="red" listItemId="a00" listType="bulleted">' +
					'<$text fontColor="red">foo</$text>' +
				'</paragraph>'
			);

			expect( upcastCheck.calledOnce ).to.be.true;
		} );
	} );

	describe( 'clipboard integration', () => {
		it( 'should upcast marker class without using post-fixer', () => {
			const dataTransferMock = createDataTransfer( {
				'text/html': '<ol><li class="ck-list-marker-color" style="--ck-content-list-marker-color:red;">foo</li></ol>'
			} );

			const spy = sinon.stub( editor.model, 'insertContent' );

			editor.editing.view.document.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock
			} );

			sinon.assert.calledOnce( spy );

			const content = spy.firstCall.args[ 0 ];

			expect( _stringifyModel( content ) ).to.equal(
				'<paragraph listIndent="0" listItemFontColor="red" listItemId="a00" listType="numbered">' +
					'foo' +
				'</paragraph>'
			);
		} );

		function createDataTransfer( data ) {
			const state = Object.create( data || {} );

			return {
				getData( type ) {
					return state[ type ];
				},
				setData( type, newData ) {
					state[ type ] = newData;
				}
			};
		}
	} );

	describe( 'when enableListItemMarkerFormatting is false', () => {
		let editor, model, view;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [
					ListItemFontColorIntegration,
					FontColorEditing,
					Paragraph
				],
				list: {
					enableListItemMarkerFormatting: false
				}
			} );

			model = editor.model;
			view = editor.editing.view;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not downcast listItemFontColor attribute as style in <li>', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontColor="red">' +
					'<$text fontColor="red">foo</$text>' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li>' +
						'<p>' +
							'<span style="color:red">foo</span>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li>' +
						'<p>' +
							'<span style="color:red;">foo</span>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'when FontColorEditing is not loaded', () => {
		let editor, model, view;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [
					ListItemFontColorIntegration,
					Paragraph
				]
			} );

			model = editor.model;
			view = editor.editing.view;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not downcast listItemFontColor attribute as style in <li>', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontColor="red" listType="bulleted">' +
					'<$text fontColor="red">foo</$text>' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li>' +
						'<p>' +
							'foo' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
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
