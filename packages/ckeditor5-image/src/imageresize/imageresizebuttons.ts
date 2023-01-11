/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize/imageresizebuttons
 */

import { Plugin, icons, type Editor, type PluginDependencies } from 'ckeditor5/src/core';
import {
	ButtonView,
	DropdownButtonView,
	Model,
	createDropdown,
	addListToDropdown,
	type ListDropdownItemDefinition
} from 'ckeditor5/src/ui';
import { CKEditorError, Collection, type Locale } from 'ckeditor5/src/utils';

import ImageResizeEditing from './imageresizeediting';
import type ResizeImageCommand from './resizeimagecommand';

const RESIZE_ICONS = {
	small: icons.objectSizeSmall,
	medium: icons.objectSizeMedium,
	large: icons.objectSizeLarge,
	original: icons.objectSizeFull
};

/**
 * The image resize buttons plugin.
 *
 * It adds a possibility to resize images using the toolbar dropdown or individual buttons, depending on the plugin configuration.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageResizeButtons extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ ImageResizeEditing ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ImageResizeButtons' {
		return 'ImageResizeButtons';
	}

	/**
	 * The resize unit.
	 *
	 * @readonly
	 * @private
	 * @type {module:image/image~ImageConfig#resizeUnit}
	 * @default '%'
	 */
	private readonly _resizeUnit: string;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._resizeUnit = editor.config.get( 'image.resizeUnit' )! as string;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const options = editor.config.get( 'image.resizeOptions' )! as Array<ImageResizeOption>;
		const command = editor.commands.get( 'resizeImage' )!;

		this.bind( 'isEnabled' ).to( command );

		for ( const option of options ) {
			this._registerImageResizeButton( option );
		}

		this._registerImageResizeDropdown( options );
	}

	/**
	 * A helper function that creates a standalone button component for the plugin.
	 *
	 * @private
	 * @param {module:image/imageresize/imageresizebuttons~ImageResizeOption} resizeOption A model of the resize option.
	 */
	private _registerImageResizeButton( option: ImageResizeOption ): void {
		const editor = this.editor;
		const { name, value, icon } = option;
		const optionValueWithUnit = value ? value + this._resizeUnit : null;

		editor.ui.componentFactory.add( name, locale => {
			const button = new ButtonView( locale );
			const command = editor.commands.get( 'resizeImage' )!;
			const labelText = this._getOptionLabelValue( option, true );

			if ( !RESIZE_ICONS[ icon as keyof typeof RESIZE_ICONS ] ) {
				/**
				 * When configuring {@link module:image/image~ImageConfig#resizeOptions `config.image.resizeOptions`} for standalone
				 * buttons, a valid `icon` token must be set for each option.
				 *
				 * See all valid options described in the
				 * {@link module:image/imageresize/imageresizebuttons~ImageResizeOption plugin configuration}.
				 *
				 * @error imageresizebuttons-missing-icon
				 * @param {module:image/imageresize/imageresizebuttons~ImageResizeOption} option Invalid image resize option.
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
			button.bind( 'isOn' ).to( command, 'value', getIsOnButtonCallback( optionValueWithUnit ) );

			this.listenTo( button, 'execute', () => {
				editor.execute( 'resizeImage', { width: optionValueWithUnit } );
			} );

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
			const command = editor.commands.get( 'resizeImage' )!;
			const dropdownView = createDropdown( locale, DropdownButtonView );
			const dropdownButton = dropdownView.buttonView;

			dropdownButton.set( {
				tooltip: t( 'Resize image' ),
				commandValue: originalSizeOption.value!,
				icon: RESIZE_ICONS.medium,
				isToggleable: true,
				label: this._getOptionLabelValue( originalSizeOption ),
				withText: true,
				class: 'ck-resize-image-button'
			} as any );

			dropdownButton.bind( 'label' ).to( command, 'value', ( commandValue: any ) => {
				if ( commandValue && commandValue.width ) {
					return commandValue.width;
				} else {
					return this._getOptionLabelValue( originalSizeOption );
				}
			} );
			// dropdownView.bind( 'isOn' ).to( command );
			dropdownView.bind( 'isEnabled' ).to( this );

			addListToDropdown( dropdownView, () => this._getResizeDropdownListItemDefinitions( options, command ), {
				ariaLabel: t( 'Image resize list' )
			} );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( ( evt.source as any ).commandName, { width: ( evt.source as any ).commandValue } );
				editor.editing.view.focus();
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
	 * @private
	 * @param {module:image/imageresize/imageresizebuttons~ImageResizeOption} option A resize option object.
	 * @param {Boolean} [forTooltip] An optional flag for creating a tooltip label.
	 * @returns {String} A user-defined label combined from the numeric value and the resize unit or the default label
	 * for reset options (`Original`).
	 */
	private _getOptionLabelValue( option: ImageResizeOption, forTooltip: boolean = false ): string {
		const t = this.editor.t;

		if ( option.label ) {
			return option.label;
		} else if ( forTooltip ) {
			if ( option.value ) {
				return t( 'Resize image to %0', option.value + this._resizeUnit );
			} else {
				return t( 'Resize image to the original size' );
			}
		} else {
			if ( option.value ) {
				return option.value + this._resizeUnit;
			} else {
				return t( 'Original' );
			}
		}
	}

	/**
	 * A helper function that parses the resize options and returns list item definitions ready for use in the dropdown.
	 *
	 * @private
	 * @param {Array.<module:image/imageresize/imageresizebuttons~ImageResizeOption>} options The resize options.
	 * @param {module:image/imageresize/resizeimagecommand~ResizeImageCommand} command The resize image command.
	 * @returns {Iterable.<module:ui/dropdown/utils~ListDropdownItemDefinition>} Dropdown item definitions.
	 */
	private _getResizeDropdownListItemDefinitions(
		options: Array<ImageResizeOption>,
		command: ResizeImageCommand
	): Collection<ListDropdownItemDefinition> {
		const itemDefinitions = new Collection<ListDropdownItemDefinition>();

		options.map( option => {
			const optionValueWithUnit = option.value ? option.value + this._resizeUnit : null;
			const definition: ListDropdownItemDefinition = {
				type: 'button',
				model: new Model( {
					commandName: 'resizeImage',
					commandValue: optionValueWithUnit,
					label: this._getOptionLabelValue( option ),
					withText: true,
					icon: null
				} )
			};

			definition.model.bind( 'isOn' ).to( command, 'value', getIsOnButtonCallback( optionValueWithUnit ) );

			itemDefinitions.add( definition );
		} );

		return itemDefinitions;
	}
}

/**
 * A helper function for setting the `isOn` state of buttons in value bindings.
 */
function getIsOnButtonCallback( value: string | null ) {
	return ( commandValue: any ): boolean => {
		if ( value === null && commandValue === value ) {
			return true;
		}

		return commandValue && commandValue.width === value;
	};
}

/**
 * The image resize option used in the {@link module:image/image~ImageConfig#resizeOptions image resize configuration}.
 */
export interface ImageResizeOption {

	/**
	 * @property {String} name The name of the UI component that changes the image size.
	 * * If you configure the feature using individual resize buttons, you can refer to this name in the
	 * {@link module:image/image~ImageConfig#toolbar image toolbar configuration}.
	 * * If you configure the feature using the resize dropdown, this name will be used for a list item in the dropdown.
	 */
	name: string;

	/**
	 *
	 * @property {String} value The value of the resize option without the unit
	 * ({@link module:image/image~ImageConfig#resizeUnit configured separately}). `null` resets an image to its original size.
	 */
	value: string | null;

	/**
	 * @property {String} [icon] An icon used by an individual resize button (see the `name` property to learn more).
	 * Available icons are: `'small'`, `'medium'`, `'large'`, `'original'`.
	 */
	icon?: string;

	/**
	 * @property {String} [label] An option label displayed in the dropdown or, if the feature is configured using
	 * individual buttons, a {@link module:ui/button/buttonview~ButtonView#tooltip} and an ARIA attribute of a button.
	 * If not specified, the label is generated automatically based on the `value` option and the
	 * {@link module:image/image~ImageConfig#resizeUnit `config.image.resizeUnit`}.
	 */
	label?: string;
 }
