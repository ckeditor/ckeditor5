/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { assertTableCellStyle, modelTable, viewTable } from '../../_utils/utils';
import TableCellPropertiesEditing from '../../../src/tablecellproperties/tablecellpropertiesediting';
import TableCellBackgroundColorCommand from '../../../src/tablecellproperties/commands/tablecellbackgroundcolorcommand';

describe( 'table cell properties', () => {
	describe( 'commands', () => {
		describe( 'TableCellBackgroundColorCommand: empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellBackgroundColorCommand( editor, '' );
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
					it( 'should be undefined if selected table cell has no tableCellBackgroundColor property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table cell has tableCellBackgroundColor property', () => {
						setData( model, modelTable( [ [ { tableCellBackgroundColor: 'blue', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.equal( 'blue' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be true is selection has table cell', () => {
						setData( model, modelTable( [ [ { tableCellBackgroundColor: 'blue', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.equal( 'blue' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should be undefined if no table cell have the "tableCellBackgroundColor" property', () => {
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

					it( 'should be undefined if only some table cells have the "tableCellBackgroundColor" property', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellBackgroundColor: '#f00' },
								{ contents: '01', isSelected: true }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellBackgroundColor: '#f00' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( `should be undefined if one of selected table cells
						has a different "tableCellBackgroundColor" property value`, () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellBackgroundColor: '#f00' },
								{ contents: '01', isSelected: true, tableCellBackgroundColor: 'pink' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellBackgroundColor: '#f00' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if all table cell have the same "tableCellBackgroundColor" property value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellBackgroundColor: '#f00' },
								{ contents: '01', isSelected: true, tableCellBackgroundColor: '#f00' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellBackgroundColor: '#f00' }
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
					it( 'should set selected table cell backgroundColor to a passed value', () => {
						setData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableCellStyle( editor, 'background-color:#f00;' );
					} );

					it( 'should change selected table cell backgroundColor to a passed value', () => {
						setData( model, modelTable( [ [ { backgroundColor: 'blue', contents: '[]foo' } ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableCellStyle( editor, 'background-color:#f00;' );
					} );

					it( 'should remove backgroundColor from a selected table cell if no value is passed', () => {
						setData( model, modelTable( [ [ { backgroundColor: 'blue', contents: '[]foo' } ] ] ) );

						command.execute();

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should set selected table cell backgroundColor to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableCellStyle( editor, 'background-color:#f00;' );
					} );

					it( 'should change selected table cell backgroundColor to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableCellStyle( editor, 'background-color:#f00;' );
					} );

					it( 'should remove backgroundColor from a selected table cell if no value is passed', () => {
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

					it( 'should set the "backgroundColor" attribute value of selected table cells', () => {
						command.execute( { value: '#f00' } );

						expect( editor.getData() ).to.equalMarkup( viewTable( [
							[ { contents: '00', style: 'background-color:#f00;' }, '01' ],
							[ '10', { contents: '11', style: 'background-color:#f00;' } ]
						] ) );
					} );

					it( 'should remove "backgroundColor" from a selected table cell if no value is passed', () => {
						setData( model, modelTable( [
							[ { contents: '00', isSelected: true, backgroundColor: '#f00' }, '01' ],
							[ '10', { contents: '11', isSelected: true, backgroundColor: '#f00' } ]
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

		describe( 'TableCellBackgroundColorCommand: non-empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellBackgroundColorCommand( editor, 'red' );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table cell has set the default value', () => {
						setData( model, modelTable( [ [ { backgroundColor: 'red', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be undefined if selected table cell has the default value', () => {
						setData( model, modelTable( [ [ { backgroundColor: 'red', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'multi-cell selection', () => {
					it(
						'should be undefined if all table cell have the same "backgroundColor" property value which is the default value',
						() => {
							setData( model, modelTable( [
								[
									{ contents: '00', isSelected: true, backgroundColor: 'red' },
									{ contents: '01', isSelected: true, backgroundColor: 'red' }
								],
								[
									'10',
									{ contents: '11', isSelected: true, backgroundColor: 'red' }
								]
							] ) );

							expect( command.value ).to.be.undefined;
						}
					);
				} );
			} );

			describe( 'execute()', () => {
				describe( 'collapsed selection', () => {
					it( 'should remove backgroundColor from a selected table cell if the default value is passed', () => {
						setData( model, modelTable( [ [ { backgroundColor: 'blue', contents: '[]foo' } ] ] ) );

						command.execute( { value: 'red' } );

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should remove backgroundColor from a selected table cell if the default value is passed', () => {
						setData( model, modelTable( [ [ { backgroundColor: 'blue', contents: '[foo]' } ] ] ) );

						command.execute( { value: 'red' } );

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should remove "backgroundColor" from a selected table cell if the default value is passed', () => {
						setData( model, modelTable( [
							[ { contents: '00', isSelected: true, backgroundColor: '#f00' }, '01' ],
							[ '10', { contents: '11', isSelected: true, backgroundColor: '#f00' } ]
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
