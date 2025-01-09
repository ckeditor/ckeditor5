/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { assertTableStyle, modelTable } from '../../_utils/utils.js';
import TablePropertiesEditing from '../../../src/tableproperties/tablepropertiesediting.js';
import TableBackgroundColorCommand from '../../../src/tableproperties/commands/tablebackgroundcolorcommand.js';

describe( 'table properties', () => {
	describe( 'commands', () => {
		describe( 'TableBackgroundColorCommand: empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TablePropertiesEditing ]
				} );

				model = editor.model;
				command = new TableBackgroundColorCommand( editor, '' );
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
					it( 'should be false if selection in not in table', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );
						expect( command.isEnabled ).to.be.false;
					} );

					it( 'should be true is selection is in table', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ] ) );
						expect( command.isEnabled ).to.be.true;
					} );

					it( 'should be true is selection is over table', () => {
						setData( model, '[' + modelTable( [ [ 'foo' ] ] ) + ']' );
						expect( command.isEnabled ).to.be.true;
					} );
				} );
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table has no backgroundColor property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table has backgroundColor property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableBackgroundColor: 'blue' } ) );

						expect( command.value ).to.equal( 'blue' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be undefined if selection is in table', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set is selection is in table', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { tableBackgroundColor: 'blue' } ) );

						expect( command.value ).to.equal( 'blue' );
					} );

					it( 'should be set is selection is over table', () => {
						setData( model, '[' + modelTable( [ [ 'foo' ] ], { tableBackgroundColor: 'blue' } ) + ']' );

						expect( command.value ).to.equal( 'blue' );
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
					it( 'should set selected table backgroundColor to a passed value', () => {
						setData( model, modelTable( [ [ 'foo[]' ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableStyle( editor, 'background-color:#f00;' );
					} );

					it( 'should change selected table backgroundColor to a passed value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableBackgroundColor: 'blue' } ) );

						command.execute( { value: '#f00' } );

						assertTableStyle( editor, 'background-color:#f00;' );
					} );

					it( 'should remove backgroundColor from a selected table if no value is passed', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableBackgroundColor: 'blue' } ) );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection (inside table)', () => {
					it( 'should set selected table backgroundColor to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableStyle( editor, 'background-color:#f00;' );
					} );

					it( 'should change selected table backgroundColor to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: '#f00' } );

						assertTableStyle( editor, 'background-color:#f00;' );
					} );

					it( 'should remove backgroundColor from a selected table if no value is passed', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection (over table)', () => {
					it( 'should set selected table backgroundColor to a passed value', () => {
						setData( model, '[' + modelTable( [ [ 'foo' ] ] ) + ']' );

						command.execute( { value: '#f00' } );

						assertTableStyle( editor, 'background-color:#f00;' );
					} );

					it( 'should change selected table backgroundColor to a passed value', () => {
						setData( model, '[' + modelTable( [ [ 'foo' ] ] ) + ']' );

						command.execute( { value: '#f00' } );

						assertTableStyle( editor, 'background-color:#f00;' );
					} );

					it( 'should remove backgroundColor from a selected table if no value is passed', () => {
						setData( model, '[' + modelTable( [ [ 'foo' ] ] ) + ']' );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );
			} );
		} );

		describe( 'TableBackgroundColorCommand: non-empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TablePropertiesEditing ]
				} );

				model = editor.model;
				command = new TableBackgroundColorCommand( editor, 'red' );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table has set the default value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableBackgroundColor: 'red' } ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table has backgroundColor property other than the default value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableBackgroundColor: 'blue' } ) );

						expect( command.value ).to.equal( 'blue' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be undefined if selected table has set the default value', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { tableBackgroundColor: 'red' } ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table has backgroundColor property other than the default value', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { tableBackgroundColor: 'blue' } ) );

						expect( command.value ).to.equal( 'blue' );
					} );
				} );
			} );

			describe( 'execute()', () => {
				describe( 'collapsed selection', () => {
					it( 'should remove backgroundColor from a selected table if passed the default value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableBackgroundColor: 'blue' } ) );

						command.execute( { value: 'red' } );

						assertTableStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should remove backgroundColor from a selected table if passed the default value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ], { tableBackgroundColor: 'blue' } ) );

						command.execute( { value: 'red' } );

						assertTableStyle( editor, '' );
					} );
				} );
			} );
		} );
	} );
} );
