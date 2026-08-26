/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { assertTableCellStyle, modelTable, setTableCellWithObjectAttributes, viewTable } from '../../_utils/utils.js';
import { TableCellPropertiesEditing } from '../../../src/tablecellproperties/tablecellpropertiesediting.js';
import { TableCellBorderColorCommand } from '../../../src/tablecellproperties/commands/tablecellbordercolorcommand.js';

describe( 'table cell properties', () => {
	describe( 'commands', () => {
		describe( 'TableCellBorderColorCommand: empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellBorderColorCommand( editor, '' );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'isEnabled', () => {
				describe( 'collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						_setModelData( model, '<paragraph>foo[]</paragraph>' );
						expect( command.isEnabled ).toBe( false );
					} );

					it( 'should be true is selection has table cell', () => {
						_setModelData( model, modelTable( [ [ '[]foo' ] ] ) );
						expect( command.isEnabled ).toBe( true );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						_setModelData( model, '<paragraph>f[oo]</paragraph>' );
						expect( command.isEnabled ).toBe( false );
					} );

					it( 'should be true is selection has table cell', () => {
						_setModelData( model, modelTable( [ [ 'f[o]o' ] ] ) );
						expect( command.isEnabled ).toBe( true );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should be true if the selection contains some table cells', () => {
						_setModelData( model, modelTable( [
							[ { contents: '00', isSelected: true }, '01' ],
							[ '10', { contents: '11', isSelected: true } ]
						] ) );

						expect( command.isEnabled ).toBe( true );
					} );
				} );
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table cell has no tableCellBorderColor property', () => {
						_setModelData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).toBeUndefined();
					} );

					it( 'should be set if selected table cell has tableCellBorderColor property (single string)', () => {
						_setModelData( model, modelTable( [ [ { tableCellBorderColor: 'blue', contents: '[]foo' } ] ] ) );

						expect( command.value ).toEqual( 'blue' );
					} );

					it( 'should be set if selected table cell has tableCellBorderColor property object with same values', () => {
						setTableCellWithObjectAttributes( model, {
							tableCellBorderColor: {
								top: 'blue',
								right: 'blue',
								bottom: 'blue',
								left: 'blue'
							}
						}, '[]foo' );
						expect( command.value ).toEqual( 'blue' );
					} );

					it( 'should be undefined if selected table cell has tableCellBorderColor property object with different values', () => {
						setTableCellWithObjectAttributes( model, {
							tableCellBorderColor: {
								top: 'blue',
								right: 'red',
								bottom: 'blue',
								left: 'blue'
							}
						}, '[]foo' );

						expect( command.value ).toBeUndefined();
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						_setModelData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).toBeUndefined();
					} );

					it( 'should be true is selection has table cell', () => {
						_setModelData( model, modelTable( [ [ { tableCellBorderColor: 'blue', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).toEqual( 'blue' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should be undefined if no table cells have the "tableCellBorderColor" property', () => {
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

						expect( command.value ).toBeUndefined();
					} );

					it( 'should be undefined if only some table cells have the "tableCellBorderColor" property', () => {
						_setModelData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellBorderColor: '#f00' },
								{ contents: '01', isSelected: true }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellBorderColor: '#f00' }
							]
						] ) );

						expect( command.value ).toBeUndefined();
					} );

					it( 'should be undefined if one of selected table cells has a different "tableCellBorderColor" property value', () => {
						_setModelData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellBorderColor: '#f00' },
								{ contents: '01', isSelected: true, tableCellBorderColor: 'pink' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellBorderColor: '#f00' }
							]
						] ) );

						expect( command.value ).toBeUndefined();
					} );

					it( 'should be set if all table cells have the same "tableCellBorderColor" property value', () => {
						_setModelData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellBorderColor: '#f00' },
								{ contents: '01', isSelected: true, tableCellBorderColor: '#f00' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellBorderColor: '#f00' }
							]
						] ) );

						expect( command.value ).toEqual( '#f00' );
					} );
				} );
			} );

			describe( 'execute()', () => {
				it( 'should use provided batch', () => {
					_setModelData( model, modelTable( [ [ 'foo[]' ] ] ) );
					const batch = model.createBatch();
					const spy = vi.spyOn( model, 'enqueueChange' );

					command.execute( { value: '#f00', batch } );
					expect( spy ).toHaveBeenCalledWith( batch, expect.anything() );
				} );

				describe( 'collapsed selection', () => {
					it( 'should set selected table cell tableCellBorderColor to a passed value', () => {
						_setModelData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableCellStyle( editor, 'border-color:#f00;' );
					} );

					it( 'should change selected table cell tableCellBorderColor to a passed value', () => {
						_setModelData( model, modelTable( [ [ { tableCellBorderColor: 'blue', contents: '[]foo' } ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableCellStyle( editor, 'border-color:#f00;' );
					} );

					it( 'should remove tableCellBorderColor from a selected table cell if no value is passed', () => {
						_setModelData( model, modelTable( [ [ { tableCellBorderColor: 'blue', contents: '[]foo' } ] ] ) );

						command.execute();

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should set selected table cell tableCellBorderColor to a passed value', () => {
						_setModelData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableCellStyle( editor, 'border-color:#f00;' );
					} );

					it( 'should change selected table cell tableCellBorderColor to a passed value', () => {
						_setModelData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableCellStyle( editor, 'border-color:#f00;' );
					} );

					it( 'should remove tableCellBorderColor from a selected table cell if no value is passed', () => {
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

					it( 'should set the "tableCellBorderColor" attribute value of selected table cells', () => {
						command.execute( { value: '#f00' } );

						expect( editor.getData() ).toEqualMarkup( viewTable( [
							[ { contents: '00', style: 'border-color:#f00;' }, '01' ],
							[ '10', { contents: '11', style: 'border-color:#f00;' } ]
						] ) );
					} );

					it( 'should remove "borderColor" from the selected table cell if no value is passed', () => {
						_setModelData( model, modelTable( [
							[ { contents: '00', isSelected: true, tableCellBorderColor: '#f00' }, '01' ],
							[ '10', { contents: '11', isSelected: true, tableCellBorderColor: '#f00' } ]
						] ) );

						command.execute();

						expect( editor.getData() ).toEqualMarkup( viewTable( [
							[ '00', '01' ],
							[ '10', '11' ]
						] ) );
					} );
				} );
			} );
		} );

		describe( 'TableCellBorderColorCommand: non-default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellBorderColorCommand( editor, 'red' );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table cell has the default tableCellBorderColor property (single string)', () => {
						_setModelData( model, modelTable( [ [ { tableCellBorderColor: 'red', contents: '[]foo' } ] ] ) );

						expect( command.value ).toBeUndefined();
					} );

					it( `should be undefined if selected table cell
						has the default tableCellBorderColor property object with same values`, () => {
						setTableCellWithObjectAttributes( model, {
							tableCellBorderColor: {
								top: 'red',
								right: 'red',
								bottom: 'red',
								left: 'red'
							}
						}, '[]foo' );
						expect( command.value ).toBeUndefined();
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be undefined is selection contains the default value', () => {
						_setModelData( model, modelTable( [ [ { tableCellBorderColor: 'red', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).toBeUndefined();
					} );
				} );

				describe( 'multi-cell selection', () => {
					it(
						'should be undefined if all table cells have the same "borderColor" property value which is the default value',
						() => {
							_setModelData( model, modelTable( [
								[
									{ contents: '00', isSelected: true, tableCellBorderColor: 'red' },
									{ contents: '01', isSelected: true, tableCellBorderColor: 'red' }
								],
								[
									'10',
									{ contents: '11', isSelected: true, tableCellBorderColor: 'red' }
								]
							] ) );

							expect( command.value ).toBeUndefined();
						} );
				} );
			} );

			describe( 'execute()', () => {
				describe( 'collapsed selection', () => {
					it( 'should remove tableCellBorderColor from a selected table cell if the default value is passed', () => {
						_setModelData( model, modelTable( [ [ { tableCellBorderColor: 'blue', contents: '[]foo' } ] ] ) );

						command.execute( { value: 'red' } );

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should remove tableCellBorderColor from a selected table cell if the default value is passed', () => {
						_setModelData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'red' } );

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should remove "borderColor" from the selected table cell if the default value is passed', () => {
						_setModelData( model, modelTable( [
							[ { contents: '00', isSelected: true, tableCellBorderColor: '#f00' }, '01' ],
							[ '10', { contents: '11', isSelected: true, tableCellBorderColor: '#f00' } ]
						] ) );

						command.execute( { value: 'red' } );

						expect( editor.getData() ).toEqualMarkup( viewTable( [
							[ '00', '01' ],
							[ '10', '11' ]
						] ) );
					} );
				} );
			} );
		} );
	} );
} );
