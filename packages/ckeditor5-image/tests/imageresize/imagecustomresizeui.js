/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import ImageCustomResizeUI from '../../src/imageresize/imagecustomresizeui.js';
import ImageResizeButtons from '../../src/imageresize/imageresizebuttons.js';
import Image from '../../src/image.js';
import ImageStyle from '../../src/imagestyle.js';

import { IMAGE_SRC_FIXTURE } from './_utils/utils.js';

describe( 'ImageCustomResizeUI', () => {
	let element, model, modelRoot, editor, dropdown, button, command, plugin, balloon;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor
			.create( element, {
				plugins: [ Image, ImageStyle, Paragraph, ImageCustomResizeUI, ImageResizeButtons, Table ]
			} );

		model = editor.model;
		modelRoot = model.document.getRoot();

		plugin = editor.plugins.get( ImageCustomResizeUI );
		command = editor.commands.get( 'resizeImage' );

		balloon = editor.plugins.get( 'ContextualBalloon' );
		dropdown = editor.ui.componentFactory.create( 'imageResize' );
		dropdown.isOpen = true;

		button = dropdown.listView.items
			.map( item => item.children && item.children.first )
			.filter( Boolean )
			.find( item => item.label === 'Custom' );

		setModelData( model, `[<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedWidth="50%"></imageBlock>]` );
	} );

	afterEach( async () => {
		await editor.destroy();
		element.remove();
	} );

	it( 'should be named', () => {
		expect( ImageCustomResizeUI.pluginName ).to.equal( 'ImageCustomResizeUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageCustomResizeUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageCustomResizeUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'dropdown button', () => {
		it( 'should be present in image resize dropdown', () => {
			expect( button ).not.to.be.undefined;
		} );

		it( 'should be enabled when there are not any images', () => {
			setModelData( model, '' );

			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should have isEnabled property bind to command\'s isEnabled property', () => {
			command.isEnabled = true;
			expect( button.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should be enabled if selected image', () => {
			selectFirstNode();
			expect( button.isEnabled ).to.be.true;
		} );

		it( 'should open balloon panel on click', () => {
			selectFirstNode();
			expect( balloon.visibleView ).to.be.null;

			button.fire( 'execute' );

			expect( balloon.visibleView ).to.equal( plugin._form );
			expect( plugin._isVisible ).to.be.true;
		} );

		it( 'should open with empty value if image was not resized', () => {
			setModelData( model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }"></imageBlock>` );
			plugin._createForm();

			expect( balloon.visibleView ).to.be.null;

			button.fire( 'execute' );

			expect( plugin._form.labeledInput.fieldView.value ).equals( '' );
		} );

		it( 'should open with image resize value', () => {
			selectFirstNode();
			plugin._createForm();

			expect( balloon.visibleView ).to.be.null;

			button.fire( 'execute' );
			expect( plugin._form.labeledInput.fieldView.value ).equals( '50.0' );
		} );

		it( 'should disable CSS transitions before showing the form to avoid unnecessary animations (and then enable them again)', () => {
			selectFirstNode();
			plugin._createForm();

			const addSpy = sinon.spy( balloon, 'add' );
			const disableCssTransitionsSpy = sinon.spy( plugin._form, 'disableCssTransitions' );
			const enableCssTransitionsSpy = sinon.spy( plugin._form, 'enableCssTransitions' );

			button.fire( 'execute' );

			sinon.assert.callOrder( disableCssTransitionsSpy, addSpy, enableCssTransitionsSpy );
		} );
	} );

	describe( 'balloon panel form', () => {
		beforeEach( () => {
			selectFirstNode();
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
			expect( plugin._form.labeledInput.fieldView.element.value ).to.equal( '50.0' );
		} );

		it( 'should not reset input value if #_showForm called on already visible balloon', () => {
			plugin._showForm( '%' );

			const resetMethodSpy = sinon.spy( plugin._form.labeledInput.fieldView, 'set' );

			plugin._showForm( '%' );
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
			plugin._showForm( '%' );

			const spy = sinon.spy( editor, 'execute' );

			plugin._form.labeledInput.fieldView.value = '123';
			plugin._form.fire( 'submit' );

			sinon.assert.calledWithExactly( spy, 'resizeImage', {
				width: '123%'
			} );
		} );

		describe( 'form status', () => {
			it( 'should show error form status if passed empty size', () => {
				plugin._showForm();
				fillFormSize( '' );
				plugin._form.fire( 'submit' );
				expect( getErrorLabel() ).to.be.equal( 'The value must not be empty.' );
			} );

			it( 'should show error form status if passed incorrect size', () => {
				plugin._showForm();
				fillFormSize( 'for sure incorrect value' );
				plugin._form.fire( 'submit' );
				expect( getErrorLabel() ).to.be.equal( 'The value should be a plain number.' );
			} );

			it( 'should reset error form status after filling empty link', () => {
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

			it( 'should update ui on error due to change ballon position', () => {
				const updateSpy = sinon.spy( editor.ui, 'update' );

				plugin._showForm();
				fillFormSize( 'for sure incorrect value' );

				expect( updateSpy ).not.to.be.called;

				plugin._form.fire( 'submit' );

				expect( updateSpy ).to.be.calledOnce;
			} );

			function getErrorLabel() {
				return plugin._form.labeledInput.errorText;
			}

			function fillFormSize( size ) {
				const { fieldView } = plugin._form.labeledInput;

				// karma disallow to set non-number value in numeric input
				fieldView.element.type = '';
				fieldView.value = size;
			}
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

	function moveSelection( startPath, endPath ) {
		model.change( writer => {
			writer.setSelection( createRange( modelRoot, startPath, modelRoot, endPath ) );
		} );
	}

	function createRange( startElement, startPath, endElement, endPath ) {
		return model.createRange(
			model.createPositionFromPath( startElement, startPath ),
			model.createPositionFromPath( endElement, endPath )
		);
	}

	function selectFirstNode() {
		moveSelection( [ 0 ], [ 1 ] );
	}
} );
