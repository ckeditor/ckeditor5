/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { assertTableStyle, modelTable } from '../../_utils/utils';
import TablePropertiesEditing from '../../../src/tableproperties/tablepropertiesediting';
import TableAlignmentCommand from '../../../src/tableproperties/commands/tablealignmentcommand';

describe( 'table properties', () => {
	describe( 'commands', () => {
		describe( 'TableAlignmentCommand', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TablePropertiesEditing ]
				} );

				model = editor.model;
				command = new TableAlignmentCommand( editor, 'center' );
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
					it( 'should be set if selected table has alignment property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableAlignment: 'left' } ) );

						expect( command.value ).to.equal( 'left' );
					} );

					it( 'should be undefined if selected table has set the default value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableAlignment: 'center' } ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be undefined if selected table has no alignment property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be false if selection does not have table', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be undefined if selected table has set the default value', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { tableAlignment: 'center' } ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be true is selection has table', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { tableAlignment: 'left' } ) );

						expect( command.value ).to.equal( 'left' );
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
					it( 'should set selected table alignment to a passed value', () => {
						setData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: 'right' } );

						assertTableStyle( editor, null, 'float:right;' );
					} );

					it( 'should change selected table alignment to a passed value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableAlignment: 'center' } ) );

						command.execute( { value: 'right' } );

						assertTableStyle( editor, null, 'float:right;' );
					} );

					it( 'should remove alignment from a selected table if no value is passed', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableAlignment: 'center' } ) );

						command.execute();

						assertTableStyle( editor, '' );
					} );

					it( 'should not set alignment in a selected table if passed the default value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						command.execute( { value: 'center' } );

						assertTableStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should set selected table alignment to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'right' } );

						assertTableStyle( editor, null, 'float:right;' );
					} );

					it( 'should change selected table alignment to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'right' } );

						assertTableStyle( editor, null, 'float:right;' );
					} );

					it( 'should remove alignment from a selected table if no value is passed', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute();

						assertTableStyle( editor, '' );
					} );

					it( 'should not set alignment in a selected table if passed the default value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'center' } );

						assertTableStyle( editor, '' );
					} );
				} );
			} );
		} );
	} );
} );
