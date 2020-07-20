/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import HorizontalLineEditing from '@ckeditor/ckeditor5-horizontal-line/src/horizontallineediting';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting';
import ImageEditing from '@ckeditor/ckeditor5-image/src/image/imageediting';
import ListEditing from '@ckeditor/ckeditor5-list/src/listediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Input from '@ckeditor/ckeditor5-typing/src/input';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { assertSelectedCells, modelTable, viewTable } from './_utils/utils';

import TableEditing from '../src/tableediting';
import TableCellPropertiesEditing from '../src/tablecellproperties/tablecellpropertiesediting';
import TableWalker from '../src/tablewalker';

import TableClipboard from '../src/tableclipboard';

describe( 'table clipboard', () => {
	let editor, model, modelRoot, tableSelection, viewDocument, element;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
	} );

	afterEach( async () => {
		await editor.destroy();

		element.remove();
	} );

	describe( 'Clipboard integration - paste (selection scenarios)', () => {
		beforeEach( async () => {
			await createEditor();

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

		it( 'should not alter model.insertContent if selectable is different from document selection', () => {
			model.change( writer => {
				writer.setSelection( modelRoot.getNodeByPath( [ 0, 0, 0 ] ), 0 );

				const selectedTableCells = model.createSelection( [
					model.createRangeOn( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) ),
					model.createRangeOn( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) ),
					model.createRangeOn( modelRoot.getNodeByPath( [ 0, 1, 0 ] ) ),
					model.createRangeOn( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) )
				] );

				const tableToInsert = editor.plugins.get( 'TableUtils' ).createTable( writer, { rows: 2, columns: 2 } );

				for ( const { cell } of new TableWalker( tableToInsert ) ) {
					writer.insertText( 'foo', cell.getChild( 0 ), 0 );
				}

				model.insertContent( tableToInsert, selectedTableCells );
			} );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ '', '', '02', '03' ],
				[ '', '', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );
		} );

		it( 'should not alter model.insertContent if selection is outside table', () => {
			model.change( writer => {
				writer.insertElement( 'paragraph', modelRoot.getChild( 0 ), 'before' );
				writer.setSelection( modelRoot.getChild( 0 ), 'before' );
			} );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
			data.dataTransfer.setData( 'text/html', '<p>foo</p>' );
			viewDocument.fire( 'paste', data );

			editor.isReadOnly = false;

			assertEqualMarkup( getModelData( model ), '<paragraph>foo[]</paragraph>' + modelTable( [
				[ '00', '01', '02', '03' ],
				[ '10', '11', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );
		} );

		it( 'should normalize pasted table if selection is outside table', () => {
			model.change( writer => {
				writer.insertElement( 'paragraph', modelRoot.getChild( 0 ), 'before' );
				writer.setSelection( modelRoot.getChild( 0 ), 'before' );
			} );

			const table = viewTable( [
				[ 'aa', 'ab', { contents: 'ac', rowspan: 3 } ],
				[ { contents: 'ba', rowspan: 2 }, { contents: 'bb', rowspan: 2 } ]
			] );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
			data.dataTransfer.setData( 'text/html', table );
			viewDocument.fire( 'paste', data );

			editor.isReadOnly = false;

			assertEqualMarkup( getModelData( model ),
				'[' + modelTable( [
					[ 'aa', 'ab', { contents: 'ac', rowspan: 2 } ],
					[ 'ba', 'bb' ]
				] ) + ']' +
				modelTable( [
					[ '00', '01', '02', '03' ],
					[ '10', '11', '12', '13' ],
					[ '20', '21', '22', '23' ],
					[ '30', '31', '32', '33' ]
				] )
			);
		} );

		it( 'should not alter model.insertContent if no table pasted', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
			data.dataTransfer.setData( 'text/html', '<p>foo</p>' );
			viewDocument.fire( 'paste', data );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ 'foo', '', '02', '03' ],
				[ '', '', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );
		} );

		it( 'should not alter model.insertContent if a text node is inserted', async () => {
			await editor.destroy();
			await createEditor( [ Input ] );

			setModelData( model, '<paragraph>foo[]</paragraph>' );

			editor.execute( 'input', { text: 'bar' } );

			assertEqualMarkup( getModelData( model ), '<paragraph>foobar[]</paragraph>' );
		} );

		it( 'should not alter model.insertContent if mixed content is pasted (table + paragraph)', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			const table = viewTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
			data.dataTransfer.setData( 'text/html', `${ table }<p>foo</p>` );
			viewDocument.fire( 'paste', data );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ 'foo', '', '02', '03' ],
				[ '', '', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );
		} );

		it( 'should not alter model.insertContent if mixed content is pasted (paragraph + table)', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			const table = viewTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
			data.dataTransfer.setData( 'text/html', `<p>foo</p>${ table }` );
			viewDocument.fire( 'paste', data );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ 'foo', '', '02', '03' ],
				[ '', '', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );
		} );

		it( 'should not alter model.insertContent if mixed content is pasted (table + table)', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			const table = viewTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
			data.dataTransfer.setData( 'text/html', `${ table }${ table }` );
			viewDocument.fire( 'paste', data );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ '', '', '02', '03' ],
				[ '', '', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );
		} );

		it( 'should alter model.insertContent if mixed content is pasted (table + empty paragraph)', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			const table = viewTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
			data.dataTransfer.setData( 'text/html', `${ table }<p>&nbsp;</p>` );
			viewDocument.fire( 'paste', data );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ 'aa', 'ab', '02', '03' ],
				[ 'ba', 'bb', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );
		} );

		it( 'should alter model.insertContent if mixed content is pasted (table + br)', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			const table = viewTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
			data.dataTransfer.setData( 'text/html', `${ table }<br>` );
			viewDocument.fire( 'paste', data );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ 'aa', 'ab', '02', '03' ],
				[ 'ba', 'bb', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );
		} );

		it( 'should alter model.insertContent if mixed content is pasted (empty paragraph + table)', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			const table = viewTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
			data.dataTransfer.setData( 'text/html', `<p>&nbsp;</p>${ table }` );
			viewDocument.fire( 'paste', data );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ 'aa', 'ab', '02', '03' ],
				[ 'ba', 'bb', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );
		} );

		it( 'should alter model.insertContent if mixed content is pasted (br + table)', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			const table = viewTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
			data.dataTransfer.setData( 'text/html', `<br>${ table }` );
			viewDocument.fire( 'paste', data );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ 'aa', 'ab', '02', '03' ],
				[ 'ba', 'bb', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );
		} );

		it( 'should alter model.insertContent if mixed content is pasted (p + p + table + p + br)', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			const table = viewTable( [
				[ 'aa', 'ab' ],
				[ 'ba', 'bb' ]
			] );

			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
			data.dataTransfer.setData( 'text/html', `<p>&nbsp;</p><p>&nbsp;</p>${ table }<p>&nbsp;</p><br>` );
			viewDocument.fire( 'paste', data );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ 'aa', 'ab', '02', '03' ],
				[ 'ba', 'bb', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );
		} );

		it( 'should not alter model.insertContent if element other than a table is passed directly', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			model.change( writer => {
				const element = writer.createElement( 'paragraph' );

				writer.insertText( 'foo', element, 0 );
				model.insertContent( element );
			} );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ 'foo', '', '02', '03' ],
				[ '', '', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );
		} );

		it( 'should alter model.insertContent if selectable is a document selection', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			model.change( writer => {
				const tableToInsert = editor.plugins.get( 'TableUtils' ).createTable( writer, { rows: 2, columns: 2 } );

				for ( const { cell } of new TableWalker( tableToInsert ) ) {
					writer.insertText( 'foo', cell.getChild( 0 ), 0 );
				}

				model.insertContent( tableToInsert, editor.model.document.selection );
			} );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ 'foo', 'foo', '02', '03' ],
				[ 'foo', 'foo', '12', '13' ],
				[ '20', '21', '22', '23' ],
				[ '30', '31', '32', '33' ]
			] ) );
		} );

		describe( 'single cell selected', () => {
			beforeEach( () => {
				setModelData( model, modelTable( [
					[ '00[]', '01', '02' ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ]
				] ) );
			} );

			describe( 'with the selection on the middle cell', () => {
				beforeEach( () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 1, 1 ] )
					);
				} );

				it( 'should replace the table cells (with single undo step)', () => {
					const batches = setupBatchWatch();

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					expect( batches.size ).to.equal( 1 );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', 'aa', 'ab' ],
						[ '20', 'ba', 'bb' ]
					] ) );
				} );

				it( 'should expand the table width and replace the table cells (with single undo step)', () => {
					const batches = setupBatchWatch();

					pasteTable( [
						[ 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ 'ba', 'bb', 'bc', 'bd', 'be' ]
					] );

					expect( batches.size ).to.equal( 1 );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '', '', '' ],
						[ '10', 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ '20', 'ba', 'bb', 'bc', 'bd', 'be' ]
					] ) );
				} );

				it( 'should expand the table height and replace the table cells (with single undo step)', () => {
					const batches = setupBatchWatch();

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ],
						[ 'ca', 'cb' ],
						[ 'da', 'db' ],
						[ 'ea', 'eb' ]
					] );

					expect( batches.size ).to.equal( 1 );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', 'aa', 'ab' ],
						[ '20', 'ba', 'bb' ],
						[ '', 'ca', 'cb' ],
						[ '', 'da', 'db' ],
						[ '', 'ea', 'eb' ]
					] ) );
				} );

				it( 'should expand the table width, height and replace the table cells (with single undo step)', () => {
					const batches = setupBatchWatch();

					pasteTable( [
						[ 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ 'ba', 'bb', 'bc', 'bd', 'be' ],
						[ 'ca', 'cb', 'cc', 'cd', 'ce' ],
						[ 'da', 'db', 'dc', 'dd', 'de' ],
						[ 'ea', 'eb', 'ec', 'ed', 'ee' ]
					] );

					expect( batches.size ).to.equal( 1 );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '', '', '' ],
						[ '10', 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ '20', 'ba', 'bb', 'bc', 'bd', 'be' ],
						[ '', 'ca', 'cb', 'cc', 'cd', 'ce' ],
						[ '', 'da', 'db', 'dc', 'dd', 'de' ],
						[ '', 'ea', 'eb', 'ec', 'ed', 'ee' ]
					] ) );
				} );
			} );

			describe( 'with the selection on the first cell', () => {
				beforeEach( () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 0, 0 ] )
					);
				} );

				it( 'should replace the table cells', () => {
					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ 'aa', 'ab', '02' ],
						[ 'ba', 'bb', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should expand the table and replace the table cells', () => {
					pasteTable( [
						[ 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ 'ba', 'bb', 'bc', 'bd', 'be' ],
						[ 'ca', 'cb', 'cc', 'cd', 'ce' ],
						[ 'da', 'db', 'dc', 'dd', 'de' ],
						[ 'ea', 'eb', 'ec', 'ed', 'ee' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ 'ba', 'bb', 'bc', 'bd', 'be' ],
						[ 'ca', 'cb', 'cc', 'cd', 'ce' ],
						[ 'da', 'db', 'dc', 'dd', 'de' ],
						[ 'ea', 'eb', 'ec', 'ed', 'ee' ]
					] ) );
				} );
			} );

			describe( 'with the selection on the middle cell of the first row', () => {
				beforeEach( () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 0, 1 ] )
					);
				} );

				it( 'should replace the table cells', () => {
					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', 'aa', 'ab' ],
						[ '10', 'ba', 'bb' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should expand the table and replace the table cells', () => {
					pasteTable( [
						[ 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ 'ba', 'bb', 'bc', 'bd', 'be' ],
						[ 'ca', 'cb', 'cc', 'cd', 'ce' ],
						[ 'da', 'db', 'dc', 'dd', 'de' ],
						[ 'ea', 'eb', 'ec', 'ed', 'ee' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ '10', 'ba', 'bb', 'bc', 'bd', 'be' ],
						[ '20', 'ca', 'cb', 'cc', 'cd', 'ce' ],
						[ '', 'da', 'db', 'dc', 'dd', 'de' ],
						[ '', 'ea', 'eb', 'ec', 'ed', 'ee' ]
					] ) );
				} );
			} );

			describe( 'with the selection on the last cell of the first row', () => {
				beforeEach( () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 2 ] ),
						modelRoot.getNodeByPath( [ 0, 0, 2 ] )
					);
				} );

				it( 'should replace the table cells', () => {
					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', 'aa', 'ab' ],
						[ '10', '11', 'ba', 'bb' ],
						[ '20', '21', '22', '' ]
					] ) );
				} );

				it( 'should expand the table and replace the table cells', () => {
					pasteTable( [
						[ 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ 'ba', 'bb', 'bc', 'bd', 'be' ],
						[ 'ca', 'cb', 'cc', 'cd', 'ce' ],
						[ 'da', 'db', 'dc', 'dd', 'de' ],
						[ 'ea', 'eb', 'ec', 'ed', 'ee' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ '10', '11', 'ba', 'bb', 'bc', 'bd', 'be' ],
						[ '20', '21', 'ca', 'cb', 'cc', 'cd', 'ce' ],
						[ '', '', 'da', 'db', 'dc', 'dd', 'de' ],
						[ '', '', 'ea', 'eb', 'ec', 'ed', 'ee' ]
					] ) );
				} );
			} );

			describe( 'with the selection is on the middle cell of the first column', () => {
				beforeEach( () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 1, 0 ] )
					);
				} );

				it( 'should replace the table cells', () => {
					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02' ],
						[ 'aa', 'ab', '12' ],
						[ 'ba', 'bb', '22' ]
					] ) );
				} );

				it( 'should expand the table and replace the table cells', () => {
					pasteTable( [
						[ 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ 'ba', 'bb', 'bc', 'bd', 'be' ],
						[ 'ca', 'cb', 'cc', 'cd', 'ce' ],
						[ 'da', 'db', 'dc', 'dd', 'de' ],
						[ 'ea', 'eb', 'ec', 'ed', 'ee' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '', '' ],
						[ 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ 'ba', 'bb', 'bc', 'bd', 'be' ],
						[ 'ca', 'cb', 'cc', 'cd', 'ce' ],
						[ 'da', 'db', 'dc', 'dd', 'de' ],
						[ 'ea', 'eb', 'ec', 'ed', 'ee' ]
					] ) );
				} );
			} );

			describe( 'with the selection is on the last cell of the first column', () => {
				beforeEach( () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 2, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 2, 0 ] )
					);
				} );

				it( 'should replace the table cells', () => {
					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '12' ],
						[ 'aa', 'ab', '22' ],
						[ 'ba', 'bb', '' ]
					] ) );
				} );

				it( 'should expand the table and replace the table cells', () => {
					pasteTable( [
						[ 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ 'ba', 'bb', 'bc', 'bd', 'be' ],
						[ 'ca', 'cb', 'cc', 'cd', 'ce' ],
						[ 'da', 'db', 'dc', 'dd', 'de' ],
						[ 'ea', 'eb', 'ec', 'ed', 'ee' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '', '' ],
						[ '10', '11', '12', '', '' ],
						[ 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ 'ba', 'bb', 'bc', 'bd', 'be' ],
						[ 'ca', 'cb', 'cc', 'cd', 'ce' ],
						[ 'da', 'db', 'dc', 'dd', 'de' ],
						[ 'ea', 'eb', 'ec', 'ed', 'ee' ]
					] ) );
				} );
			} );

			describe( 'with the selection is on the last cell of the last column', () => {
				beforeEach( () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 2, 2 ] ),
						modelRoot.getNodeByPath( [ 0, 2, 2 ] )
					);
				} );

				it( 'should replace the table cells', () => {
					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '' ],
						[ '10', '11', '12', '' ],
						[ '20', '21', 'aa', 'ab' ],
						[ '', '', 'ba', 'bb' ]
					] ) );
				} );

				it( 'should expand the table and replace the table cells', () => {
					pasteTable( [
						[ 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ 'ba', 'bb', 'bc', 'bd', 'be' ],
						[ 'ca', 'cb', 'cc', 'cd', 'ce' ],
						[ 'da', 'db', 'dc', 'dd', 'de' ],
						[ 'ea', 'eb', 'ec', 'ed', 'ee' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '', '', '', '' ],
						[ '10', '11', '12', '', '', '', '' ],
						[ '20', '21', 'aa', 'ab', 'ac', 'ad', 'ae' ],
						[ '', '', 'ba', 'bb', 'bc', 'bd', 'be' ],
						[ '', '', 'ca', 'cb', 'cc', 'cd', 'ce' ],
						[ '', '', 'da', 'db', 'dc', 'dd', 'de' ],
						[ '', '', 'ea', 'eb', 'ec', 'ed', 'ee' ]
					] ) );
				} );
			} );

			describe( 'the selection inside the table cell', () => {
				it( 'should replace the table cells when the collapsed selection is in the first cell', () => {
					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ 'aa', 'ab', '02' ],
						[ 'ba', 'bb', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should replace the table cells when the expanded selection is in the first cell', () => {
					model.change( writer => {
						writer.setSelection( modelRoot.getNodeByPath( [ 0, 0, 0 ] ), 'in' );
					} );

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ 'aa', 'ab', '02' ],
						[ 'ba', 'bb', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should replace the table cells when selection is on the image inside the table cell', async () => {
					await editor.destroy();
					await createEditor( [ ImageEditing, ImageCaptionEditing ] );

					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '12' ],
						[ '20', '21', '[<image src="/assets/sample.jpg"><caption></caption></image>]' ]
					] ) );

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '' ],
						[ '10', '11', '12', '' ],
						[ '20', '21', 'aa', 'ab' ],
						[ '', '', 'ba', 'bb' ]
					] ) );
				} );

				it( 'should replace the table cells when selection is in the image caption inside the table cell', async () => {
					await editor.destroy();
					await createEditor( [ ImageEditing, ImageCaptionEditing ] );

					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '12' ],
						[ '20', '21', '<image src="/assets/sample.jpg"><caption>fo[]o</caption></image>' ]
					] ) );

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '' ],
						[ '10', '11', '12', '' ],
						[ '20', '21', 'aa', 'ab' ],
						[ '', '', 'ba', 'bb' ]
					] ) );
				} );

				it( 'should not set multi-cell selection if TableSelection plugin is disabled', () => {
					editor.plugins.get( 'TableSelection' ).forceDisabled();

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '[]aa', 'ab', '02' ],
						[ 'ba', 'bb', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );
			} );

			describe( 'with spanned cells', () => {
				it( 'should replace the table structure', () => {
					// +----+----+----+----+----+----+
					// | 00 | 01 | 02           | 05 |
					// +----+----+----+----+----+----+
					// | 10 | 11      | 13 | 14 | 15 |
					// +----+         +----+----+----+
					// | 20 |         | 23      | 25 |
					// +----+         +----+----+    +
					// | 30 |         | 33      |    |
					// +----+----+----+----+----+----+
					// | 40      | 42 | 43 | 44      |
					// +----+----+----+----+----+----+
					setModelData( model, modelTable( [
						[ '00', '01', { contents: '02', colspan: 3 }, '05' ],
						[ '10', { contents: '11', colspan: 2, rowspan: 3 }, '13', '14', '15' ],
						[ '20', { contents: '23', colspan: 2 }, { contents: '25', rowspan: 2 } ],
						[ '30', { contents: '33', colspan: 2 } ],
						[ { contents: '40', colspan: 2 }, '42', '43', { contents: '44', colspan: 2 } ]
					] ) );

					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 2, 1 ] ), // Cell 23.
						modelRoot.getNodeByPath( [ 0, 2, 1 ] )
					);

					// +----+----+----+----+----+
					// | aa      | ac | ad | ae |
					// +         +    +----+----+
					// |         |    | bd | be |
					// +----+----+----+----+----+
					// | ca      | cc | cd | ce |
					// +----+----+----+----+----+
					// | da           | dd | de |
					// +----+----+----+----+    +
					// | ea | eb | ec | ed |    |
					// +----+----+----+----+----+
					pasteTable( [
						[ { contents: 'aa', colspan: 2, rowspan: 2 }, { contents: 'ac', rowspan: 2 }, 'ad', 'ae' ],
						[ 'bd', 'be' ],
						[ { contents: 'ca', colspan: 2 }, 'cc', 'cd', 'ce' ],
						[ { contents: 'da', colspan: 3 }, 'dd', { contents: 'de', rowspan: 2 } ],
						[ 'ea', 'eb', 'ec', 'ed' ]
					] );

					// +----+----+----+----+----+----+----+----+
					// | 00 | 01 | 02           | 05 |    |    |
					// +----+----+----+----+----+----+----+----+
					// | 10 | 11      | 13 | 14 | 15 |    |    |
					// +----+         +----+----+----+----+----+
					// | 20 |         | aa      | ac | ad | ae |
					// +----+         +         +    +----+----+
					// | 30 |         |         |    | bd | be |
					// +----+----+----+----+----+----+----+----+
					// | 40      | 42 | ca      | cc | cd | ce |
					// +----+----+----+----+----+----+----+----+
					// |    |    |    | da           | dd | de |
					// +----+----+----+----+----+----+----+    +
					// |    |    |    | ea | eb | ec | ed |    |
					// +----+----+----+----+----+----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', { contents: '02', colspan: 3 }, '05', '', '' ],
						[ '10', { contents: '11', colspan: 2, rowspan: 3 }, '13', '14', '15', '', '' ],
						[ '20', { contents: 'aa', colspan: 2, rowspan: 2 }, { contents: 'ac', rowspan: 2 }, 'ad', 'ae' ],
						[ '30', 'bd', 'be' ],
						[ { contents: '40', colspan: 2 }, '42', { contents: 'ca', colspan: 2 }, 'cc', 'cd', 'ce' ],
						[ '', '', '', { contents: 'da', colspan: 3 }, 'dd', { contents: 'de', rowspan: 2 } ],
						[ '', '', '', 'ea', 'eb', 'ec', 'ed' ]
					] ) );
				} );

				it( 'should fix non-rectangular are on matched table fragment', () => {
					// +----+----+----+
					// | 00 | 01 | 02 |
					// +----+----+    +
					// | 10 | 11 |    |
					// +----+----+----+
					// | 20      | 22 |
					// +----+----+----+
					setModelData( model, modelTable( [
						[ '00', '01', { contents: '02', rowspan: 2 } ],
						[ '10', '11[]' ],
						[ { contents: '20', colspan: 2 }, '22' ]
					] ) );

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					// +----+----+----+
					// | 00 | 01 | 02 |
					// +----+----+----+
					// | 10 | aa | ab |
					// +----+----+----+
					// | 20 | ba | bb |
					// +----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', 'aa', 'ab' ],
						[ '20', 'ba', 'bb' ]
					] ) );
				} );
			} );
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
						[ 0, 1,    0 ],
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
						[ 0, 0, 0, 0 ]
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
						modelRoot.getNodeByPath( [ 0, 3, 2 ] ) // Cell 34.
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

				it( 'handles pasting simple table over a table with rowspan (rowspan before selection)', () => {
					// +----+----+----+----+----+
					// | 00 | 01 | 02 | 03 | 04 |
					// +----+----+----+----+----+
					// | 10 | 11 | 12 | 13 | 14 |
					// +----+    +----+----+----+
					// | 20 |    | 22 | 23 | 24 |
					// +----+    +----+----+----+
					// | 30 |    | 32 | 33 | 34 |
					// +----+----+----+----+----+
					// | 40 | 41 | 42 | 43 | 44 |
					// +----+----+----+----+----+
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03', '04' ],
						[ '10', { contents: '11', rowspan: 3 }, '12', '13', '14' ],
						[ '20', '22', '23', '24' ],
						[ '30', '32', '33', '34' ],
						[ '40', '41', '42', '43', '44' ]
					] ) );

					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 2 ] ),
						modelRoot.getNodeByPath( [ 0, 3, 2 ] ) // Cell 33.
					);

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ],
						[ 'ca', 'cb' ]
					] );

					// +----+----+----+----+----+
					// | 00 | 01 | 02 | 03 | 04 |
					// +----+----+----+----+----+
					// | 10 | 11 | aa | ab | 14 |
					// +----+    +----+----+----+
					// | 20 |    | ba | bb | 24 |
					// +----+    +----+----+----+
					// | 30 |    | ca | cb | 34 |
					// +----+----+----+----+----+
					// | 40 | 41 | 42 | 43 | 44 |
					// +----+----+----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '03', '04' ],
						[ '10', { contents: '11', rowspan: 3 }, 'aa', 'ab', '14' ],
						[ '20', 'ba', 'bb', '24' ],
						[ '30', 'ca', 'cb', '34' ],
						[ '40', '41', '42', '43', '44' ]
					] ) );

					/* eslint-disable no-multi-spaces */
					assertSelectedCells( model, [
						[ 0, 0, 0, 0, 0 ],
						[ 0, 0, 1, 1, 0 ],
						[ 0,    1, 1, 0 ],
						[ 0,    1, 1, 0 ],
						[ 0, 0, 0, 0, 0 ]
					] );
					/* eslint-enable no-multi-spaces */
				} );

				it( 'handles pasting simple table over a table with rowspans (rowspan before selection)', () => {
					// +----+----+----+----+----+----+
					// | 00 | 01 | 02 | 03 | 04 | 05 |
					// +----+----+----+----+----+----+
					// | 10      | 12 | 13 | 14 | 15 |
					// +----+----+----+----+----+----+
					// | 20           | 23 | 24 | 25 |
					// +----+----+----+----+----+----+
					// | 30 | 31 | 32 | 33 | 34 | 35 |
					// +----+----+----+----+----+----+
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03', '04', '05' ],
						[ { contents: '10', colspan: 2 }, '12', '13', '14', '15' ],
						[ { contents: '20', colspan: 3 }, '23', '24', '25' ],
						[ '30', '31', '32', '33', '34', '35' ]
					] ) );

					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 2 ] ), // Cell 13.
						modelRoot.getNodeByPath( [ 0, 2, 2 ] ) // Cell 24.
					);

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					// +----+----+----+----+----+----+
					// | 00 | 01 | 02 | 03 | 04 | 05 |
					// +----+----+----+----+----+----+
					// | 10      | 12 | aa | ab | 15 |
					// +----+----+----+----+----+----+
					// | 20           | ba | bb | 25 |
					// +----+----+----+----+----+----+
					// | 30 | 31 | 32 | 33 | 34 | 35 |
					// +----+----+----+----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '03', '04', '05' ],
						[ { contents: '10', colspan: 2 }, '12', 'aa', 'ab', '15' ],
						[ { contents: '20', colspan: 3 }, 'ba', 'bb', '25' ],
						[ '30', '31', '32', '33', '34', '35' ]
					] ) );

					/* eslint-disable no-multi-spaces */
					assertSelectedCells( model, [
						[ 0, 0, 0, 0, 0, 0 ],
						[ 0,    0, 1, 1, 0 ],
						[ 0,       1, 1, 0 ],
						[ 0, 0, 0, 0, 0, 0 ]
					] );
					/* eslint-enable no-multi-spaces */
				} );

				it( 'handles pasting table that has cell with colspan (last row in selection is spanned)', () => {
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

					// Select 02 -> 10 (selection 3x3)
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

				it( 'handles pasting table that has cell with rowspan (multiple ending rows in the selection are spanned)', () => {
					// +----+----+----+
					// | 00 | 01 | 02 |
					// +----+    +    +
					// | 10 |    |    |
					// +----+    +    +
					// | 20 |    |    |
					// +----+----+----+
					// | 30 | 31 | 32 |
					// +----+----+----+
					setModelData( model, modelTable( [
						[ '00', { contents: '01', rowspan: 3 }, { contents: '02', rowspan: 3 } ],
						[ '10' ],
						[ '20' ],
						[ '30', '31', '32' ]
					] ) );

					// Select 01 -> 02 (selection 2x2)
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 0, 2 ] )
					);

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ],
						[ 'ca', 'cb' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', 'aa', 'ab' ],
						[ '10', 'ba', 'bb' ],
						[ '20', 'ca', 'cb' ],
						[ '30', '31', '32' ]
					] ) );

					assertSelectedCells( model, [
						[ 0, 1, 1 ],
						[ 0, 1, 1 ],
						[ 0, 1, 1 ],
						[ 0, 0, 0 ]
					] );
				} );

				it( 'handles pasting table that has cell with colspan (last column in selection is spanned)', () => {
					// +----+----+----+----+
					// | 00 | 01      | 03 |
					// +----+----+----+----+
					// | 10 | 11      | 13 |
					// +----+         +----+
					// | 20 |         | 23 |
					// +----+----+----+----+
					// | 30 | 31 | 32 | 33 |
					// +----+----+----+----+
					setModelData( model, modelTable( [
						[ '00', { contents: '01', colspan: 2 }, '03' ],
						[ '10', { contents: '11', colspan: 2, rowspan: 2 }, '13' ],
						[ '20', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );

					// Select 20 -> 01 (selection 3x3)
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 2, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 0, 1 ] )
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

				it( 'handles pasting table that has cell with colspan (multiple ending columns in the selection are spanned)', () => {
					// +----+----+----+----+
					// | 00 | 01 | 02 | 03 |
					// +----+----+----+----+
					// | 10           | 13 |
					// +----+----+----+----+
					// | 20           | 23 |
					// +----+----+----+----+
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03' ],
						[ { contents: '10', colspan: 3 }, '13' ],
						[ { contents: '20', colspan: 3 }, '23' ]
					] ) );

					// Select 10 -> 20 (selection 3x2)
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 2, 0 ] )
					);

					pasteTable( [
						[ 'aa', 'ab', 'ac' ],
						[ 'ba', 'bb', 'bc' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '03' ],
						[ 'aa', 'ab', 'ac', '13' ],
						[ 'ba', 'bb', 'bc', '23' ]
					] ) );

					assertSelectedCells( model, [
						[ 0, 0, 0, 0 ],
						[ 1, 1, 1, 0 ],
						[ 1, 1, 1, 0 ]
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

				it( 'handles pasting table that has cell with colspan (last row in selection is spanned)', () => {
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

					// Select 02 -> 10 (selection 3x3)
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
						[ 'aa', 'ab', 'ac', '03' ],
						[ { contents: 'ba', colspan: 2, rowspan: 2 }, 'bc', '13' ],
						[ 'cc', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );

					/* eslint-disable no-multi-spaces */
					assertSelectedCells( model, [
						[ 1, 1, 1, 0 ],
						[ 1,    1, 0 ],
						[       1, 0 ],
						[ 0, 0, 0, 0 ]
					] );
					/* eslint-enable no-multi-spaces */
				} );

				it( 'handles pasting table that has cell with colspan (last column in selection is spanned)', () => {
					// +----+----+----+----+
					// | 00 | 01      | 03 |
					// +----+----+----+----+
					// | 10 | 11      | 13 |
					// +----+         +----+
					// | 20 |         | 23 |
					// +----+----+----+----+
					// | 30 | 31 | 32 | 33 |
					// +----+----+----+----+
					setModelData( model, modelTable( [
						[ '00', { contents: '01', colspan: 2 }, '03' ],
						[ '10', { contents: '11', colspan: 2, rowspan: 2 }, '13' ],
						[ '20', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );

					// Select 20 -> 01 (selection 3x3)
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 2, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 0, 1 ] )
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
						[ 'aa', 'ab', 'ac', '03' ],
						[ { contents: 'ba', colspan: 2, rowspan: 2 }, 'bc', '13' ],
						[ 'cc', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );

					/* eslint-disable no-multi-spaces */
					assertSelectedCells( model, [
						[ 1, 1, 1, 0 ],
						[ 1,    1, 0 ],
						[       1, 0 ],
						[ 0, 0, 0, 0 ]
					] );
					/* eslint-enable no-multi-spaces */
				} );
			} );

			describe( 'non-rectangular content table selection', () => {
				it( 'should split cells outside the selected area before pasting (rowspan ends in selection)', () => {
					// +----+----+----+
					// | 00 | 01 | 02 |
					// +----+    +----+
					// | 10 |    | 12 |
					// +----+    +----+
					// | 20 |    | 22 |
					// +----+    +----+
					// | 30 |    | 32 |
					// +----+----+----+
					// | 40 | 41 | 42 |
					// +----+----+----+
					setModelData( model, modelTable( [
						[ '00', { contents: '01', rowspan: 4 }, '02' ],
						[ '10', '12' ],
						[ '20', '22' ],
						[ '30', '32' ],
						[ '40', '41', '42' ]
					] ) );

					// Select 20 -> 32
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 2, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 3, 1 ] )
					);

					pasteTable( [
						[ 'aa', 'ab', 'ac' ],
						[ 'ba', 'bb', 'bc' ]
					] );

					// +----+----+----+
					// | 00 | 01 | 02 |
					// +----+    +----+
					// | 10 |    | 12 |
					// +----+----+----+
					// | aa | ab | ac |
					// +----+----+----+
					// | ba | bb | bc |
					// +----+----+----+
					// | 40 | 41 | 42 |
					// +----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', { contents: '01', rowspan: 2 }, '02' ],
						[ '10', '12' ],
						[ 'aa', 'ab', 'ac' ],
						[ 'ba', 'bb', 'bc' ],
						[ '40', '41', '42' ]
					] ) );
				} );

				it( 'should split cells outside the selected area before pasting (rowspan ends after the selection)', () => {
					// +----+----+----+
					// | 00 | 01 | 02 |
					// +----+    +----+
					// | 10 |    | 12 |
					// +----+    +----+
					// | 20 |    | 22 |
					// +----+    +----+
					// | 30 |    | 32 |
					// +----+----+----+
					// | 40 | 41 | 42 |
					// +----+----+----+
					setModelData( model, modelTable( [
						[ '00', { contents: '01', rowspan: 4 }, '02' ],
						[ '10', '12' ],
						[ '20', '22' ],
						[ '30', '32' ],
						[ '40', '41', '42' ]
					] ) );

					// Select 10 -> 22
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 2, 1 ] )
					);

					pasteTable( [
						[ 'aa', 'ab', 'ac' ],
						[ 'ba', 'bb', 'bc' ]
					] );

					// +----+----+----+
					// | 00 | 01 | 02 |
					// +----+----+----+
					// | aa | ab | ac |
					// +----+----+----+
					// | ba | bb | bc |
					// +----+----+----+
					// | 30 |    | 32 |
					// +----+----+----+
					// | 40 | 41 | 42 |
					// +----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02' ],
						[ 'aa', 'ab', 'ac' ],
						[ 'ba', 'bb', 'bc' ],
						[ '30', '', '32' ],
						[ '40', '41', '42' ]
					] ) );
				} );

				it( 'should split cells inside the selected area before pasting (rowspan ends after the selection)', () => {
					// +----+----+----+
					// | 00 | 01 | 02 |
					// +----+    +----+
					// | 10 |    | 12 |
					// +----+    +----+
					// | 20 |    | 22 |
					// +----+    +----+
					// | 30 |    | 32 |
					// +----+----+----+
					// | 40 | 41 | 42 |
					// +----+----+----+
					setModelData( model, modelTable( [
						[ '00', { contents: '01', rowspan: 4 }, '02' ],
						[ '10', '12' ],
						[ '20', '22' ],
						[ '30', '32' ],
						[ '40', '41', '42' ]
					] ) );

					// Select 00 -> 12
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 1, 1 ] )
					);

					pasteTable( [
						[ 'aa', 'ab', 'ac' ],
						[ 'ba', 'bb', 'bc' ]
					] );

					// +----+----+----+
					// | aa | ab | ac |
					// +----+----+----+
					// | ba | bb | bc |
					// +----+----+----+
					// | 20 |    | 22 |
					// +----+    +----+
					// | 30 |    | 32 |
					// +----+----+----+
					// | 40 | 41 | 42 |
					// +----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ 'aa', 'ab', 'ac' ],
						[ 'ba', 'bb', 'bc' ],
						[ '20', { rowspan: 2, contents: '' }, '22' ],
						[ '30', '32' ],
						[ '40', '41', '42' ]
					] ) );
				} );

				it( 'should split cells outside the selected area before pasting (colspan ends in selection)', () => {
					// +----+----+----+----+----+
					// | 00 | 01 | 02 | 03 | 04 |
					// +----+----+----+----+----+
					// | 10                | 14 |
					// +----+----+----+----+----+
					// | 20 | 21 | 22 | 23 | 24 |
					// +----+----+----+----+----+
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03', '04' ],
						[ { contents: '10', colspan: 4 }, '14' ],
						[ '20', '21', '22', '23', '24' ]
					] ) );

					// Select 02 -> 23
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 2 ] ),
						modelRoot.getNodeByPath( [ 0, 2, 3 ] )
					);

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ],
						[ 'ca', 'cb' ]
					] );

					// +----+----+----+----+----+
					// | 00 | 01 | aa | ab | 04 |
					// +----+----+----+----+----+
					// | 10      | ba | bb | 14 |
					// +----+----+----+----+----+
					// | 20 | 21 | ca | cb | 24 |
					// +----+----+----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', 'aa', 'ab', '04' ],
						[ { contents: '10', colspan: 2 }, 'ba', 'bb', '14' ],
						[ '20', '21', 'ca', 'cb', '24' ]
					] ) );
				} );

				it( 'should split cells outside the selected area before pasting (colspan ends after the selection)', () => {
					// +----+----+----+----+----+
					// | 00 | 01 | 02 | 03 | 04 |
					// +----+----+----+----+----+
					// | 10                | 14 |
					// +----+----+----+----+----+
					// | 20 | 21 | 22 | 23 | 24 |
					// +----+----+----+----+----+
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03', '04' ],
						[ { contents: '10', colspan: 4 }, '14' ],
						[ '20', '21', '22', '23', '24' ]
					] ) );

					// Select 01 -> 22
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 2, 2 ] )
					);

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ],
						[ 'ca', 'cb' ]
					] );

					// +----+----+----+----+----+
					// | 00 | aa | ab | 03 | 04 |
					// +----+----+----+----+----+
					// | 10 | ba | bb |    | 14 |
					// +----+----+----+----+----+
					// | 20 | ca | cb | 23 | 24 |
					// +----+----+----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', 'aa', 'ab', '03', '04' ],
						[ '10', 'ba', 'bb', '', '14' ],
						[ '20', 'ca', 'cb', '23', '24' ]
					] ) );
				} );

				it( 'should split cells inside the selected area before pasting (colspan ends after the selection)', () => {
					// +----+----+----+----+----+
					// | 00 | 01 | 02 | 03 | 04 |
					// +----+----+----+----+----+
					// | 10                | 14 |
					// +----+----+----+----+----+
					// | 20 | 21 | 22 | 23 | 24 |
					// +----+----+----+----+----+
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03', '04' ],
						[ { contents: '10', colspan: 4 }, '14' ],
						[ '20', '21', '22', '23', '24' ]
					] ) );

					// Select 00 -> 21
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 2, 1 ] )
					);

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ],
						[ 'ca', 'cb' ]
					] );

					// +----+----+----+----+----+
					// | aa | ab | 02 | 03 | 04 |
					// +----+----+----+----+----+
					// | ba | bb |         | 14 |
					// +----+----+----+----+----+
					// | ca | cb | 22 | 23 | 24 |
					// +----+----+----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ 'aa', 'ab', '02', '03', '04' ],
						[ 'ba', 'bb', { colspan: 2, contents: '' }, '14' ],
						[ 'ca', 'cb', '22', '23', '24' ]
					] ) );
				} );

				it( 'should split cells anchored outside selection rectangle that overlaps selection (above selection)', () => {
					// +----+----+----+
					// | 00      | 02 |
					// +         +----+
					// |         | 12 |
					// +----+----+----+
					// | 20 | 21 | 22 |
					// +----+----+----+
					setModelData( model, modelTable( [
						[ { contents: '00', colspan: 2, rowspan: 2 }, '02' ],
						[ '12' ],
						[ '20', '21', '22' ]
					] ) );

					// Select 21 -> 12
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 2, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 1, 0 ] )
					);

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					// +----+----+----+
					// | 00 |    | 02 |
					// +    +----+----+
					// |    | aa | ab |
					// +----+----+----+
					// | 20 | ba | bb |
					// +----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ { contents: '00', rowspan: 2 }, '', '02' ],
						[ 'aa', 'ab' ],
						[ '20', 'ba', 'bb' ]
					] ) );
				} );

				it( 'should split cells anchored outside selection rectangle that overlaps selection (below selection)', () => {
					// +----+----+----+
					// | 00 | 01 | 02 |
					// +----+----+----+
					// | 10      | 12 |
					// +         +----+
					// |         | 22 |
					// +----+----+----+
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ { contents: '10', colspan: 2, rowspan: 2 }, '12' ],
						[ '22' ]
					] ) );

					// Select 01 -> 12
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 1, 1 ] )
					);

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					// +----+----+----+
					// | 00 | aa | ab |
					// +----+----+----+
					// | 10 | ba | bb |
					// +    +----+----+
					// |    |    | 22 |
					// +----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', 'aa', 'ab' ],
						[ { contents: '10', rowspan: 2 }, 'ba', 'bb' ],
						[ '', '22' ]
					] ) );
				} );

				it( 'should properly handle complex case', () => {
					// +----+----+----+----+----+----+----+
					// | 00           | 03 | 04           |
					// +              +    +----+----+----+
					// |              |    | 14 | 15 | 16 |
					// +              +    +----+----+----+
					// |              |    | 24           |
					// +----+----+----+----+----+----+----+
					// | 30 | 31      | 33 | 34 | 35 | 36 |
					// +    +----+----+    +----+----+----+
					// |    | 41 | 42 |    | 44 | 45      |
					// +    +----+----+    +----+         +
					// |    | 51 | 52 |    | 54 |         |
					// +----+----+----+    +----+         +
					// | 60 | 61 | 62 |    | 64 |         |
					// +----+----+----+----+----+----+----+
					setModelData( model, modelTable( [
						[ { contents: '00', colspan: 3, rowspan: 3 }, { contents: '03', rowspan: 3 }, { colspan: 3, contents: '04' } ],
						[ '14', '15', '16' ],
						[ { contents: '24', colspan: 3 } ],
						[
							{ contents: '30', rowspan: 3 },
							{ contents: '31', colspan: 2 },
							{ contents: '33', rowspan: 4 },
							'34', '35', '36'
						],
						[ '41', '42', '44', { contents: '45', colspan: 2, rowspan: 3 } ],
						[ '51', '52', '54' ],
						[ '60', '61', '62', '64' ]
					] ) );

					// Select 42 -> 24 (3x3 selection)
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 4, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 2, 0 ] )
					);

					pasteTable( [
						[ 'aa', 'ab', 'ac' ],
						[ 'ba', 'bb', 'bc' ],
						[ 'ca', 'cb', 'cc' ]
					] );

					// +----+----+----+----+----+----+----+
					// | 00      |    | 03 | 04           |
					// +         +    +    +----+----+----+
					// |         |    |    | 14 | 15 | 16 |
					// +         +----+----+----+----+----+
					// |         | aa | ab | ac |         |
					// +----+----+----+----+----+----+----+
					// | 30 | 31 | ba | bb | bc | 35 | 36 |
					// +    +----+----+----+----+----+----+
					// |    | 41 | ca | cb | cc | 45      |
					// +    +----+----+----+----+         +
					// |    | 51 | 52 |    | 54 |         |
					// +----+----+----+    +----+         +
					// | 60 | 61 | 62 |    | 64 |         |
					// +----+----+----+----+----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[
							{ contents: '00', colspan: 2, rowspan: 3 },
							{ contents: '', rowspan: 2 },
							{ contents: '03', rowspan: 2 },
							{ contents: '04', colspan: 3 }
						],
						[ '14', '15', '16' ],
						[ 'aa', 'ab', 'ac', { contents: '', colspan: 2 } ],
						[ { contents: '30', rowspan: 3 }, '31', 'ba', 'bb', 'bc', '35', '36' ],
						[ '41', 'ca', 'cb', 'cc', { contents: '45', colspan: 2, rowspan: 3 } ],
						[ '51', '52', { contents: '', rowspan: 2 }, '54' ],
						[ '60', '61', '62', '64' ]
					] ) );
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

			describe( 'pasted table has spans', () => {
				it( 'handles pasting table that has cell with colspan', () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 2, 2 ] )
					);

					pasteTable( [
						[ { colspan: 3, contents: 'aa' } ],
						[ 'ba', 'bb', 'bc' ]
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
						[ 0, 1,    0 ],
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
						[ 'aa', { colspan: 3, contents: 'ab' } ],
						[ { colspan: 4, contents: 'ba' } ],
						[ 'ca', 'cb', 'cc', 'cd' ],
						[ { colspan: 2, contents: 'da' }, 'dc', 'dd' ]
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
						[ { rowspan: 3, contents: 'aa' }, 'ab' ],
						[ 'bb' ],
						[ 'cb' ]
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
						[ 'aa', { rowspan: 3, contents: 'ab' }, { rowspan: 2, contents: 'ac' }, 'ad', 'ae' ],
						[ { rowspan: 3, contents: 'ba' }, 'bd', 'be' ],
						[ 'cc', 'cd', 'ce' ],
						[ 'da', 'db', 'dc', 'dd' ]
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

				it( 'handles pasting multi-spanned table', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03', '04', '05' ],
						[ '10', '11', '12', '13', '14', '15' ],
						[ '20', '21', '22', '23', '24', '25' ],
						[ '30', '31', '32', '33', '34', '35' ],
						[ '40', '41', '42', '43', '44', '45' ]
					] ) );

					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 3, 3 ] )
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
					// | 00 | 01 | 02 | 03 | 04 | 05 |
					// +----+----+----+----+----+----+
					// | 10 | aa      | ac | 14 | 15 |
					// +----+----+----+----+----+----+
					// | 20 | ba | bb      | 24 | 25 |
					// +----+----+         +----+----+
					// | 30 | ca |         | 34 | 35 |
					// +----+----+----+----+----+----+
					// | 40 | 41 | 42 | 43 | 44 | 45 |
					// +----+----+----+----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '03', '04', '05' ],
						[ '10', { contents: 'aa', colspan: 2 }, 'ac', '14', '15' ],
						[ '20', 'ba', { contents: 'bb', colspan: 2, rowspan: 2 }, '24', '25' ],
						[ '30', 'ca', '34', '35' ],
						[ '40', '41', '42', '43', '44', '45' ]
					] ) );

					/* eslint-disable no-multi-spaces */
					assertSelectedCells( model, [
						[ 0, 0, 0, 0, 0, 0 ],
						[ 0, 1,    1, 0, 0 ],
						[ 0, 1, 1,    0, 0 ],
						[ 0, 1,       0, 0 ],
						[ 0, 0, 0, 0, 0, 0 ]
					] );
					/* eslint-enable no-multi-spaces */
				} );
			} );
		} );

		describe( 'pasted table is smaller than the selected area', () => {
			describe( 'no spans', () => {
				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03', '04', '05' ],
						[ '10', '11', '12', '13', '14', '15' ],
						[ '20', '21', '22', '23', '24', '25' ],
						[ '30', '31', '32', '33', '34', '35' ],
						[ '40', '41', '42', '43', '44', '45' ],
						[ '50', '51', '52', '53', '54', '55' ]
					] ) );
				} );

				it( 'should repeat pasted cells horizontally', () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 1, 4 ] )
					);

					pasteTable( [
						[ 'aa', 'ab', 'ac' ],
						[ 'ba', 'bb', 'bc' ],
						[ 'ca', 'cb', 'cc' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ 'aa', 'ab', 'ac', 'aa', 'ab', '05' ],
						[ 'ba', 'bb', 'bc', 'ba', 'bb', '15' ],
						[ '20', '21', '22', '23', '24', '25' ],
						[ '30', '31', '32', '33', '34', '35' ],
						[ '40', '41', '42', '43', '44', '45' ],
						[ '50', '51', '52', '53', '54', '55' ]
					] ) );

					assertSelectedCells( model, [
						[ 1, 1, 1, 1, 1, 0 ],
						[ 1, 1, 1, 1, 1, 0 ],
						[ 0, 0, 0, 0, 0, 0 ],
						[ 0, 0, 0, 0, 0, 0 ]
					] );
				} );

				it( 'should repeat pasted cells vertically', () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 4, 1 ] )
					);

					pasteTable( [
						[ 'aa', 'ab', 'ac' ],
						[ 'ba', 'bb', 'bc' ],
						[ 'ca', 'cb', 'cc' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ 'aa', 'ab', '02', '03', '04', '05' ],
						[ 'ba', 'bb', '12', '13', '14', '15' ],
						[ 'ca', 'cb', '22', '23', '24', '25' ],
						[ 'aa', 'ab', '32', '33', '34', '35' ],
						[ 'ba', 'bb', '42', '43', '44', '45' ],
						[ '50', '51', '52', '53', '54', '55' ]
					] ) );

					assertSelectedCells( model, [
						[ 1, 1, 0, 0, 0, 0 ],
						[ 1, 1, 0, 0, 0, 0 ],
						[ 1, 1, 0, 0, 0, 0 ],
						[ 1, 1, 0, 0, 0, 0 ],
						[ 1, 1, 0, 0, 0, 0 ],
						[ 0, 0, 0, 0, 0, 0 ]
					] );
				} );

				it( 'should repeat pasted cells in both directions', () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 4, 4 ] )
					);

					pasteTable( [
						[ 'aa', 'ab', 'ac' ],
						[ 'ba', 'bb', 'bc' ],
						[ 'ca', 'cb', 'cc' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ 'aa', 'ab', 'ac', 'aa', 'ab', '05' ],
						[ 'ba', 'bb', 'bc', 'ba', 'bb', '15' ],
						[ 'ca', 'cb', 'cc', 'ca', 'cb', '25' ],
						[ 'aa', 'ab', 'ac', 'aa', 'ab', '35' ],
						[ 'ba', 'bb', 'bc', 'ba', 'bb', '45' ],
						[ '50', '51', '52', '53', '54', '55' ]
					] ) );

					assertSelectedCells( model, [
						[ 1, 1, 1, 1, 1, 0 ],
						[ 1, 1, 1, 1, 1, 0 ],
						[ 1, 1, 1, 1, 1, 0 ],
						[ 1, 1, 1, 1, 1, 0 ],
						[ 1, 1, 1, 1, 1, 0 ],
						[ 0, 0, 0, 0, 0, 0 ]
					] );
				} );

				it( 'should repeat pasted cells in the both directions when pasted on table end', () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 5, 5 ] )
					);

					pasteTable( [
						[ 'aa', 'ab', 'ac' ],
						[ 'ba', 'bb', 'bc' ],
						[ 'ca', 'cb', 'cc' ]
					] );

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '03', '04', '05' ],
						[ '10', 'aa', 'ab', 'ac', 'aa', 'ab' ],
						[ '20', 'ba', 'bb', 'bc', 'ba', 'bb' ],
						[ '30', 'ca', 'cb', 'cc', 'ca', 'cb' ],
						[ '40', 'aa', 'ab', 'ac', 'aa', 'ab' ],
						[ '50', 'ba', 'bb', 'bc', 'ba', 'bb' ]
					] ) );

					assertSelectedCells( model, [
						[ 0, 0, 0, 0, 0, 0 ],
						[ 0, 1, 1, 1, 1, 1 ],
						[ 0, 1, 1, 1, 1, 1 ],
						[ 0, 1, 1, 1, 1, 1 ],
						[ 0, 1, 1, 1, 1, 1 ],
						[ 0, 1, 1, 1, 1, 1 ]
					] );
				} );
			} );

			describe( 'content table has spans', () => {
				beforeEach( () => {
					// +----+----+----+----+----+----+
					// | 00 | 01 | 02 | 03 | 04 | 05 |
					// +----+----+----+    +----+----+
					// | 10 | 11 | 12 |    | 14 | 15 |
					// +----+----+    +    +----+----+
					// | 20 | 21 |    |    | 24 | 25 |
					// +----+----+----+    +    +----+
					// | 30 | 31      |    |    | 35 |
					// +----+----+----+----+----+----+
					// | 40                | 44      |
					// +----+----+----+----+         +
					// | 50 | 51 | 52      |         |
					// +----+----+----+----+----+----+
					// | 60 | 61 | 62 | 63 | 64 | 65 |
					// +----+----+----+----+----+----+
					setModelData( model, modelTable( [
						[ '00', '01', '02', { contents: '03', rowspan: 4 }, '04', '05' ],
						[ '10', '11', { contents: '12', rowspan: 2 }, '14', '15' ],
						[ '20', '21', { contents: '24', rowspan: 2 }, '25' ],
						[ '30', { contents: '31', colspan: 2 }, '35' ],
						[ { contents: '40', colspan: 4 }, { contents: '44', colspan: 2, rowspan: 2 } ],
						[ '50', '51', { contents: '52', colspan: 2 } ],
						[ '60', '61', '62', '63', '64', '65' ]
					] ) );
				} );

				it( 'should split spanned cells on the selection edges (vertical spans)', () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 2, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 4, 1 ] ) // Cell 44.
					);

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					// +----+----+----+----+----+----+
					// | 00 | 01 | 02 | 03 | 04 | 05 |
					// +----+----+----+    +----+----+
					// | 10 | 11 | 12 |    | 14 | 15 |
					// +----+----+----+----+----+----+
					// | aa | ab | aa | ab | aa | 25 |
					// +----+----+----+----+----+----+
					// | ba | bb | ba | bb | ba | 35 |
					// +----+----+----+----+----+----+
					// | aa | ab | aa | ab | aa |    |
					// +----+----+----+----+----+    +
					// | 50 | 51 | 52      |    |    |
					// +----+----+----+----+----+----+
					// | 60 | 61 | 62 | 63 | 64 | 65 |
					// +----+----+----+----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', { contents: '03', rowspan: 2 }, '04', '05' ],
						[ '10', '11', '12', '14', '15' ],
						[ 'aa', 'ab', 'aa', 'ab', 'aa', '25' ],
						[ 'ba', 'bb', 'ba', 'bb', 'ba', '35' ],
						[ 'aa', 'ab', 'aa', 'ab', 'aa', { contents: '', rowspan: 2 } ],
						[ '50', '51', { contents: '52', colspan: 2 }, '' ],
						[ '60', '61', '62', '63', '64', '65' ]
					] ) );
				} );

				it( 'should split spanned cells on the selection edges (horizontal spans)', () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 2 ] ),
						modelRoot.getNodeByPath( [ 0, 4, 1 ] ) // Cell 44.
					);

					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', 'bb' ]
					] );

					// +----+----+----+----+----+----+
					// | 00 | 01 | aa | ab | aa | 05 |
					// +----+----+----+----+----+----+
					// | 10 | 11 | ba | bb | ba | 15 |
					// +----+----+----+----+----+----+
					// | 20 | 21 | aa | ab | aa | 25 |
					// +----+----+----+----+----+----+
					// | 30 | 31 | ba | bb | ba | 35 |
					// +----+----+----+----+----+----+
					// | 40      | aa | ab | aa |    |
					// +----+----+----+----+----+    +
					// | 50 | 51 | 52      |    |    |
					// +----+----+----+----+----+----+
					// | 60 | 61 | 62 | 63 | 64 | 65 |
					// +----+----+----+----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', 'aa', 'ab', 'aa', '05' ],
						[ '10', '11', 'ba', 'bb', 'ba', '15' ],
						[ '20', '21', 'aa', 'ab', 'aa', '25' ],
						[ '30', '31', 'ba', 'bb', 'ba', '35' ],
						[ { contents: '40', colspan: 2 }, 'aa', 'ab', 'aa', { contents: '', rowspan: 2 } ],
						[ '50', '51', { contents: '52', colspan: 2 }, '' ],
						[ '60', '61', '62', '63', '64', '65' ]
					] ) );
				} );
			} );

			describe( 'pasted table has spans', () => {
				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03', '04', '05', '06' ],
						[ '10', '11', '12', '13', '14', '15', '16' ],
						[ '20', '21', '22', '23', '24', '25', '26' ],
						[ '30', '31', '32', '33', '34', '35', '36' ],
						[ '40', '41', '42', '43', '44', '45', '46' ],
						[ '50', '51', '52', '53', '54', '55', '56' ],
						[ '60', '61', '62', '63', '64', '65', '66' ],
						[ '70', '71', '72', '73', '74', '75', '76' ],
						[ '80', '81', '82', '83', '84', '85', '86' ]
					] ) );
				} );

				it( 'should trim overlapping cells', () => {
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 8, 6 ] )
					);

					// +----+----+----+----+
					// | aa                |
					// +----+----+----+----+
					// | ba | bb           |
					// +    +----+----+----+
					// |    | cb | cc      |
					// +    +    +----+----+
					// |    |    | dc | dd |
					// +    +    +    +----+
					// |    |    |    | ed |
					// +----+----+----+----+
					pasteTable( [
						[ { contents: 'aa', colspan: 4 } ],
						[ { contents: 'ba', rowspan: 4 }, { contents: 'bb', colspan: 3 } ],
						[ { contents: 'cb', rowspan: 3 }, { contents: 'cc', colspan: 2 } ],
						[ { contents: 'dc', rowspan: 2 }, 'dd' ],
						[ 'ed' ]
					] );

					// +----+----+----+----+----+----+----+
					// | 00 | 01 | 02 | 03 | 04 | 05 | 06 |
					// +----+----+----+----+----+----+----+
					// | 10 | aa                | aa      |
					// +----+----+----+----+----+----+----+
					// | 20 | ba | bb           | ba | bb |
					// +----+    +----+----+----+    +----+
					// | 30 |    | cb | cc      |    | cb |
					// +----+    +    +----+----+    +    +
					// | 40 |    |    | dc | dd |    |    |
					// +----+    +    +    +----+    +    +
					// | 50 |    |    |    | ed |    |    |
					// +----+----+----+----+----+----+----+
					// | 60 | aa                | aa      |
					// +----+----+----+----+----+----+----+
					// | 70 | ba | bb           | ba | bb |
					// +----+    +----+----+----+    +----+
					// | 80 |    | cb | cc      |    | cb |
					// +----+----+----+----+----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ '00', '01', '02', '03', '04', '05', '06' ],
						[ '10', { contents: 'aa', colspan: 4 }, { contents: 'aa', colspan: 2 } ],
						[ '20', { contents: 'ba', rowspan: 4 }, { contents: 'bb', colspan: 3 }, { contents: 'ba', rowspan: 4 }, 'bb' ],
						[ '30', { contents: 'cb', rowspan: 3 }, { contents: 'cc', colspan: 2 }, { contents: 'cb', rowspan: 3 } ],
						[ '40', { contents: 'dc', rowspan: 2 }, 'dd' ],
						[ '50', 'ed' ],
						[ '60', { contents: 'aa', colspan: 4 }, { contents: 'aa', colspan: 2 } ],
						[ '70', { contents: 'ba', rowspan: 2 }, { contents: 'bb', colspan: 3 }, { contents: 'ba', rowspan: 2 }, 'bb' ],
						[ '80', 'cb', { contents: 'cc', colspan: 2 }, 'cb' ]
					] ) );
				} );
			} );
		} );

		describe( 'fixing pasted table broken layout', () => {
			it( 'should trim pasted cells\' width if they exceeds table width established by the first row', () => {
				// Select 00 -> 22 (selection 2x3 - equal to expected fixed table)
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 1 ] )
				);

				// +----+----+
				// | aa | ab |             <- First row establish table width=2.
				// +----+----+----+----+
				// | ba | bb           |   <- Cell "bb" sticks out by 2 slots.
				// +----+----+----+----+
				// | ca           |        <- Cell "ca" sticks out by 1 slot.
				// +----+----+----+
				pasteTable( [
					[ 'aa', 'ab' ],
					[ 'ba', { colspan: 3, contents: 'bb' } ],
					[ { colspan: 3, contents: 'ca' } ]
				] );

				// +----+----+----+----+
				// | aa | ab | 02 | 03 |
				// +----+----+----+----+
				// | ba | bb | 12 | 13 |
				// +----+----+----+----+
				// | ca      | 22 | 23 |
				// +----+----+----+----+
				// | 30 | 31 | 32 | 33 |
				// +----+----+----+----+
				assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
					[ 'aa', 'ab', '02', '03' ],
					[ 'ba', 'bb', '12', '13' ],
					[ { contents: 'ca', colspan: 2 }, '22', '23' ],
					[ '30', '31', '32', '33' ]
				] ) );

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 1, 1, 0, 0 ],
					[ 1, 1, 0, 0 ],
					[ 1,    0, 0 ],
					[ 0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it( 'should trim pasted cells\' height if they exceeds table height established by the last row', () => {
				// Select 00 -> 12 (selection 3x2 - equal to expected fixed table)
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 2 ] )
				);

				// +----+----+----+
				// | aa | ab | ac |
				// +----+----+    +
				// | ba | bb |    |   <- Last row establish table height=2.
				// +----+    +    +
				//      |    |    |   <- Cell "ac" sticks out by 1 slot.
				//      +    +----+
				//      |    |        <- Cell "bb" sticks out by 2 slots.
				//      +----+
				pasteTable( [
					[ 'aa', 'ab', { contents: 'ac', rowspan: 3 } ],
					[ 'ba', { contents: 'bb', rowspan: 3 } ]
				] );

				// +----+----+----+----+
				// | aa | ab | ac | 03 |
				// +----+----+    +----+
				// | ba | bb |    | 13 |
				// +----+----+----+----+
				// | 20 | 21 | 22 | 23 |
				// +----+----+----+----+
				// | 30 | 31 | 32 | 33 |
				// +----+----+----+----+
				assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
					[ 'aa', 'ab', { rowspan: 2, contents: 'ac' }, '03' ],
					[ 'ba', 'bb', '13' ],
					[ '20', '21', '22', '23' ],
					[ '30', '31', '32', '33' ]
				] ) );

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 1, 1, 1, 0 ],
					[ 1, 1,    0 ],
					[ 0, 0, 0, 0 ],
					[ 0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it( 'should trim pasted cells\' height and width if they exceeds table height and width', () => {
				// Select 00 -> 11 (selection 2x2 - equal to expected fixed table)
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				// +----+----+
				// | aa | ab |
				// +----+----+----+----+
				// | ba | bb           | <- Cell "bb" sticks out by 2 slots in width and by 1 slot in height.
				// +----+              +
				//      |              |
				//      +----+----+----+
				pasteTable( [
					[ 'aa', 'ab' ],
					[ 'ba', { contents: 'bb', colspan: 3, rowspan: 2 } ]
				] );

				// +----+----+----+----+
				// | aa | ab | 02 | 03 |
				// +----+----+----+----+
				// | ba | bb | 12 | 13 |
				// +----+----+----+----+
				// | 20 | 21 | 22 | 23 |
				// +----+----+----+----+
				// | 30 | 31 | 32 | 33 |
				// +----+----+----+----+
				assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
					[ 'aa', 'ab', '02', '03' ],
					[ 'ba', 'bb', '12', '13' ],
					[ '20', '21', '22', '23' ],
					[ '30', '31', '32', '33' ]
				] ) );

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 1, 1, 0, 0 ],
					[ 1, 1, 0, 0 ],
					[ 0, 0, 0, 0 ],
					[ 0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it(
				'should trim pasted cells\' width if they exceeds pasted table width (pasted height is bigger then selection height)',
				() => {
					// Select 00 -> 11 (selection 2x2 - smaller by height than the expected fixed table)
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 1, 1 ] )
					);

					// +----+----+
					// | aa | ab |             <- First row establish table width=2.
					// +----+----+----+----+
					// | ba | bb           |   <- Cell "bb" sticks out by 2 slots.
					// +----+----+----+----+
					// | ca           |        <- Cell "ca" sticks out by 1 slot.
					// +----+----+----+
					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', { colspan: 3, contents: 'bb' } ],
						[ { colspan: 3, contents: 'ca' } ]
					] );

					// +----+----+----+----+
					// | aa | ab | 02 | 03 |
					// +----+----+----+----+
					// | ba | bb | 12 | 13 |
					// +----+----+----+----+
					// | 20 | 21 | 22 | 23 |
					// +----+----+----+----+
					// | 30 | 31 | 32 | 33 |
					// +----+----+----+----+
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
				}
			);

			it(
				'should trim pasted cells\' height if they exceeds pasted table height (pasted width is bigger then selection width)',
				() => {
					// Select 00 -> 11 (selection 2x2 - smaller by width than the expected fixed table)
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 1, 1 ] )
					);

					// +----+----+----+
					// | aa | ab | ac |
					// +----+----+    +
					// | ba | bb |    |   <- Last row establish table height=2.
					// +----+    +    +
					//      |    |    |   <- Cell "ac" sticks out by 1 slot.
					//      +    +----+
					//      |    |        <- Cell "bb" sticks out by 2 slots.
					//      +----+
					pasteTable( [
						[ 'aa', 'ab', { contents: 'ac', rowspan: 3 } ],
						[ 'ba', { contents: 'bb', rowspan: 3 } ]
					] );

					// +----+----+----+----+
					// | aa | ab | 02 | 03 |
					// +----+----+----+----+
					// | ba | bb | 12 | 13 |
					// +----+----+----+----+
					// | 20 | 21 | 22 | 23 |
					// +----+----+----+----+
					// | 30 | 31 | 32 | 33 |
					// +----+----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ 'aa', 'ab', '02', '03' ],
						[ 'ba', 'bb', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );

					/* eslint-disable no-multi-spaces */
					assertSelectedCells( model, [
						[ 1, 1, 0, 0 ],
						[ 1, 1, 0, 0 ],
						[ 0, 0, 0, 0 ],
						[ 0, 0, 0, 0 ]
					] );
					/* eslint-enable no-multi-spaces */
				}
			);

			it(
				`should trim pasted pasted cells' height and width if they exceeds pasted table dimensions
				(pasted table is bigger then selection width)`,
				() => {
					// Select 00 -> 11 (selection 2x2 - smaller than the expected fixed table)
					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
						modelRoot.getNodeByPath( [ 0, 1, 1 ] )
					);

					// +----+----+----+
					// | aa | ab | ac |
					// +----+----+----+----+
					// | ba | bb           | <- Cell "bb" sticks out by 1 slots in width and by 1 slot in height.
					// +----+              +
					// | ca |              |
					// +----+              +
					//      |              |
					//      +----+----+----+
					pasteTable( [
						[ 'aa', 'ab' ],
						[ 'ba', { contents: 'bb', colspan: 3, rowspan: 2 } ]
					] );

					// +----+----+----+----+
					// | aa | ab | 02 | 03 |
					// +----+----+----+----+
					// | ba | bb | 12 | 13 |
					// +----+----+----+----+
					// | 20 | 21 | 22 | 23 |
					// +----+----+----+----+
					// | 30 | 31 | 32 | 33 |
					// +----+----+----+----+
					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
						[ 'aa', 'ab', '02', '03' ],
						[ 'ba', 'bb', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );

					/* eslint-disable no-multi-spaces */
					assertSelectedCells( model, [
						[ 1, 1, 0, 0 ],
						[ 1, 1, 0, 0 ],
						[ 0, 0, 0, 0 ],
						[ 0, 0, 0, 0 ]
					] );
					/* eslint-enable no-multi-spaces */
				}
			);
		} );

		describe( 'headings overlapping selected area', () => {
			beforeEach( () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02', '03', '04', '05' ],
					[ '10', '11', '12', '13', '14', '15' ],
					[ '20', '21', '22', '23', '24', '25' ],
					[ '30', '31', '32', '33', '34', '35' ],
					[ '40', '41', '42', '43', '44', '45' ],
					[ '50', '51', '52', '53', '54', '55' ]
				], { headingRows: 3, headingColumns: 3 } ) );
			} );

			it( 'should not split cells if they are not overlapping from headings', () => {
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 0, 0 ] )
				);

				// +----+----+----+----+
				// | aa           | ad |
				// +              +----+
				// |              | bd |
				// +              +----+
				// |              | cd |
				// +----+----+----+----+
				// | da | db | dc | dd |
				// +----+----+----+----+
				pasteTable( [
					[ { contents: 'aa', colspan: 3, rowspan: 3 }, 'ad' ],
					[ 'bd' ],
					[ 'cd' ],
					[ 'da', 'db', 'dc', 'dd' ]
				] );

				// +----+----+----+----+----+----+
				// | aa           | ad | 04 | 05 |
				// +              +----+----+----+
				// |              | bd | 14 | 15 |
				// +              +----+----+----+
				// |              | cd | 24 | 25 |
				// +----+----+----+----+----+----+ <-- heading rows
				// | da | db | dc | dd | 34 | 35 |
				// +----+----+----+----+----+----+
				// | 40 | 41 | 42 | 43 | 44 | 45 |
				// +----+----+----+----+----+----+
				// | 50 | 51 | 52 | 53 | 54 | 55 |
				// +----+----+----+----+----+----+
				//                ^-- heading columns
				assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
					[ { contents: 'aa', colspan: 3, rowspan: 3 }, 'ad', '04', '05' ],
					[ 'bd', '14', '15' ],
					[ 'cd', '24', '25' ],
					[ 'da', 'db', 'dc', 'dd', '34', '35' ],
					[ '40', '41', '42', '43', '44', '45' ],
					[ '50', '51', '52', '53', '54', '55' ]
				], { headingRows: 3, headingColumns: 3 } ) );

				assertSelectionRangesSorted();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 1,       1, 0, 0 ],
					[          1, 0, 0 ],
					[          1, 0, 0 ],
					[ 1, 1, 1, 1, 0, 0 ],
					[ 0, 0, 0, 0, 0, 0 ],
					[ 0, 0, 0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it( 'should split cells that overlap from headings', () => {
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
					modelRoot.getNodeByPath( [ 0, 1, 1 ] )
				);

				// +----+----+----+----+
				// | aa           | ad |
				// +              +----+
				// |              | bd |
				// +              +----+
				// |              | cd |
				// +----+----+----+----+
				// | da | db | dc | dd |
				// +----+----+----+----+
				pasteTable( [
					[ { contents: 'aa', colspan: 3, rowspan: 3 }, 'ad' ],
					[ 'bd' ],
					[ 'cd' ],
					[ 'da', 'db', 'dc', 'dd' ]
				] );

				// +----+----+----+----+----+----+
				// | 00 | 01 | 02 | 03 | 04 | 05 |
				// +----+----+----+----+----+----+
				// | 10 | aa      |    | ad | 15 |
				// +----+         +    +----+----+
				// | 20 |         |    | bd | 25 |
				// +----+----+----+----+----+----+ <-- heading rows
				// | 30 |         |    | cd | 35 |
				// +----+----+----+----+----+----+
				// | 40 | da | db | dc | dd | 45 |
				// +----+----+----+----+----+----+
				// | 50 | 51 | 52 | 53 | 54 | 55 |
				// +----+----+----+----+----+----+
				//                ^-- heading columns
				assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '01', '02', '03', '04', '05' ],
					[ '10', { contents: 'aa', colspan: 2, rowspan: 2 }, { contents: '', rowspan: 2 }, 'ad', '15' ],
					[ '20', 'bd', '25' ],
					[ '30', { contents: '', colspan: 2 }, '', 'cd', '35' ],
					[ '40', 'da', 'db', 'dc', 'dd', '45' ],
					[ '50', '51', '52', '53', '54', '55' ]
				], { headingRows: 3, headingColumns: 3 } ) );

				assertSelectionRangesSorted();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0, 0 ],
					[ 0, 1,    1, 1, 0 ],
					[ 0,          1, 0 ],
					[ 0, 1,    1, 1, 0 ],
					[ 0, 1, 1, 1, 1, 0 ],
					[ 0, 0, 0, 0, 0, 0 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it( 'should split cells that overlap from heading rows', () => {
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 2, 3 ] ),
					modelRoot.getNodeByPath( [ 0, 2, 3 ] )
				);

				// +----+----+----+----+
				// | aa           | ad |
				// +              +----+
				// |              | bd |
				// +              +----+
				// |              | cd |
				// +----+----+----+----+
				// | da | db | dc | dd |
				// +----+----+----+----+
				pasteTable( [
					[ { contents: 'aa', colspan: 3, rowspan: 3 }, 'ad' ],
					[ 'bd' ],
					[ 'cd' ],
					[ 'da', 'db', 'dc', 'dd' ]
				] );

				// +----+----+----+----+----+----+----+
				// | 00 | 01 | 02 | 03 | 04 | 05 |    |
				// +----+----+----+----+----+----+----+
				// | 10 | 11 | 12 | 13 | 14 | 15 |    |
				// +----+----+----+----+----+----+----+
				// | 20 | 21 | 22 | aa           | ad |
				// +----+----+----+----+----+----+----+ <-- heading rows
				// | 30 | 31 | 32 |              | bd |
				// +----+----+----+              +----+
				// | 40 | 41 | 42 |              | cd |
				// +----+----+----+----+----+----+----+
				// | 50 | 51 | 52 | da | db | dc | dd |
				// +----+----+----+----+----+----+----+
				//                ^-- heading columns
				assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '01', '02', '03', '04', '05', '' ],
					[ '10', '11', '12', '13', '14', '15', '' ],
					[ '20', '21', '22', { contents: 'aa', colspan: 3 }, 'ad' ],
					[ '30', '31', '32', { contents: '', colspan: 3, rowspan: 2 }, 'bd' ],
					[ '40', '41', '42', 'cd' ],
					[ '50', '51', '52', 'da', 'db', 'dc', 'dd' ]
				], { headingRows: 3, headingColumns: 3 } ) );

				assertSelectionRangesSorted();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0, 0, 0 ],
					[ 0, 0, 0, 0, 0, 0, 0 ],
					[ 0, 0, 0, 1,       1 ],
					[ 0, 0, 0, 1,       1 ],
					[ 0, 0, 0,          1 ],
					[ 0, 0, 0, 1, 1, 1, 1 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it( 'should split cells that overlap from heading columns', () => {
				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 3, 2 ] ),
					modelRoot.getNodeByPath( [ 0, 3, 2 ] )
				);

				// +----+----+----+----+
				// | aa           | ad |
				// +              +----+
				// |              | bd |
				// +              +----+
				// |              | cd |
				// +----+----+----+----+
				// | da | db | dc | dd |
				// +----+----+----+----+
				pasteTable( [
					[ { contents: 'aa', colspan: 3, rowspan: 3 }, 'ad' ],
					[ 'bd' ],
					[ 'cd' ],
					[ 'da', 'db', 'dc', 'dd' ]
				] );

				// +----+----+----+----+----+----+
				// | 00 | 01 | 02 | 03 | 04 | 05 |
				// +----+----+----+----+----+----+
				// | 10 | 11 | 12 | 13 | 14 | 15 |
				// +----+----+----+----+----+----+
				// | 20 | 21 | 22 | 23 | 24 | 25 |
				// +----+----+----+----+----+----+ <-- heading rows
				// | 30 | 31 | aa |         | ad |
				// +----+----+    +         +----+
				// | 40 | 41 |    |         | bd |
				// +----+----+    +         +----+
				// | 50 | 51 |    |         | cd |
				// +----+----+----+----+----+----+
				// |    |    | da | db | dc | dd |
				// +----+----+----+----+----+----+
				//                ^-- heading columns
				assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
					[ '00', '01', '02', '03', '04', '05' ],
					[ '10', '11', '12', '13', '14', '15' ],
					[ '20', '21', '22', '23', '24', '25' ],
					[ '30', '31', { contents: 'aa', rowspan: 3 }, { contents: '', colspan: 2, rowspan: 3 }, 'ad' ],
					[ '40', '41', 'bd' ],
					[ '50', '51', 'cd' ],
					[ '', '', 'da', 'db', 'dc', 'dd' ]
				], { headingRows: 3, headingColumns: 3 } ) );

				assertSelectionRangesSorted();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 0, 0, 0, 0, 0, 0 ],
					[ 0, 0, 0, 0, 0, 0 ],
					[ 0, 0, 0, 0, 0, 0 ],
					[ 0, 0, 1, 1,    1 ],
					[ 0, 0,          1 ],
					[ 0, 0,          1 ],
					[ 0, 0, 1, 1, 1, 1 ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			it( 'should split cells that overlap from headings (repeated pasted table)', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02', '03', '04' ],
					[ '10', '11', '12', '13', '14' ],
					[ '20', '21', '22', '23', '24' ],
					[ '30', '31', '32', '33', '34' ],
					[ '40', '41', '42', '43', '44' ]
				], { headingRows: 1, headingColumns: 1 } ) );

				tableSelection.setCellSelection(
					modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
					modelRoot.getNodeByPath( [ 0, 4, 4 ] )
				);

				// +----+----+----+
				// | aa      | ac |
				// +         +----+
				// |         | bc |
				// +----+----+----+
				// | ca | cb | cc |
				// +----+----+----+
				pasteTable( [
					[ { contents: 'aa', colspan: 2, rowspan: 2 }, 'ac' ],
					[ 'bc' ],
					[ 'ca', 'cb', 'cc' ]
				] );

				// +----+----+----+----+----+
				// | aa |    | ac | aa      |
				// +----+----+----+----+----+ <-- heading rows
				// |    |    | bc |         |
				// +----+----+----+----+----+
				// | ca | cb | cc | ca | cb |
				// +----+----+----+----+----+
				// | aa |    | ac | aa      |
				// +    +    +----+         +
				// |    |    | bc |         |
				// +----+----+----+----+----+
				//      ^-- heading columns
				assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
					[ 'aa', '', 'ac', { contents: 'aa', colspan: 2 } ],
					[ '', '', 'bc', { contents: '', colspan: 2 } ],
					[ 'ca', 'cb', 'cc', 'ca', 'cb' ],
					[ { contents: 'aa', rowspan: 2 }, { contents: '', rowspan: 2 }, 'ac', { contents: 'aa', colspan: 2, rowspan: 2 } ],
					[ 'bc' ]
				], { headingRows: 1, headingColumns: 1 } ) );

				assertSelectionRangesSorted();

				/* eslint-disable no-multi-spaces */
				assertSelectedCells( model, [
					[ 1, 1, 1, 1    ],
					[ 1, 1, 1, 1    ],
					[ 1, 1, 1, 1, 1 ],
					[ 1, 1, 1, 1    ],
					[       1       ]
				] );
				/* eslint-enable no-multi-spaces */
			} );

			function assertSelectionRangesSorted() {
				const selectionRanges = Array.from( model.document.selection.getRanges() );
				const selectionRangesSorted = selectionRanges.slice().sort( ( a, b ) => a.start.isBefore( b.start ) ? -1 : 1 );

				const selectionPaths = selectionRanges.map( ( { start } ) => start.path );
				const sortedPaths = selectionRangesSorted.map( ( { start } ) => start.path );

				expect( selectionPaths ).to.deep.equal( sortedPaths );
			}
		} );
	} );

	describe( 'Clipboard integration - paste (content scenarios)', () => {
		it( 'handles multiple paragraphs in table cell', async () => {
			await createEditor();

			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '01', '11', '12' ],
				[ '02', '21', '22' ]
			] ) );

			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			pasteTable( [
				[ '<p>a</p><p>a</p><p>a</p>', 'ab' ],
				[ 'ba', 'bb' ]
			] );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ '<paragraph>a</paragraph><paragraph>a</paragraph><paragraph>a</paragraph>', 'ab', '02' ],
				[ 'ba', 'bb', '12' ],
				[ '02', '21', '22' ]
			] ) );
		} );

		it( 'handles image in table cell', async () => {
			await createEditor( [ ImageEditing, ImageCaptionEditing ] );

			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '01', '11', '12' ],
				[ '02', '21', '22' ]
			] ) );

			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			pasteTable( [
				[ '<img src="/assets/sample.jpg">', 'ab' ],
				[ 'ba', 'bb' ]
			] );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ '<image src="/assets/sample.jpg"><caption></caption></image>', 'ab', '02' ],
				[ 'ba', 'bb', '12' ],
				[ '02', '21', '22' ]
			] ) );
		} );

		it( 'handles mixed nested content in table cell', async () => {
			await createEditor( [ ImageEditing, ImageCaptionEditing, BlockQuoteEditing, HorizontalLineEditing, ListEditing ] );

			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '01', '11', '12' ],
				[ '02', '21', '22' ]
			] ) );

			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			const img = '<img src="/assets/sample.jpg">';
			const list = '<ul><li>foo</li><li>bar</li></ul>';
			const blockquote = `<blockquote><p>baz</p>${ list }</blockquote>`;

			pasteTable( [
				[ `${ img }${ list }${ blockquote }`, 'ab' ],
				[ 'ba', 'bb' ]
			] );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[
					'<image src="/assets/sample.jpg"><caption></caption></image>' +
					'<listItem listIndent="0" listType="bulleted">foo</listItem>' +
					'<listItem listIndent="0" listType="bulleted">bar</listItem>' +
					'<blockQuote>' +
					'<paragraph>baz</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">foo</listItem>' +
					'<listItem listIndent="0" listType="bulleted">bar</listItem>' +
					'</blockQuote>',
					'ab',
					'02' ],
				[ 'ba', 'bb', '12' ],
				[ '02', '21', '22' ]
			] ) );
		} );

		it( 'handles table cell properties', async () => {
			await createEditor( [ TableCellPropertiesEditing ] );

			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '01', '11', '12' ],
				[ '02', '21', '22' ]
			] ) );

			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			pasteTable( [
				[ { contents: 'aa', style: 'border:1px solid #f00;background:#ba7;width:1337px' }, 'ab' ],
				[ 'ba', 'bb' ]
			] );

			const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

			expect( tableCell.getAttribute( 'borderColor' ) ).to.deep.equal( {
				top: '#f00',
				right: '#f00',
				bottom: '#f00',
				left: '#f00'
			} );
			expect( tableCell.getAttribute( 'borderStyle' ) ).to.deep.equal( {
				top: 'solid',
				right: 'solid',
				bottom: 'solid',
				left: 'solid'
			} );
			expect( tableCell.getAttribute( 'borderWidth' ) ).to.deep.equal( {
				top: '1px',
				right: '1px',
				bottom: '1px',
				left: '1px'
			} );
			expect( tableCell.getAttribute( 'backgroundColor' ) ).to.equal( '#ba7' );
			expect( tableCell.getAttribute( 'width' ) ).to.equal( '1337px' );
		} );

		it( 'discards table properties', async () => {
			await createEditor( [ TableCellPropertiesEditing ] );

			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '01', '11', '12' ],
				[ '02', '21', '22' ]
			] ) );

			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			const tableStyle = 'border:1px solid #f00;background:#ba7;width:1337px';
			const pastedTable = `<table style="${ tableStyle }"><tr><td>aa</td><td>ab</td></tr><tr><td>ba</td><td>bb</td></tr></table>`;
			const data = {
				dataTransfer: createDataTransfer(),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
			data.dataTransfer.setData( 'text/html', pastedTable );
			viewDocument.fire( 'paste', data );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ 'aa', 'ab', '02' ],
				[ 'ba', 'bb', '12' ],
				[ '02', '21', '22' ]
			] ) );
		} );

		it( 'removes block fillers from empty cells (both td and th)', async () => {
			await createEditor();

			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '01', '11', '12' ],
				[ '02', '21', '22' ]
			] ) );

			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			pasteTable( [
				[ '&nbsp;', '&nbsp;' ],
				[ '&nbsp;', '&nbsp;' ]
			], { headingRows: 1 } );

			assertEqualMarkup( getModelData( model, { withoutSelection: true } ), modelTable( [
				[ '', '', '02' ],
				[ '', '', '12' ],
				[ '02', '21', '22' ]
			] ) );
		} );
	} );

	async function createEditor( extraPlugins = [] ) {
		editor = await ClassicTestEditor.create( element, {
			plugins: [ TableEditing, TableClipboard, Paragraph, Clipboard, ...extraPlugins ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
		viewDocument = editor.editing.view.document;
		tableSelection = editor.plugins.get( 'TableSelection' );
	}

	function pasteTable( tableData, attributes = {} ) {
		const data = {
			dataTransfer: createDataTransfer(),
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};
		data.dataTransfer.setData( 'text/html', viewTable( tableData, attributes ) );
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

	function setupBatchWatch() {
		const createdBatches = new Set();

		model.on( 'applyOperation', ( evt, [ operation ] ) => {
			if ( operation.isDocumentOperation ) {
				createdBatches.add( operation.batch );
			}
		} );

		return createdBatches;
	}
} );
