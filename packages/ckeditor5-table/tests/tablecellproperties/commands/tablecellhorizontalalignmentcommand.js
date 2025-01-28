/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { assertTableCellStyle, modelTable, viewTable } from '../../_utils/utils.js';
import TableCellPropertiesEditing from '../../../src/tablecellproperties/tablecellpropertiesediting.js';
import TableCellHorizontalAlignmentCommand from '../../../src/tablecellproperties/commands/tablecellhorizontalalignmentcommand.js';

describe( 'table cell properties', () => {
	describe( 'commands', () => {
		describe( 'TableCellHorizontalAlignmentCommand: empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellHorizontalAlignmentCommand( editor, '' );
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
					it( 'should be undefined if selected table cell has no tableCellHorizontalAlignment property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table cell has tableCellHorizontalAlignment property', () => {
						setData( model, modelTable( [ [ { tableCellHorizontalAlignment: 'center', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.equal( 'center' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be true is selection has table cell', () => {
						setData( model, modelTable( [ [ { tableCellHorizontalAlignment: 'center', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.equal( 'center' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should be undefined if no table cells have the "tableCellHorizontalAlignment" property', () => {
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

					it( 'should be undefined if only some table cells have the "tableCellHorizontalAlignment" property', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellHorizontalAlignment: 'center' },
								{ contents: '01', isSelected: true }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellHorizontalAlignment: 'center' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( `should be undefined if one of selected table cells
						has a different "tableCellHorizontalAlignment" property value`, () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellHorizontalAlignment: 'center' },
								{ contents: '01', isSelected: true, tableCellHorizontalAlignment: 'right' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellHorizontalAlignment: 'center' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if all table cells have the same "tableCellHorizontalAlignment" property value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellHorizontalAlignment: 'center' },
								{ contents: '01', isSelected: true, tableCellHorizontalAlignment: 'center' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellHorizontalAlignment: 'center' }
							]
						] ) );

						expect( command.value ).to.equal( 'center' );
					} );
				} );
			} );

			describe( 'execute()', () => {
				it( 'should use provided batch', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );
					const batch = model.createBatch();
					const spy = sinon.spy( model, 'enqueueChange' );

					command.execute( { value: 'right', batch } );
					sinon.assert.calledWith( spy, batch );
				} );

				describe( 'collapsed selection', () => {
					it( 'should set selected table cell tableCellHorizontalAlignment to a passed value', () => {
						setData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: 'right' } );

						assertTableCellStyle( editor, 'text-align:right;' );
					} );

					it( 'should change selected table cell tableCellHorizontalAlignment to a passed value', () => {
						setData( model, modelTable( [ [ { tableCellHorizontalAlignment: 'center', contents: '[]foo' } ] ] ) );

						command.execute( { value: 'right' } );

						assertTableCellStyle( editor, 'text-align:right;' );
					} );

					it( 'should remove tableCellHorizontalAlignment from a selected table cell if no value is passed', () => {
						setData( model, modelTable( [ [ { tableCellHorizontalAlignment: 'center', contents: '[]foo' } ] ] ) );

						command.execute();

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should set selected table cell tableCellHorizontalAlignment to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'right' } );

						assertTableCellStyle( editor, 'text-align:right;' );
					} );

					it( 'should change selected table cell tableCellHorizontalAlignment to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'right' } );

						assertTableCellStyle( editor, 'text-align:right;' );
					} );

					it( 'should remove tableCellHorizontalAlignment from a selected table cell if no value is passed', () => {
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

					it( 'should set the "tableCellHorizontalAlignment" attribute value of selected table cells', () => {
						command.execute( { value: 'right' } );

						expect( editor.getData() ).to.equalMarkup( viewTable( [
							[ { contents: '00', style: 'text-align:right;' }, '01' ],
							[ '10', { contents: '11', style: 'text-align:right;' } ]
						] ) );
					} );

					it( `should remove the "tableCellHorizontalAlignment" attribute
						from selected table cells if no value is passed`, () => {
						setData( model, modelTable( [
							[ { contents: '00', isSelected: true, tableCellHorizontalAlignment: 'right' }, '01' ],
							[ '10', { contents: '11', isSelected: true, tableCellHorizontalAlignment: 'right' } ]
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

		describe( 'TableCellHorizontalAlignmentCommand: non-0empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellHorizontalAlignmentCommand( editor, 'left' );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table cell has the default value', () => {
						setData( model, modelTable( [ [ { tableCellHorizontalAlignment: 'left', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be undefined is selection contains the default value', () => {
						setData( model, modelTable( [ [ { tableCellHorizontalAlignment: 'left', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'multi-cell selection', () => {
					it(
						`should be set if all table cells have the same
						"tableCellHorizontalAlignment" property value which is the default value`,
						() => {
							setData( model, modelTable( [
								[
									{ contents: '00', isSelected: true, tableCellHorizontalAlignment: 'left' },
									{ contents: '01', isSelected: true, tableCellHorizontalAlignment: 'left' }
								],
								[
									'10',
									{ contents: '11', isSelected: true, tableCellHorizontalAlignment: 'left' }
								]
							] ) );

							expect( command.value ).to.be.undefined;
						} );
				} );
			} );

			describe( 'execute()', () => {
				describe( 'collapsed selection', () => {
					it( 'should remove tableCellHorizontalAlignment from a selected table cell if the default value is passed', () => {
						setData( model, modelTable( [ [ { tableCellHorizontalAlignment: 'center', contents: '[]foo' } ] ] ) );

						command.execute( { value: 'left' } );

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should remove tableCellHorizontalAlignment from a selected table cell if the default value is passed', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'left' } );

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it(
						`should remove the "tableCellHorizontalAlignment" attribute
						from selected table cells if the default value is passed`,
						() => {
							setData( model, modelTable( [
								[ { contents: '00', isSelected: true, tableCellHorizontalAlignment: 'right' }, '01' ],
								[ '10', { contents: '11', isSelected: true, tableCellHorizontalAlignment: 'right' } ]
							] ) );

							command.execute( { value: 'left' } );

							expect( editor.getData() ).to.equalMarkup( viewTable( [
								[ '00', '01' ],
								[ '10', '11' ]
							] ) );
						}
					);
				} );
			} );
		} );
	} );
} );
