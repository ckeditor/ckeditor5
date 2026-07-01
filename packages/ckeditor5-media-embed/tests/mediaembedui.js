/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IconMedia } from '@ckeditor/ckeditor5-icons';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { MediaEmbed } from '../src/mediaembed.js';
import { MediaEmbedUI } from '../src/mediaembedui.js';
import { global } from '@ckeditor/ckeditor5-utils';
import { ButtonView, DialogViewPosition, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

describe( 'MediaEmbedUI', () => {
	let editorElement, editor, button;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ MediaEmbed ],
				mediaEmbed: {
					providers: [
						{
							name: 'valid-media',
							url: /^https:\/\/valid\/(.*)/,
							html: id => `<iframe src="${ id }"></iframe>`
						}
					]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				button = editor.ui.componentFactory.create( 'mediaEmbed' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		vi.restoreAllMocks();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( MediaEmbedUI.pluginName ).toBe( 'MediaEmbedUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbedUI.isPremiumPlugin ).toBe( false );
	} );

	it( 'should allow creating two instances', () => {
		let secondInstance;

		expect( function createSecondInstance() {
			secondInstance = editor.ui.componentFactory.create( 'mediaEmbed' );
		} ).not.toThrow();
		expect( button ).not.toBe( secondInstance );
	} );

	describe( 'toolbar button', () => {
		testButton( 'Insert media', ButtonView );

		it( 'should enable tooltips for the #buttonView', () => {
			expect( button.tooltip ).toBe( true );
		} );
	} );

	describe( 'menuBar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:mediaEmbed' );
		} );

		testButton( 'Media', MenuBarMenuListItemButtonView );
	} );

	describe( 'dialog', () => {
		let form, dialog, mediaEmbedCommand;

		beforeEach( () => {
			button.fire( 'execute' );
			dialog = editor.plugins.get( 'Dialog' );
			form = editor.plugins.get( 'MediaEmbedUI' )._formView;
			mediaEmbedCommand = editor.commands.get( 'mediaEmbed' );
		} );

		it( 'has two action buttons', () => {
			expect( dialog.view.actionsView.children ).toHaveLength( 2 );
			expect( dialog.view.actionsView.children.get( 0 ).label ).toBe( 'Cancel' );
			expect( dialog.view.actionsView.children.get( 1 ).label ).toBe( 'Insert' );
		} );

		it( 'should be open as modal', () => {
			expect( dialog.view.isModal ).toBe( true );
		} );

		it( 'should be open at screen center', () => {
			expect( dialog.view.position ).toBe( DialogViewPosition.SCREEN_CENTER );
		} );

		it( 'should have a title', () => {
			const showSpy = vi.spyOn( dialog, 'show' );

			dialog.hide();
			button.fire( 'execute' );

			expect( showSpy ).toHaveBeenCalledWith( expect.objectContaining( { title: 'Media embed' } ) );
		} );

		it( 'should show save button if media is selected', () => {
			dialog.hide();
			mediaEmbedCommand.value = 'http://example.org';
			button.fire( 'execute' );

			expect( dialog.view.actionsView.children.get( 1 ).label ).toBe( 'Save' );
		} );

		it( 'should show insert button if media is selected', () => {
			dialog.hide();
			mediaEmbedCommand.value = undefined;
			button.fire( 'execute' );

			expect( dialog.view.actionsView.children.get( 1 ).label ).toBe( 'Insert' );
		} );

		testSubmit( 'Accept button', () => {
			const acceptButton = dialog.view.actionsView.children.get( 1 );

			acceptButton.fire( 'execute' );
		} );

		testSubmit( 'Form submit (enter key)', () => {
			form.fire( 'submit' );
		} );

		function testSubmit( suiteName, action ) {
			describe( suiteName, () => {
				it( 'checks if the form is valid', () => {
					const spy = vi.spyOn( form, 'isValid' );

					action();

					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( 'executes the command and closes the UI (if the form is valid)', async () => {
					const commandSpy = vi.spyOn( editor.commands.get( 'mediaEmbed' ), 'execute' );

					// The form is invalid.
					form.url = 'https://invalid/url';

					action();

					expect( commandSpy ).not.toHaveBeenCalled();

					expect( dialog.id ).toBe( 'mediaEmbed' );

					// The form is valid.
					form.url = 'https://valid/url';
					action();

					expect( commandSpy ).toHaveBeenCalledOnce();
					expect( commandSpy ).toHaveBeenCalledWith( 'https://valid/url' );

					await wait( 10 );

					expect( dialog.id ).toBeNull();
				} );
			} );
		}

		describe( 'Cancel button', () => {
			let cancelButton;

			beforeEach( () => {
				cancelButton = dialog.view.actionsView.children.get( 0 );
			} );

			it( 'closes the UI', async () => {
				cancelButton.fire( 'execute' );

				await wait( 10 );

				expect( dialog.id ).toBeNull();
			} );
		} );

		describe( 'form', () => {
			it( 'should trim URL input value', () => {
				form.urlInputView.fieldView.element.value = '   ';
				form.urlInputView.fieldView.fire( 'input' );

				expect( form.mediaURLInputValue ).toBe( '' );

				form.urlInputView.fieldView.element.value = '   test   ';
				form.urlInputView.fieldView.fire( 'input' );

				expect( form.mediaURLInputValue ).toBe( 'test' );
			} );

			it( 'should implement the CSS transition disabling feature', () => {
				expect( form.disableCssTransitions ).toBeTypeOf( 'function' );
			} );

			describe( 'validators', () => {
				it( 'check the empty URL', () => {
					form.url = '';
					expect( form.isValid() ).toBe( false );

					form.url = 'https://valid/url';
					expect( form.isValid() ).toBe( true );
				} );

				it( 'check the supported media', () => {
					form.url = 'https://invalid/url';
					expect( form.isValid() ).toBe( false );

					form.url = 'https://valid/url';
					expect( form.isValid() ).toBe( true );
				} );
			} );
		} );
	} );

	function testButton( label, expectedType ) {
		it( 'should add the "mediaEmbed" component to the factory', () => {
			expect( button ).toBeInstanceOf( expectedType );
		} );

		it( 'should bind #isEnabled to the command', () => {
			const command = editor.commands.get( 'mediaEmbed' );

			expect( button.isEnabled ).toBe( true );

			command.isEnabled = false;
			expect( button.isEnabled ).toBe( false );
		} );

		it( 'should set a #label of the #buttonView', () => {
			expect( button.label ).toBe( label );
		} );

		it( 'should set an #icon of the #buttonView', () => {
			expect( button.icon ).toBe( IconMedia );
		} );

		it( 'should open media embed dialog', () => {
			const dialogPlugin = editor.plugins.get( 'Dialog' );
			expect( dialogPlugin.id ).toBeNull();

			button.fire( 'execute' );

			expect( dialogPlugin.id ).toBe( 'mediaEmbed' );
		} );

		it( 'should hide media embed dialog on second click', () => {
			const dialogPlugin = editor.plugins.get( 'Dialog' );
			expect( dialogPlugin.id ).toBeNull();

			button.fire( 'execute' );
			button.fire( 'execute' );

			expect( dialogPlugin.id ).toBeNull();
		} );
	}
} );

function wait( time ) {
	return new Promise( res => {
		global.window.setTimeout( res, time );
	} );
}
