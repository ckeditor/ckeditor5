/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import {
	downcastInsertCell,
	downcastInsertRow,
	downcastInsertTable,
	downcastRemoveRow,
	downcastTableHeadingColumnsChange,
	downcastTableHeadingRowsChange
} from '../../src/converters/downcast';
import { formatTable, formattedViewTable, modelTable } from '../_utils/utils';
import env from '@ckeditor/ckeditor5-utils/src/env';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'downcast converters', () => {
	let editor, model, doc, root, viewDocument;

	beforeEach( () => {
		// Most tests assume non-edge environment but we do not set `contenteditable=false` on Edge so stub `env.isEdge`.
		sinon.stub( env, 'isEdge' ).get( () => false );

		return VirtualTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				root = doc.getRoot( 'main' );
				viewDocument = editor.editing.view;

				const conversion = editor.conversion;
				const schema = model.schema;

				schema.register( 'table', {
					allowWhere: '$block',
					allowAttributes: [ 'headingRows', 'headingColumns' ],
					isObject: true
				} );

				schema.register( 'tableRow', { allowIn: 'table' } );

				schema.register( 'tableCell', {
					allowIn: 'tableRow',
					allowContentOf: '$block',
					allowAttributes: [ 'colspan', 'rowspan' ],
					isLimit: true
				} );

				conversion.for( 'downcast' ).add( downcastInsertTable() );
				conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
				conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );

				// Insert conversion
				conversion.for( 'downcast' ).add( downcastInsertRow() );
				conversion.for( 'downcast' ).add( downcastInsertCell() );

				conversion.for( 'downcast' ).add( downcastRemoveRow() );

				conversion.for( 'downcast' ).add( downcastTableHeadingRowsChange() );
				conversion.for( 'downcast' ).add( downcastTableHeadingColumnsChange() );
			} );
	} );

	describe( 'downcastInsertTable()', () => {
		it( 'should create table with tbody', () => {
			setModelData( model, modelTable( [ [ '' ] ] ) );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
				'<figure class="table">' +
					'<table>' +
						'<tbody>' +
							'<tr><td></td></tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			) );
		} );

		it( 'should create table with tbody and thead', () => {
			setModelData( model, modelTable( [
				[ '00' ],
				[ '10' ]
			], { headingRows: 1 } ) );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
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
			) );
		} );

		it( 'should create table with thead', () => {
			setModelData( model, modelTable( [
				[ '00' ],
				[ '10' ]
			], { headingRows: 2 } ) );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
				'<figure class="table">' +
					'<table>' +
						'<thead>' +
							'<tr><th>00</th></tr>' +
							'<tr><th>10</th></tr>' +
						'</thead>' +
					'</table>' +
				'</figure>'
			) );
		} );

		it( 'should create table with heading columns and rows', () => {
			setModelData( model, modelTable( [
				[ '00', '01', '02', '03' ],
				[ '10', '11', '12', '13' ]
			], { headingColumns: 3, headingRows: 1 } ) );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
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
			) );
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
				'<table foo="bar">' +
					'<tr><td></td></tr>' +
				'</table>'
			) );
		} );

		describe( 'headingColumns attribute', () => {
			it( 'should mark heading columns table cells', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { headingColumns: 2 } ) );

				expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr><th>00</th><th>01</th><td>02</td></tr>' +
								'<tr><th>10</th><th>11</th><td>12</td></tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				) );
			} );

			it( 'should mark heading columns table cells when one has colspan attribute', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02', '03' ],
					[ { colspan: 2, contents: '10' }, '12', '13' ]
				], { headingColumns: 3 } ) );

				expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr><th>00</th><th>01</th><th>02</th><td>03</td></tr>' +
								'<tr><th colspan="2">10</th><th>12</th><td>13</td></tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				) );
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

				expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
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
				) );
			} );
		} );

		describe( 'asWidget', () => {
			beforeEach( () => {
				return VirtualTestEditor.create()
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						doc = model.document;
						root = doc.getRoot( 'main' );
						viewDocument = editor.editing.view;

						const conversion = editor.conversion;
						const schema = model.schema;

						schema.register( 'table', {
							allowWhere: '$block',
							allowAttributes: [ 'headingRows', 'headingColumns' ],
							isObject: true
						} );

						schema.register( 'tableRow', { allowIn: 'table' } );

						schema.register( 'tableCell', {
							allowIn: 'tableRow',
							allowContentOf: '$block',
							allowAttributes: [ 'colspan', 'rowspan' ],
							isLimit: true
						} );

						conversion.for( 'downcast' ).add( downcastInsertTable( { asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastInsertRow( { asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastInsertCell( { asWidget: true } ) );

						conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
						conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );
					} );
			} );

			it( 'should create table as a widget', () => {
				setModelData( model, modelTable( [ [ '' ] ] ) );

				expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
					'<figure class="ck-widget ck-widget_selectable table" contenteditable="false">' +
					'<div class="ck ck-widget__selection-handler"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr><td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true"></td></tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				) );
			} );
		} );
	} );

	describe( 'downcastInsertRow()', () => {
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '00', '01' ],
				[ '', '' ]
			] ) );

			model.change( writer => {
				const row = writer.createElement( 'tableRow' );

				writer.insert( row, table, 2 );

				writer.insertElement( 'tableCell', row, 'end' );
				writer.insertElement( 'tableCell', row, 'end' );
			} );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ { rowspan: 3, contents: '00', isHeading: true }, '01' ],
				[ '22' ],
				[ '' ],
				[ { contents: '', isHeading: true }, '' ]
			] ) );
		} );

		describe( 'asWidget', () => {
			beforeEach( () => {
				return VirtualTestEditor.create()
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						doc = model.document;
						root = doc.getRoot( 'main' );
						viewDocument = editor.editing.view;

						const conversion = editor.conversion;
						const schema = model.schema;

						schema.register( 'table', {
							allowWhere: '$block',
							allowAttributes: [ 'headingRows', 'headingColumns' ],
							isObject: true
						} );

						schema.register( 'tableRow', { allowIn: 'table' } );

						schema.register( 'tableCell', {
							allowIn: 'tableRow',
							allowContentOf: '$block',
							allowAttributes: [ 'colspan', 'rowspan' ],
							isLimit: true
						} );

						conversion.for( 'downcast' ).add( downcastInsertTable( { asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastInsertRow( { asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastInsertCell( { asWidget: true } ) );

						conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
						conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );
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

				expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
					'<figure class="ck-widget ck-widget_selectable table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handler"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr><td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">00</td></tr>' +
								'<tr><td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true"></td></tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				) );
			} );
		} );
	} );

	describe( 'downcastInsertCell()', () => {
		it( 'should add tableCell on proper index in tr', () => {
			setModelData( model, modelTable( [
				[ '00', '01' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				const row = table.getChild( 0 );

				writer.insertElement( 'tableCell', row, 1 );
			} );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ { colspan: 2, contents: '00' } ],
				[ '10', '11' ]
			] ) );
		} );

		describe( 'asWidget', () => {
			beforeEach( () => {
				return VirtualTestEditor.create()
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						doc = model.document;
						root = doc.getRoot( 'main' );
						viewDocument = editor.editing.view;

						const conversion = editor.conversion;
						const schema = model.schema;

						schema.register( 'table', {
							allowWhere: '$block',
							allowAttributes: [ 'headingRows', 'headingColumns' ],
							isObject: true
						} );

						schema.register( 'tableRow', { allowIn: 'table' } );

						schema.register( 'tableCell', {
							allowIn: 'tableRow',
							allowContentOf: '$block',
							allowAttributes: [ 'colspan', 'rowspan' ],
							isLimit: true
						} );

						conversion.for( 'downcast' ).add( downcastInsertTable( { asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastInsertRow( { asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastInsertCell( { asWidget: true } ) );

						conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
						conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );
					} );
			} );

			it( 'should create inserted table cell as a widget', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					const row = table.getChild( 0 );

					writer.insert( writer.createElement( 'tableCell' ), row, 'end' );
				} );

				expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
					'<figure class="ck-widget ck-widget_selectable table" contenteditable="false">' +
					'<div class="ck ck-widget__selection-handler"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">00</td>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true"></td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				) );
			} );
		} );
	} );

	describe( 'downcastTableHeadingColumnsChange()', () => {
		it( 'should work for adding heading columns', () => {
			setModelData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'headingColumns', 1, table );
			} );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
				'<figure class="table" headingColumns="1">' +
					'<table>' +
						'<tbody>' +
							'<tr><td>00</td></tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			) );
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
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

		describe( 'asWidget', () => {
			beforeEach( () => {
				return VirtualTestEditor.create()
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						doc = model.document;
						root = doc.getRoot( 'main' );
						viewDocument = editor.editing.view;

						const conversion = editor.conversion;
						const schema = model.schema;

						schema.register( 'table', {
							allowWhere: '$block',
							allowAttributes: [ 'headingRows', 'headingColumns' ],
							isObject: true
						} );

						schema.register( 'tableRow', { allowIn: 'table' } );

						schema.register( 'tableCell', {
							allowIn: 'tableRow',
							allowContentOf: '$block',
							allowAttributes: [ 'colspan', 'rowspan' ],
							isLimit: true
						} );

						conversion.for( 'downcast' ).add( downcastInsertTable( { asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastInsertRow( { asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastInsertCell( { asWidget: true } ) );

						conversion.for( 'downcast' ).add( downcastTableHeadingColumnsChange( { asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastTableHeadingRowsChange( { asWidget: true } ) );

						conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
						conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );
					} );
			} );

			it( 'should create renamed cell as a widget', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingRows', 1, table );
				} );

				expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
					'<figure class="ck-widget ck-widget_selectable table" contenteditable="false">' +
					'<div class="ck ck-widget__selection-handler"></div>' +
						'<table>' +
							'<thead>' +
								'<tr><th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">00</th></tr>' +
							'</thead>' +
						'</table>' +
					'</figure>'
				) );
			} );
		} );
	} );

	describe( 'downcastTableHeadingRowsChange()', () => {
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			], { headingRows: 2 } ) );
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			], { headingRows: 2 } ) );
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ],
				[ '30', '31' ]
			], { headingRows: 2 } ) );
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			] ) );
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should be possible to overwrite', () => {
			editor.conversion.attributeToAttribute( { model: 'headingRows', view: 'headingRows', converterPriority: 'high' } );
			setModelData( model, modelTable( [ [ '00' ] ] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'headingRows', 1, table );
			} );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
				'<figure class="table" headingRows="1">' +
					'<table>' +
						'<tbody>' +
							'<tr><td>00</td></tr>' +
						'</tbody>' +
					'</table>' +
				'</figure>'
			) );
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

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '', '' ],
				[ '00', '01' ],
				[ '10', '11' ]
			], { headingRows: 2 } ) );
		} );

		describe( 'asWidget', () => {
			beforeEach( () => {
				return VirtualTestEditor.create()
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						doc = model.document;
						root = doc.getRoot( 'main' );
						viewDocument = editor.editing.view;

						const conversion = editor.conversion;
						const schema = model.schema;

						schema.register( 'table', {
							allowWhere: '$block',
							allowAttributes: [ 'headingRows', 'headingColumns' ],
							isObject: true
						} );

						schema.register( 'tableRow', { allowIn: 'table' } );

						schema.register( 'tableCell', {
							allowIn: 'tableRow',
							allowContentOf: '$block',
							allowAttributes: [ 'colspan', 'rowspan' ],
							isLimit: true
						} );

						conversion.for( 'downcast' ).add( downcastInsertTable( { asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastInsertRow( { asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastInsertCell( { asWidget: true } ) );

						conversion.for( 'downcast' ).add( downcastTableHeadingColumnsChange( { asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastTableHeadingRowsChange( { asWidget: true } ) );

						conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
						conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );
					} );
			} );

			it( 'should create renamed cell as a widget', () => {
				setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingColumns', 1, table );
				} );

				expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
					'<figure class="ck-widget ck-widget_selectable table" contenteditable="false">' +
					'<div class="ck ck-widget__selection-handler"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr><th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">00</th></tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				) );
			} );
		} );
	} );

	describe( 'downcastRemoveRow()', () => {
		it( 'should react to removed row from the beginning of a tbody', () => {
			setModelData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.remove( table.getChild( 1 ) );
			} );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '00', '01' ]
			] ) );
		} );

		it( 'should react to removed row form the end of a tbody', () => {
			setModelData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.remove( table.getChild( 0 ) );
			} );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '10', '11' ]
			] ) );
		} );

		it( 'should react to removed row from the beginning of a thead', () => {
			setModelData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			], { headingRows: 2 } ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.remove( table.getChild( 1 ) );
			} );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '00', '01' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should react to removed row form the end of a thead', () => {
			setModelData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			], { headingRows: 2 } ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.remove( table.getChild( 0 ) );
			} );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '10', '11' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should remove empty thead section if a last row was removed from thead', () => {
			setModelData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			], { headingRows: 1 } ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'headingRows', 0, table );
				writer.remove( table.getChild( 0 ) );
			} );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '10', '11' ]
			] ) );
		} );

		it( 'should remove empty tbody section if a last row was removed from tbody', () => {
			setModelData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			], { headingRows: 1 } ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.remove( table.getChild( 1 ) );
			} );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '00', '01' ]
			], { headingRows: 1 } ) );
		} );
	} );
} );
