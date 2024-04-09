/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Model from '@ckeditor/ckeditor5-ui/src/model.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview.js';

import { CollapsibleView, DropdownButtonView } from '@ckeditor/ckeditor5-ui';
import { icons } from '@ckeditor/ckeditor5-core';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import Image from '../../src/image.js';
import ImageInsertFormView from '../../src/imageinsert/ui/imageinsertformview.js';
import ImageInsertViaUrlUI from '../../src/imageinsert/imageinsertviaurlui.js';
import { ImageInsertViaUrl } from '../../src/index.js';
import ImageInsertUrlView from '../../src/imageinsert/ui/imageinserturlview.js';

describe( 'ImageInsertViaUrlUI', () => {
	let editor, editorElement, insertImageUI;

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

		it( 'should create toolbar dropdown button', () => {
			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			expect( dropdown.buttonView ).to.be.instanceOf( DropdownButtonView );
			expect( dropdown.buttonView.icon ).to.equal( icons.imageUrl );
			expect( dropdown.buttonView.tooltip ).to.be.true;
			expect( dropdown.buttonView.label ).to.equal( 'Insert image via URL' );
		} );

		it( 'should bind button label to ImageInsertUI#isImageSelected', () => {
			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			expect( dropdown.buttonView.label ).to.equal( 'Insert image via URL' );

			insertImageUI.isImageSelected = true;
			expect( dropdown.buttonView.label ).to.equal( 'Update image URL' );

			insertImageUI.isImageSelected = false;
			expect( dropdown.buttonView.label ).to.equal( 'Insert image via URL' );
		} );

		it( 'should create form view on first open of dropdown', () => {
			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			expect( dropdown.panelView.children.length ).to.equal( 0 );

			dropdown.isOpen = true;
			expect( dropdown.panelView.children.length ).to.equal( 1 );

			const formView = dropdown.panelView.children.get( 0 );
			expect( formView ).to.be.instanceOf( ImageInsertFormView );
			expect( formView.children.length ).to.equal( 1 );
			expect( formView.children.get( 0 ) ).to.be.instanceOf( ImageInsertUrlView );
		} );

		describe( 'form bindings', () => {
			let dropdown, formView, urlView;

			beforeEach( () => {
				dropdown = editor.ui.componentFactory.create( 'insertImage' );
				dropdown.isOpen = true;
				formView = dropdown.panelView.children.get( 0 );
				urlView = formView.children.get( 0 );
			} );

			it( 'should bind #isImageSelected', () => {
				expect( urlView.isImageSelected ).to.be.false;

				insertImageUI.isImageSelected = true;
				expect( urlView.isImageSelected ).to.be.true;

				insertImageUI.isImageSelected = false;
				expect( urlView.isImageSelected ).to.be.false;
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

			it( 'should set #imageURLInputValue at first open', () => {
				const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );

				replaceImageSourceCommand.value = 'foobar';

				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				dropdown.isOpen = true;

				const formView = dropdown.panelView.children.get( 0 );
				const urlView = formView.children.get( 0 );

				expect( urlView.imageURLInputValue ).to.equal( 'foobar' );
			} );

			it( 'should reset #imageURLInputValue on dropdown reopen', () => {
				const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );

				replaceImageSourceCommand.value = 'abc';
				dropdown.isOpen = false;
				dropdown.isOpen = true;
				expect( urlView.imageURLInputValue ).to.equal( 'abc' );

				replaceImageSourceCommand.value = '123';
				dropdown.isOpen = false;
				dropdown.isOpen = true;
				expect( urlView.imageURLInputValue ).to.equal( '123' );

				replaceImageSourceCommand.value = undefined;
				dropdown.isOpen = false;
				dropdown.isOpen = true;
				expect( urlView.imageURLInputValue ).to.equal( '' );
			} );

			it( 'should execute replaceImageSource command and close dropdown', () => {
				const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );
				const stubExecute = sinon.stub( editor, 'execute' );
				const stubFocus = sinon.stub( editor.editing.view, 'focus' );

				replaceImageSourceCommand.isEnabled = true;
				urlView.imageURLInputValue = 'foo';

				urlView.fire( 'submit' );

				expect( stubExecute.calledOnce ).to.be.true;
				expect( stubExecute.firstCall.args[ 0 ] ).to.equal( 'replaceImageSource' );
				expect( stubExecute.firstCall.args[ 1 ] ).to.deep.equal( { source: 'foo' } );
				expect( stubFocus.calledOnce ).to.be.true;
				expect( dropdown.isOpen ).to.be.false;
			} );

			it( 'should execute insertImage command', () => {
				const replaceImageSourceCommand = editor.commands.get( 'insertImage' );
				const stubExecute = sinon.stub( editor, 'execute' );
				const stubFocus = sinon.stub( editor.editing.view, 'focus' );

				replaceImageSourceCommand.isEnabled = true;
				urlView.imageURLInputValue = 'foo';

				urlView.fire( 'submit' );

				expect( stubExecute.calledOnce ).to.be.true;
				expect( stubExecute.firstCall.args[ 0 ] ).to.equal( 'insertImage' );
				expect( stubExecute.firstCall.args[ 1 ] ).to.deep.equal( { source: 'foo' } );
				expect( stubFocus.calledOnce ).to.be.true;
				expect( dropdown.isOpen ).to.be.false;
			} );

			it( 'should close dropdown', () => {
				const stubExecute = sinon.stub( editor, 'execute' );
				const stubFocus = sinon.stub( editor.editing.view, 'focus' );

				urlView.fire( 'cancel' );

				expect( stubExecute.notCalled ).to.be.true;
				expect( stubFocus.calledOnce ).to.be.true;
				expect( dropdown.isOpen ).to.be.false;
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

			const collapsibleView = formView.children.get( 0 );
			expect( collapsibleView ).to.be.instanceOf( CollapsibleView );
			expect( collapsibleView.children.get( 0 ) ).to.be.instanceOf( ImageInsertUrlView );
		} );

		describe( 'form bindings', () => {
			let dropdown, formView, collapsibleView, urlView;

			beforeEach( () => {
				dropdown = editor.ui.componentFactory.create( 'insertImage' );
				dropdown.isOpen = true;
				formView = dropdown.panelView.children.get( 0 );
				collapsibleView = formView.children.get( 0 );
				urlView = collapsibleView.children.get( 0 );
			} );

			it( 'should bind #isImageSelected', () => {
				expect( urlView.isImageSelected ).to.be.false;

				insertImageUI.isImageSelected = true;
				expect( urlView.isImageSelected ).to.be.true;
				expect( collapsibleView.label ).to.equal( 'Update image URL' );

				insertImageUI.isImageSelected = false;
				expect( urlView.isImageSelected ).to.be.false;
				expect( collapsibleView.label ).to.equal( 'Insert image via URL' );
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

			it( 'should set #imageURLInputValue and CollapsibleView#isCollapsed at first open', () => {
				const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );

				replaceImageSourceCommand.value = 'foobar';

				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				dropdown.isOpen = true;

				const formView = dropdown.panelView.children.get( 0 );
				const collapsibleView = formView.children.get( 0 );
				const urlView = collapsibleView.children.get( 0 );

				expect( urlView.imageURLInputValue ).to.equal( 'foobar' );
				expect( collapsibleView.isCollapsed ).to.be.true;
			} );

			it( 'should reset #imageURLInputValue and CollapsibleView#isCollapsed on dropdown reopen', () => {
				const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );

				replaceImageSourceCommand.value = 'abc';
				dropdown.isOpen = false;
				dropdown.isOpen = true;
				expect( urlView.imageURLInputValue ).to.equal( 'abc' );
				expect( collapsibleView.isCollapsed ).to.be.true;

				replaceImageSourceCommand.value = '123';
				dropdown.isOpen = false;
				dropdown.isOpen = true;
				expect( urlView.imageURLInputValue ).to.equal( '123' );
				expect( collapsibleView.isCollapsed ).to.be.true;

				replaceImageSourceCommand.value = undefined;
				dropdown.isOpen = false;
				dropdown.isOpen = true;
				expect( urlView.imageURLInputValue ).to.equal( '' );
				expect( collapsibleView.isCollapsed ).to.be.true;
			} );

			it( 'should execute replaceImageSource command and close dropdown', () => {
				const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );
				const stubExecute = sinon.stub( editor, 'execute' );
				const stubFocus = sinon.stub( editor.editing.view, 'focus' );

				replaceImageSourceCommand.isEnabled = true;
				urlView.imageURLInputValue = 'foo';

				urlView.fire( 'submit' );

				expect( stubExecute.calledOnce ).to.be.true;
				expect( stubExecute.firstCall.args[ 0 ] ).to.equal( 'replaceImageSource' );
				expect( stubExecute.firstCall.args[ 1 ] ).to.deep.equal( { source: 'foo' } );
				expect( stubFocus.calledOnce ).to.be.true;
				expect( dropdown.isOpen ).to.be.false;
			} );

			it( 'should execute insertImage command', () => {
				const replaceImageSourceCommand = editor.commands.get( 'insertImage' );
				const stubExecute = sinon.stub( editor, 'execute' );
				const stubFocus = sinon.stub( editor.editing.view, 'focus' );

				replaceImageSourceCommand.isEnabled = true;
				urlView.imageURLInputValue = 'foo';

				urlView.fire( 'submit' );

				expect( stubExecute.calledOnce ).to.be.true;
				expect( stubExecute.firstCall.args[ 0 ] ).to.equal( 'insertImage' );
				expect( stubExecute.firstCall.args[ 1 ] ).to.deep.equal( { source: 'foo' } );
				expect( stubFocus.calledOnce ).to.be.true;
				expect( dropdown.isOpen ).to.be.false;
			} );

			it( 'should close dropdown', () => {
				const stubExecute = sinon.stub( editor, 'execute' );
				const stubFocus = sinon.stub( editor.editing.view, 'focus' );

				urlView.fire( 'cancel' );

				expect( stubExecute.notCalled ).to.be.true;
				expect( stubFocus.calledOnce ).to.be.true;
				expect( dropdown.isOpen ).to.be.false;
			} );
		} );
	} );

	async function createEditor( config ) {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, config );

		insertImageUI = editor.plugins.get( 'ImageInsertUI' );
	}
} );
