/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
// import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
// import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
// import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';

import Table from '../../src/table';
import TableCellPropertiesUI from '../../src/tablecellproperties/tablecellpropertiesui';
import TableCellPropertiesUIView from '../../src/tablecellproperties/ui/tablecellpropertiesview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
// import View from '@ckeditor/ckeditor5-ui/src/view';

describe.only( 'TableCellPropertiesUI', () => {
	let editor, editorElement, contextualBalloon,
		tableCellPropertiesUI, tableCellPropertiesButton;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Table, TableCellPropertiesUI, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;

				tableCellPropertiesUI = editor.plugins.get( TableCellPropertiesUI );
				tableCellPropertiesButton = editor.ui.componentFactory.create( 'tableCellProperties' );
				contextualBalloon = editor.plugins.get( ContextualBalloon );
				// tableCellPropertiesView = tableCellPropertiesUI.view;

				// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
				testUtils.sinon.stub( contextualBalloon.view, 'attachTo' ).returns( {} );
				testUtils.sinon.stub( contextualBalloon.view, 'pin' ).returns( {} );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( TableCellPropertiesUI.pluginName ).to.equal( 'TableCellPropertiesUI' );
	} );

	it( 'should load ContextualBalloon', () => {
		expect( editor.plugins.get( ContextualBalloon ) ).to.be.instanceOf( ContextualBalloon );
	} );

	describe( 'init()', () => {
		it( 'should set a batch', () => {
			expect( tableCellPropertiesUI._batch ).to.be.null;
		} );

		describe( '#view', () => {
			it( 'should be created', () => {
				expect( tableCellPropertiesUI.view ).to.be.instanceOf( TableCellPropertiesUIView );
			} );

			it( 'should be rendered', () => {
				expect( tableCellPropertiesUI.view.isRendered ).to.be.true;
			} );
		} );

		describe( 'toolbar button', () => {
			it( 'should be registered', () => {
				expect( tableCellPropertiesButton ).to.be.instanceOf( ButtonView );
			} );

			it( 'should have a label', () => {
				expect( tableCellPropertiesButton.label ).to.equal( 'Cell properties' );
			} );

			it( 'should have a tooltip', () => {
				expect( tableCellPropertiesButton.tooltip ).to.be.true;
			} );

			it( 'should call #_showView upon #execute', () => {
				const spy = testUtils.sinon.stub( tableCellPropertiesUI, '_showView' ).returns( {} );

				tableCellPropertiesButton.fire( 'execute' );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );
} );
