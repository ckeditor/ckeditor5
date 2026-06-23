/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	IconObjectSizeSmall,
	IconObjectSizeMedium,
	IconObjectSizeLarge,
	IconObjectSizeFull
} from '@ckeditor/ckeditor5-icons';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { DropdownView, ButtonView } from '@ckeditor/ckeditor5-ui';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

import { MediaEmbedEditing } from '../../src/mediaembedediting.js';
import { MediaEmbedResizeEditing } from '../../src/mediaembedresize/mediaembedresizeediting.js';
import { MediaEmbedResizeButtons } from '../../src/mediaembedresize/mediaembedresizebuttons.js';
import { MediaEmbedCustomResizeUI } from '../../src/mediaembedresize/mediaembedcustomresizeui.js';

const RESIZE_OPTIONS = [
	{ name: 'resizeMediaEmbed:original', value: null, icon: 'original' },
	{ name: 'resizeMediaEmbed:custom', value: 'custom', icon: 'custom' },
	{ name: 'resizeMediaEmbed:25', value: '25', icon: 'small' },
	{ name: 'resizeMediaEmbed:50', value: '50', icon: 'medium' },
	{ name: 'resizeMediaEmbed:75', value: '75', icon: 'large' }
];

describe( 'MediaEmbedResizeButtons', () => {
	let plugin, command, editor, editorElement;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedResizeEditing, MediaEmbedResizeButtons, MediaEmbedCustomResizeUI ],
				mediaEmbed: {
					resizeOptions: RESIZE_OPTIONS
				}
			} );

		command = editor.commands.get( 'resizeMediaEmbed' );
		plugin = editor.plugins.get( 'MediaEmbedResizeButtons' );
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
			expect( MediaEmbedResizeButtons.pluginName ).toBe( 'MediaEmbedResizeButtons' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( MediaEmbedResizeButtons.isOfficialPlugin ).toBe( true );
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( MediaEmbedResizeButtons.isPremiumPlugin ).toBe( false );
		} );

		it( 'should require MediaEmbedResizeEditing', () => {
			expect( MediaEmbedResizeButtons.requires ).toContain( MediaEmbedResizeEditing );
		} );
	} );

	describe( 'constructor()', () => {
		it( 'should create `_resizeUnit` with default value of `%`', () => {
			expect( plugin._resizeUnit ).toBe( '%' );
		} );
	} );

	describe( 'init()', () => {
		it( 'should be disabled when command is disabled', () => {
			command.isEnabled = true;

			expect( plugin.isEnabled ).toBe( true );

			command.isEnabled = false;

			expect( plugin.isEnabled ).toBe( false );
		} );
	} );

	describe( 'resize options dropdown', () => {
		it( 'should register `resizeMediaEmbed` as a dropdown component', () => {
			expect( editor.ui.componentFactory.create( 'resizeMediaEmbed' ) ).toBeInstanceOf( DropdownView );
		} );

		it( 'should have 5 resize options in the dropdown', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeMediaEmbed' );

			expect( dropdownView.listView ).toBeUndefined();

			dropdownView.isOpen = true;

			expect( dropdownView.listView.items.length ).toBe( 5 );
		} );

		it( 'should have correct item labels', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeMediaEmbed' );

			dropdownView.isOpen = true;

			const items = dropdownView.listView.items;

			expect( items.first.element.textContent ).toBe( 'Original' );
			expect( items._items[ 1 ].element.textContent ).toBe( 'Custom' );
			expect( items._items[ 2 ].element.textContent ).toBe( '25%' );
			expect( items.last.element.textContent ).toBe( '75%' );
		} );

		it( 'should be disabled when plugin is disabled', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeMediaEmbed' );

			plugin.isEnabled = true;
			expect( dropdownView.isEnabled ).toBe( true );

			plugin.isEnabled = false;
			expect( dropdownView.isEnabled ).toBe( false );
		} );

		it( 'should be created with a proper tooltip', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeMediaEmbed' );

			expect( dropdownView.buttonView.tooltip ).toBe( 'Resize media' );
		} );

		it( 'should be created with proper aria attributes for dropdown button', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeMediaEmbed' );

			expect( dropdownView.buttonView.ariaLabel ).toBe( 'Resize media' );
			expect( dropdownView.buttonView.ariaLabelledBy ).toBeUndefined();
		} );

		it( 'should be created with a proper aria-label for list', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeMediaEmbed' );

			dropdownView.isOpen = true;

			expect( dropdownView.listView.ariaLabel ).toBe( 'Media resize list' );
		} );

		it( 'should be created with a proper role for list', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeMediaEmbed' );

			dropdownView.isOpen = true;

			expect( dropdownView.listView.role ).toBe( 'menu' );
		} );

		it( 'should execute resizeMediaEmbed command with proper value', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeMediaEmbed' );
			const commandSpy = vi.spyOn( command, 'execute' );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );

			dropdownView.isOpen = true;

			const resize25Button = dropdownView.listView.items._items[ 2 ].children._items[ 0 ];

			command.isEnabled = true;

			resize25Button.fire( 'execute' );

			expect( commandSpy ).toHaveBeenCalledOnce();
			expect( commandSpy.mock.calls[ 0 ][ 0 ] ).toEqual( { width: '25%' } );

			dropdownView.element.remove();
		} );

		it( 'should execute resizeMediaEmbed command with null for original option', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeMediaEmbed' );
			const commandSpy = vi.spyOn( command, 'execute' );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );

			dropdownView.isOpen = true;

			const originalButton = dropdownView.listView.items.first.children.first;

			command.isEnabled = true;

			originalButton.fire( 'execute' );

			expect( commandSpy ).toHaveBeenCalledOnce();
			expect( commandSpy.mock.calls[ 0 ][ 0 ] ).toEqual( { width: null } );

			dropdownView.element.remove();
		} );

		it( 'should open custom resize balloon when custom option is selected', () => {
			const customResizeUI = editor.plugins.get( 'MediaEmbedCustomResizeUI' );
			const dropdownView = editor.ui.componentFactory.create( 'resizeMediaEmbed' );
			const showFormSpy = vi.spyOn( customResizeUI, '_showForm' ).mockImplementation( () => {} );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );

			dropdownView.isOpen = true;

			const customButton = dropdownView.listView.items._items[ 1 ].children.first;

			command.isEnabled = true;

			customButton.fire( 'execute' );

			expect( showFormSpy ).toHaveBeenCalledOnce();

			dropdownView.element.remove();
		} );
	} );

	describe( 'resize option buttons (standalone)', () => {
		it( 'should be an instance of `ButtonView` if component is created with a value suffix', () => {
			expect( editor.ui.componentFactory.create( 'resizeMediaEmbed:50' ) ).toBeInstanceOf( ButtonView );
		} );

		it( 'should be bound to plugin `#isEnabled`', () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeMediaEmbed:50' );

			plugin.isEnabled = true;
			expect( buttonView.isEnabled ).toBe( true );

			plugin.isEnabled = false;
			expect( buttonView.isEnabled ).toBe( false );
		} );

		it( 'should have a proper tooltip for preset option', () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeMediaEmbed:50' );

			buttonView.render();
			expect( buttonView.tooltip ).toBe( 'Resize media to 50%' );
		} );

		it( 'should have a proper tooltip for original option', () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeMediaEmbed:original' );

			buttonView.render();
			expect( buttonView.tooltip ).toBe( 'Resize media to the original size' );
		} );

		it( 'should have a proper tooltip for custom option', () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeMediaEmbed:custom' );

			buttonView.render();
			expect( buttonView.tooltip ).toBe( 'Custom media size' );
		} );

		it( 'should execute `resizeMediaEmbed` command with "50%" value', () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeMediaEmbed:50' );
			const commandSpy = vi.spyOn( command, 'execute' );

			command.isEnabled = true;

			buttonView.fire( 'execute' );

			expect( commandSpy ).toHaveBeenCalledOnce();
			expect( commandSpy.mock.calls[ 0 ][ 0 ] ).toEqual( { width: '50%' } );
		} );

		it( 'should execute `resizeMediaEmbed` command with null for original option', () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeMediaEmbed:original' );
			const commandSpy = vi.spyOn( command, 'execute' );

			command.isEnabled = true;

			buttonView.fire( 'execute' );

			expect( commandSpy ).toHaveBeenCalledOnce();
			expect( commandSpy.mock.calls[ 0 ][ 0 ] ).toEqual( { width: null } );
		} );

		it( 'should open custom size balloon on click custom button', () => {
			const customResizeUI = editor.plugins.get( 'MediaEmbedCustomResizeUI' );
			const buttonView = editor.ui.componentFactory.create( 'resizeMediaEmbed:custom' );
			const commandSpy = vi.spyOn( command, 'execute' );
			const showFormSpy = vi.spyOn( customResizeUI, '_showForm' ).mockImplementation( () => {} );

			command.isEnabled = true;
			buttonView.fire( 'execute' );

			expect( commandSpy ).not.toHaveBeenCalled();
			expect( showFormSpy ).toHaveBeenCalled();
		} );

		it( 'should set isOn to true when command value matches the button value', () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeMediaEmbed:50' );

			command.isEnabled = true;
			command.value = '50%';

			expect( buttonView.isOn ).toBe( true );
		} );

		it( 'should set isOn to false when command value does not match', () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeMediaEmbed:50' );

			command.isEnabled = true;
			command.value = '25%';

			expect( buttonView.isOn ).toBe( false );
		} );

		it( 'should set isOn to false when command is disabled', () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeMediaEmbed:50' );

			command.isEnabled = false;
			command.value = '50%';

			expect( buttonView.isOn ).toBe( false );
		} );

		it( 'should set isOn to true for original button when command value is null', () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeMediaEmbed:original' );

			command.isEnabled = true;
			command.value = null;

			expect( buttonView.isOn ).toBe( true );
		} );

		it( 'should have set a proper icon for each size option', () => {
			const buttonOriginal = editor.ui.componentFactory.create( 'resizeMediaEmbed:original' );
			const button25 = editor.ui.componentFactory.create( 'resizeMediaEmbed:25' );
			const button50 = editor.ui.componentFactory.create( 'resizeMediaEmbed:50' );
			const button75 = editor.ui.componentFactory.create( 'resizeMediaEmbed:75' );

			expect( buttonOriginal.icon ).toEqual( IconObjectSizeFull );
			expect( button25.icon ).toEqual( IconObjectSizeSmall );
			expect( button50.icon ).toEqual( IconObjectSizeMedium );
			expect( button75.icon ).toEqual( IconObjectSizeLarge );
		} );

		it( 'should throw the CKEditorError if no `icon` is provided', async () => {
			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedResizeEditing, MediaEmbedResizeButtons ],
					mediaEmbed: {
						resizeOptions: [ {
							name: 'resizeMediaEmbed:noicon',
							value: '100'
						} ]
					}
				} );

			expectToThrowCKEditorError( () => {
				editor.ui.componentFactory.create( 'resizeMediaEmbed:noicon' );
			}, 'mediaembedresizebuttons-missing-icon', editor );

			await editor.destroy();
		} );

		it( 'should use custom label when provided in option config', async () => {
			const customEditor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedResizeEditing, MediaEmbedResizeButtons ],
					mediaEmbed: {
						resizeOptions: [ {
							name: 'resizeMediaEmbed:30',
							value: '30',
							label: 'Resize media: 30%',
							icon: 'small'
						} ]
					}
				} );

			const buttonView = customEditor.ui.componentFactory.create( 'resizeMediaEmbed:30' );
			buttonView.render();

			expect( buttonView.label ).toBe( 'Resize media: 30%' );

			await customEditor.destroy();
		} );
	} );

	describe( 'empty resizeOptions array', () => {
		it( 'should not throw when resizeOptions is empty', async () => {
			const emptyEditor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedResizeEditing, MediaEmbedResizeButtons ],
					mediaEmbed: {
						resizeOptions: []
					}
				} );

			expect( () => emptyEditor.ui.componentFactory.create( 'resizeMediaEmbed' ) ).not.toThrow();

			await emptyEditor.destroy();
		} );
	} );
} );
