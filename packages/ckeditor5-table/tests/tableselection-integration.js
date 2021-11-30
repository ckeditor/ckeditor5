/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Delete from '@ckeditor/ckeditor5-typing/src/delete';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';

import TableEditing from '../src/tableediting';
import TableSelection from '../src/tableselection';
import TableClipboard from '../src/tableclipboard';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { assertSelectedCells, modelTable } from './_utils/utils';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import Input from '@ckeditor/ckeditor5-typing/src/input';
import ViewText from '@ckeditor/ckeditor5-engine/src/view/text';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';

describe( 'TableSelection - integration', () => {
	let editor, model, tableSelection, modelRoot, element, viewDocument;

	afterEach( async () => {
		element.remove();
		await editor.destroy();
	} );

	describe( 'on delete', () => {
		beforeEach( async () => {
			await setupEditor( [ Delete ] );
		} );

		it( 'should clear contents of the selected table cells and put selection in last cell on backward delete', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			const domEventData = new DomEventData( viewDocument, {
				preventDefault: sinon.spy()
			}, {
				direction: 'backward',
				unit: 'character',
				sequence: 1
			} );
			viewDocument.fire( 'delete', domEventData );

			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '', '', '13' ],
				[ '', '[]', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should clear contents of the selected table cells and put selection in last cell on delete forward', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			const domEventData = new DomEventData( viewDocument, {
				preventDefault: sinon.spy()
			}, {
				direction: 'forward',
				unit: 'character',
				sequence: 1
			} );
			viewDocument.fire( 'delete', domEventData );

			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '[]', '', '13' ],
				[ '', '', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should not interfere with default key handler if no table selection', () => {
			setModelData( model, modelTable( [
				[ '11[]', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );

			const domEventData = new DomEventData( viewDocument, {
				preventDefault: sinon.spy()
			}, {
				direction: 'backward',
				unit: 'character',
				sequence: 1
			} );
			viewDocument.fire( 'delete', domEventData );

			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '1[]', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );
	} );

	describe( 'on user input', () => {
		beforeEach( async () => {
			await setupEditor( [ Input ] );
		} );

		it( 'should clear contents of the selected table cells and put selection in last cell on user input', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			viewDocument.fire( 'keydown', { keyCode: getCode( 'x' ) } );

			// Mutate at the place where the document selection was put; it's more realistic
			// than mutating at some arbitrary position.
			const placeOfMutation = viewDocument.selection.getFirstRange().start.parent;

			viewDocument.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewText( viewDocument, 'x' ) ],
					node: placeOfMutation
				}
			] );

			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '', '', '13' ],
				[ '', 'x[]', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'should not interfere with default key handler if no table selection', () => {
			viewDocument.fire( 'keydown', { keyCode: getCode( 'x' ) } );

			// Mutate at the place where the document selection was put; it's more realistic
			// than mutating at some arbitrary position.
			const placeOfMutation = viewDocument.selection.getFirstRange().start.parent;

			viewDocument.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewText( viewDocument, 'x' ) ],
					node: placeOfMutation
				}
			] );

			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ 'x[]11', '12', '13' ],
				[ '21', '22', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );
	} );

	describe( 'with other features', () => {
		beforeEach( async () => {
			await setupEditor( [ Clipboard, HorizontalLine ] );
		} );

		it( 'allows pasting over multi-cell selection', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			const dataTransferMock = {
				getData: sinon.stub().withArgs( 'text/plain' ).returns( 'foo' )
			};

			editor.editing.view.document.fire( 'clipboardInput', {
				dataTransfer: dataTransferMock,
				stop: sinon.spy()
			} );

			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ 'foo[]', '', '13' ],
				[ '', '', '23' ],
				[ '31', '32', '33' ]
			] ) );
		} );

		it( 'allows inserting a horizontal line over a multi-range selection', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			editor.execute( 'horizontalLine' );

			expect(
				getModelData( model ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell><horizontalLine></horizontalLine><paragraph>[]</paragraph></tableCell>' +
						'<tableCell><paragraph></paragraph></tableCell>' +
						'<tableCell><paragraph>13</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph></paragraph></tableCell>' +
						'<tableCell><paragraph></paragraph></tableCell>' +
						'<tableCell><paragraph>23</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>31</paragraph></tableCell>' +
						'<tableCell><paragraph>32</paragraph></tableCell>' +
						'<tableCell><paragraph>33</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );

		// https://github.com/ckeditor/ckeditor5/issues/7659.
		// The fix is in the `DocumentSelection` class but this test is here to make sure that the fix works
		// and that the behavior won't change in the future.
		it( 'should not fix selection if not all ranges were removed', () => {
			// [ ][ ][ ]
			// [x][x][ ]
			// [x][x][ ]
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 1, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 2, 1 ] )
			);

			editor.model.change( writer => {
				// Remove second row.
				writer.remove( modelRoot.getNodeByPath( [ 0, 1 ] ) );
			} );

			expect(
				getModelData( model ) ).to.equalMarkup(
				'<table>' +
					'<tableRow>' +
						'<tableCell><paragraph>11</paragraph></tableCell>' +
						'<tableCell><paragraph>12</paragraph></tableCell>' +
						'<tableCell><paragraph>13</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'[<tableCell><paragraph>31</paragraph></tableCell>]' +
						'[<tableCell><paragraph>32</paragraph></tableCell>]' +
						'<tableCell><paragraph>33</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );
	} );

	describe( 'with undo', () => {
		beforeEach( async () => {
			await setupEditor( [ UndoEditing ] );
		} );

		it( 'works with merge cells command', () => {
			setModelData( editor.model, modelTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			] ) );

			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 0 ] ),
				modelRoot.getNodeByPath( [ 0, 0, 1 ] )
			);

			editor.execute( 'mergeTableCells' );

			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ { colspan: 2, contents: '<paragraph>[00</paragraph><paragraph>01]</paragraph>' } ],
				[ '10', '11' ]
			] ) );

			editor.execute( 'undo' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			] ) );

			assertSelectedCells( model, [
				[ 1, 1 ],
				[ 0, 0 ]
			] );
		} );
	} );

	async function setupEditor( plugins ) {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ TableEditing, TableSelection, TableClipboard, Paragraph, ...plugins ]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();
		viewDocument = editor.editing.view.document;
		tableSelection = editor.plugins.get( TableSelection );

		setModelData( model, modelTable( [
			[ '[]11', '12', '13' ],
			[ '21', '22', '23' ],
			[ '31', '32', '33' ]
		] ) );
	}
} );
