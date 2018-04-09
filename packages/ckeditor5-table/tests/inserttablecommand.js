/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import InsertTableCommand from '../src/inserttablecommand';
import { downcastInsertTable } from '../src/converters/downcast';
import upcastTable from '../src/converters/upcasttable';

describe( 'InsertTableCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new InsertTableCommand( editor );

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
					'<table>' +
					'<tableRow><tableCell></tableCell><tableCell></tableCell></tableRow>' +
					'<tableRow><tableCell></tableCell><tableCell></tableCell></tableRow>' +
					'</table>[]'
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
