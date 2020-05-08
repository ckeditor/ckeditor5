/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../src/tableediting';
import { assertSelectedCells, modelTable, viewTable } from './_utils/utils';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

import TableClipboard from '../src/tableclipboard';

describe( 'table clipboard', () => {
	let editor, model, modelRoot, tableSelection, viewDocument, element;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ TableEditing, TableClipboard, Paragraph, Clipboard ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
		viewDocument = editor.editing.view.document;
		tableSelection = editor.plugins.get( 'TableSelection' );

		setModelData( model, modelTable( [
			[ '00[]', '01', '02' ],
			[ '10', '11', '12' ],
			[ '20', '21', '22' ]
		] ) );
	} );

	afterEach( async () => {
		await editor.destroy();

		element.remove();
	} );

	describe( 'Clipboard integration', () => {
		describe( 'copy', () => {
			it( 'should do nothing for normal selection in table', () => {
				const dataTransferMock = createDataTransfer();
				const spy = sinon.spy();

				viewDocument.on( 'clipboardOutput', spy );

				viewDocument.fire( 'copy', {
					dataTransfer: dataTransferMock,
					preventDefault: sinon.spy()
				} );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should copy selected table cells as a standalone table', () => {
				const preventDefaultSpy = sinon.spy();

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 2 ] )
				);

				const data = {
					dataTransfer: createDataTransfer(),
					preventDefault: preventDefaultSpy
				};
				viewDocument.fire( 'copy', data );

				sinon.assert.calledOnce( preventDefaultSpy );
				expect( data.dataTransfer.getData( 'text/html' ) ).to.equal( viewTable( [
					[ '01', '02' ],
					[ '11', '12' ]
				] ) );
			} );

			it( 'should trim selected table to a selection rectangle (inner cell with colspan, no colspan after trim)', () => {
				setModelData( model, modelTable( [
					[ '00[]', '01', '02' ],
					[ '10', { contents: '11', colspan: 2 } ],
					[ '20', '21', '22' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 1 ] )
				);

				assertClipboardContentOnMethod( 'copy', viewTable( [
					[ '00', '01' ],
					[ '10', '11' ],
					[ '20', '21' ]
				] ) );
			} );

			it( 'should trim selected table to a selection rectangle (inner cell with colspan, has colspan after trim)', () => {
				setModelData( model, modelTable( [
					[ '00[]', '01', '02' ],
					[ { contents: '10', colspan: 3 } ],
					[ '20', '21', '22' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 1 ] )
				);

				assertClipboardContentOnMethod( 'copy', viewTable( [
					[ '00', '01' ],
					[ { contents: '10', colspan: 2 } ],
					[ '20', '21' ]
				] ) );
			} );

			it( 'should trim selected table to a selection rectangle (inner cell with rowspan, no colspan after trim)', () => {
				setModelData( model, modelTable( [
					[ '00[]', '01', '02' ],
					[ '10', { contents: '11', rowspan: 2 }, '12' ],
					[ '20', '21', '22' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 2 ] )
				);

				assertClipboardContentOnMethod( 'copy', viewTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				] ) );
			} );

			it( 'should trim selected table to a selection rectangle (inner cell with rowspan, has rowspan after trim)', () => {
				setModelData( model, modelTable( [
					[ '00[]', { contents: '01', rowspan: 3 }, '02' ],
					[ '10', '12' ],
					[ '20', '22' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				assertClipboardContentOnMethod( 'copy', viewTable( [
					[ '00', { contents: '01', rowspan: 2 }, '02' ],
					[ '10', '12' ]
				] ) );
			} );

			it( 'should prepend spanned columns with empty cells (outside cell with colspan)', () => {
				setModelData( model, modelTable( [
					[ '00[]', '01', '02' ],
					[ { contents: '10', colspan: 2 }, '12' ],
					[ '20', '21', '22' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 2 ] )
				);

				assertClipboardContentOnMethod( 'copy', viewTable( [
					[ '01', '02' ],
					[ '&nbsp;', '12' ],
					[ '21', '22' ]
				] ) );
			} );

			it( 'should prepend spanned columns with empty cells (outside cell with rowspan)', () => {
				setModelData( model, modelTable( [
					[ '00[]', { contents: '01', rowspan: 2 }, '02' ],
					[ '10', '12' ],
					[ '20', '21', '22' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 2 ] )
				);

				assertClipboardContentOnMethod( 'copy', viewTable( [
					[ '10', '&nbsp;', '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			it( 'should fix selected table to a selection rectangle (hardcore case)', () => {
				// This test check how previous simple rules run together (mixed prepending and trimming).
				// In the example below a selection is set from cell "32" to "88"
				//
				//                    Input table:                                         Copied table:
				//
				//   +----+----+----+----+----+----+----+----+----+
				//   | 00 | 01 | 02 | 03 | 04      | 06 | 07 | 08 |
				//   +----+----+    +----+         +----+----+----+
				//   | 10 | 11 |    | 13 |         | 16 | 17 | 18 |
				//   +----+----+    +----+         +----+----+----+             +----+----+----+---------+----+----+
				//   | 20 | 21 |    | 23 |         | 26           |             | 21 |    | 23 |    |    | 26 |    |
				//   +----+----+    +----+         +----+----+----+             +----+----+----+----+----+----+----+
				//   | 30 | 31 |    | 33 |         | 36 | 37      |             | 31 |    | 33 |    |    | 36 | 37 |
				//   +----+----+----+----+         +----+----+----+             +----+----+----+----+----+----+----+
				//   | 40                |         | 46 | 47 | 48 |             |    |    |    |    |    | 46 | 47 |
				//   +----+----+----+----+         +----+----+----+     ==>     +----+----+----+----+----+----+----+
				//   | 50 | 51 | 52 | 53 |         | 56 | 57 | 58 |             | 51 | 52 | 53 |    |    | 56 | 57 |
				//   +----+----+----+----+----+----+    +----+----+             +----+----+----+----+----+----+----+
				//   | 60 | 61           | 64 | 65 |    | 67 | 68 |             | 61 |    |    | 64 | 65 |    | 67 |
				//   +----+----+----+----+----+----+    +----+----+             +----+----+----+----+----+----+----+
				//   | 70 | 71 | 72 | 73 | 74 | 75 |    | 77 | 78 |             | 71 | 72 | 73 | 74 | 75 |    | 77 |
				//   +----+    +----+----+----+----+    +----+----+             +----+----+----+----+----+----+----+
				//   | 80 |    | 82 | 83 | 84 | 85 |    | 87 | 88 |
				//   +----+----+----+----+----+----+----+----+----+
				//
				setModelData( model, modelTable( [
					[ '00', '01', { contents: '02', rowspan: 4 }, '03', { contents: '04', colspan: 2, rowspan: 7 }, '07', '07', '08' ],
					[ '10', '11', '13', '17', '17', '18' ],
					[ '20', '21', '23', { contents: '27', colspan: 3 } ],
					[ '30', '31', '33', '37', { contents: '37', colspan: 2 } ],
					[ { contents: '40', colspan: 4 }, '47', '47', '48' ],
					[ '50', '51', '52', '53', { contents: '57', rowspan: 4 }, '57', '58' ],
					[ '60', { contents: '61', colspan: 3 }, '67', '68' ],
					[ '70', { contents: '71', rowspan: 2 }, '72', '73', '74', '75', '77', '78' ],
					[ '80', '82', '83', '84', '85', '87', '88' ]
				] ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 2, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 7, 6 ] )
				);

				assertClipboardContentOnMethod( 'copy', viewTable( [
					[ '21', '&nbsp;', '23', '&nbsp;', '&nbsp;', { contents: '27', colspan: 2 } ],
					[ '31', '&nbsp;', '33', '&nbsp;', '&nbsp;', '37', '37' ],
					[ '&nbsp;', '&nbsp;', '&nbsp;', '&nbsp;', '&nbsp;', '47', '47' ],
					[ '51', '52', '53', '&nbsp;', '&nbsp;', { contents: '57', rowspan: 3 }, '57' ],
					[ { contents: '61', colspan: 3 }, '&nbsp;', '&nbsp;', '&nbsp;', '67' ],
					[ '71', '72', '73', '74', '75', '77' ]
				] ) );
			} );

			it( 'should update table heading attributes (selection with headings)', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02', '03', '04' ],
					[ '10', '11', '12', '13', '14' ],
					[ '20', '21', '22', '23', '24' ],
					[ '30', '31', '32', '33', '34' ],
					[ '40', '41', '42', '43', '44' ]
				], { headingRows: 3, headingColumns: 2 } ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 3, 3 ] )
				);

				assertClipboardContentOnMethod( 'copy', viewTable( [
					[ '11', '12', '13' ],
					[ '21', '22', '23' ],
					[ { contents: '31', isHeading: true }, '32', '33' ] // TODO: bug in viewTable
				], { headingRows: 2, headingColumns: 1 } ) );
			} );

			it( 'should update table heading attributes (selection without headings)', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02', '03', '04' ],
					[ '10', '11', '12', '13', '14' ],
					[ '20', '21', '22', '23', '24' ],
					[ '30', '31', '32', '33', '34' ],
					[ '40', '41', '42', '43', '44' ]
				], { headingRows: 3, headingColumns: 2 } ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 3, 2 ] ),
					modelRoot.getNodeByPath( [ 0, 4, 4 ] )
				);

				assertClipboardContentOnMethod( 'copy', viewTable( [
					[ '32', '33', '34' ],
					[ '42', '43', '44' ]
				] ) );
			} );
		} );

		describe( 'cut', () => {
			it( 'should not block clipboardOutput if no multi-cell selection', () => {
				setModelData( model, modelTable( [
					[ '[00]', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ]
				] ) );

				const dataTransferMock = createDataTransfer();

				viewDocument.fire( 'cut', {
					dataTransfer: dataTransferMock,
					preventDefault: sinon.spy()
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).to.equal( '00' );
			} );

			it( 'should be preventable', () => {
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				viewDocument.on( 'clipboardOutput', evt => evt.stop(), { priority: 'high' } );

				viewDocument.fire( 'cut', {
					dataTransfer: createDataTransfer(),
					preventDefault: sinon.spy()
				} );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true }, '02' ],
					[ { contents: '10', isSelected: true }, { contents: '11', isSelected: true }, '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			it( 'is clears selected table cells', () => {
				const spy = sinon.spy();

				viewDocument.on( 'clipboardOutput', spy );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				viewDocument.fire( 'cut', {
					dataTransfer: createDataTransfer(),
					preventDefault: sinon.spy()
				} );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '', '', '02' ],
					[ '', '[]', '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			it( 'should copy selected table cells as a standalone table', () => {
				const preventDefaultSpy = sinon.spy();

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 2 ] )
				);

				const data = {
					dataTransfer: createDataTransfer(),
					preventDefault: preventDefaultSpy
				};
				viewDocument.fire( 'cut', data );

				sinon.assert.calledOnce( preventDefaultSpy );
				expect( data.dataTransfer.getData( 'text/html' ) ).to.equal( viewTable( [
					[ '01', '02' ],
					[ '11', '12' ]
				] ) );
			} );

			it( 'should be disabled in a readonly mode', () => {
				const preventDefaultStub = sinon.stub();

				editor.isReadOnly = true;

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 2 ] )
				);

				const data = {
					dataTransfer: createDataTransfer(),
					preventDefault: preventDefaultStub
				};
				viewDocument.fire( 'cut', data );

				editor.isReadOnly = false;

				expect( data.dataTransfer.getData( 'text/html' ) ).to.be.undefined;
				assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ]
				] ) );

				sinon.assert.calledOnce( preventDefaultStub );
			} );
		} );

		describe( 'paste', () => {
			beforeEach( () => {
				setModelData( model, modelTable( [
					[ '00[]', '01', '02', '03' ],
					[ '10', '11', '12', '13' ],
					[ '20', '21', '22', '23' ],
					[ '30', '31', '32', '33' ]
				] ) );
			} );

			it( 'should be disabled in a readonly mode', () => {
				editor.isReadOnly = true;

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				const data = pasteTable( [
					[ 'aa', 'ab' ],
					[ 'ba', 'bb' ]
				] );

				editor.isReadOnly = false;

				assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '01', '02', '03' ],
					[ '10', '11', '12', '13' ],
					[ '20', '21', '22', '23' ],
					[ '30', '31', '32', '33' ]
				] ) );

				sinon.assert.calledOnce( data.preventDefault );
			} );

			it( 'should allow normal paste if no table cells are selected', () => {
				const data = {
					dataTransfer: createDataTransfer(),
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};
				data.dataTransfer.setData( 'text/html', '<p>foo</p>' );
				viewDocument.fire( 'paste', data );

				editor.isReadOnly = false;

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '00foo[]', '01', '02', '03' ],
					[ '10', '11', '12', '13' ],
					[ '20', '21', '22', '23' ],
					[ '30', '31', '32', '33' ]
				] ) );
			} );

			describe( 'pasted table is equal to the selected area', () => {
				describe( 'no spans', () => {
					it( 'handles simple table paste to a simple table fragment - at the beginning of a table', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 1, 1 ] )
						);

						pasteTable( [
							[ 'aa', 'ab' ],
							[ 'ba', 'bb' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', 'ab', '02', '03' ],
							[ 'ba', 'bb', '12', '13' ],
							[ '20', '21', '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						assertSelectedCells( model, [
							[ 1, 1, 0, 0 ],
							[ 1, 1, 0, 0 ],
							[ 0, 0, 0, 0 ],
							[ 0, 0, 0, 0 ]
						] );
					} );

					it( 'handles simple table paste to a simple table fragment - at the end of a table', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 2, 2 ] ),
							modelRoot.getNodeByPath( [ 0, 3, 3 ] )
						);

						pasteTable( [
							[ 'aa', 'ab' ],
							[ 'ba', 'bb' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', '11', '12', '13' ],
							[ '20', '21', 'aa', 'ab' ],
							[ '30', '31', 'ba', 'bb' ]
						] ) );

						assertSelectedCells( model, [
							[ 0, 0, 0, 0 ],
							[ 0, 0, 0, 0 ],
							[ 0, 0, 1, 1 ],
							[ 0, 0, 1, 1 ]
						] );
					} );

					it( 'handles simple table paste to a simple table fragment - in the middle of a table', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 2 ] )
						);

						pasteTable( [
							[ 'aa', 'ab' ],
							[ 'ba', 'bb' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', 'aa', 'ab', '13' ],
							[ '20', 'ba', 'bb', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						assertSelectedCells( model, [
							[ 0, 0, 0, 0 ],
							[ 0, 1, 1, 0 ],
							[ 0, 1, 1, 0 ],
							[ 0, 0, 0, 0 ]
						] );
					} );

					it( 'handles simple row paste to a simple row fragment - in the middle of a table', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
							modelRoot.getNodeByPath( [ 0, 1, 2 ] )
						);

						pasteTable( [
							[ 'aa', 'ab' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', 'aa', 'ab', '13' ],
							[ '20', '21', '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						assertSelectedCells( model, [
							[ 0, 0, 0, 0 ],
							[ 0, 1, 1, 0 ],
							[ 0, 0, 0, 0 ],
							[ 0, 0, 0, 0 ]
						] );
					} );

					it( 'handles simple column paste to a simple column fragment - in the middle of a table', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 1 ] )
						);

						pasteTable( [
							[ 'aa' ],
							[ 'ba' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', 'aa', '12', '13' ],
							[ '20', 'ba', '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						assertSelectedCells( model, [
							[ 0, 0, 0, 0 ],
							[ 0, 1, 0, 0 ],
							[ 0, 1, 0, 0 ],
							[ 0, 0, 0, 0 ]
						] );
					} );

					it( 'handles simple table paste to a simple table fragment - whole table selected', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 3, 3 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac', 'ad' ],
							[ 'ba', 'bb', 'bc', 'bd' ],
							[ 'ca', 'cb', 'cc', 'cd' ],
							[ 'da', 'db', 'dc', 'dd' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', 'ab', 'ac', 'ad' ],
							[ 'ba', 'bb', 'bc', 'bd' ],
							[ 'ca', 'cb', 'cc', 'cd' ],
							[ 'da', 'db', 'dc', 'dd' ]
						] ) );

						assertSelectedCells( model, [
							[ 1, 1, 1, 1 ],
							[ 1, 1, 1, 1 ],
							[ 1, 1, 1, 1 ],
							[ 1, 1, 1, 1 ]
						] );
					} );
				} );

				describe( 'pasted table has spans', () => {
					it( 'handles pasting table that has cell with colspan', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 2 ] )
						);

						pasteTable( [
							[ { colspan: 2, contents: 'aa' } ],
							[ 'ba', 'bb' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', { colspan: 2, contents: 'aa' }, '13' ],
							[ '20', 'ba', 'bb', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 0, 0, 0, 0 ],
							[ 0, 1, 0 ],
							[ 0, 1, 1, 0 ],
							[ 0, 0, 0, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					it( 'handles pasting table that has many cells with various colspan', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 3, 2 ] )
						);

						pasteTable( [
							[ 'aa', { colspan: 2, contents: 'ab' } ],
							[ { colspan: 3, contents: 'ba' } ],
							[ 'ca', 'cb', 'cc' ],
							[ { colspan: 2, contents: 'da' }, 'dc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', { colspan: 2, contents: 'ab' }, '03' ],
							[ { colspan: 3, contents: 'ba' }, '13' ],
							[ 'ca', 'cb', 'cc', '23' ],
							[ { colspan: 2, contents: 'da' }, 'dc', '33' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 1, 1,    0 ],
							[ 1,       0 ],
							[ 1, 1, 1, 0 ],
							[ 1,    1, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					it( 'handles pasting table that has cell with rowspan', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 2 ] )
						);

						pasteTable( [
							[ { rowspan: 2, contents: 'aa' }, 'ab' ],
							[ 'bb' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', { rowspan: 2, contents: 'aa' }, 'ab', '13' ],
							[ '20', 'bb', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 0, 0, 0, 0 ],
							[ 0, 1, 1, 0 ],
							[ 0,    1, 0 ],
							[ 0, 0, 0, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					it( 'handles pasting table that has many cells with various rowspan', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 3 ] )
						);

						pasteTable( [
							[ 'aa', { rowspan: 3, contents: 'ab' }, { rowspan: 2, contents: 'ac' }, 'ad' ],
							[ { rowspan: 2, contents: 'ba' }, 'bd' ],
							[ 'cc', 'cd' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', { rowspan: 3, contents: 'ab' }, { rowspan: 2, contents: 'ac' }, 'ad' ],
							[ { rowspan: 2, contents: 'ba' }, 'bd' ],
							[ 'cc', 'cd' ],
							[ '30', '31', '32', '33' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 1, 1, 1, 1 ],
							[ 1,       1 ],
							[       1, 1 ],
							[ 0,    0, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					it( 'handles pasting multi-spanned table', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02', '03', '04', '05' ],
							[ '10', '11', '12', '13', '14', '15' ],
							[ '20', '21', '22', '23', '24', '25' ],
							[ '30', '31', '32', '33', '34', '35' ],
							[ '40', '41', '42', '43', '44', '45' ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 3, 4 ] )
						);

						// +----+----+----+----+----+
						// | aa      | ac | ad | ae |
						// +----+----+----+----+    +
						// | ba | bb           |    |
						// +----+              +----+
						// | ca |              | ce |
						// +    +----+----+----+----+
						// |    | db | dc | dd      |
						// +----+----+----+----+----+
						pasteTable( [
							[ { contents: 'aa', colspan: 2 }, 'ac', 'ad', { contents: 'ae', rowspan: 2 } ],
							[ 'ba', { contents: 'bb', colspan: 3, rowspan: 2 } ],
							[ { contents: 'ca', rowspan: 2 }, 'ce' ],
							[ 'db', 'dc', { contents: 'dd', colspan: 2 } ]
						] );

						// +----+----+----+----+----+----+
						// | aa      | ac | ad | ae | 05 |
						// +----+----+----+----+    +----+
						// | ba | bb           |    | 15 |
						// +----+              +----+----+
						// | ca |              | ce | 25 |
						// +    +----+----+----+----+----+
						// |    | db | dc | dd      | 35 |
						// +----+----+----+----+----+----+
						// | 40 | 41 | 42 | 43 | 44 | 45 |
						// +----+----+----+----+----+----+
						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ { contents: 'aa', colspan: 2 }, 'ac', 'ad', { contents: 'ae', rowspan: 2 }, '05' ],
							[ 'ba', { contents: 'bb', colspan: 3, rowspan: 2 }, '15' ],
							[ { contents: 'ca', rowspan: 2 }, 'ce', '25' ],
							[ 'db', 'dc', { contents: 'dd', colspan: 2 }, '35' ],
							[ '40', '41', '42', '43', '44', '45' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 1,    1, 1, 1, 0 ],
							[ 1, 1,          0 ],
							[ 1,          1, 0 ],
							[    1, 1, 1,    0 ],
							[ 0, 0, 0, 0, 0, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );
				} );

				describe( 'content table has spans', () => {
					it( 'handles pasting simple table over a table with colspans (no colspan exceeds selection)', () => {
						setModelData( model, modelTable( [
							[ '00[]', '01', '02', '03' ],
							[ { colspan: 3, contents: '10' }, '13' ],
							[ { colspan: 2, contents: '20' }, '22', '23' ],
							[ '30', '31', { colspan: 2, contents: '31' } ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 1 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac' ],
							[ 'ba', 'bb', 'bc' ],
							[ 'ca', 'cb', 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', 'ab', 'ac', '03' ],
							[ 'ba', 'bb', 'bc', '13' ],
							[ 'ca', 'cb', 'cc', '23' ],
							[ '30', '31', { colspan: 2, contents: '31' } ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 1, 1, 1, 0 ],
							[ 1, 1, 1, 0 ],
							[ 1, 1, 1, 0 ],
							[ 0, 0, 0    ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					it( 'handles pasting simple table over a table with rowspans (no rowspan exceeds selection)', () => {
						setModelData( model, modelTable( [
							[ '00', { rowspan: 3, contents: '01' }, { rowspan: 2, contents: '02' }, '03' ],
							[ { rowspan: 2, contents: '10' }, '13' ],
							[ '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 0 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac' ],
							[ 'ba', 'bb', 'bc' ],
							[ 'ca', 'cb', 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', 'ab', 'ac', '03' ],
							[ 'ba', 'bb', 'bc', '13' ],
							[ 'ca', 'cb', 'cc', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						assertSelectedCells( model, [
							[ 1, 1, 1, 0 ],
							[ 1, 1, 1, 0 ],
							[ 1, 1, 1, 0 ],
							[ 0, 0, 0, 0 ]
						] );
					} );

					it( 'handles pasting simple table over table with multi-spans (no span exceeds selection)', () => {
						// +----+----+----+----+----+----+
						// | 00      | 02 | 03      | 05 |
						// +         +    +         +----+
						// |         |    |         | 15 |
						// +----+----+----+         +----+
						// | 20 | 21      |         | 25 |
						// +    +----+----+----+----+----+
						// |    | 31 | 32      | 34 | 35 |
						// +----+----+----+----+----+----+
						// | 40 | 41 | 42 | 43 | 44 | 45 |
						// +----+----+----+----+----+----+
						setModelData( model, modelTable( [
							[
								{ contents: '00', colspan: 2, rowspan: 2 },
								{ contents: '02', rowspan: 2 },
								{ contents: '03', colspan: 2, rowspan: 3 },
								'05'
							],
							[ '15' ],
							[ { contents: '20', rowspan: 2 }, { contents: '21', colspan: 2 }, '25' ],
							[ '31', { contents: '32', colspan: 2 }, '34', '35' ],
							[ '40', '41', '42', '43', '44', '45' ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 3, 2 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac', 'ad', 'ae' ],
							[ 'ba', 'bb', 'bc', 'bd', 'be' ],
							[ 'ca', 'cb', 'cc', 'cd', 'ce' ],
							[ 'da', 'db', 'dc', 'dd', 'de' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', 'ab', 'ac', 'ad', 'ae', '05' ],
							[ 'ba', 'bb', 'bc', 'bd', 'be', '15' ],
							[ 'ca', 'cb', 'cc', 'cd', 'ce', '25' ],
							[ 'da', 'db', 'dc', 'dd', 'de', '35' ],
							[ '40', '41', '42', '43', '44', '45' ]
						] ) );

						assertSelectedCells( model, [
							[ 1, 1, 1, 1, 1, 0 ],
							[ 1, 1, 1, 1, 1, 0 ],
							[ 1, 1, 1, 1, 1, 0 ],
							[ 1, 1, 1, 1, 1, 0 ],
							[ 0, 0, 0, 0, 0, 0 ]
						] );
					} );

					// TODO: Skipped case - should allow pasting but no tools to compare areas (like in MergeCellsCommand).
					it.skip( 'handles pasting table that has cell with colspan (last row in selection is spanned)', () => {
						// +----+----+----+----+
						// | 00 | 01 | 02 | 03 |
						// +----+----+----+----+
						// | 10 | 11      | 13 |
						// +    +         +----+
						// |    |         | 23 |
						// +----+----+----+----+
						// | 30 | 31 | 32 | 33 |
						// +----+----+----+----+
						setModelData( model, modelTable( [
							[ '00', '01', '02', '03' ],
							[ { contents: '10', rowspan: 2 }, { contents: '11', colspan: 2, rowspan: 2 }, '13' ],
							[ '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 2 ] ),
							modelRoot.getNodeByPath( [ 0, 1, 0 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac' ],
							[ 'ba', 'bb', 'bc' ],
							[ 'ca', 'cb', 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', 'ab', 'ac', '03' ],
							[ 'ba', 'bb', 'bc', '13' ],
							[ 'ca', 'cb', 'cc', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						assertSelectedCells( model, [
							[ 1, 1, 1, 0 ],
							[ 1, 1, 1, 0 ],
							[ 1, 1, 1, 0 ],
							[ 0, 0, 0, 0 ]
						] );
					} );
				} );

				describe( 'content and paste tables have spans', () => {
					it( 'handles pasting colspanned table over table with colspans (no colspan exceeds selection)', () => {
						setModelData( model, modelTable( [
							[ '00[]', '01', '02', '03' ],
							[ { colspan: 3, contents: '10' }, '13' ],
							[ { colspan: 2, contents: '20' }, '22', '23' ],
							[ '30', '31', { colspan: 2, contents: '31' } ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 1 ] )
						);

						pasteTable( [
							[ 'aa', { colspan: 2, contents: 'ab' } ],
							[ { colspan: 3, contents: 'ba' } ],
							[ 'ca', 'cb', 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', { colspan: 2, contents: 'ab' }, '03' ],
							[ { colspan: 3, contents: 'ba' }, '13' ],
							[ 'ca', 'cb', 'cc', '23' ],
							[ '30', '31', { colspan: 2, contents: '31' } ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 1, 1,    0 ],
							[ 1,       0 ],
							[ 1, 1, 1, 0 ],
							[ 0, 0, 0    ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					it( 'handles pasting rowspanned table over table with rowspans (no rowspan exceeds selection)', () => {
						setModelData( model, modelTable( [
							[ { rowspan: 3, contents: '00' }, { rowspan: 2, contents: '01' }, '02', '03' ],
							[ { rowspan: 2, contents: '12' }, '13' ],
							[ '21', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 1 ] )
						);

						pasteTable( [
							[ 'aa', { rowspan: 3, contents: 'ab' }, { rowspan: 2, contents: 'ac' }, 'ad' ],
							[ { rowspan: 2, contents: 'ba' }, 'bd' ],
							[ 'cc', 'cd' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', { rowspan: 3, contents: 'ab' }, { rowspan: 2, contents: 'ac' }, 'ad' ],
							[ { rowspan: 2, contents: 'ba' }, 'bd' ],
							[ 'cc', 'cd' ],
							[ '30', '31', '32', '33' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 1, 1, 1, 1 ],
							[ 1,       1 ],
							[       1, 1 ],
							[ 0, 0, 0, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					it( 'handles pasting multi-spanned table over table with multi-spans (no span exceeds selection)', () => {
						// +----+----+----+----+----+----+
						// | 00      | 02 | 03      | 05 |
						// +         +    +         +----+
						// |         |    |         | 15 |
						// +----+----+----+         +----+
						// | 20 | 21      |         | 25 |
						// +    +----+----+----+----+----+
						// |    | 31 | 32      | 34 | 35 |
						// +----+----+----+----+----+----+
						// | 40 | 41 | 42 | 43 | 44 | 45 |
						// +----+----+----+----+----+----+
						setModelData( model, modelTable( [
							[
								{ contents: '00', colspan: 2, rowspan: 2 },
								{ contents: '02', rowspan: 2 },
								{ contents: '03', colspan: 2, rowspan: 3 },
								'05'
							],
							[ '15' ],
							[ { contents: '20', rowspan: 2 }, { contents: '21', colspan: 2 }, '25' ],
							[ '31', { contents: '32', colspan: 2 }, '34', '35' ],
							[ '40', '41', '42', '43', '44', '45' ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 3, 2 ] )
						);

						// +----+----+----+----+----+
						// | aa      | ac | ad | ae |
						// +----+----+----+----+    +
						// | ba | bb           |    |
						// +----+              +----+
						// | ca |              | ce |
						// +    +----+----+----+----+
						// |    | db | dc | dd      |
						// +----+----+----+----+----+
						pasteTable( [
							[ { contents: 'aa', colspan: 2 }, 'ac', 'ad', { contents: 'ae', rowspan: 2 } ],
							[ 'ba', { contents: 'bb', colspan: 3, rowspan: 2 } ],
							[ { contents: 'ca', rowspan: 2 }, 'ce' ],
							[ 'db', 'dc', { contents: 'dd', colspan: 2 } ]
						] );

						// +----+----+----+----+----+----+
						// | aa      | ac | ad | ae | 05 |
						// +----+----+----+----+    +----+
						// | ba | bb           |    | 15 |
						// +----+              +----+----+
						// | ca |              | ce | 25 |
						// +    +----+----+----+----+----+
						// |    | db | dc | dd      | 35 |
						// +----+----+----+----+----+----+
						// | 40 | 41 | 42 | 43 | 44 | 45 |
						// +----+----+----+----+----+----+
						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ { contents: 'aa', colspan: 2 }, 'ac', 'ad', { contents: 'ae', rowspan: 2 }, '05' ],
							[ 'ba', { contents: 'bb', colspan: 3, rowspan: 2 }, '15' ],
							[ { contents: 'ca', rowspan: 2 }, 'ce', '25' ],
							[ 'db', 'dc', { contents: 'dd', colspan: 2 }, '35' ],
							[ '40', '41', '42', '43', '44', '45' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 1,    1, 1, 1, 0 ],
							[ 1, 1,          0 ],
							[ 1,          1, 0 ],
							[    1, 1, 1,    0 ],
							[ 0, 0, 0, 0, 0, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					// TODO: Skipped case - should allow pasting but no tools to compare areas (like in MergeCellsCommand).
					it.skip( 'handles pasting table that has cell with colspan (last row in selection is spanned)', () => {
						// +----+----+----+----+
						// | 00 | 01 | 02 | 03 |
						// +----+----+----+----+
						// | 10 | 11      | 13 |
						// +    +         +----+
						// |    |         | 23 |
						// +----+----+----+----+
						// | 30 | 31 | 32 | 33 |
						// +----+----+----+----+
						setModelData( model, modelTable( [
							[ '00', '01', '02', '03' ],
							[ { contents: '10', rowspan: 2 }, { contents: '11', colspan: 2, rowspan: 2 }, '13' ],
							[ '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 2 ] ),
							modelRoot.getNodeByPath( [ 0, 1, 0 ] )
						);

						// +----+----+----+
						// | aa | ab | ac |
						// +----+----+----+
						// | ba      | bc |
						// +         +----+
						// |         | cc |
						// +----+----+----+
						pasteTable( [
							[ 'aa', 'ab', 'ac' ],
							[ { contents: 'ba', colspan: 2, rowspan: 2 }, 'bc' ],
							[ 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', { colspan: 2, contents: 'aa' }, '13' ],
							[ '20', 'ba', 'bb', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 0, 0, 0, 0 ],
							[ 0, 1, 0 ],
							[ 0, 1, 1, 0 ],
							[ 0, 0, 0, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );
				} );
			} );

			describe( 'pasted table is bigger than the selected area', () => {
				describe( 'no spans', () => {
					it( 'handles simple table paste to a simple table fragment - at the beginning of a table', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 1, 1 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac' ],
							[ 'ba', 'bb', 'bc' ],
							[ 'ca', 'cb', 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', 'ab', '02', '03' ],
							[ 'ba', 'bb', '12', '13' ],
							[ '20', '21', '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						assertSelectedCells( model, [
							[ 1, 1, 0, 0 ],
							[ 1, 1, 0, 0 ],
							[ 0, 0, 0, 0 ],
							[ 0, 0, 0, 0 ]
						] );
					} );

					it( 'handles simple table paste to a simple table fragment - at the end of a table', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 2, 2 ] ),
							modelRoot.getNodeByPath( [ 0, 3, 3 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac' ],
							[ 'ba', 'bb', 'bc' ],
							[ 'ca', 'cb', 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', '11', '12', '13' ],
							[ '20', '21', 'aa', 'ab' ],
							[ '30', '31', 'ba', 'bb' ]
						] ) );

						assertSelectedCells( model, [
							[ 0, 0, 0, 0 ],
							[ 0, 0, 0, 0 ],
							[ 0, 0, 1, 1 ],
							[ 0, 0, 1, 1 ]
						] );
					} );

					it( 'handles simple table paste to a simple table fragment - in the middle of a table', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 2 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac' ],
							[ 'ba', 'bb', 'bc' ],
							[ 'ca', 'cb', 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', 'aa', 'ab', '13' ],
							[ '20', 'ba', 'bb', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						assertSelectedCells( model, [
							[ 0, 0, 0, 0 ],
							[ 0, 1, 1, 0 ],
							[ 0, 1, 1, 0 ],
							[ 0, 0, 0, 0 ]
						] );
					} );

					it( 'handles paste to a simple row fragment - in the middle of a table', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
							modelRoot.getNodeByPath( [ 0, 1, 2 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac' ],
							[ 'ba', 'bb', 'bc' ],
							[ 'ca', 'cb', 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', 'aa', 'ab', '13' ],
							[ '20', '21', '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						assertSelectedCells( model, [
							[ 0, 0, 0, 0 ],
							[ 0, 1, 1, 0 ],
							[ 0, 0, 0, 0 ],
							[ 0, 0, 0, 0 ]
						] );
					} );

					it( 'handles paste to a simple column fragment - in the middle of a table', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 1 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac' ],
							[ 'ba', 'bb', 'bc' ],
							[ 'ca', 'cb', 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', 'aa', '12', '13' ],
							[ '20', 'ba', '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						assertSelectedCells( model, [
							[ 0, 0, 0, 0 ],
							[ 0, 1, 0, 0 ],
							[ 0, 1, 0, 0 ],
							[ 0, 0, 0, 0 ]
						] );
					} );

					it( 'handles simple table paste to a simple table fragment - whole table selected', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 3, 3 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac', 'ad', 'ae' ],
							[ 'ba', 'bb', 'bc', 'bd', 'be' ],
							[ 'ca', 'cb', 'cc', 'cd', 'ce' ],
							[ 'da', 'db', 'dc', 'dd', 'de' ],
							[ 'ea', 'eb', 'ec', 'ed', 'ee' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', 'ab', 'ac', 'ad' ],
							[ 'ba', 'bb', 'bc', 'bd' ],
							[ 'ca', 'cb', 'cc', 'cd' ],
							[ 'da', 'db', 'dc', 'dd' ]
						] ) );

						assertSelectedCells( model, [
							[ 1, 1, 1, 1 ],
							[ 1, 1, 1, 1 ],
							[ 1, 1, 1, 1 ],
							[ 1, 1, 1, 1 ]
						] );
					} );
				} );

				describe.skip( 'pasted table has spans', () => {
					it( 'handles pasting table that has cell with colspan', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 2 ] )
						);

						pasteTable( [
							[ { colspan: 2, contents: 'aa' } ],
							[ 'ba', 'bb' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', { colspan: 2, contents: 'aa' }, '13' ],
							[ '20', 'ba', 'bb', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 0, 0, 0, 0 ],
							[ 0, 1, 0 ],
							[ 0, 1, 1, 0 ],
							[ 0, 0, 0, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					it( 'handles pasting table that has many cells with various colspan', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 3, 2 ] )
						);

						pasteTable( [
							[ 'aa', { colspan: 2, contents: 'ab' } ],
							[ { colspan: 3, contents: 'ba' } ],
							[ 'ca', 'cb', 'cc' ],
							[ { colspan: 2, contents: 'da' }, 'dc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', { colspan: 2, contents: 'ab' }, '03' ],
							[ { colspan: 3, contents: 'ba' }, '13' ],
							[ 'ca', 'cb', 'cc', '23' ],
							[ { colspan: 2, contents: 'da' }, 'dc', '33' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 1, 1,    0 ],
							[ 1,       0 ],
							[ 1, 1, 1, 0 ],
							[ 1,    1, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					it( 'handles pasting table that has cell with rowspan', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 2 ] )
						);

						pasteTable( [
							[ { rowspan: 2, contents: 'aa' }, 'ab' ],
							[ 'bb' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', { rowspan: 2, contents: 'aa' }, 'ab', '13' ],
							[ '20', 'bb', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 0, 0, 0, 0 ],
							[ 0, 1, 1, 0 ],
							[ 0,    1, 0 ],
							[ 0, 0, 0, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					it( 'handles pasting table that has many cells with various rowspan', () => {
						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 3 ] )
						);

						pasteTable( [
							[ 'aa', { rowspan: 3, contents: 'ab' }, { rowspan: 2, contents: 'ac' }, 'ad' ],
							[ { rowspan: 2, contents: 'ba' }, 'bd' ],
							[ 'cc', 'cd' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', { rowspan: 3, contents: 'ab' }, { rowspan: 2, contents: 'ac' }, 'ad' ],
							[ { rowspan: 2, contents: 'ba' }, 'bd' ],
							[ 'cc', 'cd' ],
							[ '30', '31', '32', '33' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 1, 1, 1, 1 ],
							[ 1,       1 ],
							[       1, 1 ],
							[ 0,    0, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					it( 'handles pasting multi-spanned table', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02', '03', '04', '05' ],
							[ '10', '11', '12', '13', '14', '15' ],
							[ '20', '21', '22', '23', '24', '25' ],
							[ '30', '31', '32', '33', '34', '35' ],
							[ '40', '41', '42', '43', '44', '45' ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 3, 4 ] )
						);

						// +----+----+----+----+----+
						// | aa      | ac | ad | ae |
						// +----+----+----+----+    +
						// | ba | bb           |    |
						// +----+              +----+
						// | ca |              | ce |
						// +    +----+----+----+----+
						// |    | db | dc | dd      |
						// +----+----+----+----+----+
						pasteTable( [
							[ { contents: 'aa', colspan: 2 }, 'ac', 'ad', { contents: 'ae', rowspan: 2 } ],
							[ 'ba', { contents: 'bb', colspan: 3, rowspan: 2 } ],
							[ { contents: 'ca', rowspan: 2 }, 'ce' ],
							[ 'db', 'dc', { contents: 'dd', colspan: 2 } ]
						] );

						// +----+----+----+----+----+----+
						// | aa      | ac | ad | ae | 05 |
						// +----+----+----+----+    +----+
						// | ba | bb           |    | 15 |
						// +----+              +----+----+
						// | ca |              | ce | 25 |
						// +    +----+----+----+----+----+
						// |    | db | dc | dd      | 35 |
						// +----+----+----+----+----+----+
						// | 40 | 41 | 42 | 43 | 44 | 45 |
						// +----+----+----+----+----+----+
						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ { contents: 'aa', colspan: 2 }, 'ac', 'ad', { contents: 'ae', rowspan: 2 }, '05' ],
							[ 'ba', { contents: 'bb', colspan: 3, rowspan: 2 }, '15' ],
							[ { contents: 'ca', rowspan: 2 }, 'ce', '25' ],
							[ 'db', 'dc', { contents: 'dd', colspan: 2 }, '35' ],
							[ '40', '41', '42', '43', '44', '45' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 1,    1, 1, 1, 0 ],
							[ 1, 1,          0 ],
							[ 1,          1, 0 ],
							[    1, 1, 1,    0 ],
							[ 0, 0, 0, 0, 0, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );
				} );

				describe.skip( 'content table has spans', () => {
					it( 'handles pasting simple table over a table with colspans (no colspan exceeds selection)', () => {
						setModelData( model, modelTable( [
							[ '00[]', '01', '02', '03' ],
							[ { colspan: 3, contents: '10' }, '13' ],
							[ { colspan: 2, contents: '20' }, '22', '23' ],
							[ '30', '31', { colspan: 2, contents: '31' } ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 1 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac' ],
							[ 'ba', 'bb', 'bc' ],
							[ 'ca', 'cb', 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', 'ab', 'ac', '03' ],
							[ 'ba', 'bb', 'bc', '13' ],
							[ 'ca', 'cb', 'cc', '23' ],
							[ '30', '31', { colspan: 2, contents: '31' } ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 1, 1, 1, 0 ],
							[ 1, 1, 1, 0 ],
							[ 1, 1, 1, 0 ],
							[ 0, 0, 0    ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					it( 'handles pasting simple table over a table with rowspans (no rowspan exceeds selection)', () => {
						setModelData( model, modelTable( [
							[ '00', { rowspan: 3, contents: '01' }, { rowspan: 2, contents: '02' }, '03' ],
							[ { rowspan: 2, contents: '10' }, '13' ],
							[ '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 0 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac' ],
							[ 'ba', 'bb', 'bc' ],
							[ 'ca', 'cb', 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', 'ab', 'ac', '03' ],
							[ 'ba', 'bb', 'bc', '13' ],
							[ 'ca', 'cb', 'cc', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						assertSelectedCells( model, [
							[ 1, 1, 1, 0 ],
							[ 1, 1, 1, 0 ],
							[ 1, 1, 1, 0 ],
							[ 0, 0, 0, 0 ]
						] );
					} );

					it( 'handles pasting simple table over table with multi-spans (no span exceeds selection)', () => {
						// +----+----+----+----+----+----+
						// | 00      | 02 | 03      | 05 |
						// +         +    +         +----+
						// |         |    |         | 15 |
						// +----+----+----+         +----+
						// | 20 | 21      |         | 25 |
						// +    +----+----+----+----+----+
						// |    | 31 | 32      | 34 | 35 |
						// +----+----+----+----+----+----+
						// | 40 | 41 | 42 | 43 | 44 | 45 |
						// +----+----+----+----+----+----+
						setModelData( model, modelTable( [
							[
								{ contents: '00', colspan: 2, rowspan: 2 },
								{ contents: '02', rowspan: 2 },
								{ contents: '03', colspan: 2, rowspan: 3 },
								'05'
							],
							[ '15' ],
							[ { contents: '20', rowspan: 2 }, { contents: '21', colspan: 2 }, '25' ],
							[ '31', { contents: '32', colspan: 2 }, '34', '35' ],
							[ '40', '41', '42', '43', '44', '45' ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 3, 2 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac', 'ad', 'ae' ],
							[ 'ba', 'bb', 'bc', 'bd', 'be' ],
							[ 'ca', 'cb', 'cc', 'cd', 'ce' ],
							[ 'da', 'db', 'dc', 'dd', 'de' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', 'ab', 'ac', 'ad', 'ae', '05' ],
							[ 'ba', 'bb', 'bc', 'bd', 'be', '15' ],
							[ 'ca', 'cb', 'cc', 'cd', 'ce', '25' ],
							[ 'da', 'db', 'dc', 'dd', 'de', '35' ],
							[ '40', '41', '42', '43', '44', '45' ]
						] ) );

						assertSelectedCells( model, [
							[ 1, 1, 1, 1, 1, 0 ],
							[ 1, 1, 1, 1, 1, 0 ],
							[ 1, 1, 1, 1, 1, 0 ],
							[ 1, 1, 1, 1, 1, 0 ],
							[ 0, 0, 0, 0, 0, 0 ]
						] );
					} );

					// TODO: Skipped case - should allow pasting but no tools to compare areas (like in MergeCellsCommand).
					it.skip( 'handles pasting table that has cell with colspan (last row in selection is spanned)', () => {
						// +----+----+----+----+
						// | 00 | 01 | 02 | 03 |
						// +----+----+----+----+
						// | 10 | 11      | 13 |
						// +    +         +----+
						// |    |         | 23 |
						// +----+----+----+----+
						// | 30 | 31 | 32 | 33 |
						// +----+----+----+----+
						setModelData( model, modelTable( [
							[ '00', '01', '02', '03' ],
							[ { contents: '10', rowspan: 2 }, { contents: '11', colspan: 2, rowspan: 2 }, '13' ],
							[ '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 2 ] ),
							modelRoot.getNodeByPath( [ 0, 1, 0 ] )
						);

						pasteTable( [
							[ 'aa', 'ab', 'ac' ],
							[ 'ba', 'bb', 'bc' ],
							[ 'ca', 'cb', 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', 'ab', 'ac', '03' ],
							[ 'ba', 'bb', 'bc', '13' ],
							[ 'ca', 'cb', 'cc', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						assertSelectedCells( model, [
							[ 1, 1, 1, 0 ],
							[ 1, 1, 1, 0 ],
							[ 1, 1, 1, 0 ],
							[ 0, 0, 0, 0 ]
						] );
					} );
				} );

				describe.skip( 'content and paste tables have spans', () => {
					it( 'handles pasting colspanned table over table with colspans (no colspan exceeds selection)', () => {
						setModelData( model, modelTable( [
							[ '00[]', '01', '02', '03' ],
							[ { colspan: 3, contents: '10' }, '13' ],
							[ { colspan: 2, contents: '20' }, '22', '23' ],
							[ '30', '31', { colspan: 2, contents: '31' } ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 1 ] )
						);

						pasteTable( [
							[ 'aa', { colspan: 2, contents: 'ab' } ],
							[ { colspan: 3, contents: 'ba' } ],
							[ 'ca', 'cb', 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', { colspan: 2, contents: 'ab' }, '03' ],
							[ { colspan: 3, contents: 'ba' }, '13' ],
							[ 'ca', 'cb', 'cc', '23' ],
							[ '30', '31', { colspan: 2, contents: '31' } ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 1, 1,    0 ],
							[ 1,       0 ],
							[ 1, 1, 1, 0 ],
							[ 0, 0, 0    ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					it( 'handles pasting rowspanned table over table with rowspans (no rowspan exceeds selection)', () => {
						setModelData( model, modelTable( [
							[ { rowspan: 3, contents: '00' }, { rowspan: 2, contents: '01' }, '02', '03' ],
							[ { rowspan: 2, contents: '12' }, '13' ],
							[ '21', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 2, 1 ] )
						);

						pasteTable( [
							[ 'aa', { rowspan: 3, contents: 'ab' }, { rowspan: 2, contents: 'ac' }, 'ad' ],
							[ { rowspan: 2, contents: 'ba' }, 'bd' ],
							[ 'cc', 'cd' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ 'aa', { rowspan: 3, contents: 'ab' }, { rowspan: 2, contents: 'ac' }, 'ad' ],
							[ { rowspan: 2, contents: 'ba' }, 'bd' ],
							[ 'cc', 'cd' ],
							[ '30', '31', '32', '33' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 1, 1, 1, 1 ],
							[ 1,       1 ],
							[       1, 1 ],
							[ 0, 0, 0, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					it( 'handles pasting multi-spanned table over table with multi-spans (no span exceeds selection)', () => {
						// +----+----+----+----+----+----+
						// | 00      | 02 | 03      | 05 |
						// +         +    +         +----+
						// |         |    |         | 15 |
						// +----+----+----+         +----+
						// | 20 | 21      |         | 25 |
						// +    +----+----+----+----+----+
						// |    | 31 | 32      | 34 | 35 |
						// +----+----+----+----+----+----+
						// | 40 | 41 | 42 | 43 | 44 | 45 |
						// +----+----+----+----+----+----+
						setModelData( model, modelTable( [
							[
								{ contents: '00', colspan: 2, rowspan: 2 },
								{ contents: '02', rowspan: 2 },
								{ contents: '03', colspan: 2, rowspan: 3 },
								'05'
							],
							[ '15' ],
							[ { contents: '20', rowspan: 2 }, { contents: '21', colspan: 2 }, '25' ],
							[ '31', { contents: '32', colspan: 2 }, '34', '35' ],
							[ '40', '41', '42', '43', '44', '45' ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
							modelRoot.getNodeByPath( [ 0, 3, 2 ] )
						);

						// +----+----+----+----+----+
						// | aa      | ac | ad | ae |
						// +----+----+----+----+    +
						// | ba | bb           |    |
						// +----+              +----+
						// | ca |              | ce |
						// +    +----+----+----+----+
						// |    | db | dc | dd      |
						// +----+----+----+----+----+
						pasteTable( [
							[ { contents: 'aa', colspan: 2 }, 'ac', 'ad', { contents: 'ae', rowspan: 2 } ],
							[ 'ba', { contents: 'bb', colspan: 3, rowspan: 2 } ],
							[ { contents: 'ca', rowspan: 2 }, 'ce' ],
							[ 'db', 'dc', { contents: 'dd', colspan: 2 } ]
						] );

						// +----+----+----+----+----+----+
						// | aa      | ac | ad | ae | 05 |
						// +----+----+----+----+    +----+
						// | ba | bb           |    | 15 |
						// +----+              +----+----+
						// | ca |              | ce | 25 |
						// +    +----+----+----+----+----+
						// |    | db | dc | dd      | 35 |
						// +----+----+----+----+----+----+
						// | 40 | 41 | 42 | 43 | 44 | 45 |
						// +----+----+----+----+----+----+
						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ { contents: 'aa', colspan: 2 }, 'ac', 'ad', { contents: 'ae', rowspan: 2 }, '05' ],
							[ 'ba', { contents: 'bb', colspan: 3, rowspan: 2 }, '15' ],
							[ { contents: 'ca', rowspan: 2 }, 'ce', '25' ],
							[ 'db', 'dc', { contents: 'dd', colspan: 2 }, '35' ],
							[ '40', '41', '42', '43', '44', '45' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 1,    1, 1, 1, 0 ],
							[ 1, 1,          0 ],
							[ 1,          1, 0 ],
							[    1, 1, 1,    0 ],
							[ 0, 0, 0, 0, 0, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );

					// TODO: Skipped case - should allow pasting but no tools to compare areas (like in MergeCellsCommand).
					it.skip( 'handles pasting table that has cell with colspan (last row in selection is spanned)', () => {
						// +----+----+----+----+
						// | 00 | 01 | 02 | 03 |
						// +----+----+----+----+
						// | 10 | 11      | 13 |
						// +    +         +----+
						// |    |         | 23 |
						// +----+----+----+----+
						// | 30 | 31 | 32 | 33 |
						// +----+----+----+----+
						setModelData( model, modelTable( [
							[ '00', '01', '02', '03' ],
							[ { contents: '10', rowspan: 2 }, { contents: '11', colspan: 2, rowspan: 2 }, '13' ],
							[ '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						tableSelection.setCellSelection(
							modelRoot.getNodeByPath( [ 0, 0, 2 ] ),
							modelRoot.getNodeByPath( [ 0, 1, 0 ] )
						);

						// +----+----+----+
						// | aa | ab | ac |
						// +----+----+----+
						// | ba      | bc |
						// +         +----+
						// |         | cc |
						// +----+----+----+
						pasteTable( [
							[ 'aa', 'ab', 'ac' ],
							[ { contents: 'ba', colspan: 2, rowspan: 2 }, 'bc' ],
							[ 'cc' ]
						] );

						assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', { colspan: 2, contents: 'aa' }, '13' ],
							[ '20', 'ba', 'bb', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );

						/* eslint-disable no-multi-spaces */
						assertSelectedCells( model, [
							[ 0, 0, 0, 0 ],
							[ 0, 1, 0 ],
							[ 0, 1, 1, 0 ],
							[ 0, 0, 0, 0 ]
						] );
						/* eslint-enable no-multi-spaces */
					} );
				} );
			} );

			describe( 'pasted table is smaller than the selected area', () => {
				it( 'blocks this case', () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 3, 3 ] )
					);

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );

					assertSelectedCells( model, [
						[ 1, 1, 1, 1 ],
						[ 1, 1, 1, 1 ],
						[ 1, 1, 1, 1 ],
						[ 1, 1, 1, 1 ]
					] );
				} );
			} );
		} );
	} );

	function assertClipboardContentOnMethod( method, expectedViewTable ) {
		const data = {
			dataTransfer: createDataTransfer(),
			preventDefault: sinon.spy()
		};
		viewDocument.fire( method, data );

		expect( data.dataTransfer.getData( 'text/html' ) ).to.equal( expectedViewTable );
	}

	function pasteTable( tableData ) {
		const data = {
			dataTransfer: createDataTransfer(),
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};
		data.dataTransfer.setData( 'text/html', viewTable( tableData ) );
		viewDocument.fire( 'paste', data );

		return data;
	}

	function createDataTransfer() {
		const store = new Map();

		return {
			setData( type, data ) {
				store.set( type, data );
			},

			getData( type ) {
				return store.get( type );
			}
		};
	}
} );
