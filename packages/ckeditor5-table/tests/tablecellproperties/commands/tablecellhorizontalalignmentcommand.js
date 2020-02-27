/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { assertTableCellStyle, modelTable, viewTable } from '../../_utils/utils';
import TableCellPropertiesEditing from '../../../src/tablecellproperties/tablecellpropertiesediting';
import TableCellHorizontalAlignmentCommand from '../../../src/tablecellproperties/commands/tablecellhorizontalalignmentcommand';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'table cell properties', () => {
	describe( 'commands', () => {
		describe( 'TableCellHorizontalAlignmentCommand', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellHorizontalAlignmentCommand( editor );
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
					it( 'should be true is selection has table cells', () => {
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
					it( 'should be undefined if selected table cell has no horizontalAlignment property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table cell has horizontalAlignment property', () => {
						setData( model, modelTable( [ [ { horizontalAlignment: 'center', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.equal( 'center' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be true is selection has table cell', () => {
						setData( model, modelTable( [ [ { horizontalAlignment: 'center', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.equal( 'center' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should be undefined if no table cell has a horizontalAlignment property', () => {
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

					it( 'should be undefined if only some table cells have the "horizontalAlignment" property', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, horizontalAlignment: 'center' },
								{ contents: '01', isSelected: true }
							],
							[
								'10',
								{ contents: '11', isSelected: true, horizontalAlignment: 'center' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be undefined if one of selected table cells has different horizontalAlignment property value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, horizontalAlignment: 'center' },
								{ contents: '01', isSelected: true, horizontalAlignment: 'right' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, horizontalAlignment: 'center' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if all table cell has the same horizontalAlignment property value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, horizontalAlignment: 'center' },
								{ contents: '01', isSelected: true, horizontalAlignment: 'center' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, horizontalAlignment: 'center' }
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
					it( 'should set selected table cell horizontalAlignment to a passed value', () => {
						setData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: 'right' } );

						assertTableCellStyle( editor, 'text-align:right;' );
					} );

					it( 'should change selected table cell horizontalAlignment to a passed value', () => {
						setData( model, modelTable( [ [ { horizontalAlignment: 'center', contents: '[]foo' } ] ] ) );

						command.execute( { value: 'right' } );

						assertTableCellStyle( editor, 'text-align:right;' );
					} );

					it( 'should remove horizontalAlignment from a selected table cell if no value is passed', () => {
						setData( model, modelTable( [ [ { horizontalAlignment: 'center', contents: '[]foo' } ] ] ) );

						command.execute();

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should set selected table cell horizontalAlignment to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'right' } );

						assertTableCellStyle( editor, 'text-align:right;' );
					} );

					it( 'should change selected table cell horizontalAlignment to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'right' } );

						assertTableCellStyle( editor, 'text-align:right;' );
					} );

					it( 'should remove horizontalAlignment from a selected table cell if no value is passed', () => {
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

					it( 'should set selected table cell horizontalAlignment to a passed value', () => {
						command.execute( { value: 'right' } );

						assertEqualMarkup( editor.getData(), viewTable( [
							[ { contents: '00', style: 'text-align:right;' }, '01' ],
							[ '10', { contents: '11', style: 'text-align:right;' } ]
						] ) );
					} );

					it( 'should remove horizontalAlignment from a selected table cell if no value is passed', () => {
						setData( model, modelTable( [
							[ { contents: '00', isSelected: true, horizontalAlignment: 'right' }, '01' ],
							[ '10', { contents: '11', isSelected: true, horizontalAlignment: 'right' } ]
						] ) );

						command.execute();

						assertEqualMarkup( editor.getData(), viewTable( [
							[ '00', '01' ],
							[ '10', '11' ]
						] ) );
					} );
				} );
			} );
		} );
	} );
} );
