/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Model from '@ckeditor/ckeditor5-ui/src/model.js';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview.js';

import { IconImageUrl } from '@ckeditor/ckeditor5-icons';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

import Image from '../../src/image.js';
import ImageInsertViaUrlUI from '../../src/imageinsert/imageinsertviaurlui.js';
import { ImageInsertViaUrl } from '../../src/index.js';

describe( 'ImageInsertViaUrlUI', () => {
	let editor, editorElement, insertImageUI, button;

	testUtils.createSinonSandbox();

	afterEach( async () => {
		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			await editor.destroy();
		}
	} );

	it( 'should have pluginName', () => {
		expect( ImageInsertViaUrlUI.pluginName ).to.equal( 'ImageInsertViaUrlUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageInsertViaUrlUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageInsertViaUrlUI.isPremiumPlugin ).to.be.false;
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
				expect( button.label ).to.equal( 'Insert image via URL' );

				insertImageUI.isImageSelected = true;
				expect( button.label ).to.equal( 'Update image URL' );

				insertImageUI.isImageSelected = false;
				expect( button.label ).to.equal( 'Insert image via URL' );
			} );

			it( 'should have a tooltip', () => {
				expect( button.tooltip ).to.be.true;
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
			expect( dialog.view.actionsView.children ).to.have.length( 2 );
			expect( dialog.view.actionsView.children.get( 0 ).label ).to.equal( 'Cancel' );
			expect( dialog.view.actionsView.children.get( 1 ).label ).to.equal( 'Insert' );
		} );

		it( 'has submittable form', () => {
			expect( dialog.view.element.querySelector( 'form.ck-image-insert-url' ) ).to.exist;
		} );

		it( 'should bind #isImageSelected', () => {
			expect( urlView.isImageSelected ).to.be.false;

			insertImageUI.isImageSelected = true;
			expect( urlView.isImageSelected ).to.be.true;

			insertImageUI.isImageSelected = false;
			expect( urlView.isImageSelected ).to.be.false;
		} );

		it( 'should have a title', () => {
			const sinonSpy = sinon.spy( dialog, 'show' );

			dialog.hide();
			openDialog();

			expect( sinonSpy ).to.have.been.calledWithMatch( { title: 'Image via URL' } );
		} );

		it( 'should show save button if image is selected', () => {
			dialog.hide();
			insertImageUI.isImageSelected = true;
			openDialog();

			expect( dialog.view.actionsView.children.get( 1 ).label ).to.equal( 'Save' );
		} );

		it( 'should show insert button if image is not selected', () => {
			dialog.hide();
			insertImageUI.isImageSelected = false;
			openDialog();

			expect( dialog.view.actionsView.children.get( 1 ).label ).to.equal( 'Insert' );
		} );

		it( 'should bind #isEnabled', () => {
			const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );
			const insertImageCommand = editor.commands.get( 'insertImage' );

			replaceImageSourceCommand.isEnabled = false;
			insertImageCommand.isEnabled = false;
			expect( urlView.isEnabled ).to.be.false;

			replaceImageSourceCommand.isEnabled = true;
			insertImageCommand.isEnabled = false;
			expect( urlView.isEnabled ).to.be.true;

			replaceImageSourceCommand.isEnabled = false;
			insertImageCommand.isEnabled = true;
			expect( urlView.isEnabled ).to.be.true;

			replaceImageSourceCommand.isEnabled = true;
			insertImageCommand.isEnabled = true;
			expect( urlView.isEnabled ).to.be.true;
		} );

		it( 'should set #imageURLInputValue at open', () => {
			expect( urlView.imageURLInputValue ).to.equal( 'foobar' );
		} );

		it( 'should reset #imageURLInputValue on dialog reopen', () => {
			const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );

			replaceImageSourceCommand.value = 'abc';
			dialog.hide();
			openDialog();
			expect( urlView.imageURLInputValue ).to.equal( 'abc' );

			replaceImageSourceCommand.value = '123';
			dialog.hide();
			openDialog();
			expect( urlView.imageURLInputValue ).to.equal( '123' );

			replaceImageSourceCommand.value = undefined;
			dialog.hide();
			openDialog();
			expect( urlView.imageURLInputValue ).to.equal( '' );
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
					const stubExecute = sinon.stub( editor, 'execute' );
					const stubFocus = sinon.stub( editor.editing.view, 'focus' );

					replaceImageSourceCommand.isEnabled = true;
					urlView.imageURLInputValue = 'foo';

					action();

					expect( stubExecute.calledOnce ).to.be.true;
					expect( stubExecute.firstCall.args[ 0 ] ).to.equal( 'replaceImageSource' );
					expect( stubExecute.firstCall.args[ 1 ] ).to.deep.equal( { source: 'foo' } );
					expect( stubFocus.calledOnce ).to.be.true;
					expect( dialog.id ).to.be.null;
				} );

				it( 'should execute insertImage command', () => {
					const replaceImageSourceCommand = editor.commands.get( 'insertImage' );
					const stubExecute = sinon.stub( editor, 'execute' );
					const stubFocus = sinon.stub( editor.editing.view, 'focus' );

					replaceImageSourceCommand.isEnabled = true;
					urlView.imageURLInputValue = 'foo';

					action();

					expect( stubExecute.calledOnce ).to.be.true;
					expect( stubExecute.firstCall.args[ 0 ] ).to.equal( 'insertImage' );
					expect( stubExecute.firstCall.args[ 1 ] ).to.deep.equal( { source: 'foo' } );
					expect( stubFocus.calledOnce ).to.be.true;
					expect( dialog.id ).to.be.null;
				} );
			} );
		}

		it( 'should close dropdown', () => {
			const stubExecute = sinon.stub( editor, 'execute' );
			const stubFocus = sinon.stub( editor.editing.view, 'focus' );

			cancelButton.fire( 'execute' );

			expect( stubExecute.notCalled ).to.be.true;
			expect( stubFocus.calledOnce ).to.be.true;
			expect( dialog.id ).to.be.null;
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
					expect( button.label ).to.equal( 'Insert image via URL' );

					insertImageUI.isImageSelected = true;
					expect( button.label ).to.equal( 'Update image URL' );

					insertImageUI.isImageSelected = false;
					expect( button.label ).to.equal( 'Insert image via URL' );
				} );

				it( 'should have a tooltip', () => {
					expect( button.tooltip ).to.be.true;
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

				const observable = new Model( { isEnabled: true } );

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

					expect( dropdown.buttonView ).to.be.instanceOf( SplitButtonView );
					expect( dropdown.buttonView.tooltip ).to.be.true;
					expect( dropdown.buttonView.label ).to.equal( 'Insert image' );
					expect( dropdown.buttonView.actionView.icon ).to.equal( IconImageUrl );
					expect( dropdown.buttonView.actionView.tooltip ).to.be.true;
					expect( dropdown.buttonView.actionView.label ).to.equal( 'Insert image via URL' );
				} );

				it( 'should bind button label to ImageInsertUI#isImageSelected', () => {
					const dropdown = editor.ui.componentFactory.create( 'insertImage' );

					expect( dropdown.buttonView.label ).to.equal( 'Insert image' );
					expect( dropdown.buttonView.actionView.label ).to.equal( 'Insert image via URL' );

					insertImageUI.isImageSelected = true;
					expect( dropdown.buttonView.label ).to.equal( 'Replace image' );
					expect( dropdown.buttonView.actionView.label ).to.equal( 'Update image URL' );

					insertImageUI.isImageSelected = false;
					expect( dropdown.buttonView.label ).to.equal( 'Insert image' );
					expect( dropdown.buttonView.actionView.label ).to.equal( 'Insert image via URL' );
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
					expect( button.label ).to.equal( 'Insert via URL' );

					insertImageUI.isImageSelected = true;
					expect( button.label ).to.equal( 'Update image URL' );

					insertImageUI.isImageSelected = false;
					expect( button.label ).to.equal( 'Insert via URL' );
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
			expect( button ).to.be.instanceOf( expectedType );
		} );

		it( 'should set a #label of the #buttonView', () => {
			expect( button.label ).to.equal( expectedInsertLabel );
		} );

		it( 'should set an #icon of the #buttonView', () => {
			expect( button.icon ).to.equal( IconImageUrl );
		} );

		it( 'should open insert image via url dialog', () => {
			const dialogPlugin = editor.plugins.get( 'Dialog' );
			expect( dialogPlugin.id ).to.be.null;

			button.fire( 'execute' );

			expect( dialogPlugin.id ).to.equal( 'insertImageViaUrl' );
		} );

		it( 'should create the dialog form view only once', () => {
			const dialogPlugin = editor.plugins.get( 'Dialog' );
			sinon.spy( dialogPlugin, 'show' );

			button.fire( 'execute' );
			dialogPlugin.hide();
			button.fire( 'execute' );

			expect( dialogPlugin.show.calledTwice );

			const view1 = dialogPlugin.show.getCall( 0 ).args[ 0 ].content;
			const view2 = dialogPlugin.show.getCall( 1 ).args[ 0 ].content;

			expect( view1 ).to.equal( view2 );
		} );
	}
} );
