/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { assertTableStyle, modelTable, setTableWithObjectAttributes } from '../../_utils/utils.js';
import TablePropertiesEditing from '../../../src/tableproperties/tablepropertiesediting.js';
import TableBorderStyleCommand from '../../../src/tableproperties/commands/tableborderstylecommand.js';

describe( 'table properties', () => {
	describe( 'commands', () => {
		describe( 'TableBorderStyleCommand: empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TablePropertiesEditing ]
				} );

				model = editor.model;
				command = new TableBorderStyleCommand( editor, '' );
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

					it( 'should be true if selection is in table', () => {
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
					it( 'should be undefined if selected table has no borderStyle property', () => {
						setData( model, modelTable( [ [ '[]foo' ] ] ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table has borderStyle property (single string)', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableBorderStyle: 'ridge' } ) );

						expect( command.value ).to.equal( 'ridge' );
					} );

					it( 'should be set if selected table has borderStyle property object with same values', () => {
						setTableWithObjectAttributes( model, {
							tableBorderStyle: {
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
							tableBorderStyle: {
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
					it( 'should be undefined if selection does not have table', () => {
						setData( model, '<paragraph>f[oo]</paragraph>' );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selection is inside table', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { tableBorderStyle: 'ridge' } ) );

						expect( command.value ).to.equal( 'ridge' );
					} );

					it( 'should be set id selection is over table', () => {
						setData( model, '[' + modelTable( [ [ 'foo' ] ], { tableBorderStyle: 'ridge' } ) + ']' );

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

						assertTableStyle( editor, 'border-style:solid;' );
					} );

					it( 'should change selected table borderStyle to a passed value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableBorderStyle: 'ridge' } ) );

						command.execute( { value: 'solid' } );

						assertTableStyle( editor, 'border-style:solid;' );
					} );

					it( 'should remove borderStyle from a selected table if no value is passed', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableBorderStyle: 'ridge' } ) );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection (inside table)', () => {
					it( 'should set selected table borderStyle to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableStyle( editor, 'border-style:solid;' );
					} );

					it( 'should change selected table borderStyle to a passed value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute( { value: 'solid' } );

						assertTableStyle( editor, 'border-style:solid;' );
					} );

					it( 'should remove borderStyle from a selected table if no value is passed', () => {
						setData( model, modelTable( [ [ '[foo]' ] ] ) );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection (over table)', () => {
					it( 'should set selected table borderStyle to a passed value', () => {
						setData( model, '[' + modelTable( [ [ 'foo' ] ] ) + ']' );

						command.execute( { value: 'solid' } );

						assertTableStyle( editor, 'border-style:solid;' );
					} );

					it( 'should change selected table borderStyle to a passed value', () => {
						setData( model, '[' + modelTable( [ [ 'foo' ] ] ) + ']' );

						command.execute( { value: 'solid' } );

						assertTableStyle( editor, 'border-style:solid;' );
					} );

					it( 'should remove borderStyle from a selected table if no value is passed', () => {
						setData( model, '[' + modelTable( [ [ 'foo' ] ] ) + ']' );

						command.execute();

						assertTableStyle( editor, '' );
					} );
				} );
			} );
		} );

		describe( 'TableBorderStyleCommand: non-empty default value', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor.create( {
					plugins: [ Paragraph, TablePropertiesEditing ]
				} );

				model = editor.model;
				command = new TableBorderStyleCommand( editor, 'none' );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'value', () => {
				describe( 'collapsed selection', () => {
					it( 'should be undefined if selected table has set the default value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableBorderStyle: 'none' } ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table has borderStyle property other than the default value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableBorderStyle: 'solid' } ) );

						expect( command.value ).to.equal( 'solid' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should be undefined if selected table has set the default value', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { tableBorderStyle: 'none' } ) );

						expect( command.value ).to.be.undefined;
					} );

					it( 'should be set if selected table has borderStyle property other than the default value', () => {
						setData( model, modelTable( [ [ 'f[o]o' ] ], { tableBorderStyle: 'solid' } ) );

						expect( command.value ).to.equal( 'solid' );
					} );
				} );
			} );

			describe( 'execute()', () => {
				describe( 'collapsed selection', () => {
					it( 'should remove borderStyle from a selected table if passed the default value', () => {
						setData( model, modelTable( [ [ '[]foo' ] ], { tableBorderStyle: 'solid' } ) );

						command.execute( { value: 'none' } );

						assertTableStyle( editor, '' );
					} );
				} );

				describe( 'non-collapsed selection', () => {
					it( 'should remove borderStyle from a selected table if passed the default value', () => {
						setData( model, modelTable( [ [ '[foo]' ] ], { tableBorderStyle: 'solid' } ) );

						command.execute( { value: 'none' } );

						assertTableStyle( editor, '' );
					} );
				} );
			} );
		} );
	} );
} );
