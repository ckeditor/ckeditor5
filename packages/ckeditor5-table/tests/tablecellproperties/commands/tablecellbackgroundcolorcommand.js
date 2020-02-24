/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { assertTableCellStyle, modelTable, viewTable } from '../../_utils/utils';
import TableCellPropertiesEditing from '../../../src/tablecellproperties/tablecellpropertiesediting';
import TableCellBackgroundColorCommand from '../../../src/tablecellproperties/commands/tablecellbackgroundcolorcommand';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'table cell properties', () => {
	describe( 'commands', () => {
		describe( 'TableCellBackgroundColorCommand', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TableCellPropertiesEditing ]
				} );

				model = editor.model;
				command = new TableCellBackgroundColorCommand( editor );
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
					it( 'should be undefined if selected table cell has no backgroundColor property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table cell has backgroundColor property', () => {
						setData( model, modelTable( [ [ { backgroundColor: 'blue', contents: '[]foo' } ] ] ) );

						expect( command.value ).to.equal( 'blue' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table cell', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be true is selection has table cell', () => {
						setData( model, modelTable( [ [ { backgroundColor: 'blue', contents: 'f[o]o' } ] ] ) );

						expect( command.value ).to.equal( 'blue' );
					} );
				} );

				describe( 'multi-cell selection', () => {
					it( 'should be undefined if no table cell has a backgroundColor property', () => {
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

					it( 'should be undefined if only some table cell has a backgroundColor property', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, backgroundColor: '#f00' },
								{ contents: '01', isSelected: true }
							],
							[
								'10',
								{ contents: '11', isSelected: true, backgroundColor: '#f00' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be undefined if one of selected table cells has different backgroundColor property value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, backgroundColor: '#f00' },
								{ contents: '01', isSelected: true, backgroundColor: 'pink' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, backgroundColor: '#f00' }
							]
						] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if all table cell has the same backgroundColor property value', () => {
						setData( model, modelTable( [
							[
								{ contents: '00', isSelected: true, backgroundColor: '#f00' },
								{ contents: '01', isSelected: true, backgroundColor: '#f00' }
							],
							[
								'10',
								{ contents: '11', isSelected: true, backgroundColor: '#f00' }
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

					it( 'should set selected table cell backgroundColor to a passed value', () => {
						command.execute( { value: '#f00' } );

						assertEqualMarkup( editor.getData(), viewTable( [
							[ { contents: '00', style: 'background-color:#f00;' }, '01' ],
							[ '10', { contents: '11', style: 'background-color:#f00;' } ]
						] ) );
					} );

					it( 'should remove backgroundColor from a selected table cell if no value is passed', () => {
						setData( model, modelTable( [
							[ { contents: '00', isSelected: true, backgroundColor: '#f00' }, '01' ],
							[ '10', { contents: '11', isSelected: true, backgroundColor: '#f00' } ]
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
