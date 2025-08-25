/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { BlockQuoteEditing } from '@ckeditor/ckeditor5-block-quote';
import { CodeBlockEditing } from '@ckeditor/ckeditor5-code-block';
import { HeadingEditing } from '@ckeditor/ckeditor5-heading';
import { TableEditing } from '@ckeditor/ckeditor5-table';
import { FontFamilyEditing } from '@ckeditor/ckeditor5-font';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ModelElement, _setModelData, _getModelData, _stringifyModel, _getViewData } from '@ckeditor/ckeditor5-engine';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { stubUid } from '../list/_utils/uid.js';
import { ListEditing } from '../../src/list/listediting.js';
import { ListItemFontFamilyIntegration } from '../../src/listformatting/listitemfontfamilyintegration.js';

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
				TableEditing,
				ClipboardPipeline
			],
			fontFamily: {
				supportAllValues: true
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
			model.schema.register( 'myElement', {
				inheritAllFrom: '$block',
				allowAttributesOf: '$listItem'
			} );

			const modelElement = new ModelElement( 'myElement', { listItemId: 'a' } );

			expect( model.schema.checkAttribute( [ '$root', modelElement ], 'listItemFontFamily' ) ).to.be.true;
		} );

		it( 'listItemFontFamily attribute should have isFormatting set to true', () => {
			expect( model.schema.getAttributeProperties( 'listItemFontFamily' ) ).to.include( {
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
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontFamily="Arial" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial">' +
						'<span class="ck-list-bogus-paragraph">' +
							'<span style="font-family:Arial">foo</span>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
						'<span style="font-family:Arial;">foo</span>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontFamily attribute as style in nested list', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontFamily="Arial" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listItemFontFamily="Arial" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial">' +
						'<span class="ck-list-bogus-paragraph">' +
							'<span style="font-family:Arial">foo</span>' +
						'</span>' +
						'<ul>' +
							'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial">' +
								'<span class="ck-list-bogus-paragraph">' +
									'<span style="font-family:Arial">foo</span>' +
								'</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
						'<span style="font-family:Arial;">foo</span>' +
						'<ul>' +
							'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
								'<span style="font-family:Arial;">foo</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontFamily attribute as style in <li> in multi-block', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontFamily="Arial" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listItemFontFamily="Arial" listType="bulleted">' +
					'<$text fontFamily="Arial">bar</$text>' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial">' +
						'<p>' +
							'<span style="font-family:Arial">foo</span>' +
						'</p>' +
						'<p>' +
							'<span style="font-family:Arial">bar</span>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
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
			_setModelData( model,
				'<blockQuote listIndent="0" listItemId="a" listItemFontFamily="Arial" listType="bulleted">' +
					'<paragraph>' +
						'<$text fontFamily="Arial">foo</$text>' +
					'</paragraph>' +
				'</blockQuote>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial">' +
						'<blockquote>' +
							'<p>' +
								'<span style="font-family:Arial">foo</span>' +
							'</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
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
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listItemFontFamily="Arial" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</heading1>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial">' +
						'<h2>' +
							'<span style="font-family:Arial">foo</span>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
						'<h2>' +
							'<span style="font-family:Arial;">foo</span>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);
		} );

		// Post-fixer currently remove `listItemFontFamily` attribute from table list items.
		it.skip( 'should downcast listItemFontFamily attribute as style in <li> in table list item', () => {
			_setModelData( model,
				'<table listIndent="0" listItemId="a" listItemFontFamily="Arial" listType="bulleted">' +
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
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial">' +
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
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
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
		it( 'should upcast style in <li> to listItemFontFamily attribute (unordered list)', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
						'<span style="font-family:Arial;">foo</span>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast style in <li> to listItemFontFamily attribute (ordered list)', () => {
			editor.setData(
				'<ol>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
						'<span style="font-family:Arial;">foo</span>' +
					'</li>' +
				'</ol>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="numbered">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should only upcast style set in <li> (not <ul> and not <p>)', () => {
			editor.setData(
				'<ul class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Tahoma;">' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
						'<p class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Verdana;">' +
							'<span style="font-family:Arial;">foo</span>' +
						'</p>' +
					'</li>' +
				'</ul>' +
				'<p class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Helvetica;">baz</p>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>' +
				'<paragraph>baz</paragraph>'
			);
		} );

		it( 'should upcast style in <li> to listItemFontFamily attribute (nested list)', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
						'<span style="font-family:Arial;">foo</span>' +
						'<ul>' +
							'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
								'<span style="font-family:Arial;">bar</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
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
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
						'<p>' +
							'<span style="font-family:Arial;">foo</span>' +
						'</p>' +
						'<p>' +
							'<span style="font-family:Arial;">bar</span>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
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
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
						'<blockquote>' +
							'<span style="font-family:Arial;">foo</span>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
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
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
						'<h2>' +
							'<span style="font-family:Arial;">foo</span>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<heading1 listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</heading1>'
			);
		} );

		// Post-fixer currently remove `listItemFontFamily` attribute from table list items.
		it.skip( 'should upcast style in <li> to listItemFontFamily attribute for table', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
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
				'<table listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="bulleted">' +
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
				expect( conversionApi.consumable.test( data.viewItem, { classes: 'ck-list-marker-font-family' } ) ).to.be.false;
				expect( conversionApi.consumable.test( data.viewItem, { styles: '--ck-content-list-marker-font-family' } ) ).to.be.false;
			} );

			editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:li', upcastCheck, { priority: 'lowest' } ) );

			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">' +
						'<span style="font-family:Arial">foo</span>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>'
			);

			expect( upcastCheck.calledOnce ).to.be.true;
		} );
	} );

	describe( 'clipboard integration', () => {
		it( 'should upcast marker class without using post-fixer', () => {
			const dataTransferMock = createDataTransfer( {
				'text/html': '<ol><li class="ck-list-marker-font-family" style="--ck-content-list-marker-font-family:Arial;">foo</li></ol>'
			} );

			const spy = sinon.stub( editor.model, 'insertContent' );

			editor.editing.view.document.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock
			} );

			sinon.assert.calledOnce( spy );

			const content = spy.firstCall.args[ 0 ];

			expect( _stringifyModel( content ) ).to.equal(
				'<paragraph listIndent="0" listItemFontFamily="Arial" listItemId="a00" listType="numbered">' +
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
					ListItemFontFamilyIntegration,
					FontFamilyEditing,
					Paragraph
				],
				fontFamily: {
					supportAllValues: true
				},
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

		it( 'should not downcast listItemFontFamily attribute as style in <li>', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontFamily="Arial" listType="bulleted">' +
					'<$text fontFamily="Arial">foo</$text>' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li>' +
						'<p>' +
							'<span style="font-family:Arial">foo</span>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li>' +
						'<p>' +
							'<span style="font-family:Arial;">foo</span>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'when FontFamilyEditing is not loaded', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [
					ListItemFontFamilyIntegration,
					Paragraph
				],
				fontFamily: {
					supportAllValues: true
				}
			} );

			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not upcast style in <li> to listItemFontFamily attribute', () => {
			editor.setData(
				'<ul>' +
					'<li style="font-family:Arial;">' +
						'<span style="font-family:Arial;">foo</span>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);
		} );
	} );
} );
