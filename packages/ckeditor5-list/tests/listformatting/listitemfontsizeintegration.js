/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import FontSizeEditing from '@ckeditor/ckeditor5-font/src/fontsize/fontsizeediting.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element.js';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import {
	setData as setModelData,
	getData as getModelData,
	stringify as stringifyModel
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import stubUid from '../list/_utils/uid.js';
import ListEditing from '../../src/list/listediting.js';
import ListItemFontSizeIntegration from '../../src/listformatting/listitemfontsizeintegration.js';

describe( 'ListItemFontSizeIntegration', () => {
	let editor, model, view;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				ListItemFontSizeIntegration,
				FontSizeEditing,
				Paragraph,
				BlockQuoteEditing,
				CodeBlockEditing,
				HeadingEditing,
				TableEditing,
				ClipboardPipeline
			],
			fontSize: {
				options: [
					10,
					11,
					12,
					13,
					'tiny',
					'small',
					'big'
				]
			}
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
		expect( ListItemFontSizeIntegration.pluginName ).to.equal( 'ListItemFontSizeIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListItemFontSizeIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListItemFontSizeIntegration.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListItemFontSizeIntegration ) ).to.be.instanceOf( ListItemFontSizeIntegration );
	} );

	it( 'should require ListEditing plugin', () => {
		expect( ListItemFontSizeIntegration.requires ).to.deep.equal( [
			ListEditing
		] );
	} );

	describe( 'schema', () => {
		it( 'should allow listItemFontSize attribute in $listItem', () => {
			model.schema.register( 'myElement', {
				inheritAllFrom: '$block',
				allowAttributesOf: '$listItem'
			} );

			const modelElement = new ModelElement( 'myElement', { listItemId: 'a' } );

			expect( model.schema.checkAttribute( [ '$root', modelElement ], 'listItemFontSize' ) ).to.be.true;
		} );

		it( 'listItemFontSize attribute should have isFormatting set to true', () => {
			expect( model.schema.getAttributeProperties( 'listItemFontSize' ) ).to.include( {
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

			expect( model.schema.checkAttribute( [ '$root', listItemParagraph ], 'listItemFontSize' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemBlockQuote ], 'listItemFontSize' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemHeading ], 'listItemFontSize' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemTable ], 'listItemFontSize' ) ).to.be.true;

			expect( model.schema.checkAttribute( [ '$root', paragraph ], 'listItemFontSize' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', blockQuote ], 'listItemFontSize' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', heading ], 'listItemFontSize' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', table ], 'listItemFontSize' ) ).to.be.false;
		} );
	} );

	describe( 'named presets (classes)', () => {
		describe( 'downcast', () => {
			it( 'should downcast listItemFontSize attribute as class in <li>', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listItemFontSize="tiny" listType="bulleted">' +
						'<$text fontSize="tiny">foo</$text>' +
					'</paragraph>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span class="text-tiny">foo</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData() ).to.equalMarkup(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<span class="text-tiny">foo</span>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'should downcast listItemFontSize attribute as class in nested list', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listItemFontSize="tiny" listType="bulleted">' +
						'<$text fontSize="tiny">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listItemFontSize="tiny" listType="bulleted">' +
						'<$text fontSize="tiny">foo</$text>' +
					'</paragraph>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span class="text-tiny">foo</span>' +
							'</span>' +
							'<ul>' +
								'<li class="ck-list-marker-font-size-tiny">' +
									'<span class="ck-list-bogus-paragraph">' +
										'<span class="text-tiny">foo</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData() ).to.equalMarkup(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<span class="text-tiny">foo</span>' +
							'<ul>' +
								'<li class="ck-list-marker-font-size-tiny">' +
									'<span class="text-tiny">foo</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'should downcast listItemFontSize attribute as class in <li> in multi-block', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listItemFontSize="tiny" listType="bulleted">' +
						'<$text fontSize="tiny">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listItemFontSize="tiny" listType="bulleted">' +
						'<$text fontSize="tiny">bar</$text>' +
					'</paragraph>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<p>' +
								'<span class="text-tiny">foo</span>' +
							'</p>' +
							'<p>' +
								'<span class="text-tiny">bar</span>' +
							'</p>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData() ).to.equalMarkup(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<p>' +
								'<span class="text-tiny">foo</span>' +
							'</p>' +
							'<p>' +
								'<span class="text-tiny">bar</span>' +
							'</p>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'should downcast listItemFontSize attribute as class in <li> in blockquote list item', () => {
				setModelData( model,
					'<blockQuote listIndent="0" listItemId="a" listItemFontSize="tiny" listType="bulleted">' +
						'<paragraph>' +
							'<$text fontSize="tiny">foo</$text>' +
						'</paragraph>' +
					'</blockQuote>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<blockquote>' +
								'<p>' +
									'<span class="text-tiny">foo</span>' +
								'</p>' +
							'</blockquote>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData() ).to.equalMarkup(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<blockquote>' +
								'<p>' +
									'<span class="text-tiny">foo</span>' +
								'</p>' +
							'</blockquote>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'should downcast listItemFontSize attribute as class in <li> in heading list item', () => {
				setModelData( model,
					'<heading1 listIndent="0" listItemId="a" listItemFontSize="tiny" listType="bulleted">' +
						'<$text fontSize="tiny">foo</$text>' +
					'</heading1>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<h2>' +
								'<span class="text-tiny">foo</span>' +
							'</h2>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData() ).to.equalMarkup(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<h2>' +
								'<span class="text-tiny">foo</span>' +
							'</h2>' +
						'</li>' +
					'</ul>'
				);
			} );

			// Post-fixer currently removes `listItemFontSize` attribute from table list items.
			it.skip( 'should downcast listItemFontSize attribute as class in <li> in table list item', () => {
				setModelData( model,
					'<table listIndent="0" listItemId="a" listItemFontSize="tiny" listType="bulleted">' +
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
						'<li class="ck-list-marker-font-size-tiny">' +
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
						'<li class="ck-list-marker-font-size-tiny">' +
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

			it( 'should not downcast listItemFontSize attribute if value is empty', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listItemFontSize="">' +
						'foo' +
					'</paragraph>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">' +
								'foo' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData() ).to.equalMarkup(
					'<ul>' +
						'<li>' +
							'foo' +
						'</li>' +
					'</ul>'
				);
			} );
		} );

		describe( 'upcast', () => {
			it( 'should upcast class in <li> to listItemFontSize attribute (unordered list)', () => {
				editor.setData(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<span class="text-tiny">foo</span>' +
						'</li>' +
					'</ul>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFontSize="tiny" listItemId="a00" listType="bulleted">' +
						'<$text fontSize="tiny">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should upcast class in <li> to listItemFontSize attribute (ordered list)', () => {
				editor.setData(
					'<ol>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<span class="text-tiny">foo</span>' +
						'</li>' +
					'</ol>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFontSize="tiny" listItemId="a00" listType="numbered">' +
						'<$text fontSize="tiny">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should only upcast class set in <li> (not <ul> and not <p>)', () => {
				editor.setData(
					'<ul class="text-small">' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<p class="text-big">' +
								'<span class="text-tiny">foo</span>' +
							'</p>' +
						'</li>' +
					'</ul>' +
					'<p class="text-big">baz</p>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFontSize="tiny" listItemId="a00" listType="bulleted">' +
						'<$text fontSize="tiny">foo</$text>' +
					'</paragraph>' +
					'<paragraph>baz</paragraph>'
				);
			} );

			it( 'should upcast class in <li> to listItemFontSize attribute (nested list)', () => {
				editor.setData(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<span class="text-tiny">foo</span>' +
							'<ul>' +
								'<li class="ck-list-marker-font-size-tiny">' +
									'<span class="text-tiny">bar</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFontSize="tiny" listItemId="a01" listType="bulleted">' +
						'<$text fontSize="tiny">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="1" listItemFontSize="tiny" listItemId="a00" listType="bulleted">' +
						'<$text fontSize="tiny">bar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should not upcast class in <li> if it does not match named presets from editor config', () => {
				editor.setData(
					'<ul>' +
						'<li class="text-foo">' +
							'<span class="text-foo">foo</span>' +
						'</li>' +
					'</ul>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">' +
						'foo' +
					'</paragraph>'
				);
			} );

			it( 'should upcast class in <li> to listItemFontSize attribute in multi-block', () => {
				editor.setData(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<p>' +
								'<span class="text-tiny">foo</span>' +
							'</p>' +
							'<p>' +
								'<span class="text-tiny">bar</span>' +
							'</p>' +
						'</li>' +
					'</ul>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFontSize="tiny" listItemId="a00" listType="bulleted">' +
						'<$text fontSize="tiny">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemFontSize="tiny" listItemId="a00" listType="bulleted">' +
						'<$text fontSize="tiny">bar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should upcast class in <li> to listItemFontSize attribute for blockquote', () => {
				editor.setData(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<blockquote>' +
								'<span class="text-tiny">foo</span>' +
							'</blockquote>' +
						'</li>' +
					'</ul>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<blockQuote listIndent="0" listItemFontSize="tiny" listItemId="a00" listType="bulleted">' +
						'<paragraph>' +
							'<$text fontSize="tiny">foo</$text>' +
						'</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'should upcast class in <li> to listItemFontSize attribute for heading', () => {
				editor.setData(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<h2>' +
								'<span class="text-tiny">foo</span>' +
							'</h2>' +
						'</li>' +
					'</ul>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<heading1 listIndent="0" listItemFontSize="tiny" listItemId="a00" listType="bulleted">' +
						'<$text fontSize="tiny">foo</$text>' +
					'</heading1>'
				);
			} );

			// Post-fixer currently removes `listItemFontSize` attribute from table list items.
			it.skip( 'should upcast class in <li> to listItemFontSize attribute for table', () => {
				editor.setData(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
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
					'<table listIndent="0" listItemFontSize="tiny" listItemId="a00" listType="bulleted">' +
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
					expect( conversionApi.consumable.test( data.viewItem, { classes: 'ck-list-marker-font-size-tiny' } ) ).to.be.false;
				} );

				editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:li', upcastCheck, { priority: 'lowest' } ) );

				editor.setData(
					'<ul>' +
						'<li class="ck-list-marker-font-size-tiny">' +
							'<span class="text-tiny">foo</span>' +
						'</li>' +
					'</ul>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFontSize="tiny" listItemId="a00" listType="bulleted">' +
						'<$text fontSize="tiny">foo</$text>' +
					'</paragraph>'
				);

				expect( upcastCheck.calledOnce ).to.be.true;
			} );
		} );

		describe( 'clipboard integration', () => {
			it( 'should upcast marker class without using post-fixer', () => {
				const dataTransferMock = createDataTransfer( {
					'text/html': '<ol><li class="ck-list-marker-font-size-tiny">foo</li></ol>'
				} );

				const spy = sinon.stub( editor.model, 'insertContent' );

				editor.editing.view.document.fire( 'clipboardInput', {
					dataTransfer: dataTransferMock
				} );

				sinon.assert.calledOnce( spy );

				const content = spy.firstCall.args[ 0 ];

				expect( stringifyModel( content ) ).to.equal(
					'<paragraph listIndent="0" listItemFontSize="tiny" listItemId="a00" listType="numbered">' +
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
	} );

	describe( 'numbered values (styles)', () => {
		describe( 'downcast', () => {
			it( 'should downcast listItemFontSize attribute as style in <li>', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listItemFontSize="10px" listType="bulleted">' +
						'<$text fontSize="10px">foo</$text>' +
					'</paragraph>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px">' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span style="font-size:10px">foo</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData() ).to.equalMarkup(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
							'<span style="font-size:10px;">foo</span>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'should downcast listItemFontSize attribute as style in nested list', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listItemFontSize="10px" listType="bulleted">' +
						'<$text fontSize="10px">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listItemFontSize="10px" listType="bulleted">' +
						'<$text fontSize="10px">foo</$text>' +
					'</paragraph>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px">' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span style="font-size:10px">foo</span>' +
							'</span>' +
							'<ul>' +
								'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px">' +
									'<span class="ck-list-bogus-paragraph">' +
										'<span style="font-size:10px">foo</span>' +
									'</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData() ).to.equalMarkup(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
							'<span style="font-size:10px;">foo</span>' +
							'<ul>' +
								'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
									'<span style="font-size:10px;">foo</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'should downcast listItemFontSize attribute as style in <li> in multi-block', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listItemFontSize="10px" listType="bulleted">' +
						'<$text fontSize="10px">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listItemFontSize="10px" listType="bulleted">' +
						'<$text fontSize="10px">bar</$text>' +
					'</paragraph>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px">' +
							'<p>' +
								'<span style="font-size:10px">foo</span>' +
							'</p>' +
							'<p>' +
								'<span style="font-size:10px">bar</span>' +
							'</p>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData() ).to.equalMarkup(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
							'<p>' +
								'<span style="font-size:10px;">foo</span>' +
							'</p>' +
							'<p>' +
								'<span style="font-size:10px;">bar</span>' +
							'</p>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'should downcast listItemFontSize attribute as style in <li> in blockquote list item', () => {
				setModelData( model,
					'<blockQuote listIndent="0" listItemId="a" listItemFontSize="10px" listType="bulleted">' +
						'<paragraph>' +
							'<$text fontSize="10px">foo</$text>' +
						'</paragraph>' +
					'</blockQuote>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px">' +
							'<blockquote>' +
								'<p>' +
									'<span style="font-size:10px">foo</span>' +
								'</p>' +
							'</blockquote>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData() ).to.equalMarkup(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
							'<blockquote>' +
								'<p>' +
									'<span style="font-size:10px;">foo</span>' +
								'</p>' +
							'</blockquote>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'should downcast listItemFontSize attribute as style in <li> in heading list item', () => {
				setModelData( model,
					'<heading1 listIndent="0" listItemId="a" listItemFontSize="10px" listType="bulleted">' +
						'<$text fontSize="10px">foo</$text>' +
					'</heading1>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px">' +
							'<h2>' +
								'<span style="font-size:10px">foo</span>' +
							'</h2>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData() ).to.equalMarkup(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
							'<h2>' +
								'<span style="font-size:10px;">foo</span>' +
							'</h2>' +
						'</li>' +
					'</ul>'
				);
			} );

			// Post-fixer currently removes `listItemFontSize` attribute from table list items.
			it.skip( 'should downcast listItemFontSize attribute as style in <li> in table list item', () => {
				setModelData( model,
					'<table listIndent="0" listItemId="a" listItemFontSize="10px" listType="bulleted">' +
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
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px">' +
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
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
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

			it( 'should not downcast listItemFontSize attribute if value is empty', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listItemFontSize="">' +
						'foo' +
					'</paragraph>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">' +
								'foo' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData() ).to.equalMarkup(
					'<ul>' +
						'<li>' +
							'foo' +
						'</li>' +
					'</ul>'
				);
			} );
		} );

		describe( 'upcast', () => {
			it( 'should upcast style in <li> to listItemFontSize attribute (unordered list)', () => {
				editor.setData(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
							'<span style="font-size:10px;">foo</span>' +
						'</li>' +
					'</ul>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFontSize="10px" listItemId="a00" listType="bulleted">' +
						'<$text fontSize="10px">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should upcast style in <li> to listItemFontSize attribute (ordered list)', () => {
				editor.setData(
					'<ol>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
							'<span style="font-size:10px;">foo</span>' +
						'</li>' +
					'</ol>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFontSize="10px" listItemId="a00" listType="numbered">' +
						'<$text fontSize="10px">foo</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should only upcast style set in <li> (not <ul> and not <p>)', () => {
				editor.setData(
					'<ul class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:11px;">' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
							'<p class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:12px;">' +
								'<span style="font-size:10px;">foo</span>' +
							'</p>' +
						'</li>' +
					'</ul>' +
					'<p class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:13px;">baz</p>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFontSize="10px" listItemId="a00" listType="bulleted">' +
						'<$text fontSize="10px">foo</$text>' +
					'</paragraph>' +
					'<paragraph>baz</paragraph>'
				);
			} );

			it( 'should upcast style in <li> to listItemFontSize attribute (nested list)', () => {
				editor.setData(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
							'<span style="font-size:10px;">foo</span>' +
							'<ul>' +
								'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
									'<span style="font-size:10px;">bar</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFontSize="10px" listItemId="a01" listType="bulleted">' +
						'<$text fontSize="10px">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="1" listItemFontSize="10px" listItemId="a00" listType="bulleted">' +
						'<$text fontSize="10px">bar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should upcast style in <li> to listItemFontSize attribute in multi-block', () => {
				editor.setData(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
							'<p>' +
								'<span style="font-size:10px;">foo</span>' +
							'</p>' +
							'<p>' +
								'<span style="font-size:10px;">bar</span>' +
							'</p>' +
						'</li>' +
					'</ul>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFontSize="10px" listItemId="a00" listType="bulleted">' +
						'<$text fontSize="10px">foo</$text>' +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemFontSize="10px" listItemId="a00" listType="bulleted">' +
						'<$text fontSize="10px">bar</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should upcast style in <li> to listItemFontSize attribute for blockquote', () => {
				editor.setData(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
							'<blockquote>' +
								'<span style="font-size:10px;">foo</span>' +
							'</blockquote>' +
						'</li>' +
					'</ul>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<blockQuote listIndent="0" listItemFontSize="10px" listItemId="a00" listType="bulleted">' +
						'<paragraph>' +
							'<$text fontSize="10px">foo</$text>' +
						'</paragraph>' +
					'</blockQuote>'
				);
			} );

			it( 'should upcast style in <li> to listItemFontSize attribute for heading', () => {
				editor.setData(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
							'<h2>' +
								'<span style="font-size:10px;">foo</span>' +
							'</h2>' +
						'</li>' +
					'</ul>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<heading1 listIndent="0" listItemFontSize="10px" listItemId="a00" listType="bulleted">' +
						'<$text fontSize="10px">foo</$text>' +
					'</heading1>'
				);
			} );

			// Post-fixer currently removes `listItemFontSize` attribute from table list items.
			it.skip( 'should upcast style in <li> to listItemFontSize attribute for table', () => {
				editor.setData(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
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
					'<table listIndent="0" listItemFontSize="10px" listItemId="a00" listType="bulleted">' +
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
					expect( conversionApi.consumable.test( data.viewItem, { classes: 'ck-list-marker-font-size' } ) ).to.be.false;
					expect( conversionApi.consumable.test( data.viewItem, { styles: '--ck-content-list-marker-font-size' } ) ).to.be.false;
				} );

				editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:li', upcastCheck, { priority: 'lowest' } ) );

				editor.setData(
					'<ul>' +
						'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
							'<span style="font-size:10px">foo</span>' +
						'</li>' +
					'</ul>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemFontSize="10px" listItemId="a00" listType="bulleted">' +
						'<$text fontSize="10px">foo</$text>' +
					'</paragraph>'
				);

				expect( upcastCheck.calledOnce ).to.be.true;
			} );
		} );

		describe( 'clipboard integration', () => {
			it( 'should upcast marker class without using post-fixer', () => {
				const dataTransferMock = createDataTransfer( {
					'text/html': '<ol><li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">foo</li></ol>'
				} );

				const spy = sinon.stub( editor.model, 'insertContent' );

				editor.editing.view.document.fire( 'clipboardInput', {
					dataTransfer: dataTransferMock
				} );

				sinon.assert.calledOnce( spy );

				const content = spy.firstCall.args[ 0 ];

				expect( stringifyModel( content ) ).to.equal(
					'<paragraph listIndent="0" listItemFontSize="10px" listItemId="a00" listType="numbered">' +
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
	} );

	describe( 'supportAllValues: true', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [
					ListItemFontSizeIntegration,
					FontSizeEditing,
					Paragraph,
					BlockQuoteEditing,
					CodeBlockEditing,
					HeadingEditing,
					TableEditing
				],
				fontSize: {
					options: [ 10, 12 ],
					supportAllValues: true
				}
			} );

			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should upcast a numeric value specified in config from <li> to listItemFontSize attribute', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
						'<span style="font-size:10px;">foo</span>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontSize="10px" listItemId="a00" listType="bulleted">' +
					'<$text fontSize="10px">foo</$text>' +
				'</paragraph>'
			);

			expect( editor.getData() ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:10px;">' +
						'<span style="font-size:10px;">foo</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should upcast a numeric value not specified in config from <li> to listItemFontSize attribute', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:11px;">' +
						'<span style="font-size:11px;">foo</span>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontSize="11px" listItemId="a00" listType="bulleted">' +
					'<$text fontSize="11px">foo</$text>' +
				'</paragraph>'
			);

			expect( editor.getData() ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-font-size" style="--ck-content-list-marker-font-size:11px;">' +
						'<span style="font-size:11px;">foo</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should not upcast a class from <li> to listItemFontSize attribute', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-font-size-tiny">' +
						'<span class="text-tiny">foo</span>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);

			expect( editor.getData() ).to.equal(
				'<ul>' +
					'<li>foo</li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'when FontSizeEditing is not loaded', () => {
		let editor, model, view;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [
					ListItemFontSizeIntegration,
					Paragraph
				]
			} );

			model = editor.model;
			view = editor.editing.view;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not downcast listItemFontSize attribute as style in <li>', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontSize="10px" listType="bulleted">' +
					'<$text fontSize="10px">foo</$text>' +
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
