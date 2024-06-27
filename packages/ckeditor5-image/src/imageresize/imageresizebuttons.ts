/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize/imageresizebuttons
 */
import { map } from 'lodash-es';

import { Plugin, icons, type Editor } from 'ckeditor5/src/core.js';
import {
	ButtonView,
	DropdownButtonView,
	ViewModel,
	createDropdown,
	addListToDropdown,
	type ListDropdownItemDefinition
} from 'ckeditor5/src/ui.js';
import { CKEditorError, Collection, type Locale } from 'ckeditor5/src/utils.js';

import ImageResizeEditing from './imageresizeediting.js';

import type ResizeImageCommand from './resizeimagecommand.js';
import type { ImageResizeOption } from '../imageconfig.js';

const RESIZE_ICONS = /* #__PURE__ */ ( () => ( {
	small: icons.objectSizeSmall,
	medium: icons.objectSizeMedium,
	large: icons.objectSizeLarge,
	custom: icons.objectSizeCustom,
	original: icons.objectSizeFull
} ) )();

/**
 * The image resize buttons plugin.
 *
 * It adds a possibility to resize images using the toolbar dropdown or individual buttons, depending on the plugin configuration.
 */
export default class ImageResizeButtons extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageResizeEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageResizeButtons' as const;
	}

	/**
	 * The resize unit.
	 * @default '%'
	 */
	private readonly _resizeUnit: 'px' | '%';

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._resizeUnit = editor.config.get( 'image.resizeUnit' )!;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const options = editor.config.get( 'image.resizeOptions' )!;
		const command: ResizeImageCommand = editor.commands.get( 'resizeImage' )!;

		this.bind( 'isEnabled' ).to( command );

		for ( const option of options ) {
			this._registerImageResizeButton( option );
		}

		this._registerImageResizeDropdown( options );
	}

	/**
	 * A helper function that creates a standalone button component for the plugin.
	 *
	 * @param resizeOption A model of the resize option.
	 */
	private _registerImageResizeButton( option: ImageResizeOption ): void {
		const editor = this.editor;
		const { name, value, icon } = option;

		editor.ui.componentFactory.add( name, locale => {
			const button = new ButtonView( locale );
			const command: ResizeImageCommand = editor.commands.get( 'resizeImage' )!;
			const labelText = this._getOptionLabelValue( option, true );

			if ( !RESIZE_ICONS[ icon as keyof typeof RESIZE_ICONS ] ) {
				/**
				 * When configuring {@link module:image/imageconfig~ImageConfig#resizeOptions `config.image.resizeOptions`} for standalone
				 * buttons, a valid `icon` token must be set for each option.
				 *
				 * See all valid options described in the
				 * {@link module:image/imageconfig~ImageResizeOption plugin configuration}.
				 *
				 * @error imageresizebuttons-missing-icon
				 * @param option Invalid image resize option.
				*/
				throw new CKEditorError(
					'imageresizebuttons-missing-icon',
					editor,
					option
				);
			}

			button.set( {
				// Use the `label` property for a verbose description (because of ARIA).
				label: labelText,
				icon: RESIZE_ICONS[ icon as keyof typeof RESIZE_ICONS ],
				tooltip: labelText,
				isToggleable: true
			} );

			// Bind button to the command.
			button.bind( 'isEnabled' ).to( this );

			if ( editor.plugins.has( 'ImageCustomResizeUI' ) && isCustomImageResizeOption( option ) ) {
				const customResizeUI = editor.plugins.get( 'ImageCustomResizeUI' );

				this.listenTo( button, 'execute', () => {
					customResizeUI._showForm( this._resizeUnit );
				} );
			} else {
				const optionValueWithUnit = value ? value + this._resizeUnit : null;

				button.bind( 'isOn' ).to( command, 'value', getIsOnButtonCallback( optionValueWithUnit ) );

				this.listenTo( button, 'execute', () => {
					editor.execute( 'resizeImage', { width: optionValueWithUnit } );
				} );
			}

			return button;
		} );
	}

	/**
	 * A helper function that creates a dropdown component for the plugin containing all the resize options defined in
	 * the editor configuration.
	 *
	 * @param options An array of configured options.
	 */
	private _registerImageResizeDropdown( options: Array<ImageResizeOption> ): void {
		const editor = this.editor;
		const t = editor.t;
		const originalSizeOption = options.find( option => !option.value )!;

		const componentCreator = ( locale: Locale ) => {
			const command: ResizeImageCommand = editor.commands.get( 'resizeImage' )!;
			const dropdownView = createDropdown( locale, DropdownButtonView );
			const dropdownButton: typeof dropdownView.buttonView & { commandValue?: string | null } = dropdownView.buttonView;
			const accessibleLabel = t( 'Resize image' );

			dropdownButton.set( {
				tooltip: accessibleLabel,
				commandValue: originalSizeOption.value,
				icon: RESIZE_ICONS.medium,
				isToggleable: true,
				label: this._getOptionLabelValue( originalSizeOption ),
				withText: true,
				class: 'ck-resize-image-button',
				ariaLabel: accessibleLabel,
				ariaLabelledBy: undefined
			} );

			dropdownButton.bind( 'label' ).to( command, 'value', commandValue => {
				if ( commandValue && commandValue.width ) {
					return commandValue.width;
				} else {
					return this._getOptionLabelValue( originalSizeOption );
				}
			} );
			dropdownView.bind( 'isEnabled' ).to( this );

			addListToDropdown( dropdownView, () => this._getResizeDropdownListItemDefinitions( options, command ), {
				ariaLabel: t( 'Image resize list' ),
				role: 'menu'
			} );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				if ( 'onClick' in evt.source ) {
					( evt.source as any ).onClick();
				} else {
					editor.execute( ( evt.source as any ).commandName, { width: ( evt.source as any ).commandValue } );
					editor.editing.view.focus();
				}
			} );

			return dropdownView;
		};

		// Register `resizeImage` dropdown and add `imageResize` dropdown as an alias for backward compatibility.
		editor.ui.componentFactory.add( 'resizeImage', componentCreator );
		editor.ui.componentFactory.add( 'imageResize', componentCreator );
	}

	/**
	 * A helper function for creating an option label value string.
	 *
	 * @param option A resize option object.
	 * @param forTooltip An optional flag for creating a tooltip label.
	 * @returns A user-defined label combined from the numeric value and the resize unit or the default label
	 * for reset options (`Original`).
	 */
	private _getOptionLabelValue( option: ImageResizeOption, forTooltip: boolean = false ): string {
		const t = this.editor.t;

		if ( option.label ) {
			return option.label;
		} else if ( forTooltip ) {
			if ( isCustomImageResizeOption( option ) ) {
				return t( 'Custom image size' );
			} else if ( option.value ) {
				return t( 'Resize image to %0', option.value + this._resizeUnit );
			} else {
				return t( 'Resize image to the original size' );
			}
		} else {
			if ( isCustomImageResizeOption( option ) ) {
				return t( 'Custom' );
			} else if ( option.value ) {
				return option.value + this._resizeUnit;
			} else {
				return t( 'Original' );
			}
		}
	}

	/**
	 * A helper function that parses the resize options and returns list item definitions ready for use in the dropdown.
	 *
	 * @param options The resize options.
	 * @param command The resize image command.
	 * @returns Dropdown item definitions.
	 */
	private _getResizeDropdownListItemDefinitions(
		options: Array<ImageResizeOption>,
		command: ResizeImageCommand
	): Collection<ListDropdownItemDefinition> {
		const { editor } = this;
		const itemDefinitions = new Collection<ListDropdownItemDefinition>();

		const optionsWithSerializedValues = options.map( option => {
			if ( isCustomImageResizeOption( option ) ) {
				return {
					...option,
					valueWithUnits: 'custom'
				};
			}

			if ( !option.value ) {
				return {
					...option,
					valueWithUnits: null
				};
			}

			return {
				...option,
				valueWithUnits: `${ option.value }${ this._resizeUnit }`
			};
		} );

		for ( const option of optionsWithSerializedValues ) {
			let definition: ListDropdownItemDefinition | null = null;

			if ( editor.plugins.has( 'ImageCustomResizeUI' ) && isCustomImageResizeOption( option ) ) {
				const customResizeUI = editor.plugins.get( 'ImageCustomResizeUI' );

				definition = {
					type: 'button',
					model: new ViewModel( {
						label: this._getOptionLabelValue( option ),
						role: 'menuitemradio',
						withText: true,
						icon: null,
						onClick: () => {
							customResizeUI._showForm( this._resizeUnit );
						}
					} )
				};

				const allDropdownValues = map( optionsWithSerializedValues, 'valueWithUnits' );

				definition.model.bind( 'isOn' ).to( command, 'value', getIsOnCustomButtonCallback( allDropdownValues ) );
			} else {
				definition = {
					type: 'button',
					model: new ViewModel( {
						commandName: 'resizeImage',
						commandValue: option.valueWithUnits,
						label: this._getOptionLabelValue( option ),
						role: 'menuitemradio',
						withText: true,
						icon: null
					} )
				};

				definition.model.bind( 'isOn' ).to( command, 'value', getIsOnButtonCallback( option.valueWithUnits ) );
			}

			definition.model.bind( 'isEnabled' ).to( command, 'isEnabled' );
			itemDefinitions.add( definition );
		}

		return itemDefinitions;
	}
}

/**
 * A helper that checks if provided option triggers custom resize balloon.
 */
function isCustomImageResizeOption( option: ImageResizeOption ) {
	return option.value === 'custom';
}

/**
 * A helper function for setting the `isOn` state of buttons in value bindings.
 */
function getIsOnButtonCallback( value: string | null ): ( commandValue: unknown ) => boolean {
	return ( commandValue: unknown ): boolean => {
		const objectCommandValue = commandValue as null | { width: string | null };
		if ( value === null && objectCommandValue === value ) {
			return true;
		}

		return objectCommandValue !== null && objectCommandValue.width === value;
	};
}

/**
 * A helper function for setting the `isOn` state of custom size button in value bindings.
 */
function getIsOnCustomButtonCallback( allDropdownValues: Array<string | null> ): ( commandValue: unknown ) => boolean {
	return ( commandValue: unknown ): boolean => !allDropdownValues.some(
		dropdownValue => getIsOnButtonCallback( dropdownValue )( commandValue )
	);
}
