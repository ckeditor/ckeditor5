/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import RemoveColumnCommand from '../../src/commands/removecolumncommand';
import TableSelection from '../../src/tableselection';
import { defaultConversion, defaultSchema, modelTable } from '../_utils/utils';
import TableUtils from '../../src/tableutils';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'RemoveColumnCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ TableUtils, TableSelection ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new RemoveColumnCommand( editor );

				defaultSchema( model.schema );
				defaultConversion( editor.conversion );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true if selection is inside table cell', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10', '11' ]
			] ) );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if selection contains multiple cells', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			] ) );

			const tableSelection = editor.plugins.get( TableSelection );
			const modelRoot = model.document.getRoot();
			tableSelection.startSelectingFrom( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
			tableSelection.setSelectingTo( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if selection is inside table with one column only', () => {
			setData( model, modelTable( [
				[ '00' ],
				[ '10[]' ],
				[ '20[]' ]
			] ) );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection is outside a table', () => {
			setData( model, '<paragraph>11[]</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should remove a given column', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '[]11', '12' ],
				[ '20', '21', '22' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '02' ],
				[ '10', '[]12' ],
				[ '20', '22' ]
			] ) );
		} );

		it( 'should remove a given column from a table start', () => {
			setData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '[]01' ],
				[ '11' ],
				[ '21' ]
			] ) );
		} );

		it( 'should change heading columns if removing a heading column', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			], { headingColumns: 2 } ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '01' ],
				[ '[]11' ],
				[ '21' ]
			], { headingColumns: 1 } ) );
		} );

		it( 'should decrease colspan of table cells from previous column', () => {
			setData( model, modelTable( [
				[ { colspan: 4, contents: '00' }, '03' ],
				[ { colspan: 3, contents: '10' }, '13' ],
				[ { colspan: 2, contents: '20' }, '22[]', '23' ],
				[ '30', { colspan: 2, contents: '31' }, '33' ],
				[ '40', '41', '42', '43' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 3, contents: '00' }, '03' ],
				[ { colspan: 2, contents: '10' }, '13' ],
				[ { colspan: 2, contents: '20' }, '[]23' ],
				[ '30', '31', '33' ],
				[ '40', '41', '43' ]

			] ) );
		} );

		it( 'should decrease colspan of cells that are on removed column', () => {
			setData( model, modelTable( [
				[ { colspan: 3, contents: '[]00' }, '03' ],
				[ { colspan: 2, contents: '10' }, '13' ],
				[ '20', '21', '22', '23' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ { colspan: 2, contents: '[]00' }, '03' ],
				[ '10', '13' ],
				[ '21', '22', '23' ]
			] ) );
		} );

		it( 'should move focus to previous column of removed cell if in last column', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12[]' ],
				[ '20', '21', '22' ]
			] ) );

			command.execute();

			assertEqualMarkup( getData( model ), modelTable( [
				[ '00', '01' ],
				[ '10', '[]11' ],
				[ '20', '21' ]
			] ) );
		} );
	} );
} );
