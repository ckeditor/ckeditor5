/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';

import { modelTable } from '../../_utils/utils.js';
import { TableCellPropertiesEditing } from '../../../src/tablecellproperties/tablecellpropertiesediting.js';
import { TableCellTypeCommand } from '../../../src/tablecellproperties/commands/tablecelltypecommand.js';

describe( 'TableCellTypeCommand', () => {
	let editor, model, command;

	beforeEach( async () => {
		editor = await ModelTestEditor.create( {
			plugins: [ Paragraph, TableCellPropertiesEditing ]
		} );

		model = editor.model;
		command = new TableCellTypeCommand( editor );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be false if selection does not have table cell', () => {
			_setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true if selection has table cell', () => {
			_setModelData( model, modelTable( [ [ '[]foo' ] ] ) );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if selection is in a layout table', () => {
			_setModelData( model, modelTable( [ [ '[]foo' ] ], { tableType: 'layout' } ) );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'value', () => {
		it( 'should be "data" if selected table cell has no tableCellType property', () => {
			_setModelData( model, modelTable( [ [ '[]foo' ] ] ) );

			expect( command.value ).to.be.equal( 'data' );
		} );

		it( 'should be "header" if selected table cell has tableCellType="header"', () => {
			_setModelData( model, modelTable( [ [ { tableCellType: 'header', contents: '[]foo' } ] ] ) );
			expect( command.value ).to.equal( 'header' );
		} );

		it( 'should be undefined if multiple cells with different types are selected', () => {
			_setModelData( model, modelTable( [
				[
					{ contents: '00', isSelected: true, tableCellType: 'header' },
					{ contents: '01', isSelected: true }
				]
			] ) );

			expect( command.value ).to.be.undefined;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should change cell type to "header"', () => {
			_setModelData( model, modelTable( [ [ '[]foo' ] ] ) );

			command.execute( { value: 'header' } );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable(
				[ [ { tableCellType: 'header', contents: 'foo' } ] ],
				{ headingRows: 1 }
			) );
		} );

		it( 'should change cell type to "data"', () => {
			_setModelData( model, modelTable( [ [ { tableCellType: 'header', contents: '[]foo' } ] ] ) );

			command.execute( { value: 'data' } );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [ [ 'foo' ] ] ) );
		} );

		describe( 'multiple cells changes', () => {
			it( 'should increment headingRows when changing entire first row to header', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
					[ '10', '11' ]
				] ) );

				command.execute( { value: 'header' } );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { contents: '00', tableCellType: 'header' }, { contents: '01', tableCellType: 'header' } ],
					[ '10', '11' ]
				], { headingRows: 1 } ) );
			} );

			it( 'should increment headingColumns when changing entire first column to header', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00', isSelected: true }, '01' ],
					[ { contents: '10', isSelected: true }, '11' ]
				] ) );

				command.execute( { value: 'header' } );

				const table = model.document.getRoot().getChild( 0 );
				expect( table.getAttribute( 'headingColumns' ) ).to.equal( 1 );
			} );

			it( 'should increment headingRows when changing second row to header if first is already header', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00', tableCellType: 'header' }, { contents: '01', tableCellType: 'header' } ],
					[ { contents: '10', isSelected: true }, { contents: '11', isSelected: true } ]
				], { headingRows: 1 } ) );

				command.execute( { value: 'header' } );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { contents: '00', tableCellType: 'header' }, { contents: '01', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header' }, { contents: '11', tableCellType: 'header' } ]
				], { headingRows: 2 } ) );
			} );

			it( 'should NOT increment headingRows when changing second row to header if first is data', () => {
				_setModelData( model, modelTable( [
					[ '00', '01' ],
					[
						{ contents: '10', isSelected: true },
						{ contents: '11', isSelected: true }
					]
				] ) );

				command.execute( { value: 'header' } );

				const table = model.document.getRoot().getChild( 0 );

				expect( table.hasAttribute( 'headingRows' ) ).to.be.false;
				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00', '01' ],
					[ { tableCellType: 'header', contents: '10' }, { tableCellType: 'header', contents: '11' } ]
				] ) );
			} );

			it( 'should decrement headingRows when changing first row (header) to data', () => {
				_setModelData( model, modelTable( [
					[
						{ contents: '00', isSelected: true, tableCellType: 'header' },
						{ contents: '01', isSelected: true, tableCellType: 'header' }
					],
					[ '10', '11' ]
				], { headingRows: 1 } ) );

				command.execute( { value: 'data' } );

				const table = model.document.getRoot().getChild( 0 );

				expect( table.hasAttribute( 'headingRows' ) ).to.be.false;
			} );

			it( 'should decrement headingRows when changing second row (header) to data (headingRows=2)', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00', tableCellType: 'header' }, { contents: '01', tableCellType: 'header' } ],
					[
						{ contents: '10', isSelected: true, tableCellType: 'header' },
						{ contents: '11', isSelected: true, tableCellType: 'header' }
					]
				], { headingRows: 2 } ) );

				command.execute( { value: 'data' } );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { contents: '00', tableCellType: 'header' }, { contents: '01', tableCellType: 'header' } ],
					[ '10', '11' ]
				], { headingRows: 1 } ) );
			} );

			it( 'should reset headingRows to 0 when changing first row (header) to data (headingRows=2)', () => {
				_setModelData( model, modelTable( [
					[
						{ contents: '00', isSelected: true, tableCellType: 'header' },
						{ contents: '01', isSelected: true, tableCellType: 'header' }
					],
					[ { contents: '10', tableCellType: 'header' }, { contents: '11', tableCellType: 'header' } ]
				], { headingRows: 2 } ) );

				command.execute( { value: 'data' } );

				const table = model.document.getRoot().getChild( 0 );

				expect( table.hasAttribute( 'headingRows' ) ).to.be.false;
			} );

			it( 'should decrement headingColumns when changing first column (header) to data', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00', isSelected: true, tableCellType: 'header' }, '01' ],
					[ { contents: '10', isSelected: true, tableCellType: 'header' }, '11' ]
				], { headingColumns: 1 } ) );

				command.execute( { value: 'data' } );

				const table = model.document.getRoot().getChild( 0 );

				expect( table.hasAttribute( 'headingColumns' ) ).to.be.false;
			} );

			it( 'should properly set headingRows and headingColumns ' +
					'if whole table is header and column in the middle is set to data', () => {
				_setModelData( model, modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '01', isSelected: true, tableCellType: 'header' },
						{ contents: '02', tableCellType: 'header' }
					],
					[
						{ contents: '10', tableCellType: 'header' },
						{ contents: '11', isSelected: true, tableCellType: 'header' },
						{ contents: '12', tableCellType: 'header' }
					]
				], { headingRows: 2, headingColumns: 3 } ) );

				command.execute( { value: 'data' } );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '01' },
						{ contents: '02', tableCellType: 'header' }
					],
					[
						{ contents: '10', tableCellType: 'header' },
						{ contents: '11' },
						{ contents: '12', tableCellType: 'header' }
					]
				], { headingColumns: 1 } ) );
			} );
		} );

		describe( 'single cell changes', () => {
			it( 'should NOT increment headingRows when changing a single cell in the first row to header', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00', isSelected: true }, '01' ],
					[ '10', '11' ]
				] ) );

				command.execute( { value: 'header' } );

				const table = model.document.getRoot().getChild( 0 );

				expect( table.hasAttribute( 'headingRows' ) ).to.be.false;
				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { tableCellType: 'header', contents: '00' }, '01' ],
					[ '10', '11' ]
				] ) );
			} );

			it( 'should NOT increment headingColumns when changing a single cell in the first column to header', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00', isSelected: true }, '01' ],
					[ '10', '11' ]
				] ) );

				command.execute( { value: 'header' } );

				const table = model.document.getRoot().getChild( 0 );

				expect( table.hasAttribute( 'headingColumns' ) ).to.be.false;
				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { tableCellType: 'header', contents: '00' }, '01' ],
					[ '10', '11' ]
				] ) );
			} );

			it( 'should NOT increment headingRows if not all cells in the previous row are changed to header', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00', tableCellType: 'header' }, '01' ],
					[ { contents: '10', tableCellType: 'header' }, { contents: '11', isSelected: true } ]
				] ) );

				command.execute( { value: 'header' } );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { tableCellType: 'header', contents: '00' }, '01' ],
					[ { tableCellType: 'header', contents: '10' }, { tableCellType: 'header', contents: '11' } ]
				], { headingColumns: 1 } ) );
			} );

			it( 'should increment headingRows if setting all header cells in the previous row to header', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00[]' }, { contents: '01', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header' }, { contents: '11', tableCellType: 'header' } ]
				] ) );

				command.execute( { value: 'header' } );

				const table = model.document.getRoot().getChild( 0 );

				expect( table.getAttribute( 'headingRows' ) ).to.equal( 2 );
				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { tableCellType: 'header', contents: '00' }, { tableCellType: 'header', contents: '01' } ],
					[ { tableCellType: 'header', contents: '10' }, { tableCellType: 'header', contents: '11' } ]
				], { headingRows: 2 } ) );
			} );

			it( 'should decrement headingRows when changing a single cell in a header row to data', () => {
				_setModelData( model, modelTable( [
					[
						{ contents: '00', isSelected: true, tableCellType: 'header' },
						{ contents: '01', tableCellType: 'header' }
					],
					[ '10', '11' ]
				], { headingRows: 1 } ) );

				command.execute( { value: 'data' } );

				const table = model.document.getRoot().getChild( 0 );

				expect( table.hasAttribute( 'headingRows' ) ).to.be.false;
				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00', { contents: '01', tableCellType: 'header' } ],
					[ '10', '11' ]
				] ) );
			} );

			it( 'should decrement headingRows but keep second table cell header if changing a single cell in a header row to data', () => {
				_setModelData( model, modelTable( [
					[
						{ contents: '00', isSelected: true, tableCellType: 'header' },
						{ contents: '01', tableCellType: 'header' }
					],
					[
						{ contents: '10', tableCellType: 'header' },
						{ contents: '11', tableCellType: 'header' }
					]
				], { headingRows: 2 } ) );

				command.execute( { value: 'data' } );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00', { tableCellType: 'header', contents: '01' } ],
					[
						{ tableCellType: 'header', contents: '10' },
						{ tableCellType: 'header', contents: '11' }
					]
				] ) );
			} );

			it( 'should decrement headingColumns when changing second column cell (header) to data but keep existing cells as th', () => {
				_setModelData( model, modelTable( [
					[
						{ contents: '00', tableCellType: 'header' },
						{ contents: '01', tableCellType: 'header' }
					],
					[
						{ contents: '10', tableCellType: 'header' },
						{ contents: '11', isSelected: true, tableCellType: 'header' }
					]
				], { headingColumns: 2 } ) );

				command.execute( { value: 'data' } );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { contents: '00', tableCellType: 'header' }, { contents: '01', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header' }, '11' ]
				], { headingColumns: 1, headingRows: 1 } ) );
			} );
		} );

		describe( 'integration with table footers', () => {
			it( 'should increment headingRows up to the footer', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00', tableCellType: 'header' } ],
					[ { contents: '10', isSelected: true } ],
					[ { contents: '20' } ]
				], { headingRows: 1, footerRows: 1 } ) );

				command.execute( { value: 'header' } );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { contents: '00', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header' } ],
					[ { contents: '20' } ]
				], { headingRows: 2, footerRows: 1 } ) );
			} );

			it( 'should not increment headingRows to overlap with footerRows', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header' } ],
					[ { contents: '20', tableCellType: 'header' } ],
					[ { contents: '30', isSelected: true } ]
				], { headingRows: 3, footerRows: 1 } ) );

				command.execute( { value: 'header' } );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { contents: '00', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header' } ],
					[ { contents: '20', tableCellType: 'header' } ],
					[ { contents: '30', tableCellType: 'header' } ]
				], { headingRows: 3, headingColumns: 1, footerRows: 1 } ) );
			} );
		} );
	} );
} );

describe( 'TableCellTypeCommand with scopedHeaders', () => {
	let editor, model, command;

	beforeEach( async () => {
		editor = await ModelTestEditor.create( {
			plugins: [ Paragraph, TableCellPropertiesEditing ],
			table: {
				tableCellProperties: {
					scopedHeaders: true
				}
			}
		} );

		model = editor.model;
		command = new TableCellTypeCommand( editor );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'value', () => {
		it( 'should be "header-row" if selected table cell has tableCellType="header-row"', () => {
			_setModelData( model, modelTable( [ [ { tableCellType: 'header-row', contents: '[]foo' } ] ] ) );
			expect( command.value ).to.equal( 'header-row' );
		} );

		it( 'should be "header-column" if selected table cell has tableCellType="header-column"', () => {
			_setModelData( model, modelTable( [ [ { tableCellType: 'header-column', contents: '[]foo' } ] ] ) );
			expect( command.value ).to.equal( 'header-column' );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should change cell type to "header-row"', () => {
			_setModelData( model, modelTable( [ [ '[]foo' ] ] ) );

			command.execute( { value: 'header-row' } );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable(
				[ [ { tableCellType: 'header-row', contents: 'foo' } ] ],
				{ headingRows: 1 }
			) );
		} );

		it( 'should change cell type to "header-column"', () => {
			_setModelData( model, modelTable( [ [ '[]foo' ] ] ) );

			command.execute( { value: 'header-column' } );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable(
				[ [ { tableCellType: 'header-column', contents: 'foo' } ] ],
				{ headingRows: 1 }
			) );
		} );

		it( 'should change cell type to "header-column" in a multi-column table', () => {
			_setModelData( model, modelTable( [ [ '[]foo', 'bar' ] ] ) );

			command.execute( { value: 'header-column' } );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable(
				[ [ { tableCellType: 'header-column', contents: 'foo' }, 'bar' ] ],
				{ headingColumns: 1 }
			) );
		} );

		it( 'should change cell type to "header-row" in a multi-row table', () => {
			_setModelData( model, modelTable( [ [ '[]foo' ], [ 'bar' ] ] ) );

			command.execute( { value: 'header-row' } );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable(
				[ [ { tableCellType: 'header-row', contents: 'foo' } ], [ 'bar' ] ],
				{ headingRows: 1 }
			) );
		} );

		it( 'should change cell type from "header-row" to "data"', () => {
			_setModelData( model, modelTable( [ [ { tableCellType: 'header-row', contents: '[]foo' } ] ] ) );

			command.execute( { value: 'data' } );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [ [ 'foo' ] ] ) );
		} );

		it( 'should change cell type from "header-column" to "data"', () => {
			_setModelData( model, modelTable( [ [ { tableCellType: 'header-column', contents: '[]foo' } ] ] ) );

			command.execute( { value: 'data' } );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [ [ 'foo' ] ] ) );
		} );

		describe( 'intersection of heading rows and columns', () => {
			it( 'should change intersection cell to "header-row"', () => {
				_setModelData( model, modelTable( [
					[ { contents: '[]00', tableCellType: 'header' }, { contents: '01', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header' }, '11' ]
				], { headingRows: 1, headingColumns: 1 } ) );

				command.execute( { value: 'header-row' } );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { contents: '00', tableCellType: 'header-row' }, { contents: '01', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header' }, '11' ]
				], { headingRows: 1, headingColumns: 1 } ) );
			} );

			it( 'should change intersection cell to "header-column"', () => {
				_setModelData( model, modelTable( [
					[ { contents: '[]00', tableCellType: 'header' }, { contents: '01', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header' }, '11' ]
				], { headingRows: 1, headingColumns: 1 } ) );

				command.execute( { value: 'header-column' } );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { contents: '00', tableCellType: 'header-column' }, { contents: '01', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header' }, '11' ]
				], { headingRows: 1, headingColumns: 1 } ) );
			} );

			it( 'should change cell in heading row (not intersection) to "header-column"', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00', tableCellType: 'header' }, { contents: '[]01', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header' }, '11' ]
				], { headingRows: 1, headingColumns: 1 } ) );

				command.execute( { value: 'header-column' } );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { contents: '00', tableCellType: 'header' }, { contents: '01', tableCellType: 'header-column' } ],
					[ { contents: '10', tableCellType: 'header' }, '11' ]
				], { headingRows: 1, headingColumns: 1 } ) );
			} );

			it( 'should change cell in heading column (not intersection) to "header-row"', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00', tableCellType: 'header' }, { contents: '01', tableCellType: 'header' } ],
					[ { contents: '[]10', tableCellType: 'header' }, '11' ]
				], { headingRows: 1, headingColumns: 1 } ) );

				command.execute( { value: 'header-row' } );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ { contents: '00', tableCellType: 'header' }, { contents: '01', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header-row' }, '11' ]
				], { headingRows: 1, headingColumns: 1 } ) );
			} );

			it( 'should reset both headingRows and headingColumns when intersection cell is changed to "data"', () => {
				_setModelData( model, modelTable( [
					[ { contents: '[]00', tableCellType: 'header' }, { contents: '01', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header' }, '11' ]
				], { headingRows: 1, headingColumns: 1 } ) );

				command.execute( { value: 'data' } );

				const table = model.document.getRoot().getChild( 0 );

				expect( table.hasAttribute( 'headingRows' ) ).to.be.false;
				expect( table.hasAttribute( 'headingColumns' ) ).to.be.false;

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '00', { contents: '01', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header' }, '11' ]
				] ) );
			} );
		} );
	} );
} );
