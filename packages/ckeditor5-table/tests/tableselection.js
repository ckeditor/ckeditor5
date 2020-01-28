/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

import TableEditing from '../src/tableediting';
import TableSelection from '../src/tableselection';
import { modelTable } from './_utils/utils';

describe( 'table selection', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, TableSelection, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	describe( 'behavior', () => {
		let view, domEvtDataStub;

		beforeEach( () => {
			view = editor.editing.view;

			domEvtDataStub = {
				domEvent: {
					buttons: 1
				},
				target: undefined,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
		} );

		it( 'should not start table selection when mouse move is inside one table cell', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );

			view.document.fire( 'mousedown', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should start table selection when mouse move expands over two cells', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );

			expect( getViewData( view ) ).to.equal( modelTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ '10', '11' ]
			], { asWidget: true } ) );
		} );

		it( 'should select rectangular table cells when mouse moved to diagonal cell (up -> down)', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ { contents: '10', isSelected: true }, { contents: '11', isSelected: true } ]
			] ) );

			expect( getViewData( view ) ).to.equal( modelTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ { contents: '10', class: 'selected', isSelected: true }, { contents: '11', class: 'selected', isSelected: true } ]
			], { asWidget: true } ) );
		} );

		it( 'should select rectangular table cells when mouse moved to diagonal cell (down -> up)', () => {
			setModelData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '[]11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousedown', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '00', '01' ],
				[ '10', '[]11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ { contents: '10', isSelected: true }, { contents: '11', isSelected: true } ]
			] ) );

			expect( getViewData( view ) ).to.equal( modelTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ { contents: '10', class: 'selected', isSelected: true }, { contents: '11', class: 'selected', isSelected: true } ]
			], { asWidget: true } ) );
		} );

		it( 'should update view selection after changing selection rect', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01', '02' ],
				[ '10', '11', '12' ],
				[ '20', '21', '22' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			selectTableCell( domEvtDataStub, view, 0, 0, 2, 2 );
			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true }, { contents: '02', isSelected: true } ],
				[ { contents: '10', isSelected: true }, { contents: '11', isSelected: true }, { contents: '12', isSelected: true } ],
				[ { contents: '20', isSelected: true }, { contents: '21', isSelected: true }, { contents: '22', isSelected: true } ]
			] ) );

			expect( getViewData( view ) ).to.equal( modelTable( [
				[
					{ contents: '00', class: 'selected', isSelected: true },
					{ contents: '01', class: 'selected', isSelected: true },
					{ contents: '02', class: 'selected', isSelected: true }
				],
				[
					{ contents: '10', class: 'selected', isSelected: true },
					{ contents: '11', class: 'selected', isSelected: true },
					{ contents: '12', class: 'selected', isSelected: true }
				],
				[
					{ contents: '20', class: 'selected', isSelected: true },
					{ contents: '21', class: 'selected', isSelected: true },
					{ contents: '22', class: 'selected', isSelected: true }
				]
			], { asWidget: true } ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true }, '02' ],
				[ { contents: '10', isSelected: true }, { contents: '11', isSelected: true }, '12' ],
				[ '20', '21', '22' ]
			] ) );

			expect( getViewData( view ) ).to.equal( modelTable( [
				[
					{ contents: '00', class: 'selected', isSelected: true },
					{ contents: '01', class: 'selected', isSelected: true },
					'02'
				],
				[
					{ contents: '10', class: 'selected', isSelected: true },
					{ contents: '11', class: 'selected', isSelected: true },
					'12'
				],
				[
					'20',
					'21',
					'22'
				]
			], { asWidget: true } ) );
		} );

		it( 'should stop selecting after "mouseup" event', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			view.document.fire( 'mouseup', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );

			expect( getViewData( view ) ).to.equal( modelTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ '10', '11' ]
			], { asWidget: true } ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should stop selection mode on "mouseleve" event', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			view.document.fire( 'mouseleave', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );

			expect( getViewData( view ) ).to.equal( modelTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ '10', '11' ]
			], { asWidget: true } ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should clear view table selection after mouse click outside table', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) + '<paragraph>foo</paragraph>' );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) + '<paragraph>foo</paragraph>' );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			domEvtDataStub.target = view.document.getRoot().getChild( 1 );

			view.document.fire( 'mousemove', domEvtDataStub );
			view.document.fire( 'mousedown', domEvtDataStub );
			view.document.fire( 'mouseup', domEvtDataStub );

			// The click in the DOM would trigger selection change and it will set the selection:
			model.change( writer => {
				writer.setSelection( writer.createRange( writer.createPositionAt( model.document.getRoot().getChild( 1 ), 0 ) ) );
			} );

			expect( getViewData( view ) ).to.equal( modelTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			], { asWidget: true } ) + '<p>{}foo</p>' );
		} );
	} );
} );

function selectTableCell( domEvtDataStub, view, tableIndex, sectionIndex, rowInSectionIndex, tableCellIndex ) {
	domEvtDataStub.target = view.document.getRoot()
		.getChild( tableIndex )
		.getChild( 1 ) // Table is second in widget
		.getChild( sectionIndex )
		.getChild( rowInSectionIndex )
		.getChild( tableCellIndex );
}
