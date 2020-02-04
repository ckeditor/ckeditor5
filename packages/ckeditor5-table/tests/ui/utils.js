/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Table from '../../src/table';
import TableCellProperties from '../../src/tablecellproperties';
import { findAncestor } from '../../src/commands/utils';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import View from '@ckeditor/ckeditor5-ui/src/view';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import {
	repositionContextualBalloon,
	getBalloonCellPositionData,
	getBorderStyleDefinitions,
	getBorderStyleLabels,
	fillToolbar
} from '../../src/ui/utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

describe( 'UI Utils', () => {
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

		describe( 'with respect to the entire table', () => {
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

	describe( 'getBorderStyleLabels()', () => {
		it( 'should return labels for different border styles', () => {
			const t = string => string;

			expect( getBorderStyleLabels( t ) ).to.deep.equal( {
				none: 'None',
				solid: 'Solid',
				dotted: 'Dotted',
				dashed: 'Dashed',
				double: 'Double',
				groove: 'Groove',
				ridge: 'Ridge',
				inset: 'Inset',
				outset: 'Outset',
			} );
		} );
	} );

	describe( 'getBorderStyleDefinitions()', () => {
		let view, locale, definitions;

		beforeEach( () => {
			locale = { t: val => val };
			view = new View( locale );
			view.set( 'borderStyle', 'none' );

			definitions = getBorderStyleDefinitions( view );
		} );

		it( 'should return a collection', () => {
			expect( definitions ).to.be.instanceOf( Collection );
		} );

		it( 'should create a button definition for each style', () => {
			expect( definitions.map( ( { type } ) => type ).every( item => item === 'button' ) ).to.be.true;
		} );

		it( 'should set label of a button for each style', () => {
			expect( definitions.map( ( { model: { label } } ) => label ) ).to.have.ordered.members( [
				'None',
				'Solid',
				'Dotted',
				'Dashed',
				'Double',
				'Groove',
				'Ridge',
				'Inset',
				'Outset',
			] );
		} );

		it( 'should set type of a button for each style', () => {
			expect( definitions.map( ( { model: { withText } } ) => withText ).every( item => item === true ) ).to.be.true;
		} );

		it( 'should bind button\'s #isOn to the view #borderStyle property', () => {
			view.borderStyle = 'dotted';

			expect( definitions.map( ( { model: { isOn } } ) => isOn ) ).to.have.ordered.members( [
				false,
				false,
				true,
				false,
				false,
				false,
				false,
				false,
				false,
			] );

			view.borderStyle = 'inset';

			expect( definitions.map( ( { model: { isOn } } ) => isOn ) ).to.have.ordered.members( [
				false,
				false,
				false,
				false,
				false,
				false,
				false,
				true,
				false,
			] );
		} );
	} );

	describe( 'fillToolbar()', () => {
		let view, locale, toolbar;

		const labels = {
			first: 'Do something',
			second: 'Do something else'
		};

		const icons = {
			first: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path /></svg>',
			second: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path /></svg>'
		};

		beforeEach( () => {
			locale = { t: val => val };
			view = new View( locale );
			view.set( 'someProperty', 'foo' );
			toolbar = new ToolbarView( locale );

			fillToolbar( {
				view, toolbar, icons, labels,
				propertyName: 'someProperty'
			} );
		} );

		afterEach( () => {
			view.destroy();
		} );

		it( 'should create buttons', () => {
			expect( toolbar.items ).to.have.length( 2 );
			expect( toolbar.items.first ).to.be.instanceOf( ButtonView );
			expect( toolbar.items.last ).to.be.instanceOf( ButtonView );
		} );

		it( 'should set button labels', () => {
			expect( toolbar.items.first.label ).to.equal( 'Do something' );
			expect( toolbar.items.last.label ).to.equal( 'Do something else' );
		} );

		it( 'should set button icons', () => {
			expect( toolbar.items.first.icon ).to.equal( icons.first );
			expect( toolbar.items.last.icon ).to.equal( icons.second );
		} );

		it( 'should bind button #isOn to an observable property', () => {
			expect( toolbar.items.first.isOn ).to.be.false;
			expect( toolbar.items.last.isOn ).to.be.false;

			view.someProperty = 'first';

			expect( toolbar.items.first.isOn ).to.be.true;
			expect( toolbar.items.last.isOn ).to.be.false;

			view.someProperty = 'second';

			expect( toolbar.items.first.isOn ).to.be.false;
			expect( toolbar.items.last.isOn ).to.be.true;
		} );

		it( 'should make the buttons change the property value upon execution', () => {
			toolbar.items.first.fire( 'execute' );

			expect( view.someProperty ).to.equal( 'first' );

			toolbar.items.last.fire( 'execute' );

			expect( view.someProperty ).to.equal( 'second' );
		} );
	} );
} );
