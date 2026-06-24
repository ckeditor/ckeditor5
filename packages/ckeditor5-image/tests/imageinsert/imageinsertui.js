/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { UIModel, DropdownView, ButtonView, SplitButtonView, MenuBarMenuListItemButtonView, MenuBarMenuView } from '@ckeditor/ckeditor5-ui';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { Image } from '../../src/image.js';
import { ImageInsertUI } from '../../src/imageinsert/imageinsertui.js';
import { ImageInsertFormView } from '../../src/imageinsert/ui/imageinsertformview.js';

describe( 'ImageInsertUI', () => {
	let editor, editorElement, insertImageUI;

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
		expect( ImageInsertUI.pluginName ).toBe( 'ImageInsertUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageInsertUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageInsertUI.isPremiumPlugin ).toBe( false );
	} );

	describe( '#constructor()', () => {
		beforeEach( async () => {
			await createEditor( { plugins: [ ImageInsertUI ] } );
		} );

		it( 'should define config', () => {
			expect( editor.config.get( 'image.insert.integrations' ) ).toEqual( [
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
			expect( editor.ui.componentFactory.has( 'insertImage' ) ).toBe( true );
			expect( editor.ui.componentFactory.has( 'imageInsert' ) ).toBe( true );
			expect( editor.ui.componentFactory.has( 'menuBar:insertImage' ) ).toBe( true );
		} );

		it( 'should register "imageInsert" dropdown as an alias for the "insertImage" dropdown', () => {
			const dropdownCreator = editor.ui.componentFactory._components.get( 'insertImage'.toLowerCase() );
			const dropdownAliasCreator = editor.ui.componentFactory._components.get( 'imageInsert'.toLowerCase() );

			expect( dropdownCreator.callback ).toBe( dropdownAliasCreator.callback );
		} );
	} );

	describe( '#isImageSelected', () => {
		beforeEach( async () => {
			await createEditor( {
				plugins: [ ImageInsertUI, Essentials, Paragraph, Image ]
			} );
		} );

		it( 'should be false if image is not selected', () => {
			_setModelData( editor.model,
				'<paragraph>[foo]</paragraph>' +
				'<imageBlock></imageBlock>'
			);

			expect( insertImageUI.isImageSelected ).toBe( false );

			editor.model.change( writer => {
				writer.setSelection( editor.model.document.getRoot().getChild( 0 ), 'end' );
			} );

			expect( insertImageUI.isImageSelected ).toBe( false );
		} );

		it( 'should be true if block image is selected', () => {
			_setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'[<imageBlock></imageBlock>]'
			);

			expect( insertImageUI.isImageSelected ).toBe( true );
		} );

		it( 'should change on selection change', () => {
			_setModelData( editor.model,
				'<paragraph>foo[]</paragraph>' +
				'<imageBlock></imageBlock>'
			);

			expect( insertImageUI.isImageSelected ).toBe( false );

			editor.model.change( writer => {
				writer.setSelection( editor.model.document.getRoot().getChild( 1 ), 'on' );
			} );

			expect( insertImageUI.isImageSelected ).toBe( true );

			editor.model.change( writer => {
				writer.setSelection( editor.model.document.getRoot().getChild( 0 ), 'end' );
			} );

			expect( insertImageUI.isImageSelected ).toBe( false );
		} );
	} );

	describe( '#registerIntegration()', () => {
		beforeEach( async () => {
			await createEditor( { plugins: [ ImageInsertUI ] } );
		} );

		it( 'should store the integration definition', () => {
			const observable = new UIModel( { isEnabled: true } );
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

			expect( insertImageUI._integrations.has( 'foobar' ) ).toBe( true );

			const integrationData = insertImageUI._integrations.get( 'foobar' );

			expect( integrationData.observable ).toBe( observable );
			expect( integrationData.buttonViewCreator ).toBe( buttonViewCreator );
			expect( integrationData.formViewCreator ).toBe( formViewCreator );
			expect( integrationData.menuBarButtonViewCreator ).toBe( menuBarButtonViewCreator );
			expect( integrationData.requiresForm ).toBe( false );
		} );

		it( 'should store the integration definition (with optional data)', () => {
			const observable = new UIModel( { isEnabled: true } );
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

			expect( insertImageUI._integrations.has( 'foobar' ) ).toBe( true );

			const integrationData = insertImageUI._integrations.get( 'foobar' );

			expect( integrationData.observable ).toBe( observable );
			expect( integrationData.buttonViewCreator ).toBe( buttonViewCreator );
			expect( integrationData.formViewCreator ).toBe( formViewCreator );
			expect( integrationData.menuBarButtonViewCreator ).toBe( menuBarButtonViewCreator );
			expect( integrationData.requiresForm ).toBe( true );
		} );

		it( 'should warn if multiple integrations with the same name are registered', () => {
			const observable = new UIModel( { isEnabled: true } );
			const buttonViewCreator = () => {};
			const formViewCreator = () => {};
			const menuBarButtonViewCreator = () => {};
			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			insertImageUI.registerIntegration( {
				name: 'foobar',
				observable,
				buttonViewCreator,
				formViewCreator,
				menuBarButtonViewCreator,
				requiresForm: true
			} );

			expect( warnStub ).not.toHaveBeenCalled();

			insertImageUI.registerIntegration( {
				name: 'foobar',
				observable,
				buttonViewCreator,
				formViewCreator,
				menuBarButtonViewCreator,
				requiresForm: true
			} );

			expect( warnStub ).toHaveBeenCalledOnce();
			expect( warnStub.mock.calls[ 0 ][ 0 ] ).toBe( 'image-insert-integration-exists' );
		} );
	} );

	describe( 'integrations', () => {
		let observableUpload, observableUrl;

		beforeEach( async () => {
			await createEditor( { plugins: [ Image, Essentials, Paragraph ] } );
		} );

		it( 'should warn if empty list of integrations is configured', () => {
			editor.config.set( 'image.insert.integrations', [] );

			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			expect( dropdown ).toBeNull();
			expect( warnStub ).toHaveBeenCalledOnce();
			expect( warnStub.mock.calls[ 0 ][ 0 ] ).toBe( 'image-insert-integrations-not-specified' );

			const menuComponent = editor.ui.componentFactory.create( 'menuBar:insertImage' );

			expect( menuComponent ).toBeNull();
			expect( warnStub ).toHaveBeenCalledTimes( 2 );
			expect( warnStub.mock.calls[ 1 ][ 0 ] ).toBe( 'image-insert-integrations-not-specified' );
		} );

		it( 'should warn if unknown integration is requested by config', () => {
			editor.config.set( 'image.insert.integrations', [ 'foo' ] );

			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			expect( dropdown ).toBeNull();
			expect( warnStub ).toHaveBeenCalledTimes( 2 );
			expect( warnStub.mock.calls[ 0 ][ 0 ] ).toBe( 'image-insert-unknown-integration' );
			expect( warnStub.mock.calls[ 0 ][ 1 ].item ).toBe( 'foo' );
			expect( warnStub.mock.calls[ 1 ][ 0 ] ).toBe( 'image-insert-integrations-not-registered' );
		} );

		it( 'should not warn if known but not registered integration is requested by config', () => {
			editor.config.set( 'image.insert.integrations', [ 'url', 'assetManager', 'upload' ] );

			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const dropdown = editor.ui.componentFactory.create( 'insertImage' );

			expect( dropdown ).toBeNull();
			expect( warnStub ).toHaveBeenCalledOnce();
			expect( warnStub.mock.calls[ 0 ][ 0 ] ).toBe( 'image-insert-integrations-not-registered' );
		} );

		describe( 'single integration without form view required', () => {
			beforeEach( async () => {
				registerUploadIntegration();
			} );

			it( 'should create a toolbar button', () => {
				const button = editor.ui.componentFactory.create( 'insertImage' );

				expect( button ).toBeInstanceOf( ButtonView );
				expect( button.label ).toBe( 'button upload single' );
			} );
		} );

		describe( 'single integration with form view required', () => {
			beforeEach( async () => {
				registerUrlIntegration();
			} );

			it( 'should create a toolbar dropdown', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				expect( dropdown ).toBeInstanceOf( DropdownView );
				expect( dropdown.buttonView.label ).toBe( 'button url single' );
				expect( dropdown.isEnabled ).toBe( true );
			} );

			it( 'should bind isEnabled state to observable', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				observableUrl.isEnabled = false;
				expect( dropdown.isEnabled ).toBe( false );

				observableUrl.isEnabled = true;
				expect( dropdown.isEnabled ).toBe( true );
			} );

			it( 'should create panel view on dropdown first open', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				expect( dropdown.panelView.children.length ).toBe( 0 );

				dropdown.isOpen = true;
				expect( dropdown.panelView.children.length ).toBe( 1 );

				const formView = dropdown.panelView.children.get( 0 );
				expect( formView ).toBeInstanceOf( ImageInsertFormView );
				expect( formView.children.get( 0 ) ).toBeInstanceOf( ButtonView );
				expect( formView.children.get( 0 ).label ).toBe( 'dropdown url single' );
			} );

			it( 'should create a menu bar button', () => {
				const menu = editor.ui.componentFactory.create( 'menuBar:insertImage' );

				expect( menu ).toBeInstanceOf( MenuBarMenuView );

				const submenuList = menu.panelView.children.get( 0 );
				const button = submenuList.items.get( 0 ).children.get( 0 );

				expect( button ).toBeInstanceOf( MenuBarMenuListItemButtonView );
				expect( button.label ).toBe( 'button url' );
				expect( button.isEnabled ).toBe( true );
			} );
		} );

		describe( 'single integration with form view required and observalbe as a function', () => {
			beforeEach( async () => {
				registerUrlIntegration( true );
			} );

			it( 'should bind isEnabled state to observable', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				observableUrl.isEnabled = false;
				expect( dropdown.isEnabled ).toBe( false );

				observableUrl.isEnabled = true;
				expect( dropdown.isEnabled ).toBe( true );
			} );
		} );

		describe( 'multiple integrations', () => {
			beforeEach( async () => {
				registerUploadIntegration();
				registerUrlIntegration();
			} );

			it( 'should create a toolbar split button dropdown', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				expect( dropdown ).toBeInstanceOf( DropdownView );
				expect( dropdown.buttonView ).toBeInstanceOf( SplitButtonView );
				expect( dropdown.buttonView.label ).toBe( 'Insert image' );
				expect( dropdown.buttonView.tooltip ).toBe( true );
				expect( dropdown.buttonView.actionView.label ).toBe( 'button upload multiple' );
				expect( dropdown.isEnabled ).toBe( true );
			} );

			it( 'should bind split button label to #isImageSelected', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				expect( insertImageUI.isImageSelected ).toBe( false );
				expect( dropdown.buttonView.label ).toBe( 'Insert image' );

				insertImageUI.isImageSelected = true;
				expect( dropdown.buttonView.label ).toBe( 'Replace image' );

				insertImageUI.isImageSelected = false;
				expect( dropdown.buttonView.label ).toBe( 'Insert image' );
			} );

			it( 'should bind isEnabled state to observables', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				observableUrl.isEnabled = false;
				observableUpload.isEnabled = false;
				expect( dropdown.isEnabled ).toBe( false );

				observableUrl.isEnabled = true;
				observableUpload.isEnabled = false;
				expect( dropdown.isEnabled ).toBe( true );

				observableUrl.isEnabled = false;
				observableUpload.isEnabled = true;
				expect( dropdown.isEnabled ).toBe( true );

				observableUrl.isEnabled = true;
				observableUpload.isEnabled = true;
				expect( dropdown.isEnabled ).toBe( true );
			} );

			it( 'should create panel view on dropdown first open', () => {
				const dropdown = editor.ui.componentFactory.create( 'insertImage' );

				expect( dropdown.panelView.children.length ).toBe( 0 );

				dropdown.isOpen = true;
				expect( dropdown.panelView.children.length ).toBe( 1 );

				const formView = dropdown.panelView.children.get( 0 );
				expect( formView ).toBeInstanceOf( ImageInsertFormView );

				expect( formView.children.length ).toBe( 2 );
				expect( formView.children.get( 0 ) ).toBeInstanceOf( ButtonView );
				expect( formView.children.get( 0 ).label ).toBe( 'dropdown upload multiple' );
				expect( formView.children.get( 1 ) ).toBeInstanceOf( ButtonView );
				expect( formView.children.get( 1 ).label ).toBe( 'dropdown url multiple' );
			} );

			it( 'should create a menu bar sub menu', () => {
				const menu = editor.ui.componentFactory.create( 'menuBar:insertImage' );

				expect( menu ).toBeInstanceOf( MenuBarMenuView );

				const submenuList = menu.panelView.children.get( 0 );

				expect( submenuList.items.get( 0 ).children.get( 0 ).label ).toBe( 'button upload' );
				expect( submenuList.items.get( 1 ).children.get( 0 ).label ).toBe( 'button url' );
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
				expect( dropdown.isEnabled ).toBe( false );

				observableUrl.isEnabled = true;
				observableUpload.isEnabled = false;
				expect( dropdown.isEnabled ).toBe( true );

				observableUrl.isEnabled = false;
				observableUpload.isEnabled = true;
				expect( dropdown.isEnabled ).toBe( true );

				observableUrl.isEnabled = true;
				observableUpload.isEnabled = true;
				expect( dropdown.isEnabled ).toBe( true );
			} );
		} );

		function registerUrlIntegration( observableAsFunc ) {
			observableUrl = new UIModel( { isEnabled: true } );

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
			observableUpload = new UIModel( { isEnabled: true } );

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
