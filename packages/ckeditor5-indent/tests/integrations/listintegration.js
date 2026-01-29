/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { BlockQuoteEditing } from '@ckeditor/ckeditor5-block-quote';
import { HeadingEditing } from '@ckeditor/ckeditor5-heading';
import { TableEditing } from '@ckeditor/ckeditor5-table';
import { ListEditing } from '@ckeditor/ckeditor5-list';
import { ModelElement, _setModelData, _getModelData, _getViewData } from '@ckeditor/ckeditor5-engine';

import { stubUid } from '@ckeditor/ckeditor5-list/tests/list/_utils/uid.js';

import { ListIntegration } from '../../src/integrations/listintegration.js';

describe( 'ListIntegration', () => {
	let editor, model, view;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				Paragraph,
				BlockQuoteEditing,
				HeadingEditing,
				TableEditing,
				ListEditing,
				ListIntegration
			]
		} );

		model = editor.model;
		view = editor.editing.view;

		stubUid();
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListIntegration ) ).to.be.instanceOf( ListIntegration );
	} );

	it( 'should have proper name', () => {
		expect( ListIntegration.pluginName ).to.equal( 'ListIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListIntegration.isPremiumPlugin ).to.be.false;
	} );

	describe( 'schema', () => {
		it( 'should allow blockIndentList attribute in $listItem', () => {
			model.schema.register( 'myElement', {
				inheritAllFrom: '$block',
				allowAttributesOf: '$listItem'
			} );

			const modelElement = new ModelElement( 'myElement', { listItemId: 'a' } );

			expect( model.schema.checkAttribute( [ '$root', modelElement ], 'blockIndentList' ) ).to.be.true;
		} );

		it( 'blockIndentList attribute should have isFormatting set to true', () => {
			expect( model.schema.getAttributeProperties( 'blockIndentList' ) ).to.include( {
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

			expect( model.schema.checkAttribute( [ '$root', listItemParagraph ], 'blockIndentList' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemBlockQuote ], 'blockIndentList' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemHeading ], 'blockIndentList' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemTable ], 'blockIndentList' ) ).to.be.true;

			expect( model.schema.checkAttribute( [ '$root', paragraph ], 'blockIndentList' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', blockQuote ], 'blockIndentList' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', heading ], 'blockIndentList' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', table ], 'blockIndentList' ) ).to.be.false;
		} );
	} );

	describe( 'downcast', () => {
		it( 'should downcast blockIndentList attribute as margin-left in <ul>', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" blockIndentList="10px" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul style="margin-left:10px">' +
					'<li>' +
						'<span class="ck-list-bogus-paragraph">foo</span>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul style="margin-left:10px;">' +
					'<li>' +
						'foo' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast blockIndentList attribute as margin-left also in nested <ul>', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" blockIndentList="10px" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" blockIndentList="20px" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul style="margin-left:10px">' +
					'<li>' +
						'<span class="ck-list-bogus-paragraph">' +
							'foo' +
						'</span>' +
						'<ul style="margin-left:20px">' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">' +
									'foo' +
								'</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul style="margin-left:10px;">' +
					'<li>' +
						'foo' +
						'<ul style="margin-left:20px;">' +
							'<li>' +
								'foo' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast blockIndentList attribute as margin-left when used in multi-block', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" blockIndentList="10px" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" blockIndentList="10px" listType="bulleted">' +
					'bar' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul style="margin-left:10px">' +
					'<li>' +
						'<p>' +
							'foo' +
						'</p>' +
						'<p>' +
							'bar' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul style="margin-left:10px;">' +
					'<li>' +
						'<p>' +
							'foo' +
						'</p>' +
						'<p>' +
							'bar' +
						'</p>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast blockIndentList attribute in blockquote as margin-left in <ul>', () => {
			_setModelData( model,
				'<blockQuote listIndent="0" listItemId="a" blockIndentList="10px" listType="bulleted">' +
					'<paragraph>' +
						'foo' +
					'</paragraph>' +
				'</blockQuote>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul style="margin-left:10px">' +
					'<li>' +
						'<blockquote>' +
							'<p>' +
								'foo' +
							'</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul style="margin-left:10px;">' +
					'<li>' +
						'<blockquote>' +
							'<p>' +
								'foo' +
							'</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast blockIndentList attribute in heading as margin-left in <ul>', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" blockIndentList="10px" listType="bulleted">' +
					'foo' +
				'</heading1>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul style="margin-left:10px">' +
					'<li>' +
						'<h2>' +
							'foo' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul style="margin-left:10px;">' +
					'<li>' +
						'<h2>' +
							'foo' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast blockIndentList attribute in table as margin-left in <ul>', () => {
			_setModelData( model,
				'<table listIndent="0" listItemId="a" blockIndentList="10px" listType="bulleted">' +
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
				'<ul style="margin-left:10px">' +
					'<li>' +
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
				'<ul style="margin-left:10px;">' +
					'<li>' +
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
		it( 'should upcast margin-left in <ul> to blockIndentList attribute', () => {
			editor.setData(
				'<ul style="margin-left:10px">' +
					'<li>' +
						'foo' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);
		} );

		it( 'should upcast margin-left in <ol> to blockIndentList attribute', () => {
			editor.setData(
				'<ol style="margin-left:10px">' +
					'<li>' +
						'foo' +
					'</li>' +
				'</ol>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="10px" listIndent="0" listItemId="a00" listType="numbered">' +
					'foo' +
				'</paragraph>'
			);
		} );

		it( 'should upcast margin-left in <ul> to blockIndentList attribute also in nested list', () => {
			editor.setData(
				'<ul style="margin-left:10px">' +
					'<li>' +
						'foo' +
						'<ul style="margin-left:20px">' +
							'<li>' +
								'bar' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="10px" listIndent="0" listItemId="a01" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph blockIndentList="20px" listIndent="1" listItemId="a00" listType="bulleted">' +
					'bar' +
				'</paragraph>'
			);
		} );

		it( 'should upcast margin-left set on first-level <ul> to blockIndentList attribute (it should not leak to nested list)', () => {
			editor.setData(
				'<ul style="margin-left:10px">' +
					'<li>' +
						'foo' +
						'<ul>' +
							'<li>' +
								'bar' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="10px" listIndent="0" listItemId="a01" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemId="a00" listType="bulleted">' +
					'bar' +
				'</paragraph>'
			);
		} );

		it( 'should upcast margin-left in <ul> to blockIndentList attribute in multi-block', () => {
			editor.setData(
				'<ul style="margin-left:10px">' +
					'<li>' +
						'<p>' +
							'foo' +
						'</p>' +
						'<p>' +
							'bar' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph blockIndentList="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
					'bar' +
				'</paragraph>'
			);
		} );

		it( 'should upcast margin-left in <ul> to blockIndentList attribute for blockquote', () => {
			editor.setData(
				'<ul style="margin-left:10px">' +
					'<li>' +
						'<blockquote>' +
							'foo' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<blockQuote blockIndentList="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
					'<paragraph>' +
						'foo' +
					'</paragraph>' +
				'</blockQuote>'
			);
		} );

		it( 'should upcast margin-left in <ul> to blockIndentList attribute for heading', () => {
			editor.setData(
				'<ul style="margin-left:10px">' +
					'<li>' +
						'<h2>' +
							'foo' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<heading1 blockIndentList="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
					'foo' +
				'</heading1>'
			);
		} );

		it( 'should upcast margin-left in <ul> to blockIndentList attribute for table', () => {
			editor.setData(
				'<ul style="margin-left:10px">' +
					'<li>' +
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
				'<table blockIndentList="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
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

		it( 'should upcast and consume margin-left in <ul>', () => {
			const upcastCheck = sinon.spy( ( evt, data, conversionApi ) => {
				expect( conversionApi.consumable.test( data.viewItem, { styles: 'margin-left' } ) ).to.be.false;
			} );

			editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:ul', upcastCheck, { priority: 'lowest' } ) );

			editor.setData(
				'<ul style="margin-left:10px">' +
					'<li>' +
						'foo' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);

			expect( upcastCheck.calledOnce ).to.be.true;
		} );

		it( 'should upcast negative value of margin-left in <ul> to blockIndentList attribute', () => {
			editor.setData(
				'<ul style="margin-left:-10px">' +
					'<li>' +
						'foo' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="-10px" listIndent="0" listItemId="a00" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);
		} );
	} );

	describe( 'postfixer for blockIndentList attribute consistency', () => {
		it( 'should change blockIndentList attribute of following list item if it is different from previous one', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" blockIndentList="10px" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="b" blockIndentList="10px" listType="bulleted">' +
					'bar' +
				'</paragraph>'
			);

			model.change( writer => {
				const root = model.document.getRoot();
				const firstChild = root.getChild( 0 );

				writer.setAttribute( 'blockIndentList', '20px', firstChild );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="20px" listIndent="0" listItemId="a" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph blockIndentList="20px" listIndent="0" listItemId="b" listType="bulleted">' +
					'bar' +
				'</paragraph>'
			);
		} );

		it( 'should remove blockIndentList attribute of following list item if previous one does not have it', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" blockIndentList="10px" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="b" blockIndentList="10px" listType="bulleted">' +
					'bar' +
				'</paragraph>'
			);

			model.change( writer => {
				const root = model.document.getRoot();
				const firstChild = root.getChild( 0 );

				writer.removeAttribute( 'blockIndentList', firstChild );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="b" listType="bulleted">' +
					'bar' +
				'</paragraph>'
			);
		} );

		it( 'should not change blockIndentList attribute of following list item if it has different indent level', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" blockIndentList="10px" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" blockIndentList="10px" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);

			model.change( writer => {
				const root = model.document.getRoot();
				const firstChild = root.getChild( 0 );

				writer.setAttribute( 'blockIndentList', '20px', firstChild );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="20px" listIndent="0" listItemId="a" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph blockIndentList="10px" listIndent="1" listItemId="b" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);
		} );

		it( 'should update blockIndentList attribute of outdented list item if it is different from previous one', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" blockIndentList="10px" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" blockIndentList="20px" listType="bulleted">' +
					'foo[]' +
				'</paragraph>'
			);

			editor.execute( 'outdentList' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="10px" listIndent="0" listItemId="a" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph blockIndentList="10px" listIndent="0" listItemId="b" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);
		} );

		it( 'should remove blockIndentList attribute of outdented list item if previous one does not have it', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" blockIndentList="20px" listType="bulleted">' +
					'foo[]' +
				'</paragraph>'
			);

			editor.execute( 'outdentList' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="b" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);
		} );

		it( 'should not change blockIndentList attribute of following list item if it is a different list type', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" blockIndentList="10px" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="b" blockIndentList="10px" listType="numbered">' +
					'bar' +
				'</paragraph>'
			);

			model.change( writer => {
				const root = model.document.getRoot();
				const firstChild = root.getChild( 0 );

				writer.setAttribute( 'blockIndentList', '20px', firstChild );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="20px" listIndent="0" listItemId="a" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph blockIndentList="10px" listIndent="0" listItemId="b" listType="numbered">' +
					'bar' +
				'</paragraph>'
			);
		} );
	} );

	describe( 'when ListEditing is not loaded', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [
					Paragraph,
					ListIntegration
				]
			} );

			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not upcast margin-left in <ul> to blockIndentList attribute', () => {
			const upcastCheck = sinon.spy( ( evt, data, conversionApi ) => {
				expect( conversionApi.consumable.test( data.viewItem, { styles: 'margin-left' } ) ).to.be.true;
			} );

			editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:ul', upcastCheck, { priority: 'lowest' } ) );

			editor.setData(
				'<ul style="margin-left:10px">' +
					'<li>' +
						'foo' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>foo</paragraph>'
			);

			expect( upcastCheck.calledOnce ).to.be.true;
		} );
	} );

	describe( 'RTL support', () => {
		let editor, model, view;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [
					Paragraph,
					ListEditing,
					ListIntegration
				],
				language: {
					content: 'ar'
				}
			} );

			model = editor.model;
			view = editor.editing.view;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should downcast blockIndentList attribute as margin-right in <ul> (RTL)', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" blockIndentList="10px" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul style="margin-right:10px">' +
					'<li>' +
						'<span class="ck-list-bogus-paragraph">foo</span>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul style="margin-right:10px;">' +
					'<li>' +
						'foo' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should upcast margin-right in <ul> to blockIndentList attribute (RTL)', () => {
			editor.setData(
				'<ul style="margin-right:10px">' +
					'<li>' +
						'foo' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);
		} );
	} );
} );
