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
		it( 'should be true if in cell with colspan attribute set', () => {
			setData( model, modelTable( [
				[ { colspan: 2, contents: '11[]' } ]
			] ) );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if in cell with rowspan attribute set', () => {
			setData( model, modelTable( [
				[ { rowspan: 2, contents: '11[]' } ]
			] ) );
		} );

		it( 'should be false in cell without rowspan or colspan attribute', () => {
			setData( model, modelTable( [
				[ '11[]' ]
			] ) );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false if not in cell', () => {
			setData( model, '<p>11[]</p>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should split table cell with colspan', () => {
			setData( model, modelTable( [
				[ { colspan: 2, contents: '[]11' } ]
			] ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '[]11', '' ]
			] ) );
		} );

		it( 'should split table cell with rowspan', () => {
			setData( model, modelTable( [
				[ { rowspan: 2, contents: '[]11' }, '12' ],
				[ '22' ]
			] ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '[]11', '12' ],
				[ '', '22' ]
			] ) );
		} );

		it( 'should split table cell with rowspan in the middle of a table', () => {
			setData( model, modelTable( [
				[ '11', { rowspan: 3, contents: '[]12' }, '13' ],
				[ { rowspan: 2, contents: '[]21' }, '23' ],
				[ '33' ]
			] ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '11', '[]12', '13' ],
				[ { rowspan: 2, contents: '[]21' }, '', '23' ],
				[ '', '33' ]
			] ) );
		} );

		it( 'should split table cell with rowspan and colspan in the middle of a table', () => {
			setData( model, modelTable( [
				[ '11', { rowspan: 3, colspan: 2, contents: '[]12' }, '14' ],
				[ { rowspan: 2, contents: '[]21' }, '24' ],
				[ '34' ]
			] ) );

			command.execute();

			expect( formatTable( getData( model ) ) ).to.equal( formattedModelTable( [
				[ '11', '[]12', '', '14' ],
				[ { rowspan: 2, contents: '[]21' }, '', '', '24' ],
				[ '', '', '34' ]
			] ) );
		} );
	} );
} );
