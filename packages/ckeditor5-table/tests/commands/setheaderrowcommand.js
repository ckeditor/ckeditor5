/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import SetHeaderRowCommand from '../../src/commands/setheaderrowcommand';

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

describe( 'HeaderRowCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ TableUtils ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new SetHeaderRowCommand( editor );

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

	describe( 'isEnabled', () => {
		it( 'should be false if selection is not in a table', () => {
			setData( model, '<p>foo[]</p>' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true if selection is in table', () => {
			setData( model, '<table><tableRow><tableCell>foo[]</tableCell></tableRow></table>' );
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
	} );

	describe( 'execute()', () => {
		it( 'should set heading rows attribute that cover row in which is selection', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should toggle heading rows attribute', () => {
			setData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			], { headingRows: 1 } ) );

			command.execute();

			setData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should set heading rows attribute if currently selected row is a heading so the heading section is below this row', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			], { headingRows: 2 } ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should fix rowspaned cells on the edge of an table head section', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, rowspan: 2, contents: '10[]' }, '12' ],
				[ '22' ]
			], { headingColumns: 2, headingRows: 1 } ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
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
				[ { rowspan: 2, contents: '[]00' }, '01' ],
				[ '11' ]
			], { headingRows: 2 } ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '[]00', '01' ],
				[ '', '11' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should fix rowspaned cells inside a row', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, contents: '[]01' } ],
				[ '10' ]
			], { headingRows: 2 } ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '[]01' ],
				[ '10', '' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should work properly in the first row of a table', () => {
			setData( model, modelTable( [
				[ '00', '[]01', '02' ],
				[ { colspan: 2, rowspan: 2, contents: '10' }, '12' ],
				[ '22' ]
			] ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '[]01', '02' ],
				[ { colspan: 2, rowspan: 2, contents: '10' }, '12' ],
				[ '22' ]
			], { headingRows: 1 } ) );
		} );
	} );
} );
