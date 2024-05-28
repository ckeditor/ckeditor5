/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Model from '@ckeditor/ckeditor5-ui/src/model.js';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview.js';

import { icons } from '@ckeditor/ckeditor5-core';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';

import Image from '../../src/image.js';
import ImageInsertFormView from '../../src/imageinsert/ui/imageinsertformview.js';
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

	// https://github.com/ckeditor/ckeditor5/issues/15869
	it( 'should work if ImageInsertViaUrl plugin is specified before Image', async () => {
		await createEditor( {
			plugins: [ ImageInsertViaUrl, Image ]
		} );

		editor.ui.componentFactory.create( 'insertImage' );
	} );

	describe( 'single integration', () => {
		beforeEach( async () => {
			await createEditor( {
				plugins: [ Image, ImageInsertViaUrl ]
			} );
		} );

		describe( 'toolbar button', () => {
			beforeEach( () => {
				const imageInsertButton = editor.ui.componentFactory.create( 'insertImage' );
				button = imageInsertButton;
			} );

			testButton( ButtonView, 'Insert image via URL' );

			it( 'should bind button label to ImageInsertUI#isImageSelected', () => {
				const buttonView = editor.ui.componentFactory.create( 'insertImage' );

				expect( buttonView.label ).to.equal( 'Insert image via URL' );

				insertImageUI.isImageSelected = true;
				expect( buttonView.label ).to.equal( 'Update image URL' );

				insertImageUI.isImageSelected = false;
				expect( buttonView.label ).to.equal( 'Insert image via URL' );
			} );

			it( 'should have a tooltip', () => {
				const buttonView = editor.ui.componentFactory.create( 'insertImage' );

				expect( buttonView.tooltip ).to.be.true;
			} );
		} );

		describe( 'menuBar button', () => {
			beforeEach( () => {
				const submenu = editor.ui.componentFactory.create( 'menuBar:insertImage' );
				button = submenu;
			} );

			testButton( MenuBarMenuListItemButtonView, 'Insert via URL' );
		} );

		function testButton( expectedType, expectedInsertLabel ) {
			it( 'should add the component to the factory', () => {
				expect( button ).to.be.instanceOf( expectedType );
			} );

			it( 'should set a #label of the #buttonView', () => {
				expect( button.label ).to.equal( expectedInsertLabel );
			} );

			it( 'should set an #icon of the #buttonView', () => {
				expect( button.icon ).to.equal( icons.imageUrl );
			} );

			it( 'should open media embed dialog', () => {
				const dialogPlugin = editor.plugins.get( 'Dialog' );
				expect( dialogPlugin.id ).to.be.null;

				button.fire( 'execute' );

				expect( dialogPlugin.id ).to.equal( 'insertUrl' );
			} );
		}

		describe( 'dialog', () => {
			let dialog, urlView, acceptButton, cancelButton;

			function openDialog() {
				button.fire( 'execute' );
				urlView = dialog.view.contentView.children.get( 0 );
				cancelButton = dialog.view.actionsView.children.get( 0 );
				acceptButton = dialog.view.actionsView.children.get( 1 );
			}

			beforeEach( () => {
				button = editor.ui.componentFactory.create( 'insertImageViaUrl' );
				dialog = editor.plugins.get( 'Dialog' );
				const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );
				replaceImageSourceCommand.value = 'foobar';

				openDialog();
			} );

			it( 'has two action buttons', () => {
				expect( dialog.view.actionsView.children ).to.have.length( 2 );
				expect( dialog.view.actionsView.children.get( 0 ).label ).to.equal( 'Cancel' );
				expect( dialog.view.actionsView.children.get( 1 ).label ).to.equal( 'Accept' );
			} );

			it( 'should bind #isImageSelected', () => {
				expect( urlView.isImageSelected ).to.be.false;

				insertImageUI.isImageSelected = true;
				expect( urlView.isImageSelected ).to.be.true;

				insertImageUI.isImageSelected = false;
				expect( urlView.isImageSelected ).to.be.false;
			} );

			it( 'should change title if image is selected', () => {
				expect( dialog.view.headerView.label ).to.equal( 'Insert image via URL' );

				dialog.hide();
				insertImageUI.isImageSelected = true;
				openDialog();

				expect( dialog.view.headerView.label ).to.equal( 'Update image URL' );
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

			it( 'should execute replaceImageSource command and close dialog', () => {
				const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );
				const stubExecute = sinon.stub( editor, 'execute' );
				const stubFocus = sinon.stub( editor.editing.view, 'focus' );

				replaceImageSourceCommand.isEnabled = true;
				urlView.imageURLInputValue = 'foo';

				acceptButton.fire( 'execute' );

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

				acceptButton.fire( 'execute' );

				expect( stubExecute.calledOnce ).to.be.true;
				expect( stubExecute.firstCall.args[ 0 ] ).to.equal( 'insertImage' );
				expect( stubExecute.firstCall.args[ 1 ] ).to.deep.equal( { source: 'foo' } );
				expect( stubFocus.calledOnce ).to.be.true;
				expect( dialog.id ).to.be.null;
			} );

			it( 'should close dropdown', () => {
				const stubExecute = sinon.stub( editor, 'execute' );
				const stubFocus = sinon.stub( editor.editing.view, 'focus' );

				cancelButton.fire( 'execute' );

				expect( stubExecute.notCalled ).to.be.true;
				expect( stubFocus.calledOnce ).to.be.true;
				expect( dialog.id ).to.be.null;
			} );
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
				}
			} );

			editor.config.set( 'image.insert.integrations', [ 'url', 'foo' ] );
		} );

		it( 'should create toolbar dropdown button', () => {
			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			expect( dropdown.buttonView ).to.be.instanceOf( SplitButtonView );
			expect( dropdown.buttonView.tooltip ).to.be.true;
			expect( dropdown.buttonView.label ).to.equal( 'Insert image' );
			expect( dropdown.buttonView.actionView.icon ).to.equal( icons.imageUrl );
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

		it( 'should create form view on first open of dropdown', () => {
			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			expect( dropdown.panelView.children.length ).to.equal( 0 );

			dropdown.isOpen = true;
			expect( dropdown.panelView.children.length ).to.equal( 1 );

			const formView = dropdown.panelView.children.get( 0 );
			expect( formView ).to.be.instanceOf( ImageInsertFormView );
			expect( formView.children.length ).to.equal( 2 );

			const buttonView = formView.children.get( 0 );
			expect( buttonView ).to.be.instanceOf( ButtonView );
		} );
	} );

	async function createEditor( config ) {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, config );

		insertImageUI = editor.plugins.get( 'ImageInsertUI' );
	}
} );
