/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { modelTable, viewTable } from '../../_utils/utils.js';
import { TableCellTypeEditing } from '../../../src/tablecelltype/tablecelltypeediting.js';
import { TableCellTypeCommand } from '../../../src/tablecelltype/commands/tablecelltypecommand.js';

describe( 'TableCellTypeCommand', () => {
	let editor, model, command;

	beforeEach( async () => {
		editor = await ModelTestEditor.create( {
			plugins: [ Paragraph, TableCellTypeEditing ],
			config: {
				experimentalFlags: {
					tableCellTypeSupport: true
				}
			}
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

		it( 'should be true is selection has table cell', () => {
			_setModelData( model, modelTable( [ [ '[]foo' ] ] ) );
			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'value', () => {
		it( 'should be undefined if selected table cell has no tableCellType property', () => {
			_setModelData( model, modelTable( [ [ '[]foo' ] ] ) );
			expect( command.value ).to.be.undefined;
		} );

		it( 'should be "header" if selected table cell has tableCellType="header"', () => {
			_setModelData( model, modelTable( [ [ { tableCellType: 'header', contents: '[]foo' } ] ] ) );
			expect( command.value ).to.equal( 'header' );
		} );

		it( 'should be undefined if multiple cells with different types are selected', () => {
			_setModelData( model, modelTable( [
				[ { contents: '00', isSelected: true, tableCellType: 'header' }, { contents: '01', isSelected: true } ]
			] ) );
			expect( command.value ).to.be.undefined;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should change cell type to "header"', () => {
			_setModelData( model, modelTable( [ [ '[]foo' ] ] ) );

			command.execute( { value: 'header' } );

			expect( editor.getData() ).to.equalMarkup( viewTable(
				[ [ { isHeading: true, contents: 'foo' } ] ],
				{ headingRows: 1 }
			) );
		} );

		it( 'should change cell type to "data"', () => {
			_setModelData( model, modelTable( [ [ { tableCellType: 'header', contents: '[]foo' } ] ] ) );

			command.execute( { value: 'data' } );

			expect( editor.getData() ).to.equalMarkup( viewTable( [ [ 'foo' ] ] ) );
		} );

		describe( 'multiple cells changes', () => {
			it( 'should increment headingRows when changing entire first row to header', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
					[ '10', '11' ]
				] ) );

				command.execute( { value: 'header' } );

				expect( editor.getData() ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
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

				expect( editor.getData() ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ '10', '11' ]
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
				expect( editor.getData() ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
					[ { isHeading: true, contents: '10' }, { isHeading: true, contents: '11' } ]
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

				expect( editor.getData() ).to.equalMarkup( viewTable( [
					[ '00', '01' ],
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
				expect( editor.getData() ).to.equalMarkup( viewTable( [
					[ { isHeading: true, contents: '00' }, '01' ],
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
				expect( editor.getData() ).to.equalMarkup( viewTable( [
					[ { isHeading: true, contents: '00' }, '01' ],
					[ '10', '11' ]
				] ) );
			} );

			it( 'should NOT increment headingRows if not all cells in the previous row are changed to header', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00', tableCellType: 'header' }, '01' ],
					[ { contents: '10', tableCellType: 'header' }, { contents: '11', isSelected: true } ]
				] ) );

				command.execute( { value: 'header' } );

				expect( editor.getData() ).to.equalMarkup( viewTable( [
					[ { isHeading: true, contents: '00' }, '01' ],
					[ { isHeading: true, contents: '10' }, { isHeading: true, contents: '11' } ]
				] ) );
			} );

			it.skip( 'should increment headingRows if setting all header cells in the previous row to header', () => {
				_setModelData( model, modelTable( [
					[ { contents: '00[]' }, { contents: '01', tableCellType: 'header' } ],
					[ { contents: '10', tableCellType: 'header' }, { contents: '11', tableCellType: 'header' } ]
				] ) );

				command.execute( { value: 'header' } );

				const table = model.document.getRoot().getChild( 0 );

				expect( table.getAttribute( 'headingRows' ) ).to.equal( 2 );
				expect( editor.getData() ).to.equalMarkup( viewTable( [
					[ { isHeading: true, contents: '00' }, { isHeading: true, contents: '01' } ],
					[ { isHeading: true, contents: '10' }, { isHeading: true, contents: '11' } ]
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
				expect( editor.getData() ).to.equalMarkup( viewTable( [
					[ '00', { contents: '01', isHeading: true } ],
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

				expect( editor.getData() ).to.equalMarkup( viewTable( [
					[ '00', { isHeading: true, contents: '01' } ],
					[
						{ isHeading: true, contents: '10' },
						{ isHeading: true, contents: '11' }
					]
				] ) );
			} );

			it( 'should decrement headingColumns when changing second column (header) to data but keep existing cells as th', () => {
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

				expect( editor.getData() ).to.equalMarkup( viewTable( [
					[ { contents: '00', isHeading: true }, { contents: '01', isHeading: true } ],
					[ { contents: '10', isHeading: true }, '11' ]
				] ) );
			} );
		} );
	} );
} );
