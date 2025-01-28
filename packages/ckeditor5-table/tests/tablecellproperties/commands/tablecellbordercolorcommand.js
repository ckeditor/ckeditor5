/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { assertTableCellStyle, modelTable, setTableCellWithObjectAttributes, viewTable } from '../../_utils/utils.js';
import TableCellPropertiesEditing from '../../../src/tablecellproperties/tablecellpropertiesediting.js';
import TableCellBorderColorCommand from '../../../src/tablecellproperties/commands/tablecellbordercolorcommand.js';

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
						setData( model, '<paragraph>foo[]</paragraph>' );
						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true is selection has table cell', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );
						expect( command.isEnabled ).to.be.true;
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );
						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true is selection has table cell', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ] ) );
						expect( command.isEnabled ).to.be.true;
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should be true if the selection contains some table cells', () => {
						setData( model, modelTable( [
							[ { contents: '00', isSelected: true }, '01' ],
							[ '10', { contents: '11', isSelected: true } ]
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );
				} );
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table cell has no tableCellBorderColor property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table cell has tableCellBorderColor property (single string)', () => {
						setData( model, modelTable( [ [ { tableCellBorderColor: 'blue', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.equal( 'blue' );
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
						expect( command.value ).to.equal( 'blue' );
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

						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be true is selection has table cell', () => {
						setData( model, modelTable( [ [ { tableCellBorderColor: 'blue', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.equal( 'blue' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should be undefined if no table cells have the "tableCellBorderColor" property', () => {
						setData( model, modelTable( [
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

					it( 'should be undefined if only some table cells have the "tableCellBorderColor" property', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellBorderColor: '#f00' },
								{ contents: '01', isSelected: true }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellBorderColor: '#f00' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be undefined if one of selected table cells has a different "tableCellBorderColor" property value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellBorderColor: '#f00' },
								{ contents: '01', isSelected: true, tableCellBorderColor: 'pink' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellBorderColor: '#f00' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if all table cells have the same "tableCellBorderColor" property value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellBorderColor: '#f00' },
								{ contents: '01', isSelected: true, tableCellBorderColor: '#f00' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellBorderColor: '#f00' }
							]
						] ) );

						expect( command.value ).to.equal( '#f00' );
					} );
				} );
			} );

			describe( 'execute()', () => {
				it( 'should use provided batch', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );
					const batch = model.createBatch();
					const spy = sinon.spy( model, 'enqueueChange' );

					command.execute( { value: '#f00', batch } );
					sinon.assert.calledWith( spy, batch );
				} );

				describe( 'collapsed selection', () => {
					it( 'should set selected table cell tableCellBorderColor to a passed value', () => {
						setData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableCellStyle( editor, 'border-color:#f00;' );
					} );

					it( 'should change selected table cell tableCellBorderColor to a passed value', () => {
						setData( model, modelTable( [ [ { tableCellBorderColor: 'blue', contents: '[]foo' } ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableCellStyle( editor, 'border-color:#f00;' );
					} );

					it( 'should remove tableCellBorderColor from a selected table cell if no value is passed', () => {
						setData( model, modelTable( [ [ { tableCellBorderColor: 'blue', contents: '[]foo' } ] ] ) );

						command.execute();

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should set selected table cell tableCellBorderColor to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableCellStyle( editor, 'border-color:#f00;' );
					} );

					it( 'should change selected table cell tableCellBorderColor to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableCellStyle( editor, 'border-color:#f00;' );
					} );

					it( 'should remove tableCellBorderColor from a selected table cell if no value is passed', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute();

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					beforeEach( () => {
						setData( model, modelTable( [
							[ { contents: '00', isSelected: true }, '01' ],
							[ '10', { contents: '11', isSelected: true } ]
						] ) );
					} );

					it( 'should set the "tableCellBorderColor" attribute value of selected table cells', () => {
						command.execute( { value: '#f00' } );

						expect( editor.getData() ).to.equalMarkup( viewTable( [
							[ { contents: '00', style: 'border-color:#f00;' }, '01' ],
							[ '10', { contents: '11', style: 'border-color:#f00;' } ]
						] ) );
					} );

					it( 'should remove "borderColor" from the selected table cell if no value is passed', () => {
						setData( model, modelTable( [
							[ { contents: '00', isSelected: true, tableCellBorderColor: '#f00' }, '01' ],
							[ '10', { contents: '11', isSelected: true, tableCellBorderColor: '#f00' } ]
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
						setData( model, modelTable( [ [ { tableCellBorderColor: 'red', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.be.undefined;
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
						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be undefined is selection contains the default value', () => {
						setData( model, modelTable( [ [ { tableCellBorderColor: 'red', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'multi-cell selection', () => {
					it(
						'should be undefined if all table cells have the same "borderColor" property value which is the default value',
						() => {
							setData( model, modelTable( [
								[
									{ contents: '00', isSelected: true, tableCellBorderColor: 'red' },
									{ contents: '01', isSelected: true, tableCellBorderColor: 'red' }
								],
								[
									'10',
									{ contents: '11', isSelected: true, tableCellBorderColor: 'red' }
								]
							] ) );

							expect( command.value ).to.be.undefined;
						} );
				} );
			} );

			describe( 'execute()', () => {
				describe( 'collapsed selection', () => {
					it( 'should remove tableCellBorderColor from a selected table cell if the default value is passed', () => {
						setData( model, modelTable( [ [ { tableCellBorderColor: 'blue', contents: '[]foo' } ] ] ) );

						command.execute( { value: 'red' } );

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should remove tableCellBorderColor from a selected table cell if the default value is passed', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'red' } );

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should remove "borderColor" from the selected table cell if the default value is passed', () => {
						setData( model, modelTable( [
							[ { contents: '00', isSelected: true, tableCellBorderColor: '#f00' }, '01' ],
							[ '10', { contents: '11', isSelected: true, tableCellBorderColor: '#f00' } ]
						] ) );

						command.execute( { value: 'red' } );

						expect( editor.getData() ).to.equalMarkup( viewTable( [
							[ '00', '01' ],
							[ '10', '11' ]
						] ) );
					} );
				} );
			} );
		} );
	} );
} );
