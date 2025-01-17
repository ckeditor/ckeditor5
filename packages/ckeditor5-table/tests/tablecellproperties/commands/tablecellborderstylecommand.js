/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { assertTableCellStyle, modelTable, setTableCellWithObjectAttributes, viewTable } from '../../_utils/utils.js';
import TableCellPropertiesEditing from '../../../src/tablecellproperties/tablecellpropertiesediting.js';
import TableCellBorderStyleCommand from '../../../src/tablecellproperties/commands/tablecellborderstylecommand.js';

describe( 'table cell properties', () => {
	describe( 'commands', () => {
		describe( 'TableCellBorderStyleCommand: empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellBorderStyleCommand( editor, '' );
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
					it( 'should be undefined if selected table cell has no tableCellBorderStyle property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table cell has tableCellBorderStyle property (single string)', () => {
						setData( model, modelTable( [ [ { tableCellBorderStyle: 'ridge', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.equal( 'ridge' );
					} );

					it( 'should be set if selected table cell has tableCellBorderStyle property object with same values', () => {
						setTableCellWithObjectAttributes( model, {
							tableCellBorderStyle: {
								top: 'ridge',
								right: 'ridge',
								bottom: 'ridge',
								left: 'ridge'
							}
						}, '[]foo' );
						expect( command.value ).to.equal( 'ridge' );
					} );

					it( 'should be undefined if selected table cell has tableCellBorderStyle property object with different values', () => {
						setTableCellWithObjectAttributes( model, {
							tableCellBorderStyle: {
								top: 'ridge',
								right: 'dashed',
								bottom: 'ridge',
								left: 'ridge'
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
						setData( model, modelTable( [ [ { tableCellBorderStyle: 'ridge', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.equal( 'ridge' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should be undefined if no table cells have the "borderStyle" property', () => {
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

					it( 'should be undefined if only some table cells have the "borderStyle" property', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellBorderStyle: 'solid' },
								{ contents: '01', isSelected: true }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellBorderStyle: 'solid' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be undefined if one of selected table cells has a different "borderStyle" property value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellBorderStyle: 'solid' },
								{ contents: '01', isSelected: true, tableCellBorderStyle: 'ridge' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellBorderStyle: 'solid' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if all table cells have the same "borderStyle" property value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellBorderStyle: 'solid' },
								{ contents: '01', isSelected: true, tableCellBorderStyle: 'solid' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellBorderStyle: 'solid' }
							]
						] ) );

						expect( command.value ).to.equal( 'solid' );
					} );
				} );
			} );

			describe( 'execute()', () => {
				it( 'should use provided batch', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );
					const batch = model.createBatch();
					const spy = sinon.spy( model, 'enqueueChange' );

					command.execute( { value: 'solid', batch } );
					sinon.assert.calledWith( spy, batch );
				} );

				describe( 'collapsed selection', () => {
					it( 'should set selected table cell tableCellBorderStyle to a passed value', () => {
						setData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableCellStyle( editor, 'border-style:solid;' );
					} );

					it( 'should change selected table cell tableCellBorderStyle to a passed value', () => {
						setData( model, modelTable( [ [ { tableCellBorderStyle: 'ridge', contents: '[]foo' } ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableCellStyle( editor, 'border-style:solid;' );
					} );

					it( 'should remove tableCellBorderStyle from a selected table cell if no value is passed', () => {
						setData( model, modelTable( [ [ { tableCellBorderStyle: 'ridge', contents: '[]foo' } ] ] ) );

						command.execute();

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should set selected table cell tableCellBorderStyle to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableCellStyle( editor, 'border-style:solid;' );
					} );

					it( 'should change selected table cell tableCellBorderStyle to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableCellStyle( editor, 'border-style:solid;' );
					} );

					it( 'should remove tableCellBorderStyle from a selected table cell if no value is passed', () => {
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

					it( 'should set the "borderStyle" attribute value of selected table cells', () => {
						command.execute( { value: 'solid' } );

						expect( editor.getData() ).to.equalMarkup( viewTable( [
							[
								{ contents: '00', style: 'border-style:solid;' },
								'01'
							],
							[
								'10',
								{ contents: '11', style: 'border-style:solid;' }
							]
						] ) );
					} );

					it( 'should remove "borderStyle" from selected table cells if no value is passed', () => {
						setData( model, modelTable( [
							[ { contents: '00', isSelected: true, tableCellBorderStyle: 'solid' }, '01' ],
							[ '10', { contents: '11', isSelected: true, tableCellBorderStyle: 'solid' } ]
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

		describe( 'TableCellBorderStyleCommand: non-empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellBorderStyleCommand( editor, 'solid' );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table cell has the default tableCellBorderStyle property (single string)', () => {
						setData( model, modelTable( [ [ { tableCellBorderStyle: 'solid', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( `should be undefined if selected table cell
						has the default tableCellBorderStyle property object with same values`, () => {
						setTableCellWithObjectAttributes( model, {
							tableCellBorderStyle: {
								top: 'solid',
								right: 'solid',
								bottom: 'solid',
								left: 'solid'
							}
						}, '[]foo' );
						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be undefined is selection contains the default value', () => {
						setData( model, modelTable( [ [ { tableCellBorderStyle: 'solid', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'multi-cell selection', () => {
					it(
						'should be undefined if all table cells have the same "borderStyle" property value which is the default value',
						() => {
							setData( model, modelTable( [
								[
									{ contents: '00', isSelected: true, tableCellBorderStyle: 'solid' },
									{ contents: '01', isSelected: true, tableCellBorderStyle: 'solid' }
								],
								[
									'10',
									{ contents: '11', isSelected: true, tableCellBorderStyle: 'solid' }
								]
							] ) );

							expect( command.value ).to.be.undefined;
						}
					);
				} );
			} );

			describe( 'execute()', () => {
				describe( 'collapsed selection', () => {
					it( 'should remove tableCellBorderStyle from a selected table cell if the default value is passed', () => {
						setData( model, modelTable( [ [ { tableCellBorderStyle: 'ridge', contents: '[]foo' } ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should remove tableCellBorderStyle from a selected table cell if the default value is passed', () => {
						setData( model, modelTable( [ [ { tableCellBorderStyle: 'ridge', contents: '[foo]' } ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should remove "borderStyle" from selected table cells if the default value is passed', () => {
						setData( model, modelTable( [
							[ { contents: '00', isSelected: true, tableCellBorderStyle: 'solid' }, '01' ],
							[ '10', { contents: '11', isSelected: true, tableCellBorderStyle: 'solid' } ]
						] ) );

						command.execute( { value: 'solid' } );

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
