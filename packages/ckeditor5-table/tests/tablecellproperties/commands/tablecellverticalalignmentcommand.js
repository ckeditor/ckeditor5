/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { assertTableCellStyle, modelTable, viewTable } from '../../_utils/utils';
import TableCellPropertiesEditing from '../../../src/tablecellproperties/tablecellpropertiesediting';
import TableCellVerticalAlignmentCommand from '../../../src/tablecellproperties/commands/tablecellverticalalignmentcommand';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'table cell properties', () => {
	describe( 'commands', () => {
		describe( 'TableCellVerticalAlignmentCommand', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellVerticalAlignmentCommand( editor );
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
					it( 'should be undefined if selected table cell has no verticalAlignment property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table cell has verticalAlignment property', () => {
						setData( model, modelTable( [ [ { verticalAlignment: 'bottom', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.equal( 'bottom' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be true is selection has table cell', () => {
						setData( model, modelTable( [ [ { verticalAlignment: 'bottom', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.equal( 'bottom' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should be undefined if no table cells have the "verticalAlignment" property', () => {
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

					it( 'should be undefined if only some table cells have the "verticalAlignment" property', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, verticalAlignment: 'bottom' },
								{ contents: '01', isSelected: true }
							],
							[
								'10',
								{ contents: '11', isSelected: true, verticalAlignment: 'bottom' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be undefined if one of selected table cells has a different "verticalAlignment" property value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, verticalAlignment: 'bottom' },
								{ contents: '01', isSelected: true, verticalAlignment: 'top' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, verticalAlignment: 'bottom' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if all table cells have the same "verticalAlignment" property value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, verticalAlignment: 'bottom' },
								{ contents: '01', isSelected: true, verticalAlignment: 'bottom' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, verticalAlignment: 'bottom' }
							]
						] ) );

						expect( command.value ).to.equal( 'bottom' );
					} );
				} );
			} );

			describe( 'execute()', () => {
				it( 'should use provided batch', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );
					const batch = model.createBatch();
					const spy = sinon.spy( model, 'enqueueChange' );

					command.execute( { value: 'top', batch } );
					sinon.assert.calledWith( spy, batch );
				} );

				describe( 'collapsed selection', () => {
					it( 'should set selected table cell verticalAlignment to a passed value', () => {
						setData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: 'top' } );

						assertTableCellStyle( editor, 'vertical-align:top;' );
					} );

					it( 'should change selected table cell verticalAlignment to a passed value', () => {
						setData( model, modelTable( [ [ { verticalAlignment: 'bottom', contents: '[]foo' } ] ] ) );

						command.execute( { value: 'top' } );

						assertTableCellStyle( editor, 'vertical-align:top;' );
					} );

					it( 'should remove verticalAlignment from a selected table cell if no value is passed', () => {
						setData( model, modelTable( [ [ { verticalAlignment: 'bottom', contents: '[]foo' } ] ] ) );

						command.execute();

						assertTableCellStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should set selected table cell verticalAlignment to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'top' } );

						assertTableCellStyle( editor, 'vertical-align:top;' );
					} );

					it( 'should change selected table cell verticalAlignment to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'top' } );

						assertTableCellStyle( editor, 'vertical-align:top;' );
					} );

					it( 'should remove verticalAlignment from a selected table cell if no value is passed', () => {
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

					it( 'should set selected table cell verticalAlignment to a passed value', () => {
						command.execute( { value: 'top' } );

						assertEqualMarkup( editor.getData(), viewTable( [
							[ { contents: '00', style: 'vertical-align:top;' }, '01' ],
							[ '10', { contents: '11', style: 'vertical-align:top;' } ]
						] ) );
					} );

					it( 'should remove verticalAlignment from a selected table cell if no value is passed', () => {
						setData( model, modelTable( [
							[ { contents: '00', isSelected: true, verticalAlignment: 'top' }, '01' ],
							[ '10', { contents: '11', isSelected: true, verticalAlignment: 'top' } ]
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
