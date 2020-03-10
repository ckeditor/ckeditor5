/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import SetHeaderRowCommand from '../../src/commands/setheaderrowcommand';
import { defaultConversion, defaultSchema, modelTable } from '../_utils/utils';
import TableSelection from '../../src/tableselection';
import TableUtils from '../../src/tableutils';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'SetHeaderRowCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ TableUtils, TableSelection ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new SetHeaderRowCommand( editor );

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

		it( 'should be true if multiple cells are selected', () => {
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

		it( 'should be true if multiple cells in a header row are selected', () => {
			setData( model, modelTable( [
				[ '01', '02', '03' ]
			], { headingRows: 1 } ) );

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
		it( 'should be false if selection is not in a table without heading row', () => {
			setData( model, modelTable( [
				[ '01[]', '02' ],
				[ '11', '12' ]
			] ) );

			expect( command.value ).to.be.false;
		} );

		it( 'should be false if selection is not in a heading row', () => {
			setData( model, modelTable( [
				[ '01', '02' ],
				[ '11', '12[]' ]
			], { headingRows: 1 } ) );

			expect( command.value ).to.be.false;
		} );

		it( 'should be true if selection is in a heading row', () => {
			setData( model, modelTable( [
				[ '01[]', '02' ],
				[ '11', '12' ]
			], { headingRows: 1 } ) );

			expect( command.value ).to.be.true;
		} );

		it( 'should be false if selection is in a heading column', () => {
			setData( model, modelTable( [
				[ '01', '02' ],
				[ '11[]', '12' ]
			], { headingRows: 1, headingColumns: 1 } ) );

			expect( command.value ).to.be.false;
		} );

		it( 'should be true if multiple header rows are selected', () => {
			setData( model, modelTable( [
				[ '01', '02' ],
				[ '11', '12' ]
			], { headingRows: 2 } ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			expect( command.value ).to.be.true;
		} );

		it( 'should be true if multiple header columns are selected in reversed order', () => {
			setData( model, modelTable( [
				[ '01', '02' ],
				[ '11', '12' ]
			], { headingRows: 2 } ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 1 ] )
			);

			expect( command.value ).to.be.true;
		} );

		it( 'should be false if only part of selected columns are headers', () => {
			setData( model, modelTable( [
				[ '01', '02' ],
				[ '11', '12' ]
			], { headingRows: 1 } ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection._setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 0 ] )
			);

			expect( command.value ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should set heading rows attribute that cover row in which is selection', () => {
			setData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should toggle heading rows attribute', () => {
			setData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 2 } ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 1 } ) );

			command.execute();

			setData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should set heading rows attribute if currently selected row is a heading so the heading section is below this row', () => {
			setData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 3 } ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should unsetset heading rows attribute', () => {
			setData( model, modelTable( [
				[ '[]00' ],
				[ '10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 3 } ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '[]00' ],
				[ '10' ],
				[ '20' ],
				[ '30' ]
			] ) );
		} );

		it( 'should respect forceValue parameter #1', () => {
			setData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 3 } ) );

			command.execute( { forceValue: true } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 3 } ) );
		} );

		it( 'should respect forceValue parameter #2', () => {
			setData( model, modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 1 } ) );

			command.execute( { forceValue: false } );

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00' ],
				[ '[]10' ],
				[ '20' ],
				[ '30' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should fix rowspaned cells on the edge of an table head section', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, rowspan: 2, contents: '10[]' }, '12' ],
				[ '22' ]
			], { headingColumns: 2, headingRows: 1 } ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, contents: '10[]' }, '12' ],
				[ { colspan: 2, contents: '' }, '22' ]
			], { headingColumns: 2, headingRows: 2 } ) );
		} );

		it( 'should split to at most 2 table cells when fixing rowspaned cells on the edge of an table head section', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, rowspan: 5, contents: '10' }, '12' ],
				[ '22[]' ],
				[ '32' ],
				[ '42' ],
				[ '52' ]
			], { headingColumns: 2, headingRows: 1 } ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, rowspan: 2, contents: '10' }, '12' ],
				[ '22[]' ],
				[ { colspan: 2, rowspan: 3, contents: '' }, '32' ],
				[ '42' ],
				[ '52' ]
			], { headingColumns: 2, headingRows: 3 } ) );
		} );

		it( 'should fix rowspaned cells on the edge of an table head section when creating section', () => {
			setData( model, modelTable( [
				[ { rowspan: 2, contents: '00' }, '01' ],
				[ '[]11' ]
			], { headingRows: 2 } ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01' ],
				[ '', '[]11' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should fix rowspaned cells inside a row', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, contents: '01' } ],
				[ '[]10' ]
			], { headingRows: 2 } ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01' ],
				[ '[]10', '' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should work properly in the first row of a table', () => {
			setData( model, modelTable( [
				[ '00', '[]01', '02' ],
				[ { colspan: 2, rowspan: 2, contents: '10' }, '12' ],
				[ '22' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '[]01', '02' ],
				[ { colspan: 2, rowspan: 2, contents: '10' }, '12' ],
				[ '22' ]
			], { headingRows: 1 } ) );
		} );
	} );
} );
