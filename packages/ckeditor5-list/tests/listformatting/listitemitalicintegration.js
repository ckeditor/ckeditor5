/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import ItalicEditing from '@ckeditor/ckeditor5-basic-styles/src/italic/italicediting.js';
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
import ListItemItalicIntegration from '../../src/listformatting/listitemitalicintegration.js';

describe( 'ListItemItalicIntegration', () => {
	let editor, model, view;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				ListItemItalicIntegration,
				ItalicEditing,
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
		expect( ListItemItalicIntegration.pluginName ).to.equal( 'ListItemItalicIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListItemItalicIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListItemItalicIntegration.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListItemItalicIntegration ) ).to.be.instanceOf( ListItemItalicIntegration );
	} );

	it( 'should require ListEditing plugin', () => {
		expect( ListItemItalicIntegration.requires ).to.deep.equal( [
			ListEditing
		] );
	} );

	describe( 'schema', () => {
		it( 'should allow listItemItalic attribute in $listItem', () => {
			model.schema.register( 'myElement', {
				inheritAllFrom: '$block',
				allowAttributesOf: '$listItem'
			} );

			const modelElement = new ModelElement( 'myElement', { listItemId: 'a' } );

			expect( model.schema.checkAttribute( [ '$root', modelElement ], 'listItemItalic' ) ).to.be.true;
		} );

		it( 'listItemItalic attribute should have isFormatting set to true', () => {
			expect( model.schema.getAttributeProperties( 'listItemItalic' ) ).to.include( {
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

			expect( model.schema.checkAttribute( [ '$root', listItemParagraph ], 'listItemItalic' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemBlockQuote ], 'listItemItalic' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemHeading ], 'listItemItalic' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', listItemTable ], 'listItemItalic' ) ).to.be.true;

			expect( model.schema.checkAttribute( [ '$root', paragraph ], 'listItemItalic' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', blockQuote ], 'listItemItalic' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', heading ], 'listItemItalic' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', table ], 'listItemItalic' ) ).to.be.false;
		} );
	} );

	describe( 'downcast', () => {
		it( 'should downcast listItemItalic attribute as class in <li>', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">foo</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<span class="ck-list-bogus-paragraph">' +
							'<i>foo</i>' +
						'</span>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<i>foo</i>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemItalic attribute as class in nested list', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">foo</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<span class="ck-list-bogus-paragraph">' +
							'<i>foo</i>' +
						'</span>' +
						'<ul>' +
							'<li class="ck-list-marker-italic">' +
								'<span class="ck-list-bogus-paragraph">' +
									'<i>foo</i>' +
								'</span>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<i>foo</i>' +
						'<ul>' +
							'<li class="ck-list-marker-italic">' +
								'<i>' +
									'foo' +
								'</i>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemItalic attribute as class in <li> in multi-block', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">bar</$text>' +
				'</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<p>' +
							'<i>foo</i>' +
						'</p>' +
						'<p>' +
							'<i>bar</i>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<p>' +
							'<i>foo</i>' +
						'</p>' +
						'<p>' +
							'<i>bar</i>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemItalic attribute as class in <li> in blockquote list item', () => {
			setModelData( model,
				'<blockQuote listIndent="0" listItemId="a" listItemItalic="true" listType="bulleted">' +
					'<paragraph>' +
						'<$text italic="true">foo</$text>' +
					'</paragraph>' +
				'</blockQuote>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<blockquote>' +
							'<p>' +
								'<i>foo</i>' +
							'</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<blockquote>' +
							'<p>' +
								'<i>foo</i>' +
							'</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemItalic attribute as class in <li> in heading list item', () => {
			setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">foo</$text>' +
				'</heading1>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<h2>' +
							'<i>foo</i>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<h2>' +
							'<i>foo</i>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);
		} );

		// Post-fixer currently removes `listItemItalic` attribute from table list items.
		it.skip( 'should downcast listItemItalic attribute as class in <li> in table list item', () => {
			setModelData( model,
				'<table listIndent="0" listItemId="a" listItemItalic="true" listType="bulleted">' +
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
					'<li class="ck-list-marker-italic">' +
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
					'<li class="ck-list-marker-italic">' +
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
		it( 'should upcast class in <li> to listItemItalic attribute (unordered list)', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<i>foo</i>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a00" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">foo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast class in <li> to listItemItalic attribute (ordered list)', () => {
			editor.setData(
				'<ol>' +
					'<li class="ck-list-marker-italic">' +
						'<i>foo</i>' +
					'</li>' +
				'</ol>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a00" listItemItalic="true" listType="numbered">' +
					'<$text italic="true">foo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should only upcast class set in <li> (not <ul> and not <p>)', () => {
			editor.setData(
				'<ul class="ck-list-marker-italic">' +
					'<li class="ck-list-marker-italic">' +
						'<p class="ck-list-marker-italic">' +
							'<i>foo</i>' +
						'</p>' +
					'</li>' +
				'</ul>' +
				'<p class="ck-list-marker-italic">baz</p>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a00" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">foo</$text>' +
				'</paragraph>' +
				'<paragraph>baz</paragraph>'
			);
		} );

		it( 'should upcast class in <li> to listItemItalic attribute (nested list)', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<i>foo</i>' +
						'<ul>' +
							'<li class="ck-list-marker-italic">' +
								'<i>bar</i>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a01" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="1" listItemId="a00" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">bar</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast class in <li> to listItemItalic attribute in multi-block', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<p>' +
							'<i>foo</i>' +
						'</p>' +
						'<p>' +
							'<i>bar</i>' +
						'</p>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a00" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">foo</$text>' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">bar</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should upcast class in <li> to listItemItalic attribute for blockquote', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<blockquote>' +
							'<i>foo</i>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<blockQuote listIndent="0" listItemId="a00" listItemItalic="true" listType="bulleted">' +
					'<paragraph>' +
						'<$text italic="true">foo</$text>' +
					'</paragraph>' +
				'</blockQuote>'
			);
		} );

		it( 'should upcast class in <li> to listItemItalic attribute for heading', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<h2>' +
							'<i>foo</i>' +
						'</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<heading1 listIndent="0" listItemId="a00" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">foo</$text>' +
				'</heading1>'
			);
		} );

		// Post-fixer currently removes `listItemItalic` attribute from table list items.
		it.skip( 'should upcast class in <li> to listItemItalic attribute for table', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
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
				'<table listIndent="0" listItemId="a00" listItemItalic="true" listType="bulleted">' +
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
				expect( conversionApi.consumable.test( data.viewItem, { classes: 'ck-list-marker-italic' } ) ).to.be.false;
			} );

			editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:li', upcastCheck, { priority: 'lowest' } ) );

			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-italic">' +
						'<i>foo</i>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a00" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">foo</$text>' +
				'</paragraph>'
			);

			expect( upcastCheck.calledOnce ).to.be.true;
		} );
	} );

	describe( 'clipboard integration', () => {
		it( 'should upcast marker class without using post-fixer', () => {
			const dataTransferMock = createDataTransfer( {
				'text/html': '<ol><li class="ck-list-marker-italic">foo</li></ol>'
			} );

			const spy = sinon.stub( editor.model, 'insertContent' );

			editor.editing.view.document.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock
			} );

			sinon.assert.calledOnce( spy );

			const content = spy.firstCall.args[ 0 ];

			expect( stringifyModel( content ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a00" listItemItalic="true" listType="numbered">' +
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

	describe( 'when ItalicEditing is not loaded', () => {
		let editor, model, view;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [
					ListItemItalicIntegration,
					Paragraph
				]
			} );

			model = editor.model;
			view = editor.editing.view;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not downcast listItemItalic attribute as class in <li>', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemItalic="true" listType="bulleted">' +
					'<$text italic="true">foo</$text>' +
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
