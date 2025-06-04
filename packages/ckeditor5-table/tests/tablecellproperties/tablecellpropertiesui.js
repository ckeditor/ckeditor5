/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import { getData as getModelData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Batch from '@ckeditor/ckeditor5-engine/src/model/batch.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';

import Table from '../../src/table.js';
import TableLayout from '../../src/tablelayout.js';
import TableCellPropertiesEditing from '../../src/tablecellproperties/tablecellpropertiesediting.js';
import TableCellWidthEditing from '../../src/tablecellwidth/tablecellwidthediting.js';
import TableCellPropertiesUI from '../../src/tablecellproperties/tablecellpropertiesui.js';
import TableCellPropertiesUIView from '../../src/tablecellproperties/ui/tablecellpropertiesview.js';
import { defaultColors } from '../../src/utils/ui/table-properties.js';
import { modelTable } from '../_utils/utils.js';

describe( 'table cell properties', () => {
	describe( 'TableCellPropertiesUI', () => {
		let editor, editorElement, contextualBalloon,
			tableCellPropertiesUI, tableCellPropertiesView, tableCellPropertiesButton,
			clock;

		testUtils.createSinonSandbox();

		beforeEach( () => {
			clock = sinon.useFakeTimers();
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [
						Table, TableCellPropertiesEditing, TableCellPropertiesUI, TableCellWidthEditing,
						Paragraph, Undo, ClipboardPipeline
					],
					initialData: '<table><tr><td>foo</td></tr></table><p>bar</p>'
				} )
				.then( newEditor => {
					editor = newEditor;

					tableCellPropertiesUI = editor.plugins.get( TableCellPropertiesUI );
					tableCellPropertiesButton = editor.ui.componentFactory.create( 'tableCellProperties' );
					contextualBalloon = editor.plugins.get( ContextualBalloon );
					tableCellPropertiesView = tableCellPropertiesUI.view;

					// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
					testUtils.sinon.stub( contextualBalloon.view, 'attachTo' ).returns( {} );
					testUtils.sinon.stub( contextualBalloon.view, 'pin' ).returns( {} );
				} );
		} );

		afterEach( () => {
			clock.restore();
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should be named', () => {
			expect( TableCellPropertiesUI.pluginName ).to.equal( 'TableCellPropertiesUI' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( TableCellPropertiesUI.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( TableCellPropertiesUI.isPremiumPlugin ).to.be.false;
		} );

		it( 'should load ContextualBalloon', () => {
			expect( editor.plugins.get( ContextualBalloon ) ).to.be.instanceOf( ContextualBalloon );
		} );

		describe( 'constructor()', () => {
			it( 'should define table.tableCellProperties config', () => {
				expect( editor.config.get( 'table.tableCellProperties' ) ).to.be.an( 'object' );

				expect( editor.config.get( 'table.tableCellProperties' ) ).to.have.property( 'borderColors' );
				expect( editor.config.get( 'table.tableCellProperties.borderColors' ) ).to.deep.equal( defaultColors );
				expect( editor.config.get( 'table.tableCellProperties' ) ).to.have.property( 'backgroundColors' );
				expect( editor.config.get( 'table.tableCellProperties.backgroundColors' ) ).to.deep.equal( defaultColors );
			} );
		} );

		describe( 'init()', () => {
			it( 'should set a batch', () => {
				expect( tableCellPropertiesUI._undoStepBatch ).to.be.undefined;
			} );

			describe( '#view', () => {
				it( 'should not be created', () => {
					expect( tableCellPropertiesUI.view ).to.be.null;
				} );

				it( 'should be created on first show', () => {
					tableCellPropertiesUI._showView();
					expect( tableCellPropertiesUI.view ).to.be.instanceOf( TableCellPropertiesUIView );
				} );

				it( 'should be rendered', () => {
					tableCellPropertiesUI._showView();
					expect( tableCellPropertiesUI.view.isRendered ).to.be.true;
				} );

				it( 'should get the border colors configurations', () => {
					tableCellPropertiesUI._showView();
					tableCellPropertiesView = tableCellPropertiesUI.view;
					expect( tableCellPropertiesView.options.borderColors ).to.have.length( 15 );
				} );

				it( 'should get the background colors configurations', () => {
					tableCellPropertiesUI._showView();
					tableCellPropertiesView = tableCellPropertiesUI.view;
					expect( tableCellPropertiesView.options.backgroundColors ).to.have.length( 15 );
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

				it( 'should be disabled if all of the table cell properties commands are disabled', () => {
					[
						'tableCellBorderStyle',
						'tableCellBorderColor',
						'tableCellBorderWidth',
						'tableCellHeight',
						'tableCellPadding',
						'tableCellBackgroundColor',
						'tableCellHorizontalAlignment',
						'tableCellVerticalAlignment'
					].forEach( command => {
						editor.commands.get( command ).isEnabled = false;
					} );

					expect( tableCellPropertiesButton.isEnabled ).to.be.false;

					editor.commands.get( 'tableCellBackgroundColor' ).isEnabled = true;

					expect( tableCellPropertiesButton.isEnabled ).to.be.true;
				} );
			} );
		} );

		describe( 'destroy()', () => {
			it( 'should destroy the #view', () => {
				tableCellPropertiesUI._showView();
				tableCellPropertiesView = tableCellPropertiesUI.view;

				const spy = sinon.spy( tableCellPropertiesView, 'destroy' );

				tableCellPropertiesUI.destroy();

				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'Properties #view', () => {
			beforeEach( () => {
				editor.model.change( writer => {
					writer.setSelection( editor.model.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 ), 0 );
				} );
			} );

			it( 'should hide on #submit', () => {
				tableCellPropertiesButton.fire( 'execute' );
				tableCellPropertiesView = tableCellPropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

				tableCellPropertiesView.fire( 'submit' );
				expect( contextualBalloon.visibleView ).to.be.null;
			} );

			describe( '#cancel event', () => {
				// https://github.com/ckeditor/ckeditor5/issues/6180
				it( 'should not undo if it there were no changes made to the property fields', () => {
					const spy = sinon.spy( editor, 'execute' );

					// Show the view. New batch will be created.
					tableCellPropertiesButton.fire( 'execute' );
					tableCellPropertiesView = tableCellPropertiesUI.view;

					// Cancel the view immediately.
					tableCellPropertiesView.fire( 'cancel' );

					sinon.assert.notCalled( spy );
				} );

				it( 'should undo the entire batch of changes if there were some', () => {
					const spy = sinon.spy( editor, 'execute' );

					// Show the view. New batch will be created.
					tableCellPropertiesButton.fire( 'execute' );
					tableCellPropertiesView = tableCellPropertiesUI.view;

					// Do the changes like a user.
					tableCellPropertiesView.borderStyle = 'dotted';
					tableCellPropertiesView.backgroundColor = 'red';

					expect( getModelData( editor.model ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell tableCellBackgroundColor="red" tableCellBorderStyle="dotted">' +
									'<paragraph>[]foo</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>' +
						'<paragraph>bar</paragraph>'
					);

					tableCellPropertiesView.fire( 'cancel' );

					expect( getModelData( editor.model ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>[]foo</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>' +
						'<paragraph>bar</paragraph>'
					);

					sinon.assert.calledWith( spy, 'undo', tableCellPropertiesUI._undoStepBatch );
				} );

				it( 'should hide the view', () => {
					tableCellPropertiesButton.fire( 'execute' );
					tableCellPropertiesView = tableCellPropertiesUI.view;

					expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

					tableCellPropertiesView.fire( 'cancel' );
					expect( contextualBalloon.visibleView ).to.be.null;
				} );
			} );

			it( 'should hide on the Esc key press', () => {
				const keyEvtData = {
					keyCode: keyCodes.esc,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				tableCellPropertiesButton.fire( 'execute' );
				tableCellPropertiesView = tableCellPropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

				tableCellPropertiesView.keystrokes.press( keyEvtData );
				expect( contextualBalloon.visibleView ).to.be.null;
			} );

			it( 'should hide if the table cell is no longer selected on EditorUI#update', () => {
				tableCellPropertiesButton.fire( 'execute' );
				tableCellPropertiesView = tableCellPropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

				editor.model.change( writer => {
					// Set selection in the paragraph.
					writer.setSelection( editor.model.document.getRoot().getChild( 1 ), 0 );
				} );

				expect( contextualBalloon.visibleView ).to.be.null;
			} );

			it( 'should reposition if table cell is still selected on on EditorUI#update', () => {
				tableCellPropertiesButton.fire( 'execute' );
				tableCellPropertiesView = tableCellPropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

				editor.model.change( writer => {
					writer.insertText( 'qux', editor.model.document.selection.getFirstPosition() );
				} );

				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );
			} );

			it( 'should not reposition if view is not visible', () => {
				const spy = sinon.spy( contextualBalloon, 'updatePosition' );

				tableCellPropertiesButton.fire( 'execute' );
				tableCellPropertiesUI.view = false;
				editor.ui.fire( 'update' );

				expect( spy.called ).to.be.false;
			} );

			it( 'should hide if clicked outside the balloon', () => {
				tableCellPropertiesButton.fire( 'execute' );
				tableCellPropertiesView = tableCellPropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

				document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

				expect( contextualBalloon.visibleView ).to.be.null;
			} );

			describe( 'property changes', () => {
				let batch;

				beforeEach( () => {
					batch = editor.model.createBatch();

					tableCellPropertiesUI._undoStepBatch = batch;
					tableCellPropertiesUI._showView();
					tableCellPropertiesView = tableCellPropertiesUI.view;
				} );

				describe( '#borderStyle', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.borderStyle = 'dotted';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellBorderStyle', { value: 'dotted', batch } );
					} );
				} );

				describe( '#borderColor', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.borderColor = '#FFAAFF';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellBorderColor', { value: '#FFAAFF', batch } );
					} );

					it( 'should display an error message if value is invalid', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						// First, let's pass an invalid value and check what happens.
						tableCellPropertiesView.borderColor = '42';

						clock.tick( 500 );

						expect( tableCellPropertiesView.borderColorInput.errorText ).to.match( /^The color is invalid/ );
						sinon.assert.notCalled( spy );

						// And now let's pass a valid value and check if the error text will be gone.
						tableCellPropertiesView.borderColor = '#AAA';

						clock.tick( 500 );

						expect( tableCellPropertiesView.borderColorInput.errorText ).to.be.null;
						sinon.assert.calledWithExactly( spy, 'tableCellBorderColor', { value: '#AAA', batch } );
					} );
				} );

				describe( '#borderWidth', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.borderWidth = '12px';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellBorderWidth', { value: '12px', batch } );
					} );

					it( 'should display an error message if value is invalid', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						// First, let's pass an invalid value and check what happens.
						tableCellPropertiesView.borderWidth = 'wrong';

						clock.tick( 500 );

						expect( tableCellPropertiesView.borderWidthInput.errorText ).to.match( /^The value is invalid/ );
						sinon.assert.notCalled( spy );

						// And now let's pass a valid value and check if the error text will be gone.
						tableCellPropertiesView.borderWidth = '3em';

						clock.tick( 500 );

						expect( tableCellPropertiesView.backgroundInput.errorText ).to.be.null;
						sinon.assert.calledWithExactly( spy, 'tableCellBorderWidth', { value: '3em', batch } );
					} );
				} );

				describe( '#width', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.width = '12px';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellWidth', { value: '12px', batch } );
					} );

					it( 'should display an error message if value is invalid', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						// First, let's pass an invalid value and check what happens.
						tableCellPropertiesView.width = 'wrong';

						clock.tick( 500 );

						expect( tableCellPropertiesView.widthInput.errorText ).to.match( /^The value is invalid/ );
						sinon.assert.notCalled( spy );

						// And now let's pass a valid value and check if the error text will be gone.
						tableCellPropertiesView.width = '3em';

						clock.tick( 500 );

						expect( tableCellPropertiesView.backgroundInput.errorText ).to.be.null;
						sinon.assert.calledWithExactly( spy, 'tableCellWidth', { value: '3em', batch } );
					} );
				} );

				describe( '#height', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.height = '12px';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellHeight', { value: '12px', batch } );
					} );

					it( 'should display an error message if value is invalid', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						// First, let's pass an invalid value and check what happens.
						tableCellPropertiesView.height = 'wrong';

						clock.tick( 500 );

						expect( tableCellPropertiesView.heightInput.errorText ).to.match( /^The value is invalid/ );
						sinon.assert.notCalled( spy );

						// And now let's pass a valid value and check if the error text will be gone.
						tableCellPropertiesView.height = '3em';

						clock.tick( 500 );

						expect( tableCellPropertiesView.backgroundInput.errorText ).to.be.null;
						sinon.assert.calledWithExactly( spy, 'tableCellHeight', { value: '3em', batch } );
					} );
				} );

				describe( '#padding', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.padding = '12px';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellPadding', { value: '12px', batch } );
					} );

					it( 'should display an error message if value is invalid', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						// First, let's pass an invalid value and check what happens.
						tableCellPropertiesView.padding = 'wrong';

						clock.tick( 500 );

						expect( tableCellPropertiesView.paddingInput.errorText ).to.match( /^The value is invalid/ );
						sinon.assert.notCalled( spy );

						// And now let's pass a valid value and check if the error text will be gone.
						tableCellPropertiesView.padding = '3em';

						clock.tick( 500 );

						expect( tableCellPropertiesView.backgroundInput.errorText ).to.be.null;
						sinon.assert.calledWithExactly( spy, 'tableCellPadding', { value: '3em', batch } );
					} );
				} );

				describe( '#backgroundColor', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.backgroundColor = '#FFAAFF';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellBackgroundColor', { value: '#FFAAFF', batch } );
					} );

					it( 'should display an error message if value is invalid', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						// First, let's pass an invalid value and check what happens.
						tableCellPropertiesView.backgroundColor = '42';

						clock.tick( 500 );

						expect( tableCellPropertiesView.backgroundInput.errorText ).to.match( /^The color is invalid/ );
						sinon.assert.notCalled( spy );

						// And now let's pass a valid value and check if the error text will be gone.
						tableCellPropertiesView.backgroundColor = '#AAA';

						clock.tick( 500 );

						expect( tableCellPropertiesView.backgroundInput.errorText ).to.be.null;
						sinon.assert.calledWithExactly( spy, 'tableCellBackgroundColor', { value: '#AAA', batch } );
					} );
				} );

				describe( '#horizontalAlignment', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.horizontalAlignment = 'right';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellHorizontalAlignment', { value: 'right', batch } );
					} );
				} );

				describe( '#verticalAlignment', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.verticalAlignment = 'right';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellVerticalAlignment', { value: 'right', batch } );
					} );
				} );

				it( 'should not display an error text if user managed to fix the value before the UI timeout', () => {
					// First, let's pass an invalid value.
					tableCellPropertiesView.borderColor = '#';

					clock.tick( 100 );

					// Then the user managed to quickly type the correct value.
					tableCellPropertiesView.borderColor = '#aaa';

					clock.tick( 400 );

					// Because they were quick, they should see no error
					expect( tableCellPropertiesView.borderColorInput.errorText ).to.be.null;
				} );

				it( 'should not affect the editor state if internal property has changed', () => {
					const spy = testUtils.sinon.stub( editor, 'execute' );

					tableCellPropertiesView.set( 'internalProp', 'foo' );

					tableCellPropertiesView.internalProp = 'bar';

					sinon.assert.notCalled( spy );
				} );
			} );
		} );

		describe( 'Showing the #view', () => {
			beforeEach( () => {
				editor.model.change( writer => {
					writer.setSelection( editor.model.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 ), 0 );
				} );
			} );

			it( 'should create a new undoable batch for further #view cancel', () => {
				tableCellPropertiesButton.fire( 'execute' );
				tableCellPropertiesView = tableCellPropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

				const firstBatch = tableCellPropertiesUI._undoStepBatch;
				expect( firstBatch ).to.be.instanceOf( Batch );

				tableCellPropertiesView.fire( 'submit' );
				expect( contextualBalloon.visibleView ).to.be.null;

				tableCellPropertiesButton.fire( 'execute' );

				const secondBatch = tableCellPropertiesUI._undoStepBatch;
				expect( secondBatch ).to.be.instanceOf( Batch );
				expect( firstBatch ).to.not.equal( secondBatch );
			} );

			it( 'should show the ui for multi-cell selection', () => {
				setData( editor.model, modelTable( [ [ '01', '02' ] ] ) );
				editor.model.change( writer => {
					writer.setSelection( [
						writer.createRangeOn( editor.model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] ) ),
						writer.createRangeOn( editor.model.document.getRoot().getNodeByPath( [ 0, 0, 1 ] ) )
					], 0 );
				} );

				tableCellPropertiesButton.fire( 'execute' );
				tableCellPropertiesView = tableCellPropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );
			} );

			describe( 'initial data', () => {
				it( 'should not execute commands before changing the data', () => {
					const tableCellBackgroundCommand = editor.commands.get( 'tableCellBackgroundColor' );
					const spy = sinon.spy( tableCellBackgroundCommand, 'execute' );

					tableCellPropertiesUI._showView();
					tableCellPropertiesView = tableCellPropertiesUI.view;

					expect( spy.called ).to.be.false;

					tableCellPropertiesView.backgroundColor = 'red';

					expect( spy.called ).to.be.true;
				} );

				it( 'should be set before adding the form to the the balloon to avoid unnecessary input animations', () => {
					// Trigger lazy init.
					tableCellPropertiesUI._showView();
					tableCellPropertiesUI._hideView();
					tableCellPropertiesView = tableCellPropertiesUI.view;

					const balloonAddSpy = testUtils.sinon.spy( editor.plugins.get( ContextualBalloon ), 'add' );
					const borderStyleChangeSpy = testUtils.sinon.spy();

					tableCellPropertiesView.on( 'change:borderStyle', borderStyleChangeSpy );

					editor.commands.get( 'tableCellBorderStyle' ).value = 'a';
					tableCellPropertiesButton.fire( 'execute' );

					sinon.assert.calledOnce( borderStyleChangeSpy );
					sinon.assert.calledOnce( balloonAddSpy );
					sinon.assert.callOrder( borderStyleChangeSpy, balloonAddSpy );
				} );

				it( 'should be set from the command values', () => {
					editor.commands.get( 'tableCellBorderStyle' ).value = 'a';
					editor.commands.get( 'tableCellBorderColor' ).value = 'b';
					editor.commands.get( 'tableCellBorderWidth' ).value = 'c';
					editor.commands.get( 'tableCellHeight' ).value = 'd';
					editor.commands.get( 'tableCellPadding' ).value = 'e';
					editor.commands.get( 'tableCellBackgroundColor' ).value = 'f';
					editor.commands.get( 'tableCellHorizontalAlignment' ).value = 'g';
					editor.commands.get( 'tableCellVerticalAlignment' ).value = 'h';

					tableCellPropertiesButton.fire( 'execute' );
					tableCellPropertiesView = tableCellPropertiesUI.view;

					expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );
					expect( tableCellPropertiesView ).to.include( {
						borderStyle: 'a',
						borderColor: 'b',
						borderWidth: 'c',
						height: 'd',
						padding: 'e',
						backgroundColor: 'f',
						horizontalAlignment: 'g',
						verticalAlignment: 'h'
					} );
				} );

				it( 'should use default values when command has no value', () => {
					editor.commands.get( 'tableCellBorderStyle' ).value = null;
					editor.commands.get( 'tableCellBorderColor' ).value = null;
					editor.commands.get( 'tableCellBorderWidth' ).value = null;
					editor.commands.get( 'tableCellHeight' ).value = null;
					editor.commands.get( 'tableCellPadding' ).value = null;
					editor.commands.get( 'tableCellBackgroundColor' ).value = null;
					editor.commands.get( 'tableCellHorizontalAlignment' ).value = null;
					editor.commands.get( 'tableCellVerticalAlignment' ).value = null;

					tableCellPropertiesButton.fire( 'execute' );
					tableCellPropertiesView = tableCellPropertiesUI.view;

					expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );
					expect( tableCellPropertiesView ).to.include( {
						borderStyle: 'solid',
						borderColor: 'hsl(0, 0%, 75%)',
						borderWidth: '1px',
						height: '',
						padding: '',
						backgroundColor: '',
						horizontalAlignment: 'left',
						verticalAlignment: 'middle'
					} );
				} );
			} );

			it( 'should focus the form view', () => {
				// Trigger lazy init.
				tableCellPropertiesUI._showView();
				tableCellPropertiesUI._hideView();
				tableCellPropertiesView = tableCellPropertiesUI.view;

				const spy = testUtils.sinon.spy( tableCellPropertiesView, 'focus' );

				tableCellPropertiesButton.fire( 'execute' );

				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'Hiding the #view', () => {
			beforeEach( () => {
				editor.model.change( writer => {
					writer.setSelection( editor.model.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 ), 0 );
				} );
			} );

			it( 'should stop listening to EditorUI#update', () => {
				const spy = testUtils.sinon.spy( tableCellPropertiesUI, 'stopListening' );

				tableCellPropertiesButton.fire( 'execute' );
				tableCellPropertiesView = tableCellPropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

				tableCellPropertiesView.fire( 'submit' );
				expect( contextualBalloon.visibleView ).to.be.null;

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, editor.ui, 'update' );
			} );

			it( 'should focus the editing view so the focus is not lost', () => {
				const spy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				tableCellPropertiesButton.fire( 'execute' );
				tableCellPropertiesView = tableCellPropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

				tableCellPropertiesView.fire( 'submit' );

				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'default table properties', () => {
			let editor, editorElement, contextualBalloon,
				tableCellPropertiesUI, tableCellPropertiesView, tableCellPropertiesButton;

			testUtils.createSinonSandbox();

			beforeEach( () => {
				editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						plugins: [
							Table, TableCellPropertiesEditing, TableCellPropertiesUI, TableCellWidthEditing,
							ClipboardPipeline, Paragraph, Undo, TableLayout
						],
						initialData:
							'<table class="content-table"><tr><td>foo</td></tr></table>' +
							'<p>bar</p>' +
							'<table class="layout-table"><tr><td>foo</td></tr></table>',
						table: {
							tableCellProperties: {
								defaultProperties: {
									horizontalAlignment: 'center',
									verticalAlignment: 'bottom',
									borderStyle: 'dashed',
									borderColor: '#ff0',
									borderWidth: '2px',
									backgroundColor: '#00f',
									width: '250px',
									height: '150px',
									padding: '10px'
								}
							}
						}
					} )
					.then( newEditor => {
						editor = newEditor;

						tableCellPropertiesUI = editor.plugins.get( TableCellPropertiesUI );
						tableCellPropertiesButton = editor.ui.componentFactory.create( 'tableCellProperties' );
						contextualBalloon = editor.plugins.get( ContextualBalloon );
						tableCellPropertiesView = tableCellPropertiesUI.view;

						// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
						testUtils.sinon.stub( contextualBalloon.view, 'attachTo' ).returns( {} );
						testUtils.sinon.stub( contextualBalloon.view, 'pin' ).returns( {} );
					} );
			} );

			afterEach( () => {
				editorElement.remove();

				return editor.destroy();
			} );

			describe( 'init()', () => {
				beforeEach( () => {
					editor.model.change( writer => {
						writer.setSelection( editor.model.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 ), 0 );
					} );

					// Trigger lazy init.
					tableCellPropertiesUI._showView();
					tableCellPropertiesUI._hideView();

					tableCellPropertiesView = tableCellPropertiesUI.view;
				} );

				describe( '#view', () => {
					it( 'should get the default table cell properties configurations', () => {
						expect( tableCellPropertiesView.options.defaultTableCellProperties ).to.deep.equal( {
							horizontalAlignment: 'center',
							verticalAlignment: 'bottom',
							borderStyle: 'dashed',
							borderColor: '#ff0',
							borderWidth: '2px',
							backgroundColor: '#00f',
							width: '250px',
							height: '150px',
							padding: '10px'
						} );
					} );
				} );
			} );

			describe( 'Showing the #view (content table)', () => {
				beforeEach( () => {
					editor.model.change( writer => {
						writer.setSelection( editor.model.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 ), 0 );
					} );

					// Trigger lazy init.
					tableCellPropertiesUI._showView();
					tableCellPropertiesUI._hideView();

					tableCellPropertiesView = tableCellPropertiesUI.view;
				} );

				describe( 'initial data', () => {
					it( 'should use default values when command has no value', () => {
						editor.commands.get( 'tableCellBorderStyle' ).value = null;
						editor.commands.get( 'tableCellBorderColor' ).value = null;
						editor.commands.get( 'tableCellBorderWidth' ).value = null;
						editor.commands.get( 'tableCellBackgroundColor' ).value = null;
						editor.commands.get( 'tableCellWidth' ).value = null;
						editor.commands.get( 'tableCellHeight' ).value = null;
						editor.commands.get( 'tableCellPadding' ).value = null;
						editor.commands.get( 'tableCellHorizontalAlignment' ).value = null;
						editor.commands.get( 'tableCellVerticalAlignment' ).value = null;

						tableCellPropertiesButton.fire( 'execute' );

						expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );
						expect( tableCellPropertiesView ).to.include( {
							borderStyle: 'dashed',
							borderColor: '#ff0',
							borderWidth: '2px',
							backgroundColor: '#00f',
							width: '250px',
							height: '150px',
							padding: '10px',
							horizontalAlignment: 'center',
							verticalAlignment: 'bottom'
						} );
					} );

					it( 'should not set `borderColor` and `borderWidth` attributes if borderStyle="none"', () => {
						editor.commands.get( 'tableCellBorderStyle' ).value = 'none';

						tableCellPropertiesButton.fire( 'execute' );

						expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );
						expect( tableCellPropertiesView ).to.include( {
							borderStyle: 'none',
							borderColor: '',
							borderWidth: '',
							backgroundColor: '#00f',
							height: '150px',
							padding: '10px',
							horizontalAlignment: 'center',
							verticalAlignment: 'bottom'
						} );
					} );
				} );
			} );

			describe( 'Showing the #view (layout table)', () => {
				beforeEach( () => {
					editor.model.change( writer => {
						writer.setSelection( editor.model.document.getRoot().getChild( 2 ).getChild( 0 ).getChild( 0 ), 0 );
					} );

					// Trigger lazy init.
					tableCellPropertiesUI._showView();
					tableCellPropertiesUI._hideView();

					tableCellPropertiesView = tableCellPropertiesUI.view;
				} );

				describe( 'initial data', () => {
					it( 'should use hardcoded defaults for layout table instead of configuration', () => {
						editor.commands.get( 'tableCellBorderStyle' ).value = null;
						editor.commands.get( 'tableCellBorderColor' ).value = null;
						editor.commands.get( 'tableCellBorderWidth' ).value = null;
						editor.commands.get( 'tableCellBackgroundColor' ).value = null;
						editor.commands.get( 'tableCellWidth' ).value = null;
						editor.commands.get( 'tableCellHeight' ).value = null;
						editor.commands.get( 'tableCellPadding' ).value = null;
						editor.commands.get( 'tableCellHorizontalAlignment' ).value = null;
						editor.commands.get( 'tableCellVerticalAlignment' ).value = null;

						tableCellPropertiesButton.fire( 'execute' );

						expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );
						expect( tableCellPropertiesView ).to.include( {
							borderStyle: 'none',
							borderColor: '',
							borderWidth: '',
							backgroundColor: '',
							width: '',
							height: '',
							padding: '',
							horizontalAlignment: 'left',
							verticalAlignment: 'middle'
						} );
					} );
				} );
			} );
		} );

		describe( 'table properties without color picker', () => {
			let editor, editorElement, contextualBalloon, tableCellPropertiesUI;

			beforeEach( () => {
				editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ Table, TableCellPropertiesEditing, TableCellPropertiesUI, TableCellWidthEditing, ClipboardPipeline ],
						table: {
							tableCellProperties: {
								colorPicker: false
							}
						}
					} )
					.then( newEditor => {
						editor = newEditor;

						contextualBalloon = editor.plugins.get( ContextualBalloon );
						tableCellPropertiesUI = editor.plugins.get( TableCellPropertiesUI );
						tableCellPropertiesView = tableCellPropertiesUI.view;

						// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
						testUtils.sinon.stub( contextualBalloon.view, 'attachTo' ).returns( {} );
						testUtils.sinon.stub( contextualBalloon.view, 'pin' ).returns( {} );
					} );
			} );

			afterEach( () => {
				editorElement.remove();

				return editor.destroy();
			} );

			it( 'should define table.tableCellProperties.colorPicker', () => {
				expect( editor.config.get( 'table.tableCellProperties.colorPicker' ) ).to.be.false;
			} );

			it( 'should not have color picker in dropdown', () => {
				tableCellPropertiesUI._showView();

				const panelView = tableCellPropertiesUI.view.borderColorInput.fieldView.dropdownView.panelView;
				const colorPicker = panelView.children.get( 0 ).colorPickerFragmentView.element;

				expect( colorPicker ).to.be.null;
			} );
		} );
	} );
} );
