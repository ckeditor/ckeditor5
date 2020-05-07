/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { getData as getModelData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Batch from '@ckeditor/ckeditor5-engine/src/model/batch';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';

import Table from '../../src/table';
import TableCellPropertiesEditing from '../../src/tablecellproperties/tablecellpropertiesediting';
import TableCellPropertiesUI from '../../src/tablecellproperties/tablecellpropertiesui';
import TableCellPropertiesUIView from '../../src/tablecellproperties/ui/tablecellpropertiesview';
import { defaultColors } from '../../src/ui/utils';
import { modelTable } from '../_utils/utils';

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
					plugins: [ Table, TableCellPropertiesEditing, TableCellPropertiesUI, Paragraph, Undo ],
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

		it( 'should load ContextualBalloon', () => {
			expect( editor.plugins.get( ContextualBalloon ) ).to.be.instanceOf( ContextualBalloon );
		} );

		describe( 'constructor()', () => {
			it( 'should define table.tableCellProperties config', () => {
				expect( editor.config.get( 'table.tableCellProperties' ) ).to.deep.equal( {
					borderColors: defaultColors,
					backgroundColors: defaultColors
				} );
			} );
		} );

		describe( 'init()', () => {
			it( 'should set a batch', () => {
				expect( tableCellPropertiesUI._undoStepBatch ).to.be.null;
			} );

			describe( '#view', () => {
				it( 'should be created', () => {
					expect( tableCellPropertiesUI.view ).to.be.instanceOf( TableCellPropertiesUIView );
				} );

				it( 'should be rendered', () => {
					expect( tableCellPropertiesUI.view.isRendered ).to.be.true;
				} );

				it( 'should get the border colors configurations', () => {
					expect( tableCellPropertiesView.options.borderColors ).to.have.length( 15 );
				} );

				it( 'should get the background colors configurations', () => {
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

				it( 'should be disabled if all of the table properties commands are disabled', () => {
					[
						'tableCellBorderStyle',
						'tableCellBorderColor',
						'tableCellBorderWidth',
						'tableCellWidth',
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

					// Cancel the view immediately.
					tableCellPropertiesView.fire( 'cancel' );

					sinon.assert.notCalled( spy );
				} );

				it( 'should undo the entire batch of changes if there were some', () => {
					const spy = sinon.spy( editor, 'execute' );

					// Show the view. New batch will be created.
					tableCellPropertiesButton.fire( 'execute' );

					// Do the changes like a user.
					tableCellPropertiesView.borderStyle = 'dotted';
					tableCellPropertiesView.backgroundColor = 'red';

					expect( getModelData( editor.model ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell backgroundColor="red" borderStyle="dotted">' +
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
				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

				tableCellPropertiesView.keystrokes.press( keyEvtData );
				expect( contextualBalloon.visibleView ).to.be.null;
			} );

			it( 'should hide if the table cell is no longer selected on EditorUI#update', () => {
				tableCellPropertiesButton.fire( 'execute' );
				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

				editor.model.change( writer => {
					// Set selection in the paragraph.
					writer.setSelection( editor.model.document.getRoot().getChild( 1 ), 0 );
				} );

				expect( contextualBalloon.visibleView ).to.be.null;
			} );

			it( 'should reposition if table cell is still selected on on EditorUI#update', () => {
				tableCellPropertiesButton.fire( 'execute' );
				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

				editor.model.change( writer => {
					writer.insertText( 'qux', editor.model.document.selection.getFirstPosition() );
				} );

				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );
			} );

			it( 'should hide if clicked outside the balloon', () => {
				tableCellPropertiesButton.fire( 'execute' );
				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

				document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

				expect( contextualBalloon.visibleView ).to.be.null;
			} );

			describe( 'property changes', () => {
				beforeEach( () => {
					tableCellPropertiesUI._undoStepBatch = 'foo';
				} );

				describe( '#borderStyle', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.borderStyle = 'dotted';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellBorderStyle', { value: 'dotted', batch: 'foo' } );
					} );
				} );

				describe( '#borderColor', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.borderColor = '#FFAAFF';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellBorderColor', { value: '#FFAAFF', batch: 'foo' } );
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
						sinon.assert.calledWithExactly( spy, 'tableCellBorderColor', { value: '#AAA', batch: 'foo' } );
					} );
				} );

				describe( '#borderWidth', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.borderWidth = '12px';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellBorderWidth', { value: '12px', batch: 'foo' } );
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
						sinon.assert.calledWithExactly( spy, 'tableCellBorderWidth', { value: '3em', batch: 'foo' } );
					} );
				} );

				describe( '#width', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.width = '12px';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellWidth', { value: '12px', batch: 'foo' } );
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
						sinon.assert.calledWithExactly( spy, 'tableCellWidth', { value: '3em', batch: 'foo' } );
					} );
				} );

				describe( '#height', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.height = '12px';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellHeight', { value: '12px', batch: 'foo' } );
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
						sinon.assert.calledWithExactly( spy, 'tableCellHeight', { value: '3em', batch: 'foo' } );
					} );
				} );

				describe( '#padding', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.padding = '12px';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellPadding', { value: '12px', batch: 'foo' } );
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
						sinon.assert.calledWithExactly( spy, 'tableCellPadding', { value: '3em', batch: 'foo' } );
					} );
				} );

				describe( '#backgroundColor', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.backgroundColor = '#FFAAFF';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellBackgroundColor', { value: '#FFAAFF', batch: 'foo' } );
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
						sinon.assert.calledWithExactly( spy, 'tableCellBackgroundColor', { value: '#AAA', batch: 'foo' } );
					} );
				} );

				describe( '#horizontalAlignment', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.horizontalAlignment = 'right';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellHorizontalAlignment', { value: 'right', batch: 'foo' } );
					} );
				} );

				describe( '#verticalAlignment', () => {
					it( 'should affect the editor state', () => {
						const spy = testUtils.sinon.stub( editor, 'execute' );

						tableCellPropertiesView.verticalAlignment = 'right';

						sinon.assert.calledOnce( spy );
						sinon.assert.calledWithExactly( spy, 'tableCellVerticalAlignment', { value: 'right', batch: 'foo' } );
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
				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );
			} );

			describe( 'initial data', () => {
				it( 'should be set from the command values', () => {
					editor.commands.get( 'tableCellBorderStyle' ).value = 'a';
					editor.commands.get( 'tableCellBorderColor' ).value = 'b';
					editor.commands.get( 'tableCellBorderWidth' ).value = 'c';
					editor.commands.get( 'tableCellWidth' ).value = 'd';
					editor.commands.get( 'tableCellHeight' ).value = 'e';
					editor.commands.get( 'tableCellPadding' ).value = 'f';
					editor.commands.get( 'tableCellBackgroundColor' ).value = 'g';
					editor.commands.get( 'tableCellHorizontalAlignment' ).value = 'h';
					editor.commands.get( 'tableCellVerticalAlignment' ).value = 'i';

					tableCellPropertiesButton.fire( 'execute' );

					expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );
					expect( tableCellPropertiesView ).to.include( {
						borderStyle: 'a',
						borderColor: 'b',
						borderWidth: 'c',
						width: 'd',
						height: 'e',
						padding: 'f',
						backgroundColor: 'g',
						horizontalAlignment: 'h',
						verticalAlignment: 'i'
					} );
				} );

				it( 'should use default values when command has no value', () => {
					editor.commands.get( 'tableCellBorderStyle' ).value = null;
					editor.commands.get( 'tableCellBorderColor' ).value = null;
					editor.commands.get( 'tableCellBorderWidth' ).value = null;
					editor.commands.get( 'tableCellWidth' ).value = null;
					editor.commands.get( 'tableCellHeight' ).value = null;
					editor.commands.get( 'tableCellPadding' ).value = null;
					editor.commands.get( 'tableCellBackgroundColor' ).value = null;
					editor.commands.get( 'tableCellHorizontalAlignment' ).value = null;
					editor.commands.get( 'tableCellVerticalAlignment' ).value = null;

					tableCellPropertiesButton.fire( 'execute' );

					expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );
					expect( tableCellPropertiesView ).to.include( {
						borderStyle: '',
						borderColor: '',
						borderWidth: '',
						width: '',
						height: '',
						padding: '',
						backgroundColor: '',
						horizontalAlignment: '',
						verticalAlignment: ''
					} );
				} );
			} );

			it( 'should focus the form view', () => {
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
				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

				tableCellPropertiesView.fire( 'submit' );
				expect( contextualBalloon.visibleView ).to.be.null;

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, editor.ui, 'update' );
			} );

			it( 'should focus the editing view so the focus is not lost', () => {
				const spy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				tableCellPropertiesButton.fire( 'execute' );
				expect( contextualBalloon.visibleView ).to.equal( tableCellPropertiesView );

				tableCellPropertiesView.fire( 'submit' );

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );
} );
