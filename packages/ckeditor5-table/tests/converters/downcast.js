/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { toWidgetEditable } from '@ckeditor/ckeditor5-widget';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { modelTable, viewTable } from '../_utils/utils';

import TableEditing from '../../src/tableediting';

describe( 'downcast converters', () => {
	let editor, model, root, view, viewRoot;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( { plugins: [ Paragraph, TableEditing, UndoEditing ] } );

		model = editor.model;
		root = model.document.getRoot( 'main' );
		view = editor.editing.view;
		viewRoot = view.document.getRoot();
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'downcastTable()', () => {
		describe( 'editing pipeline', () => {
			it( 'should create table as a widget', () => {
				setModelData( model, modelTable( [ [ '' ] ] ) );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph"></span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should reconvert table on headingRows attribute change', () => {
				setModelData( model, modelTable( [
					[ '00' ],
					[ '10' ]
				] ) );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">10</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);

				const viewFigureBefore = viewRoot.getChild( 0 );
				const viewTableBefore = viewFigureBefore.getChild( 1 );
				const viewTableRow0Before = viewTableBefore.getChild( 0 ).getChild( 0 );
				const viewTableRow1Before = viewTableBefore.getChild( 0 ).getChild( 1 );
				const viewTableCell0Before = viewTableRow0Before.getChild( 0 );
				const viewTableCell1Before = viewTableRow1Before.getChild( 1 );

				model.change( writer => {
					writer.setAttribute( 'headingRows', 1, root.getChild( 0 ) );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<thead>' +
								'<tr>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</th>' +
								'</tr>' +
							'</thead>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">10</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);

				const viewFigureAfter = viewRoot.getChild( 0 );
				const viewTableAfter = viewFigureAfter.getChild( 1 );
				const viewTableRow0After = viewTableAfter.getChild( 0 ).getChild( 0 );
				const viewTableRow1After = viewTableAfter.getChild( 1 ).getChild( 0 );
				const viewTableCell0After = viewTableRow0After.getChild( 0 );
				const viewTableCell1After = viewTableRow1After.getChild( 1 );

				expect( viewFigureAfter ).to.not.equal( viewFigureBefore );
				expect( viewTableAfter ).to.not.equal( viewTableBefore );
				expect( viewTableRow0After ).to.not.equal( viewTableRow0Before );
				expect( viewTableCell0After ).to.not.equal( viewTableCell0Before );
				expect( viewTableRow1After ).to.equal( viewTableRow1Before );
				expect( viewTableCell1After ).to.equal( viewTableCell1Before );
			} );
		} );

		describe( 'data pipeline', () => {
			it( 'should create table with tbody and thead', () => {
				setModelData( model, modelTable( [
					[ '00' ],
					[ '10' ]
				], { headingRows: 1 } ) );

				expect( editor.getData() ).to.equalMarkup(
					'<figure class="table">' +
						'<table>' +
							'<thead>' +
								'<tr><th>00</th></tr>' +
							'</thead>' +
							'<tbody>' +
								'<tr><td>10</td></tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should create table with thead', () => {
				setModelData( model, modelTable( [
					[ '00' ],
					[ '10' ]
				], { headingRows: 2 } ) );

				expect( editor.getData() ).to.equalMarkup(
					'<figure class="table">' +
						'<table>' +
							'<thead>' +
								'<tr><th>00</th></tr>' +
								'<tr><th>10</th></tr>' +
							'</thead>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should create table with heading columns and rows', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02', '03' ],
					[ '10', '11', '12', '13' ]
				], { headingColumns: 3, headingRows: 1 } ) );

				expect( editor.getData() ).to.equalMarkup(
					'<figure class="table">' +
						'<table>' +
							'<thead>' +
								'<tr><th>00</th><th>01</th><th>02</th><th>03</th></tr>' +
							'</thead>' +
							'<tbody>' +
								'<tr><th>10</th><th>11</th><th>12</th><td>13</td></tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should push table items without dedicated slot outside the table', () => {
				editor.model.schema.register( 'foo', { allowIn: 'table' } );
				editor.conversion.elementToElement( { model: 'foo', view: 'foo' } );

				editor.setData(
					`<figure class="table">
						<table>
							<foo></foo>
							<tbody>
								<tr>
									<td>01</td>
									<td>02</td>
								</tr>
							</tbody>
						</table>
					</figure>`
				);

				expect( editor.getData() ).to.equalMarkup(
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td>01</td>' +
									'<td>02</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
						'<foo>&nbsp;</foo>' +
					'</figure>'
				);
			} );

			it( 'should create table with custom slot', () => {
				editor.model.schema.register( 'foo', { allowIn: 'table' } );
				editor.conversion.elementToElement( { model: 'foo', view: 'foo' } );

				editor.plugins.get( 'TableEditing' ).registerAdditionalSlot( {
					filter: element => element.is( 'element', 'foo' ),
					positionOffset: 0
				} );

				editor.setData(
					`<figure class="table">
						<table>
							<foo></foo>
							<tbody>
								<tr>
									<td>01</td>
									<td>02</td>
								</tr>
							</tbody>
						</table>
					</figure>`
				);

				expect( editor.getData() ).to.equalMarkup(
					'<figure class="table">' +
						'<table>' +
							'<foo>&nbsp;</foo>' +
							'<tbody>' +
								'<tr>' +
									'<td>01</td>' +
									'<td>02</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should create table with custom slot at the `end` position', () => {
				editor.model.schema.register( 'foo', { allowIn: 'table' } );
				editor.conversion.elementToElement( { model: 'foo', view: 'foo' } );

				editor.plugins.get( 'TableEditing' ).registerAdditionalSlot( {
					filter: element => element.is( 'element', 'foo' ),
					positionOffset: 'end'
				} );

				editor.setData(
					`<figure class="table">
						<table>
							<foo></foo>
							<tbody>
								<tr>
									<td>01</td>
									<td>02</td>
								</tr>
							</tbody>
						</table>
					</figure>`
				);

				expect( editor.getData() ).to.equalMarkup(
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td>01</td>' +
									'<td>02</td>' +
								'</tr>' +
							'</tbody>' +
							'<foo>&nbsp;</foo>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should create table with custom slot at the `after` position', () => {
				editor.model.schema.register( 'foo', { allowIn: 'table' } );
				editor.conversion.elementToElement( { model: 'foo', view: 'foo' } );

				editor.plugins.get( 'TableEditing' ).registerAdditionalSlot( {
					filter: element => element.is( 'element', 'foo' ),
					positionOffset: 'after'
				} );

				editor.setData(
					`<figure class="table">
						<table>
							<foo></foo>
							<tbody>
								<tr>
									<td>01</td>
									<td>02</td>
								</tr>
							</tbody>
						</table>
					</figure>`
				);

				expect( editor.getData() ).to.equalMarkup(
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td>01</td>' +
									'<td>02</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
						'<foo>&nbsp;</foo>' +
					'</figure>'
				);
			} );

			it( 'should create table with custom slot at the `before` position', () => {
				editor.model.schema.register( 'foo', { allowIn: 'table' } );
				editor.conversion.elementToElement( { model: 'foo', view: 'foo' } );

				editor.plugins.get( 'TableEditing' ).registerAdditionalSlot( {
					filter: element => element.is( 'element', 'foo' ),
					positionOffset: 'before'
				} );

				editor.setData(
					`<figure class="table">
						<table>
							<foo></foo>
							<tbody>
								<tr>
									<td>01</td>
									<td>02</td>
								</tr>
							</tbody>
						</table>
					</figure>`
				);

				expect( editor.getData() ).to.equalMarkup(
					'<figure class="table">' +
						'<foo>&nbsp;</foo>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td>01</td>' +
									'<td>02</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should create table with block content', () => {
				setModelData( model, modelTable( [
					[ '<paragraph>00</paragraph><paragraph>foo</paragraph>', '01' ]
				] ) );

				expect( editor.getData() ).to.equalMarkup(
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td><p>00</p><p>foo</p></td>' +
									'<td>01</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should create table with block content (attribute on paragraph)', () => {
				editor.conversion.attributeToAttribute(
					{
						model: { key: 'alignment', values: [ 'right', 'center', 'justify' ] },
						view: {
							right: { key: 'style', value: { 'text-align': 'right' } },
							center: { key: 'style', value: { 'text-align': 'center' } },
							justify: { key: 'style', value: { 'text-align': 'justify' } }
						}
					}
				);

				setModelData( model, modelTable( [
					[ '<paragraph alignment="right">00</paragraph>' ]
				] ) );

				expect( editor.getData() ).to.equalMarkup(
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td><p style="text-align:right;">00</p></td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			// https://github.com/ckeditor/ckeditor5/issues/8941
			// https://github.com/ckeditor/ckeditor5/issues/8979
			it( 'should create table with an empty cell', () => {
				model.schema.register( 'block', {
					allowWhere: '$block',
					allowContentOf: '$root'
				} );
				editor.conversion.elementToElement( { model: 'block', view: 'block' } );

				editor.setData(
					'<block>' +
						'<table>' +
							'<tr>' +
								'<td>&nbsp;</td>' +
							'</tr>' +
						'</table>' +
					'</block>'
				);

				expect( editor.getData() ).to.equalMarkup(
					'<block>' +
						'<figure class="table">' +
							'<table>' +
								'<tbody>' +
									'<tr>' +
										'<td>&nbsp;</td>' +
									'</tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>' +
					'</block>'
				);
			} );

			it( 'should be possible to overwrite', () => {
				editor.conversion.elementToElement( { model: 'tableRow', view: 'tr', converterPriority: 'high' } );
				editor.conversion.elementToElement( { model: 'tableCell', view: 'td', converterPriority: 'high' } );
				editor.conversion.elementToElement( { model: 'paragraph', view: 'p', converterPriority: 'highest' } );
				editor.conversion.for( 'downcast' ).add( dispatcher => {
					dispatcher.on( 'insert:table', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, 'insert' );

						const tableElement = conversionApi.writer.createContainerElement( 'table', { foo: 'bar' } );
						const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

						conversionApi.mapper.bindElements( data.item, tableElement );
						conversionApi.writer.insert( viewPosition, tableElement );
					}, { priority: 'high' } );
				} );

				setModelData( model, modelTable( [ [ '' ] ] ) );

				expect( editor.getData() ).to.equalMarkup(
					'<table foo="bar">' +
						'<tr><td><p>&nbsp;</p></td></tr>' +
					'</table>'
				);
			} );

			it( 'should re-create table on reinsert', () => {
				model.schema.register( 'wrapper', {
					allowWhere: '$block',
					allowContentOf: '$root'
				} );
				editor.conversion.elementToElement( { model: 'wrapper', view: 'div' } );

				setModelData( model, modelTable( [ [ '[]' ] ] ) );

				expect( editor.getData() ).to.equalMarkup(
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr><td>&nbsp;</td></tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);

				model.change( writer => {
					const table = model.document.getRoot().getChild( 0 );
					const range = writer.createRange( writer.createPositionBefore( table ), writer.createPositionAfter( table ) );
					const wrapper = writer.createElement( 'wrapper' );

					writer.wrap( range, wrapper );
				} );

				expect( editor.getData() ).to.equalMarkup(
					'<div>' +
						'<figure class="table">' +
							'<table>' +
								'<tbody>' +
									'<tr><td>&nbsp;</td></tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>' +
					'</div>'
				);
			} );

			describe( 'headingColumns attribute', () => {
				it( 'should mark heading columns table cells', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '12' ]
					], { headingColumns: 2 } ) );

					expect( editor.getData() ).to.equalMarkup(
						'<figure class="table">' +
							'<table>' +
								'<tbody>' +
									'<tr><th>00</th><th>01</th><td>02</td></tr>' +
									'<tr><th>10</th><th>11</th><td>12</td></tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>'
					);
				} );

				it( 'should mark heading columns table cells when one has colspan attribute', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03' ],
						[ { colspan: 2, contents: '10' }, '12', '13' ]
					], { headingColumns: 3 } ) );

					expect( editor.getData() ).to.equalMarkup(
						'<figure class="table">' +
							'<table>' +
								'<tbody>' +
									'<tr><th>00</th><th>01</th><th>02</th><td>03</td></tr>' +
									'<tr><th colspan="2">10</th><th>12</th><td>13</td></tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>'
					);
				} );

				it( 'should work with colspan and rowspan attributes on table cells', () => {
					// The table in this test looks like a table below:
					//
					//   Row headings | Normal cells
					//                |
					// +----+----+----+----+
					// | 00 | 01 | 02 | 03 |
					// |    +----+    +----+
					// |    | 11 |    | 13 |
					// |----+----+    +----+
					// | 20      |    | 23 |
					// |         +----+----+
					// |         | 32 | 33 |
					// +----+----+----+----+
					setModelData( model, modelTable( [
						[ { rowspan: 2, contents: '00' }, '01', { rowspan: 3, contents: '02' }, '03' ],
						[ '11', '13' ],
						[ { colspan: 2, rowspan: 2, contents: '20' }, '23' ],
						[ '32', '33' ]
					], { headingColumns: 3 } ) );

					expect( editor.getData() ).to.equalMarkup(
						'<figure class="table">' +
							'<table>' +
								'<tbody>' +
									'<tr><th rowspan="2">00</th><th>01</th><th rowspan="3">02</th><td>03</td></tr>' +
									'<tr><th>11</th><td>13</td></tr>' +
									'<tr><th colspan="2" rowspan="2">20</th><td>23</td></tr>' +
									'<tr><th>32</th><td>33</td></tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>'
					);
				} );
			} );

			it( 'should create table with tbody', () => {
				setModelData( model, modelTable( [ [ '' ] ] ) );

				expect( editor.getData() ).to.equalMarkup(
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr><td>&nbsp;</td></tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );
		} );
	} );

	describe( 'downcastRow()', () => {
		describe( 'editing pipeline', () => {
			it( 'should react to changed rows', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const row = writer.createElement( 'tableRow' );

					writer.insert( row, table, 1 );

					writer.insertElement( 'tableCell', row, 'end' );
					writer.insertElement( 'tableCell', row, 'end' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '', '' ]
				], { asWidget: true } ) );
			} );

			it( 'should properly consume already added rows', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const row = writer.createElement( 'tableRow' );

					writer.insert( row, table, 1 );

					writer.insertElement( 'tableCell', row, 'end' );
					writer.insertElement( 'tableCell', row, 'end' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '', '' ]
				], { asWidget: true } ) );

				model.change( writer => {
					const row = writer.createElement( 'tableRow' );

					writer.insert( row, table, 2 );

					writer.insertElement( 'tableCell', row, 'end' );
					writer.insertElement( 'tableCell', row, 'end' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '', '' ],
					[ '', '' ]
				], { asWidget: true } ) );
			} );

			it( 'should insert row on proper index', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '21', '22' ],
					[ '31', '32' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const row = writer.createElement( 'tableRow' );

					writer.insert( row, table, 1 );

					writer.insertElement( 'tableCell', row, 'end' );
					writer.insertElement( 'tableCell', row, 'end' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '', '' ],
					[ '21', '22' ],
					[ '31', '32' ]
				], { asWidget: true } ) );
			} );

			it( 'should insert row on proper index when table has heading rows defined - insert in body', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '21', '22' ],
					[ '31', '32' ]
				], { headingRows: 1, asWidget: true } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const row = writer.createElement( 'tableRow' );

					writer.insert( row, table, 1 );

					writer.insertElement( 'tableCell', row, 'end' );
					writer.insertElement( 'tableCell', row, 'end' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '', '' ],
					[ '21', '22' ],
					[ '31', '32' ]
				], { headingRows: 1, asWidget: true } ) );
			} );

			it( 'should insert row on proper index when table has heading rows defined - insert in heading', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '21', '22' ],
					[ '31', '32' ]
				], { headingRows: 2 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const row = writer.createElement( 'tableRow' );

					writer.insert( row, table, 1 );

					writer.insertElement( 'tableCell', row, 'end' );
					writer.insertElement( 'tableCell', row, 'end' );

					writer.setAttribute( 'headingRows', 3, table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '', '' ],
					[ '21', '22' ],
					[ '31', '32' ]
				], { headingRows: 3, asWidget: true } ) );
			} );

			it( 'should react to changed rows when previous rows\' cells has rowspans', () => {
				setModelData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, '01' ],
					[ '22' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const row = writer.createElement( 'tableRow' );

					writer.insert( row, table, 2 );
					writer.insertElement( 'tableCell', row, 'end' );
					writer.insertElement( 'tableCell', row, 'end' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ { rowspan: 2, contents: '00' }, '01' ],
					[ '22' ],
					[ '', '' ]
				], { asWidget: true } ) );
			} );

			it( 'should properly create row headings', () => {
				setModelData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, '01' ],
					[ '22' ]
				], { headingColumns: 1 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const firstRow = writer.createElement( 'tableRow' );

					writer.insert( firstRow, table, 2 );
					writer.insert( writer.createElement( 'tableCell' ), firstRow, 'end' );

					const secondRow = writer.createElement( 'tableRow' );

					writer.insert( secondRow, table, 3 );
					writer.insert( writer.createElement( 'tableCell' ), secondRow, 'end' );
					writer.insert( writer.createElement( 'tableCell' ), secondRow, 'end' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ { rowspan: 2, contents: '00', isHeading: true }, '01' ],
					[ '22' ],
					[ { contents: '', isHeading: true }, '' ],
					[ { contents: '', isHeading: true }, '' ]
				], { asWidget: true } ) );
			} );

			it( 'should create table cell inside inserted row as a widget', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const firstRow = writer.createElement( 'tableRow' );

					writer.insert( firstRow, table, 1 );
					writer.insert( writer.createElement( 'tableCell' ), firstRow, 'end' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph"></span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should react to removed row from the beginning of a body rows (no heading rows)', () => {
				setModelData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.remove( table.getChild( 1 ) );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">01</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should react to removed row from the end of a body rows (no heading rows)', () => {
				setModelData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.remove( table.getChild( 0 ) );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">10</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">11</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should react to removed row from the beginning of a heading rows (no body rows)', () => {
				setModelData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				], { headingRows: 2 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					// Removing row from a heading section changes requires changing heading rows attribute.
					writer.setAttribute( 'headingRows', 1, table );
					writer.remove( table.getChild( 0 ) );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<thead>' +
								'<tr>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">10</span>' +
									'</th>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">11</span>' +
									'</th>' +
								'</tr>' +
							'</thead>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should react to removed row from the end of a heading rows (no body rows)', () => {
				setModelData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				], { headingRows: 2 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					// Removing row from a heading section changes requires changing heading rows attribute.
					writer.setAttribute( 'headingRows', 1, table );
					writer.remove( table.getChild( 1 ) );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<thead>' +
								'<tr>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</th>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">01</span>' +
									'</th>' +
								'</tr>' +
							'</thead>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should react to removed row from the end of a heading rows (first cell in body has colspan)', () => {
				setModelData( model, modelTable( [
					[ '00[]', '01', '02', '03' ],
					[ { rowspan: 2, colspan: 2, contents: '10' }, '12', '13' ],
					[ '22', '23' ]
				], { headingRows: 1 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					// Removing row from a heading section changes requires changing heading rows attribute.
					writer.remove( table.getChild( 0 ) );
					writer.setAttribute( 'headingRows', 0, table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" ' +
											'colspan="2" contenteditable="true" role="textbox" rowspan="2">' +
										'<span class="ck-table-bogus-paragraph">10</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">12</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">13</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">22</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">23</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should remove empty thead if a last row was removed from a heading rows (has heading and body)', () => {
				setModelData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				], { headingRows: 1 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					// Removing row from a heading section changes requires changing heading rows attribute.
					writer.removeAttribute( 'headingRows', table );
					writer.remove( table.getChild( 0 ) );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">10</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">11</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should remove empty tbody if a last row was removed a body rows (has heading and body)', () => {
				setModelData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				], { headingRows: 1 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.remove( table.getChild( 1 ) );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<thead>' +
								'<tr>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</th>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">01</span>' +
									'</th>' +
								'</tr>' +
							'</thead>' +
						'</table>' +
					'</figure>'
				);
			} );
		} );
	} );

	describe( 'downcastCell()', () => {
		describe( 'editing pipeline', () => {
			it( 'should add tableCell on proper index in tr', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const row = table.getChild( 0 );

					writer.insertElement( 'tableCell', row, 1 );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '', '01' ]
				], { asWidget: true } ) );
			} );

			it( 'should add tableCell on proper index in tr when previous have colspans', () => {
				setModelData( model, modelTable( [
					[ { colspan: 2, contents: '00' }, '13' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const row = table.getChild( 0 );

					writer.insertElement( 'tableCell', row, 1 );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ { colspan: 2, contents: '00' }, '', '13' ]
				], { asWidget: true } ) );
			} );

			it( 'should add tableCell on proper index in tr when previous row have rowspans', () => {
				setModelData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, '01', '02' ],
					[ '11', '12' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.insertElement( 'tableCell', table.getChild( 0 ), 1 );
					writer.insertElement( 'tableCell', table.getChild( 1 ), 0 );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ { rowspan: 2, contents: '00' }, '', '01', '02' ],
					[ '', '11', '12' ]
				], { asWidget: true } ) );
			} );

			it( 'split cell simulation - simple', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const firstRow = table.getChild( 0 );
					const secondRow = table.getChild( 1 );

					writer.insertElement( 'tableCell', firstRow, 1 );
					writer.setAttribute( 'colspan', 2, secondRow.getChild( 0 ) );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '', '01' ],
					[ { colspan: 2, contents: '10' }, '11' ]
				], { asWidget: true } ) );
			} );

			it( 'merge simulation - simple', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const firstRow = table.getChild( 0 );

					writer.setAttribute( 'colspan', 2, firstRow.getChild( 0 ) );
					writer.remove( firstRow.getChild( 1 ) );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ { colspan: 2, contents: '00' } ],
					[ '10', '11' ]
				], { asWidget: true } ) );
			} );

			it( 'should create inserted table cell as a widget', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const row = table.getChild( 0 );

					writer.insert( writer.createElement( 'tableCell' ), row, 'end' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph"></span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );
		} );
	} );

	describe( 'heading columns conversion', () => {
		describe( 'editing pipeline', () => {
			it( 'should work for adding heading columns', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingColumns', 1, table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ { isHeading: true, contents: '00' }, '01' ],
					[ { isHeading: true, contents: '10' }, '11' ]
				], { asWidget: true } ) );
			} );

			it( 'should work for changing heading columns to a bigger number', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02', '03' ],
					[ '10', '11', '12', '13' ]
				], { headingColumns: 1 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingColumns', 3, table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ { isHeading: true, contents: '00' }, { isHeading: true, contents: '01' }, { isHeading: true, contents: '02' }, '03' ],
					[ { isHeading: true, contents: '10' }, { isHeading: true, contents: '11' }, { isHeading: true, contents: '12' }, '13' ]
				], { asWidget: true } ) );
			} );

			it( 'should work for changing heading columns to a smaller number', () => {
				setModelData( model, modelTable( [
					[ { isHeading: true, contents: '00' }, { isHeading: true, contents: '01' }, { isHeading: true, contents: '02' }, '03' ],
					[ { isHeading: true, contents: '10' }, { isHeading: true, contents: '11' }, { isHeading: true, contents: '12' }, '13' ]
				], { headingColumns: 3 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingColumns', 1, table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ { isHeading: true, contents: '00' }, '01', '02', '03' ],
					[ { isHeading: true, contents: '10' }, '11', '12', '13' ]
				], { asWidget: true } ) );
			} );

			it( 'should work for removing heading columns', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				], { headingColumns: 1 } ) );
				const table = root.getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'headingColumns', table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				], { asWidget: true } ) );
			} );

			it( 'should be possible to overwrite', () => {
				editor.conversion.attributeToAttribute( { model: 'headingColumns', view: 'headingColumns', converterPriority: 'high' } );
				editor.conversion.elementToElement( {
					model: 'tableCell',
					view: ( tableCell, { writer } ) => toWidgetEditable( writer.createEditableElement( 'td' ), writer ),
					converterPriority: 'high'
				} );
				setModelData( model, modelTable( [ [ '00[] ' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingColumns', 1, table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false" headingColumns="1">' +
					'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should work with adding table cells', () => {
				// +----+----+----+----+
				// | 00 | 01 | 02 | 03 |
				// +    +----+----+----+
				// |    | 11 | 12 | 13 |
				// +----+----+----+----+
				// | 20      | 22 | 23 |
				// +----+----+----+----+
				setModelData( model, modelTable( [
					[ { contents: '00', rowspan: 2 }, '01', '02', '03' ],
					[ '11', '12', '13' ],
					[ { contents: '20', colspan: 2 }, '22', '23' ]
				], { headingColumns: 2 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					// Inserting column in heading columns so update table's attribute also
					writer.setAttribute( 'headingColumns', 3, table );

					writer.insertElement( 'tableCell', table.getChild( 0 ), 2 );
					writer.insertElement( 'tableCell', table.getChild( 1 ), 1 );
					writer.insertElement( 'tableCell', table.getChild( 2 ), 1 );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { contents: '00', rowspan: 2 }, '01', '', '02', '03' ],
					[ '11', '', '12', '13' ],
					[ { contents: '20', colspan: 2 }, '', '22', '23' ]
				], { headingColumns: 3 } ) );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[
						{ isHeading: true, rowspan: 2, contents: '00' },
						{ isHeading: true, contents: '01' },
						{ isHeading: true, contents: '' },
						'02',
						'03'
					],
					[
						{ isHeading: true, contents: '11' },
						{ isHeading: true, contents: '' },
						'12',
						'13'
					],
					[
						{ isHeading: true, colspan: 2, contents: '20' },
						{ isHeading: true, contents: '' },
						'22',
						'23'
					]
				], { asWidget: true } ) );
			} );

			it( 'should create renamed cell as a widget', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingRows', 1, table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<thead>' +
								'<tr>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</th>' +
								'</tr>' +
							'</thead>' +
						'</table>' +
					'</figure>'
				);
			} );
		} );
	} );

	describe( 'heading rows conversion', () => {
		describe( 'editing pipeline', () => {
			it( 'should work for adding heading rows', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingRows', 2, table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 2, asWidget: true } ) );
			} );

			it( 'should work for changing number of heading rows to a bigger number', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 1 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingRows', 2, table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 2, asWidget: true } ) );
			} );

			it( 'should work for changing number of heading rows to a smaller number', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				], { headingRows: 3 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingRows', 2, table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ],
					[ '30', '31' ]
				], { headingRows: 2, asWidget: true } ) );
			} );

			it( 'should work for removing heading rows', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				], { headingRows: 2 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'headingRows', table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				], { asWidget: true } ) );
			} );

			it( 'should work for making heading rows without tbody', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingRows', 2, table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				], { headingRows: 2, asWidget: true } ) );
			} );

			it( 'should work with adding table rows at the beginning of a table', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				], { headingRows: 1 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingRows', 2, table );

					const tableRow = writer.createElement( 'tableRow' );

					writer.insert( tableRow, table, 0 );
					writer.insertElement( 'tableCell', tableRow, 'end' );
					writer.insertElement( 'tableCell', tableRow, 'end' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '', '' ],
					[ '00', '01' ],
					[ '10', '11' ]
				], { headingRows: 2, asWidget: true } ) );
			} );

			it( 'should work with adding a table row and expanding heading', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 1 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingRows', 2, table );

					const tableRow = writer.createElement( 'tableRow' );

					writer.insert( tableRow, table, 1 );
					writer.insertElement( 'tableCell', tableRow, 'end' );
					writer.insertElement( 'tableCell', tableRow, 'end' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '', '' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 2, asWidget: true } ) );
			} );

			it( 'should reorder rows with header correctly - up direction', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { headingRows: 1 } ) );

				const table = root.getChild( 0 );

				editor.model.change( writer => {
					writer.move(
						writer.createRangeOn( table.getChild( 1 ) ),
						writer.createPositionAt( table, 0 )
					);
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '10', '11', '12' ],
					[ '00', '01', '02' ]
				], { headingRows: 1 } ) );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '10', '11', '12' ],
					[ '00', '01', '02' ]
				], { headingRows: 1, asWidget: true } ) );
			} );

			it( 'should reorder rows with header correctly - down direction', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { headingRows: 1 } ) );

				const table = root.getChild( 0 );

				editor.model.change( writer => {
					writer.move(
						writer.createRangeOn( table.getChild( 0 ) ),
						writer.createPositionAt( table, 2 )
					);
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '10', '11', '12' ],
					[ '00', '01', '02' ]
				], { headingRows: 1 } ) );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '10', '11', '12' ],
					[ '00', '01', '02' ]
				], { headingRows: 1, asWidget: true } ) );
			} );

			it( 'should reorder columns with header correctly - left direction', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { headingColumns: 1 } ) );

				const table = root.getChild( 0 );

				editor.model.change( writer => {
					for ( const tableRow of table.getChildren() ) {
						writer.move(
							writer.createRangeOn( tableRow.getChild( 1 ) ),
							writer.createPositionAt( tableRow, 0 )
						);
					}
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '01', '00', '02' ],
					[ '11', '10', '12' ]
				], { headingColumns: 1 } ) );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ { isHeading: true, contents: '01' }, '00', '02' ],
					[ { isHeading: true, contents: '11' }, '10', '12' ]
				], { asWidget: true } ) );
			} );

			it( 'should reorder columns with header correctly - right direction', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { headingColumns: 1 } ) );

				const table = root.getChild( 0 );

				editor.model.change( writer => {
					for ( const tableRow of table.getChildren() ) {
						writer.move(
							writer.createRangeOn( tableRow.getChild( 0 ) ),
							writer.createPositionAt( tableRow, 2 )
						);
					}
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '01', '00', '02' ],
					[ '11', '10', '12' ]
				], { headingColumns: 1 } ) );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ { isHeading: true, contents: '01' }, '00', '02' ],
					[ { isHeading: true, contents: '11' }, '10', '12' ]
				], { asWidget: true } ) );
			} );

			it( 'should create renamed cell as a widget', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingColumns', 1, table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
					'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</th>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should properly integrate with undo', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 1 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingRows', 2, table );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 2, asWidget: true } ) );

				editor.execute( 'undo' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 1, asWidget: true } ) );
			} );
		} );
	} );

	describe( 'marker highlight conversion on table cell', () => {
		describe( 'single class in highlight descriptor', () => {
			beforeEach( async () => {
				editor = await VirtualTestEditor.create( { plugins: [ Paragraph, TableEditing ] } );

				model = editor.model;
				root = model.document.getRoot( 'main' );
				view = editor.editing.view;

				markerConversion( editor.conversion );
			} );

			it( 'should apply marker class on tableCell - on inserting a table', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				model.change( writer => {
					const cell = root.getNodeByPath( [ 0, 0, 0 ] );

					writer.addMarker( 'marker:yellow', {
						range: writer.createRangeOn( cell ),
						usingOperation: false
					} );

					checkCustomPropertyForHighlight( editor.editing.mapper.toViewElement( cell ) );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable highlight-yellow" contenteditable="true" ' +
										'role="textbox">' +
											'<span class="ck-table-bogus-paragraph">00</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);

				model.change( writer => {
					writer.removeMarker( 'marker:yellow' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should apply marker class on tableCell - on inserting a row', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const firstRow = writer.createElement( 'tableRow' );
					const cell = writer.createElement( 'tableCell' );

					writer.insert( firstRow, table, 1 );
					writer.insert( cell, firstRow, 'end' );

					writer.addMarker( 'marker:yellow', {
						range: writer.createRangeOn( cell ),
						usingOperation: false
					} );
				} );

				const cell = root.getNodeByPath( [ 0, 1, 0 ] );
				checkCustomPropertyForHighlight( editor.editing.mapper.toViewElement( cell ) );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
					'<div class="ck ck-widget__selection-handle"></div>' +
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
									'<span class="ck-table-bogus-paragraph">00</span>' +
								'</td>' +
							'</tr>' +
							'<tr>' +
								'<td class="ck-editor__editable ck-editor__nested-editable highlight-yellow" contenteditable="true" ' +
									'role="textbox">' +
										'<span class="ck-table-bogus-paragraph"></span>' +
								'</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' +
					'</figure>'
				);

				model.change( writer => {
					writer.removeMarker( 'marker:yellow' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph"></span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should apply marker class on tableCell - on inserting a table cell', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const row = table.getChild( 0 );
					const cell = writer.createElement( 'tableCell' );

					writer.insert( cell, row, 'end' );
					writer.addMarker( 'marker:yellow', {
						range: writer.createRangeOn( cell ),
						usingOperation: false
					} );
				} );

				const cell = root.getNodeByPath( [ 0, 0, 1 ] );
				checkCustomPropertyForHighlight( editor.editing.mapper.toViewElement( cell ) );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable highlight-yellow" contenteditable="true" ' +
										'role="textbox">' +
											'<span class="ck-table-bogus-paragraph"></span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);

				model.change( writer => {
					writer.removeMarker( 'marker:yellow' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph"></span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should preserve marker class on tableCell - when changing heading columns', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02', '03' ],
					[ '10', '11', '12', '13' ]
				], { headingColumns: 1 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const cell = root.getNodeByPath( [ 0, 0, 1 ] );

					writer.addMarker( 'marker:yellow', {
						range: writer.createRangeOn( cell ),
						usingOperation: false
					} );
				} );

				model.change( writer => {
					writer.setAttribute( 'headingColumns', 3, table );
				} );

				const cell = root.getNodeByPath( [ 0, 0, 1 ] );
				const viewElement = editor.editing.mapper.toViewElement( cell );

				checkCustomPropertyForHighlight( viewElement );
				expect( viewElement.hasClass( 'highlight-yellow' ) ).to.be.true;

				model.change( writer => {
					writer.removeMarker( 'marker:yellow' );
				} );

				expect( viewElement.hasClass( 'highlight-yellow' ) ).to.be.false;
			} );

			it( 'should preserve marker class on tableCell - when changing heading rows', () => {
				setModelData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 1 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const cell = root.getNodeByPath( [ 0, 1, 0 ] );

					writer.addMarker( 'marker:yellow', {
						range: writer.createRangeOn( cell ),
						usingOperation: false
					} );
				} );

				model.change( writer => {
					writer.setAttribute( 'headingRows', 2, table );
				} );

				const cell = root.getNodeByPath( [ 0, 1, 0 ] );
				const viewElement = editor.editing.mapper.toViewElement( cell );

				checkCustomPropertyForHighlight( viewElement );
				expect( viewElement.hasClass( 'highlight-yellow' ) ).to.be.true;

				model.change( writer => {
					writer.removeMarker( 'marker:yellow' );
				} );

				expect( viewElement.hasClass( 'highlight-yellow' ) ).to.be.false;
			} );
		} );

		describe( 'multiple classes in highlight descriptor', () => {
			beforeEach( async () => {
				editor = await VirtualTestEditor.create( { plugins: [ Paragraph, TableEditing ] } );

				model = editor.model;
				root = model.document.getRoot( 'main' );
				view = editor.editing.view;

				markerConversion( editor.conversion, [ 'marker', 'user-marker' ] );
			} );

			it( 'should apply marker class on tableCell - on inserting a table', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				model.change( writer => {
					const cell = root.getNodeByPath( [ 0, 0, 0 ] );

					writer.addMarker( 'marker:yellow', {
						range: writer.createRangeOn( cell ),
						usingOperation: false
					} );

					checkCustomPropertyForHighlight( editor.editing.mapper.toViewElement( cell ) );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable highlight-yellow marker user-marker"' +
										' contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);

				model.change( writer => {
					writer.removeMarker( 'marker:yellow' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );
		} );

		describe( 'attributes in highlight descriptor', () => {
			beforeEach( async () => {
				editor = await VirtualTestEditor.create( { plugins: [ Paragraph, TableEditing ] } );

				model = editor.model;
				root = model.document.getRoot( 'main' );
				view = editor.editing.view;

				markerConversion( editor.conversion, [], { 'data-foo': 'bar', 'data-abc': 'xyz' } );
			} );

			it( 'should apply attributes on tableCell - on inserting a table', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				model.change( writer => {
					const cell = root.getNodeByPath( [ 0, 0, 0 ] );

					writer.addMarker( 'marker:yellow', {
						range: writer.createRangeOn( cell ),
						usingOperation: false
					} );

					checkCustomPropertyForHighlight( editor.editing.mapper.toViewElement( cell ) );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable highlight-yellow"' +
										' contenteditable="true" data-abc="xyz" data-foo="bar" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);

				model.change( writer => {
					writer.removeMarker( 'marker:yellow' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true" role="textbox">' +
										'<span class="ck-table-bogus-paragraph">00</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should preserve attributes on tableCell - when changing heading columns', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02', '03' ],
					[ '10', '11', '12', '13' ]
				], { headingColumns: 1 } ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const cell = root.getNodeByPath( [ 0, 0, 1 ] );

					writer.addMarker( 'marker:yellow', {
						range: writer.createRangeOn( cell ),
						usingOperation: false
					} );
				} );

				model.change( writer => {
					writer.setAttribute( 'headingColumns', 3, table );
				} );

				const cell = root.getNodeByPath( [ 0, 0, 1 ] );
				const viewElement = editor.editing.mapper.toViewElement( cell );

				expect( viewElement.getAttribute( 'data-foo' ) ).to.equal( 'bar' );
				expect( viewElement.getAttribute( 'data-abc' ) ).to.equal( 'xyz' );

				model.change( writer => {
					writer.removeMarker( 'marker:yellow' );
				} );

				expect( viewElement.hasAttribute( 'data-foo' ) ).to.be.false;
				expect( viewElement.hasAttribute( 'data-abc' ) ).to.be.false;
			} );
		} );

		function markerConversion( conversion, extraClasses = null, extraAttributes ) {
			conversion.for( 'editingDowncast' ).markerToHighlight( {
				model: 'marker',
				view: data => {
					const className = 'highlight-' + data.markerName.split( ':' )[ 1 ];
					const descriptor = {};

					descriptor.classes = extraClasses ? [ ...extraClasses, className ] : className;

					if ( extraAttributes ) {
						descriptor.attributes = extraAttributes;
					}

					return descriptor;
				}
			} );
		}

		function checkCustomPropertyForHighlight( viewElement ) {
			const set = viewElement.getCustomProperty( 'addHighlight' );
			const remove = viewElement.getCustomProperty( 'removeHighlight' );

			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );
		}
	} );
} );
