/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import RemoveColumnCommand from '../../src/commands/removecolumncommand';
import {
	downcastInsertCell,
	downcastInsertRow,
	downcastInsertTable,
	downcastRemoveRow,
	downcastTableHeadingColumnsChange,
	downcastTableHeadingRowsChange
} from '../../src/converters/downcast';
import upcastTable from '../../src/converters/upcasttable';
import { formatTable, formattedModelTable, modelTable } from '../_utils/utils';
import TableUtils from '../../src/tableutils';

describe( 'RemoveColumnCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ TableUtils ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new RemoveColumnCommand( editor );

				const conversion = editor.conversion;
				const schema = model.schema;

				schema.register( 'table', {
					allowWhere: '$block',
					allowAttributes: [ 'headingRows', 'headingColumns' ],
					isObject: true
				} );

				schema.register( 'tableRow', { allowIn: 'table' } );

				schema.register( 'tableCell', {
					allowIn: 'tableRow',
					allowContentOf: '$block',
					allowAttributes: [ 'colspan', 'rowspan' ],
					isLimit: true
				} );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );

				// Table conversion.
				conversion.for( 'upcast' ).add( upcastTable() );
				conversion.for( 'downcast' ).add( downcastInsertTable() );

				// Insert row conversion.
				conversion.for( 'downcast' ).add( downcastInsertRow() );

				// Remove row conversion.
				conversion.for( 'downcast' ).add( downcastRemoveRow() );

				// Table cell conversion.
				conversion.for( 'downcast' ).add( downcastInsertCell() );

				conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'td' } ) );
				conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'th' } ) );

				// Table attributes conversion.
				conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
				conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );

				conversion.for( 'downcast' ).add( downcastTableHeadingColumnsChange() );
				conversion.for( 'downcast' ).add( downcastTableHeadingRowsChange() );
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

		it( 'should be false if selection is inside table with one column only', () => {
			setData( model, modelTable( [
				[ '00' ],
				[ '10[]' ],
				[ '20[]' ]
			] ) );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection is outside a table', () => {
			setData( model, '<p>11[]</p>' );

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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '02' ],
				[ '10[]', '12' ],
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ { colspan: 3, contents: '00' }, '03' ],
				[ { colspan: 2, contents: '10' }, '13' ],
				[ { colspan: 2, contents: '20[]' }, '23' ],
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ { colspan: 2, contents: '[]00' }, '03' ],
				[ '10', '13' ],
				[ '21', '22', '23' ]
			] ) );
		} );
	} );
} );
