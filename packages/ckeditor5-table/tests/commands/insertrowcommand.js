/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import InsertRowCommand from '../../src/commands/insertrowcommand';
import { downcastInsertTable } from '../../src/converters/downcast';
import upcastTable from '../../src/converters/upcasttable';
import { formatTable, formattedModelTable, modelTable } from '../_utils/utils';
import TableUtils from '../../src/tableutils';

describe( 'InsertRowCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create( {
			plugins: [ TableUtils ]
		} ).then( newEditor => {
			editor = newEditor;
			model = editor.model;

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

			// Table row upcast only since downcast conversion is done in `downcastTable()`.
			conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableRow', view: 'tr' } ) );

			// Table cell conversion.
			conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'td' } ) );
			conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'th' } ) );

			conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
			conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'below', () => {
		beforeEach( () => {
			command = new InsertRowCommand( editor );
		} );

		describe( 'isEnabled', () => {
			it( 'should be false if wrong node', () => {
				setData( model, '<p>foo[]</p>' );
				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if in table', () => {
				setData( model, modelTable( [ [ '[]' ] ] ) );
				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should insert row after current position', () => {
				setData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '00[]', '01' ],
					[ '', '' ],
					[ '10', '11' ]
				] ) );
			} );

			it( 'should update table heading rows attribute when inserting row in headings section', () => {
				setData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 2 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '00[]', '01' ],
					[ '', '' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 3 } ) );
			} );

			it( 'should not update table heading rows attribute when inserting row after headings section', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10[]', '11' ],
					[ '20', '21' ]
				], { headingRows: 2 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '00', '01' ],
					[ '10[]', '11' ],
					[ '', '' ],
					[ '20', '21' ]
				], { headingRows: 2 } ) );
			} );

			it( 'should expand rowspan of a cell that overlaps inserted rows', () => {
				setData( model, modelTable( [
					[ { colspan: 2, contents: '00' }, '02', '03' ],
					[ { colspan: 2, rowspan: 4, contents: '10[]' }, '12', '13' ],
					[ '22', '23' ]
				], { headingColumns: 3, headingRows: 1 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ { colspan: 2, contents: '00' }, '02', '03' ],
					[ { colspan: 2, rowspan: 5, contents: '10[]' }, '12', '13' ],
					[ '', '' ],
					[ '22', '23' ]
				], { headingColumns: 3, headingRows: 1 } ) );
			} );

			it( 'should not expand rowspan of a cell that does not overlaps inserted rows', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, '01', '02' ],
					[ '11[]', '12' ],
					[ '20', '21', '22' ]
				], { headingColumns: 3, headingRows: 1 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ { rowspan: 2, contents: '00' }, '01', '02' ],
					[ '11[]', '12' ],
					[ '', '', '' ],
					[ '20', '21', '22' ]
				], { headingColumns: 3, headingRows: 1 } ) );
			} );

			it( 'should properly calculate columns if next row has colspans', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, '01', '02' ],
					[ '11[]', '12' ],
					[ { colspan: 3, contents: '20' } ]
				], { headingColumns: 3, headingRows: 1 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ { rowspan: 2, contents: '00' }, '01', '02' ],
					[ '11[]', '12' ],
					[ '', '', '' ],
					[ { colspan: 3, contents: '20' } ]
				], { headingColumns: 3, headingRows: 1 } ) );
			} );

			it( 'should insert rows at the end of a table', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10[]', '11' ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '00', '01' ],
					[ '10[]', '11' ],
					[ '', '' ]
				] ) );
			} );
		} );
	} );

	describe( 'location=above', () => {
		beforeEach( () => {
			command = new InsertRowCommand( editor, { location: 'above' } );
		} );

		describe( 'isEnabled', () => {
			it( 'should be false if wrong node', () => {
				setData( model, '<p>foo[]</p>' );
				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if in table', () => {
				setData( model, modelTable( [ [ '[]' ] ] ) );
				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should insert row at the beginning of a table', () => {
				setData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '', '' ],
					[ '00[]', '01' ],
					[ '10', '11' ]
				] ) );
			} );
			it( 'should insert row at the end of a table', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20[]', '21' ]
				] ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '', '' ],
					[ '20[]', '21' ]
				] ) );
			} );

			it( 'should update table heading rows attribute when inserting row in headings section', () => {
				setData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 2 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '', '' ],
					[ '00[]', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { headingRows: 3 } ) );
			} );

			it( 'should not update table heading rows attribute when inserting row after headings section', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20[]', '21' ]
				], { headingRows: 2 } ) );

				command.execute();

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '', '' ],
					[ '20[]', '21' ]
				], { headingRows: 2 } ) );
			} );
		} );
	} );
} );
