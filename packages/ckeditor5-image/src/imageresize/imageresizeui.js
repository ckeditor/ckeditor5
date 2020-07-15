/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize/imageresizeui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ImageResizeEditing from './imageresizeediting';
import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import DropdownButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/dropdownbuttonview';

import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import iconSmall from '@ckeditor/ckeditor5-core/theme/icons/object-size-small.svg';
import iconMedium from '@ckeditor/ckeditor5-core/theme/icons/object-size-medium.svg';
import iconLarge from '@ckeditor/ckeditor5-core/theme/icons/object-size-large.svg';
import iconFull from '@ckeditor/ckeditor5-core/theme/icons/object-size-full.svg';

const RESIZE_ICONS = {
	small: iconSmall,
	medium: iconMedium,
	large: iconLarge,
	original: iconFull
};

/**
 * The `ImageResizeUI` plugin.
 *
 * It adds a possibility to resize each image using toolbar dropdown or separate buttons, depends on the plugin configuration.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageResizeUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageResizeEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageResizeUI';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * The resize unit.
		 *
		 * @readonly
		 * @private
		 * @type {module:image/image~ImageConfig#resizeUnit}
		 * @default '%'
		 */
		this._resizeUnit = editor.config.get( 'image.resizeUnit' ) || '%';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const options = editor.config.get( 'image.resizeOptions' );
		const command = editor.commands.get( 'imageResize' );

		if ( !options ) {
			return;
		}

		this.bind( 'isEnabled' ).to( command );

		for ( const option of options ) {
			this._addButton( option );
		}

		this._addDropdown( options );
	}

	/**
	 * A helper function that creates a standalone button component for the plugin.
	 *
	 * @private
	 * @param {module:image/imageresize/imageresizeui~ImageResizeOption} resizeOption A model of resize option.
	 */
	_addButton( option ) {
		const editor = this.editor;
		const { name, value, icon } = option;
		const parsedValue = value ? value + this._resizeUnit : null;

		editor.ui.componentFactory.add( name, locale => {
			const button = new ButtonView( locale );
			const command = editor.commands.get( 'imageResize' );
			const commandCallback = setOptionOn( parsedValue );
			const labelText = this._createLabel( option, true );

			if ( !RESIZE_ICONS[ icon ] ) {
				/**
				* Setting {@link module:image/image~ImageConfig#resizeOptions `config.image.resizeOptions`} for the standalone buttons,
				* you have to choose a valid icon token for each option.
				*
				* See all valid options described in the
				* {@link module:image/imageresize/imageresizeui~ImageResizeOption plugin configuration}.
				* @error imageresizeui-missing-icon
				* @param {module:image/imageresize/imageresizeui~ImageResizeOption} option Invalid image resize option.
				*/
				throw new CKEditorError(
					'imageresizeui-missing-icon: ' +
					'The resize option "' + name + '" misses an `icon` property ' +
					'or its value doesn\'t match the available options.',
					editor,
					option
				);
			}

			button.set( {
				// Uses `label` property for setting the more verbose text (from tooltip) for ARIA purpose.
				label: labelText,
				icon: RESIZE_ICONS[ icon ],
				tooltip: labelText,
				isToggleable: true,
				commandValue: parsedValue
			} );

			// Bind button to the command.
			button.bind( 'isEnabled' ).to( this );
			button.bind( 'isOn' ).to( command, 'value', commandCallback );

			this.listenTo( button, 'execute', evt => {
				editor.execute( 'imageResize', { width: evt.source.commandValue } );
			} );

			return button;
		} );
	}

	/**
	 * A helper function that creates a dropdown component for the plugin containing all resize options created through the
	 * plugin configuration settings.
	 *
	 * @private
	 * @param {Array.<module:image/imageresize/imageresizeui~ImageResizeOption>} options An array of the configured options.
	 */
	_addDropdown( options ) {
		const editor = this.editor;
		const t = editor.t;
		const originalSizeOption = options.find( option => !option.value );

		// Register dropdown.
		editor.ui.componentFactory.add( 'imageResize', locale => {
			const command = editor.commands.get( 'imageResize' );
			const dropdownView = createDropdown( locale, DropdownButtonView );
			const dropdownButton = dropdownView.buttonView;

			dropdownButton.set( {
				tooltip: t( 'Resize image' ),
				commandValue: originalSizeOption.value,
				icon: iconMedium,
				isToggleable: true,
				label: this._createLabel( originalSizeOption ),
				withText: true,
				class: 'ck-resize-image-button'
			} );

			dropdownButton.bind( 'label' ).to( command, 'value', commandValue => {
				return commandValue && commandValue.width || this._createLabel( originalSizeOption );
			} );
			dropdownView.bind( 'isOn' ).to( command );
			dropdownView.bind( 'isEnabled' ).to( this );

			addListToDropdown( dropdownView, this._getResizeDropdownListItemDefinitions( options, command ) );

			dropdownView.listView.ariaLabel = t( 'Image resize list' );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( evt.source.commandName, { width: evt.source.commandValue } );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}

	/**
	 * A helper function for creating an option label.
	 *
	 * @private
	 * @param {module:image/imageresize/imageresizeui~ImageResizeOption} option A resize option object.
	 * @param {Boolean} [forTooltip] An optional flag for creating a tooltip label.
	 * @returns {String} A user-defined label, a label combined from the value and resize unit or the default label
	 * for reset options (`Original`).
	 */
	_createLabel( option, forTooltip ) {
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
	 * A helper function that parses resize options and returns definitions ready for use in a dropdown.
	 *
	 * @private
	 * @param {Array.<module:image/imageresize/imageresizeui~ImageResizeOption>} options The resize options.
	 * @param {module:image/imageresize/imageresizecommand~ImageResizeCommand} command A resize image command.
	 * @returns {module:utils/collection~Collection} definitions
	*/
	_getResizeDropdownListItemDefinitions( options, command ) {
		const itemDefinitions = new Collection();

		options.map( option => {
			const parsedValue = option.value ? option.value + this._resizeUnit : null;
			const definition = {
				type: 'button',
				model: new Model( {
					commandName: 'imageResize',
					commandValue: parsedValue,
					label: this._createLabel( option ),
					withText: true,
					icon: null
				} )
			};

			const commandCallback = setOptionOn( parsedValue );

			definition.model.bind( 'isOn' ).to( command, 'value', commandCallback );

			itemDefinitions.add( definition );
		} );

		return itemDefinitions;
	}
}

// A helper function for setting the `isOn` state used for creating a callback function in a value binding.
function setOptionOn( value ) {
	return commandValue => {
		// Set reseting option on when command equals `null`.
		if ( commandValue === value ) {
			return true;
		}

		return commandValue && commandValue.width === value;
	};
}

/**
 * A resize option type.
 *
 * @typedef {Object} module:image/imageresize/imageresizeui~ImageResizeOption
 * @property {String} resizeOption.name A name of the option used for creating a component.
 * You refer to that name later in the {@link module:image/image~ImageConfig#toolbar}.
 * @property {String} resizeOption.value A value of a resize option. `null` value is for resetting an image to its original size.
 * @property {String} [resizeOptions.icon] A value of the available icon sizes (`small`, `medium`, `large`, `original`).
 * @property {String} [resizeOption.label] A label to be displayed with a button.
 */
