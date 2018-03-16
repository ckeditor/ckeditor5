/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import InsertRowCommand from '../src/insertrowcommand';
import downcastTable from '../src/converters/downcasttable';
import upcastTable from '../src/converters/upcasttable';
import { formatModelTable, formattedModelTable, modelTable } from './_utils/utils';

describe( 'InsertRowCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new InsertRowCommand( editor );

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
				conversion.for( 'downcast' ).add( downcastTable() );

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
			it( 'should be false if wrong node', () => {
				setData( model, '<p>foo[]</p>' );
				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if in table', () => {
				setData( model, modelTable( 1, [ '[]' ] ) );
				expect( command.isEnabled ).to.be.true;
			} );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should insert row in given table at given index', () => {
			setData( model, modelTable( 2, [
				'11[]', '12',
				'21', '22'
			] ) );

			command.execute( { at: 1 } );

			expect( formatModelTable( getData( model ) ) ).to.equal( formattedModelTable( 2, [
				'11[]', '12',
				'', '',
				'21', '22'
			] ) );
		} );

		it( 'should insert row in given table at default index', () => {
			setData( model, modelTable( 2, [
				'11[]', '12',
				'21', '22'
			] ) );

			command.execute();

			expect( formatModelTable( getData( model ) ) ).to.equal( formattedModelTable( 2, [
				'', '',
				'11[]', '12',
				'21', '22'
			] ) );
		} );

		it( 'should update table heading rows attribute when inserting row in headings section', () => {
			setData( model, modelTable( 2, [
				'11[]', '12',
				'21', '22',
				'31', '32'
			], { headingRows: 2 } ) );

			command.execute( { at: 1 } );

			expect( formatModelTable( getData( model ) ) ).to.equal( formattedModelTable( 2, [
				'11[]', '12',
				'', '',
				'21', '22',
				'31', '32'
			], { headingRows: 3 } ) );
		} );

		it( 'should not update table heading rows attribute when inserting row after headings section', () => {
			setData( model, modelTable( 2, [
				'11[]', '12',
				'21', '22',
				'31', '32'
			], { headingRows: 2 } ) );

			command.execute( { at: 2 } );

			expect( formatModelTable( getData( model ) ) ).to.equal( formattedModelTable( 2, [
				'11[]', '12',
				'21', '22',
				'', '',
				'31', '32'
			], { headingRows: 2 } ) );
		} );
	} );
} );
