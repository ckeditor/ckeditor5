/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/heading
 */

import HeadingEngine from './headingengine';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import createListDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/list/createlistdropdown';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

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
		return [ HeadingEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const headingEngine = editor.plugins.get( HeadingEngine );
		const commands = headingEngine.commands;
		const dropdownItems = new Collection();

		for ( let { name, label } of commands ) {
			// Add the option to the collection.
			dropdownItems.add( new Model( {
				name, label
			} ) );
		}

		// Create dropdown model.
		const dropdownModel = new Model( {
			withText: true,
			items: dropdownItems
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
			// ...and chose the label of the first one which #value is true.
			( ...areActive ) => {
				const index = areActive.findIndex( value => value );

				// If none of the commands is active, display the first one.
				return commands.get( index > -1 ? index : 0 ).label;
			}
		);

		// Register UI component.
		editor.ui.componentFactory.add( 'headings', ( locale ) => {
			const dropdown = createListDropdown( dropdownModel, locale );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdown, 'execute', ( { source: { name } } ) => {
				editor.execute( name );
				editor.editing.view.focus();
			} );

			return dropdown;
		} );
	}
}

function getCommandsBindingTargets( commands, attribute ) {
	return Array.prototype.concat( ...commands.map( c => [ c, attribute ] ) );
}
