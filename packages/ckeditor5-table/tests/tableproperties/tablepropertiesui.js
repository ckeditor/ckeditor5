/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Batch from '@ckeditor/ckeditor5-engine/src/model/batch.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';

import Table from '../../src/table.js';
import TableLayout from '../../src/tablelayout.js';
import TablePropertiesEditing from '../../src/tableproperties/tablepropertiesediting.js';
import TablePropertiesUI from '../../src/tableproperties/tablepropertiesui.js';
import TablePropertiesUIView from '../../src/tableproperties/ui/tablepropertiesview.js';
import { defaultColors } from '../../src/utils/ui/table-properties.js';

describe( 'table properties', () => {
	describe( 'TablePropertiesUI', () => {
		let editor, editorElement, contextualBalloon,
			tablePropertiesUI, tablePropertiesView, tablePropertiesButton,
			clock;

		testUtils.createSinonSandbox();

		beforeEach( () => {
			clock = sinon.useFakeTimers();
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Table, TablePropertiesEditing, TablePropertiesUI, Paragraph, Undo, ClipboardPipeline ],
					initialData: '<table><tr><td>foo</td></tr></table><p>bar</p>'
				} )
				.then( newEditor => {
					editor = newEditor;

					tablePropertiesUI = editor.plugins.get( TablePropertiesUI );
					tablePropertiesButton = editor.ui.componentFactory.create( 'tableProperties' );
					contextualBalloon = editor.plugins.get( ContextualBalloon );
					tablePropertiesView = tablePropertiesUI.view;

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
			expect( TablePropertiesUI.pluginName ).to.equal( 'TablePropertiesUI' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( TablePropertiesUI.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( TablePropertiesUI.isPremiumPlugin ).to.be.false;
		} );

		it( 'should load ContextualBalloon', () => {
			expect( editor.plugins.get( ContextualBalloon ) ).to.be.instanceOf( ContextualBalloon );
		} );

		describe( 'constructor()', () => {
			it( 'should define table.tableProperties config', () => {
				expect( editor.config.get( 'table.tableProperties' ) ).to.be.an( 'object' );

				expect( editor.config.get( 'table.tableProperties' ) ).to.have.property( 'borderColors' );
				expect( editor.config.get( 'table.tableProperties.borderColors' ) ).to.deep.equal( defaultColors );
				expect( editor.config.get( 'table.tableProperties' ) ).to.have.property( 'backgroundColors' );
				expect( editor.config.get( 'table.tableProperties.backgroundColors' ) ).to.deep.equal( defaultColors );
			} );
		} );

		describe( 'init()', () => {
			it( 'should set a batch', () => {
				expect( tablePropertiesUI._undoStepBatch ).to.be.undefined;
			} );

			it( 'should set normalized default table properties', () => {
				expect( tablePropertiesUI._defaultContentTableProperties ).to.be.an( 'object' );
			} );

			describe( '#view', () => {
				it( 'should not be created', () => {
					expect( tablePropertiesUI.view ).to.be.null;
				} );

				it( 'should be created on first show', () => {
					tablePropertiesUI._showView();
					expect( tablePropertiesUI.view ).to.be.instanceOf( TablePropertiesUIView );
				} );

				it( 'should be rendered', () => {
					tablePropertiesUI._showView();
					expect( tablePropertiesUI.view.isRendered ).to.be.true;
				} );

				it( 'should get the border colors configurations', () => {
					tablePropertiesUI._showView();
					tablePropertiesView = tablePropertiesUI.view;
					expect( tablePropertiesView.options.borderColors ).to.have.length( 15 );
				} );

				it( 'should get the background colors configurations', () => {
					tablePropertiesUI._showView();
					tablePropertiesView = tablePropertiesUI.view;
					expect( tablePropertiesView.options.backgroundColors ).to.have.length( 15 );
				} );
			} );

			describe( 'toolbar button', () => {
				it( 'should be registered', () => {
					expect( tablePropertiesButton ).to.be.instanceOf( ButtonView );
				} );

				it( 'should have a label', () => {
					expect( tablePropertiesButton.label ).to.equal( 'Table properties' );
				} );

				it( 'should have a tooltip', () => {
					expect( tablePropertiesButton.tooltip ).to.be.true;
				} );

				it( 'should call #_showView upon #execute', () => {
					const spy = testUtils.sinon.stub( tablePropertiesUI, '_showView' ).returns( {} );

					tablePropertiesButton.fire( 'execute' );
					sinon.assert.calledOnce( spy );
				} );

				it( 'should be disabled if all of the table properties commands are disabled', () => {
					[
						'tableBorderStyle',
						'tableBorderColor',
						'tableBorderWidth',
						'tableBackgroundColor',
						'tableWidth',
						'tableHeight',
						'tableAlignment'
					].forEach( command => {
						editor.commands.get( command ).isEnabled = false;
					} );

					expect( tablePropertiesButton.isEnabled ).to.be.false;

					editor.commands.get( 'tableBackgroundColor' ).isEnabled = true;

					expect( tablePropertiesButton.isEnabled ).to.be.true;
				} );
			} );
		} );

		describe( 'destroy()', () => {
			it( 'should destroy the #view', () => {
				tablePropertiesUI._showView();
				tablePropertiesView = tablePropertiesUI.view;

				const spy = sinon.spy( tablePropertiesView, 'destroy' );

				tablePropertiesUI.destroy();

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
				tablePropertiesButton.fire( 'execute' );
				tablePropertiesView = tablePropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				tablePropertiesView.fire( 'submit' );
				expect( contextualBalloon.visibleView ).to.be.null;
			} );

			describe( '#cancel event', () => {
				// https://github.com/ckeditor/ckeditor5/issues/6180
				it( 'should not undo if it there were no changes made to the property fields', () => {
					const spy = sinon.spy( editor, 'execute' );

					// Show the view. New batch will be created.
					tablePropertiesButton.fire( 'execute' );
					tablePropertiesView = tablePropertiesUI.view;

					// Cancel the view immediately.
					tablePropertiesView.fire( 'cancel' );

					sinon.assert.notCalled( spy );
				} );

				it( 'should undo the entire batch of changes if there were some', () => {
					const spy = sinon.spy( editor, 'execute' );

					// Show the view. New batch will be created.
					tablePropertiesButton.fire( 'execute' );
					tablePropertiesView = tablePropertiesUI.view;

					// Do the changes like a user.
					tablePropertiesView.borderStyle = 'dotted';
					tablePropertiesView.backgroundColor = 'red';

					expect( getModelData( editor.model ) ).to.equal(
						'<table tableBackgroundColor="red" tableBorderStyle="dotted">' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>[]foo</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>' +
						'<paragraph>bar</paragraph>'
					);

					tablePropertiesView.fire( 'cancel' );

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

					sinon.assert.calledWith( spy, 'undo', tablePropertiesUI._undoStepBatch );
				} );

				it( 'should hide the view', () => {
					tablePropertiesButton.fire( 'execute' );
					tablePropertiesView = tablePropertiesUI.view;

					expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

					tablePropertiesView.fire( 'cancel' );
					expect( contextualBalloon.visibleView ).to.be.null;
				} );
			} );

			it( 'should hide on the Esc key press', () => {
				const keyEvtData = {
					keyCode: keyCodes.esc,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				tablePropertiesButton.fire( 'execute' );
				tablePropertiesView = tablePropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				tablePropertiesView.keystrokes.press( keyEvtData );
				expect( contextualBalloon.visibleView ).to.be.null;
			} );

			it( 'should hide if the table is no longer selected on EditorUI#update', () => {
				tablePropertiesButton.fire( 'execute' );
				tablePropertiesView = tablePropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				editor.model.change( writer => {
					// Set selection in the paragraph.
					writer.setSelection( editor.model.document.getRoot().getChild( 1 ), 0 );
				} );

				expect( contextualBalloon.visibleView ).to.be.null;
			} );

			it( 'should not hide if the table is selected on EditorUI#update', () => {
				tablePropertiesButton.fire( 'execute' );
				tablePropertiesView = tablePropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				editor.model.change( writer => {
					// Set selection in the paragraph.
					writer.setSelection( editor.model.document.getRoot().getChild( 0 ), 'on' );
				} );

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );
			} );

			it( 'should not hide if the selection is in the table on EditorUI#update', () => {
				tablePropertiesButton.fire( 'execute' );
				tablePropertiesView = tablePropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				editor.model.change( writer => {
					// Set selection in the paragraph.
					writer.setSelection( editor.model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] ), 'in' );
				} );

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );
			} );

			it( 'should reposition if table is still selected on on EditorUI#update', () => {
				tablePropertiesButton.fire( 'execute' );
				tablePropertiesView = tablePropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				editor.model.change( writer => {
					writer.insertText( 'qux', editor.model.document.selection.getFirstPosition() );
				} );

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );
			} );

			it( 'should hide if clicked outside the balloon', () => {
				tablePropertiesButton.fire( 'execute' );
				tablePropertiesView = tablePropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

				expect( contextualBalloon.visibleView ).to.be.null;
			} );

			describe( 'property changes', () => {
				let batch;

				beforeEach( () => {
					batch = editor.model.createBatch();

					tablePropertiesUI._undoStepBatch = batch;
					tablePropertiesUI._showView();
					tablePropertiesView = tablePropertiesUI.view;
				} );

				describe( '#borderStyle', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tablePropertiesView.borderStyle = 'dotted';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableBorderStyle', { value: 'dotted', batch } );
					} );
				} );

				describe( '#borderColor', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tablePropertiesView.borderColor = '#FFAAFF';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableBorderColor', { value: '#FFAAFF', batch } );
					} );

					it( 'should display an error message if value is invalid', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						// First, let's pass an invalid value and check what happens.
						tablePropertiesView.borderColor = '42';

						clock.tick( 500 );

						expect( tablePropertiesView.borderColorInput.errorText ).to.match( /^The color is invalid/ );
						sinon.assert.notCalled( spy );

						// And now let's pass a valid value and check if the error text will be gone.
						tablePropertiesView.borderColor = '#AAA';

						clock.tick( 500 );

						expect( tablePropertiesView.borderColorInput.errorText ).to.be.null;
						sinon.assert.calledWithExactly( spy, 'tableBorderColor', { value: '#AAA', batch } );
					} );
				} );

				describe( '#borderWidth', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tablePropertiesView.borderWidth = '12px';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableBorderWidth', { value: '12px', batch } );
					} );

					it( 'should display an error message if value is invalid', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						// First, let's pass an invalid value and check what happens.
						tablePropertiesView.borderWidth = 'wrong';

						clock.tick( 500 );

						expect( tablePropertiesView.borderWidthInput.errorText ).to.match( /^The value is invalid/ );
						sinon.assert.notCalled( spy );

						// And now let's pass a valid value and check if the error text will be gone.
						tablePropertiesView.borderWidth = '3em';

						clock.tick( 500 );

						expect( tablePropertiesView.backgroundInput.errorText ).to.be.null;
						sinon.assert.calledWithExactly( spy, 'tableBorderWidth', { value: '3em', batch } );
					} );
				} );

				describe( '#backgroundColor', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tablePropertiesView.backgroundColor = '#FFAAFF';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableBackgroundColor', { value: '#FFAAFF', batch } );
					} );

					it( 'should display an error message if value is invalid', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						// First, let's pass an invalid value and check what happens.
						tablePropertiesView.backgroundColor = '42';

						clock.tick( 500 );

						expect( tablePropertiesView.backgroundInput.errorText ).to.match( /^The color is invalid/ );
						sinon.assert.notCalled( spy );

						// And now let's pass a valid value and check if the error text will be gone.
						tablePropertiesView.backgroundColor = '#AAA';

						clock.tick( 500 );

						expect( tablePropertiesView.backgroundInput.errorText ).to.be.null;
						sinon.assert.calledWithExactly( spy, 'tableBackgroundColor', { value: '#AAA', batch } );
					} );
				} );

				describe( '#width', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tablePropertiesView.width = '12px';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableWidth', { value: '12px', batch } );
					} );

					it( 'should display an error message if value is invalid', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						// First, let's pass an invalid value and check what happens.
						tablePropertiesView.width = 'wrong';

						clock.tick( 500 );

						expect( tablePropertiesView.widthInput.errorText ).to.match( /^The value is invalid/ );
						sinon.assert.notCalled( spy );

						// And now let's pass a valid value and check if the error text will be gone.
						tablePropertiesView.width = '3em';

						clock.tick( 500 );

						expect( tablePropertiesView.backgroundInput.errorText ).to.be.null;
						sinon.assert.calledWithExactly( spy, 'tableWidth', { value: '3em', batch } );
					} );
				} );

				describe( '#height', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tablePropertiesView.height = '12px';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableHeight', { value: '12px', batch } );
					} );

					it( 'should display an error message if value is invalid', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						// First, let's pass an invalid value and check what happens.
						tablePropertiesView.height = 'wrong';

						clock.tick( 500 );

						expect( tablePropertiesView.heightInput.errorText ).to.match( /^The value is invalid/ );
						sinon.assert.notCalled( spy );

						// And now let's pass a valid value and check if the error text will be gone.
						tablePropertiesView.height = '3em';

						clock.tick( 500 );

						expect( tablePropertiesView.backgroundInput.errorText ).to.be.null;
						sinon.assert.calledWithExactly( spy, 'tableHeight', { value: '3em', batch } );
					} );
				} );

				describe( '#alignment', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tablePropertiesView.alignment = 'right';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableAlignment', { value: 'right', batch } );
					} );
				} );

				it( 'should not display an error text if user managed to fix the value before the UI timeout', () => {
					// First, let's pass an invalid value.
					tablePropertiesView.borderColor = '#';

					clock.tick( 100 );

					// Then the user managed to quickly type the correct value.
					tablePropertiesView.borderColor = '#aaa';

					clock.tick( 400 );

					// Because they were quick, they should see no error
					expect( tablePropertiesView.borderColorInput.errorText ).to.be.null;
				} );

				it( 'should not affect the editor state if internal property has changed', () => {
					const spy = testUtils.sinon.stub( editor, 'execute' );

					tablePropertiesView.set( 'internalProp', 'foo' );

					tablePropertiesView.internalProp = 'bar';

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
				tablePropertiesButton.fire( 'execute' );
				tablePropertiesView = tablePropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				const firstBatch = tablePropertiesUI._undoStepBatch;
				expect( firstBatch ).to.be.instanceOf( Batch );

				tablePropertiesView.fire( 'submit' );
				expect( contextualBalloon.visibleView ).to.be.null;

				tablePropertiesButton.fire( 'execute' );

				const secondBatch = tablePropertiesUI._undoStepBatch;
				expect( secondBatch ).to.be.instanceOf( Batch );
				expect( firstBatch ).to.not.equal( secondBatch );
			} );

			it( 'should start listening to EditorUI#update', () => {
				const spy = sinon.spy( tablePropertiesUI, 'listenTo' );

				tablePropertiesButton.fire( 'execute' );
				tablePropertiesView = tablePropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				let count = 0;

				for ( const args of spy.args ) {
					if ( args[ 1 ] == 'update' ) {
						expect( args[ 0 ] ).to.equal( editor.ui );
						count++;
					}
				}

				expect( count ).to.equal( 1 );
			} );

			describe( 'initial data', () => {
				it( 'should not execute commands before changing the data', () => {
					const tableBackgroundCommand = editor.commands.get( 'tableBackgroundColor' );
					const spy = sinon.spy( tableBackgroundCommand, 'execute' );

					tablePropertiesUI._showView();
					tablePropertiesView = tablePropertiesUI.view;

					expect( spy.called ).to.be.false;

					tablePropertiesView.backgroundColor = 'red';

					expect( spy.called ).to.be.true;
				} );

				it( 'should be set before adding the form to the the balloon to avoid unnecessary input animations', () => {
					// Trigger lazy init.
					tablePropertiesUI._showView();
					tablePropertiesUI._hideView();
					tablePropertiesView = tablePropertiesUI.view;

					const balloonAddSpy = testUtils.sinon.spy( editor.plugins.get( ContextualBalloon ), 'add' );
					const borderStyleChangeSpy = testUtils.sinon.spy();

					tablePropertiesView.on( 'change:borderStyle', borderStyleChangeSpy );

					editor.commands.get( 'tableBorderStyle' ).value = 'a';
					tablePropertiesButton.fire( 'execute' );

					sinon.assert.calledOnce( borderStyleChangeSpy );
					sinon.assert.calledOnce( balloonAddSpy );
					sinon.assert.callOrder( borderStyleChangeSpy, balloonAddSpy );
				} );

				it( 'should be set from the command values', () => {
					editor.commands.get( 'tableBorderStyle' ).value = 'a';
					editor.commands.get( 'tableBorderColor' ).value = 'b';
					editor.commands.get( 'tableBorderWidth' ).value = 'c';
					editor.commands.get( 'tableBackgroundColor' ).value = 'd';
					editor.commands.get( 'tableWidth' ).value = 'e';
					editor.commands.get( 'tableHeight' ).value = 'f';
					editor.commands.get( 'tableAlignment' ).value = 'g';

					tablePropertiesButton.fire( 'execute' );
					tablePropertiesView = tablePropertiesUI.view;

					expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );
					expect( tablePropertiesView ).to.include( {
						borderStyle: 'a',
						borderColor: 'b',
						borderWidth: 'c',
						backgroundColor: 'd',
						width: 'e',
						height: 'f',
						alignment: 'g'
					} );
				} );

				it( 'should use default values when command has no value', () => {
					editor.commands.get( 'tableBorderStyle' ).value = null;
					editor.commands.get( 'tableBorderColor' ).value = null;
					editor.commands.get( 'tableBorderWidth' ).value = null;
					editor.commands.get( 'tableBackgroundColor' ).value = null;
					editor.commands.get( 'tableWidth' ).value = null;
					editor.commands.get( 'tableHeight' ).value = null;
					editor.commands.get( 'tableAlignment' ).value = null;

					tablePropertiesButton.fire( 'execute' );
					tablePropertiesView = tablePropertiesUI.view;

					expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );
					expect( tablePropertiesView ).to.include( {
						borderStyle: 'double',
						borderColor: 'hsl(0, 0%, 70%)',
						borderWidth: '1px',
						backgroundColor: '',
						width: '',
						height: '',
						alignment: 'center'
					} );
				} );
			} );

			it( 'should focus the form view', () => {
				// Trigger lazy init.
				tablePropertiesUI._showView();
				tablePropertiesUI._hideView();
				tablePropertiesView = tablePropertiesUI.view;

				const spy = testUtils.sinon.spy( tablePropertiesView, 'focus' );

				tablePropertiesButton.fire( 'execute' );

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
				const spy = testUtils.sinon.spy( tablePropertiesUI, 'stopListening' );

				tablePropertiesButton.fire( 'execute' );
				tablePropertiesView = tablePropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				tablePropertiesView.fire( 'submit' );
				expect( contextualBalloon.visibleView ).to.be.null;

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, editor.ui, 'update' );
			} );

			it( 'should focus the editing view so the focus is not lost', () => {
				const spy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				tablePropertiesButton.fire( 'execute' );
				tablePropertiesView = tablePropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				tablePropertiesView.fire( 'submit' );

				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'Updating the #view', () => {
			beforeEach( () => {
				editor.model.change( writer => {
					writer.setSelection( editor.model.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 ), 0 );
				} );

				tablePropertiesButton.fire( 'execute' );
				tablePropertiesView = tablePropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );
			} );

			it( 'should reposition the baloon if table is selected', () => {
				const spy = sinon.spy( contextualBalloon, 'updatePosition' );

				editor.ui.fire( 'update' );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should not reposition the baloon if view is not visible', () => {
				const spy = sinon.spy( contextualBalloon, 'updatePosition' );

				tablePropertiesUI.view = false;
				editor.ui.fire( 'update' );

				expect( spy.called ).to.be.false;
			} );

			it( 'should hide the view and not reposition the balloon if table is no longer selected', () => {
				const positionSpy = sinon.spy( contextualBalloon, 'updatePosition' );
				const hideSpy = sinon.spy( tablePropertiesUI, '_hideView' );

				tablePropertiesView.fire( 'submit' );
				tablePropertiesView = tablePropertiesUI.view;

				expect( contextualBalloon.visibleView ).to.be.null;

				sinon.assert.calledOnce( hideSpy );
				sinon.assert.notCalled( positionSpy );
			} );
		} );

		describe( 'default table properties', () => {
			let editor, editorElement, contextualBalloon,
				tablePropertiesUI, tablePropertiesView, tablePropertiesButton;

			testUtils.createSinonSandbox();

			beforeEach( () => {
				editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ Table, TablePropertiesEditing, TablePropertiesUI, Paragraph, Undo, ClipboardPipeline ],
						initialData: '<table><tr><td>foo</td></tr></table><p>bar</p>',
						table: {
							tableProperties: {
								defaultProperties: {
									alignment: 'left',
									borderStyle: 'dashed',
									borderColor: '#ff0',
									borderWidth: '2px',
									backgroundColor: '#00f',
									width: '250px',
									height: '150px'
								}
							}
						}
					} )
					.then( newEditor => {
						editor = newEditor;

						tablePropertiesUI = editor.plugins.get( TablePropertiesUI );
						tablePropertiesButton = editor.ui.componentFactory.create( 'tableProperties' );
						contextualBalloon = editor.plugins.get( ContextualBalloon );
						tablePropertiesView = tablePropertiesUI.view;

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
					tablePropertiesUI._showView();
					tablePropertiesUI._hideView();

					tablePropertiesView = tablePropertiesUI.view;
				} );

				describe( '#view', () => {
					it( 'should get the default table properties configurations', () => {
						expect( tablePropertiesView.options.defaultTableProperties ).to.deep.equal( {
							alignment: 'left',
							borderStyle: 'dashed',
							borderColor: '#ff0',
							borderWidth: '2px',
							backgroundColor: '#00f',
							width: '250px',
							height: '150px'
						} );
					} );
				} );
			} );

			describe( 'Showing the #view', () => {
				beforeEach( () => {
					editor.model.change( writer => {
						writer.setSelection( editor.model.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 ), 0 );
					} );

					// Trigger lazy init.
					tablePropertiesUI._showView();
					tablePropertiesUI._hideView();

					tablePropertiesView = tablePropertiesUI.view;
				} );

				describe( 'initial data', () => {
					it( 'should use default values when command has no value', () => {
						editor.commands.get( 'tableBorderStyle' ).value = null;
						editor.commands.get( 'tableBorderColor' ).value = null;
						editor.commands.get( 'tableBorderWidth' ).value = null;
						editor.commands.get( 'tableBackgroundColor' ).value = null;
						editor.commands.get( 'tableWidth' ).value = null;
						editor.commands.get( 'tableHeight' ).value = null;
						editor.commands.get( 'tableAlignment' ).value = null;

						tablePropertiesButton.fire( 'execute' );

						expect( tablePropertiesView ).to.include( {
							borderStyle: 'dashed',
							borderColor: '#ff0',
							borderWidth: '2px',
							backgroundColor: '#00f',
							width: '250px',
							height: '150px',
							alignment: 'left'
						} );
					} );

					it( 'should not set `borderColor` and `borderWidth` attributes if borderStyle="none"', () => {
						editor.commands.get( 'tableBorderStyle' ).value = 'none';

						tablePropertiesButton.fire( 'execute' );

						expect( tablePropertiesView ).to.include( {
							borderStyle: 'none',
							borderColor: '',
							borderWidth: '',
							backgroundColor: '#00f',
							width: '250px',
							height: '150px',
							alignment: 'left'
						} );
					} );
				} );
			} );

			describe( 'Showing the #view (layout table)', () => {
				let editor, editorElement, tablePropertiesUI, tablePropertiesView, tablePropertiesButton;

				beforeEach( async () => {
					editorElement = document.createElement( 'div' );
					document.body.appendChild( editorElement );

					editor = await ClassicTestEditor.create( editorElement, {
						plugins: [ Table, TablePropertiesEditing, TablePropertiesUI, Paragraph, Undo, ClipboardPipeline, TableLayout ],
						initialData: '<table><tr><td>foo</td></tr></table><p>bar</p>',
						table: {
							tableProperties: {
								defaultProperties: {
									alignment: 'left',
									borderStyle: 'dashed',
									borderColor: '#ff0',
									borderWidth: '2px',
									backgroundColor: '#00f',
									width: '250px',
									height: '150px'
								}
							}
						}
					} );

					tablePropertiesUI = editor.plugins.get( TablePropertiesUI );
					tablePropertiesButton = editor.ui.componentFactory.create( 'tableProperties' );

					editor.model.change( writer => {
						writer.setSelection( editor.model.document.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 ), 0 );
					} );

					// Trigger lazy init.
					tablePropertiesUI._showView();
					tablePropertiesUI._hideView();

					tablePropertiesView = tablePropertiesUI.view;
				} );

				afterEach( async () => {
					editorElement.remove();

					return editor.destroy();
				} );

				it( 'should use hardcoded defaults for layout table instead of configuration', () => {
					editor.commands.get( 'tableBorderStyle' ).value = null;
					editor.commands.get( 'tableBorderColor' ).value = null;
					editor.commands.get( 'tableBorderWidth' ).value = null;
					editor.commands.get( 'tableBackgroundColor' ).value = null;
					editor.commands.get( 'tableWidth' ).value = null;
					editor.commands.get( 'tableHeight' ).value = null;
					editor.commands.get( 'tableAlignment' ).value = null;

					tablePropertiesButton.fire( 'execute' );

					expect( tablePropertiesView ).to.include( {
						borderStyle: 'none',
						borderColor: '',
						borderWidth: '',
						backgroundColor: '',
						width: '',
						height: '',
						alignment: ''
					} );
				} );
			} );
		} );
	} );

	describe( 'table properties without color picker', () => {
		let editor, editorElement, contextualBalloon, tablePropertiesUI;

		testUtils.createSinonSandbox();

		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Table, TablePropertiesEditing, TablePropertiesUI, Paragraph, Undo, ClipboardPipeline ],
					initialData: '<table><tr><td>foo</td></tr></table><p>bar</p>',
					table: {
						tableProperties: {
							colorPicker: false
						}
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					contextualBalloon = editor.plugins.get( ContextualBalloon );
					tablePropertiesUI = editor.plugins.get( TablePropertiesUI );

					// There is no point to execute BalloonPanelView attachTo and pin methods so lets override it.
					testUtils.sinon.stub( contextualBalloon.view, 'attachTo' ).returns( {} );
					testUtils.sinon.stub( contextualBalloon.view, 'pin' ).returns( {} );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should define table.tableProperties.colorPicker', () => {
			expect( editor.config.get( 'table.tableProperties.colorPicker' ) ).to.be.false;
		} );

		it( 'should render dropdown without color picker', () => {
			tablePropertiesUI._showView();

			const panelView = tablePropertiesUI.view.borderColorInput.fieldView.dropdownView.panelView;
			const colorPicker = panelView.children.get( 0 ).colorPickerFragmentView.element;

			expect( colorPicker ).to.be.null;
		} );
	} );
} );
