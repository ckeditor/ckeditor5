/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../../src/tableediting';
import { modelTable } from '../_utils/utils';

import MergeCellCommand from '../../src/commands/mergecellcommand';

describe( 'MergeCellCommand', () => {
	let editor, model, command, root;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ Paragraph, TableEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot( 'main' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'direction=right', () => {
		beforeEach( () => {
			command = new MergeCellCommand( editor, { direction: 'right' } );
		} );

		describe( 'isEnabled', () => {
			it( 'should be true if in cell that has sibling on the right', () => {
				setData( model, modelTable( [
					[ '00[]', '01' ]
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if last cell of a row', () => {
				setData( model, modelTable( [
					[ '00', '01[]' ]
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if in a cell that has sibling on the right with the same rowspan', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00[]' }, { rowspan: 2, contents: '01' } ]
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if in a cell that has sibling but with different rowspan', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00[]' }, { rowspan: 3, contents: '01' }, '02' ],
					[ '12' ],
					[ '20', '22' ]
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false when next cell is rowspanned', () => {
				setData( model, modelTable( [
					[ '00', { rowspan: 3, contents: '01' }, '02' ],
					[ '10[]', '12' ],
					[ '20', '22' ]
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true when current cell is colspanned', () => {
				setData( model, modelTable( [
					[ { colspan: 2, contents: '00[]' }, '02' ]
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if not in a cell', () => {
				setData( model, '<paragraph>11[]</paragraph>' );

				expect( command.isEnabled ).to.be.false;
			} );

			describe( 'when the heading section is in the table', () => {
				it( 'should be false if mergeable cell is in other table section then current cell', () => {
					setData( model, modelTable( [
						[ '00[]', '01' ]
					], { headingColumns: 1 } ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true if merged cell would not cross heading section (mergeable cell with colspan)', () => {
					setData( model, modelTable( [
						[ '00[]', { colspan: 2, contents: '01' }, '02', '03' ]
					], { headingColumns: 3 } ) );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be false if merged cell would cross heading section (current cell with colspan)', () => {
					setData( model, modelTable( [
						[ { colspan: 2, contents: '00[]' }, '01', '02', '03' ]
					], { headingColumns: 2 } ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true if merged cell would not cross heading section (current cell with colspan)', () => {
					setData( model, modelTable( [
						[ { colspan: 2, contents: '00[]' }, '01', '02', '03' ]
					], { headingColumns: 3 } ) );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true if merged cell would not cross the section boundary (regular section)', () => {
					setData( model, modelTable( [
						[ '00', '01', '02[]', '03' ]
					], { headingColumns: 1 } ) );

					expect( command.isEnabled ).to.be.true;
				} );
			} );
		} );

		describe( 'value', () => {
			it( 'should be set to mergeable sibling if in cell that has sibling on the right', () => {
				setData( model, modelTable( [
					[ '00[]', '01' ]
				] ) );

				expect( command.value ).to.equal( root.getNodeByPath( [ 0, 0, 1 ] ) );
			} );

			it( 'should be set to mergeable sibling if in cell that has sibling on the right (selection in block content)', () => {
				setData( model, modelTable( [
					[ '00', '<paragraph>[]01</paragraph>', '02' ]
				] ) );

				expect( command.value ).to.equal( root.getNodeByPath( [ 0, 0, 2 ] ) );
			} );

			it( 'should be undefined if last cell of a row', () => {
				setData( model, modelTable( [
					[ '00', '01[]' ]
				] ) );

				expect( command.value ).to.be.undefined;
			} );

			it( 'should be set to mergeable sibling if in a cell that has sibling on the right with the same rowspan', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00[]' }, { rowspan: 2, contents: '01' } ]
				] ) );

				expect( command.value ).to.equal( root.getNodeByPath( [ 0, 0, 1 ] ) );
			} );

			it( 'should be undefined if in a cell that has sibling but with different rowspan', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00[]' }, { rowspan: 3, contents: '01' }, '02' ],
					[ '12' ],
					[ '20', '22' ]
				] ) );

				expect( command.value ).to.be.undefined;
			} );

			it( 'should be undefined if not in a cell', () => {
				setData( model, '<paragraph>11[]</paragraph>' );

				expect( command.value ).to.be.undefined;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should merge table cells', () => {
				setData( model, modelTable( [
					[ '[]00', '01' ],
					[ '10', '11' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { colspan: 2, contents: '<paragraph>[00</paragraph><paragraph>01]</paragraph>' } ],
					[ '10', '11' ]
				] ) );
			} );

			it( 'should merge table cells and remove empty columns', () => {
				setData( model, modelTable( [
					[ '[]00', '01' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '<paragraph>[00</paragraph><paragraph>01]</paragraph>' ]
				] ) );
			} );

			it( 'should result in single empty paragraph if both cells are empty', () => {
				setData( model, modelTable( [
					[ '[]', '' ],
					[ '10', '11' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { colspan: 2, contents: '<paragraph>[]</paragraph>' } ],
					[ '10', '11' ]
				] ) );
			} );

			it( 'should result in single paragraph (other cell is empty)', () => {
				setData( model, modelTable( [
					[ 'foo[]', '' ],
					[ '10', '11' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { colspan: 2, contents: '<paragraph>[foo]</paragraph>' } ],
					[ '10', '11' ]
				] ) );
			} );

			it( 'should result in single paragraph (selection cell is empty)', () => {
				setData( model, modelTable( [
					[ '[]', 'foo' ],
					[ '10', '11' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { colspan: 2, contents: '<paragraph>[foo]</paragraph>' } ],
					[ '10', '11' ]
				] ) );
			} );

			it( 'should not merge other empty blocks to single block', () => {
				model.schema.register( 'block', {
					allowWhere: '$block',
					allowContentOf: '$block',
					isBlock: true
				} );

				setData( model, modelTable( [
					[ '<block>[]</block>', '<block></block>' ],
					[ '10', '11' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { colspan: 2, contents: '<block>[</block><block>]</block>' } ],
					[ '10', '11' ]
				] ) );
			} );
		} );
	} );

	describe( 'direction=left', () => {
		beforeEach( () => {
			command = new MergeCellCommand( editor, { direction: 'left' } );
		} );

		describe( 'isEnabled', () => {
			it( 'should be true if in cell that has sibling on the left', () => {
				setData( model, modelTable( [
					[ '00', '01[]' ]
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if first cell of a row', () => {
				setData( model, modelTable( [
					[ '00[]', '01' ]
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if in a cell that has sibling on the left with the same rowspan', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, { rowspan: 2, contents: '01[]' } ]
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if in a cell that has sibling but with different rowspan', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, { rowspan: 3, contents: '01[]' } ],
					[ '12' ],
					[ '20', '22' ]
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false when next cell is rowspanned', () => {
				setData( model, modelTable( [
					[ '00', { rowspan: 3, contents: '01' }, '02' ],
					[ '10', '12[]' ],
					[ '20', '22' ]
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true when mergeable cell is colspanned', () => {
				setData( model, modelTable( [
					[ { colspan: 2, contents: '00' }, '02[]' ]
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if not in a cell', () => {
				setData( model, '<paragraph>11[]</paragraph>' );

				expect( command.isEnabled ).to.be.false;
			} );

			describe( 'when the heading section is in the table', () => {
				it( 'should be false if mergeable cell is in other table section then current cell', () => {
					setData( model, modelTable( [
						[ '00', '01[]' ]
					], { headingColumns: 1 } ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if merged cell would cross heading section (mergeable cell with colspan)', () => {
					setData( model, modelTable( [
						[ { colspan: 2, contents: '00' }, '02[]', '03' ]
					], { headingColumns: 2 } ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true if merged cell would not cross the section boundary (in regular section)', () => {
					setData( model, modelTable( [
						[ '00', '01', '02[]', '03' ]
					], { headingColumns: 1 } ) );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true if merged cell would not cross the section boundary (in heading section)', () => {
					setData( model, modelTable( [
						[ '00', '01[]', '02', '03' ]
					], { headingColumns: 2 } ) );

					expect( command.isEnabled ).to.be.true;
				} );
			} );
		} );

		describe( 'value', () => {
			it( 'should be set to mergeable sibling if in cell that has sibling on the left', () => {
				setData( model, modelTable( [
					[ '00', '01[]' ]
				] ) );

				expect( command.value ).to.equal( root.getNodeByPath( [ 0, 0, 0 ] ) );
			} );

			it( 'should be set to mergeable sibling if in cell that has sibling on the left (selection in block content)', () => {
				setData( model, modelTable( [
					[ '00', '<paragraph>01[]</paragraph>', '02' ]
				] ) );

				expect( command.value ).to.equal( root.getNodeByPath( [ 0, 0, 0 ] ) );
			} );

			it( 'should be undefined if first cell of a row', () => {
				setData( model, modelTable( [
					[ '00[]', '01' ]
				] ) );

				expect( command.value ).to.be.undefined;
			} );

			it( 'should be set to mergeable sibling if in a cell that has sibling on the left with the same rowspan', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, { rowspan: 2, contents: '01[]' } ]
				] ) );

				expect( command.value ).to.equal( root.getNodeByPath( [ 0, 0, 0 ] ) );
			} );

			it( 'should be undefined if in a cell that has sibling but with different rowspan', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, { rowspan: 3, contents: '01[]' } ],
					[ '12' ],
					[ '20', '22' ]
				] ) );

				expect( command.value ).to.be.undefined;
			} );

			it( 'should be undefined if not in a cell', () => {
				setData( model, '<paragraph>11[]</paragraph>' );

				expect( command.value ).to.be.undefined;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should merge table cells', () => {
				setData( model, modelTable( [
					[ '00', '[]01' ],
					[ '10', '11' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { colspan: 2, contents: '<paragraph>[00</paragraph><paragraph>01]</paragraph>' } ],
					[ '10', '11' ]
				] ) );
			} );

			it( 'should merge table cells and remove empty columns', () => {
				setData( model, modelTable( [
					[ '00', '[]01' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '<paragraph>[00</paragraph><paragraph>01]</paragraph>' ]
				] ) );
			} );

			it( 'should result in single empty paragraph if both cells are empty', () => {
				setData( model, modelTable( [
					[ '', '[]' ],
					[ '10', '11' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { colspan: 2, contents: '<paragraph>[]</paragraph>' } ],
					[ '10', '11' ]
				] ) );
			} );

			it( 'should result in single paragraph (other cell is empty)', () => {
				setData( model, modelTable( [
					[ '', 'foo[]' ],
					[ '10', '11' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { colspan: 2, contents: '<paragraph>[foo]</paragraph>' } ],
					[ '10', '11' ]
				] ) );
			} );

			it( 'should result in single paragraph (selection cell is empty)', () => {
				setData( model, modelTable( [
					[ 'foo', '[]' ],
					[ '10', '11' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { colspan: 2, contents: '<paragraph>[foo]</paragraph>' } ],
					[ '10', '11' ]
				] ) );
			} );

			it( 'should not merge other empty blocks to single block', () => {
				model.schema.register( 'block', {
					allowWhere: '$block',
					allowContentOf: '$block',
					isBlock: true
				} );

				setData( model, modelTable( [
					[ '<block></block>', '<block>[]</block>' ],
					[ '10', '11' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { colspan: 2, contents: '<block>[</block><block>]</block>' } ],
					[ '10', '11' ]
				] ) );
			} );
		} );
	} );

	describe( 'direction=down', () => {
		beforeEach( () => {
			command = new MergeCellCommand( editor, { direction: 'down' } );
		} );

		describe( 'isEnabled', () => {
			it( 'should be true if in cell that has mergeable cell in next row', () => {
				setData( model, modelTable( [
					[ '00', '01[]' ],
					[ '10', '11' ]
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if in last row', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10[]', '11' ]
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if in a cell that has mergeable cell with the same colspan', () => {
				setData( model, modelTable( [
					[ { colspan: 2, contents: '00[]' }, '02' ],
					[ { colspan: 2, contents: '01' }, '12' ]
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if in a cell that potential mergeable cell has different colspan', () => {
				setData( model, modelTable( [
					[ { colspan: 2, contents: '00[]' }, '02' ],
					[ { colspan: 3, contents: '01' } ]
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if not in a cell', () => {
				setData( model, '<paragraph>11[]</paragraph>' );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if mergeable cell is in other table section then current cell', () => {
				setData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				], { headingRows: 1 } ) );

				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'value', () => {
			it( 'should be set to mergeable cell', () => {
				setData( model, modelTable( [
					[ '00', '01[]' ],
					[ '10', '11' ]
				] ) );

				expect( command.value ).to.equal( root.getNodeByPath( [ 0, 1, 1 ] ) );
			} );

			it( 'should be set to mergeable cell (selection in block content)', () => {
				setData( model, modelTable( [
					[ '00' ],
					[ '<paragraph>10[]</paragraph>' ],
					[ '20' ]
				] ) );

				expect( command.value ).to.equal( root.getNodeByPath( [ 0, 2, 0 ] ) );
			} );

			it( 'should be undefined if in last row', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10[]', '11' ]
				] ) );

				expect( command.value ).to.be.undefined;
			} );

			it( 'should be undefined if in last row - ignore non-row elements', () => {
				model.schema.register( 'foo', {
					allowIn: 'table',
					allowContentOf: '$block',
					isLimit: true
				} );

				setData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>00</paragraph></tableCell>' +
							'<tableCell><paragraph>10</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>10[]</paragraph></tableCell>' +
							'<tableCell><paragraph>11</paragraph></tableCell>' +
						'</tableRow>' +
						'<foo>An extra element</foo>' +
					'</table>'
				);

				expect( command.value ).to.be.undefined;
			} );

			it( 'should be set to mergeable cell with the same rowspan', () => {
				setData( model, modelTable( [
					[ { colspan: 2, contents: '00[]' }, '02' ],
					[ { colspan: 2, contents: '01' }, '12' ]
				] ) );

				expect( command.value ).to.equal( root.getNodeByPath( [ 0, 1, 0 ] ) );
			} );

			it( 'should be undefined if in a cell that potential mergeable cell has different rowspan', () => {
				setData( model, modelTable( [
					[ { colspan: 2, contents: '00[]' }, '02' ],
					[ { colspan: 3, contents: '01' } ]
				] ) );

				expect( command.value ).to.be.undefined;
			} );

			it( 'should be undefined if mergable cell is in other table section', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00[]' }, '02' ],
					[ '12' ],
					[ '21', '22' ]
				], { headingRows: 2 } ) );

				expect( command.value ).to.be.undefined;
			} );

			it( 'should be undefined if not in a cell', () => {
				setData( model, '<paragraph>11[]</paragraph>' );

				expect( command.value ).to.be.undefined;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should merge table cells', () => {
				setData( model, modelTable( [
					[ '00', '01[]' ],
					[ '10', '11' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '00', { rowspan: 2, contents: '<paragraph>[01</paragraph><paragraph>11]</paragraph>' } ],
					[ '10' ]
				] ) );
			} );

			it( 'should result in single empty paragraph if both cells are empty', () => {
				setData( model, modelTable( [
					[ '[]', '' ],
					[ '', '' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { rowspan: 2, contents: '[]' }, '' ],
					[ '' ]
				] ) );
			} );

			it( 'should result in single paragraph (other cell is empty)', () => {
				setData( model, modelTable( [
					[ 'foo[]', '' ],
					[ '', '' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { rowspan: 2, contents: '[foo]' }, '' ],
					[ '' ]
				] ) );
			} );

			it( 'should result in single paragraph (selection cell is empty)', () => {
				setData( model, modelTable( [
					[ '[]', '' ],
					[ 'foo', '' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { rowspan: 2, contents: '[foo]' }, '' ],
					[ '' ]
				] ) );
			} );

			it( 'should not merge other empty blocks to single block', () => {
				model.schema.register( 'block', {
					allowWhere: '$block',
					allowContentOf: '$block',
					isBlock: true
				} );

				setData( model, modelTable( [
					[ '<block>[]</block>', '' ],
					[ '<block></block>', '' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { rowspan: 2, contents: '<block>[</block><block>]</block>' }, '' ],
					[ '' ]
				] ) );
			} );

			it( 'should remove empty row if merging table cells ', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, '01[]', { rowspan: 3, contents: '02' } ],
					[ '11' ],
					[ '20', '21' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '00', '<paragraph>[01</paragraph><paragraph>11]</paragraph>', { rowspan: 2, contents: '02' } ],
					[ '20', '21' ]
				] ) );
			} );

			it( 'should not reduce rowspan on cells above removed empty row when merging table cells ', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, '01', '02' ],
					[ '11', '12' ],
					[ { rowspan: 2, contents: '20' }, '21[]', { rowspan: 3, contents: '22' } ],
					[ '31' ],
					[ '40', '41' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { rowspan: 2, contents: '00' }, '01', '02' ],
					[ '11', '12' ],
					[ '20', '<paragraph>[21</paragraph><paragraph>31]</paragraph>', { rowspan: 2, contents: '22' } ],
					[ '40', '41' ]
				] ) );
			} );

			it( 'should adjust heading rows if empty row was removed ', () => {
				// +----+----+
				// | 00 | 01 |
				// +    +----+
				// |    | 11 |
				// +----+----+ <-- heading rows
				// | 20 | 21 |
				// +----+----+
				setData( model, modelTable( [
					[ { contents: '00', rowspan: 2 }, '[]01' ],
					[ '11' ],
					[ '20', '21' ]
				], { headingRows: 2 } ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '00', '<paragraph>[01</paragraph><paragraph>11]</paragraph>' ],
					[ '20', '21' ]
				], { headingRows: 1 } ) );
			} );

			it( 'should create one undo step (1 batch)', () => {
				// +----+----+
				// | 00 | 01 |
				// +    +----+
				// |    | 11 |
				// +----+----+ <-- heading rows
				// | 20 | 21 |
				// +----+----+
				setData( model, modelTable( [
					[ { contents: '00', rowspan: 2 }, '[]01' ],
					[ '11' ],
					[ '20', '21' ]
				], { headingRows: 2 } ) );

				const createdBatches = new Set();

				model.on( 'applyOperation', ( evt, [ operation ] ) => {
					createdBatches.add( operation.batch );
				} );

				command.execute();

				expect( createdBatches.size ).to.equal( 1 );
			} );
		} );
	} );

	describe( 'direction=up', () => {
		beforeEach( () => {
			command = new MergeCellCommand( editor, { direction: 'up' } );
		} );

		describe( 'isEnabled', () => {
			it( 'should be true if in cell that has mergeable cell in previous row', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11[]' ]
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if in first row', () => {
				setData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if in a cell that has mergeable cell with the same colspan', () => {
				setData( model, modelTable( [
					[ { colspan: 2, contents: '00' }, '02' ],
					[ { colspan: 2, contents: '01[]' }, '12' ]
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if in a cell that potential mergeable cell has different colspan', () => {
				setData( model, modelTable( [
					[ { colspan: 2, contents: '00' }, '02' ],
					[ { colspan: 3, contents: '01[]' } ]
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if not in a cell', () => {
				setData( model, '<paragraph>11[]</paragraph>' );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if mergeable cell is in other table section then current cell', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10[]', '11' ]
				], { headingRows: 1 } ) );

				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'value', () => {
			it( 'should be set to mergeable cell', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '11[]' ]
				] ) );

				expect( command.value ).to.equal( root.getNodeByPath( [ 0, 0, 1 ] ) );
			} );

			it( 'should be set to mergeable cell (selection in block content)', () => {
				setData( model, modelTable( [
					[ '00' ],
					[ '<paragraph>10[]</paragraph>' ],
					[ '20' ]
				] ) );

				expect( command.value ).to.equal( root.getNodeByPath( [ 0, 0, 0 ] ) );
			} );

			it( 'should be undefined if in first row', () => {
				setData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				] ) );

				expect( command.value ).to.be.undefined;
			} );

			it( 'should be set to mergeable cell with the same rowspan', () => {
				setData( model, modelTable( [
					[ { colspan: 2, contents: '00' }, '02' ],
					[ { colspan: 2, contents: '01[]' }, '12' ]
				] ) );

				expect( command.value ).to.equal( root.getNodeByPath( [ 0, 0, 0 ] ) );
			} );

			it( 'should be set to mergeable cell in rows with spanned cells', () => {
				setData( model, modelTable( [
					[ { rowspan: 3, contents: '00' }, '11', '12', '13' ],
					[ { rowspan: 2, contents: '21' }, '22', '23' ],
					[ '32', { rowspan: 2, contents: '33[]' } ],
					[ { colspan: 2, contents: '40' }, '42' ]
				] ) );

				expect( command.value ).to.equal( root.getNodeByPath( [ 0, 1, 2 ] ) );
			} );

			it( 'should be undefined if in a cell that potential mergeable cell has different rowspan', () => {
				setData( model, modelTable( [
					[ { colspan: 2, contents: '00' }, '02' ],
					[ { colspan: 3, contents: '01[]' } ]
				] ) );

				expect( command.value ).to.be.undefined;
			} );

			it( 'should be undefined if not in a cell', () => {
				setData( model, '<paragraph>11[]</paragraph>' );

				expect( command.value ).to.be.undefined;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should merge table cells', () => {
				setData( model, modelTable( [
					[ '00', '01' ],
					[ '10', '[]11' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '00', { rowspan: 2, contents: '<paragraph>[01</paragraph><paragraph>11]</paragraph>' } ],
					[ '10' ]
				] ) );
			} );

			it( 'should result in single empty paragraph if both cells are empty', () => {
				setData( model, modelTable( [
					[ '', '' ],
					[ '[]', '' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { rowspan: 2, contents: '[]' }, '' ],
					[ '' ]
				] ) );
			} );

			it( 'should result in single paragraph (other cell is empty)', () => {
				setData( model, modelTable( [
					[ '', '' ],
					[ 'foo[]', '' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { rowspan: 2, contents: '[foo]' }, '' ],
					[ '' ]
				] ) );
			} );

			it( 'should result in single paragraph (selection cell is empty)', () => {
				setData( model, modelTable( [
					[ 'foo', '' ],
					[ '[]', '' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { rowspan: 2, contents: '[foo]' }, '' ],
					[ '' ]
				] ) );
			} );

			it( 'should not merge other empty blocks to single block', () => {
				model.schema.register( 'block', {
					allowWhere: '$block',
					allowContentOf: '$block',
					isBlock: true
				} );

				setData( model, modelTable( [
					[ '<block></block>', '' ],
					[ '<block>[]</block>', '' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { rowspan: 2, contents: '<block>[</block><block>]</block>' }, '' ],
					[ '' ]
				] ) );
			} );

			it( 'should properly merge cells in rows with spaned cells', () => {
				setData( model, modelTable( [
					[ { rowspan: 3, contents: '00' }, '11', '12', '13' ],
					[ { rowspan: 2, contents: '21' }, '22', '23' ],
					[ '32', { rowspan: 2, contents: '33[]' } ],
					[ { colspan: 2, contents: '40' }, '42' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { rowspan: 3, contents: '00' }, '11', '12', '13' ],
					[
						{ rowspan: 2, contents: '21' },
						'22',
						{ rowspan: 3, contents: '<paragraph>[23</paragraph><paragraph>33]</paragraph>' }
					],
					[ '32' ],
					[ { colspan: 2, contents: '40' }, '42' ]
				] ) );
			} );

			it( 'should remove empty row if merging table cells ', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, '01', { rowspan: 3, contents: '02' } ],
					[ '11[]' ],
					[ '20', '21' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '00', '<paragraph>[01</paragraph><paragraph>11]</paragraph>', { rowspan: 2, contents: '02' } ],
					[ '20', '21' ]
				] ) );
			} );

			it( 'should not reduce rowspan on cells above removed empty row when merging table cells ', () => {
				setData( model, modelTable( [
					[ { rowspan: 2, contents: '00' }, '01', '02' ],
					[ '11', '12' ],
					[ { rowspan: 2, contents: '20' }, '21', { rowspan: 3, contents: '22' } ],
					[ '31[]' ],
					[ '40', '41' ]
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ { rowspan: 2, contents: '00' }, '01', '02' ],
					[ '11', '12' ],
					[ '20', '<paragraph>[21</paragraph><paragraph>31]</paragraph>', { rowspan: 2, contents: '22' } ],
					[ '40', '41' ]
				] ) );
			} );

			it( 'should adjust heading rows if empty row was removed ', () => {
				// +----+----+
				// | 00 | 01 |
				// +    +----+
				// |    | 11 |
				// +----+----+ <-- heading rows
				// | 20 | 21 |
				// +----+----+
				setData( model, modelTable( [
					[ { contents: '00', rowspan: 2 }, '01' ],
					[ '[]11' ],
					[ '20', '21' ]
				], { headingRows: 2 } ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelTable( [
					[ '00', '<paragraph>[01</paragraph><paragraph>11]</paragraph>' ],
					[ '20', '21' ]
				], { headingRows: 1 } ) );
			} );

			it( 'should create one undo step (1 batch)', () => {
				// +----+----+
				// | 00 | 01 |
				// +    +----+
				// |    | 11 |
				// +----+----+ <-- heading rows
				// | 20 | 21 |
				// +----+----+
				setData( model, modelTable( [
					[ { contents: '00', rowspan: 2 }, '01' ],
					[ '[]11' ],
					[ '20', '21' ]
				], { headingRows: 2 } ) );

				const createdBatches = new Set();

				model.on( 'applyOperation', ( evt, [ operation ] ) => {
					createdBatches.add( operation.batch );
				} );

				command.execute();

				expect( createdBatches.size ).to.equal( 1 );
			} );
		} );
	} );
} );
