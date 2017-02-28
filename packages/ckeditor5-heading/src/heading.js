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
		const command = editor.commands.get( 'heading' );
		const options = command.options;
		const collection = new Collection();

		// Add options to collection.
		for ( const { id, label } of options ) {
			collection.add( new Model( {
				id, label
			} ) );
		}

		// Create dropdown model.
		const dropdownModel = new Model( {
			withText: true,
			items: collection
		} );

		// Bind dropdown model to command.
		dropdownModel.bind( 'isEnabled' ).to( command, 'isEnabled' );
		dropdownModel.bind( 'label' ).to( command, 'value', option => option.label );

		// Register UI component.
		editor.ui.componentFactory.add( 'headings', ( locale ) => {
			const dropdown = createListDropdown( dropdownModel, locale );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdown, 'execute', ( { source: { id } } ) => {
				editor.execute( 'heading', { id } );
				editor.editing.view.focus();
			} );

			return dropdown;
		} );
	}
}
