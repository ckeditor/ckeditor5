/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/heading
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingEngine from './headingengine';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import createListDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/list/createlistdropdown';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import '../theme/theme.scss';

/**
 * The headings feature. It introduces the `headings` drop-down list and the `heading` command which allow
 * to convert paragraphs into headings.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Heading extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Paragraph, HeadingEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const dropdownItems = new Collection();
		const options = this._getLocalizedOptions();
		const commands = [];
		const t = editor.t;
		const defaultTitle = t( 'Choose heading' );
		const dropdownTooltip = t( 'Heading' );

		for ( let option of options ) {
			const command = editor.commands.get( option.modelElement );
			const itemModel = new Model( {
				commandName: option.modelElement,
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
			withText: true,
			items: dropdownItems,
			tooltip: dropdownTooltip
		} );

		dropdownModel.bind( 'isEnabled' ).to(
			// Bind to #isEnabled of each command...
			...getCommandsBindingTargets( commands, 'isEnabled' ),
			// ...and set it true if any command #isEnabled is true.
			( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
		);

		dropdownModel.bind( 'label' ).to(
			// Bind to #value of each command...
			...getCommandsBindingTargets( commands, 'value' ),
			// ...and chose the title of the first one which #value is true.
			( ...areActive ) => {
				const index = areActive.findIndex( value => value );

				// If none of the commands is active, display default title.
				return options[ index ] ? options[ index ].title : defaultTitle;
			}
		);

		// Register UI component.
		editor.ui.componentFactory.add( 'headings', ( locale ) => {
			const dropdown = createListDropdown( dropdownModel, locale );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdown, 'execute', ( evt ) => {
				editor.execute( evt.source.commandName );
				editor.editing.view.focus();
			} );

			return dropdown;
		} );
	}

	/**
	 * Returns heading options as defined in `config.heading.options` but processed to consider
	 * editor localization, i.e. to display {@link module:heading/headingcommand~HeadingOption}
	 * in the correct language.
	 *
	 * Note: The reason behind this method is that there's no way to use {@link module:utils/locale~Locale#t}
	 * when the user config is defined because the editor does not exist yet.
	 *
	 * @private
	 * @returns {Array.<module:heading/headingcommand~HeadingOption>}.
	 */
	_getLocalizedOptions() {
		const editor = this.editor;
		const t = editor.t;
		const localizedTitles = {
			Paragraph: t( 'Paragraph' ),
			'Heading 1': t( 'Heading 1' ),
			'Heading 2': t( 'Heading 2' ),
			'Heading 3': t( 'Heading 3' )
		};

		return editor.config.get( 'heading.options' ).map( option => {
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
// @private
// @param {Iterable.<module:core/command/command~Command>} commands
// @param {String} attribute
// @returns {Array.<String>}
function getCommandsBindingTargets( commands, attribute ) {
	return Array.prototype.concat( ...commands.map( c => [ c, attribute ] ) );
}
