/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { assertTableStyle, modelTable, setTableWithObjectAttributes } from '../../_utils/utils';
import TablePropertiesEditing from '../../../src/tableproperties/tablepropertiesediting';
import TableBorderWidthCommand from '../../../src/tableproperties/commands/tableborderwidthcommand';

describe( 'table properties', () => {
	describe( 'commands', () => {
		describe( 'TableBorderWidthCommand', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TablePropertiesEditing ]
				} );

				model = editor.model;
				command = new TableBorderWidthCommand( editor );
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
					it( 'should be undefined if selected table has no borderWidth property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table has borderWidth property (single string)', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { borderWidth: '2em' } ) );

						expect( command.value ).to.equal( '2em' );
					} );

					it( 'should be set if selected table has borderWidth property object with same values', () => {
						setTableWithObjectAttributes( model, {
							borderWidth: {
								top: '2em',
								right: '2em',
								bottom: '2em',
								left: '2em'
							}
						}, '[]foo' );
						expect( command.value ).to.equal( '2em' );
					} );

					it( 'should be undefined if selected table has borderWidth property object with different values', () => {
						setTableWithObjectAttributes( model, {
							borderWidth: {
								top: '2em',
								right: '333px',
								bottom: '2em',
								left: '2em'
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
						setData( model, modelTable( [ [ 'f[o]o' ] ], { borderWidth: '2em' } ) );

						expect( command.value ).to.equal( '2em' );
					} );
				} );
			} );

			describe( 'execute()', () => {
				it( 'should use provided batch', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );
					const batch = model.createBatch();
					const spy = sinon.spy( model, 'enqueueChange' );

					command.execute( { value: '1px', batch } );
					sinon.assert.calledWith( spy, batch );
				} );

				it( 'should add default unit for numeric values (number passed)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: 25 } );

					assertTableStyle( editor, 'border-bottom:25px;border-left:25px;border-right:25px;border-top:25px;' );
				} );

				it( 'should add default unit for numeric values (string passed)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: 25 } );

					assertTableStyle( editor, 'border-bottom:25px;border-left:25px;border-right:25px;border-top:25px;' );
				} );

				it( 'should not add default unit for numeric values with unit', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: '25pt' } );

					assertTableStyle( editor, 'border-bottom:25pt;border-left:25pt;border-right:25pt;border-top:25pt;' );
				} );

				it( 'should add default unit to floats (number passed)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: 25.1 } );

					assertTableStyle( editor, 'border-bottom:25.1px;border-left:25.1px;border-right:25.1px;border-top:25.1px;' );
				} );

				it( 'should add default unit to floats (string passed)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: '0.1' } );

					assertTableStyle( editor, 'border-bottom:0.1px;border-left:0.1px;border-right:0.1px;border-top:0.1px;' );
				} );

				it( 'should pass invalid values', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: 'bar' } );

					assertTableStyle( editor, 'border-bottom:bar;border-left:bar;border-right:bar;border-top:bar;' );
				} );

				it( 'should pass invalid value (string passed, CSS float without leading 0)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: '.2' } );

					assertTableStyle( editor, 'border-bottom:.2;border-left:.2;border-right:.2;border-top:.2;' );
				} );

				describe( 'collapsed selection', () => {
					it( 'should set selected table borderWidth to a passed value', () => {
						setData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: '1px' } );

						assertTableStyle( editor, 'border-bottom:1px;border-left:1px;border-right:1px;border-top:1px;' );
					} );

					it( 'should change selected table borderWidth to a passed value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { borderWidth: '2em' } ) );

						command.execute( { value: '1px' } );

						assertTableStyle( editor, 'border-bottom:1px;border-left:1px;border-right:1px;border-top:1px;' );
					} );

					it( 'should remove borderWidth from a selected table if no value is passed', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { borderWidth: '2em' } ) );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should set selected table borderWidth to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '1px' } );

						assertTableStyle( editor, 'border-bottom:1px;border-left:1px;border-right:1px;border-top:1px;' );
					} );

					it( 'should change selected table borderWidth to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '1px' } );

						assertTableStyle( editor, 'border-bottom:1px;border-left:1px;border-right:1px;border-top:1px;' );
					} );

					it( 'should remove borderWidth from a selected table if no value is passed', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );
			} );
		} );
	} );
} );
