/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize/ui/imageresizeui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ImageResizeEditing from '../imageresizeediting';
import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import DropdownButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/dropdownbuttonview';

import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

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
	init() {
		const editor = this.editor;
		const options = editor.config.get( 'image.resizeOptions' );
		const command = editor.commands.get( 'imageResize' );
		const resizeUnit = editor.config.get( 'image.resizeUnit' ) || '%';

		if ( !options ) {
			return;
		}

		this.bind( 'isEnabled' ).to( command );

		for ( const option of options ) {
			this._addButton( option, resizeUnit );
		}

		this._addDropdown( options, resizeUnit );
	}

	/**
	 * A helper function that creates a standalone button component for the plugin.
	 *
	 * @private
	 *
	 * @param {module:image/imageresizeui~resizeOption} resizeOption A model of resize option.
	 */
	_addButton( { name, label, value }, unit ) {
		const editor = this.editor;
		const t = editor.t;
		const parsedValue = value ? value + unit : null;

		editor.ui.componentFactory.add( name, locale => {
			const button = new ButtonView( locale );
			const command = editor.commands.get( 'imageResize' );
			const commandCallback = setOptionOn( parsedValue );

			button.set( {
				label: t( label ),
				withText: true,
				tooltip: t( 'Resize image to' ) + ' ' + parsedValue,
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
	_addDropdown( options, unit ) {
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
				tooltip: t( 'Resize image' ),
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

			addListToDropdown( dropdownView, prepareListDefinitions( options, command, unit ) );

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

	definitions.map( itemDefinition => {
		const parsedValue = itemDefinition.value ? itemDefinition.value + resizeUnit : null;
		const definition = {
			type: 'button',
			model: new Model( {
				commandName: 'imageResize',
				commandValue: parsedValue,
				label: itemDefinition.label,
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
