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
import PlainTableOutput from '../../src/plaintableoutput.js';
import TableEditing from '../../src/tableediting.js';

describe( 'TableLayoutEditing', () => {
	let editor, model, view, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Table, TableCaption, TableColumnResize, PlainTableOutput, TableLayoutEditing, Paragraph
			]
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
		// <caption> allowed only for content tables
		expect( model.schema.checkChild( [ '$root', 'table' ], 'caption' ) ).to.be.true;
		// TODO: it should be false for layout tables
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
				'<table class="table layout-table" role="presentation">' +
					'<tbody>' +
						'<tr><td>foo</td></tr>' +
					'</tbody>' +
				'</table>'
			);
		} );

		it( 'should not add `layout-table` class and `role="presentation"` attribute when already consumed', () => {
			editor.conversion.for( 'dataDowncast' ).add( dispatcher => {
				return dispatcher.on( 'attribute:tableType:table', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, evt.name );
				}, { priority: 'highest' } );
			} );

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
				'<table class="table">' +
					'<tbody>' +
						'<tr><td>foo</td></tr>' +
					'</tbody>' +
				'</table>'
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

		it( 'should properly downcast content table', () => {
			setModelData(
				model,
				'<table tableType="content">' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>foo[]</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget ck-widget_with-selection-handle content-table table" contenteditable="false">' +
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
		it( 'should set `tableType` to `layout` when there is class `layout-table`', () => {
			editor.setData(
				'<table class="table layout-table">' +
					'<tr><td>1</td></tr>' +
				'</table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="layout">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should set `tableType` to `content` when there is class `content-table`', () => {
			editor.setData(
				'<table class="table content-table">' +
					'<tr><td>1</td></tr>' +
				'</table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="content">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should set `tableType` to `layout` when there is no class responsible for table type', () => {
			editor.setData(
				'<table class="table">' +
					'<tr><td>1</td></tr>' +
				'</table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="layout">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should set `tableType` to `content` when there is no class responsible for table type ' +
				'but <table> contains a <caption> element inside', () => {
			editor.setData(
				'<table class="table">' +
					'<caption>foo</caption>' +
					'<tr><td>1</td></tr>' +
				'</table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="content">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'<caption>foo</caption>' +
				'</table>'
			);
		} );

		it( 'should set `tableType` to `content` even when there is a `layout-table` class' +
				'but <table> contains a <caption> element inside', () => {
			editor.setData(
				'<table class="table layout-table">' +
					'<caption>foo</caption>' +
					'<tr><td>1</td></tr>' +
				'</table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="content">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'<caption>foo</caption>' +
				'</table>'
			);
		} );

		it( 'should set `tableType` to `content` when there is no `table` class but `content-table` is', () => {
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

		it( 'should set `tableType` to `layout` when there is no `table` class but `layout-table` is', () => {
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

		it( 'should set `tableType` to `layout` when there is no class responsible for table type ' +
				'and not add the `headingRows` attribute', () => {
			editor.setData(
				'<table>' +
					'<thead>' +
						'<tr><th>1</th></tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr><td>2</td></tr>' +
					'</tbody>' +
				'</table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="layout">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should set `tableType` to `layout` when there is class `layout-table` ' +
				'and not add the `headingRows` attribute', () => {
			editor.setData(
				'<table class="table layout-table">' +
					'<thead>' +
						'<tr><th>1</th></tr>' +
					'</thead>' +
					'<tbody>' +
						'<tr><td>2</td></tr>' +
					'</tbody>' +
				'</table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="layout">' +
					'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should set `tableType` to `layout` when there is class `layout-table` and table is empty', () => {
			editor.setData(
				'<table class="table layout-table"></table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="layout">' +
					'<tableRow><tableCell><paragraph></paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should set `tableType` to `layout` when there is no class responsible for type and table is empty', () => {
			editor.setData(
				'<table></table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="layout">' +
					'<tableRow><tableCell><paragraph></paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		it( 'should set `tableType` to `content` when there is class `content-table` and table is empty', () => {
			editor.setData(
				'<table class="table content-table"></table>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<table tableType="content">' +
					'<tableRow><tableCell><paragraph></paragraph></tableCell></tableRow>' +
				'</table>'
			);
		} );

		describe( '<table> is wrapped with <figure>', () => {
			it( 'should set `tableType` to `content` when there is no class responsible for table type', () => {
				editor.setData(
					'<figure>' +
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

			it( 'should set `tableType` to `content` even when there is a `layout-table` class', () => {
				editor.setData(
					'<figure class="layout-table">' +
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

			it( 'should set `tableType` to `content` when there is a `content-table` class', () => {
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

			it( 'should set `tableType` to `content` when there is no class responsible for table type ' +
				'and add the `headingRows` attribute', () => {
				editor.setData(
					'<figure>' +
						'<table>' +
							'<thead>' +
								'<tr><th>1</th></tr>' +
							'</thead>' +
							'<tbody>' +
								'<tr><td>2</td></tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table headingRows="1" tableType="content">' +
						'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
						'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
					'</table>'
				);
			} );

			it( 'should set `tableType` to `content`even when there is a `layout-table` class ' +
					'and add the `headingRows` attribute', () => {
				editor.setData(
					'<figure class="table layout-table">' +
						'<table>' +
							'<thead>' +
								'<tr><th>1</th></tr>' +
							'</thead>' +
							'<tbody>' +
								'<tr><td>2</td></tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table headingRows="1" tableType="content">' +
						'<tableRow><tableCell><paragraph>1</paragraph></tableCell></tableRow>' +
						'<tableRow><tableCell><paragraph>2</paragraph></tableCell></tableRow>' +
					'</table>'
				);
			} );
		} );
	} );

	describe( 'clipboard pipeline', () => {
		it( 'should not crash the editor if there is no clipboard plugin', async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ TableEditing, TableLayoutEditing ]
			} );

			expect( editor.plugins.get( 'TableLayoutEditing' ) ).to.be.instanceOf( TableLayoutEditing );
		} );

		describe( 'pasting content', () => {
			it( 'should preserve table type if paste within the same editor', () => {
				const dataTransferMock = createDataTransfer( {
					'application/ckeditor5-editor-id': editor.id,
					'text/html': '<table class="table layout-table"><tbody><tr><td>Foo</td></tr></tbody></table>'
				} );

				view.document.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {},
					stopPropagation: () => {},
					method: 'paste'
				} );

				expect( getModelData( model ) ).to.equal(
					'[<table tableType="layout">' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>Foo</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>]'
				);

				expect( editor.getData() ).to.equal(
					'<table class="table layout-table" role="presentation">' +
						'<tbody>' +
							'<tr><td>Foo</td></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should preserve table type if paste from the another editor', () => {
				const dataTransferMock = createDataTransfer( {
					'application/ckeditor5-editor-id': 'other-editor',
					'text/html': '<table class="table layout-table"><tbody><tr><td>Foo</td></tr></tbody></table>'
				} );

				view.document.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {},
					stopPropagation: () => {},
					method: 'paste'
				} );

				expect( getModelData( model ) ).to.equal(
					'[<table tableType="layout">' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>Foo</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>]'
				);

				expect( editor.getData() ).to.equal(
					'<table class="table layout-table" role="presentation">' +
						'<tbody>' +
							'<tr><td>Foo</td></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should convert to content table if paste from external', () => {
				const dataTransferMock = createDataTransfer( {
					'text/html': '<figure><table><tbody><tr><td>Foo</td></tr></tbody></table></figure>'
				} );

				view.document.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {},
					stopPropagation: () => {},
					method: 'paste'
				} );

				expect( getModelData( model ) ).to.equal(
					'[<table tableType="content">' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>Foo</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>]'
				);

				expect( editor.getData() ).to.equal(
					'<table class="table content-table" role="presentation">' +
						'<tbody>' +
							'<tr><td>Foo</td></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );
		} );

		describe( 'copying tables', () => {
			describe( 'slice', () => {
				it( 'should preserve table type when copying', () => {
					setModelData(
						model,
						'<table tableType="layout">' +
							'<tableRow>' +
								'[<tableCell>' +
									'<paragraph>Foo</paragraph>' +
								'</tableCell>]' +
							'</tableRow>' +
						'</table>'
					);

					const dataTransferMock = createDataTransfer();

					view.document.fire( 'copy', {
						dataTransfer: dataTransferMock,
						preventDefault: () => {},
						stopPropagation: () => {}
					} );

					expect( dataTransferMock.getData( 'text/html' ) ).to.equal(
						'<table class="table layout-table" role="presentation">' +
							'<tbody>' +
								'<tr><td>Foo</td></tr>' +
							'</tbody>' +
						'</table>'
					);
				} );

				it( 'should preserve content table type when copying', () => {
					setModelData(
						model,
						'<table tableType="content">' +
							'<tableRow>' +
								'[<tableCell>' +
									'<paragraph>Bar</paragraph>' +
								'</tableCell>]' +
							'</tableRow>' +
						'</table>'
					);

					const dataTransferMock = createDataTransfer();

					view.document.fire( 'copy', {
						dataTransfer: dataTransferMock,
						preventDefault: () => {},
						stopPropagation: () => {}
					} );

					expect( dataTransferMock.getData( 'text/html' ) ).to.equal(
						'<table class="table content-table" role="presentation">' +
							'<tbody>' +
								'<tr><td>Bar</td></tr>' +
							'</tbody>' +
						'</table>'
					);
				} );
			} );

			describe( 'whole table', () => {
				it( 'should preserve table type when copying entire layout table', () => {
					setModelData(
						model,
						'[<table tableType="layout">' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>Foo</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>]'
					);

					const dataTransferMock = createDataTransfer();

					view.document.fire( 'copy', {
						dataTransfer: dataTransferMock,
						preventDefault: () => {},
						stopPropagation: () => {}
					} );

					expect( dataTransferMock.getData( 'text/html' ) ).to.equal(
						'<table class="table layout-table" role="presentation">' +
							'<tbody>' +
								'<tr><td>Foo</td></tr>' +
							'</tbody>' +
						'</table>'
					);
				} );

				it( 'should preserve table type when copying entire content table', () => {
					setModelData(
						model,
						'[<table tableType="content">' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>Bar</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>]'
					);

					const dataTransferMock = createDataTransfer();

					view.document.fire( 'copy', {
						dataTransfer: dataTransferMock,
						preventDefault: () => {},
						stopPropagation: () => {}
					} );

					expect( dataTransferMock.getData( 'text/html' ) ).to.equal(
						'<table class="table content-table" role="presentation">' +
							'<tbody>' +
								'<tr><td>Bar</td></tr>' +
							'</tbody>' +
						'</table>'
					);
				} );
			} );
		} );
	} );
} );

function createDataTransfer( data = {} ) {
	return {
		getData( type ) {
			return data[ type ];
		},
		setData( type, value ) {
			data[ type ] = value;
		}
	};
}
