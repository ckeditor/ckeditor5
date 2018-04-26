/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import SplitCellCommand from '../../src/commands/splitcellcommand';
import { downcastInsertTable } from '../../src/converters/downcast';
import upcastTable from '../../src/converters/upcasttable';
import { formatTable, formattedModelTable, modelTable } from '../_utils/utils';

describe( 'SplitCellCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new SplitCellCommand( editor );

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
		describe( 'options.horizontally', () => {
			it( 'should split table cell for given table cells', () => {
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '[]11', '12' ],
					[ '20', { colspan: 2, contents: '21' } ],
					[ { colspan: 2, contents: '30' }, '32' ]
				] ) );

				command.execute( { horizontally: 3 } );

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '00', { colspan: 3, contents: '01' }, '02' ],
					[ '10', '[]11', '', '', '12' ],
					[ '20', { colspan: 4, contents: '21' } ],
					[ { colspan: 4, contents: '30' }, '32' ]
				] ) );
			} );

			it( 'should unsplit table cell if split is equal to colspan', () => {
				setData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', { colspan: 2, contents: '21[]' } ],
					[ { colspan: 2, contents: '30' }, '32' ]
				] ) );

				command.execute( { horizontally: 2 } );

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

				command.execute( { horizontally: 2 } );

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

				command.execute( { horizontally: 2 } );

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

				command.execute( { horizontally: 2 } );

				expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
					[ '00', '01', '02', '03', '04', '05' ],
					[ { colspan: 3, rowspan: 2, contents: '10[]' }, { colspan: 2, rowspan: 2, contents: '' }, '15' ],
					[ '25' ]
				] ) );
			} );
		} );

		describe( 'options.horizontally', () => {} );
	} );
} );
