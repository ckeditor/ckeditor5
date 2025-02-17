/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import TableLayoutEditing from '../../src/tablelayout/tablelayoutediting.js';
import Table from '../../src/table.js';
import TableCaption from '../../src/tablecaption.js';
import TableColumnResize from '../../src/tablecolumnresize.js';

describe( 'TableLayoutEditing', () => {
	let editor, model, view, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Table, TableCaption, TableColumnResize, TableLayoutEditing, Paragraph ]
		} );

		model = editor.model;
		view = editor.editing.view;
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableLayoutEditing.pluginName ).to.equal( 'TableLayoutEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableLayoutEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableLayoutEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'tableType' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root', 'table' ], 'caption' ) ).to.be.false;
	} );

	describe( 'dataDowncast', () => {
		it( 'should add `layout-table` class and `role="presentation"` attribute', () => {
			setModelData(
				model,
				'<table tableType="layout">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo[]</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( editor.getData() ).to.equal(
				'<figure class="table layout-table" role="presentation">' +
					'<table>' +
						'<tbody>' +
							'<tr><td>foo</td></tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			);
		} );
	} );

	describe( 'editingDowncast', () => {
		it( 'should properly downcast layout table', () => {
			setModelData(
				model,
				'<table tableType="layout">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo[]</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget ck-widget_with-selection-handle layout-table table" contenteditable="false">' +
					'<div class="ck ck-widget__selection-handle"></div>' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td class="ck-editor__editable ck-editor__nested-editable" ' +
									'contenteditable="true" role="textbox" tabindex="-1">' +
									'<span class="ck-table-bogus-paragraph">foo</span>' +
									'<div class="ck-table-column-resizer"></div>' +
								'</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
				'</figure>'
			);
		} );
	} );

	describe( 'upcast', () => {
		it( 'should set `tabletype` to `content` when there is no class responsible for table type', () => {
			editor.setData(
				'<figure class="table">' +
					'<table>' +
						'<tr><td>1</td></tr>' +
					'</table>' +
				'</figure>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="content">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should set `tabletype` to `layout` when there is class "layout-table"', () => {
			editor.setData(
				'<figure class="table layout-table">' +
					'<table>' +
						'<tr><td>1</td></tr>' +
					'</table>' +
				'</figure>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="layout">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should set `tabletype` to `content` when there is class "content-table"', () => {
			editor.setData(
				'<figure class="table content-table">' +
					'<table>' +
						'<tr><td>1</td></tr>' +
					'</table>' +
				'</figure>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="content">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should not set `tabletype` to `content` when there is no "table" class', () => {
			editor.setData(
				'<figure class="content-table">' +
					'<table>' +
						'<tr><td>1</td></tr>' +
					'</table>' +
				'</figure>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="content">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should not set `tabletype` when there is no <table> wrapped by a <figure>', () => {
			editor.setData(
				'<figure class="content-table">' +
					'<p>foo</p>' +
				'</figure>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo</paragraph>'
			);
		} );

		describe( 'table without <figure> wrapper', () => {
			it( 'should set `tabletype` to `layout` when there is no <figure> wrapper and class "layout-table"', () => {
				editor.setData(
					'<table class="layout-table">' +
						'<tr><td>1</td></tr>' +
					'</table>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table tableType="layout">' +
						'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'</table>'
				);
			} );

			it( 'should set `tabletype` to `content` when there is no <figure> wrapper and class "content-table"', () => {
				editor.setData(
					'<table class="content-table">' +
						'<tr><td>1</td></tr>' +
					'</table>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table tableType="content">' +
						'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'</table>'
				);
			} );

			it( 'should set `tabletype` to `content` when there is no <figure> wrapper', () => {
				editor.setData(
					'<table>' +
						'<tr><td>1</td></tr>' +
					'</table>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table tableType="content">' +
						'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'</table>'
				);
			} );
		} );
	} );

	// TODO: Add more tests.
} );
