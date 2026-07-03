/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table } from '@ckeditor/ckeditor5-table';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import { View } from '@ckeditor/ckeditor5-ui';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { ImageCustomResizeUI } from '../../src/imageresize/imagecustomresizeui.js';
import { ImageResizeButtons } from '../../src/imageresize/imageresizebuttons.js';
import { Image } from '../../src/image.js';
import { ImageStyle } from '../../src/imagestyle.js';

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

		_setModelData( model, `[<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedWidth="50%"></imageBlock>]` );
	} );

	afterEach( async () => {
		await editor.destroy();
		element.remove();
	} );

	it( 'should be named', () => {
		expect( ImageCustomResizeUI.pluginName ).toBe( 'ImageCustomResizeUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageCustomResizeUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageCustomResizeUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'dropdown button', () => {
		it( 'should be present in image resize dropdown', () => {
			expect( button ).not.toBeUndefined();
		} );

		it( 'should be enabled when there are not any images', () => {
			_setModelData( model, '' );

			expect( button.isEnabled ).toBe( false );
		} );

		it( 'should have isEnabled property bind to command\'s isEnabled property', () => {
			command.isEnabled = true;
			expect( button.isEnabled ).toBe( true );

			command.isEnabled = false;
			expect( button.isEnabled ).toBe( false );
		} );

		it( 'should be enabled if selected image', () => {
			selectFirstNode();
			expect( button.isEnabled ).toBe( true );
		} );

		it( 'should open balloon panel on click', () => {
			selectFirstNode();
			expect( balloon.visibleView ).toBeNull();

			button.fire( 'execute' );

			expect( balloon.visibleView ).toBe( plugin._form );
			expect( plugin._isVisible ).toBe( true );
		} );

		it( 'should open with empty value if image was not resized', () => {
			_setModelData( model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }"></imageBlock>` );
			plugin._createForm();

			expect( balloon.visibleView ).toBeNull();

			button.fire( 'execute' );

			expect( plugin._form.labeledInput.fieldView.value ).toBe( '' );
		} );

		it( 'should open with image resize value', () => {
			selectFirstNode();
			plugin._createForm();

			expect( balloon.visibleView ).toBeNull();

			button.fire( 'execute' );
			expect( plugin._form.labeledInput.fieldView.value ).toBe( '50.0' );
		} );

		it( 'should disable CSS transitions before showing the form to avoid unnecessary animations (and then enable them again)', () => {
			selectFirstNode();
			plugin._createForm();

			const addSpy = vi.spyOn( balloon, 'add' );
			const disableCssTransitionsSpy = vi.spyOn( plugin._form, 'disableCssTransitions' );
			const enableCssTransitionsSpy = vi.spyOn( plugin._form, 'enableCssTransitions' );

			button.fire( 'execute' );

			const addOrder = addSpy.mock.invocationCallOrder[ 0 ];
			const disableOrder = disableCssTransitionsSpy.mock.invocationCallOrder[ 0 ];
			const enableOrder = enableCssTransitionsSpy.mock.invocationCallOrder[ 0 ];

			expect( disableOrder ).toBeLessThan( addOrder );
			expect( addOrder ).toBeLessThan( enableOrder );
		} );
	} );

	describe( 'balloon panel form', () => {
		beforeEach( () => {
			selectFirstNode();
		} );

		it( 'should implement the CSS transition disabling feature', () => {
			plugin._createForm();
			expect( typeof plugin._form.disableCssTransitions ).toBe( 'function' );
		} );

		// https://github.com/ckeditor/ckeditor5-image/issues/114
		it( 'should make sure the input always stays in sync with the value of the command', () => {
			button.fire( 'execute' );

			// Mock the user using the form, changing the value but clicking "Cancel".
			// so the command's value is not updated.
			plugin._form.labeledInput.fieldView.element.value = 'This value was canceled.';
			plugin._form.fire( 'cancel' );

			button.fire( 'execute' );
			expect( plugin._form.labeledInput.fieldView.element.value ).toBe( '50.0' );
		} );

		it( 'should not reset input value if #_showForm called on already visible balloon', () => {
			plugin._showForm( '%' );

			const resetMethodSpy = vi.spyOn( plugin._form.labeledInput.fieldView, 'set' );

			plugin._showForm( '%' );
			expect( resetMethodSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not add the form to the balloon if it is already there', () => {
			plugin._showForm( '%' );

			balloon.add( {
				stackId: 'custom',
				view: new View(),
				position: {
					target: editor.ui.view.editable.element
				}
			} );

			balloon.showStack( 'custom' );

			const addSpy = vi.spyOn( balloon, 'add' );

			plugin._showForm( '%' );

			expect( addSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not remove from balloon if form is not there', () => {
			plugin._createForm();
			plugin._hideForm();

			const resetMethodSpy = vi.spyOn( plugin._balloon, 'remove' );
			plugin._hideForm();
			expect( resetMethodSpy ).not.toHaveBeenCalled();
		} );

		it( 'should execute command on submit', () => {
			plugin._showForm( '%' );

			const spy = vi.spyOn( editor, 'execute' );

			plugin._form.labeledInput.fieldView.value = '123';
			plugin._form.fire( 'submit' );

			expect( spy ).toHaveBeenCalledExactlyOnceWith( 'resizeImage', {
				width: '123%'
			} );
		} );

		describe( 'form status', () => {
			it( 'should show error form status if passed empty size', () => {
				plugin._showForm();
				fillFormSize( '' );
				plugin._form.fire( 'submit' );
				expect( getErrorLabel() ).toBe( 'The value must not be empty.' );
			} );

			it( 'should show error form status if passed incorrect size', () => {
				plugin._showForm();
				fillFormSize( 'for sure incorrect value' );
				plugin._form.fire( 'submit' );
				expect( getErrorLabel() ).toBe( 'The value should be a plain number.' );
			} );

			it( 'should reset error form status after filling empty link', () => {
				plugin._showForm();

				fillFormSize( 'for sure incorrect value' );
				plugin._form.fire( 'submit' );
				expect( getErrorLabel() ).not.toBeNull();

				fillFormSize( '123456' );
				plugin._form.fire( 'submit' );
				expect( getErrorLabel() ).toBeNull();
			} );

			it( 'should reset form status on show', () => {
				plugin._showForm();
				fillFormSize( 'for sure incorrect value' );
				plugin._form.fire( 'submit' );

				expect( getErrorLabel() ).not.toBeNull();

				plugin._hideForm();
				plugin._showForm();
				expect( getErrorLabel() ).toBeNull();
			} );

			it( 'should update ui on error due to change ballon position', () => {
				const updateSpy = vi.spyOn( editor.ui, 'update' );

				plugin._showForm();
				fillFormSize( 'for sure incorrect value' );

				expect( updateSpy ).not.toHaveBeenCalled();

				plugin._form.fire( 'submit' );

				expect( updateSpy ).toHaveBeenCalledOnce();
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
				const editableFocusSpy = vi.spyOn( editor.editing.view, 'focus' );
				const buttonFocusSpy = vi.spyOn( plugin._form.saveButtonView, 'focus' );

				plugin._form.focusTracker.isFocused = true;
				plugin._form.fire( 'submit' );

				const buttonOrder = buttonFocusSpy.mock.invocationCallOrder[ 0 ];
				const editableOrder = editableFocusSpy.mock.invocationCallOrder[ 0 ];

				expect( buttonOrder ).toBeLessThan( editableOrder );
			} );

			// https://github.com/ckeditor/ckeditor5-image/issues/299
			it( 'should not blur input element before hiding the view when view was not focused', () => {
				const buttonFocusSpy = vi.spyOn( plugin._form.saveButtonView, 'focus' );

				plugin._form.focusTracker.isFocused = false;
				plugin._form.fire( 'cancel' );

				expect( buttonFocusSpy ).not.toHaveBeenCalled();
			} );

			it( 'should hide the panel on cancel and focus the editing view', () => {
				const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

				expect( balloon.visibleView ).toBe( plugin._form );

				plugin._form.fire( 'cancel' );
				expect( balloon.visibleView ).toBeNull();
				expect( focusSpy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'close listeners', () => {
			let hideSpy, focusSpy;

			beforeEach( () => {
				expect( balloon.visibleView ).toBeNull();
				button.fire( 'execute' );
				expect( balloon.visibleView ).not.toBeNull();

				hideSpy = vi.spyOn( plugin, '_hideForm' );
				focusSpy = vi.spyOn( editor.editing.view, 'focus' );
			} );

			it( 'should close upon Esc key press and focus the editing view', () => {
				const keyEvtData = {
					keyCode: keyCodes.esc,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				plugin._form.keystrokes.press( keyEvtData );
				expect( hideSpy ).toHaveBeenCalledOnce();
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( focusSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should close and not focus editable on click outside the panel', () => {
				document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
				expect( hideSpy ).toHaveBeenCalled();
				expect( focusSpy ).not.toHaveBeenCalled();
			} );

			it( 'should not close on click inside the panel', () => {
				plugin._form.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
				expect( hideSpy ).not.toHaveBeenCalled();
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
