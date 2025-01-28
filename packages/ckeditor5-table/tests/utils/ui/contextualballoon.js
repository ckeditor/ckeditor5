/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Table from '../../../src/table.js';
import TableCellProperties from '../../../src/tablecellproperties.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview.js';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { modelTable } from '../../_utils/utils.js';
import { getBalloonCellPositionData, repositionContextualBalloon } from '../../../src/utils/ui/contextualballoon.js';

describe( 'table utils', () => {
	let editor, editingView, balloon, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Table, TableCellProperties, Paragraph, ClipboardPipeline ]
			} )
			.then( newEditor => {
				editor = newEditor;
				editingView = editor.editing.view;
				balloon = editor.plugins.get( 'ContextualBalloon' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'ui - contextual balloon', () => {
		describe( 'repositionContextualBalloon()', () => {
			describe( 'with respect to the table cell', () => {
				it( 'should re-position the ContextualBalloon when the table cell is selected', () => {
					const spy = sinon.spy( balloon, 'updatePosition' );
					const defaultPositions = BalloonPanelView.defaultPositions;
					const view = new View();

					view.element = global.document.createElement( 'div' );

					balloon.add( {
						view,
						position: {
							target: global.document.body
						}
					} );

					setData( editor.model,
						'<table><tableRow>' +
						'<tableCell><paragraph>foo</paragraph></tableCell>' +
						'<tableCell><paragraph>[bar]</paragraph></tableCell>' +
						'</tableRow></table>' );
					repositionContextualBalloon( editor, 'cell' );

					const tableUtils = editor.plugins.get( 'TableUtils' );

					const modelCell = tableUtils.getTableCellsContainingSelection( editor.model.document.selection )[ 0 ];
					const viewCell = editor.editing.mapper.toViewElement( modelCell );

					sinon.assert.calledWithExactly( spy, {
						target: editingView.domConverter.mapViewToDom( viewCell ),
						positions: [
							defaultPositions.northArrowSouth,
							defaultPositions.northArrowSouthWest,
							defaultPositions.northArrowSouthEast,
							defaultPositions.southArrowNorth,
							defaultPositions.southArrowNorthWest,
							defaultPositions.southArrowNorthEast,
							defaultPositions.viewportStickyNorth
						]
					} );
				} );

				it( 'should not engage with no table is selected', () => {
					const spy = sinon.spy( balloon, 'updatePosition' );

					setData( editor.model, '<paragraph>foo</paragraph>' );

					repositionContextualBalloon( editor, 'cell' );
					sinon.assert.notCalled( spy );
				} );
			} );

			describe( 'with respect to the entire table', () => {
				it( 'should re-position the ContextualBalloon when the selection is in the table', () => {
					const spy = sinon.spy( balloon, 'updatePosition' );
					const defaultPositions = BalloonPanelView.defaultPositions;
					const view = new View();

					view.element = global.document.createElement( 'div' );

					balloon.add( {
						view,
						position: {
							target: global.document.body
						}
					} );

					setData( editor.model,
						'<table><tableRow>' +
						'<tableCell><paragraph>foo</paragraph></tableCell>' +
						'<tableCell><paragraph>[bar]</paragraph></tableCell>' +
						'</tableRow></table>' );
					repositionContextualBalloon( editor, 'table' );

					const modelTable = editor.model.document.selection.getFirstPosition().findAncestor( 'table' );
					const viewTable = editor.editing.mapper.toViewElement( modelTable );

					sinon.assert.calledWithExactly( spy, {
						target: editingView.domConverter.mapViewToDom( viewTable ),
						positions: [
							defaultPositions.northArrowSouth,
							defaultPositions.northArrowSouthWest,
							defaultPositions.northArrowSouthEast,
							defaultPositions.southArrowNorth,
							defaultPositions.southArrowNorthWest,
							defaultPositions.southArrowNorthEast,
							defaultPositions.viewportStickyNorth
						]
					} );
				} );

				it( 'should re-position the ContextualBalloon when the selection is over the table', () => {
					const spy = sinon.spy( balloon, 'updatePosition' );
					const defaultPositions = BalloonPanelView.defaultPositions;
					const view = new View();

					view.element = global.document.createElement( 'div' );

					balloon.add( {
						view,
						position: {
							target: global.document.body
						}
					} );

					setData( editor.model,
						'[<table><tableRow>' +
						'<tableCell><paragraph>foo</paragraph></tableCell>' +
						'<tableCell><paragraph>bar</paragraph></tableCell>' +
						'</tableRow></table>]' );
					repositionContextualBalloon( editor, 'table' );

					const modelTable = editor.model.document.selection.getSelectedElement();
					const viewTable = editor.editing.mapper.toViewElement( modelTable );

					sinon.assert.calledWithExactly( spy, {
						target: editingView.domConverter.mapViewToDom( viewTable ),
						positions: [
							defaultPositions.northArrowSouth,
							defaultPositions.northArrowSouthWest,
							defaultPositions.northArrowSouthEast,
							defaultPositions.southArrowNorth,
							defaultPositions.southArrowNorthWest,
							defaultPositions.southArrowNorthEast,
							defaultPositions.viewportStickyNorth
						]
					} );
				} );

				it( 'should not engage with no table is selected', () => {
					const spy = sinon.spy( balloon, 'updatePosition' );

					setData( editor.model, '<paragraph>foo</paragraph>' );

					repositionContextualBalloon( editor, 'table' );
					sinon.assert.notCalled( spy );
				} );
			} );
		} );

		describe( 'getBalloonCellPositionData()', () => {
			let modelRoot;

			beforeEach( () => {
				setData( editor.model, modelTable( [
					[ '11[]', '12', '13' ],
					[ '21', '22', '23' ],
					[ '31', '32', '33' ]
				] ) );

				modelRoot = editor.model.document.getRoot();

				for ( let row = 0; row < 3; row++ ) {
					for ( let col = 0; col < 3; col++ ) {
						const modelCell = modelRoot.getNodeByPath( [ 0, row, col ] );
						const viewCell = editor.editing.mapper.toViewElement( modelCell );
						const cellDomElement = editingView.domConverter.mapViewToDom( viewCell );

						mockBoundingBox( cellDomElement, {
							top: 100 + row * 10,
							left: 100 + col * 10,
							height: 10,
							width: 10
						} );
					}
				}
			} );

			it( 'returns the position data', () => {
				const tableUtils = editor.plugins.get( 'TableUtils' );
				const defaultPositions = BalloonPanelView.defaultPositions;
				const data = getBalloonCellPositionData( editor );
				const modelCell = tableUtils.getTableCellsContainingSelection( editor.model.document.selection )[ 0 ];
				const viewCell = editor.editing.mapper.toViewElement( modelCell );

				expect( data ).to.deep.equal( {
					target: editingView.domConverter.mapViewToDom( viewCell ),
					positions: [
						defaultPositions.northArrowSouth,
						defaultPositions.northArrowSouthWest,
						defaultPositions.northArrowSouthEast,
						defaultPositions.southArrowNorth,
						defaultPositions.southArrowNorthWest,
						defaultPositions.southArrowNorthEast,
						defaultPositions.viewportStickyNorth
					]
				} );
			} );

			it( 'returns the position data for multiple cells selected horizontally', () => {
				selectTableCells( [
					[ 0, 0 ],
					[ 0, 1 ]
				] );

				const data = getBalloonCellPositionData( editor );
				const targetData = data.target();

				expect( targetData ).to.deep.equal( {
					top: 100,
					left: 100,
					right: 120,
					bottom: 110,
					width: 20,
					height: 10
				} );
			} );

			it( 'returns the position data for multiple cells selected vertically', () => {
				selectTableCells( [
					[ 0, 1 ],
					[ 1, 1 ]
				] );

				const data = getBalloonCellPositionData( editor );
				const targetData = data.target();

				expect( targetData ).to.deep.equal( {
					top: 100,
					left: 110,
					right: 120,
					bottom: 120,
					width: 10,
					height: 20
				} );
			} );

			it( 'returns the position data for multiple cells selected', () => {
				selectTableCells( [
					[ 0, 1 ],
					[ 1, 0 ],
					[ 1, 1 ]
				] );

				const data = getBalloonCellPositionData( editor );
				const targetData = data.target();

				expect( targetData ).to.deep.equal( {
					top: 100,
					left: 100,
					right: 120,
					bottom: 120,
					width: 20,
					height: 20
				} );
			} );

			function selectTableCells( paths ) {
				editor.model.change( writer => {
					writer.setSelection( paths.map( path => writer.createRangeOn( modelRoot.getNodeByPath( [ 0, ...path ] ) ) ) );
				} );
			}

			function mockBoundingBox( element, data ) {
				testUtils.sinon.stub( element, 'getBoundingClientRect' ).returns( {
					...data,
					right: data.left + data.width,
					bottom: data.top + data.height
				} );
			}
		} );
	} );
} );
