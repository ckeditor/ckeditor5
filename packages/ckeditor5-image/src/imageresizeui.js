/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresizeui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ImageResize from './imageresize';
import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import DropdownButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/dropdownbuttonview';

import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

// TODO
import linkIcon from '../theme/icons/image_resize.svg';

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
		return [ ImageResize ];
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
		 * A state of resize unit configured by the user.
		 * If not set, it takes "%" as a default value.
		 *
		 * @private
		 *
		 * @member {module:image/image~ImageConfig#resizeUnit}
		 */
		this._resizeUnit = editor.config.get( 'image.resizeUnit' ) || '%';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const options = editor.config.get( 'image.imageResizeOptions' );
		const command = editor.commands.get( 'imageResize' );

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
	 *
	 * @param {module:image/imageresizeui~resizeOption} resizeOption A model of resize option.
	 */
	_addButton( { name, label, value } ) {
		const editor = this.editor;
		const t = editor.t;
		const parsedValue = value ? value + this._resizeUnit : null;

		editor.ui.componentFactory.add( name, locale => {
			const button = new ButtonView( locale );
			const command = editor.commands.get( 'imageResize' );
			const commandCallback = setOptionOn( parsedValue );

			button.set( {
				label: t( label ),
				withText: true,
				icon: linkIcon,
				tooltip: t( 'Resize Image' ),
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
	 *
	 * @param {Array.<module:image/imageresizeui~resizeOption>} options An array of the configured options.
	 */
	_addDropdown( options ) {
		const editor = this.editor;
		const t = editor.t;
		const firstOption = options[ 0 ];
		const resetOption = options.find( option => option.value === null );

		// Register dropdown.
		editor.ui.componentFactory.add( 'imageResize', locale => {
			const command = editor.commands.get( 'imageResize' );
			const dropdownView = createDropdown( locale, DropdownButtonView );
			const dropdownButton = dropdownView.buttonView;

			dropdownButton.set( {
				tooltip: t( 'Resize Image' ),
				icon: linkIcon,
				commandValue: firstOption.value,
				isToggleable: true,
				label: firstOption.label,
				withText: true
			} );

			dropdownButton.bind( 'label' ).to( command, 'value', commandValue => {
				return commandValue && commandValue.width || resetOption.label;
			} );
			dropdownView.bind( 'isOn' ).to( command );
			dropdownView.bind( 'isEnabled' ).to( this );

			addListToDropdown( dropdownView, prepareListDefinitions( options, command, this._resizeUnit ) );

			dropdownView.listView.ariaLabel = t( 'Image resize list' );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( evt.source.commandName, { width: evt.source.commandValue } );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}
}

// A helper function for parsing resize options definitions.
function prepareListDefinitions( definitions, command, resizeUnit ) {
	const itemDefinitions = new Collection();

	definitions.map( definition => {
		const parsedValue = definition.value ? definition.value + resizeUnit : null;
		const def = {
			type: 'button',
			model: new Model( {
				commandName: 'imageResize',
				commandValue: parsedValue,
				label: definition.label,
				withText: true,
				icon: null
			} )
		};

		const commandCallback = setOptionOn( parsedValue );

		def.model.bind( 'isOn' ).to( command, 'value', commandCallback );

		itemDefinitions.add( def );
	} );

	return itemDefinitions;
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
 * @typedef {Object} module:image/imageresizeui~resizeOption
 *
 * @property {String} resizeOption.name A name of the option used for creating a component.
 * @property {String} resizeOption.label A label to be displayed with a button.
 * @property {String} resizeOption.value A value of a resize option.
 */
