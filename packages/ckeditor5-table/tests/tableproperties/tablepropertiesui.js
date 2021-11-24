/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Batch from '@ckeditor/ckeditor5-engine/src/model/batch';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';

import Table from '../../src/table';
import TablePropertiesEditing from '../../src/tableproperties/tablepropertiesediting';
import TablePropertiesUI from '../../src/tableproperties/tablepropertiesui';
import TablePropertiesUIView from '../../src/tableproperties/ui/tablepropertiesview';
import { defaultColors } from '../../src/utils/ui/table-properties';

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
					plugins: [ Table, TablePropertiesEditing, TablePropertiesUI, Paragraph, Undo ],
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
				expect( tablePropertiesUI._undoStepBatch ).to.be.null;
			} );

			it( 'should set normalized default table properties', () => {
				expect( tablePropertiesUI._defaultTableProperties ).to.be.an( 'object' );
			} );

			describe( '#view', () => {
				it( 'should be created', () => {
					expect( tablePropertiesUI.view ).to.be.instanceOf( TablePropertiesUIView );
				} );

				it( 'should be rendered', () => {
					expect( tablePropertiesUI.view.isRendered ).to.be.true;
				} );

				it( 'should get the border colors configurations', () => {
					expect( tablePropertiesView.options.borderColors ).to.have.length( 15 );
				} );

				it( 'should get the background colors configurations', () => {
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

					// Cancel the view immediately.
					tablePropertiesView.fire( 'cancel' );

					sinon.assert.notCalled( spy );
				} );

				it( 'should undo the entire batch of changes if there were some', () => {
					const spy = sinon.spy( editor, 'execute' );

					// Show the view. New batch will be created.
					tablePropertiesButton.fire( 'execute' );

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
				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				tablePropertiesView.keystrokes.press( keyEvtData );
				expect( contextualBalloon.visibleView ).to.be.null;
			} );

			it( 'should hide if the table is no longer selected on EditorUI#update', () => {
				tablePropertiesButton.fire( 'execute' );
				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				editor.model.change( writer => {
					// Set selection in the paragraph.
					writer.setSelection( editor.model.document.getRoot().getChild( 1 ), 0 );
				} );

				expect( contextualBalloon.visibleView ).to.be.null;
			} );

			it( 'should reposition if table is still selected on on EditorUI#update', () => {
				tablePropertiesButton.fire( 'execute' );
				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				editor.model.change( writer => {
					writer.insertText( 'qux', editor.model.document.selection.getFirstPosition() );
				} );

				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );
			} );

			it( 'should hide if clicked outside the balloon', () => {
				tablePropertiesButton.fire( 'execute' );
				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

				expect( contextualBalloon.visibleView ).to.be.null;
			} );

			describe( 'property changes', () => {
				beforeEach( () => {
					tablePropertiesUI._undoStepBatch = 'foo';
				} );

				describe( '#borderStyle', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tablePropertiesView.borderStyle = 'dotted';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableBorderStyle', { value: 'dotted', batch: 'foo' } );
					} );
				} );

				describe( '#borderColor', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tablePropertiesView.borderColor = '#FFAAFF';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableBorderColor', { value: '#FFAAFF', batch: 'foo' } );
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
						sinon.assert.calledWithExactly( spy, 'tableBorderColor', { value: '#AAA', batch: 'foo' } );
					} );
				} );

				describe( '#borderWidth', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tablePropertiesView.borderWidth = '12px';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableBorderWidth', { value: '12px', batch: 'foo' } );
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
						sinon.assert.calledWithExactly( spy, 'tableBorderWidth', { value: '3em', batch: 'foo' } );
					} );
				} );

				describe( '#backgroundColor', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tablePropertiesView.backgroundColor = '#FFAAFF';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableBackgroundColor', { value: '#FFAAFF', batch: 'foo' } );
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
						sinon.assert.calledWithExactly( spy, 'tableBackgroundColor', { value: '#AAA', batch: 'foo' } );
					} );
				} );

				describe( '#width', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tablePropertiesView.width = '12px';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableWidth', { value: '12px', batch: 'foo' } );
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
						sinon.assert.calledWithExactly( spy, 'tableWidth', { value: '3em', batch: 'foo' } );
					} );
				} );

				describe( '#height', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tablePropertiesView.height = '12px';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableHeight', { value: '12px', batch: 'foo' } );
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
						sinon.assert.calledWithExactly( spy, 'tableHeight', { value: '3em', batch: 'foo' } );
					} );
				} );

				describe( '#alignment', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tablePropertiesView.alignment = 'right';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableAlignment', { value: 'right', batch: 'foo' } );
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
				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWith( spy, editor.ui, 'update' );
			} );

			describe( 'initial data', () => {
				it( 'should be set before adding the form to the the balloon to avoid unnecessary input animations', () => {
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

					expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );
					expect( tablePropertiesView ).to.include( {
						borderStyle: 'none',
						borderColor: '',
						borderWidth: '',
						backgroundColor: '',
						width: '',
						height: '',
						alignment: 'center'
					} );
				} );
			} );

			it( 'should focus the form view', () => {
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
				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );

				tablePropertiesView.fire( 'submit' );
				expect( contextualBalloon.visibleView ).to.be.null;

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, editor.ui, 'update' );
			} );

			it( 'should focus the editing view so the focus is not lost', () => {
				const spy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				tablePropertiesButton.fire( 'execute' );
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
				expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );
			} );

			it( 'should reposition the baloon if table is selected', () => {
				const spy = sinon.spy( contextualBalloon, 'updatePosition' );

				editor.ui.fire( 'update' );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should hide the view and not reposition the balloon if table is no longer selected', () => {
				const positionSpy = sinon.spy( contextualBalloon, 'updatePosition' );
				const hideSpy = sinon.spy( tablePropertiesUI, '_hideView' );

				tablePropertiesView.fire( 'submit' );
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
						plugins: [ Table, TablePropertiesEditing, TablePropertiesUI, Paragraph, Undo ],
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

						expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );
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

						expect( contextualBalloon.visibleView ).to.equal( tablePropertiesView );
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
		} );
	} );
} );
