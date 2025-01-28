/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { assertTableStyle, modelTable } from '../../_utils/utils.js';
import TablePropertiesEditing from '../../../src/tableproperties/tablepropertiesediting.js';
import TableWidthCommand from '../../../src/tableproperties/commands/tablewidthcommand.js';

describe( 'table properties', () => {
	describe( 'commands', () => {
		describe( 'TableWidthCommand: empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TablePropertiesEditing ]
				} );

				model = editor.model;
				command = new TableWidthCommand( editor, '' );
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

					it( 'should be true if selection is inside table', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ] ) );
						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true if selection is over table', () => {
						setData( model, '[' + modelTable( [ [ 'foo' ] ] ) + ']' );
						expect( command.isEnabled ).to.be.true;
					} );
				} );
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table has no width property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table has width property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableWidth: '100px' } ) );

						expect( command.value ).to.equal( '100px' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be undefined if selection does not have table', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set is selection is inside table', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { tableWidth: '100px' } ) );

						expect( command.value ).to.equal( '100px' );
					} );

					it( 'should be set is selection is over table', () => {
						setData( model, '[' + modelTable( [ [ 'foo' ] ], { tableWidth: '100px' } ) + ']' );

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

					assertTableStyle( editor, null, 'width:25px;' );
				} );

				it( 'should add default unit for numeric values (string passed)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: 25 } );

					assertTableStyle( editor, null, 'width:25px;' );
				} );

				it( 'should not add default unit for numeric values with unit', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: '25pt' } );

					assertTableStyle( editor, null, 'width:25pt;' );
				} );

				it( 'should add default unit to floats (number passed)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: 25.1 } );

					assertTableStyle( editor, null, 'width:25.1px;' );
				} );

				it( 'should add default unit to floats (string passed)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: '0.1' } );

					assertTableStyle( editor, null, 'width:0.1px;' );
				} );

				it( 'should pass invalid values', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: 'bar' } );

					assertTableStyle( editor, null, 'width:bar;' );
				} );

				it( 'should pass invalid value (string passed, CSS float without leading 0)', () => {
					setData( model, modelTable( [ [ 'foo[]' ] ] ) );

					command.execute( { value: '.2' } );

					assertTableStyle( editor, null, 'width:.2;' );
				} );

				describe( 'collapsed selection', () => {
					it( 'should set selected table width to a passed value', () => {
						setData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: '25px' } );

						assertTableStyle( editor, null, 'width:25px;' );
					} );

					it( 'should change selected table width to a passed value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableWidth: '100px' } ) );

						command.execute( { value: '25px' } );

						assertTableStyle( editor, null, 'width:25px;' );
					} );

					it( 'should remove width from a selected table if no value is passed', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableWidth: '100px' } ) );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection (inside table)', () => {
					it( 'should set selected table width to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '25px' } );

						assertTableStyle( editor, null, 'width:25px;' );
					} );

					it( 'should change selected table width to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '25px' } );

						assertTableStyle( editor, null, 'width:25px;' );
					} );

					it( 'should remove width from a selected table if no value is passed', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection (over table)', () => {
					it( 'should set selected table width to a passed value', () => {
						setData( model, '[' + modelTable( [ [ 'foo' ] ] ) + ']' );

						command.execute( { value: '25px' } );

						assertTableStyle( editor, null, 'width:25px;' );
					} );

					it( 'should change selected table width to a passed value', () => {
						setData( model, '[' + modelTable( [ [ 'foo' ] ] ) + ']' );

						command.execute( { value: '25px' } );

						assertTableStyle( editor, null, 'width:25px;' );
					} );

					it( 'should remove width from a selected table if no value is passed', () => {
						setData( model, '[' + modelTable( [ [ 'foo' ] ] ) + ']' );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );
			} );
		} );

		describe( 'TableWidthCommand: non-empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TablePropertiesEditing ]
				} );

				model = editor.model;
				command = new TableWidthCommand( editor, '300px' );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table has set the default value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableWidth: '300px' } ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table has width property other than the default value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableWidth: '100px' } ) );

						expect( command.value ).to.equal( '100px' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be undefined if selected table has set the default value', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { tableWidth: '300px' } ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table has width property other than the default value', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { tableWidth: '100px' } ) );

						expect( command.value ).to.equal( '100px' );
					} );
				} );
			} );

			describe( 'execute()', () => {
				describe( 'collapsed selection', () => {
					it( 'should remove width from a selected table if passed the default value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableWidth: '100px' } ) );

						command.execute( { value: '300px' } );

						assertTableStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should remove width from a selected table if passed the default value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ], { tableWidth: '100px' } ) );

						command.execute( { value: '300px' } );

						assertTableStyle( editor, '' );
					} );
				} );
			} );
		} );
	} );
} );
