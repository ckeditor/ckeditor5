/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import HeadingsEngine from './headingsengine.js';
import Model from '../ui/model.js';
import ListDropdownController from '../ui/dropdown/list/listdropdown.js';
import ListDropdownView from '../ui/dropdown/list/listdropdownview.js';
import Collection from '../utils/collection.js';

/**
 * The headings feature. It introduces the headings drop-down list and the command that allows
 * to convert paragraphs into headings.
 *
 * @memberOf headings
 * @extends core.Feature
 */
export default class Headings extends Feature {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HeadingsEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const command = editor.commands.get( 'headings' );
		const formats = command.formats;
		const collection = new Collection();

		// Add formats to collection.
		for ( let format of formats ) {
			collection.add( new Model( {
				id: format.id,
				label: format.label
			} ) );
		}

		// Create item list model.
		const itemListModel = new Model( {
			items: collection
		} );

		// Create dropdown model.
		const dropdownModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: 'Headings',
			withText: true,
			content: itemListModel
		} );

		// Bind dropdown model to command.
		dropdownModel.bind( 'isEnabled' ).to( command, 'isEnabled' );
		dropdownModel.bind( 'label' ).to( command, 'value', format => format.label );

		// Execute command when item from dropdown is selected.
		this.listenTo( itemListModel, 'execute', ( evt, itemModel ) => {
			editor.execute( 'headings', itemModel.id );
			editor.editing.view.focus();
		} );

		editor.ui.featureComponents.add( 'headings', ListDropdownController, ListDropdownView, dropdownModel );
	}
}
