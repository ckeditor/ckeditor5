/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import SetHeaderColumnCommand from '../../src/commands/setheadercolumncommand';
import { defaultConversion, defaultSchema, formatTable, formattedModelTable, modelTable } from '../_utils/utils';
import TableUtils from '../../src/tableutils';

describe( 'SetHeaderColumnCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ TableUtils ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new SetHeaderColumnCommand( editor );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be false if selection is not in a table', () => {
			setData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true if selection is in table', () => {
			setData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );
			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'value', () => {
		it( 'should be false if selection is not in a heading column', () => {
			setData( model, modelTable( [
				[ '01', '02' ],
				[ '11', '12[]' ]
			], { headingColumns: 1 } ) );

			expect( command.value ).to.be.false;
		} );

		it( 'should be true if selection is in a heading column', () => {
			setData( model, modelTable( [
				[ '01[]', '02' ],
				[ '11', '12' ]
			], { headingColumns: 1 } ) );

			expect( command.value ).to.be.true;
		} );

		it( 'should be false if selection is in a heading row', () => {
			setData( model, modelTable( [
				[ '01', '02[]' ],
				[ '11', '12' ]
			], { headingRows: 1, headingColumns: 1 } ) );

			expect( command.value ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should set heading columns attribute that cover column in which is selection', () => {
			setData( model, modelTable( [
				[ '00', '01[]', '02', '03' ]
			] ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 2 } ) );
		} );

		it( 'should set heading columns attribute below current selection column', () => {
			setData( model, modelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 3 } ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 1 } ) );
		} );

		it( 'should toggle of selected column', () => {
			setData( model, modelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 2 } ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 1 } ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 2 } ) );
		} );

		it( 'should respect forceValue parameter #1', () => {
			setData( model, modelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 3 } ) );

			command.execute( true );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 3 } ) );
		} );

		it( 'should respect forceValue parameter #2', () => {
			setData( model, modelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 1 } ) );

			command.execute( false );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 1 } ) );
		} );
	} );
} );
