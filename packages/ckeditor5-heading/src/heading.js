/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/heading
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingCommand from './headingcommand';
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
		return [ Paragraph, HeadingEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const headingEngine = editor.plugins.get( HeadingEngine );
		const commands = headingEngine.commands;
		const dropdownItems = new Collection();
		let defaultCommand;

		for ( let command of commands ) {
			let modelElement, title;

			if ( command instanceof HeadingCommand ) {
				modelElement = command.modelElement;
			} else {
				modelElement = 'paragraph';
				defaultCommand = command;
			}

			title = command.title;

			// Add the option to the collection.
			dropdownItems.add( new Model( { modelElement, label: title } ) );
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
			// ...and chose the title of the first one which #value is true.
			( ...areActive ) => {
				const index = areActive.findIndex( value => value );

				// If none of the commands is active, display the first one.
				return index > -1 ? commands.get( index ).title : defaultCommand.title;
			}
		);

		// Register UI component.
		editor.ui.componentFactory.add( 'headings', ( locale ) => {
			const dropdown = createListDropdown( dropdownModel, locale );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdown, 'execute', ( { source: { modelElement } } ) => {
				editor.execute( modelElement );
				editor.editing.view.focus();
			} );

			return dropdown;
		} );
	}
}

function getCommandsBindingTargets( commands, attribute ) {
	return Array.prototype.concat( ...commands.map( c => [ c, attribute ] ) );
}
