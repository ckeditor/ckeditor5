/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import HorizontalLineEditing from '@ckeditor/ckeditor5-horizontal-line/src/horizontallineediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableSelection from '../../src/tableselection';
import TableEditing from '../../src/tableediting';
import { assertSelectedCells, modelTable } from '../_utils/utils';

import InsertColumnCommand from '../../src/commands/insertcolumncommand';

describe( 'InsertColumnCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ Paragraph, TableEditing, TableSelection, HorizontalLineEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'order=right', () => {
		beforeEach( () => {
			command = new InsertColumnCommand( editor );
		} );

		describe( 'isEnabled', () => {
			it( 'should be false if wrong node', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );
				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if in table', () => {
				setData( model, modelTable( [ [ '[]' ] ] ) );
				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should insert column in given table to the right of the selection\'s column', () => {
				setData( model, modelTable( [
					[ '11[]', '12' ],
					[ '21', '22' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '11[]', '', '12' ],
					[ '21', '', '22' ]
				] ) );
			} );

			it( 'should insert column in given table to the right of the selection\'s column (selection in block content)', () => {
				setData( model, modelTable( [
					[ '11', '<paragraph>12[]</paragraph>', '13' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '<paragraph>12[]</paragraph>', '', '13' ]
				] ) );
			} );

			it( 'should insert column at table end', () => {
				setData( model, modelTable( [
					[ '11', '12' ],
					[ '21', '22[]' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '12', '' ],
					[ '21', '22[]', '' ]
				] ) );
			} );

			it( 'should insert column after a multi column selection', () => {
				setData( model, modelTable( [
					[ '11', '12', '13' ],
					[ '21', '22', '23' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '11', '12', '', '13' ],
					[ '21', '22', '', '23' ]
				] ) );

				assertSelectedCells( model, [
					[ 1, 1, 0, 0 ],
					[ 1, 1, 0, 0 ]
				] );
			} );

			it( 'should update table heading columns attribute when inserting column in headings section', () => {
				setData( model, modelTable( [
					[ '11[]', '12' ],
					[ '21', '22' ],
					[ '31', '32' ]
				], { headingColumns: 2 } ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '11[]', '', '12' ],
					[ '21', '', '22' ],
					[ '31', '', '32' ]
				], { headingColumns: 3 } ) );
			} );

			it( 'should not update table heading columns attribute when inserting column after headings section', () => {
				setData( model, modelTable( [
					[ '11', '12[]', '13' ],
					[ '21', '22', '23' ],
					[ '31', '32', '33' ]
				], { headingColumns: 2 } ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '12[]', '', '13' ],
					[ '21', '22', '', '23' ],
					[ '31', '32', '', '33' ]
				], { headingColumns: 2 } ) );
			} );

			it( 'should skip spanned columns', () => {
				setData( model, modelTable( [
					[ '11[]', '12' ],
					[ { colspan: 2, contents: '21' } ],
					[ '31', '32' ]
				], { headingColumns: 2 } ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '11[]', '', '12' ],
					[ { colspan: 3, contents: '21' } ],
					[ '31', '', '32' ]
				], { headingColumns: 3 } ) );
			} );

			it( 'should skip wide spanned columns', () => {
				// +----+----+----+----+----+----+
				// | 00 | 01 | 02 | 03 | 04 | 05 |
				// +----+----+----+----+----+----+
				// | 10 | 11 | 12      | 14 | 15 |
				// +----+----+----+----+----+----+
				// | 20                | 24      |
				// +----+----+----+----+----+----+
				//                     ^-- heading columns
				setData( model, modelTable( [
					[ '00', '01[]', '02', '03', '04', '05' ],
					[ '10', '11', { contents: '12', colspan: 2 }, '14', '15' ],
					[ { contents: '20', colspan: 4 }, { contents: '24', colspan: 2 } ]
				], { headingColumns: 4 } ) );

				command.execute();

				// +----+----+----+----+----+----+----+
				// | 00 | 01 |    | 02 | 03 | 04 | 05 |
				// +----+----+----+----+----+----+----+
				// | 10 | 11 |    | 12      | 14 | 15 |
				// +----+----+----+----+----+----+----+
				// | 20                     | 24      |
				// +----+----+----+----+----+----+----+
				//                          ^-- heading columns
				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '00', '01[]', '', '02', '03', '04', '05' ],
					[ '10', '11', '', { contents: '12', colspan: 2 }, '14', '15' ],
					[ { contents: '20', colspan: 5 }, { contents: '24', colspan: 2 } ]
				], { headingColumns: 5 } ) );
			} );

			it( 'should insert a column when a widget in the table cell is selected', () => {
				setData( model, modelTable( [
					[ '11', '12' ],
					[ '21', '22' ],
					[ '31', '[<horizontalLine></horizontalLine>]' ]
				] ) );

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '11', '12', '' ],
					[ '21', '22', '' ],
					[ '31', '<horizontalLine></horizontalLine>', '' ]
				] ) );
			} );
		} );

		it( 'should be false when non-cell elements are in the selection', () => {
			model.schema.register( 'foo', {
				allowIn: 'table',
				allowContentOf: '$block'
			} );
			editor.conversion.elementToElement( {
				model: 'foo',
				view: 'foo'
			} );

			setData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell></tableCell>' +
					'</tableRow>' +
					'<foo>bar[]</foo>' +
				'</table>'
			);
			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'order=left', () => {
		beforeEach( () => {
			command = new InsertColumnCommand( editor, { order: 'left' } );
		} );

		describe( 'isEnabled', () => {
			it( 'should be false if wrong node', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );
				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if in table', () => {
				setData( model, modelTable( [ [ '[]' ] ] ) );
				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should insert column in given table to the left of the selection\'s column', () => {
				setData( model, modelTable( [
					[ '11', '12[]' ],
					[ '21', '22' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '', '12[]' ],
					[ '21', '', '22' ]
				] ) );
			} );

			it( 'should insert column in given table to the left of the selection\'s column (selection in block content)', () => {
				setData( model, modelTable( [
					[ '11', '<paragraph>12[]</paragraph>', '13' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '', '<paragraph>12[]</paragraph>', '13' ]
				] ) );
			} );

			it( 'should insert columns at the table start', () => {
				setData( model, modelTable( [
					[ '11', '12' ],
					[ '[]21', '22' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '', '11', '12' ],
					[ '', '[]21', '22' ]
				] ) );
			} );

			it( 'should insert column before a multi column selection', () => {
				setData( model, modelTable( [
					[ '11', '12', '13' ],
					[ '21', '22', '23' ]
				] ) );

				const tableSelection = editor.plugins.get( TableSelection );
				const modelRoot = model.document.getRoot();

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
					[ '', '11', '12', '13' ],
					[ '', '21', '22', '23' ]
				] ) );

				assertSelectedCells( model, [
					[ 0, 1, 1, 0 ],
					[ 0, 1, 1, 0 ]
				] );
			} );

			it( 'should update table heading columns attribute when inserting column in headings section', () => {
				setData( model, modelTable( [
					[ '11', '12[]' ],
					[ '21', '22' ],
					[ '31', '32' ]
				], { headingColumns: 2 } ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '', '12[]' ],
					[ '21', '', '22' ],
					[ '31', '', '32' ]
				], { headingColumns: 3 } ) );
			} );

			it( 'should not update table heading columns attribute when inserting column after headings section', () => {
				setData( model, modelTable( [
					[ '11', '12', '13[]' ],
					[ '21', '22', '23' ],
					[ '31', '32', '33' ]
				], { headingColumns: 2 } ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '12', '', '13[]' ],
					[ '21', '22', '', '23' ],
					[ '31', '32', '', '33' ]
				], { headingColumns: 2 } ) );
			} );

			it( 'should skip spanned columns', () => {
				setData( model, modelTable( [
					[ '11', '12[]' ],
					[ { colspan: 2, contents: '21' } ],
					[ '31', '32' ]
				], { headingColumns: 2 } ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '', '12[]' ],
					[ { colspan: 3, contents: '21' } ],
					[ '31', '', '32' ]
				], { headingColumns: 3 } ) );
			} );

			it( 'should skip wide spanned columns', () => {
				// +----+----+----+----+----+----+
				// | 00 | 01 | 02 | 03 | 04 | 05 |
				// +----+----+----+----+----+----+
				// | 10 | 11 | 12      | 14 | 15 |
				// +----+----+----+----+----+----+
				// | 20                | 24      |
				// +----+----+----+----+----+----+
				//                     ^-- heading columns
				setData( model, modelTable( [
					[ '00', '01', '[]02', '03', '04', '05' ],
					[ '10', '11', { contents: '12', colspan: 2 }, '14', '15' ],
					[ { contents: '20', colspan: 4 }, { contents: '24', colspan: 2 } ]
				], { headingColumns: 4 } ) );

				command.execute();

				// +----+----+----+----+----+----+----+
				// | 00 | 01 |    | 02 | 03 | 04 | 05 |
				// +----+----+----+----+----+----+----+
				// | 10 | 11 |    | 12      | 14 | 15 |
				// +----+----+----+----+----+----+----+
				// | 20                     | 24      |
				// +----+----+----+----+----+----+----+
				//                          ^-- heading columns
				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '00', '01', '', '[]02', '03', '04', '05' ],
					[ '10', '11', '', { contents: '12', colspan: 2 }, '14', '15' ],
					[ { contents: '20', colspan: 5 }, { contents: '24', colspan: 2 } ]
				], { headingColumns: 5 } ) );
			} );
		} );

		it( 'should be false when non-cell elements are in the selection', () => {
			model.schema.register( 'foo', {
				allowIn: 'table',
				allowContentOf: '$block'
			} );
			editor.conversion.elementToElement( {
				model: 'foo',
				view: 'foo'
			} );

			setData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell></tableCell>' +
					'</tableRow>' +
					'<foo>bar[]</foo>' +
				'</table>'
			);
			expect( command.isEnabled ).to.be.false;
		} );
	} );
} );
