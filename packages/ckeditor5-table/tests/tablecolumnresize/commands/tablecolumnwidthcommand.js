/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { WidgetResize } from '@ckeditor/ckeditor5-widget';

import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { modelTable } from '../../_utils/utils.js';
import { Table } from '../../../src/table.js';
import { TableCellWidthEditing } from '../../../src/tablecellwidth/tablecellwidthediting.js';
import { TableColumnResize } from '../../../src/tablecolumnresize.js';
import { TableColumnWidthCommand } from '../../../src/tablecolumnresize/commands/tablecolumnwidthcommand.js';
import { getTableColumnsWidths } from '../../../src/tablecolumnresize/utils.js';

describe( 'TableColumnWidthCommand', () => {
	let editor, model, command, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicEditor.create( editorElement, {
			plugins: [ Paragraph, Table, TableColumnResize, TableCellWidthEditing, WidgetResize ]
		} );

		model = editor.model;
		command = editor.commands.get( 'tableColumnWidth' );
	} );

	afterEach( async () => {
		await editor.destroy();
		editorElement.remove();
	} );

	function getTable() {
		return model.document.getRoot().getChild( 0 );
	}

	function getColumnWidths() {
		return getTableColumnsWidths( getTable() );
	}

	function getFirstCell() {
		return getTable().getChild( 0 ).getChild( 0 );
	}

	it( 'should be registered by TableColumnResizeEditing', () => {
		expect( command ).to.be.instanceOf( TableColumnWidthCommand );
	} );

	describe( 'refresh()', () => {
		it( 'should be enabled and reflect the width of the column the selected cell belongs to (percentage mode)', () => {
			_setModelData( model, modelTable( [
				[ '[]00', '01', '02' ]
			], { columnWidths: '20%,30%,50%', tableWidth: '80%' } ) );

			expect( command.isEnabled ).to.be.true;
			expect( command.value ).to.equal( '20%' );
		} );

		it( 'should reflect the width of the correct column for a cell further in the row', () => {
			_setModelData( model, modelTable( [
				[ '00', '0[]1', '02' ]
			], { columnWidths: '20%,30%,50%', tableWidth: '80%' } ) );

			expect( command.value ).to.equal( '30%' );
		} );

		it( 'should reflect the pixel width of the column (pixel mode)', () => {
			_setModelData( model, modelTable( [
				[ '00', '[]01' ]
			], { columnWidths: '100px,200px', tableWidth: '300px' } ) );

			expect( command.value ).to.equal( '200px' );
		} );

		it( 'should be disabled in a non-resized table', () => {
			_setModelData( model, modelTable( [
				[ { tableCellWidth: '123px', contents: '[]00' } ]
			] ) );

			expect( command.isEnabled ).to.be.false;
			expect( command.value ).to.be.null;
		} );

		it( 'should be enabled for a multi-cell selection and reflect the first covered column', () => {
			_setModelData( model, modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true }, '02' ]
			], { columnWidths: '20%,30%,50%', tableWidth: '80%' } ) );

			expect( command.isEnabled ).to.be.true;
			expect( command.value ).to.equal( '20%' );
		} );

		it( 'should be enabled for a cell spanning multiple columns and reflect the first spanned column', () => {
			_setModelData( model, modelTable( [
				[ { colspan: 2, contents: '[]00' }, '02' ]
			], { columnWidths: '20%,30%,50%', tableWidth: '80%' } ) );

			expect( command.isEnabled ).to.be.true;
			expect( command.value ).to.equal( '20%' );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should balance the width against the next column (percentage mode)', () => {
			_setModelData( model, modelTable( [
				[ '[]00', '01' ]
			], { columnWidths: '40%,60%', tableWidth: '80%' } ) );

			command.execute( { value: '20%' } );

			// The next column absorbs the change so the table width stays the same.
			expect( getColumnWidths() ).to.deep.equal( [ '20%', '80%' ] );
		} );

		it( 'should be a no-op for a whitespace-only value (does not write NaN widths)', () => {
			_setModelData( model, modelTable( [
				[ '[]00', '01' ]
			], { columnWidths: '40%,60%', tableWidth: '80%' } ) );

			command.execute( { value: '   ' } );

			// Whitespace reaches the command untrimmed; it must not corrupt the model with NaN widths.
			expect( getColumnWidths() ).to.deep.equal( [ '40%', '60%' ] );
		} );

		it( 'should drop the shadowed per-cell width when routing to the column', () => {
			_setModelData( model, modelTable( [
				[ { tableCellWidth: '999px', contents: '[]00' }, '01' ]
			], { columnWidths: '40%,60%', tableWidth: '80%' } ) );

			command.execute( { value: '20%' } );

			expect( getFirstCell().hasAttribute( 'tableCellWidth' ) ).to.be.false;
			expect( getColumnWidths() ).to.deep.equal( [ '20%', '80%' ] );
		} );

		it( 'should remove obsolete per-cell widths from the whole table, not just the selected cell', () => {
			_setModelData( model, modelTable( [
				[ { tableCellWidth: '50px', contents: '[]00' }, { tableCellWidth: '60px', contents: '01' } ],
				[ '10', { tableCellWidth: '70px', contents: '11' } ]
			], { columnWidths: '40%,60%', tableWidth: '80%' } ) );

			command.execute( { value: '20%' } );

			const anyCellHasWidth = Array.from( getTable().getChildren() )
				.filter( child => child.is( 'element', 'tableRow' ) )
				.flatMap( row => Array.from( row.getChildren() ) )
				.some( cell => cell.hasAttribute( 'tableCellWidth' ) );

			expect( anyCellHasWidth ).to.be.false;
		} );

		it( 'should apply the width to the column and grow the table (pixel mode)', () => {
			_setModelData( model, modelTable( [
				[ '[]00', '01' ]
			], { columnWidths: '100px,200px', tableWidth: '300px' } ) );

			command.execute( { value: '150px' } );

			expect( getColumnWidths() ).to.deep.equal( [ '150px', '200px' ] );
			expect( getTable().getAttribute( 'tableWidth' ) ).to.equal( '350px' );
		} );

		it( 'should route a unitless value to the column as pixels (pixel mode)', () => {
			_setModelData( model, modelTable( [
				[ '[]00', '01' ]
			], { columnWidths: '100px,200px', tableWidth: '300px' } ) );

			command.execute( { value: '150' } );

			expect( getColumnWidths() ).to.deep.equal( [ '150px', '200px' ] );
			expect( getTable().getAttribute( 'tableWidth' ) ).to.equal( '350px' );
		} );

		it( 'should convert a percentage value to pixels when the table is in pixel mode', () => {
			_setModelData( model, modelTable( [
				[ '[]00', '01' ]
			], { columnWidths: '100px,300px', tableWidth: '400px' } ) );

			command.execute( { value: '25%' } );

			// 25% of the 400px table width = 100px for the first column.
			expect( getColumnWidths() ).to.deep.equal( [ '100px', '300px' ] );
		} );

		it( 'should convert a pixel value to a percentage when the table is in percentage mode', () => {
			_setModelData( model, modelTable( [
				[ '[]00', '01' ]
			], { columnWidths: '40%,60%', tableWidth: '80%' } ) );

			command.execute( { value: '100px' } );

			const widths = getColumnWidths();

			// The pixel value is converted to a percentage - columns stay in % and keep summing to 100%.
			expect( widths.every( width => width.endsWith( '%' ) ) ).to.be.true;
			expect( widths.reduce( ( sum, width ) => sum + parseFloat( width ), 0 ) ).to.be.closeTo( 100, 0.5 );
		} );

		it( 'should balance against the next column only, leaving the rest untouched', () => {
			_setModelData( model, modelTable( [
				[ '[]00', '01', '02' ]
			], { columnWidths: '50%,30%,20%', tableWidth: '80%' } ) );

			command.execute( { value: '40%' } );

			// Only the next column absorbs the change (50->40 frees 10%, so 30->40); the third column is untouched.
			expect( getColumnWidths() ).to.deep.equal( [ '40%', '40%', '20%' ] );
		} );

		it( 'should convert all columns to pixels when applying a width to a mixed-unit table (pixel mode)', () => {
			// A pixel-width table with percentage columns is a valid loaded state; applying a width must not
			// reinterpret the other percentage columns as pixels.
			_setModelData( model, modelTable( [
				[ '[]00', '01', '02' ]
			], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

			command.execute( { value: '200px' } );

			// Every column ends up in pixels; the untouched columns keep their real widths (25%/55% of 500px),
			// not the corrupted '25px'/'55px'.
			expect( getColumnWidths() ).to.deep.equal( [ '200px', '125px', '275px' ] );
			expect( getTable().getAttribute( 'tableWidth' ) ).to.equal( '600px' );
		} );

		it( 'should keep the target column a valid positive percentage in a very wide table', () => {
			const columnCount = 21;

			_setModelData( model, modelTable( [
				Array.from( { length: columnCount }, ( _, index ) => index === 0 ? '[]00' : `${ index }` )
			], {
				columnWidths: Array.from( { length: columnCount }, () => `${ 100 / columnCount }%` ).join( ',' ),
				tableWidth: '80%'
			} ) );

			command.execute( { value: '50%' } );

			// With 21 columns the per-column minimums exceed 100%, but the target column must not collapse to
			// 0% or a negative percentage from an inverted clamp bound.
			expect( parseFloat( getColumnWidths()[ 0 ] ) > 0 ).to.be.true;
		} );

		it( 'should clamp so the next column does not drop below the minimum', () => {
			_setModelData( model, modelTable( [
				[ '[]00', '01' ]
			], { columnWidths: '40%,60%', tableWidth: '80%' } ) );

			command.execute( { value: '99%' } );

			// The next column is capped at the minimum (5%), which limits the target column to 95%.
			expect( getColumnWidths() ).to.deep.equal( [ '95%', '5%' ] );
		} );

		it( 'should keep the next column non-negative when the band and its neighbor cannot both meet the minimum', () => {
			_setModelData( model, modelTable( [
				[ '[]00', '01', '02' ]
			], { columnWidths: '2%,2%,96%', tableWidth: '80%' } ) );

			command.execute( { value: '50%' } );

			// The band column and its neighbor together (4%) cannot both reach the 5% minimum, so the space is
			// split evenly instead of forcing the neighbor to a zero or negative width.
			expect( getColumnWidths() ).to.deep.equal( [ '2%', '2%', '96%' ] );
		} );

		it( 'should grow the table when setting the last column (percentage mode)', () => {
			_setModelData( model, modelTable( [
				[ '00', '[]01' ]
			], { columnWidths: '50%,50%', tableWidth: '80%' } ) );

			command.execute( { value: '60%' } );

			// No next column to balance against, so the table grows while the other column keeps its absolute width.
			expect( getColumnWidths() ).to.deep.equal( [ '40%', '60%' ] );
			expect( getTable().getAttribute( 'tableWidth' ) ).to.equal( '100%' );
		} );

		it( 'should apply a pixel width to the last column idempotently (no spiral on repeated input)', () => {
			_setModelData( model, modelTable( [
				[ '00', '[]01' ]
			], { columnWidths: '50%,50%', tableWidth: '30%' } ) );

			command.execute( { value: '100px' } );

			const firstWidths = getColumnWidths().map( parseFloat );
			const firstTableWidth = parseFloat( getTable().getAttribute( 'tableWidth' ) );

			// Re-applying the same pixel width must not move the widths. Before the fix the conversion divided by the
			// ever-changing table width, so a repeated (or per-keystroke) application spiralled the column down.
			command.execute( { value: '100px' } );

			getColumnWidths().forEach( ( width, index ) => {
				expect( parseFloat( width ) ).to.be.closeTo( firstWidths[ index ], 0.5 );
			} );
			expect( parseFloat( getTable().getAttribute( 'tableWidth' ) ) ).to.be.closeTo( firstTableWidth, 0.5 );
		} );

		it( 'should grow the last column when the table has no width set (percentage mode)', () => {
			_setModelData( model, modelTable( [
				[ '00', '[]01' ]
			], { columnWidths: '40%,60%' } ) );

			command.execute( { value: '50%' } );

			// The other column keeps its absolute width; with no table width there is nothing to grow.
			expect( getColumnWidths() ).to.deep.equal( [ '50%', '50%' ] );
			expect( getTable().hasAttribute( 'tableWidth' ) ).to.be.false;
		} );

		it( 'should keep a single-column table at 100% (percentage mode)', () => {
			_setModelData( model, modelTable( [
				[ '[]00' ]
			], { columnWidths: '100%', tableWidth: '80%' } ) );

			command.execute( { value: '50%' } );

			// The only column must fill the table, so it stays at 100% regardless of the requested value.
			expect( getColumnWidths() ).to.deep.equal( [ '100%' ] );
		} );

		it( 'should distribute equally when all columns are selected (percentage mode)', () => {
			_setModelData( model, modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ]
			], { columnWidths: '30%,70%', tableWidth: '80%' } ) );

			command.execute( { value: '40%' } );

			// Percentage columns must sum to 100%, so an all-column selection cannot honor the value - it equalizes.
			expect( getColumnWidths() ).to.deep.equal( [ '50%', '50%' ] );
		} );

		it( 'should apply the width to every column in a contiguous multi-cell selection (percentage mode)', () => {
			_setModelData( model, modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true }, '02' ]
			], { columnWidths: '30%,30%,40%', tableWidth: '80%' } ) );

			command.execute( { value: '20%' } );

			// Both selected columns become 20%; the column after the band absorbs the freed width.
			expect( getColumnWidths() ).to.deep.equal( [ '20%', '20%', '60%' ] );
		} );

		it( 'should balance each band separately for a non-contiguous multi-cell selection (percentage mode)', () => {
			_setModelData( model, modelTable( [
				[ { contents: '00', isSelected: true }, '01', { contents: '02', isSelected: true }, '03' ]
			], { columnWidths: '25%,25%,25%,25%', tableWidth: '80%' } ) );

			command.execute( { value: '40%' } );

			// Each selected column becomes 40%; its own next column absorbs the change, the rest stay put.
			expect( getColumnWidths() ).to.deep.equal( [ '40%', '10%', '40%', '10%' ] );
		} );

		it( 'should apply the width to all columns a colspan cell covers (percentage mode)', () => {
			_setModelData( model, modelTable( [
				[ { colspan: 2, contents: '[]00' }, '02' ]
			], { columnWidths: '20%,30%,50%', tableWidth: '80%' } ) );

			command.execute( { value: '25%' } );

			// The colspan cell covers columns 0 and 1 - both become 25%; the next column absorbs the change.
			expect( getColumnWidths() ).to.deep.equal( [ '25%', '25%', '50%' ] );
		} );

		it( 'should grow the table for a selection that reaches the last column (percentage mode)', () => {
			_setModelData( model, modelTable( [
				[ '00', { contents: '01', isSelected: true }, { contents: '02', isSelected: true } ]
			], { columnWidths: '50%,25%,25%', tableWidth: '80%' } ) );

			command.execute( { value: '30%' } );

			// The last column is in the selection, so the table grows while the untouched column keeps its width.
			expect( getColumnWidths() ).to.deep.equal( [ '40%', '30%', '30%' ] );
			expect( getTable().getAttribute( 'tableWidth' ) ).to.equal( '100%' );
		} );

		it( 'should apply the width to every selected column and grow the table (pixel mode)', () => {
			_setModelData( model, modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true }, '02' ]
			], { columnWidths: '100px,100px,100px', tableWidth: '300px' } ) );

			command.execute( { value: '150px' } );

			expect( getColumnWidths() ).to.deep.equal( [ '150px', '150px', '100px' ] );
			expect( getTable().getAttribute( 'tableWidth' ) ).to.equal( '400px' );
		} );

		it( 'should clamp a pixel width to the minimum column width', () => {
			_setModelData( model, modelTable( [
				[ '[]00', '01' ]
			], { columnWidths: '100px,200px', tableWidth: '300px' } ) );

			command.execute( { value: '10px' } );

			// 10px is below the 40px minimum, so it is raised to 40px.
			expect( getColumnWidths() ).to.deep.equal( [ '40px', '200px' ] );
			expect( getTable().getAttribute( 'tableWidth' ) ).to.equal( '240px' );
		} );

		it( 'should do nothing when no value is given', () => {
			_setModelData( model, modelTable( [
				[ '[]00', '01' ]
			], { columnWidths: '40%,60%', tableWidth: '80%' } ) );

			command.execute();

			expect( getColumnWidths() ).to.deep.equal( [ '40%', '60%' ] );
		} );

		it( 'should not drop the per-cell width when the column cannot be resolved', () => {
			// The command is disabled for a non-mappable cell; if it is somehow executed anyway (forced enabled
			// here), the shadowed per-cell width must not be removed without a column width replacing it.
			_setModelData( model, modelTable( [
				[ { tableCellWidth: '50px', contents: 'foo[]' } ]
			] ) );

			command.isEnabled = true;
			command.execute( { value: '25px' } );

			expect( getFirstCell().getAttribute( 'tableCellWidth' ) ).to.equal( '50px' );
		} );
	} );
} );
