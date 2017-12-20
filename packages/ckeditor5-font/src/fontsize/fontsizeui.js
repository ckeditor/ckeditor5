/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/heading
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import createListDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/list/createlistdropdown';

import FontSizeEditing from './fontsizeediting';

import fontSizeIcon from '@ckeditor/ckeditor5-core/theme/icons/low-vision.svg';

/**
 * @extends module:core/plugin~Plugin
 */
export default class FontSizeUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const dropdownItems = new Collection();

		const options = this._getLocalizedOptions();
		const commands = [];
		const t = editor.t;

		const dropdownTooltip = t( 'Font Size' );

		for ( const option of options ) {
			const commandName = 'font-size:' + option.model;

			const command = editor.commands.get( commandName );
			const itemModel = new Model( {
				commandName,
				label: option.title,
				class: option.class
			} );

			itemModel.bind( 'isActive' ).to( command, 'value' );

			// Add the option to the collection.
			dropdownItems.add( itemModel );

			commands.push( command );
		}

		// Create dropdown model.
		const dropdownModel = new Model( {
			icon: fontSizeIcon,
			withText: false,
			items: dropdownItems,
			tooltip: dropdownTooltip
		} );

		dropdownModel.bind( 'isEnabled' ).to(
			// Bind to #isEnabled of each command...
			...getCommandsBindingTargets( commands, 'isEnabled' ),
			// ...and set it true if any command #isEnabled is true.
			( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
		);

		// Register UI component.
		editor.ui.componentFactory.add( 'fontSize', locale => {
			const dropdown = createListDropdown( dropdownModel, locale );

			// TODO check if needed
			dropdown.extendTemplate( {
				attributes: {
					class: [
						'ck-font-size-dropdown'
					]
				}
			} );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdown, 'execute', evt => {
				editor.execute( evt.source.commandName );
				editor.editing.view.focus();
			} );

			return dropdown;
		} );
	}

	/**
	 * Returns heading options as defined in `config.heading.options` but processed to consider
	 * editor localization, i.e. to display {@link module:heading/heading~HeadingOption}
	 * in the correct language.
	 *
	 * Note: The reason behind this method is that there's no way to use {@link module:utils/locale~Locale#t}
	 * when the user config is defined because the editor does not exist yet.
	 *
	 * @private
	 * @returns {Array.<module:heading/heading~HeadingOption>}.
	 */
	_getLocalizedOptions() {
		const editor = this.editor;
		const t = editor.t;
		const localizedTitles = {
			Tiny: t( 'Tiny' ),
			Small: t( 'Small' ),
			Big: t( 'Big' ),
			Huge: t( 'Huge' )
		};

		// TODO this is not nice :/
		const items = editor.plugins.get( FontSizeEditing ).configuredItems;

		return items.map( option => {
			const title = localizedTitles[ option.title ];

			if ( title && title != option.title ) {
				// Clone the option to avoid altering the original `config.heading.options`.
				option = Object.assign( {}, option, { title } );
			}

			return option;
		} );
	}
}

// Returns an array of binding components for
// {@link module:utils/observablemixin~Observable#bind} from a set of iterable
// commands.
//
// TODO: it's duplicated in various places - maybe it's worth exporting to utils?
//
// @private
// @param {Iterable.<module:core/command~Command>} commands
// @param {String} attribute
// @returns {Array.<String>}
function getCommandsBindingTargets( commands, attribute ) {
	return Array.prototype.concat( ...commands.map( c => [ c, attribute ] ) );
}
