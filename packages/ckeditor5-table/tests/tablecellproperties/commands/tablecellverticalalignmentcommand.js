/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import { _setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { assertTableCellStyle, modelTable, viewTable } from '../../_utils/utils.js';
import { TableCellPropertiesEditing } from '../../../src/tablecellproperties/tablecellpropertiesediting.js';
import { TableCellVerticalAlignmentCommand } from '../../../src/tablecellproperties/commands/tablecellverticalalignmentcommand.js';

describe( 'table cell properties', () => {
	describe( 'commands', () => {
		describe( 'TableCellVerticalAlignmentCommand: empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellVerticalAlignmentCommand( editor, '' );
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
					it( 'should be undefined if selected table cell has no tableCellVerticalAlignment property', () => {
						_setModelData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table cell has tableCellVerticalAlignment property', () => {
						_setModelData( model, modelTable( [ [ { tableCellVerticalAlignment: 'bottom', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.equal( 'bottom' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						_setModelData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be true is selection has table cell', () => {
						_setModelData( model, modelTable( [ [ { tableCellVerticalAlignment: 'bottom', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.equal( 'bottom' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should be undefined if no table cells have the "tableCellVerticalAlignment" property', () => {
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

					it( 'should be undefined if only some table cells have the "tableCellVerticalAlignment" property', () => {
						_setModelData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellVerticalAlignment: 'bottom' },
								{ contents: '01', isSelected: true }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellVerticalAlignment: 'bottom' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( `should be undefined if one of selected table cells has
						a different "tableCellVerticalAlignment" property value`, () => {
						_setModelData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellVerticalAlignment: 'bottom' },
								{ contents: '01', isSelected: true, tableCellVerticalAlignment: 'top' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellVerticalAlignment: 'bottom' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if all table cells have the same "tableCellVerticalAlignment" property value', () => {
						_setModelData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, tableCellVerticalAlignment: 'bottom' },
								{ contents: '01', isSelected: true, tableCellVerticalAlignment: 'bottom' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, tableCellVerticalAlignment: 'bottom' }
							]
						] ) );

						expect( command.value ).to.equal( 'bottom' );
					} );
				} );
			} );

			describe( 'execute()', () => {
				it( 'should use provided batch', () => {
					_setModelData( model, modelTable( [ [ 'foo[]' ] ] ) );
					const batch = model.createBatch();
					const spy = sinon.spy( model, 'enqueueChange' );

					command.execute( { value: 'top', batch } );
					sinon.assert.calledWith( spy, batch );
				} );

				describe( 'collapsed selection', () => {
					it( 'should set selected table cell tableCellVerticalAlignment to a passed value', () => {
						_setModelData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: 'top' } );

						assertTableCellStyle( editor, 'vertical-align:top;' );
					} );

					it( 'should change selected table cell tableCellVerticalAlignment to a passed value', () => {
						_setModelData( model, modelTable( [ [ { tableCellVerticalAlignment: 'bottom', contents: '[]foo' } ] ] ) );

						command.execute( { value: 'top' } );

						assertTableCellStyle( editor, 'vertical-align:top;' );
					} );

					it( 'should remove tableCellVerticalAlignment from a selected table cell if no value is passed', () => {
						_setModelData( model, modelTable( [ [ { tableCellVerticalAlignment: 'bottom', contents: '[]foo' } ] ] ) );

						command.execute();

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should set selected table cell tableCellVerticalAlignment to a passed value', () => {
						_setModelData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'top' } );

						assertTableCellStyle( editor, 'vertical-align:top;' );
					} );

					it( 'should change selected table cell tableCellVerticalAlignment to a passed value', () => {
						_setModelData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'top' } );

						assertTableCellStyle( editor, 'vertical-align:top;' );
					} );

					it( 'should remove tableCellVerticalAlignment from a selected table cell if no value is passed', () => {
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

					it( 'should set the "tableCellVerticalAlignment" attribute value of selected table cells', () => {
						command.execute( { value: 'top' } );

						expect( editor.getData() ).to.equalMarkup( viewTable( [
							[ { contents: '00', style: 'vertical-align:top;' }, '01' ],
							[ '10', { contents: '11', style: 'vertical-align:top;' } ]
						] ) );
					} );

					it( 'should remove "tableCellVerticalAlignment" from selected table cells if no value is passed', () => {
						_setModelData( model, modelTable( [
							[ { contents: '00', isSelected: true, tableCellVerticalAlignment: 'top' }, '01' ],
							[ '10', { contents: '11', isSelected: true, tableCellVerticalAlignment: 'top' } ]
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

		describe( 'TableCellVerticalAlignmentCommand: non-empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellVerticalAlignmentCommand( editor, 'bottom' );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table cell has the default tableCellVerticalAlignment property', () => {
						_setModelData( model, modelTable( [ [ { tableCellVerticalAlignment: 'bottom', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be undefined is selection contains the default value', () => {
						_setModelData( model, modelTable( [ [ { tableCellVerticalAlignment: 'bottom', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'multi-cell selection', () => {
					it(
						'should be undefined if all table cells have the same "tableCellVerticalAlignment" property ' +
						'value which is the default value',
						() => {
							_setModelData( model, modelTable( [
								[
									{ contents: '00', isSelected: true, tableCellVerticalAlignment: 'bottom' },
									{ contents: '01', isSelected: true, tableCellVerticalAlignment: 'bottom' }
								],
								[
									'10',
									{ contents: '11', isSelected: true, tableCellVerticalAlignment: 'bottom' }
								]
							] ) );

							expect( command.value ).to.be.undefined;
						}
					);
				} );
			} );

			describe( 'execute()', () => {
				describe( 'collapsed selection', () => {
					it( 'should remove tableCellVerticalAlignment from a selected table cell if the default value is passed', () => {
						_setModelData( model, modelTable( [ [ { tableCellVerticalAlignment: 'bottom', contents: '[]foo' } ] ] ) );

						command.execute( { value: 'bottom' } );

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should remove tableCellVerticalAlignment from a selected table cell if the default value is passed', () => {
						_setModelData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'bottom' } );

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should remove "tableCellVerticalAlignment" from selected table cells if the default value is passed', () => {
						_setModelData( model, modelTable( [
							[ { contents: '00', isSelected: true, tableCellVerticalAlignment: 'top' }, '01' ],
							[ '10', { contents: '11', isSelected: true, tableCellVerticalAlignment: 'top' } ]
						] ) );

						command.execute( { value: 'bottom' } );

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
