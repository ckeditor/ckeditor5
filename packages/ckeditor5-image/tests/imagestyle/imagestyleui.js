/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { global } from '@ckeditor/ckeditor5-utils';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { DEFAULT_OPTIONS, utils } from '../../src/imagestyle/utils.js';
import { ImageToolbar } from '../../src/imagetoolbar.js';
import { ImageStyleEditing } from '../../src/imagestyle/imagestyleediting.js';
import { ImageStyleUI } from '../../src/imagestyle/imagestyleui.js';
import { ImageBlockEditing } from '../../src/image/imageblockediting.js';
import { ImageInlineEditing } from '../../src/image/imageinlineediting.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ButtonView, DropdownView, SplitButtonView } from '@ckeditor/ckeditor5-ui';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

describe( 'ImageStyleUI', () => {
	let editor, editorElement, factory, defaultDropdowns;

	const allStyles = Object.values( DEFAULT_OPTIONS );
	const customDropdowns = [ {
		name: 'imageStyle:custom',
		title: 'Custom title',
		defaultItem: 'imageStyle:inline',
		items: [ 'imageStyle:inline', 'imageStyle:alignLeft' ]
	}, {
		name: 'imageStyle:custom2',
		defaultItem: 'imageStyle:block',
		items: [ 'imageStyle:block', 'imageStyle:side' ]
	} ];

	beforeEach( async () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		editor = await ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing, ImageStyleUI, Paragraph ],
				image: {
					styles: { options: allStyles },
					toolbar: customDropdowns
				}
			} );

		factory = editor.ui.componentFactory;
		defaultDropdowns = utils.getDefaultDropdownDefinitions( editor.plugins );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( ImageStyleUI.pluginName ).toBe( 'ImageStyleUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageStyleUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageStyleUI.isPremiumPlugin ).toBe( false );
	} );

	it( 'should require ImageStyleEditing plugin', () => {
		expect( ImageStyleUI.requires ).toEqual( [ ImageStyleEditing ] );
	} );

	describe( 'init()', () => {
		it( 'should register a button for each of the provided styles', () => {
			allStyles.forEach( ( { name } ) => {
				expect( factory.has( `imageStyle:${ name }` ) ).toBe( true );
			} );
		} );

		it( 'should register a drop-down for each of the default provided dropdowns', () => {
			defaultDropdowns.forEach( ( { name } ) => {
				expect( factory.has( name ) ).toBe( true );
			} );
		} );

		it( 'should register a drop-down for each of the custom defined dropdowns', () => {
			customDropdowns.forEach( ( { name } ) => {
				expect( factory.has( name ) ).toBe( true );
			} );
		} );
	} );

	describe( 'localizedDefaultStylesTitles()', () => {
		it( 'should return localized titles of default styles', () => {
			expect( editor.plugins.get( ImageStyleUI ).localizedDefaultStylesTitles ).toEqual( {
				'Full size image': 'Full size image',
				'Side image': 'Side image',
				'Left aligned image': 'Left aligned image',
				'Centered image': 'Centered image',
				'Right aligned image': 'Right aligned image',
				'Wrap text': 'Wrap text',
				'Break text': 'Break text',
				'In line': 'In line'
			} );
		} );
	} );

	describe( 'style buttons', () => {
		let buttons;

		beforeEach( () => {
			buttons = allStyles.map( style => ( {
				config: style,
				buttonView: factory.create( `imageStyle:${ style.name }` )
			} ) );
		} );

		it( 'should set the button properties properly', () => {
			for ( const { config, buttonView } of buttons ) {
				expect( buttonView ).toBeInstanceOf( ButtonView );
				expect( buttonView.label ).toBe( config.title );
				expect( buttonView.icon ).toBe( config.icon );
				expect( buttonView.tooltip ).toBe( true );
				expect( buttonView.isToggleable ).toBe( true );
			}
		} );

		it( 'should enable the button when the style applies to the selected image', () => {
			// With a block image selected, every style applicable to either image type should be enabled
			// (inline-only styles can convert the block image to inline, block-only styles apply directly,
			// and dual-type styles apply directly too).
			_setModelData( editor.model, '[<imageBlock src=""></imageBlock>]' );

			for ( const { buttonView } of buttons ) {
				expect( buttonView.isEnabled, buttonView.label ).toBe( true );
			}
		} );

		it( 'should disable every button when no image is selected', () => {
			// The `imageStyle` command is not enabled without an image, so `isStyleEnabled()` returns
			// `false` for every style regardless of which command would otherwise apply.
			editor.commands.get( 'imageStyle' ).isEnabled = false;

			for ( const { buttonView } of buttons ) {
				expect( buttonView.isEnabled, buttonView.label ).toBe( false );
			}
		} );

		it( 'should set the #isOn property based on the command value', () => {
			const command = editor.commands.get( 'imageStyle' );

			for ( const { config, buttonView } of buttons ) {
				command.value = config.name;
				expect( buttonView.isOn ).toBe( true );
				command.value = false;
				expect( buttonView.isOn ).toBe( false );
				command.value = 'someCustomValue';
				expect( buttonView.isOn ).toBe( false );
			}
		} );

		it( 'should execute the command when the button is being clicked', () => {
			const commandSpy = vi.spyOn( editor, 'execute' );
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' ).mockImplementation( () => {} );

			for ( const { config, buttonView } of buttons ) {
				buttonView.fire( 'execute' );

				expect( commandSpy ).toHaveBeenCalledOnce();
				expect( commandSpy ).toHaveBeenCalledWith( 'imageStyle', { value: config.name } );
				expect( focusSpy ).toHaveBeenCalled();

				commandSpy.mockClear();
			}
		} );

		it( 'should not add buttons to image toolbar if configuration is present', async () => {
			const customEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( customEditorElement );

			const customEditor = await ClassicTestEditor
				.create( customEditorElement, {
					plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing, ImageStyleUI ],
					image: {
						styles: { styles: allStyles },
						toolbar: [ 'foo', 'bar' ]
					}
				} );

			expect( customEditor.config.get( 'image.toolbar' ) ).toEqual( [ 'foo', 'bar' ] );

			customEditorElement.remove();
			await customEditor.destroy();
		} );

		it( 'should translate buttons if taken from default styles', async () => {
			const customEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( customEditorElement );

			class TranslationMock extends Plugin {
				init() { vi.spyOn( this.editor, 't' ).mockReturnValue( 'Default title' ); }
			}

			const customEditor = await ClassicTestEditor.create( customEditorElement, {
				plugins: [ TranslationMock, ImageBlockEditing, ImageInlineEditing, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles: { options: allStyles },
					toolbar: [ ...defaultDropdowns, ...customDropdowns ]
				}
			} );

			const buttonView = customEditor.ui.componentFactory.create( 'imageStyle:alignLeft' );

			expect( buttonView.label ).toBe( 'Default title' );

			customEditorElement.remove();
			await customEditor.destroy();
		} );

		it( 'should pass through the defined title if the translation is missing', async () => {
			const customEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( customEditorElement );

			const customEditor = await ClassicTestEditor.create( customEditorElement, {
				plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles: {
						options: [ { name: 'foo', modelElements: [ 'imageBlock' ], title: 'Custom title' } ]
					}
				}
			} );

			const buttonView = customEditor.ui.componentFactory.create( 'imageStyle:foo' );

			expect( buttonView.label ).toBe( 'Custom title' );

			customEditorElement.remove();
			await customEditor.destroy();
		} );
	} );

	describe( 'drop-downs', () => {
		let dropdowns;

		beforeEach( () => {
			dropdowns = [ ...defaultDropdowns, ...customDropdowns ].map( dropdown => {
				const view = factory.create( dropdown.name );

				view.render();
				global.document.body.appendChild( view.element );

				// Make sure that toolbar view is not created before first dropdown open.
				expect( view.toolbarView ).toBeUndefined();

				// Trigger toolbar view creation (lazy init).
				view.isOpen = true;
				view.isOpen = false;

				return { view, buttonView: view.buttonView, config: dropdown };
			} );
		} );

		afterEach( () => {
			dropdowns.forEach( ( { view } ) => view.element.remove() );
		} );

		it( 'should define the drop-down properties and children properly', () => {
			for ( const { config, view, buttonView } of dropdowns ) {
				const defaultItem = allStyles.find( style => style.name === config.defaultItem.replace( 'imageStyle:', '' ) );
				const expectedLabel = ( config.title ? `${ config.title }: ` : '' ) + defaultItem.title;

				expect( view ).toBeInstanceOf( DropdownView );
				expect( buttonView ).toBeInstanceOf( SplitButtonView );

				expect( buttonView.label ).toBe( expectedLabel );
				expect( buttonView.tooltip ).toBe( true );
				expect( buttonView.class ).toBeUndefined();

				expect( buttonView.arrowView.label ).toBe( config.title );
				expect( buttonView.arrowView.tooltip ).toBe( true );

				expect( view.toolbarView.items ).toHaveLength( config.items.length );

				view.toolbarView.items.map( item => {
					expect( item ).toBeInstanceOf( ButtonView );
				} );
			}
		} );

		it( 'should focus the first active button when dropdown is opened', () => {
			for ( const { view } of dropdowns ) {
				const secondButton = view.toolbarView.items.get( 1 );
				const spy = vi.spyOn( secondButton, 'focus' );

				secondButton.isOn = true;
				view.isOpen = true;
				expect( spy ).toHaveBeenCalledOnce();
			}
		} );

		it( 'should keep the same label of the secondary (arrow) button when the user changes styles of the image', () => {
			const dropdownView = editor.ui.componentFactory.create( 'imageStyle:breakText' );

			// Make sure that toolbar view is not created before first dropdown open.
			expect( dropdownView.toolbarView ).toBeUndefined();

			// Trigger toolbar view creation (lazy init).
			dropdownView.isOpen = true;

			expect( dropdownView.buttonView.arrowView.label ).toBe( 'Default title' );

			// Simulate the user changing the style of an image.
			dropdownView.toolbarView.items.get( 0 ).isOn = true;

			expect( dropdownView.buttonView.arrowView.label ).toBe( 'Default title' );
		} );

		it( 'should translate the drop-down title if taken from default styles', async () => {
			const customEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( customEditorElement );

			class TranslationMock extends Plugin {
				init() { vi.spyOn( this.editor, 't' ).mockReturnValue( 'Default title' ); }
			}

			const customEditor = await ClassicTestEditor.create( customEditorElement, {
				plugins: [ TranslationMock, ImageBlockEditing, ImageInlineEditing, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles: { options: allStyles },
					toolbar: defaultDropdowns
				}
			} );

			const dropdownView = customEditor.ui.componentFactory.create( 'imageStyle:wrapText' );

			expect( dropdownView.buttonView.label ).toBe( 'Default title: Default title' );

			customEditorElement.remove();
			await customEditor.destroy();
		} );

		it( 'should pass through the defined title if the translation is missing', async () => {
			const customEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( customEditorElement );

			const customEditor = await ClassicTestEditor.create( customEditorElement, {
				plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles: { options: allStyles },
					toolbar: customDropdowns
				}
			} );

			const dropdownView = customEditor.ui.componentFactory.create( 'imageStyle:custom' );

			expect( dropdownView.buttonView.label ).toBe( 'Custom title: In line' );

			customEditorElement.remove();
			await customEditor.destroy();
		} );

		it( 'should warn and filter out the items that are not defined as the styles while creating a toolbar', async () => {
			vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			const customEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( customEditorElement );

			const dropdown = {
				name: 'imageStyle:test',
				title: 'Test',
				items: [ 'imageStyle:alignLeft', 'imageStyle:foo', 'imageStyle:bar' ],
				defaultItem: 'imageStyle:alignLeft'
			};

			const customEditor = await ClassicTestEditor.create( customEditorElement, {
				plugins: [ ImageBlockEditing, ImageInlineEditing, ImageToolbar, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles: { options: allStyles },
					toolbar: [ dropdown ]
				}
			} );

			const toolbar = customEditor.plugins.get( 'WidgetToolbarRepository' )._toolbarDefinitions.get( 'image' ).view;

			// Make sure that toolbar is empty before first show.
			expect( toolbar.items.length ).toBe( 0 );

			customEditor.ui.focusTracker.isFocused = true;

			_setModelData( customEditor.model, '[<imageBlock src=""></imageBlock>]' );

			expect( console.warn ).toHaveBeenCalledOnce();
			expect( console.warn ).toHaveBeenCalledWith(
				expect.stringMatching( /^image-style-configuration-definition-invalid/ ),
				{ dropdown },
				expect.any( String ) // Link to the documentation
			);

			customEditorElement.remove();
			await customEditor.destroy();
		} );

		it( 'should warn and filter out the items that are not supported by the loaded plugins while creating a toolbar', async () => {
			vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			const customEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( customEditorElement );

			const dropdown = {
				name: 'imageStyle:Bar',
				title: 'Bar',
				items: [ 'imageStyle:alignLeft', 'imageStyle:foo' ],
				defaultItem: 'imageStyle:alignLeft'
			};

			const customEditor = await ClassicTestEditor.create( customEditorElement, {
				plugins: [ ImageBlockEditing, ImageToolbar, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles: {
						options: [ { name: 'foo', modelElements: [ 'imageInline' ], icon: '' }, 'alignLeft' ]
					},
					toolbar: [ dropdown ]
				}
			} );

			const toolbar = customEditor.plugins.get( 'WidgetToolbarRepository' )._toolbarDefinitions.get( 'image' ).view;

			// Make sure that toolbar is empty before first show.
			expect( toolbar.items.length ).toBe( 0 );

			customEditor.ui.focusTracker.isFocused = true;

			_setModelData( customEditor.model, '[<imageBlock src=""></imageBlock>]' );

			expect( console.warn ).toHaveBeenCalledTimes( 2 );
			expect( console.warn ).toHaveBeenCalledWith(
				expect.stringMatching( /^image-style-missing-dependency/ ),
				{
					style: { name: 'foo', modelElements: [ 'imageInline' ], icon: '' },
					missingPlugins: [ 'ImageInlineEditing' ]
				},
				expect.any( String ) // Link to the documentation
			);
			expect( console.warn ).toHaveBeenCalledWith(
				expect.stringMatching( /^image-style-configuration-definition-invalid/ ),
				{ dropdown },
				expect.any( String ) // Link to the documentation
			);

			customEditorElement.remove();
			await customEditor.destroy();
		} );

		describe( 'when at least one of the nested buttons is on', () => {
			beforeEach( () => {
				dropdowns = dropdowns.map( dropdown => {
					const activeButton = dropdown.view.toolbarView.items.first;

					activeButton.isOn = true;

					return { ...dropdown, activeButton };
				} );
			} );

			it( 'should inherit the icon, state and label from the active nested button', () => {
				for ( const { config, buttonView, activeButton } of dropdowns ) {
					expect( buttonView.icon ).toBe( activeButton.icon );
					expect( buttonView.label ).toBe( ( config.title ? `${ config.title }: ` : '' ) + activeButton.label );
					expect( buttonView.isOn ).toBe( true );
				}
			} );

			it( 'should have the "ck-splitbutton_flatten" class', () => {
				for ( const { buttonView } of dropdowns ) {
					expect( buttonView.class ).toBe( 'ck-splitbutton_flatten' );
				}
			} );

			it( 'it should open the dropDown view when the button is being clicked', () => {
				const commandSpy = vi.spyOn( editor, 'execute' );

				for ( const { view, buttonView } of dropdowns ) {
					buttonView.fire( 'execute' );

					expect( commandSpy ).not.toHaveBeenCalled();
					expect( view.isOpen ).toBe( true );
				}
			} );

			it( 'it should close the open dropDown view when the button is being clicked', () => {
				const commandSpy = vi.spyOn( editor, 'execute' );

				for ( const { view, buttonView } of dropdowns ) {
					buttonView.fire( 'execute' );
					buttonView.fire( 'execute' );

					expect( commandSpy ).not.toHaveBeenCalled();
					expect( view.isOpen ).toBe( false );
				}
			} );
		} );

		describe( 'when none of the nested buttons are on', () => {
			it( 'should inherit the icon and label of the defaultItem', () => {
				for ( const { buttonView, config } of dropdowns ) {
					const defaultItem = DEFAULT_OPTIONS[ config.defaultItem.replace( 'imageStyle:', '' ) ];

					expect( buttonView.icon ).toBe( defaultItem.icon );
					expect( buttonView.label ).toBe( ( config.title ? `${ config.title }: ` : '' ) + defaultItem.title );
				}
			} );

			it( 'should not have the "ck-splitbutton_flatten" class', () => {
				for ( const { buttonView } of dropdowns ) {
					expect( buttonView.class ).toBeUndefined();
				}
			} );

			it( 'it should execute the command with proper value when the button is being clicked', () => {
				const commandSpy = vi.spyOn( editor, 'execute' );
				const focusSpy = vi.spyOn( editor.editing.view, 'focus' ).mockImplementation( () => {} );

				for ( const { buttonView, config, view } of dropdowns ) {
					buttonView.fire( 'execute' );

					expect( view.isOpen ).toBe( false );

					expect( commandSpy ).toHaveBeenCalledOnce();
					expect( commandSpy ).toHaveBeenCalledWith( 'imageStyle', { value: config.defaultItem.replace( 'imageStyle:', '' ) } );
					expect( focusSpy ).toHaveBeenCalled();

					commandSpy.mockClear();
				}
			} );
		} );

		it( 'should be enabled when at least one of the nested buttons are enabled', () => {
			for ( const dropdown of dropdowns ) {
				const dropdownItems = dropdown.view.toolbarView.items;

				for ( const item of dropdownItems ) {
					item.isEnabled = false;
				}

				dropdownItems.first.isEnabled = true;
			}

			for ( const { buttonView, config } of dropdowns ) {
				expect( buttonView.isEnabled, `Failing dropdown name: "${ config.name }"` ).toBe( true );
			}
		} );

		it( 'should be disabled when none of the nested buttons are enabled', () => {
			for ( const dropdown of dropdowns ) {
				const dropdownItems = dropdown.view.toolbarView.items;

				for ( const item of dropdownItems ) {
					item.isEnabled = false;
				}
			}

			for ( const { buttonView, config } of dropdowns ) {
				expect( buttonView.isEnabled, `Failing dropdown name: "${ config.name }"` ).toBe( false );
			}
		} );
	} );
} );
