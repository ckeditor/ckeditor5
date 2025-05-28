/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import {
	IconObjectSizeSmall,
	IconObjectSizeMedium,
	IconObjectSizeLarge,
	IconObjectSizeFull
} from 'ckeditor5/src/icons.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Image from '../../src/image.js';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import ImageResizeButtons from '../../src/imageresize/imageresizebuttons.js';
import ImageCustomResizeUI from '../../src/imageresize/imagecustomresizeui.js';
import ImageStyle from '../../src/imagestyle.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'ImageResizeButtons', () => {
	let plugin, command, editor, editorElement;

	const resizeOptions = [ {
		name: 'resizeImage:original',
		value: null
	},
	{
		name: 'resizeImage:custom',
		value: 'custom'
	},
	{
		name: 'resizeImage:25',
		value: '25'
	},
	{
		name: 'resizeImage:50',
		value: '50'
	},
	{
		name: 'resizeImage:75',
		value: '75'
	} ];

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor
			.create( editorElement, {
				plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeButtons, ImageCustomResizeUI ],
				image: {
					resizeOptions
				}
			} );

		command = editor.commands.get( 'resizeImage' );
		plugin = editor.plugins.get( 'ImageResizeButtons' );
	} );

	afterEach( async () => {
		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			await editor.destroy();
		}
	} );

	describe( 'plugin', () => {
		it( 'should be named', () => {
			expect( ImageResizeButtons.pluginName ).to.equal( 'ImageResizeButtons' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( ImageResizeButtons.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( ImageResizeButtons.isPremiumPlugin ).to.be.false;
		} );
	} );

	describe( 'constructor()', () => {
		it( 'should create `_resizeUnit` with default value of `%`', () => {
			const unit = plugin._resizeUnit;

			expect( unit ).to.equal( '%' );
		} );
	} );

	describe( 'init()', () => {
		it( 'should be disabled when command is disabled', () => {
			command.isEnabled = true;

			expect( plugin.isEnabled ).to.be.true;

			command.isEnabled = false;

			expect( plugin.isEnabled ).to.be.false;
		} );
	} );

	describe( 'resize options main toolbar buttons', () => {
		let editor;

		beforeEach( async () => {
			editor = await ClassicEditor
				.create( editorElement, {
					plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeButtons, ImageCustomResizeUI ],
					image: {
						resizeUnit: '%',
						resizeOptions: [ {
							name: 'resizeImage:original',
							value: null,
							icon: 'original'
						},
						{
							name: 'resizeImage:custom',
							value: 'custom',
							icon: 'custom'
						},
						{
							name: 'resizeImage:25',
							value: '25',
							icon: 'small'
						},
						{
							name: 'resizeImage:50',
							value: '50',
							icon: 'medium'
						},
						{
							name: 'resizeImage:75',
							value: '75',
							icon: 'large'
						} ]
					},
					toolbar: [ 'resizeImage:original', 'resizeImage:custom', 'resizeImage:25', 'resizeImage:50', 'resizeImage:75' ]
				} );

			plugin = editor.plugins.get( 'ImageResizeButtons' );
		} );

		afterEach( async () => {
			if ( editorElement ) {
				editorElement.remove();
			}

			if ( editor && editor.state !== 'destroyed' ) {
				await editor.destroy();
			}
		} );

		it( 'should register resize options as items in the main toolbar', () => {
			const toolbar = editor.ui.view.toolbar;

			expect( toolbar.items.map( item => item.label ) ).to.deep.equal( [
				'Resize image to the original size',
				'Custom image size',
				'Resize image to 25%',
				'Resize image to 50%',
				'Resize image to 75%'
			] );
		} );

		it( 'should synchronize button states with command\'s isEnabled property', () => {
			const toolbar = editor.ui.view.toolbar;
			const resizeCommand = editor.commands.get( 'resizeImage' );
			const resizeComponents = toolbar.items.filter( item => item.label && item.label.includes( 'Resize image' ) );

			resizeCommand.isEnabled = true;
			expect( resizeComponents.every( item => item.isEnabled ) ).to.be.true;

			resizeCommand.isEnabled = false;
			expect( resizeComponents.every( item => item.isEnabled ) ).to.be.false;
		} );

		it( 'should properly sync isOn states of buttons', () => {
			const toolbar = editor.ui.view.toolbar;
			const resizeCommand = editor.commands.get( 'resizeImage' );
			const resizeComponents = toolbar.items.filter( item => item.label && item.label.includes( 'Resize image' ) );

			resizeCommand.isEnabled = false;
			resizeCommand.value = undefined;

			expect( resizeComponents.every( item => item.isOn ) ).to.be.false;

			resizeCommand.isEnabled = false;
			expect( resizeComponents.every( item => item.isOn ) ).to.be.false;

			resizeCommand.value = undefined;
			resizeCommand.isEnabled = true;
			expect( resizeComponents.every( item => item.isOn ) ).to.be.false;

			resizeCommand.value = { width: '50%' };
			resizeCommand.isEnabled = true;

			expect( resizeComponents[ 2 ].isOn ).to.be.true;

			resizeCommand.isEnabled = false;
			expect( resizeComponents[ 2 ].isOn ).to.be.false;
		} );
	} );

	describe( 'resize options dropdown', () => {
		it( 'should be disabled when plugin is disabled', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeImage' );

			plugin.isEnabled = true;

			expect( dropdownView.isEnabled ).to.be.true;

			plugin.isEnabled = false;

			expect( dropdownView.isEnabled ).to.be.false;
		} );

		it( 'should be an instance of `DropdownView` if component is created without a value suffix', () => {
			expect( editor.ui.componentFactory.create( 'resizeImage' ) ).to.be.instanceof( DropdownView );
		} );

		it( 'should register `imageResize dropdown as an alias for the `resizeImage` dropdown', () => {
			const dropdownCreator = editor.ui.componentFactory._components.get( 'resizeImage'.toLowerCase() );
			const dropdownAliasCreator = editor.ui.componentFactory._components.get( 'imageResize'.toLowerCase() );

			expect( dropdownCreator.callback ).to.equal( dropdownAliasCreator.callback );
		} );

		it( 'should have 5 resize options in the `resizeImage` dropdown', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeImage' );

			// Make sure that list view is not created before first dropdown open.
			expect( dropdownView.listView ).to.be.undefined;

			// Trigger list view creation (lazy init).
			dropdownView.isOpen = true;

			expect( dropdownView.listView.items.length ).to.equal( 5 );
			expect( dropdownView.listView.items.first.element.textContent ).to.equal( 'Original' );
			expect( dropdownView.listView.items._items[ 1 ].element.textContent ).to.equal( 'Custom' );
			expect( dropdownView.listView.items._items[ 2 ].element.textContent ).to.equal( '25%' );
			expect( dropdownView.listView.items.last.element.textContent ).to.equal( '75%' );
		} );

		it( 'should be created with a proper tooltip', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeImage' );

			expect( dropdownView.buttonView.tooltip ).to.equal( 'Resize image' );
		} );

		it( 'should be created with proper aria attributes for dropdown button', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeImage' );

			expect( dropdownView.buttonView.ariaLabel ).to.equal( 'Resize image' );
			expect( dropdownView.buttonView.ariaLabelledBy ).to.be.undefined;
		} );

		it( 'should be created with a proper aria-label', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeImage' );

			// Make sure that list view is not created before first dropdown open.
			expect( dropdownView.listView ).to.be.undefined;

			// Trigger list view creation (lazy init).
			dropdownView.isOpen = true;

			expect( dropdownView.listView.ariaLabel ).to.equal( 'Image resize list' );
		} );

		it( 'should be created with a proper role', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeImage' );

			// Make sure that list view is not created before first dropdown open.
			expect( dropdownView.listView ).to.be.undefined;

			// Trigger list view creation (lazy init).
			dropdownView.isOpen = true;

			expect( dropdownView.listView.role ).to.equal( 'menu' );
		} );

		it( 'should execute resize command with a proper value', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeImage' );
			const commandSpy = sinon.spy( command, 'execute' );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );

			// Make sure that list view is not created before first dropdown open.
			expect( dropdownView.listView ).to.be.undefined;

			// Trigger list view creation (lazy init).
			dropdownView.isOpen = true;

			const resizeBy50Percent = dropdownView.listView.items._items[ 2 ].children._items[ 0 ];

			command.isEnabled = true;

			resizeBy50Percent.fire( 'execute' );

			sinon.assert.calledOnce( commandSpy );
			expect( command.value.width ).to.equal( '25%' );

			dropdownView.element.remove();
		} );
	} );

	describe( 'resize option button', () => {
		let editor, plugin;

		beforeEach( async () => {
			editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeButtons, ImageCustomResizeUI ],
					image: {
						resizeUnit: '%',
						resizeOptions: [ {
							name: 'resizeImage:original',
							value: null,
							icon: 'original'
						},
						{
							name: 'resizeImage:custom',
							value: 'custom',
							icon: 'custom'
						},
						{
							name: 'resizeImage:25',
							value: '25',
							icon: 'small'
						},
						{
							name: 'resizeImage:50',
							value: '50',
							icon: 'medium'
						},
						{
							name: 'resizeImage:75',
							value: '75',
							icon: 'large'
						} ],
						toolbar: [ 'resizeImage:original', 'resizeImage:custom', 'resizeImage:25', 'resizeImage:50', 'resizeImage:75' ]
					}
				} );

			plugin = editor.plugins.get( 'ImageResizeButtons' );
		} );

		afterEach( async () => {
			if ( editorElement ) {
				editorElement.remove();
			}

			if ( editor && editor.state !== 'destroyed' ) {
				await editor.destroy();
			}
		} );

		it( 'should be bound to `#isEnabled`', () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeImage:50' );

			plugin.isEnabled = true;

			expect( buttonView.isEnabled ).to.be.true;

			plugin.isEnabled = false;

			expect( buttonView.isEnabled ).to.be.false;
		} );

		it( 'should be an instance of `ButtonView` if component is created with a value suffix', () => {
			expect( editor.ui.componentFactory.create( 'resizeImage:50' ) ).to.be.instanceof( ButtonView );
		} );

		it( 'should be created with invisible "Resize image: 30%" label when is provided', async () => {
			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeButtons ],
					image: {
						resizeUnit: '%',
						resizeOptions: [ {
							name: 'resizeImage:30',
							value: '30',
							label: 'Resize image: 30%',
							icon: 'small'
						} ],
						toolbar: [ 'resizeImage:30' ]
					}
				} );

			const buttonView = editor.ui.componentFactory.create( 'resizeImage:30' );
			buttonView.render();

			expect( buttonView.withText ).to.be.false;
			expect( buttonView.label ).to.equal( 'Resize image: 30%' );
			expect( buttonView.labelView ).to.be.instanceOf( View );

			await editor.destroy();
		} );

		it( 'should be created with invisible "Resize image to 50%" label when is not provided', async () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeImage:50' );
			buttonView.render();

			expect( buttonView.withText ).to.be.false;
			expect( buttonView.label ).to.equal( 'Resize image to 50%' );
			expect( buttonView.labelView ).to.be.instanceOf( View );

			await editor.destroy();
		} );

		it( 'should be created with a proper tooltip in custom option', () => {
			const buttonViewCustom = editor.ui.componentFactory.create( 'resizeImage:custom' );

			buttonViewCustom.render();

			expect( buttonViewCustom.tooltip ).to.equal( 'Custom image size' );
		} );

		it( 'should be created with a proper tooltip, depends on the set value', () => {
			const buttonViewOriginal = editor.ui.componentFactory.create( 'resizeImage:original' );
			const buttonView50 = editor.ui.componentFactory.create( 'resizeImage:50' );

			buttonViewOriginal.render();
			buttonView50.render();

			expect( buttonViewOriginal.tooltip ).to.equal( 'Resize image to the original size' );
			expect( buttonView50.tooltip ).to.equal( 'Resize image to 50%' );
		} );

		it( 'should execute `resizeImage` command with "50%" value', () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeImage:50' );
			const command = editor.commands.get( 'resizeImage' );
			const commandSpy = sinon.spy( command, 'execute' );

			command.isEnabled = true;

			buttonView.fire( 'execute' );

			sinon.assert.calledOnce( commandSpy );
			expect( command.value.width ).to.equal( '50%' );
		} );

		it( 'should open custom size balloon on click custom item', () => {
			const customResizeUI = editor.plugins.get( 'ImageCustomResizeUI' );
			const buttonView = editor.ui.componentFactory.create( 'resizeImage:custom' );
			const command = editor.commands.get( 'resizeImage' );
			const commandSpy = sinon.spy( command, 'execute' );
			const showFormSpy = sinon.stub( customResizeUI, '_showForm' );

			command.isEnabled = true;
			buttonView.fire( 'execute' );

			expect( commandSpy ).not.to.be.called;
			expect( showFormSpy ).to.be.called;
		} );

		it( 'should have set a proper icon', () => {
			const buttonOriginal = editor.ui.componentFactory.create( 'resizeImage:original' );
			const button25 = editor.ui.componentFactory.create( 'resizeImage:25' );
			const button50 = editor.ui.componentFactory.create( 'resizeImage:50' );
			const button75 = editor.ui.componentFactory.create( 'resizeImage:75' );

			expect( buttonOriginal.icon ).to.deep.equal( IconObjectSizeFull );
			expect( button25.icon ).to.deep.equal( IconObjectSizeSmall );
			expect( button50.icon ).to.deep.equal( IconObjectSizeMedium );
			expect( button75.icon ).to.deep.equal( IconObjectSizeLarge );
		} );

		it( 'should throw the CKEditorError if no `icon` is provided', async () => {
			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeButtons ],
					image: {
						resizeUnit: '%',
						resizeOptions: [ {
							name: 'resizeImage:noicon',
							value: '100'
						} ],
						toolbar: [ 'resizeImage:noicon' ]
					}
				} );

			expectToThrowCKEditorError( () => {
				editor.ui.componentFactory.create( 'resizeImage:noicon' );
			}, 'imageresizebuttons-missing-icon', editor );

			await editor.destroy();
		} );
	} );
} );
