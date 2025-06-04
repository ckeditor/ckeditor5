/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Model from '@ckeditor/ckeditor5-ui/src/model.js';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview.js';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import Image from '../../src/image.js';
import ImageInsertUI from '../../src/imageinsert/imageinsertui.js';
import ImageInsertFormView from '../../src/imageinsert/ui/imageinsertformview.js';
import { MenuBarMenuListItemButtonView, MenuBarMenuView } from '@ckeditor/ckeditor5-ui';

describe( 'ImageInsertUI', () => {
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
		expect( ImageInsertUI.pluginName ).to.equal( 'ImageInsertUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageInsertUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageInsertUI.isPremiumPlugin ).to.be.false;
	} );

	describe( '#constructor()', () => {
		beforeEach( async () => {
			await createEditor( { plugins: [ ImageInsertUI ] } );
		} );

		it( 'should define config', () => {
			expect( editor.config.get( 'image.insert.integrations' ) ).to.deep.equal( [
				'upload',
				'assetManager',
				'url'
			] );
		} );
	} );

	describe( '#init()', () => {
		beforeEach( async () => {
			await createEditor( { plugins: [ ImageInsertUI ] } );
		} );

		it( 'should register component in component factory', () => {
			expect( editor.ui.componentFactory.has( 'insertImage' ) ).to.be.true;
			expect( editor.ui.componentFactory.has( 'imageInsert' ) ).to.be.true;
			expect( editor.ui.componentFactory.has( 'menuBar:insertImage' ) ).to.be.true;
		} );

		it( 'should register "imageInsert" dropdown as an alias for the "insertImage" dropdown', () => {
			const dropdownCreator = editor.ui.componentFactory._components.get( 'insertImage'.toLowerCase() );
			const dropdownAliasCreator = editor.ui.componentFactory._components.get( 'imageInsert'.toLowerCase() );

			expect( dropdownCreator.callback ).to.equal( dropdownAliasCreator.callback );
		} );
	} );

	describe( '#isImageSelected', () => {
		beforeEach( async () => {
			await createEditor( {
				plugins: [ ImageInsertUI, Essentials, Paragraph, Image ]
			} );
		} );

		it( 'should be false if image is not selected', () => {
			setData( editor.model,
				'<paragraph>[foo]</paragraph>' +
				'<imageBlock></imageBlock>'
			);

			expect( insertImageUI.isImageSelected ).to.be.false;

			editor.model.change( writer => {
				writer.setSelection( editor.model.document.getRoot().getChild( 0 ), 'end' );
			} );

			expect( insertImageUI.isImageSelected ).to.be.false;
		} );

		it( 'should be true if block image is selected', () => {
			setData( editor.model,
				'<paragraph>foo</paragraph>' +
				'[<imageBlock></imageBlock>]'
			);

			expect( insertImageUI.isImageSelected ).to.be.true;
		} );

		it( 'should change on selection change', () => {
			setData( editor.model,
				'<paragraph>foo[]</paragraph>' +
				'<imageBlock></imageBlock>'
			);

			expect( insertImageUI.isImageSelected ).to.be.false;

			editor.model.change( writer => {
				writer.setSelection( editor.model.document.getRoot().getChild( 1 ), 'on' );
			} );

			expect( insertImageUI.isImageSelected ).to.be.true;

			editor.model.change( writer => {
				writer.setSelection( editor.model.document.getRoot().getChild( 0 ), 'end' );
			} );

			expect( insertImageUI.isImageSelected ).to.be.false;
		} );
	} );

	describe( '#registerIntegration()', () => {
		beforeEach( async () => {
			await createEditor( { plugins: [ ImageInsertUI ] } );
		} );

		it( 'should store the integration definition', () => {
			const observable = new Model( { isEnabled: true } );
			const buttonViewCreator = () => {};
			const formViewCreator = () => {};
			const menuBarButtonViewCreator = () => {};

			insertImageUI.registerIntegration( {
				name: 'foobar',
				observable,
				buttonViewCreator,
				formViewCreator,
				menuBarButtonViewCreator
			} );

			expect( insertImageUI._integrations.has( 'foobar' ) ).to.be.true;

			const integrationData = insertImageUI._integrations.get( 'foobar' );

			expect( integrationData.observable ).to.equal( observable );
			expect( integrationData.buttonViewCreator ).to.equal( buttonViewCreator );
			expect( integrationData.formViewCreator ).to.equal( formViewCreator );
			expect( integrationData.menuBarButtonViewCreator ).to.equal( menuBarButtonViewCreator );
			expect( integrationData.requiresForm ).to.be.false;
		} );

		it( 'should store the integration definition (with optional data)', () => {
			const observable = new Model( { isEnabled: true } );
			const buttonViewCreator = () => {};
			const formViewCreator = () => {};
			const menuBarButtonViewCreator = () => {};

			insertImageUI.registerIntegration( {
				name: 'foobar',
				observable,
				buttonViewCreator,
				formViewCreator,
				menuBarButtonViewCreator,
				requiresForm: true
			} );

			expect( insertImageUI._integrations.has( 'foobar' ) ).to.be.true;

			const integrationData = insertImageUI._integrations.get( 'foobar' );

			expect( integrationData.observable ).to.equal( observable );
			expect( integrationData.buttonViewCreator ).to.equal( buttonViewCreator );
			expect( integrationData.formViewCreator ).to.equal( formViewCreator );
			expect( integrationData.menuBarButtonViewCreator ).to.equal( menuBarButtonViewCreator );
			expect( integrationData.requiresForm ).to.be.true;
		} );

		it( 'should warn if multiple integrations with the same name are registered', () => {
			const observable = new Model( { isEnabled: true } );
			const buttonViewCreator = () => {};
			const formViewCreator = () => {};
			const menuBarButtonViewCreator = () => {};
			const warnStub = sinon.stub( console, 'warn' );

			insertImageUI.registerIntegration( {
				name: 'foobar',
				observable,
				buttonViewCreator,
				formViewCreator,
				menuBarButtonViewCreator,
				requiresForm: true
			} );

			expect( warnStub.notCalled ).to.be.true;

			insertImageUI.registerIntegration( {
				name: 'foobar',
				observable,
				buttonViewCreator,
				formViewCreator,
				menuBarButtonViewCreator,
				requiresForm: true
			} );

			expect( warnStub.calledOnce ).to.be.true;
			expect( warnStub.firstCall.args[ 0 ] ).to.equal( 'image-insert-integration-exists' );
		} );
	} );

	describe( 'integrations', () => {
		let observableUpload, observableUrl;

		beforeEach( async () => {
			await createEditor( { plugins: [ Image, Essentials, Paragraph ] } );
		} );

		it( 'should warn if empty list of integrations is configured', () => {
			editor.config.set( 'image.insert.integrations', [] );

			const warnStub = sinon.stub( console, 'warn' );
			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			expect( dropdown ).to.be.null;
			expect( warnStub.calledOnce ).to.be.true;
			expect( warnStub.firstCall.args[ 0 ] ).to.equal( 'image-insert-integrations-not-specified' );

			const menuComponent = editor.ui.componentFactory.create( 'menuBar:insertImage' );

			expect( menuComponent ).to.be.null;
			expect( warnStub.calledTwice ).to.be.true;
			expect( warnStub.secondCall.args[ 0 ] ).to.equal( 'image-insert-integrations-not-specified' );
		} );

		it( 'should warn if unknown integration is requested by config', () => {
			editor.config.set( 'image.insert.integrations', [ 'foo' ] );

			const warnStub = sinon.stub( console, 'warn' );
			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			expect( dropdown ).to.be.null;
			expect( warnStub.calledTwice ).to.be.true;
			expect( warnStub.firstCall.args[ 0 ] ).to.equal( 'image-insert-unknown-integration' );
			expect( warnStub.firstCall.args[ 1 ].item ).to.equal( 'foo' );
			expect( warnStub.secondCall.args[ 0 ] ).to.equal( 'image-insert-integrations-not-registered' );
		} );

		it( 'should not warn if known but not registered integration is requested by config', () => {
			editor.config.set( 'image.insert.integrations', [ 'url', 'assetManager', 'upload' ] );

			const warnStub = sinon.stub( console, 'warn' );
			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			expect( dropdown ).to.be.null;
			expect( warnStub.calledOnce ).to.be.true;
			expect( warnStub.firstCall.args[ 0 ] ).to.equal( 'image-insert-integrations-not-registered' );
		} );

		describe( 'single integration without form view required', () => {
			beforeEach( async () => {
				registerUploadIntegration();
			} );

			it( 'should create a toolbar button', () => {
				const button = editor.ui.componentFactory.create( 'insertImage' );

				expect( button ).to.be.instanceOf( ButtonView );
				expect( button.label ).to.equal( 'button upload single' );
			} );
		} );

		describe( 'single integration with form view required', () => {
			beforeEach( async () => {
				registerUrlIntegration();
			} );

			it( 'should create a toolbar dropdown', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				expect( dropdown ).to.be.instanceOf( DropdownView );
				expect( dropdown.buttonView.label ).to.equal( 'button url single' );
				expect( dropdown.isEnabled ).to.be.true;
			} );

			it( 'should bind isEnabled state to observable', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				observableUrl.isEnabled = false;
				expect( dropdown.isEnabled ).to.be.false;

				observableUrl.isEnabled = true;
				expect( dropdown.isEnabled ).to.be.true;
			} );

			it( 'should create panel view on dropdown first open', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				expect( dropdown.panelView.children.length ).to.equal( 0 );

				dropdown.isOpen = true;
				expect( dropdown.panelView.children.length ).to.equal( 1 );

				const formView = dropdown.panelView.children.get( 0 );
				expect( formView ).to.be.instanceOf( ImageInsertFormView );
				expect( formView.children.get( 0 ) ).to.be.instanceOf( ButtonView );
				expect( formView.children.get( 0 ).label ).to.equal( 'dropdown url single' );
			} );

			it( 'should create a menu bar button', () => {
				const menu = editor.ui.componentFactory.create( 'menuBar:insertImage' );

				expect( menu ).to.be.instanceOf( MenuBarMenuView );

				const submenuList = menu.panelView.children.get( 0 );
				const button = submenuList.items.get( 0 ).children.get( 0 );

				expect( button ).to.be.instanceOf( MenuBarMenuListItemButtonView );
				expect( button.label ).to.equal( 'button url' );
				expect( button.isEnabled ).to.be.true;
			} );
		} );

		describe( 'single integration with form view required and observalbe as a function', () => {
			beforeEach( async () => {
				registerUrlIntegration( true );
			} );

			it( 'should bind isEnabled state to observable', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				observableUrl.isEnabled = false;
				expect( dropdown.isEnabled ).to.be.false;

				observableUrl.isEnabled = true;
				expect( dropdown.isEnabled ).to.be.true;
			} );
		} );

		describe( 'multiple integrations', () => {
			beforeEach( async () => {
				registerUploadIntegration();
				registerUrlIntegration();
			} );

			it( 'should create a toolbar split button dropdown', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				expect( dropdown ).to.be.instanceOf( DropdownView );
				expect( dropdown.buttonView ).to.be.instanceOf( SplitButtonView );
				expect( dropdown.buttonView.label ).to.equal( 'Insert image' );
				expect( dropdown.buttonView.tooltip ).to.be.true;
				expect( dropdown.buttonView.actionView.label ).to.equal( 'button upload multiple' );
				expect( dropdown.isEnabled ).to.be.true;
			} );

			it( 'should bind split button label to #isImageSelected', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				expect( insertImageUI.isImageSelected ).to.be.false;
				expect( dropdown.buttonView.label ).to.equal( 'Insert image' );

				insertImageUI.isImageSelected = true;
				expect( dropdown.buttonView.label ).to.equal( 'Replace image' );

				insertImageUI.isImageSelected = false;
				expect( dropdown.buttonView.label ).to.equal( 'Insert image' );
			} );

			it( 'should bind isEnabled state to observables', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				observableUrl.isEnabled = false;
				observableUpload.isEnabled = false;
				expect( dropdown.isEnabled ).to.be.false;

				observableUrl.isEnabled = true;
				observableUpload.isEnabled = false;
				expect( dropdown.isEnabled ).to.be.true;

				observableUrl.isEnabled = false;
				observableUpload.isEnabled = true;
				expect( dropdown.isEnabled ).to.be.true;

				observableUrl.isEnabled = true;
				observableUpload.isEnabled = true;
				expect( dropdown.isEnabled ).to.be.true;
			} );

			it( 'should create panel view on dropdown first open', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				expect( dropdown.panelView.children.length ).to.equal( 0 );

				dropdown.isOpen = true;
				expect( dropdown.panelView.children.length ).to.equal( 1 );

				const formView = dropdown.panelView.children.get( 0 );
				expect( formView ).to.be.instanceOf( ImageInsertFormView );

				expect( formView.children.length ).to.equal( 2 );
				expect( formView.children.get( 0 ) ).to.be.instanceOf( ButtonView );
				expect( formView.children.get( 0 ).label ).to.equal( 'dropdown upload multiple' );
				expect( formView.children.get( 1 ) ).to.be.instanceOf( ButtonView );
				expect( formView.children.get( 1 ).label ).to.equal( 'dropdown url multiple' );
			} );

			it( 'should create a menu bar sub menu', () => {
				const menu = editor.ui.componentFactory.create( 'menuBar:insertImage' );

				expect( menu ).to.be.instanceOf( MenuBarMenuView );

				const submenuList = menu.panelView.children.get( 0 );

				expect( submenuList.items.get( 0 ).children.get( 0 ).label ).to.equal( 'button upload' );
				expect( submenuList.items.get( 1 ).children.get( 0 ).label ).to.equal( 'button url' );
			} );
		} );

		describe( 'multiple integrations and observalbe as a function', () => {
			beforeEach( async () => {
				registerUploadIntegration( true );
				registerUrlIntegration( true );
			} );

			it( 'should bind isEnabled state to observables', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				observableUrl.isEnabled = false;
				observableUpload.isEnabled = false;
				expect( dropdown.isEnabled ).to.be.false;

				observableUrl.isEnabled = true;
				observableUpload.isEnabled = false;
				expect( dropdown.isEnabled ).to.be.true;

				observableUrl.isEnabled = false;
				observableUpload.isEnabled = true;
				expect( dropdown.isEnabled ).to.be.true;

				observableUrl.isEnabled = true;
				observableUpload.isEnabled = true;
				expect( dropdown.isEnabled ).to.be.true;
			} );
		} );

		function registerUrlIntegration( observableAsFunc ) {
			observableUrl = new Model( { isEnabled: true } );

			insertImageUI.registerIntegration( {
				name: 'url',
				observable: observableAsFunc ? () => observableUrl : observableUrl,
				requiresForm: true,
				buttonViewCreator( isOnlyOne ) {
					const button = new ButtonView( editor.locale );

					button.label = 'button url ' + ( isOnlyOne ? 'single' : 'multiple' );

					return button;
				},
				formViewCreator( isOnlyOne ) {
					const button = new ButtonView( editor.locale );

					button.label = 'dropdown url ' + ( isOnlyOne ? 'single' : 'multiple' );

					return button;
				},
				menuBarButtonViewCreator() {
					const button = new MenuBarMenuListItemButtonView( editor.locale );

					button.label = 'button url';

					return button;
				}
			} );
		}

		function registerUploadIntegration( observableAsFunc ) {
			observableUpload = new Model( { isEnabled: true } );

			insertImageUI.registerIntegration( {
				name: 'upload',
				observable: observableAsFunc ? () => observableUpload : observableUpload,
				buttonViewCreator( isOnlyOne ) {
					const button = new ButtonView( editor.locale );

					button.label = 'button upload ' + ( isOnlyOne ? 'single' : 'multiple' );

					return button;
				},
				formViewCreator( isOnlyOne ) {
					const button = new ButtonView( editor.locale );

					button.label = 'dropdown upload ' + ( isOnlyOne ? 'single' : 'multiple' );

					return button;
				},
				menuBarButtonViewCreator() {
					const button = new MenuBarMenuListItemButtonView( editor.locale );

					button.label = 'button upload';

					return button;
				}
			} );
		}
	} );

	async function createEditor( config ) {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, config );

		insertImageUI = editor.plugins.get( 'ImageInsertUI' );
	}
} );
