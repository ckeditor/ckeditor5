/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Image } from '../../src/image.js';
import { ImageTextAlternativeEditing } from '../../src/imagetextalternative/imagetextalternativeediting.js';
import { ImageTextAlternativeUI } from '../../src/imagetextalternative/imagetextalternativeui.js';
import { ImageCaption } from '../../src/imagecaption.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ButtonView, View } from '@ckeditor/ckeditor5-ui';
import { global, keyCodes } from '@ckeditor/ckeditor5-utils';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

describe( 'ImageTextAlternativeUI', () => {
	let editor, model, doc, plugin, command, form, balloon, editorElement, button;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImageTextAlternativeEditing, ImageTextAlternativeUI, Image, Paragraph, ImageCaption ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				newEditor.editing.view.attachDomRoot( editorElement );
				plugin = editor.plugins.get( ImageTextAlternativeUI );
				command = editor.commands.get( 'imageTextAlternative' );
				balloon = editor.plugins.get( 'ContextualBalloon' );
				button = editor.ui.componentFactory.create( 'imageTextAlternative' );
			} );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( ImageTextAlternativeUI.pluginName ).toBe( 'ImageTextAlternativeUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageTextAlternativeUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageTextAlternativeUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'toolbar button', () => {
		it( 'should be registered in component factory', () => {
			expect( button ).toBeInstanceOf( ButtonView );
		} );

		it( 'should have isEnabled property bind to command\'s isEnabled property', () => {
			command.isEnabled = true;
			expect( button.isEnabled ).toBe( true );

			command.isEnabled = false;
			expect( button.isEnabled ).toBe( false );
		} );

		it( 'should show balloon panel on execute', () => {
			plugin._createForm();
			form = plugin._form;

			expect( balloon.visibleView ).toBeNull();

			_setModelData( model, '[<imageBlock src="" alt="foo bar"></imageBlock>]' );

			button.fire( 'execute' );
			expect( balloon.visibleView ).toBe( form );

			// Make sure successive execute does not throw, e.g. attempting
			// to display the form twice.
			button.fire( 'execute' );
			expect( balloon.visibleView ).toBe( form );
		} );

		it( 'should create and show balloon panel on execute', () => {
			expect( balloon.visibleView ).toBeNull();
			expect( plugin._form ).toBeUndefined();

			_setModelData( model, '[<imageBlock src="" alt="foo bar"></imageBlock>]' );

			button.fire( 'execute' );
			form = plugin._form;

			expect( balloon.visibleView ).toBe( form );

			// Make sure successive execute does not throw, e.g. attempting
			// to display the form twice.
			button.fire( 'execute' );
			expect( balloon.visibleView ).toBe( form );
		} );

		it( 'should set alt attribute value to textarea and select it', () => {
			plugin._createForm();
			form = plugin._form;

			const spy = vi.spyOn( form.labeledInput.fieldView, 'select' );

			_setModelData( model, '[<imageBlock src="" alt="foo bar"></imageBlock>]' );

			button.fire( 'execute' );
			expect( spy ).toHaveBeenCalledOnce();
			expect( form.labeledInput.fieldView.value ).toBe( 'foo bar' );
		} );

		it( 'should set empty text to textarea and select it when there is no alt attribute', () => {
			plugin._createForm();
			form = plugin._form;

			const spy = vi.spyOn( form.labeledInput.fieldView, 'select' );

			_setModelData( model, '[<imageBlock src=""></imageBlock>]' );

			button.fire( 'execute' );
			expect( spy ).toHaveBeenCalledOnce();
			expect( form.labeledInput.fieldView.value ).toBe( '' );
		} );

		it( 'should disable CSS transitions before showing the form to avoid unnecessary animations (and then enable them again)', () => {
			plugin._createForm();
			form = plugin._form;

			const addSpy = vi.spyOn( balloon, 'add' );
			const disableCssTransitionsSpy = vi.spyOn( form, 'disableCssTransitions' );
			const enableCssTransitionsSpy = vi.spyOn( form, 'enableCssTransitions' );
			const selectSpy = vi.spyOn( form.labeledInput.fieldView, 'select' );

			_setModelData( model, '[<imageBlock src="" alt="foo bar"></imageBlock>]' );

			button.fire( 'execute' );

			const callOrder = [
				disableCssTransitionsSpy.mock.invocationCallOrder[ 0 ],
				addSpy.mock.invocationCallOrder[ 0 ],
				selectSpy.mock.invocationCallOrder[ 0 ],
				enableCssTransitionsSpy.mock.invocationCallOrder[ 0 ]
			];

			expect( callOrder[ 0 ] ).toBeLessThan( callOrder[ 1 ] );
			expect( callOrder[ 1 ] ).toBeLessThan( callOrder[ 2 ] );
			expect( callOrder[ 2 ] ).toBeLessThan( callOrder[ 3 ] );
		} );

		it( 'has isOn bound to command\'s value', () => {
			command.value = '';
			expect( button ).toHaveProperty( 'isOn', false );

			command.value = 'alternative text';
			expect( button ).toHaveProperty( 'isOn', true );
		} );
	} );

	describe( 'balloon panel form', () => {
		beforeEach( () => {
			plugin._createForm();
			form = plugin._form;
		} );

		it( 'should implement the CSS transition disabling feature', () => {
			expect( form.disableCssTransitions ).toBeTypeOf( 'function' );
		} );

		// https://github.com/ckeditor/ckeditor5-image/issues/114
		it( 'should make sure the input always stays in sync with the value of the command', () => {
			const button = editor.ui.componentFactory.create( 'imageTextAlternative' );
			// Mock the value of the input after some past editing.
			form.labeledInput.fieldView.value = 'foo';

			// Mock the user using the form, changing the value but clicking "Cancel".
			// so the command's value is not updated.
			form.labeledInput.fieldView.element.value = 'This value was canceled.';

			// Mock the user editing the same image once again.
			_setModelData( model, '[<imageBlock src="" alt="foo"></imageBlock>]' );

			button.fire( 'execute' );
			expect( form.labeledInput.fieldView.element.value ).toBe( 'foo' );
		} );

		it( 'should execute command on submit', () => {
			const spy = vi.spyOn( editor, 'execute' );
			form.fire( 'submit' );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( 'imageTextAlternative', {
				newValue: form.labeledInput.fieldView.element.value
			} );
		} );

		it( 'should hide the panel on cancel and focus the editing view', () => {
			const spy = vi.spyOn( editor.editing.view, 'focus' );

			_setModelData( model, '[<imageBlock src="" alt="foo bar"></imageBlock>]' );

			editor.ui.componentFactory.create( 'imageTextAlternative' ).fire( 'execute' );
			expect( balloon.visibleView ).toBe( form );

			form.fire( 'cancel' );
			expect( balloon.visibleView ).toBeNull();
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should not engage when the form is in the balloon yet invisible', () => {
			_setModelData( model, '[<imageBlock src=""></imageBlock>]' );
			button.fire( 'execute' );
			expect( balloon.visibleView ).toBe( form );

			const lastView = new View();
			lastView.element = document.createElement( 'div' );

			balloon.add( {
				view: lastView,
				position: {
					target: document.body
				}
			} );

			expect( balloon.visibleView ).toBe( lastView );

			button.fire( 'execute' );
			expect( balloon.visibleView ).toBe( lastView );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/1501
		it( 'should blur url input element before hiding the view', () => {
			_setModelData( model, '[<imageBlock src="" alt="foo bar"></imageBlock>]' );

			editor.ui.componentFactory.create( 'imageTextAlternative' ).fire( 'execute' );

			const editableFocusSpy = vi.spyOn( editor.editing.view, 'focus' );
			const buttonFocusSpy = vi.spyOn( form.saveButtonView, 'focus' );

			form.focusTracker.isFocused = true;

			form.fire( 'submit' );

			expect( buttonFocusSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
				editableFocusSpy.mock.invocationCallOrder[ 0 ]
			);
		} );

		// https://github.com/ckeditor/ckeditor5-image/issues/299
		it( 'should not blur url input element before hiding the view when view was not focused', () => {
			_setModelData( model, '[<imageBlock src="" alt="foo bar"></imageBlock>]' );

			editor.ui.componentFactory.create( 'imageTextAlternative' ).fire( 'execute' );

			const buttonFocusSpy = vi.spyOn( form.saveButtonView, 'focus' );

			form.focusTracker.isFocused = false;

			form.fire( 'cancel' );

			expect( buttonFocusSpy ).not.toHaveBeenCalled();
		} );

		it( 'should be removed from balloon when is in not visible stack', () => {
			_setModelData( model, '<paragraph>foo</paragraph>[<imageBlock src="" alt="foo bar"></imageBlock>]' );

			editor.ui.componentFactory.create( 'imageTextAlternative' ).fire( 'execute' );

			const customView = new View();

			balloon.add( {
				view: customView,
				position: { target: {} },
				stackId: 'custom'
			} );

			balloon.showStack( 'custom' );

			model.change( writer => {
				const root = model.document.getRoot();

				writer.setSelection( root.getChild( 0 ), 0 );
			} );

			expect( balloon.hasView( form ) ).toBe( false );
		} );

		describe( 'integration with the editor selection (ui#update event)', () => {
			it( 'should re-position the form', () => {
				_setModelData( model, '[<imageBlock src=""></imageBlock>]' );
				button.fire( 'execute' );

				const spy = vi.spyOn( balloon, 'updatePosition' );

				editor.ui.fire( 'update' );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should hide the form and focus editable when image widget has been removed by external change', () => {
				_setModelData( model, '[<imageBlock src=""></imageBlock>]' );
				button.fire( 'execute' );

				const removeSpy = vi.spyOn( balloon, 'remove' );
				const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

				model.enqueueChange( { isUndoable: false }, writer => {
					writer.remove( doc.selection.getFirstRange() );
				} );

				expect( removeSpy ).toHaveBeenCalledWith( form );
				expect( focusSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should not hide the form when the selection is moved to a block image caption', () => {
				_setModelData( model, '<imageBlock src=""><caption>[]</caption></imageBlock>' );
				button.fire( 'execute' );

				editor.ui.fire( 'update' );

				expect( balloon.visibleView ).toBeInstanceOf( View );
			} );
		} );

		describe( 'close listeners', () => {
			describe( 'keyboard', () => {
				it( 'should close upon Esc key press and focus the editing view', () => {
					const hideSpy = vi.spyOn( plugin, '_hideForm' );
					const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

					_setModelData( model, '[<imageBlock src=""></imageBlock>]' );
					button.fire( 'execute' );

					const keyEvtData = {
						keyCode: keyCodes.esc,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					form.keystrokes.press( keyEvtData );
					expect( hideSpy ).toHaveBeenCalledOnce();
					expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
					expect( focusSpy ).toHaveBeenCalledOnce();
				} );
			} );

			describe( 'mouse', () => {
				it( 'should close and not focus editable on click outside the panel', () => {
					const hideSpy = vi.spyOn( plugin, '_hideForm' );
					const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

					_setModelData( model, '[<imageBlock src=""></imageBlock>]' );
					button.fire( 'execute' );

					global.document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
					expect( hideSpy ).toHaveBeenCalled();
					expect( focusSpy ).not.toHaveBeenCalled();
				} );

				it( 'should not close on click inside the panel', () => {
					const spy = vi.spyOn( plugin, '_hideForm' );

					_setModelData( model, '[<imageBlock src=""></imageBlock>]' );
					button.fire( 'execute' );

					form.element.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
					expect( spy ).not.toHaveBeenCalled();
				} );
			} );
		} );
	} );
} );
