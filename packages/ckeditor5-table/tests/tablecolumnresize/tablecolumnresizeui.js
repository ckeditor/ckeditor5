/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';

import { modelTable } from '../_utils/utils.js';

import Table from '../../src/table.js';
import { TableColumnResize, TableColumnResizeEditing, TableColumnResizeUI, TableSelection } from '../../src/index.js';

describe( 'TableColumnResizeUI', () => {
	let element, model, modelRoot, editor, dropdown, button, command, tableSelection, plugin, balloon;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor
			.create( element, {
				plugins: [
					TableColumnResizeUI, TableColumnResizeEditing, TableColumnResize,
					TableSelection, Table, Paragraph
				]
			} );

		model = editor.model;
		modelRoot = model.document.getRoot();

		plugin = editor.plugins.get( TableColumnResizeUI );
		command = editor.commands.get( 'resizeTableColumn' );
		tableSelection = editor.plugins.get( 'TableSelection' );

		balloon = editor.plugins.get( 'ContextualBalloon' );
		dropdown = editor.ui.componentFactory.create( 'tableColumn' );
		dropdown.isOpen = true;

		button = dropdown.listView.items
			.map( item => item.children && item.children.first )
			.filter( Boolean )
			.find( item => item.label === 'Resize column' );

		setModelData( model, modelTable( [
			[ '00[]', '01', '02' ],
			[ '10', '11', '12' ],
			[ '20', '21', '22' ]
		] ) );
	} );

	afterEach( async () => {
		await editor.destroy();
		element.remove();
	} );

	it( 'should be named', () => {
		expect( TableColumnResizeUI.pluginName ).to.equal( 'TableColumnResizeUI' );
	} );

	describe( 'dropdown button', () => {
		it( 'should be present in table column utils dropdown', () => {
			expect( button ).not.to.be.undefined;
		} );

		it( 'should be enabled when there is at least one table', () => {
			expect( button.isEnabled ).to.be.true;
		} );

		it( 'should be enabled when there are not any tables', () => {
			setModelData( model, '' );

			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should have isEnabled property bind to command\'s isEnabled property', () => {
			command.isEnabled = true;
			expect( button.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should be enabled on single column selection', () => {
			selectColumn( 1 );
			expect( button.isEnabled ).to.be.true;
		} );

		it( 'should be disabled on multi column selection', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 2 ] )
			);

			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should open balloon panel on click', () => {
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			expect( balloon.visibleView ).to.be.null;

			button.fire( 'execute' );

			expect( balloon.visibleView ).to.equal( plugin._form );
			expect( plugin._isVisible ).to.be.true;
		} );

		it( 'should open with default column width', () => {
			plugin._createForm();
			tableSelection.setCellSelection(
				modelRoot.getNodeByPath( [ 0, 0, 1 ] ),
				modelRoot.getNodeByPath( [ 0, 1, 1 ] )
			);

			expect( balloon.visibleView ).to.be.null;

			button.fire( 'execute' );
			expect( plugin._form.labeledInput.fieldView.value ).equals( '46' );
		} );

		it( 'should disable CSS transitions before showing the form to avoid unnecessary animations (and then enable them again)', () => {
			selectColumn();
			plugin._createForm();

			const addSpy = sinon.spy( balloon, 'add' );
			const disableCssTransitionsSpy = sinon.spy( plugin._form, 'disableCssTransitions' );
			const enableCssTransitionsSpy = sinon.spy( plugin._form, 'enableCssTransitions' );

			button.fire( 'execute' );

			sinon.assert.callOrder( disableCssTransitionsSpy, addSpy, enableCssTransitionsSpy );
		} );
	} );

	describe( 'form status', () => {
		it( 'should update ui on error due to change ballon position', () => {
			const updateSpy = sinon.spy( editor.ui, 'update' );

			plugin._showForm();
			fillFormSize( 'for sure incorrect value' );

			expect( updateSpy ).not.to.be.called;

			plugin._form.fire( 'submit' );

			expect( updateSpy ).to.be.calledOnce;
		} );

		it( 'should show error form status if passed empty size', () => {
			plugin._showForm();
			fillFormSize( '' );
			plugin._form.fire( 'submit' );
			expect( getErrorLabel() ).to.be.equal( 'Column width must not be empty.' );
		} );

		it( 'should show error form status if passed incorrect size', () => {
			plugin._showForm();
			fillFormSize( 'for sure incorrect value' );
			plugin._form.fire( 'submit' );
			expect( getErrorLabel() ).to.be.equal( 'Incorrect column width value.' );
		} );

		it( 'should reset error form status after filling empty size', () => {
			plugin._showForm();

			fillFormSize( 'for sure incorrect value' );
			plugin._form.fire( 'submit' );
			expect( getErrorLabel() ).not.to.be.null;

			fillFormSize( '123456' );
			plugin._form.fire( 'submit' );
			expect( getErrorLabel() ).to.be.null;
		} );

		it( 'should reset form status on show', () => {
			plugin._showForm();
			fillFormSize( 'for sure incorrect value' );
			plugin._form.fire( 'submit' );

			expect( getErrorLabel() ).not.to.be.null;

			plugin._hideForm();
			plugin._showForm();
			expect( getErrorLabel() ).to.be.null;
		} );

		function getErrorLabel() {
			return plugin._form.labeledInput.errorText;
		}

		function fillFormSize( size ) {
			const { fieldView } = plugin._form.labeledInput;

			// jasmine disallow to set non-number value in numeric input
			fieldView.element.type = '';
			fieldView.value = size;
		}
	} );

	describe( 'balloon panel form', () => {
		beforeEach( () => {
			selectColumn();
		} );

		it( 'should implement the CSS transition disabling feature', () => {
			plugin._createForm();
			expect( plugin._form.disableCssTransitions ).to.be.a( 'function' );
		} );

		// https://github.com/ckeditor/ckeditor5-image/issues/114
		it( 'should make sure the input always stays in sync with the value of the command', () => {
			button.fire( 'execute' );

			// Mock the user using the form, changing the value but clicking "Cancel".
			// so the command's value is not updated.
			plugin._form.labeledInput.fieldView.element.value = 'This value was canceled.';
			plugin._form.fire( 'cancel' );

			button.fire( 'execute' );
			expect( plugin._form.labeledInput.fieldView.element.value ).to.equal( '46' );
		} );

		it( 'should not reset input value if #_showForm called on already visible balloon', () => {
			plugin._showForm();

			const resetMethodSpy = sinon.spy( plugin._form.labeledInput.fieldView, 'set' );

			plugin._showForm();
			expect( resetMethodSpy ).not.to.be.called;
		} );

		it( 'should not remove from balloon if form is not there', () => {
			plugin._createForm();
			plugin._hideForm();

			const resetMethodSpy = sinon.spy( plugin._balloon, 'remove' );
			plugin._hideForm();
			expect( resetMethodSpy ).not.to.be.called;
		} );

		it( 'should execute command on submit', () => {
			plugin._showForm();

			const spy = sinon.spy( editor, 'execute' );

			plugin._form.labeledInput.fieldView.value = '123';
			plugin._form.fire( 'submit' );

			sinon.assert.calledWithExactly( spy, 'resizeTableColumn', {
				newColumnWidth: 123
			} );
		} );

		describe( 'blur', () => {
			beforeEach( () => {
				button.fire( 'execute' );
			} );

			// https://github.com/ckeditor/ckeditor5/issues/1501
			it( 'should input element before hiding the view', () => {
				const editableFocusSpy = sinon.spy( editor.editing.view, 'focus' );
				const buttonFocusSpy = sinon.spy( plugin._form.saveButtonView, 'focus' );

				plugin._form.focusTracker.isFocused = true;
				plugin._form.fire( 'submit' );

				expect( buttonFocusSpy.calledBefore( editableFocusSpy ) ).to.equal( true );
			} );

			// https://github.com/ckeditor/ckeditor5-image/issues/299
			it( 'should not blur input element before hiding the view when view was not focused', () => {
				const buttonFocusSpy = sinon.spy( plugin._form.saveButtonView, 'focus' );

				plugin._form.focusTracker.isFocused = false;
				plugin._form.fire( 'cancel' );

				sinon.assert.notCalled( buttonFocusSpy );
			} );

			it( 'should hide the panel on cancel and focus the editing view', () => {
				const focusSpy = sinon.spy( editor.editing.view, 'focus' );

				expect( balloon.visibleView ).to.equal( plugin._form );

				plugin._form.fire( 'cancel' );
				expect( balloon.visibleView ).to.be.null;
				sinon.assert.calledOnce( focusSpy );
			} );
		} );

		describe( 'close listeners', () => {
			let hideSpy, focusSpy;

			beforeEach( () => {
				expect( balloon.visibleView ).to.be.null;
				button.fire( 'execute' );
				expect( balloon.visibleView ).not.to.be.null;

				hideSpy = sinon.spy( plugin, '_hideForm' );
				focusSpy = sinon.spy( editor.editing.view, 'focus' );
			} );

			it( 'should close upon Esc key press and focus the editing view', () => {
				const keyEvtData = {
					keyCode: keyCodes.esc,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				plugin._form.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( hideSpy );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( focusSpy );
			} );

			it( 'should close and not focus editable on click outside the panel', () => {
				document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
				sinon.assert.called( hideSpy );
				sinon.assert.notCalled( focusSpy );
			} );

			it( 'should not close on click inside the panel', () => {
				plugin._form.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
				sinon.assert.notCalled( hideSpy );
			} );
		} );
	} );

	function selectColumn( columnIndex = 1 ) {
		tableSelection.setCellSelection(
			modelRoot.getNodeByPath( [ 0, 0, columnIndex ] ),
			modelRoot.getNodeByPath( [ 0, 1, columnIndex ] )
		);
	}
} );
