/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/list/createlistdropdown
 */

/* global document */

import ListView from '../../list/listview';
import ListItemView from '../../list/listitemview';
import createDropdown from '../createdropdown';

/**
 * Creates an instance of {@link module:ui/dropdown/list/listdropdownview~ListDropdownView} class using
 * defined model.
 *
 * @param {module:ui/dropdown/list/listdropdownmodel~ListDropdownModel} model Model of this list dropdown.
 * @param {module:utils/locale~Locale} locale The locale instance.
 * @returns {module:ui/dropdown/list/listdropdownview~ListDropdownView} The list dropdown view instance.
 */
export default function createListDropdown( model, locale ) {
	const dropdownView = createDropdown( model, locale );

	const listView = dropdownView.listView = new ListView( locale );

	listView.items.bindTo( model.items ).as( itemModel => {
		const item = new ListItemView( locale );

		// Bind all attributes of the model to the item view.
		item.bind( ...Object.keys( itemModel ) ).to( itemModel );

		return item;
	} );

	// TODO: Delegate all events instead of just execute.
	listView.items.delegate( 'execute' ).to( dropdownView );

	dropdownView.panelView.children.add( listView );

	dropdownView.on( 'change:isOpen', ( evt, name, value ) => {
		if ( value ) {
			attachDocumentClickListener( dropdownView );
		} else {
			dropdownView.stopListening( document );
		}
	} );

	// Close the dropdown when one of the list items has been executed.
	dropdownView.on( 'execute', () => {
		dropdownView.isOpen = false;
	} );

	return dropdownView;
}

// Attaches a "click" listener in DOM to check if any element outside
// the dropdown has been clicked.
//
// @private
// @param {module:ui/dropdown/listdropdownview~ListDropdownView} dropdownView
function attachDocumentClickListener( dropdownView ) {
	// TODO: It will probably be focus/blur-based rather than click. It should be bound
	// to focusmanager of some sort.
	dropdownView.listenTo( document, 'click', ( evtInfo, { target: domEvtTarget } ) => {
		// Collapse the dropdown when the webpage outside of the component is clicked.
		if ( dropdownView.element != domEvtTarget && !dropdownView.element.contains( domEvtTarget ) ) {
			dropdownView.isOpen = false;
		}
	} );
}
