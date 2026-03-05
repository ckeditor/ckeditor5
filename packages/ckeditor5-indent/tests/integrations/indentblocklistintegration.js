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
import { keyCodes } from '@ckeditor/ckeditor5-utils';

import { stubUid } from '@ckeditor/ckeditor5-list/tests/list/_utils/uid.js';

import { IndentEditing } from '../../src/indentediting.js';
import { IndentBlock } from '../../src/indentblock.js';
import { IndentBlockListCommand } from '../../src/integrations/indentblocklistcommand.js';
import { IndentBlockListItemCommand } from '../../src/integrations/indentblocklistitemcommand.js';
import { IndentBlockListIntegration } from '../../src/integrations/indentblocklistintegration.js';

describe( 'IndentBlockListIntegration', () => {
	let editor, model, view, viewDoc;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				Paragraph,
				BlockQuoteEditing,
				HeadingEditing,
				TableEditing,
				IndentEditing,
				IndentBlock,
				ListEditing,
				IndentBlockListIntegration
			]
		} );

		model = editor.model;
		view = editor.editing.view;
		viewDoc = view.document;

		stubUid();
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( IndentBlockListIntegration ) ).to.be.instanceOf( IndentBlockListIntegration );
	} );

	it( 'should have proper name', () => {
		expect( IndentBlockListIntegration.pluginName ).to.equal( 'IndentBlockListIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( IndentBlockListIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( IndentBlockListIntegration.isPremiumPlugin ).to.be.false;
	} );

	it( 'should register commands', () => {
		expect( editor.commands.get( 'indentBlockList' ) ).to.be.instanceOf( IndentBlockListCommand );
		expect( editor.commands.get( 'outdentBlockList' ) ).to.be.instanceOf( IndentBlockListCommand );
		expect( editor.commands.get( 'indentBlockListItem' ) ).to.be.instanceOf( IndentBlockListItemCommand );
		expect( editor.commands.get( 'outdentBlockListItem' ) ).to.be.instanceOf( IndentBlockListItemCommand );
	} );

	describe( 'schema', () => {
		it( 'should allow blockIndentList and blockIndentListItem attributes in $listItem', () => {
			model.schema.register( 'myElement', {
				inheritAllFrom: '$block',
				allowAttributesOf: '$listItem'
			} );

			const modelElement = new ModelElement( 'myElement', { listItemId: 'a' } );

			expect( model.schema.checkAttribute( [ '$root', modelElement ], 'blockIndentList' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', modelElement ], 'blockIndentListItem' ) ).to.be.true;
		} );

		it( 'blockIndentList and blockIndentListItem attributes should have isFormatting set to true', () => {
			expect( model.schema.getAttributeProperties( 'blockIndentList' ) ).to.include( {
				isFormatting: true
			} );

			expect( model.schema.getAttributeProperties( 'blockIndentListItem' ) ).to.include( {
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

			expect( model.schema.checkAttribute( [ '$root', listItemParagraph ], 'blockIndentListItem' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemBlockQuote ], 'blockIndentListItem' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemHeading ], 'blockIndentListItem' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemTable ], 'blockIndentListItem' ) ).to.be.true;

			expect( model.schema.checkAttribute( [ '$root', paragraph ], 'blockIndentListItem' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', blockQuote ], 'blockIndentListItem' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', heading ], 'blockIndentListItem' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', table ], 'blockIndentListItem' ) ).to.be.false;
		} );
	} );

	describe( 'using offset', () => {
		describe( '`blockIndentList` attribute', () => {
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

				it( 'should upcast margin-left set on first-level <ul> to blockIndentList attribute ' +
					'(it should not leak to nested list)', () => {
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

					editor.conversion.for( 'upcast' ).add(
						dispatcher => dispatcher.on( 'element:ul', upcastCheck, { priority: 'lowest' } )
					);

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
		} );

		describe( '`blockIndentListItem` attribute', () => {
			describe( 'downcast', () => {
				it( 'should downcast blockIndentListItem attribute as margin-left in <li>', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="10px" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul>' +
							'<li style="margin-left:10px">' +
								'<span class="ck-list-bogus-paragraph">foo</span>' +
							'</li>' +
						'</ul>'
					);

					expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
						'<ul>' +
							'<li style="margin-left:10px;">' +
								'foo' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'should downcast blockIndentListItem attribute as margin-left in <li> also in nested list', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="10px" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" blockIndentListItem="20px" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul>' +
							'<li style="margin-left:10px">' +
								'<span class="ck-list-bogus-paragraph">' +
									'foo' +
								'</span>' +
								'<ul>' +
									'<li style="margin-left:20px">' +
										'<span class="ck-list-bogus-paragraph">' +
											'foo' +
										'</span>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
						'<ul>' +
							'<li style="margin-left:10px;">' +
								'foo' +
								'<ul>' +
									'<li style="margin-left:20px;">' +
										'foo' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'should downcast blockIndentListItem attribute as margin-left when used in multi-block', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="10px" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="10px" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul>' +
							'<li style="margin-left:10px">' +
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
						'<ul>' +
							'<li style="margin-left:10px;">' +
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

				it( 'should downcast blockIndentListItem attribute in blockquote as margin-left in <li>', () => {
					_setModelData( model,
						'<blockQuote listIndent="0" listItemId="a" blockIndentListItem="10px" listType="bulleted">' +
							'<paragraph>' +
								'foo' +
							'</paragraph>' +
						'</blockQuote>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul>' +
							'<li style="margin-left:10px">' +
								'<blockquote>' +
									'<p>' +
										'foo' +
									'</p>' +
								'</blockquote>' +
							'</li>' +
						'</ul>'
					);

					expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
						'<ul>' +
							'<li style="margin-left:10px;">' +
								'<blockquote>' +
									'<p>' +
										'foo' +
									'</p>' +
								'</blockquote>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'should downcast blockIndentListItem attribute in heading as margin-left in <li>', () => {
					_setModelData( model,
						'<heading1 listIndent="0" listItemId="a" blockIndentListItem="10px" listType="bulleted">' +
							'foo' +
						'</heading1>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul>' +
							'<li style="margin-left:10px">' +
								'<h2>' +
									'foo' +
								'</h2>' +
							'</li>' +
						'</ul>'
					);

					expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
						'<ul>' +
							'<li style="margin-left:10px;">' +
								'<h2>' +
									'foo' +
								'</h2>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'should downcast blockIndentListItem attribute in table as margin-left in <li>', () => {
					_setModelData( model,
						'<table listIndent="0" listItemId="a" blockIndentListItem="10px" listType="bulleted">' +
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
							'<li style="margin-left:10px">' +
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
							'<li style="margin-left:10px;">' +
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
				it( 'should upcast margin-left in <li> in <ul> to blockIndentListItem attribute', () => {
					editor.setData(
						'<ul>' +
							'<li style="margin-left:10px">' +
								'foo' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentListItem="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);
				} );

				it( 'should upcast margin-left in <li> in <ol> to blockIndentListItem attribute', () => {
					editor.setData(
						'<ol>' +
							'<li style="margin-left:10px">' +
								'foo' +
							'</li>' +
						'</ol>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentListItem="10px" listIndent="0" listItemId="a00" listType="numbered">' +
							'foo' +
						'</paragraph>'
					);
				} );

				it( 'should upcast margin-left in <li> to blockIndentListItem attribute also in nested list', () => {
					editor.setData(
						'<ul>' +
							'<li style="margin-left:10px">' +
								'foo' +
								'<ul>' +
									'<li style="margin-left:20px">' +
										'bar' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentListItem="10px" listIndent="0" listItemId="a01" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph blockIndentListItem="20px" listIndent="1" listItemId="a00" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);
				} );

				it( 'should upcast margin-left in <li> to blockIndentListItem attribute in multi-block', () => {
					editor.setData(
						'<ul>' +
							'<li style="margin-left:10px">' +
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
						'<paragraph blockIndentListItem="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph blockIndentListItem="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);
				} );

				it( 'should upcast margin-left in <li> to blockIndentListItem attribute for blockquote', () => {
					editor.setData(
						'<ul>' +
							'<li style="margin-left:10px">' +
								'<blockquote>' +
									'foo' +
								'</blockquote>' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<blockQuote blockIndentListItem="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
							'<paragraph>' +
								'foo' +
							'</paragraph>' +
						'</blockQuote>'
					);
				} );

				it( 'should upcast margin-left in <li> to blockIndentListItem attribute for heading', () => {
					editor.setData(
						'<ul>' +
							'<li style="margin-left:10px">' +
								'<h2>' +
									'foo' +
								'</h2>' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<heading1 blockIndentListItem="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
							'foo' +
						'</heading1>'
					);
				} );

				it( 'should upcast margin-left in <li> to blockIndentListItem attribute for table', () => {
					editor.setData(
						'<ul>' +
							'<li style="margin-left:10px">' +
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
						'<table blockIndentListItem="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
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

				it( 'should upcast and consume margin-left in <li>', () => {
					const upcastCheck = sinon.spy( ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'margin-left' } ) ).to.be.false;
					} );

					editor.conversion.for( 'upcast' ).add(
						dispatcher => dispatcher.on( 'element:li', upcastCheck, { priority: 'lowest' } )
					);

					editor.setData(
						'<ul>' +
							'<li style="margin-left:10px">' +
								'foo' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentListItem="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);

					expect( upcastCheck.calledOnce ).to.be.true;
				} );

				it( 'should upcast negative value of margin-left in <li> to blockIndentListItem attribute', () => {
					editor.setData(
						'<ul>' +
							'<li style="margin-left:-10px">' +
								'foo' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentListItem="-10px" listIndent="0" listItemId="a00" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);
				} );
			} );

			describe( 'postfixer for blockIndentListItem attribute consistency', () => {
				it( 'should change blockIndentListItem attribute of following list item if it is different from previous one ' +
					'(multi-block)', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="10px" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="10px" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);

					model.change( writer => {
						const root = model.document.getRoot();
						const firstChild = root.getChild( 0 );

						writer.setAttribute( 'blockIndentListItem', '20px', firstChild );
					} );

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentListItem="20px" listIndent="0" listItemId="a" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph blockIndentListItem="20px" listIndent="0" listItemId="a" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);
				} );

				it( 'should remove blockIndentListItem attribute of following list item if previous one ' +
				'does not have it (multi-block)', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="10px" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="10px" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);

					model.change( writer => {
						const root = model.document.getRoot();
						const firstChild = root.getChild( 0 );

						writer.removeAttribute( 'blockIndentListItem', firstChild );
					} );

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);
				} );
			} );
		} );
	} );

	describe( 'using classes', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [
					Paragraph,
					BlockQuoteEditing,
					HeadingEditing,
					TableEditing,
					IndentEditing,
					IndentBlock,
					ListEditing,
					IndentBlockListIntegration
				],
				indentBlock: {
					classes: [ 'indent-1', 'indent-2', 'indent-3', 'indent-4' ]
				}
			} );

			model = editor.model;
			view = editor.editing.view;
			viewDoc = view.document;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		describe( '`blockIndentList` attribute', () => {
			describe( 'downcast', () => {
				it( 'should downcast blockIndentList attribute as class in <ul>', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentList="indent-1" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul class="indent-1">' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">foo</span>' +
							'</li>' +
						'</ul>'
					);

					expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
						'<ul class="indent-1">' +
							'<li>' +
								'foo' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'should downcast blockIndentList attribute as class also in nested <ul>', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentList="indent-1" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" blockIndentList="indent-2" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul class="indent-1">' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">' +
									'foo' +
								'</span>' +
								'<ul class="indent-2">' +
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
						'<ul class="indent-1">' +
							'<li>' +
								'foo' +
								'<ul class="indent-2">' +
									'<li>' +
										'foo' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'should downcast blockIndentList attribute as class when used in multi-block', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentList="indent-1" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" blockIndentList="indent-1" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul class="indent-1">' +
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
						'<ul class="indent-1">' +
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

				it( 'should downcast blockIndentList attribute in blockquote as class in <ul>', () => {
					_setModelData( model,
						'<blockQuote listIndent="0" listItemId="a" blockIndentList="indent-1" listType="bulleted">' +
							'<paragraph>' +
								'foo' +
							'</paragraph>' +
						'</blockQuote>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul class="indent-1">' +
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
						'<ul class="indent-1">' +
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

				it( 'should downcast blockIndentList attribute in heading as class in <ul>', () => {
					_setModelData( model,
						'<heading1 listIndent="0" listItemId="a" blockIndentList="indent-1" listType="bulleted">' +
							'foo' +
						'</heading1>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul class="indent-1">' +
							'<li>' +
								'<h2>' +
									'foo' +
								'</h2>' +
							'</li>' +
						'</ul>'
					);

					expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
						'<ul class="indent-1">' +
							'<li>' +
								'<h2>' +
									'foo' +
								'</h2>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'should downcast blockIndentList attribute in table as class in <ul>', () => {
					_setModelData( model,
						'<table listIndent="0" listItemId="a" blockIndentList="indent-1" listType="bulleted">' +
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
						'<ul class="indent-1">' +
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
						'<ul class="indent-1">' +
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
				it( 'should upcast class in <ul> to blockIndentList attribute', () => {
					editor.setData(
						'<ul class="indent-1">' +
							'<li>' +
								'foo' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentList="indent-1" listIndent="0" listItemId="a00" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);
				} );

				it( 'should upcast class in <ol> to blockIndentList attribute', () => {
					editor.setData(
						'<ol class="indent-1">' +
							'<li>' +
								'foo' +
							'</li>' +
						'</ol>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentList="indent-1" listIndent="0" listItemId="a00" listType="numbered">' +
							'foo' +
						'</paragraph>'
					);
				} );

				it( 'should upcast class in <ul> to blockIndentList attribute also in nested list', () => {
					editor.setData(
						'<ul class="indent-1">' +
							'<li>' +
								'foo' +
								'<ul class="indent-2">' +
									'<li>' +
										'bar' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentList="indent-1" listIndent="0" listItemId="a01" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph blockIndentList="indent-2" listIndent="1" listItemId="a00" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);
				} );

				it( 'should upcast class in first-level <ul> to blockIndentList attribute ' +
					'(it should not leak to nested list)', () => {
					editor.setData(
						'<ul class="indent-1">' +
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
						'<paragraph blockIndentList="indent-1" listIndent="0" listItemId="a01" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="1" listItemId="a00" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);
				} );

				it( 'should upcast class in <ul> to blockIndentList attribute in multi-block', () => {
					editor.setData(
						'<ul class="indent-1">' +
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
						'<paragraph blockIndentList="indent-1" listIndent="0" listItemId="a00" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph blockIndentList="indent-1" listIndent="0" listItemId="a00" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);
				} );

				it( 'should upcast class in <ul> to blockIndentList attribute for blockquote', () => {
					editor.setData(
						'<ul class="indent-1">' +
							'<li>' +
								'<blockquote>' +
									'foo' +
								'</blockquote>' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<blockQuote blockIndentList="indent-1" listIndent="0" listItemId="a00" listType="bulleted">' +
							'<paragraph>' +
								'foo' +
							'</paragraph>' +
						'</blockQuote>'
					);
				} );

				it( 'should upcast class in <ul> to blockIndentList attribute for heading', () => {
					editor.setData(
						'<ul class="indent-1">' +
							'<li>' +
								'<h2>' +
									'foo' +
								'</h2>' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<heading1 blockIndentList="indent-1" listIndent="0" listItemId="a00" listType="bulleted">' +
							'foo' +
						'</heading1>'
					);
				} );

				it( 'should upcast class in <ul> to blockIndentList attribute for table', () => {
					editor.setData(
						'<ul class="indent-1">' +
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
						'<table blockIndentList="indent-1" listIndent="0" listItemId="a00" listType="bulleted">' +
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

				it( 'should upcast and consume class in <ul>', () => {
					const upcastCheck = sinon.spy( ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { classes: 'indent-1' } ) ).to.be.false;
					} );

					editor.conversion.for( 'upcast' ).add(
						dispatcher => dispatcher.on( 'element:ul', upcastCheck, { priority: 'lowest' } )
					);

					editor.setData(
						'<ul class="indent-1">' +
							'<li>' +
								'foo' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentList="indent-1" listIndent="0" listItemId="a00" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);

					expect( upcastCheck.calledOnce ).to.be.true;
				} );

				it( 'should not upcast not-configured class in <ul> to blockIndentList attribute', () => {
					editor.setData(
						'<ul class="foo">' +
							'<li>' +
								'foo' +
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

			describe( 'postfixer for blockIndentList attribute consistency', () => {
				it( 'should change blockIndentList attribute of following list item if it is different from previous one', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentList="indent-1" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" blockIndentList="indent-1" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);

					model.change( writer => {
						const root = model.document.getRoot();
						const firstChild = root.getChild( 0 );

						writer.setAttribute( 'blockIndentList', 'indent-2', firstChild );
					} );

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentList="indent-2" listIndent="0" listItemId="a" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph blockIndentList="indent-2" listIndent="0" listItemId="b" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);
				} );

				it( 'should remove blockIndentList attribute of following list item if previous one does not have it', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentList="indent-1" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" blockIndentList="indent-1" listType="bulleted">' +
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
						'<paragraph listIndent="0" listItemId="a" blockIndentList="indent-1" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" blockIndentList="indent-1" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);

					model.change( writer => {
						const root = model.document.getRoot();
						const firstChild = root.getChild( 0 );

						writer.setAttribute( 'blockIndentList', 'indent-2', firstChild );
					} );

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentList="indent-2" listIndent="0" listItemId="a" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph blockIndentList="indent-1" listIndent="1" listItemId="b" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);
				} );

				it( 'should update blockIndentList attribute of outdented list item if it is different from previous one', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentList="indent-1" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" blockIndentList="indent-2" listType="bulleted">' +
							'foo[]' +
						'</paragraph>'
					);

					editor.execute( 'outdentList' );

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentList="indent-1" listIndent="0" listItemId="a" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph blockIndentList="indent-1" listIndent="0" listItemId="b" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);
				} );

				it( 'should remove blockIndentList attribute of outdented list item if previous one does not have it', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" blockIndentList="indent-2" listType="bulleted">' +
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
						'<paragraph listIndent="0" listItemId="a" blockIndentList="indent-1" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" blockIndentList="indent-1" listType="numbered">' +
							'bar' +
						'</paragraph>'
					);

					model.change( writer => {
						const root = model.document.getRoot();
						const firstChild = root.getChild( 0 );

						writer.setAttribute( 'blockIndentList', 'indent-2', firstChild );
					} );

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentList="indent-2" listIndent="0" listItemId="a" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph blockIndentList="indent-1" listIndent="0" listItemId="b" listType="numbered">' +
							'bar' +
						'</paragraph>'
					);
				} );
			} );
		} );

		describe( '`blockIndentListItem` attribute', () => {
			describe( 'downcast', () => {
				it( 'should downcast blockIndentListItem attribute as class in <li>', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="indent-1" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul>' +
							'<li class="indent-1">' +
								'<span class="ck-list-bogus-paragraph">foo</span>' +
							'</li>' +
						'</ul>'
					);

					expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
						'<ul>' +
							'<li class="indent-1">' +
								'foo' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'should downcast blockIndentListItem attribute as class in <li> also in nested list', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="indent-1" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" blockIndentListItem="indent-2" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul>' +
							'<li class="indent-1">' +
								'<span class="ck-list-bogus-paragraph">' +
									'foo' +
								'</span>' +
								'<ul>' +
									'<li class="indent-2">' +
										'<span class="ck-list-bogus-paragraph">' +
											'foo' +
										'</span>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
						'<ul>' +
							'<li class="indent-1">' +
								'foo' +
								'<ul>' +
									'<li class="indent-2">' +
										'foo' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'should downcast blockIndentListItem attribute as class when used in multi-block', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="indent-1" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="indent-1" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul>' +
							'<li class="indent-1">' +
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
						'<ul>' +
							'<li class="indent-1">' +
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

				it( 'should downcast blockIndentListItem attribute in blockquote as class in <li>', () => {
					_setModelData( model,
						'<blockQuote listIndent="0" listItemId="a" blockIndentListItem="indent-1" listType="bulleted">' +
							'<paragraph>' +
								'foo' +
							'</paragraph>' +
						'</blockQuote>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul>' +
							'<li class="indent-1">' +
								'<blockquote>' +
									'<p>' +
										'foo' +
									'</p>' +
								'</blockquote>' +
							'</li>' +
						'</ul>'
					);

					expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
						'<ul>' +
							'<li class="indent-1">' +
								'<blockquote>' +
									'<p>' +
										'foo' +
									'</p>' +
								'</blockquote>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'should downcast blockIndentListItem attribute in heading as class in <li>', () => {
					_setModelData( model,
						'<heading1 listIndent="0" listItemId="a" blockIndentListItem="indent-1" listType="bulleted">' +
							'foo' +
						'</heading1>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<ul>' +
							'<li class="indent-1">' +
								'<h2>' +
									'foo' +
								'</h2>' +
							'</li>' +
						'</ul>'
					);

					expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
						'<ul>' +
							'<li class="indent-1">' +
								'<h2>' +
									'foo' +
								'</h2>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'should downcast blockIndentListItem attribute in table as class in <li>', () => {
					_setModelData( model,
						'<table listIndent="0" listItemId="a" blockIndentListItem="indent-1" listType="bulleted">' +
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
							'<li class="indent-1">' +
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
							'<li class="indent-1">' +
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
				it( 'should upcast class in <li> in <ul> to blockIndentListItem attribute', () => {
					editor.setData(
						'<ul>' +
							'<li class="indent-1">' +
								'foo' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentListItem="indent-1" listIndent="0" listItemId="a00" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);
				} );

				it( 'should upcast class in <li> in <ol> to blockIndentListItem attribute', () => {
					editor.setData(
						'<ol>' +
							'<li class="indent-1">' +
								'foo' +
							'</li>' +
						'</ol>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentListItem="indent-1" listIndent="0" listItemId="a00" listType="numbered">' +
							'foo' +
						'</paragraph>'
					);
				} );

				it( 'should upcast class in <li> to blockIndentListItem attribute also in nested list', () => {
					editor.setData(
						'<ul>' +
							'<li class="indent-1">' +
								'foo' +
								'<ul>' +
									'<li class="indent-2">' +
										'bar' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentListItem="indent-1" listIndent="0" listItemId="a01" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph blockIndentListItem="indent-2" listIndent="1" listItemId="a00" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);
				} );

				it( 'should upcast class in <li> to blockIndentListItem attribute in multi-block', () => {
					editor.setData(
						'<ul>' +
							'<li class="indent-1">' +
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
						'<paragraph blockIndentListItem="indent-1" listIndent="0" listItemId="a00" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph blockIndentListItem="indent-1" listIndent="0" listItemId="a00" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);
				} );

				it( 'should upcast class in <li> to blockIndentListItem attribute for blockquote', () => {
					editor.setData(
						'<ul>' +
							'<li class="indent-1">' +
								'<blockquote>' +
									'foo' +
								'</blockquote>' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<blockQuote blockIndentListItem="indent-1" listIndent="0" listItemId="a00" listType="bulleted">' +
							'<paragraph>' +
								'foo' +
							'</paragraph>' +
						'</blockQuote>'
					);
				} );

				it( 'should upcast class in <li> to blockIndentListItem attribute for heading', () => {
					editor.setData(
						'<ul>' +
							'<li class="indent-1">' +
								'<h2>' +
									'foo' +
								'</h2>' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<heading1 blockIndentListItem="indent-1" listIndent="0" listItemId="a00" listType="bulleted">' +
							'foo' +
						'</heading1>'
					);
				} );

				it( 'should upcast class in <li> to blockIndentListItem attribute for table', () => {
					editor.setData(
						'<ul>' +
							'<li class="indent-1">' +
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
						'<table blockIndentListItem="indent-1" listIndent="0" listItemId="a00" listType="bulleted">' +
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

				it( 'should upcast and consume class in <li>', () => {
					const upcastCheck = sinon.spy( ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { classes: 'indent-1' } ) ).to.be.false;
					} );

					editor.conversion.for( 'upcast' ).add(
						dispatcher => dispatcher.on( 'element:li', upcastCheck, { priority: 'lowest' } )
					);

					editor.setData(
						'<ul>' +
							'<li class="indent-1">' +
								'foo' +
							'</li>' +
						'</ul>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentListItem="indent-1" listIndent="0" listItemId="a00" listType="bulleted">' +
							'foo' +
						'</paragraph>'
					);

					expect( upcastCheck.calledOnce ).to.be.true;
				} );

				it( 'should not upcast not-configured class in <li> to blockIndentListItem attribute', () => {
					editor.setData(
						'<ul>' +
							'<li class="foo">' +
								'foo' +
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

			describe( 'postfixer for blockIndentListItem attribute consistency', () => {
				it( 'should change blockIndentListItem attribute of following list item if it is different from previous one ' +
					'(multi-block)', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="indent-1" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="indent-1" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);

					model.change( writer => {
						const root = model.document.getRoot();
						const firstChild = root.getChild( 0 );

						writer.setAttribute( 'blockIndentListItem', 'indent-2', firstChild );
					} );

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph blockIndentListItem="indent-2" listIndent="0" listItemId="a" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph blockIndentListItem="indent-2" listIndent="0" listItemId="a" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);
				} );

				it( 'should remove blockIndentListItem attribute of following list item if previous one ' +
				'does not have it (multi-block)', () => {
					_setModelData( model,
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="indent-1" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" blockIndentListItem="indent-1" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);

					model.change( writer => {
						const root = model.document.getRoot();
						const firstChild = root.getChild( 0 );

						writer.removeAttribute( 'blockIndentListItem', firstChild );
					} );

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">' +
							'foo' +
						'</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">' +
							'bar' +
						'</paragraph>'
					);
				} );
			} );
		} );
	} );

	describe( 'Indent integration', () => {
		it( 'should execute `indentBlockList` when `indent` command is executed in a list at first item', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">[]foo</paragraph>'
			);

			const indentBlockListCommand = editor.commands.get( 'indentBlockList' );
			const spy = sinon.spy( indentBlockListCommand, 'execute' );

			editor.execute( 'indent' );

			expect( spy.calledOnce ).to.be.true;
			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="40px" listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>'
			);
		} );

		it( 'should execute `outdentBlockList` when `outdent` command is executed in a list with blockIndentList', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" blockIndentList="40px" listType="bulleted">[]foo</paragraph>'
			);

			const outdentBlockListCommand = editor.commands.get( 'outdentBlockList' );
			const spy = sinon.spy( outdentBlockListCommand, 'execute' );

			editor.execute( 'outdent' );

			expect( spy.calledOnce ).to.be.true;
			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>'
			);
		} );

		describe( 'when IndentBlock is loaded before Indent', () => {
			let editor, model;

			beforeEach( async () => {
				editor = await VirtualTestEditor.create( {
					plugins: [
						Paragraph,
						ListEditing,
						IndentBlock,
						IndentEditing
					]
				} );

				model = editor.model;
			} );

			afterEach( async () => {
				await editor.destroy();
			} );

			it( 'should still register indentBlockList as child command of indent multi-command', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">[]foo</paragraph>'
				);

				const indentBlockListCommand = editor.commands.get( 'indentBlockList' );
				const spy = sinon.spy( indentBlockListCommand, 'execute' );

				editor.execute( 'indent' );

				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'should still register outdentBlockList as child command of outdent multi-command', () => {
				_setModelData( model,
					'<paragraph listIndent="0" listItemId="a" blockIndentList="40px" listType="bulleted">[]foo</paragraph>'
				);

				const outdentBlockListCommand = editor.commands.get( 'outdentBlockList' );
				const spy = sinon.spy( outdentBlockListCommand, 'execute' );

				editor.execute( 'outdent' );

				expect( spy.calledOnce ).to.be.true;
			} );
		} );
	} );

	describe( 'keyboard integration', () => {
		it( 'should indent list with Tab key', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">[]foo</paragraph>'
			);

			viewDoc.fire( 'keydown', {
				keyCode: keyCodes.tab,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="40px" listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>'
			);
		} );

		it( 'should outdent list with Shift + Tab keys', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" blockIndentList="40px" listType="bulleted">[]foo</paragraph>'
			);

			viewDoc.fire( 'keydown', {
				keyCode: keyCodes.tab,
				shiftKey: true,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>'
			);
		} );
	} );

	describe( 'when ListEditing is not loaded', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [
					Paragraph,
					IndentBlockListIntegration
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

		it( 'should not upcast margin-left in <li> to blockIndentListItem attribute', () => {
			const upcastCheck = sinon.spy( ( evt, data, conversionApi ) => {
				expect( conversionApi.consumable.test( data.viewItem, { styles: 'margin-left' } ) ).to.be.true;
			} );

			editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:li', upcastCheck, { priority: 'lowest' } ) );

			editor.setData(
				'<ul>' +
					'<li style="margin-left:10px">' +
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
					IndentEditing,
					IndentBlock,
					ListEditing,
					IndentBlockListIntegration
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

		it( 'should downcast blockIndentListItem attribute as margin-right in <li> (RTL)', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" blockIndentListItem="10px" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li style="margin-right:10px">' +
						'<span class="ck-list-bogus-paragraph">foo</span>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li style="margin-right:10px;">' +
						'foo' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should upcast margin-right in <li> to blockIndentListItem attribute (RTL)', () => {
			editor.setData(
				'<ul>' +
					'<li style="margin-right:10px">' +
						'foo' +
					'</li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentListItem="10px" listIndent="0" listItemId="a00" listType="bulleted">' +
					'foo' +
				'</paragraph>'
			);
		} );
	} );

	describe( 'when indenting list items (changing list level)', () => {
		it( 'should remove blockIndentList and blockIndentListItem attributes when indenting list item to the next level', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" blockIndentList="40px" blockIndentListItem="40px" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="b" blockIndentList="40px" blockIndentListItem="40px" listType="bulleted">' +
					'bar[]' +
				'</paragraph>'
			);

			editor.execute( 'indentList' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph blockIndentList="40px" blockIndentListItem="40px" listIndent="0" listItemId="a" listType="bulleted">' +
					'foo' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">' +
					'bar' +
				'</paragraph>'
			);
		} );
	} );
} );
