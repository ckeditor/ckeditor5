/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { assertTableStyle, modelTable } from '../../_utils/utils';
import TablePropertiesEditing from '../../../src/tableproperties/tablepropertiesediting';
import TableHeightCommand from '../../../src/tableproperties/commands/tableheightcommand';

describe( 'table properties', () => {
	describe( 'commands', () => {
		describe( 'TableHeightCommand: empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TablePropertiesEditing ]
				} );

				model = editor.model;
				command = new TableHeightCommand( editor, '' );
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
					it( 'should be undefined if selected table has no height property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table has height property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableHeight: '100px' } ) );

						expect( command.value ).to.equal( '100px' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be true is selection has table', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { tableHeight: '100px' } ) );

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

					assertTableStyle( editor, null, 'height:25px;' );
				} );

				it( 'should add default unit for numeric values (string passed)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: 25 } );

					assertTableStyle( editor, null, 'height:25px;' );
				} );

				it( 'should not add default unit for numeric values with unit', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: '25pt' } );

					assertTableStyle( editor, null, 'height:25pt;' );
				} );

				it( 'should add default unit to floats (number passed)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: 25.1 } );

					assertTableStyle( editor, null, 'height:25.1px;' );
				} );

				it( 'should add default unit to floats (string passed)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: '0.1' } );

					assertTableStyle( editor, null, 'height:0.1px;' );
				} );

				it( 'should pass invalid values', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: 'bar' } );

					assertTableStyle( editor, null, 'height:bar;' );
				} );

				it( 'should pass invalid value (string passed, CSS float without leading 0)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: '.2' } );

					assertTableStyle( editor, null, 'height:.2;' );
				} );

				describe( 'collapsed selection', () => {
					it( 'should set selected table height to a passed value', () => {
						setData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: '25px' } );

						assertTableStyle( editor, null, 'height:25px;' );
					} );

					it( 'should change selected table height to a passed value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableHeight: '100px' } ) );

						command.execute( { value: '25px' } );

						assertTableStyle( editor, null, 'height:25px;' );
					} );

					it( 'should remove height from a selected table if no value is passed', () => {
						setData( model, modelTable( [ [ { tableHeight: '100px', contents: '[]foo' } ] ] ) );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should set selected table height to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '25px' } );

						assertTableStyle( editor, null, 'height:25px;' );
					} );

					it( 'should change selected table height to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '25px' } );

						assertTableStyle( editor, null, 'height:25px;' );
					} );

					it( 'should remove height from a selected table if no value is passed', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );
			} );
		} );

		describe( 'TableHeightCommand: non-empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TablePropertiesEditing ]
				} );

				model = editor.model;
				command = new TableHeightCommand( editor, '300px' );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table has set the default value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableHeight: '300px' } ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table has height property other than the default value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableHeight: '100px' } ) );

						expect( command.value ).to.equal( '100px' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be undefined if selected table has set the default value', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { tableHeight: '300px' } ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table has height property other than the default value', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { tableHeight: '100px' } ) );

						expect( command.value ).to.equal( '100px' );
					} );
				} );
			} );

			describe( 'execute()', () => {
				describe( 'collapsed selection', () => {
					it( 'should remove height from a selected table if passed the default value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableHeight: '100px' } ) );

						command.execute( { value: '300px' } );

						assertTableStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should remove height from a selected table if passed the default value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ], { tableHeight: '100px' } ) );

						command.execute( { value: '300px' } );

						assertTableStyle( editor, '' );
					} );
				} );
			} );
		} );
	} );
} );
