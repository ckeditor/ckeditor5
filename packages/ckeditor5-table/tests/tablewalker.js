/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { modelTable } from './_utils/utils';

import TableWalker from '../src/tablewalker';

describe( 'TableWalker', () => {
	let editor, model, doc, root;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				root = doc.getRoot( 'main' );

				const schema = model.schema;

				schema.register( 'table', {
					allowWhere: '$block',
					allowAttributes: [ 'headingRows', 'headingColumns' ],
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
			} );
	} );

	function testWalker( tableData, expected, options = {} ) {
		setData( model, modelTable( tableData ) );

		const iterator = new TableWalker( root.getChild( 0 ), options );

		const result = [];

		for ( const tableInfo of iterator ) {
			result.push( tableInfo );
		}

		const formattedResult = result.map( ( { row, column, cell } ) => ( { row, column, data: cell.getChild( 0 ).data } ) );
		expect( formattedResult ).to.deep.equal( expected );
	}

	it( 'should iterate over a table', () => {
		testWalker( [
			[ '11', '12' ]
		], [
			{ row: 0, column: 0, data: '11' },
			{ row: 0, column: 1, data: '12' }
		] );
	} );

	it( 'should properly output column indexes of a table that has colspans', () => {
		testWalker( [
			[ { colspan: 2, contents: '11' }, '13' ]
		], [
			{ row: 0, column: 0, data: '11' },
			{ row: 0, column: 2, data: '13' }
		] );
	} );

	it( 'should properly output column indexes of a table that has rowspans', () => {
		testWalker( [
			[ { colspan: 2, rowspan: 3, contents: '11' }, '13' ],
			[ '23' ],
			[ '33' ],
			[ '41', '42', '43' ]
		], [
			{ row: 0, column: 0, data: '11' },
			{ row: 0, column: 2, data: '13' },
			{ row: 1, column: 2, data: '23' },
			{ row: 2, column: 2, data: '33' },
			{ row: 3, column: 0, data: '41' },
			{ row: 3, column: 1, data: '42' },
			{ row: 3, column: 2, data: '43' }
		] );
	} );
} );
