/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import InsertTableCommand from '../../src/commands/inserttablecommand';
import {
	downcastInsertCell,
	downcastInsertRow,
	downcastInsertTable,
	downcastRemoveRow,
	downcastTableHeadingColumnsChange,
	downcastTableHeadingRowsChange
} from '../../src/converters/downcast';
import upcastTable from '../../src/converters/upcasttable';
import TableUtils from '../../src/tableutils';

describe( 'InsertTableCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create( {
			plugins: [ TableUtils ]
		} ).then( newEditor => {
			editor = newEditor;
			model = editor.model;
			command = new InsertTableCommand( editor );

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
		describe( 'when selection is collapsed', () => {
			it( 'should be true if in paragraph', () => {
				setData( model, '<p>foo[]</p>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if in table', () => {
				setData( model, '<table><tableRow><tableCell>foo[]</tableCell></tableRow></table>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'collapsed selection', () => {
			it( 'should insert table in empty root', () => {
				setData( model, '[]' );

				command.execute();

				expect( getData( model ) ).to.equal(
					'[]<table>' +
					'<tableRow><tableCell></tableCell><tableCell></tableCell></tableRow>' +
					'<tableRow><tableCell></tableCell><tableCell></tableCell></tableRow>' +
					'</table>'
				);
			} );

			it( 'should insert table with two rows and two columns after non-empty paragraph', () => {
				setData( model, '<p>foo[]</p>' );

				command.execute();

				expect( getData( model ) ).to.equal( '<p>foo[]</p>' +
					'<table>' +
					'<tableRow><tableCell></tableCell><tableCell></tableCell></tableRow>' +
					'<tableRow><tableCell></tableCell><tableCell></tableCell></tableRow>' +
					'</table>'
				);
			} );

			it( 'should insert table with given rows and columns after non-empty paragraph', () => {
				setData( model, '<p>foo[]</p>' );

				command.execute( { rows: 3, columns: 4 } );

				expect( getData( model ) ).to.equal( '<p>foo[]</p>' +
					'<table>' +
					'<tableRow><tableCell></tableCell><tableCell></tableCell><tableCell></tableCell><tableCell></tableCell></tableRow>' +
					'<tableRow><tableCell></tableCell><tableCell></tableCell><tableCell></tableCell><tableCell></tableCell></tableRow>' +
					'<tableRow><tableCell></tableCell><tableCell></tableCell><tableCell></tableCell><tableCell></tableCell></tableRow>' +
					'</table>'
				);
			} );
		} );
	} );
} );
