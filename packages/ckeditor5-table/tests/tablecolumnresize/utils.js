/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import Text from '@ckeditor/ckeditor5-engine/src/model/text';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Table from '../../src/table';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { modelTable } from '../_utils/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import InsertOperation from '@ckeditor/ckeditor5-engine/src/model/operation/insertoperation';
import MoveOperation from '@ckeditor/ckeditor5-engine/src/model/operation/moveoperation';
import AttributeOperation from '@ckeditor/ckeditor5-engine/src/model/operation/attributeoperation';

import TableColumnResize from '../../src/tablecolumnresize';
import {
	getAffectedTables,
	getColumnIndex,
	toPrecision,
	clamp,
	fillArray,
	sumArray,
	normalizeColumnWidthsAttribute,
	getTableWidthInPixels
} from '../../src/tablecolumnresize/utils';

/* globals window */

describe( 'TableColumnResize utils', () => {
	describe( 'getAffectedTables()', () => {
		let differ, root, model;

		beforeEach( () => {
			model = new Model();
			differ = model.document.differ;
			root = model.document.createRoot();

			root._appendChild( [
				createTable( 2, 3 ),
				createTable( 2, 3 ),
				createTable( 2, 3 )
			] );
		} );

		it( 'should find affected table - cells insertion in first column', () => {
			const firstTable = root.getChild( 0 );

			model.change( () => {
				insert(
					model,
					new Element( 'tableCell' ),
					new Position( root, [ 0, 0, 0 ] )
				);

				insert(
					model,
					new Element( 'tableCell' ),
					new Position( root, [ 0, 1, 0 ] )
				);

				const changes = differ.getChanges();
				const affectedTables = getAffectedTables( changes, model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - cells insertion in last column', () => {
			const firstTable = root.getChild( 0 );

			model.change( () => {
				insert(
					model,
					new Element( 'tableCell' ),
					new Position( root, [ 0, 0, 3 ] )
				);

				insert(
					model,
					new Element( 'tableCell' ),
					new Position( root, [ 0, 1, 3 ] )
				);

				const changes = differ.getChanges();
				const affectedTables = getAffectedTables( changes, model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - cells insertion in first row', () => {
			const firstTable = root.getChild( 0 );

			model.change( () => {
				insert(
					model,
					new Element( 'tableRow', {}, createTableCells( 3 ) ),
					new Position( root, [ 0, 0 ] )
				);

				const changes = differ.getChanges();
				const affectedTables = getAffectedTables( changes, model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - cells insertion in last row', () => {
			const firstTable = root.getChild( 0 );

			model.change( () => {
				insert(
					model,
					new Element( 'tableRow', {}, createTableCells( 3 ) ),
					new Position( root, [ 0, 2 ] )
				);

				const changes = differ.getChanges();
				const affectedTables = getAffectedTables( changes, model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - cells deletion in first column', () => {
			const firstTable = root.getChild( 0 );

			model.change( () => {
				remove(
					model,
					new Position( root, [ 0, 0, 0 ] ),
					1
				);

				remove(
					model,
					new Position( root, [ 0, 1, 0 ] ),
					1
				);

				const changes = differ.getChanges();
				const affectedTables = getAffectedTables( changes, model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - cells deletion in last column', () => {
			const firstTable = root.getChild( 0 );

			model.change( () => {
				remove(
					model,
					new Position( root, [ 0, 0, 2 ] ),
					1
				);

				remove(
					model,
					new Position( root, [ 0, 1, 2 ] ),
					1
				);

				const changes = differ.getChanges();
				const affectedTables = getAffectedTables( changes, model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - cells deletion in first row', () => {
			const firstTable = root.getChild( 0 );

			model.change( () => {
				remove(
					model,
					new Position( root, [ 0, 0 ] ),
					1
				);

				const changes = differ.getChanges();
				const affectedTables = getAffectedTables( changes, model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - cells deletion in last row', () => {
			const firstTable = root.getChild( 0 );

			model.change( () => {
				remove(
					model,
					new Position( root, [ 0, 1 ] ),
					1
				);

				const changes = differ.getChanges();
				const affectedTables = getAffectedTables( changes, model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - attribute change on multiple cells', () => {
			const firstTable = root.getChild( 0 );

			const range = new Range( new Position( root, [ 0, 0, 0 ] ), new Position( root, [ 0, 0, 3 ] ) );

			model.change( () => {
				attribute( model, range, 'attrName', null, 'attrVal' );

				const changes = differ.getChanges();
				const affectedTables = getAffectedTables( changes, model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - attribute change on multiple rows', () => {
			const firstTable = root.getChild( 0 );

			const range = new Range( new Position( root, [ 0, 0 ] ), new Position( root, [ 0, 2 ] ) );

			model.change( () => {
				attribute( model, range, 'attrName', null, 'attrVal' );

				const changes = differ.getChanges();
				const affectedTables = getAffectedTables( changes, model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find affected table - attribute change on a table', () => {
			const firstTable = root.getChild( 0 );

			const range = new Range( new Position( root, [ 0 ] ), new Position( root, [ 1 ] ) );

			model.change( () => {
				attribute( model, range, 'attrName', null, 'attrVal' );

				const changes = differ.getChanges();
				const affectedTables = getAffectedTables( changes, model );

				expect( affectedTables.size ).to.equal( 1 );
				expect( affectedTables.has( firstTable ) ).to.be.true;
			} );
		} );

		it( 'should find all affected tables - mixed operations', () => {
			const firstTable = root.getChild( 0 );
			const secondTable = root.getChild( 1 );
			const thirdTable = root.getChild( 2 );

			model.change( () => {
				remove(
					model,
					new Position( root, [ 0, 0 ] ),
					1
				);

				insert(
					model,
					new Element( 'tableCell' ),
					new Position( root, [ 0, 0, 0 ] )
				);

				const range = new Range( new Position( root, [ 1 ] ), new Position( root, [ 2 ] ) );
				attribute( model, range, 'attrName', null, 'attrVal' );

				insert(
					model,
					new Element( 'tableCell' ),
					new Position( root, [ 2, 0, 0 ] )
				);

				insert(
					model,
					new Element( 'tableCell' ),
					new Position( root, [ 2, 1, 0 ] )
				);

				const changes = differ.getChanges();
				const affectedTables = getAffectedTables( changes, model );

				expect( affectedTables.size ).to.equal( 3 );
				expect( affectedTables.has( firstTable ), 'first table is affected' ).to.be.true;
				expect( affectedTables.has( secondTable ), 'second table is affected' ).to.be.true;
				expect( affectedTables.has( thirdTable ), 'third table is affected' ).to.be.true;
			} );
		} );

		it( 'should not find any affected table if operation is not related to a table, row or cell element', () => {
			model.change( () => {
				insert(
					model,
					new Text( 'foo', { bold: true } ),
					new Position( root, [ 0, 0, 0, 0 ] )
				);

				insert(
					model,
					new Text( 'foo', { italic: true } ),
					new Position( root, [ 1, 1, 1, 0 ] )
				);

				insert(
					model,
					new Text( 'foo' ),
					new Position( root, [ 2, 1, 2, 0 ] )
				);

				const changes = differ.getChanges();
				const affectedTables = getAffectedTables( changes, model );

				expect( affectedTables.size ).to.equal( 0 );
			} );
		} );

		it( 'should not find any affected table if it was a text formatting removal operation', () => {
			let range;

			// To test the getAffectedTables(), when the attribute is being removed we need
			// to frist insert the text inside one of the table cells.
			model.change( () => {
				insert(
					model,
					new Text( 'foo' ),
					new Position( root, [ 0, 0, 0, 0 ] )
				);

				range = new Range( new Position( root, [ 0, 0, 0, 1 ] ), new Position( root, [ 0, 0, 0, 3 ] ) );

				attribute( model, range, 'linkHref', null, 'www' );
			} );

			// And in a different model.change() remove the attribute, beacuse otherwise the changes would be empty.
			model.change( () => {
				attribute( model, range, 'linkHref', 'www', null );
				const changes = differ.getChanges();
				const affectedTables = getAffectedTables( changes, model );

				expect( affectedTables.size ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'getColumnIndex()', () => {
		let editor;

		beforeEach( () => {
			return ClassicEditor
				.create( '', {
					plugins: [ Table, TableColumnResize, Paragraph ]
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			editor.destroy();
		} );

		it( 'should properly calculate column edge indexes', () => {
			setModelData( editor.model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			], { columnWidths: '25%,25%,50%' } ) );

			const table = editor.model.document.getRoot().getChild( 0 );
			const row0 = [ ...table.getChildren() ][ 0 ];
			const cell00 = [ ...row0.getChildren() ][ 0 ];

			expect(
				getColumnIndex( cell00, getColumnIndexMap( editor ) )
			).to.deep.equal( { leftEdge: 0, rightEdge: 0 } );

			const cell01 = [ ...row0.getChildren() ][ 1 ];

			expect(
				getColumnIndex( cell01, getColumnIndexMap( editor ) )
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
				getColumnIndex( cell01, getColumnIndexMap( editor ) )
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
				getColumnIndex( cell01, getColumnIndexMap( editor ) )
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
				getColumnIndex( cell02, getColumnIndexMap( editor ) )
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

	describe( 'fillArray()', () => {
		it( 'should properly create filled array', () => {
			expect( fillArray( 0, 'foo' ) ).to.deep.equal( [] );
			expect( fillArray( 3, 'foo' ) ).to.deep.equal( [ 'foo', 'foo', 'foo' ] );
			expect( fillArray( 3 ) ).to.deep.equal( [ undefined, undefined, undefined ] );
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

	describe( 'normalizeColumnWidthsAttribute()', () => {
		it( 'should not change the widths of the columns if they sum up to 100%', () => {
			expect( normalizeColumnWidthsAttribute( '25%, 25%, 25%, 25%' ) ).to.deep.equal( [ 25, 25, 25, 25 ] );
			expect( normalizeColumnWidthsAttribute( '10%, 20%, 30%, 40%' ) ).to.deep.equal( [ 10, 20, 30, 40 ] );
			expect( normalizeColumnWidthsAttribute( '10.32%, 20.12%, 30.87%, 38.69%' ) ).to.deep.equal( [ 10.32, 20.12, 30.87, 38.69 ] );
			expect( normalizeColumnWidthsAttribute( '100%' ) ).to.deep.equal( [ 100 ] );
		} );

		it( 'should extend uninitialized columns equally if the free space per column is wider than the minimum column width', () => {
			expect( normalizeColumnWidthsAttribute( 'auto, auto, auto, auto' ) ).to.deep.equal( [ 25, 25, 25, 25 ] );
			expect( normalizeColumnWidthsAttribute( 'auto, 25%, auto, 25%' ) ).to.deep.equal( [ 25, 25, 25, 25 ] );
			expect( normalizeColumnWidthsAttribute( 'auto, auto, auto, 40%' ) ).to.deep.equal( [ 20, 20, 20, 40 ] );
			expect( normalizeColumnWidthsAttribute( 'auto, 45%, 45%, auto' ) ).to.deep.equal( [ 5, 45, 45, 5 ] );
			expect( normalizeColumnWidthsAttribute( 'auto' ) ).to.deep.equal( [ 100 ] );
		} );

		it( 'should set the minimum column width for uninitialized columns if there is not enough free space per column', () => {
			expect( normalizeColumnWidthsAttribute( 'auto, auto, auto, 90%' ) ).to.deep.equal( [ 4.76, 4.76, 4.76, 85.72 ] );
			expect( normalizeColumnWidthsAttribute( 'auto, 50%, auto, 50%' ) ).to.deep.equal( [ 4.55, 45.45, 4.55, 45.45 ] );
			expect( normalizeColumnWidthsAttribute( 'auto, 50%, 50%, 50%' ) ).to.deep.equal( [ 3.23, 32.26, 32.26, 32.25 ] );
		} );

		it( 'should proportionally align all the column widths if their sum is not exactly 100%', () => {
			expect( normalizeColumnWidthsAttribute( '10%, 20%, 30%, 50%' ) ).to.deep.equal( [ 9.09, 18.18, 27.27, 45.46 ] );
			expect( normalizeColumnWidthsAttribute( '10%, 10%, 10%, 10%' ) ).to.deep.equal( [ 25, 25, 25, 25 ] );
			expect( normalizeColumnWidthsAttribute( '100%, 100%, 100%, 100%' ) ).to.deep.equal( [ 25, 25, 25, 25 ] );
			expect( normalizeColumnWidthsAttribute( '1%, 2%, 3%, 4%' ) ).to.deep.equal( [ 10, 20, 30, 40 ] );
			expect( normalizeColumnWidthsAttribute( '12.33%, 17.4%, 21.49%, 33.52%, 26.6%, 10.43%' ) )
				.to.deep.equal( [ 10.13, 14.29, 17.65, 27.53, 21.84, 8.56 ] );
		} );
	} );

	describe( 'getTableWidthInPixels()', () => {
		let editor;

		beforeEach( () => {
			return ClassicEditor
				.create( '', {
					plugins: [ Table, TableColumnResize ]
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			editor.destroy();
		} );

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
} );

function createTable( rows, cols ) {
	return new Element( 'table', {}, createTableRows( rows, cols ) );
}

function createTableRows( rows, cols ) {
	return [ ...Array( rows ) ].map( () => new Element( 'tableRow', {}, createTableCells( cols ) ) );
}

function createTableCells( cols ) {
	return [ ...Array( cols ) ].map( () => new Element( 'tableCell' ) );
}

function insert( model, item, position ) {
	const doc = model.document;
	const operation = new InsertOperation( position, item, doc.version );

	model.applyOperation( operation );
}

function remove( model, sourcePosition, howMany ) {
	const doc = model.document;
	const targetPosition = Position._createAt( doc.graveyard, doc.graveyard.maxOffset );
	const operation = new MoveOperation( sourcePosition, howMany, targetPosition, doc.version );

	model.applyOperation( operation );
}

function attribute( model, range, key, oldValue, newValue ) {
	const doc = model.document;
	const operation = new AttributeOperation( range, key, oldValue, newValue, doc.version );

	model.applyOperation( operation );
}

function getColumnIndexMap( editor ) {
	return editor.plugins.get( 'TableColumnResizeEditing' )._columnIndexMap;
}
