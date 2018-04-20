/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import RemoveRowCommand from '../../src/commands/removerowcommand';
import { downcastInsertTable } from '../../src/converters/downcast';
import upcastTable from '../../src/converters/upcasttable';
import { formatModelTable, formattedModelTable, modelTable } from '../_utils/utils';

describe( 'RemoveRowCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new RemoveRowCommand( editor );

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

	describe( 'isEnabled', () => {
		it( 'should be true if selection is inside table cell', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ],
				[ '10[]', '11' ]
			] ) );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false if selection is inside table with one row only', () => {
			setData( model, modelTable( [
				[ '00[]', '01' ]
			] ) );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection is outside a table', () => {
			setData( model, '<p>11[]</p>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should remove a given row', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			expect( formatModelTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01[]' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should remove a given row from a table start', () => {
			setData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ],
				[ '20', '21' ]
			] ) );

			command.execute();

			expect( formatModelTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '[]10', '11' ],
				[ '20', '21' ]
			] ) );
		} );

		it( 'should change heading rows if removing a heading row', () => {
			setData( model, modelTable( [
				[ '00', '01' ],
				[ '[]10', '11' ],
				[ '20', '21' ]
			], { headingRows: 2 } ) );

			command.execute();

			expect( formatModelTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01[]' ],
				[ '20', '21' ]
			], { headingRows: 1 } ) );
		} );

		it( 'should decrease rowspan of table cells from previous rows', () => {
			setData( model, modelTable( [
				[ { rowspan: 4, contents: '00' }, { rowspan: 3, contents: '01' }, { rowspan: 2, contents: '02' }, '03', '04' ],
				[ { rowspan: 2, contents: '13' }, '14' ],
				[ '22[]', '23', '24' ],
				[ '30', '31', '32', '33', '34' ]
			] ) );

			command.execute();

			expect( formatModelTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ { rowspan: 3, contents: '00' }, { rowspan: 2, contents: '01' }, { rowspan: 2, contents: '02' }, '03', '04' ],
				[ '13', '14[]' ],
				[ '30', '31', '32', '33', '34' ]
			] ) );
		} );

		it( 'should move rowspaned cells to row below removing it\'s row', () => {
			setData( model, modelTable( [
				[ { rowspan: 3, contents: '[]00' }, { rowspan: 2, contents: '01' }, '02' ],
				[ '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			] ) );

			command.execute();

			expect( formatModelTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ { rowspan: 2, contents: '[]00' }, '01', '12' ],
				[ '22' ],
				[ '30', '31', '32' ]
			] ) );
		} );
	} );
} );
