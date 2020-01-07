/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import InsertColumnCommand from '../../src/commands/insertcolumncommand';
import { defaultConversion, defaultSchema, formatTable, formattedModelTable, modelTable } from '../_utils/utils';
import TableUtils from '../../src/tableutils';

describe( 'InsertColumnCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ TableUtils ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'order=right', () => {
		beforeEach( () => {
			command = new InsertColumnCommand( editor );
		} );

		describe( 'isEnabled', () => {
			it( 'should be false if wrong node', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );
				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if in table', () => {
				setData( model, modelTable( [ [ '[]' ] ] ) );
				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should insert column in given table to the right of the selection\'s column', () => {
				setData( model, modelTable( [
					[ '11[]', '12' ],
					[ '21', '22' ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '11[]', '', '12' ],
					[ '21', '', '22' ]
				] ) );
			} );

			it( 'should insert column in given table to the right of the selection\'s column (selection in block content)', () => {
				setData( model, modelTable( [
					[ '11', '<paragraph>12[]</paragraph>', '13' ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '<paragraph>12[]</paragraph>', '', '13' ]
				] ) );
			} );

			it( 'should insert columns at table end', () => {
				setData( model, modelTable( [
					[ '11', '12' ],
					[ '21', '22[]' ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '12', '' ],
					[ '21', '22[]', '' ]
				] ) );
			} );

			it( 'should update table heading columns attribute when inserting column in headings section', () => {
				setData( model, modelTable( [
					[ '11[]', '12' ],
					[ '21', '22' ],
					[ '31', '32' ]
				], { headingColumns: 2 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '11[]', '', '12' ],
					[ '21', '', '22' ],
					[ '31', '', '32' ]
				], { headingColumns: 3 } ) );
			} );

			it( 'should not update table heading columns attribute when inserting column after headings section', () => {
				setData( model, modelTable( [
					[ '11', '12[]', '13' ],
					[ '21', '22', '23' ],
					[ '31', '32', '33' ]
				], { headingColumns: 2 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '12[]', '', '13' ],
					[ '21', '22', '', '23' ],
					[ '31', '32', '', '33' ]
				], { headingColumns: 2 } ) );
			} );

			it( 'should skip spanned columns', () => {
				setData( model, modelTable( [
					[ '11[]', '12' ],
					[ { colspan: 2, contents: '21' } ],
					[ '31', '32' ]
				], { headingColumns: 2 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '11[]', '', '12' ],
					[ { colspan: 3, contents: '21' } ],
					[ '31', '', '32' ]
				], { headingColumns: 3 } ) );
			} );

			it( 'should skip wide spanned columns', () => {
				setData( model, modelTable( [
					[ '11', '12[]', '13', '14', '15' ],
					[ '21', '22', { colspan: 2, contents: '23' }, '25' ],
					[ { colspan: 4, contents: '31' }, { colspan: 2, contents: '34' } ]
				], { headingColumns: 4 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '12[]', '', '13', '14', '15' ],
					[ '21', '22', '', { colspan: 2, contents: '23' }, '25' ],
					[ { colspan: 5, contents: '31' }, { colspan: 2, contents: '34' } ]
				], { headingColumns: 5 } ) );
			} );
		} );
	} );

	describe( 'order=left', () => {
		beforeEach( () => {
			command = new InsertColumnCommand( editor, { order: 'left' } );
		} );

		describe( 'isEnabled', () => {
			it( 'should be false if wrong node', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );
				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if in table', () => {
				setData( model, modelTable( [ [ '[]' ] ] ) );
				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should insert column in given table to the left of the selection\'s column', () => {
				setData( model, modelTable( [
					[ '11', '12[]' ],
					[ '21', '22' ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '', '12[]' ],
					[ '21', '', '22' ]
				] ) );
			} );

			it( 'should insert column in given table to the left of the selection\'s column (selection in block content)', () => {
				setData( model, modelTable( [
					[ '11', '<paragraph>12[]</paragraph>', '13' ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '', '<paragraph>12[]</paragraph>', '13' ]
				] ) );
			} );

			it( 'should insert columns at the table start', () => {
				setData( model, modelTable( [
					[ '11', '12' ],
					[ '[]21', '22' ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '', '11', '12' ],
					[ '', '[]21', '22' ]
				] ) );
			} );

			it( 'should update table heading columns attribute when inserting column in headings section', () => {
				setData( model, modelTable( [
					[ '11', '12[]' ],
					[ '21', '22' ],
					[ '31', '32' ]
				], { headingColumns: 2 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '', '12[]' ],
					[ '21', '', '22' ],
					[ '31', '', '32' ]
				], { headingColumns: 3 } ) );
			} );

			it( 'should not update table heading columns attribute when inserting column after headings section', () => {
				setData( model, modelTable( [
					[ '11', '12', '13[]' ],
					[ '21', '22', '23' ],
					[ '31', '32', '33' ]
				], { headingColumns: 2 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '12', '', '13[]' ],
					[ '21', '22', '', '23' ],
					[ '31', '32', '', '33' ]
				], { headingColumns: 2 } ) );
			} );

			it( 'should skip spanned columns', () => {
				setData( model, modelTable( [
					[ '11', '12[]' ],
					[ { colspan: 2, contents: '21' } ],
					[ '31', '32' ]
				], { headingColumns: 2 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '', '12[]' ],
					[ { colspan: 3, contents: '21' } ],
					[ '31', '', '32' ]
				], { headingColumns: 3 } ) );
			} );

			it( 'should skip wide spanned columns', () => {
				setData( model, modelTable( [
					[ '11', '12', '13[]', '14', '15' ],
					[ '21', '22', { colspan: 2, contents: '23' }, '25' ],
					[ { colspan: 4, contents: '31' }, { colspan: 2, contents: '34' } ]
				], { headingColumns: 4 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '12', '', '13[]', '14', '15' ],
					[ '21', '22', '', { colspan: 2, contents: '23' }, '25' ],
					[ { colspan: 5, contents: '31' }, { colspan: 2, contents: '34' } ]
				], { headingColumns: 5 } ) );
			} );
		} );
	} );
} );
