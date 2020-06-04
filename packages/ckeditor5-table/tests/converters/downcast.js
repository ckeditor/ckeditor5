/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import TableEditing from '../../src/tableediting';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { defaultConversion, defaultSchema, modelTable, viewTable } from '../_utils/utils';

function paragraphInTableCell() {
	return dispatcher => dispatcher.on( 'insert:paragraph', ( evt, data, conversionApi ) => {
		const tableCell = data.item.parent;

		if ( tableCell.is( 'tableCell' ) && tableCell.childCount > 1 ) {
			for ( const child of tableCell.getChildren() ) {
				if ( child.name != 'paragraph' ) {
					continue;
				}

				const viewElement = conversionApi.mapper.toViewElement( child );

				if ( viewElement && viewElement.name === 'span' ) {
					conversionApi.mapper.unbindModelElement( tableCell );

					conversionApi.writer.removeStyle( 'display', viewElement );
					conversionApi.writer.rename( 'p', viewElement );

					conversionApi.mapper.bindElements( child, viewElement );
				}
			}
		}
	}, { converterPriority: 'highest' } );
}

describe( 'downcast converters', () => {
	let editor, model, doc, root, view;

	testUtils.createSinonSandbox();

	describe( 'downcastInsertTable()', () => {
		beforeEach( () => {
			return VirtualTestEditor.create( { plugins: [ Paragraph, TableEditing ] } )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
					root = doc.getRoot( 'main' );
					view = editor.editing.view;
				} );
		} );

		describe( 'editing pipeline', () => {
			it( 'should create table as a widget', () => {
				setModelData( model, modelTable( [ [ '' ] ] ) );

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ),
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block"></span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );
		} );

		describe( 'data pipeline', () => {
			it( 'should create table with tbody and thead', () => {
				setModelData( model, modelTable( [
					[ '00' ],
					[ '10' ]
				], { headingRows: 1 } ) );

				assertEqualMarkup( editor.getData(),
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

				assertEqualMarkup( editor.getData(),
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

				assertEqualMarkup( editor.getData(),
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

			it( 'should create table with block content', () => {
				setModelData( model, modelTable( [
					[ '<paragraph>00</paragraph><paragraph>foo</paragraph>', '01' ]
				] ) );

				assertEqualMarkup( editor.getData(),
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

				assertEqualMarkup( editor.getData(),
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

			it( 'should be possible to overwrite', () => {
				editor.conversion.elementToElement( { model: 'tableRow', view: 'tr', converterPriority: 'high' } );
				editor.conversion.elementToElement( { model: 'tableCell', view: 'td', converterPriority: 'high' } );
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

				assertEqualMarkup( editor.getData(),
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

				assertEqualMarkup( editor.getData(),
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

				assertEqualMarkup( editor.getData(),
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

					assertEqualMarkup( editor.getData(),
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

					assertEqualMarkup( editor.getData(),
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

					assertEqualMarkup( editor.getData(),
						'<figure class="table">' +
							'<table>' +
								'<tbody>' +
									'<tr><th rowspan="2">00</th><th>01</th><th rowspan="3">02</th><td>03</td></tr>' +
									'<tr><th>11</th><td>13</td></tr>' +
									'<tr><th rowspan="2" colspan="2">20</th><td>23</td></tr>' +
									'<tr><th>32</th><td>33</td></tr>' +
								'</tbody>' +
							'</table>' +
						'</figure>'
					);
				} );
			} );

			it( 'should create table with tbody', () => {
				setModelData( model, modelTable( [ [ '' ] ] ) );

				assertEqualMarkup( editor.getData(),
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

	describe( 'downcastInsertRow()', () => {
		// The beforeEach is duplicated due to ckeditor/ckeditor5#6574. New test are written using TableEditing.
		beforeEach( () => {
			return VirtualTestEditor.create()
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
					root = doc.getRoot( 'main' );
					view = editor.editing.view;

					defaultSchema( model.schema );
					defaultConversion( editor.conversion );
				} );
		} );

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

			assertEqualMarkup( editor.getData(), viewTable( [
				[ '00', '01' ],
				[ '', '' ]
			] ) );
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

			assertEqualMarkup( editor.getData(), viewTable( [
				[ '00', '01' ],
				[ '', '' ]
			] ) );

			model.change( writer => {
				const row = writer.createElement( 'tableRow' );

				writer.insert( row, table, 2 );

				writer.insertElement( 'tableCell', row, 'end' );
				writer.insertElement( 'tableCell', row, 'end' );
			} );

			assertEqualMarkup( editor.getData(), viewTable( [
				[ '00', '01' ],
				[ '', '' ],
				[ '', '' ]
			] ) );
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

			assertEqualMarkup( editor.getData(), viewTable( [
				[ '00', '01' ],
				[ '', '' ],
				[ '21', '22' ],
				[ '31', '32' ]
			] ) );
		} );

		it( 'should insert row on proper index when table has heading rows defined - insert in body', () => {
			setModelData( model, modelTable( [
				[ '00', '01' ],
				[ '21', '22' ],
				[ '31', '32' ]
			], { headingRows: 1 } ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				const row = writer.createElement( 'tableRow' );

				writer.insert( row, table, 1 );

				writer.insertElement( 'tableCell', row, 'end' );
				writer.insertElement( 'tableCell', row, 'end' );
			} );

			assertEqualMarkup( editor.getData(), viewTable( [
				[ '00', '01' ],
				[ '', '' ],
				[ '21', '22' ],
				[ '31', '32' ]
			], { headingRows: 1 } ) );
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
			} );

			assertEqualMarkup( editor.getData(), viewTable( [
				[ '00', '01' ],
				[ '', '' ],
				[ '21', '22' ],
				[ '31', '32' ]
			], { headingRows: 3 } ) );
		} );

		it( 'should react to changed rows when previous rows\' cells has rowspans', () => {
			setModelData( model, modelTable( [
				[ { rowspan: 3, contents: '00' }, '01' ],
				[ '22' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				const row = writer.createElement( 'tableRow' );

				writer.insert( row, table, 2 );
				writer.insertElement( 'tableCell', row, 'end' );
			} );

			assertEqualMarkup( editor.getData(), viewTable( [
				[ { rowspan: 3, contents: '00' }, '01' ],
				[ '22' ],
				[ '' ]
			] ) );
		} );

		it( 'should properly create row headings', () => {
			setModelData( model, modelTable( [
				[ { rowspan: 3, contents: '00' }, '01' ],
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

			assertEqualMarkup( editor.getData(), viewTable( [
				[ { rowspan: 3, contents: '00', isHeading: true }, '01' ],
				[ '22' ],
				[ '' ],
				[ { contents: '', isHeading: true }, '' ]
			] ) );
		} );

		describe( 'options.asWidget=true', () => {
			beforeEach( () => {
				return VirtualTestEditor.create()
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						doc = model.document;
						root = doc.getRoot( 'main' );
						view = editor.editing.view;

						defaultSchema( model.schema );
						defaultConversion( editor.conversion, true );
					} );
			} );

			it( 'should create table cell inside inserted row as a widget', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const firstRow = writer.createElement( 'tableRow' );

					writer.insert( firstRow, table, 1 );
					writer.insert( writer.createElement( 'tableCell' ), firstRow, 'end' );
				} );

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ),
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">00</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true"></td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );
		} );
	} );

	describe( 'downcastInsertCell()', () => {
		// The beforeEach is duplicated due to ckeditor/ckeditor5#6574. New test are written using TableEditing.
		beforeEach( () => {
			return VirtualTestEditor.create()
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
					root = doc.getRoot( 'main' );
					view = editor.editing.view;

					defaultSchema( model.schema );
					defaultConversion( editor.conversion );
				} );
		} );

		it( 'should add tableCell on proper index in tr', () => {
			setModelData( model, modelTable( [
				[ '00', '01' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				const row = table.getChild( 0 );

				writer.insertElement( 'tableCell', row, 1 );
			} );

			assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
				[ '00', '', '01' ]
			] ) );
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

			assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
				[ { colspan: 2, contents: '00' }, '', '13' ]
			] ) );
		} );

		it( 'should add tableCell on proper index in tr when previous row have rowspans', () => {
			setModelData( model, modelTable( [
				[ { rowspan: 2, contents: '00' }, '13' ],
				[ '11', '12' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.insertElement( 'tableCell', table.getChild( 0 ), 1 );
				writer.insertElement( 'tableCell', table.getChild( 1 ), 0 );
			} );

			assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
				[ { rowspan: 2, contents: '00' }, '', '13' ],
				[ '', '11', '12' ]
			] ) );
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

			assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
				[ '00', '', '01' ],
				[ { colspan: 2, contents: '10' }, '11' ]
			] ) );
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

			assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
				[ { colspan: 2, contents: '00' } ],
				[ '10', '11' ]
			] ) );
		} );

		describe( 'options.asWidget=true', () => {
			beforeEach( () => {
				return VirtualTestEditor.create()
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						doc = model.document;
						root = doc.getRoot( 'main' );
						view = editor.editing.view;

						defaultSchema( model.schema );
						defaultConversion( editor.conversion, true );
					} );
			} );

			it( 'should create inserted table cell as a widget', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const row = table.getChild( 0 );

					writer.insert( writer.createElement( 'tableCell' ), row, 'end' );
				} );

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ),
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
					'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">00</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true"></td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );
		} );
	} );

	describe( 'downcastTableHeadingColumnsChange()', () => {
		// The beforeEach is duplicated due to ckeditor/ckeditor5#6574. New test are written using TableEditing.
		beforeEach( () => {
			return VirtualTestEditor.create()
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
					root = doc.getRoot( 'main' );
					view = editor.editing.view;

					defaultSchema( model.schema );
					defaultConversion( editor.conversion );
				} );
		} );

		it( 'should work for adding heading columns', () => {
			setModelData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'headingColumns', 1, table );
			} );

			assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
				[ { isHeading: true, contents: '00' }, '01' ],
				[ { isHeading: true, contents: '10' }, '11' ]
			], { headingColumns: 1 } ) );
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

			assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
				[ { isHeading: true, contents: '00' }, { isHeading: true, contents: '01' }, { isHeading: true, contents: '02' }, '03' ],
				[ { isHeading: true, contents: '10' }, { isHeading: true, contents: '11' }, { isHeading: true, contents: '12' }, '13' ]
			] ) );
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

			assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
				[ { isHeading: true, contents: '00' }, '01', '02', '03' ],
				[ { isHeading: true, contents: '10' }, '11', '12', '13' ]
			], { headingColumns: 3 } ) );
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

			assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should be possible to overwrite', () => {
			editor.conversion.attributeToAttribute( { model: 'headingColumns', view: 'headingColumns', converterPriority: 'high' } );
			setModelData( model, modelTable( [ [ '00' ] ] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'headingColumns', 1, table );
			} );

			assertEqualMarkup( getViewData( view, { withoutSelection: true } ),
				'<figure class="table" headingColumns="1">' +
					'<table>' +
						'<tbody>' +
							'<tr><td>00</td></tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			);
		} );

		it( 'should work with adding table cells', () => {
			setModelData( model, modelTable( [
				[ { rowspan: 2, contents: '00' }, '01', '13', '14' ],
				[ '11', '12', '13' ],
				[ { colspan: 2, contents: '20' }, '22', '23' ]
			], { headingColumns: 2 } ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				// Inserting column in heading columns so update table's attribute also
				writer.setAttribute( 'headingColumns', 3, table );

				writer.insertElement( 'tableCell', table.getChild( 0 ), 2 );
				writer.insertElement( 'tableCell', table.getChild( 1 ), 1 );
				writer.insertElement( 'tableCell', table.getChild( 2 ), 1 );
			} );

			assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
				[
					{ isHeading: true, rowspan: 2, contents: '00' },
					{ isHeading: true, contents: '01' },
					{ isHeading: true, contents: '' },
					'13',
					'14'
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
			] ) );
		} );

		describe( 'options.asWidget=true', () => {
			beforeEach( () => {
				return VirtualTestEditor.create()
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						doc = model.document;
						root = doc.getRoot( 'main' );
						view = editor.editing.view;

						defaultSchema( model.schema );
						defaultConversion( editor.conversion, true );
					} );
			} );

			it( 'should create renamed cell as a widget', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingRows', 1, table );
				} );

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ),
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<thead>' +
								'<tr>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">00</span>' +
									'</th>' +
								'</tr>' +
							'</thead>' +
						'</table>' +
					'</figure>'
				);
			} );
		} );
	} );

	describe( 'downcastTableHeadingRowsChange()', () => {
		// The beforeEach is duplicated due to ckeditor/ckeditor5#6574. New test are written using TableEditing.
		beforeEach( () => {
			return VirtualTestEditor.create( { plugins: [ Paragraph, TableEditing ] } )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
					root = doc.getRoot( 'main' );
					view = editor.editing.view;
				} );
		} );

		// The heading rows change downcast conversion is not executed in data pipeline.
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

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
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

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
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

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
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

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
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

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
					[ '00', '01' ],
					[ '10', '11' ]
				], { headingRows: 2, asWidget: true } ) );
			} );

			it( 'should be possible to overwrite', () => {
				editor.conversion.attributeToAttribute( {
					model: 'headingRows',
					view: 'headingRows',
					converterPriority: 'high'
				} );
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingRows', 1, table );
				} );

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ),
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false" headingRows="1">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">00</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
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

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
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

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
					[ '00', '01' ],
					[ '', '' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 2, asWidget: true } ) );
			} );

			it( 'should create renamed cell as a widget', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingColumns', 1, table );
				} );

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ),
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
					'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">00</span>' +
									'</th>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );
		} );
	} );

	describe( 'downcastRemoveRow()', () => {
		// The beforeEach is duplicated due to ckeditor/ckeditor5#6574. New test are written using TableEditing.
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, TableEditing ] } );

			model = editor.model;
			root = model.document.getRoot( 'main' );
			view = editor.editing.view;
		} );

		// The remove row downcast conversion is not executed in data pipeline.
		describe( 'editing pipeline', () => {
			it( 'should react to removed row from the beginning of a body rows (no heading rows)', () => {
				setModelData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.remove( table.getChild( 1 ) );
				} );

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ),
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">00</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">01</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should react to removed row form the end of a body rows (no heading rows)', () => {
				setModelData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.remove( table.getChild( 0 ) );
				} );

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ),
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">10</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">11</span>' +
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

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ),
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<thead>' +
								'<tr>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">10</span>' +
									'</th>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">11</span>' +
									'</th>' +
								'</tr>' +
							'</thead>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should react to removed row form the end of a heading rows (no body rows)', () => {
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

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ),
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<thead>' +
								'<tr>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">00</span>' +
									'</th>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">01</span>' +
									'</th>' +
								'</tr>' +
							'</thead>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should react to removed row form the end of a heading rows (first cell in body has colspan)', () => {
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

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ),
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
					'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" ' +
										'colspan="2" contenteditable="true" rowspan="2">' +
										'<span style="display:inline-block">10</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">12</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">13</span>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">22</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">23</span>' +
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

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ),
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">10</span>' +
									'</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">11</span>' +
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

				assertEqualMarkup( getViewData( view, { withoutSelection: true } ),
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<thead>' +
								'<tr>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">00</span>' +
									'</th>' +
									'<th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
										'<span style="display:inline-block">01</span>' +
									'</th>' +
								'</tr>' +
							'</thead>' +
						'</table>' +
					'</figure>'
				);
			} );
		} );
	} );

	describe( 'options.asWidget=true', () => {
		beforeEach( () => {
			return VirtualTestEditor.create()
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
					root = doc.getRoot( 'main' );
					view = editor.editing.view;

					defaultSchema( model.schema );
					defaultConversion( editor.conversion, true );

					editor.conversion.for( 'downcast' ).add( paragraphInTableCell() );
				} );
		} );

		it( 'should rename <span> to <p> when more then one block content inside table cell', () => {
			setModelData( model, modelTable( [
				[ '00[]' ]
			] ) );

			assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
				[ '00' ]
			], { asWidget: true } ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				const nodeByPath = table.getNodeByPath( [ 0, 0, 0 ] );

				const paragraph = writer.createElement( 'paragraph' );

				writer.insert( paragraph, nodeByPath, 'after' );

				writer.setSelection( nodeByPath.nextSibling, 0 );
			} );

			assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
				[ '<p>00</p><p></p>' ]
			], { asWidget: true } ) );
		} );

		it( 'should rename <span> to <p> for single paragraph with attribute', () => {
			model.schema.extend( '$block', { allowAttributes: 'foo' } );
			editor.conversion.attributeToAttribute( { model: 'foo', view: 'foo' } );

			setModelData( model, modelTable( [
				[ '<paragraph foo="bar">00[]</paragraph>' ]
			] ) );

			assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
				[ '<p foo="bar">00</p>' ]
			], { asWidget: true } ) );
		} );
	} );
} );
