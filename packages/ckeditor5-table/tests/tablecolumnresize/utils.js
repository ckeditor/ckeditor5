/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Element from '@ckeditor/ckeditor5-engine/src/model/element.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import Table from '../../src/table.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { modelTable } from '../_utils/utils.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import TableColumnResize from '../../src/tablecolumnresize.js';
import {
	getColumnEdgesIndexes,
	getChangedResizedTables,
	toPrecision,
	clamp,
	createFilledArray,
	sumArray,
	normalizeColumnWidths,
	getTableWidthInPixels,
	getColumnMinWidthAsPercentage,
	getElementWidthInPixels,
	getDomCellOuterWidth,
	getColumnGroupElement,
	getTableColumnElements,
	getTableColumnsWidths,
	translateColSpanAttribute
} from '../../src/tablecolumnresize/utils.js';

describe( 'TableColumnResize utils', () => {
	let editorElement, editor, model, root, tableUtils;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicEditor.create( editorElement, {
			plugins: [ Table, TableColumnResize, Paragraph, ClipboardPipeline ]
		} );

		model = editor.model;
		root = model.document.getRoot();
		tableUtils = editor.plugins.get( 'TableUtils' );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	describe( 'getChangedResizedTables()', () => {
		beforeEach( () => {
			model.change( writer => {
				writer.insert( createTable( 2, 3 ), root );
				writer.insert( createTable( 2, 3 ), root );
				writer.insert( createTable( 2, 3 ), root );
			} );
		} );

		it( 'should do nothing if there is no table affected while inserting', () => {
			model.change( writer => {
				writer.insert(
					new Element( 'paragraph' ),
					root.getNodeByPath( [ 2, 0, 0 ] )
				);

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 0 );
			} );
		} );

		it( 'should do nothing if there is no table affected while changing attribute', () => {
			let paragraph;

			model.change( writer => {
				paragraph = writer.createElement( 'paragraph' );

				writer.insert( paragraph, root.getNodeByPath( [ 2, 0, 0 ] ) );
			} );

			model.change( writer => {
				writer.setAttribute( 'attrName', 'attrVal', paragraph );

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 0 );
			} );
		} );

		it( 'should find affected table - cells insertion in first column', () => {
			model.change( writer => {
				const firstTable = root.getChild( 0 );

				writer.insert(
					writer.createElement( 'tableCell' ),
					firstTable.getChild( 0 )
				);

				writer.insert(
					writer.createElement( 'tableCell' ),
					firstTable.getChild( 1 )
				);

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - cells insertion in last column', () => {
			model.change( writer => {
				const firstTable = root.getChild( 0 );

				writer.insert(
					writer.createElement( 'tableCell' ),
					firstTable.getChild( 0 ),
					'end'
				);

				writer.insert(
					writer.createElement( 'tableCell' ),
					firstTable.getChild( 1 ),
					'end'
				);

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - cells insertion in first row', () => {
			model.change( writer => {
				const firstTable = root.getChild( 0 );

				writer.insert(
					new Element( 'tableRow', {}, createTableCells( 3 ) ),
					firstTable
				);

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - cells insertion in last row', () => {
			model.change( writer => {
				const firstTable = root.getChild( 0 );

				writer.insert(
					new Element( 'tableRow', {}, createTableCells( 3 ) ),
					firstTable,
					2
				);

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - cells deletion in first column', () => {
			const firstTable = root.getChild( 0 );

			model.change( writer => {
				writer.remove( root.getNodeByPath( [ 0, 0, 0 ] ) );
				writer.remove( root.getNodeByPath( [ 0, 1, 0 ] ) );

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - cells deletion in last column', () => {
			const firstTable = root.getChild( 0 );

			model.change( writer => {
				writer.remove( root.getNodeByPath( [ 0, 0, 2 ] ) );
				writer.remove( root.getNodeByPath( [ 0, 1, 2 ] ) );

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - cells deletion in first row', () => {
			const firstTable = root.getChild( 0 );

			model.change( writer => {
				writer.remove( root.getNodeByPath( [ 0, 0, 0 ] ) );

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - cells deletion in last row', () => {
			const firstTable = root.getChild( 0 );

			model.change( writer => {
				writer.remove( root.getNodeByPath( [ 0, 1 ] ) );

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - attribute change on multiple cells', () => {
			const firstTable = root.getChild( 0 );

			model.change( writer => {
				const range = writer.createRange(
					writer.createPositionAt( root.getNodeByPath( [ 0, 0 ] ), 0 ),
					writer.createPositionAt( root.getNodeByPath( [ 0, 0 ] ), 3 )
				);

				writer.setAttribute( 'attrName', 'attrVal', range );

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - attribute change on multiple rows', () => {
			model.change( writer => {
				const firstTable = root.getChild( 0 );

				const range = writer.createRange(
					writer.createPositionAt( firstTable, 0 ),
					writer.createPositionAt( firstTable, 2 )
				);

				writer.setAttribute( 'attrName', 'attrVal', range );

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - attribute change on a table', () => {
			const firstTable = root.getChild( 0 );

			model.change( writer => {
				const range = writer.createRange(
					writer.createPositionAt( root, 0 ),
					writer.createPositionAt( root, 1 )
				);

				writer.setAttribute( 'attrName', 'attrVal', range );

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find all affected tables - mixed operations', () => {
			model.change( writer => {
				const firstTable = root.getChild( 0 );
				const secondTable = root.getChild( 1 );
				const thirdTable = root.getChild( 2 );

				writer.remove( firstTable.getChild( 0 ) );
				writer.insert(
					writer.createElement( 'tableCell' ),
					firstTable.getChild( 0 )
				);

				const range = writer.createRange(
					writer.createPositionAt( root, 1 ),
					writer.createPositionAt( root, 3 )
				);

				writer.setAttribute( 'attrName', 'attrVal', range );
				writer.insert(
					writer.createElement( 'tableCell' ),
					root.getChild( 2 ).getChild( 0 )
				);

				writer.insert(
					writer.createElement( 'tableCell' ),
					root.getChild( 2 ).getChild( 1 )
				);

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 3 );
				expect( affectedTables.has( firstTable ), 'first table is affected' ).to.be.true;
				expect( affectedTables.has( secondTable ), 'second table is affected' ).to.be.true;
				expect( affectedTables.has( thirdTable ), 'third table is affected' ).to.be.true;
			} );
		} );

		it( 'should not find affected table - table removal', () => {
			model.change( writer => {
				writer.remove( root.getChild( 0 ) );

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 0 );
			} );
		} );

		it( 'should not find affected table - table replacement', () => {
			model.change( writer => {
				writer.remove( root.getChild( 0 ) );

				// Table plugin inserts a paragraph when a table is removed - #12201.
				writer.insert( writer.createElement( 'paragraph' ), root );

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 0 );
			} );
		} );

		it( 'should not find any affected table if operation is not related to a table, row or cell element', () => {
			model.change( writer => {
				writer.insertText(
					'foo',
					{ bold: true },
					root.getNodeByPath( [ 0, 0, 0, 0 ] )
				);

				writer.insertText(
					'foo',
					{ italic: true },
					root.getNodeByPath( [ 1, 1, 1, 0 ] )
				);

				writer.insertText(
					'foo',
					root.getNodeByPath( [ 2, 1, 2, 0 ] )
				);

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 0 );
			} );
		} );

		it( 'should not find any affected table if it was a text formatting removal operation', () => {
			let range;

			// To test the getChangedResizedTables(), when the attribute is being removed we need
			// to first insert the text inside one of the table cells.
			model.change( writer => {
				const paragraph = root.getNodeByPath( [ 0, 0, 0, 0 ] );

				writer.insertText( 'foo', paragraph, 0 );

				range = writer.createRange(
					writer.createPositionAt( paragraph, 1 ),
					writer.createPositionAt( paragraph, 3 )
				);

				writer.setAttribute( 'linkHref', 'www', range );
			} );

			// And in a different model.change() remove the attribute, because otherwise the changes would be empty.
			model.change( writer => {
				writer.removeAttribute( 'linkHref', range );

				const affectedTables = getChangedResizedTables( model );

				expect( affectedTables.size ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'getColumnMinWidthAsPercentage()', () => {
		it( 'should return the correct value', () => {
			setModelData( model, modelTable( [ [ '00' ] ], { 'tableWidth': '401px' } ) );

			expect( getColumnMinWidthAsPercentage( model.document.getRoot().getChild( 0 ), editor ) ).to.equal( 10 );
		} );
	} );

	describe( 'getColumnIndex()', () => {
		it( 'should properly calculate column edge indexes', () => {
			setModelData( editor.model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			], { columnWidths: '25%,25%,50%' } ) );

			const table = editor.model.document.getRoot().getChild( 0 );
			const row0 = [ ...table.getChildren() ][ 0 ];
			const cell00 = [ ...row0.getChildren() ][ 0 ];

			expect(
				getColumnEdgesIndexes( cell00, tableUtils )
			).to.deep.equal( { leftEdge: 0, rightEdge: 0 } );

			const cell01 = [ ...row0.getChildren() ][ 1 ];

			expect(
				getColumnEdgesIndexes( cell01, tableUtils )
			).to.deep.equal( { leftEdge: 1, rightEdge: 1 } );
		} );

		it( 'should properly calculate column edge indexes when colspan = 2', () => {
			setModelData( editor.model, modelTable( [
				[ '00', { contents: '01', colspan: 2 } ],
				[ '10', '11', '12' ]
			], { columnWidths: '25%,25%,50%' } ) );

			const table = editor.model.document.getRoot().getChild( 0 );
			const row0 = [ ...table.getChildren() ][ 0 ];
			const cell01 = [ ...row0.getChildren() ][ 1 ];

			expect(
				getColumnEdgesIndexes( cell01, tableUtils )
			).to.deep.equal( { leftEdge: 1, rightEdge: 2 } );
		} );

		it( 'should properly calculate column edge indexes when colspan = 3', () => {
			setModelData( editor.model, modelTable( [
				[ '00', { contents: '01', colspan: 3 } ],
				[ '10', '11', '12', '13' ]
			], { columnWidths: '25%,25%,25%,25%' } ) );

			const table = editor.model.document.getRoot().getChild( 0 );
			const row0 = [ ...table.getChildren() ][ 0 ];
			const cell01 = [ ...row0.getChildren() ][ 1 ];

			expect(
				getColumnEdgesIndexes( cell01, tableUtils )
			).to.deep.equal( { leftEdge: 1, rightEdge: 3 } );
		} );

		it( 'should properly calculate column edge indexes when colspan = 4', () => {
			setModelData( editor.model, modelTable( [
				[ '00', '01', { contents: '02', colspan: 4 } ],
				[ '10', '11', '12', '13', '14', '15' ]
			], { columnWidths: '20%,20%,20%,20%,10%,10%' } ) );

			const table = editor.model.document.getRoot().getChild( 0 );
			const row0 = [ ...table.getChildren() ][ 0 ];
			const cell02 = [ ...row0.getChildren() ][ 2 ];

			expect(
				getColumnEdgesIndexes( cell02, tableUtils )
			).to.deep.equal( { leftEdge: 2, rightEdge: 5 } );
		} );
	} );

	describe( 'toPrecision()', () => {
		it( 'should properly round numbers to defined precision', () => {
			expect( toPrecision( 1 ) ).to.equal( 1 );
			expect( toPrecision( 10000 ) ).to.equal( 10000 );
			expect( toPrecision( 1.1 ) ).to.equal( 1.1 );
			expect( toPrecision( 1.12 ) ).to.equal( 1.12 );
			expect( toPrecision( 1.123 ) ).to.equal( 1.12 );
			expect( toPrecision( 1.125 ) ).to.equal( 1.13 );
			expect( toPrecision( 0.99 ) ).to.equal( 0.99 );
			expect( toPrecision( 0.999 ) ).to.equal( 1 );
		} );
	} );

	describe( 'clamp()', () => {
		it( 'should properly clamp numbers', () => {
			expect( clamp( 1, 0, 3 ) ).to.equal( 1 );
			expect( clamp( 1, 1, 3 ) ).to.equal( 1 );
			expect( clamp( 1, 2, 3 ) ).to.equal( 2 );
			expect( clamp( 4, 2, 3 ) ).to.equal( 3 );
			expect( clamp( 4, 2, 4 ) ).to.equal( 4 );
			expect( clamp( 4, -2, -1 ) ).to.equal( -1 );
			expect( clamp( -1, -2, 2 ) ).to.equal( -1 );
			expect( clamp( -1, 0, 2 ) ).to.equal( 0 );
			expect( clamp( -1.23, -1.11, -1.01 ) ).to.equal( -1.11 );
		} );
	} );

	describe( 'createFilledArray()', () => {
		it( 'should properly create filled array', () => {
			expect( createFilledArray( 0, 'foo' ) ).to.deep.equal( [] );
			expect( createFilledArray( 3, 'foo' ) ).to.deep.equal( [ 'foo', 'foo', 'foo' ] );
			expect( createFilledArray( 3 ) ).to.deep.equal( [ undefined, undefined, undefined ] );
		} );
	} );

	describe( 'sumArray()', () => {
		it( 'should properly sum all numeric values from array', () => {
			expect( sumArray( [] ) ).to.equal( 0 );
			expect( sumArray( [ 'foo', 'bar' ] ) ).to.equal( 0 );
			expect( sumArray( [ 1, 2, 3 ] ) ).to.equal( 6 );
			expect( sumArray( [ 1, 'foo', 2, 'bar', 3 ] ) ).to.equal( 6 );
			expect( sumArray( [ 1.1, 'foo', 2.2, 'bar', 3.3 ] ) ).to.equal( 6.6 );
			expect( sumArray( [ '1.1px', 'foo', '2.2px', 'bar', '3.3px' ] ) ).to.equal( 6.6 );
		} );
	} );

	describe( 'normalizeColumnWidths()', () => {
		it( 'should not change the widths of the columns if they sum up to 100%', () => {
			[
				[ '25%', '25%', '25%', '25%' ],
				[ '10%', '20%', '30%', '40%' ],
				[ '10.32%', '20.12%', '30.87%', '38.69%' ],
				[ '100%' ]
			].forEach( width => expect( normalizeColumnWidths( width ) ).to.deep.equal( width ) );
		} );

		it( 'should handle column widths of different formats', () => {
			expect( normalizeColumnWidths( [ 'auto', '25%', 'auto', '25%' ] ) ).to.deep.equal( [ '25%', '25%', '25%', '25%' ] );
		} );

		it( 'should extend uninitialized columns equally if the free space per column is wider than the minimum column width', () => {
			expect( normalizeColumnWidths( [ 'auto', 'auto', 'auto', 'auto' ] ) ).to.deep.equal( [ '25%', '25%', '25%', '25%' ] );
			expect( normalizeColumnWidths( [ 'auto', '25%', 'auto', '25%' ] ) ).to.deep.equal( [ '25%', '25%', '25%', '25%' ] );
			expect( normalizeColumnWidths( [ 'auto', 'auto', 'auto', '40%' ] ) ).to.deep.equal( [ '20%', '20%', '20%', '40%' ] );
			expect( normalizeColumnWidths( [ 'auto', '45%', '45%', 'auto' ] ) ).to.deep.equal( [ '5%', '45%', '45%', '5%' ] );
			expect( normalizeColumnWidths( [ 'auto' ] ) ).to.deep.equal( [ '100%' ] );
		} );

		it( 'should set the minimum column width for uninitialized columns if there is not enough free space per column', () => {
			expect( normalizeColumnWidths( [ 'auto', 'auto', 'auto', '90%' ] ) ).to.deep.equal( [ '4.76%', '4.76%', '4.76%', '85.72%' ] );
			expect( normalizeColumnWidths( [ 'auto', '50%', 'auto', '50%' ] ) ).to.deep.equal( [ '4.55%', '45.45%', '4.55%', '45.45%' ] );
			expect( normalizeColumnWidths( [ 'auto', '50%', '50%', '50%' ] ) ).to.deep.equal( [ '3.23%', '32.26%', '32.26%', '32.25%' ] );
		} );

		it( 'should proportionally align all the column widths if their sum is not exactly 100%', () => {
			expect( normalizeColumnWidths( [ '10%', '20%', '30%', '50%' ] ) ).to.deep.equal( [ '9.09%', '18.18%', '27.27%', '45.46%' ] );
			expect( normalizeColumnWidths( [ '10%', '10%', '10%', '10%' ] ) ).to.deep.equal( [ '25%', '25%', '25%', '25%' ] );
			expect( normalizeColumnWidths( [ '100%', '100%', '100%', '100%' ] ) ).to.deep.equal( [ '25%', '25%', '25%', '25%' ] );
			expect( normalizeColumnWidths( [ '1%', '2%', '3%', '4%' ] ) ).to.deep.equal( [ '10%', '20%', '30%', '40%' ] );
			expect( normalizeColumnWidths( [ '12.33%', '17.4%', '21.49%', '33.52%', '26.6%', '10.43%' ] ) )
				.to.deep.equal( [ '10.13%', '14.29%', '17.65%', '27.53%', '21.84%', '8.56%' ] );
		} );
	} );

	describe( 'getElementWidthInPixels()', () => {
		let element;

		beforeEach( () => {
			element = document.createElement( 'div' );

			document.body.appendChild( element );
			element.style.width = '100px';
			element.style.padding = '15px';
			element.style.border = '10px solid #000';
		} );

		afterEach( () => {
			element.remove();
		} );

		it( 'should return the correct width for content-box algorithm', () => {
			expect( getElementWidthInPixels( element ) ).to.equal( 100 );
		} );

		it( 'should return the correct width for border-box algorithm', () => {
			element.style.boxSizing = 'border-box';

			expect( getElementWidthInPixels( element ) ).to.equal( 50 );
		} );
	} );

	describe( 'getDomCellOuterWidth()', () => {
		let tableElement, cellElement;

		beforeEach( () => {
			tableElement = document.createElement( 'table' );
			tableElement.innerHTML = '<tr><td>foo</td></tr>';

			document.body.appendChild( tableElement );

			cellElement = tableElement.querySelector( 'td' );
			cellElement.style.width = '100px';
			cellElement.style.padding = '15px';
			cellElement.style.border = '10px solid #000';
		} );

		afterEach( () => {
			tableElement.remove();
		} );

		it( 'should return the correct width for content-box algorithm', () => {
			expect( getDomCellOuterWidth( cellElement ) ).to.equal( 140 );
		} );

		it( 'should return the correct width for border-box algorithm', () => {
			cellElement.style.boxSizing = 'border-box';

			expect( getDomCellOuterWidth( cellElement ) ).to.equal( 100 );
		} );
	} );

	describe( 'getTableWidthInPixels()', () => {
		// Because the `window.getComputedStyle()` for colgroup will always return 0px on Safari, we needed to change the calculations
		// to be based on tbody element instead - which works ok in all main browsers. See #1466 for reference.
		it( 'returns a correct value on Safari', () => {
			editor.setData(
				`<figure class="table">
					<table>
						<colgroup>
							<col style="width:50%;">
							<col style="width:50%;">
						</colgroup>
						<tbody>
							<tr>
								<td>foo</td>
								<td>bar</td>
							</tr>
						</tbody>
					</table>
				</figure>`
			);

			const table = editor.model.document.getRoot().getChild( 0 );
			const getComputedStyleStub = sinon.stub( window, 'getComputedStyle' ).callThrough();

			// Emulate safari's bug.
			getComputedStyleStub.withArgs( sinon.match.has( 'localName', 'colgroup' ) ).returns( { width: '0px' } );

			const result = getTableWidthInPixels( table, editor );

			getComputedStyleStub.restore();

			expect( result ).to.not.equal( 0 );
		} );
	} );

	describe( 'getTableColumnGroup()', () => {
		it( 'should return tableColumnGroup when it exists', () => {
			setModelData( model, modelTable( [ [ '01', '02' ] ], { columnWidths: '50%,50%' } ) );

			expect( getColumnGroupElement( model.document.getRoot().getChild( 0 ) ) ).to.not.be.undefined;
		} );

		it( 'should not return anything if tableColumnGroup does not exists', () => {
			setModelData( model, modelTable( [ [ '01', '02' ] ] ) );

			expect( getColumnGroupElement( model.document.getRoot().getChild( 0 ) ) ).to.be.undefined;
		} );

		it( 'should return the same tableColumnGroup element if it was passed as an argument', () => {
			setModelData( model, modelTable( [ [ '01', '02' ] ], { columnWidths: '50%,50%' } ) );

			const tableColumnGroup = model.document.getRoot().getChild( 0 ).getChild( 1 );

			expect( getColumnGroupElement( tableColumnGroup ) ).to.equal( tableColumnGroup );
		} );
	} );

	describe( 'getTableColumnElements()', () => {
		it( 'should return tableColumn array when there are columns', () => {
			setModelData( model, modelTable( [ [ '01', '02' ] ], { columnWidths: '50%,50%' } ) );

			expect( getTableColumnElements( model.document.getRoot().getChild( 0 ) ) ).to.have.length( 2 );
		} );

		it( 'should return an empty array when there is no tableColumnGroup element', () => {
			setModelData( model, modelTable( [ [ '01', '02' ] ] ) );

			expect( getTableColumnElements( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [] );
		} );
	} );

	describe( 'getTableColumnsWidths()', () => {
		it( 'should return tableColumnGroup count when there are columns', () => {
			setModelData( model, modelTable( [ [ '01', '02' ] ], { columnWidths: '50%,50%' } ) );

			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '50%', '50%' ] );
		} );
	} );

	describe( 'translateColSpanAttribute()', () => {
		it( 'should return the unchanged column widths if there is no colSpan attribute on any element', () => {
			setModelData( model, modelTable( [ [ '01', '02' ] ], { columnWidths: '50%,50%' } ) );

			model.change( writer => {
				expect( translateColSpanAttribute( model.document.getRoot().getChild( 0 ), writer ) ).to.deep.equal( [ '50%', '50%' ] );
			} );
		} );

		it( 'should return the modified column widths if there are colSpan attributes set', () => {
			setModelData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph>01</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>02</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>03</paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph>04</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
					'<tableColumnGroup>' +
						'<tableColumn colSpan="3" columnWidth="40%"></tableColumn>' +
						'<tableColumn columnWidth="60%"></tableColumn>' +
					'</tableColumnGroup>' +
				'</table>'
			);

			// These values may seem incorrect, but remember they are not normalised yet.
			// This function only copies the width from the colSpanned column to the other columns.
			model.change( writer => {
				expect( translateColSpanAttribute( model.document.getRoot().getChild( 0 ), writer ) )
					.to.deep.equal( [ '40%', '40%', '40%', '60%' ] );
			} );
		} );
	} );
} );

function createTable( rows, cols ) {
	return new Element( 'table', {}, [
		...createTableRows( rows, cols ),
		createColGroupRow( cols )
	] );
}

function createColGroupRow( cols ) {
	const colWidth = `${ 100 / cols }%`;
	const columns = new Array( cols )
		.fill( colWidth )
		.map( columnWidth => new Element( 'tableColumn', { columnWidth } ) );

	return new Element( 'tableColumnGroup', {}, columns );
}

function createTableRows( rows, cols ) {
	return [ ...Array( rows ) ].map( () => new Element( 'tableRow', {}, createTableCells( cols ) ) );
}

function createTableCells( cols ) {
	return [ ...Array( cols ) ].map( () => new Element( 'tableCell' ) );
}
