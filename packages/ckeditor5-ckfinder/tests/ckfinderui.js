/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter.js';
import { IconImageAssetManager, IconBrowseFiles } from 'ckeditor5/src/icons.js';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import MenuBarMenuListItemButtonView from '@ckeditor/ckeditor5-ui/src/menubar/menubarmenulistitembuttonview.js';

import CKFinder from '../src/ckfinder.js';
import Model from '@ckeditor/ckeditor5-ui/src/model.js';
import CKFinderUI from '../src/ckfinderui.js';

describe( 'CKFinderUI', () => {
	let editorElement, editor, button;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ CKFinderUploadAdapter, Image, Link, CKFinder ]

			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKFinderUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKFinderUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'ckfinder' );
		} );

		testButton( 'Insert image or file' );

		it( 'should enable tooltips for the #buttonView', () => {
			expect( button.tooltip ).to.be.true;
		} );

		it( 'should add the "ckfinder" component to the factory', () => {
			expect( button ).to.be.instanceOf( ButtonView );
		} );
	} );

	describe( 'menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:ckfinder' );
		} );

		testButton( 'File' );

		it( 'should add the "ckfinder" component to the factory', () => {
			expect( button ).to.be.instanceOf( MenuBarMenuListItemButtonView );
		} );
	} );

	describe( 'InsertImageUI integration', () => {
		it( 'should create CKFinder button in split button dropdown button', () => {
			mockAnotherIntegration();

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );
			const dropdownButton = dropdown.buttonView.actionView;

			expect( dropdownButton ).to.be.instanceOf( ButtonView );
			expect( dropdownButton.withText ).to.be.false;
			expect( dropdownButton.icon ).to.equal( IconImageAssetManager );
			expect( dropdownButton.label ).to.equal( 'Insert image with file manager' );
		} );

		it( 'should create CKFinder button in dropdown panel', () => {
			mockAnotherIntegration();

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			dropdown.isOpen = true;

			const formView = dropdown.panelView.children.get( 0 );
			const buttonView = formView.children.get( 0 );

			expect( buttonView ).to.be.instanceOf( ButtonView );
			expect( buttonView.withText ).to.be.true;
			expect( buttonView.icon ).to.equal( IconImageAssetManager );
			expect( buttonView.label ).to.equal( 'Insert with file manager' );
		} );

		it( 'should create CKFinder button in menu bar', () => {
			mockAnotherIntegration();

			const submenu = editor.ui.componentFactory.create( 'menuBar:insertImage' );
			const buttonView = submenu.panelView.children.first.items.first.children.first;

			expect( buttonView ).to.be.instanceOf( MenuBarMenuListItemButtonView );
			expect( buttonView.withText ).to.be.true;
			expect( buttonView.icon ).to.equal( IconImageAssetManager );
			expect( buttonView.label ).to.equal( 'With file manager' );
		} );

		it( 'should create CKFinder button in menu bar - only integration', () => {
			const submenu = editor.ui.componentFactory.create( 'menuBar:insertImage' );
			const buttonView = submenu.panelView.children.first.items.first.children.first;

			expect( buttonView ).to.be.instanceOf( MenuBarMenuListItemButtonView );
			expect( buttonView.withText ).to.be.true;
			expect( buttonView.icon ).to.equal( IconImageAssetManager );
			expect( buttonView.label ).to.equal( 'Image' );
		} );

		it( 'should bind to #isImageSelected', () => {
			const insertImageUI = editor.plugins.get( 'ImageInsertUI' );

			mockAnotherIntegration();

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			dropdown.isOpen = true;

			const dropdownButton = dropdown.buttonView.actionView;
			const formView = dropdown.panelView.children.get( 0 );
			const buttonView = formView.children.get( 0 );

			insertImageUI.isImageSelected = false;
			expect( dropdownButton.label ).to.equal( 'Insert image with file manager' );
			expect( buttonView.label ).to.equal( 'Insert with file manager' );

			insertImageUI.isImageSelected = true;
			expect( dropdownButton.label ).to.equal( 'Replace image with file manager' );
			expect( buttonView.label ).to.equal( 'Replace with file manager' );
		} );

		it( 'should close dropdown on execute', () => {
			mockAnotherIntegration();

			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			dropdown.isOpen = true;

			const formView = dropdown.panelView.children.get( 0 );
			const buttonView = formView.children.get( 0 );

			sinon.stub( editor, 'execute' );

			buttonView.fire( 'execute' );

			expect( dropdown.isOpen ).to.be.false;
		} );
	} );

	function testButton( label ) {
		it( 'should bind #isEnabled to the command', () => {
			const command = editor.commands.get( 'ckfinder' );

			command.isEnabled = true;
			expect( button.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should set a #label of the #buttonView', () => {
			expect( button.label ).to.equal( label );
		} );

		it( 'should set an #icon of the #buttonView', () => {
			expect( button.icon ).to.equal( IconBrowseFiles );
		} );

		it( 'should execute bold command on model execute event', () => {
			window.CKFinder = {
				modal: () => {}
			};

			const executeStub = testUtils.sinon.spy( editor, 'execute' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( executeStub );
		} );
	}

	function mockAnotherIntegration() {
		const insertImageUI = editor.plugins.get( 'ImageInsertUI' );
		const observable = new Model( { isEnabled: true } );

		insertImageUI.registerIntegration( {
			name: 'url',
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

				button.label = 'bar';

				return button;
			}
		} );
	}
} );
