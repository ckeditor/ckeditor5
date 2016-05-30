/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import FormatsEngine from './formatsengine.js';
import Model from '../ui/model.js';
import ListDropdownController from '../ui/dropdown/list/listdropdown.js';
import ListDropdownView from '../ui/dropdown/list/listdropdownview.js';
import Collection from '../utils/collection.js';

export default class Formats extends Feature {
	static get requires() {
		return [ FormatsEngine ];
	}

	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( 'format' );
		const formats = command.formats;
		const collection = new Collection();

		// Add formats to collection.
		for ( let format of formats ) {
			collection.add( new Model( {
				id: format.id,
				label: t( format.label )
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
			label: t( 'Formats' ),
			content: itemListModel
		} );

		//Bind dropdown model to command.
		dropdownModel.bind( 'isEnabled' ).to( command, 'isEnabled' );

		// Execute command when item from dropdown is selected.
		this.listenTo( itemListModel, 'execute', ( evtInfo, itemModel ) => {
			editor.execute( 'format', itemModel.id );
			dropdownModel.label = t( itemModel.label );
		} );

		editor.ui.featureComponents.add( 'formats', ListDropdownController, ListDropdownView, dropdownModel );
	}
}
