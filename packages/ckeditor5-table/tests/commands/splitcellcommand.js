/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import SplitCellCommand from '../../src/commands/splitcellcommand';
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

describe( 'SplitCellCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ TableUtils ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new SplitCellCommand( editor );

				const conversion = editor.conversion;
				const schema = model.schema;

				schema.register( 'table', {
					allowWhere: '$block',
					allowAttributes: [ 'headingRows' ],
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

	describe( 'direction=vertically', () => {
		beforeEach( () => {
			command = new SplitCellCommand( editor, { direction: 'vertically' } );
		} );

		describe( 'isEnabled', () => {
			it( 'should be true if in a table cell', () => {
				setData( model, modelTable( [
					[ '00[]' ]
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if not in cell', () => {
				setData( model, '<p>11[]</p>' );

				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should split table cell for two table cells', () => {
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '[]11', '12' ],
					[ '20', { colspan: 2, contents: '21' } ],
					[ { colspan: 2, contents: '30' }, '32' ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '00', { colspan: 2, contents: '01' }, '02' ],
					[ '10', '[]11', '', '12' ],
					[ '20', { colspan: 3, contents: '21' } ],
					[ { colspan: 3, contents: '30' }, '32' ]
				] ) );
			} );

			it( 'should unsplit table cell if split is equal to colspan', () => {
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', { colspan: 2, contents: '21[]' } ],
					[ { colspan: 2, contents: '30' }, '32' ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', '21[]', '' ],
					[ { colspan: 2, contents: '30' }, '32' ]
				] ) );
			} );

			it( 'should properly unsplit table cell if split is uneven', () => {
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ { colspan: 3, contents: '10[]' } ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '00', '01', '02' ],
					[ { colspan: 2, contents: '10[]' }, '' ]
				] ) );
			} );

			it( 'should properly set colspan of inserted cells', () => {
				setData( model, modelTable( [
					[ '00', '01', '02', '03' ],
					[ { colspan: 4, contents: '10[]' } ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '00', '01', '02', '03' ],
					[ { colspan: 2, contents: '10[]' }, { colspan: 2, contents: '' } ]
				] ) );
			} );

			it( 'should keep rowspan attribute for newly inserted cells', () => {
				setData( model, modelTable( [
					[ '00', '01', '02', '03', '04', '05' ],
					[ { colspan: 5, rowspan: 2, contents: '10[]' }, '15' ],
					[ '25' ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '00', '01', '02', '03', '04', '05' ],
					[ { colspan: 3, rowspan: 2, contents: '10[]' }, { colspan: 2, rowspan: 2, contents: '' }, '15' ],
					[ '25' ]
				] ) );
			} );
		} );
	} );

	describe( 'direction=horizontally', () => {
		beforeEach( () => {
			command = new SplitCellCommand( editor, { direction: 'horizontally' } );
		} );

		describe( 'isEnabled', () => {
			it( 'should be true if in a table cell', () => {
				setData( model, modelTable( [
					[ '00[]' ]
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if not in cell', () => {
				setData( model, '<p>11[]</p>' );

				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should split table cell for two table cells', () => {
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '[]11', '12' ],
					[ '20', '21', '22' ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '00', '01', '02' ],
					[ { rowspan: 2, contents: '10' }, '[]11', { rowspan: 2, contents: '12' } ],
					[ '' ],
					[ '20', '21', '22' ]
				] ) );
			} );
		} );
	} );
} );
