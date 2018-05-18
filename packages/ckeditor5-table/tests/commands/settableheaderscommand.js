/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import SetTableHeadersCommand from '../../src/commands/settableheaderscommand';
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

describe( 'SetTableHeadersCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new SetTableHeadersCommand( editor );

				const conversion = editor.conversion;
				const schema = model.schema;

				schema.register( 'table', {
					allowWhere: '$block',
					allowAttributes: [ 'headingRows' ],
					isBlock: true,
					isObject: true
				} );

				schema.register( 'tableRow', {
					allowIn: 'table',
					allowAttributes: [],
					isBlock: true,
					isLimit: true
				} );

				schema.register( 'tableCell', {
					allowIn: 'tableRow',
					allowContentOf: '$block',
					allowAttributes: [ 'colspan', 'rowspan' ],
					isBlock: true,
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
		it( 'should be false if not in a table', () => {
			setData( model, '<p>foo[]</p>' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true if in table', () => {
			setData( model, '<table><tableRow><tableCell>foo[]</tableCell></tableRow></table>' );
			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should set heading rows attribute', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute( { rows: 2 } );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			], { headingRows: 2 } ) );
		} );

		it( 'should remove heading rows attribute', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			], { headingRows: 2 } ) );

			command.execute( { rows: 0 } );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should set heading columns attribute', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute( { columns: 2 } );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			], { headingColumns: 2 } ) );
		} );

		it( 'should remove heading columns attribute', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			], { headingColumns: 2 } ) );

			command.execute( { columns: 0 } );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should remove heading columns & heading rows attributes', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			], { headingColumns: 2, headingRows: 2 } ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should fix rowspaned cells on the edge of an table head section', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, rowspan: 2, contents: '10[]' }, '12' ],
				[ '22' ]
			], { headingColumns: 2, headingRows: 1 } ) );

			command.execute( { rows: 2, columns: 2 } );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, contents: '10[]' }, '12' ],
				[ { colspan: 2, contents: '' }, '22' ]
			], { headingColumns: 2, headingRows: 2 } ) );
		} );

		it( 'should split to at most 2 table cells when fixing rowspaned cells on the edge of an table head section', () => {
			setData( model, modelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, rowspan: 5, contents: '10[]' }, '12' ],
				[ '22' ],
				[ '32' ],
				[ '42' ],
				[ '52' ]
			], { headingColumns: 2, headingRows: 1 } ) );

			command.execute( { rows: 3, columns: 2 } );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01', '02' ],
				[ { colspan: 2, rowspan: 2, contents: '10[]' }, '12' ],
				[ '22' ],
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

			command.execute( { rows: 1 } );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '[]00', '01' ],
				[ '', '11' ],
			], { headingRows: 1 } ) );
		} );

		it( 'should fix rowspaned cells inside a row', () => {
			setData( model, modelTable( [
				[ '00', { rowspan: 2, contents: '[]01' } ],
				[ '10' ]
			], { headingRows: 2 } ) );

			command.execute( { rows: 1 } );

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '[]01' ],
				[ '10', '' ]
			], { headingRows: 1 } ) );
		} );
	} );
} );
