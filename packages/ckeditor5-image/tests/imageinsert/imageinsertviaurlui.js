/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { UIModel, SplitButtonView, ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

import { IconImageUrl } from '@ckeditor/ckeditor5-icons';

import { Image } from '../../src/image.js';
import { ImageInsertViaUrlUI } from '../../src/imageinsert/imageinsertviaurlui.js';
import { ImageInsertViaUrl } from '../../src/index.js';

describe( 'ImageInsertViaUrlUI', () => {
	let editor, editorElement, insertImageUI, button;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	afterEach( async () => {
		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			await editor.destroy();
		}
	} );

	it( 'should have pluginName', () => {
		expect( ImageInsertViaUrlUI.pluginName ).toBe( 'ImageInsertViaUrlUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageInsertViaUrlUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageInsertViaUrlUI.isPremiumPlugin ).toBe( false );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/15869
	it( 'should work if ImageInsertViaUrl plugin is specified before Image', async () => {
		await createEditor( {
			plugins: [ ImageInsertViaUrl, Image ]
		} );

		editor.ui.componentFactory.create( 'insertImage' );
	} );

	describe( 'UI components', () => {
		beforeEach( async () => {
			await createEditor( {
				plugins: [ Image, ImageInsertViaUrl ]
			} );
		} );

		describe( 'toolbar button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'insertImageViaUrl' );
			} );

			testButton( ButtonView, 'Insert image via URL' );

			it( 'should bind button label to ImageInsertUI#isImageSelected', () => {
				expect( button.label ).toBe( 'Insert image via URL' );

				insertImageUI.isImageSelected = true;
				expect( button.label ).toBe( 'Update image URL' );

				insertImageUI.isImageSelected = false;
				expect( button.label ).toBe( 'Insert image via URL' );
			} );

			it( 'should have a tooltip', () => {
				expect( button.tooltip ).toBe( true );
			} );
		} );

		describe( 'menu bar button', () => {
			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'menuBar:insertImageViaUrl' );
			} );

			testButton( MenuBarMenuListItemButtonView, 'Image via URL' );
		} );
	} );

	describe( 'dialog', () => {
		let dialog, urlView, acceptButton, cancelButton;

		function openDialog() {
			button.fire( 'execute' );
			urlView = dialog.view.contentView.children.get( 0 );
			cancelButton = dialog.view.actionsView.children.get( 0 );
			acceptButton = dialog.view.actionsView.children.get( 1 );
		}

		beforeEach( async () => {
			await createEditor( {
				plugins: [ Image, ImageInsertViaUrl ]
			} );

			button = editor.ui.componentFactory.create( 'insertImageViaUrl' );
			dialog = editor.plugins.get( 'Dialog' );
			const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );
			replaceImageSourceCommand.value = 'foobar';

			openDialog();
		} );

		it( 'has two action buttons', () => {
			expect( dialog.view.actionsView.children ).toHaveLength( 2 );
			expect( dialog.view.actionsView.children.get( 0 ).label ).toBe( 'Cancel' );
			expect( dialog.view.actionsView.children.get( 1 ).label ).toBe( 'Insert' );
		} );

		it( 'has submittable form', () => {
			expect( dialog.view.element.querySelector( 'form.ck-image-insert-url' ) ).toBeTruthy();
		} );

		it( 'should bind #isImageSelected', () => {
			expect( urlView.isImageSelected ).toBe( false );

			insertImageUI.isImageSelected = true;
			expect( urlView.isImageSelected ).toBe( true );

			insertImageUI.isImageSelected = false;
			expect( urlView.isImageSelected ).toBe( false );
		} );

		it( 'should have a title', () => {
			const showSpy = vi.spyOn( dialog, 'show' );

			dialog.hide();
			openDialog();

			expect( showSpy ).toHaveBeenCalledWith( expect.objectContaining( { title: 'Image via URL' } ) );
		} );

		it( 'should show save button if image is selected', () => {
			dialog.hide();
			insertImageUI.isImageSelected = true;
			openDialog();

			expect( dialog.view.actionsView.children.get( 1 ).label ).toBe( 'Save' );
		} );

		it( 'should show insert button if image is not selected', () => {
			dialog.hide();
			insertImageUI.isImageSelected = false;
			openDialog();

			expect( dialog.view.actionsView.children.get( 1 ).label ).toBe( 'Insert' );
		} );

		it( 'should bind #isEnabled', () => {
			const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );
			const insertImageCommand = editor.commands.get( 'insertImage' );

			replaceImageSourceCommand.isEnabled = false;
			insertImageCommand.isEnabled = false;
			expect( urlView.isEnabled ).toBe( false );

			replaceImageSourceCommand.isEnabled = true;
			insertImageCommand.isEnabled = false;
			expect( urlView.isEnabled ).toBe( true );

			replaceImageSourceCommand.isEnabled = false;
			insertImageCommand.isEnabled = true;
			expect( urlView.isEnabled ).toBe( true );

			replaceImageSourceCommand.isEnabled = true;
			insertImageCommand.isEnabled = true;
			expect( urlView.isEnabled ).toBe( true );
		} );

		it( 'should set #imageURLInputValue at open', () => {
			expect( urlView.imageURLInputValue ).toBe( 'foobar' );
		} );

		it( 'should reset #imageURLInputValue on dialog reopen', () => {
			const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );

			replaceImageSourceCommand.value = 'abc';
			dialog.hide();
			openDialog();
			expect( urlView.imageURLInputValue ).toBe( 'abc' );

			replaceImageSourceCommand.value = '123';
			dialog.hide();
			openDialog();
			expect( urlView.imageURLInputValue ).toBe( '123' );

			replaceImageSourceCommand.value = undefined;
			dialog.hide();
			openDialog();
			expect( urlView.imageURLInputValue ).toBe( '' );
		} );

		testSubmit( 'accept button', () => acceptButton.fire( 'execute' ) );

		// Browsers handle pressing Enter on forms natively by submitting it. We fire a form submit event to simulate that behavior.
		testSubmit( 'form submit (enter key)', () => {
			const form = dialog.view.contentView.children.get( 0 );

			form.fire( 'submit' );
		} );

		function testSubmit( suiteName, action ) {
			describe( suiteName, () => {
				it( 'should execute replaceImageSource command and close dialog', () => {
					const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );
					const stubExecute = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
					const stubFocus = vi.spyOn( editor.editing.view, 'focus' ).mockImplementation( () => {} );

					replaceImageSourceCommand.isEnabled = true;
					urlView.imageURLInputValue = 'foo';

					action();

					expect( stubExecute ).toHaveBeenCalledOnce();
					expect( stubExecute.mock.calls[ 0 ][ 0 ] ).toBe( 'replaceImageSource' );
					expect( stubExecute.mock.calls[ 0 ][ 1 ] ).toEqual( { source: 'foo' } );
					expect( stubFocus ).toHaveBeenCalledOnce();
					expect( dialog.id ).toBeNull();
				} );

				it( 'should execute insertImage command', () => {
					const replaceImageSourceCommand = editor.commands.get( 'insertImage' );
					const stubExecute = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
					const stubFocus = vi.spyOn( editor.editing.view, 'focus' ).mockImplementation( () => {} );

					replaceImageSourceCommand.isEnabled = true;
					urlView.imageURLInputValue = 'foo';

					action();

					expect( stubExecute ).toHaveBeenCalledOnce();
					expect( stubExecute.mock.calls[ 0 ][ 0 ] ).toBe( 'insertImage' );
					expect( stubExecute.mock.calls[ 0 ][ 1 ] ).toEqual( { source: 'foo' } );
					expect( stubFocus ).toHaveBeenCalledOnce();
					expect( dialog.id ).toBeNull();
				} );
			} );
		}

		it( 'should close dropdown', () => {
			const stubExecute = vi.spyOn( editor, 'execute' ).mockImplementation( () => {} );
			const stubFocus = vi.spyOn( editor.editing.view, 'focus' ).mockImplementation( () => {} );

			cancelButton.fire( 'execute' );

			expect( stubExecute ).not.toHaveBeenCalled();
			expect( stubFocus ).toHaveBeenCalledOnce();
			expect( dialog.id ).toBeNull();
		} );
	} );

	describe( 'ImageInsertUI integration', () => {
		describe( 'single integration', () => {
			beforeEach( async () => {
				await createEditor( {
					plugins: [ Image, ImageInsertViaUrl ]
				} );
			} );

			describe( 'toolbar button', () => {
				beforeEach( () => {
					button = editor.ui.componentFactory.create( 'insertImage' );
				} );

				testButton( ButtonView, 'Insert image via URL' );

				it( 'should bind button label to ImageInsertUI#isImageSelected', () => {
					expect( button.label ).toBe( 'Insert image via URL' );

					insertImageUI.isImageSelected = true;
					expect( button.label ).toBe( 'Update image URL' );

					insertImageUI.isImageSelected = false;
					expect( button.label ).toBe( 'Insert image via URL' );
				} );

				it( 'should have a tooltip', () => {
					expect( button.tooltip ).toBe( true );
				} );
			} );

			describe( 'menu bar button', () => {
				beforeEach( () => {
					const menu = editor.ui.componentFactory.create( 'menuBar:insertImage' );
					const submenuList = menu.panelView.children.get( 0 );

					button = submenuList.items.get( 0 ).children.get( 0 );
				} );

				testButton( MenuBarMenuListItemButtonView, 'Image' );
			} );
		} );

		describe( 'multiple integrations', () => {
			beforeEach( async () => {
				await createEditor( {
					plugins: [ Image, ImageInsertViaUrl ]
				} );

				const observable = new UIModel( { isEnabled: true } );

				insertImageUI.registerIntegration( {
					name: 'foo',
					observable,
					buttonViewCreator() {
						const button = new ButtonView( editor.locale );

						button.label = 'foo';

						return button;
					},
					formViewCreator() {
						const button = new ButtonView( editor.locale );

						button.label = 'bar';

						return button;
					},
					menuBarButtonViewCreator() {
						const button = new ButtonView( editor.locale );

						button.label = 'baz';

						return button;
					}
				} );

				editor.config.set( 'image.insert.integrations', [ 'url', 'foo' ] );
			} );

			describe( 'toolbar button', () => {
				it( 'should create toolbar split button view', () => {
					const dropdown = editor.ui.componentFactory.create( 'insertImage' );

					expect( dropdown.buttonView ).toBeInstanceOf( SplitButtonView );
					expect( dropdown.buttonView.tooltip ).toBe( true );
					expect( dropdown.buttonView.label ).toBe( 'Insert image' );
					expect( dropdown.buttonView.actionView.icon ).toBe( IconImageUrl );
					expect( dropdown.buttonView.actionView.tooltip ).toBe( true );
					expect( dropdown.buttonView.actionView.label ).toBe( 'Insert image via URL' );
				} );

				it( 'should bind button label to ImageInsertUI#isImageSelected', () => {
					const dropdown = editor.ui.componentFactory.create( 'insertImage' );

					expect( dropdown.buttonView.label ).toBe( 'Insert image' );
					expect( dropdown.buttonView.actionView.label ).toBe( 'Insert image via URL' );

					insertImageUI.isImageSelected = true;
					expect( dropdown.buttonView.label ).toBe( 'Replace image' );
					expect( dropdown.buttonView.actionView.label ).toBe( 'Update image URL' );

					insertImageUI.isImageSelected = false;
					expect( dropdown.buttonView.label ).toBe( 'Insert image' );
					expect( dropdown.buttonView.actionView.label ).toBe( 'Insert image via URL' );
				} );
			} );

			describe( 'dropdown button', () => {
				beforeEach( () => {
					const dropdown = editor.ui.componentFactory.create( 'insertImage' );

					dropdown.isOpen = true;

					const formView = dropdown.panelView.children.get( 0 );
					button = formView.children.get( 0 );
				} );

				testButton( ButtonView, 'Insert via URL' );

				it( 'should bind button label to ImageInsertUI#isImageSelected', () => {
					expect( button.label ).toBe( 'Insert via URL' );

					insertImageUI.isImageSelected = true;
					expect( button.label ).toBe( 'Update image URL' );

					insertImageUI.isImageSelected = false;
					expect( button.label ).toBe( 'Insert via URL' );
				} );
			} );

			describe( 'menu button', () => {
				beforeEach( () => {
					const submenu = editor.ui.componentFactory.create( 'menuBar:insertImage' );
					button = submenu.panelView.children.first.items.first.children.first;
				} );

				testButton( MenuBarMenuListItemButtonView, 'Via URL' );
			} );
		} );
	} );

	async function createEditor( config ) {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, config );

		insertImageUI = editor.plugins.get( 'ImageInsertUI' );
	}

	function testButton( expectedType, expectedInsertLabel ) {
		it( 'should add the component to the factory', () => {
			expect( button ).toBeInstanceOf( expectedType );
		} );

		it( 'should set a #label of the #buttonView', () => {
			expect( button.label ).toBe( expectedInsertLabel );
		} );

		it( 'should set an #icon of the #buttonView', () => {
			expect( button.icon ).toBe( IconImageUrl );
		} );

		it( 'should open insert image via url dialog', () => {
			const dialogPlugin = editor.plugins.get( 'Dialog' );
			expect( dialogPlugin.id ).toBeNull();

			button.fire( 'execute' );

			expect( dialogPlugin.id ).toBe( 'insertImageViaUrl' );
		} );

		it( 'should create the dialog form view only once', () => {
			const dialogPlugin = editor.plugins.get( 'Dialog' );
			const showSpy = vi.spyOn( dialogPlugin, 'show' );

			button.fire( 'execute' );
			dialogPlugin.hide();
			button.fire( 'execute' );

			expect( showSpy ).toHaveBeenCalledTimes( 2 );

			const view1 = showSpy.mock.calls[ 0 ][ 0 ].content;
			const view2 = showSpy.mock.calls[ 1 ][ 0 ].content;

			expect( view1 ).toBe( view2 );
		} );
	}
} );
