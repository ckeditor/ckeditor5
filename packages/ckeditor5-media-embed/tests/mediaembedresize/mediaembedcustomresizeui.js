/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { MediaEmbedEditing } from '../../src/mediaembedediting.js';
import { MediaEmbedResizeEditing } from '../../src/mediaembedresize/mediaembedresizeediting.js';
import { MediaEmbedResizeButtons } from '../../src/mediaembedresize/mediaembedresizebuttons.js';
import { MediaEmbedCustomResizeUI } from '../../src/mediaembedresize/mediaembedcustomresizeui.js';

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=foo';

describe( 'MediaEmbedCustomResizeUI', () => {
	let element, model, modelRoot, editor, dropdown, button, plugin, balloon;

	testUtils.createSinonSandbox();

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
		expect( MediaEmbedCustomResizeUI.pluginName ).to.equal( 'MediaEmbedCustomResizeUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedCustomResizeUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbedCustomResizeUI.isPremiumPlugin ).to.be.false;
	} );

	it( 'should require ContextualBalloon', () => {
		const ContextualBalloon = editor.plugins.get( 'ContextualBalloon' ).constructor;

		expect( MediaEmbedCustomResizeUI.requires ).to.include( ContextualBalloon );
	} );

	describe( 'custom button in dropdown', () => {
		it( 'should be present in media resize dropdown', () => {
			expect( button ).not.to.be.undefined;
		} );

		it( 'should open balloon panel on click', () => {
			selectFirstNode();
			expect( balloon.visibleView ).to.be.null;

			button.fire( 'execute' );

			expect( balloon.visibleView ).to.equal( plugin._form );
			expect( plugin._isVisible ).to.be.true;
		} );

		it( 'should open with empty value if media was not resized', () => {
			_setModelData( model, `<media url="${ YOUTUBE_URL }"></media>` );
			plugin._createForm( '%' );

			expect( balloon.visibleView ).to.be.null;

			button.fire( 'execute' );

			expect( plugin._form.labeledInput.fieldView.value ).to.equal( '' );
		} );

		it( 'should disable CSS transitions before showing the form to avoid unnecessary animations', () => {
			selectFirstNode();
			plugin._createForm( '%' );

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
			plugin._createForm( '%' );
			expect( plugin._form.disableCssTransitions ).to.be.a( 'function' );
		} );

		it( 'should make sure the input always stays in sync with the command value', () => {
			button.fire( 'execute' );

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
			plugin._createForm( '%' );
			plugin._hideForm();

			const removeSpy = sinon.spy( plugin._balloon, 'remove' );
			plugin._hideForm();
			expect( removeSpy ).not.to.be.called;
		} );

		it( 'should execute resizeMediaEmbed command on submit', () => {
			plugin._showForm( '%' );

			const spy = sinon.spy( editor, 'execute' );

			plugin._form.labeledInput.fieldView.value = '60';
			plugin._form.fire( 'submit' );

			sinon.assert.calledWithExactly( spy, 'resizeMediaEmbed', {
				width: '60%'
			} );
		} );

		describe( 'form validation', () => {
			it( 'should show error when submitted with empty value', () => {
				plugin._showForm( '%' );
				fillFormSize( '' );
				plugin._form.fire( 'submit' );

				expect( plugin._form.labeledInput.errorText ).to.equal( 'The value must not be empty.' );
			} );

			it( 'should show error when submitted with non-numeric value', () => {
				plugin._showForm( '%' );
				fillFormSize( 'abc' );
				plugin._form.fire( 'submit' );

				expect( plugin._form.labeledInput.errorText ).to.equal( 'The value should be a plain number.' );
			} );

			it( 'should clear error after valid submission', () => {
				plugin._showForm( '%' );
				fillFormSize( 'abc' );
				plugin._form.fire( 'submit' );
				expect( plugin._form.labeledInput.errorText ).to.not.be.null;

				fillFormSize( '50' );
				plugin._form.fire( 'submit' );
				expect( plugin._form.labeledInput.errorText ).to.be.null;
			} );

			it( 'should reset form status on show', () => {
				plugin._showForm( '%' );
				fillFormSize( 'abc' );
				plugin._form.fire( 'submit' );

				expect( plugin._form.labeledInput.errorText ).to.not.be.null;

				plugin._hideForm();
				plugin._showForm( '%' );
				expect( plugin._form.labeledInput.errorText ).to.be.null;
			} );
		} );

		describe( 'blur handling', () => {
			beforeEach( () => {
				button.fire( 'execute' );
			} );

			it( 'should focus save button before hiding the view when form is focused', () => {
				const editableFocusSpy = sinon.spy( editor.editing.view, 'focus' );
				const buttonFocusSpy = sinon.spy( plugin._form.saveButtonView, 'focus' );

				plugin._form.focusTracker.isFocused = true;
				plugin._form.fire( 'submit' );

				expect( buttonFocusSpy.calledBefore( editableFocusSpy ) ).to.equal( true );
			} );

			it( 'should not focus save button if form was not focused on cancel', () => {
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

	describe( 'destroy()', () => {
		it( 'should destroy the form view if it was created', () => {
			plugin._createForm( '%' );

			const destroySpy = sinon.spy( plugin._form, 'destroy' );

			return editor.destroy().then( () => {
				sinon.assert.calledOnce( destroySpy );
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
