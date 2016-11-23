/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HeadingEngine from './headingengine.js';

import Plugin from '../core/plugin.js';

import Model from '../ui/model.js';
import createListDropdown from '../ui/dropdown/list/createlistdropdown.js';

import Collection from '../utils/collection.js';

/**
 * The headings feature. It introduces the `headings` drop-down list and the `heading` command which allow
 * to convert paragraphs into headings.
 *
 * @memberOf heading
 * @extends core.Plugin
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
		const command = editor.commands.get( 'heading' );
		const formats = command.formats;
		const collection = new Collection();

		// Add formats to collection.
		for ( let format of formats ) {
			collection.add( new Model( {
				formatId: format.id,
				label: format.label
			} ) );
		}

		// Create dropdown model.
		const dropdownModel = new Model( {
			label: 'Heading',
			withText: true,
			items: collection
		} );

		// Bind dropdown model to command.
		dropdownModel.bind( 'isEnabled' ).to( command, 'isEnabled' );
		dropdownModel.bind( 'label' ).to( command, 'value', format => format.label );

		// Register UI component.
		editor.ui.componentFactory.add( 'headings', ( locale ) => {
			const dropdown = createListDropdown( dropdownModel, locale );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdown, 'execute', ( { source: { formatId } } ) => {
				editor.execute( 'heading', { formatId } );
				editor.editing.view.focus();
			} );

			return dropdown;
		} );
	}
}
