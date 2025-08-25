/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { BlockQuoteEditing } from '@ckeditor/ckeditor5-block-quote';
import { CodeBlockEditing } from '@ckeditor/ckeditor5-code-block';
import { HeadingEditing } from '@ckeditor/ckeditor5-heading';
import { TableEditing } from '@ckeditor/ckeditor5-table';
import { BoldEditing } from '@ckeditor/ckeditor5-basic-styles';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ModelElement, _setModelData, _getModelData, _stringifyModel, _getViewData } from '@ckeditor/ckeditor5-engine';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { env } from 'ckeditor5/src/utils.js';

import { stubUid } from '../list/_utils/uid.js';
import { ListEditing } from '../../src/list/listediting.js';
import { ListItemBoldIntegration } from '../../src/listformatting/listitemboldintegration.js';

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
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemBold="true" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
						'<span class="ck-list-bogus-paragraph">' +
							'<strong>foo</strong>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
						'<strong>foo</strong>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemBold attribute as class in nested list', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemBold="true" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listItemBold="true" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
						'<span class="ck-list-bogus-paragraph">' +
							'<strong>foo</strong>' +
						'</span>' +
						'<ul>' +
							'<li class="ck-list-marker-bold">' +
								'<span class="ck-list-bogus-paragraph">' +
									'<strong>foo</strong>' +
								'</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
						'<strong>foo</strong>' +
						'<ul>' +
							'<li class="ck-list-marker-bold">' +
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
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemBold="true" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listItemBold="true" listType="bulleted">' +
					'<$text bold="true">bar</$text>' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
						'<p>' +
							'<strong>foo</strong>' +
						'</p>' +
						'<p>' +
							'<strong>bar</strong>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
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
			_setModelData( model,
				'<blockQuote listIndent="0" listItemId="a" listItemBold="true" listType="bulleted">' +
					'<paragraph>' +
						'<$text bold="true">foo</$text>' +
					'</paragraph>' +
				'</blockQuote>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
						'<blockquote>' +
							'<p>' +
								'<strong>foo</strong>' +
							'</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
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
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listItemBold="true" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</heading1>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
						'<h2>' +
							'<strong>foo</strong>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
						'<h2>' +
							'<strong>foo</strong>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);
		} );

		// Post-fixer currently removes `listItemBold` attribute from table list items.
		it.skip( 'should downcast listItemBold attribute as class in <li> in table list item', () => {
			_setModelData( model,
				'<table listIndent="0" listItemId="a" listItemBold="true" listType="bulleted">' +
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
					'<li class="ck-list-marker-bold">' +
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
					'<li class="ck-list-marker-bold">' +
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

		// See: https://github.com/ckeditor/ckeditor5/issues/18790.
		it( 'should add dummy style for a Safari glitch (in editing pipeline only)', () => {
			sinon.stub( env, 'isSafari' ).value( true );

			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemBold="true" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-bold" style="--ck-content-list-marker-dummy-bold:0">' +
						'<span class="ck-list-bogus-paragraph">' +
							'<strong>foo</strong>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
						'<strong>foo</strong>' +
					'</li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'upcast', () => {
		it( 'should upcast class in <li> to listItemBold attribute (unordered list)', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
						'<strong>foo</strong>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemBold="true" listItemId="a00" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast class in <li> to listItemBold attribute (ordered list)', () => {
			editor.setData(
				'<ol>' +
					'<li class="ck-list-marker-bold">' +
						'<strong>foo</strong>' +
					'</li>' +
				'</ol>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemBold="true" listItemId="a00" listType="numbered">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast class in <li> to listItemBold attribute if text is formatted using font-weight numeric value', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
						'<span style="font-weight:600;">foo</span>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemBold="true" listItemId="a00" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should only upcast class set in <li> (not <ul> and not <p>)', () => {
			editor.setData(
				'<ul class="ck-list-marker-bold">' +
					'<li class="ck-list-marker-bold">' +
						'<p class="ck-list-marker-bold">' +
							'<strong>foo</strong>' +
						'</p>' +
					'</li>' +
				'</ul>' +
				'<p class="ck-list-marker-bold">baz</p>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemBold="true" listItemId="a00" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>' +
				'<paragraph>baz</paragraph>'
			);
		} );

		it( 'should upcast class in <li> to listItemBold attribute (nested list)', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
						'<strong>foo</strong>' +
						'<ul>' +
							'<li class="ck-list-marker-bold">' +
								'<strong>bar</strong>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
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
					'<li class="ck-list-marker-bold">' +
						'<p>' +
							'<strong>foo</strong>' +
						'</p>' +
						'<p>' +
							'<strong>bar</strong>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
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
					'<li class="ck-list-marker-bold">' +
						'<blockquote>' +
							'<strong>foo</strong>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
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
					'<li class="ck-list-marker-bold">' +
						'<h2>' +
							'<strong>foo</strong>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<heading1 listIndent="0" listItemBold="true" listItemId="a00" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</heading1>'
			);
		} );

		// Post-fixer currently removes `listItemBold` attribute from table list items.
		it.skip( 'should upcast class in <li> to listItemBold attribute for table', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
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

		it( 'should upcast and consume class', () => {
			const upcastCheck = sinon.spy( ( evt, data, conversionApi ) => {
				expect( conversionApi.consumable.test( data.viewItem, { classes: 'ck-list-marker-bold' } ) ).to.be.false;
			} );

			editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:li', upcastCheck, { priority: 'lowest' } ) );

			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-bold">' +
						'<strong>foo</strong>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemBold="true" listItemId="a00" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>'
			);

			expect( upcastCheck.calledOnce ).to.be.true;
		} );
	} );

	describe( 'clipboard integration', () => {
		it( 'should upcast marker class without using post-fixer', () => {
			const dataTransferMock = createDataTransfer( {
				'text/html': '<ol><li class="ck-list-marker-bold">foo</li></ol>'
			} );

			const spy = sinon.stub( editor.model, 'insertContent' );

			editor.editing.view.document.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock
			} );

			sinon.assert.calledOnce( spy );

			const content = spy.firstCall.args[ 0 ];

			expect( _stringifyModel( content ) ).to.equal(
				'<paragraph listIndent="0" listItemBold="true" listItemId="a00" listType="numbered">' +
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
					ListItemBoldIntegration,
					BoldEditing,
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

		it( 'should not downcast listItemBold attribute', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemBold="true">' +
					'<$text bold="true">foo</$text>' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li>' +
						'<p>' +
							'<strong>foo</strong>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li>' +
						'<p>' +
							'<strong>foo</strong>' +
						'</p>' +
					'</li>' +
				'</ul>'
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
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemBold="true" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
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
