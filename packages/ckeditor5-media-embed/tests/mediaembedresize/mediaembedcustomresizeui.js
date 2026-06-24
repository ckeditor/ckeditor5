/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { MediaEmbedEditing } from '../../src/mediaembedediting.js';
import { MediaEmbedResizeEditing } from '../../src/mediaembedresize/mediaembedresizeediting.js';
import { MediaEmbedResizeButtons } from '../../src/mediaembedresize/mediaembedresizebuttons.js';
import { MediaEmbedCustomResizeUI } from '../../src/mediaembedresize/mediaembedcustomresizeui.js';

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=foo';

describe( 'MediaEmbedCustomResizeUI', () => {
	let element, model, modelRoot, editor, dropdown, button, plugin, balloon;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor
			.create( element, {
				plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedResizeEditing, MediaEmbedCustomResizeUI, MediaEmbedResizeButtons ]
			} );

		model = editor.model;
		modelRoot = model.document.getRoot();

		plugin = editor.plugins.get( MediaEmbedCustomResizeUI );

		balloon = editor.plugins.get( 'ContextualBalloon' );
		dropdown = editor.ui.componentFactory.create( 'resizeMediaEmbed' );
		dropdown.isOpen = true;

		button = dropdown.listView.items
			.map( item => item.children && item.children.first )
			.filter( Boolean )
			.find( item => item.label === 'Custom' );

		_setModelData( model, `[<media resizedWidth="50%" url="${ YOUTUBE_URL }"></media>]` );
	} );

	afterEach( async () => {
		await editor.destroy();
		element.remove();
	} );

	it( 'should be named', () => {
		expect( MediaEmbedCustomResizeUI.pluginName ).toBe( 'MediaEmbedCustomResizeUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedCustomResizeUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbedCustomResizeUI.isPremiumPlugin ).toBe( false );
	} );

	it( 'should require ContextualBalloon', () => {
		const ContextualBalloon = editor.plugins.get( 'ContextualBalloon' ).constructor;

		expect( MediaEmbedCustomResizeUI.requires ).toContain( ContextualBalloon );
	} );

	describe( 'custom button in dropdown', () => {
		it( 'should be present in media resize dropdown', () => {
			expect( button ).not.toBeUndefined();
		} );

		it( 'should open balloon panel on click', () => {
			selectFirstNode();
			expect( balloon.visibleView ).toBeNull();

			button.fire( 'execute' );

			expect( balloon.visibleView ).toBe( plugin._form );
			expect( plugin._isVisible ).toBe( true );
		} );

		it( 'should open with empty value if media was not resized', () => {
			_setModelData( model, `<media url="${ YOUTUBE_URL }"></media>` );
			plugin._createForm( '%' );

			expect( balloon.visibleView ).toBeNull();

			button.fire( 'execute' );

			expect( plugin._form.labeledInput.fieldView.value ).toBe( '' );
		} );

		it( 'should disable CSS transitions before showing the form to avoid unnecessary animations', () => {
			selectFirstNode();
			plugin._createForm( '%' );

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
			plugin._createForm( '%' );
			expect( typeof plugin._form.disableCssTransitions ).toBe( 'function' );
		} );

		it( 'should make sure the input always stays in sync with the command value', () => {
			button.fire( 'execute' );

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

		it( 'should not remove from balloon if form is not there', () => {
			plugin._createForm( '%' );
			plugin._hideForm();

			const removeSpy = vi.spyOn( plugin._balloon, 'remove' );
			plugin._hideForm();
			expect( removeSpy ).not.toHaveBeenCalled();
		} );

		it( 'should execute resizeMediaEmbed command on submit', () => {
			plugin._showForm( '%' );

			const spy = vi.spyOn( editor, 'execute' );

			plugin._form.labeledInput.fieldView.value = '60';
			plugin._form.fire( 'submit' );

			expect( spy ).toHaveBeenCalledExactlyOnceWith( 'resizeMediaEmbed', {
				width: '60%'
			} );
		} );

		describe( 'form validation', () => {
			it( 'should show error when submitted with empty value', () => {
				plugin._showForm( '%' );
				fillFormSize( '' );
				plugin._form.fire( 'submit' );

				expect( plugin._form.labeledInput.errorText ).toBe( 'The value must not be empty.' );
			} );

			it( 'should show error when submitted with non-numeric value', () => {
				plugin._showForm( '%' );
				fillFormSize( 'abc' );
				plugin._form.fire( 'submit' );

				expect( plugin._form.labeledInput.errorText ).toBe( 'The value should be a plain number.' );
			} );

			it( 'should clear error after valid submission', () => {
				plugin._showForm( '%' );
				fillFormSize( 'abc' );
				plugin._form.fire( 'submit' );
				expect( plugin._form.labeledInput.errorText ).not.toBeNull();

				fillFormSize( '50' );
				plugin._form.fire( 'submit' );
				expect( plugin._form.labeledInput.errorText ).toBeNull();
			} );

			it( 'should reset form status on show', () => {
				plugin._showForm( '%' );
				fillFormSize( 'abc' );
				plugin._form.fire( 'submit' );

				expect( plugin._form.labeledInput.errorText ).not.toBeNull();

				plugin._hideForm();
				plugin._showForm( '%' );
				expect( plugin._form.labeledInput.errorText ).toBeNull();
			} );
		} );

		describe( 'blur handling', () => {
			beforeEach( () => {
				button.fire( 'execute' );
			} );

			it( 'should focus save button before hiding the view when form is focused', () => {
				const editableFocusSpy = vi.spyOn( editor.editing.view, 'focus' );
				const buttonFocusSpy = vi.spyOn( plugin._form.saveButtonView, 'focus' );

				plugin._form.focusTracker.isFocused = true;
				plugin._form.fire( 'submit' );

				const editableOrder = editableFocusSpy.mock.invocationCallOrder[ 0 ];
				const buttonOrder = buttonFocusSpy.mock.invocationCallOrder[ 0 ];

				expect( buttonOrder ).toBeLessThan( editableOrder );
			} );

			it( 'should not focus save button if form was not focused on cancel', () => {
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

	describe( 'destroy()', () => {
		it( 'should destroy the form view if it was created', () => {
			plugin._createForm( '%' );

			const destroySpy = vi.spyOn( plugin._form, 'destroy' );

			return editor.destroy().then( () => {
				expect( destroySpy ).toHaveBeenCalledOnce();
				element.remove();
			} );
		} );
	} );

	function moveSelection( startPath, endPath ) {
		model.change( writer => {
			writer.setSelection( model.createRange(
				model.createPositionFromPath( modelRoot, startPath ),
				model.createPositionFromPath( modelRoot, endPath )
			) );
		} );
	}

	function selectFirstNode() {
		moveSelection( [ 0 ], [ 1 ] );
	}

	function fillFormSize( size ) {
		const { fieldView } = plugin._form.labeledInput;

		fieldView.element.type = '';
		fieldView.value = size;
	}
} );
