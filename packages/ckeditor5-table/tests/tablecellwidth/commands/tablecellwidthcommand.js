/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import { _setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { assertTableCellStyle, modelTable, viewTable } from '../../_utils/utils.js';
import { TableCellWidthEditing } from '../../../src/tablecellwidth/tablecellwidthediting.js';
import { TableCellWidthCommand } from '../../../src/tablecellwidth/commands/tablecellwidthcommand.js';

describe( 'table cell width property commands', () => {
	describe( 'TableCellWidthCommand: empty default value', () => {
		let editor, model, command;

		beforeEach( async () => {
			editor = await ModelTestEditor.create( {
				plugins: [ Paragraph, TableCellWidthEditing ]
			} );

			model = editor.model;
			command = new TableCellWidthCommand( editor, '' );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'isEnabled', () => {
			describe( 'collapsed selection', () => {
				it( 'should be false if selection does not have table cell', () => {
					_setModelData( model, '<paragraph>foo[]</paragraph>' );
					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true is selection has table cell', () => {
					_setModelData( model, modelTable( [ [ '[]foo' ] ] ) );
					expect( command.isEnabled ).to.be.true;
				} );
			} );

			describe( 'non-collapsed selection', () => {
				it( 'should be false if selection does not have table cell', () => {
					_setModelData( model, '<paragraph>f[oo]</paragraph>' );
					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true is selection has table cell', () => {
					_setModelData( model, modelTable( [ [ 'f[o]o' ] ] ) );
					expect( command.isEnabled ).to.be.true;
				} );
			} );

			describe( 'multi-cell selection', () => {
				it( 'should be true if the selection contains some table cells', () => {
					_setModelData( model, modelTable( [
						[ { contents: '00', isSelected: true }, '01' ],
						[ '10', { contents: '11', isSelected: true } ]
					] ) );

					expect( command.isEnabled ).to.be.true;
				} );
			} );
		} );

		describe( 'value', () => {
			describe( 'collapsed selection', () => {
				it( 'should be undefined if selected table cell has no width property', () => {
					_setModelData( model, modelTable( [ [ '[]foo' ] ] ) );

					expect( command.value ).to.be.undefined;
				} );

				it( 'should be set if selected table cell has tableCellWidth property', () => {
					_setModelData( model, modelTable( [ [ { tableCellWidth: '100px', contents: '[]foo' } ] ] ) );

					expect( command.value ).to.equal( '100px' );
				} );
			} );

			describe( 'non-collapsed selection', () => {
				it( 'should be false if selection does not have table cell', () => {
					_setModelData( model, '<paragraph>f[oo]</paragraph>' );

					expect( command.value ).to.be.undefined;
				} );

				it( 'should be true is selection has table cell', () => {
					_setModelData( model, modelTable( [ [ { tableCellWidth: '100px', contents: 'f[o]o' } ] ] ) );

					expect( command.value ).to.equal( '100px' );
				} );
			} );

			describe( 'multi-cell selection', () => {
				it( 'should be undefined if no table cells have the "tableCellWidth" property', () => {
					_setModelData( model, modelTable( [
						[
							{ contents: '00', isSelected: true },
							{ contents: '01', isSelected: true }
						],
						[
							'10',
							{ contents: '11', isSelected: true }
						]
					] ) );

					expect( command.value ).to.be.undefined;
				} );

				it( 'should be undefined if only some table cells have the "tableCellWidth" property', () => {
					_setModelData( model, modelTable( [
						[
							{ contents: '00', isSelected: true, tableCellWidth: '100px' },
							{ contents: '01', isSelected: true }
						],
						[
							'10',
							{ contents: '11', isSelected: true, tableCellWidth: '100px' }
						]
					] ) );

					expect( command.value ).to.be.undefined;
				} );

				it( 'should be undefined if one of selected table cells has a different "tableCellWidth" property value', () => {
					_setModelData( model, modelTable( [
						[
							{ contents: '00', isSelected: true, tableCellWidth: '100px' },
							{ contents: '01', isSelected: true, tableCellWidth: '25px' }
						],
						[
							'10',
							{ contents: '11', isSelected: true, tableCellWidth: '100px' }
						]
					] ) );

					expect( command.value ).to.be.undefined;
				} );

				it( 'should be set if all table cells have the same "tableCellWidth" property value', () => {
					_setModelData( model, modelTable( [
						[
							{ contents: '00', isSelected: true, tableCellWidth: '100px' },
							{ contents: '01', isSelected: true, tableCellWidth: '100px' }
						],
						[
							'10',
							{ contents: '11', isSelected: true, tableCellWidth: '100px' }
						]
					] ) );

					expect( command.value ).to.equal( '100px' );
				} );
			} );
		} );

		describe( 'execute()', () => {
			it( 'should use provided batch', () => {
				_setModelData( model, modelTable( [ [ 'foo[]' ] ] ) );
				const batch = model.createBatch();
				const spy = sinon.spy( model, 'enqueueChange' );

				command.execute( { value: '25px', batch } );
				sinon.assert.calledWith( spy, batch );
			} );

			it( 'should add default unit for numeric values (number passed)', () => {
				_setModelData( model, modelTable( [ [ 'foo[]' ] ] ) );

				command.execute( { value: 25 } );

				assertTableCellStyle( editor, 'width:25px;' );
			} );

			it( 'should add default unit for numeric values (string passed)', () => {
				_setModelData( model, modelTable( [ [ 'foo[]' ] ] ) );

				command.execute( { value: 25 } );

				assertTableCellStyle( editor, 'width:25px;' );
			} );

			it( 'should not add default unit for numeric values with unit', () => {
				_setModelData( model, modelTable( [ [ 'foo[]' ] ] ) );

				command.execute( { value: '25pt' } );

				assertTableCellStyle( editor, 'width:25pt;' );
			} );

			it( 'should add default unit to floats (number passed)', () => {
				_setModelData( model, modelTable( [ [ 'foo[]' ] ] ) );

				command.execute( { value: 25.1 } );

				assertTableCellStyle( editor, 'width:25.1px;' );
			} );

			it( 'should add default unit to floats (string passed)', () => {
				_setModelData( model, modelTable( [ [ 'foo[]' ] ] ) );

				command.execute( { value: '0.1' } );

				assertTableCellStyle( editor, 'width:0.1px;' );
			} );

			it( 'should pass invalid values', () => {
				_setModelData( model, modelTable( [ [ 'foo[]' ] ] ) );

				command.execute( { value: 'bar' } );

				assertTableCellStyle( editor, 'width:bar;' );
			} );

			it( 'should pass invalid value (string passed, CSS float without leading 0)', () => {
				_setModelData( model, modelTable( [ [ 'foo[]' ] ] ) );

				command.execute( { value: '.2' } );

				assertTableCellStyle( editor, 'width:.2;' );
			} );

			describe( 'collapsed selection', () => {
				it( 'should set selected table cell width to a passed value', () => {
					_setModelData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: '25px' } );

					assertTableCellStyle( editor, 'width:25px;' );
				} );

				it( 'should change selected table cell width to a passed value', () => {
					_setModelData( model, modelTable( [ [ { width: '100px', contents: '[]foo' } ] ] ) );

					command.execute( { value: '25px' } );

					assertTableCellStyle( editor, 'width:25px;' );
				} );

				it( 'should remove width from a selected table cell if no value is passed', () => {
					_setModelData( model, modelTable( [ [ { width: '100px', contents: '[]foo' } ] ] ) );

					command.execute();

					assertTableCellStyle( editor, '' );
				} );
			} );

			describe( 'non-collapsed selection', () => {
				it( 'should set selected table cell width to a passed value', () => {
					_setModelData( model, modelTable( [ [ '[foo]' ] ] ) );

					command.execute( { value: '25px' } );

					assertTableCellStyle( editor, 'width:25px;' );
				} );

				it( 'should change selected table cell width to a passed value', () => {
					_setModelData( model, modelTable( [ [ '[foo]' ] ] ) );

					command.execute( { value: '25px' } );

					assertTableCellStyle( editor, 'width:25px;' );
				} );

				it( 'should remove width from a selected table cell if no value is passed', () => {
					_setModelData( model, modelTable( [ [ '[foo]' ] ] ) );

					command.execute();

					assertTableCellStyle( editor, '' );
				} );
			} );

			describe( 'multi-cell selection', () => {
				beforeEach( () => {
					_setModelData( model, modelTable( [
						[ { contents: '00', isSelected: true }, '01' ],
						[ '10', { contents: '11', isSelected: true } ]
					] ) );
				} );

				it( 'should set the "width" attribute value of selected table cells', () => {
					command.execute( { value: '25px' } );

					expect( editor.getData() ).to.equalMarkup( viewTable( [
						[ { contents: '00', style: 'width:25px;' }, '01' ],
						[ '10', { contents: '11', style: 'width:25px;' } ]
					] ) );
				} );

				it( 'should remove "width" from selected table cells if no value is passed', () => {
					_setModelData( model, modelTable( [
						[ { contents: '00', isSelected: true, width: '25px' }, '01' ],
						[ '10', { contents: '11', isSelected: true, width: '25px' } ]
					] ) );

					command.execute();

					expect( editor.getData() ).to.equalMarkup( viewTable( [
						[ '00', '01' ],
						[ '10', '11' ]
					] ) );
				} );
			} );
		} );
	} );

	describe( 'TableCellWidthCommand: non-empty default value', () => {
		let editor, model, command;

		beforeEach( async () => {
			editor = await ModelTestEditor.create( {
				plugins: [ Paragraph, TableCellWidthEditing ]
			} );

			model = editor.model;
			command = new TableCellWidthCommand( editor, '50px' );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'value', () => {
			describe( 'collapsed selection', () => {
				it( 'should be undefined if selected table cell has the default width property', () => {
					_setModelData( model, modelTable( [ [ { width: '50px', contents: '[]foo' } ] ] ) );

					expect( command.value ).to.be.undefined;
				} );
			} );

			describe( 'non-collapsed selection', () => {
				it( 'should be undefined is selection contains the default value', () => {
					_setModelData( model, modelTable( [ [ { width: '50px', contents: 'f[o]o' } ] ] ) );

					expect( command.value ).to.be.undefined;
				} );
			} );

			describe( 'multi-cell selection', () => {
				it( 'should be undefined if all table cells have the same "width" property value which is the default value', () => {
					_setModelData( model, modelTable( [
						[
							{ contents: '00', isSelected: true, width: '50px' },
							{ contents: '01', isSelected: true, width: '50px' }
						],
						[
							'10',
							{ contents: '11', isSelected: true, width: '50px' }
						]
					] ) );

					expect( command.value ).to.be.undefined;
				} );
			} );
		} );

		describe( 'execute()', () => {
			describe( 'collapsed selection', () => {
				it( 'should remove width from a selected table cell if the default value is passed', () => {
					_setModelData( model, modelTable( [ [ { width: '100px', contents: '[]foo' } ] ] ) );

					command.execute( { value: '50px' } );

					assertTableCellStyle( editor, '' );
				} );
			} );

			describe( 'non-collapsed selection', () => {
				it( 'should remove width from a selected table cell if the default value is passed', () => {
					_setModelData( model, modelTable( [ [ '[foo]' ] ] ) );

					command.execute( { value: '50px' } );

					assertTableCellStyle( editor, '' );
				} );
			} );

			describe( 'multi-cell selection', () => {
				it( 'should remove "width" from selected table cells if the default value is passed', () => {
					_setModelData( model, modelTable( [
						[ { contents: '00', isSelected: true, width: '25px' }, '01' ],
						[ '10', { contents: '11', isSelected: true, width: '25px' } ]
					] ) );

					command.execute( { value: '50px' } );

					expect( editor.getData() ).to.equalMarkup( viewTable( [
						[ '00', '01' ],
						[ '10', '11' ]
					] ) );
				} );
			} );
		} );
	} );
} );
