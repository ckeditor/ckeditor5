/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import {
	downcastAttributeChange,
	downcastInsertCell,
	downcastInsertRow,
	downcastInsertTable,
	downcastRemoveRow
} from '../../src/converters/downcast';
import { formatTable, formattedViewTable, modelTable, viewTable } from '../_utils/utils';

describe( 'downcast converters', () => {
	let editor, model, doc, root, viewDocument;

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
					isBlock: true,
					isObject: true
				} );

				schema.register( 'tableRow', {
					allowIn: 'table',
					allowAttributes: [],
					isBlock: true,
					isLimit: true
				} );

				schema.register( 'tableCell', {
					allowIn: 'tableRow',
					allowContentOf: '$block',
					allowAttributes: [ 'colspan', 'rowspan' ],
					isBlock: true,
					isLimit: true
				} );

				conversion.for( 'downcast' ).add( downcastInsertTable() );
				conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
				conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );

				// Insert conversion
				conversion.for( 'downcast' ).add( downcastInsertRow() );
				conversion.for( 'downcast' ).add( downcastInsertCell() );

				conversion.for( 'downcast' ).add( downcastRemoveRow() );

				conversion.for( 'downcast' ).add( downcastAttributeChange( { attribute: 'headingRows' } ) );
				conversion.for( 'downcast' ).add( downcastAttributeChange( { attribute: 'headingColumns' } ) );
			} );
	} );

	describe( 'downcastInsertTable()', () => {
		it( 'should create table with tbody', () => {
			setModelData( model,
				'<table>' +
				'<tableRow><tableCell></tableCell></tableRow>' +
				'</table>'
			);

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<table>' +
				'<tbody>' +
				'<tr><td></td></tr>' +
				'</tbody>' +
				'</table>'
			);
		} );

		it( 'should create table with tbody and thead', () => {
			setModelData( model,
				'<table headingRows="1">' +
				'<tableRow><tableCell>1</tableCell></tableRow>' +
				'<tableRow><tableCell>2</tableCell></tableRow>' +
				'</table>'
			);

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<table>' +
				'<thead>' +
				'<tr><th>1</th></tr>' +
				'</thead>' +
				'<tbody>' +
				'<tr><td>2</td></tr>' +
				'</tbody>' +
				'</table>'
			);
		} );

		it( 'should create table with thead', () => {
			setModelData( model,
				'<table headingRows="2">' +
				'<tableRow><tableCell>1</tableCell></tableRow>' +
				'<tableRow><tableCell>2</tableCell></tableRow>' +
				'</table>'
			);

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<table>' +
				'<thead>' +
				'<tr><th>1</th></tr>' +
				'<tr><th>2</th></tr>' +
				'</thead>' +
				'</table>'
			);
		} );

		it( 'should create table with heading columns and rows', () => {
			setModelData( model,
				'<table headingColumns="3" headingRows="1">' +
				'<tableRow>' +
				'<tableCell>11</tableCell><tableCell>12</tableCell><tableCell>13</tableCell><tableCell>14</tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
				'<tableCell>21</tableCell><tableCell>22</tableCell><tableCell>23</tableCell><tableCell>24</tableCell>' +
				'</tableRow>' +
				'</table>'
			);

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<table>' +
				'<thead>' +
				'<tr><th>11</th><th>12</th><th>13</th><th>14</th></tr>' +
				'</thead>' +
				'<tbody>' +
				'<tr><th>21</th><th>22</th><th>23</th><td>24</td></tr>' +
				'</tbody>' +
				'</table>'
			);
		} );

		it( 'should be possible to overwrite', () => {
			editor.conversion.elementToElement( { model: 'tableRow', view: 'tr', priority: 'high' } );
			editor.conversion.elementToElement( { model: 'tableCell', view: 'td', priority: 'high' } );
			editor.conversion.for( 'downcast' ).add( dispatcher => {
				dispatcher.on( 'insert:table', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'insert' );

					const tableElement = conversionApi.writer.createContainerElement( 'table', { foo: 'bar' } );
					const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

					conversionApi.mapper.bindElements( data.item, tableElement );
					conversionApi.writer.insert( viewPosition, tableElement );
				}, { priority: 'high' } );
			} );

			setModelData( model,
				'<table>' +
				'<tableRow><tableCell></tableCell></tableRow>' +
				'</table>'
			);

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<table foo="bar">' +
				'<tr><td></td></tr>' +
				'</table>'
			);
		} );

		describe( 'headingColumns attribute', () => {
			it( 'should mark heading columns table cells', () => {
				setModelData( model,
					'<table headingColumns="2">' +
					'<tableRow><tableCell>11</tableCell><tableCell>12</tableCell><tableCell>13</tableCell></tableRow>' +
					'<tableRow><tableCell>21</tableCell><tableCell>22</tableCell><tableCell>23</tableCell></tableRow>' +
					'</table>'
				);

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<table>' +
					'<tbody>' +
					'<tr><th>11</th><th>12</th><td>13</td></tr>' +
					'<tr><th>21</th><th>22</th><td>23</td></tr>' +
					'</tbody>' +
					'</table>'
				);
			} );

			it( 'should mark heading columns table cells when one has colspan attribute', () => {
				setModelData( model,
					'<table headingColumns="3">' +
					'<tableRow>' +
					'<tableCell>11</tableCell><tableCell>12</tableCell><tableCell>13</tableCell><tableCell>14</tableCell>' +
					'</tableRow>' +
					'<tableRow><tableCell colspan="2">21</tableCell><tableCell>23</tableCell><tableCell>24</tableCell></tableRow>' +
					'</table>'
				);

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<table>' +
					'<tbody>' +
					'<tr><th>11</th><th>12</th><th>13</th><td>14</td></tr>' +
					'<tr><th colspan="2">21</th><th>23</th><td>24</td></tr>' +
					'</tbody>' +
					'</table>'
				);
			} );

			it( 'should work with colspan and rowspan attributes on table cells', () => {
				// The table in this test looks like a table below:
				//
				//   Row headings | Normal cells
				//                |
				// +----+----+----+----+
				// | 11 | 12 | 13 | 14 |
				// |    +----+    +----+
				// |    | 22 |    | 24 |
				// |----+----+    +----+
				// | 31      |    | 34 |
				// |         +----+----+
				// |         | 43 | 44 |
				// +----+----+----+----+

				setModelData( model,
					'<table headingColumns="3">' +
					'<tableRow>' +
					'<tableCell rowspan="2">11</tableCell>' +
					'<tableCell>12</tableCell>' +
					'<tableCell rowspan="3">13</tableCell>' +
					'<tableCell>14</tableCell>' +
					'</tableRow>' +
					'<tableRow><tableCell>22</tableCell><tableCell>24</tableCell></tableRow>' +
					'<tableRow><tableCell colspan="2" rowspan="2">31</tableCell><tableCell>34</tableCell></tableRow>' +
					'<tableRow><tableCell>43</tableCell><tableCell>44</tableCell></tableRow>' +
					'</table>'
				);

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<table>' +
					'<tbody>' +
					'<tr><th rowspan="2">11</th><th>12</th><th rowspan="3">13</th><td>14</td></tr>' +
					'<tr><th>22</th><td>24</td></tr>' +
					'<tr><th colspan="2" rowspan="2">31</th><td>34</td></tr>' +
					'<tr><th>43</th><td>44</td></tr>' +
					'</tbody>' +
					'</table>'
				);
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
							isBlock: true,
							isObject: true
						} );

						schema.register( 'tableRow', {
							allowIn: 'table',
							allowAttributes: [],
							isBlock: true,
							isLimit: true
						} );

						schema.register( 'tableCell', {
							allowIn: 'tableRow',
							allowContentOf: '$block',
							allowAttributes: [ 'colspan', 'rowspan' ],
							isBlock: true,
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
				setModelData( model,
					'<table>' +
					'<tableRow><tableCell></tableCell></tableRow>' +
					'</table>'
				);

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<table class="ck-widget" contenteditable="false">' +
					'<tbody>' +
					'<tr><td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true"></td></tr>' +
					'</tbody>' +
					'</table>'
				);
			} );
		} );
	} );

	describe( 'downcastInsertRow()', () => {
		it( 'should react to changed rows', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				const row = writer.createElement( 'tableRow' );

				writer.insert( row, table, 1 );

				writer.insertElement( 'tableCell', row, 'end' );
				writer.insertElement( 'tableCell', row, 'end' );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ '11', '12' ],
				[ '', '' ]
			] ) );
		} );

		it( 'should properly consume already added rows', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				const row = writer.createElement( 'tableRow' );

				writer.insert( row, table, 1 );

				writer.insertElement( 'tableCell', row, 'end' );
				writer.insertElement( 'tableCell', row, 'end' );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ '11', '12' ],
				[ '', '' ]
			] ) );

			model.change( writer => {
				const row = writer.createElement( 'tableRow' );

				writer.insert( row, table, 2 );

				writer.insertElement( 'tableCell', row, 'end' );
				writer.insertElement( 'tableCell', row, 'end' );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ '11', '12' ],
				[ '', '' ],
				[ '', '' ]
			] ) );
		} );

		it( 'should insert row on proper index', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ],
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

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ '11', '12' ],
				[ '', '' ],
				[ '21', '22' ],
				[ '31', '32' ]
			] ) );
		} );

		it( 'should insert row on proper index when table has heading rows defined - insert in body', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ],
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

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ '11', '12' ],
				[ '', '' ],
				[ '21', '22' ],
				[ '31', '32' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should insert row on proper index when table has heading rows defined - insert in heading', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ],
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

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ '11', '12' ],
				[ '', '' ],
				[ '21', '22' ],
				[ '31', '32' ]
			], { headingRows: 3 } ) );
		} );

		it( 'should react to changed rows when previous rows\' cells has rowspans', () => {
			setModelData( model, modelTable( [
				[ { rowspan: 3, contents: '11' }, '12' ],
				[ '22' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				const row = writer.createElement( 'tableRow' );

				writer.insert( row, table, 2 );
				writer.insertElement( 'tableCell', row, 'end' );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ { rowspan: 3, contents: '11' }, '12' ],
				[ '22' ],
				[ '' ]
			] ) );
		} );

		it( 'should properly create row headings', () => {
			setModelData( model, modelTable( [
				[ { rowspan: 3, contents: '11' }, '12' ],
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
				[ { rowspan: 3, contents: '11', isHeading: true }, '12' ],
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
							isBlock: true,
							isObject: true
						} );

						schema.register( 'tableRow', {
							allowIn: 'table',
							allowAttributes: [],
							isBlock: true,
							isLimit: true
						} );

						schema.register( 'tableCell', {
							allowIn: 'tableRow',
							allowContentOf: '$block',
							allowAttributes: [ 'colspan', 'rowspan' ],
							isBlock: true,
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
				setModelData( model,
					'<table>' +
					'<tableRow><tableCell>foo</tableCell></tableRow>' +
					'</table>'
				);

				const table = root.getChild( 0 );

				model.change( writer => {
					const firstRow = writer.createElement( 'tableRow' );

					writer.insert( firstRow, table, 1 );
					writer.insert( writer.createElement( 'tableCell' ), firstRow, 'end' );
				} );

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<table class="ck-widget" contenteditable="false">' +
					'<tbody>' +
					'<tr><td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">foo</td></tr>' +
					'<tr><td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true"></td></tr>' +
					'</tbody>' +
					'</table>'
				);
			} );
		} );
	} );

	describe( 'downcastInsertCell()', () => {
		it( 'should add tableCell on proper index in tr', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				const row = table.getChild( 0 );

				writer.insertElement( 'tableCell', row, 1 );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ '11', '', '12' ]
			] ) );
		} );

		it( 'should add tableCell on proper index in tr when previous have colspans', () => {
			setModelData( model, modelTable( [
				[ { colspan: 2, contents: '11' }, '13' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				const row = table.getChild( 0 );

				writer.insertElement( 'tableCell', row, 1 );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ { colspan: 2, contents: '11' }, '', '13' ]
			] ) );
		} );

		it( 'should add tableCell on proper index in tr when previous row have rowspans', () => {
			setModelData( model, modelTable( [
				[ { rowspan: 2, contents: '11' }, '13' ],
				[ '22', '23' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.insertElement( 'tableCell', table.getChild( 0 ), 1 );
				writer.insertElement( 'tableCell', table.getChild( 1 ), 0 );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ { rowspan: 2, contents: '11' }, '', '13' ],
				[ '', '22', '23' ]
			] ) );
		} );

		it( 'split cell simulation - simple', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ],
				[ '21', '22' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				const firstRow = table.getChild( 0 );
				const secondRow = table.getChild( 1 );

				writer.insertElement( 'tableCell', firstRow, 1 );
				writer.setAttribute( 'colspan', 2, secondRow.getChild( 0 ) );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ '11', '', '12' ],
				[ { colspan: 2, contents: '21' }, '22' ]
			] ) );
		} );

		it( 'merge simulation - simple', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ],
				[ '21', '22' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				const firstRow = table.getChild( 0 );

				writer.setAttribute( 'colspan', 2, firstRow.getChild( 0 ) );
				writer.remove( firstRow.getChild( 1 ) );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ { colspan: 2, contents: '11' } ],
				[ '21', '22' ]
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
							isBlock: true,
							isObject: true
						} );

						schema.register( 'tableRow', {
							allowIn: 'table',
							allowAttributes: [],
							isBlock: true,
							isLimit: true
						} );

						schema.register( 'tableCell', {
							allowIn: 'tableRow',
							allowContentOf: '$block',
							allowAttributes: [ 'colspan', 'rowspan' ],
							isBlock: true,
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
				setModelData( model,
					'<table>' +
					'<tableRow><tableCell>foo</tableCell></tableRow>' +
					'</table>'
				);

				const table = root.getChild( 0 );

				model.change( writer => {
					const row = table.getChild( 0 );

					writer.insert( writer.createElement( 'tableCell' ), row, 'end' );
				} );

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<table class="ck-widget" contenteditable="false">' +
					'<tbody>' +
					'<tr>' +
					'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">foo</td>' +
					'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true"></td>' +
					'</tr>' +
					'</tbody>' +
					'</table>'
				);
			} );
		} );
	} );

	describe( 'downcastAttributeChange()', () => {
		it( 'should work for adding heading rows', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ],
				[ '21', '22' ],
				[ '31', '32' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'headingRows', 2, table );
			} );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '11', '12' ],
				[ '21', '22' ],
				[ '31', '32' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should work for changing number of heading rows to a bigger number', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ],
				[ '21', '22' ],
				[ '31', '32' ]
			], { headingRows: 1 } ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'headingRows', 2, table );
			} );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '11', '12' ],
				[ '21', '22' ],
				[ '31', '32' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should work for changing number of heading rows to a smaller number', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ],
				[ '21', '22' ],
				[ '31', '32' ],
				[ '41', '42' ]
			], { headingRows: 3 } ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'headingRows', 2, table );
			} );

			expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
				[ '11', '12' ],
				[ '21', '22' ],
				[ '31', '32' ],
				[ '41', '42' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should work for removing heading rows', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ],
				[ '21', '22' ]
			], { headingRows: 2 } ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.removeAttribute( 'headingRows', table );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ '11', '12' ],
				[ '21', '22' ]
			] ) );
		} );

		it( 'should work for making heading rows without tbody', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ],
				[ '21', '22' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'headingRows', 2, table );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ '11', '12' ],
				[ '21', '22' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should work for adding heading columns', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ],
				[ '21', '22' ]
			] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'headingColumns', 1, table );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ { isHeading: true, contents: '11' }, '12' ],
				[ { isHeading: true, contents: '21' }, '22' ]
			] ) );
		} );

		it( 'should work for changing heading columns to a bigger number', () => {
			setModelData( model, modelTable( [
				[ '11', '12', '13', '14' ],
				[ '21', '22', '23', '24' ]
			], { headingColumns: 1 } ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'headingColumns', 3, table );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ { isHeading: true, contents: '11' }, { isHeading: true, contents: '12' }, { isHeading: true, contents: '13' }, '14' ],
				[ { isHeading: true, contents: '21' }, { isHeading: true, contents: '22' }, { isHeading: true, contents: '23' }, '24' ]
			] ) );
		} );

		it( 'should work for changing heading columns to a smaller number', () => {
			setModelData( model, modelTable( [
				[ { isHeading: true, contents: '11' }, { isHeading: true, contents: '12' }, { isHeading: true, contents: '13' }, '14' ],
				[ { isHeading: true, contents: '21' }, { isHeading: true, contents: '22' }, { isHeading: true, contents: '23' }, '24' ]
			], { headingColumns: 3 } ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'headingColumns', 1, table );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ { isHeading: true, contents: '11' }, '12', '13', '14' ],
				[ { isHeading: true, contents: '21' }, '22', '23', '24' ]
			], { headingColumns: 3 } ) );
		} );

		it( 'should work for removing heading columns', () => {
			setModelData( model, modelTable( [
				[ '11', '12' ],
				[ '21', '22' ]
			], { headingColumns: 1 } ) );
			const table = root.getChild( 0 );

			model.change( writer => {
				writer.removeAttribute( 'headingColumns', table );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( viewTable( [
				[ '11', '12' ],
				[ '21', '22' ]
			] ) );
		} );

		it( 'should be possible to overwrite', () => {
			editor.conversion.attributeToAttribute( { model: 'headingColumns', view: 'headingColumns', priority: 'high' } );
			setModelData( model, modelTable( [ [ '11' ] ] ) );

			const table = root.getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'headingColumns', 1, table );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<table headingColumns="1"><tbody><tr><td>11</td></tr></tbody></table>'
			);
		} );

		it( 'should work with adding table cells', () => {
			setModelData( model, modelTable( [
				[ { rowspan: 2, contents: '11' }, '12', '13', '14' ],
				[ '22', '23', '24' ],
				[ { colspan: 2, contents: '31' }, '33', '34' ]
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
					{ isHeading: true, rowspan: 2, contents: '11' },
					{ isHeading: true, contents: '12' },
					{ isHeading: true, contents: '' },
					'13',
					'14'
				],
				[
					{ isHeading: true, contents: '22' },
					{ isHeading: true, contents: '' },
					'23',
					'24'
				],
				[
					{ isHeading: true, colspan: 2, contents: '31' },
					{ isHeading: true, contents: '' },
					'33',
					'34'
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
							isBlock: true,
							isObject: true
						} );

						schema.register( 'tableRow', {
							allowIn: 'table',
							allowAttributes: [],
							isBlock: true,
							isLimit: true
						} );

						schema.register( 'tableCell', {
							allowIn: 'tableRow',
							allowContentOf: '$block',
							allowAttributes: [ 'colspan', 'rowspan' ],
							isBlock: true,
							isLimit: true
						} );

						conversion.for( 'downcast' ).add( downcastInsertTable( { asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastInsertRow( { asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastInsertCell( { asWidget: true } ) );

						conversion.for( 'downcast' ).add( downcastAttributeChange( { attribute: 'headingRows', asWidget: true } ) );
						conversion.for( 'downcast' ).add( downcastAttributeChange( { attribute: 'headingColumns', asWidget: true } ) );

						conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
						conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );
					} );
			} );

			it( 'should create renamed cell inside as a widget', () => {
				setModelData( model,
					'<table>' +
					'<tableRow><tableCell>foo</tableCell></tableRow>' +
					'</table>'
				);

				const table = root.getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'headingColumns', 1, table );
				} );

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<table class="ck-widget" contenteditable="false">' +
					'<tbody>' +
					'<tr><th class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">foo</th></tr>' +
					'</tbody>' +
					'</table>'
				);
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
