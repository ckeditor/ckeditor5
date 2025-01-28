/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { assertTableCellStyle, modelTable, viewTable } from '../../_utils/utils.js';
import TableCellPropertiesEditing from '../../../src/tablecellproperties/tablecellpropertiesediting.js';
import TableCellHeightCommand from '../../../src/tablecellproperties/commands/tablecellheightcommand.js';

describe( 'table cell properties', () => {
	describe( 'commands', () => {
		describe( 'TableCellHeightCommand: empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellHeightCommand( editor, '' );
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
					it( 'should be undefined if selected table cell has no tableCellHeight property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table cell has tableCellHeight property', () => {
						setData( model, modelTable( [ [ { tableCellHeight: '100px', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.equal( '100px' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be true is selection has table cell', () => {
						setData( model, modelTable( [ [ { tableCellHeight: '100px', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.equal( '100px' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should be undefined if no table cell have the "tableCellHeight" property', () => {
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

					it( 'should be undefined if only some table cells have the "tableCellHeight" property', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellHeight: '100px' },
								{ contents: '01', isSelected: true }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellHeight: '100px' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be undefined if one of selected table cells has a different "tableCellHeight" property value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellHeight: '100px' },
								{ contents: '01', isSelected: true, tableCellHeight: '23px' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellHeight: '100px' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if all table cell have the same "tableCellHeight" property value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellHeight: '100px' },
								{ contents: '01', isSelected: true, tableCellHeight: '100px' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellHeight: '100px' }
							]
						] ) );

						expect( command.value ).to.equal( '100px' );
					} );
				} );
			} );

			describe( 'execute()', () => {
				it( 'should use provided batch', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );
					const batch = model.createBatch();
					const spy = sinon.spy( model, 'enqueueChange' );

					command.execute( { value: '25px', batch } );
					sinon.assert.calledWith( spy, batch );
				} );

				it( 'should add default unit for numeric values (number passed)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: 25 } );

					assertTableCellStyle( editor, 'height:25px;' );
				} );

				it( 'should add default unit for numeric values (string passed)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: 25 } );

					assertTableCellStyle( editor, 'height:25px;' );
				} );

				it( 'should not add default unit for numeric values with unit', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: '25pt' } );

					assertTableCellStyle( editor, 'height:25pt;' );
				} );

				it( 'should add default unit to floats (number passed)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: 25.1 } );

					assertTableCellStyle( editor, 'height:25.1px;' );
				} );

				it( 'should add default unit to floats (string passed)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: '0.1' } );

					assertTableCellStyle( editor, 'height:0.1px;' );
				} );

				it( 'should pass invalid values', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: 'bar' } );

					assertTableCellStyle( editor, 'height:bar;' );
				} );

				it( 'should pass invalid value (string passed, CSS float without leading 0)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: '.2' } );

					assertTableCellStyle( editor, 'height:.2;' );
				} );

				describe( 'collapsed selection', () => {
					it( 'should set selected table cell height to a passed value', () => {
						setData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: '25px' } );

						assertTableCellStyle( editor, 'height:25px;' );
					} );

					it( 'should change selected table cell height to a passed value', () => {
						setData( model, modelTable( [ [ { height: '100px', contents: '[]foo' } ] ] ) );

						command.execute( { value: '25px' } );

						assertTableCellStyle( editor, 'height:25px;' );
					} );

					it( 'should remove height from a selected table cell if no value is passed', () => {
						setData( model, modelTable( [ [ { height: '100px', contents: '[]foo' } ] ] ) );

						command.execute();

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should set selected table cell height to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '25px' } );

						assertTableCellStyle( editor, 'height:25px;' );
					} );

					it( 'should change selected table cell height to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '25px' } );

						assertTableCellStyle( editor, 'height:25px;' );
					} );

					it( 'should remove height from a selected table cell if no value is passed', () => {
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

					it( 'should set the "height" attribute value of selected table cells', () => {
						command.execute( { value: '100px' } );

						expect( editor.getData() ).to.equalMarkup( viewTable( [
							[ { contents: '00', style: 'height:100px;' }, '01' ],
							[ '10', { contents: '11', style: 'height:100px;' } ]
						] ) );
					} );

					it( 'should remove "height" from selected table cells if no value is passed', () => {
						setData( model, modelTable( [
							[ { contents: '00', isSelected: true, height: '100px' }, '01' ],
							[ '10', { contents: '11', isSelected: true, height: '100px' } ]
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

		describe( 'TableCellHeightCommand: non-empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellHeightCommand( editor, '30px' );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table cell has the default value property', () => {
						setData( model, modelTable( [ [ { height: '30px', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be undefined if selected table cell has the default value', () => {
						setData( model, modelTable( [ [ { height: '30px', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should be undefined if all table cell have the same "height" property value which is the default value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, height: '30px' },
								{ contents: '01', isSelected: true, height: '30px' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, height: '30px' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );
				} );
			} );

			describe( 'execute()', () => {
				describe( 'collapsed selection', () => {
					it( 'should remove height from a selected table cell if the default value is passed', () => {
						setData( model, modelTable( [ [ { height: '100px', contents: '[]foo' } ] ] ) );

						command.execute( { value: '30px' } );

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should remove height from a selected table cell if the default value is passed', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '30px' } );

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should remove "height" from selected table cells if the default value is passed', () => {
						setData( model, modelTable( [
							[ { contents: '00', isSelected: true, height: '100px' }, '01' ],
							[ '10', { contents: '11', isSelected: true, height: '100px' } ]
						] ) );

						command.execute( { value: '30px' } );

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
