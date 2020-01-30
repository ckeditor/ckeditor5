/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Table from '../../src/table';
import TableCellProperties from '../../src/tablecellproperties';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import View from '@ckeditor/ckeditor5-ui/src/view';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { repositionContextualBalloon, getBalloonCellPositionData } from '../../src/ui/utils';
import { findAncestor } from '../../src/commands/utils';

describe( 'Utils', () => {
	let editor, editingView, balloon, editorElement;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Table, TableCellProperties, Paragraph ]
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

				const modelCell = findAncestor( 'tableCell', editor.model.document.selection.getFirstPosition() );
				const viewCell = editor.editing.mapper.toViewElement( modelCell );

				sinon.assert.calledWithExactly( spy, {
					target: editingView.domConverter.viewToDom( viewCell ),
					positions: [
						defaultPositions.northArrowSouth,
						defaultPositions.northArrowSouthWest,
						defaultPositions.northArrowSouthEast,
						defaultPositions.southArrowNorth,
						defaultPositions.southArrowNorthWest,
						defaultPositions.southArrowNorthEast
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

		describe( 'with respect to the table', () => {
			it( 'should re-position the ContextualBalloon when the table is selected', () => {
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

				const modelTable = findAncestor( 'table', editor.model.document.selection.getFirstPosition() );
				const viewTable = editor.editing.mapper.toViewElement( modelTable );

				sinon.assert.calledWithExactly( spy, {
					target: editingView.domConverter.viewToDom( viewTable ),
					positions: [
						defaultPositions.northArrowSouth,
						defaultPositions.northArrowSouthWest,
						defaultPositions.northArrowSouthEast,
						defaultPositions.southArrowNorth,
						defaultPositions.southArrowNorthWest,
						defaultPositions.southArrowNorthEast
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

	describe( 'getBalloonCellPositionData', () => {
		it( 'returns the position data', () => {
			const defaultPositions = BalloonPanelView.defaultPositions;

			setData( editor.model, '<table><tableRow>' +
				'<tableCell><paragraph>foo</paragraph></tableCell>' +
				'<tableCell><paragraph>[bar]</paragraph></tableCell>' +
			'</tableRow></table>' );

			const data = getBalloonCellPositionData( editor );
			const modelCell = findAncestor( 'tableCell', editor.model.document.selection.getFirstPosition() );
			const viewCell = editor.editing.mapper.toViewElement( modelCell );

			expect( data ).to.deep.equal( {
				target: editingView.domConverter.viewToDom( viewCell ),
				positions: [
					defaultPositions.northArrowSouth,
					defaultPositions.northArrowSouthWest,
					defaultPositions.northArrowSouthEast,
					defaultPositions.southArrowNorth,
					defaultPositions.southArrowNorthWest,
					defaultPositions.southArrowNorthEast
				]
			} );
		} );
	} );
} );
