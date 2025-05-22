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
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import stubUid from '@ckeditor/ckeditor5-list/tests/list/_utils/uid.js';

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
		it( 'listItemFontFamily attribute should have isFormatting set to true', () => {
			expect( editor.model.schema.getAttributeProperties( 'listItemFontFamily' ) ).to.include( {
				isFormatting: true
			} );
		} );
	} );

	describe( 'downcast', () => {
		it( 'should downcast listItemFontFamily attribute as style in <li>', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontFamily="Arial">' +
					'foo' +
				'</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li style="fontFamily:Arial">' +
						'<p>foo</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li style="fontFamily:Arial;">' +
						'<p>foo</p>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontFamily attribute as style in <li> in multi-block', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listItemFontFamily="Arial">' +
					'foo' +
				'</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listItemFontFamily="Arial">' +
					'bar' +
				'</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li style="fontFamily:Arial">' +
						'<p>foo</p>' +
						'<p>bar</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li style="fontFamily:Arial;">' +
						'<p>foo</p>' +
						'<p>bar</p>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontFamily attribute as style in <li> in blockquote list item', () => {
			setModelData( model,
				'<blockQuote listIndent="0" listItemId="a" listItemFontFamily="Arial">' +
					'<paragraph>foo</paragraph>' +
				'</blockQuote>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li style="fontFamily:Arial">' +
						'<blockquote>' +
							'<p>foo</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li style="fontFamily:Arial;">' +
						'<blockquote>' +
							'<p>foo</p>' +
						'</blockquote>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontFamily attribute as style in <li> in codeBlock list item', () => {
			setModelData( model,
				'<codeBlock language="plaintext" listIndent="0" listItemId="a" listItemFontFamily="Arial">' +
					'foo' +
				'</codeBlock>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li style="fontFamily:Arial">' +
						'<pre data-language="Plain text" spellcheck="false">' +
							'<code class="language-plaintext">foo</code>' +
						'</pre>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li style="fontFamily:Arial;">' +
						'<pre>' +
							'<code class="language-plaintext">foo</code>' +
						'</pre>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontFamily attribute as style in <li> in heading list item', () => {
			setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listItemFontFamily="Arial">' +
					'foo' +
				'</heading1>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li style="fontFamily:Arial">' +
						'<h2>foo</h2>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li style="fontFamily:Arial;">' +
						'<h2>foo</h2>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast listItemFontFamily attribute as style in <li> in table list item', () => {
			setModelData( model,
				'<table listIndent="0" listItemId="a" listItemFontFamily="Arial">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li style="fontFamily:Arial">' +
						'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
							'<div class="ck ck-widget__selection-handle"></div>' +
							'<table>' +
								'<tbody>' +
									'<tr>' +
										'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" ' +
											'tabindex="-1">' +
											'<span class="ck-table-bogus-paragraph">foo</span>' +
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
					'<li style="fontFamily:Arial;">' +
						'<figure class="table">' +
							'<table>' +
								'<tbody>' +
									'<tr>' +
										'<td>foo</td>' +
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
					'foo' +
				'</paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li>' +
						'<p>foo</p>' +
					'</li>' +
				'</ul>'
			);

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li>' +
						'<p>foo</p>' +
					'</li>' +
				'</ul>'
			);
		} );
	} );
} );
