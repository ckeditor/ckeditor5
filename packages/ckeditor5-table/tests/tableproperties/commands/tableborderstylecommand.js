/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { assertTableStyle, modelTable, setTableWithObjectAttributes } from '../../_utils/utils';
import TablePropertiesEditing from '../../../src/tableproperties/tablepropertiesediting';
import TableBorderStyleCommand from '../../../src/tableproperties/commands/tableborderstylecommand';

describe( 'table properties', () => {
	describe( 'commands', () => {
		describe( 'TableBorderStyleCommand', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TablePropertiesEditing ]
				} );

				model = editor.model;
				command = new TableBorderStyleCommand( editor );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'isEnabled', () => {
				describe( 'collapsed selection', () => {
					it( 'should be false if selection does not have table', () => {
						setData( model, '<paragraph>foo[]</paragraph>' );
						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true is selection has table', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );
						expect( command.isEnabled ).to.be.true;
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );
						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true is selection has table', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ] ) );
						expect( command.isEnabled ).to.be.true;
					} );
				} );
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table has no borderStyle property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table has borderStyle property (single string)', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { borderStyle: 'ridge' } ) );

						expect( command.value ).to.equal( 'ridge' );
					} );

					it( 'should be set if selected table has borderStyle property object with same values', () => {
						setTableWithObjectAttributes( model, {
							borderStyle: {
								top: 'ridge',
								right: 'ridge',
								bottom: 'ridge',
								left: 'ridge'
							}
						}, '[]foo' );
						expect( command.value ).to.equal( 'ridge' );
					} );

					it( 'should be undefined if selected table has borderStyle property object with different values', () => {
						setTableWithObjectAttributes( model, {
							borderStyle: {
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
					it( 'should be false if selection does not have table', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be true is selection has table', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { borderStyle: 'ridge' } ) );

						expect( command.value ).to.equal( 'ridge' );
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
					it( 'should set selected table borderStyle to a passed value', () => {
						setData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableStyle( editor, 'border-bottom:solid;border-left:solid;border-right:solid;border-top:solid;' );
					} );

					it( 'should change selected table borderStyle to a passed value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { borderStyle: 'ridge' } ) );

						command.execute( { value: 'solid' } );

						assertTableStyle( editor, 'border-bottom:solid;border-left:solid;border-right:solid;border-top:solid;' );
					} );

					it( 'should remove borderStyle from a selected table if no value is passed', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { borderStyle: 'ridge' } ) );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should set selected table borderStyle to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableStyle( editor, 'border-bottom:solid;border-left:solid;border-right:solid;border-top:solid;' );
					} );

					it( 'should change selected table borderStyle to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableStyle( editor, 'border-bottom:solid;border-left:solid;border-right:solid;border-top:solid;' );
					} );

					it( 'should remove borderStyle from a selected table if no value is passed', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );
			} );
		} );
	} );
} );
