/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import SetHeaderColumnCommand from '../../src/commands/setheadercolumncommand';
import { defaultConversion, defaultSchema, modelTable } from '../_utils/utils';
import TableSelection from '../../src/tableselection';
import TableUtils from '../../src/tableutils';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'SetHeaderColumnCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ TableUtils, TableSelection ]
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

		it( 'should be true if multiple columns are selected', () => {
			setData( model, modelTable( [
				[ '01', '02', '03' ]
			] ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 1 ] )
			);

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if multiple header columns are selected', () => {
			setData( model, modelTable( [
				[ '01', '02', '03' ]
			], { headingColumns: 2 } ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 1 ] )
			);

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

		it( 'should be true if multiple header columns are selected', () => {
			setData( model, modelTable( [
				[ '01', '02', '03' ]
			], { headingColumns: 2 } ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 1 ] )
			);

			expect( command.value ).to.be.true;
		} );

		it( 'should be true if multiple header columns are selected in reversed order', () => {
			setData( model, modelTable( [
				[ '01', '02', '03' ]
			], { headingColumns: 2 } ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 0 ] )
			);

			expect( command.value ).to.be.true;
		} );

		it( 'should be false if selection is in a heading row', () => {
			setData( model, modelTable( [
				[ '01', '02[]' ],
				[ '11', '12' ]
			], { headingRows: 1, headingColumns: 1 } ) );

			expect( command.value ).to.be.false;
		} );

		it( 'should be false if only part of selected columns are headers', () => {
			setData( model, modelTable( [
				[ '01', '02', '03', '04' ]
			], { headingColumns: 2 } ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 2 ] )
			);

			expect( command.value ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should set heading columns attribute that cover column in which is selection', () => {
			setData( model, modelTable( [
				[ '00', '01[]', '02', '03' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 2 } ) );
		} );

		it( 'should set heading columns attribute below current selection column', () => {
			setData( model, modelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 3 } ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 1 } ) );
		} );

		it( 'should toggle of selected column', () => {
			setData( model, modelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 2 } ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 1 } ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 2 } ) );
		} );

		it( 'should respect forceValue parameter #1', () => {
			setData( model, modelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 3 } ) );

			command.execute( { forceValue: true } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 3 } ) );
		} );

		it( 'should respect forceValue parameter #2', () => {
			setData( model, modelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 1 } ) );

			command.execute( { forceValue: false } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01[]', '02', '03' ]
			], { headingColumns: 1 } ) );
		} );
	} );
} );
